# PRACTITIONER-OFFER-01 · A3-R2
## Relationship-Binding Invariants — evidence freeze

**Date:** 2026-09-17

**Authority:** read-only census and repair-plan formation

**Status:** EVIDENCE FROZEN · REPAIRS NOT OPENED

**Canonical base:** `8b80ec21060a102ee2007d12f3182049c7c6ad43`

**Feature branch:** `feature/practitioner-offer-a3-r2-relationship-binding-invariants-20260917`

**Inherited A3-R1 tree:** `211466e77d8f82e4ed60fcc2ae826dfcc921d7ac`

No application repair, schema mutation, data mutation, PR, canonical merge, or deployment is
authorized by this record.

---

## 1. Canonical and A3-R1 custody

Canonical advanced from `b2da24d8` to `8b80ec21` by a clean fast-forward. The only changed
paths were:

- `components/OracleConversation.tsx`
- `components/voice/ContinuousConversation.tsx`
- `components/voice/__tests__/safariInterimFinalization.test.ts`
- `components/voice/__tests__/voiceSilentResponseHandoff.test.ts`

None overlaps the A3-R1 containment patch or the A3-R2 ownership surfaces.

### A3-R1 close evidence

The exact A3-R1 candidate `2321a5f2` was compared with canonical `b2da24d8` in full,
non-sparse worktrees using:

```text
tsc -p tsconfig.ship.json --noEmit --pretty false
```

| Tree | Existing TypeScript diagnostics | Exit |
|---|---:|---:|
| `b2da24d8` | 275 | 2 |
| `2321a5f2` | 275 | 2 |

After replacing the two absolute worktree roots with `<ROOT>`, the diagnostic logs were
byte-identical with SHA-256:

```text
24dc76a766dcb2448bad8c9b2a24299c3613cf675172fa1d3789861c37750376
```

The requested guards passed on `2321a5f2`:

| Guard | Result |
|---|---|
| `scripts/check-private-routes.js` | PASS |
| `scripts/check-member-owned-boundary.ts` | PASS — 6,407 application files scanned |
| `scripts/check-backend-imports.js` | PASS |

**A3-R1 — Privileged Route Containment: CLOSED PASS.** The repository remains globally
non-type-clean, but A3-R1 introduced zero new diagnostics.

---

## 2. Executive finding

The central fracture is not two client tables.

`stellium_clients` is a simple, updatable view over `practitioner_clients`. There is one
underlying client/relationship authority.

The fracture is instead:

1. `practitioner_id` means `practitioners(id)` on some tables and `members(id)` on others;
2. application code crosses that identity boundary without the existing typed translator;
3. most foreign keys prove that each referenced row exists, but not that the rows belong to
   the same practice, relationship, client, or team;
4. secondary reads join client/service metadata by bare ID, so one corrupted relationship can
   turn into a cross-practice disclosure;
5. the configured synthetic dataset is too sparse to exercise these paths, so zero observed
   mismatches is not structural evidence.

The repository already states the governing law in
`docs/architecture/COACH_FIELD_FOUNDATION_INVARIANTS_2026-08-02.md` and
`lib/coachField/identity.ts`:

> `practitioner_id` has no freestanding meaning.

The current product paths do not consistently obey that law.

---

## 3. Identity domains

| Domain | Canonical identifier | Meaning |
|---|---|---|
| Person | `members.id` | authenticated human |
| Practice | `practitioners.id` | practice record / tenant |
| Relationship | `practitioner_clients.id` | bounded practitioner-client relationship |
| Team | `studio_teams.id` | Co-Lab ownership boundary |

Current conflicting columns:

| Table | Column | Actual referent |
|---|---|---|
| `practitioner_clients` | `practitioner_id` | `practitioners.id` |
| `services` | `practitioner_id` | `practitioners.id` |
| `sessions` | `practitioner_id` | `practitioners.id` |
| `encounters` | `practitioner_id` | `practitioners.id` |
| `practitioner_sessions` | `practitioner_id` | `members.id` |
| `client_invites` | `practitioner_id` | `members.id` |
| `session_artifacts` | `practitioner_id` | application writes `members.id`; no FK exists |
| `scribe_sessions` | `member_id` | `members.id` |
| `voice_notes` | `practitioner_id` | application writes `practitioners.id`; no FK exists |

`practitioners.member_id` is indexed but not unique. Both
`getPractitionerIdForMember()` and `getCurrentPractitioner()` use un-ordered `LIMIT 1`.
Therefore a member with two active practice rows is schema-valid and resolves
nondeterministically. A3-R2 must fail closed on ambiguity; it must not silently impose a
one-practice-per-person product rule.

---

## 4. Structural ownership map

| Child edge | Current structural proof | Missing invariant | Verdict |
|---|---|---|---|
| practice → client | client has FK to practice | — | sound root edge |
| practice → service | service has FK to practice | — | sound root edge |
| practice → booking/session | session has FK to practice | — | sound root edge |
| session → client | independent FK to client | client and session share practice | unbound |
| session → service | independent FK to service | service and session share practice | unbound |
| session → rescheduled session | independent self-FK | both sessions share practice | unbound/dormant |
| session → scribe session | independent FK | same practice member, client, and reciprocal booking | unbound |
| booking request → service/session | three independent FKs | service/session share request practice | unbound |
| practitioner session → member/client | independent FKs | member owns client's practice | unbound |
| practitioner session → Studio session | unique UUID only; no FK | same practice and client | unbound |
| scribe session → member/client | independent FKs | member owns client's practice | unbound |
| scribe session → booking | bare UUID; no FK | same practice/member/client | unbound |
| voice note → practice/session/client | no FKs | all three identify one relationship | unbound |
| session voice note → practice/session/client | no FKs; no application readers found | same relationship or table retirement | dormant/unbound |
| join token → scribe session/client | two independent FKs | token client equals session client | unbound |
| session artifact → member/session/client | session/client independent; member fields have no FKs | one practice/member/client relationship | unbound |
| invite → member/client | two independent FKs | member owns client's practice | unbound |
| encounter → meeting/practice/team | independent FKs | meeting shares encounter practice | unbound |
| encounter participant → person | independent FK | person shares encounter team | unbound |
| consent event → encounter/participant | independent FKs | participant belongs to encounter | unbound |
| media stream → consent/participant/encounter | independent FKs plus binding trigger | exact triple and record consent | structurally enforced |

The existing `trg_enforce_record_consent_before_stream` trigger is a strong precedent. It
rejects a media stream unless its consent event is `kind='record'` and carries the same
participant and encounter.

---

## 5. ID-accepting joins and mutations without full relationship proof

This table records edge classes. Repeated projections of the same edge are listed together.

| Edge / surface | What is proved now | What remains unproved |
|---|---|---|
| `POST /api/studio/sessions` | authenticated practice | request `client_id` and `service_id` belong to that practice |
| Studio session/booking/detail/calendar reads | parent session is practice-scoped | joined client/service belongs to parent practice |
| `PATCH /api/studio/bookings` | booking practice; scribe session member and container | booking and scribe session have the same client and practice |
| public booking routes and `bookingTools` | service is practice-scoped; client is found/created in practice | later client updates/revocations are ownership-qualified; invite has a valid member owner |
| Studio service DELETE preflight | final update/delete is practice-scoped | `SELECT COUNT(*) FROM sessions WHERE service_id=$1` does not expose a foreign service's existence |
| booking retry and management projections | token or request scopes parent session/request | joined client/service share the same practice |
| `POST /api/scribe/start` | authenticated member | code compares client practice-record ID directly to member ID; `bookingId` is unchecked |
| scribe session listing | scribe session belongs to member | client join again compares practice-record ID to member ID |
| Session Room agreement/token creation | scribe session belongs to member | its client belongs to the member's selected practice; token client equals session client |
| Studio voice-note upload | Studio session belongs to practice; IDs are server-derived | database has no constraint preserving that derivation |
| Studio voice-note list/draft/audio | note or session is scoped in the route | note, session, client, and practice remain the same relationship in storage |
| Studio → `practitioner_sessions` writeback | Studio session was scoped earlier | practice-record ID is written into a member-ID FK; client/session pairing is not constrained |
| briefing/session prep | Studio session and client are practice-scoped | practice-record ID is used as `practitioner_sessions.practitioner_id` even though that column is member-scoped |
| legacy `/api/stellium/sessions*` | request supplies a `practitionerId` | no authentication; client ownership is not proved before create/read/update/delete |
| follow-up artifact generation | caller is authenticated | `loadSessionData` loads arbitrary `scribe_sessions.id`; trust check verifies `rl_sessions` and self-bypasses; request `clientId` is independent |
| follow-up artifact send | artifact `created_by` matches member | request session/client equal artifact session/client and belong to the member's practice |
| invite creation | most routes first prove client practice ownership | invite/member pairing is not structural; chat auto-invite falls back from member ID to practice ID |
| invite acceptance/claim | code hash names invite and client ID | invite member owns client practice; one claim route compares member ID directly with practice-record ID |
| client portal sign-in | email/password names client | requested slug is not bound in the query; this belongs to A3-R3 portal identity work |
| encounter create/update | authenticated practice and selected team | supplied meeting belongs to practice; supplied person belongs to team |
| encounter consent | token-derived participant/encounter in normal path | database cannot prevent a mismatched participant/encounter consent row |

Representative affected files:

```text
app/api/studio/sessions/route.ts
app/api/studio/sessions/[sessionId]/route.ts
app/api/studio/bookings/route.ts
app/api/studio/sessions/[sessionId]/briefing/route.ts
app/api/studio/sessions/[sessionId]/agreement/route.ts
app/api/studio/sessions/[sessionId]/voice-notes/route.ts
app/api/studio/sessions/[sessionId]/voice-notes/[noteId]/draft-note/route.ts
app/api/scribe/start/route.ts
app/api/scribe/sessions/route.ts
app/api/stellium/sessions/list/route.ts
app/api/stellium/sessions/[id]/route.ts
app/api/studio/session-followup/generate/route.ts
app/api/studio/session-followup/send/route.ts
app/api/portal/[slug]/invites/create/route.ts
app/api/portal/[slug]/invites/claim/route.ts
app/api/portal/[slug]/claim/route.ts
app/api/studio/portal/route.ts
app/api/studio/encounters/route.ts
app/api/studio/encounters/[id]/route.ts
lib/practitioner/sessionPrep.ts
lib/practitioner/studioWriteback.ts
lib/stellium/sessions.ts
lib/portal/bookingTools.ts
lib/session/joinTokenStore.ts
lib/studio/followups/sessionDataLoader.ts
lib/trust/checkAccess.ts
```

The unauthenticated legacy Stellium routes are adjacent **privileged-route debt** discovered
during A3-R2. They do not invalidate the bounded four-route A3-R1 patch, but no repair may
rely on `practitioner_sessions` until those routes are separately contained or explicitly
included in the repair authority.

---

## 6. Synthetic data census

The configured local synthetic database was queried inside `BEGIN TRANSACTION READ ONLY`.
The session reported `transaction_read_only=on`.

Observed table population:

| Table | Rows |
|---|---:|
| `practitioners` | 3 |
| `practitioner_clients` | 1 |
| `services` | 0 |
| `sessions` | 1 |
| `practitioner_sessions` | 0 |
| `scribe_sessions` | 0 |
| `voice_notes` | 0 |
| `session_voice_notes` | 0 |
| `client_invites` | 0 |
| `booking_requests` | 0 |
| `encounters` | 0 |
| `encounter_participants` | 0 |
| `encounter_consent_events` | 0 |
| `encounter_media_streams` | 0 |

All captured mismatch queries returned `0`. That result is expected from a dataset where
nearly every relationship-bearing child table is empty. It is **NOT OBSERVED**, not PASS.

The production-configured database hostname was not reachable from the inspection host, so
no production data claim is made.

The rerunnable census is frozen at:

```text
scripts/research/a3-r2-relationship-binding-census.sql
```

It covers row counts and the complete edge classes above, including duplicate active-practice
resolution, cross-practice client/service/session links, member/practice identity mismatches,
recording links, invite ownership, team-scoped encounter links, and consent/media relationships.

---

## 7. Exact negative-test plan

All foreign-ID application tests return `404` or a generic `403` without confirming that the
foreign row exists. Direct database refusals assert SQLSTATE `23503` (foreign key) or `23514`
(check constraint), except the existing media trigger which asserts its named `R-A1` refusal.

| ID | Negative fixture / action | Required result |
|---|---|---|
| RB-01 | authenticated member has two active practice rows | resolver fails closed; never `LIMIT 1` selection |
| RB-02 | create Studio session with another practice's client | refused; no session row |
| RB-03 | create Studio session with another practice's service | refused; no session row |
| RB-04 | seed corrupt session-client/service links and read Studio projections | no foreign metadata returned |
| RB-05 | delete/deactivate using another practice's service ID | generic not-found; no existence leak |
| RB-06 | link booking to same member's scribe session for a different client | refused |
| RB-07 | start practitioner scribe session with foreign client | refused, not silently dropped |
| RB-08 | start scribe session with foreign/nonexistent booking | refused |
| RB-09 | set agreement when scribe client is outside selected practice | refused before token creation |
| RB-10 | create join token whose client differs from scribe client | DB refusal |
| RB-11 | create practitioner session whose member does not own client practice | DB refusal |
| RB-12 | write back Studio session using practice ID in member-ID position | type/test refusal; translated IDs required |
| RB-13 | access legacy Stellium session route without credential | `401`; request `practitionerId` never grants scope |
| RB-14 | attach practitioner session to Studio session for another client/practice | DB refusal |
| RB-15 | insert voice note with foreign session/practice | DB refusal |
| RB-16 | insert voice note with session's practice but wrong client | DB refusal |
| RB-17 | generate follow-up from another member's scribe session | `404/403`; no model call and no artifact |
| RB-18 | send owned artifact while naming a different session/client | refused before delivery |
| RB-19 | create/claim invite whose member does not own client practice | DB/application refusal |
| RB-20 | create encounter using another practice's meeting | refused |
| RB-21 | add encounter participant whose person belongs to another team | refused |
| RB-22 | create consent event with participant from another encounter | DB refusal |
| RB-23 | create media stream with wrong consent kind/participant/encounter | existing `R-A1` trigger refuses |
| RB-24 | migration lifecycle with pre-existing synthetic mismatches | `NOT VALID` adds; new bad writes fail; validation fails until explicit reconciliation; validation then passes |

### Required synthetic fixture

Use an isolated test database or a transaction-scoped fixture with:

- two members, two practice records, two clients, and two services;
- one valid booking per practice;
- deliberate cross-practice session/client and session/service pairs;
- a practitioner session with member A and client B;
- a scribe session with member A, client B, and booking A;
- a voice note whose practice/session/client disagree;
- an invite owned by member B for client A;
- an encounter for practice/team A referencing meeting/person B;
- a consent event pairing encounter A with participant B.

First prove the census returns the exact non-zero counts. Then add the `NOT VALID`
constraints and prove they reject new mismatches while preserving the deliberately seeded
old rows. Reconcile each fixture by its explicit fixture ID—never by broad inferred matching—
and only then validate every constraint.

---

## 8. Exact additive constraint plan

### 8.1 Supporting unique keys

PostgreSQL does not permit `UNIQUE ... NOT VALID`. Supporting composite keys therefore use
`CREATE UNIQUE INDEX CONCURRENTLY`, followed by `ADD CONSTRAINT ... UNIQUE USING INDEX`.
Because every tuple includes an existing primary-key `id`, these indexes cannot introduce a
new uniqueness rule; they only make the owner-bearing tuples legal FK targets.

Create supporting unique keys for:

```text
practitioners             (id, member_id)
practitioner_clients      (id, practitioner_id)
services                  (id, practitioner_id)
sessions                  (id, practitioner_id)
sessions                  (id, client_id)
studio_meetings           (id, practitioner_id)
encounters                (id, team_id)
studio_people             (id, team_id)
encounter_participants    (id, encounter_id)
```

Do **not** add `UNIQUE(practitioners.member_id)` unless the product explicitly rules that one
person may hold only one practice.

### 8.2 Sessions and booking requests

Add initially `NOT VALID`:

```sql
FOREIGN KEY (client_id, practitioner_id)
  REFERENCES practitioner_clients (id, practitioner_id)

FOREIGN KEY (service_id, practitioner_id)
  REFERENCES services (id, practitioner_id)

FOREIGN KEY (rescheduled_from_id, practitioner_id)
  REFERENCES sessions (id, practitioner_id)

FOREIGN KEY (rescheduled_to_id, practitioner_id)
  REFERENCES sessions (id, practitioner_id)
```

On `booking_requests`:

```sql
FOREIGN KEY (service_id, practitioner_id)
  REFERENCES services (id, practitioner_id)

FOREIGN KEY (session_id, practitioner_id)
  REFERENCES sessions (id, practitioner_id)
```

Application writes must still authorize the request-supplied client/service before insert.
The database constraint is the final invariant, not the only authorization layer.

### 8.3 `practitioner_sessions`

Do not reinterpret the existing `practitioner_id`; its FK proves it is a member ID.

1. Add nullable `practitioner_record_id uuid`.
2. Backfill only where the exact tuple agrees:
   `client.practitioner_id = practitioners.id` and
   `practitioners.member_id = practitioner_sessions.practitioner_id`.
3. Rows with no exact match stop reconciliation; no “nearest” or first-practice choice.
4. Add `NOT VALID` FKs:

```sql
(practitioner_record_id, practitioner_id)
  -> practitioners (id, member_id)

(client_id, practitioner_record_id)
  -> practitioner_clients (id, practitioner_id)

(studio_session_id, practitioner_record_id)
  -> sessions (id, practitioner_id)

(studio_session_id, client_id)
  -> sessions (id, client_id)
```

5. Migrate callers to branded `MemberId` and `PractitionerRecordId` parameters.
6. After all callers move, rename legacy `practitioner_id` to
   `practitioner_member_id`; do not perform a semantic rename before the code is ready.

### 8.4 `scribe_sessions` and Studio booking linkage

1. Add nullable `practitioner_record_id uuid`.
2. Backfill only when client and/or booking resolve to one practice and that practice's
   `member_id` equals `scribe_sessions.member_id`.
3. If client and booking resolve differently, freeze the row for explicit adjudication.
4. Add `NOT VALID` identity/client FKs and checks:

```sql
(practitioner_record_id, member_id)
  -> practitioners (id, member_id)

(client_id, practitioner_record_id)
  -> practitioner_clients (id, practitioner_id)

CHECK (container <> 'practitioner' OR practitioner_record_id IS NOT NULL)

CHECK (booking_id IS NULL OR
       (practitioner_record_id IS NOT NULL AND client_id IS NOT NULL))
```

5. Add supporting unique keys on `scribe_sessions (id, practitioner_record_id)` and
   `(id, client_id)`.
6. Add `NOT VALID` FKs:

```sql
scribe_sessions (booking_id, practitioner_record_id)
  -> sessions (id, practitioner_id)

scribe_sessions (booking_id, client_id)
  -> sessions (id, client_id)

sessions (scribe_session_id, practitioner_id)
  -> scribe_sessions (id, practitioner_record_id)

sessions (scribe_session_id, client_id)
  -> scribe_sessions (id, client_id)
```

During transition, a deferrable constraint trigger must reject two populated link columns
that disagree. After consumers migrate, keep one canonical direction—prefer
`sessions.scribe_session_id`, because Studio owns the booking—and retire the reverse
`scribe_sessions.booking_id`. Do not auto-copy one over the other when they disagree.

### 8.5 Recordings, join tokens, and artifacts

For `voice_notes`, add `NOT VALID`:

```sql
(session_id, practitioner_id) -> sessions (id, practitioner_id)
(session_id, client_id)       -> sessions (id, client_id)
```

Apply the same pair to `session_voice_notes` only if the table is retained. No application
reader or writer was found; retirement is preferable to silently blessing a dormant second
recording authority.

For `session_join_tokens`:

```sql
(session_id, client_id) -> scribe_sessions (id, client_id)
```

For `session_artifacts`:

1. add `practitioner_record_id uuid`;
2. treat current `practitioner_id` and `created_by` as member IDs until explicitly renamed;
3. add `NOT VALID` bindings:

```sql
(practitioner_record_id, practitioner_id)
  -> practitioners (id, member_id)

(session_id, practitioner_record_id)
  -> scribe_sessions (id, practitioner_record_id)

(session_id, client_id)
  -> scribe_sessions (id, client_id)
```

The generate/send APIs must derive all three IDs from the authorized session/artifact row;
request payload IDs may narrow a result but may not establish ownership.

Keep the existing encounter-media consent trigger and add RB-23 as a permanent regression
test.

### 8.6 Invitations

1. Add `practitioner_record_id uuid` to `client_invites`.
2. Keep current `practitioner_id` explicitly member-scoped during compatibility; later rename
   it to `practitioner_member_id`.
3. Backfill only through the exact invited client:
   `client.practitioner_id = practice.id` and `practice.member_id = invite.practitioner_id`.
4. Add `NOT VALID`:

```sql
(practitioner_record_id, practitioner_id)
  -> practitioners (id, member_id)

(client_id, practitioner_record_id)
  -> practitioner_clients (id, practitioner_id)
```

An existing mismatch is revoked or corrected only by an explicit fixture/data decision.
Never repoint an invite merely because one candidate practice exists.

Slug-to-practice binding, portal-session revocation, and secret policy remain A3-R3 scope.

### 8.7 Encounters and recording participants

`encounters.session_id` references `studio_meetings`, not `sessions`; rename it in a later
compatibility migration to remove the semantic collision.

Add `NOT VALID`:

```sql
encounters (session_id, practitioner_id)
  -> studio_meetings (id, practitioner_id)
```

`studio_people` is team-scoped; its `practitioner_id` is provenance, not the authorization
boundary. Add `team_id` to `encounter_participants`, backfill from the parent encounter, then:

```sql
encounter_participants (encounter_id, team_id)
  -> encounters (id, team_id)

encounter_participants (person_id, team_id)
  -> studio_people (id, team_id)

encounter_consent_events (participant_id, encounter_id)
  -> encounter_participants (id, encounter_id)
```

The existing media trigger remains the final consent-event/participant/encounter binding.

---

## 9. Migration and validation order

1. Run the read-only census and freeze exact row IDs for every mismatch.
2. Add supporting composite unique indexes/constraints.
3. Add identity columns as nullable.
4. Backfill only exact, non-ambiguous translations; write an adjudication ledger for every
   row not backfilled.
5. Add FK and CHECK constraints `NOT VALID`.
6. Run RB-01 through RB-24. New bad writes must already fail while old mismatches remain.
7. Reconcile synthetic mismatches one fixture ID at a time.
8. Re-run census; every mismatch count must be zero.
9. `VALIDATE CONSTRAINT` one named constraint at a time.
10. Re-run application, guard, and migration tests.
11. Only after validation, consider `NOT NULL`, column renames, or retirement of redundant
    link directions.

No step may perform automatic identity reconciliation.

---

## 10. STOP and successor authority

Evidence is now frozen. The next bounded unit may be opened as:

> **PRACTITIONER-OFFER-01 · A3-R2-R1 — NEGATIVE FIXTURES & ADDITIVE RELATIONSHIP CONSTRAINTS**

That unit may build the isolated cross-practice fixture, add application refusals and
additive identity columns, add `NOT VALID` constraints, reconcile only the labelled
synthetic mismatches, and validate the constraints.

It may not open portal identity/revocation/secrets work, redesign consent atomicity, merge,
deploy, or make commercial claims.

**A3-R2 census status: STOP — EVIDENCE COMPLETE; REPAIR AUTHORITY UNSPENT.**
