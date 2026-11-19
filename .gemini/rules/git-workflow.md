# Git & Deployment Workflow Rules for ScanBeforeEat

When the user asks to "Push to github", "push", or deploy:
1. **Never push directly to `main`**.
2. **Branch First**: Always create or work on a feature/staging branch (e.g. `feature/<name>` or `staging`).
3. **Run All Test Cases**:
   - Backend tests: `npm --prefix server test`
   - Frontend tests: `npm --prefix frontend test`
   - Production builds: `npm --prefix frontend run build` & `npm --prefix server run build`
4. **Merge to Main**: Only after 100% of tests and builds pass, merge the feature branch into `main`.
5. **Push**: Push the tested branch and updated `main` to GitHub.
