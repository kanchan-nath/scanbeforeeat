# ScanBeforeEat — Security & Abuse Prevention Architecture

## 1. Threat Model & Security Posture

ScanBeforeEat is designed as a public-facing Internet PWA. It implements defense-in-depth across the application lifecycle.

---

## 2. Secrets Management & Environment Security

- **Strict Environment Validation**: Environment variables are parsed and validated at boot using Zod (`server/config/env.js`). Missing production secrets trigger immediate process termination (`process.exit(1)`).
- **Git Safeguards**: `.env`, session keys, database credentials, and log files are strictly excluded via `.gitignore`.
- **Sensitive Data Redaction**: The structured logger (`pino`) automatically redacts `password`, `password_hash`, `cookie`, `session`, and `NVIDIA_API_KEY` across all log messages.

---

## 3. Session Management & Authentication Security

- **Password Hashing**: Passwords are securely hashed with `argon2id` (memory cost: 19456 KiB, time cost: 2, parallelism: 1).
- **Session Fixation Defense**: Sessions are explicitly regenerated upon authentication (`req.session.regenerate`).
- **Timing Attack Mitigation**: Login failure paths for non-existent users execute simulated constant-time delays to prevent email enumeration.
- **Persistent MySQL Session Store**: Sessions are stored in a dedicated MySQL table with automatic expiration cleanup. No in-memory stores are used.
- **Secure Cookie Flags**:
  - `httpOnly: true` (prevents JavaScript/XSS cookie extraction)
  - `secure: true` (enforced when `NODE_ENV === 'production'`)
  - `sameSite: 'lax'` (protects against cross-site request forgery)

---

## 4. Multi-Tenant Authorization & Data Ownership

All user-owned resources (`scans`, `reports`, `preferences`) enforce strict tenant isolation:
1. **Middleware Verification**: The `checkOwnership(table, paramKey)` middleware queries `SELECT user_id FROM <table> WHERE id = ?` and rejects cross-user access with `403 Forbidden`.
2. **SQL Query Scoping**: All list, update, and delete queries bind `user_id = ?` using parameterized queries.
3. **No Guessable Resource Leaks**: Accessing another user's scan ID is blocked and logged as a security alert with correlation ID.

---

## 5. Cross-Site Request Forgery (CSRF) Protection

- All state-changing endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid cryptographic CSRF token.
- Tokens are generated using `crypto.randomBytes(32).toString('hex')` and bound to the server-side session.
- Clients send the token in the `x-csrf-token` HTTP header. Missing or mismatched tokens are rejected with `403 Forbidden`.

---

## 6. Content Security Policy (CSP) & HTTP Headers

Configured via `helmet`:
```javascript
directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
  workerSrc: ["'self'", "blob:"],
  connectSrc: ["'self'", "https://world.openfoodfacts.org", "https://tessdata.projectnaptha.com", "https://cdn.jsdelivr.net"],
  imgSrc: ["'self'", "data:", "blob:", "https:"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"]
}
```

---

## 7. Rate Limiting & Abuse Prevention

Independent rate limit tiers protect critical system components:
- **Authentication (`/api/v1/auth/login`, `/register`)**: 15 requests per 15 minutes per IP.
- **AI Analysis (`/api/v1/scans/:id/analyze`)**: 20 requests per 10 minutes per authenticated user/IP.
- **Barcode / Product Lookup (`/api/v1/products/barcode/`)**: 60 requests per minute.
- **Global API**: 120 requests per minute per IP.
