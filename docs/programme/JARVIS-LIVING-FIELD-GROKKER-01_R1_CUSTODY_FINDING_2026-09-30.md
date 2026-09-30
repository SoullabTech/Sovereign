# JARVIS-LIVING-FIELD-GROKKER-01 · R1 custody finding · 2026-09-30

```text
Class: A programme · custody record (documentary only)
Canonical base: 04005ca7c65c8cdc1420d482710a50ea0c3b8f68
Branch: claude/modest-maxwell-8vtlsn
Carries: R0 charter + roadmap (cherry-picked from a10df88041845bad8293af5208485d6f98888225)
Does NOT carry: any R1 runtime
Stop: no runtime reconstructed · no merge · no deploy
```

## 1 · What is in custody on origin

`a10df8804` exists on origin only under three backup refs, all at the same SHA:

- `chore/backup-ain-jarvis-living-field-grokker-01-r0-20260930`
- `chore/backup-ain-jarvis-living-field-grokker-01-r0-review-20260930`
- `chore/backup-ain-jarvis-living-field-grokker-01-r1-20260930`

Its parent is `7a096281a`. Its only change is the R0 charter and roadmap
(260 lines, docs only). It carries **no runtime file**: `git ls-tree -r a10df8804`
contains no `LivingFieldInstrument`.

The working branch names `feature/jarvis-living-field-grokker-01-r1-20260928` and
`feature/jarvis-living-field-grokker-01-r1-reconcile-20260930` do **not exist on origin**.

⚠️ The commit author is recorded as `proof <proof@example.invalid>`. That is recorded,
not adjudicated.

## 2 · What is not in custody

The founder-witnessed R1 slice was:

- `components/maia/living-field/LivingFieldInstrument.tsx` (new)
- `PersonalLivingFieldDashboard.tsx` (mount)
- `LivingConstellationPanel.tsx` and `LifeFacetFlowPanel.tsx` (copy refinements)

It exists only as **uncommitted working-tree state** in the Mac Studio worktree
`/Users/soullab/.claude/worktrees/ain-jarvis-living-field-grokker-01-r1`.
A branch named `…-r1-20260930` pointing at the docs-only commit may be read as
backing up R1. **It does not.**

This matters on this machine in particular: the 2026-09-23 storage relief removed
worktrees by census, and a reclaim that checks only committed/pushed state would read
this worktree as preserved while the R1 runtime inside it is not.

## 3 · Reconciliation fact that still holds

`git diff 7a096281a..04005ca7c -- app/maia/living-field components/maia/living-field
components/maia/living-constellation lib/maia/living-field` is empty (47 commits apart).
So once committed, the R1 slice should land on current canonical with no conflict on
those paths. This is verified here; it does not verify the slice itself.

## 4 · What this record does not do

- ⛔ It does not reconstruct `LivingFieldInstrument.tsx`. Rebuilding it from memory
  would produce a different artifact from the one the founder witnessed, under the
  same name.
- ⛔ It does not claim R1 is ported, tested, or merged.
- It does not open WEB, FLOW, TEXT depth, Aetheric synthesis, memory write,
  cross-facet recall, or new MAIA cognition.

## 5 · Owed, in order

1. On the Mac Studio, commit the R1 working tree in its worktree and push it to a
   named branch. This is the only step that puts the witnessed slice under custody.
2. Rebase or port that commit onto `04005ca7c` (expected clean per §3).
3. Add the bounded-instrument test: five regions, one inward level, Wider,
   session-local state, no fetch/storage/MAIA seed, additive mount.
4. Run targeted tests and `npm run typecheck` (no-regression gate).
5. Do a rendered walk from `/maia/living-field?from=house`, then the founder WORLD
   witness.

Merge and deploy stay unauthorized until step 5 is done.
