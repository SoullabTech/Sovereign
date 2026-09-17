# F5-B — MEMBER ERASURE AUTHORITY & TRUTHFULNESS TRACE (REPOSITORY, READ-ONLY)

> **The organism demonstrates mature local erasure semantics, but F5-A did not
> establish a trustworthy general member-memory erasure operation.**
>
> — the working proposition F5-B was authorized to falsify.

```
D9               CLOSED
F5               OPEN
F5-A             CLOSED — PASS AS CENSUS
F5-B             ACTIVE
F5-C onward      NOT AUTHORIZED

Evidence subject 7ee173db0d54f7340353316d11729b88480434a5
Custody/context  claude/clever-einstein-mojiar
Repository max   REACHABLE
LIVE             UNASSIGNABLE
EXERCISED        UNASSIGNABLE
VERIFIED         UNASSIGNABLE

Mutation NO · Repair NO · Schema NO · Migration NO · FK proposal NO
Auth repair NO · Deletion NO · Deployment NO · Production probing NO
Table-completeness audit NO · Recommendation NO · F5-C selection NO
```

Four loci only. Citations name operations and semantic loci, never line numbers.

---

## 0. Outcome

```
NON-AUTHORITATIVE
```

**A deletion mechanism declaring general member-memory erasure exists and is
repository-reachable. No valid authority chain binding that act to the member
whose memory it would erase is established.**

`AUTHORITATIVE + SCOPE-MISMATCH` was the competing candidate and is **refused as
the label**, on the ground that authority is prior to scope: an operation whose
subject is caller-supplied is not a sovereign member act whose scope is then
worth adjudicating. The scope divergence is real, is recorded in full at §3, and
is **held** — if a future governed act establishes subject binding, that
divergence becomes the operative question rather than a subsidiary one.

The proposition **survived falsification**. See §6.

---

## 1. B1 — `/api/sovereignty/delete-my-memory`, full chain

```
standing: REACHABLE (mechanism) · authority chain NOT ESTABLISHED
runtime exercise: UNWITNESSED
```

| link | finding |
|---|---|
| exposure | `app/api/sovereignty/delete-my-memory/route.ts`, `POST` |
| caller(s) | exactly one located: `app/labtools/sovereignty/page.tsx` → `handleDeleteMemory` |
| authentication | **ESTABLISHED, by lexical coincidence** — see §1.1 |
| authorization | **NOT ESTABLISHED** — see §1.2 |
| identity source | request body `userId` |
| target derivation | none; `userId` is used verbatim as the deletion subject |
| execution | `UserDataSovereignty.deleteUserMemory` in `services/user-sovereignty/delete-memory-api.js`, reached by `require` from the route |
| immediate effect | one transaction, five `DELETE FROM … WHERE user_id = $1` against `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations` |
| catch semantics | **returns `success: true`** — see §1.4 |
| returned claim | `'Memory deletion request processed successfully'` / `'your request has been queued'` |

### 1.1 Authentication arrives through an accidental prefix

`middleware.ts` matches this path (its `config.matcher` excludes only static
assets, `api/voice/transcribe-simple`, and `api/sovereign/manuscripts/ingest$`).
`checkAccess` → `matchRule` resolves a rule by `pathname.startsWith(rule.prefix)`.

Enumerating every rule in `config/accessMatrix.ts` that matches
`/api/sovereignty/delete-my-memory` returns **exactly one**:

```
{ prefix: '/api/sovereign', minTier: 'free', notes: 'Sovereign features' }
```

`'/api/sovereignty/…'.startsWith('/api/sovereign')` is `true` because the word
*sovereignty* begins with the word *sovereign*. The rule's own note names the
`/api/sovereign/*` feature surface. Non-public + `minTier: 'free'` means an
unauthenticated caller is refused, and `middleware.ts` returns 401 JSON for
`/api/` paths rather than redirecting.

**The authentication is real and the derivation of it is a coincidence.** No rule
in the access matrix declares authority over the `/api/sovereignty` namespace.
This record states both facts and merges neither: the protection presently holds,
and it holds for a reason nobody wrote down. It is the same anti-laundering
concern D9 settled — **authority at one locus travelling silently to another** —
except here the carrier is a shared string prefix rather than a shared surface.

### 1.2 Authorization of the subject is not established — the decisive answer

> **Can caller-supplied identity influence the deletion subject?**
> **Yes. The caller-supplied identity *is* the deletion subject.**

The handler destructures `{ userId, confirmationPhrase, deleteReason }` from the
request body and passes `userId` unchanged into the orchestrator, which binds it
as `$1` in all five `DELETE` statements. At no point in the route or the
orchestrator is `userId` compared with a session-derived member.

The route imports no authorization helper — not `getMemberIdFromRequest`, not
`requireMemberId`, not `getCurrentSession`, not `probeAuthPosture`. Middleware
established *that a caller is authenticated*; nothing establishes *that the
authenticated caller is the subject*.

The literal phrase `DELETE ALL MY CONSCIOUSNESS DATA` is required by the
orchestrator. It is a **destructive-action confirmation, not an authorization
control** — the same distinction `app/api/members/delete-account/route.ts` draws
explicitly for `confirmUsername`. A fixed public string known to anyone who reads
the UI cannot bind a subject.

**No exploit was constructed and nothing was invoked.** This is a static reading
of the data path.

### 1.3 Executable scope sits outside the deployed migration lineage

Carried from F5-A and re-verified at this SHA: the five target tables have
`CREATE TABLE` statements only in `db/migrations/` (20 files) and in a schema
backup dump. The deployed runner reads `/app/database/migrations/*.sql`
(`scripts/run-sql-migrations.sh`; `docker-compose.production.yml` bind-mounts
`database/migrations`), holding 493 files, none of which create them.

Whether these tables exist in production is runtime evidence. **UNASSIGNABLE.**

Two further substrate facts, recorded without inference: the orchestrator opens
its **own** `pg` `Pool` from `POSTGRES_*` variables rather than using
`lib/db/postgres.ts` or `DATABASE_URL`; and it constructs an Express app at
module scope, guarded from listening by `require.main === module`.

### 1.4 Failure can present as completion

The route's `catch (serviceError)` branch — reached if the `require` fails or the
orchestrator throws — returns HTTP 200 with:

```
success: true
message: 'Memory deletion request processed successfully'
details: 'User data sovereignty service is initializing - your request has been queued'
```

**Nothing is queued by that branch.** No queue is written, no retry is scheduled,
no record is made. The two other erasure paths in this organism state the
opposite posture in source: manuscript erasure returns
`refusal: 'custody_incomplete'` with HTTP 500 rather than claim a completion it
cannot keep, and account closure enumerates only what it removed.

The precise claim this record makes, and the one it declines to make:

- **Established:** a repository-reachable sovereignty deletion route contains a
  success-on-failure semantic path.
- **Not established:** that any member has ever been told their memories were
  deleted when they were not. Runtime exercise is **UNWITNESSED**.

---

## 2. B2 — Account closure, refusal semantics

```
standing: REACHABLE
runtime exercise: UNWITNESSED
identity: SERVER-DERIVED, subject-bound
```

| question | finding |
|---|---|
| what causes refusal | `CONTAINMENT_POSTURE === 'refuse'` **and** `governedContentFor(memberId)` returning a non-empty array — i.e. at least one row in at least one enumerated table |
| what is inspected | 40 tables, aggregated into nine member-legible labels: conversations · journal entries · remembered moments · reflections · people you noted · tasks and reminders · your preferences · field records · records of when your context was shown to MAIA |
| how absence is treated | a table that does not exist is caught and **not counted**; the source states that absence of a table is not evidence of absence of content, and that refuse-by-default is what makes the uncounted case safe |
| what the refusal claims | `accountChanged: false` and *"Your account and content have not been changed"* — an explicit negative assertion, not silence |
| what the success path claims | `removed: ['account','settings','sessions','credentials']` and *"Your account has been closed and your sign-in credentials revoked"* — no completeness claim, no mention of content |
| delegation | `nextStep: 'contact_support'` — **delegation to a human channel, not to another governed erasure operation.** No route, no queue, no ticket record is created. |

Two properties matter for F5-B's governing question:

1. **The refusal is truthful and is the load-bearing behaviour.** For any member
   holding content in any of those nine domains, this operation's terminal effect
   is a 409 that says nothing happened — and nothing did.
2. **This operation does not claim to erase retained knowledge.** It claims to
   close an account and revoke credentials. It is therefore *not* a candidate for
   the operation F5-B is looking for; it is the organism declining to be one.

The preflight is read-only, which is the property that makes a refused request
safe to retry. The transaction on the success path revokes `auth_sessions` before
deleting anything, so a rollback leaves the account intact **and usable**.

---

## 3. B3 — Declared scope versus executable scope

```
result: DIVERGENT
```

`app/labtools/sovereignty/page.tsx` — declared scope, verbatim from source:

| locus | claim |
|---|---|
| page header | *"Complete control over your consciousness data"* |
| action button | *"Delete All My Consciousness Data"* |
| warning copy | *"This action cannot be undone. All your consciousness data will be permanently deleted."* |
| scope label | *"All data deleted across all systems"* |
| submit button | *"Permanently Delete All Data"* |
| completion banner | *"All your consciousness data has been permanently and completely deleted."* |
| closing line | *"Data sovereignty is a fundamental right. You have complete control over your consciousness data."* |

Executable scope, from §1.3: five tables in a non-deployed migration lineage,
reached through one `require`, against a subject the caller names.

Three divergences, stated separately because they fail differently:

1. **Breadth.** *All data across all systems* versus five named tables. The
   organism's own account-deletion route enumerates 40 tables as member-owned
   governed content; the five here appear on neither that list nor in the
   deployed schema.
2. **Certainty.** *Permanently and completely deleted* is asserted as accomplished
   fact. The page reaches that banner by branching on `result.success`, which
   §1.4 shows is returned by the route's failure path.
3. **Subject.** The page's `userId` is the hardcoded literal `'demo_user_001'`.
   The declared operation is *your* data; the executed operation names a fixed
   non-member string.

**The mismatch is a property of canonical source and does not depend on
liveness.** It would be equally true of a route that has never been invoked.

### 3.1 The two authorizations stay separate

`app/labtools/layout.tsx` calls `requireLabAccess()` and refuses with a named
gate screen; Lab Tools is stated in that file to be founder-and-founding-member
scope and explicitly **not** a member surface.

`/api/sovereignty/delete-my-memory` carries no route-level authorization and is
protected only by the coincidental matrix prefix of §1.1.

**A protected UI confers nothing on its API.** These remain two loci. The gate on
the page does not narrow the reach of the route, and no claim is made here that
the page's declared scope is what any member has been shown — the page is behind
a gate that members do not pass.

---

## 4. B4 — Identity binding for destructive operations

```
classification: MIXED
```

The organism has a genuinely strong server-derived boundary and a second class of
path that does not reach it.

**Server-derived, subject-bound** — `lib/auth/verifiedAccess.ts`
(`deriveVerifiedAccess`) resolves `member_id`, `tier` and `roles` from
`auth_sessions` by token, and **refuses a mismatched identity claim** from
`x-member-id`, `x-maia-member-id` or the `maia_member_id` cookie with
`denied('claim_mismatch')`, on the stated ground that a mismatch is an
impersonation attempt and not a preference to resolve. `middleware.ts` then feeds
`checkAccess` inputs it describes as *every input below is server-derived*.

Destructive paths whose subject is bound this way:

| operation | binding |
|---|---|
| account closure | `getMemberIdFromRequest`; body `memberId` that disagrees is refused 403 before any lookup |
| sanctuary purge | `getMemberIdFromRequest` + `loadPermittedSession(sessionId, actorId)`; purge eligibility from persisted mode |
| manuscript erasure | `getMemberIdFromRequest`; every statement carries the member id |
| export-archive deletion | `getMemberIdFromRequest` + ownership compared to session, 404 rather than 403 |

**Client-asserted** — `lib/auth/authPostureProbe.ts` (`probeAuthPosture`) returns
the bare `x-member-id` header. It resolves the session credential and compares it
**asynchronously, for logging only**, under the marker `[auth-posture]`; the
comparison never gates the return value. The file documents itself as Phase 0
scaffolding intended for deletion.

Ten route files under `app/api/maia/living-field/**` use it, including the
consent-revocation `DELETE`. For those paths the middleware boundary does not
supply the missing binding, and the reason is structural:

- No rule in `config/accessMatrix.ts` matches `/api/maia/living-field/…` —
  enumerated, **unmapped**.
- `getAccessMode()` returns `'permissive'` unless `ACCESS_CONTROL_MODE === 'strict'`.
- In permissive mode `checkAccess` returns `{ allowed: true, unmapped: true }`
  from the `if (!rule)` branch, which is evaluated **before** the
  `if (!isAuthenticated)` branch.

So an unmapped path is allowed **even when `deriveVerifiedAccess` refused the
credential**, including for `claim_mismatch`. The request then reaches a handler
that reads identity from the header the boundary just declined to trust.

Nine repository test files assert `ACCESS_CONTROL_MODE` is unset in production.
That is **repository-recorded belief about runtime**, cited as such; the
production value is **UNWITNESSED** here.

Corroborating, within the same namespace as B1 and bounded to it:
`app/api/sovereignty/my-data-summary/[userId]` takes its subject from the URL
path with no authorization helper. It is a read, not an erasure, and is recorded
only as evidence about the `/api/sovereignty` namespace's identity posture.

---

## 5. Held substrate fact — carried, not acted on

> **39 of the 40 governed content tables enumerated by the account-deletion route
> lack an FK relationship capable of expressing cascade to `members`, under the
> observed `user_id TEXT` / `members.id UUID` identity mismatch.**

Carried forward from F5-A unchanged. Not repaired, not extrapolated from, and not
used to reach §0. No FK is proposed. Whether explicit orchestration is intended,
whether identity migration is needed, whether some stores must survive, and
whether some should become non-participating rather than erased are all
**unanswered and unasked here**.

---

## 6. Falsification attempt

The proposition was attacked directly: *is there a coherent, authoritative
general member-memory erasure operation F5-A missed?*

Instruments: every `lib/**` and `app/api/**` file issuing two or more
member-keyed `DELETE FROM … WHERE (user_id|member_id) =` statements; every file
naming a general erasure intent (`forget me`, `right to be forgotten`,
`erase everything`, `delete all my`, `purge member`, `gdpr`); the premium-storage
export surface; the `members/export-data` surface.

Two candidates surfaced. Both were traced and neither falsifies.

**Candidate 1 — `lib/services/UserService.ts` → `deleteUser(userId)`.**
Five `DELETE` statements in one transaction across `memories`,
`analytics_events`, `daimonic_encounters`, `user_api_keys`, `users`. Disposition:

- **No caller anywhere in the repository.** The only other `deleteUser(` hit is an
  unrelated method on an in-memory store.
- Statements use `?` placeholders against an abstract `IDatabaseService` resolved
  from a `ServiceContainer` — not PostgreSQL `$n`, not `lib/db/postgres.ts`.
- **None of its five target tables has a `CREATE TABLE` in the canonical
  migration directory**, and `users` is not the canonical member table.

→ `standing: LATENT`.

**Candidate 2 — `app/api/premium-storage/export` `DELETE`.**
Authenticated via `getMemberIdFromRequest`, ownership compared against the
session, non-disclosing 404 on mismatch, file unlinked and row removed. A
well-governed path — and its scope is **one export archive named by `exportId`**,
not the member's retained knowledge.

→ Does not falsify; scope is wrong by construction.

Also checked and excluded: `lib/storage/userStore.ts` (`deleteUser` over a
process-local `Map`, non-durable, and its only importers call `getUser`);
`app/api/members/export-data` (export, not erasure).

**Result: the proposition survives.** No coherent, authoritative general
member-memory erasure operation was located at this SHA.

---

## 7. What F5-B did not establish

- Whether any traced path has ever executed. Every `REACHABLE` row carries
  `runtime exercise: UNWITNESSED`.
- Whether the five tables of §1.3 exist in the production schema.
- Whether `ACCESS_CONTROL_MODE` is unset in production, beyond the repository's
  own assertion.
- What the `[auth-posture]` marker shows about the live client population.
- Whether any member has been shown, or could reach, the declared scope of §3 —
  the page sits behind a gate members do not pass.
- Whether the coincidental prefix of §1.1 has ever been the only thing standing
  between an unauthenticated caller and the route.
- What the correct architecture is. **Not asked, not answered.**

---

## 8. Standing

```
F5-B             COMPLETE
Outcome          NON-AUTHORITATIVE
Evidence subject 7ee173db

B1  mechanism REACHABLE · authority chain NOT ESTABLISHED · subject caller-supplied
B2  REACHABLE · truthful refusal · claims no erasure · delegates to a human channel
B3  DIVERGENT — declared scope vs executable scope, in three independent ways
B4  MIXED — server-derived and subject-bound on four destructive paths;
            client-asserted on the living-field family, unmapped in the matrix
Proposition      SURVIVED FALSIFICATION
Substrate fact   CARRIED, UNACTED

Mutation NONE · Repair NONE · Schema UNTOUCHED · Migration NONE
Production UNTOUCHED · Recommendation NONE · F5-C NOT CHOSEN
```

> *The organism refuses well where it has authority, and declares well beyond it
> where it does not. The one surface that names the act the member would
> recognise — erase what you carry about me — is the one surface where the member
> is not established as its subject.*
