# Sunday beta — R85 plus exact bounded Studio file privacy correction (HOLD)

**Prepared:** 2026-10-17, evening EDT.
**Source parent:** `ab4a90b75fb6d8496c90a90b47ffb34225e9a536`, accepted Writer's Studio R85.
**Isolated integration branch:** `feature/ws-beta-sunday-r85-file-privacy-20261017`.
**Production release / five-person real-manuscript beta:** HOLD.

## Exactly what was integrated

An exact two-file patch was frozen from the parallel R91 worktree without merging its other uncommitted changes:

- `app/api/studio/files/route.ts`: a DELETE with permanent=true now **refuses** before deleting a SQL row because the original vault bytes, historical backups, and independent erasure receipts are not qualified for irreversible deletion. A normal soft-delete response explicitly states that the original bytes have NOT been destroyed.
- `app/api/studio/files/[fileId]/route.ts`: PATCH now refuses malformed JSON, unsupported scope transitions, raw client-supplied Co-Lab IDs without verified membership, and changes to soft-deleted rows. A personal-scope change clears stale Co-Lab/client/encounter identifiers; permitted Co-Lab membership is verified by the canonical `canActInTeam` server function.

The route patch is frozen locally under:
`/Volumes/T7 Shield/ws-beta-sunday-launch-gate-20261017/R91_TWO_ROUTE_FROZEN_REVIEW.patch`
SHA-256: `2bb5878ba9e74391fb7433b562b5c658e1ce6d53a9ba84d9405fccd67bbb9d82`.

The copied exact R91 privacy test has SHA-256:
`2c789c8fc541d26479b97ac59ac1b10bfd6aa3c5ab207c7cf28cad59db6734c2`.

No blanket R91 branch merge was attempted. The parallel worktree is not treated as an accepted whole-source authority.

## Verified acceptance on this isolated branch

- Targeted genuine Studio file route unit tests: **14/14 passed**.
- Writer release/security-related regressions across seven suites: **84/84 passed**.
- Strict `tsc -p tsconfig.ship.json --noEmit`: **exit 0**, no type suppressions, no new errors.
- The original R85 strict Next.js production build and accepted WebKit/Writer fixture evidence remain source-parent evidence; they do NOT certify a new integration build until a fresh exact-commit build is run.
- Current fixes do not install an erasure worker or claim SQL/vault/backup irrecoverability. No private member content, credentials or model provider calls were used.

## Production read-only gate investigation

The pinned Minisforum host was reached over previously trusted SSH with no password prompt and **read-only** commands.

- Root `/etc/cron.d/maia-backup` has a backup job at `0 2 * * *`; the non-root user crontab has backup-related entries at `0 2 * * *` and `30 3 * * *`. These describe cron schedules on the Linux host, not proof of successful encrypted backups.
- Installed backup writer SHA-256 still equals the accepted **legacy gzip SQL** writer. Gzip is compression, not encryption.
- NAS backup directory still has **26 `.sql.gz` files**; exact historical erasure/replication and NAS ACLs remain unverified.
- The deployed application and Caddy containers run. The mounted Caddyfile includes `remote_ip` and private-network references, but live external ingress has NOT been independently confirmed. Unauthenticated Mac-LAN HTTP observed 200 on `/api/admin/auth`, 401 on `/api/sovereign/manuscripts` and 307 on `/writers-studio`; LAN access cannot prove WAN admission.
- Server root disk has about 63 GiB available. `restic` and `age` were not found in the examined host PATH. No installation or key provisioning was done.

## Sunday morning GO / HOLD

**Release GO only if** an exact candidate passes a strict real Next.js build, whole-source privacy/inference review, authenticated Mac/iPhone real-app journey, current member consent/notice, independent admin ingress validation, encrypted complete SQL+vault backup with separately recoverable key, deletion antirollback and independently verified restore, signed artifact/rollback, and the founder's separate GO.

**If recovery or privacy is not proven:** no invitation accepting real personal manuscripts. Offer only an actually enforced fictional-only guided demonstration (not merely a verbal promise to avoid real content).

No NAS files, production crontab, Caddy, keys, active services, member accounts, or beta invitations were changed in this integration. Advanced sovereign per-Work KMS remains a future improvement, not a substitute for adequate conventional beta protection.
