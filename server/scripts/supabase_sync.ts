import { Client } from "pg";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.tkwrktpoaiplurjmrqfd:ScanBeforeEat2026SecurePass99@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
const SQLITE_PATH = process.env.DATABASE_PATH || (
  fs.existsSync(path.resolve(__dirname, "../data/scanbeforeeat.sqlite"))
    ? path.resolve(__dirname, "../data/scanbeforeeat.sqlite")
    : path.resolve(process.cwd(), "server/data/scanbeforeeat.sqlite")
);

const TABLES = [
  "users",
  "products",
  "scans",
  "user_allergens",
  "pantry_items",
  "shopping_items",
  "banned_additives",
  "api_keys",
  "family_members",
  "saved_studies",
  "invoices",
  "payment_methods",
  "user_health_profiles",
  "user_sessions",
  "user_notifications",
  "developer_webhooks",
  "flagged_products",
  "audit_logs",
  "email_otps"
];

function getSqlite(): DatabaseSync {
  const dir = path.dirname(SQLITE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return new DatabaseSync(SQLITE_PATH);
}

function getPgClient(): Client {
  return new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

function escapeSqlVal(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return Number.isFinite(val) ? val.toString() : "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  return `'${String(val).replace(/'/g, "''")}'`;
}

export async function checkStatus() {
  const sqlite = getSqlite();
  const pg = getPgClient();
  await pg.connect();

  console.log("\n--- Database Sync Status (SQLite vs Supabase Cloud) ---");
  console.log("SQLite Path:", SQLITE_PATH);
  console.log("Supabase Host: aws-1-ap-northeast-1.pooler.supabase.com (Project: tkwrktpoaiplurjmrqfd)");
  console.log("-------------------------------------------------------");

  for (const table of TABLES) {
    let localCount = 0;
    try {
      const res = sqlite.prepare(`SELECT count(*) as c FROM "${table}"`).get() as { c: number };
      localCount = res.c;
    } catch {
      localCount = -1;
    }

    let cloudCount = 0;
    try {
      const res = await pg.query(`SELECT count(*) as c FROM public."${table}";`);
      cloudCount = parseInt(res.rows[0].c, 10);
    } catch {
      cloudCount = -1;
    }

    const match = localCount === cloudCount ? "✓ in sync" : "⚠ mismatch";
    console.log(`- ${table.padEnd(22)} | Local: ${String(localCount).padStart(3)} | Supabase: ${String(cloudCount).padStart(3)} | ${match}`);
  }

  await pg.end();
}

export async function pushToSupabase() {
  const sqlite = getSqlite();
  const pg = getPgClient();
  await pg.connect();

  console.log("\n[Push] Uploading local SQLite records to Supabase Cloud...");
  for (const table of TABLES) {
    let rows: any[] = [];
    try {
      rows = sqlite.prepare(`SELECT * FROM "${table}"`).all() as any[];
    } catch {
      continue;
    }
    if (rows.length === 0) continue;

    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const cols = Object.keys(batch[0]);
      const quotedCols = cols.map(c => `"${c}"`).join(", ");

      const valStrings = batch.map(row => {
        const vals = cols.map(c => escapeSqlVal(row[c]));
        return `(${vals.join(", ")})`;
      });

      const sql = `
        INSERT INTO public."${table}" (${quotedCols})
        VALUES ${valStrings.join(",\n")}
        ON CONFLICT DO NOTHING;
      `;
      await pg.query(sql);
    }
    console.log(`✓ ${table}: pushed ${rows.length} rows`);
  }

  await pg.end();
  console.log("[Push] Completed successfully.");
}

export async function pullFromSupabase() {
  const sqlite = getSqlite();
  const pg = getPgClient();
  await pg.connect();

  console.log("\n[Pull] Downloading Supabase Cloud rows into local SQLite...");
  for (const table of TABLES) {
    try {
      const res = await pg.query(`SELECT * FROM public."${table}";`);
      if (res.rows.length === 0) continue;

      const cols = Object.keys(res.rows[0]);
      const placeholders = cols.map(() => "?").join(", ");
      const quotedCols = cols.map(c => `"${c}"`).join(", ");

      const insertStmt = sqlite.prepare(`
        INSERT OR REPLACE INTO "${table}" (${quotedCols})
        VALUES (${placeholders})
      `);

      for (const row of res.rows) {
        const values = cols.map(c => row[c]);
        insertStmt.run(...values);
      }
      console.log(`✓ ${table}: pulled ${res.rows.length} rows`);
    } catch (err: any) {
      console.warn(`! ${table} pull warning:`, err.message);
    }
  }

  await pg.end();
  console.log("[Pull] Completed successfully.");
}

async function main() {
  const action = process.argv[2] || "status";
  if (action === "push") {
    await pushToSupabase();
  } else if (action === "pull") {
    await pullFromSupabase();
  } else {
    await checkStatus();
  }
}

if (process.argv[1]?.endsWith("supabase_sync.ts") || process.argv[1]?.endsWith("supabase_sync.js")) {
  main().catch(err => {
    console.error("Supabase sync failed:", err);
    process.exit(1);
  });
}
