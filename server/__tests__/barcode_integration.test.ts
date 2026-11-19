import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/index.js";
import { db } from "../src/db.js";
import http from "node:http";

let server: http.Server;
const PORT = 4096;
const BASE_URL = `http://localhost:${PORT}/api`;
const TEST_USER_ID = "qa_barcode_tester";

beforeAll(async () => {
  // Clean up any test user records and uncataloged barcode
  db.prepare("DELETE FROM scans WHERE userId = ?").run(TEST_USER_ID);
  db.prepare("DELETE FROM users WHERE id = ?").run(TEST_USER_ID);
  db.prepare("DELETE FROM products WHERE barcode = ?").run("9991234567890");
  db.prepare("DELETE FROM products WHERE barcode = ?").run("3017620422003");

  // Create test user with fresh 15 scans
  db.prepare(`
    INSERT INTO users (id, email, displayName, plan, scansLimit, scansUsed, billingCycleResetAt, paymentGateway)
    VALUES (?, 'qa@scanbeforeeat.com', 'QA Tester', 'free', 15, 0, '2026-12-31', 'none')
  `).run(TEST_USER_ID);

  await new Promise<void>((resolve) => {
    server = app.listen(PORT, () => resolve());
  });
});

afterAll(async () => {
  // Clean up test data
  db.prepare("DELETE FROM scans WHERE userId = ?").run(TEST_USER_ID);
  db.prepare("DELETE FROM users WHERE id = ?").run(TEST_USER_ID);
  db.prepare("DELETE FROM products WHERE barcode = ?").run("9991234567890");
  db.prepare("DELETE FROM products WHERE barcode = ?").run("3017620422003");

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe("Barcode Scanner & OpenFoodFacts Catalog Integration", () => {
  it("Scan 1: Maggi Noodles (8901058852331) - returns complete ProductDetail & updates SQLite", async () => {
    const barcode = "8901058852331";
    const res = await fetch(`${BASE_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: TEST_USER_ID, barcode }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const p = body.product;

    // Verify ProductDetail fields
    expect(p.barcode).toBe(barcode);
    expect(p.name).toBeDefined();
    expect(typeof p.name).toBe("string");
    expect(p.name.length).toBeGreaterThan(0);
    expect(p.brand).toBeDefined();
    expect(typeof p.brand).toBe("string");
    expect(p.brand.length).toBeGreaterThan(0);

    // healthScore: 0 - 100
    expect(typeof p.healthScore).toBe("number");
    expect(p.healthScore).toBeGreaterThanOrEqual(0);
    expect(p.healthScore).toBeLessThanOrEqual(100);

    // novaGroup: 1 - 4
    expect(typeof p.novaGroup).toBe("number");
    expect(p.novaGroup).toBeGreaterThanOrEqual(1);
    expect(p.novaGroup).toBeLessThanOrEqual(4);

    // arrays
    expect(Array.isArray(p.additives)).toBe(true);
    expect(p.additives.length).toBeGreaterThan(0);
    expect(Array.isArray(p.allergens)).toBe(true);
    expect(p.allergens.length).toBeGreaterThan(0);
    expect(Array.isArray(p.deductions)).toBe(true);
    expect(p.deductions.length).toBeGreaterThan(0);
    expect(Array.isArray(p.alternatives)).toBe(true);
    expect(p.alternatives.length).toBeGreaterThan(0);

    // Verify SQLite scans table has recorded the scan
    const scanRow = db.prepare(
      "SELECT * FROM scans WHERE userId = ? AND barcode = ? ORDER BY scannedAt DESC LIMIT 1"
    ).get(TEST_USER_ID, barcode) as any;
    expect(scanRow).toBeDefined();
    expect(scanRow.barcode).toBe(barcode);
    expect(scanRow.healthScore).toBe(p.healthScore);
    expect(scanRow.novaGroup).toBe(p.novaGroup);

    // Verify SQLite products table contains this product
    const prodRow = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode) as any;
    expect(prodRow).toBeDefined();
    expect(prodRow.name).toBe(p.name);
    expect(prodRow.brand).toBe(p.brand);
    expect(prodRow.healthScore).toBe(p.healthScore);
    expect(prodRow.novaGroup).toBe(p.novaGroup);

    // Quota check
    expect(body.quota.scansUsed).toBe(1);
    expect(body.quota.remainingScans).toBe(14);
  });

  it("Scan 2: Oatly Barista Edition (7321461144417) - returns complete ProductDetail & updates SQLite", async () => {
    const barcode = "7321461144417";
    const res = await fetch(`${BASE_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: TEST_USER_ID, barcode }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const p = body.product;

    // Verify ProductDetail fields
    expect(p.barcode).toBe(barcode);
    expect(p.name).toBeDefined();
    expect(typeof p.name).toBe("string");
    expect(p.name.length).toBeGreaterThan(0);
    expect(p.brand).toBeDefined();
    expect(typeof p.brand).toBe("string");
    expect(p.brand).toBe("Oatly");

    // healthScore: 0 - 100
    expect(typeof p.healthScore).toBe("number");
    expect(p.healthScore).toBeGreaterThanOrEqual(0);
    expect(p.healthScore).toBeLessThanOrEqual(100);

    // novaGroup: 1 - 4
    expect(typeof p.novaGroup).toBe("number");
    expect(p.novaGroup).toBeGreaterThanOrEqual(1);
    expect(p.novaGroup).toBeLessThanOrEqual(4);

    // arrays
    expect(Array.isArray(p.additives)).toBe(true);
    expect(Array.isArray(p.allergens)).toBe(true);
    expect(Array.isArray(p.deductions)).toBe(true);
    expect(Array.isArray(p.alternatives)).toBe(true);

    // Verify SQLite scans table
    const scanRow = db.prepare(
      "SELECT * FROM scans WHERE userId = ? AND barcode = ? ORDER BY scannedAt DESC LIMIT 1"
    ).get(TEST_USER_ID, barcode) as any;
    expect(scanRow).toBeDefined();
    expect(scanRow.barcode).toBe(barcode);
    expect(scanRow.healthScore).toBe(p.healthScore);
    expect(scanRow.novaGroup).toBe(p.novaGroup);

    // Verify SQLite products table
    const prodRow = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode) as any;
    expect(prodRow).toBeDefined();
    expect(prodRow.brand).toBe("Oatly");

    // Quota check
    expect(body.quota.scansUsed).toBe(2);
    expect(body.quota.remainingScans).toBe(13);
  });

  it("Scan 3: Uncataloged custom barcode (9991234567890) - triggers fallback AI synthesis & caches in SQLite", async () => {
    const barcode = "9991234567890";

    // Ensure it is truly not in products table prior to scan
    expect(db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode)).toBeUndefined();

    const res = await fetch(`${BASE_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: TEST_USER_ID, barcode }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const p = body.product;

    // Verify ProductDetail fields
    expect(p.barcode).toBe(barcode);
    expect(p.name).toBeDefined();
    expect(typeof p.name).toBe("string");
    expect(p.name.length).toBeGreaterThan(0);
    expect(p.brand).toBeDefined();
    expect(typeof p.brand).toBe("string");

    // healthScore: 0 - 100
    expect(typeof p.healthScore).toBe("number");
    expect(p.healthScore).toBeGreaterThanOrEqual(0);
    expect(p.healthScore).toBeLessThanOrEqual(100);

    // novaGroup: 1 - 4
    expect(typeof p.novaGroup).toBe("number");
    expect(p.novaGroup).toBeGreaterThanOrEqual(1);
    expect(p.novaGroup).toBeLessThanOrEqual(4);

    // arrays
    expect(Array.isArray(p.additives)).toBe(true);
    expect(Array.isArray(p.allergens)).toBe(true);
    expect(Array.isArray(p.deductions)).toBe(true);
    expect(Array.isArray(p.alternatives)).toBe(true);

    // Verify SQLite scans table
    const scanRow = db.prepare(
      "SELECT * FROM scans WHERE userId = ? AND barcode = ? ORDER BY scannedAt DESC LIMIT 1"
    ).get(TEST_USER_ID, barcode) as any;
    expect(scanRow).toBeDefined();
    expect(scanRow.barcode).toBe(barcode);
    expect(scanRow.healthScore).toBe(p.healthScore);
    expect(scanRow.novaGroup).toBe(p.novaGroup);

    // Verify SQLite products table NOW has cached this uncataloged product
    const prodRow = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode) as any;
    expect(prodRow).toBeDefined();
    expect(prodRow.barcode).toBe(barcode);
    expect(prodRow.healthScore).toBe(p.healthScore);
    expect(prodRow.novaGroup).toBe(p.novaGroup);

    // Quota check
    expect(body.quota.scansUsed).toBe(3);
    expect(body.quota.remainingScans).toBe(12);
  });

  it("Scan 4: Live OpenFoodFacts live catalog integration (3017620422003)", async () => {
    const barcode = "3017620422003";

    // Ensure it is not pre-seeded
    expect(db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode)).toBeUndefined();

    const res = await fetch(`${BASE_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: TEST_USER_ID, barcode }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const p = body.product;

    expect(p.barcode).toBe(barcode);
    expect(p.name.toLowerCase()).toContain("nutella");
    expect(typeof p.healthScore).toBe("number");
    expect(p.healthScore).toBeGreaterThanOrEqual(0);
    expect(p.healthScore).toBeLessThanOrEqual(100);
    expect(p.novaGroup).toBeGreaterThanOrEqual(1);
    expect(p.novaGroup).toBeLessThanOrEqual(4);
    expect(Array.isArray(p.additives)).toBe(true);
    expect(Array.isArray(p.allergens)).toBe(true);
    expect(Array.isArray(p.deductions)).toBe(true);
    expect(Array.isArray(p.alternatives)).toBe(true);

    // Verify cached in products table
    const prodRow = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode) as any;
    expect(prodRow).toBeDefined();
    expect(prodRow.barcode).toBe(barcode);

    // Verify recorded in scans table
    const scanRow = db.prepare(
      "SELECT * FROM scans WHERE userId = ? AND barcode = ? ORDER BY scannedAt DESC LIMIT 1"
    ).get(TEST_USER_ID, barcode) as any;
    expect(scanRow).toBeDefined();
    expect(scanRow.barcode).toBe(barcode);

    // Quota check
    expect(body.quota.scansUsed).toBe(4);
    expect(body.quota.remainingScans).toBe(11);
  });
});
