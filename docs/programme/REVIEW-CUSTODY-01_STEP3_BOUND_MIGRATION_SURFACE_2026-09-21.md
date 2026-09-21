# REVIEW-CUSTODY-01 · STEP 3 — FIRST BOUND REVIEW SURFACE

**Date:** 2026-09-21
**Authority:** Founder authorization — Step 3 only
**Surface:** production database migrations
**Predecessor:** `3848d90d4ce0d0dfebc8010c7fd98400ba7ec0f7`

## Preserved law

Step 1 remains frozen at the recorded blob identities. Step 2 remains the
mechanically-derived coverage boundary. The three questions stay separate:

```text
witness  → is the coverage claim physically evidenced?
admit    → is the review record admissible?
check    → does the admitted approval still apply?
```

No frozen Step 1 file is modified by Step 3. Additive migration binding is
implemented outside the frozen core.

## Step 3A — host trace conformance witness

Host: Kelly's Mac Studio. Claude Code: `2.1.273`.
Invocation mode: separate `claude -p` process, `stream-json`, restricted
tools, explicit UUID session identity.

Witness session:

`7b2691c3-f287-4e2e-b073-338d43ccf0b9`

The actual stream carried a stable `session_id`, an assistant
`tool_use` entry named `Read`, and `input.file_path` naming the file read.
The harness `system/init` record also carried the reviewer working directory.
The Step 2 parser accepted the real stream without modification:

```json
{
  "kind": "witnessed",
  "files": ["TRACE_WITNESS.txt"],
  "undisclosed": [],
  "scopes": []
}
```

The host exposed `Read`, `Grep`, and `Glob` in this run.
`NotebookRead` was requested but was not present in the emitted tool list.
That is recorded as an observed host fact, not generalized beyond this run.

**Step 3A result: PASS. Parser repair not required.**

## Step 3B — production migration binding

The governed seam is `scripts/deploy-production.sh`, not the generic local
migration engine. Local bootstrap, reconstruction, and test databases are not
given production authority by this act.

Before a production migration act, the deploy lane now derives the **actual
pending set** read-only from:

1. the exact migration context that would execute; and
2. production `schema_migrations.filename`.

If the pending-set read cannot be established, the gate refuses rather than
guessing.
If the pending set is empty, no migration review is required. If it is non-empty,
all three external evidence paths are mandatory:

- `REVIEW_CUSTODY_RECORD`
- `REVIEW_CUSTODY_REVIEW`
- `REVIEW_CUSTODY_TRACE`

The additive gate `scripts/review-custody-migration-gate.ts` requires:

- exact target SHA equals the record's bound `repo_head`;
- exact review bytes equal the admitted `review_sha256`;
- the real trace carries the review's declared identity;
- the trace's harness-emitted `cwd` supplies the normalization root;
- Step 2 mechanically witnessed coverage succeeds;
- frozen `check` says the approval still applies to the immutable target;
- the bound plan itself has a witnessing `Read`;
- every production-pending `.sql` file has a witnessing `Read`;
- every pending path exists inside the exact target commit.

The gate states custody only. It never states that a migration is correct.

### Deployment placement

For `deploy` and `update`, the review gate runs after the exact image has
been built and provenance-verified, but **before the container swap**. The
migration itself remains in its existing post-swap position; Step 3 does not
reorder schema and reader deployment.

The migration-only command is subject to the same bound review.
## Step 3C — first real migration review candidate

The first review witness is intentionally a real committed migration, not a
synthetic SQL fixture:

`database/migrations/20260916123000_turn_taking_preferences.sql`

The review is an evidence exercise only. This act does **not** authorize applying
that migration, deploying it, re-applying it, or touching production schema.

The reviewer must run as a separate process with read/search tools only, produce
a schema-valid review, and allow its actual trace to establish coverage.
`REVISE` or `BLOCKED` are lawful outcomes and must not be converted to
`APPROVED` for the sake of completing Step 3.

After an admitted approval, the witness must demonstrate:

```text
clean exact state → check applies
deliberate state drift → check refuses continued applicability
restored exact state → check applies again
```

Only after those observations exist may Step 3 be presented as complete.

## Explicit non-authority

No production mutation, schema application, canon-amendment binding,
provider-governance change, capability-tier change, Q3 resolution,
foreign-provider execution, or weakening of the frozen corpus is authorized.

## Live instrument finding before Step 3C completion

The first real reviewer run returned a substantive `REVISE` review, but admission
did not reach the record boundary. Claude Code's `--json-schema` mode emitted a
`StructuredOutput` tool event after the reviewer reads. Step 2 had never observed
that host event and therefore classified it fail-closed as an unknown possible
read channel:

`UNWITNESSABLE_READ_CHANNEL: StructuredOutput`

The record remained unapproved. No review verdict was converted or discarded.

This exposed a host-conformance defect in the instrument: `StructuredOutput`
formats model output and does not read repository content. The repair classifies
that one observed formatter as non-witnessing. `Bash` and every unrecognised
tool remain fail-closed. The original Step 2 eight-law matrix remains unchanged;
a separate Step 3 host-conformance witness proves the new classification.

Because the repository state changes to make this repair, the first review trace
will not be reused for admission. Step 3C must be rerun against the repaired exact
SHA with a newly bound record and a fresh reviewer session.

## Step 3C observed result — HOLD

Fresh review target:

`86e4249870bf9464737a63f9a2974d8d8c0c7659`

The separate reviewer independently read the deployment script as well as the
migration and relevant voice preference source. Its exact structured result is
preserved in `STEP3C_REVIEW.json`.

Observed custody chain:

```text
physical review trace      PASS · 10 attested files witnessed
admit                       ADMITTED · verdict REVISE · 2 medium · 1 low
check                       REFUSED [NOT_APPROVED]
drift witness               NOT REACHED — no approved state exists
```

The two material review findings are:

1. the migration adds its CHECK constraints without a staged `NOT VALID` /
   `VALIDATE CONSTRAINT` path, creating a lock/validation risk whose practical
   severity depends on production table size; and
2. the repository's current deploy ordering swaps the new reader before running
   migrations, while the voice preference write path references the new columns
   without the read path's graceful-degradation behavior, creating a bounded
   missing-column failure window if this migration were genuinely pending.

The low finding records absence of a companion rollback file.

These are reviewer findings, not production observations. The reviewer explicitly
had no production ledger, row-count, or runtime timing access.

### Standing

**STEP 3 SUCCESS CONDITION: NOT MET.**

The instrument worked: it did not turn a material review into an approval.
The authorized drift witness cannot be manufactured because `check` correctly
refuses `REVISE` before continued-applicability analysis.

No alternate migration will be selected merely to obtain a green result. No
historical migration bytes, deployment ordering, reader compatibility behavior,
production schema, merge, or deploy are changed under this Step 3 act.

A new Founder ruling is required to open remediation of the material findings.
