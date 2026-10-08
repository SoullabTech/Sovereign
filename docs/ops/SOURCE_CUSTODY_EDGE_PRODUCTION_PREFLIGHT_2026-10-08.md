# Source-custody emergency edge fence — production read-only preflight

**Date:** 2026-10-08 (local engineering lane). **Disposition:** AWAITING EXPLICIT EDGE-ONLY AUTHORIZATION. Nothing on production was installed, edited, reloaded, migrated, merged, or deployed during this investigation.

## Live production read-only observations

- Accessed the production Minisforum via its previously documented `soullab@minisforum` SSH alias using noninteractive read-only commands.
- Running MAIA application container reported commit **`c9e4f7f7e`**, which contains unguarded source-original and reviewed-text write routes.
- Running Caddy container `maia-caddy` was live, with its source mounted from `/home/soullab/MAIA-SOVEREIGN/Caddyfile`. Its mounted Caddyfile SHA-256 was **`cb006b713e1b47483926deeeedbb69e61108507acb82bdd7a5fbcb5c6f756b2d`**.
- The remote Git checkout was at **`56d0cd679`**, distinct from the running MAIA image. Production Caddyfile was **locally modified** relative to that Git HEAD (**43 added lines**); no action may replace it wholesale with the engineering branch's file.
- The Caddyfile mtime was 2026-10-01 20:43 local server display, before the Caddy container's 2026-10-02 start. The Caddy admin read endpoint was accessible and reported **three configured HTTP servers**. The loaded configuration did **not** contain the proposed "Source writing temporarily unavailable" response or a source-write path matcher.
- Caddy published host ports **80/443**. The MAIA and MAIA API containers exposed internal ports 3000/3001 but did **not** publish host ports. Host cloudflared service reported inactive. This is **not** a complete assertion that no internal or alternate ingress exists; check actual listeners and upstream networks before activation.
- Unauthenticated, **read-only GET** requests to the public source-listing path returned 401 on `soullab.life` and `maia.soullab.life`, 301 on `www.soullab.life`, and 404 on the separate `api.soullab.life` API origin. **No production POST, PATCH, PUT or DELETE was issued.**

## Scope correction found in old application

Source-writer inventory was inspected at the exact old-reader Git commit. Two distinct API families can persist source bytes:

1. Writer's Studio — `POST /api/writers-studio/sources` and `PATCH /api/writers-studio/sources/{id}`.
2. **Founder-only Book Studio Workbench** — `POST /api/book-studio/workbench/uploads` and `PATCH /api/book-studio/workbench/uploads/{id}`.

Both families use the Workbench filesystem; Book Studio's PATCH may update a source's `sanctuary` flag in addition to reviewed text. A blanket PATCH fence therefore also pauses that flag-editing gesture. Other Book Studio routes, such as draft composition, are **not** covered and are not asserted safe under a broader conversational-privacy promise.

The proposed Caddy matcher now covers **both families**, collections and item paths, with **POST, PUT, PATCH** returning HTTP **423**. GET and DELETE are intentionally unaffected by the additional matcher. Any separate internal ingress bypassing Caddy remains an independent blocker.

## Local insertion-only dry run — not a production change

- Read the live Caddyfile into a temporary file on the **Mac Studio**, not on production.
- Extracted the precise `SOURCE-CUSTODY-EDGE-01` rule from the isolated branch and inserted it at the beginning of `(deny_disabled_routes)` in the local snapshot. Verified that removing that inserted block yields exactly the input; no existing live lines were changed.
- All **five** primary expected hosts had the shared deny snippet imported.
- The resulting Caddyfile validated in a disposable `caddy:2-alpine` container: **Valid configuration**.
- Input SHA-256: `cb006b713e1b47483926deeeedbb69e61108507acb82bdd7a5fbcb5c6f756b2d`
- Proposed insertion-only overlay SHA-256: **`0510d54568a8af5a539df9cdbcbebe5e8cc5831b6ac3f3b08bdb9028ae49d10f`**
- A separate disposable Caddy server with the exact matcher returned **423 for 6/6 write requests** (three methods across two API families) and **200 from its stub fallback for 5/5 unaffected routes** (GET/DELETE for each family and unrelated POST).
- All temporary snapshots and Caddy test containers were removed. **These tests do not prove live production is fenced.**

## Exactly what must be authorized

A **Caddy-only safety action**, independently of the larger MAIA release:

- Temporarily make **new source uploads and reviewed-source updates unavailable**, including Book Studio Workbench, by fencing the two API families at the edge.
- Keep existing source GET and DELETE access unchanged by this Caddy rule.
- No application image update; no database migration; no opening the new intake path; no merge or branch deploy; no switching production container images.
- Preserve the entire existing production Caddyfile outside the inserted rule and arrange an independently verified rollback of only that rule if an operational fault occurs.
- Explicitly accept that Book Studio's `sanctuary` metadata-only PATCH also becomes unavailable during the temporary write hold.

## If authorization is granted — governed execution checklist (NOT executed)

1. Re-read the exact live running Caddy config and mounted file. Stop if the host, old reader, source SHA-256 or ingress paths differ from the witnessed preflight. Recheck competing Caddy controls and identify all production ingress routes.
2. Enter the authorized Caddy release lock/custody process. Make a secure versioned backup of the actual live file; keep both its checksum and rollback provenance. Prepare the **insertion-only** 2-family rule as a distinct candidate without touching application or schema.
3. Validate the complete candidate Caddyfile against the actual Caddy version, and verify the candidate differs from the now-current live file only by the reviewed insert. Stop on any mismatch or validation failure.
4. Use the separately authorized production Caddy reload process. Confirm Caddy remains healthy and that its **active administration config** contains the required matchers and HTTP 423 response. Do not claim success from an on-disk grep alone.
5. Perform carefully scoped **authorized** post-change requests across all relevant public origins: expected POST/PATCH/PUT blocks, existing permitted reads, route-policy preservation for DELETE, and unrelated behavior (do not delete any real source merely to test the fence). Ensure internal/back-channel direct application routes are not bypassing the fence.
6. Record before/after hashes, exact timestamps, result codes, business impact, and rollback procedure. Retain the edge hold through the three-migration compatibility review and old/new writer overlap, and remove it only on separate evidence/authorization.

**NO-GO for migrations or source-write cutover:** The Caddy-only action, even if later authorized, is just an interim old-writer safety boundary. Crash-owner recovery and migration-prefix compatibility remain separate unadmitted release gates.
