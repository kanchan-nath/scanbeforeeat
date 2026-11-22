# End-to-End JWT Authentication & Route Protection Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement modular, secure JWT cookie-based authentication with Next.js edge route middleware and Express server middleware to protect authenticated pages (`/scanner`, `/dashboard`, etc.) and redirect unauthenticated users to `/auth`.

**Architecture:**
1. **Server (Express)**: Issues signed JWT tokens (`sbe_token`) upon `/api/auth/verify-otp`, `/api/auth/login`, and `/api/auth/sync`. Middleware (`requireAuth`) verifies `Authorization: Bearer <token>` or `sbe_token` cookie for protected APIs (`/api/scan`, `/api/user/:id`, `/api/pantry`, `/api/history`, etc.).
2. **Client (Next.js & AuthContext)**: Stores JWT token in `sbe_token` cookie (and syncing profile state). Strips auto-demo login bypass from all pages.
3. **Route Protection (Next.js Middleware)**: `frontend/src/middleware.ts` intercepts requests, checks for valid `sbe_token` cookie on protected paths (`/scanner`, `/dashboard`, `/pantry`, `/history`, `/batch-queue`, `/account/*`, etc.), and redirects unauthenticated requests to `/auth?redirect=<target>`.

**Tech Stack:**
* Backend: Express, Node.js, `jsonwebtoken`, `cookie-parser`, TypeScript
* Frontend: Next.js 16 (App Router), `jose` / standard Cookies, React 19, TypeScript
* Testing: Vitest

## Global Constraints
* Unauthenticated visitors on `/` (or any public page) clicking "Start Scanner" or any protected feature link must be redirected to `/auth?redirect=<url>`.
* All authenticated portal screens must not auto-login into demo mode automatically.
* Public pages (`/`, `/about`, `/blog`, `/terms`, `/privacy`, `/security`, `/status`, `/careers`, `/methodology`, `/upf-guide`, `/additives`, `/studies`, `/auth`) remain publicly accessible.
* All existing test suites (`npm --prefix server test` and `npm --prefix frontend test`) and builds (`npm --prefix frontend run build`, `npm --prefix server run build`) must pass without errors.

---

### Task 1: Server JWT & Cookie Authentication Infrastructure

**Files:**
* Modify: `server/package.json`
* Create: `server/src/middleware/auth.ts`
* Modify: `server/src/index.ts`
* Test: `server/__tests__/auth_middleware.test.ts`

**Interfaces:**
* `generateToken(payload: { id: string; email: string; plan: string }): string`
* `verifyToken(token: string): AuthPayload | null`
* `requireAuth(req: Request, res: Response, next: NextFunction): void`

- [ ] **Step 1: Install dependencies on server**
  Install `jsonwebtoken`, `@types/jsonwebtoken`, `cookie-parser`, `@types/cookie-parser`.
- [ ] **Step 2: Create `server/src/middleware/auth.ts`**
  Implement JWT signing (`JWT_SECRET` with fallback), token verification, and Express `requireAuth` middleware supporting Bearer headers and cookies.
- [ ] **Step 3: Update `server/src/index.ts`**
  Register `cookieParser()`.
  Update `/api/auth/sync`, `/api/auth/login`, and `/api/auth/verify-otp` to return signed `token` and set `sbe_token` HTTP cookie.
  Add `requireAuth` to protected endpoints: `/api/scan`, `/api/pantry`, `/api/history`, `/api/exposure/:userId`, `/api/payment/create-order`, `/api/user/:id`.
- [ ] **Step 4: Write tests in `server/__tests__/auth_middleware.test.ts`**
  Verify valid token passes, missing token returns 401 Unauthorized, invalid token returns 401.
- [ ] **Step 5: Run server tests and TypeScript build**
  Run `npm --prefix server test` and `npm --prefix server run build`.

---

### Task 2: Frontend Cookie Sync & Next.js Route Protection Middleware

**Files:**
* Modify: `frontend/package.json`
* Create: `frontend/src/middleware.ts`
* Modify: `frontend/src/lib/api.ts`
* Modify: `frontend/src/lib/auth-context.tsx`
* Test: `frontend/__tests__/middleware.test.ts`

**Interfaces:**
* Next.js Middleware checks `req.cookies.get("sbe_token")`.
* Protected matchers: `/scanner`, `/dashboard`, `/pantry`, `/history`, `/batch-queue`, `/exposure-ledger`, `/shopping-list`, `/saved-studies`, `/invoices`, `/banned-additives`, `/api-keys`, `/developer`, `/api-playground`, `/webhooks`, `/health-profile`, `/allergens`, `/subscription`, `/payment-methods`, `/duel`, `/alternatives`, `/account/:path*`, `/product/:path*`, `/audit/flag`.

- [ ] **Step 1: Install `jose` on frontend**
  Install `jose` for lightweight edge-compatible JWT handling.
- [ ] **Step 2: Create `frontend/src/middleware.ts`**
  Define protected route paths.
  Extract `sbe_token` from cookies.
  If missing or invalid, redirect to `/auth?redirect=${encodeURIComponent(pathname)}`.
  If token is present and user visits `/auth`, redirect to `/dashboard`.
- [ ] **Step 3: Update `frontend/src/lib/api.ts`**
  Include `Authorization: Bearer <token>` in `fetchApi` requests using token stored in cookie/context.
- [ ] **Step 4: Update `frontend/src/lib/auth-context.tsx`**
  On sign in / OTP verify / demo login: write `sbe_token` to `document.cookie`.
  On logout: clear `sbe_token` cookie and redirect to `/auth`.
  Provide `token` in `AuthContext`.
- [ ] **Step 5: Write unit tests in `frontend/__tests__/middleware.test.ts`**
  Verify protected route redirects unauthenticated requests, allows authenticated requests.

---

### Task 3: Clean Up Page-by-Page Auto-Login Bypasses & Add Route Guards

**Files:**
* Modify: `frontend/src/components/AuthenticatedShell.tsx`
* Modify: `frontend/src/app/scanner/page.tsx`
* Modify: `frontend/src/app/pantry/page.tsx`
* Modify: `frontend/src/app/exposure-ledger/page.tsx`
* Modify: `frontend/src/app/saved-studies/page.tsx`
* Modify: `frontend/src/app/invoices/page.tsx`
* Modify: `frontend/src/app/banned-additives/page.tsx`
* Modify: `frontend/src/app/api-keys/page.tsx`
* Modify: `frontend/src/app/dashboard/page.tsx`
* Modify: `frontend/src/app/shopping-list/page.tsx`
* Modify: `frontend/src/app/history/page.tsx`
* Modify: `frontend/src/app/account/family/page.tsx`
* Modify: `frontend/src/app/auth/page.tsx`

- [ ] **Step 1: Remove `if (!user) loginDemo("monthly_pro")` from all 11 pages**
  Remove the silent mock auto-login hooks from each of the listed pages.
- [ ] **Step 2: Add client-side route guard in `AuthenticatedShell.tsx`**
  If `!loading && !user`, redirect to `/auth?redirect=${pathname}` so even client-rendered transitions without full reload are protected.
- [ ] **Step 3: Enhance `frontend/src/app/auth/page.tsx`**
  Support `?redirect=` query parameter so after sign-in / OTP / demo login, the user is forwarded to their originally requested page (e.g. `/scanner`).
  Keep explicit 1-click Demo Showcase button on `/auth` for quick testing if requested.

---

### Task 4: End-to-End Verification & Test Suite Validation

**Files:**
* Modify / Update existing tests:
  * `frontend/__tests__/authenticated-portal.test.tsx`
  * `frontend/__tests__/authenticated.test.tsx`
  * `server/__tests__/api.test.ts`

- [ ] **Step 1: Run all server tests**
  `npm --prefix server test`
- [ ] **Step 2: Run all frontend tests**
  `npm --prefix frontend test`
- [ ] **Step 3: Verify frontend build**
  `npm --prefix frontend run build`
- [ ] **Step 4: Verify server build**
  `npm --prefix server run build`
- [ ] **Step 5: Test unauthenticated flow**
  Verify visiting `/scanner` without cookie redirects to `/auth?redirect=%2Fscanner`.
