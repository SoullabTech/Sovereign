# Source custody — Caddy-only edge approval preflight

**Date:** 2026-10-10. **Decision:** not yet authorized. **Production status:** unchanged. This document records read-only production observations and offline validation. It is NOT a deployment receipt.

## Exact observed live state

- Running MAIA image reported `c9e4f7f7e`, the previously identified old source writer.
- Production `maia-caddy` was running Caddy **v2.11.2**. Its active configuration was readable through Caddy's local admin API and did **not** contain the source-write refusal.
- Production Caddyfile: `/home/soullab/MAIA-SOVEREIGN/Caddyfile`. SHA-256: `cb006b713e1b47483926deeeedbb69e61108507acb82bdd7a5fbcb5c6f756b2d`. The file is **modified relative to production host Git**, so replacing it with a repository copy would be unsafe.
- Caddy publishes ports 80/443. MAIA and MAIA API application containers do not have published host ports (their 3000/3001 ports are internal). This does not exclude Docker-network ingress or other bypass paths.
- The shared `deny_disabled_routes` snippet is imported in 19 site blocks in the current production Caddyfile; the five primary hosts required by this preflight import it.
- Read-only aggregation from the *current, unrotated* Caddy access logs found no POST/PATCH requests to the two named source API families. This is limited evidence; it is NOT a full audit of historical usage or proof of no live clients.

## Candidate details and local matched-version validation

- Engineering branch `fix/materials-beta-server-gate-20261008`, HEAD at preflight `c411aa497e`, clean.
- Candidate rule unconditionally returns HTTP **423** for POST, PUT and PATCH on both `/api/writers-studio/sources` and `/api/book-studio/workbench/uploads`, including item paths. GET and DELETE are outside the new matcher.
- The previously recorded isolated Caddy HTTP matrix passed **11/11** checks: 6 blocked writes, 5 unaffected stub fallbacks. No production request with a write verb was made.
- On October 10, downloaded the **Caddy 2.11.2 Alpine** test image to the Mac Studio, matching the installed production Caddy version, and validated the candidate overlay against a **fresh read-only copy** of the *actual* production Caddyfile.
- Applying the reviewed insert to that copy, then removing the insert, yielded byte-identical original content. Insertion-only check passed. The full overlaid Caddyfile returned **Valid configuration** under Caddy v2.11.2.
- Input file SHA-256: `cb006b713e1b47483926deeeedbb69e61108507acb82bdd7a5fbcb5c6f756b2d`.
- Exact proposed overlay SHA-256: `0510d54568a8af5a539df9cdbcbebe5e8cc5831b6ac3f3b08bdb9028ae49d10f`.
- All temporary local snapshots were removed after validation. The production file, running Caddy config and running MAIA image were not modified.

## Approval requested — only this act

Authorize a separately governed **Caddy-only** safety-fence installation. This temporarily disables new source uploads and reviewed-source PATCH edits from BOTH Writer's Studio and the founder-only Book Studio Workbench. The Book Studio PATCH that changes the `sanctuary` metadata flag would also be unavailable. Existing source GET/DELETE is not deliberately blocked by the new rule.

An approval for this edge action **does not** approve migrations, application rebuild/push/merge, source-write reopening, production schema changes, removal of the fence, or changes to unrelated endpoints.

## Non-negotiable pre-install stop rules

1. Before any write/reload, confirm user explicitly authorized this exact Caddy-only scope.
2. Re-observe live application commit, Caddy version, active configuration, ingress, and mounted Caddyfile hash. Stop if any witnessed identity differs, particularly `cb006b...`.
3. Securely snapshot the live file, preserve its existing uncommitted edits, and maintain a rollback plan for the **single inserted rule only**.
4. Validate exact insertion-only bytes with production-matching Caddy 2.11.2 and make the live administration config match the reviewed overlay.
5. Verify actual blocked routes on relevant public origins without writing actual member sources; check safe GET behavior and authenticated DELETE availability **without deleting a real member source**.
6. Treat any uncovered internal ingress, health regression, live config mismatch, or other unexpected behavior as a STOP, not an excuse to advance to schema migration.

**Decision now:** WAIT FOR EXPLICIT EDGE-ONLY AUTHORIZATION. No deployment was attempted.
