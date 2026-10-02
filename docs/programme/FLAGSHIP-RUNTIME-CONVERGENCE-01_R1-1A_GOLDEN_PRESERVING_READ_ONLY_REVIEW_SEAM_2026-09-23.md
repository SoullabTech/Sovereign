# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1A — Golden-Preserving Read-Only Review Presentation Seam

**Date**: 2026-09-23
**Act**: R1-1A (founder-authorized after R1-0 PASS)
**Base**: `981a996ce` on `fix/flagship-ec1-contract-reconciliation-20260923` · canonical `3f63ca653` (unchanged since R1-0 opened)
**Lineage**: suite + base goldens `b977ef760` → extraction `82efb60a7` → this record
**Authority**: presentation architecture only. ⛔ No live mount · no route · no reading API or R1-0 mapper change · no cognition · no persistence · no FS1 change · production untouched. ⛔ STOPPED for founder adjudication. No R1-1B authority taken.

## 0. Standing at the top

- **The accepted `ReviewRoom` is now `ReviewPresentation` + `CONTROLLED_REVIEW_CAPABILITIES`.** The seam renders only what its caller supplies; `READ_ONLY_REVIEW_CAPABILITIES` omits Ask MAIA · Discuss · Explore · every commission control · Not now · the OwnObservation editor · every navigation control. Omitted, never disabled.
- **Accepted output unchanged, proved twice**: the four Review states are byte-identical to goldens captured at the untouched base (matrix L8), and the frozen `render.tsx`, run unchanged, left all 44 captures and `witness.json` byte-identical (0 changed files).
- **Suite first**: reference 4/12 before extraction (every read-only law UNEXTRACTED; purity, byte-identity and FS1 laws already green), all ten candidates dying on their named laws. After: **12/12 · 10/10 · LETHAL + DISCRIMINATING**, no collateral.
- **FS1 57/57 intact** before and after (L9 runs the frozen verifier inside the matrix).
- ⚠️ Population note: the extraction threads optional capability props through `ReviewPanels.tsx` and `DevelopViews.tsx` as well as `DevelopReview.tsx` (StaleReading, ManuscriptContext, CoverageLine, ContinuityMap). These are flagship presentation files under the flagship contract, not FS1 blobs; every default preserves the accepted markup, which the byte-identity proofs establish. Duplicating their markup in read-only variants was the alternative and was refused as two truths.

## 1. The seam

```ts
interface ReviewCapabilities { askMaia · discuss · explore · commission · acknowledgeStale · ownObservation · navigate }
CONTROLLED_REVIEW_CAPABILITIES  all true   → accepted controlled ReviewRoom (design witness)
READ_ONLY_REVIEW_CAPABILITIES   all false  → future R1-1B host; may grant `navigate` alone when it has real addresses
ReviewPresentation({ view, lens, facet, capabilities })   pure · fetches/writes/commissions/persists nothing · no model · no identity · no Work authority
ReviewRoom({ view, lens, facet }) = ReviewPresentation + CONTROLLED
```

| Control | Capability | Read-only |
|---|---|---|
| crumb-bar Ask MAIA | `askMaia` | omitted (CrumbBar receives no action) |
| per-finding Discuss · Explore | `discuss` · `explore` | omitted; the actions row is omitted entirely when no action remains |
| Read for this → · Read again · Read this chapter again | `commission` | omitted |
| Not now | `acknowledgeStale` | omitted |
| Add your own observation · themes · Keep with this passage · Cancel | `ownObservation` | the editor is not rendered |
| Go to passage · Previous reading · Open the full manuscript · What MAIA read → · map cells | `navigate` | omitted; map cells render as presence-only `span`s with the presence label, no address |
| lens tabs | — | kept: they filter an existing reading and commission nothing |

**Withheld population** (R1-1A defines the type; R1-0's fail-closed behaviour stays authoritative until separately changed): `ReviewView.withheld?: ReviewWithheld[]` with `observationId · readingId · observationKey · reason`. Reasons are exactly R1-0's refusal facts — `frozen_citation_text_unavailable` · `observation_address_unavailable` — plus `lens_not_presentable`. Rendered as *Observations not shown at their place · N* with a per-item reason line and both addresses; the copy says they exist and are kept with the reading and asserts nothing beyond the reason. Absent in every controlled state, so no golden moved.

## 2. Laws and kills

| Law | Kills |
|---|---|
| L1–L5 read-only omits Ask MAIA · Discuss · Explore · commission controls · member-write controls (rendered across all-lens, not-read lens and stale states) | D1–D5 |
| L6 seam fetches nothing (static over the three presentation files) | D6 (candidate seam file with `fetch` + hooks) |
| L7 seam invokes no cognition | D7 (candidate seam importing `runStructured`) |
| L8 controlled room byte-identical to base goldens | D8 (room rendered in read-only posture) |
| L9 no FS1 artifact mutated — frozen verifier exit 0 and no seam file inside the manifest | D9 (seam claiming a frozen golden's address; narrowed from `render.tsx`, whose own impurity also tripped L6) |
| L10 read-only omits, never disables | D10 (`disabled` placeholder control) |
| L11 read-only keeps the reading whole — same findings, same tabs, stale/coverage/context disclosures present | — |
| L12 withheld population keeps identity and reason; controlled states unaffected | — |

## 3. Gates

| Gate | Result |
|---|---|
| `matrix:ws-flagship-r1-1a` | 12/12 · 10/10 dead · LETHAL + DISCRIMINATING |
| `typecheck:ws-flagship-r1-1a` | PASS — allowances blob-pinned at `981a996ce`: `studioTheme.ts` (24, inherited) · `scripts/witness/flagship/fixtures.tsx` TS2322 (1, pre-existing inside an FS1-frozen file, ⛔ not editable) |
| frozen `render.tsx` unchanged | 44 renders · mechanical ALL PASS · 0 changed captures · Review states byte-identical |
| `verify:flagship-freeze` | 57/57 INTACT (before and after) |
| `matrix:ws-flagship` · `-c1a` · `-c1b` · `-c1c1` · `-r1-readonly` | all LETHAL |
| `npm run typecheck` (ship) | 226 vs 239 · 0 regressions |
| `check:design-canon` · `ci:sovereignty` (29/29) · `check:no-supabase` · `check:no-openai` · `git diff --check` | green |

## 4. Not done, by design

No live Review, no navigation to Review, no aggregation, no automatic newest reading, no frozen-prose recovery, no change to stale semantics, no widening of `DevelopDomain` or `doesNotEstablish`, no commission, no MAIA invocation, no member-observation or standing write, no manuscript change, no FS1 change, no deploy.

**Standing: R1-1A ✅ BUILT AND PROVED ON CANDIDATE · STOPPED for founder adjudication · R1-1B NOT OPENED.**
