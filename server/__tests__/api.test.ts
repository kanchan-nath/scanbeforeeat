import { describe, it, expect, beforeAll } from "vitest";
import app from "../src/index.js";
import { db } from "../src/db.js";
import { generateJwtToken } from "../src/middleware/auth.js";
import http from "node:http";

let server: http.Server;
const PORT = 4099;
const BASE_URL = `http://localhost:${PORT}/api`;

beforeAll(async () => {
  // Clean up any stale test user data from previous runs
  db.prepare("DELETE FROM scans WHERE userId LIKE 'test-user-%'").run();
  db.prepare("DELETE FROM user_allergens WHERE userId LIKE 'test-user-%'").run();
  db.prepare("DELETE FROM users WHERE id LIKE 'test-user-%'").run();
  db.prepare("DELETE FROM invoices WHERE userId LIKE 'test-user-%'").run();
  db.prepare("DELETE FROM user_health_profiles WHERE userId LIKE 'test-user-%'").run();
  db.prepare("DELETE FROM developer_webhooks WHERE userId LIKE 'test-user-%'").run();

  await new Promise<void>((resolve) => {
    server = app.listen(PORT, () => resolve());
  });
  return () => {
    server.close();
  };
});

describe("ScanBeforeEat Server API Endpoints", () => {
  it("GET /api/health should return ok", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.service).toContain("ScanBeforeEat");
  });

  it("POST /api/auth/sync should create free user with 15 scans limit", async () => {
    const res = await fetch(`${BASE_URL}/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "test-user-1",
        email: "test@scanbeforeeat.com",
        displayName: "Test User",
        plan: "free",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.id).toBe("test-user-1");
    expect(data.plan).toBe("free");
    expect(data.scansLimit).toBe(15);
    expect(data.scansUsed).toBe(0);
    expect(data.remainingScans).toBe(15);
  });

  it("POST /api/user/plan should upgrade user to monthly_pro with 99 scans", async () => {
    const res = await fetch(`${BASE_URL}/user/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-1",
        plan: "monthly_pro",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.plan).toBe("monthly_pro");
    expect(data.scansLimit).toBe(99);
    expect(data.remainingScans).toBe(99);
  });

  it("POST /api/scan should deduct 1 scan and return Maggi product details", async () => {
    const res = await fetch(`${BASE_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-1",
        barcode: "8901058852331",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.product.name).toContain("Noodles");
    expect(data.product.healthScore).toBe(38);
    expect(data.product.novaGroup).toBe(4);
    expect(data.quota.scansUsed).toBe(1);
    expect(data.quota.remainingScans).toBe(98);
  });

  it("POST /api/duel should compare two products and declare winner", async () => {
    const res = await fetch(`${BASE_URL}/duel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barcode1: "8901058852331", // Maggi: score 38
        barcode2: "0855238004128", // Popcorn: score 86
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.winner).toBe("product2");
    expect(data.scoreDelta).toBe(48);
    expect(data.verdict).toContain("wins");
  });

  it("POST /api/user/allergens should store user allergen watchlists", async () => {
    const res = await fetch(`${BASE_URL}/user/allergens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-1",
        allergens: ["Gluten", "Lactose", "Nuts"],
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.allergens).toEqual(["Gluten", "Lactose", "Nuts"]);

    const getRes = await fetch(`${BASE_URL}/user/allergens/test-user-1`);
    const list = await getRes.json();
    expect(list).toEqual(["Gluten", "Lactose", "Nuts"]);
  });

  it("POST /api/checkout/create-order should return order with GST calculation", async () => {
    const res = await fetch(`${BASE_URL}/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-1",
        plan: "annual_pro",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.orderId).toContain("order_");
    expect(data.baseAmount).toBe(999);
    expect(data.gstAmount).toBe(179.82);
    expect(data.amount).toBe(1178.82);
    expect(data.currency).toBe("INR");
  });

  it("POST /api/checkout/verify-payment should activate subscription and generate invoice", async () => {
    const res = await fetch(`${BASE_URL}/checkout/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-1",
        plan: "annual_pro",
        orderId: "order_test_12345",
        paymentId: "pay_test_98765",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.plan).toBe("annual_pro");
    expect(data.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(data.invoice.amount).toBe(999);
  });

  it("GET /api/user/invoices/:userId should list user invoices", async () => {
    const res = await fetch(`${BASE_URL}/user/invoices/test-user-1`);
    const list = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].invoiceNumber).toMatch(/^INV-/);
  });

  it("GET /api/invoices/:id/pdf should stream valid PDF document", async () => {
    const listRes = await fetch(`${BASE_URL}/user/invoices/test-user-1`);
    const list = await listRes.json();
    const invId = list[0].id;

    const res = await fetch(`${BASE_URL}/invoices/${invId}/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    const buffer = await res.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(1000);
    // Check PDF magic bytes '%PDF'
    const magic = new Uint8Array(buffer.slice(0, 4));
    expect(String.fromCharCode(...magic)).toBe("%PDF");
  });

  it("GET /api/exposure/:userId should return dynamic bio-burden and trend", async () => {
    const res = await fetch(`${BASE_URL}/exposure/test-user-1`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.dailyAdditiveLoad).toBeDefined();
    expect(data.exposureTrend.length).toBe(7);
    expect(data.classDistribution).toBeDefined();
  });

  it("GET /api/user/health-profile/:userId and PUT should save and retrieve calibrated metrics", async () => {
    const putRes = await fetch(`${BASE_URL}/user/health-profile/test-user-1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dietaryProtocol: "Strict Clean Label",
        riskTolerance: "Zero Tolerance",
        dailyTarget: 7,
        conditions: ["Asthma Trigger Watch"],
        weightKg: 70.0,
      }),
    });
    const putData = await putRes.json();
    expect(putRes.status).toBe(200);
    expect(putData.dailyTarget).toBe(7);
    expect(putData.weightKg).toBe(70.0);

    const getRes = await fetch(`${BASE_URL}/user/health-profile/test-user-1`);
    const getData = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getData.dietaryProtocol).toBe("Strict Clean Label");
    expect(getData.conditions).toEqual(["Asthma Trigger Watch"]);
  });

  it("POST /api/audit/flag should record uncataloged product", async () => {
    const res = await fetch(`${BASE_URL}/audit/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user-1",
        barcode: "990011223344",
        productName: "Artisan Sourdough",
        brand: "Organic Bakery",
        ingredientsText: "Organic Wheat Flour, Water, Sea Salt",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.barcode).toBe("990011223344");
  });

  it("GET /api/user/export/:userId should export real data in JSON and CSV format", async () => {
    const jsonRes = await fetch(`${BASE_URL}/user/export/test-user-1?format=json`);
    expect(jsonRes.status).toBe(200);
    const jsonData = await jsonRes.json();
    expect(jsonData.user.id).toBe("test-user-1");
    expect(Array.isArray(jsonData.scans)).toBe(true);

    const csvRes = await fetch(`${BASE_URL}/user/export/test-user-1?format=csv`);
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers.get("content-type")).toContain("text/csv");
    const csvText = await csvRes.text();
    expect(csvText).toContain("Product Name,Barcode,Brand");
  });

  it("DELETE /api/user/account/:userId should permanently purge user data", async () => {
    const res = await fetch(`${BASE_URL}/user/account/test-user-1`, {
      method: "DELETE",
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const profileRes = await fetch(`${BASE_URL}/user/profile/test-user-1`);
    expect(profileRes.status).toBe(404);
  });

  it("POST /api/auth/sync with showcase email trial@scanbeforeeat.com should return demo_pro with seeded mock data", async () => {
    const res = await fetch(`${BASE_URL}/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "trial@scanbeforeeat.com",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.id).toBe("demo_pro");
    expect(data.plan).toBe("annual_pro");

    // Verify rich showcase data fetched from database for demo_pro
    const scansRes = await fetch(`${BASE_URL}/user/history/demo_pro`);
    const scans = await scansRes.json();
    expect(scans.length).toBeGreaterThanOrEqual(4);

    const invRes = await fetch(`${BASE_URL}/user/invoices/demo_pro`);
    const invs = await invRes.json();
    expect(invs.length).toBeGreaterThanOrEqual(3);

    const expRes = await fetch(`${BASE_URL}/exposure/demo_pro`);
    const exp = await expRes.json();
    expect(exp.dailyAdditiveLoad).toBeGreaterThan(0);
    expect(exp.scansAnalyzed).toBeGreaterThanOrEqual(4);
  });

  it("POST /api/auth/sync with a real email should create an isolated clean account with 0 scans and zero bio-burden", async () => {
    const realEmail = "real_auditor@personal-mail.com";
    const res = await fetch(`${BASE_URL}/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "usr_real_auditor_unique",
        email: realEmail,
        displayName: "Real Auditor",
        plan: "free",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.id).toBe("usr_real_auditor_unique");
    expect(data.plan).toBe("free");
    expect(data.remainingScans).toBe(15);

    // Verify clean slate: 0 scans, 0 invoices, 0 bio-burden
    const scansRes = await fetch(`${BASE_URL}/user/history/usr_real_auditor_unique`);
    const scans = await scansRes.json();
    expect(scans.length).toBe(0);

    const invRes = await fetch(`${BASE_URL}/user/invoices/usr_real_auditor_unique`);
    const invs = await invRes.json();
    expect(invs.length).toBe(0);

    const expRes = await fetch(`${BASE_URL}/exposure/usr_real_auditor_unique`);
    const exp = await expRes.json();
    expect(exp.dailyAdditiveLoad).toBe(0.0);
    expect(exp.scansAnalyzed).toBe(0);
    expect(exp.riskScore).toBe("Clean Baseline");

    // Clean up
    await fetch(`${BASE_URL}/user/account/usr_real_auditor_unique`, { method: "DELETE" });
  });

  it("POST /api/auth/send-otp and POST /api/auth/verify-otp should authenticate user via 6-digit email OTP", async () => {
    const testEmail = "test_otp_user@example.com";

    // 1. Send OTP
    const sendRes = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const sendData = await sendRes.json();
    expect(sendRes.status).toBe(200);
    expect(sendData.success).toBe(true);

    // Retrieve generated OTP from SQLite email_otps table
    const otpRow = db.prepare("SELECT otp FROM email_otps WHERE email = ? AND verified = 0 ORDER BY createdAt DESC LIMIT 1").get(testEmail) as any;
    expect(otpRow).toBeDefined();
    expect(otpRow.otp).toMatch(/^\d{6}$/);

    // 2. Reject wrong OTP
    const badVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, otp: "000000" }),
    });
    expect(badVerifyRes.status).toBe(400);

    // 3. Verify valid OTP
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, otp: otpRow.otp, displayName: "OTP Tester" }),
    });
    const verifyData = await verifyRes.json();
    expect(verifyRes.status).toBe(200);
    expect(verifyData.success).toBe(true);
    expect(verifyData.user.email).toBe(testEmail);
    expect(verifyData.user.displayName).toBe("OTP Tester");
    expect(verifyData.user.remainingScans).toBe(15);

    // 4. Verify OTP cannot be reused
    const reuseRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, otp: otpRow.otp }),
    });
    expect(reuseRes.status).toBe(400);

    // Clean up
    db.prepare("DELETE FROM email_otps WHERE email = ?").run(testEmail);
    db.prepare("DELETE FROM users WHERE email = ?").run(testEmail);
  });

  it("POST /api/user/allergens and GET /api/user/allergens/:userId should persist and retrieve custom allergens", async () => {
    // 0. Create a fresh test user
    const syncRes = await fetch(`${BASE_URL}/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "test-user-allergen",
        email: "allergen_test@scanbeforeeat.com",
        displayName: "Allergen Tester",
        plan: "free",
      }),
    });
    const syncData = await syncRes.json();
    const token = syncData.token;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 1. Save allergen preferences
    const testAllergens = [
      "Gluten (Wheat)",
      "Synthetic Azo Dyes (E102/E110/E129)",
      "Artificial Preservatives (TBHQ/BHA)",
    ];

    const saveRes = await fetch(`${BASE_URL}/user/allergens`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId: "test-user-allergen",
        allergens: testAllergens,
      }),
    });
    expect(saveRes.status).toBe(200);
    const saveData = await saveRes.json();
    expect(saveData.success).toBe(true);
    expect(saveData.allergens).toEqual(testAllergens);

    // 2. Fetch allergen preferences
    const getRes = await fetch(`${BASE_URL}/user/allergens/test-user-allergen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData).toEqual(expect.arrayContaining(testAllergens));

    // 3. Verify user profile also contains allergens
    const profileRes = await fetch(`${BASE_URL}/user/profile/test-user-allergen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(profileRes.status).toBe(200);
    const profileData = await profileRes.json();
    expect(profileData.allergens).toEqual(expect.arrayContaining(testAllergens));

    // Clean up
    await fetch(`${BASE_URL}/user/account/test-user-allergen`, { method: "DELETE", headers });
  });
});
