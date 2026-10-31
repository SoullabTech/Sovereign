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

## ⭐ v2 — PROPOSED 2026-10-30 (adoption requires a founder ruling; the v1 matrix below is superseded in part only once that ruling exists)

**Why.** The 2026-10-21 Co-Lab reboot (#1800 comments 6317117002 / 6318272474) archived every old team as a
`[Legacy …]` anchor (rows kept for foreign keys, memberships removed) and created the active topology: Team Soullab
(admin workspace) and Soullab Founding Circle, both owned by `Kelly`, plus Jondi's Co-Lab. The v1 gate hard-coded
three principals (`info`, `Jondi`, `nathan`) each owning a personal Co-Lab; it aborted before running any check on
2026-10-30 (`kelly=MISSING, nathan=MISSING`). That was an instrument failure, not a boundary result.

**Exit codes.** `0` no check failed · `1` a boundary check FAILED · **`3` PRECONDITION UNMET — the instrument could
not render a verdict. This is NOT a pass.** Every deploy gate treats all non-zero exits as a block.

**Principals** (declared in the script; changing them is a governed change): `Kelly` and `Jondi`, each of whom must
own an ACTIVE Co-Lab. "Active" is derived from data — a team is a legacy anchor iff it carries BOTH of the reboot's
legacy markers (name and description) — never from a hard-coded name list.

**Ownership is structural, not nominal.** Any member may own a Co-Lab (every tester gets their own). The gate asserts that
every ACTIVE Co-Lab has exactly one owner, that roles are only `owner`/`member`, and that the admin workspace holds only
its declared owner — not who the owners are.

**The 29 checks.** (1) Topology: exactly one admin workspace, owned by Kelly; no legacy anchor flagged admin; legacy
anchors hold zero memberships; roles are `owner`/`member` only (NULL is invalid); every active Co-Lab has exactly one owner;
the admin workspace holds only its declared owner (no one stranded in the commons — the intent of v1's "new tester" check,
which **could fail** and is ported, not dropped). (2) Between principals: no co-ownership; neither holds a role above
`member` in the other's Co-Labs. (3) Scoped data: colab-scope atoms, files, sessions, DM participants and channel members on
ACTIVE Co-Labs all belong to a member of that Co-Lab; no channel or DM thread hangs off a legacy anchor. (4) Integrity:
personal atoms/files carry no `team_id`; every atom/file scope is `personal` or `colab`; every colab-scope row and every
DM thread names a Co-Lab, and that Co-Lab exists; every colab-scope file and team-scoped session resolves to a practitioner;
every DM participant belongs to a thread that exists. (5) Client notes belong to the practitioner who owns the client and
are stored encrypted. Rows retained on legacy anchors are reported as information only; whether they are reachable
depends on runtime read paths this gate does not test.

**What changed from v1 and why.** v1's "people scoped" and "switching changes context" checks only ran a query and could
not fail; they were removed, not ported. v1's "new tester" check could fail and its intent is ported (see above). v1's
WARN on any role in another principal's Co-Lab is now informational for role `member` (the Founding Circle legitimately
includes Jondi): **this relaxation is a held decision**, as is the fact that the gate reports GREEN over 4 non-owner
memberships with a NULL `invited_by` (information only). **Departure semantics (decision held):** a member who leaves a
Co-Lab and leaves content behind will FAIL the scoped-data checks until the content is reviewed — deliberately conservative.
The `warned` counter is retained for the deploy gate's contract but v2 emits no warnings.

**Not covered by this gate:** `studio_people` and `encounters` (no member linkage to test), message contents, Writer
manuscript/Source custody, sign-in boundaries.

**RULINGS REQUIRED — one founder question, five parts; none has been given, so this change is HELD, not merged.**
(1) **Floor:** v1 31 → v2 **29**, a LOWERING (lowering is a recorded founder decision, never a convenience). (2) **Principals and
admin workspace:** Kelly and Jondi as principals; the admin workspace may hold only Kelly (owner). (3) **Role relaxation:** role
`member` in the other principal's Co-Lab is informational (v1 WARNed, which blocked). (4) **Departure semantics:** content or a
channel membership left behind by a departed member blocks deploys until reviewed (fixtures D36/D37 record this). (5) **`invited_by`
NULL:** 4 non-owner memberships; the gate stays green over this open question.

**Bootstrap.** The deploy gate runs the verifier from the RUNNING container, which still carries v1 until the first image with v2 is
live. The first deploy that adopts v2 must therefore pass `COLAB_VERIFIER_CMD` pointing at the candidate's verifier, and that override
must be named in the ruling that adopts it. **Residual control gap:** a floor equal to the exact check count catches deleted checks, not
rewritten ones (a check rewritten to `pass()` still counts); the real control is running the harness whenever
`scripts/verify-constitution-colab.ts` changes. **Unknown:** whether any path other than the reboot retires a Co-Lab (a tester who leaves
their own Co-Lab would trip the exactly-one-owner check).

**Proof.** `tests/constitutional/colab-gate/harness.py` — a synthetic, shape-compatible database; a baseline with positive
controls that must pass (`29 passed · 0 failed · 0 warned`); 37 defeat fixtures each killed on its named label (including two departure cases); 3 positive
fixtures that must still pass (including a new tester who owns their own Co-Lab); 9 gate mutants. And
`tests/constitutional/colab-gate/verify_floor.sh` — the deploy gate blocks on failure, warning, a count under the floor, a
precondition abort (with or without the marker), an unparseable run, and a non-zero exit with a clean-looking summary.
**Production run, read-only, 2026-10-30, runtime `d1697e9e5`: `29 passed · 0 failed · 0 warned`** (#1800 comment
6532992429; instrument sha256 `c7c999c5b860f2baa2b4167205de77591f28a71dddacb7246c1f4073be0f32ea`). The proof used a
synthetic schema; the production run is the only contact with real data. Three read-only reviews by a separate process of the
same model family informed the design; none is an independent human or tool review.

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
