import { describe, it, expect } from "vitest";
import { middleware } from "../src/middleware";
import { AUTH_COOKIE_NAME, parseJwtPayload } from "../src/lib/auth-cookie";
import { NextRequest } from "next/server";

function createMockJwt(userId: string, expOffsetSec: number = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      id: userId,
      email: `${userId}@example.com`,
      plan: "free",
      exp: Math.floor(Date.now() / 1000) + expOffsetSec,
    })
  ).toString("base64url");
  return `${header}.${payload}.mockSignature123`;
}

describe("Next.js Auth Route Protection Middleware", () => {
  it("parseJwtPayload decodes payload and handles expiration", () => {
    const valid = createMockJwt("user_123", 3600);
    const decoded = parseJwtPayload(valid);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe("user_123");

    const expired = createMockJwt("user_123", -10);
    expect(parseJwtPayload(expired)).toBeNull();
    expect(parseJwtPayload("invalid_token")).toBeNull();
  });

  it("redirects unauthenticated visitor from /scanner to /auth", () => {
    const req = new NextRequest("http://localhost:3000/scanner");
    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/auth");
    expect(location).toContain("redirect=%2Fscanner");
  });

  it("redirects unauthenticated visitor from /dashboard to /auth", () => {
    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/auth");
    expect(location).toContain("redirect=%2Fdashboard");
  });

  it("redirects unauthenticated visitor from /product/8901058852331 to /auth", () => {
    const req = new NextRequest("http://localhost:3000/product/8901058852331");
    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/auth");
    expect(location).toContain("redirect=%2Fproduct%2F8901058852331");
  });

  it("allows unauthenticated visitor on public pages (/ and /additives)", () => {
    const homeReq = new NextRequest("http://localhost:3000/");
    const homeRes = middleware(homeReq);
    expect(homeRes.status).toBe(200);

    const additivesReq = new NextRequest("http://localhost:3000/additives");
    const additivesRes = middleware(additivesReq);
    expect(additivesRes.status).toBe(200);
  });

  it("allows authenticated visitor with sbe_token cookie to access /scanner", () => {
    const token = createMockJwt("user_abc", 3600);
    const req = new NextRequest("http://localhost:3000/scanner", {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects authenticated visitor from /auth to /dashboard", () => {
    const token = createMockJwt("user_abc", 3600);
    const req = new NextRequest("http://localhost:3000/auth", {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("allows public checkout success and declined callback screens", () => {
    const successReq = new NextRequest("http://localhost:3000/checkout/success");
    expect(middleware(successReq).status).toBe(200);

    const declinedReq = new NextRequest("http://localhost:3000/checkout/declined");
    expect(middleware(declinedReq).status).toBe(200);
  });
});
