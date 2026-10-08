# Source custody — proposed edge-only emergency fence

**Candidate only. Never activated in this review.** This edge configuration is intended for an independently authorized, Caddy-only change while the reported old production application `c9e4f7f7e` still serves traffic. It is not a migration or app deployment authorization.

## Threat and route coverage

The old Writer's Studio `POST /api/writers-studio/sources` writes originals without a server-authoritative Sanctuary gate. The old `PATCH /api/writers-studio/sources/{id}` writes `reviewed.txt` **before** its database update. A separate founder-only Book Studio Workbench API family (`/api/book-studio/workbench/uploads` and `/{id}`) also persists originals/reviewed text. A DB trigger installed later cannot prevent those earlier filesystem effects. The shared `(deny_disabled_routes)` Caddy snippet is already imported by the main public Soullab and MAIA hosts, including the direct API host. The staged `@source_write_pre_migration_hold` denies POST, PUT and PATCH for collection and item paths in **both source-writing API families** with HTTP **423**. This also pauses the Book Studio PATCH used to set the `sanctuary` metadata flag. GET and DELETE remain usable. The fence is unconditional until separately reviewed and retired.

## Local evidence, not production evidence

- Full canonical `Caddyfile` validated using the cached `caddy:2-alpine` Docker image on the Mac Studio, in an isolated container with temporary writable log and data directories. Existing unrelated Caddy warnings were present, but configuration validation finished with `Valid configuration`.
- A second disposable container with the exact matcher extracted from this repository's `Caddyfile` returned HTTP **423** for six write requests across Writer's Studio and Book Studio Workbench. The stub fallback returned **200** for five GET/DELETE/unrelated request cases. The container was stopped and the test fixture deleted. Static coverage tests pass for the shared snippet and its primary importing hosts.
- No live public domain, production Caddy container, deployed image or internal ingress was modified, observed or certified by those tests.

## Governed release sequence

1. Resolve the **actual** live Caddy config, hashes and all ingress routes, including non-Caddy alternatives and internal direct access; compare to this candidate rather than assuming repository bytes are active.
2. Obtain separate authorization for a **Caddy-only** safety fence, not an application change, then validate its config against the exact production release environment without touching a running reader.
3. Activate the fence as its own governed cutover. Probe affected methods on each relevant public origin and demonstrate the previously vulnerable old route is blocked while required reads/deletes remain available.
4. Re-witness the exact old reader and admit the three-migration compatibility/custody evidence, including the deliberate temporary unavailability of source writes. Only then may any governed schema action be proposed.
5. Keep the Caddy fence in force across old/new writer overlap and application cutover. Remove only after the new POST and separately reviewed PATCH have passed their own crash and concurrency evidence in a permitted release, plus an explicit independent authorization.

**CURRENT STATUS: FENCE NOT DEPLOYED; SOURCE-WRITE RELEASE HOLD.** The current local source POST/PATCH return HTTP 423 inside the application. This staged Caddy config supplies a separate proposed barrier for the old application, not proof the current production origin is protected.

## Production preflight (read-only)

See `docs/ops/SOURCE_CUSTODY_EDGE_PRODUCTION_PREFLIGHT_2026-10-08.md` for actual live Caddy and old-reader findings, input/config hashes, insertion-only dry-run, 11/11 isolated HTTP matcher cases, and the exact separate authorization boundary. **No production deployment or reload took place.**
