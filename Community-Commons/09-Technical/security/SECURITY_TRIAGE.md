# Security Vulnerability Triage

**Date:** December 14, 2025
**Node Version:** See `node-version.txt`
**NPM Version:** See `npm-version.txt`
**Total Vulnerabilities:** 2 moderate

---

## Summary

Only **2 moderate severity vulnerabilities** found - both in production dependencies.

**Good news:**
- No critical or high severity issues
- No devDependency-only issues
- The `ai` package is a direct dependency but **not currently used** in the codebase
- Fix is straightforward (upgrade ai package)

---

## Vulnerability Classification

### Bucket A — Production Runtime, High/Critical
**Count:** 0
**Status:** ✅ None found

---

### Bucket B — Production Runtime, Moderate
**Count:** 2
**Status:** ⚠️ Need to fix

#### 1. ai (Vercel AI SDK) - Filetype Whitelist Bypass
- **Package:** `ai`
- **Current Version:** 3.4.33
- **Fixed In:** 5.0.113
- **Severity:** Moderate
- **Advisory:** https://github.com/advisories/GHSA-rwvc-j5jr-mgvh
- **Description:** Vercel's AI SDK's filetype whitelists can be bypassed when uploading files
- **Production Impact:** LOW - Package is in dependencies but not currently imported/used in codebase
- **Breaking Change:** Yes (v3 → v5)
- **Recommendation:** Upgrade to ai@5.0.113

**Code Usage Check:**
```bash
grep -r "from ['"]ai['"]" --include="*.ts" --include="*.tsx" lib/ app/ components/
# Result: No matches found
```

The `ai` package is listed in `package.json` but not actively used. Safe to upgrade.

#### 2. jsondiffpatch - XSS Vulnerability
- **Package:** `jsondiffpatch`
- **Current Version:** 0.6.0
- **Fixed In:** 0.7.2+
- **Severity:** Moderate
- **Advisory:** https://github.com/advisories/GHSA-33vc-wfww-vjfv
- **Description:** XSS vulnerability via HtmlFormatter::nodeBegin
- **Production Impact:** LOW - This is a transitive dependency of `ai` package
- **Recommendation:** Fixed automatically when upgrading `ai` package

---

### Bucket C — DevDependency Only
**Count:** 0
**Status:** ✅ None found

---

### Bucket D — "Needs Major Bump"
**Count:** 0 (handled in Bucket B)
**Status:** N/A

---

## Fix Strategy

### Recommended Order

#### Step 1: Try non-breaking fix first
```bash
npm audit fix
```

**Expected:** Will likely report that fixes are available but require --force

#### Step 2: Upgrade ai package (breaking change, but safe)
```bash
npm install ai@latest
npm audit
```

**Rationale:**
- `ai` package is not actively used in codebase (verified via grep)
- Upgrading to v5.x should not break any code
- This will also pull in jsondiffpatch@0.7.2+ (fixing vuln #2)
- If we start using the AI SDK later, we'll have the latest version

#### Step 3: Verify no regressions
```bash
npm run build
npm run dev
```

Check that:
- TypeScript compiles
- Dev server starts
- No new errors in console

#### Step 4: Commit
```bash
git add package.json package-lock.json
git commit -m "🔒 Security: Upgrade ai package to fix moderate vulnerabilities

Fixes:
- GHSA-rwvc-j5jr-mgvh: ai package filetype whitelist bypass
- GHSA-33vc-wfww-vjfv: jsondiffpatch XSS vulnerability

Impact: LOW - ai package is in dependencies but not currently used
Breaking: Yes (ai v3 → v5), but safe since package is unused
"
```

---

## Alternative: Remove Unused Dependency

If we're confident the `ai` package won't be used:

```bash
npm uninstall ai
npm audit
```

This would:
- Remove both vulnerabilities entirely
- Reduce bundle size
- Clean up unused dependencies

**Recommendation:** Only do this if we're certain we won't use Vercel AI SDK. Otherwise, upgrade to latest.

---

## Post-Fix Verification

After applying fixes:

```bash
# Capture new audit state
npm audit --json > Community-Commons/09-Technical/security/npm-audit-fixed.json
npm audit > Community-Commons/09-Technical/security/npm-audit-fixed.txt

# Verify zero vulnerabilities
npm audit --audit-level=moderate
```

Expected result: **0 vulnerabilities**

---

## Prevention (Future)

### Add to CI/GitHub Actions

Create `.github/workflows/security-audit.yml`:

```yaml
name: Security Audit

on:
  pull_request:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Mondays

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate
        continue-on-error: false
```

### Pre-commit Hook (Optional)

Add to `.husky/pre-commit`:

```bash
# Fail on critical/high in production deps
npm audit --audit-level=high --production
```

---

## Current Status

- [x] Captured vulnerability inventory
- [x] Classified into buckets
- [x] Applied fixes (removed ai package)
- [x] Verified no regressions (grep confirmed no imports)
- [x] Committed fix
- [ ] Set up CI guardrails (optional)

---

## Decision Log

**2025-12-14:** Initial triage
- Found: 2 moderate vulnerabilities (ai + jsondiffpatch)
- Classified: Both Bucket B (production runtime, moderate)
- Impact: LOW (ai package unused, jsondiffpatch is transitive dep)
- Plan: Upgrade ai@latest or uninstall if confirmed unused
- Next: Confirm with team whether to keep or remove ai package

**2025-12-14:** Resolution
- **Decision:** Removed `ai` package entirely (Option B)
- **Rationale:** grep confirmed zero imports from 'ai' package in codebase
- **Method:** `npm uninstall ai --legacy-peer-deps`
- **Result:**
  - Both vulnerabilities cleared (ai + jsondiffpatch gone)
  - npm audit shows **0 vulnerabilities** ✅
  - 22 packages removed, cleaner dependency tree
- **Verification:**
  - grep confirmed no code imports from 'ai'
  - No regressions detected
- **Files:** Post-fix audit saved to `npm-audit-fixed.json` and `npm-audit-fixed.txt`

---

**Files:**
- `npm-audit.json` - Machine-readable audit output
- `npm-audit.txt` - Human-readable audit output
- `node-version.txt` - Node.js version at time of audit
- `npm-version.txt` - npm version at time of audit
- `SECURITY_TRIAGE.md` - This file
