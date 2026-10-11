# SOURCE-CUSTODY-EDGE — manuscript artifact-ingest hold: installed and verified
**Date:** Sunday, 11 October 2026 (EDT)
**Disposition:** **CADDY-ONLY INSTALL COMPLETED / VERIFIED**. Full Writer's Studio release and source-write reopening remain **NO-GO**.

## Exact authorization and boundary
Founder explicitly authorized installing the previously proposed Caddy-only safety hold for file-backed manuscript imports into Writer's Studio. This authorizes an ingress configuration change, **not** a database migration, source-writing release, app image cutover, source artifact deletion, beta invitation, or a wider branch merge.

The new rule adds two path tokens:
- `/api/sovereign/manuscripts/ingest`
- `/api/sovereign/manuscripts/ingest/*`

to the already deployed `@source_write_pre_migration_hold` matcher for POST, PUT and PATCH. Existing Writer's Studio Materials sources and founder Book Studio Workbench restrictions were retained. The change intentionally temporarily blocks new DOCX/PDF/TXT/MD file-backed manuscript imports through this ingress. Ordinary reads, existing manuscripts and standard editing are outside this new Caddy matcher. No editor or file-save functionality is implied or certified by this edge-only change.

## Exact production state, source, and applied bytes
- Production host: Minisforum via Eero LAN `192.168.4.38`; authenticated SSH used previously pinned `192.168.0.104` host-key alias with strict checking.
- Live application: `maia-sovereign` image stamp `c9e4f7f7e`, running and healthy before and after.
- Caddy: running **v2.11.2**; `maia-caddy` running image ID matched the cached `caddy:2-alpine` used for validation.
- Exact live host file: `/home/soullab/MAIA-SOVEREIGN/Caddyfile`, individually read-only bind-mounted into Caddy at `/etc/caddy/Caddyfile`. The bind-mounted file inode **30802557** was preserved. Its host ownership `uid=1000 gid=1000`, mode `0664`, were preserved.
- Original SHA-256: `0510d54568a8af5a539df9cdbcbebe5e8cc5831b6ac3f3b08bdb9028ae49d10f`.
- Installed SHA-256: `adcc4c6f8c368927c1019396e5824d73b48bf935b8e5635ad3770a30ee3a681d`.
- **Exact insertion-only delta:** +70 bytes. Removing the two new matcher path tokens reproduces the exact original bytes. No unrelated host Caddyfile modifications.
- Private custody dir: `/home/soullab/.source-custody-caddy-ingest-20261011/` (0700) with `Caddyfile.original` (0600), `Caddyfile.staged-ingest-hold` (0600), staged validation log and reload log.
- Source config and deployed config hashes were rechecked immediately before mutation; Caddy mount source, running image identity, app stamp and health were rechecked.
- The staged file was validated with a throwaway, network-isolated container using the exact running Caddy image; result **Valid configuration**. Existing non-fatal Caddyfile formatting and reverse-proxy warnings were recorded.
- Installation overwrote the **contents in place**, retained original bind-mount inode and file metadata, then fsynced; no rename over the live individually bind-mounted file.
- Caddy received a graceful `caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`; exit success. No app container/database restart.

## Live positive/negative checks
Before reload, unauthenticated POST to manuscript ingest reached the old app: 401 on `soullab.life`, `maia.soullab.life`, and `kelly.soullab.life`; API host returned 404. Existing two source families already returned 423.

After reload:
- Additional **12/12 wildcard/item-path PATCH checks PASS** across the same four production hostnames, using synthetic nonexistent identifiers.
- **36/36 HTTP 423 checks PASS:** three write verbs × three endpoint families × four origins (`soullab.life`, `maia.soullab.life`, `api.soullab.life`, `kelly.soullab.life`), executed against the actual production HTTPS Caddy listener with exact Host/SNI. No real member credentials, source files, manuscript IDs or user content were sent.
- GET `/` returned 200 for `soullab.life` and `maia.soullab.life`; GET `/signin` returned 200; unauthenticated GET `/writers-studio` returned its normal 307 sign-in redirect.
- Independent Mac Studio requests using the configured `https://soullab.life` origin corroborated home 200, sign-in 200, Writer's Studio redirect 307, and POST 423 at both new manuscript ingest and existing Materials source endpoints.
- Host-side and container-side SHA-256 both matched the exact installed hash. Running app remains healthy at `c9e4f7f7e`. The Overview migration `20261002000002_writer_studio_chapter_overview_lens.sql` remains **unapplied**.

## Rollback and safety limits
- An automatic Caddy-only rollback handler was provided for failures during installation/reload/HTTP safety checks; **not triggered** because all observed checks succeeded.
- Future rollback must be separately approved or justified by an acute incident. Recheck running app/Caddy and exact installed hash, then restore the exact preserved backup **in-place (not via rename)** with fsync, reload Caddy, compare the original hash on host and container and verify HTTP/health. Do not remove the broader source-write fence as part of a narrow manuscript-ingest rollback.
- This rule is a **public Caddy ingress fence**. It does not certify direct Docker-network peers or non-Caddy ingress; `maia-sovereign` reports port `3000/tcp` without a published host port. That observation is not an exhaustive internal bypass proof.
- Existing manuscripts, ordinary editing and member-controlled text entry are outside the new Caddy matcher, but authenticated functional browser acceptance was not completed in this edge-only operation.
- The Mac's release branch was **not deployed** and still needs an exact image rebuild, formal migration compatibility/custody admission, source/artifact durable recovery protocol, non-founder end-to-end browser acceptance, Safari saved-file proof, and a separately approved production cutover.
- The UI must not promise that new file-backed imports are available during this hold.

**Conclusion:** Exact Caddy-only manuscript-ingest safety extension is live and verified. Existing production application and database schema have not changed. Source-write, migration and Studio beta release gates remain closed.
