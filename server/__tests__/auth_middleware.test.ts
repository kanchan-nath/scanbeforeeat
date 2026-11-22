import { describe, it, expect, vi } from "vitest";
import {
  generateJwtToken,
  verifyJwtToken,
  parseCookies,
  serializeAuthCookie,
  serializeClearAuthCookie,
  requireAuth,
} from "../src/middleware/auth.js";
import type { Request, Response } from "express";

describe("Server Auth Middleware & JWT Token Tests", () => {
  const user = {
    id: "usr_elena_test",
    email: "elena@science.org",
    plan: "monthly_pro",
  };

  it("generateJwtToken produces a valid 3-part base64url string", () => {
    const token = generateJwtToken(user);
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts.length).toBe(3);
  });

  it("verifyJwtToken decodes valid token payload", () => {
    const token = generateJwtToken(user);
    const decoded = verifyJwtToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(user.id);
    expect(decoded?.email).toBe(user.email);
    expect(decoded?.plan).toBe(user.plan);
    expect(decoded?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("verifyJwtToken returns null for tampered signature", () => {
    const token = generateJwtToken(user);
    const tampered = token.slice(0, -4) + "XXXX";
    const decoded = verifyJwtToken(tampered);
    expect(decoded).toBeNull();
  });

  it("verifyJwtToken returns null for expired token", () => {
    // Generate token with negative duration (-10s)
    const expiredToken = generateJwtToken(user, -10);
    const decoded = verifyJwtToken(expiredToken);
    expect(decoded).toBeNull();
  });

  it("parseCookies parses complex cookie headers", () => {
    const header = "sbe_token=token123; other=hello%20world; foo=bar";
    const cookies = parseCookies(header);
    expect(cookies.sbe_token).toBe("token123");
    expect(cookies.other).toBe("hello world");
    expect(cookies.foo).toBe("bar");
  });

  it("serializeAuthCookie formats standard cookie string", () => {
    const cookieStr = serializeAuthCookie("sample_token_xyz");
    expect(cookieStr).toContain("sbe_token=sample_token_xyz");
    expect(cookieStr).toContain("Path=/");
    expect(cookieStr).toContain("HttpOnly");
    expect(cookieStr).toContain("SameSite=Lax");
  });

  it("serializeClearAuthCookie clears cookie with Max-Age=0", () => {
    const clearStr = serializeClearAuthCookie();
    expect(clearStr).toContain("sbe_token=");
    expect(clearStr).toContain("Max-Age=0");
  });

  it("requireAuth succeeds with Authorization Bearer header", () => {
    const token = generateJwtToken(user);
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user.id).toBe(user.id);
  });

  it("requireAuth succeeds with sbe_token cookie", () => {
    const token = generateJwtToken(user);
    const req = {
      headers: {
        cookie: `sbe_token=${token}; theme=dark`,
      },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user.email).toBe(user.email);
  });

  it("requireAuth rejects request without token with 401", () => {
    const req = {
      headers: {},
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    requireAuth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("requireAuth rejects invalid token with 401", () => {
    const req = {
      headers: {
        authorization: "Bearer invalid_garbage_token",
      },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    requireAuth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
