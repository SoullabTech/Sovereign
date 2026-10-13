# R20-R3I — Founder-led synthetic restore-publication fence
October 13, 2026. Engineering candidate; Class A technical constraints remain binding.

## Founder-directed workflow
The founder requested continuation of R20 / Writer's Studio recovery engineering without appointing a second reviewer. This is founder-led engineering oversight, not independent human security acceptance or authority for a live member-data backup, restore, deletion, migration or beta rollout. WS-DELETE-01 / #1791 total erasure remains binding.

## Exact candidate and verified behavior
Base local source 98e22532dc63bf2bff66a123044f2ef806842071. This isolated candidate adds:
- lib/recovery/r20-r3/restorePublicationFence.mjs (synthetic-only).
- Two content-minimal signed HEAD and registry commitments returned by externalAnchorBoundary.mjs.
- tests/constitutional/r20-r2/r3i-restore-publication-fence.test.mjs.

The fixture requires an external cryptographically verified ledger, HEAD and high-water pin before staging, then repeats fresh signed authority verification within a supplied exclusive deletion/publication fence. Any new deletion epoch, alternate signed HEAD at the same epoch, unavailable independent authority, false fence, missing acknowledgement or malformed archive is refused. It never accepts member rows or real archives, and always returns productionPromotionAllowed=false, actualArchiveRestored=false, physicalCustodyVerified=false.

Observed Mac Studio test results: **18/18 new synthetic checks PASS**, **76/76 existing R20 checks PASS**, zero failures. A synthetic deletion added after preparation but before fenced acknowledgement was refused and no publication receipt emitted.

## Explicit limitations and remaining actual work
The exclusive fence is a mocked interface. Cryptographic signatures do not prove physical separation, reliable external operations, fresh DNS, network isolation, durability, atomic release or safe failure recovery. No actual remote signing/high-water service exists in this candidate; no live PostgreSQL or vault adapter is installed.

The live 02:00 local and NAS PostgreSQL backups remain globally reconstructive SQL dumps. Historic local, NAS, Recycle Bin and possible offsite copies cannot be made deletion-safe merely by new global GPG encryption. The complete Source vault, unclaimed arrivals, all derived text/WAL and historic media require independently witnessed closure. No stored private key was accessed by these tests.

## Next engineering increment
Build a durable signing/outbox checkpoint bridge using *fictional data*, with crash checkpoints, signer-loss handling, rollback-resistant independent high-water, and a fence that serializes deletion and restore publication. Separately reconcile real historical backups, access controls, and complete SQL + Source topology before a specifically authorized encrypted capture.

NO changes to production, 02:00 jobs, NAS, LaCie, Lexar, real member data, retention rules or deployed application are authorized.
