# Writer’s Studio R20-R8 — truthful local deletion vs permanent erasure

**Date:** October 13, 2026
**Work Unit:** `v2-writer-s-studio-small-beta-launch-mv5adx5f`
**Scope:** Existing small, invited Writer’s Studio tester group only
**Disposition:** ISOLATED CLASS A SOURCE CANDIDATE · NOT MERGED · NOT DEPLOYED
**Base:** R20-R7 `2d16df39b3`, derived from R20-R4 signed fictional anchor work.

## Actual risk found in source review

`lib/writersStudio/deleteWork.ts` previously told a writer that a DELETE
left **“no archive — nothing is kept”**. The production-shaped
`DELETE /api/sovereign/manuscripts/[id]` route could return HTTP 200 after
the local PostgreSQL transaction and immediate Source-vault sweep, without
a witnessed full irrecoverable-backup operation. The older client treated any
2xx or 404 as `{ok:true}`. An unrelated owner's inaccessible row and a
successfully locally removed row therefore could be displayed alike.

This conflicts with founder-ratified #1791: completed Delete Work must be
irrecoverable from *all* Soullab-controlled copies and remaining keys.
Live read-only evidence still includes 32 local SQL dumps, 27 NAS SQL dumps,
30.37 GB / 120 files of old recycled backups, a Source vault with two
unattributed historic files, and an unqualified physical deletion signer.

**Important limitation:** In the current integrated Writer’s Studio candidate,
parts of the old `HomeView` and `deleteWork` client are legacy source rather
than necessarily mounted by the latest PC3/P4R1 host. This patch fixes the
shared DELETE API acknowledgment and older client contract, but independent
acceptance must inspect every currently mounted deletion gesture and account
session, including offline Cabin if its data is ever synchronized. Do not
present these focused tests as full UI/device acceptance.

## Exact isolated correction

1. New pure server-side R20-R8 acknowledgment contract always returns
   `erasureStatus:"pending"`, `permanentErasureCertified:false`,
   `historicalCopiesVerified:false`, and
   `independentSignerCertified:false` after *local* removal. There is no
   config or caller-Boolean bypass to a completed status.
2. A locally successful manuscript DELETE responds **HTTP 202** with
   `removed:true` and those explicit pending fields, irrespective of whether
   the immediate vault sweep finished. It still uses the existing, transactionally
   committed R20 deletion outbox. **No new deletion is triggered by the patch.**
3. A client consuming HTTP 202 must **not** treat it as permanent erasure.
   Legacy 200/404 responses also cannot certify irreversible deletion; Work
   ownership non-disclosure remains unchanged.
4. Legacy member-facing copy distinguishes local removal/request from
   permanent all-copy destruction. It no longer assures writers that no archive
   exists. Containers with no manuscript keep their distinct Remove path.
5. The DELETE operational log prints only aggregate sweep status; no member or
   manuscript identifier. Current `GET` and ownership checks are unchanged.

## Focused evidence and acceptance to close next

- Local, fictional Jest tests: pending with both local sweep outcomes;
  invented environment promotion fails; malformed acknowledgment refused;
  legacy client 202/200/404/500 behavior; unavailable transport;
  refusal classifications; Remove Work unaffected.
- **27/27** focused Jest tests passed in the isolated worktree, including
  static online-route binding checks. An isolated, resource-bounded TypeScript
  check of the changed pure modules and client tests passed with zero errors.
- The full-project TypeScript check was attempted with Node's default ~4 GiB
  heap and terminated with a **heap out-of-memory error** before diagnostics;
  it is **NOT** a passing or failing full-project typecheck verdict.
  Exact image-level account/session/browser tests remain a distinct gate.
- Security/privacy independent review required for HTTP 202 response, old
  clients using `res.ok`, 404 handling, Work-by-id ownership, and UI clarity.
- **Not a complete erasure implementation:** no actual historical SQL/key
  retirement, no independent signer/high-water, no production KMS/GCP
  authority, no full current Postgres+Source isolated restore, no NAS archive
  pruning or release GO.
- Prior R20-R5 **9/9** physical fictional SQL/Source recovery remains credited;
  R20-R6 read-only historic Source census `894a968161`, provenance caution
  `3cf9a0e952`, DSM review checklist `2d16df39b3` remain credited.
  Re-run only tests whose inputs or trust boundaries changed.

## Independent workstreams, without scope expansion

**A — Recoverability:** exact current coherent SQL plus all original
Source-vault bytes, member-derived text/drafts, unknown Source disposition
and authenticated generation must be restorable from an independently
authorized sealed backup. A past two-file restore or fictional 9/9 is not full.

**B — Legacy erasure:** retain old backups until new last-good recovery
is proved. Determine independently whether each historical SQL, NAS Recycle,
snapshot, offsite copy and decrypting key can reconstruct any Work whose
completed deletion is claimed. No global GPG envelope retroactively fixes
plaintext SQL. No blanket deletion or indefinite exception authorized.

**C — Separate signer:** qualify physical and administrative independence,
nonexportable signing keys, current committed outbox identity, monotonic
anti-rollback high-water and atomic delete/restore fence. AWS KMS plus an
independently governed checkpoint service remains provisional **design
only** until founder approves actual account ownership, retention and spend.
An SSD or same-host fictional signer is not an independent authority.

## Stop

No production route change, no copy/upload of member data, no live manuscript
DELETE, no archive removal, NAS ACL or backup cron edit, no signer
provisioning, no new keys, no tester enrollment/invitation, no merge. The
Writer’s Studio small-group release remains **HOLD**.
