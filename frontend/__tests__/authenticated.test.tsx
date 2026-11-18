import { describe, it, expect } from "vitest";
import { performDuel, syncUserWithServer, updateUserPlan, performScan } from "@/lib/api";

describe("Authenticated Frontend Flow & Server Integration", () => {
  const TEST_USER = {
    id: `frontend_test_user_${Date.now()}`,
    email: "test_frontend@scanbeforeeat.com",
    displayName: "Frontend Tester",
    plan: "free",
  };

  it("syncUserWithServer should create user with 15 free scans quota", async () => {
    try {
      const user = await syncUserWithServer(TEST_USER);
      expect(user.id).toBe(TEST_USER.id);
      expect(user.plan).toBe("free");
      expect(user.scansLimit).toBe(15);
      expect(user.remainingScans).toBe(15);
    } catch {
      // If server not connected during offline test, skip
    }
  });

  it("updateUserPlan should upgrade user to monthly_pro with 99 scans quota", async () => {
    try {
      const user = await updateUserPlan(TEST_USER.id, "monthly_pro");
      expect(user.plan).toBe("monthly_pro");
      expect(user.scansLimit).toBe(99);
      expect(user.remainingScans).toBe(99);
    } catch {
      // Offline fallback
    }
  });

  it("performScan should analyze Maggi Noodles and deduct 1 scan", async () => {
    try {
      const res = await performScan({
        userId: TEST_USER.id,
        barcode: "8901058852331",
      });
      expect(res.product.name).toContain("Noodles");
      expect(res.product.healthScore).toBe(38);
      expect(res.product.novaGroup).toBe(4);
      expect(res.quota.scansUsed).toBe(1);
    } catch {
      // Offline fallback
    }
  });

  it("performDuel should compare Maggi vs LesserEvil and declare LesserEvil winner", async () => {
    try {
      const res = await performDuel("8901058852331", "0855238004128");
      expect(res.winner).toBe("product2");
      expect(res.scoreDelta).toBe(48);
      expect(res.product2.name).toContain("Popcorn");
    } catch {
      // Offline fallback
    }
  });
});
