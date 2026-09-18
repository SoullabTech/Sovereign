# KEEP-LEGACY-SURFACE-01-R1 — Retire Legacy Respond Authority

**Date:** 2026-09-17
**Class:** Class A — consent / Sanctuary / persistence authority boundary
**Governing authority:** canonical KEEP-SPEECH-ACT-01; canonical KEEP-SERVER-AUTHORITY-01-R1; J11 Grant–Effect Boundary; Sanctuary non-retention doctrine
**Current gate:** bounded retirement + falsification complete; merge/deploy remain separate governed acts
**Evidence subject:** `/api/psyche/conversational-keep/respond`, its orphaned `KeepAffordance` client, and the canonical capsule Keep path
**Stop boundary:** no `keepSource` change; no capsule persistence redesign; no schema/migration; no retired Oracle reactivation; no deployment; no production-state claim

---

## 1. Canonical base

Repair base:

`677448106013a822156b1f972302a2077f7d8a99`

The prior Keep direct-filing retirement remained intact on this base:

- live `/api/sovereign/app/maia/list` contains no `parseFilingInstruction`;
- no `applyConversationalKeepResult` sidecar;
- no `CONVERSATIONAL_KEEP_ENABLED` live-route branch.

The legacy response endpoint remained independently executable.

---

## 2. Defect

`POST /api/psyche/conversational-keep/respond` still accepted authenticated request bodies that could exercise persistence or mutation authority without proof that a current canonical Keep affordance had been issued.

The endpoint contained:

- `accept_offer` → durable Keep write;
- `confirm_filing` → durable Keep write;
- `confirm_gesture` → atom mutation;
- `recordAccept` / `recordDecline`;
- `pauseOffers` / `resumeOffers`.

It had no Sanctuary posture, no enablement gate, and no pending-offer or confirmation token proving a prior governed facilitation act.

This made it a second executable COMMIT authority outside the canonical capsule Keep flow.

---

## 3. Canonical Keep authority preserved

The current member-facing flow remains:

```text
UNDERSTAND
  detectKeepIntent()

FACILITATE
  open / prepare an unsaved Keep preview

member reviews

COMMIT
  POST /api/capsules

durable persistence
```

`/api/capsules/from-chat-window` retains zero durable write authority and returns an unsaved draft.

No capsule persistence contract changes in this lane.

---

## 4. Retirement

The legacy respond route now hard-refuses every POST with HTTP **410**:

`LEGACY_KEEP_RESPOND_RETIRED`

The route contains no:

- `applyConversationalKeepResult`;
- `keepSource`;
- `applyAtomGesture`;
- keep-governor mutations;
- legacy accept/confirm switch cases.

The refusal is unconditional so stale clients fail closed instead of reaching a compatibility path.

---

## 5. Proven-dead client residue

Whole-tree executable-code census on the candidate established:

- no executable consumer of `KeepAffordance` outside its own file;
- no executable caller of `/api/psyche/conversational-keep/respond` outside that component;
- no executable `NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED` consumer;
- no executable consumer of `sessionOfferCountRef`, `lastOfferTurnRef`, or `conversationTurnRef`.

Remaining references were historical documentation, the regression test, and typecheck baseline metadata.

Therefore this lane also removes:

- the unused `KeepAffordance` import/type residue from `OracleConversation`;
- the dead client feature flag;
- stale keep-offer runtime refs;
- the unreferenced `components/psyche/KeepAffordance.tsx` component.

Historical specifications remain unchanged as provenance.

---

## 6. Falsifier first

Guard:

`app/api/psyche/conversational-keep/__tests__/legacyRespondAuthorityGuard.test.ts`

The same guard was run against untouched base `677448106...`.

### Untouched canonical result

**3 failures / 3 passes**.

Expected failures proved the test distinguished:

1. executable legacy respond authority;
2. stale `KeepAffordance` runtime residue in `OracleConversation`;
3. existence of the orphaned component.

The canonical capsule path and retired Oracle controls still passed.

### Candidate result

**6 / 6 PASS.**

---

## 7. Bounded acceptance population

Candidate head before this record:

`ee0b9e5db7d4b71aa8120ab64127a42be696365f`

Seven suites:

- legacy respond retirement guard;
- prior server-authority retirement guard;
- relational Sanctuary containment;
- client Keep intent;
- client Keep wiring;
- Keep-open non-persistence;
- independent Library Keep seam.

Result:

**7 suites / 116 tests PASS.**

Whole-tree executable-code grep after retirement returned no live references to:

- `KeepAffordance`;
- `/api/psyche/conversational-keep/respond` outside the retired route/test.

Repository gates:

- `npm run check:no-supabase` → **PASS**
- `git diff --check` → **PASS**
- `npm run typecheck` → **229 errors vs baseline 239 · 0 regressions**

---

## 8. Explicit non-effects

This lane does **not**:

- change `keepSource`;
- change the canonical capsule confirmation write;
- change `detectKeepIntent`;
- re-enable conversational salience offers;
- reactivate the retired Oracle conversation route;
- rewrite historical specifications;
- add schema or migrations;
- inspect or mutate production data;
- deploy.

---

## 9. Standing

```text
legacy respond persistence authority ....... RETIRED ON CANDIDATE
legacy respond mutation authority .......... RETIRED ON CANDIDATE
legacy respond endpoint .................... 410 FAIL-CLOSED
KeepAffordance executable consumers ........ NONE
KeepAffordance component ................... REMOVED ON CANDIDATE
dead client feature flag / runtime refs .... REMOVED ON CANDIDATE

canonical capsule Keep flow ................ UNCHANGED
live MAIA server direct filing ............. STILL RETIRED
legacy Oracle conversation route ........... STILL 410 / RETIRED
keepSource ................................. UNCHANGED
schema / migration ......................... NONE

bounded population ......................... 116 / 116 PASS
typecheck .................................. 229 vs 239 · 0 regressions
check:no-supabase .......................... PASS
git diff --check ........................... PASS

deployment ................................. NOT AUTHORIZED
production state ........................... NOT CLAIMED
```

**Candidate intent:** retire the obsolete authority surface; do not rehabilitate it.
