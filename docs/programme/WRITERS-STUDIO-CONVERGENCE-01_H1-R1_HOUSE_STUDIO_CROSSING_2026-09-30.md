# WRITERS-STUDIO-CONVERGENCE-01 · H1-R1 — House → Studio Work Crossing

```text
Class: B (the law is authored and proved lethal before any implementation exists)
Governing authority: WRITERS-STUDIO-CONVERGENCE-01 charter spine law — "no dead end, no loss of place";
                     WS2-03B (workContext.ts) — current Work is derived from declarations, never stored or guessed;
                     CLAUDE.md "no stealth memory"; founder direction 2026-09-30 (H1 = navigation only)
Current gate: G1 · DECIDE — founder docket D-01…D-03 below
Evidence subject: canonical 04005ca7 (repository only; no runtime, no database read)
Stop boundary: no BUILD until the docket is ruled; no persistence; no MAIA input; no merge; no deploy
```

**Parent flow:** `WRITERS-STUDIO-CONVERGENCE-01`
**Reason opened:** founder direction (2026-09-30), the first proof of the "context spine": a Work the
member chooses in the House arrives in the Writer's Studio without being lost.
**Base:** `04005ca7`
**Standing:** every convergence law (L1–L8, FACETS-01, OBSERVATION-ADDRESS-01) is unchanged by this lane.

---

## 0 · Placement: why this is a lane, not "step 3"

The direction proposed filing H1 as convergence step 3. The census found that step 3 (orientation
breadcrumb + Back to manuscript) has **already been done** under the C2–C4 packet. So H1 is not step 3.
Under manual §20 it is a **new lane inside the existing flow**, because if it succeeds it answers the
same governing question: *one relationship between the writer, the Work and MAIA, with no loss of place.*
⛔ It is not a new "Context Spine" flow. That would duplicate the crossing registry.

## 1 · Gate question

> When a member chooses one living Work in the House, does the Writer's Studio open **that** Work's
> writing (or ask, or offer) using only what the member has declared, while storing nothing and
> leaving the Studio's current-Work law (WS2-03B) untouched?

## 2 · Flow (manual §19)

| Gate | Question | State |
|---|---|---|
| G0 · CENSUS | What already carries a crossing, and where is the member's click lost? | ✅ DONE (§3) |
| G1 · DECIDE | Where does the crossing start in the registry vocabulary, and what does the click select? | ⛔ **OPEN — founder docket** |
| G2 · CONTRACT | What outcomes may the intake produce? | ✅ DRAFTED (`tests/constitutional/house-studio-crossing/contract.ts`) |
| G3 · FALSIFY | Does the suite kill every plausible wrong intake **before** an intake exists? | ✅ **LETHAL** (§5) |
| G4 · BUILD | Registry entry + House link + Studio intake | ⛔ waits on G1 |
| G5 · VERIFY | Real intake through the frozen suite; House→Studio round-trip test; static guards | ⛔ |
| G6 · FOUNDER WALK | Click Work B in the House → land in Work B's writing | ⛔ human witness |
| MERGE · DEPLOY · PRODUCTION WITNESS | separate founder acts | ⛔ |

## 3 · G0 census (read-only, `04005ca7`)

| Object | What it is | Verdict |
|---|---|---|
| `lib/house/livingOrientation.ts` `FACET_CROSSINGS` | ~30 governed crossings, each declaring what it carries, mode, authority, standing, law | **Extend.** The canonical contract. |
| `OrientationEndpoint = HousePlaceId \| 'maia'` | Crossing endpoints are House *places*. **The House itself is not an endpoint.** | ⚠️ **Vocabulary gap → D-01** |
| `lib/house/catalog.ts` place `writing` | Writer's Studio as a House place, href `/writers-studio?from=house` | Target endpoint |
| `app/house/page.tsx` "What's alive" | Lists ≤2 living Works (most recently updated); **every row links to plain `/writers-studio`** | ⭐ **The click is dropped here** |
| `P4R1HomeController` + `homeState.arrivalFor` | Studio Home picks its own "Continue" Work by writing activity | ⭐ Clicking Work B can land on Work A: the loss of place the spine forbids |
| `app/writers-studio/workContext.ts` (WS2-03B) | Current Work = f(open manuscript, declarations); 0 / 1 / 2+ (ambiguous, never guessed) | Must be respected, not bypassed |
| `app/writers-studio/canvasIdentity.ts` | One definition of the manuscript param (`m`) for producer and consumer | Pattern to copy for the Work param |
| `useLivingWorks` / `useCurrentManuscript` | Member-scoped server reads; a foreign id simply is not in the list | **Ownership check needs no new endpoint** |
| `member_facet_crossings` | Written only when a member act produces an artifact | ⛔ Not touched. Navigation writes no row. |

**Finding routed out (not repaired here):** `homeState.manuscriptIdOf()` returns a Work's **first**
manuscript expression. That is the "first one" guess WS2-03B forbids, only on the Work side. The H1
intake must not reuse it (DC-3 is exactly that shape).

## 4 · G2 contract (summary)

The URL carries a Work id and nothing else. The intake resolves it to exactly one outcome:
`absent` · `wait` · `refused` · `open(manuscript)` · `choose(manuscripts)` · `no-writing`.
⛔ It never selects the Studio's *current* Work. Once a manuscript is open, WS2-03B derives the current
Work from declarations, as it always has.

## 5 · G3 lethality (lethality first; no intake exists yet)

`npm run typecheck:house-studio-crossing` (strict + `noUncheckedIndexedAccess`) → exit 0
`npm run matrix:house-studio-crossing` → exit 0

| Law | Defeat candidate | Result |
|---|---|---|
| HS-F1 no Work requested → act on nothing | DC-1 resume fallback | KILLED |
| HS-F2 foreign / unknown id → refused, never substituted | DC-2 trust the pointer | KILLED |
| HS-F3 several manuscripts → member chooses among all | DC-3 first-pick (`manuscriptIdOf` shape) | KILLED |
| HS-F4 no writing → no-writing for that Work, nothing borrowed | DC-4 fill the empty Work | KILLED (+ classified HS-F5) |
| HS-F5 a deleted declared manuscript is not openable | DC-5 stale declaration | KILLED |
| HS-F6 lists unread → wait; loading is not refusal | DC-6 decide early | KILLED |
| HS-F7 exactly one → open directly, don't ask twice | DC-7 over-ask | KILLED |
| HS-F8 refusal carries nothing | DC-8 disclosing refusal | KILLED |

⭐ **The first run went red on DC-4**, which also died on HS-F5. The collateral is irreducible: a Work
whose only manuscript was deleted *is* a Work with no writing, so a candidate that fills every empty
Work must fill that one too. Classified under the ratified collateral rule, with its reason in
`candidates.ts`. The matrix now also fails on a **stale** classification (declared collateral that no
longer occurs), so the exemption cannot outlive its cause.

⚠️ Run with TypeScript 5.6.3 / tsx from a scratchpad (no project `node_modules` in this container).
The founder's run is the evidence of record. ⛔ Neither command widens `tsconfig.ship.json`.

## 6 · G1 founder docket

### D-01 · Where does the crossing start?
The House is not a crossing endpoint today; endpoints are places. Options:
- **(a) Recommended:** add `'house'` to `OrientationEndpoint` as the **threshold**, not a facet, with a
  registry law and a test: *a crossing from `house` may only be `navigation`, carry identity only.*
- (b) Register it as `writing → writing`. ⛔ Not recommended: a registry entry that lies about its origin.
- (c) Leave it unregistered. ⛔ Refused: an ungoverned path is the defect class this registry exists to close.

### D-02 · What does the click select?
**Recommended:** the click selects **which manuscript opens**, never the Studio's current Work. If
that manuscript is declared in two or more Works, the Studio still shows WS2-03B's honest
"ambiguous" state even though the member came from Work B. Carrying the Work into the Canvas as a
disambiguator would be an amendment to WS2-03B, and is a later, separate act.

### D-03 · The three outcomes (taken from the 2026-09-30 direction; confirm)
One manuscript → open directly · several → the member chooses · none → offer "start writing"
(the existing `onStartWriting`) and ⛔ never create a manuscript automatically. A refused id lands on
Studio Home with a neutral line that does not say whether the Work exists.

## 7 · Out of scope (explicit)
⛔ context store · transition history · movement logging · MAIA context input · memory creation ·
House deciding the current Work · `manuscriptIdOf` repair · **H1-RETURN-01 (Studio → House return
signals)**, which is its own later lane with its own gate question: *what may a room return without
becoming behavioural exhaust?*

## 8 · Standing

**G0 ✅ · G2 drafted · G3 ✅ LETHAL (8/8) · ⛔ G1 OPEN (D-01…D-03) · ⛔ NO INTAKE BUILT · ⛔ NO REGISTRY
CHANGE · ⛔ NO `app/` OR `lib/` CHANGE · ⛔ NO PERSISTENCE · ⛔ NO MERGE · ⛔ NO DEPLOY · PRODUCTION UNTOUCHED.**
