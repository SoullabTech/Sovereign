# Writer’s Studio R20-R6 — live custody inventory and signer qualification

**Date:** 2026-10-13 ET
**Classification:** Class A, metadata-only read from the existing authenticated Minisforum
**Workstream:** `v2-writer-s-studio-small-beta-launch-mv5adx5f`
**Standing:** SOURCE INVENTORY ADVANCED; SIGNER UNQUALIFIED; COMBINED TESTER RELEASE HOLD

## Exact bounded observation

Source: `scripts/ops/ws-r20-r6-contentfree-census.py`, run over an
already pinned/verified SSH host identity with `--live-readonly`.
The scanner verifies Docker's exact `maia-sovereign_vault_data` mount,
sets PostgreSQL sessions to read-only with a timeout, and only compares
vault filenames and relational *reference fields internally on the host*.
No member identifiers, filenames, artifact names, hashes of member bytes,
manuscript prose, title or backup bytes are emitted. No copy or restore.

Private content-free machine receipt:
`~/.claude/ain-delegation/projections/ws-r20-r6-contentfree-census-20261013.json`

### Source custody — facts, not attribution

- Source-arrival records: **15**; 13 file-backed references, 2 member-supplied text.
- File-backed: **11 linked to a Work; 2 unclaimed by any Work**. Those
  *registered, unclaimed arrivals* are different from the two unknown files.
- Actual vault namespace: **15 regular files, zero non-file entries**.
- **13/13** unique file-backed references resolve; zero current referenced files missing.
- **Two additional files** have no Source-arrival reference. A bounded
  content-minimal scan of **13** explicit path/reference columns found **no
  alternate matching registered reference**; none is in the erasure queue
  (the queue currently has zero rows). This is not a global proof that no
  historical log, old registry or external storage custody record exists.
- Both unmatched files are **2,380 bytes**, owned by service account `node`,
  mode `0644`, modified **2026-09-06**. Their age precedes the October
  durable-file writer. No filename or member-owned byte was revealed.
- They are therefore classified **UNKNOWN_CUSTODY_PRESERVE**, not
  `safe_to_delete`, `member_abandoned`, `leaked`, or `restored`.
  Do not move, hash, open, chmod, attach to an identity, back up into new
  archives, or erase automatically without separately governed disposition.

### SQL and backup custody — metadata-only

| Location | Count | Stored bytes | Observed client file mode |
| --- | ---: | ---: | --- |
| Minisforum local full-SQL `.sql.gz` | 32 | 11,238,864,489 | 0600 |
| Mounted Synology SQL `.sql.gz` | 27 | 8,948,870,188 | 0755 |

These are archive inventories, **not** integrity, encryption, ACL or erasure
certificates. Separate Source-vault backup coverage is still unproved.
The **mounted CIFS `#recycle` directory yielded zero visible regular files**,
but earlier DSM server-side inventory recorded approximately **30.37 GB of
recycled material**. The mismatch **must** be resolved on the DSM server;
the empty client view is not evidence of permanent deletion. Snapshots,
server-side ACL, remote/offsite copies and historical old-recipient GPG
recoverability are all **NOT VERIFIED**. The 02:00 backup writers are
unchanged and must not be stopped or replaced without a recovery-safe act.

## Independently protected signing — review disposition

The previously completed R20-R4 isolated signer is *fictional* and runs
with same-host temporary keys, a same-host witness, and no real member
authority. It correctly states
`physicallyIndependentSignerCertified:false` and
`productionPromotionAllowed:false`. The R20-R5 real PostgreSQL and
Source **fictional** rehearsal passed 9/9; this does not qualify a signer.

A true R20 erasure authority must supply, with verified evidence:

1. **Independent failure domains:** signing and nonrollbackable sequence/high-water
   history not hosted inside or restorable from the Minisforum application,
   its database, NAS snapshots or the same administration snapshot.
2. **Trusted, narrowly scoped identity:** a pinned, mutually authenticated
   origin, nonexportable role-separated keys where supported, and no arbitrary
   signing endpoint or signer material in source control/application logs.
3. **Authenticated member and committed transaction:** the signer may append
   only when a member-authorized Delete Work has a genuine committed outbox
   transaction. A signed client claim or a caller-supplied Boolean cannot prove it.
4. **Monotonic history and restore protection:** durable sequence, previous
   signed HEAD, independent anti-rollback pin; lost/unreachable signing or
   ambiguous state must leave erasure **PENDING / REFUSED**, never complete.
5. **Concurrency and recovery:** verify replay, nonce reuse, stale checkpoints,
   device compromise, snapshot rewind, power loss, deletion during backup,
   and publication race; a restored archive never resurrects a deleted Work.
6. **Real content-key lifecycle:** per-Work SQL/WAL/Source/derived encryption
   before durable storage, verifiable key retirement and full historical
   backup/recycle/offsite disposition. A global backup GPG key is insufficient.

**Candidate topology for a founder-stewarded future test**, not a certified
installation: Minisforum as app/database producer; an existing *separate*
personal computer as a narrowly governed signer; a second independently
protected witness/high-water service or device. Three key roles must have
different cryptographic identities and a security review must demonstrate
genuine anti-rollback separation. The encrypted LaCie recovery key is
**not** an R20 deletion-signing key, and an SSD alone is not a monotonic
authority. The offline VPS is not a qualified signer.

No production service, key, device, ACL or signer adapter was installed.

## The next *bounded* gates (no reset of completed work)

**A — Historical file disposition:** preserve the two unknown objects,
trace original September 6 arrival/upload job provenance using separately
authorized content-minimal logs, and adjudicate WS-DELETE-02 before
registering, deleting, moving or re-encrypting them.

**B — NAS and offsite:** independently inspect effective DSM share ACL,
actual server Recycle Bin and snapshots; reconcile visible-client 0 vs
earlier DSM 30.37 GB, plus known full SQL backup generations and unknown
offsite destinations. Keep last-good recovery until an approved
deletion-safe successor is witnessed. No blanket cleanup.

**C — Signer:** choose a physically and logically separate signer/witness
custody arrangement and protect keys and monotonic history before connecting
committed production events. Founder remains the initial steward; that
decision does not itself prove cryptographic independence.

**D — Controlled full restore:** only after the above have admissible
evidence and explicit founder authorization, perform one encrypted,
generation-consistent current PostgreSQL + complete original Source capture
and isolated restore. Then verify deletion barriers and author continuity.

The existing Writer’s Studio small-group track remains **two verified initial
testers, then only the approved remaining small group**. No production
deployment, source ingestion, member access grant or invitations were made.
Related GitHub: #1786, #1796, #1788, #1791, #1793, #1800.
