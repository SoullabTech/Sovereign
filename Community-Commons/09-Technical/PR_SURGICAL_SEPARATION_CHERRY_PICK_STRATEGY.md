# PR Surgical Separation: Cherry-Pick Strategy for Stale Branches

**Status**: Complete ✅
**Date**: 2025-01-23
**Context**: Holoflower Bardic Memory migration PR organization

---

## The Problem

**Original PR #4**: 100+ files, 82 commits shown in GitHub diff
**Reality**: Only 19 files actually changed for Holoflower feature
**Root Cause**: Branch created before Phase 4.2C-4.7 work merged to main

### Symptoms

```bash
gh pr view 4 --json files --jq '.files | length'
# 100+

git log --oneline clean-main-no-secrets..feature/holoflower-bardic-memory | wc -l
# 82 commits
```

**Why this happened**: GitHub shows the full diff between the PR branch and the current base. If the branch diverged before major work landed on main, GitHub includes ALL those changes in the diff—even if they're already on main.

### Additional Issues Discovered

- **PR #7 (Crystallization)**: Contained 2 unrelated files (dashboard/maia pages) due to stash scope creep
- **PR #8 (Bardic API)**: Accidentally included partial chat route changes from incomplete stash application
- **File conflict**: Both PR #7 and PR #8 modified `app/api/between/chat/route.ts`

---

## The Diagnosis

### Two Options Considered

**Option A: Rebase**
```bash
git checkout feature/holoflower-bardic-memory
git rebase clean-main-no-secrets
```

**Result**: Immediate conflicts in 79 commits
- Backend files (INTEGRATION_GUIDE.md, rulesService.ts, traceService.ts)
- Deleted supabase migration files
- Too many conflicts to resolve cleanly

**Option B: Cherry-Pick (CHOSEN)**
```bash
git checkout -b feature/holoflower-v2 clean-main-no-secrets
git cherry-pick <commit1> <commit2> ... <commit9>
```

**Result**: Clean 19-file PR with only Holoflower changes

### Decision Criteria

Cherry-pick wins when:
- **Many conflicts** in rebase (79+ commits to replay)
- **Clear commit boundaries** (9 focused Holoflower commits identifiable)
- **Stale branch** (diverged months ago, history tangled)
- **Review urgency** (need clean PR now, not after resolving 79 conflicts)

Rebase wins when:
- **Few conflicts** (< 10 commits to replay)
- **Recent branch** (diverged days ago)
- **Linear history desired** (want to preserve exact commit sequence)

---

## The Surgery

### Step 1: Identify Holoflower Commits

```bash
git log --oneline clean-main-no-secrets..feature/holoflower-bardic-memory \
  | grep -E "(holoflower|bardic|episode|soul pattern|journal|typecheck|crystallization field)"
```

**Found 9 commits**:
1. `dc9dd3029` - Initial migration (9 files, 2258+ insertions)
2. `166df576c` - Type alignment (3 files)
3. `b98b958bf` - Episode capture fix (4 files)
4. `953b53c2f` - Legacy post-capture gating (1 file)
5. `b4d9f7f60` - Deploy wiring (1 file)
6. `e19a369fc` - Integration artifacts (3 files)
7. `873ba863e` - Activation checklist (1 file)
8. `4f31d10b7` - Typecheck config (1 file)
9. `6a4fdc56d` - Crystallization field fix (1 file)

### Step 2: Create Clean Branch

```bash
git checkout -b feature/holoflower-v2 clean-main-no-secrets
```

### Step 3: Cherry-Pick Commits in Sequence

```bash
git cherry-pick dc9dd3029
git cherry-pick 166df576c
git cherry-pick b98b958bf
# ... (conflict in .gitignore - resolved)
git cherry-pick 953b53c2f
git cherry-pick b4d9f7f60
# ... (conflict in .env.example - deleted file, resolved)
git cherry-pick e19a369fc
git cherry-pick 873ba863e
git cherry-pick 4f31d10b7
git cherry-pick 6a4fdc56d
```

### Step 4: Resolve Conflicts

**Conflict 1: .gitignore** (commit b98b958bf)
- **Issue**: Deployment docs added to ignore list, but tsconfig.typecheck.json needed to be tracked
- **Resolution**: Kept deployment docs ignore section, removed tsconfig.typecheck.json from ignore list
```bash
git add .gitignore
git cherry-pick --continue
```

**Conflict 2: .env.example** (commit b4d9f7f60)
- **Issue**: File deleted in HEAD but modified in commit
- **Resolution**: File not needed for Holoflower-only PR
```bash
git rm .env.example
git cherry-pick --continue
```

### Step 5: Remove Unrelated Files

```bash
# Found 2 unrelated files that snuck in during cherry-pick
git checkout clean-main-no-secrets -- app/consciousness/dashboard/page.tsx app/maia/page.tsx
git add app/consciousness/dashboard/page.tsx app/maia/page.tsx
git commit -m "chore(pr): remove unrelated dashboard/maia files from Holoflower PR"
```

### Step 6: Push and Create New PR

```bash
git push -u origin feature/holoflower-v2
gh pr create --base clean-main-no-secrets \
  --title "feat(bardic): Complete Holoflower Bardic Memory PostgreSQL migration" \
  --body "[See full PR body in PR #9]"
```

**Result**: PR #9 with 19 files (down from 100+)

### Step 7: Close Old PR with Breadcrumb

```bash
gh pr close 4 -c "Closing in favor of clean cherry-picked PR #9 (19 files, 9 commits) created from updated base branch. This PR showed 100+ files because the branch was created before Phase 4.2C-4.7 work merged to main."
```

---

## The Cleanup: Fixing PR #7 and PR #8

### PR #7: Scope Creep Removal

**Issue**: Stash application included unrelated dashboard/maia page changes

```bash
git checkout feature/crystallization-detection
git diff --name-only clean-main-no-secrets
# app/api/between/chat/route.ts ✅
# app/consciousness/dashboard/page.tsx ❌
# app/maia/page.tsx ❌

# Fix
git checkout clean-main-no-secrets -- app/consciousness/dashboard/page.tsx app/maia/page.tsx
git add app/consciousness/dashboard/page.tsx app/maia/page.tsx
git commit -m "chore(pr): narrow crystallization PR to chat route only"
git push
```

**Result**: 1 file (down from 3)

### PR #8: Corruption Fix

**Issue**: Incomplete stash application left partial chat route changes

```bash
git checkout feature/bardic-api
git diff --name-only clean-main-no-secrets
# app/api/bardic/capture-episode/route.ts ✅
# app/api/between/chat/route.ts ❌

# Fix
git checkout clean-main-no-secrets -- app/api/between/chat/route.ts
git add app/api/between/chat/route.ts
git commit -m "chore(pr): remove accidental chat route changes from bardic API PR"
git push
```

**Result**: 1 file (down from 2)

---

## Stash Management Best Practices

### The Problem: Conflicting Stashes

Multiple stashes created from different feature branches can overlap:

```bash
git stash list
stash@{0}: On feature/crystallization-detection: wip: crystallization detection
stash@{1}: On feature/container-sovereign-deployment: wip: typecheck config
stash@{2}: On feature/container-sovereign-deployment: wip: supabase files
stash@{3}: On feature/container-sovereign-deployment: wip: deployment docs + scripts
stash@{4}: On feature/container-sovereign-deployment: wip: bardic api routes
```

### The Solution: Path-Scoped Stashing

**Create stashes with specific paths**:
```bash
git stash push -u -m "wip: crystallization detection" -- app/api/between/chat/route.ts
git stash push -u -m "wip: bardic api" -- app/api/bardic/
git stash push -u -m "wip: deployment docs" -- Community-Commons/09-Technical/ scripts/deploy*.sh
```

**Benefits**:
- No file overlap between stashes
- Clear separation of concerns
- Safe to apply/pop in any order
- Easy to verify content with `git stash show -p stash@{N}`

### Safe Application Strategy

**Use `apply` instead of `pop`** for safety:
```bash
git stash apply stash@{N}  # keeps stash intact
# vs
git stash pop stash@{N}    # deletes stash (risky if conflicts)
```

**Only drop stashes after PR is merged**:
```bash
# After PR merged to main
git stash drop stash@{N}
```

### Stash Cleanup After PR Organization

Dropped 7 stashes that were incorporated into PRs:
```bash
git stash drop stash@{0}  # temporary rebase stash
git stash drop stash@{0}  # temporary switch stash
git stash drop stash@{0}  # crystallization (in PR #7)
git stash drop stash@{0}  # typecheck config (in PR #9)
git stash drop stash@{1}  # deployment docs (in PR #6)
git stash drop stash@{1}  # bardic api (in PR #8)
git stash drop stash@{1}  # duplicate crystallization
```

Kept:
- `stash@{0}`: supabase files (needs security scan first)
- Older phase work stashes (still potentially useful)

---

## Final PR Stack

### Before Surgery
- **PR #4**: 100+ files, 82 commits (CLOSED)
- **PR #7**: 3 files (scope creep)
- **PR #8**: 2 files (corruption)

### After Surgery
- **PR #9** (NEW): 19 files - Holoflower core ✅
- **PR #8**: 1 file - Bardic capture-episode endpoint ✅
- **PR #7**: 1 file - Crystallization detection ✅
- **PR #6**: 3 files - Deployment docs ✅
- **PR #5**: 6 files - Container-sovereign stack ✅

### Verification

```bash
gh pr view 5 --json files --jq '.files | length'  # 6
gh pr view 6 --json files --jq '.files | length'  # 3
gh pr view 7 --json files --jq '.files | length'  # 1
gh pr view 8 --json files --jq '.files | length'  # 1
gh pr view 9 --json files --jq '.files | length'  # 19
```

**Total**: 30 files across 5 focused PRs (vs 100+ in 1 bloated PR)

---

## Recommended Merge Order

### 1. PR #9 (Holoflower Foundation)
**Why first**: Provides migrations, types, services, integration layer

**Pre-merge checklist**:
```bash
npm run typecheck
tsx scripts/test-holoflower-database.ts
tsx scripts/test-holoflower-integration.ts
```

### 2. PR #8 (Bardic Capture Endpoint)
**Why second**: Depends on Holoflower episode tables/services from PR #9

### 3. PR #7 (Crystallization Detection)
**Why third**: Additive metadata feature, safest once capture plumbing exists

### 4. PR #5 + PR #6 (Deployment)
**Why last**: Independent infrastructure changes, can merge anytime after app features

---

## Key Takeaways

### When to Use Cherry-Pick

✅ **Good fit**:
- Stale branch (diverged months ago)
- Clear commit boundaries (identifiable feature commits)
- Many rebase conflicts (50+ commits to replay)
- Review urgency (need clean PR now)

❌ **Poor fit**:
- Recent branch (diverged days ago)
- Tangled commits (feature changes spread across many commits)
- Few conflicts (< 10 commits)
- History preservation critical

### Git Workflow Patterns

**Pattern 1: Stash-First Separation**
```bash
# On feature branch with mixed changes
git stash push -u -m "feature A" -- path/to/featureA
git stash push -u -m "feature B" -- path/to/featureB
git checkout -b feature-a-pr clean-main-no-secrets
git stash apply stash@{1}
```

**Pattern 2: Cherry-Pick Surgical Extraction**
```bash
# From stale branch with 100+ file diff
git log --oneline base..stale-branch | grep "feature commits"
git checkout -b feature-clean base
git cherry-pick <commit1> <commit2> ...
```

**Pattern 3: File-Level PR Cleanup**
```bash
# Remove unrelated files from PR
git checkout base-branch -- unrelated/file1 unrelated/file2
git add unrelated/
git commit -m "chore(pr): remove unrelated files"
```

### .gitignore Conflicts

**Problem**: Multiple PRs modifying .gitignore causes merge conflicts

**Solutions**:
1. **First PR wins**: Let first PR set .gitignore, others rebase on it
2. **Separate .gitignore PR**: Create one PR for all .gitignore changes
3. **Stacked PRs**: Change PR base to depend on previous PR
   ```bash
   gh pr edit 7 --base feature/holoflower-v2
   ```

### Pre-Commit Hook Integration

All changes passed sovereignty checks:
```bash
🔒 Sovereignty pre-commit check...
✅ No Supabase detected.
✅ Sovereignty check passed
```

**Key**: Pre-commit hooks enforce sovereignty even during cherry-pick/cleanup operations

---

## Tools and Commands Reference

### Diagnosis
```bash
# Check PR file count
gh pr view N --json files --jq '.files | length'

# Check commit history
git log --oneline base..branch

# Find specific commits
git log --oneline base..branch | grep "pattern"

# Preview stash content
git stash show -p stash@{N} | head -40
```

### Surgery
```bash
# Cherry-pick sequence
git checkout -b new-branch base
git cherry-pick <commit1> <commit2> ...

# Resolve cherry-pick conflict
git add resolved-file
git cherry-pick --continue

# Abort if things go wrong
git cherry-pick --abort
```

### Cleanup
```bash
# Remove unrelated files
git checkout base -- unwanted-file
git add unwanted-file
git commit -m "chore(pr): remove unrelated file"

# Drop safe stashes
git stash drop stash@{N}
```

### Verification
```bash
# Check clean state
git status --short

# Verify file count
git diff --name-only base | wc -l

# Check sovereignty
npm run check:no-supabase
```

---

## Success Metrics

### Before
- 1 PR with 100+ files (unreviewable)
- 2 PRs with scope creep/corruption
- 7 stashes with overlapping changes
- Merge conflicts guaranteed

### After
- 5 focused PRs (1, 1, 3, 6, 19 files)
- All PRs single-purpose
- Clean stash list
- No merge conflicts

### Time Investment
- **Surgery**: ~45 minutes (cherry-pick + cleanup)
- **Alternative** (rebase + resolve 79 conflicts): 3-4 hours estimated
- **Review time saved**: Hours → minutes per PR

---

## References

- **PR #4** (closed): Original 100+ file Holoflower PR
- **PR #9**: Clean 19-file Holoflower PR (cherry-picked)
- **PR #7**: Crystallization detection (cleaned)
- **PR #8**: Bardic capture endpoint (cleaned)
- **Commits**: 9 Holoflower commits (dc9dd3029 → 6a4fdc56d)

**Related Documentation**:
- Phase 4.2C Audit Whitepaper (git history management)
- Sovereignty Enforcement Guide (pre-commit hooks)
- Holoflower Integration Complete (feature architecture)
