# R20-R3J — Historical reconstructive backup disposition

October 13, 2026. Class A founder-led engineering. **Read-only evidence; no production/archive erasure authority.**

## Last verified external inventory

These values are historical **October 12** observations carried forward from GitHub issues #1796, #1794, #1788 and #1785, NOT a new production inventory today. A read-only SSH connection to the Minisforum from Mac Studio timed out on October 13. No remote backup contents were accessed.

| Substrate | Historical observed evidence | Release implication |
| --- | --- | --- |
| Minisforum local database | 32 gzipped plaintext full SQL archives, approximately 11.22 GB; local 02:00 cron and 30-day pruning | Reconstruction remains possible from old SQL |
| Synology database | 26 gzipped plaintext full SQL archives, approximately 8.76 GB; separate root 02:00 cron and 14/56/365-day pruning | Not encrypted per Work; no original Source vault coverage |
| NAS Recycle Bin | maia-backups subtree approximately 30.37 GB and 120 entries | Unknown retained reconstructive history; actual lineage unsettled |
| NAS encrypted-release recycle | Approximately 5.9 KB and five entries | Contents/lineage unresolved |
| Offsite/Time Machine/exports | Incomplete census | Unknown = HOLD, never zero |
| Live Source vault | Previously 15 Source files, 13 registered references and two older unreferenced files | Full consistent paired Postgres+Source restore not certified; WS-DELETE-02 open |
| LaCie recovery custody | New public GPG primary-key fingerprint verified; encrypted private bundle exists | Recovery key is not the distinct R20 signer/high-water/key-retirement authority |
| Lexar ciphertext destination | Synthetic encryption/restore PASS | No real member archive write authorized |

## Irreducible engineering and operational obligations

The ratified #1791 invariant requires that **completed Delete Work cannot be reversed from any Soullab-held copy or remaining key**. This has no presumed time-bounded backup exception.

1. Complete a read-only count/hash/schedule/ACL census of every current local, NAS, recycle, snapshot, offsite, Time Machine and export generation. Do not place member words, names, file paths or identifiers in GitHub logs.
2. Preserve present continuity until a future clean, deletion-safe and complete PostgreSQL + Source paired archive has passed a separately authorized isolated full restore. The October 12 bounded two-artifact restoration is useful but incomplete.
3. Encrypt reconstructed source, draft and derivative writing **before it reaches PostgreSQL/WAL, the file vault, snapshots and other durable surfaces**, using separately erasable per-Work material rather than one globally decryptable SQL/tar archive.
4. Provision independent signing, deletion high-water, verifiable per-Work key retirement and a restore-versus-deletion publication fence outside all restorable DB/NAS failure domains. A file-backed Mac Studio fixture cannot satisfy operational independence.
5. Decide the custody fate of the two historical unreferenced files and unclaimed arrivals separately under WS-DELETE-02. Do not silently attribute, erase or preserve them indefinitely.
6. For **each** historical plaintext/recycled/offsite copy, establish an exact founder-authorized irrecoverability disposition once replacement recovery has been demonstrated. Path deletion on SSD/SMB is not proof against snapshots, recycle, unknown replicas, key escrow or media remanence. No blanket purge is authorized.
7. Verify after remediation that a deleted Work cannot be reconstructed with all remaining copies and keys, while an unaffected Work fully restores. If proofs or an independent authority are unavailable, keep permanent erasure pending.
8. Only after these gates, review and install a deletion-compatible root/user 02:00 writer transition with rollback and exact tested release image. Lexar receives encrypted ciphertext only under its own future authorization.

## Implemented R3J fixture boundary

The isolated Mac Studio branch adds content-minimal **fictional** disk-fsynced, commit-last signed deletion checkpoints; a staged/under-fence double-check from R3I; and a fictional paired database+Source complete-inventory/hash verifier. It refuses old plaintext copies, corrupt or missing files, orphans, unclaimed arrivals, deleted Work resurrection, untrusted signing identities and interrupted checkpoint generations. A simulated restored archive is never promoted to production.

**Disposition: full live archival recovery and legacy irrecoverability remain HOLD.** No second reviewer is assigned in this founder-led engineering lane, but physical signing independence, cryptographic erasure, true ACL/replica evidence and actual recoverability remain necessary engineering gates.
