# Schema duplicate smells

Near-identical tables that appear to serve one purpose. Recorded on sight;
none authorized for consolidation. Each needs its own read of which table the
live writers use before anything is touched.

Deliberately **not** folded into whatever unit surfaced them — a duplicate-table
question is a data-model defect and travels on its own.

| Tables | Surfaced | Evidence | Status |
|---|---|---|---|
| `relationship_essence` / `relationship_essences` | 2026-08-27, during the AUTH-BIOMETRIC-01 member census | One member carried exactly one row in **each**. Singular/plural pair, same member id, same shape. | RECORDED — not investigated |

Prior art, same class, already on the cleanup list in `CLAUDE.md`: duplicate
`SemanticMemoryService` (`consciousness/` vs `memory/`) — pick one, delete the
other.

## Before consolidating any pair

1. Which table do live writers use? (`grep` the route layer, not the services.)
2. Do both hold rows, or is one an abandoned first attempt?
3. Do the row counts agree per member? Divergence means both were written to,
   and a merge is then a data decision, not a cleanup.
4. Is either read by a view? A dropped table takes its views with it.
