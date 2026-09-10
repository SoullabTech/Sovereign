# RC R1 — proposal schema witness

Falsifiers for `database/migrations/20260910000001_manuscript_revision_proposals.sql`,
run against a **disposable** cluster. Never point these at a database anyone uses.

```bash
initdb -D /tmp/rcpg/data -U rc --auth=trust
pg_ctl -D /tmp/rcpg/data -o '-p 5599 -k /tmp/rcpg' -l /tmp/rcpg/log start
psql -h /tmp/rcpg -p 5599 -U rc -d postgres -v ON_ERROR_STOP=1 \
  -f scripts/witness/rc-r1/00-fk-prerequisites.sql
psql -h /tmp/rcpg -p 5599 -U rc -d postgres -v ON_ERROR_STOP=1 \
  -f database/migrations/20260910000001_manuscript_revision_proposals.sql
psql -h /tmp/rcpg -p 5599 -U rc -d postgres \
  -f scripts/witness/rc-r1/01-proposal-schema-falsifiers.sql
```

`00-fk-prerequisites.sql` is a **minimal stub** of the referenced tables — enough
to satisfy the foreign keys, deliberately not the real schema. It exists so the
migration can be validated without a full 526-migration reconstruction.

## What T10 discriminates against, and why it matters

RC-08 asks for the producer turn to be frozen. **Taken literally that makes this
table refuse thread deletion**, because `ON DELETE SET NULL` performs an UPDATE and
an absolute freeze raises on it — immutability defeating member erasure.

Verified against a known-bad implementation (an absolute freeze on
`thread_id` / `produced_in_turn_index`): `DELETE FROM ask_threads` is **REFUSED**
with `producer turn is immutable`. T10 goes red. The shipped rule is **monotonic
severance** — `value -> NULL` allowed, `NULL -> value` and reassignment refused.

Result of record, 2026-09-10: **14 passed, 0 failed** (PostgreSQL 16.13).
