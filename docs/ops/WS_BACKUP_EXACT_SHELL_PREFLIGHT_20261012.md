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


## E. Exact-hash phase-order defect and future full-shell fixture

The **additional repeatable, read-only source witness**
\`scripts/ops/verify-ws-held-backup-source-order.mjs\` was fetched back from
GitHub blob \`1cad140edfd26f44d10dee5df5331875548ec1a8\` and executed as a
read-only Node process on the Minisforum. It did not execute any shell backup
script. It verified SHA-256 on **all three** installed/held/installer sources
and produced this exact-order map of the held candidate:

| Phase | Source line | Consequence |
|---|---:|---|
| Gzip temp file reserved | 81 | Artifact still incomplete / temporary |
| Real PostgreSQL export via Docker / gzip | 83 | Fixture will need synthetic stream of realistic size |
| Gzip integrity verification | 86 | Necessary, not sufficient for full restore |
| **Final SQL archive publication** | **94** | A discoverable archive now exists |
| **Media synchronization** | **103** | Can fail AFTER SQL archive is published |
| Retention copies | 107 onward | Can fail or leave partial recovery set |
| Manifest temp path reserved | 125 | Manifest not yet published |
| **Final manifest publication** | **142** | Full program's completion point, much later |

The script's \`EXIT\` cleanup loop (line **33**) lists only
\`TEMP_PG\`, \`TEMP_MANIFEST\` and \`TEMP_COPY\`. It **does not**
roll back \`PG_FINAL\` when a later media or manifest stage fails. The
read-only source verifier returned:
- \`SOURCE_READ_ONLY_HASH_CHECK: 3/3 PASS\`
- \`CONFIRMED_RISK: SQL archive publicly published before media and final manifest\`
- \`CONFIRMED_RISK: failed media/manifest phase may leave finalized unpaired SQL archive\`
- \`R20_INSTALLER_HOLD: PRESENT\`
- \`CLASS_A_VERDICT: NOT GRANTED\`

**Class A interpretation:** Such an archive may have correct gzip bytes but
lack the media and final manifest for a complete restore. A future backup
reader must distinguish **discovered bytes** from an **accepted complete
recovery point** and quarantine orphaned generations rather than trusting
their filename or SQL footer. **No actual shell \`--run\` witness has
confirmed the effect of an injected media failure yet.** This remains
source-order evidence requiring independent source review.

### Full-shell synthetic run: design only, NOT executed

After a *separate human* Class A source-read verdict accepts the sandbox,
an isolated rehearsal should run only the held shell's exact
\`--run\` bytes against an **entirely disposable** fake Postgres dump, a
fake media filesystem and a non-networked fake CIFS destination.

The candidate currently checks that the **compressed** PG archive is at
least 100,000,000 bytes, checks gzip integrity and a trailing pg_dump
completion footer. Do **not** silently lower the threshold just to make a
fixture pass. Produce a synthetic stream with sufficiently high entropy to
exceed the compressed threshold, with the correct harmless completion
footer, and never include real Source, member text, production SQL or
database credentials. An all-zero or repetitively generated stream will
compress too well and fail this real threshold.

Every full-shell fixture must require **no network**, no real Docker
socket, no NAS/host filesystem bind, a read-only root filesystem, a
non-root UID, bounded CPU/memory/size/time, private tmpfs data and an
unchanged SHA-pinned copy of the held shell. The alternate fake
\`docker\` command shall return **synthetic** \`pg_dump\` bytes and
\`pg_isready\`, and a synthetic media path. Any unexpected
Docker/rsync/SSH command must refuse.

The independent reviewer must choose and witness at least:

1. Synthetic successful gzip + footer + Source/media hash check, with a
   clearly marked *fixture* manifest, no implication of actual data restore.
2. Too-small compressed archive, corrupt/truncated gzip, missing footer,
   failed Docker export and NAS out-of-space; each must refuse.
3. Inject media sync failure *after* SQL publication; document whether
   \`PG_FINAL\` survives and whether no complete manifest exists. This is
   expected to expose an actual program defect, not to “pass” safety.
4. Inject weekly/monthly copy and final manifest failures, timestamp
   collisions, and two simultaneous invocations; inspect lock and
   no-clobber behavior.
5. Restore **the synthetic archived data only** and compare bytes/hashes.
   This is not proof that a real PostgreSQL SQL script can be replayed
   into an approved consistent DB+Source restoration.
6. Prove all temporary paths and any incomplete final artifacts remain
   inside disposable sandbox storage and do not touch other user data.
7. Record **FAIL/REFUSE** for completed-Delete Work architecture: the held
   script still archives globally reconstructive SQL and omits Source
   and per-Work key erasure. It cannot receive Class A deletion-safe
   certification even if its synthetic gzip run happens to pass.

### Proposed next architecture, not yet implemented

A redesigned backup should stage all **encrypted**, independently
erasable components with an explicit database/Source consistency manifest,
verify integrity and authorized recipient custody, and publish an atomic,
no-clobber **complete/ready marker** only after **all** components and
replica checks succeed. Publication must be fenced against current
non-rollback deletion authority and must not resurrect already-deleted
Works. Any partially published bytes stay quarantined and are disposed of
only under a separately authorized custody rule. Historical plaintext SQL,
Recycle Bin copies, other keys and remote replicas remain independently
governed; a ready marker cannot retroactively make them erasure-safe.

**Stop:** Do not bypass R20, execute the real backup writer, change cron,
prune archives, install a new backup service or resume the Writer's Studio
beta rollout under this source-order receipt.
