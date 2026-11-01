# Writer original-file intake · AWS KMS ruling and lift runbook (2026-11-01)

```
RULING:    Founder, 2026-11-01: "Accept AWS KMS" as the key provider that wraps the
           per-file data keys for encrypted Writer originals.
STANDING:  Ruling recorded. Upload remains HELD at both layers. Nothing in this
           document lifts a hold, configures a key, or authorizes member data.
CODE:      canonical 3dd8dd287 (production). Source key authority:
           lib/manuscript/source/sourceKeyAuthority.ts
```

## 1. Why there was a question

Original-file upload (PDF, EPUB, Word) has been held since `3a7e3a0e3` (27 Oct), which made
originals land encrypted. Outside tests, the source key authority accepts only
`WRITER_SOURCE_KEY_PROVIDER=aws-kms`; the local key ring is refused in production
(`writer_source_local_key_provider_forbidden`). AWS KMS is a cloud service, and the project
vows self-hosting with no cloud lock-in, so using it needed a founder decision. The founder
accepted it.

## 2. What the ruling does and does not put in AWS (from the code)

- **Envelope encryption.** Each original is encrypted on minisforum with its own 256-bit data
  key. KMS only generates and later unwraps that data key (`GenerateDataKey`, `Decrypt`). The
  ciphertext and the plaintext stay on minisforum; AWS never receives manuscript bytes.
- **Content-free context.** Every KMS call carries the encryption context
  `soullab:domain = writer-source-v1` plus a SHA-256 binding hash. The code comment states,
  and the function enforces, that member IDs, Work IDs, filenames and prose never enter it,
  because CloudTrail records it.
- **What AWS learns:** that a data key was generated or unwrapped, when, and by which IAM
  principal. Call volume and timing are metadata about member activity.

## 3. Consequences the ruling accepts (growth-obligation answers)

- **New uncertainty: availability.** If the AWS account, key or credentials become
  unavailable, every stored original becomes unreadable until access returns. Pasted
  Working Drafts are not affected (they are not envelope-encrypted originals).
- **Provenance and ownership.** The key belongs to Soullab's own AWS account, in one region
  chosen by the founder; nobody else holds a grant on it. Deleting the key (after KMS's
  mandatory 7–30 day waiting period) makes every original encrypted under it permanently
  unrecoverable. That is a destructive act and must stay founder-only.
- **New responsibility.** Key policy, IAM credentials, rotation, CloudTrail review and cost
  are now an operated dependency. `permanentErasureCertified` stays `false`: per-file
  erasure by retiring envelopes is built, but it is not certified, and key-level erasure is
  not a member-facing control.

## 4. What lifting intake still requires, in order

Each step needs the one before it.

1. **Founder: provision AWS (only the founder does this; credentials never pass through a
   session).**
   - A symmetric KMS key (`SYMMETRIC_DEFAULT`, Encrypt/Decrypt, single region), with an alias
     such as `alias/soullab-writer-source`.
   - An IAM principal used only by minisforum, allowed exactly `kms:GenerateDataKey` and
     `kms:Decrypt` on that key ARN, with the condition
     `kms:EncryptionContext:soullab:domain = writer-source-v1`. It gets no other AWS
     permission.
   - CloudTrail on for the key.
2. **Founder: put the configuration on minisforum.** Non-secret values go in
   `~/MAIA-SOVEREIGN/.env.production` (the `maia` service's `env_file`):
   `WRITER_SOURCE_KEY_PROVIDER=aws-kms`, `WRITER_SOURCE_KMS_KEY_ARN=<key ARN>`,
   `WRITER_SOURCE_KMS_REGION=<region>`. For the credential, the house precedent is the SMTP
   password: an owner-only file mounted into the container, never an environment value. The
   AWS SDK reads a credentials file through `AWS_SHARED_CREDENTIALS_FILE`, but mounting it
   needs a reviewed `docker-compose.production.yml` change. That change is not made here.
   - ⚠️ Recreating `maia` by hand to pick up new values bypasses the deploy lane (the
     2026-09-07 finding). Take the values through the next lane deploy instead.
3. **Acceptance run on fake data.** Encrypted intake has to be exercised end to end against
   a disposable, production-shaped setup (database, vault, real KMS key, fictional
   manuscripts), including upload, reopen, discard and Delete Work. The prepared harness is on
   local commit `4b33659d2`, which is not on canonical and whose record says it is not
   authorized for member data. Reconciling that harness onto canonical and running it is
   its own act.
4. **Release in source.** `lib/writersStudio/releaseAuthority.ts` gets a new `manifestId` and
   `sourceIntakeReleased: true`. That needs a reviewed PR, a deploy, and acceptance of that
   exact image. The file's own rule: no flag, header or environment variable can release
   intake.
5. **Remove the edge holds on minisforum.**
   - `WS-R20-AB-01` (`@r20_temporary_original_manuscript_post_hold`, 423 on
     `POST /api/sovereign/manuscripts/ingest`).
   - `SOURCE-CUSTODY-EDGE-01` (`@source_write_pre_migration_hold` on the sources and workbench
     upload paths). Its pre-migration reason may be spent, since the source migrations were
     applied on 30 Oct.

   Back up the Caddyfile first, then reload Caddy.
6. **Production witness.** One fictional upload by a test member, then reopen, discard and
   erase. Confirm a KMS `GenerateDataKey`/`Decrypt` pair in CloudTrail carrying only the
   content-free context, and run the Co-Lab gate with 0 failed.

## 5. Production state read for this runbook (2026-11-01, read-only)

- Migrations `20261026000001_writer_source_encrypted_landing.sql` and
  `20261027000001_writer_source_legacy_retirement.sql` were applied on 2026-10-30.
  `writer_source_landing_intents` has 0 rows.
- No `WRITER_SOURCE_*` or `AWS_*` variable is in `.env.production` or the running
  `maia-sovereign` container. With the holds lifted today, uploads would fail with
  `writer_source_key_provider_missing`.
- Both Caddy holds are present. Both were already in the backup named
  `Caddyfile.PRE-UPLOAD-HOLD-LIFT.20261029T175514Z`, so the 29 Oct "lift" removed neither.

⛔ Not authorized by this document: lifting either hold, changing `releaseAuthority.ts`,
editing compose or Caddy, creating AWS resources, or admitting member originals.
