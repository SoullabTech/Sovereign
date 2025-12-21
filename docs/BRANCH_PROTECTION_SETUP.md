# Branch Protection Setup

This document explains how to configure GitHub branch protection to enforce sovereignty permanently.

---

## Why Branch Protection?

Branch protection makes sovereignty enforcement **unbreakable** by:

1. **Preventing `--no-verify` bypass** - CI must pass before merge
2. **Requiring code review** - Sacred files need approval (via CODEOWNERS)
3. **Blocking force pushes** - History cannot be rewritten
4. **Enforcing linear history** - No merge chaos or conflicts

**Bottom line:** Even if someone bypasses local hooks, they cannot merge to protected branches.

---

## Recommended Protection Levels

Choose based on your workflow:

### Option A: Solo Development (Flexible)
**Use when:** You're the only developer and need to move fast

**Settings:**
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Status checks: `sovereignty-audit`
- ✅ Require conversation resolution before merging
- ❌ Require pull request reviews (allow direct push)
- ❌ Require linear history (allow merge commits)
- ✅ Allow force pushes (admin only)
- ❌ Allow deletions

**Pros:**
- Fast iteration
- CI catches violations
- Can push directly when needed

**Cons:**
- No code review requirement
- Can bypass with admin force push

### Option B: Team Development (Balanced)
**Use when:** Small team, high trust, want review on critical files

**Settings:**
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Status checks: `sovereignty-audit`
- ✅ Require pull request reviews before merging
  - Required approving reviews: 1
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (for CODEOWNERS files)
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ❌ Block force pushes
- ❌ Allow deletions

**Pros:**
- Code review on sovereignty-critical files
- CI enforced on all merges
- Clean git history

**Cons:**
- Requires PRs for all changes
- Slightly slower iteration

### Option C: Production/Open Source (Strict)
**Use when:** Multiple contributors, public repo, zero tolerance for violations

**Settings:**
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Status checks: `sovereignty-audit`
- ✅ Require pull request reviews before merging
  - Required approving reviews: 2
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners
  - ✅ Restrict who can dismiss pull request reviews
- ✅ Require conversation resolution before merging
- ✅ Require signed commits
- ✅ Require linear history
- ✅ Block force pushes (no exceptions)
- ✅ Lock branch (prevent deletion)
- ✅ Restrict who can push to matching branches
  - Only: Repository admins, CODEOWNERS

**Pros:**
- Maximum sovereignty protection
- Full audit trail
- Multiple review requirement

**Cons:**
- Slowest iteration
- Requires team coordination

---

## Setup Instructions

### Step 1: Enable GitHub Actions
1. Go to: `https://github.com/SoullabTech/Sovereign/settings/actions`
2. Under "Actions permissions":
   - ✅ Allow all actions and reusable workflows
3. Under "Workflow permissions":
   - ✅ Read and write permissions
4. Save

### Step 2: Configure Branch Protection
1. Go to: `https://github.com/SoullabTech/Sovereign/settings/branches`
2. Click "Add branch protection rule"
3. Branch name pattern: `phase4.6-reflective-agentics`
4. Configure settings based on your chosen option (A, B, or C above)
5. Click "Create" or "Save changes"

### Step 3: Enable CODEOWNERS
CODEOWNERS is already configured in `.github/CODEOWNERS`.

**To verify it works:**
1. Make a PR that modifies `lib/ai/providerRouter.ts`
2. Check that the PR requires review from `@SoullabTech`

**Protected files (require CODEOWNERS review):**
- `lib/ai/providerRouter.ts`
- `lib/sovereign/maiaService.ts`
- `.githooks/`
- `.github/workflows/sovereignty-check.yml`
- `CLAUDE.md`
- `artifacts/SOVEREIGNTY_*.md`

### Step 4: Test Protection
Create a test PR:
```bash
# Create feature branch
git checkout -b test/sovereignty-protection
echo 'const anthropic = new Anthropic({ apiKey: "test" });' > test-violation.ts
git add test-violation.ts
git commit -m "test: should be blocked by CI"
git push origin test/sovereignty-protection

# Open PR on GitHub
# Expected: CI fails, PR cannot be merged
```

### Step 5: Optional - Protect Additional Branches
Repeat Step 2 for:
- `main` (if you use it as primary)
- `phase*` (wildcard for all phase branches)

---

## Quick Setup Commands

### For Solo Development (Option A)
```bash
# No CLI commands - use GitHub UI with Option A settings
# Or use GitHub CLI:
gh api repos/SoullabTech/Sovereign/branches/phase4.6-reflective-agentics/protection \
  -X PUT \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=sovereignty-audit \
  -f enforce_admins=false \
  -f required_pull_request_reviews=null \
  -f restrictions=null
```

### For Team Development (Option B)
```bash
gh api repos/SoullabTech/Sovereign/branches/phase4.6-reflective-agentics/protection \
  -X PUT \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=sovereignty-audit \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -f required_pull_request_reviews[require_code_owner_reviews]=true \
  -f required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f enforce_admins=true \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false
```

---

## Current Status

**As of 2025-12-21:**

**Protected branches:** None (default GitHub)
**CODEOWNERS:** ✅ Configured
**CI workflow:** ✅ Configured (`.github/workflows/sovereignty-check.yml`)
**Pre-commit hooks:** ✅ Configured (`.githooks/pre-commit`)

**Next step:** Choose Option A, B, or C and configure branch protection via GitHub UI

---

## Troubleshooting

### CI failing on valid code
**Symptom:** `sovereignty-audit` fails even though code is correct

**Fix:**
1. Check `.github/workflows/sovereignty-check.yml`
2. Verify allowlist includes your file
3. Run locally: `find app/api -name "route.ts" | xargs grep "new Anthropic("`

### CODEOWNERS not triggering reviews
**Symptom:** PRs merge without review even when changing protected files

**Fix:**
1. Verify `.github/CODEOWNERS` exists
2. Check GitHub username is correct (`@SoullabTech`)
3. Enable "Require review from Code Owners" in branch protection
4. Ensure user has write access to repo

### Cannot push to protected branch
**Symptom:** `! [remote rejected] phase4.6-reflective-agentics -> phase4.6-reflective-agentics (protected branch hook declined)`

**Expected behavior** - This means protection is working!

**Fix:**
1. Create feature branch: `git checkout -b feature/my-change`
2. Push feature branch: `git push origin feature/my-change`
3. Open PR on GitHub
4. Wait for CI to pass
5. Merge via GitHub UI

---

## Recommendation

**For current solo development:** Start with **Option A** (Flexible)
- Fast iteration
- CI protection
- Can upgrade to Option B when team grows

**When to upgrade to Option B:**
- Adding external contributors
- Preparing for public release
- After Phase 5 completion

**When to upgrade to Option C:**
- Public repo launch
- Multiple maintainers
- Production deployments
