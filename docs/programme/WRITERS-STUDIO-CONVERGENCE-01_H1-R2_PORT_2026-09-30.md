# WRITERS-STUDIO-CONVERGENCE-01 · H1-R2 — multi-manuscript explicit choice, ported onto the canonical H1 lineage

```text
Class: B (bounded behavioural port; navigation only)
Governing authority: founder ruling 2026-09-30 — "port 1534 · port its behavioral law, not its branch ancestry";
                     canonical H1 lineage = HOUSE-STUDIO-CIRCULATION-01R1 (#1536)
Current gate: VERIFY PASS → founder merge review
Evidence subject: canonical clean-main-no-secrets f5cd0211 (merge of #1536); authored on #1536 head ccb3d04b, held until #1536 merged, then replayed
Stop boundary: no second House → Studio intake · no houseArrival.ts · no `house` in the crossing
               registry · no storage · no MAIA input · no merge · no deploy
```

## Ruling carried

- **#1536 is the canonical H1 lineage.** #1533 (H1-R1, `claude/vigilant-edison-x0oxbf`) and
  `claude/beautiful-mayer-mt9jc9` (HOUSE-STUDIO-CONTINUITY-01) are preserved as evidence and design
  history; neither becomes canonical code. #1533 is closed as superseded.
- ⭐ *The House is a threshold origin, not a place in the crossing registry. H1 carries House
  provenance without widening that registry.* D-01 as built in #1533 is superseded by this ruling.
- #1534's **behaviour** is ported; its ancestry (beautiful-mayer) is not.

## What was ported

`homeState.ts`, `HomeView.tsx` and `P4R1HomeView.tsx` were byte-identical at `clean-main-no-secrets`,
at #1536 and at #1534's parent, so #1534's changes to them carry over as content with no other lane's
code. The Home controller was re-authored against #1536's version.

| Law | Where |
|---|---|
| A Work with 2+ manuscripts has no implicit manuscript identity (`manuscriptIdOf` → null) | `homeState.ts` |
| All declared manuscripts, de-duplicated, in declaration order (`manuscriptIdsOf`, `manuscriptsForWork`) | `homeState.ts` |
| Continuability considers every manuscript; latest activity orders Works only, never selects a manuscript | `homeState.arrivalFor` |
| Home cards, shelf and Continue hero offer a chooser for 2+ manuscripts; removal is not offered a single-manuscript delete target | `HomeView.tsx`, `P4R1HomeView.tsx` |
| ⭐ **Ordinary Studio entry** (mode bar, no Work carried): one manuscript opens; several are the member's choice, scoped to the Continue Work when known; ⛔ never `manuscripts[0]` | new pure `modeEntryTarget` + `P4R1HomeController` |

House arrival is untouched: #1536's `situatedWork.ts` / `P4R1WorkArrival` govern it, and the ported
code does not route House arrival through `modeEntryTarget`.

## Verification

- Lethality first: `app/writers-studio/__tests__/multiManuscriptChoice.test.ts` — 6 laws (MM-L1…L6)
  × 6 defeat candidates (first-pick identity · raw expression count · recency-ordered choices ·
  first-manuscript eligibility · mode-bar recency fallback · unscoped choices) + a controller guard.
  **RED against #1536 before the port; 16/16 after**, including a cross-path law: for the same
  Work, House arrival (`resolveStudioArrival`) and ordinary entry (`modeEntryTarget`) offer the
  same manuscripts in the same order with none preselected (a reordered chooser fails it).
  Every law kills at least one candidate.
- Mutation proof, 4/4 caught: first-pick restored · mode-entry recency fallback · choices unscoped ·
  controller `manuscripts[0]` fallback reintroduced.
- Jest `app/writers-studio` + `lib/house` + `components/house` on `f5cd0211`: **93/93 suites · 972/972 tests.**
- `npm run typecheck`: **0 regressions** (222 vs baseline 239; Prisma client generated).
- `check:design-canon` ✅.
- Forbidden-import scan: no `houseArrival`, no `workIntake`, no `THRESHOLD_ORIGINS` anywhere.

## Automated walk — against the founder's merge boundary

Disposable shadow (production baseline + all migrations), real `next dev` at the PR head, Chromium.
Fixtures are adversarial: one Work with three manuscripts whose **recency order is the reverse of
declaration order**, plus a newer **decoy** manuscript outside the Work; a second member with a
single-manuscript Work.

⭐ **The first run went 5/8 and caught a real defect in this PR**: the mode-bar chooser listed the
Work's manuscripts newest-first. `P4R1HomeView` (ported from #1534) rendered it with
`props.manuscripts.filter(m => ids.includes(m.id))`, which keeps the held list's recency order and
discards the declaration order `modeEntryTarget` gave. The unit laws passed because they tested
`modeEntryTarget`, not the view. Repaired with `manuscriptsInOrder()` + law MM-L7 + defeat candidate
DM-7 (the filter shape) + a view guard that fails on the old view.

**After the repair: 8/8 PASS**
- C1: Home shows a chooser for the 2+ manuscript Work, in declared order.
- C2: nothing is preselected (no `m`, no pressed or checked choice, no direct "Return to this work").
- C3: the order matches House arrival, with nothing checked there either.
- C4 ×3: Write, Develop and Review from the mode bar each ask, scoped to the Work, and the decoy is absent.
- C4b: choosing opens exactly that manuscript.
- C5: a single-manuscript Work opens directly.

Jest studio + house: 93/93 suites · 975 tests. Typecheck 0 regressions.

## Audit of the superseded branches

| Law in a superseded branch | Represented in #1536? |
|---|---|
| beautiful-mayer HSC-F7 — carried context holds only while the manuscript↔Work relationship validates | ✅ `situatedWork` L5 `withdrawn-declaration-does-not-survive`, with a stored-visit defeat candidate |
| #1533 HS-F2/F8 — a foreign Work id is refused and discloses nothing | ✅ `studioArrival` A4 + DA4 |
| #1533 HS-F4 — no writing → nothing created until the member asks | ✅ `studioArrival` A3 |
| #1533 WS2-03B amendment — an explicit choice only settles ambiguity among Works that declare the manuscript | ✅ `resolveSituatedWorkContext` (validation *is* membership in `declaring`) |
| #1533 threshold origin in the registry | ⛔ superseded by ruling — deliberately not represented |
| ⚠️ **#1533 HG-8 — a room's Home never inherits the carried Work** | ❌ **not represented.** None of #1536's three rooms drops `work` on a switch to Home, so after a House arrival, *Home* from the writing room re-shows the arrival panel instead of Studio Home. Not a lockout (the panel does not auto-open), but Home does not reach Home in one step. **Routed to #1536's lane, not fixed here.** |

⛔ No merge · no deploy · production untouched.
