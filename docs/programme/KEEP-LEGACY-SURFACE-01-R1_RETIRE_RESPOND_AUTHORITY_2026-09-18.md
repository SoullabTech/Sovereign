# KEEP-LEGACY-SURFACE-01-R1 — Retire Legacy Respond Authority

**Date:** 2026-09-18
**Class:** Class A — consent / Sanctuary / persistence authority boundary
**Governing authority:** canonical KEEP-SPEECH-ACT-01 closure; KEEP-SERVER-AUTHORITY-01-R1; J11 Grant–Effect Boundary
**Current gate:** bounded retirement + falsification
**Evidence subject:** `POST /api/psyche/conversational-keep/respond`
**Stop boundary:** no client Keep redesign; no `keepSource` redesign; no schema/migration; no production deployment; dead UI cleanup only if independently proven safe

---

## 1. Canonical context

Initial canonical at lane open:

`ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`

Merge-ready reconciliation base after intervening canonical work:

`5b2f4d55698c977cba004ff732c8b8419b0b9c6f`

The four commits added after the prior R1 witness are J8 documentation-only changes. Their changed-file set has zero overlap with this R1 patch; R1 was therefore cleanly rebased onto `5b2f4d556...` before the final witness.

The legacy respond route and `KeepAffordance` blobs were unchanged across the 91 commits since KEEP-SERVER-AUTHORITY-01-R1 closed.

The current `OracleConversation` still does not render the legacy affordance, does not send `keepRuntimeState`, and does not consume server `responseData.keepIntent`.

Canonical Keep instead follows the capsule path:

`UNDERSTAND → FACILITATE → COMMIT`

with preview preparation separated from durable `POST /api/capsules`.

---

## 2. Defect

The legacy endpoint remained independently executable even though its original UI/server producer path was obsolete.

It accepted authenticated request bodies such as:

- `accept_offer`
- `confirm_filing`
- `confirm_gesture`

and could call `applyConversationalKeepResult(...)`, which converges on durable atom creation or mutation.

The route had no Sanctuary concept, no feature flag, and no proof that a prior affordance had actually been issued.

Therefore it remained a second COMMIT authority.

---

## 3. Repair

R1 retires executable authority first.

The route now:

- returns HTTP **410 Gone**;
- returns code `LEGACY_KEEP_RESPOND_RETIRED`;
- names `/api/capsules` as the canonical successor;
- names the canonical `UNDERSTAND → FACILITATE → COMMIT` contract;
- does not authenticate;
- does not parse a body;
- imports no conversational-Keep persistence bridge;
- imports no governor mutation API;
- cannot mint or mutate atoms.

No replacement authority is added.

---

## 4. Falsifier

Added:

`app/api/psyche/conversational-keep/respond/__tests__/retirementGuard.test.ts`

It requires:

1. HTTP 410 retirement marker;
2. absence of auth/body parsing and legacy mutation/persistence symbols;
3. explicit successor and contract naming.

The test was committed before the repair. Against the pre-repair route it is expected to fail because the forbidden executable authority is present.

---

## 5. Dead UI residue

After the executable endpoint was retired, repository-wide `git grep` was repeated against merge-ready canonical `5b2f4d556...`.

It established:

- `KeepAffordance` had one external reference only: its unused import in `OracleConversation`;
- `/api/psyche/conversational-keep/respond` had one caller only: `KeepAffordance`;
- `NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED` appeared only at its dead declaration;
- `sessionOfferCountRef`, `lastOfferTurnRef`, and `conversationTurnRef` appeared only at declaration sites.

That evidence was sufficient to remove:

- the orphaned `components/psyche/KeepAffordance.tsx` component;
- its unused `OracleConversation` import/type;
- the dead client feature flag;
- the stale message-level `keepIntent` type field;
- the three unused legacy offer-runtime refs.

Added `components/__tests__/keepLegacySurfaceResidueGuard.test.ts` to prevent reintroduction.

---

## 6. Explicit non-effects

This repair does **not**:

- alter canonical capsule Keep behavior;
- alter `detectKeepIntent`;
- alter `keepSource`;
- alter Sanctuary request semantics;
- alter the retired Oracle 410;
- add schema or migrations;
- inspect or mutate production data;
- deploy.

---

## 7. Exact-head evidence

On rebased candidate `177af17a777f2c29aef17cdf31384e6dac881bd1` before this evidence-only record update:

- bounded Keep population: **5 suites / 96 tests PASS**;
- legacy respond retirement guard: PASS;
- legacy surface residue guard: PASS;
- canonical capsule Keep non-persistent preparation: PASS;
- canonical client Keep matcher/wiring: PASS;
- `npm run check:no-supabase`: PASS;
- `git diff --check origin/clean-main-no-secrets...HEAD`: PASS;
- TypeScript: **229 vs baseline 239 · 0 regressions**.

Falsifier control: the retirement guard was copied unchanged onto untouched merge-ready canonical `5b2f4d556...` and failed **3 / 3** assertions. The canonical pre-repair route still authenticated, parsed command bodies, exposed the legacy persistence/governor path, and did not name the canonical capsule successor.

Repository-wide exact-SHA `git grep` on `5b2f4d556...` also proved the removed UI residue had no remaining consumer beyond the dead wiring documented above. `lib/psyche/portfolio.ts`, `lib/psyche/sources/capsule.ts`, the retired Oracle conversation route, and all schema/migration paths are unchanged by the candidate.

---

## 8. Standing

```text
legacy respond COMMIT authority ........ RETIRED ON CANDIDATE
legacy route status .................... 410
auth/body parsing ...................... REMOVED
atom mint/mutation bridge .............. REMOVED
canonical capsule Keep ................. UNCHANGED
keepSource ............................. UNCHANGED
dead KeepAffordance residue ............ REMOVED ON CANDIDATE
schema / migration ..................... NONE
deployment ............................. NOT AUTHORIZED
production state ....................... NOT CLAIMED
```
