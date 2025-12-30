# CLAUDE_REPO_CLEANUP_AND_STAGING.md

## Objective
Clean and organize the Spiralogic Oracle System repository, prepare a staging branch identical to production, and run regression tests before the next feature cycle — **with fully automated unused file quarantine** before any deletions.

---

## Phase 1 – Repository Hygiene (Auto-Quarantine)

1. **Run Auto-Quarantine Script** *(Claude: create & run first)*
   - Generate `/scripts/quarantine-unused.js` (see script below).
   - Automatically scan all `/agents`, `/services`, `/api`, `/routes`, `/middleware`, `/sdk`.
   - Move unused `.js` / `.ts` files to `/deprecated/<timestamp>/`.
   - Log quarantined files to `unused-files.log` in the same folder.

2. **Remove Ghost & OS Files**
   - Delete all `.DS_Store`, `._*` files recursively.
   - Add patterns to `.gitignore`.

3. **Consolidate Documentation**
   - Move all `.md` files into `/docs`.
   - Update any relative links in markdown and code comments.
   - Create `/docs/README.md` as the master index.

4. **Standardize Folder Structure**
   ```
   /agents
     /personal_oracle
     /elemental
     /main_oracle
   /services
     /astrology
     /journaling
     /assessment
   /api
   /routes
   /middleware
   /sdk
   /docs
   /tests
   /deprecated
   ```
   - Move misplaced files to correct directories.

5. **Post-Cleanup Dependency Audit** *(Auto-Execute)*
   - Run `npm audit` to identify unused dependencies
   - Generate dependency report: `npm ls --depth=0 > dependency-report.txt`
   - Remove unused packages from `package.json` (keep quarantined for review)
   - Update `package-lock.json` with `npm install`

6. **Commit Phase 1**
   ```
   chore(repo): cleanup, quarantine unused files, audit dependencies, standardize structure
   ```

---

## Phase 2 – Staging Environment Sync

1. **Create Staging Branch**
   - From `main`, create `staging` branch.
   - Push to remote.

2. **Deploy to Staging**
   - Use same `.env` vars as production (safe keys only).
   - Deploy via CI/CD pipeline.

3. **Run Automated Regression Tests**
   - Execute all Jest + integration tests against staging.
   - Save results to `/tests/logs/staging-<date>.log`.

4. **Manual Sanity Checks**
   - `/api/v1/personal-oracle` core flows
   - Astrology, Journaling, Assessment services
   - AIN Engine API endpoints

5. **Commit Phase 2**
   ```
   test(staging): regression suite results
   ```

---

## Phase 3 – Production Safety Check

1. Compare staging vs production configurations.
2. If all staging tests pass:
   - Merge `staging` → `main`.
   - Trigger production deploy.
3. If staging fails:
   - Fix in `staging` until green.

---

## Automated Quarantine Script

Claude should create this **before** doing any cleanup:

```js
// scripts/quarantine-unused.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIRS = ['agents', 'services', 'api', 'routes', 'middleware', 'sdk'];
const DEPRECATED_DIR = path.join(__dirname, '..', 'deprecated', Date.now().toString());
fs.mkdirSync(DEPRECATED_DIR, { recursive: true });

let unusedFiles = [];
let unusedDeps = [];

// 1. Quarantine unused source files
SRC_DIRS.forEach(dir => {
const dirPath = path.join(__dirname, '..', dir);
if (fs.existsSync(dirPath)) {
 const files = execSync(`find ${dirPath} -type f \\( -name "*.js" -o -name "*.ts" \\)`)
   .toString().split('\n').filter(Boolean);

 files.forEach(file => {
   const grep = execSync(`grep -R "${path.basename(file)}" . || true`).toString();
   if (!grep.includes(file)) {
     unusedFiles.push(file);
     const dest = path.join(DEPRECATED_DIR, path.basename(file));
     fs.renameSync(file, dest);
   }
 });
}
});

// 2. Identify unused dependencies
try {
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeps = {...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {})};

Object.keys(allDeps).forEach(dep => {
 try {
   const result = execSync(`grep -r "require.*${dep}\\|import.*${dep}\\|from.*${dep}" . || true`, {encoding: 'utf8'});
   if (!result.trim()) {
     unusedDeps.push(dep);
   }
 } catch (e) {
   // Skip if grep fails
 }
});
} catch (e) {
console.log('Could not analyze dependencies:', e.message);
}

// 3. Generate reports
const reports = [
`# Cleanup Report - ${new Date().toISOString()}`,
``,
`## Files Quarantined: ${unusedFiles.length}`,
...unusedFiles.map(f => `- ${f}`),
``,
`## Potentially Unused Dependencies: ${unusedDeps.length}`,
...unusedDeps.map(d => `- ${d}`),
``,
`## Instructions`,
`- Review quarantined files before permanent deletion`,
`- Test application after removing dependencies`,
`- Dependencies may have indirect usage - verify before removal`
].join('\n');

fs.writeFileSync(path.join(DEPRECATED_DIR, 'cleanup-report.md'), reports);

console.log(`🗂️  Quarantined ${unusedFiles.length} files`);
console.log(`📦 Found ${unusedDeps.length} potentially unused dependencies`);
console.log(`📋 Report: ${path.join(DEPRECATED_DIR, 'cleanup-report.md')}`);
```

Run manually if needed:

```bash
node scripts/quarantine-unused.js
```

---

## Execution Rules for Claude Code

* **Always run quarantine before deletion.**
* Commit after each phase.
* Maintain metaphysical/archetypal logic intact.
* Update imports after file moves.
* Run `npm run lint && npm run build` after cleanup.

---

**End Goal:**
A clean, organized Spiralogic Oracle System with:

* All unused files safely quarantined for review
* Documentation centralized
* Staging environment fully in sync
* Production safety guaranteed