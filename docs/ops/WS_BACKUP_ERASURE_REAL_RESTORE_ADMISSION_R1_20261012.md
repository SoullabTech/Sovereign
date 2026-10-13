# WS-BACKUP-ERASURE-03 — live Source+Postgres recovery admission design R1

**Status: Class A review candidate, not approved, not installed, not a real-vault capture.**
Parent [PR #1794] synthetic/privacy audit commit:
`17aa524f22b6e70b7e939c074dd4e4e63e233716`.
Related: #1791 total-erasure ruling, #1793 design, #1788 Source coverage,
#1785 NAS ACL, #1796 actual 02:00 jobs, #1786 unknown artifacts,
#1800 staged first-writer beta.

## Purpose and governing impossibility

Founder accepted strict completed Delete Work: all Soullab-controlled
reconstructive copies, replicas, NAS Recycle Bin, derived text, file Source
and restore credentials must become unrecoverable. Today's production
PostgreSQL stores reconstructive `manuscript_source_arrivals.source_text`,
draft sections and derived writing as plaintext database columns; the
installed 02:00 local and NAS scripts make whole-database gzipped plaintext
SQL archives. The NAS has active archives AND ~30 GB historical recycled
backup files. Separately encrypting the file Source vault or wrapping
another whole `pg_dump` under a new 2026 recovery key CANNOT satisfy
completed Delete Work retroactively.

The existing NAS encrypted archive and receipt verified database restore,
two source artifacts and 2/2 DOCX structure/hash checks on Oct 12; that
receipt is preserved as a **bounded PASS**. It is not complete actual
production Source-vault coverage or deletion-safe retention.

**R1 judgment: a genuinely release-admissible full restore cannot be
certified from the currently installed backup writers and retention stores.**
Any checker input that claims historical copies have been remediated
requires independent source/replica evidence; don't self-certify by editing
a JSON field.

## Required target design, to be independently challenged

A. **Authoritative identity and custody.** Durable member/Work ownership
maps every arriving source (including pasted text), draft, section, rendered
copy and derived expression to one explicit Work. Unknown/unclaimed arrivals
and the two older unreferenced Source artifacts enter a restricted custody
review; no silent attribution, forced chapter split, deletion or expiry.
WS-DELETE-02 must be explicitly resolved before promotion.

B. **Encryption-before-durable-storage across all reconstructive surfaces.**
Use unique per-Work data-encryption keys for original file Source AND
`source_text`, sections, drafts, review observations, derived output and
versions **before they enter PostgreSQL/WAL or archive media**. Any global
transport/backup envelope can supplement but cannot substitute for
per-Work irrecoverability. Metadata sufficient for owner authentication and
reference integrity may remain only under separately reviewed privacy rules.
An ordinary GPG key still works for complete disaster recovery of active
Works after independently unlocking their authorized per-Work keys, but
cannot recover irrevocably deleted Works. This target requires a major
source/schema migration; it is NOT already implemented by PR #1789.

C. **Independent monotonic erasure authority.** A deletion decision must
be recorded in an authenticated, append-only/tamper-evident authority
independent of every restorable DB, NAS volume, its snapshots and any
rollback image. The key service must deny retired Work keys without
any old wrapped DEK, escrow, backup, WAL, previous key-registry snapshot
or emergency root key resurrecting access. Deleted Work must stay
inaccessible even under old database and file snapshots. No completed-delete
message until replica obligations and key revocation are witnessed;
otherwise expose an actionable deletion-owed state. The current inline
vault queue needs a scheduled independent sweeper and redacted error logging.

D. **Historical archive disposition.** Inventory local daily SQL, NAS
active daily/weekly/monthly SQL, NAS Recycle Bin, root/user cron, Time
Machine/offsite copies, earlier global-key vault bundles, materialized
exports, object snapshots and error logs. For every constructively plaintext
generation, obtain a proved irreversible custody disposition or a
separately accepted method guaranteeing erased Work irrecoverability
despite retained bytes. *Simply keeping a list of tombstones only controls
newly governed restores; it does not make a plaintext SQL dump
unreadable.* Do not silently purge evidence or stop backup jobs.
Unresolved historical media => fail gate.

E. **Atomic point-in-time capture.** Before any one-time, separately
approved real-vault operation, prove member-facing and internal writes,
uploads and deletes are governed at the same barrier. Capture matching
PostgreSQL committed generation plus exact-file Source snapshot under one
sealed generation/commit fence, validate Source DB reference coverage,
source SHA-256 for each authorized original, and all vault entries,
including unclaimed/unknown quarantine. Never mix DB from t1 with vault
from t2 or publish a partially written archive. Encryption happens as a
stream into an exclusive unpublished destination, with verified durability,
no plaintext TAR left on disk and a fail-closed interruption path.
A DB-only successful restore does not meet this gate.

F. **Independent sealed restore.** Key custodian uses a separately
authorized isolated host/namespace and known, non-rollbackable deletion
authority. Before exposing any recovered member text, refuse if the
tombstone barrier is unavailable/stale, the key grant is missing, storage
catalog is incomplete, any copied source hash mismatches, any unknown
artifact exists, any historical reconstructive replica remains unresolved,
or the manifest+generation is not independently authenticated. Only
validated surviving Works become member-visible. Verify zero deleted-Work
resurrection, 100% referenced original files present, no ghost/orphan
attribution, and one intact prior Work revision. Destroy scratch staging
and record receipt without revealing manuscript bodies or filenames.

## Proposed offline pre-admission contract (non-authoritative negative filter)

`scripts/ops/ws-backup-restore-admission.mjs` accepts *only* a
content-minimal proposed JSON object via its pure exported function. It
returns refusal **codes only**. It has no database, filesystem, crypto,
network, key or member-data access. It refuses mismatched generations,
unsealed capture, plaintext/global-key claims, replica/legacy uncertainty,
stale deletion authority, missing/extra/hash-different Source,
unclaimed Source, duplicate identities and post-deletion resurrection.
No candidate is accepted just because this helper returns admitted=true:
every asserted fact must first be witnessed independently against
actual snapshots, source-to-DB joins, custody logs, DSM ACL, physical
replicas and key issuance/revocation.

The tests below are NEW manifest-admission checks, not repetition of
the existing #1794 fictional cryptographic model (14 expected passes,
five unsafe counterexample demonstrations) or the #1797 transition model.

## One-time real-vault capture — separately scoped authorization checklist

- [ ] Founder approves exact snapshot/capture source, target, purpose, time,
      retention and independent key custodian. Not a generic beta yes.
- [ ] Independent Class A reviewer accepts A–F, actual source locations,
      privacy and worst-case failure prefixes, legacy medium disposition,
      key custody and true NAS ACL/backup worker identities.
- [ ] WS-DELETE-02 unclaimed-arrival rule and two unknown files resolved
      without touching them prematurely.
- [ ] New ciphertext-before-write path and nonrollbackable key/erasure
      authority in place, with controlled migration of existing texts;
      no old SQL/WAL/archive can reconstruct a completed deletion.
- [ ] Known-consistent generation and all-ingress quiescence or equivalently
      proven atomic commit fence; published manifest signed by custodian.
- [ ] Permission for one encrypted DB+full Source capture **separate**
      from approval to restore the capture in sealed disposable staging.
- [ ] Restore receipt reports exact complete original/source reference
      coverage, monotonic deletion barrier and custody, plus scratch
      destruction. Never expose member bytes in GitHub.

**No production backup, schedule, schema, Source file, NS/ACL, private key,
Docker image, Jondi Work or public traffic change in this R1 candidate.**
One-time live capture and release remain HOLD pending these approvals.

## Current precise stopping condition

- The entire current production Source vault is not covered by either live
  02:00 database-only backup job.
- Current database and old full SQL archives are reconstructive, and
  the NAS Recycle Bin has preserved historical generations.
- A per-Work encryption/key-retirement path satisfying strict erasure
  across those historical copies has not been implemented/verified.
- The independent Class A adjudication and member-data operation
  authorization have not occurred.

Thus **this design is ready to be challenged**, not yet an acceptable
production recovery plan. Do not confuse model PASS with security PASS.
