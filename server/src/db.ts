import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "scanbeforeeat.sqlite");
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      displayName TEXT,
      plan TEXT DEFAULT 'free',
      scansLimit INTEGER DEFAULT 15,
      scansUsed INTEGER DEFAULT 0,
      billingCycleResetAt TEXT,
      subscriptionId TEXT,
      paymentGateway TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      barcode TEXT NOT NULL,
      productName TEXT NOT NULL,
      brand TEXT,
      healthScore INTEGER NOT NULL,
      novaGroup INTEGER NOT NULL,
      scannedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      healthScore INTEGER NOT NULL,
      novaGroup INTEGER NOT NULL,
      ingredientsText TEXT,
      additivesJson TEXT NOT NULL,
      allergensJson TEXT NOT NULL,
      deductionsJson TEXT NOT NULL,
      alternativesJson TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_allergens (
      userId TEXT NOT NULL,
      allergen TEXT NOT NULL,
      PRIMARY KEY (userId, allergen)
    );

    CREATE TABLE IF NOT EXISTS pantry_items (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productName TEXT NOT NULL,
      category TEXT NOT NULL,
      novaGroup INTEGER NOT NULL,
      healthScore INTEGER NOT NULL,
      expiryDate TEXT,
      quantity INTEGER DEFAULT 1,
      addedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productName TEXT NOT NULL,
      category TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      addedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS banned_additives (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      reason TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      keyPrefix TEXT NOT NULL,
      fullKey TEXT NOT NULL,
      rateLimit INTEGER DEFAULT 100,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      allergensJson TEXT NOT NULL,
      avatar TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_studies (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      doi TEXT,
      journal TEXT NOT NULL,
      year INTEGER NOT NULL,
      summary TEXT,
      savedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      invoiceNumber TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      gstAmount REAL NOT NULL,
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'Paid',
      paymentId TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      brand TEXT NOT NULL,
      last4 TEXT NOT NULL,
      expiry TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0,
      name TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_health_profiles (
      userId TEXT PRIMARY KEY,
      dietaryProtocol TEXT NOT NULL,
      riskTolerance TEXT NOT NULL,
      dailyTarget INTEGER DEFAULT 5,
      conditionsJson TEXT NOT NULL,
      weightKg REAL DEFAULT 65,
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      device TEXT NOT NULL,
      browser TEXT NOT NULL,
      ip TEXT NOT NULL,
      location TEXT NOT NULL,
      isCurrent INTEGER DEFAULT 0,
      lastActiveAt TEXT DEFAULT (datetime('now')),
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_notifications (
      userId TEXT PRIMARY KEY,
      allergenAlert INTEGER DEFAULT 1,
      synergyAlert INTEGER DEFAULT 1,
      weeklyDigest INTEGER DEFAULT 1,
      newStudies INTEGER DEFAULT 0,
      quotaAlert INTEGER DEFAULT 1,
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS developer_webhooks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      url TEXT NOT NULL,
      eventsJson TEXT NOT NULL,
      secret TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS flagged_products (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      barcode TEXT NOT NULL,
      productName TEXT NOT NULL,
      brand TEXT NOT NULL,
      ingredientsText TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      submittedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      metadataJson TEXT,
      ip TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe column migration for users table
  try {
    db.exec("ALTER TABLE users ADD COLUMN billingCycleResetAt TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN subscriptionId TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN paymentGateway TEXT");
  } catch {}

  seedProducts();
  seedInitialUserData();
}

function seedProducts() {
  const count = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (
      barcode, name, brand, category, healthScore, novaGroup, ingredientsText, additivesJson, allergensJson, deductionsJson, alternativesJson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialProducts = [
    {
      barcode: "8901058852331",
      name: "2-Minute Masala Instant Noodles (70g)",
      brand: "Nestlé Maggi",
      category: "Packaged Instant Meals",
      healthScore: 38,
      novaGroup: 4,
      ingredientsText: "Wheat Flour (Refined Maida), Palm Oil, Iodised Salt, Wheat Gluten, Flavour Enhancer (INS 621), Tartrazine (INS 102), TBHQ (INS 319), Acidity Regulators.",
      additives: [
        { name: "MSG (Monosodium Glutamate E621)", functionDesc: "Flavor Enhancer", riskLevel: "moderate", clinicalEvidence: "PubMed: 124 peer-reviewed excitotoxin & headache studies" },
        { name: "Tartrazine (Synthetic Yellow 5 / E102)", functionDesc: "Artificial Color", riskLevel: "high", clinicalEvidence: "EFSA Mandatory Warning: May impair child activity & attention" },
        { name: "TBHQ (Tertiary Butylhydroquinone / E319)", functionDesc: "Synthetic Preservative", riskLevel: "high", clinicalEvidence: "Toxicological cellular bounds flagged in animal models" },
        { name: "Palm Oil (Refined Fractionated)", functionDesc: "Processed Frying Fat", riskLevel: "moderate", clinicalEvidence: "High saturated palmitic fatty acid profile (49%)" },
        { name: "Sodium Chloride (890mg)", functionDesc: "Mineral Seasoning", riskLevel: "moderate", clinicalEvidence: "44% daily maximum allowance in single 70g serving" }
      ],
      allergens: ["Gluten (Wheat)", "Soy", "Trace Dairy"],
      deductions: [
        { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
        { title: "Ultra-Processing Formulation", points: -30, reason: "Industrial extrusion, artificial hydrolyzates" },
        { title: "Flagged High-Risk Additives", points: -18, reason: "MSG (E621), Tartrazine (E102), TBHQ (E319)" },
        { title: "Excess Sodium Concentration", points: -14, reason: "890mg sodium (44% Daily Allowance)" }
      ],
      alternatives: [
        { name: "LesserEvil Organic Himalayan Popcorn", score: 86, nova: 1, note: "No Synthetic Additives • Whole Grain" },
        { name: "Koyo Organic Garlic Pepper Ramen", score: 74, nova: 2, note: "Baked not Fried • Zero MSG / TBHQ" }
      ]
    },
    {
      barcode: "7321461144417",
      name: "Barista Edition Oat Milk (1 Litre)",
      brand: "Oatly",
      category: "Plant-Based Dairy Alternative",
      healthScore: 72,
      novaGroup: 3,
      ingredientsText: "Oat Base (Water, Oats 10%), Low Erucic Acid Rapeseed Oil, Dipotassium Phosphate, Calcium Carbonate, Sea Salt, Vitamins (D2, Riboflavin, B12).",
      additives: [
        { name: "Dipotassium Phosphate (E340ii)", functionDesc: "Acidity Regulator & Emulsifier", riskLevel: "moderate", clinicalEvidence: "Inorganic phosphate additive; high intake linked to vascular calcification" },
        { name: "Rapeseed Oil (Refined Canola)", functionDesc: "Emulsion Texture Agent", riskLevel: "low", clinicalEvidence: "Low saturated fat profile; high omega-9 oleic acid" },
        { name: "Calcium Carbonate (E170)", functionDesc: "Mineral Fortification", riskLevel: "low", clinicalEvidence: "EFSA approved bioavailable calcium source" }
      ],
      allergens: ["Gluten (Oats)"],
      deductions: [
        { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
        { title: "Inorganic Emulsifier Salts", points: -15, reason: "Dipotassium phosphate flags vascular accumulation" },
        { title: "Industrial Seed Oil Emulsion", points: -13, reason: "Refined rapeseed oil for barista foam stability" }
      ],
      alternatives: [
        { name: "Malk Pure Unsweetened Organic Oat Milk", score: 92, nova: 1, note: "Only 3 Ingredients: Water, Organic Oats, Salt" },
        { name: "Elmhurst 1925 Milked Oats", score: 89, nova: 1, note: "HydroRelease method • Zero gums or oils" }
      ]
    },
    {
      barcode: "0855238004128",
      name: "Himalayan Pink Gold Organic Popcorn (142g)",
      brand: "LesserEvil",
      category: "Snack Foods & Grains",
      healthScore: 86,
      novaGroup: 1,
      ingredientsText: "Organic Non-GMO Popcorn, Organic Extra Virgin Coconut Oil, Himalayan Pink Salt.",
      additives: [
        { name: "Himalayan Pink Salt", functionDesc: "Natural Mineral Salt", riskLevel: "low", clinicalEvidence: "Contains trace elements; moderate sodium level" },
        { name: "Organic Coconut Oil", functionDesc: "Cold-Pressed Popping Oil", riskLevel: "low", clinicalEvidence: "Non-hydrogenated, zero trans fat" }
      ],
      allergens: ["Tree Nuts (Coconut)"],
      deductions: [
        { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
        { title: "Sodium Presence", points: -14, reason: "Moderate mineral salt content per 100g" }
      ],
      alternatives: [
        { name: "Air-Popped Organic Whole Corn", score: 96, nova: 1, note: "Zero oil, raw unprocessed whole kernel" }
      ]
    },
    {
      barcode: "028400064088",
      name: "Nacho Cheese Flavored Tortilla Chips",
      brand: "Doritos",
      category: "Processed Snacks",
      healthScore: 32,
      novaGroup: 4,
      ingredientsText: "Corn, Vegetable Oil, Maltodextrin, Salt, Cheddar Cheese, MSG, Disodium Inosinate, Disodium Guanylate, Artificial Colors (Yellow 6, Red 40, Yellow 5).",
      additives: [
        { name: "Yellow 6 (Sunset Yellow / E110)", functionDesc: "Synthetic Azo Dye", riskLevel: "high", clinicalEvidence: "EU mandatory warning for pediatric hyperactivity" },
        { name: "Red 40 (Allura Red / E129)", functionDesc: "Azo Dye", riskLevel: "high", clinicalEvidence: "Linked to gut inflammation in animal models" },
        { name: "Disodium Inosinate & Guanylate (E631/E627)", functionDesc: "Synergistic Flavor Enhancer", riskLevel: "moderate", clinicalEvidence: "Purine-rich nucleosides; avoid in hyperuricemia" }
      ],
      allergens: ["Milk", "Gluten"],
      deductions: [
        { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
        { title: "Multiple Synthetic Azo Dyes", points: -35, reason: "3 petroleum-derived colors flagged by EFSA" },
        { title: "Excitotoxin Cocktail", points: -20, reason: "MSG + E631 + E627 flavor synergy" },
        { title: "Industrial Fat Matrix", points: -13, reason: "Refined frying oils" }
      ],
      alternatives: [
        { name: "Siete Grain Free Lime Tortilla Chips", score: 88, nova: 1, note: "Cassava flour, avocado oil, real sea salt" }
      ]
    }
  ];

  for (const p of initialProducts) {
    insert.run(
      p.barcode,
      p.name,
      p.brand,
      p.category,
      p.healthScore,
      p.novaGroup,
      p.ingredientsText,
      JSON.stringify(p.additives),
      JSON.stringify(p.allergens),
      JSON.stringify(p.deductions),
      JSON.stringify(p.alternatives)
    );
  }
}

function seedInitialUserData() {
  const resetDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, displayName, plan, scansLimit, scansUsed, billingCycleResetAt, paymentGateway)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run("demo_free", "free-tier@scanbeforeeat.com", "Free Trial User", "free", 15, 3, resetDate, "none");
  insertUser.run("demo_pro", "trial@scanbeforeeat.com", "Dr. Elena Vance (Showcase Trial)", "annual_pro", 99, 12, resetDate, "razorpay");
  db.prepare("UPDATE users SET email = ? WHERE id = 'demo_pro'").run("trial@scanbeforeeat.com");

  // Seed sample scans history for demo_pro
  const scansCount = (db.prepare("SELECT count(*) as count FROM scans WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (scansCount === 0) {
    const insertScan = db.prepare(`
      INSERT INTO scans (id, userId, barcode, productName, brand, healthScore, novaGroup, scannedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertScan.run("s1", "demo_pro", "8901058852331", "Maggi 2-Minute Masala Instant Noodles", "Nestlé Maggi", 38, 4, "2026-11-18 14:22:00");
    insertScan.run("s2", "demo_pro", "7321461144417", "Barista Edition Oat Milk (1 Litre)", "Oatly", 72, 3, "2026-11-17 10:15:00");
    insertScan.run("s3", "demo_pro", "0855238004128", "Himalayan Pink Gold Organic Popcorn (142g)", "LesserEvil", 86, 1, "2026-11-16 18:40:00");
    insertScan.run("s4", "demo_pro", "028400064088", "Nacho Cheese Flavored Tortilla Chips", "Doritos", 32, 4, "2026-11-15 12:05:00");
  }

  // Seed sample pantry items
  const pantryCount = (db.prepare("SELECT count(*) as count FROM pantry_items").get() as any)?.count || 0;
  if (pantryCount === 0) {
    const insertPantry = db.prepare(`
      INSERT INTO pantry_items (id, userId, productName, category, novaGroup, healthScore, expiryDate, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPantry.run("p1", "demo_pro", "Italian Peeled San Marzano Tomatoes", "Canned Pantry", 1, 95, "2027-08-15", 4);
    insertPantry.run("p2", "demo_pro", "Barista Edition Oat Milk (Oatly)", "Beverages & Dairy", 3, 72, "2026-12-01", 2);
    insertPantry.run("p3", "demo_pro", "Himalayan Pink Gold Organic Popcorn", "Healthy Snacks", 1, 86, "2027-03-10", 3);
    insertPantry.run("p4", "demo_pro", "Maggi 2-Minute Masala Noodles", "Instant Meals", 4, 38, "2026-11-20", 1);
  }

  // Seed sample shopping list items
  const shoppingCount = (db.prepare("SELECT count(*) as count FROM shopping_items").get() as any)?.count || 0;
  if (shoppingCount === 0) {
    const insertShop = db.prepare(`
      INSERT INTO shopping_items (id, userId, productName, category, checked)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertShop.run("s1", "demo_pro", "Malk Pure Organic Almond Milk", "Clean Dairy Alternative", 0);
    insertShop.run("s2", "demo_pro", "Siete Grain Free Lime Tortilla Chips", "Clean Snack", 0);
    insertShop.run("s3", "demo_pro", "Organic Cold-Pressed Extra Virgin Olive Oil", "Oils & Condiments", 1);
    insertShop.run("s4", "demo_pro", "Koyo Organic Garlic Pepper Ramen", "Whole Grain Noodle", 0);
  }

  // Seed sample banned additives
  const bannedCount = (db.prepare("SELECT count(*) as count FROM banned_additives").get() as any)?.count || 0;
  if (bannedCount === 0) {
    const insertBanned = db.prepare(`
      INSERT INTO banned_additives (id, userId, code, name, reason)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertBanned.run("b1", "demo_pro", "E171", "Titanium Dioxide", "Banned in EU (2022) due to genotoxicity concerns");
    insertBanned.run("b2", "demo_pro", "E319", "TBHQ (Tertiary Butylhydroquinone)", "Synthetic preservative linked to cellular stress in animal models");
    insertBanned.run("b3", "demo_pro", "E102", "Tartrazine (Yellow 5)", "EFSA mandatory hyperactivity warning for children");
  }

  // Seed sample API keys
  const keysCount = (db.prepare("SELECT count(*) as count FROM api_keys").get() as any)?.count || 0;
  if (keysCount === 0) {
    const insertKey = db.prepare(`
      INSERT INTO api_keys (id, userId, name, keyPrefix, fullKey, rateLimit)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertKey.run("k1", "demo_pro", "Production Mobile App", "sbe_live_7a9f", "sbe_live_7a9f9024c138da01824bc", 1000);
    insertKey.run("k2", "demo_pro", "Staging QA Suite", "sbe_test_3b11", "sbe_test_3b114d28e0892ac0124fe", 100);
  }

  // Seed sample family profiles
  const familyCount = (db.prepare("SELECT count(*) as count FROM family_members").get() as any)?.count || 0;
  if (familyCount === 0) {
    const insertFamily = db.prepare(`
      INSERT INTO family_members (id, userId, name, relationship, allergensJson, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertFamily.run("f1", "demo_pro", "Elena Vance (Primary)", "Self", JSON.stringify(["Sulfites", "Artificial Dyes"]), "EV");
    insertFamily.run("f2", "demo_pro", "Leo Vance", "Child (Age 6)", JSON.stringify(["Peanuts", "Tartrazine (Yellow 5)", "Red 40"]), "LV");
    insertFamily.run("f3", "demo_pro", "Marcus Vance", "Spouse", JSON.stringify(["Dairy (Lactose)"]), "MV");
  }

  // Seed sample saved studies
  const studiesCount = (db.prepare("SELECT count(*) as count FROM saved_studies").get() as any)?.count || 0;
  if (studiesCount === 0) {
    const insertStudy = db.prepare(`
      INSERT INTO saved_studies (id, userId, title, doi, journal, year, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStudy.run("st1", "demo_pro", "Ultra-Processed Food Consumption and Mortality: NutriNet-Santé Prospective Cohort", "10.1136/bmj.l1451", "The BMJ", 2019, "A 10% increase in UPF intake correlated with a 14% higher risk of all-cause mortality across 44,551 French adults.");
    insertStudy.run("st2", "demo_pro", "Dietary Emulsifiers Impact the Mouse Gut Microbiota Promoting Colitis and Metabolic Syndrome", "10.1038/nature14232", "Nature", 2015, "Low-concentration Polysorbate-80 and CMC promote mucosal inflammation and bacterial translocation across gut barrier.");
  }

  // Seed sample invoices
  const invoiceCount = (db.prepare("SELECT count(*) as count FROM invoices WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (invoiceCount === 0) {
    const insertInv = db.prepare(`
      INSERT INTO invoices (id, userId, invoiceNumber, date, description, amount, gstAmount, plan, status, paymentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertInv.run("inv1", "demo_pro", "INV-2026-0091", "2026-11-18", "Annual Pro Toxicologist Plan (1 Year)", 999.0, 179.82, "annual_pro", "Paid", "pay_live_091k8a");
    insertInv.run("inv2", "demo_pro", "INV-2025-0814", "2025-11-18", "Annual Pro Toxicologist Plan (1 Year)", 999.0, 179.82, "annual_pro", "Paid", "pay_live_814m2b");
    insertInv.run("inv3", "demo_pro", "INV-2025-0520", "2025-05-20", "Monthly Pro Trial Upgrade", 199.0, 35.82, "monthly_pro", "Paid", "pay_live_520j1x");
  }

  // Seed sample payment methods
  const pmCount = (db.prepare("SELECT count(*) as count FROM payment_methods WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (pmCount === 0) {
    const insertPm = db.prepare(`
      INSERT INTO payment_methods (id, userId, brand, last4, expiry, isDefault, name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertPm.run("c1", "demo_pro", "Visa", "4242", "08/29", 1, "Dr. Elena Vance");
    insertPm.run("c2", "demo_pro", "Mastercard", "8891", "12/28", 0, "Elena Vance");
  }

  // Seed sample health profile
  const hpCount = (db.prepare("SELECT count(*) as count FROM user_health_profiles WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (hpCount === 0) {
    const insertHp = db.prepare(`
      INSERT INTO user_health_profiles (userId, dietaryProtocol, riskTolerance, dailyTarget, conditionsJson, weightKg)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertHp.run("demo_pro", "Strict Clean Label & Low-UPF", "Zero Tolerance (Strict EU Precautionary)", 5, JSON.stringify(["Celiac Sensitivity", "Asthma Trigger Watch"]), 65.0);
  }

  // Seed sample active sessions
  const sessCount = (db.prepare("SELECT count(*) as count FROM user_sessions WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (sessCount === 0) {
    const insertSess = db.prepare(`
      INSERT INTO user_sessions (id, userId, device, browser, ip, location, isCurrent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertSess.run("sess_1", "demo_pro", "Apple MacBook Pro (macOS Sequoia)", "Google Chrome 130.0", "103.212.144.18", "Bengaluru, India", 1);
    insertSess.run("sess_2", "demo_pro", "Apple iPhone 15 Pro (iOS 18.1)", "Mobile Safari & Camera PWA", "103.212.144.22", "Bengaluru, India", 0);
  }

  // Seed sample user notifications
  const notifCount = (db.prepare("SELECT count(*) as count FROM user_notifications WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (notifCount === 0) {
    const insertNotif = db.prepare(`
      INSERT INTO user_notifications (userId, allergenAlert, synergyAlert, weeklyDigest, newStudies, quotaAlert)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertNotif.run("demo_pro", 1, 1, 1, 0, 1);
  }

  // Seed sample developer webhooks
  const whCount = (db.prepare("SELECT count(*) as count FROM developer_webhooks WHERE userId = 'demo_pro'").get() as any)?.count || 0;
  if (whCount === 0) {
    const insertWh = db.prepare(`
      INSERT INTO developer_webhooks (id, userId, url, eventsJson, secret, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertWh.run("wh_1", "demo_pro", "https://api.mygroceryapp.com/webhooks/scanbeforeeat", JSON.stringify(["scan.completed", "allergen.triggered"]), "whsec_live_9a8b7c6d5e", "active");
  }
}
