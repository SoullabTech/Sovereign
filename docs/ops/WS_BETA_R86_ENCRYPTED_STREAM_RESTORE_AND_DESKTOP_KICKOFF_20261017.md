# R86 — Conventional encrypted Postgres backup proof and desktop-first beta gate

**2026-10-17 · founder Mac Studio and read-only Minisforum inspection · actual beta HOLD**

## Founder decision — first beta is desktop-only

Initial Writer's Studio beta admission is **desktop-first** with Mac Safari
as the primary device. Do not hold the initial beta solely for physical
iPhone Safari Writer/Listen acceptance. Defer phone-specific writing,
recording and layout to a later release; ordinary login/invite/account
security remains a universal requirement.

## Exactly verified installed production situation (read-only)

The installed cron backup writer on the Minisforum is the 690-byte
`~/MAIA-SOVEREIGN/scripts/backup-postgres.sh`, SHA-256:
`f7288be2e117d63de82ade4b16628502303b4827c2732cdd5fc5c828526c78f9`.
This hash equals the source under the current Writer's Studio R85 tree.

Its actual code runs `docker exec maia-postgres pg_dump` into an
**unencrypted local `.sql` file**, then invokes `gzip`, then deletes
backups more than 30 days old. The installed cron invocation has no
additional age, GPG, or OpenSSL encryption action. The NAS mount
`/mnt/ds225` contains **28 `.sql.gz` archives**, and a recent one
is a 343.2 MiB gzip file. Gzip is compression, not data encryption.
Some historical `.gpg` archive files exist, but that does not
retroactively encrypt the current `.sql.gz` backup series.

The server's root disk is **93% occupied** (approx. 64 GiB available),
and swap had approx. **7.9/8.0 GiB used** at inspection. The current
root filesystem is an ext4 block mount without a visible LUKS/dm-crypt
device; this is not proof that every physical storage protection
is absent, but it does not independently establish encrypted
database/WAL/temp storage. One CIFS NAS mount is present.
The eight active user cron lines include two backup/monitoring jobs.
This review printed no production database record, key, password,
full cron command, manuscript, or archive contents. **Nothing was
written, deleted, migrated, stopped, restarted or mounted on the
Minisforum or NAS.**

**Immediate stop:** A real-member unpublished manuscript must not
enter this legacy backup system and be described as confidential.

## R86 replacement *primitive* — default OFF, fixture ONLY

The isolated R85-based worktree adds these test-only sources:

- `scripts/ops/wsBetaR86FixtureEncryptedPgDump.sh` is explicitly
  FICTIONAL ONLY. It refuses all requests except an isolated Docker
  source container named `ws-r86-src-<random>` and an exclusive
  0700 T7 fixture destination. It requires a 40-hex public recipient
  fingerprint and a GPG writer keyring that contains **no secret keys**.
  It streams custom-format PG dump directly to AES-256 GPG public-key
  encryption, writes only encrypted bytes to a 0600 pending artifact,
  and publishes atomically inside the exclusive test directory.
  An incomplete dump/encryption stream fails closed with partial
  cleanup. It does **not** run against `maia-postgres` or the NAS.
- `scripts/ops/wsBetaR86EncryptedRestorePG16.py` generates a separate
  temporary encryption-only RSA keypair, imports **only the public**
  part into the isolated backup writer, creates a fresh actual
  `postgres:16.13` container with no host binds and no network,
  and seeds two **fictional** rows. It proves encrypted backup
  digest and non-plaintext on disk, verifies the writer cannot
  decrypt, destroys the source container, starts a distinct
  independent PostgreSQL fixture, and streams decrypted output
  **directly** to `pg_restore` through a pipe. It verifies both
  fictional rows were recovered without writing plaintext SQL,
  then deletes the temporary private-keyring and both containers.
  Neither source nor restoration contacts production.

## Exact meaning of the accepted fixture evidence

On the isolated precommit R86 source, **23/23** checks passed, including
the default-off negative, malformed/no public recipient refusal,
two original fictional rows, public-only backup writer, ciphertext
digest verification, absence of readable SQL/gzip and original private
text in the archive, writer cannot decrypt, source fixture deletion
before restore, independent PG16 restore, original rows exactly
recovered, all test containers removed and ephemeral private
keyring destroyed. The fixture archive is approximately 1 KiB
because it contains only two made-up rows.

Evidence:
`/Volumes/T7 Shield/ws-beta-r86-encrypted-cold-restore-precommit-v4-20261017/R86_FICTIONAL_STREAMING_ENCRYPTED_COLD_RESTORE.json`.

The temporary restore key was independently separated from the
backup-writing keyring **on the same Mac**. This does NOT prove
independent offsite custody or a real-production cold restore.

No new production backup writer was installed, no cron job changed,
no old NAS copy was deleted and no real recipient was provisioned.
All past R85 strict Next build, manuscript-first Write, Import, Review,
Apply/Undo, Listen M4A and desktop WebKit tests remain unchanged.

## Practical operator-controlled cutover to qualify before real beta

1. **Independent encryption recipient.** Founder release operator
   approves a durable encryption public key whose private recovery
   key is held **off** the production server with protected separate
   access. Confirm the exact fingerprint on both sides and test
   intentionally denied decrypt without the private key. Fixture
   keys must not be reused for real backups.
2. **Stream encrypted DB output to recoverable storage.** Use a
   professionally reviewed production-specific writer derived from the
   R86 pattern, direct PG dump-to-encryption (no `.sql` tempfile),
   checksum/atomic archive publication, least-privilege permissions,
   logged failed-job alerts and tamper-evident retention. Avoid
   locally staging a large plaintext dump on an already 93%-full root
   disk. Explicitly authorize the installed cron change; no silent
   replacement or duplicate scheduled writer.
3. **Full source coverage.** Include actual vault originals,
   unclaimed/pending Source, current revisions, consent/approval
   receipts, protected proposal material, attachments, database WAL
   and deletion/anti-resurrection authority, with an application
   quiescence or documented consistent capture barrier. The R70.16B
   isolated review still lists outstanding Work-unclaimed and
   attachment coverage. An encrypted `pg_dump` **alone** is not a
   complete Writer's Studio backup.
4. **Independent restore.** On a separately trusted restoration
   environment with independent recovery key and current erasure
   fence, restore an encrypted production-equivalent database **and
   vault** without relying on the source machine. Verify login,
   original Source and Working Draft checksum, account separation,
   latest edit/Undo state and deletions not resurrected. Record the
   exact successful source/version and rollback receipt.
5. **Historic copies and disk pressure.** Inventory previously
   gzip-only NAS/local backups and governed retention/remediation
   before deleting or migrating a single archive. Prove new encrypted
   backups exist and restore first. Separately resolve available
   storage/swap headroom and check actual filesystem encryption.

## Tomorrow morning admission decision

**Safe desktop kickoff with fictional writing:** YES, conditional on
using a separate preview path/session which cannot access real member
records or represent an unfinished workflow as a real saved Work.

**Real unpublished manuscript, even for two writers:** NO GO until
the full conventional storage/backup/restore evidence, genuinely
consented provider processing, Mac Safari authenticated acceptance,
exact signed source/image deployment/rollback and founder-approved
notice and two exact member grants are all independently verified.
Never silently downgrade any already sovereign-key-protected Work.

The independent sovereign per-Work KMS is **not** required for the
initial standard beta, but genuine baseline confidentiality and
recoverability are nonnegotiable.

**Status: R86 fixture streaming encryption + separate fresh PG16
restore PASS; production encryption/cold/offsite recovery and member
admission HOLD.**
