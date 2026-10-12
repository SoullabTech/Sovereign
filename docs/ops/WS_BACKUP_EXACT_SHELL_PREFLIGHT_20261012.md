# WS-BACKUP-OPS-02 — Exact-shell isolated OCI preflight

**12 October 2026 · Class A engineering self-test · NOT APPROVED FOR PRODUCTION**

The independently required human review of PR #1797 has **not** been submitted. This engineering self-test ran only the preflight part of a held shell candidate against synthetic dependencies. No live backup, real manuscript or source-vault capture, NAS/archive manipulation, migration, or installation was authorized or performed.

## Exact identities and source-read custody

- Live installed root NAS writer: /usr/local/bin/maia-backup, SHA-256 **5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f** — not executed.
- HELD candidate: /home/soullab/maia-backup-hardened-20261011.sh, SHA-256 **a43e6d0fd8ada224764f18bf661417d3a5836c6d9abeff6a81062ee04d2e002f** — executed **only with --preflight against mocks**.
- Installer: /home/soullab/install-maia-backup-hardened-20261011.sh, SHA-256 **81da5d86c170fddd447c3d62ea13ebeba9c5534a6f4e7d39c4c123a27bb3d0f4** — explicit **STOP R20**, must not be bypassed, not executed.

All original shell source remained unchanged. The held candidate is not deletion-compatible: it backs up full reconstructive SQL without per-Work cryptographic erasure and omits the manuscript Source vault. The approved WS-DELETE-01/#1791 law forbids treating it as a replacement merely because its gzip and media checks are better.

## Exact-script isolated preflight harness

The only executable artifact in this PR is **scripts/ops/ws-backup-exact-shell-preflight-oci.sh**. Its behavior:

1. Requires non-root invocation, exact hashes of all three scripts, and STOP R20 present. Refuses extra arguments and Docker image downloads.
2. Copies only the held shell code into a brand-new private temporary test directory; confirms its SHA-256.
3. Launches a **locally cached node:22-slim container** with no network, read-only root, all capabilities dropped, no-new-privileges, nonroot UID, and CPU/memory/PID limits. Only a newly made synthetic scratch directory is mounted read-only; there is **NO bind mount of /mnt/ds225, /var/run/docker.sock, the live Source vault, database paths, NAS credentials or member data**.
4. The container has fake tmpfs backup directory and mock Docker/PostgreSQL readiness, mocked NAS source and free space. Any non-preflight Docker operation or rsync is refused.
5. Invokes the **actual unmodified held candidate shell with --preflight only**. It never calls the live backup writer or either script with --run.
6. Removes all disposable fixtures and containers.

A first exploratory container launch failed rc 127 because a test bind-mount shadowed the image's default entrypoint. The harness was corrected to use an explicit /bin/bash entrypoint. This was a sandbox construction problem: **no candidate script ran in that failed invocation**.

## Observed fixture output

| Synthetic preflight scenario | Required outcome | Result |
|---|---|---|
| Expected mock CIFS source, free space, fake PostgreSQL readiness | Preflight accepts | **PASS** |
| PostgreSQL readiness fails | Refuse | **PASS**, rc 1 |
| NAS source mismatches trusted expected CIFS source | Refuse | **PASS**, rc 1 |
| Free space below candidate threshold | Refuse | **PASS**, rc 1 |
| Required backup directory absent | Refuse | **PASS**, rc 1 |

**Receipt:** EXACT HELD SHELL PREFLIGHT IN ISOLATED OCI: **5/5 PASS**.

**Meaning:** This is a real execution of the held candidate's preflight branches against disposable shims. It is **not** a true SQL dump, source-vault archive, encrypted backup, real database/NAS authentication, disaster restore, independent human review, or evidence of historical deletion-safety.

## Next gate, in order

1. A separate human reviewer must genuinely read the exact three pinned scripts, the full PR #1797 transition plan and fixtures, and independently author a Class A compatibility, rollback and erasure verdict. A bot check or requested reviewer is **not** approval.
2. That independent reviewer inspects the current isolated preflight harness and states whether its sandbox boundary is adequate.
3. Only after the independent review, a **full actual-shell fixture** can be run with a large synthetic PostgreSQL dump, a fake isolated media tree and a disposable backup sink. Inject failure before/during gzip stream, checksum, restore verification, weekly/monthly copy, media sync and manifest. The held candidate's hardcoded 100-million-byte compressed minimum must be honored by actual shell test rather than silently reduced.
4. The real SQL+Source cryptographic-erasure design, legacy SQL and NAS Recycle Bin retention, key custody and independent real-vault restoration still require separate governance before production activity.
5. Do not install the held candidate, alter root/user 2 AM cron, change NAS ACLs/snapshots/recycle contents, delete archived SQL or member bytes, modify Writer's Studio beta image or deploy public Soullab under this report.

**Disposition:** 5/5 preparatory exact-shell preflight PASS. **Independent human PR #1797 review PENDING. Full shell --run fixture NOT YET EXECUTED. Production remains unchanged.**
