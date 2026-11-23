# Security Policy

ScanBeforeEat takes the security, reliability, and privacy of its consumer health data seriously. We welcome responsible disclosures from security researchers and developers to help keep our users and infrastructure safe.

---

## 1. Supported Release Versions

Security patches and dependency updates are actively applied to the primary codebase branch:

| Version | Supported / Active | Security Notes |
|:---|:---:|:---|
| Current (`main`) | ✅ Supported | Actively maintained with dependencies and security patches |
| Prior Releases | ❌ Inactive | Upstream users are encouraged to pull latest `main` |

---

## 2. Reporting Security Vulnerabilities

If you identify a security issue, vulnerability, or potential exploit in ScanBeforeEat, please report it privately:

- **Primary Contact**: Kanchan Nath
- **Direct Email**: `kanchannath.webdev@gmail.com`
- **Subject Format**: `[SECURITY VULNERABILITY] - ScanBeforeEat - <Brief Component Description>`

### What to Include in Your Report
To accelerate validation and mitigation, please provide:
1. Detailed description of the potential vulnerability.
2. Affected routes, files, endpoints, or components.
3. Step-by-step reproduction instructions or a minimal proof-of-concept.
4. Assessment of potential exploit impact (such as data exposure, privilege escalation, or denial of service).

### Our Commitment & Response Expectations
- **Initial Acknowledgment**: We endeavor to acknowledge received security reports within 48 hours.
- **Triage & Validation**: The maintainer will investigate the report and verify reproducibility.
- **Remediation & Patch**: A fix will be developed and validated against all test suites before deploying to production.
- **Public Disclosure**: We coordinate public disclosure only after the patch has safely landed.

---

## 3. Core Security Principles & Architecture

- **Client-Side Camera Privacy**: Barcode decoding and optical character recognition operate directly within client-side browser workers (via Canvas and Tesseract.js). Raw video feeds are never streamed or persisted on application servers.
- **Strict Environment Isolation**: API keys, payment tokens, and database passwords must only reside in environment variables and are excluded from version control via `.gitignore`.
- **Query Parameterization**: Database queries leverage parameterized input handling across both the SQLite local engine and PostgreSQL cloud storage, mitigating SQL injection hazards.
- **Authentication & Rate Limiting**: Server endpoints enforce JWT authentication checks and rate limiters on sensitive mutation routes to guard against automated brute-force attempts.
