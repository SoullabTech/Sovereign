# Writer’s Studio R20-R7 — Synology DSM read-only custody review

**Date:** 2026-10-13 (Eastern)
**Programme:** Writer’s Studio — one small, invitation-only tester group
**Classification:** Class A — human-administered custody evidence only
**State:** READY FOR AUTHENTICATED READ-ONLY REVIEW · NOT PERFORMED · RELEASE HOLD
**JARVIS Work Unit:** `v2-writer-s-studio-small-beta-launch-mv5adx5f`
**Canonical tracker:** https://github.com/SoullabTech/Sovereign/issues/1800

## Network and trust facts already observed

- Existing pinned-authenticated Minisforum SSH confirms the mounted backup share source:
  `//192.168.4.42/soullab-backups` → `/mnt/ds225` (CIFS).
- Mac Studio connected to TCP 5001 at `192.168.4.42`; that is transport
  reachability, **not** proof of NAS administrative identity or an authenticated DSM session.
- An ordinary HTTPS HEAD with certificate validation **refused** with
  `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
- The **observed, not independently authenticated** leaf certificate reports
  subject `/C=TW/L=Taipei/O=Synology Inc./CN=synology`,
  issuer `/C=TW/L=Taipei/O=Synology Inc./CN=Synology Inc. CA`,
  validity 2026-02-09 to 2027-02-10 GMT,
  SHA-256 fingerprint
  `0E:20:C3:C5:2F:ED:06:BD:97:8A:76:95:09:93:B5:43:E7:94:0A:D3:32:8E:42:31:C5:50:0C:4B:0D:82:BA:E8`.
  This is only an observed fingerprint; comparison to itself cannot establish trust.
- No previously pinned Synology **SSH** host key was found on either verified
  Mac Studio or Minisforum. No Synology administrative authentication attempted.
- No bypass such as `curl -k`, `StrictHostKeyChecking=no`, guessed credentials,
  login-cookie extraction or unknown-certificate acceptance is authorized.

## Read-only DSM review — minimum admission sheet

An owner using an already independently trusted DSM administrator session
should inspect the **existing** `soullab-backups` share. Do not click Apply,
Save, Change, Empty, Delete, Restore, Create, Lock, Unlock or Enable.

| Witness | DSM read-only path | Minimal receipt (without identifying file contents) |
|---|---|---|
| Device/transport identity | Previously trusted DSM session or independently checked certificate/management endpoint | authentication method; cert fingerprint compared to **pre-existing trusted source**; result VERIFIED / UNKNOWN |
| Share Recycle Bin settings | Control Panel → Shared Folder → `soullab-backups` → Edit | Enabled yes/no, "restrict access to administrators only" yes/no; **close without saving** |
| Server Recycle Bin population | File Station → `soullab-backups` → `#recycle` | count and approximate total bytes **for backups only**, visibility/permission error if any; no filenames |
| Snapshot retention | Snapshot Replication → Snapshots → Shared Folder → `soullab-backups` → Snapshot List / Settings > Retention | available yes/no; snapshot count, earliest/latest date, retention rule, immutable protection yes/no; never create a snapshot |
| NAS/share ACL | Control Panel → Shared Folder → `soullab-backups` → Edit → Permissions / Advanced Permissions | service identity allowed? guest/everyone access? admin roles? deny/allow summary; do not show names of actual writer accounts |
| Recycle folder ACL | File Station → `#recycle` → Properties → Permission | admin-only vs other principals; effective permitted readers; do not edit |
| Other recoverable copies | Hyper Backup task lists, Snapshot Replication replication task list, DSM Task Scheduler entries | task category, number, scope and offline destinations **without addresses, credentials, key IDs, file contents, or member details** |
| Backup generation visibility | Control Panel / File Station on source share | reconcile **32 local, 27 mounted NAS SQL generations**, client-mounted Recycle **0** against prior DSM-reported **~30.37 GB**; explain any difference with actual DSM evidence |

Use only existing service UI and log out normally. The list above asks for
*observation*; a user with administrative rights can still accidentally
trigger destructive commands. Do not enable new retention locks or change
ACLs while reviewing. If a package or menu is not installed/visible, record
**NOT OBSERVED**, never zero or absent.

## Admission logic — no false release

**PASS (DSM evidence only):** Separately authenticated device identity,
authoritative DSM share and Recycle Bin visibility, effective ACL and current
snapshot/replica inventory, documented discrepancy disposition, recorded
with the administrator's identity and observed date. This closes the DSM
inventory subgate **only**, not the R20 recovery or tester release.

**HOLD:** certificate/session trust unverified, DSM records inaccessible,
CIFS/DSM views inconsistent, backup-copy coverage unknown, guest access
unresolved, retention conflicts with strict completed Delete Work, or any
unexplained difference in archive counts.

**STOP:** evidence attempts to expose manuscript content/filenames or member
identities, asks to paste keys/credentials into chat/GitHub, disables a backup,
changes NAS ACL/retention/recycle, erases data, or treats admin account login
as signer or erasure approval.

## Current evidence ledger, October 13

- Pinned SSH Minisforum / PostgreSQL Source census: **15 arrival rows,
  13 file-backed references, 13/13 referenced originals present, 2 historically
  unreferenced 2,380-byte files**. No current registry reference matching either
  among 13 inspected columns; **not proof of abandoned ownership**.
- Two **unclaimed Source-arrival rows** remain a different issue from the
  two physically unreferenced files.
- Local PostgreSQL SQL gzip archives: **32**, 11,238,864,489 bytes.
  Mounted Synology SQL gzip archives: **27**, 8,948,870,188 bytes.
- Mounted CIFS `#recycle`: **0 client-visible regular files**.
  Earlier DSM report: approximately **30.37 GB in server Recycle Bin**.
  **Unreconciled**; client views cannot overwrite DSM evidence.
- Current R20 signing gateway R4 is same-host fictional, not independently
  protected. No independent monotonic/rollback-resistant deletion authority.
- Full current database+Source-vault encrypted restore and strict all-copy
  Delete Work remain **HOLD**. No production, keys, NAS, member manuscript,
  cache purge, guest access or tester invitations changed in this review.

## After the DSM inventory passes

Qualify an independently administered deletion signer + separate rollback-
resistant high-water witness, then submit a distinct founder-authorized
sealed complete Source+PostgreSQL capture and isolated recovery plan.
The limited two-person writer canary remains behind the full gate.
