# CIRCLE-04 · R2 — the FR-05 removal contract

**Status:** IMPLEMENTED · ⛔ **NOT VERIFIED — no database or dependencies in a remote session.**
**Scope:** C7 + C8 + T3 as one repair family. R3 not started.

---

## ⚠️ Read before running the verifier

**R2 adds a migration.** `database/migrations/20260906000003_circle_membership_removals.sql` is on
the branch and **not applied to any database.** Until it is applied to whatever database the
verifier runs against, **C7, C8 and the whole T3 family will FAIL on a missing table** — which is a
migration-state result, not a repair result.

The R2 gate therefore needs the migration applied first. On the production path that is
`scripts/deploy-production.sh` (the full path runs migrations); for a candidate-only check, apply
the single migration to the target database before running the verifier.

## 1. Evidence architecture — census first, as instructed

| Candidate | Verdict |
|---|---|
| **`audit_logs`** (`20260828000001`) | ⛔ **Rejected.** Scoped to authentication attribution (AUTH-AUDIT-01), and its own contract states metadata must never carry member-authored content. **`grounds` is member-authored text.** |
| **`team_message_deletion_audit`** (`20260618000002`) — actor + reason columns on the acted-upon row | ⛔ **Rejected, and this is the load-bearing finding.** `circle_memberships` is upserted by `joinWithInvite()` on `ON CONFLICT (circle_id, member_id)`. A removed member who later rejoins with a valid invite would **overwrite the row carrying their own removal record.** *Governance evidence that an ordinary subsequent action can silently erase is not evidence.* |
| **`commons_event_reports`** (`field_rooms`) | Not applicable — a reporter-initiated complaint table, not a membership transition, and it has no code references. |

**No established append-only membership-transition record exists in this repository.** So this is
the founder-named fallback: the smallest representation preserving *circle · removed member ·
acting facilitator · grounds · timestamp · resulting membership state.*

`circle_membership_removals` — append-only, six required fields, **no `updated_at` column and no
trigger** (a row that can be updated is not a record of what happened), and **no foreign keys**,
following the reasoning already established for `audit_logs`: a record must survive deletion of what
it describes. Every other `circles_commons` table cascades from `circles(id)`; a removal record that
cascaded away with the Circle would destroy the review evidence at the moment it might be needed.

**Not recorded, deliberately:** IP, user agent, device — same reasoning as the message-deletion
audit. A sovereignty-first system does not accumulate speculative surveillance data with no
consumer.

## 2. What landed

| File | |
|---|---|
| `database/migrations/20260906000003_circle_membership_removals.sql` | the append-only record |
| `lib/circles/removalService.ts` | the contract |
| `app/api/circles/[circleId]/members/[memberId]/remove/route.ts` | reachable act, gated by `requireCircleAccess` |

All ten required semantics, in one atomic operation:

1. remover authority verified **inside that Circle** — role is held in the Circle, never globally;
2. ordinary-member removal and self-removal both refused (`ROLE_INSUFFICIENT`, `SELF_REMOVAL`);
3. actor recorded; 4. grounds recorded, **required and non-blank**; 5. timestamp recorded;
6. membership moved out of active standing; 7. shares revoked **in the same transaction**;
8. source material untouched — only `revoked_at` is set; 9. other Circles unaffected;
10. nothing evaluates `grounds`. **The module records; it does not judge.**

**Atomicity:** authority check, revocation, status change and the record all run on one client, so
`member = removed` with `shares = still visible` is never externally observable. Revocation
consequence is identical to `leaveCircle()`; only the authority differs, which is what FR-05
requires.

**The review workflow (CA-10) is not built** — but `listRemovalsForMember()` exists so the evidence
is reachable without reconstructing history when it is.

## 3. ⚠️ Finding: the contract is implemented but unreachable

**Nothing in this codebase can make anyone a facilitator.** `createCircle()` assigns the creator
`'helper'`; `joinWithInvite()` assigns `'member'`; **no code path anywhere assigns `'facilitator'`.**

FR-05 says *an authorized facilitator may enact removal*. Implemented exactly that. Widening the
gate to `'helper'` would make removal usable today — and would be **Jarvis inventing the facilitator
policy FR-05 reserved to the founder.** Recorded as a finding instead of quietly resolved.

**Consequence:** removal is falsifiable by the verifier (which creates a facilitator fixture) but
cannot occur in production until role assignment exists. **That is a separate defect and a founder
question**, adjacent to the still-open facilitator half of FR-05.

## 4. Verifier — C7/C8/T3 now test semantics, not spelling

C7 and C8 were source-token checks that could only report that some string existed. **Both moved
into Group T**, where they interrogate the live schema, and T3 became a family that drives the
**real** `removeMemberWithClient()` on the rolled-back client.

A small testability seam makes that possible: the contract is exported as
`removeMemberWithClient(client, input)`, with `removeMember(input)` wrapping it in `transaction()`.
The verifier drives the same SQL, in the same order, with the same atomicity — inside a rollback.

| | Asserts |
|---|---|
| **C7** | the removal record exists with circle · member · actor · grounds · state · time |
| **C8** | append-only (no `updated_at`), grounds required and non-blank, self-removal not recordable |
| **T3a** | an ordinary member cannot remove another member |
| **T3b** | self-removal refused — leaving is a different act |
| **T3c** | removal without grounds refused |
| **T3d** | an authorized facilitator can enact removal |
| **T3e** | the act records actor and grounds |
| **T3f** | removal cuts access |
| **T3g** | removal revokes the removed member's shares |
| **T3h** | the original source material is untouched |
| **T3i** | memberships in other Circles are untouched |

**No existing passing assertion was weakened.** C13 now covers **17** routes (the new removal route
included).

## 5. Expected direction — an expectation, not evidence

**With the migration applied:** C7 · C8 · T3a–T3i PASS; C6 and S4 remain FAIL, belonging to R4 and R3.
**Without it:** C7, C8 and T3a–T3i fail on the missing table — migration state, not repair state.

⛔ No target total is manufactured. `0 failed` remains the eventual gate, and it is not reachable
until R3 and R4 land.

## 6. What R2 does not do

No lifecycle work · `response_count` untouched · no review workflow · no deploy · founder gate
untouched · no cohort · no role-assignment path.
