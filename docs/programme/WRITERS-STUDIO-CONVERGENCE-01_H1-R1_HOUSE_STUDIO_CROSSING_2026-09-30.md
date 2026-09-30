# WRITERS-STUDIO-CONVERGENCE-01 · H1-R1 — House → Studio Work Crossing

```text
Class: B (the law is authored and proved lethal before any implementation exists)
Governing authority: WRITERS-STUDIO-CONVERGENCE-01 charter spine law — "no dead end, no loss of place";
                     WS2-03B (workContext.ts) — current Work is derived from declarations, never stored or guessed;
                     CLAUDE.md "no stealth memory"; founder direction 2026-09-30 (H1 = navigation only)
Current gate: G6 · FOUNDER WALK (G1 ruled 2026-09-30 · G4 built · G5 verified)
Evidence subject: canonical 04005ca7 (repository only; no runtime, no database read)
Stop boundary: no persistence; no MAIA input; no merge; no deploy
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
| G1 · DECIDE | Where does the crossing start in the registry vocabulary, and what does the click select? | ✅ **RULED** (§6a) |
| G2 · CONTRACT | What outcomes may the intake produce? | ✅ DRAFTED (`tests/constitutional/house-studio-crossing/contract.ts`) |
| G3 · FALSIFY | Does the suite kill every plausible wrong intake **before** an intake exists? | ✅ **LETHAL** (§5) |
| G4 · BUILD | Registry entry + House link + Studio intake | ✅ (§7a) |
| G5 · VERIFY | Real intake through the unchanged suite; round trip; static guards; mutation proof | ✅ **PASS** (§7b) |
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

## 6a · G1 ruling (founder, 2026-09-30) — recorded, ⛔ not paraphrased into something softer

**The question the lane surfaced:** *when a member clicks a Work in the House, what exactly has the member declared?*

- **D-01 — `house` is a governed THRESHOLD ORIGIN, ⛔ not a place.** *Threshold crossings may originate
  orientation but may only carry validated context into a place. They do not create place identity.*
  Built as `THRESHOLD_ORIGINS` / `CrossingOrigin` beside, never inside, `HousePlaceId` / `OrientationEndpoint`.
  The ruling's illustrative `kind: "threshold"` is **derived** (`isThresholdCrossing`) from the origin
  rather than stored beside it, so the two can never disagree.
- **D-02 — the click selects the WORK; the manuscript is resolved within it.** ⭐ This **overrules my
  recommendation** (click selects a manuscript). The member looks at living Works, not manuscripts; the
  gesture is *"I want to continue this Work."* ⛔ Never Work → first manuscript, ⛔ never by recency.
- **D-03 — confirmed, refined:** zero manuscripts means *"this Work has no writing artifact yet"*, ⛔ not
  *"create a manuscript"*. The member's **Begin manuscript** is the act that creates; the system does not.
- **Principle:** ⭐ *explicit present intention outranks inferred continuity — and does not rewrite
  durable truth.* The defect in §3 is named a **semantic authority bug**, not a UI bug.
- **WS2-03B intact; the inverse added, ⛔ not mirrored:** manuscript → Works (0 none · 1 known · 2+
  ambiguous) and Work → manuscripts (0 no writing yet · 1 open · 2+ member chooses) are different questions.
- **Carries `workId` only.** ⛔ No member id, title, content, intent or recent activity.
- **Explicit non-authorizations:** Studio choosing a manuscript by recency or by "first" · House storing a
  "recently entered Work" · URL carrying manuscript content · movement creating memory · movement
  rewriting relationships.

## 7a · G4 build

| File | Change |
|---|---|
| `lib/house/livingOrientation.ts` | `THRESHOLD_ORIGINS` · `CrossingOrigin` · `isThresholdCrossing`; crossing `house-open-work-in-studio` (`house → writing` · navigation · member_explicit · live · carries `living work identity`) |
| `app/writers-studio/workIntake.ts` | One definition of the `work` param + `studioForWork` / `requestedWorkIdFrom`; `resolveWorkIntake` (pure); `intakeInputFrom` adapter over the member-scoped reads |
| `app/house/page.tsx` | Each "What's alive" Work links through `studioForWork(work.id)`; the no-Work row stays plain |
| `app/dev/writers-studio-pc3-live/P4R1HomeController.tsx` | Intake resolved **before** Home's own "Continue" pick; one manuscript → opens with `replace` (Back returns to the House); every exit drops the `work` param; refusal → neutral line on Studio Home |
| `app/dev/writers-studio-pc3-live/P4R1WorkIntake.tsx` | The two in-Work states: chooser in **declaration order**, no ranking; "This Work has no writing yet." + **Begin manuscript** |

⭐ **A defect caught in self-review before commit:** *Begin manuscript* would have navigated twice —
`onStartWriting`'s own `open()` plus the intake's auto-open once the new declaration resolved to one
manuscript — leaving a duplicate history entry. Inside the intake it now creates and declares only, and
**the intake does the opening**: the manuscript really is a child choice inside the Work. The Studio
Home caller is unchanged (`openAfter` defaults to `true`).

## 7b · G5 verification

- `npm run typecheck:house-studio-crossing` (strict + `noUncheckedIndexedAccess`, now including the real
  intake, the registry and the catalog) → **exit 0**
- `npm run matrix:house-studio-crossing` → **LETHAL + DISCRIMINATING**, unchanged
- `npm run verify:house-studio-crossing` → **PASS · falsifiers 8/8 · guards 9/9**. ⭐ The falsifiers are
  imported **unchanged**; the real intake is also checked structurally against the contract type.
- **Guards** HG-1 registered as ruled · HG-2 threshold law (never a place/facet; navigation, member-chosen,
  one identity, into a place) · HG-2b nothing crosses INTO a threshold · HG-3 producer/consumer round trip
  (incl. `&`, `=`, unicode) · HG-4 House links through the builder · HG-5 intake is pure · HG-5b no browser
  memory in the controller · HG-6 controller wiring (intake before Home, `replace`, param dropped on all
  three exits) · HG-7 chooser does not rank. Every scan strips comments first.
- ⭐ **Mutation proof, 10/10 killed** — each against the real code, then restored: plain House link ·
  hand-built `?work=` · intake writes `localStorage` · intake first-pick (→ HS-F3) · param renamed on one
  side (→ HG-3) · crossing carries a title · crossing mode `persistence` · `work` kept on open ·
  `sessionStorage` memory in the controller · chooser sorts. *Guards that all passed on the first run
  were not trusted until each had been seen to fail.*
- TSX: all three edited/new TSX files parse (esbuild); `P4R1WorkIntake.tsx` typechecks strict against
  React 19 types. ⚠️ **The controller and House page were NOT typechecked** (they import Next and the app
  graph; no project `node_modules` here). ⚠️ **The existing jest suites (`lib/house/__tests__/*`) were NOT
  run.** Both are owed on the founder's machine: `npm run typecheck` (no-regression gate) + `npx jest lib/house`.

### 7b.1 · Project gates — RUN in-container (2026-09-30, head `50a18464`)

Dependencies installed with `npm ci` inside the session container, so the owed gates above were run here
rather than deferred.

- `npm run typecheck` (no-regression gate, `tsconfig.ship.json`, 4,611 program files incl. the Home
  controller and House page) → **exit 0 · 222 errors vs baseline 239 · ✅ No TypeScript regressions.**
- `npx jest lib/house app/writers-studio/__tests__` → **87/87 suites · 897/897 tests PASS**, including
  `livingOrientation.test.ts` (unique ids, **real evidence paths** for the new crossing) and
  `facetCrossingContract.test.ts`.
- ⭐ **The first typecheck run FAILED with 46 "new" diagnostics, and it was not the change.** Every one
  sat in Prisma-typed files (`lib/types/database.ts` ×37, `lib/db/prisma.ts`, …) because the install used
  `--ignore-scripts`, so the Prisma client was never generated. ⛔ Not absorbed into the baseline and
  ⛔ not waved away: `npx prisma generate`, then the identical gate → exit 0. *An environment defect can
  wear the costume of a regression exactly as easily as the reverse.*

## 7c · Residual question — ⛔ NOT DECIDED, surfaced

D-02 says *the Work remains selected throughout*; WS2-03B stays intact. They agree everywhere except
**one edge**: a manuscript declared in **two or more** Works. Opened from Work B, the writing room still
derives the current Work from declarations and shows WS2-03B's honest *ambiguous* state. Honouring
"selected throughout" inside the writing room would mean carrying the Work into it as a disambiguator —
an amendment to WS2-03B's ambiguous branch. ⛔ Built as the ruling's "WS2-03B intact" requires; the edge
is left for an explicit act.

## 7 · Out of scope (explicit)
⛔ context store · transition history · movement logging · MAIA context input · memory creation ·
House deciding the current Work · `manuscriptIdOf` repair · **H1-RETURN-01 (Studio → House return
signals)**, which is its own later lane with its own gate question: *what may a room return without
becoming behavioural exhaust?*

## 8 · Standing

*(Superseded same day; kept as the state at the time:)* G0 ✅ · G2 drafted · G3 ✅ LETHAL · G1 OPEN · no intake built.

**Current: G0 ✅ · G1 ✅ RULED · G2 ✅ · G3 ✅ LETHAL (8/8) · G4 ✅ BUILT · G5 ✅ VERIFY PASS (8/8 + 9/9, mutants
10/10) · ✅ project typecheck (0 regressions) + jest 897/897 RUN in-container · ⛔ G6 FOUNDER WALK OWED · §7c edge OPEN ·
⛔ NO PERSISTENCE · ⛔ NO MAIA INPUT · ⛔ NO MERGE · ⛔ NO DEPLOY · PRODUCTION UNTOUCHED.**

**G6 walk (human witness):** (1) House → click a Work with one manuscript → lands in that writing, and
Back returns to the House; (2) a Work with several → chooser in your declared order, nothing preselected;
(3) a Work with none → *"This Work has no writing yet."*, and nothing exists until you press Begin;
(4) ⭐ the discriminating case — two Works, the *less* recently written one clicked → you land in **that**
Work, not the one Studio Home would have offered; (5) a hand-edited foreign id → neutral line, no hint.
