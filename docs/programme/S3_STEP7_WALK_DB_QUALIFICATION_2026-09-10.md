# Step 7 walk database — qualification

**Date:** 2026-09-10 · **Verdict:** QUALIFIED, narrowly scoped
**Instrument:** `scripts/witness/step7-walk-db-qualification.js`

## Why this exists

The walk environment did not survive; the earlier cluster's data directory was
empty. It was rebuilt from the repository's migration history on a fresh UTF-8
cluster. A partially reconstructed database must not be allowed to impersonate a
valid walk environment, and *"the tables we need exist"* is too weak a claim —
the walks depend on triggers, constraints, functions and provenance behaviour,
not on table presence.

## Reconstruction

| | |
|---|---|
| cluster | fresh, `server_encoding = UTF8` |
| migrations in repository | 480 |
| applied | **464** |
| residue | **16** |

The first pass left 31 failures. Eight were pure ordering and applied on a
second pass. Seven more failed only because `schema_migrations` did not exist —
that ledger is created by `scripts/apply-migrations.sh`, not by any migration
file, and the raw loop bypassed it. Driving the set to a fixed point (two
passes, 31 → 16 → 16) leaves 16.

## The closure, derived not asserted

The witness computes the transitive **module** closure of the walk entry points
(`ask/route.ts`, `ObservationDialogue.tsx`, `BodyAuthorizationPanel.tsx`) — 54
modules — extracts the SQL relations those modules reference, and keeps only
identifiers the live catalogue confirms are relations. English prose in comments
drops out instead of being asserted as a dependency (82 such candidates).

**16 relations in the closure**, all present, all carrying constraints:

```
relation                              check  fk  pk/uq  trig  idx
ask_threads                              2    2     1     1     3
ask_turns                                3    1     1     1     1
auth_sessions                            0    2     2     0     5
context_disclosure_receipts              9    1     2     3     4
developmental_readings                   6    1     1     3     3
manuscript_draft_sections                1    2     2     1     3
manuscript_sections                      4    1     2     0     2
manuscript_structure_members             0    2     2     1     3
manuscript_structure_proposals           4    1     1     1     3
manuscript_structure_units               7    4     2     1     5
manuscript_working_drafts                2    2     2     1     3
member_manuscripts                       3    1     1     0     2
members                                  6    1     3     2    23
pending_ask_claims                       6    3     1     1     2
runtime_consent_state                    1    0     2     1     3
working_draft_revisions                  1    2     2     2     3
```

Every governed trigger the paths depend on is present with its function:

```
ask_threads                 -> ask_threads_freeze()
ask_turns                   -> ask_turns_append_only()
context_disclosure_receipts -> context_disclosure_receipt_governed_delete()
context_disclosure_receipts -> context_disclosure_receipt_monotonic()
context_disclosure_receipts -> context_disclosure_receipt_restore_refusal()
developmental_readings      -> developmental_readings_immutable()
developmental_readings      -> developmental_readings_no_orphan_delete()
developmental_readings      -> developmental_readings_observations_check()
pending_ask_claims          -> pending_ask_claims_forward_only()
runtime_consent_state       -> s5_consent_state_immutable()
working_draft_revisions     -> working_draft_revisions_immutable()
working_draft_revisions     -> working_draft_revision_partition_check()
```

## The 16 failed migrations against the closure

Three tiers, because they are not the same risk. **ALTERS** (create/alter/drop,
or attach an index, trigger, policy or rule to a closure relation) and
**WRITES** (DML against one) both mean STOP. **INBOUND** — a new table pointing
*at* a closure relation, or naming it in a comment — changes nothing about it.
Anything the classifier cannot place is treated as ALTERS: it fails toward STOP,
never toward permission.

**Result: none of the 16 creates, alters, indexes, triggers or writes any
relation in the closure.** Four merely mention `members`:

| migration | how |
|---|---|
| `20260211212847_member_videos.sql` | the word "members" inside two `COMMENT ON` strings |
| `20260315120000_pattern_ledger.sql` | `member_id … REFERENCES members(id)` |
| `20260629000001_encounters.sql` | three outbound `REFERENCES members(id)` |
| `20260630000001_studio_people_team_scope.sql` | the word "members" in a header comment |

The residue is the encounters / studio_people (Co-Lab) cluster, comms/portal,
labtools, pattern ledger, member videos, memory-architecture and Corpus
Callosum telemetry — none of which the Writer's Studio / S3 path reaches.

## Falsification

The classifier carries a self-test that runs before every verdict — `ALTER
TABLE`, `CREATE INDEX … ON`, and DML on a closure relation must each be caught;
an inbound `REFERENCES` and a prose mention must each *not* be; a relation never
named must register as untouched. Six checks, all PASS; the witness refuses to
issue a verdict if any fails.

End to end: a probe migration containing
`ALTER TABLE context_disclosure_receipts ADD COLUMN probe_col text;`
added to the failed list produced **VERDICT: STOP**. Probe removed.

## The claim, scoped

> Step 7 acceptance was run on a repository-derived database sufficient for the
> Writer's Studio / S3 path; this does not attest to the 16 unrelated failed
> migration lanes.

## What this is NOT

The clean rebuild applied all three S3 migrations correctly from zero —
`pending_ask_claims` with `consumed_by_act`, the act-shape and paired-nullability
CHECKs, and `pending_ask_claims_forward_only()`; `context_disclosure_receipts`
admitting `writers_studio.ask->maia_developmental`. That is **corroboration**.
It does not replace the dedicated migration witness as the governed acceptance
record.
