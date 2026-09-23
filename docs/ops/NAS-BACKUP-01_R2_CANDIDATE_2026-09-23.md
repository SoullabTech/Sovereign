# NAS-BACKUP-01 / R2 — Backup Integrity + Restore-Witness Hardening · CANDIDATE

**Standing: CANDIDATE BUILT · FALSIFIERS F1–F5, F7–F9 LETHAL · F6 OWED (docker host) ·
⛔ NOT DEPLOYED · ⛔ STOPPED FOR FOUNDER REVIEW BEFORE ANY CHANGE TO THE MINISFORUM.**

Authorization: founder act of 2026-09-23 (this lane's §I–§VIII). R1 standing accepted as
written there, including: the 18 Sep artifact stays under forensic hold; the failure class
stays *CONFIRMED SILENT NAS-PATH TRUNCATION · CAUSE NOT ATTRIBUTED*; production does not read
from the NAS and R2 keeps it that way.

## 1. The four claims, kept apart (§VII)

| Claim | Established by | Evidence object |
|---|---|---|
| backup created | `maia-backup` (R2) ran pg_dump to a staging name and every pipeline status was 0 | log line *Artifact complete in staging* |
| artifact intact | one full decompression of the staged file: gzip integrity + pg_dump closing marker; bytes + SHA-256 recorded | log line + manifest `SHA256:` |
| durable on the NAS | the **final NAS-resident** file is reopened after rename+sync and its bytes and digest must equal the staged values | log line *PostgreSQL backup complete … verified on NAS*, sidecar `<file>.sha256`, `state/last-verified-backup.env` |
| restorable | `maia-restore-witness` restored a *verified* dump into a disposable container and the sanity checks passed | `restore-reports/restore-witness_<stamp>.txt`, `state/last-restore-witness.env` |

No claim stands in for another: a run that fails at any step never emits the success line,
never writes a manifest or state, and quarantines a finalized-but-unverifiable file to
`postgres/.failed/`. The health probe reads the two state files, never a directory listing.

## 2. Affected-file inventory (all in this repo; nothing on the minisforum changed)

| File | Role | Status |
|---|---|---|
| `scripts/ops/maia-backup-hardened.sh` | **new** — candidate for `/usr/local/bin/maia-backup` (§III.A, §III.B, HOLD) | new |
| `scripts/ops/maia-restore-witness.sh` | **new** — candidate for `/usr/local/bin/maia-restore-witness` (§III.C) | new |
| `scripts/ops/backup-health.sh` | **new** — backup health authority (§III.D) | new |
| `scripts/health-check.sh` | reads the probe instead of the dead `~/maia-backups` path; `LAST_BACKUP=none` replaced by `BACKUP=… RESTORE_WITNESS=…`; confidence drops to *medium* when the backup is not verified-current or the witness failed | modified |
| `scripts/backup-postgres.sh` | secondary tier: `gzip -t` before claiming; a failed check removes the file and exits 1 (§III.E) | modified |
| `scripts/ops/nas-backup-r2-matrix.sh` | **new** — falsifier matrix F1–F9 (§V) | new |
| `scripts/ops/r2-deploy/cron.d/maia-backup` | unchanged schedule, R2 authority at the same path | new file |
| `scripts/ops/r2-deploy/cron.d/maia-restore-witness` | **cadence fixed: weekly, Monday 04:00 UTC** | new |
| `scripts/ops/r2-deploy/user-crontab.diff` | secondary tier staggered 02:00 → 02:30 UTC | new |
| `scripts/ops/r2-deploy/HOLD` | forensic hold list: `maia_20260918_020002.sql.gz` | new |
| `scripts/ops/r2-deploy/install.sh` | installer, refuses without `R2_INSTALL_AUTHORIZED=1`; keeps the R1 script as `maia-backup.r1-<date>` | new |
| `scripts/ops/minisforum-maia-backup.sh` | R1 verbatim copy — **unchanged**; serves as F9's defeat candidate | untouched |

Not modified: `/etc/fstab`, any migration, any `lib/` or `app/` file, production compose.

## 3. Cron changes (proposed, not applied)

```
/etc/cron.d/maia-backup            0 2 * * *   root /usr/local/bin/maia-backup            (same as today)
/etc/cron.d/maia-restore-witness   0 4 * * 1   root /usr/local/bin/maia-restore-witness    (NEW, weekly)
soullab crontab                    30 2 * * *  … scripts/backup-postgres.sh                (was 0 2 * * *)
```
Two hours between backup and witness so they never overlap; the secondary dump moves thirty
minutes so two `pg_dump`s no longer start in the same second.

## 4. Mount changes (§III.F): NONE in R2, documented

Current: `//192.168.0.103/soullab-backups /mnt/ds225 cifs credentials=/etc/cifs-credentials-ds225,
uid=1000,gid=1000,vers=3.0,_netdev,x-systemd.automount` — effective options include
`soft,retrans=1,cache=strict,rsize=4M,wsize=4M,actimeo=1`.

Ruling proposed: **leave it.** `soft` makes a NAS outage fail the backup fast and visibly
(F7) instead of hanging a root cron job for hours; with verify-after-write in place, a
transport hiccup can no longer masquerade as a good backup, which was the actual defect.
`hard` would trade a visible failure for a hung process and, through `df`/`du` in
`health-check.sh`, could stall health reporting. Candidates for a later act, each needing
its own reconnect witness: `retrans=2` (kernel default), `echo_interval` tuning, or
`cache=none` for the backup path. ⛔ The 18 Sep truncation is still not attributed to
these options.

## 5. Duplicate local pg_dump (§III.E): KEPT · STAGGERED · VERIFIED

**Disposition: preserve as an independent secondary tier.** Rationale: it is on a different
medium (production's own disk), a different path, a different user, and it held the only
intact copy of 18 Sep. Retention 30 days ≈ 10 GB standing on the minisforum disk, unchanged.
Changes: start moves to 02:30 UTC; `gzip -t` before the success line. ⛔ Not retired.

## 6. Forensic hold (§I, §IV)

`postgres/maia_20260918_020002.sql.gz` (75,497,472 B, SHA-256 `4ba0b752…c88d1`) would be
pruned by retention on ~2 Oct. The R2 script honours `$BACKUP_ROOT/HOLD`; the installer
seeds it with that filename. The R1 script has no such mechanism — one more reason the R2
authority must land before that date, or the file must be copied aside with its hash.

## 7. Falsifier matrix (§V) — run in the repo container, Linux, no NAS, no docker daemon

Fault injection is by PATH shims only (`docker` · `gzip` · `mv` · `sync` · `cp` · `du`);
the candidate carries no test switch. The **R2 gate**: a run claiming
*PostgreSQL backup complete* is accepted only if the final artifact exists, passes `gzip -t`,
and the manifest's SHA-256 equals the artifact's actual digest; a run that does not claim is
accepted as a proper failure only if it left no final artifact, no manifest and no state.

```
NAS-BACKUP-01 / R2 falsifier matrix — 2026-09-23T16:07:53Z on vm (Linux)
REF    PASS      happy path: exit 0, claimed, gate ACCEPT, sidecar + state written
F1     PASS      pg_dump exit 1 → rc=1, no claim, no final/manifest/state
F2a    PASS      no closing marker → rc=1, no claim, no residue
F2b    PASS      truncated gzip stream → rc=1, no claim, no residue
F3     PASS      rename to final fails → rc=1, no claim, staging cleaned
F4     PASS      artifact truncated after rename → rc=1, no claim, quarantined to .failed/
F5     PASS      corrupt weekly copy → rc=1, copy removed, no manifest, daily itself still verified
F7     PASS      unmounted NAS → rc=1 before any write; MAIA untouched by construction (script only exits)
F8     PASS      missing · verified-current · stale (48 h) · witness failed · unreachable all distinguished
F9     PASS      R1 script under post-write truncation: claims success (rc=0, logs '(333M)') — R2 gate REJECT:claimed-but-artifact-corrupt
F6     NOT-RUN   no docker daemon here — ⛔ not a pass; founder runs: WITNESS_DUMP=<18 Sep artifact> scripts/ops/maia-restore-witness.sh must FAIL
PASS=10 FAIL=0 NOT-RUN=1
```

Notes. **F9** is the R1 script byte-for-byte except path parametrization; under a shim that
truncates the file right after the script measured it (exactly the 18 Sep shape) it logs
`(333M)` and *backup complete* and exits 0, and the gate rejects the run. **F4** is the same
fault against the R2 candidate: no claim, quarantine, exit 1. **F6** cannot run without a
docker daemon; it is NOT-RUN here and stays owed — the founder runs it on the Studio or the
minisforum against the 18 Sep artifact (`WITNESS_DUMP=…`), expecting FAIL and a FAIL report.
Two harness defects were found and repaired during the run, neither in the candidate: the
F9 copy still hard-coded `df /mnt/ds225`, and the harness omitted the `media/` directory the
R1 manifest assumes.

## 8. Host / runtime witness plan (§VI) — founder-run, after review, in this order

```bash
# 0. install (refuses without the founder flag); keeps the R1 script beside it
R2_INSTALL_AUTHORIZED=1 scripts/ops/r2-deploy/install.sh
# 1–3. hardened backup over the real minisforum→NAS route; verify the NAS artifact independently
sudo /usr/local/bin/maia-backup && tail -3 /var/log/maia-backup.log
F=$(sed -n 's/^BACKUP_PATH=//p' /mnt/ds225/maia-backups/state/last-verified-backup.env)
stat -c '%s bytes' "$F"; sha256sum "$F"; cat "$F.sha256"; gzip -t "$F" && echo GZIP_OK
# 4–7. restore witness once by hand on that artifact; report lands in restore-reports/
sudo /usr/local/bin/maia-restore-witness; ls -t /mnt/ds225/maia-backups/restore-reports | head -2
cat /mnt/ds225/maia-backups/state/last-restore-witness.env; docker ps --filter name=maia-restore-witness   # must be empty
# F6 on a real dump: the 18 Sep artifact must FAIL
sudo WITNESS_DUMP=/mnt/ds225/maia-backups/postgres/maia_20260918_020002.sql.gz /usr/local/bin/maia-restore-witness; echo "rc=$? (expect 1)"
# 8. health check reads the governed state
bash scripts/ops/backup-health.sh; bash scripts/health-check.sh; tail -1 <health log>
# 9. NAS absent, MAIA unaffected: unmount, run backup (must refuse), probe MAIA, remount
sudo umount /mnt/ds225; sudo /usr/local/bin/maia-backup; echo "rc=$? (expect 1)"
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/api/health   # production answers
bash scripts/ops/backup-health.sh                                             # BACKUP=unreachable
sudo mount /mnt/ds225; mountpoint /mnt/ds225
# 10. capture as deployed
sha256sum /usr/local/bin/maia-backup /usr/local/bin/maia-restore-witness; cat /etc/cron.d/maia-backup /etc/cron.d/maia-restore-witness; crontab -l | grep backup-postgres; mount | grep ds225; cat /mnt/ds225/maia-backups/HOLD
```
Then the next Monday 04:00 UTC run is the first scheduled witness; `backup-health.sh` reads
`RESTORE_WITNESS=pass-current` afterwards.

## 9. Known limits of this candidate

- Verified only under shims on Linux in the repo container. Real CIFS rename/sync semantics,
  `mountpoint` on the minisforum, and the restore witness's runtime on production hardware
  (a ~3 GB SQL restore on the same host, weekly at 04:00) are established only by §8.
- The media rsync is carried unchanged; it makes no integrity claim and none is recorded.
- The R2 health probe reports *missing* until the first R2 backup runs, and *absent* for the
  witness until the first witness runs — the honest reading, not a defect.
- `health-check.sh` will report *medium* confidence on the minisforum from install until
  the first verified backup; expected and visible by design.

**STOP FOR FOUNDER REVIEW BEFORE DEPLOYMENT TO THE MINISFORUM.** The live backup authority is
unchanged; the next nightly run (02:00 UTC) is still the R1 script.
