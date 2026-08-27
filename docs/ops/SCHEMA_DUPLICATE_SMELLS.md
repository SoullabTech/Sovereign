# Schema duplicate smells

Near-identical tables that appear to serve one purpose. Recorded on sight;
none authorized for consolidation. Each needs its own read of which table the
live writers use before anything is touched.

Deliberately **not** folded into whatever unit surfaced them — a duplicate-table
question is a data-model defect and travels on its own.

| Tables | Surfaced | Evidence | Status |
|---|---|---|---|
| `relationship_essence` / `relationship_essences` | 2026-08-27, during the AUTH-BIOMETRIC-01 member census | **Two** unrelated members each carry exactly one row in **each** table (a beta tester and the `isolation_test_exp` fixture). Singular/plural pair, same shape. | RECORDED — not investigated |

Prior art, same class, already on the cleanup list in `CLAUDE.md`: duplicate
`SemanticMemoryService` (`consciousness/` vs `memory/`) — pick one, delete the
other.

## What the second observation settles

The first sighting was one member with a row in each table, which is equally
consistent with "one table is an abandoned first attempt that still holds old
rows." The second member — written months apart, on a different code path —
rules that out. **Both tables are live write targets.**

That changes the class of work. Consolidating them is not a cleanup; it is a
data merge, and it needs the divergence answered first: where the two rows for
one member disagree, which is correct? A cleanup can be done by whoever notices.
A merge needs someone to decide what is true.

## Before consolidating any pair

1. Which table do live writers use? (`grep` the route layer, not the services.)
2. Do both hold rows, or is one an abandoned first attempt?
3. Do the row counts agree per member? Divergence means both were written to,
   and a merge is then a data decision, not a cleanup.
4. Is either read by a view? A dropped table takes its views with it.
