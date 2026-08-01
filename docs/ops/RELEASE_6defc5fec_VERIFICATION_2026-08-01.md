# Release `6defc5fec` — integrated verification record (2026-08-01)

**Immutable SHA:** `6defc5fec67f8f014a38b0471cb060642c7c5121`
(merge of [#861](https://github.com/SoullabTech/Sovereign/pull/861), confirmed
against `git ls-remote` as the actual remote tip, not a local ref)

**Result: 25 assertions, 25 passed, 0 failed. Baseline restored exactly.**

This is distinct in purpose from
[PR857_PRODUCTION_VERIFICATION_2026-08-01.md](./PR857_PRODUCTION_VERIFICATION_2026-08-01.md),
which records a **single fix**. This record covers an **integrated release**:
four capabilities verified *together in one running artifact*, which is the only
way the claim "they coexist" can mean anything.

---

## What made this release necessary as one unit

The release object was 13 commits carrying **four unapplied migrations**:

| Migration | Origin | Why it had to land here |
|---|---|---|
| `20260801000001_living_works` | #856 | On trunk since before the previous deploy, **never applied** — every deploy since had taken the quick lane, which runs no migrations |
| `20260731000001_practitioner_client_notes_continuity` | #846 | Has live runtime callers; without it, practitioner note writes fail |
| `20260801000002_living_work_title_optional` | #860 | Nullable-but-nonblank title |
| `20260801000003_practitioner_continuity_constraint_repair` | #861 | **Without it #846 ships two defects** |

The quick `deploy-maia` lane could not have produced this release. Only
`scripts/deploy-production.sh deploy <SHA>` runs migrations.

## Deployed artifact

| Check | Value |
|---|---|
| `GIT_COMMIT` | `6defc5fec` |
| `DEPLOY_LANE` | `deploy-lane` |
| Health | `healthy` |
| LAN IP | `192.168.0.104` |
| Smoke | all passed, incl. constitutional verification (Co-Lab + Memory + Relationships + Development + MAIA) |

Schema confirmed post-deploy: `living_works` present; `kind` / `status` /
`promoted_from` present; `status_check` contains `IS NOT NULL`; the FK reads
`ON DELETE SET NULL (promoted_from)`.

## The three domains, verified together

**Practitioner continuity** — note write (201), read + decrypt through the real
PHI accessor. **#861 confirmed live:** a commitment without status returns
`400 "status is required for kind 'commitment'"`; deleting a promoted source
returns `200` with **only** `promoted_from` nulled and `client_id` /
`practitioner_id` intact. Carry Forward records provenance and leaves the source
untouched. Cross-scope promotion refused plainly — no FK, not-null, or 500
internals reach the client.

**Living Work substrate** — table present, 6 columns, **0 rows (unused)**,
`title` nullable per #860. Present and inert, which is the correct state for a
substrate whose gesture has not yet shipped.

**Explicit Insertion** — checkpoint → insert → restore. The **exact prior draft
returns**, byte-identical. Version advanced 1 → 2 → 3 → 4: a restore is a new
revision, so history is never rewritten.

## Fixture boundary and residue

Disposable fixtures marked `DISPOSABLE 6defc5fec RELEASE VERIFICATION — DELETE`.
Cleanup ran in a `finally` block. **All eight tracked tables returned to their
exact pre-test counts** — including `practitioner_client_notes`, which was 3
before and 3 after: no pre-existing practitioner row was read, modified, or
deleted. Zero rows bearing the fixture mark remain. Zero 5xx in the container
logs. The verification script was removed from the container.

The authenticated session token was read and used **inside the container** and
never left the host.

## One correction, recorded because the failure is instructive

The first verification run failed with six `404`s. The fixture created a
**second practitioner** for the member — but `getCurrentPractitioner` resolves
by `member_id + status='active'` with `LIMIT 1`, so the session resolved to the
member's **pre-existing** practitioner, and the disposable client then failed
`assertClientOwned`. Corrected by resolving the practitioner the session
actually resolves to and making only the **client** disposable — which is also
the less invasive fixture. The failed run cleaned up correctly and restored
baseline.

The general shape: *a fixture must be built against the identity the system will
actually resolve, not the one the test intends to create.*

## What this baseline establishes

For the first time, one production artifact contains Working Draft
save/checkpoint/restore, Explicit Insertion, practitioner continuity, and the
Living Work substrate — and they were verified in the same run rather than
separately. The Studio exists as an integrated environment rather than a set of
capabilities that happen to share a repository.

`living_works` being present-and-empty is the precondition the declaration
gesture was deliberately held for: there is now something real to declare into.
