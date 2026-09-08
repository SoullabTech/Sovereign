# Migration authority custody — design

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §V. DESIGN authorized.
**Status:** ⛔ DESIGN ONLY. No infrastructure change, no credential, no schema change is authorized.

> §V: *"Do not solve the recent unattributed-production-act problem by merely adding another powerful
> credential to the same undifferentiated environment."*

---

## 1. The current state, read rather than assumed

| Fact | Evidence |
|---|---|
| One identity for everything | `lib/db/postgres.ts`, `lib/database/postgres.ts`, `lib/skills/skillsRuntime.ts` all read the same `DATABASE_URL`. `POSTGRES_USER: soullab`. |
| Migrations run as that same identity | the `migrate` service loads the same `.env.production` as the app |
| ⚠️ **The migration ledger records no actor** | `schema_migrations (filename PRIMARY KEY, checksum, applied_at)` — **no commit, no deploy id, no operator, no host** |
| Attribution is available and simply not written | `GIT_COMMIT` is exported and verified pre- and post-swap before the migrate step runs |
| The deploy lane keeps no durable record | `scripts/deploy-lock.sh` writes holder metadata *into the lockfile*, overwritten by the next acquisition |

**Consequence, stated plainly:** on 2026-09-07 the question *"who applied these three migrations?"* was
unanswerable. It was unanswerable not because the information was lost but **because it was never
recorded, while being present in the process that ran them.**

⭐ **Therefore §V's warning has a precise reading.** Under ownership separation, the migration credential
stops being an operational convenience and becomes **custody of the constitutional boundary**: the role
that owns the protected tiers is the role that can drop the trigger, re-grant the app, or rewrite the
Source. Handing that authority to an environment that cannot say who used it would make the boundary
*less* accountable than the condition it replaces.

---

## 2. Three separations, in dependency order

### S1 — Separate the identity (a credential that runtime cannot reach)

The custodian/owner credential must not be present in any environment that executes application code.

- It belongs to the **`migrate` service only**, never to `maia`, workers, whisper, comms, or RLM.
- **Not in `.env.production`**, because that file is loaded by app services too — a variable defined
  once and shared is the undifferentiated environment §V refuses.
- ⚠️ **Testable, not merely intended:** a runtime container that can reach the owner credential fails
  the design. The check is `docker exec maia-sovereign printenv` showing no owner credential, and a
  runtime connection attempt as the owner failing — the same shape as the existing
  `printenv GIT_COMMIT` provenance check, and it should live beside it.

### S2 — Separate the act (attribution written where the act lands)

Extend the ledger the migration itself writes, so attribution is a **property of the applied migration**
rather than of a log someone must still be holding:

```
schema_migrations  + applied_by_commit    the SHA the deploy asserted (already exported)
                   + applied_by_entry     deploy | update | migrate | deploy-maia
                   + applied_by_actor     unix user @ host of the deploy process
                   + deploy_lock_id       ties the row to one lock acquisition
```

Every value is already in the process that runs migrations. **This is a recording gap, not a
capability gap** — which is why it is the cheapest item in this design and the one that would have
answered the 2026-09-07 question in a single query.

Beside it, the deploy lane needs the append-only line the September finding already argued for:
`timestamp · entry · target_sha · user@host · pid` per lock acquisition, so a deploy that fails before
migrating is still attributable. ⛔ Neither is authorized here.

### S3 — Separate the evidence (owner-level change distinguishable from runtime writes)

Attribution is not enough if an owner-level write cannot be told apart from a runtime one after the
fact. Three complementary signals, in increasing cost:

| | Signal | What it distinguishes |
|---|---|---|
| a | `log_connections` / `log_statement='ddl'` **per role** | any owner-role session at all, and every DDL it issued |
| b | An **event trigger** recording DDL against the protected tiers | schema changes to the boundary itself — including a dropped refusal trigger |
| c | The **lifecycle record** of the companion design (Option D) | lawful lifecycle acts, which are *runtime* acts through the seam and must remain visibly distinct from owner-level DDL |

⭐ **(c) is the load-bearing one and belongs to both designs.** With the lifecycle record in place,
every legitimate change to protected Source is either **a named lifecycle act by a member through the
seam**, or **a migration attributable to a commit and a deploy**. Anything else — an owner session that
wrote content and named no act — is, by construction, the thing to investigate. **The two designs are
what make each other legible: neither alone yields that residue.**

---

## 3. What the design does not do

- ⛔ **It does not make the owner credential safe by hiding it.** S1 reduces reach; it does not reduce
  power. Anyone holding it holds custody, and the honest statement is that the boundary is only as
  strong as the deployment's control of one secret.
- ⛔ **It does not solve emergency access.** A production incident requiring direct Source repair is a
  legitimate need with no representation here, and inventing a break-glass path unasked would create a
  third route around custody. Named as open.
- ⛔ **It does not settle where the credential is stored** — env file, secret manager, or operator-held
  and injected per deploy. The 2026-09-07 MAIL-04c rotation showed that a bare `up -d --no-deps` can
  recreate a container with new env, taking no lane lock and running no provenance verify. **That path
  must not be able to hand a runtime container the owner credential**, and closing it is a deploy-lane
  question outside this design.

## 4. Ordering

**S2 is independently valuable and cheapest** — it repairs a known attribution hole whether or not
ownership is ever separated. **S1 is a prerequisite of the enforcement build**, since separating
ownership while leaving the owner credential in the app environment would achieve nothing. **S3(c)
arrives with the lifecycle representation.**

⛔ No infrastructure change, no credential creation, no ledger column, no logging change, no event
trigger. PT-3 enforcement BUILD remains held.
