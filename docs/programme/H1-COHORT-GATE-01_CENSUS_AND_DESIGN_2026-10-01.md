# H1-COHORT-GATE-01 · Cohort Boundary and Context Authority · census and propagation design · 2026-10-01

```text
Class: A programme · R1 read-only census + propagation decision + falsifier design
Governing law: docs/programme/H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md (#1544, canonical 71859c3a)
Census baseline: 71859c3a
Standing: R2 CANONICAL CONVERGENCE COMPLETE · ONE AUTHORITY (#1551) · ONE SEAM · FALSIFIER-CONFORMANT (§9)
          · R1 implementation (§8) SUPERSEDED IN PART — authority/endpoint/hook retired in favour of #1551
          · falsifier baseline FROZEN @ 61f77602 · F8 amended (name only) · F11 added
          · ⛔ NO MERGE · ⛔ NO DEPLOY · cohort NOT configured (closed by default)
Untouched by this lane: #1539, #1542, production
```

## 0 · Purpose and boundary

Make the canonical #1544 distinction real without creating a second admission system or
weakening the existing Writer's Studio ambiguity law. The contract is not "build H1". It is to
**control whether H1's contextual arrival is allowed to exist for this member.**

### Frozen invariants (founder, 2026-10-01)

1. **Admitted:** the House may emit contextual `work=`, and the Studio may honour it.
2. **Non-admitted:** the House emits plain `/writers-studio`, and `work=` has **no authority**
   even if supplied by hand or inherited.
3. **No bypass:** no alternate producer can grant contextual authority around the cohort gate.
4. **No regression:** non-admitted members keep the pre-H1 inference/ambiguity behaviour.
5. **No silent choice:** #1538 stays universal.
6. **No interpretive elevation:** seeing the selected Work does not authorise MAIA to interpret
   it. *The arrival may name the Work the member explicitly pointed at. It acquires no authority
   to interpret that Work merely because it has become visible.*
7. **No duplicate eligibility logic:** the House and the Studio must not decide cohort
   membership independently.

**Frozen nuance:** *ignoring `work=` for a non-admitted member means removing its authority, not
necessarily rewriting the URL destructively.* The parameter must not influence selection,
inference, arrival, persistence or subsequent navigation. Whether the browser normalises the URL
is secondary; #1544 does not require normalisation.

## 1 · Census Q1: where can `work=` come from today?

Scope: every producer, forwarder, redirect, resume path, legacy door, import path, navigation
helper, query-preserving route, and server- or client-side construction of a Writer's Studio URL
containing `work=`, at `71859c3a`. "Studio `work=`" means `STUDIO_WORK_PARAM` on `/writers-studio**`.
The MAIA handoff parameter `MAIA_WORK_PARAM` on `/maia` is a different contract and is listed
only where it can route back into the Studio.

### 1.1 Producers (originate a Studio `work=`)

| # | Producer | Where | Class | Gated today? |
|---|---|---|---|---|
| P1 | `studioArrivalFromHouse(id)` | `app/house/page.tsx:111` (House "Writing →" on a living Work) | member-triggered, server-rendered | **no** |
| P2 | `situatedManuscriptAddress(mid, wid)` | `app/writers-studio/situatedWork.ts:163` | **no live caller** (exported, unused) | latent |
| P3 | Hand-typed or bookmarked URL | the browser | member-supplied | **no**; the Studio honours any own-Work claim |
| P4 | Crafted MAIA `return=` | `app/maia/useStudioHandoff.ts` `safeReturnHref()` accepts any same-origin `/writers-studio…` path with its query | member-supplied (equivalent to P3) | **no** |

**Not producers, checked:**
- `handoffToMaia()` (`workContext.ts:166`) emits `/maia?work=…&return=…`. The Studio work goes
  in `MAIA_WORK_PARAM` on `/maia`, and its `return=` is `returnAddress()` =
  `/writers-studio/rebuild?<canvas>=<mid>`, which carries **no `work=`**.
- #1538's choice surfaces (`HomeView.tsx`, `P4R1HomeView.tsx`, `P4R1WorkArrival.tsx`) emit no
  `work=`.
- There are no `localStorage` or `sessionStorage` resume paths that store a Studio URL, and no
  server-side persistence of one.
- `proxy.ts` and `next.config` contain no redirect that adds `work=`.

### 1.2 Forwarders (carry an existing `work=` onward; never originate one)

| # | Forwarder | Where | Class |
|---|---|---|---|
| F1 | query-copying room navigation (`updateQuery`, `goMode`, `openAvailableReview`, `onArrivalMode`) | `P4R1DevelopController.tsx:345`, `P4R1ReviewController.tsx:185/194/215/235`, `P4R1HomeController.tsx` | automatic, universal |
| F2 | legacy-route canonicalisation `/writers-studio/rebuild` and `/develop` → `/writers-studio?mode=…` | `proxy.ts:449` → `canonicalStudioRoute()` → `hrefFor()` (copies the whole query) | automatic, universal, server redirect |
| F3 | in-session workspace return address (`pathname + search`) | `rebuild/RebuildStudioClient.tsx:1267` (React ref, not persisted) | automatic, session-local |
| F4 | MAIA return link | `useStudioHandoff.ts:76` (`safeReturnHref`) | member-triggered |

### 1.3 Readers (where `work=` acquires authority)

| Reader | Where |
|---|---|
| `resolveStudioArrival(…, readStudioWorkParam(params))` | `P4R1HomeController.tsx:199` |
| `resolveSituatedWorkContext(…, readStudioWorkParam(params))` | `P4R1DevelopController.tsx:320`, `P4R1ReviewController.tsx:76`, `P4R1WriteEditController.tsx:231` |

No other code on a Studio route reads `work` (`get('work')` returns nothing outside these).

### 1.4 Normaliser

`P4R1HomeController.tsx:216` `withoutWork()` deletes `work=` when the member chooses to leave
the carried Work. It is member-triggered.

### 1.5 Census conclusion

- **Only the House originates a Studio `work=` (P1).** Everything else either is the member
  supplying one by hand (P3, P4), forwards one that already exists (F1–F4), or is dead (P2).
- **So every bypass route ends at the four readers.** Gating the House emission covers the only
  producer. Gating *reception* at the readers removes authority from every hand-supplied,
  inherited or forwarded `work=` at once, without touching the forwarders. That is the frozen
  nuance: authority is removed, and URLs are not rewritten.
- **The obvious dangerous design is concretely available.** Gating P1 alone leaves P3, P4 and
  F1–F4 delivering a `work=` that all four readers would honour.
- **P2 is a latent producer.** It has no caller today. The gate lane must either route any future
  caller through the gated path, or the structural guard below must fail if it gains a caller
  outside it.

## 2 · Census Q2: where does admission truth live, and how does it reach the client?

### 2.1 Existing substrates

| Substrate | Shape | Fit |
|---|---|---|
| `FOUNDER_MEMBER_IDS` | env allowlist, founder-private surfaces | ⛔ wrong authority |
| `LAB_ACCESS_MEMBER_IDS` (`lib/access/labAccess.ts`) | env allowlist ∪ founders, verified session, fails closed | ⛔ its own ruling forbids reuse for other doors |
| `FEATURE_MAIA_IDEAS_DECISION_RECOGNITION[_MEMBER_IDS]` (`app/api/ideas/[id]/ask-maia/route.ts`) | global toggle + env member allowlist, default-off, inlined in one route | **the established per-feature convention** |
| `MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS` | env member allowlist | same convention |
| `EARLY_FIELD_ENABLED` / `EARLY_FIELD_MEMBER_IDS` (#1542, not yet canonical) | toggle + allowlist, own module, own admission endpoint | ⛔ different capability (ruled); its **pattern** is the precedent |
| `members` tier/roles via `deriveVerifiedAccess()` / `x-access-roles` | DB-backed, verified | no cohort semantics today; using it would need a governed role vocabulary. Not proposed |

**Finding:** there is no shared cohort platform. The convention is a per-capability
`<FEATURE>_ENABLED` toggle plus a `<FEATURE>_MEMBER_IDS` allowlist, default-off and verified
against the session. ⛔ This lane does not generalise it into a platform (stop condition).

### 2.2 Identity on both sides

- **House:** a server component. `memberForHouse()` resolves identity with `requireMemberId()`,
  the hardened verified-session path.
- **Studio:** client controllers. Every server read goes through `apiFetch`, and the server
  derives identity from the verified session (`getMemberIdFromRequest`).

## 3 · Proposed propagation decision (for founder ruling)

> **Admission is decided authoritatively once; the House and the Studio consume the same
> decision. The browser may carry that decision but may not derive it.**

1. **One authority, one rule.** `lib/access/h1ArrivalAccess.ts` →
   `canUseH1Arrival(verifiedMemberId)`, configured by `H1_ARRIVAL_ENABLED` (exactly `"true"`
   opens it) and `H1_ARRIVAL_MEMBER_IDS` (UUIDs; one malformed entry closes it). It fails closed,
   writes nothing, needs no migration, and is separate from `EARLY_FIELD_*`, lab and founder
   lists. Founders are not admitted automatically.
2. **House: decided on the server, so the browser carries nothing.** `HouseExperience` calls
   `canUseH1Arrival(member.id)` and emits `studioArrivalFromHouse(id)` or plain
   `/writers-studio` (including the no-Work link). The emission is already server-rendered HTML,
   so no client value participates.
3. **Studio: one carrier.** A narrow endpoint following #1542's pattern,
   `GET /api/writers-studio/h1-arrival/admission` → `{ admitted }` (verified session only;
   signed-out returns 401 with `admitted: false`; `no-store`; registered in `config/accessMatrix.ts`).
   One hook, `useH1ArrivalAdmission()`, starts closed and opens only on `admitted === true`.
4. **One reception choke point.** A single helper, `admittedStudioWorkParam(params, admitted)`,
   returns `readStudioWorkParam(params)` only when admitted and `null` otherwise. All four readers
   use it, and none calls `readStudioWorkParam` directly. A `null` claim falls through to pre-H1
   inference and ambiguity in the existing code.
5. **While admission is loading** the Studio treats the member as not admitted. A claim never
   acquires authority before the decision arrives, and the arrival never waits on a value it
   cannot verify. (Implementation must confirm this does not briefly render the fallback and then
   jump. If it does, that is a presentation question for the founder, never a reason to
   open early.)

**Why the House and Studio do not "decide independently":** both evaluate the **same function**
against the **same verified identity**. Neither re-implements the rule, and neither consults
client state. The House runs it on the server during render; the Studio receives its result
through one endpoint.

## 4 · Falsifier design (built and proven lethal before implementation)

Laws run against the real gate and against defeat candidates. Each candidate must die on its
named law, for that reason and not through an unrelated exception.

| # | Defeat candidate | Killed by |
|---|---|---|
| **DC-H1** | **House-only gate: the House emits plain for non-admitted, but the Studio honours a hand-typed `?work=`** (the obvious dangerous version) | **G2: a non-admitted member's supplied `work=` (typed, inherited via F1/F2, or via MAIA `return=`) yields the same arrival and context as no `work=`** |
| DC-H2 | Studio gate reads admission from the URL or client storage (`?h1=1`, a localStorage flag) | G1: no client input grants admission |
| DC-H3 | House and Studio each implement their own allowlist check (duplicate eligibility) | G6 (structural): exactly one module reads `H1_ARRIVAL_*`; the House and the endpoint both call `canUseH1Arrival` |
| DC-H4 | A reader bypasses the choke point (calls `readStudioWorkParam` directly) | G5 (structural): `readStudioWorkParam` has exactly one caller, `admittedStudioWorkParam` |
| DC-H5 | Fail-open configuration (missing or malformed env admits) | G3: absent or malformed configuration closes it for everyone |
| DC-H6 | Gating removes #1538's choice for non-admitted members, or adds a silent pick | G4: the multi-manuscript choice behaves identically for both populations |
| DC-H7 | The no-Work House link still carries `?from=house` for non-admitted members | G7: non-admitted House emission is exactly `/writers-studio` |
| DC-H8 | Latent producer P2 gains a caller outside the gated path | G5 (structural), extended to `situatedManuscriptAddress` callers |
| DC-H9 | The gate rewrites or strips the URL but leaves the reader honouring it (normalisation mistaken for authority) | G2 run on a URL still containing `work=` |

**Population matrix (the admission instrument, from #1544 §4):**

| Boundary | Admitted | Non-admitted |
|---|---|---|
| Visibility | contextual arrival reachable from the House | plain `/writers-studio` reachable |
| Non-exposure | contextual surface allowed | no contextual link; typed or inherited `work=` has no authority |
| Crossing | the Work is carried; #1538 prevents a silent manuscript choice; no interpretive elevation | pre-H1 inference and ambiguity |
| Return | House return preserves the situated relationship | ordinary return |

## 5 · Stop conditions

Stop and report instead of widening scope if:
- gating reception would require changing `resolveSituatedWorkContext` or `resolveStudioArrival`
  semantics beyond passing `null`;
- the admission carrier would need to change an existing API's contract;
- the work starts turning into a general cohort or feature-flag platform;
- a producer of Studio `work=` is found that this census missed.

## 6 · Next act

~~Founder ruling on §3 (propagation) and §4 (falsifier set).~~ **Taken 2026-10-01** (§7.1).
~~Falsifiers and defeat candidates built and proven lethal.~~ **Done** (§7). Remaining, each its
own founder act: implementation → H1 admission against the population matrix on a recorded origin.

## 7 · Founder ruling and falsifier result (2026-10-01)

### 7.1 Ruling (ratified as written in §3/§4, with these tightenings)

- **No URL cleansing — frozen as law (F9).** *Removing H1 authority does not require removing H1
  syntax.* A non-admitted `work=` stays in the URL and simply has no authority.
- **Closed during uncertainty.** Loading, error, timeout and malformed responses are not admitted;
  there is never a transient moment where `work=` is honoured before admission resolves (F5).
- **The endpoint returns only `{ admitted: boolean }`** — no reason, no cohort, no list.
- **F1–F9 frozen.** **F10 added**: *H1 admission can change which explicit context is
  authoritative; it cannot create a new fallback resolution algorithm.* It needs its own law: a
  gate that replaces the fallback for EVERY non-admitted member passes F1, because with and
  without `work=` it returns the same invented answer.
- Scope of this act: **falsifiers only** — ⛔ no `canUseH1Arrival`, endpoint, hook, House
  conditional or Studio choke point.

### 7.2 Artifacts

`tests/constitutional/h1-cohort-gate/` — `contract.ts` (the gate seam) · `world.ts` (fixtures +
the seven delivery paths; legacy redirect and MAIA return use real canon functions) · `laws.ts`
(F1–F7, F9, F10) · `structural.ts` (F8 producer containment over a source map) · `gates.ts`
(reference test double + defeat candidates + canon witness) · `matrix.ts`.
Commands: `npm run typecheck:h1-cohort-gate` · `npm run matrix:h1-cohort-gate`.

⭐ "Ordinary pre-H1 resolution" in these laws **is** canon's `resolveSituatedWorkContext` /
`resolveStudioArrival` / `modeEntryTarget`, imported, never paraphrased — a gate cannot pass by
agreeing with a copy of them. ⛔ The reference is a **test double, never a seed**: nothing ships
from `gates.ts`.

### 7.3 Result

| Subject | Outcome |
|---|---|
| Conforming reference | passes all 10 laws |
| DC-H1 House-only gate | killed by F1 · classified collateral F4, F5, F9 |
| DC-H2 admission from client state | killed by F2 |
| DC-H3 House keeps its own list | killed by F3 |
| DC-H4 Review bypasses choke point | killed by F4 · classified collateral F1, F5, F9 |
| DC-H5 fail-open | killed by F5 (config half and loading half each independently) |
| DC-H6 #1538 collapsed for non-admitted | killed by F6 |
| DC-H7 non-admitted link keeps `from=house` | killed by F7 |
| DC-H8 latent producer gains a caller | killed by F8 (structural) |
| DC-H9 strips `work=` instead of removing authority | killed by F9 · classified collateral F4, F5 |
| DC-H10 invents a fallback | killed by F10 |
| **Canon at baseline (no gate)** | **fails F1, F7, F8** (+ F2, F4, F5, F9) — the suite sees the defect |

`✓ MATRIX LETHAL AND DISCRIMINATING · reference clean · 10 candidates killed on their named laws ·
canon witness red` — exit 0. Typecheck: 0 diagnostics in lane files.

Classified collateral is always the same reason: the candidate is *defined* by a non-admitted
reader honouring `work=`, and F4/F5/F9 each also ask that question; narrowing the candidate to
avoid them would stop it being the error it models.

### 7.4 Things the run found, recorded rather than smoothed

- **DC-H5 was wrong first, and the matrix said so.** The first version ignored the allowlist
  altogether — broad exposure, not fail-open — and killed F1/F2 as UNCLASSIFIED collateral. The
  **candidate** was repaired (correct when config is trustworthy; open only when it is missing or
  malformed, and while loading); ⛔ the law was not touched.
- **Inherited typecheck debt.** Under `noUncheckedIndexedAccess` the imported canon modules carry
  8 pre-existing TS2322 diagnostics (`canvasIdentity.ts`, `homeState.ts`, `situatedWork.ts`,
  `useLivingWorks.ts`, `workContext.ts`). Listed by the script, not failing it; ⛔ the flag was not
  weakened, and they are not this lane's to repair.
- **F8 names a module that does not exist yet** (`app/writers-studio/h1Arrival.ts`) so the law
  can be stated before the implementation. Implementation must land the choke point at that path
  or amend `CHOKE_POINT_MODULE` by a recorded act — never by quietly widening the allowlist.
- The controllers' query-copying navigations are inline in components, so their observable shape
  is reproduced in `world.ts`, not imported; a change to how they copy the query is a reason to
  revisit `DELIVERIES`.
- ⛔ Run in this container with no live stack; ⭐ the founder's run of the two commands is the
  evidence of record.


## 8 · H1-CG-03 — implementation (founder ruling 2026-10-01)

> ⚠️ **SUPERSEDED IN PART by §9 (R2).** The authority (`canUseH1Arrival`, `H1_ARRIVAL_*`), the endpoint
> (`/api/writers-studio/h1-arrival/admission`) and the hook (`useH1Arrival`) described below were
> retired in favour of canon's already-admitted #1551 equivalents. The seam path, the House doorway
> and the proof discipline carry forward. Kept verbatim as the R1 record.

### 8.1 Ruling

H1-CG-03 OPEN. **Falsifier baseline frozen at `61f77602`.** F1–F10 are constitutional evidence:
a law is not modified because the implementation finds it hard; any test-law change needs its
own recorded rationale and a full matrix rerun. Two constraints frozen with the ruling:
**(A)** `h1Arrival.ts` answers *is this supplied Work context authorized?* and never *which Work
instead?*; **(B)** transport stays ignorant — Develop/Review query preservation, workspace
returns, legacy redirects and MAIA `return=` keep carrying `work=`.

### 8.2 What was built, in the ruled order

| # | Unit | Path |
|---|---|---|
| 1 | Server authority `canUseH1Arrival(verifiedMemberId, env = process.env)` — `H1_ARRIVAL_ENABLED` must be exactly `true`; one malformed id closes the whole list; no inheritance | `lib/access/h1ArrivalAccess.ts` |
| 2 | `GET /api/writers-studio/h1-arrival/admission` → `{ admitted }` only, `Cache-Control: no-store`; signed out → 401 `{ admitted: false }`; identity from `getMemberIdFromRequest` | `app/api/writers-studio/h1-arrival/admission/route.ts` |
| 3 | Client state `{ admitted, resolved }`, starts `H1_UNRESOLVED`; 5 s timeout; every non-2xx, malformed body, network error and timeout settles closed | `app/writers-studio/useH1Arrival.ts` (+ `settleH1Admission` in the seam) |
| 4 | The F8-governed seam at the frozen path: `admittedStudioWorkParam(search, admission)`, `hasH1Authority`, `houseWritingHref` | `app/writers-studio/h1Arrival.ts` |
| 5 | Home, Develop, Review, Write/Edit read `work=` only through the seam; `readStudioWorkParam` now has no caller outside `situatedWork.ts`/`h1Arrival.ts` | `app/dev/writers-studio-pc3-live/P4R1{Home,Develop,Review,WriteEdit}Controller.tsx` |
| 6 | House producer gated **last**: `canUseH1Arrival(member.id)` server-side; non-admitted → exactly `/writers-studio` | `app/house/page.tsx` |

The seam is server-safe (no hooks), so the House imports `houseWritingHref` from it; the hook is a
separate client module. The House passes `studioArrivalFromHouse` into `houseWritingHref`, so the
arrival builder is still referenced only from the House (F8(c)).

### 8.3 Instrument changes (recorded per the freeze rule — ⛔ no law in `laws.ts` changed, ⛔ no candidate in `gates.ts` changed)

1. **Canon witness now reads the census baseline from git** (`repositorySourcesAt('71859c3a')`)
   instead of the working tree. Necessary, not convenient: once the implementation lands the
   working tree is no longer canon-without-a-gate, and the witness would otherwise *pass* F8 and
   report that the suite cannot see the defect. `app/`, `components/`, `lib/` are byte-identical
   between `71859c3a` and `61f77602`, so the witness's meaning is unchanged.
2. **Stage 4 added**: the real implementation (`implementation.ts` — real authority, endpoint
   core, settlement, seam and House doorway; only the controllers' choke-point → canon-resolver
   composition is reproduced) runs all ten laws, F8 over the working tree, and a **controller
   wiring** check that each of the four controllers takes `const h1 = useH1Arrival();` and feeds
   `admittedStudioWorkParam(params, h1)` into its canon resolver — so the composition in the gate
   cannot drift from the shipped controllers silently.
3. **Lane typecheck widened** to the implementation modules (`lib/access/h1ArrivalAccess.ts`,
   `app/writers-studio/h1Arrival.ts`, `useH1Arrival.ts`, the route), held to the same strict flag.

**One canon test updated, with rationale**: `studioArrival.test.ts`'s House guard pinned
`href={studioArrivalFromHouse(work.id)}`, which is the pre-gate House the ratified F7 law changes.
Its intent (each living Work linked through the one doorway builder) is preserved — it now pins
`houseWritingHref(h1Admitted, work.id, studioArrivalFromHouse)` and adds that the House computes
`h1Admitted = canUseH1Arrival(member.id)`. The `no literal href="/writers-studio"` assertion is
unchanged.

### 8.4 Proof, in the ruled order

| # | Proof | Result |
|---|---|---|
| 1 | F1–F10 reference + defeat matrix | reference 10/10 · DC-H1…H10 killed on named laws · canon @ `71859c3a` red on F1, F7, F8 |
| 2 | F1–F10 against the real implementation | **10/10 + controller wiring** · `✓ … implementation conformant`, exit 0 |
| 3 | Lane-local strict typecheck | 0 lane diagnostics (9 inherited listed: the 8 Studio TS2322 + `lib/db/postgres.ts` `insertOne`, now reached via the route) |
| 4 | House crossing (`app/house`, `lib/house`, `app/home`, `studioArrival.test.ts`) | 163/166 — the 3 failures are pre-existing (below) |
| 5 | Studio Home (`homeState`, `arrivalComposition`, `soullabHomeContinuity`, `p4r1UnifiedHost`, `p4r1CanonicalRoute*`) | 67/67 |
| 6 | Develop (`developWorkbench`, `p4r1DevelopFocusContinuity`, `workDevelopmentLaw`) | 25/25 |
| 7 | Review (`p4r1ReviewFocusContinuity`, `wholeManuscriptSurface`) | 25/25 |
| 8 | #1538 (`multiManuscriptChoice`, `writerChoiceLaw`) | 23/23 |
| 9 | WS2-03B (`situatedWork`) | 29/29 |
| 10 | Auth/session + endpoint (`lib/auth`, the route test, `lib/access`) | 260/264 — the 4 failures are pre-existing (below) |
| 11 | `npm run typecheck` (no-regression gate) | **PASS** — 222 vs baseline 239, 0 new |
| 12 | `npm run build` | **PASS** — exit 0; `ƒ /api/writers-studio/h1-arrival/admission` built as dynamic. One unrelated traced-file copy warning (`api/supervision/upload` → a `backups/` path absent from this checkout); not this lane |

Breadth: all `app/writers-studio` + `app/dev/writers-studio-pc3-live` suites 80/80 (884 tests).

**Pre-existing failures, not attributable**: 7 tests in `lifeFacetFlowProjection`, `facetFlowLens`,
`authBoundaryMiddleware`, `journalGuardCoverage`, `handlerGuardCoverage` fail identically at the
frozen baseline `61f77602` (failing-test name lists diffed: identical). ⛔ Not repaired here.

⚠️ **Caught by step 11, not by the lane check**: the first `H1ArrivalEnv` was a weak type, and
`process.env` as its default tripped TS2559 under the ship config while the lane-strict check
passed. Fixed with an index signature. *The ruling's insistence on the ordinary typecheck earned
its place on the first run.*

**The four live semantics** (`app/writers-studio/__tests__/h1Arrival.test.ts`), asserted as final
resolver output for Home and for the situated context shared by Develop/Review/Write — never as
"the seam returned null":

| State + `work=A` | Result |
|---|---|
| admitted | A governs: Home → member choice on a multi-manuscript Work; situated → `member_explicit` (both shown to differ from pre-H1, so the test is not vacuous) |
| non-admitted | `toEqual` canon resolver fed `null`, and `toEqual` the same request without `work=` |
| unresolved | identical |
| admission failure (network/timeout · 401 · 500 with an admitting body · malformed · empty) | identical |

The endpoint test runs the **real** `getMemberIdFromRequest` (sessions mocked): signed-out → 401;
a bare `x-member-id` claim → 401; cookie or `x-session-token` → verdict; an outsider claiming the
admitted id → not admitted; absent/malformed config → not admitted; body keys exactly `['admitted']`.

### 8.5 Behaviour to know before rollout

- **Everyone is non-admitted until the cohort is configured.** So on deploy the House stops
  emitting `from=house` and `work=` for every member, and the Studio's House return membrane
  (shown only on `from=house`) stops appearing. That is F7 as ratified, not a regression — but it
  is a visible change for all members, and it ships the moment this merges and deploys.
- **Admitted members see one transient.** While admission is unresolved, Home renders the ordinary
  pre-H1 resolution, then re-resolves to the Work arrival when `{ admitted: true }` lands (one
  same-origin fetch). Kept deliberately: holding Home in "Opening…" until admission resolves would
  have to apply to every member (holding only when `work=` is present would let `work=` change
  behaviour for non-admitted members, against F1), adding a fetch of latency to everyone. A
  universal hold is a founder call, not made here.
- The admission is fetched once per controller mount, not cached across the session, so a sign-out
  / sign-in in one tab cannot carry a stale verdict.

### 8.6 Debt carried, not hidden

- **Coverage debt — modelled delivery paths.** The Home/Develop/Review query-copying navigations
  are reproduced in `world.ts`, not imported. Owed after acceptance: a structural assertion tying
  those real navigation sites to the census, so the model cannot outlive the code it models.
- 9 inherited strict-flag diagnostics (§8.4 row 3) — outside this lane.

### 8.7 Next act

Founder: PR for the lane (merge = latent deploy authorization); then cohort configuration
(`H1_ARRIVAL_ENABLED`, `H1_ARRIVAL_MEMBER_IDS`) and H1 admission against the population matrix on
a recorded origin. ⛔ #1539, #1542, production untouched.

## 9 · R2 — canonical convergence + seam repair (founder ruling 2026-10-01)

### 9.1 Why R2 exists

Before opening the R1 PR, canon was found to have moved: **#1551** (`ad7b2d3e`, merged `3421a209`) had
already landed an H1 cohort gate for the same crossing, and **#1560** (`646ca0ae`) recorded it as
*H1 ADMITTED TO CANONICAL* (production deployment separate). Opening R1 would have put a second
cohort authority into review. Founder ruling: **converge on #1551's authority, endpoint and env;
repair the seam.** *This does not introduce a new cohort gate. It converges the already-admitted
#1551 H1 authority onto the governed Writer's Studio arrival seam, eliminating distributed `work=`
interpretation and duplicate cohort logic.*

History is preserved: canon was **merged** into the lane branch (no rebase, no force push); the R1
commits `61f77602`·`6cd60a4b`·`40f0c269` remain in the lineage.

### 9.2 What #1551 got right, and what R2 repairs

#1551 already satisfied the law's core: one verified-identity authority, closed on any doubt,
`{ admitted }`-only endpoint, non-admitted House → exactly `/writers-studio`. Against the frozen
suite it failed two things, both now witnessed by the matrix (stage 3b):

| Law | #1551 at `ad7b2d3e` |
|---|---|
| F8 producer containment | `readStudioWorkParam` referenced from `useHouseStudioH1WorkClaim.ts`, outside the governed path |
| F11 hook is a fact supplier | the admission hook reads the claim and decides whether to expose it |

That is the *second diagram* the ruling names: `URL → hook → controller` with `h1Arrival.ts` beside
it. R2 produces the first: `URL → h1Arrival.ts → resolved arrival → controllers`, with the hook
supplying only the admission fact.

### 9.3 The converged shape

| Concern | One place |
|---|---|
| Cohort authority | `lib/access/houseStudioH1Access.ts` (`canUseHouseStudioH1`, `HOUSE_STUDIO_H1_ENABLED` / `HOUSE_STUDIO_H1_MEMBER_IDS`) — #1551, unchanged except an added pure `houseStudioH1AdmissionResponse` |
| Admission endpoint | `GET /api/house-studio/admission` — #1551; now answers from that pure core |
| `work=` interpretation + resolved arrival | `app/writers-studio/h1Arrival.ts` — `h1AdmissionNeeded`, `resolveH1Arrival → { workId, pending }`, `withoutStudioWork`, `houseWritingHref`, `settleH1Admission` |
| Admission fact (transport/state) | `useHouseStudioH1WorkClaim(needed: boolean) → { admitted, resolved }` — no claim, no Work id, no resolution. Name kept from #1551 for archaeology. |
| Consumers | Home, Develop, Review, Write/Edit: `const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params)); const { workId … } = resolveH1Arrival(params, h1);` → the unchanged canon resolver. House: `houseWritingHref(canUseHouseStudioH1(member.id) …)`. None references `readStudioWorkParam`, `STUDIO_WORK_PARAM` or `.get('work')`. |

Retired (deleted): `lib/access/h1ArrivalAccess.ts` + test · `app/api/writers-studio/h1-arrival/**` ·
`app/writers-studio/useH1Arrival.ts`. The R1 endpoint test was ported to the #1551 endpoint.

### 9.4 Acceptance conditions (founder, R2)

| # | Condition | Evidence |
|---|---|---|
| 1 | Exactly one cohort authority, no second helper, no duplicate env pair | `oneAuthority()` on the working tree: no `canUseH1Arrival` / `H1_ARRIVAL_*` / `useH1Arrival` in runtime source; `HOUSE_STUDIO_H1_*` read only in the authority module; `decideHouseStudioH1`/`parseHouseStudioH1Cohort` called nowhere else. **Proven able to fail**: DC-H12a (second env reader), DC-H12c (eligibility re-evaluated elsewhere), DC-H12d (retired authority survives) each killed |
| 2 | Exactly one admission endpoint | same check; DC-H12b (competing endpoint) killed |
| 3 | One governed URL interpretation seam | F8 + F11 on the working tree: the claim is read only in `situatedWork.ts`/`h1Arrival.ts`; no controller, House page or hook parses `work=` |
| 4 | Hook is transport/state glue | F11; DC-H11 (seam exists and the hook also reads `work=`) killed — the exact smell the ruling names |
| 5 | Four controllers consume one arrival contract | controller wiring: each takes the fact via `h1AdmissionNeeded`, calls `resolveH1Arrival(params, h1)` exactly once, and feeds its `workId` to the canon resolver — no local defaults, no first-match guess, no fallback. DC-H11b (a controller re-reading `work=` beside the seam) killed |
| 6 | House behaviour exact | F7 against the real implementation; `studioArrival` + `houseStudioH1Access` structural tests |
| 7 | Loading behaviour unchanged | Home still holds "Opening…" while a claim awaits admission (`pending`, #1551's `checking`); Develop/Review/Write still render the ordinary resolution meanwhile. **Documented in the seam as presentation timing, not authority**: while `pending` is true `workId` is already null. Only change: a 5 s timeout now settles a hung admission closed, where #1551 would hold "Opening…" indefinitely |
| 8 | F8 amended, not weakened | `AUTHORITY_CALL` `'canUseH1Arrival('` → `'canUseHouseStudioH1('` with the frozen lineage recorded in `structural.ts`; the invariant (House emits the H1 arrival only after consulting the one authority) unchanged; F8 still red on canon @ `71859c3a` and on #1551 |

### 9.5 F11 — numbered, not F9

The ruling called the new falsifier "F9". **F9 is already a frozen law** (*authority ≠ URL
mutation*), so the new law is **F11 — the admission hook is a fact supplier, never a second semantic
authority**: the hook may not reference `readStudioWorkParam`, `STUDIO_WORK_PARAM`, `.get/.has('work')`,
any resolver, or expose a `workId`; and no arrival consumer (four controllers, House, hook) may read
the claim itself. Additive — no frozen law edited.

### 9.6 Other instrument changes (recorded per the freeze rule)

- `implementation.ts` rebuilt on #1551's authority and the converged seam. The frozen fixtures name the
  config with **abstract** keys `H1_ARRIVAL_ENABLED` / `H1_ARRIVAL_MEMBER_IDS`; an adapter maps exactly
  those two onto `HOUSE_STUDIO_H1_*`. Any other key a law supplies (F3's `H1_HOUSE_MEMBER_IDS`,
  `LAB_ACCESS_MEMBER_IDS`) is deliberately unmapped, so a second eligibility source still has nowhere to
  enter. ⛔ `laws.ts`, `world.ts`, `gates.ts` untouched.
- Matrix: stage 3b (#1551 must fail F8 + F11), DC-H11/H11b, DC-H12a–d, F11 + one-authority on the
  working tree.
- Lane typecheck file list follows the converged modules.

**Canon tests updated, intent preserved** (`lib/access/__tests__/houseStudioH1Access.test.ts`,
`app/writers-studio/__tests__/studioArrival.test.ts`): they pinned #1551's *shape* — the hook taking
`params`, the inline House ternary, `body?.admitted === true` in the hook, `canUseHouseStudioH1` called
in the route. Each now pins the same decision through the converged shape (`houseWritingHref(…)`,
`useHouseStudioH1WorkClaim(h1AdmissionNeeded(params))` + `resolveH1Arrival(params, h1)` and no claim read,
settlement in the seam, `houseStudioH1AdmissionResponse(memberId)` in the route). The "no client-side
authority source", "separate from EARLY-FIELD / lab / founder", "closed default documented" and
access-matrix assertions are unchanged.

### 9.7 Proof (ruled order)

| # | Proof | Result |
|---|---|---|
| 1 | F1–F11 reference + defeat matrix | reference 11/11 · **16** candidates killed on named laws (DC-H1…H10, H8, H11, H11b, H12a–d) |
| 2 | Real implementation | 11/11 + controller wiring + one authority/one endpoint · canon @ `71859c3a` red F1/F7/F8 · #1551 red F8/F11 |
| 3 | Lane strict typecheck | 0 lane diagnostics (9 inherited listed) |
| 4 | House crossing | 163/166 |
| 5 | Studio Home | 67/67 |
| 6 | Develop | 25/25 |
| 7 | Review | 25/25 |
| 8 | #1538 | 23/23 |
| 9 | WS2-03B | 29/29 |
| 10 | Auth/session + endpoint + authority | 294/298 |
| 11 | `npm run typecheck` | **PASS** — 222 vs baseline 239, 0 new |
| 12 | `npm run build` | **PASS** — exit 0; `ƒ /api/house-studio/admission` built as dynamic; no `h1-arrival` route in the output. ⚠️ First attempt was killed by the container's OOM killer (exit 137, 15 GB box, 8 GB build heap) during page-data collection — not a compile failure; a clean rerun passed |

Breadth: all Studio suites 80/80 (884). The 7 failures in rows 4 and 10 (`lifeFacetFlowProjection`,
`facetFlowLens`, `authBoundaryMiddleware`, `journalGuardCoverage`, `handlerGuardCoverage`) fail
**identically on canon's tip** `008963af` (failing-test names diffed) — pre-existing, not repaired here.

### 9.8 Next: R3 — deployment witness, then cohort activation (two acts, never blurred)

**Deployment witness**: canonical merge SHA · image SHA · running container `GIT_COMMIT` · `/api/health`
· the converged H1 code present in the image · `HOUSE_STUDIO_H1_ENABLED` still closed.
**Then, separately, cohort activation**: initial member ids chosen and recorded · `HOUSE_STUDIO_H1_ENABLED=true`
+ `HOUSE_STUDIO_H1_MEMBER_IDS` set · restart as required · admitted and non-admitted behaviour proved in
production. First cohort deliberately small — the question is whether the crossing *feels* coherent,
not only whether it works. Sequence: **R1 law → R2 convergence → R3 deployment → R4 small-cohort observation.**

⚠️ Merge/deploy effect (unchanged from #1551, which is already canonical): until the cohort is
configured, House Writing links carry no `from=house` for any member, so the Studio return-to-House
strip does not appear; admitted members move from the ordinary Studio view to the Work arrival once
admission resolves. ⛔ #1539, #1542, production untouched.
