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

---

## 10 · Founder rulings (2026-09-30) and the reconciliation they authorized

**Rulings.** (1) `956ed92a` is excluded; AIN vault comes through its own governed lane.
(2) Canon's door behaviour and labels stand (whole-card link, "Enter …"); the lane's shorter
supporting copy is used where it stays intelligible. (3) `app/dev/living-field-*` witness pages
stay out of canon by default. **Precedence:** canonical cross-system law wins; Living Field
design and semantics win inside the field unless they violate that law. **Stop:** if
`lib/sovereign/**` or `lib/maia/**` changes, stop rather than absorb.

**Replay.** `git cherry-pick -x 956ed92a..024c6c69` onto `04005ca7c`: 47 commits, conflict only
at `60916e56` (3 files). The Living Field tree then equalled the lane tip except in those
3 files and in canon's `livingFieldClarity.test.ts`, which the lane never had.

**Reconciliation commits (on top of the replay):**

| Commit | What | Why |
|---|---|---|
| `7f3fd02a` | remove 4 `app/dev/living-field-*` pages + 10 `scripts/witness/grokker-*` | ruling 3; the scripts only drive those pages; both preserved at `024c6c69` |
| `68211fea` | restore canon wording on 18 lines | precedence rule, see below |
| `79fd4292` | two first-conflict hunks back to canon | canon's clarity test pins them as navigation law; my first resolution chose the lane side and was wrong |
| `203a2e68` | illumination test asserts `contextPath` | lane defect: failed identically at `024c6c69`; R2D3 renamed `lineage` and left the test behind |

**`68211fea`: the lines that merged without conflict but crossed law.** The lane removed MAIA's
name and authorship across the field. Git would have absorbed that silently. Restored to canon, narrowly:
- *provenance*: "MAIA candidate" / "you confirmed" / "you authored"; "MAIA candidate, accepted" /
  "Written by you"; "You carried this path";
- *recipient disclosure on acts that send content to MAIA*: "What MAIA will receive",
  "Refine with MAIA", "Talk with MAIA about this";
- *non-claim disclaimers* on the constellation and facet-flow lines;
- *truthful failure*: constellation unavailable/partial; encounter errors name the failure
  instead of calling it a pause.

Lane voice is kept everywhere else. This is my application of the precedence rule, not a
ruling. It is one commit and reverts cleanly.

**Gates on the final head.**
- Living Field suites (`components/maia/living-field`, `…/living-constellation`): **16/16 pass**.
- `lib/maia/living-field/__tests__/livingFieldScopeContainment.test.ts` (LF-SCOPE-01): **6 fail,
  identically on canon `04005ca7c`**. They test `app/api/maia/living-field/route.ts`, which this
  port does not touch. ⛔ Pre-existing, not absorbed, not repaired here.
- `npm run typecheck`: **✅ no regressions, 222 errors vs baseline 239.** Run on the replay +
  `7f3fd02a` + `68211fea`. The two later commits change two string literals and one test file.
  Needed `prisma generate`, which `npm ci --ignore-scripts` skips.
- `check:no-supabase`: ✅.
- Protected-path audit, `04005ca7c..HEAD`: **0 files under `lib/sovereign/**` or `lib/maia/**`;
  0 package files.**

## 11 · Findings carried forward (not decided here)

1. **What production mounts is R1R3, not R2E2.** `/maia/living-field` renders
   `LivingFieldInstrument` (d3 circle-pack geometry). All R2 work under `physics/` (shell,
   membranes, illumination, condensation) was reachable only from the removed dev pages, so in
   canon it is **present but unmounted**. The last founder witness (R2E2) was of a surface
   members cannot reach. Mounting it is a separate founder act.
2. **Undeclared dependencies.** `LivingFieldInstrument` imports `d3-hierarchy` and
   `d3-interpolate`, which resolve only through `d3`. `physics/` imports `cytoscape` and
   `cytoscape-fcose`, present only as **dev** dependencies through `mermaid`. Safe while `physics/`
   stays unmounted. Mounting it without declaring them risks a production build that lacks them.
3. **LF-SCOPE-01 is red on canon** (6 tests), which is outside this lane.
4. `956ed92a` (AIN vault) remains unmerged and unreviewed in its own lane.

⛔ Merge and deploy remain unauthorized. Next: founder rendered walk from
`/maia/living-field?from=house`, then a merge ruling.

---

## 12 · Founder rulings (2026-09-30, second) and the admission evidence

**Rulings.** Keep `68211fea` separate and visible. Operative law: *Living Field may change the
voice of an experience, but it may not erase the agent, provenance, consent boundary, or
truth-status of the experience.* LF-SCOPE-01 is **inherited debt**, not cleaned up here. R2 is
**not mounted** by this reconciliation; the next lane is `LIVING-FIELD-R2-MOUNT-01`, which starts
from this reconciled canonical tree. `d3-hierarchy`, `d3-interpolate`, `cytoscape` and
`cytoscape-fcose` must be **declared explicitly before any R2 surface becomes
production-reachable**.

### 12.1 · Typecheck: final head vs canonical control

Both trees were run with `node scripts/check-typehealth-baseline.js --json` after
`prisma generate`, using the same `node_modules`.

| | final head `b587fad0` | canon `04005ca7c` |
|---|---|---|
| gate | ✅ ok | ✅ ok |
| current errors | 222 | 222 |
| introduced / increased | 0 / 0 | 0 / 0 |
| fixed vs baseline 239 | 15 identities | 15 identities (same) |
| program files gained vs baseline | 671 | 652 |

`currentErrors`, `introduced`, `increased`, `fixed`, `decreased`, `coverageLost` and
`coverageDeleted` are **byte-identical** between the two runs. The 19 extra files are all Living
Field (`LivingFieldInstrument.tsx`, `livingFieldHierarchy.ts`, `physics/**`), and they enter the
program with **zero diagnostics**. **Zero new diagnostics.**

### 12.2 · Rendered walk: fixture walk of the mounted R1R3 surface

**Method.** Real `next dev` on this tree and the real `/maia/living-field?from=house` page,
driven with Playwright and Chromium. There is no database in this container, so every `/api/**` call was answered from typed
fixtures. The page loaded via the proxy's existing Capacitor client-side-auth path
(`x-capacitor-app: true` + `localStorage.memberId`). Four passes: happy path (mixed
member / MAIA-candidate / member-confirmed authorship), failures (constellation, facet flows,
dimension open), encounter failure, partial projection. **0 page errors in all four passes.**
Evidence: `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/` (screenshots,
`results.json`, the script). **Fixture data only; no member content.**

⛔ **What this walk is not:** it is not a walk on real member data, and it is not the founder's
witness. It shows how the mounted surface renders controlled states. It proves nothing about
real data, real MAIA greetings, or real latency.

⛔ **This is an R1R3 admission walk.** The R2 code in canon was not rendered and is not admitted
as member experience.

| # | Criterion | Observed | Standing |
|---|---|---|---|
| 1 | Threshold continuity | `HOME · LIVING FIELD` threshold bar with Return Home; the R1 instrument ("Every journey begins with a doorway.") opens the room; the Wider field follows with Enter doors | ✅ continuity. ⚠️ two home affordances (threshold "Return Home →" and page "← Home") |
| 2 | MAIA boundaries | member: "you authored", "Written by you", "You carried this path"; MAIA: "MAIA candidate", "MAIA candidate, accepted"; transfer: "WHAT MAIA WILL RECEIVE" + "MAIA receives only the evidence shown here", "Refine with MAIA", "Talk with MAIA about this" | ✅ all three classes are distinct. ⚠️ the lens send button itself reads "Follow this lens →" (lane), framed by two MAIA-naming lines on the same panel |
| 3 | Non-claim language | both disclaimers render as a quiet 10px footnote under their panel | ✅ honest, not dominant. ⚠️ low contrast (`stone-700` on near-black), possibly below WCAG. Recorded, not changed |
| 4 | Failure surfaces | constellation: "Your wider field is unavailable right now. Nothing has been changed." · dimension open: "Couldn't open this dimension just now. Try again." · encounter: "Could not open this encounter. Try again." · partial: "…what is shown is partial." | ✅ for these four |
| 4a | | **facet-flow failure: "These paths are quiet for now. The journey remains gently held."** | ❌ **failure softened into ambiguity.** It reads as an empty state, not an error. Canon's version ("…quiet right now. Nothing has been changed.") also called it "quiet" |
| 4b | | **refine returned no draft: "A fresh draft can be invited again in a moment, or this space can be written directly."** | ⚠️ does not say MAIA's draft failed; it predicts availability ("in a moment") that the UI cannot know |
| 5 | What members see | R1R3 (`LivingFieldInstrument`) + existing dashboard; no `physics/` component rendered | ✅ as ruled |

**Canonical MAIA-boundary observation (outside this lane, not introduced by it).** Opening a
dimension **immediately opens a MAIA encounter** (`POST …/encounter {action:'open'}`, and a MAIA
greeting). That is canon since `29e038c7` (2026-09-22, J0R3): *"Conversation-first: opening a
dimension lands the member IN the encounter."* No member content is sent. But a click labelled
"Open dimension →" starts a MAIA conversation without the member choosing MAIA. Carried
forward for its own ruling; not changed here.

### 12.3 · Admission boundary: standing

| Condition | Standing |
|---|---|
| final-head typecheck, zero regressions vs canonical control | ✅ |
| Living Field tests 16/16 | ✅ |
| protected paths (`lib/sovereign/**`, `lib/maia/**`) untouched · no-Supabase | ✅ · ✅ |
| rendered R1R3 walk preserves the restored agency/provenance language | ✅ |
| failure truthfulness (walk criterion 4) | ❌ 4a · ⚠️ 4b, both need a founder ruling |

Proposed merge record: *Admits the reconciled Living Field corpus through R2E2 into canonical
custody, while retaining R1R3 as the member-facing mounted surface. R2 member presentation is not
admitted by this merge and requires a separate mounting lane (`LIVING-FIELD-R2-MOUNT-01`).*

⛔ Merge and deploy are still not performed.

---

## 13 · Failure-state truthfulness reconciliation and re-witness

**Ruling (founder, 2026-09-30).** Fix both misleading failure messages in this lane before merge,
as a separate commit labelled truthfulness, not design. Operative law: *when something fails,
the interface says that it failed, and it does not translate failure into atmosphere or promise
that the condition is temporary.* Merge boundary: **admit only after the two messages are made
explicit and re-witnessed.**

**Commit `6326abbc`**, `fix(living-field): name failure states as failure (truthfulness reconciliation)`:

| Surface | Before (lane) | After |
|---|---|---|
| facet flows failed to load | "These paths are quiet for now. The journey remains gently held." | "Threads failed to load. Nothing has been changed. You can try again." |
| MAIA refine returned no draft / 500 | "A fresh draft can be invited again in a moment, or this space can be written directly." | "MAIA's draft did not return. Nothing has been changed. You can try again." |

"Nothing has been changed" was checked on the refine path and is true: the route header says
*"MAIA proposes a candidate expression. Never auto-saved."*, and it contains no write.

**Three additions in the same commit, beyond the two named messages, flagged for review.** Each
is in the same function or component and falls under the same law:
1. **Refine decline is not a failure.** When nothing has gathered, the route returns `200` with
   `candidate_expression: null` and its own `rationale`. The new failure message alone would
   have mislabelled a correct decline as a failure. The UI now shows the route's reason.
2. **Refine network exception.** `refine()` had `try/finally` with no `catch`, so a thrown fetch
   showed the member **nothing**. It now shows the failure message.
3. **Lens-evidence failure.** "This thread can be revisited when its source and destination are
   ready." became "This thread's evidence failed to load. **Nothing has been sent.** You can
   try again." The clause restores canon's transfer assurance that nothing reached MAIA, which
   the lane had dropped.

**Re-witness (same fixture harness, `walk-rewalk.mjs`; 8 passes, 0 page errors in all):**

| Pass | Rendered |
|---|---|
| constellation failure | Your wider field is unavailable right now. Nothing has been changed. |
| facet flows failure | **Threads failed to load. Nothing has been changed. You can try again.** |
| dimension open failure | Couldn't open this dimension just now. Try again. |
| encounter failure | Could not open this encounter. Try again. |
| partial projection | Some parts of your field are temporarily unavailable; what is shown is partial. |
| lens evidence failure | **This thread's evidence failed to load. Nothing has been sent. You can try again.** |
| refine: 200, no draft | **MAIA's draft did not return. Nothing has been changed. You can try again.** |
| refine: 500 | **MAIA's draft did not return. Nothing has been changed. You can try again.** |
| refine: network abort | **MAIA's draft did not return. Nothing has been changed. You can try again.** |
| refine: deliberate decline | Not enough has gathered in this field yet to draft from. You can write directly, speak, or explore it with MAIA. |

⚠️ **Open for ruling, not changed:** canon's partial-view line (restored in `68211fea`) says
"**temporarily** unavailable", which is the same kind of promise this ruling excludes.

**Gates on head `6326abbc`:**
- Living Field suites: **16/16 pass**.
- Typecheck vs canon control `04005ca7c`: `currentErrors` (222), `introduced` (0), `increased` (0),
  `fixed` (15), `decreased`, `coverageLost`, `coverageDeleted` are all **identical**; zero new
  diagnostics. Coverage 673 vs the earlier 671: the +2 are `.next/dev/types/*.d.ts`, generated by
  the running dev server. Environmental, not repository files, zero diagnostics.
- Protected paths and no-Supabase: unchanged. The commit touches only two
  `components/maia/living-field/*.tsx` files.
- **R2 mount boundary unchanged**: no `physics/` component is mounted, and no dependency declared.

## 14 · Separate question (not this lane): dimension open starts a MAIA encounter

Canon since `29e038c7` (2026-09-22, J0R3): clicking **"Open dimension →"** mounts
`LivingEncounterView`, which immediately `POST`s `…/encounter {action:'open'}`. MAIA greets the
member. No member content is sent, but the member never explicitly chose MAIA. This may be
legitimate ("conversation-first" was a deliberate canon choice). It is a
**consent/interaction question**, not a reconciliation defect, and **deserves its own ruling**.
Not changed here.

## 15 · Standing

**Ready for merge consideration.** The merge boundary in §12.3 and §13 is met: typecheck zero
regressions against canonical control · Living Field 16/16 · protected paths + no-Supabase
clean · agency/provenance language re-witnessed · both misleading failure messages made
explicit and re-witnessed. Proposed merge record unchanged (§12.3). ⛔ Merge and deploy remain
founder acts.

---

## 16 · Partial-view duration claim removed (founder ruling) and final re-witness

**Commit `92b3ecaa`**: "Some parts of your field are **temporarily** unavailable; what is shown
is partial." → "Some parts of your field are unavailable; what is shown is partial." States only
what is known. Founder ruling: the extra scope in `6326abbc` stands, because it is the same
defect class, not feature creep.

**Gates on `92b3ecaa`:** Living Field 16/16 · typecheck vs canon `04005ca7c`: every diagnostic
field **identical** (222 · 0 introduced · 0 increased · 15 fixed); coverage 671, all 19 extra files
Living Field (dev-server `.next/dev/types` cleared first) · failure re-walk
(`results-rewalk-2.json`): 8 passes, 0 page errors, every failure message as intended, partial
view reads the new line.

**Out of the PR's scope, by ruling:** mounting R2 · declaring `d3-hierarchy`/`d3-interpolate`/
`cytoscape`/`cytoscape-fcose` · the open-dimension → MAIA-encounter behaviour (§14; its own
consent/interaction lane) · any consent redesign around it.

**Admission boundary (verbatim for the merge record):** *Admit the reconciled Living Field corpus
through R2E2 into canonical custody. R1R3 remains the mounted member-facing surface. R2
presentation is not admitted and requires `LIVING-FIELD-R2-MOUNT-01`.* ⛔ No deploy until the
PR is reviewed and merged.
