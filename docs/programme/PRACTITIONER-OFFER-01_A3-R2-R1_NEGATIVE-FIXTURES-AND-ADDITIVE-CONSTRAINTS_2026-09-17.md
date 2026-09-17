# PRACTITIONER-OFFER-01 · A3-R2-R1
## Negative Fixtures & Additive Relationship Constraints

**Status:** CLOSED — PASS

**Date:** 2026-09-17

**Canonical base:** `7ee173db0d54f7340353316d11729b88480434a5`

**A3-R2 evidence parent:** `b17f69c68cc443da1dcf110e3b597489004f85bb`

**Database-witnessed repair:** `4170f1bdac368febf3e70e4f3e97c4291164caa5`

**Feature branch:** `feature/practitioner-offer-a3-r2-r1-relationship-constraints-20260917`

## Authority spent

This unit was authorized to turn the frozen A3-R2 relationship-binding evidence into deliberately bounded repairs:

1. establish negative cross-practice fixtures before repair;
2. make application reads and mutations prove the same practice, client, service, session, team, participant, or member relationship they rely upon;
3. add explicit practice/team identity where legacy columns carry a different identity kind;
4. add constraints as `NOT VALID` so new contradictions are refused while existing contradictions remain visible;
5. reconcile only named synthetic fixture IDs;
6. validate constraints only after the adjudication ledger is empty.

No authority was granted or spent for a pull request, merge, production migration, deployment, automatic identity reconciliation, consent atomicity redesign, or commercial claim.

## Canonical reconciliation

During closure, `origin/clean-main-no-secrets` advanced from `8b80ec21` to `7ee173db`. The delta touched only:

- `data/ain/corpus-admission.json`
- `docs/corpus-authority/elemental-alchemy.md`
- `docs/programme/CORPUS-CLASSIFICATION-EA-01_2026-09-16.md`
- `lib/corpus/admission.ts`

There was no changed-path overlap with A3-R2-R1. The A3-R1, A3-R2, and A3-R2-R1 commits rebased cleanly onto `7ee173db`; no conflict resolution or semantic substitution was required.

## Repair result

### Application containment

- Practitioner identity lookup now fails closed unless exactly one active practice exists for the authenticated member.
- Studio session and booking projections use composite client/service ownership joins.
- Session creation proves client and service ownership before insertion.
- Service deletion proves ownership before checking dependent sessions.
- Booking mutation and Session Room linkage prove the booking/practice/client/member tuple.
- A member's ordinary solo Session Room record is not silently assigned to a practice they happen to own.
- Session agreements and join tokens prove the exact practice/session/client relationship.
- Legacy Stellium session routes derive member and practice identity from authentication rather than accepting request-supplied authority.
- Prepare/session-history and Studio writeback carry both member identity and explicit practice-record identity.
- Follow-up generation and delivery prove the session/artifact/client/practice tuple; contact consent is scoped through the canonical client–practice relationship.
- Portal invitation creation and claims prove member/practice/client identity; development fallbacks were removed from the repaired paths.
- Encounter creation and updates prove meeting/practice and person/team ownership inside the transaction.
- Threshold and consent reads prove encounter/team/participant relationships.

### Additive database contract

The preparation migration adds:

- `practitioner_record_id` to `practitioner_sessions`, `scribe_sessions`, `session_artifacts`, and `client_invites`;
- `team_id` to `encounter_participants`;
- exact-evidence backfills only;
- an IDs-only `relationship_binding_adjudications` ledger;
- 11 supporting composite unique keys whose first column is already the record primary key;
- 35 `NOT VALID` foreign-key/check guards;
- deferred reciprocal-link disagreement triggers for Studio bookings and Session Room records.

The validation migration refuses to run while any adjudication remains open, then validates exactly the same 35 guards.

| Guard area | Count |
|---|---:|
| Studio sessions and booking requests | 6 |
| Legacy practitioner sessions | 5 |
| Session Room and reciprocal Studio links | 9 |
| Voice notes, join tokens, and artifacts | 7 |
| Client invitations | 3 |
| Encounters, participants, and consent | 5 |
| **Total** | **35** |

## Database lifecycle witness

The witness ran against PostgreSQL 17.7 in a disposable database named `maia_a3_r2_r1_gate`. It cloned schema only from the local production-shaped `maia_consciousness` database, inserted only explicitly labeled synthetic model records, and dropped the disposable database on exit.

The first run correctly exposed a trigger-row-type defect before reconciliation: a shared trigger condition mentioned `booking_id` while executing on `sessions`. The trigger was repaired to dispatch by table before accessing table-specific `NEW` fields. The complete lifecycle was then rerun from a fresh disposable database.

Final result:

| Evidence | Result |
|---|---:|
| Frozen mismatch metrics | 17/17 observed |
| Relationship guards after preparation | 35/35 present and unvalidated |
| Explicit adjudication rows | 15 open |
| New cross-boundary write refusals | 14/14 refused with expected SQLSTATE |
| Reciprocal Session Room disagreement | Refused (`P0001`) |
| Validation with open adjudications | Refused |
| Explicit synthetic adjudications resolved | 15/15 |
| Mismatch metrics after reconciliation | 0 |
| Relationship guards after validation | 35/35 validated |
| **Lifecycle total** | **40 PASS / 0 FAIL** |

Historical contradictions were not hidden by preparation: the pre-migration and post-preparation census outputs were byte-identical. Reconciliation updated only the exact UUIDs declared in the synthetic fixture file.

## Repository verification

| Gate | Result |
|---|---|
| Targeted relationship/security tests | 13 suites, 61 tests passed |
| Full TypeScript candidate vs. rebased parent | 275 vs. 275 diagnostics; normalized output byte-identical |
| Normalized TypeScript evidence hash | `6ecc871d8481a4e9452ced42314bd38a59354787c00ff88165cdf7d0f98dad63` |
| Private-route guard | PASS |
| Backend-import guard | PASS |
| Member-owned boundary | PASS; 6,418 application files scanned |
| Member-identifier log guard | PASS; baseline debt reduced from 534 to 531 |
| Internal-import guard | PASS with the repository's 44 warn-only unresolved imports |
| Leak guard | PASS |
| Diff whitespace check | PASS |

The TypeScript tree is not globally clean; it contains 275 pre-existing diagnostics. The repair adds no diagnostic: after normalizing only the absolute worktree path, the parent and candidate outputs are byte-identical.

## Deliberately unresolved

- Portal slug binding, revocation semantics, and invitation secret custody remain outside this unit and should receive their own bounded A3-R3 authority.
- Consent issuance atomicity was not redesigned.
- No ambiguous historical identity was guessed or automatically reconciled.
- Legacy identity columns were not renamed or removed; additive columns preserve compatibility while making identity kinds explicit.
- Duplicate client/session authority consolidation remains a product-architecture successor concern.
- The dormant `session_voice_notes` surface was not promoted into a new authority.
- The supporting unique constraints use ordinary transactional DDL because the migration runner wraps files in a transaction. Production lock timing must be witnessed before any deployment authority is considered.
- The repository's pre-existing TypeScript and warn-only internal-import baselines remain open and were not smuggled into this repair unit.

## Closure ruling

**A3-R2-R1 closes PASS.**

The repaired application paths refuse known cross-practice joins, new database contradictions are blocked immediately, historical contradictions remain observable until explicitly adjudicated, and validation cannot proceed while the ledger is open.

No production data was read into the fixture set, no production database was mutated, and no PR, merge, or deployment was performed.

## Proposed next bounded authority

`PRACTITIONER-OFFER-01 · A3-R3 — PORTAL IDENTITY, REVOCATION & SECRET CUSTODY`

It should begin with a read-only contract/evidence freeze for slug-to-practice binding, invitation revocation, replay resistance, credential hashing/rotation, and client-session invalidation before any further repair.
