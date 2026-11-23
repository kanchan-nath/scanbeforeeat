# Contributing to ScanBeforeEat

Thank you for your interest in contributing to ScanBeforeEat! We welcome contributions across frontend interfaces, backend APIs, toxicology databases, internationalization, and test coverage.

---

## 1. Guiding Principles & Ethics

ScanBeforeEat delivers consumer-facing food intelligence. All contributions must respect these foundational pillars:
- **Scientific Grounding**: Ground ingredient toxicology and health findings in credible regulatory frameworks (such as WHO, EFSA, US FDA, or FSSAI).
- **Client Privacy**: Maintain client-side data boundaries. Barcode scans and camera OCR frames must remain private to the user.
- **Code Hygiene**: Write idiomatic TypeScript, maintain lean dependency footprints, and provide comprehensive test coverage.

Please review our [CODE_OF_CONDUCT.md](file:///Users/kanchannath/Coding/scanbeforeeat/CODE_OF_CONDUCT.md) before participating.

---

## 2. Monorepo Organization

This repository operates as a clean npm workspace monorepo:

```
scanbeforeeat/
├── frontend/             # Next.js App Router, React, Tailwind CSS UI
├── server/               # Node.js, Express, TypeScript API server
├── docs/                 # Technical architecture, security, and schema guides
├── scripts/              # Automation and SEO content generation pipelines
├── package.json          # Monorepo root workspace orchestrator
├── .env.example          # Environment variables reference template
└── render.yaml           # Deployment blueprint configuration
```

---

## 3. Development Setup

### System Prerequisites
- **Node.js**: `v22.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Python**: `3.10+` (optional, only needed for `scripts/seo-pipeline`)

### Installation Steps

1. Clone the repository to your local workstation:
   ```bash
   git clone https://github.com/kanchan-nath/scanbeforeeat.git
   cd scanbeforeeat
   ```

2. Install all dependencies across all workspaces:
   ```bash
   npm install
   ```

3. Initialize your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Launch the local development environments:
   ```bash
   # Option A: Start frontend UI (http://localhost:3000)
   npm run dev:frontend

   # Option B: Start backend API server (http://localhost:4000)
   npm run dev:server
   ```

---

## 4. Git Workflow & Branching Policy

To protect production stability:
- **Never push directly to the `main` branch**.
- Always branch off an up-to-date `main` using descriptive naming:
  - `feature/<name>` for new capabilities
  - `fix/<name>` for bug resolutions
  - `docs/<name>` for documentation updates
  - `refactor/<name>` for structural code refactoring

### Conventional Commit Standards
Format commit messages concisely following Conventional Commits:
- `feat(scope): concise description of new feature`
- `fix(scope): concise description of bug resolution`
- `docs(scope): documentation addition or correction`
- `test(scope): test suite additions or adjustments`
- `refactor(scope): code restructuring without behavior changes`

---

## 5. Mandatory Verification Checklist

Before opening any pull request, verify that every check passes locally:

```bash
# 1. Run all backend server unit and integration tests
npm --prefix server test

# 2. Run all frontend client tests
npm --prefix frontend test

# 3. Verify server TypeScript build
npm --prefix server run build

# 4. Verify frontend Next.js production build
npm --prefix frontend run build

# 5. Run frontend ESLint rules
npm --prefix frontend run lint
```

Pull requests will only be merged once all automated test suites and build gates succeed without warnings or failures.

---

## 6. Opening a Pull Request

1. Push your feature branch to your fork or origin:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request targeting `main`.
3. Provide a clear summary:
   - What problems or features this PR addresses.
   - List of added, modified, or reorganized files.
   - Evidence of passing test commands and builds.
   - Screenshots or recordings if frontend visuals were modified.
