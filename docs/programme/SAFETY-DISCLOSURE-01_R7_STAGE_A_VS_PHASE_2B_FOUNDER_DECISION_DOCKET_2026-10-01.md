# SAFETY-DISCLOSURE-01 · R7 — Stage A vs Phase 2B Founder Decision Docket

**Date:** 2026-10-01
**Status:** FOUNDER DECISION REQUIRED · no implementation
**Parent:** R3 PHI census + R4 resolver + R5/R6 result/copy law

## Decision

Should a future member-controlled `Message my practitioner` safety off-ramp be allowed to use the current `client_messages` Stage A dual-write substrate, or must implementation wait until Phase 2B encrypted-only enforcement is active?

## Facts already settled

- client-message free text is PHI by default;
- current client-message writes are Stage A dual-write: plaintext `body` plus encrypted `body_enc` and metadata;
- current reads are still plaintext-first in the dedicated accessor;
- Phase 2B is not structurally active for `client_messages`;
- no active migration enforces plaintext NULL / encrypted-only writes;
- the future off-ramp remains member-initiated and may not auto-send or auto-select urgency;
- #1694 (or equivalent) must be admitted before reuse of portal message service semantics;
- R5/R6 forbid describing provider acceptance as human receipt.

## Option A — permit the bounded use during Stage A

Founder would authorize only this additional use of the existing Stage A message substrate:

- an authenticated member explicitly opens the practitioner composer;
- the member chooses the recipient when more than one is eligible;
- the member authors/reviews the exact outgoing text;
- any copy of the current MAIA utterance requires a second explicit member act;
- `safety_concern` remains member-selected;
- no hidden MAIA context, analysis, risk score, memory, or history is included;
- email remains link-only by default;
- R5 truthful result states govern confirmations;
- the ordinary deterministic crisis response remains independent of messaging availability.

### What Option A accepts

Until Phase 2B, the member-authored safety-adjacent message would exist in both plaintext and encrypted columns according to the already-sanctioned Stage A doctrine.

Option A does not authorize new plaintext fields, logging, exports, model access, or a durable crisis/risk record.

### Option A exit obligation

When Phase 2B reaches `client_messages`, this use must migrate with the table automatically; Option A creates no right to preserve plaintext writes.

## Option B — wait for Phase 2B

No MAIA safety off-ramp is implemented until `client_messages` satisfies the Phase 2B exit conditions:

- encrypted-first/only read authority is active;
- new plaintext writes are structurally prevented;
- no production fallback requires plaintext;
- CI rejects reintroduction of plaintext writes;
- the relevant accessor/docs identify encrypted storage as authoritative.

### What remains available under Option B

The canonical deterministic crisis response continues unchanged.

Existing portal messaging remains governed by its existing contracts; R7 does not disable or widen it.

Once Phase 2B is witnessed, the off-ramp may reopen at implementation design without revisiting the basic member-act disclosure law.
## Not decided by either option

Neither option authorizes:

- automatic disclosure;
- imminent-danger exception behavior;
- legal-duty behavior;
- emergency-contact preauthorization;
- a new UI surface by itself;
- practitioner notification without the member Send act;
- hidden-context sharing;
- a claim that provider acceptance means human receipt.

## Exact founder ruling form

Choose one:

**A — Stage A bounded use permitted.**

The future member-controlled safety off-ramp may use the current Stage A `client_messages` dual-write substrate subject to every R2–R6 boundary and #1694 prerequisite above. This does not authorize implementation by itself; it removes only the PHI-stage hold.

**B — Hold until Phase 2B.**

The future member-controlled safety off-ramp remains implementation-blocked until encrypted-only `client_messages` handling is structurally witnessed. Existing deterministic safety response and existing portal messaging remain unchanged.

## Standing

**FOUNDER DECISION OPEN · BOTH OPTIONS PRESERVE MEMBER-ACT DISCLOSURE LAW · NO CODE OR SEND PATH AUTHORIZED BY THIS DOCKET.**
