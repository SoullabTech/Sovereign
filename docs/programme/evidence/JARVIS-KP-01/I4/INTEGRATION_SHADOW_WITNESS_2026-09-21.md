# JARVIS-KP-01 / I4 — Integration Shadow Witness

**Date:** 2026-09-21
**Candidate base:** `20c8764b516e042f38e33800f71b2bb040025665`
**Data class:** SYNTHETIC / LOCAL ONLY
**Production activation:** NONE

## Final local instruments

| Instrument | Result |
|---|---|
| `npm run matrix:epistemic-join-i4` | **22/22 PASS** |
| `npm run test:epistemic-join -- --runInBand --no-cache` | **110/110 PASS** |
| relational-field runner containment | **8/8 PASS** |
| `npm run typecheck:epistemic-join` | **EXIT 0** |
| `npm run witness:epistemic-join-i4-db` | **PASS** |
| legacy shadow evidence writer/type comparison | **BYTE-IDENTICAL** |
| `git diff --check` | **PASS** |

## Falsifier-driven corrections

### 1. One source is not a semantic join

The first runner-level integration attempt used one basis evidence object.

Canonical I2 refused it as malformed:

`relation_requires_two_endpoints`

I4 was narrowed rather than I2 weakened.

Final law:

> only a synthesis with two or more distinct basis evidence objects enters the epistemic-join shadow.

Single-source provisional synthesis remains in the pre-existing relational
shadow and is not misrepresented as a join.
### 2. OFF must mean the old writer is unchanged

The first telemetry design added a nullable column to the existing
`maia_relational_field_shadow_runs` INSERT.

That would have made the ordinary shadow writer depend on the I4 migration even
with the I4 feature flag OFF.

The design was rejected before candidate freeze.

Final design:

- canonical ordinary evidence writer remains byte-identical;
- I4 owns a separate child telemetry table;
- telemetry is attempted only after the parent shadow row persists;
- telemetry failure cannot roll back or rewrite the parent row.

### 3. Static instrument correction

The initial I4 matrix returned **19/20** because one falsifier stripped comments
and then tried to prove async launch by matching a comment.

The implementation was not changed.

The instrument was corrected to inspect executable structure:

- `setImmediate(() => {`;
- unawaited `void runRelationalFieldShadow(...)`.

The corrected and strengthened matrix returns **22/22 PASS**.
## Database witness

The disposable PostgreSQL witness proves:

1. counts-only structural telemetry inserts;
2. `representation_closed = false` is refused;
3. the telemetry schema contains no semantic payload columns;
4. telemetry cannot exist without its ordinary relational-shadow parent;
5. standing-count maps reject keys outside the closed I2 standing vocabulary;
6. refusal-count maps reject keys outside the closed I2 refusal vocabulary;
7. count-map values must be non-negative numeric integers.

The schema additionally enforces `evaluated_count + error_count = proposal_count`.

No production database or member record is used.

## Runtime containment

The existing relational-field launcher remains asynchronous.

With the inner I4 flag OFF:

- the ordinary shadow row is unchanged;
- the I4 telemetry sink is never called.

With the inner flag ON in synthetic tests:

- I2 receives only an already-renderable provisional synthesis;
- the live response object is unchanged;
- I2 admits only `CANDIDATE_UNESTABLISHED`;
- representation authority remains closed;
- only counts/status telemetry leaves the evaluator.

I4 contains no call to `persistEpistemicJoinSnapshot`.

## Local repository-typecheck limitation

The host was already under severe disk pressure, so I4 was opened in a sparse
worktree after a full checkout failed.

Running the repository baseline gate there produced a 9-file ship program
instead of the canonical ~4k-file program. The gate correctly failed on lost
coverage and absent sparse directories.

That run is **not evidence of an I4 regression** and is **not recorded as a
PASS**.

Hosted PR CI must establish the full repository no-regression gate before I4
may be considered for merge.
## Canonical freshness at candidate freeze

After I4 opened from the authorized base, `origin/clean-main-no-secrets` advanced to
`0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`.

Mechanical comparison at freeze time showed:

- authorized base is 0 commits ahead / origin is 22 commits ahead;
- the origin delta changes 35 files;
- zero file overlap with the I4 candidate scope;
- zero changes under `lib/ain/epistemic-join/**` or `lib/maia/relational-field-shadow/**`.

No rebase or replay was performed under the I4 act. Freshness reconciliation
remains a separate Founder adjudication before PR/canonicalization.

## Standing

> **REAL SHADOW INGRESS WIRED · CANDIDATE-ONLY EVALUATION · TELEMETRY STRUCTURAL · BEHAVIORAL AUTHORITY CLOSED**

This witness does not establish:

- production shadow quality;
- correctness across all MAIA proposal paths;
- automatic derivation of epistemic structure;
- durable semantic-join persistence from the runtime path;
- representation authority;
- I5 readiness beyond opening a separate adjudication.
