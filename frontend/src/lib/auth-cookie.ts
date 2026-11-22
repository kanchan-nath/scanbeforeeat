export const AUTH_COOKIE_NAME = "sbe_token";

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthCookie(token: string, maxAgeSeconds: number = 30 * 24 * 60 * 60): void {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${
    isSecure ? "; Secure" : ""
  }`;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export interface JwtPayload {
  id: string;
  email: string;
  plan: string;
  exp?: number;
  iat?: number;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    const data = JSON.parse(jsonStr) as JwtPayload;
    if (data.exp && Math.floor(Date.now() / 1000) > data.exp) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
