# F5-A — ERASURE ARCHITECTURE CENSUS (REPOSITORY, READ-ONLY)

```
D9               CLOSED
F5               OPEN
F5-A             ACTIVE
F5-B onward      NOT AUTHORIZED

Evidence subject 7ee173db0d54f7340353316d11729b88480434a5
Custody/context  claude/clever-einstein-mojiar
Repository max   REACHABLE
LIVE             UNASSIGNABLE
EXERCISED        UNASSIGNABLE
VERIFIED         UNASSIGNABLE

Mutation         NO
Repair           NO
Schema           NO
Migration        NO
Prod deletion    NO
Recommendation   NO
```

**The SHA is the evidentiary subject. The branch is custody.** Subsequent branch
movement does not change what this record claims to have censused.

Working tree clean at census time; every claim below derives from tracked source
at the pinned SHA. Citations name **operations and semantic loci**, never line
numbers (D1).

---

## 0. Standing vocabulary, as frozen by the ruling

```
DECLARED  BUILT  WIRED  REACHABLE  LIVE  EXERCISED  VERIFIED
```

Maximum assignable positive standing in this record: **REACHABLE**.
`REACHABLE` is assigned **only** where repository evidence establishes the
complete static path:

```
entry point → authorization → invocation → orchestrator → immediate effect
```

Where a link is not established, the row stops at the highest proven rung.
Qualification states retained: `LATENT`, `DEAD`, `TEST-ONLY`, `UNKNOWN`.

Every `REACHABLE` erasure path carries `runtime exercise: UNWITNESSED` — this
container has no `DATABASE_URL`, no `ssh`, and no route to minisforum. The
absence is structured evidence, not a limitation footnote.

---

## 1. Instrument disclosure (a search miss is negative space, not absence)

Discovery instruments, in order applied:

- routes exporting a `DELETE` handler under `app/**/route.ts` → **90**
- routes whose path names an erasure/withdrawal/revocation verb → **10**
- TypeScript files issuing `DELETE FROM` / `TRUNCATE` under `lib/`, `app/`,
  `scripts/` → **134**
- `ON DELETE CASCADE` clauses in the canonical migration directory → **496**
  across 193 files; `REFERENCES members` → **289**

**One instrument correction is recorded rather than silently fixed.** A first
pass classified DELETE routes by a five-helper authorization regex and reported
47 routes with no authorization. Widening the helper set to include
`requireMemberId`, `getCurrentSession`, `probeAuthPosture`, `getServerSession`,
`verifySession` and siblings moved the count to **36**. The first number was an
instrument artifact. It is stated here because a census that silently revises its
own denominator cannot be audited.

The remaining 36 are classified `UNKNOWN: authorization link unresolved` — **not**
"unauthenticated". Three were spot-checked by hand and all three carried an
authorization mechanism the regex did not name. The residual 36 were not
individually traced; that is negative space, and it is named as such in §4.

---

## 2. Traced chains — complete five-link paths

### 2.1 Manuscript erasure (Writer's Studio "delete")

```
standing: REACHABLE
runtime exercise: UNWITNESSED
act class: DESTRUCTIVE (row deletion + queued byte destruction)
```

| link | locus |
|---|---|
| entry point | `app/writers-studio/HomeView.tsx` / `page.tsx` → `deleteWork()` |
| dispatch | `lib/writersStudio/deleteWork.ts` — issues `DELETE` to `/api/sovereign/manuscripts/{id}` (or `/api/sovereign/living-works/{id}` when no manuscript exists) |
| authorization | `app/api/sovereign/manuscripts/[id]/route.ts` DELETE handler — `getMemberIdFromRequest`, 401 on absence |
| invocation | `eraseManuscript(id, memberId)` |
| orchestrator | `lib/manuscript/source/eraseManuscript.ts` |
| immediate effect | one transaction: reads `manuscript_source_arrivals` artifact refs, `DELETE FROM member_manuscripts` scoped by `(id, member_id)`, removes a declaration that exists only to name the manuscript, enqueues refs into `vault_erasure_queue`; then calls `sweepVaultErasureQueue()` |

Properties established from source:

- **Member-scoped throughout.** Another member's id matches zero rows and is
  answered `not_found` — the refusal does not confirm the id exists.
- **Multi-sovereign refusal present.** Erasure refuses with
  `declared_in_other_works` when more than one Work declares the manuscript.
  Shared material is not erased out from under a Work the member did not delete.
- **Honesty seam.** When the queue is not fully swept the route returns
  `{ removed: true, refusal: 'custody_incomplete' }` with HTTP 500 rather than a
  bare success. The rows are gone; bytes still owed destruction are not reported
  as gone.
- **Client absence-tolerance.** `deleteWork` treats HTTP 404 as success, on the
  stated ground that absence is the outcome sought.

### 2.2 Vault byte destruction (the second half of 2.1)

```
standing: REACHABLE
runtime exercise: UNWITNESSED
act class: DESTRUCTIVE (byte destruction outside the database)
```

| link | locus |
|---|---|
| entry point A | inline, at the tail of `eraseManuscript` |
| entry point B | `scripts/run-media-worker.ts`, declared as a service command in `docker-compose.production.yml` |
| entry point C | `scripts/ops/sweep-vault-erasure-queue.ts` (operator-invoked) |
| entry point D | opportunistic sweeps in `app/api/sovereign/living-works/[id]/route.ts` and `.../visual/route.ts` |
| orchestrator | `sweepVaultErasureQueue()` in `lib/manuscript/source/eraseManuscript.ts` |
| immediate effect | `destroyVaultBytes` (`lib/storage/fileVault`), queue rows removed on success |

Entry point B is the only *scheduled* invocation located anywhere in the
repository for any erasure mechanism in this census.

### 2.3 Sanctuary purge (scribe session close)

```
standing: REACHABLE
runtime exercise: UNWITNESSED
act class: DESTRUCTIVE (irreversible content deletion)
```

| link | locus |
|---|---|
| entry point | `POST app/api/scribe/end-session/route.ts` |
| authorization | `getMemberIdFromRequest`, 401 on absence; then `loadPermittedSession(sessionId, actorId)` — non-disclosing 404 conflates absent and not-yours |
| eligibility | read from persisted `maia_sessions.mode === 'sanctuary'`, **never from the request body**; absent mode resolves to the non-destructive branch |
| invocation | `mayPurge = isSanctuary && session.member_id === actorId` |
| immediate effect | one transaction: `DELETE FROM conversation_turns WHERE session_id = $1` plus session finalization — both commit or neither |

Properties established from source:

- **Unowned sessions cannot be purged.** `member_id IS NULL` keeps the
  non-destructive path only; the file states the ground — admitting an
  authenticated caller to adopt an unowned session would manufacture authority
  from possession.
- The route header records the prior posture it replaced (body-supplied
  `sanctuary` flag selecting destructive semantics against a caller-named
  session). That is historical context carried in source, not a current finding.

### 2.4 Account closure

```
standing: REACHABLE
runtime exercise: UNWITNESSED
act class: CONDITIONALLY DESTRUCTIVE — terminal effect is REFUSAL for any
           member holding governed content
```

| link | locus |
|---|---|
| entry point | `POST app/api/members/delete-account/route.ts` |
| authorization | `getMemberIdFromRequest`; a body-supplied `memberId` that disagrees with the session is refused 403 **before** any lookup; `confirmUsername` compared against the session-derived member's authoritative username as a destructive-action confirmation, not an authorization control |
| preflight | `governedContentFor(memberId)` — read-only count across a 40-table list, aggregated to member-legible labels |
| gate | module constant `CONTAINMENT_POSTURE`, currently `'refuse'` |
| immediate effect (governed content present) | HTTP 409 `deletion_incomplete_unavailable`, `accountChanged: false`, nothing mutated |
| immediate effect (no governed content) | one transaction: revoke `auth_sessions` first, delete `member_settings`, `member_sessions`, three savepoint-guarded optional tables, then the `members` row |

**The load-bearing fact of this path is that it refuses.** For any member with
conversations, journals, remembered moments, reflections, relationships, tasks,
preferences, field records, or context-disclosure receipts, the terminal effect
of account deletion at this SHA is a 409 and an instruction to contact support.
The success response, when reached, enumerates only `account, settings, sessions,
credentials` and makes no completeness claim.

### 2.5 Circle response withdrawal

```
standing: REACHABLE
runtime exercise: UNWITNESSED
act class: TOMBSTONE (content nulled, fact of the act retained)
```

`POST app/api/circles/[circleId]/inquiries/[inquiryId]/withdraw/route.ts`
→ `requireCircleAccess`-derived member → `withdrawResponse(inquiryId, memberId)`
in `lib/circles/inquiryService.ts` →
`UPDATE circle_inquiry_responses SET withdrawn_at = NOW(), response_text = NULL,
response_type = NULL` scoped by `(inquiry_id, member_id, withdrawn_at IS NULL)`.

FR-15 is realized in code: the surrendered meaning is destroyed, the fact that an
act occurred is kept. Already-withdrawn is answered 409, absent is answered 404,
and the success response returns nothing that would reveal what was withdrawn.

### 2.6 Soft-state revocations (act class distinct from erasure)

| path | mechanism | standing |
|---|---|---|
| `DELETE app/api/relationships/[id]` | `UPDATE member_relationships SET archived_at = NOW()`, scoped by `(id, member_id)`, auth via `getCurrentSession` | REACHABLE / SOFT-ARCHIVE |
| `DELETE app/api/maia/living-field/[fieldKey]/consent` | `UPDATE living_field_participant_consents SET revoked_at = NOW()` — file states past partners remain visible as "previously invited" | see §3.2 |
| `POST app/api/circles/shared/[sharedId]/revoke` | `revokeArtifact(sharedId, memberId)` in `lib/circles/sharingService` | REACHABLE / REVOCATION |

These are recorded because an HTTP `DELETE` verb is not evidence of an erasure
act class. Three of the routes whose names read as deletion perform state
transitions and destroy nothing.

---

## 3. Unresolved traces

### 3.1 `POST /api/sovereignty/delete-my-memory` — chain breaks at three links

```
standing: UNKNOWN
reason: authorization absent; target schema not created by the canonical
        migration runner; failure branch reports success
runtime exercise: UNWITNESSED
```

| link | finding |
|---|---|
| entry point | `app/api/sovereignty/delete-my-memory/route.ts` — exists, exported |
| authorization | **not established.** The handler reads `userId` from the request body. No session resolution, no member helper, no access-matrix prefix covers `/api/sovereignty`. |
| invocation | `require('../../../../services/user-sovereignty/delete-memory-api.js')` — resolves in source terms to a tracked CommonJS module at the repository root |
| orchestrator | `UserDataSovereignty.deleteUserMemory` — exists; requires the literal phrase `DELETE ALL MY CONSCIOUSNESS DATA`; opens its own `pg` `Pool` from `POSTGRES_*` env vars, **not** `lib/db/postgres.ts` and not `DATABASE_URL`; the module also constructs an Express app at module scope, guarded from listening by `require.main === module` |
| immediate effect | `DELETE FROM` five tables: `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations` |

Two further facts about the effect link:

1. **The five target tables are created only outside the deployed migration
   path.** Their `CREATE TABLE` statements appear in `db/migrations/` (20 files)
   and in a schema backup dump. The deployed runner reads
   `/app/database/migrations/*.sql` (`scripts/run-sql-migrations.sh`;
   `docker-compose.production.yml` bind-mounts `database/migrations`), which
   holds 493 files and does not include them. Whether the tables exist in
   production is runtime evidence and is **unassignable here**.
2. **The route's failure branch returns `success: true`.** If the `require` or
   the service call throws, the catch returns
   `{ success: true, message: 'Memory deletion request processed successfully',
   details: '... your request has been queued' }`. Nothing is queued by that
   branch. The sole located caller,
   `app/labtools/sovereignty/page.tsx`, branches on `result.success` and sets
   `deleteComplete`.

That caller targets a hardcoded `userId = 'demo_user_001'` and sits behind
`app/labtools/layout.tsx` → `requireLabAccess()`. **The UI is gated; the HTTP
route is not.** Those are two different loci and this record does not merge them.

### 3.2 `probeAuthPosture` as an identity source

```
standing: UNKNOWN
reason: identity is client-asserted at the authorization link
```

`lib/auth/authPostureProbe.ts` returns the bare `x-member-id` header. It resolves
the session credential and compares it **asynchronously, for logging only**,
under the marker `[auth-posture]`; the comparison never gates the return value.
The file documents itself as Phase 0 scaffolding intended for replacement.

Ten route files under `app/api/maia/living-field/**` use it, one of which is the
consent-revocation `DELETE` in §2.6. For that path the authorization link is a
client assertion, so the chain stops below `REACHABLE`.

### 3.3 Thirty-six DELETE routes with no located authorization link

```
standing: UNKNOWN
reason: authorization link unresolved; not individually traced
```

Of 90 routes exporting `DELETE`, 54 carry a recognized authorization helper. The
remaining 36 are listed in Appendix A and concentrate under
`/api/studio/**` (13), `/api/stellium/**` (4), `/api/caseload/**` (2),
`/api/fields/**` (2), plus singletons including
`/api/commons/contributions/[id]`, `/api/premium-storage/backup/list`,
`/api/connectors/{caldav,obsidian}/configure`, `/api/offerings/[id]`,
`/api/practitioner/tasks/[taskId]` and `/api/debug/symbolic-telemetry`.

21 of the originally-flagged set fall under an access-matrix prefix
(`config/accessMatrix.ts`) and may be gated in middleware rather than in-route;
26 fell under no matrix prefix. Both figures are from the pre-correction pass
described in §1 and are reported as instrument output, not as a finding about
any individual route. **No claim is made that any of these 36 is unauthorized.**

---

## 4. Negative space

Recorded as searched-and-not-found, never as proof of absence.

1. **No member-facing route deletes a memory atom, a developmental memory, or a
   semantic memory vector.** Searches for `DELETE FROM memory_atoms`,
   `developmental_memories`, `semantic_memory_vectors` across `app/**` and
   `lib/**` return no member entry point. `app/api/sovereign/atoms/[id]/decline`
   and `.../breakthrough` export `DELETE` handlers but issue no row deletion
   against those tables.
2. **`TurnsStore.pruneOldTurns` has no caller.** Its only two references in the
   entire repository are its own definition and a comment in
   `20260909000001_context_disclosure_receipts.sql` instructing that pruning must
   never reach a receipt. → `standing: LATENT`. A system-initiated deletion of
   member conversation content exists in source and is invoked from nowhere.
3. **`sweepRefusalRecords` / `runSweep` has no scheduled invocation.** Its only
   non-test caller is `scripts/sweep-develop-refusals.ts`, which appears in no
   compose service, no `package.json` script, and no CI workflow.
   → `standing: LATENT`.
4. **No cron, systemd unit, or scheduler definition for any erasure sweep was
   located** beyond the `run-media-worker` compose service of §2.2.
5. **No repository-wide erasure orchestrator exists.** There is no single service
   that, given a member, ends custody of that member's material. The four traced
   destructive paths are independent and share no orchestrator.
6. **Sanctuary is predominantly a non-creation mechanism, not an erasure one.**
   `lib/consciousness/interruptionLedger.ts` returns early on
   `turn.sanctuary` ("no content, no telemetry"), and
   `lib/consciousness/maiaOrchestrator.ts` carries a sanctuary-skip sentinel.
   Its one destructive expression is §2.3. Act class differs and the two are not
   merged here.

---

## 5. The structural finding — cascade is unavailable, not merely unused

`app/api/members/delete-account/route.ts` enumerates 40 tables as member-owned
governed content. Testing each `CREATE TABLE` block in the canonical migration
directory for a foreign key to `members`:

```
governed content tables enumerated by the route   40
with a members FK in their CREATE TABLE block      1
without                                           39
```

Four `ALTER TABLE ... REFERENCES members` statements exist in canonical
migrations (`members.invited_by`, `library_sources.practitioner_member_id`,
`library_sources.ratified_by`, `client_invites.claimed_by_member_id`). **None
touches a governed content table**, so none rescues the count.

Spot-checking the owner column on three of them — `conversation_turns`,
`episodic_memories`, `reflection_capsules` — returns `user_id TEXT NOT NULL` in
each case, against `members.id UUID`. A foreign key is therefore not merely
absent but **not presently declarable** without a type migration.

This is the structural reading of §2.4's refusal posture: the route refuses
because the substrate provides no cascade for it to rely on, and the repository
holds 496 `ON DELETE CASCADE` clauses that do not reach this material.

`context_disclosure_receipts` is the one governed-content entry whose presence in
the list is annotated in source as deliberate, on the stated ground that
retention may be shared by decision but not by accident.

**No repair is proposed. No cascade is recommended. F5-A locates; it does not
prescribe.**

---

## 6. Multi-sovereign involvement

| surface | mechanism at this SHA |
|---|---|
| manuscript declared by >1 Work | erasure **refuses** with `declared_in_other_works` |
| circle inquiry response | withdrawal **tombstones** — content nulled, act retained |
| circle shared artifact | `revokeArtifact` — revocation, not erasure |
| circle membership removal | removal record created (201); FR-18 refuses reinstatement by generic invitation |
| living-field participant consent | soft revoke; prior participants remain visible as previously invited |
| unowned scribe session | purge **refused**; no caller can authorize destroying an ownerless session |

Every located multi-sovereign boundary at this SHA resolves toward **refusal or
tombstone**, never toward one sovereign's act destroying another's record. No
counter-example was found. Whether that holds at runtime is unassignable here.

---

## 7. What F5-A did not establish

- Whether **any** of these paths has ever executed in production. Every
  `REACHABLE` row carries `runtime exercise: UNWITNESSED`.
- Whether the five tables of §3.1 exist in the production schema.
- Whether the 36 routes of §3.3 are authorized by a mechanism not located here.
- Whether `vault_erasure_queue` holds undestroyed rows.
- Whether the `[auth-posture]` marker of §3.2 shows a population asserting
  `x-member-id` without a resolvable credential.
- Whether `members` rows have ever been deleted, and with what residue.

Each requires production evidence unavailable in this environment.

---

## 8. Standing

```
F5-A             COMPLETE
Evidence subject 7ee173db
Positive standing assigned   REACHABLE (max), on 5 chains
Qualification states used    LATENT (2), UNKNOWN (3 classes), TOMBSTONE, SOFT-ARCHIVE
LIVE / EXERCISED / VERIFIED  UNASSIGNED throughout

Mutation         NONE
Repair           NONE
Schema           UNTOUCHED
Migration        NONE
Production       UNTOUCHED
Recommendation   NONE
F5-B             NOT CHOSEN
```

> *The organism has four independent destructive paths, one of which refuses by
> design, and no orchestrator joining them. What it does not have is a cascade
> under the material its own deletion route enumerates. F5-A reports that it
> looked and states where it stopped.*

---

## Appendix A — the 36 DELETE routes of §3.3

`standing: UNKNOWN · reason: authorization link unresolved`

```
/api/admin/library/videos/[id]
/api/admin/practice-field/[id]/governance-hold
/api/analytics/consciousness-correlations
/api/book-studio/workbench/tables/[id]
/api/caseload/[caseId]/captures
/api/caseload/[caseId]/list
/api/commons/contributions/[id]
/api/connectors/caldav/configure
/api/connectors/obsidian/configure
/api/consciousness/symbolic
/api/debug/symbolic-telemetry
/api/fields/[slug]/decisions/[id]
/api/fields/[slug]/kanban/[id]
/api/maia/meditation
/api/offerings/[id]
/api/portal/[slug]/faq/[id]
/api/practitioner/tasks/[taskId]
/api/premium-storage/backup/list
/api/stellium/clients/[id]
/api/stellium/marketing/campaigns/[id]
/api/stellium/marketing/contacts/[id]
/api/stellium/sessions/[id]
/api/studio/availability
/api/studio/changes/[id]/experiments/[experimentId]
/api/studio/changes/[id]
/api/studio/clients/[id]/notes/[noteId]
/api/studio/clients
/api/studio/decisions/[id]
/api/studio/field-signals/[id]
/api/studio/field/attention/[id]
/api/studio/field/events/[id]
/api/studio/field/notes/[id]
/api/studio/field/people/[id]
/api/studio/practitioner-observations/[id]
/api/studio/scheduled-sends/[id]
/api/supervision/session/[id]
```
