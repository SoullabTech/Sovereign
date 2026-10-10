# Source custody — authorized Caddy-only production safety fence, live receipt

**Date:** 2026-10-10 (EDT)
**Disposition:** INSTALLED, LIVE AND VERIFIED AT THE CADDY EDGE. Only the Caddy safety boundary was authorized and changed. No app build, database migration, source-write reopening, beta enrollment, or Writer's Studio production cutover was authorized or performed.

## Authorization and exact bound scope

The founder explicitly approved proceeding with the Caddy-only source-write safety installation after receiving the narrow scope: temporarily deny POST/PUT/PATCH on both Writer's Studio and founder Book Studio Workbench source-writing API families. The approval does not extend to other production actions.

The reviewed design and matching-version preflight are in:
- docs/ops/SOURCE_CUSTODY_CADDY_EDGE_PREFLIGHT_2026-10-10.md
- docs/ops/SOURCE_CUSTODY_EDGE_WRITE_FENCE_2026-10-08.md
- engineering branch fix/materials-beta-server-gate-20261008

Exact live identities re-witnessed immediately before installation:
- Live application reader: c9e4f7f7e
- Running Caddy: v2.11.2
- Live host Caddyfile: /home/soullab/MAIA-SOVEREIGN/Caddyfile, a file individually bind-mounted read-only into maia-caddy as /etc/caddy/Caddyfile.
- Original SHA-256: cb006b713e1b47483926deeeedbb69e61108507acb82bdd7a5fbcb5c6f756b2d.
- Original file was modified in host Git before this operation. **Existing unrelated edits were retained byte-for-byte**.

The insert was reconstructed from the approved candidate rule, and the result matched the previously reviewed overlay SHA-256 exactly:
- Installed SHA-256: 0510d54568a8af5a539df9cdbcbebe5e8cc5831b6ac3f3b08bdb9028ae49d10f.
- Insertion-only check: removing the 1,419-byte approved insertion reconstructs the exact original SHA-256.
- A Caddy 2.11.2 Alpine validation of that exact overlay returned **Valid configuration**. Existing non-fatal proxy/header formatting warnings were observed.

## Installation and rollback custody

- A secure backup of the original live Caddyfile was taken **before** the change at:
  /home/soullab/.source-custody-caddy-20261010/Caddyfile.original
- The approved exact overlay was staged at:
  /home/soullab/.source-custody-caddy-20261010/Caddyfile.overlay
- Custody directory mode 0700; staged/backup files mode 0600.
- Because the live host Caddyfile is an individual **file bind mount**, the contents were rewritten **in place**, preserving the host inode and file mode/ownership. An atomic rename over the host path would leave the container reading the old bind-mounted inode.
- Container-visible and host-side installed Caddyfile hashes are both 0510d54568a8af5a539df9cdbcbebe5e8cc5831b6ac3f3b08bdb9028ae49d10f.
- A graceful **Caddy reload** succeeded. The live Caddy admin configuration includes the source-write refusal. Neither MAIA nor the database was restarted.
- The install procedure provided an error trap that would restore the original bytes in place and reload Caddy if installation or runtime checks failed; it was **not triggered**.
- **Rollback procedure, only if independently authorized or required for an acute production incident:** re-witness running reader/Caddy, compare installed hash with the exact approved overlay, restore exact verified backup bytes into the existing live file **in place (not by rename)**, flush/fsync, reload Caddy, verify restored original hash and running configuration, and test service health. Preserve a copy of both installed and restored files for incident analysis. Do not casually remove the fence to reopen source writes.

## Live HTTPS HTTP matrix — observed after reload

All probes were run against actual production Caddy bound to localhost using the public Host/SNI values. No real member credentials, files, or source-record identifiers were used.

- 4 origins: soullab.life, maia.soullab.life, api.soullab.life, kelly.soullab.life.
- For **each** origin, these six requests returned **HTTP 423**:
  1. POST /api/writers-studio/sources
  2. PUT /api/writers-studio/sources
  3. PATCH /api/writers-studio/sources/00000000-0000-4000-8000-000000000000
  4. POST /api/book-studio/workbench/uploads
  5. PUT /api/book-studio/workbench/uploads
  6. PATCH /api/book-studio/workbench/uploads/00000000-0000-4000-8000-000000000000
- **24/24 denial checks passed**. Item-path paths were also covered by the importable path matcher.
- The GET routes retained pre-install refusal/routing behavior: status 401 on soullab.life, maia.soullab.life and kelly.soullab.life; 404 on api.soullab.life for both GET endpoints. Authenticated member GET and DELETE were not exercised; no real source DELETE was attempted.
- www.soullab.life POST requests redirected once to soullab.life, then **both finished at 423**.
- Plain HTTP port 80 retained 308 HTTPS redirect behavior for the tested source endpoint on three origins.
- GET / returned 200 on soullab.life and maia.soullab.life, and 404 on api.soullab.life.
- Running maia-caddy state was **running**. maia-sovereign health was **healthy**, still serving image stamp c9e4f7f7e. Production Caddyfile and backup hashes were re-witnessed after the reload.

## Evidence limits / outstanding stop conditions

- The fence covers the public Caddy routing paths tested and all sites importing the shared snippet. Internal/direct Docker-network bypasses are **not certified** by a Caddy-only rule. Application server endpoints are not published to host 3000/3001 according to the Docker port census, but this does not prove no internal peer access.
- Several secondary public hostnames timed out from the Mac **before the installation**; those were tested at production Caddy via localhost Host/SNI routing instead. Do not infer independently reachable public DNS/Internet behavior for every hostname from loopback tests.
- This fence intentionally disables **new uploads and reviewed-source PATCH**, including founder Book Studio's PATCH used to change Sanctuary metadata. GET and DELETE are outside the new matcher.
- Production database schema changes remain unapproved. The four pending Studio migrations must pass exact old-reader and per-prefix compatibility review/custody, crash recovery, rollback and a separate approval.
- Never report source saving as ready, remove the edge fence, or deploy the beta Studio based solely on this edge receipt.

**Result: Caddy-only safety fence successfully installed and positively verified; migration, source-write and Studio beta release gates remain closed.**
