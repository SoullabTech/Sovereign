# H1-COHORT-GATE-01 · Cohort Boundary and Context Authority · census and propagation design · 2026-10-01

```text
Class: A programme · R1 read-only census + propagation decision + falsifier design
Governing law: docs/programme/H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md (#1544, canonical 71859c3a)
Census baseline: 71859c3a
Standing: CENSUS COMPLETE · PROPAGATION DECISION PROPOSED · FALSIFIERS DESIGNED
          · ⛔ NO RUNTIME CODE · ⛔ NO UI
Untouched by this lane: #1539, #1542, production (04005ca7c)
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

Founder ruling on §3 (propagation) and §4 (falsifier set). Then: falsifiers and defeat candidates
built and proven lethal, then implementation, then H1 admission against the population matrix
on a recorded origin.
