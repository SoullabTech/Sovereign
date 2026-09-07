# MIGRATION CUSTODY — before any deploy carrying the Studio lane

**Read-only. No migration work belongs to this lane, and none was done.**
Founder gate, 2026-09-07: *"'Studio is ready' must not silently become 'therefore
every unapplied canonical migration is authorized for production.'"*

## 1 · THE STUDIO LANE ADDS NO SCHEMA

Verified by tree comparison, not by reading the diff:

```
migrations on HEAD but not on origin/clean-main-no-secrets  →  NONE
```

Everything runtime-affecting in this lane is `app/writers-studio/**` and
`lib/writersStudio/**`. No API route, no middleware, no schema.

⛔ **That fact does not make the deploy schema-free.** The branch was merged up to
canonical, and `scripts/apply-migrations.sh` applies **every** file absent from
`schema_migrations` — it does not know or care which lane asked for the deploy.

## 2 · ⭐ THE FOUNDER'S CONCERN IS A WITNESSED INCIDENT, NOT A HYPOTHETICAL

The gate above describes, exactly, a defect **already discovered on this date**
and recorded in `CLAUDE.md` as the **SCHEMA DRIFT** finding:

> **MERGE-TO-CANONICAL IS LATENT SCHEMA-DEPLOY AUTHORIZATION.** *"The founder
> gate sits on the DEPLOY decision; nothing gates the BRANCH — so every lane that
> deploys silently deploys every other lane's pending schema."*

Directly witnessed twice: three Circle migrations applied at **18:24:46Z** under
no recorded authorization, and `vault_erasure_queue` (a WS-DELETE-01 migration)
carried into production at **19:31:48Z** by a **voice-fix** deploy that had no
interest in it.

**So this gate is not caution. It is the second lane in one day standing where
that defect fires.** Being the lane that notices is not the same as being the
lane that fixes it: ⛔ **BRANCH GATE is not opened here.**

## 3 · CUSTODY OF EACH MIGRATION THE DEPLOY WOULD ENCOUNTER

Classified against the founder's A/B/C, from the repository record only.

| Migration | Class | Basis |
|---|---|---|
| `20260906000003_circle_membership_removals` | **A** | applied 2026-09-07T18:24:45.957Z |
| `20260907000001_circle_inquiry_response_withdrawal` | **A** | applied 18:24:46.020Z |
| `20260907000002_circle_inquiry_status_retire_integrating` | **A** | applied 18:24:46.078Z |
| `20260907000001_vault_erasure_queue` | **A** | applied 19:31:48Z |
| `20260907000001_google_oauth_state` (MAIL-04c) | **⛔ UNRESOLVED** | its own record says *"Not yet deployed. Not yet witnessed. Not accepted."* |

⚠️ **A is "no new schema act", NOT "authorized".** The four Circle/vault rows
reached production by acts nobody has attributed. The founder ruling is
**RECONCILE FORWARD, revert not authorized** — and explicitly *not* retroactive
authorization. They are class A here for one narrow reason: **a deploy cannot
re-apply what `schema_migrations` already records**, so this deploy does not
repeat that breach. Their acceptance remains owed to the Circles lane.

**MAIL-04c is the only genuinely open question**, and it cannot be answered from
the repository: its record predates the evening's deploys, so *"not yet
deployed"* may simply be stale. It resolves to **A** or to **C**, and only
production can say which.

## 4 · THE READ-ONLY CHECK THAT DECIDES IT

⛔ No `ssh` binary exists in this session, so production state **cannot be read
from here** and is not claimed. This must be run by the founder:

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness \
  -c "SELECT filename, applied_at FROM schema_migrations WHERE filename LIKE '\''2026090%'\'' ORDER BY filename;"'
```

```text
google_oauth_state PRESENT  → A · deploy carries no unauthorized schema act → PROCEED
google_oauth_state ABSENT   → C · an unwitnessed MAIL-04c schema act rides the
                                  Studio deploy → HOLD, or authorize MAIL-04c
                                  on its own witness first
```

## 5 · TWO HAZARDS TO CARRY INTO THE DEPLOY ITSELF

1. ⛔ **A green deploy is not evidence a migration ran.**
   `scripts/deploy-production.sh` orders build → swap → verify → **migrate**, and
   a failed migrate step only `log_warn`s while still printing *"Deployment
   complete!"* Re-read `schema_migrations` **after** deploying; do not read the
   exit code as schema evidence.

2. ⚠️ **Three migrations share the prefix `20260907000001`**
   (`circle_inquiry_response_withdrawal`, `google_oauth_state`,
   `vault_erasure_queue`). Ordering falls to filename sort, which is
   alphabetical accident rather than intent. Harmless here — the three are
   independent — but it is a real ordering hazard the moment two same-prefix
   migrations touch the same object. Noted, not fixed; not this lane's.

## 6 · STANDING

```text
STUDIO LANE SCHEMA      none
DEPLOY PAYLOAD SCHEMA   5 canonical migrations, 4 already applied
OPEN                    google_oauth_state — production read required
DEPLOY                  HOLD pending §4 and the founder row-click witness
BRANCH GATE             not opened here
```
