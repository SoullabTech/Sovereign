# EARLY-FIELD-01 — Merge and Deployment Record

**Date:** 2026-10-01 · **Kind:** operational record. This is evidence about **deployment**, not
part of the certified implementation. Founder ruling: production history around admission is
kept out of the candidate (#1547 stayed frozen at its certified head) and recorded here.

> Production history belongs to the operational record. Certified implementation stays
> immutable between CI evidence and merge.

---

## 1 · Merge record (#1547)

| Item | Value |
|---|---|
| Merge commit = new canonical | **`cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`** on `clean-main-no-secrets` |
| Merge parents | `71859c3a3` (canonical before merge) · `0e29c65df` (PR head) |
| Merged by | founder, merge commit (lineage preserved) |
| Certified code lineage | `c31b85a34` (certified) → `700d9d361` (canonical `89f7876e8` merged in) → `0e29c65df` (canonical `71859c3a3` merged in) — **all three are ancestors of `cc1c5b4d7`** |
| Why the head moved after certification | #1544 (docs only: one file, `H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md`) landed on canonical; the branch was updated onto it at 00:05Z. No implementation commit was added. |
| Implementation identity | `diff(89f7876e8 → 700d9d361)` **==** `diff(71859c3a3 → cc1c5b4d7)`, byte for byte: the same 8 files, +601 / −2. |
| CI | All checks green on **both** `700d9d361` and `0e29c65df` (10/10 on `0e29c65df`, `build` completed 00:16:07Z). |
| Supersedes | #1542 (closed; same certified code) · #1541 (closed; alternative design) |

**Merge declaration, as admitted:**

> EARLY-FIELD-01 is admitted only for the governed object `LivingFieldInstrument`. Nothing
> about admission alters universal Living Field access, authorship, navigation or
> circulation. The server is authoritative; the client bundle is not authorization. The
> default state remains closed.

**Merged ≠ deployed.** At the time of writing, production does not run `cc1c5b4d7` (§2).

## 2 · Production sequence, 2026-09-30 → 2026-10-01

Facts are from the founder's terminal output relayed in session. Times not captured in that
output are marked as not recorded, never inferred.

| # | Act | Running after | Instrument exposure |
|---|---|---|---|
| 0 | (before) | `04005ca7c` | **None.** `04005ca7c` does not contain `LivingFieldInstrument`. |
| 1 | Quick-lane deploy at **23:28Z** by `soullab@soullab`, **out of intended order**: canonical was deployed before EARLY-FIELD-01 existed as a merge candidate, against the deployment law (EARLY-FIELD-01 record §7). | `7ec42ce6f` | **Ungated, all members.** `7ec42ce6f` includes #1539, which mounts the instrument unconditionally. |
| 2 | Forward deploy, `pre-deploy-gate.sh deploy-maia 89f7876e8` (time not recorded) | `89f7876e8` | Ungated, unchanged. |
| 3 | `deploy-production.sh rollback` (time not recorded); "Rollback complete! Now running: 7ec42ce6f"; alert send failed (non-critical, per script) | `7ec42ce6f` | Ungated, unchanged. |
| 4 | Redeploy, `deploy-maia 89f7876e8` (built from cache; time not recorded); verified `GIT_COMMIT=89f7876e8` from `printenv` **and** `Config.Env` | **`89f7876e8`** | Ungated, unchanged. |

**Remedy taken:** deploy forward rather than revert. `89f7876e8` carries the H1 failed-read
fix (#1540), which `7ec42ce6f` lacked.

### Rollback tags after act 4

- `maia-sovereign:previous` → **`7ec42ce6f`**.
- **`04005ca7c` is no longer a rollback target** (pruned). A rollback now lands on
  `7ec42ce6f`, which also exposes the instrument ungated. The only pre-instrument image is
  no longer one command away.

### No widening beyond the exposure that began at act 1

Verified in source, not asserted: between `7ec42ce6f` and `89f7876e8` there is **no
change** under `components/maia/living-field`, `app/maia/living-field` or
`app/api/maia/living-field`, and both mount `<LivingFieldInstrument />` at the same line
(`PersonalLivingFieldDashboard.tsx:122`), ungated. Acts 2–4 therefore did not widen who
meets the instrument. ⚠️ This is a statement about code, not about member observation:
**no telemetry was added**, and no member report is claimed either way.

### Standing at the time of writing

- **Production:** `89f7876e8`, **ungated**. Every signed-in member who opens the Living
  Field dashboard can meet `LivingFieldInstrument`. It has been ungated since act 1 at
  23:28Z.
- **Canonical:** `cc1c5b4d7` = `89f7876e8` + #1544 (docs) + EARLY-FIELD-01.
- **The exposure closes only on the canonical deploy** in §3, not on the merge.

## 3 · Next production act (owed, founder-run)

1. **Re-check the environment** on minisforum immediately before deploying; don't rely on
   the earlier check: `EARLY_FIELD_ENABLED` unset or `false` · `EARLY_FIELD_MEMBER_IDS`
   empty.
2. **Deploy the canonical SHA `cc1c5b4d7`**, not the PR head `0e29c65df`:
   `scripts/pre-deploy-gate.sh deploy-maia cc1c5b4d7` (EARLY-FIELD-01 has no migration).
3. **Verify provenance on both channels:** `docker exec maia-sovereign printenv GIT_COMMIT`
   **and** the container `Config.Env` both report `cc1c5b4d7`.

## 4 · Closure witness: non-cohort first (owed)

This is the condition currently failing in production and the reason this deployment
matters, so it is witnessed **before** the admitted path or the full H1 browser witness.

With a **signed-in ordinary member** (not in any cohort list):

| Check | Expected |
|---|---|
| Reaches the Living Field | ✅ The Living Field still loads. **EARLY-FIELD gates the instrument, never the Living Field.** |
| `LivingFieldInstrument` | **Absent** |
| `GET /api/early-field/admission` | `{"admitted":false}` |

A result is recorded here as observed, with the runtime SHA. Until it is recorded,
EARLY-FIELD-01 is **merged, not deployed and not witnessed in production**.

## 5 · Witness origins, kept separate

- **#1539 witness:** `http://127.0.0.1:3139`, origin-preservation evidence. ⚠️ This origin
  is **not yet written on canonical**. The only canonical mention of 3139 (H1 census §,
  cookie-collision note) calls it `localhost` 3139 as an explanation of that collision. That
  mention is **not** the #1539 origin law and does not replace it. The origin belongs in
  #1539's own evidence record.
- **H1 admission witness:** `http://localhost:3100`, the clean single-port canonical
  admission environment. Authorized by H1's own record
  (`HOUSE-STUDIO-CIRCULATION-01_CENSUS_2026-09-30.md`: "the admission build
  (`localhost:3100`)", 3100 = `h1-admission`).
- Browsers treat `127.0.0.1` and `localhost` as different cookie hosts, so the separation
  also keeps the two databases' member claims apart, which was the cause of the earlier
  401s. Clearing site data before each walk remains prudent.

H1 remains **merged, not admitted** until its browser witness passes.
