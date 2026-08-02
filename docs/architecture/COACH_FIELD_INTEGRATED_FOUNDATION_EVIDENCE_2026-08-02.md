# Coach Field — integrated foundation: evidence

**Date:** 2026-08-02
**Branch:** `feature/coach-field-integrated-foundation` (from trunk `7c9dd5192`)
**Isolated database:** `maia_coachfield_integration`, owned by this lane. Built from committed
files only. The shared dev database was inspected as forensic evidence and treated as the
source of truth for nothing.

---

## What this lane produced

| Commit | What |
|---|---|
| `e846af2d3` | M1 — `practitioner_clients` becomes the canonical relationship record (cherry-picked from the shared branch) |
| `f072ad556` | the other lane's service + verifier commit, imported for review (cherry-picked) |
| this commit | corrected downstream migration, identity translation, invitation lifecycle, rewritten boundary gate |

Deliberately **not** brought across: the mixed preservation commit and the support-desk UI.
The old branch is left intact as evidence and was not rewritten.

## Canonical / retired

**One spine, one queue.**

- Canonical: `practitioner_clients` (relationship) · `practitioner_client_reconciliation`
  (queue) · `practitioner_client_reconcile()` (mechanism) · invitation-claim provenance on
  `client_invites.claimed_by_member_id`.
- Retired: `coach_client_relationships` · `coach_relationship_reconciliation` · the donor
  migration in executable form (never brought onto this branch) · the three donor services,
  which authorized against the rejected spine and assumed both parties were members. Their
  design survives in `f072ad556`; their identity model does not.

## Required evidence

| # | Claim | Result |
|---|---|---|
| 1 | no `coach_client_relationships` table | **PASS** — `to_regclass` null after full build |
| 2 | all new relationship FKs target `practitioner_clients.id` | **PASS** — 12/12 `relationship_id` FKs; 0 point elsewhere |
| 3 | one reconciliation queue only | **PASS** — `practitioner_client_reconciliation` is the only match |
| 4 | pending invitations work without `member_id` | **PASS** — gate 4a–4g, incl. re-invite finding the same row, and no member-shared read while pending |
| 5 | claimed invitations bind the correct member | **PASS** — gate 5a–5g, incl. provenance preserved, second claimant refused, same claimant idempotent |
| 6 | linked relationships cannot be repointed or unlinked | **PASS** — gate 6a–6b (DB trigger, not service-level politeness) |
| 7 | ambiguous legacy records are queued, not guessed | **PASS** — gate 7a–7c; 8 match states verified in `verify-practitioner-relationship-m1.sql` |
| 8 | practitioner identity translation is explicit | **PASS** — gate 8a–8d against `lib/coachField/identity.ts` |
| 9 | private-note publication boundaries hold | **PASS** — gate 9a–9e |
| 10 | client-position sharing boundaries hold | **PASS** — gate 10a–10e |
| 11 | migrations run from zero and idempotently | **PASS with a named exception** — see below |
| 12 | refusal probes fail for the intended reason | **PASS** — every probe asserts the message, not merely that it threw |

Gate: `40 passed · 0 failed`, fixtures cleared before and after, none surviving.
M1 acceptance: `17 assertions, all passed`, transaction rolled back.

### 11 — the named exception

Building from an empty database and applying all 437 committed migrations in order:
**405 apply, 32 fail.** None of the 32 is from this lane, and every dependency this lane
needs (`members`, `practitioners`, `practitioner_clients`, `client_invites`,
`library_sources`, `field_program_positions`, `update_updated_at_column`) is present.
The first failure is `20251231_memory_architecture_enhancements.sql`, which references
`developmental_memories` before anything creates it.

**The repository has no reproducible from-zero schema.** That is a pre-existing defect, out
of scope here, and recorded rather than worked around. This lane's two migrations apply
cleanly from zero and are idempotent on re-run (verified twice, table count stable at 21).

## Rulings encoded structurally, not by convention

- **M1** — `member_id` write-once via `practitioner_client_link_guard`; uniqueness binds only
  *active* relationships and *pending* invitations, so re-engagement is possible without
  overwriting history.
- **M2** — four axes cannot impersonate each other. `field_program_positions` is untouched and
  has no practitioner-facing read. What a practitioner may see is a verbatim, forward-only,
  revocable snapshot in `coach_position_shares`, whose `stated_by` admits no
  practitioner-authored value. Stage history is append-only.
- **M3** — the source note has **no** `visibility` and **no** `published_at`. Publication cannot
  happen by editing because nothing on the note expresses publication; it is a separate object
  carrying its own snapshot. This replaced the donor's session-variable trigger guard: a
  boundary unreachable by construction beats a guard clause.
- **M4** — enrollment is a real record, distinct from access, invitation and visibility; a
  pending enrollment activates on acceptance; re-enrolment adds a row.
- **M5** — `originated_by_*` ≠ `recorded_by_*`, and a commitment requires `member_affirmed_at`.
  Larry entering something cannot make it the client's commitment.

## Named service invariant

> A column named `practitioner_id` cannot be interpreted without its table contract.

Proven in the live schema: `practitioner_clients.practitioner_id → practitioners(id)` while
`client_invites.practitioner_id → members(id)`. Four tables, one name, two referents.
Translation lives once, in `lib/coachField/identity.ts`, behind branded types that make the
two ids non-interchangeable at compile time. No route improvises it.

## Consequences worth knowing

- **History is not deletable.** Append-only triggers refuse DELETE including via cascade, so a
  relationship cannot be hard-deleted once it has history. This is the ruling working —
  ending a relationship, not deleting it, is the supported path. The test harness suspends
  those triggers explicitly and locally to clear its own fixtures; nothing in the application
  may do that.
- **Legacy `practitioner_clients.status` is deprecated and not mirrored.** The three historical
  vocabularies disagree (`completed` / `inactive` / `waitlist` are not shared), and any
  automatic mapping would invent a meaning the source never carried.

## Not yet done on this lane

The three donor services were removed rather than adapted. Practitioner services and UI are
the next step, on this branch: the caseload/client-process workspace, the duplicate doors
(`/studio/caseload` and `/studio/clients` both read `/api/studio/clients`), the mature Client
Notes section across coaching, facilitation, mentoring, education and spiritual direction, and
the contextual client home as the second view of the same records.
