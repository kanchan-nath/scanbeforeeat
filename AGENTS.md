# ScanBeforeEat Project Guidelines & Rules

## Git Workflow (MANDATORY)
Whenever asked to "Push to github" or deploy:
- **NEVER push directly to `main`**.
- Always checkout/create a separate working branch (e.g. `feature/<task-name>`).
- Run and verify all test cases:
  1. `npm --prefix server test` (all server suites must pass)
  2. `npm --prefix frontend test` (all frontend suites must pass)
  3. `npm --prefix frontend run build` (Turbopack production build must pass)
  4. `npm --prefix server run build` (TypeScript build must pass)
- Only after all tests and verification pass cleanly: merge the branch into `main`.
- Push to GitHub origin.
