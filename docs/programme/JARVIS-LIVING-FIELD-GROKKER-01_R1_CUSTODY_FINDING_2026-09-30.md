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

---

## 6 · CORRECTION (same day) — §2 was wrong; R1 *is* committed, on a different line of branches

§2 is **superseded**. It is kept above as it was written, not edited to look as if it had always
been right. Its error: I searched for the R1 runtime only under the `…grokker-01-r1…` branch
names. The founder ran the owed step-1 commands. The worktree was **clean**, so the push only
republished the docs-only `a10df8804` as `feature/jarvis-living-field-grokker-01-r1-20260928`.

The runtime was already committed and pushed on the **visual-field** line of branches
(`feature/jarvis-visual-field-r2d1…` → `…r2d2…` → `…r2d3…` →
`feature/jarvis-visual-field-r2e2-semantic-condensation-20260930` @ `024c6c69`):

- `60916e56` (2026-09-28) adds `LivingFieldInstrument.tsx`. That is R1.
- The lane then continued through R1R1–R1R3, the physics A/B lab, cellular/metabolism work,
  and R2A → R2E2: **47 Living Field commits, ~158 files changed, ~16k insertions**, with
  `app/dev/living-field-*` witness pages and `scripts/witness/grokker-*` witnesses.

**The R1-only port this record set out to do is obsolete.** The unit that needs reconciling
is the whole visual-field line, not a single slice.

## 7 · Finding A — the Living Field line carries an unmerged MAIA-cognition commit

The line's merge-base with canon is `0c25ad6fe` (104 commits behind `04005ca7c`).
Between them sit five pre-lane commits:

| Commit | Subject | In canon? |
|---|---|---|
| `2f4ef885` | docs(maia): codify field attunement and census | yes, as `10abd343` |
| `28111f1e` | feat(maia): publish field attunement teaching | yes, as `a4fe6ce1` |
| `04211e90` | fix(library): hide article source metadata | yes, as `84eddafc` |
| `1d2f1d88` | docs(ain): audit Obsidian vault interaction | yes, as `f5ec4afa` |
| **`956ed92a`** | **feat(ain): add authenticated read-only vault context** | **NO** |

`956ed92a` changes 20 files, 1565 insertions. They include `lib/sovereign/maiaService.ts`,
`lib/sovereign/maiaVoice.ts`, `lib/maia/canonical-turn/producerRegistry.ts` + `shadow.ts`,
`lib/maia/maiaRuntimeContext.ts`, `lib/orchestration/consciousness-orchestrator.ts`,
`app/api/sovereign/app/maia/list/route.ts` (the live MAIA route) and a new
`app/api/sovereign/ain-vault` route. `lib/ain/vault/` does not exist in canon.

⛔ **Merging any visual-field branch as it stands would bring an AIN-vault cognition change into
canon through a Living Field PR.** That change carries its own witness record (`…OBSIDIAN_VAULT_02_READ_ONLY_WITNESS_2026-09-27.md`),
but it has not been merged through its own lane. It would add a
producer to the CMT-01 closed registry and change the prompt path. The Living Field charter
stops at "no additional MAIA cognition". This commit is exactly that, arriving by ancestry
rather than by an act.

Whether `956ed92a` should land at all is a separate question with a separate owner. This record
does not answer it.

## 8 · Finding B — replaying the Living Field line onto canon hits a founder copy decision at the first commit

Probe (disposable worktree, aborted, nothing pushed):
`git rebase --onto 04005ca7c 956ed92a 024c6c69`. It stops at `60916e56` with conflicts in
`LivingConstellationPanel.tsx` (4 hunks), `LivingFieldCard.tsx` (3), and
`PersonalLivingFieldDashboard.tsx` (1).

The cause is two founder-directed changes made on sibling branches that never saw each other:

- canon `7a096281` "make field rooms and dimensions legible doors" (plus `4b22c7a6`):
  the whole card is a `Link`, with longer subtitles
  ("See the patterns and dimensions gathering across your life.") and explicit
  `action` labels ("Enter Living Field").
- lane `60916e56`: short copy ("what is alive across a life"), a separate inner link,
  empty state "A place ready to take shape."

⛔ These are not merge mechanics. Choosing one is choosing which witnessed door copy stands,
so it is a founder ruling. Only the first commit was probed. Later commits may conflict further.

⚠️ §3's "no change 7a096281..04005ca7" is true and **irrelevant**. The lane's real base is
`0c25ad6fe`, and `7a096281` itself is the change the lane never saw.

## 9 · Owed, replacing §5

1. **Founder ruling, 956ed92a**: rebase it out of the Living Field line (preferred; the
   Living Field lane stays within its charter), or land it first through its own lane and review.
2. **Founder ruling, door copy**: canon's legible-door copy, the lane's copy, or a stated
   merge of the two (e.g. canon's whole-card `Link` + `action` labels with the lane's subtitles).
3. Then: rebase the Living Field commits (`60916e56..024c6c69`) onto canon, excluding the five
   pre-lane commits, and resolve every conflict against those two rulings.
4. Gates on the result: targeted living-field tests, `npm run typecheck` (no-regression),
   `check:no-supabase`, and a scan showing that no `lib/sovereign/**` or `lib/maia/**` file is
   touched.
5. Decide whether the `app/dev/living-field-*` witness pages ship to canon or stay lane-only.
6. Founder rendered walk, then a merge ruling. Merge and deploy stay unauthorized.
