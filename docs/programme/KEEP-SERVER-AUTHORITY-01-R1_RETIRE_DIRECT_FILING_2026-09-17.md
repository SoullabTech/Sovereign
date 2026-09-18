# KEEP-SERVER-AUTHORITY-01-R1 — Retire Duplicate Direct-Filing Authority

**Date:** 2026-09-17  
**Class:** Class A — consent / Sanctuary / persistence authority boundary  
**Governing authority:** canonical KEEP-SPEECH-ACT-01 closure; J11 Grant–Effect Boundary; Sanctuary non-retention doctrine  
**Current gate:** bounded source repair + exact-head review  
**Evidence subject:** live `/api/sovereign/app/maia/list` conversational-Keep sidecar and its persistence effect  
**Stop boundary:** no client Keep redesign; no `keepSource` redesign; no schema/migration; no retired Oracle reactivation; no deployment; no production-state claim

---

## 1. Census finding

Current canonical showed a second Keep authority on the live MAIA serving route.

The member-facing `/maia` surfaces route through:

`/api/sovereign/app/maia/list`

That route correctly resolves Sanctuary and gates ordinary conversation persistence, cross-session memory, relational observation, and other durable effects with `!isSanctuary`.

A later legacy Conversational Keep block did not.

When:

`process.env.CONVERSATIONAL_KEEP_ENABLED === 'true'`

the route parsed `parseFilingInstruction({ utterance: message })` and for a high-confidence instruction immediately called:

`applyConversationalKeepResult(...)`

which converges on `keepSource(...)` and writes a durable `member_memory_atoms` row.

The block had no `!isSanctuary` condition.

Separately, `keepSource(...)` receives no Sanctuary posture and stamps newly created atoms with normal posture / member-gesture provenance. Therefore the storage layer cannot independently refuse a Sanctuary-originated invocation once the caller reaches it.

---

## 2. Authority defect

The post-KEEP-SPEECH-ACT-01 contract is:

`UNDERSTAND → FACILITATE → COMMIT`

The live server sidecar compressed that to:

`recognize → COMMIT`

for high-confidence phrases.

That was a Grant–Effect violation even outside Sanctuary: recognition authority was sufficient to cause durable persistence without a separately governed confirmation act.

Inside Sanctuary it was additionally a containment violation because the route's general Sanctuary posture did not govern this late write seam.

---

## 3. Parallel implementations

### Live sovereign route

`app/api/sovereign/app/maia/list/route.ts`

Runtime-reachable from both the primary `/maia` page and global `MaiaPresence`.

This was the repair locus.

### Legacy Oracle route

`app/api/oracle/conversation/route.ts`

Contains older Conversational Keep machinery, but the route hard-refuses all requests with HTTP 410 before reaching it because it lacks Sanctuary governance.

It remains untouched and retired.

### Legacy response endpoint

`/api/psyche/conversational-keep/respond`

Contains explicit member response shapes such as `accept_offer` and `confirm_filing`.

It remains untouched in this repair. Its future status is a separate adjudication because the current `OracleConversation` does not render the legacy `KeepAffordance` or consume server `keepIntent` responses.

---

## 4. Repair

R1 subtracts duplicate authority only.

Removed from the live route:

- `parseFilingInstruction` import;
- `applyConversationalKeepResult` import;
- `FilingInstruction` type import;
- `CONVERSATIONAL_KEEP_ENABLED` live-route branch;
- high-confidence direct filing;
- low-confidence server `filing_confirmation` response sidecar.

Nothing replaces it.

The current client Keep contract remains the authority-bearing path.

---

## 5. Regression guard

Added:

`app/api/sovereign/app/maia/__tests__/keepServerAuthorityGuard.test.ts`

It requires that the live route contain none of:

- `parseFilingInstruction`;
- `applyConversationalKeepResult`;
- `CONVERSATIONAL_KEEP_ENABLED`;
- server `keep filed` sidecar markers;
- server `filing_confirmation` sidecar markers.

It also proves the member-facing MAIA surfaces still point to the guarded live endpoint and that the legacy Oracle route remains hard-refused before its dormant Conversational Keep block.

---

## 6. Explicit non-effects

This repair does **not**:

- decide whether production previously had `CONVERSATIONAL_KEEP_ENABLED` enabled;
- inspect or mutate production data;
- alter `keepSource`;
- alter Sanctuary request semantics;
- alter the current client Keep recognizer;
- reactivate or repair the retired Oracle route;
- decide the future of the legacy `respond` endpoint;
- add schema or migrations;
- deploy.

---

## 7. Standing

```text
live server recognition → direct Keep write .... REMOVED ON CANDIDATE
live server low-confidence filing sidecar .... REMOVED ON CANDIDATE
current client Keep contract .................. UNCHANGED
Sanctuary route posture ....................... UNCHANGED
keepSource .................................... UNCHANGED
legacy Oracle route ........................... STILL 410 / RETIRED
legacy respond endpoint ....................... UNCHANGED / SEPARATE
schema / migration ............................ NONE
deployment .................................... NOT AUTHORIZED
production state .............................. NOT CLAIMED
```

**Candidate intent:** one authority path, not two.
