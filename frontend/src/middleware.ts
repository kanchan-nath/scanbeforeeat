import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, parseJwtPayload } from "@/lib/auth-cookie";

const PROTECTED_PREFIXES = [
  "/scanner",
  "/dashboard",
  "/pantry",
  "/history",
  "/batch-queue",
  "/exposure-ledger",
  "/shopping-list",
  "/saved-studies",
  "/invoices",
  "/banned-additives",
  "/api-keys",
  "/developer",
  "/api-playground",
  "/webhooks",
  "/health-profile",
  "/allergens",
  "/subscription",
  "/payment-methods",
  "/duel",
  "/alternatives",
  "/account",
  "/product",
  "/audit/flag",
  "/quota-exceeded",
  "/checkout",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Exempt checkout outcome confirmation screens
  if (pathname === "/checkout/success" || pathname === "/checkout/declined") {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = tokenCookie ? parseJwtPayload(tokenCookie) : null;
  const isAuthenticated = Boolean(payload);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If unauthenticated user tries to visit protected route -> redirect to /auth
  if (isProtected && !isAuthenticated) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user visits /auth without intent to switch -> redirect to /dashboard
  if (pathname === "/auth" && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const target = redirectParam || "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml)$).*)",
  ],
};
