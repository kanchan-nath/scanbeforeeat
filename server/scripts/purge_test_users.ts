import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_API_KEY = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PROJECT_REF = "tkwrktpoaiplurjmrqfd";

const ALLOWED_USERS = [
  "demo_pro",
  "demo_free",
  "demo_free_user",
  "demo_monthly_pro_user"
];

const inClause = ALLOWED_USERS.map(u => `'${u}'`).join(", ");

async function run() {
  console.log("Allowed Users to KEEP:", ALLOWED_USERS);

  // 1. Purge Local SQLite files
  const localPaths = [
    path.resolve(process.cwd(), "server/data/scanbeforeeat.sqlite"),
    path.resolve(process.cwd(), "data/scanbeforeeat.sqlite")
  ];

  for (const p of localPaths) {
    if (!fs.existsSync(p)) continue;
    try {
      const db = new DatabaseSync(p);
      const delScans = db.prepare(`DELETE FROM scans WHERE userId NOT IN (${inClause})`).run();
      const delUsers = db.prepare(`DELETE FROM users WHERE id NOT IN (${inClause})`).run();
      const userCount = (db.prepare("SELECT count(*) as c FROM users").get() as any)?.c;
      const scanCount = (db.prepare("SELECT count(*) as c FROM scans").get() as any)?.c;
      console.log(`[Local SQLite] ${p}`);
      console.log(`  - Deleted ${delUsers.changes} junk users, ${delScans.changes} junk scans.`);
      console.log(`  - Remaining: ${userCount} users, ${scanCount} scans.`);
    } catch (err: any) {
      console.error(`Error purging ${p}:`, err.message);
    }
  }

  // 2. Purge Supabase Cloud
  console.log("\n[Supabase Cloud] Purging junk records from project tkwrktpoaiplurjmrqfd...");
  const sql = `
    DELETE FROM public.scans WHERE "userId" NOT IN (${inClause});
    DELETE FROM public.user_allergens WHERE "userId" NOT IN (${inClause});
    DELETE FROM public.user_health_profiles WHERE "userId" NOT IN (${inClause});
    DELETE FROM public.invoices WHERE "userId" NOT IN (${inClause});
    DELETE FROM public.flagged_products WHERE "userId" NOT IN (${inClause});
    DELETE FROM public.developer_webhooks WHERE "userId" NOT IN (${inClause});
    DELETE FROM public.users WHERE id NOT IN (${inClause});
  `;

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to purge Supabase: ${text}`);
  }
  console.log("✓ Purged junk test users from Supabase Cloud.");

  // Verify Supabase Cloud Counts
  const checkRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
        SELECT id, email, "displayName", plan FROM public.users;
      `
    })
  });
  const cloudUsers = await checkRes.json();
  console.log("\n[Supabase Cloud] Remaining Users in 'users' table:");
  console.table(cloudUsers);
}

run().catch(err => {
  console.error("Purge error:", err);
  process.exit(1);
});
