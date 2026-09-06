# Co-Lab Release Gate

**Principle:** A Co-Lab release is not ready because the UI looks correct. It is ready when production data proves that ownership, membership, memory, files, sessions, DMs, and people are scoped correctly.

---

## Standing gate

Before inviting testers or deploying changes to any of the surfaces below, the boundary verification must pass:

```bash
# Run on minisforum (inside the container — pg is available there)
docker exec maia-sovereign sh -c \
  'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'
```

**Pass condition:** `0 failed`. Observed in production 2026-09-06, runtime `ca5fdff44`:
`33 passed · 0 failed · 0 warned` — a read-only run executed in-session via the founder's
connected host, not a manual founder execution.

Any failure or warning blocks the release unless explicitly reviewed and signed off.

---

## Surfaces that trigger this gate

| Surface | Why |
|---------|-----|
| Co-Lab creation / team management | Core ownership invariant |
| Studio people / client records | `team_id` scope on `studio_people` |
| Direct messages | `team_id` on `team_dm_threads` |
| Sessions and encounters | `team_id` on both tables |
| Practitioner files | `file_scope` + `team_id` on `practitioner_files` |
| Memory atoms | `memory_scope` + `team_id` on `member_memory_atoms` |
| Onboarding / first login | `ensureOwnCoLab` must route to owned workspace |
| Invitations and roles | `canActInTeam` enforcement |
| Any migration touching the above tables | Schema changes can silently widen scope |

---

## What the matrix verifies (33 checks)

1. **Ownership** — each principal (Kelly, Jondi, Nathan) owns exactly their own Co-Lab
2. **No accidental cross-ownership** — no one is owner of another principal's workspace
3. **Membership isolation** — no uninvited member has any role in another's private Co-Lab
4. **People scoped** — `studio_people` rows are partitioned by `team_id`
5. **DMs scoped** — `team_dm_threads` threads do not surface across Co-Lab boundaries
6. **Sessions scoped** — `sessions.team_id` prevents cross-bleed
7. **Files scoped** — `file_scope` + `team_id` on `practitioner_files`; personal files have `team_id = NULL`
8. **Memory atoms scoped** — `memory_scope` + `team_id` enforced; personal atoms have `team_id = NULL`
9. **Admin workspace declared** — Team Soullab has `is_admin_workspace = true` (bug routing is explicit, not order-dependent)
10. **New tester invariant** — every Team Soullab member owns their own Co-Lab; no one stranded in the commons
11. **Switching changes context** — Co-Lab switching changes people, DMs, sessions, encounters, files, and memory
12. **Practitioner client notes** — every `practitioner_client_notes` row's `practitioner_id` matches its client's owner (no note hangs off another practitioner's client), and every note is stored encrypted (`content_enc` + `content_enc_meta` non-NULL). Note: `practitioner_clients` has **no `team_id`** — only `studio_people` does — so containment here is owner agreement, not team scope.

> **Observed 2026-09-06.** Section 12's 2 assertions are included: a production run of the gate on
> runtime `ca5fdff44` printed `33 passed · 0 failed · 0 warned`. 33 is now measured, not derived.
> The run was read-only and executed in-session via the founder's connected host.
>
> The gate remains the `failed` column, never the total. A total that changes because checks were
> added is not a failure; a total quoted without a run behind it is a claim, not evidence.

---

## Automated integration

`scripts/deploy-production.sh` runs the Co-Lab boundary gate as part of post-deploy smoke tests. The gate runs inside `maia-sovereign` where `pg` is available. A non-zero exit from the verification script fails the smoke test report.

The deploy script will emit:
- `PASS  Co-Lab boundary gate (33 passed · 0 failed · 0 warned)` — release is safe
- `FAIL  Co-Lab boundary gate` — do not send invites; diagnose before proceeding
- `SKIP  Co-Lab boundary script not found` — image may be mid-deploy; re-run after deploy completes

---

## Manual pre-invite checklist

Before sending tester invitations:

- [ ] `scripts/verify-constitution-colab.ts` passes with 0 failed in production
- [ ] New tester has been provisioned an owned Co-Lab (check section 10 output)
- [ ] If any WARN appears: reviewed and explicitly signed off
- [ ] If any schema migration was applied: re-run the gate against the migrated database

---

## What "we fixed it" vs "we can keep it fixed" means

**Fixed:** a PR merges that adds `team_id` to a table and updates the routes.

**Can keep it fixed:** every subsequent deploy proves it in data, not just in code review. The gate is the difference.

---

## Adding checks to the matrix

When a new Co-Lab-scoped surface ships, add a corresponding check to `scripts/verify-constitution-colab.ts`. The pattern:

1. Identify the table and its scope column (`team_id`, `memory_scope`, `file_scope`, etc.)
2. Write a `check*` function that queries across principal boundaries and asserts zero cross-bleed
3. Add it to `main()` under the appropriate section
4. Update the pass-condition count in this document
