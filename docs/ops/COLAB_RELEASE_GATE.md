# Co-Lab Release Gate

**Principle:** A Co-Lab release is not ready because the UI looks correct. It is ready when production data proves that ownership, membership, memory, files, sessions, DMs, and people are scoped correctly.

---

## Standing gate

Before inviting testers or deploying changes to any of the surfaces below, the boundary verification must pass:

```bash
# Preferred — the gate wrapper (run from the Mac Studio, executes on minisforum).
# Enforces: passed >= MIN_COLAB_CHECKS (31) AND 0 failed AND 0 warned AND exit 0.
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && scripts/pre-deploy-gate.sh colab'

# The verifier alone — prints the full matrix, enforces nothing.
# Runs inside the container, where pg is available.
ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
  "DATABASE_URL=\$DATABASE_URL npx tsx scripts/verify-constitution-colab.ts"'
```

**Instrument:** `scripts/verify-constitution-colab.ts` (529 lines; emits `✅ PASS` / `❌ FAIL` / `⚠️  WARN` per assertion and a final `Results: X passed · Y failed · Z warned (N total)` line; exits 1 on any FAIL).

**Pass condition:** `33 passed · 0 failed · 0 warned`

**Last production witness:** 2026-09-06, container `GIT_COMMIT=50302f5d9`. Gate wrapper: `Co-Lab boundaries: 33 passed · 0 failed · 0 warned (floor 31)`. Verifier: `Results: 33 passed · 0 failed · 0 warned (33 total)`. Prior witnesses of 33: `293d454cf` deploy (2026-09-04, `docs/programme/MEMORY-PRODUCER-PARTITION-01.md` §13.1) and the CMT-01 M2 deploy (2026-09-03).

> **Name history.** This script was `scripts/verify-colab-boundaries.ts` (added in `de88c8e9d`, fixed in `1bec9075d`) until commit `b806fa49c` renamed it to `scripts/verify-constitution-colab.ts` — git recorded `R100`, byte-identical at the rename — so it would join the `verify-constitution-*` family alongside four new subsystem verifiers. Same gate, same semantics, new name. The old path does not exist at the `clean-main-no-secrets` tip (verified `50302f5d9`, 2026-09-06) and the old documented command fails with `ERR_MODULE_NOT_FOUND`. `scripts/pre-deploy-gate.sh` and `scripts/constitutional-verification.sh` always used the new name, so the deploy-path gate was real throughout; only the documented manual command was stale.

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

## What the matrix verifies (33 assertions across 12 sections)

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

> **How 33 is counted (static read of `main()`, 2026-09-06).** Each `check*` function emits exactly one result per assertion — `pass` / `fail` / `warn` are mutually exclusive branches — and no assertion's arity varies with row counts (principals are hard-coded; §11 iterates a fixed 6-element `domains` array). Per call site: §1 ×3 · §2 ×3 · §3 ×4 · §4 ×3 · §5 ×2 · §6 ×2 · §7 ×3 · §8 ×3 · §9 ×1 · §10 ×1 · §11 ×6 · §12 ×2 = **33**. The same method on the pre-§12 script gives 31, matching the historical figure. The count is also **witnessed**: the production run recorded at the top of this document printed `33 passed · 0 failed · 0 warned (33 total)`.
>
> Two checks can legitimately emit `WARN` rather than `PASS` (`checkNoMemberAccessToOthersTeam` in §3, `checkAdminWorkspace` in §9), so an all-green run is not automatic — any WARN blocks until reviewed.
>
> `scripts/pre-deploy-gate.sh` enforces `MIN_COLAB_CHECKS=31` as a **floor**, not an equality. The floor is deliberately below 33: it catches a verifier that silently drops checks, while the exact expected count lives here. When a new check ships, raise the floor and this count together.

---

## Automated integration

The gate runs automatically in two deploy paths. Neither invokes `verify-constitution-colab.ts` by its own name from `deploy-production.sh`; both reach it through a wrapper.

**1. Pre-build — `scripts/pre-deploy-gate.sh`.** `gate_colab` runs before every `deploy-maia <SHA>` build and inside `all`. It executes the verifier in the running `maia-sovereign` container (or `COLAB_VERIFIER_CMD` if set), parses the `X passed · Y failed · Z warned` line, and **blocks the deploy** unless `passed >= MIN_COLAB_CHECKS` (31), `failed == 0`, `warned == 0`, and the verifier exited 0. It prints:
- `[gate:ok] Co-Lab boundaries: 33 passed · 0 failed · 0 warned (floor 31)` — proceed
- `[gate:BLOCK] Co-Lab boundary gate FAILED — …` — deploy refused
- With no running container and `FIRST_DEPLOY=1`, the pre-build gate is skipped and the post-deploy path below still runs.

**2. Post-swap — `scripts/deploy-production.sh` `run_smoke_tests`.** Runs the five-subsystem orchestrator `scripts/constitutional-verification.sh` inside `maia-sovereign` (where `pg` is available). The orchestrator registers Co-Lab Boundaries, Memory and Relationships as `required=true` (failure blocks) and Development and MAIA as `required=false` (failure warns). A non-zero exit from the orchestrator fails the smoke report. The deploy summary emits exactly one **aggregate** line:
- `PASS  Constitutional verification (Co-Lab + Memory + Relationships + Development + MAIA)` — release is safe
- `FAIL  Constitutional verification — run: docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" bash scripts/constitutional-verification.sh'` — do not send invites; diagnose before proceeding
- `SKIP  Constitutional verification (script not in image)` — orchestrator absent (first-time or mid-deploy); re-run after deploy completes

> ⚠️ **The post-deploy summary does not print Co-Lab's count.** Per-verifier counts appear only in the orchestrator's own report, which `deploy-production.sh` captures and echoes **only on failure**. To see `33 passed` on a passing run, use the standing-gate command at the top of this document.

---

## Manual pre-invite checklist

Before sending tester invitations:

- [ ] `scripts/pre-deploy-gate.sh colab` reports `33 passed · 0 failed · 0 warned` in production (verifier: `scripts/verify-constitution-colab.ts`)
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
4. Update the pass-condition count in this document and in `CLAUDE.md`, and raise `MIN_COLAB_CHECKS` in `scripts/pre-deploy-gate.sh`
5. Re-run the gate in production and record the witnessed count at the top of this document — do not document a derived count as witnessed
