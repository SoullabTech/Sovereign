# Writer Gate 3 — durable Send gesture receipt (Class A design only)

**October 23, 2026 · DRAFT / HOLD · NOT AN IMPLEMENTED SERVER CONTRACT OR RELEASE AUTHORITY**

## Why this separate acceptance gate exists

The current protected JARVIS Writer HTTP POST route is relationship-bound and correctly verifies the member's original Work/relationship/thread before writing the author's act. However, its allowed request fields are threadId, act, sanctuary, scope, proposalPolicy, relationshipId and carry. There is no ruled identity for *one explicit Send gesture*. After relationship preflight, each allowed HTTP invocation calls persistMemberEditorialAct, then runEditorialTurn. The member-act implementation appends an ask_turns row in a transaction and has no demonstrated durable replay receipt for Send.

The primary-key constraint on (thread_id, turn_index) prevents duplicate turn indexes. It is not a proof of once-only gesture semantics: sequential accepted POSTs can append separate acts; simultaneous POSTs can contend or fail. A two-request unit test with mocked storage reproduces repeated callback invocations, **not actual duplicate persisted turns**. Neither identical text nor a client-minted UUID is authorization.

## Existing related but distinct precedent

The owner-current explicit **Save working version** path has a genuine separate receipt architecture: writer_editorial_save_receipts with unique (member_id, idempotency_key), current Work/A2/immutable origin validation, transactional advisory locking on the gesture identity, stored version comparison rather than logging/hashing author words, and an exact replay/conflict response. Source-specific PostgreSQL tests exercise simultaneous first-Save convergence. **Do not reuse Save receipts as Send receipts**, or conflate authored Save with a model-bound editorial Send.

## Proposed independent acceptance invariants

1. **One writer gesture, one scoped identity**: user action carries a stable opaque gesture reference through genuine transport retries. The identifier alone cannot authorize anything. Bind to canonical authenticated member, current original Work, manuscript, server-verified relationship A2 and creation-expression epoch, original editorial thread, and the exact author act kind/wording/reference. Preserve Work switch / revocation / signout refusal. Distinct explicit gestures, even identical wording, must remain distinct.
2. **Reservation before author mutation**: persistent, content-free receipt with a UNIQUE gesture key; atomic concurrency arbitration in the same trusted DB transaction that appends the author act and its binding. A second caller cannot append or dispatch while the first is in flight. If its first transaction fails, no success/act receipt is fabricated.
3. **Truthful replay**: a matching duplicate returns the already persisted act index and its *current authorized* progress/result where safe; a changed payload under the same gesture returns a fixed conflict. Compare author wording only in a protected store, not public logs, short hashes or reconstructive receipt fields. A replay never chooses another Work/A2 silently.
4. **Inference state separate from author persistence**: the author act can be durable when provider inference is refused. Record boundary/disclosure attempt truth before an external request; confirm crossed only when supported. After a possible provider send, transport uncertainty is not proof that nothing was sent.
5. **No implicit external retry**: if the process crashes after dispatch but before a confirmed outcome, replay/refetch must return an explicit pending/unresolved/accountability state; do not send a second model request. A real provider may charge or process an initial attempt whose status is unknown. Preserve model identity, requested/reported attribution and existing V4 disclosure_confirmation_unresolved precedence.
6. **No auto-Apply / author control retained**: MAIA response is a proposed editorial alternative with model provenance. Durable act/index receipt is not permission to alter manuscript or grant Pro/Work access. Exactly-once author Apply/Undo is governed by its separate natural authorization / one-use recovery law.
7. **No stronger claim than tested**: source-only red/green negative controls, in-memory gesture arbitration, ephemeral PostgreSQL16, true browser/React mounted and network-disconnect tests must be reported separately. Whole-program exactly-once across a network/model provider is not generally provable; aim for once-only *local author persistence* and no automatic provider re-dispatch under ambiguity.

## Required exact negative and positive witnesses before code approval

| Scenario | Required observation |
| --- | --- |
| Two immediate same-gesture HTTP POSTs | One authoritative reserved act and ≤one provider dispatch; second waits or returns safely |
| Sequential replay after client loses HTTP response | No new act, receipt, MAIA request, charge attempt or Apply |
| Different gestures with exactly the same prose | Two separate author acts, each authorized and independently attributable |
| Same gesture key with changed text / direction / target | Fixed conflict; no private wording logged, no new act or model |
| Foreign member, Work, A2, old epoch, revoked grant | No content read, write, provider call or cross-member outcome; no idempotency oracle |
| Database exception or crash at receipt creation | No false success; atomic rollback or explicitly recoverable state |
| Crash after act commit, before model request | Durable author act; safe progress readback without invented provider delivery |
| Crash during/after possibly sent provider request | Attempted/unknown receipt; no automatic second inference |
| Confirmed provider response, receipt-confirmation failure | V4 accountability-unresolved, not pre-dispatch/not-sent; preserve original act |
| Missing reported model / mismatch | Content-free refusal; no false model agreement or proposal persistence |
| Reopen, two-account isolation, Work switch, session expiry | Scoped receipt readback or fixed denial, no text bleed or automatically reused authority |

**NO CODE ADMISSION without sole protected-source owner, independent Class A/privacy/custody acceptance, exact original-file ingest POST423 and no-auto-expiry, R20 independently anchored revocation/erasure and backup antirollback, one current signed candidate, and founder GO.** The test-only [draft negative PR #1958](https://github.com/SoullabTech/Sovereign/pull/1958) intentionally fails two assertions on unchanged combined public source; do not merge or turn it green by deleting tests, matching text alone, disabling the server Work checks, or calling the provider twice.
