# R20-R5 — Independent signer-host custody qualification

13 October 2026. Founder-led Class A engineering, read-only host assessment. **Not a production signing service or release authorization.**

## Reconciled host decision

The previously proposed external VPS is not an unused machine. The source-held October 2 PostgreSQL standby recovery runbook at commit 6128d251a1, file docs/ops/POSTGRES_STANDBY_RECOVERY_2026-10-01.md, identifies ubuntu-8gb-fsn1-2 as the designated PostgreSQL standby/disaster-recovery machine. It records zero active replication and a recovery hold. It must NOT be silently reassigned to a deletion signer while it retains this essential standby/failover role.

Mac Studio read-only October 13 observation: the secure-network VPS peer is offline, last seen October 7, and read-only SSH to the previously pinned host key timed out. No current VPS service, disk, key or operating state was remotely inspected. No authorized Hetzner hosting control-plane connection or installed hcloud CLI was found locally. Provider state is unverified; offline Tailscale does not prove a server is powered off.

The production Minisforum runs member Source and PostgreSQL; Synology holds backups; Mac Studio is a development fixture. The connected hosted-service read-only inventory showed no ready R20-dedicated signer. None is presently qualified as a physically independent signing authority.

**Disposition: existing standby VPS is REFUSED as signer while it retains any PostgreSQL primary/standby, failover, backup or replica responsibilities.** Its connection restoration belongs in the existing disaster-recovery lane. Do not sacrifice database continuity to claim signing independence.

## Founder-led custody rule

The founder can remain the primary human steward without naming a second human reviewer for engineering. Technical separation still requires distinct signer identities, protected keys, separately administered service credentials, non-restorable HEAD/high-water custody, and independent physical/snapshot failure domains. A founder approval, role name, asserted Tailscale connectivity or file hash is not physical attestation.

## Isolated host-admission gate

Added non-I/O negative filter lib/recovery/r20-r5/hostQualification.mjs, supported by tests/constitutional/r20-r2/r5-host-custody.test.mjs. It rejects:
- offline, unrecognized or application/standby/backup/developer-hosted signing candidates;
- shared data disks, snapshots, backup-recovery domains or administrative credentials;
- signer keys exportable with ordinary host credentials or reuse of a GPG backup decryption key;
- public unprotected endpoints, absent mutual transport authentication or unpinned peer identity;
- high-water recoverable from the signer snapshot, absent rollback denial, and untested key rotation and signer-loss recovery;
- missing independent provider, physical location, key, audit and disaster-recovery evidence.

Even a hypothetical all-claimed-positive candidate returns DOCUMENT_REVIEW_ELIGIBLE_ONLY, not a certificate. This filter cannot independently authenticate caller assertions or physical custody.

## Qualified candidate architecture

Preferred future topology: a separately administered managed signing/KMS service with nonexportable R20 signing roles AND an independent append-only monotonic HEAD/high-water witness, physically and administratively removed from the Minisforum, Synology, PostgreSQL standby and ordinary development workstations. A single generic VPS with an ordinary writable disk cannot itself provide nonrollback custody. An additional dedicated node may be possible without buying hardware, but service/provider/cost selection is a separately authorized decision.

A spare already-owned machine is an alternative only after evidence proves no application, development, backup, standby or common restore domain and establishes equivalent external key and monotonic control. None has passed this qualification as of October 13.

## Proof required on an actual dedicated host

1. Provider-sourced machine identity and physical failure-domain evidence; pinned SSH or mTLS public key, dedicated restricted operator identity, encrypted private transport and authenticated peer provenance.
2. Protected nonexportable ledger/HEAD/pin signing keys; verifiable rotation and loss recovery; never reuse the LaCie GPG backup key or place signing secrets in image, repository, SQL backups or Lexar archives.
3. The application server must first authenticate member-owned Delete Work and durably commit a complete content-minimal outbox in the same transaction. The signer must independently verify issuance authority; an arbitrary signed caller JSON string is not proof of consent or DB commit.
4. Signer and high-water rollback attacks, every crash/write prefix, VM reboot, signing-service unavailability, replay/stale request and key revocation must fail closed without losing unrelated Works.
5. Actual recovered PostgreSQL+Source member data remain quarantined until a fresh external deletion ledger is checked inside the final atomic publication fence; restored deleted material may never reach MAIA, caches or the member UI.
6. Legacy local/NAS plaintext SQL, Synology recycled archives, snapshots, offsite copies, WS-DELETE-02 and per-Work key destruction remain separate release holds.

## Results and scope

Base R20-R4 local commit d1d99848d1cc48f116ecff21e0e4bbb4bb526392.
New R20-R5 host checks 26/26 PASS; aggregate R20 Node suite 190/190 PASS, zero failures.
The designated PostgreSQL standby fails regardless of whether the SSH connection becomes reachable.
These are fictional/local code checks, not host provisioning, physically independent hardware evidence or security approval.

**STATUS: HOST SELECTION REVISE / PHYSICAL INDEPENDENCE HOLD.** No production, service or account configuration, private keys, disks, backup archives, cron jobs, application migrations or member content changed.
