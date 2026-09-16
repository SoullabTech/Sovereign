# INVISIBLE-STANDING-SHADOW-02 — S1 live-shadow implementation

## Production-shaped module

`lib/writers-studio/invisibleStandingShadow.ts`

Properties:

- result type contains no `text`, `response`, or `replacement` field;
- pure synchronous audit;
- no provider/model/network/database/persistence dependency;
- response digest is internal audit evidence, not logged;
- telemetry contains only rule ids, counts, Sanctuary flag, and a hashed turn reference;
- exceptions are swallowed with a fixed content-free `audit_exception` event.

## Evidence law

The current `CanonicalTurn` provides lawful participants for this turn, not a complete historical corpus.

Direct quote rules are therefore conservative:

- exact match to eligible member-authored/retrieved evidence → pass;
- exact match only to non-member material → `observe`, never refusal;
- no exact match in the turn → `observe`, never refusal.

`member.writer_focus`, marked/placed/declared, computed and inferred blocks are not treated as verbatim member speech merely because their producer carries member standing. This avoids turning formatter language into a member quote.

## Active constitutional parity

The shadow also re-checks two already-enforced substrate-provable classes on the exact final bytes:

- declarative identity/becoming authority;
- forbidden false memory-capability claims.

Those may produce `would_refuse` in the shadow result. SHADOW-02 still does not block or rewrite the response.

## Wiring

`writersStudioCognition.ts` receives the finalized `getMaiaResponse()` result and calls the audit only when:

`response && process.env.MAIA_INVISIBLE_STANDING_SHADOW === '1'`

The audit receives `prepared.turn` plus the exact resolved `response` bytes. Its return value is ignored. `maiaService.ts` has no shadow import or call.
