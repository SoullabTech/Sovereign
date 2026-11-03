# Writer original-file intake · KMS acceptance plan · APPENDIX (2026-11-02)

```
STANDING:  Mechanically rendered from the lane's workflow result (wf_022c7198-7ea). Nothing here lifts a hold,
           configures a key, or authorizes member data. Companion to the main record:
           docs/programme/WRITER_SOURCE_INTAKE_ACCEPTANCE_PLAN_2026-11-02.md
BASE:      canonical c051385b (read-only)
```

**How to read this appendix.** The obligation text below is *as synthesized*. Two independent checks ran after synthesis: a claim-verification pass (two lenses per claim) and a completeness critic. Where either contradicted an obligation, the contradiction is attached to that obligation as an **AMENDMENT**, and the amendment governs. Part B lists every verified claim in its corrected form. Execute in `dependsOn` order, **not** number order: the WSI numbers are lifecycle presentation order.

**Counts.** 47 synthesized obligations (WSI-xx) + 51 gap-fill obligations (FILL-xx) = 98. None is covered *fully* today (46 none, 52 partial). 30 need no real KMS; 68 do.

---

## Part A · Obligations

### A.1 · Synthesized set (WSI-01 … WSI-47)

### WSI-01 · Test subject identity: real image, real provider, production-shaped schema
category `setup-truth` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Evidence counts only for the image, provider, key and schema it names; a run that never called real KMS or ran on a stub schema proves nothing about either.
- **Procedure.** Record image id and GIT_COMMIT. Build the DB from baseline plus all migrations on pgvector pg16 and diff touched tables and triggers against production. After the run list key_provider, key_wrap_algorithm and key_id of every intent; compare the count with CloudTrail.
- **Pass criteria.** Every intent is aws-kms / aws-kms-generate-data-key-v1 with the configured key ARN; zero local-test rows; schema diff empty on touched tables; image id is the one step 4 deploys, or the founder records that evidence transfers by SHA only.
- **Defeat candidate.** Reusing ws-encrypted-source-pg16.sh: it hard-sets local-test, a hand-built stub schema and three migrations, so every test is green with zero KMS calls.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts`, `scripts/witness/ws-encrypted-source-pg16.sh`, `lib/manuscript/source/__tests__/sourceKeyAuthority.test.ts`
- **Coverage note.** PG16 evidence pins local-test on a stub schema (test:75-79; script:63-158). aws-kms appears only in 3 fake-client tests.
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-01 passCriteria: 'or the founder records that evidence transfers by SHA only' — releaseAuthority.ts:12-20 says old test evidence does not transfer, and WSI-47 requires identical image id. A flag-true candidate cannot equal the post-merge image, so the waiver contradicts the code's rule; require deploying the tested SHA or state the plan cannot satisfy exact-image acceptance.

### WSI-02 · Key identity, region and alias binding
category `key-config` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** One symmetric single-region customer-owned key; each envelope records the full key ARN; a wrong region, alias or foreign ARN fails closed and a key change cannot strand older files.
- **Procedure.** Export describe-key, key policy, grants, rotation status (account ids redacted). Upload; compare stored key_id with the Arn. Vary one value at a time: other region, empty WRITER_SOURCE_KMS_REGION, alias, foreign or deleted ARN; then change region or ARN after a file landed and reopen it.
- **Pass criteria.** Key is SYMMETRIC_DEFAULT, single-region, Enabled, 0 grants, policy names only root and the principal; key_id is the ARN, not an alias; each misconfiguration leaves no vault file and the intent at most PENDING_BYTES; old files still decrypt via their stored ARN.
- **Defeat candidate.** Whole run on a different, permissive test key than production will use; Decrypt using the env ARN so old files break after a key change; a region typo hidden by an exported AWS_REGION.
- **Covered by.** `lib/manuscript/source/__tests__/sourceKeyAuthority.test.ts`
- **Coverage note.** Fake-client tests cover a Decrypt KeyId mismatch and a missing ARN only. Region, alias and real KMS rejection are untested.
- **Depends on.** WSI-01

### WSI-03 · Credential identity: only the mounted least-privilege file works
category `credentials` · real KMS **yes** · real vault **no** · browser **no** · covered today **none**

- **Law.** In production only the mounted owner-only credential file may work; no env key, profile, SSO or instance role may rescue the run.
- **Procedure.** In the real container list env var NAMES of every service: none of AWS_ACCESS_KEY_ID, SECRET, SESSION_TOKEN, PROFILE, ENDPOINT_URL*. ls -ln the mount as the container user. Run a fictional-context GenerateDataKey+Decrypt canary; rerun with the file emptied and metadata unreachable. Read CloudTrail userIdentity.
- **Pass criteria.** Canary succeeds; every event shows the file's access key id and minisforum's source IP; file is 0600 and readable by the container user; the emptied-file run fails with a credentials error inside a stated bound and writes no event.
- **Defeat candidate.** Run is green on a developer SSO or admin profile, keys placed in .env.production (reaches all 14 env_file services), or an instance role; production later has none of them.
- **Coverage note.** Compose has no AWS credential path; only the SMTP bind exists (docker-compose.production.yml:207-214). AWS_SHARED_CREDENTIALS_FILE appears only in the runbook.
- **Depends on.** WSI-01
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-03 passCriteria 'minisforum's source IP' vs harness isolation plan — The harness plan separates the run from production Postgres and Caddy unless the founder rules otherwise. Both cannot hold: either the run is on minisforum (shared-host risk) or source IP, egress and uid evidence are not from the real host.

### WSI-04 · IAM and key policy: least privilege shown by denials
category `iam` · real KMS **yes** · real vault **no** · browser **no** · covered today **none**

- **Law.** Least privilege is a property of AWS, so it is shown by observed denials: only GenerateDataKey and Decrypt on the one key with the soullab:domain context.
- **Procedure.** With the restricted principal call both allowed actions with the code's two-key context; then expect AccessDenied for no context, wrong domain, another key, Encrypt, ReEncrypt, CreateGrant, DisableKey, ScheduleKeyDeletion, PutKeyPolicy. Destructive probes on a twin key only. Hash the policy JSON.
- **Pass criteria.** Both allowed calls succeed; every listed call is AccessDenied with errorCode recorded; right domain with a different context sha is reported as ALLOWED because the policy binds domain only (runbook:55-58), as a finding, not hidden.
- **Defeat candidate.** Policy using StringEqualsIfExists, no condition, or kms:* on Resource *: the happy-path upload passes and only the no-context and wrong-domain probes reveal it.
- **Coverage note.** Runbook condition key matches the code's key and value, but no test calls IAM; sourceKeyAuthority.test.ts injects a fake client.
- **Depends on.** WSI-03

### WSI-05 · In-container KMS canary and config-ordering matrix
category `preflight` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Misconfiguration is found by a witness before the first member upload; nothing checks KMS config at boot, so the first upload would otherwise be the first KMS call.
- **Procedure.** Author a scripts/ tsx canary (tests are not in the image): generate then unwrap a synthetic hash, print only the SDK error name. docker exec it in maia under both holds. Repeat with provider, ARN, region and credential file each removed. Then run code/env/mount ordering cells on a flag-true harness image.
- **Pass criteria.** Baseline: bytes equal, exit 0, CloudTrail 1 GenerateDataKey + 1 Decrypt, no DB row or file. Each removal exits non-zero with a distinct bounded token. No ordering cell returns 200 without an aws-kms row; /api/health and paste-text Create Work keep working.
- **Defeat candidate.** A canary that checks env presence only, runs outside the container, or swallows the SDK error; or a NODE_ENV=test + local-test harness that never reaches writer_source_key_provider_missing.
- **Covered by.** `lib/manuscript/source/__tests__/sourceKeyAuthority.test.ts`
- **Coverage note.** Only missing-ARN fail-closed with a fake client (test:121-126). No test for missing provider, bad region or credentials; no canary script exists.
- **Depends on.** WSI-03

### WSI-06 · Every accepted format lands as ciphertext and decrypts byte-identical
category `upload` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Each of docx, pdf, epub, md and txt lands only as ciphertext in the vault and is recoverable byte-for-byte with the real key; no format path bypasses landing.
- **Procedure.** Generate one fictional canary file per format (the repo has no PDF or EPUB fixture). POST each to the flag-true harness route with its own UUID key. Decrypt in-container through real KMS, compare SHA-256 with the fixture, and grep the vault for the canary.
- **Pass criteria.** 5 of 5 return 200 with the right format and reach ARRIVAL_RECORDED; vault files contain no canary; decrypted SHA-256 equals each fixture; each intent has its own wrapped_dek and a key_id equal to the key ARN.
- **Defeat candidate.** Landing that writes plaintext into a .source.enc name, or md/txt read client-side so no bytes arrive; both still return 200 with correct text and pass a response-only check.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t1)`, `lib/manuscript/source/__tests__/sourceEnvelope.test.ts`, `lib/manuscript/ingest/__tests__/parseUpload.test.ts`
- **Coverage note.** t1 uses local-test on one fixture; parseUpload tests are parse-only. No PDF/EPUB through landing; no format through the route with intake released.
- **Depends on.** WSI-01, WSI-05

### WSI-07 · No plaintext original anywhere on the host
category `confidentiality` · real KMS **no** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Only ciphertext of the original reaches disk: not the vault, temp, a container layer or the workbench volume.
- **Procedure.** Upload fictional files per format carrying an uncompressed binary marker and canary prose. Scan the vault tree incl. dotfiles, /tmp, docker diff, workbench_data and intent columns for marker, canary, PK/%PDF magic and original SHA-256. First plant a plaintext copy to prove the scanner fires.
- **Pass criteria.** Planted copy is caught; no stored file equals an original or starts with a format magic; ciphertext length equals original length; the canary appears only in the extracted-text and filename columns named in advance.
- **Defeat candidate.** Multipart or parser spools the upload to /tmp; bytes written plain then encrypted over; a staged .pending file holds plaintext; the original is also saved by another door.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t1)`
- **Coverage note.** t1 asserts a ciphertext-only vault under local-test. No temp-dir, docker-diff or DB-wide scan, and no planted-positive control.
- **Depends on.** WSI-06

### WSI-08 · Per-file envelope and context binding enforced by real KMS; tamper refused
category `confidentiality` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Each file has its own data key and a wrap bound to its own context; one file's wrapped key cannot open another file, and altered ciphertext or envelope is refused.
- **Procedure.** Upload identical bytes under two keys; compare wrapped_dek, iv, tag, ciphertext SHA, path. Ask real KMS to Decrypt A's wrapped_dek with B's context hash and with one hex digit flipped. In a disposable DB swap envelope columns between rows. Flip a ciphertext byte; truncate and delete a file.
- **Pass criteria.** All envelope values differ; both cross-context Decrypts are refused by KMS; a swapped row never returns another file's bytes; tampered, truncated and deleted files are refused and never deleted by the retry.
- **Defeat candidate.** Global or reused data key, reused IV or a constant context: file A opens with B's wrap, or the cross-context Decrypt succeeds.
- **Covered by.** `lib/manuscript/source/__tests__/sourceEnvelope.test.ts`, `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t6, t8, t10)`
- **Coverage note.** Context-move and tamper refusals use the local KEK. KMS-side binding, deleted or truncated encrypted files and edited envelope columns are untested.
- **Depends on.** WSI-06

### WSI-09 · Size boundary: 25 MiB accepted, one byte over refused before any write
category `upload` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** Exactly 26214400 bytes lands whole; one byte more, an empty file and an over-cap extraction are refused with the true reason before any intent, ciphertext or KMS call.
- **Procedure.** Fictional docx and pdf padded to 26214400 and 26214401 bytes (text under 2,000,000 chars), a 0-byte file, and a .txt of 2,000,001 chars. POST each; use the Import room for the +1 file. Count intents, vault files and KMS events; time the at-limit upload.
- **Pass criteria.** At-limit: 200, decrypts identical, inside the 120 s route budget. +1: 413 and the room refuses before sending. Empty: 400. Over-text: 413. Every refusal leaves zero intents, zero vault files, zero KMS events.
- **Defeat candidate.** Testing only a 30 MB file or only the client check misses an off-by-one, or a 413 issued after formData() already buffered the whole body in memory.
- **Coverage note.** No test for 25 MiB, 413 or the 2,000,000-char cap through the route. Edge (Caddy) body limits are not in the repo.
- **Depends on.** WSI-06

### WSI-10 · Unreadable, protected or hostile files refused before custody
category `upload` · real KMS **no** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A file that cannot be read is refused before any intent, ciphertext or KMS call, in words that do not claim anything was preserved.
- **Procedure.** Fictional fixtures: truncated docx zip, corrupt PDF header, bad-zip EPUB, DRM EPUB, password-protected PDF and docx, zip renamed .pdf, .exe renamed .docx, high-ratio zip docx. POST each; record status, body text, intent rows, vault listing, KMS events.
- **Pass criteria.** Each gives 413, 415 or 422 with zero intents, zero vault objects and zero KMS events; no body says 'preserved' or 'retry the same file'; DRM names protection; password cases record their observed text for a founder wording decision.
- **Defeat candidate.** Moving parseUpload after beginEncryptedLanding: the 422 still appears but leaves an orphan PENDING_BYTES intent; a status-code-only check passes it.
- **Covered by.** `lib/manuscript/ingest/__tests__/parseUpload.test.ts (DRM EPUB refusal, unsupported type)`
- **Coverage note.** Parse-level only. No corrupt or password-protected PDF/docx case, and no zero-rows-left-behind check through the route.
- **Depends on.** WSI-06
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-10 passCriteria 'each gives 413, 415 or 422' — ingest/route.ts shows other outcomes: formData failure gives 400 (:319-329), an outer-catch failure gives 500 (:433-435). A status-class check will misgrade; define the allowed status per fixture and test the zero-intent property separately.

### WSI-11 · Textless files are refused before custody (expected RED today)
category `upload` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** A file that yields no text is refused honestly before any key is spent or byte stored, and never leaves a retry that cannot succeed.
- **Procedure.** Upload a scanned PDF (canary only in pixels), an image-only docx, an EPUB with an empty spine and a whitespace-only .txt. Record status, member-visible message, retryable flag, GenerateDataKey events, intent state and vault file; resend the same key once.
- **Pass criteria.** Each gets a non-retryable 4xx with the room's no-editable-text message, zero GenerateDataKey events, zero intents and files. Expected RED: commit refuses empty text only after bytes are encrypted, written and verified.
- **Defeat candidate.** Current path: parse succeeds with a warning, custody completes, commit refuses, the member sees a retryable 503 that can never succeed and a BYTES_VERIFIED orphan stays; a 'not 200' assertion passes it.
- **Covered by.** `lib/manuscript/ingest/__tests__/parseUpload.test.ts (scanned-PDF warning, parse-only)`
- **Coverage note.** Route and landing behaviour for empty text is untested. The route has no empty-text check (ingest/route.ts:345-366).
- **Depends on.** WSI-06, WSI-20

### WSI-12 · Retry and concurrency never mint a second envelope
category `idempotency` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** One member-bound upload key yields exactly one intent, one arrival and one ciphertext however many identical requests arrive or responses are lost.
- **Procedure.** Over HTTP on the flag-true image: resend same key and bytes after 200; send 5-8 identical requests in parallel; kill the client after commit and resend; repeat 10 times. Count intents, arrivals, vault files; compare envelope columns; reconcile CloudTrail GenerateDataKey count with stored wrapped_dek.
- **Pass criteria.** Counts stay 1/1/1 with byte-identical envelope columns; every 200 carries the same sourceArrivalId; any 503 is followed by a retry returning that id; extra GenerateDataKey events equal the prepare_race losers.
- **Defeat candidate.** Server mints an intent per request, or a prepare_race loser overwrites the winner's envelope; local-test returns instantly and never opens the race window.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t1-t5)`, `lib/manuscript/source/__tests__/uniqueArrivalStorage.test.ts (mocked)`
- **Coverage note.** Sequential replay and resume are real PG16. Parallel same-key requests are modelled, not witnessed; lost-response replay through the route is untested.
- **Depends on.** WSI-06
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-12 passCriteria 'any 503 is followed by a retry returning that id' — C12 refutation: ten 'return loadRecordedArrival(...)' lines lack await inside the try, so a DB error there bypasses the wrapper and returns a generic 500 'No manuscript was created' though the arrival exists. The criterion has no place for a 500 on replay.
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-31 procedure 'copy the vault' and 'restore-governed.sh'; coveredToday 'real PG16' in WSI-12/19/22/25/29 — No repo vault backup exists and restore-governed.sh does not mention the vault. The PG16 harness is a stub schema with 3 migrations, local-test and mocked R20. Treat these as 'none' for production-shape claims; (c) does not show ciphertext cannot return.

### WSI-13 · A key reused with different bytes is refused without a retry loop
category `idempotency` · real KMS **no** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A retry key can only ever mean the same file: reuse with different bytes is refused with no state change and the member is not told to retry.
- **Procedure.** Upload A with key K. Send A2 (same length and format, different bytes) with K. Send A under another filename with K. Snapshot the intent row before and after each; capture status and body. Also send missing and malformed idempotency headers.
- **Pass criteria.** A2: non-retryable refusal that says the file differs, intent row identical, no new ciphertext (expected RED today: retryable 503). Renamed A: same arrival id, recorded filename is the first request's. Missing or malformed header: 400.
- **Defeat candidate.** The wrapper turns source_landing_idempotency_conflict into the retryable 'record was preserved' 503; a row-unchanged check passes while the client loops forever.
- **Coverage note.** The conflict throw exists (encryptedLanding.ts:247-251) but no test covers it; filename and MIME are not compared on replay; route 400 on a bad header is untested.
- **Depends on.** WSI-12

### WSI-14 · Two tabs uploading the same file are two acts that never touch each other
category `idempotency` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Each Work claims its own arrival; nothing in one tab's lifecycle (claim, discard, delete) reaches the other tab's original.
- **Procedure.** One test member, two tabs, same fixture. Upload in both, Create Work in A only, then B; Delete Work A; run verifyCustody on B; compare CloudTrail context-sha256 for A and B. Also reload the page mid-flow and re-upload, and count the orphan.
- **Pass criteria.** Two intents with distinct keys, wrapped DEKs and context hashes; distinct claimed arrivals; after Delete Work A, B's ciphertext exists and verifyCustody returns artifact_recovered; the reload orphan is counted and routed to WSI-20.
- **Defeat candidate.** Dedupe by plaintext hash that points both Works at one arrival: Delete Work A then destroys B's original; passes if the check stops before deleting.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t6)`
- **Coverage note.** Identical bytes under distinct keys get distinct paths. No browser, claim or cross-delete test for sibling uploads.
- **Depends on.** WSI-06, WSI-22

### WSI-15 · Process kill at each landing boundary, plus the link/unlink wedge
category `crash-recovery` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A killed process leaves only states a same-key retry can finish or refuse; never a second copy, an overwrite, or an accepted corrupt file.
- **Procedure.** Stall each step (harness table lock or SIGSTOP at a DB-observed state), then SIGKILL the container: after GenerateDataKey, around the WRITING_BYTES write, after link() before unlink(), after durable write, in BYTES_VERIFIED. Hand-create an nlink-2 final and a flipped-byte final. Restart and resend; repeat past the 10-minute lease.
- **Pass criteria.** Windows end with 1 arrival, 1 file, recovered SHA equal to the original, no .pending, no plaintext; the flipped file never yields 200 and is never deleted; the nlink-2 wedge is recorded as FAIL with a documented operator step that then lets the retry succeed.
- **Defeat candidate.** Retry accepts EEXIST without authenticating the file, overwrites the final, or mints a second intent; function-level 'crashes' (t2-t5) can never leave a .pending file or an nlink-2 object.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t2-t5)`, `lib/storage/__tests__/durableFileVault.test.ts`
- **Coverage note.** Crashes are simulated by calling step functions under local-test. No process kill, no stranded .pending or nlink-2 case, no failure inside the arrival-commit transaction.
- **Depends on.** WSI-12

### WSI-16 · KMS and credential faults at upload fail closed, bounded and without false claims
category `fault-handling` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A KMS or credential fault fails closed within a bound, lands no readable bytes, makes no false 'record preserved' claim, and a same-key retry after repair converges to one arrival.
- **Procedure.** One at a time: IAM deny of GenerateDataKey, disabled twin key, wrong region, blocked egress, absent / empty / chmod 000 credential file, unset provider, and an explicit IAM deny after the DEK is wrapped. Record status, latency, intent state, vault listing, app log, CloudTrail errorCode; clear the fault and retry.
- **Pass criteria.** Never 200 while faulted; generate faults leave PENDING_BYTES, no wrapped_dek, no file, zero fixture bytes on disk; latency under 120 s; after repair exactly one arrival; a missing credential file fails container create loudly; unattributable causes are listed as findings.
- **Defeat candidate.** A fake client rejecting instantly cannot show credential-chain delay, metadata probing or timeouts; a silent fallback to local-test or an unencrypted write would pass a response-only check.
- **Coverage note.** No test makes KMSClient.send reject; the route's 503 branch (ingest/route.ts:389-406) is unasserted; SDK default timeouts are unread (no node_modules).
- **Depends on.** WSI-05, WSI-12

### WSI-17 · Reopen, defined two ways, witnessed from a cold process
category `reopen` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Both senses of reopen are tested: the Work opens from the database without KMS, and the original is recoverable through KMS from a fresh process; no route serves original bytes.
- **Procedure.** After Create Work: sign out, clear cookies, sign in, open the Work and read sections. Recreate maia. In a new process with a fresh client and only region plus credentials, run verifyCustody on all five formats and hash recovered bytes. Probe ingest and sources/file for any original-bytes response.
- **Pass criteria.** Sections equal the confirmed set; source_custody = source_custodied; recovered SHA-256 equals the original for every format with a Decrypt event at that moment; works with provider and ARN env unset or the dependency is recorded; no route returns original bytes (recorded finding).
- **Defeat candidate.** Reopen checked in the creating process with a cached client, or by re-reading extracted text from the DB or using the local-test KEK; it passes without touching ciphertext or KMS.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t1, t7, t12)`
- **Coverage note.** In-process and local-test only. No fresh process, real KMS or HTTP reopen. No route reopens an original; verifyCustody has no non-test caller.
- **Depends on.** WSI-22
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-17 coveredToday: 'verifyCustody has no non-test caller; no route reopens an original' — scripts/verify-ws01-source-custody.ts is a non-test caller. 'No route returns an original' holds for manuscript_source_arrivals only; member-auth GET app/api/writers-studio/sources/[id]/file/route.ts returns plaintext workbench originals (C09 refutation).

### WSI-18 · Reopen with KMS unavailable: unreadable, never lost, fully recoverable
category `reopen` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A key outage makes originals unreadable, not lost: the Work still opens, custody verification fails closed with a distinguishable reason, and everything recovers when KMS returns.
- **Procedure.** On a throwaway key with the production policy: land and claim a file; DisableKey; open the Work, run verifyCustody, try a new upload; EnableKey and repeat. Then ScheduleKeyDeletion and CancelKeyDeletion (key returns Disabled). Repeat with egress blackholed.
- **Pass criteria.** While disabled: the Work opens with zero KMS calls; verifyCustody custodied false; a new upload gives 503 with no ciphertext; after restore the old file's hash matches and a stuck upload completes. Zero events name the production ARN; the deletion window never elapses.
- **Defeat candidate.** A fake client raising DisabledException does not prove the real state machine; verifyCustody's catch-all reports artifact_missing, so an outage reads as a missing file.
- **Covered by.** `lib/manuscript/source/__tests__/sourceKeyAuthority.test.ts`
- **Coverage note.** Only a Decrypt KeyId mismatch is tested, with a fake client. verifyCustody maps any failure to artifact_missing (arrivals.ts:259-263).
- **Depends on.** WSI-17

### WSI-19 · Discard of an unclaimed arrival removes everything and needs no AWS
category `discard` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Discard destroys the ciphertext, wrapped key, stored text and arrival, leaves content-free tombstones, and does not depend on KMS being reachable.
- **Procedure.** After a 200 upload with no Work, run discardUnclaimedArrival in the app container (no route calls it) against the full schema, real R20 ledger and real vault, with AWS credentials removed. Inspect rows, file, queue, tombstones; try re-insert and claimArrival on the old id.
- **Pass criteria.** Arrival and landing rows gone; ciphertext ENOENT with no .pending residue; no queue row left; R20 sealed; re-insert refused by tombstone; claimArrival returns false; zero KMS events during the call.
- **Defeat candidate.** Discard that deletes the arrival but leaves the intent's ciphertext or queue obligation, or unwraps the key first; mocked-ledger unit tests pass it.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t11)`, `lib/manuscript/source/__tests__/discardUnclaimedArrival.test.ts`
- **Coverage note.** t11 uses a hand-built schema, mocked R20 ledger and local-test; the other file uses a fake transaction. discardUnclaimedArrival has no non-test caller.
- **Depends on.** WSI-06

### WSI-20 · Everything held for a member is removable (expected RED today)
category `discard` · real KMS **no** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** Every byte the system holds for a member, stranded intents and unclaimed arrivals included, can be removed by the member's own act or a deployed bounded sweep; an uncalled function is not a kept promise.
- **Procedure.** Create intents in PENDING_BYTES, WRITING_BYTES, BYTES_VERIFIED, a scanned-PDF BYTES_VERIFIED, an unclaimed ARRIVAL_RECORDED and a reload orphan. Try every shipped control (discard, Delete Work, account deletion) and scheduled job; count residue by state with SQL, files and queue rows.
- **Pass criteria.** Residue is zero, or each class is listed with count, owner, a member-visible sentence and a founder-accepted declared state. Expected RED: no door or reaper reaches non-recorded intents. Zero counts only if all six classes were created.
- **Defeat candidate.** Calling discardUnclaimedArrival directly and reporting PASS, or exercising only the ARRIVAL_RECORDED happy path, so discard and Delete Work look complete.
- **Covered by.** `lib/manuscript/source/__tests__/discardUnclaimedArrival.test.ts`, `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t11)`
- **Coverage note.** Discard of a recorded arrival is covered. Incomplete intents have no test; inspectMemberIncompleteLandings has no caller; the 24-hour sweep in migration 20261022000002 is not implemented.
- **Depends on.** WSI-15, WSI-19
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-20, WSI-24, WSI-26 passCriteria 'founder-accepted declared state' — This turns an unmet vow-level property (a member's held data has no removal door; unclaimed arrival keeps plaintext extraction indefinitely) into a PASS. It should be reported as ACCEPTED GAP, never as PASS, and never silently satisfy the 'no stealth memory' vow.
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-20 expected-RED text and hazard 'reachable by no door' for PENDING/WRITING/BYTES_VERIFIED intents — Claim verification (C17) shows a same-key retry through ingest re-drives these intents to ARRIVAL_RECORDED. Accurate: no removal, inspection or expiry door exists; retry can only advance, and a reloaded page mints a new UUID that strands the first.

### WSI-21 · End-of-run census finds no stranded intent, arrival, pending file or hardlink
category `census` · real KMS **no** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Every wrapped DEK and ciphertext the run created is reachable by a door, or is listed with an operator clearing procedure that was executed.
- **Procedure.** SQL census of intents by state and age and arrivals with manuscript_id NULL. Vault census of manuscript-sources for .pending files, nlink>1 entries and files with no intent row. Include leftovers from every fault, crash, empty-text and same-key-different-bytes case.
- **Pass criteria.** Census is 0 after documented clearing; every non-zero item has a named procedure that was executed; empty-text and KMS-failed-claim leftovers are cleared or recorded as open gaps with counts.
- **Defeat candidate.** Counting only ARRIVAL_RECORDED intents: PENDING, WRITING and BYTES_VERIFIED rows and their ciphertext stay invisible, so the census reads clean.
- **Coverage note.** inspectMemberIncompleteLandings has no caller; Delete Work selects only arrival-bound landings (eraseManuscript.ts:112-127); no reaper exists.
- **Depends on.** WSI-15, WSI-16, WSI-20

### WSI-22 · Claim then confirm sections: label, binding and screen agree
category `claim` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Create Work binds exactly the arrival that member uploaded, and the Work's custody label, the arrival binding and what the screen says about the original agree.
- **Procedure.** Upload a fictional 5-section docx, confirm 3 sections, rename the title, Create Work. Query member_manuscripts.source_custody, arrival.manuscript_id, arrival.source_text and sections; capture the post-save screen; run verifyCustody. Try claiming as another member and onto another member's Work.
- **Pass criteria.** Exactly the 3 confirmed sections; source_custody = source_custodied; arrival.manuscript_id = Work id; the arrival keeps the full extraction and the ciphertext and the screen does not claim otherwise; foreign claims return false; verifyCustody passes.
- **Defeat candidate.** Storing only the confirmed sections as Source, or setting source_custodied without binding the arrival; label and screen still look right.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t7, t10)`, `lib/manuscript/source/__tests__/claimArrivalOwnershipR12.test.ts (mock tx)`, `app/writers-studio/__tests__/p4r1IntegratedImport.interaction.test.ts (mock fetch)`
- **Coverage note.** Real-DB claim uses local-test; save-route tests mock claimArrival. Claim performs a KMS Decrypt inside the transaction.
- **Depends on.** WSI-06

### WSI-23 · Create Work double-click and lost response make one Work
category `claim` · real KMS **no** · real vault **no** · browser **yes** · covered today **partial**

- **Law.** One confirm act creates one Work; a retry after a lost response must not create a second Work or one labelled as lacking its original.
- **Procedure.** In a browser click Create Work twice rapidly; separately drop the POST response after the server commits and click again; reload and retry. Count member_manuscripts rows, source_custody labels and claimed arrivals.
- **Pass criteria.** Each case yields one Work, source_custodied, one claimed arrival. If a second Work appears it is shown to the member as a second Work and is not labelled legacy_interpreted_import while the screen says the original is held.
- **Defeat candidate.** Client refs stop the double click but not a lost response; the retry saves a second Work whose claim fails (arrival already bound). Mocked-fetch tests pass it.
- **Covered by.** `app/writers-studio/__tests__/p4r1IntegratedImport.interaction.test.ts`
- **Coverage note.** Client-side guards only, with a mocked apiFetch. The save route carries no idempotency key (manuscripts/route.ts:430-479).
- **Depends on.** WSI-22

### WSI-24 · Claim failure is told truthfully and has a member door (expected RED on copy)
category `claim` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** When the Work is saved but the original could not be claimed, nothing says the original is held as Source, and the stranded arrival has a member-reachable door.
- **Procedure.** Upload, disable the twin key, then Create Work from the Import room. Read the 201 sourceCustody and the on-screen text. Re-enable the key and look for any member action that retries the claim or discards the arrival. Also blackhole Decrypt and time the row locks.
- **Pass criteria.** Work saved; sourceCustody is legacy_interpreted_import; the screen makes no 'held as Source' claim; a member-reachable retry or discard exists, or the gap is a recorded founder-accepted state; a blackholed Decrypt releases locks within a stated bound.
- **Defeat candidate.** The route swallows the claim failure and returns 201, the room ignores sourceCustody and says the original 'remains separately held as Source', the arrival stays unclaimed and Delete Work never reaches it.
- **Covered by.** `lib/writersStudio/__tests__/manuscriptImportWork.test.ts (paste-path failure, mocked claimArrival)`
- **Coverage note.** A KMS error inside claimArrival is untested; no test asserts sourceCustody or the custody copy after a claim failure.
- **Depends on.** WSI-22, WSI-20
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-20, WSI-24, WSI-26 passCriteria 'founder-accepted declared state' — This turns an unmet vow-level property (a member's held data has no removal door; unclaimed arrival keeps plaintext extraction indefinitely) into a PASS. It should be reported as ACCEPTED GAP, never as PASS, and never silently satisfy the 'no stealth memory' vow.
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-24 procedure and defeat candidate (claim failure equals a thrown KMS error) — C18: claimArrival returning false logs nothing and also yields 201 legacy_interpreted_import; only a throw hits console.error. The false branches (already claimed, hash mismatch, destination gone, lost-response retry) are not exercised by disabling the key.

### WSI-25 · Delete Work leaves nothing reachable for the Work and touches nothing else
category `erasure` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** After Delete Work no row, ciphertext file, wrapped key, extracted text or queue obligation remains for that Work, the word 'gone' is used only when bytes are physically gone, and nothing belonging to others changes.
- **Procedure.** Seed a claimed Work, a bystander member's identical file and an unclaimed arrival of the same member. Delete via the UI with the real R20 ledger and production mounts. From the host record vault ls -li before and after; query every table by Work, arrival and intent id; list .pending; read manifest and tombstones; re-insert erased ids; decrypt the bystander.
- **Pass criteria.** 200 {removed:true}, not custody_incomplete; Work, arrival, landing row (wrapped_dek) and queue row absent; ciphertext ENOENT on the host; recoverySealed true; erased ids refused by real triggers; manifest holds no prose or filename; bystander intact; the unclaimed arrival is documented as a survivor.
- **Defeat candidate.** An empty queue and 200 while a worker without the mount deleted the row and ciphertext survives; a stub schema with a no-op editorial erase; a mocked ledger hiding custody_incomplete.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t9)`, `scripts/witness/ws-delete-01-erasure-witness-r20.ts`, `lib/manuscript/source/__tests__/vaultErasureFunctionalR105.test.ts`
- **Coverage note.** t9 mocks the R20 ledger and stubs editorial erase; the R20 witness uses a plaintext-style arrival; no jest test drives the DELETE route.
- **Depends on.** WSI-01, WSI-22

### WSI-26 · Delete Work reaches every copy the member's own uploads created (expected RED today)
category `erasure` · real KMS **no** · real vault **yes** · browser **no** · covered today **none**

- **Law.** 'The original file it came from' covers every copy of that file the member uploaded, not only the one claimed to this Work.
- **Procedure.** Build Work W claimed, a second never-claimed upload of the same file (reload orphan) and a landing stranded at WRITING_BYTES. Delete Work W; query residue for the member: ciphertext, wrapped DEKs, stored extraction text, original filename.
- **Pass criteria.** Zero ciphertext, wrapped keys or extracted text remain for that member's uploads of that file, or the response and copy state exactly what remains and how the member removes it. Expected RED: Delete Work reaches only arrivals joined by manuscript_id.
- **Defeat candidate.** The current reach passes the single-upload happy path and leaves sibling uploads and stranded intents behind unnoticed.
- **Coverage note.** eraseManuscript selects arrivals by manuscript_id and landings by arrival_id only (eraseManuscript.ts:112-135); unclaimed arrivals and non-recorded intents are untouched.
- **Depends on.** WSI-20, WSI-25
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-20, WSI-24, WSI-26 passCriteria 'founder-accepted declared state' — This turns an unmet vow-level property (a member's held data has no removal door; unclaimed arrival keeps plaintext extraction indefinitely) into a PASS. It should be reported as ACCEPTED GAP, never as PASS, and never silently satisfy the 'no stealth memory' vow.

### WSI-27 · Every queue consumer sees the same vault
category `erasure` · real KMS **no** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A queue row may be deleted only by a process that can see the bytes; 'file not found' is not proof of erasure.
- **Procedure.** Read-only docker inspect of maia and maia-media-worker: mounts and FILE_STORAGE_PATH. In the harness write a canary ciphertext under manuscript-sources, enqueue it, and let only the real worker sweep (about 90 s). Control: repeat with a worker started without the vault mount.
- **Pass criteria.** The real worker removes the file on the host and the row; the no-mount control deletes the row while the file remains and the check reports FAIL for that control (the check can fail); mount parity between maia and worker is recorded.
- **Defeat candidate.** maia's inline sweep hides a worker lacking vault_data (committed compose gives it only media_data); ENOENT counts as erased and the queue row vanishes while bytes remain.
- **Covered by.** `lib/manuscript/source/__tests__/vaultErasureFunctionalR105.test.ts`
- **Coverage note.** R105 tests mock query and destroyVaultBytes. Mount parity is untested; the repo compose omits the worker vault mount (docker-compose.production.yml:471-472); live mounts are unread.
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-27 / hazard 'ENOENT counts as erased' for an unmounted worker — fileVault.ts:155-156 refuses an unavailable root. The failure only arises because Dockerfile:167 creates an empty /app/data/vault in the shared image (C22). State that precondition; a missing mount alone does not prove the guard absent.

### WSI-28 · Delete answer reflects this member's obligations; the worker finishes erasure physically
category `erasure` · real KMS **no** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** The Delete answer depends only on this member's obligations, never says gone while bytes remain, and erasure completes even if the inline sweep fails.
- **Procedure.** (a) Seed another fictional member's undestroyable queue row, delete this member's Work. (b) Unset the R20 env and delete. (c) Make destroy fail (read-only dir), delete, restore, let the real worker sweep and inspect its mounts.
- **Pass criteria.** (a) does not return custody_incomplete for this member (expected RED: sweptAll uses a global count). (b) and (c) return removed:true with custody_incomplete and the UI's 'could not confirm' text; the worker later removes the physical file (ls shows ENOENT), not only the row.
- **Defeat candidate.** Global-count sweptAll passing or failing for the wrong reason; a worker without the mount deleting queue rows on ENOENT while ciphertext stays.
- **Covered by.** `lib/manuscript/source/__tests__/vaultErasureFunctionalR105.test.ts`, `lib/manuscript/source/__tests__/r106ErasureRestartSourceLaw.test.ts`, `lib/writersStudio/__tests__/deleteWork.test.ts`
- **Coverage note.** Mocks and source greps only. No physical run of the production worker; the client copy for custody_incomplete is already honest.
- **Depends on.** WSI-27

### WSI-29 · Delete Work and discard succeed during a KMS outage and report custody honestly
category `erasure` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Erasure must not depend on AWS: during an outage Delete Work and discard succeed, and 200 means bytes and wrapped key are gone.
- **Procedure.** With KMS blackholed and the twin key disabled: Delete Work on a claimed Work and discard (library call) on an unclaimed arrival, once with R20_* set and once unset. Check the file on the vault volume, the landing row, the queue and the HTTP status.
- **Pass criteria.** Both succeed with no KMS event; file ENOENT; wrapped_dek rows gone; with R20 set the response is 200 removed:true; with R20 unset it is 500 custody_incomplete and queue and tombstones are still correct.
- **Defeat candidate.** The PG16 harness (mocked R20 ledger, no-op editorial erase) makes both variants look identical and hides the custody_incomplete path.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t9, t11)`, `lib/manuscript/source/__tests__/discardUnclaimedArrival.test.ts`
- **Coverage note.** Erase and discard under local-test with a mocked ledger; no KMS-failure variant and no route-level DELETE drive. Both files import no key code.
- **Depends on.** WSI-18, WSI-25

### WSI-30 · After Delete Work every store is classified gone, residual-by-design or unknown
category `erasure` · real KMS **no** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** For every store that can hold a fixture's bytes, text or identity after Delete Work, the run records gone, residual-by-design or unknown, and the 'nothing is kept' copy is true for that list.
- **Procedure.** Plant canaries in prose and filename. Take a pg_dump before Delete Work. After it grep live tables, the dump, vault tree, tmp dirs, container writable layers, container logs, Postgres WAL and standby if present, the workbench volume and CloudTrail context.
- **Pass criteria.** A complete store-by-store table. Live tables, vault, logs and tmp hold zero canary; the pre-delete dump still holds wrapped key and text and is listed as residual with a retention owner; the Delete copy is made true or reworded by founder decision.
- **Defeat candidate.** A scan of live tables and the vault only reports 'gone' while dumps, WAL, standby, logs and any formData spill still hold the fixture.
- **Covered by.** `scripts/witness/ws-delete-01-erasure-witness-r20.ts`
- **Coverage note.** Scans text columns of a full DB only. No scan of dumps, logs, tmp or standby; permanentErasureCertified is a static false with no consumer.
- **Depends on.** WSI-25

### WSI-31 · Restore matrix and backup resurrection are measured, not asserted
category `backup-restore` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Neither store alone exposes or resurrects an original, loss of either is detected, and whether a deleted original can return from a backup is measured.
- **Procedure.** Land 3 files; pg_dump -Fc and copy the vault. Restore (a) DB without vault, (b) vault without DB, (c) both through restore-governed.sh after one Delete Work. Separately restore the pre-delete pair into an isolated stack and try to unwrap with the real key, then with the key disabled.
- **Pass criteria.** (a) verifyCustody false and claim refuses; (b) no wrapped DEK for the orphan ciphertext; (c) the deleted Work's rows do not return and the others unwrap. The resurrection result is recorded as measured; the report avoids 'irrecoverable' and keeps permanentErasureCertified false.
- **Defeat candidate.** Plain pg_restore instead of restore-governed.sh, a dump taken before the Work existed, or a restore under local-test where the KEK sits beside the data; 'rows gone' passes vacuously.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t9, t11)`, `scripts/witness/ws-legacy-source-recovery-pg16.sh`
- **Coverage note.** Old-row reinsert refusal on a stub schema. The legacy recovery harness restores DB and vault with local-test keys on a different subject; restore-governed.sh does not mention the vault.
- **Depends on.** WSI-25
- ⚠️ **AMENDMENT (from verification/critic; supersedes the text above where they conflict).** WSI-31 procedure 'copy the vault' and 'restore-governed.sh'; coveredToday 'real PG16' in WSI-12/19/22/25/29 — No repo vault backup exists and restore-governed.sh does not mention the vault. The PG16 harness is a stub schema with 3 migrations, local-test and mocked R20. Treat these as 'none' for production-shape claims; (c) does not show ciphertext cannot return.

### WSI-32 · A hung KMS must not pin database locks or starve the pool
category `availability` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A KMS stall ends with the request, pins no row locks, and cannot starve the shared 20-connection DB pool or block the member's Delete Work.
- **Procedure.** With the real SDK DROP (not reject) packets to the KMS endpoint. Land a file, then fire one claim, then 25 concurrent claims; sample pg_stat_activity and pg_locks every 5 s; meanwhile run Delete Work and discard for the same member and time /api/health and a trivial DB route. Repeat with a throttling stub.
- **Pass criteria.** Each request ends within a founder-set bound (propose 60 s, at most the 120 s maxDuration); no idle-in-transaction session or FOR UPDATE lock outlives it; unrelated queries keep succeeding; the observed SDK timeout is recorded.
- **Defeat candidate.** A fake client that rejects instantly passes every bound; a dropped route may hang with locks held because no timeout is configured (maxAttempts 3 only).
- **Covered by.** `lib/manuscript/source/__tests__/claimArrivalOwnershipR12.test.ts`
- **Coverage note.** No test makes KMSClient.send hang, reject or throttle; the R12 test checks SQL order on a mocked transaction only.
- **Depends on.** WSI-16

### WSI-33 · Resource bounds: near-limit, concurrent and hostile uploads
category `availability` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Near-limit, concurrent and hostile uploads cannot take the app down or starve co-located Postgres and Caddy.
- **Procedure.** At production's container limits upload 24.9 MiB docx, pdf and epub, 1, 4 and 8 concurrently with real KMS latency; a high-ratio zip docx; 25 MiB + 1 byte; text over 2,000,000 chars. Record peak RSS, restarts and OOM, latency, /api/health and a DB route, and whether custody began.
- **Pass criteria.** No OOM or restart; concurrent peak stays under a founder-set ceiling with margin; each request finishes inside 120 s; oversize and hostile files are refused before custody; the absence of a concurrency cap or memory limit is recorded as a finding.
- **Defeat candidate.** One upload at a time: peak memory looks small because the file blob, arrayBuffer, ciphertext and verify reads only compound under concurrency, and formData() buffers before the size check.
- **Coverage note.** No limiter, streaming or test; the repo compose sets no memory limit for maia (live value unread); peak memory was inferred, never measured.
- **Depends on.** WSI-16

### WSI-34 · Credential rotation and key rotation or replacement are tested procedures
category `rotation` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** The process-lifetime KMS client must not silently pin a deactivated credential, and old envelopes keep decrypting through their recorded key id under scoped IAM.
- **Procedure.** Credential: create a second access key, replace the file, deactivate the old key, upload and reopen without restart, then recreate maia through the lane. Key: on a throwaway K1 land A, rotate on demand, reopen; create K2, change the ARN, land B; remove K1 from IAM, reopen A and B, Delete Work A.
- **Pass criteria.** Both credential outcomes recorded with a numbered procedure; A reopens after rotation with unchanged key_id; B records K2's ARN; with K1 removed A fails closed and B works; Delete Work A still succeeds; the IAM template lists every ARN ever recorded.
- **Defeat candidate.** Assuming the SDK reloads the file: a fresh container passes while the long-lived process keeps the deactivated key; the local KEK-ring test (t12) proves nothing about IAM scope across ARNs.
- **Covered by.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts (t12)`
- **Coverage note.** Local KEK-ring rotation only. The KMS client is a module singleton (sourceKeyAuthority.ts:34-36,131-142); envelope rows are immutable and no re-wrap code exists.
- **Depends on.** WSI-03, WSI-17

### WSI-35 · CloudTrail carries only the content-free context, from the intended principal
category `cloudtrail` · real KMS **yes** · real vault **no** · browser **no** · covered today **partial**

- **Law.** Every KMS call carries exactly soullab:domain and a 64-hex binding hash; no member, intent, Work, filename or prose ever appears in CloudTrail.
- **Procedure.** Run with a unique canary phrase, filename, member id and intent id. Confirm the trail is on with a positive control, then export all KMS events for the window. List encryptionContext key sets per event, grep every canary across the event JSON, and recompute the context sha from the DB row for one file.
- **Pass criteria.** Every GenerateDataKey and Decrypt has exactly {soullab:domain, soullab:context-sha256} with domain writer-source-v1; 0 canary, id or filename hits; the recomputed sha equals the logged value; keyId is the key ARN; the per-file hash is recorded as an accepted pseudonymous correlator.
- **Defeat candidate.** An edit adding a member or filename context key still passes the fake-client toMatchObject subset test; a disabled trail makes 'no events' look clean.
- **Covered by.** `lib/manuscript/source/__tests__/sourceKeyAuthority.test.ts`
- **Coverage note.** Context shape is asserted on a fake client with toMatchObject, a subset match (test:85-99). No CloudTrail evidence exists.
- **Depends on.** WSI-03, WSI-06

### WSI-36 · KMS call ledger matches the code model; cost projected from measured counts
category `kms-accounting` · real KMS **yes** · real vault **no** · browser **no** · covered today **none**

- **Law.** Every KMS call is accounted for against a model derived from the code, and cost is projected from measured per-upload counts, not assumed to be 'a pair'.
- **Procedure.** Run scenarios: fresh upload, same-key replay, resume at each state, claim, verifyCustody, Work reopen, discard, Delete Work; export CloudTrail per scenario. Diff against the model (upload 1 GenerateDataKey + 2 Decrypt, claim +1, replay at ARRIVAL_RECORDED 0, discard and Delete 0). Allow delivery delay before judging absence.
- **Pass criteria.** Observed counts equal the model per scenario or each deviation is explained; GenerateDataKey total = intents with wrapped_dek + injected losses; 5 same-key retries under denied credentials show at most 3 SDK attempts each; the projection cites founder-supplied AWS pricing.
- **Defeat candidate.** Runbook step 6 'exactly one pair' flags a healthy 1+3 as a defect; a success-only count misses denied, retried and wasted calls.
- **Coverage note.** Call counts are inferred from encryptedLanding.ts:276,400,441 and arrivals.ts:174; no test counts KMS sends.
- **Depends on.** WSI-35

### WSI-37 · Each injected fault yields a distinct, content-free cause (expected FAIL today)
category `observability` · real KMS **yes** · real vault **no** · browser **no** · covered today **none**

- **Law.** Credential, IAM, region, key-state, network, clock and tamper faults must be separable from logs, canary output and row state without CloudTrail or member content.
- **Procedure.** Replay the faults of WSI-16 and WSI-18 plus clock skew of 10 minutes and ciphertext tamper. A grader who does not know the injected fault sees only container logs, canary output and intent states and names the cause. A scan checks logs for ARNs, hashes and text.
- **Pass criteria.** Each fault maps to a distinct bounded token; a KMS outage is distinguishable from tamper; 0 prose, key ids or hashes in logs. Expected FAIL: the route logs only source_landing_incomplete and intentRecorded.
- **Defeat candidate.** Treating HTTP 503 plus intentRecorded as diagnosis: every fault yields the same pair, so a grader who knows the fault always seems right.
- **Coverage note.** Landing failures log code and intentRecorded only (ingest/route.ts:394-399); decrypt errors collapse to CRYPTO_REFUSED (encryptedLanding.ts:372-378).
- **Depends on.** WSI-16, WSI-18

### WSI-38 · Logs and traces carry no content
category `logging` · real KMS **no** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** No log, trace or event outside the intended plaintext columns contains member prose, filenames, identities or key material.
- **Procedure.** Collect docker logs, Postgres logs (check log_statement and parameter logging), Caddy access logs and CloudTrail JSON; grep for canary, filename, member, intent and arrival ids, wrapped_dek and plaintext SHA. Provoke the parse-error and outer-catch paths with canary-bearing corrupt files; plant one canary in a control log.
- **Pass criteria.** The control canary is found; zero hits in real logs; provoked-error logs contain no document fragments, or the hit is reported as a defect (ingest/route.ts:357 and :433 log whole error objects).
- **Defeat candidate.** console.error(err) prints a parser message containing document text; Postgres logs statement parameters; the scan runs over empty logs and passes.
- **Covered by.** `lib/manuscript/source/__tests__/vaultErasureSafeLogR105.test.ts`, `lib/manuscript/source/__tests__/sourceKeyAuthority.test.ts`
- **Coverage note.** Erasure logs are errno-only and the KMS context is content-free in tests. Ingest and claim logging, incl. raw errors at ingest/route.ts:357,433 and manuscripts/route.ts:482, are untested.
- **Depends on.** WSI-10, WSI-16

### WSI-39 · Every sentence the member sees is checked against live state
category `honesty` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Every sentence the member sees about their file is true at the moment it is shown, checked against database and vault state, not string patterns.
- **Procedure.** Scripted browser walk over states: held, no-text, refused file, 503 incomplete, retry success, key conflict, claim failure, Create Work success, Delete incomplete, Delete done. At each, capture the text and query the predicate each claim asserts (record preserved, encrypted, held as Source, nothing kept).
- **Pass criteria.** Each sentence has a stated true predicate: 'upload record was preserved' only when an intent exists; 'remains separately held as Source' only when arrival.manuscript_id = Work id; 'encrypted' names original bytes only; 'nothing is kept' is true for the WSI-30 list or reworded.
- **Defeat candidate.** String-level contract tests pass whether or not the sentence is true; the 503 copy claims a preserved record even when no intent was written.
- **Covered by.** `app/writers-studio/__tests__/p4r1ImportHoldHonesty.test.ts`, `app/writers-studio/__tests__/encryptedSourceUploadContract.test.ts`, `lib/writersStudio/__tests__/deleteWork.test.ts`, `tests/e2e/writers-journey/journey.spec.ts (held banner, line 132)`
- **Coverage note.** Copy is checked as strings and mocked UI only; none is compared with live state.
- **Depends on.** WSI-11, WSI-13, WSI-16, WSI-24, WSI-28, WSI-30

### WSI-40 · Held means held: same words on every door, no row, no file, no KMS event
category `edge-release` · real KMS **no** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Until released, a held upload does nothing: the same honest words on every door, no intent, no ciphertext, no KMS event.
- **Procedure.** On the unmodified canonical image as roster, non-roster and unauthenticated callers: POST ingest, load the Import room, use /press/manuscript, POST sources and the workbench upload. 5 attempts each. Count intents, vault files and KMS events; capture visible text; repeat through the real edge if reproducible.
- **Pass criteria.** 423 (401 when unauthenticated) with no-store every time; zero intents, vault objects and KMS events; the room shows the held banner; the legacy page shows the server's words, not a generic failure; sources POST returns its 423; the workbench result is recorded.
- **Defeat candidate.** A mocked query() cannot show zero rows on a real database and cannot see the edge hold, the legacy page or the workbench door.
- **Covered by.** `app/api/sovereign/manuscripts/ingest/__tests__/transportBoundary.test.ts (F3, F7)`, `app/writers-studio/__tests__/p4r1ImportHoldHonesty.test.ts`, `tests/e2e/writers-journey/journey.spec.ts`
- **Coverage note.** App-layer 423 and its ordering are pinned with a mocked query. Edge holds are outside the repo; the sources POST 423 has no test; real-DB zero effect is not asserted.

### WSI-41 · Edge holds, route order and parallel doors; reinstatement rehearsed
category `edge-release` · real KMS **no** · real vault **no** · browser **no** · covered today **partial**

- **Law.** Lifting the named holds opens exactly the encrypted door; every other storing door stays shut or is knowingly accepted; the edge change is reversible within a stated time.
- **Procedure.** Diff the host Caddyfile against its backup (the holds are not in the repo). Back up, run caddy validate, time a dry-run reinstatement. Probe with no session or an empty body (store nothing): ingest, sources POST, workbench uploads POST, living-works visual, import-docx, local-review import. Check ingest order: 401, then 400 without header, forged identity 401.
- **Pass criteria.** The diff removes only the two named matchers; each probe's status equals a matrix the founder declared beforehand; the workbench POST stays held or refused; workbench_data, sources and the visual store are unchanged after the witness; reinstatement completes within a founder-stated bound.
- **Defeat candidate.** Removing SOURCE-CUSTODY-EDGE-01 also opens the workbench POST (plaintext originals, founder-gated only); an uncommitted host Caddyfile edit lost to a stash (2026-08-25 precedent); the hold moved after formData().
- **Covered by.** `app/api/sovereign/manuscripts/ingest/__tests__/transportBoundary.test.ts`, `app/writers-studio/__tests__/encryptedSourceUploadContract.test.ts`
- **Coverage note.** Source greps pin hold order and the 423 and go red on the flip. The sources POST 423 has no test; Caddy matchers are not in the repo.

### WSI-42 · Audience and abuse bound: who can store an original equals who was declared
category `exposure` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** The set of members who can store originals equals the audience the founder declared, and the cost of an unrestricted audience is measured.
- **Procedure.** After the flip on the harness, POST a small fictional file as a roster member, an off-roster signed-in member and a free-tier member, and via /press/manuscript. Then send 50 small uploads from one member; count KMS events, intents and vault bytes.
- **Pass criteria.** The allowed set equals the declared set; if roster-only, off-roster and free-tier members are refused before custody; otherwise the open audience and absence of any rate limit or quota are recorded as a founder-accepted state with measured cost.
- **Defeat candidate.** Assuming 'beta-only': ingest has no roster check and sits outside the roster corridor, so any signed-in member can upload.
- **Covered by.** `lib/writersStudio/__tests__/restrictedCorridor.test.ts`
- **Coverage note.** That test pins ingest as not Writer-restricted (records the design); nothing tests who can upload. No rate-limit test.
- **Depends on.** WSI-41

### WSI-43 · Hold-pinning tests are requalified at the flip, not weakened
category `release-gate` · real KMS **no** · real vault **no** · browser **no** · covered today **partial**

- **Law.** At the flip, tests that pin the held literal are requalified under the new law; the order hold < header < formData < custody, header sanitising, identity refusals and the export and erasure holds must each keep a test.
- **Procedure.** On the flip commit run the suites that pin the literal (transportBoundary F3/F7, encryptedSourceUploadContract, p4r1ImportHoldHonesty, routeHold, e2e S10). Replace the 423-without-header cases with an idempotency header and a real parsed multipart body; keep export and erasure clauses; add a test pinning the new manifestId.
- **Pass criteria.** Every red test is explained by the flip; no assertion on ordering, sanitising, identity refusal, export hold or permanentErasureCertified:false is deleted; F7 observes headers at formData() for the first time (atBody non-null).
- **Defeat candidate.** Editing the literal to 'sourceIntakeReleased: true' and the 423 cases to 400: the suite goes green and the ordering and sanitising laws silently lose their tests.
- **Covered by.** `app/api/sovereign/manuscripts/ingest/__tests__/transportBoundary.test.ts`, `app/writers-studio/__tests__/encryptedSourceUploadContract.test.ts`, `app/writers-studio/__tests__/p4r1ImportHoldHonesty.test.ts`
- **Coverage note.** These pin the held state today and go red on the flip; F7 never observes a parsed body (atBody null). Its own comment demands requalification (test:375-376).
- **Depends on.** WSI-40

### WSI-44 · A lane deploy preserves live-only wiring and held originals
category `deploy-wiring` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A lane deploy or container recreation neither drops live-only wiring (R20 env and mounts, worker vault mount, credential mount) nor makes held originals unreadable.
- **Procedure.** Read-only docker inspect of maia and maia-media-worker (mount destinations and env NAMES only) before and after a rehearsal same-SHA lane deploy from the repo compose. Upload and claim two files; recreate; open the Work, verifyCustody both, upload a third; diff vault_data file hashes.
- **Pass criteria.** Mount destinations and env names for vault_data, R20_LEDGER_FILE, R20_HIGH_WATER_FILE, R20_LEDGER_KEY_FILE and the credential file are identical or each change is a reviewed diff; both arrivals verify; vault hashes unchanged; the third upload lands; no new stranded intents.
- **Defeat candidate.** Checking only DB rows or reusing a warm KMS client; the repo compose has no R20 keys and gives the worker no vault mount, so a lane deploy can silently drop live-only overrides.
- **Coverage note.** No deploy-persistence witness. The compose credential mount is not yet made (runbook step 2); the Co-Lab gate does not cover Source custody (COLAB_RELEASE_GATE.md:64).
- **Depends on.** WSI-27, WSI-17

### WSI-45 · Evidence packet holds no credentials, content or identifiers; receipts are per obligation
category `evidence-hygiene` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** Credentials never pass through a session, and a receipt records per-obligation outcomes, never constants derived from one exit code.
- **Procedure.** Give the session exports only, with docker inspect Env values stripped. Scan the packet, logs, receipts and the CloudTrail export for AKIA/ASIA shapes, secret shapes, base64 wrapped DEKs, the canary phrase, filenames and member or intent UUIDs; check each receipt field is computed from per-test results.
- **Pass criteria.** 0 credential-shaped strings; 0 canary, UUID or filename hits; the receipt lists pass/fail and count per obligation with totals computed, not hard-coded (no testsExpected constant).
- **Defeat candidate.** The PG16 receipt: 16 coverage booleans all set from jest exit code 0 and testsExpected hard-coded 12, so one passing exit code certifies behaviours that never ran.
- **Coverage note.** ws-encrypted-source-pg16.sh:179-228 is the counter-example; verify-ws01-source-custody.ts prints 12-char hash prefixes.

### WSI-46 · The harness is proven lethal against known-wrong setups
category `instrument` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** The acceptance harness is itself tested: each known-wrong setup makes it exit non-zero for its own named reason; a survivor repairs the harness, never the candidate or its expected result.
- **Procedure.** Run the harness against wrong setups, one change each: local-test provider, permissive IAM, wrong region, env credentials, plaintext planted in the vault, worker without the mount, retry that mints a second intent, a log leaking a canary, the hold moved after formData(). Record which obligation died and why.
- **Pass criteria.** Every wrong setup is killed by its named obligation and the conforming setup passes; any collateral death is classified with a reason or repaired in the candidate's isolation.
- **Defeat candidate.** A harness only ever run against the conforming setup passes by construction.
- **Covered by.** `scripts/witness/ws-encrypted-source-pg16.sh`
- **Coverage note.** No known-wrong candidate has been run against any Source-intake instrument; the pg16 receipt is exit-code-derived.
- **Depends on.** WSI-01, WSI-03, WSI-04, WSI-07, WSI-12, WSI-27, WSI-38

### WSI-47 · Step 6 production witness: the lifecycle in miniature, contained and reversible
category `production-witness` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** The production witness is run by one fictional test member in a short, observed, reversible window, and every residue it leaves is accounted for and removable through governed paths.
- **Procedure.** Run the KMS canary under the holds first. Before step 5 take baselines (intents, arrivals, queue, vault listing, workbench, Caddyfile hash, CloudTrail time, Co-Lab gate) and rehearse hold reinstatement. Then one fictional docx: upload, Create Work, re-login and reopen, Delete Work; a second upload discarded in-container. Diff the baselines.
- **Pass criteria.** Per upload 1 GenerateDataKey + 2 Decrypt, +1 per claim or verifyCustody, with only the two context keys; counts equal baseline except enumerated content-free rows; image id and GIT_COMMIT equal the tested ones; Co-Lab gate 0 failed (it has no Source checks); the test member is removable.
- **Defeat candidate.** Looking for exactly one 'pair'; cleaning by raw DELETE (as verify-ws01-source-custody.ts does), skipping tombstones and the queue; step 6 being the first KMS call ever made from the container; citing the Co-Lab gate as custody evidence.
- **Covered by.** `scripts/verify-ws01-source-custody.ts`
- **Coverage note.** No committed production witness for encrypted intake. That script is confirm-gated, predates tombstones and cleans up with raw SQL and one unlink; arrivals and intents reference members ON DELETE RESTRICT.
- **Depends on.** WSI-05, WSI-17, WSI-19, WSI-25, WSI-35, WSI-36, WSI-41, WSI-44, WSI-46

### A.2 · Gap-fill set (from the completeness critic)

Each FILL group closes one gap the critic found in the WSI set: 1 release-disposition rule · 2 Sanctuary · 3 consent timing · 4 legacy plaintext Source · 5 vault durability · 6 production preflight · 7 step-5→6 exposure window · 8 account deletion · 9 member export · 10 disclosure of the AWS dependency · 11 purpose limitation · 12 non-delivery and alerting · 13 parser isolation · 14 through-the-edge limits · 15 environment of evidence · 16 vault permissions · 17 plaintext data key.

### FILL-1a · FILL-1a Expected-RED dispositions are predeclared and the step-4 verdict is computed, not typed
category `release-decision` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** Each obligation expected to be RED carries a disposition fixed before run 1: BLOCK_STEP_4 (the default) or DECLARED_GAP. The step-4 verdict is computed from per-obligation receipts and that table. A founder note, an exit code or a count of 'unexpected failures' never turns a RED into a pass.
- **Procedure.** Commit the disposition table (WSI-11,13,20,24,26,28,37) and its SHA-256 before run 1. A script reads the receipts and the table and prints STEP_4_ELIGIBLE, STEP_4_BLOCKED or RUN_INVALID. Then run four mutations: delete a row; edit a row after seeing a RED; let an expected RED pass; add an unlisted RED.
- **Pass criteria.** ELIGIBLE only if every BLOCK_STEP_4 item is GREEN and each DECLARED_GAP is RED for its named reason and carries ruling ref, residue class, disclosure id, removal path (FILL-1b/1c) and expiry. Each mutation gives RUN_INVALID or BLOCKED. A RED caused by a harness fault is RUN_INVALID, never a gap.
- **Defeat candidate.** Verdict = 'no unexpected failures': seven expected REDs plus a founder note end green. Or the table is edited after the run to move a RED into DECLARED_GAP, or a missing row defaults to pass.
- **Coverage note.** READ: runbook step 3 (lines 69-74) names the run, no verdict rule. UNKNOWN: the WSI set and the founder's declared-state ruling are not in this tree; judged from titles. Precedent: S3-F8 procedure s2, three outcomes and no fourth.
- **Depends on.** WSI-11, WSI-13, WSI-20, WSI-24, WSI-26, WSI-28, WSI-37, WSI-45, WSI-46

### FILL-1b · FILL-1b Declared residue is predicted, enumerated by an independent census, and doorless content defaults to BLOCK
category `residue` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A declared gap bounds residue; it never hides it. The run predicts, by id and store, what each gap leaves behind, and a census independent of the app's erase code must match. Member text or key material that no member route can remove is BLOCK_STEP_4 unless a founder ruling names that class.
- **Procedure.** On fictional members script four paths: preview-then-leave, claim failure, same file under a new retry key, kill after prepare. Plant a canary per class. Predict residue ids, then enumerate with raw SQL and a vault listing (source_text, wrapped_dek, manuscript-sources/*.enc, erasure queue). A door is a member route that reaches the removal.
- **Pass criteria.** Observed ids equal predicted ids; every canary is found; nothing sits outside a declared class. Any class holding source_text, wrapped_dek or ciphertext with no member-reachable removal is BLOCK_STEP_4 unless a founder ruling names that class. Zero rows is not demanded; unexplained rows are failure.
- **Defeat candidate.** Census built from eraseManuscript/discardUnclaimedArrival (blind to what they never reach), or a bound 'residue <= N' that passes with an unpredicted wrapped DEK beside the expected rows. A library function with no route counted as a door.
- **Covered by.** `WSI-21`, `WSI-20`, `WSI-26`
- **Coverage note.** READ: discardUnclaimedArrival.ts:22 has no non-test caller; landing intents are deleted only by arrival cascade (migration 20261026000001:58); eraseManuscript.ts:113-125 reaches only arrivals of the deleted manuscript. INFERRED: WSI-21 expects zero, so conflicts with a declared gap.
- **Depends on.** FILL-1a, WSI-12, WSI-15, WSI-20, WSI-21, WSI-26

### FILL-1c · FILL-1c A declared gap is disclosed to the member and can be closed on request
category `member-removal` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Declaring a gap to the founder is not declaring it to the member. Each DECLARED_GAP names what Soullab keeps, says so on the member's own surface where it arises, and has a removal path (member door, else a rehearsed operator procedure that reaches a human) that empties every store for that member.
- **Procedure.** For each DECLARED_GAP: produce the residue as a fictional member, walk the UI to where it arises and record the sentence shown. Then run the declared removal path with KMS unreachable, and run the FILL-1b census scoped to that member and to a second member in the same run.
- **Pass criteria.** The retained item is named in words at the arising point and in the Delete Work answer; no 'gone' or 'nothing saved' while residue exists. After removal: 0 rows for that member in every store, tombstones present, the second member's rows unchanged. A gap lacking either sentence or path is BLOCK_STEP_4.
- **Defeat candidate.** Disclosure only in a founder-facing register while Delete Work still says the Work is gone; or an operator script that deletes by artifact_ref but misses the intent row or the plaintext extraction, so the census still finds the member.
- **Covered by.** `WSI-24`, `WSI-28`, `WSI-39`, `WSI-19`
- **Coverage note.** READ: manuscripts/route.ts:462-481 labels a failed claim legacy_interpreted_import; ingest/route.ts:379 stores the extraction before the member confirms. INFERRED: a failed claim leaves the arrival unclaimed, and no obligation makes a gap produce a disclosure sentence or a rehearsed operator removal.
- **Depends on.** FILL-1a, FILL-1b, WSI-19, WSI-25, WSI-29, WSI-39

### FILL-2a · FILL-2a Sanctuary scope of Writer originals is ruled, and the clients and copy match it (expected RED today)
category `consent and posture` · real KMS **no** · real vault **no** · browser **yes** · covered today **none**

- **Law.** Sanctuary invariant 6 is absolute and turnPosture.ts:1-19 expects every content writer to carry a resolved posture. Read: ingest/route.ts has no posture token; neither upload client sends one (press/manuscript/page.tsx:433-439, P4R1ImportManuscript.tsx:115-126). Whether originals are in scope needs a recorded founder ruling, not a door's default.
- **Procedure.** 1) Packet cites one dated founder ruling in the candidate commit: R-IN (upload, landing, claim refused) or R-OUT (originals outside it), naming stores (vault object, landing intent, arrival source_text, Work sections) and whether paste import is in scope. 2) In a browser, set maia_settings.sanctuary true/false/absent; drive both clients.
- **Pass criteria.** No ruling: FILL-2b/2c NOT RUN and the plan cannot certify. R-IN: posture is read at the file-choosing and Create Work gestures and sent explicitly; an absent setting sends nothing and says nothing was written; a refusal shows its own sentence, never an empty draft. R-OUT: copy before sending says the file is kept despite Sanctuary.
- **Defeat candidate.** Today on a released candidate: no ruling, no client reads posture, the page is silent, so a Sanctuary-on member's file and extracted text are kept unannounced. Also a keeps-style 200 receipt, which page.tsx:449-452 treats as success and shows as an empty draft.
- **Coverage note.** Read: no Sanctuary token in ingest/route.ts, lib/manuscript/source/*, either upload client or the upload tests; runbook 2026-11-01 never mentions Sanctuary. Inferred: no ruling exists (grep only). Unknown: posture is per-device, since currentClientPosture.ts reads localStorage only, so another device's setting is invisible.
- **Depends on.** WSI-01, WSI-39

### FILL-2b · FILL-2b A Sanctuary-on upload is refused before any read, write or KMS call; unresolved posture fails closed (R-IN; expected RED today)
category `consent and posture` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Posture first, then nothing: keeps/route.ts:69-77 requires an explicit boolean, mints TurnPosture and reads and writes nothing under Sanctuary. The ingest hold (route.ts:260-265) precedes key validation so it is no oracle; posture handling must not become one.
- **Procedure.** On a released candidate with real KMS and vault, POST ingest under Sanctuary true with a valid DOCX, a 26 MiB file and a corrupt PDF; also string 'true', contradictory signals, posture absent and false. Diff DB census, vault listing, KMS ledger and logs around each. Retry a refused file under false, same UUID. Repeat with the hold on.
- **Pass criteria.** True and contradictory: one content-free Sanctuary refusal. String-true and absent: that or posture_required. None returns 413/415/422, text or an arrival id. Each leaves zero intents, arrivals, vault files and KMS events; logs hold no name, size or char count. False lands; the same-UUID retry makes one intent. Hold on: byte-identical 423.
- **Defeat candidate.** Posture read after formData() and parseUpload, or trusted only from the client: the 26 MiB and corrupt files return 413/422, not the refusal. Or the refusal follows beginEncryptedLanding and leaves an intent under the UUID the client reuses (sourceUploadAttempt.ts:32), so the retry meets a Sanctuary-made row.
- **Coverage note.** Read: no posture handling at the ingest door; WSI-40 covers the hold, not posture. Precedents: keeps/route.ts and review-discuss/route.ts:79-84. Inferred: a multipart carrier is undecided; a header permits refusal before formData(), a form field cannot.
- **Depends on.** FILL-2a, WSI-01, WSI-12, WSI-36, WSI-40

### FILL-2c · FILL-2c Landing, claim and paste under a posture change: Sanctuary refuses new writes, never removal (R-IN; expected RED today)
category `consent and posture` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** The posture in force at each act governs that act (turnPosture.ts:4-6). Create Work reads no posture (manuscripts/route.ts:322) and stores the same text as sections and source_text by file or paste. Removal stays sovereign in Sanctuary (keeps/route.ts:29).
- **Procedure.** A) Upload under false, kill the process after the landing intent, set Sanctuary true, retry the same UUID. B) Upload under false, set true, run Create Work from that arrival, then from the same text pasted. C) Under true, discard the unclaimed arrival and Delete an existing Work. Census and hash-check after each step.
- **Pass criteria.** A: retry refused; no ciphertext, no arrival committed; the stranded intent is counted by the WSI-21 census and removable. B: both refused alike with zero Work, section, declaration or arrival rows; the arrival stays unclaimed and byte-identical. C: both removals succeed under Sanctuary.
- **Defeat candidate.** Gate only claimArrival: Work and sections already commit (route.ts:412-447; the claim at 470 fails into the catch at 482) as legacy_interpreted_import. Or gate only the file path so paste lands the same text. Or copy the keeps gate onto DELETE and trap Sanctuary members' data. Or finish a Sanctuary-off intent on a Sanctuary-on retry.
- **Covered by.** `WSI-19`, `WSI-25`
- **Coverage note.** Read: WSI-19 and WSI-25 cover removal under ordinary posture only. discardUnclaimedArrival has no app, components or lib caller outside tests, so C's discard has no member door until WSI-24 closes. Delete Work (manuscripts/[id]/route.ts:189) has no Sanctuary token, so C passes by absence today.
- **Depends on.** FILL-2a, FILL-2b, WSI-15, WSI-19, WSI-21, WSI-24, WSI-25

### FILL-3a · Choosing a file is a custody act: its footprint is declared before and measured after
category `consent-timing` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Custody must not start by surprise. Read: once released, choosing a file runs ingest at once (P4R1ImportManuscript.tsx:80-143), which writes an intent, ciphertext, one KMS data key and an unclaimed arrival holding extracted text and filename (ingest/route.ts:379; encryptedLanding.ts:489-505).
- **Procedure.** Founder rules first: Variant K (custody at selection, disclosed) or R (nothing durable until a confirming act). In the released test image, fictional member, empty baseline: choose one .docx and stop at the response. Census intents by state, unclaimed arrivals, vault objects, KMS ledger, Works. Capture copy shown before the picker.
- **Pass criteria.** Census equals the ruled variant exactly. K: 1 intent ARRIVAL_RECORDED, 1 unclaimed arrival, 1 ciphertext, 1 GenerateDataKey, 0 manuscripts or Works, and pre-picker copy names each, incl. extracted text and filename in the database. R: all zero until the confirming act. Any undeclared row, object or KMS event fails.
- **Defeat candidate.** Today's build under K: ingest-on-select unchanged, copy says only 'encrypted before durable storage' (:307, :393). Also a harness that censuses only after Create Work, when the arrival is claimed and the selection footprint is invisible.
- **Covered by.** `WSI-06`, `WSI-36`
- **Coverage note.** WSI-06 and WSI-36 measure landing and KMS counts; none frames selection as unconfirmed custody or reads pre-picker copy. Expected RED on copy under K. Variant R needs a new preview path (a build). Whether minisforum disk or Postgres is encrypted at rest is unknown.
- **Depends on.** WSI-06, WSI-36

### FILL-3b · Every exit before Create Work leaves an unclaimed upload the member can see and remove
category `consent-timing` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** An upload stored at selection must not outlive the member's intent invisibly. Read: discardUnclaimedArrival has no non-test caller; Home only navigates (P4R1HomeController.tsx:135-142). Inferred: a different file mints a new key (sourceUploadAttempt.ts:32-38) and orphans the first.
- **Procedure.** Fictional member, stored selection. For each exit: Home; Back to source; choose a different file; clear and paste instead; close the tab; expire the session before Create Work. After each, in a fresh session find a door on screen (not a function call), use it, then census arrival, intent, ciphertext, erasure queue, manifest, tombstone.
- **Pass criteria.** All six exits: the unclaimed arrival is visible in-product and its UI-driven discard ends with zero arrival, intent and ciphertext, queue drained, one R20 manifest and tombstone, no AWS call. After Create Work the control is absent or refused and the bytes still decrypt. A silent clock sweep is not a door.
- **Defeat candidate.** Today's code plus a 24-hour sweep (index comment promises one; none found): passes WSI-19 and a post-sweep WSI-21, yet the member holds an invisible stored file with no door. Also an exit hook that discards on unmount and removes a claimed arrival.
- **Covered by.** `WSI-19`, `WSI-21`
- **Coverage note.** Discard effect is covered, member-gesture reachability is not. Delete Work reaches only claimed arrivals (eraseManuscript.ts:113); abandoned ones fall to WSI-20. ingest/route.ts:24-26 says a sweep 'can collect' orphans: none found; discardUnclaimedArrival.ts:9-10 bars inferred expiry. Host cron unknown. RED today.
- **Depends on.** WSI-19, WSI-20, WSI-21, FILL-3a

### FILL-3c · Pre-confirmation sentences are checked against live state in every state of the window
category `consent-timing` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** WSI-39 lacks the state uploaded, not yet confirmed or abandoned. Read: after selection the screen shows only filename, format and word count (P4R1ImportManuscript.tsx:353-357) while the room says the original is encrypted before durable storage (:307, :393); the 503 text says a record was preserved (ingest/route.ts:401).
- **Procedure.** Add to WSI-39's state table: S0 request in flight; S1 stored, member on screen; S2 stored, member gone; S3 interrupted by an injected KMS or crash fault (503); S4 claimed. In each, snapshot every visible sentence and the census, then judge each storage or non-storage claim against the census.
- **Pass criteria.** Every sentence is true in every state. S1 and S2 tell the member the file is already stored and not part of any Work, or show the door. S0 never says nothing is stored. S3 says retry the same file and matches the intent row. No sentence implies extracted text is encrypted unless the census shows it.
- **Defeat candidate.** A copy test that greps source for an approved string, or audits only the held banner and the saved state (the existing tests read source files with toContain). It blesses 'Nothing is saved until you confirm' while the census shows an arrival, and never sees S1 or S2.
- **Covered by.** `WSI-39`
- **Coverage note.** WSI-39 audits sentences against live state but its state table has no pre-confirmation states. p4r1ImportHoldHonesty and encryptedSourceUploadContract tests are source-text greps. Expected RED in S1 and S2: no sentence says the file is stored.
- **Depends on.** WSI-39, WSI-24, FILL-3a

### FILL-4a · Production census of legacy plaintext Source: classified, content-free, taken from the right vault
category `Legacy plaintext Source` · real KMS **no** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A claim about plaintext originals on the production host is licensed only by a read-only census of arrivals AND the vault tree, every item classified, 0 unclassified, run before and after retirement. WSI-07 on a fresh vault and runbook s5's landing_intents=0 license nothing here.
- **Procedure.** Seed one item per class: claimed and unclaimed legacy, shared ref, bytes absent, nlink 2, symlink, size mismatch, owed retirement without queue row, .pending stage, unreferenced plaintext, ciphertext. Run the committed census (READ ONLY txn, lstat only) by docker exec in maia-sovereign, twice. Production: same tool, separate founder act.
- **Pass criteria.** Vector equals the seeded counts; each arrival and vault entry in exactly one class, unclassified 0; two runs, one digest; vault lstat digest unchanged and 0 opens of canaries; output holds counts and sha256(ref) only (canary scan clean); from a container with an empty vault the result is VAULT_NOT_SEEN, not 0.
- **Defeat candidate.** Runbook s5 style census: landing_intents=0, or an arrivals count by suffix, or a walk run from maia-media-worker, whose /app/data/vault is empty and image-local. Each prints 0 plaintext on the seeded rig.
- **Coverage note.** [read] No arrivals or vault census found in scripts/; runbook s5 reads landing_intents only (93-95). Refs written before 3a7e3a0e3 are manuscript-sources/<uuid>-<16hex>.<ext> (arrivals.ts there), embedding a hash prefix, so paths stay out of packets. Workbench keeps plaintext originals (storage.ts:1-14): scope it by name.
- **Depends on.** WSI-01, WSI-45, WSI-46

### FILL-4b · Legacy retirement order and convergence with real KMS, at every boundary and beside every queue consumer
category `Legacy plaintext Source` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Retirement runs before release, from a committed operator entry point, only with a live KMS key and a sealed R20 ledger. Any interruption or concurrent consumer ends RETIRED or untouched; never ERASURE_OWED with no queue row, never a stranded replacement.
- **Procedure.** Seed legacy rows: claimed, unclaimed, shared ref, absent bytes, nlink 2, unknown extractor. Run the entry point pre-KMS: must refuse, legacy untouched. With aws-kms, kill at swap, seal, unlink, queue-delete; loop sweepVaultErasureQueue, run the production-shaped media worker, Delete Work a claimed legacy Work mid-run; rerun each.
- **Pass criteria.** Eligible rows end RETIRED: legacy file gone (stat in the maia container), ciphertext decrypts byte-identical, queue row gone. Others refused by a named code, legacy row and file untouched. GenerateDataKey count equals rows retired. No ERASURE_OWED without a queue row, no stranded replacement; reruns change nothing.
- **Defeat candidate.** One retirement on a quiet rig with local-test keys, as legacyRetirementPg16.test.ts does. It passes, yet any sweep between commit and finish takes the queue row and the retirement sticks at ERASURE_OWED (legacyRetirement.ts:138-141).
- **Covered by.** `lib/manuscript/source/__tests__/legacyRetirementPg16.test.ts`, `scripts/witness/r20-writer-legacy-source-recovery.ts`
- **Coverage note.** [read] Tests use local-test keys, 1-3 rows, no second consumer; witness gate :34-36; no non-test caller. Shared-ref refusal (legacyRetirement.ts:271-277) follows the committed replacement (231-243). [inferred] Delete Work's inline sweep (eraseManuscript.ts:202) or the media worker can take the queue row first. Expected RED.
- **Depends on.** FILL-4a, WSI-05, WSI-12, WSI-27, WSI-36

### FILL-4c · No path claims or reads legacy plaintext Source; claimed legacy Works end custodied by ciphertext
category `Legacy plaintext Source` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** After retirement no member-reachable act opens a vault file that is not .source.enc ciphertext, and no claim naming a plaintext-backed arrival sets source_custodied. Founder predeclares the rule (refuse, or retire then claim); claiming over plaintext fails.
- **Procedure.** On a rig (intake held, then released) holding seeded legacy rows, POST /api/sovereign/manuscripts with a legacy sourceArrivalId, then reopen, discard and Delete Work, with an inotify sidecar on the vault volume. Retire all, rerun the census, repeat with the old arrival id, a pasted import and a fresh upload.
- **Pass criteria.** Before retirement a legacy claim follows the predeclared rule, source_custody unchanged on refusal, and the only open of a legacy file is retirement's one read. After: census 0 in every plaintext class, acts open only .source.enc, the old id gets a truthful content-free refusal, claimed Works reopen byte-identical. WSI-07 cites the census digest.
- **Defeat candidate.** Today's claimArrival: no landing row, so readVaultBytes on the plaintext then source_custodied (arrivals.ts:173-176,192-197). claimArrivalOwnershipR12.test.ts:91-101 pins that as success with a mocked read, so unit tests stay green while the real file is opened.
- **Coverage note.** [read] manuscripts/route.ts has no intake-hold check (only /ingest, :260), so the claim door is open while held; verifyCustody shares the plaintext fallback (arrivals.ts:247-253). [inferred] only a stale tab holds an old id (page.tsx:239,450); a restore (WSI-31) would revive more. Expected RED: today's claim succeeds over plaintext.
- **Depends on.** FILL-4a, FILL-4b, WSI-07, WSI-24, WSI-31, WSI-43

### FILL-5a · The vault has a named backup and it captures a consistent pair (expected RED today)
category `durability-recovery` · real KMS **no** · real vault **yes** · browser **no** · covered today **none**

- **Law.** An original is recoverable only while its ciphertext file, its landing row (wrapped DEK, hashes, key ARN), the KMS key and a credential survive together. Each needs a named, exercised capture; a copy of one half is not a backup of the original.
- **Procedure.** Land one fixture per format plus a 25 MiB file, and hold one more landing at WRITING_BYTES. Take the proposed capture (DB dump + vault copy) then. Diff rows to objects by artifact_ref, ciphertext sha256 and bytes. Scan the capture for a plaintext marker and for workbench_data content. Read the scheduled writers' pinned source for vault paths.
- **Pass criteria.** (1) A written capture names every object class, its volume and retention. (2) Every ARRIVAL_RECORDED row has its object in the capture, hashes equal; skew is refused or listed, never silent. (3) Orphans, .pending files and open intents are classified. (4) No plaintext or workbench_data inside. (5) Writer source names the vault; 0 hits today = RED.
- **Defeat candidate.** Two independent jobs: rsync -a of the vault, then pg_dump minutes later, no pairing check. It passes a quiet run and fails mid-landing. Variants: rsync --link-dest or cp -al snapshots (live files become nlink 2, which fileVault.ts:175 refuses), or copying all of /var/lib/docker/volumes (takes workbench_data plaintext).
- **Coverage note.** READ: no repo backup script references the vault (they pg_dump or copy code). Installed writer has no Source vault (WS_BACKUP_OPS_TRANSITION_FIXTURE_PLAN:25); held candidate omits it (WS_BACKUP_EXACT_SHELL_PREFLIGHT:13). A capture is a reconstructive backup under #1791. UNKNOWN: minisforum since 2026-10-12.
- **Depends on.** WSI-01, WSI-06, WSI-07

### FILL-5b · Disk loss: a cold-host rebuild returns every original byte-identical, and the loss window is measured
category `durability-recovery` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Losing the vault disk is survivable only if a rebuild from the capture, on a host holding none of the old state, reads every original back through the real KMS. A restore never run from cold, and judged by file hashes alone, is a hope.
- **Procedure.** Using 5a's capture, destroy vault and database together after landing one fixture post-capture. On a fresh stack of the same image: restore the DB with scripts/restore-governed.sh, restore the vault, mount a newly issued credential file. From a cold process decrypt each fixture and compare to hashes recorded outside the system. Then upload a new file.
- **Pass criteria.** Every pre-capture fixture decrypts through real KMS to its externally recorded sha256; the post-capture fixture is absent, as the external list predicts, and none reads wrong bytes. Objects are 0600, dirs 0700, nlink 1, readable by the container user. The new upload lands. RTO, RPO and the founder-only credential step are written down.
- **Defeat candidate.** A restore that passes on the dev host: tar extracted as root without --numeric-owner (container uid gets EACCES, which inspectEncryptedStoredObject files as INVALID_OBJECT, not ABSENT), or rsync -aH keeping hardlinks, or a drill that compares ciphertext hashes only and never decrypts, run while the old host's credential still exists.
- **Covered by.** `scripts/witness/ws-legacy-source-recovery-pg16.sh`, `scripts/witness/r20-writer-old-snapshot-joined.ts`, `lib/recovery/writerSourceRecoveryAuthority.ts`
- **Coverage note.** READ: legacy-source witness uses tar on a same-user /tmp vault with local-test keys (pg16.sh:61,92-101): no real KMS, uid mapping or cold host. Dockerfile:162-167 notes userns-remapped uids. WSI-31 judges resurrection, this judges survival. UNKNOWN: whether minisforum remaps uids.
- **Depends on.** FILL-5a, WSI-02, WSI-03, WSI-17, WSI-31

### FILL-5c · Partial loss and skew are detected per Work and never reported as custody held (expected RED today)
category `durability-recovery` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A Work may say its original is held only while that original is recoverable now. A stored label written at claim time is history, not evidence. Loss or skew must surface per Work, and never be repaired by invention or by silent deletion.
- **Procedure.** On a restored stack give six fixture Works one fault each: object deleted; one byte flipped; vault older than DB; vault newer than DB (orphan object); object chmod 000, then another hardlinked; empty volume at the same path. Run the census, then open, reopen, discard and Delete each Work. Record statuses, labels, copy, logs.
- **Pass criteria.** Each fault gets its own content-free per-Work class (ABSENT, CORRUPT_CIPHERTEXT, INVALID_OBJECT, orphan) in one census run; WSI-37 owns finer causes. No faulted Work shows its original as held; today source_custody stays 'source_custodied' = RED. Orphans listed, never auto-deleted. An empty volume raises one alert.
- **Defeat candidate.** A census that lstat()s or counts directory entries: it catches the deleted file and the empty volume, misses the flipped byte, the chmod and nlink faults and both skews. Or a status view that reads member_manuscripts.source_custody and reports healthy. Or an auto-heal that deletes orphans, turning loss into apparent erasure.
- **Covered by.** `lib/manuscript/source/encryptedLanding.ts`, `scripts/verify-ws01-source-custody.ts`
- **Coverage note.** READ: classifier encryptedLanding.ts:364-383; no runtime caller of verifyCustody (arrivals.ts:217) or inspectMemberIncompleteLandings (encryptedLanding.ts:796); label set only at arrivals.ts:192-196 and legacyRetirement.ts:334; no reader in app/lib/components. INFERRED: vault loss is silent. UNKNOWN: DB-side readers.
- **Depends on.** FILL-5a, FILL-5b, WSI-21, WSI-29, WSI-37, WSI-39

### FILL-6a · Live edge, compose chain, mounts and env are read from the running system
category `Read-only production preflight` · real KMS **no** · real vault **no** · browser **no** · covered today **partial**

- **Law.** A production fact counts only if read from the running system. The repo cannot stand in: canonical Caddyfile has neither edge hold, no tracked R20 override exists, and compose mounts vault_data only into maia, while R104 saw the media worker hold the vault live.
- **Procedure.** No values printed except FILE_STORAGE_PATH. (1) In maia-caddy GET localhost:2019/config/: ingest, sources and workbench-upload matchers in loaded order; sha256 host Caddyfile. (2) Each container: compose config_files label, sha256 of every file, Mounts, env key names. (3) .env.production key names. (4) Diff against canonical; list live-only items.
- **Pass criteria.** One row per plan assumption (holds loaded, every vault mounter, FILE_STORAGE_PATH, AWS_*/WRITER_SOURCE_* names exactly as the runbook step allows, chain files) with command, hash and CONFIRMED or CONTRADICTED; zero UNREAD. Re-read at run start and end is hash-identical or each change explained. Any CONTRADICTED stops the run for a plan fix.
- **Defeat candidate.** Reading Caddyfile and compose from a checkout, or the host Caddyfile edited but never reloaded, or a week-old snapshot: it shows clean while the loaded config, the live override chain or the media worker's vault mount differ.
- **Covered by.** `WSI-41`, `WSI-44`
- **Coverage note.** WSI-41 tests hold behaviour in-run and WSI-44 deploy preservation; none records live state beforehand. R104's hash-bound JSON is cited but absent from canonical docs/ops. Admin API reachability is inferred (no 'admin off' in repo Caddyfile).

### FILL-6b · Host facts KMS and the vault depend on are measured on minisforum: egress, clock, uid, credential mount
category `Read-only production preflight` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** KMS needs a reachable endpoint, a clock inside the signature window and a credential file the container uid can read; the vault needs link(). The repo disagrees on uid: Dockerfile says userns-remap may shift uid 1000, the SMTP mount says host soullab equals node. Measure, do not assume.
- **Procedure.** Region from founder step 1. Inside maia-sovereign (docker exec, node): DNS and TLS connect to kms.<region>.amazonaws.com:443, no API call; time a connect to 169.254.169.254. Clock: timedatectl, chronyc tracking, host vs container date. Uid: docker info userns, id, uid_map; stat (never cat) vault mountpoint and SMTP token; test -r; vault fs type.
- **Pass criteria.** Handshake in 3 s or less; IMDS refuses in under 2 s, not a hang. NTP synchronized, offset 1 s or less, host and container within 2 s. userns state recorded; node uid maps to a host uid that owns the SMTP token and can read it, else credential mount is UNPROVEN for the rig. Vault fs is local and link-capable.
- **Defeat candidate.** Probing from the Mac Studio, the host shell or a throwaway container, a signed AWS CLI call (makes a CloudTrail event, hides SDK, DNS and proxy differences), or taking uid from the Dockerfile comment: each passes while maia-sovereign still cannot reach KMS or read its credential.
- **Coverage note.** WSI-05 and WSI-16 meet these only as opaque SDK errors on the rig; nothing measures minisforum. Repo contradicts itself on uid (Dockerfile:163, compose:207). Reads production metadata only.
- **Depends on.** FILL-6a

### FILL-6c · Residue channels are baselined before the run: container logs, Postgres logging, backups, replica
category `Read-only production preflight` · real KMS **no** · real vault **no** · browser **no** · covered today **partial**

- **Law.** Fictional data is gone only if no channel outside the app kept it. Record what captures it first: log rotation (compose: 10 MB x 3), Postgres logging (compose sets none; repo docs advise ALTER SYSTEM log_statement=all), two 02:00 pg_dump jobs, and a standby seen down on 2026-10-01.
- **Procedure.** Settings and metadata only; open no log line or table row. docker inspect LogConfig and stat log files (size, mtime): maia, postgres, media worker, caddy. Postgres: pg_settings (setting, source) for log_*, archive_mode, wal_level; pg_replication_slots; pg_stat_replication count. Host: /etc/cron.d/maia-backup, sha256 of maia-backup, newest dump name and size.
- **Pass criteria.** Sheet per channel: live value, source, retention lower bound (age of oldest retained log file). If that is under run plus census delay, WSI-38 must stream logs into the packet. If log_statement captures bound parameters, WSI-38 runs under it. Next 02:00 time, newest pre-run dump, slot and standby state stated. WSI-31, 38, 47 receipts cite the sheet hash.
- **Defeat candidate.** Taking config from compose and docs (30 MB logs, no statement logging, a backup exists) or checking only that a dump file exists. WSI-38 then passes on a log setting nobody measured, and the first 02:00 dump silently carries the run's fictional rows and wrapped keys.
- **Covered by.** `WSI-31`, `WSI-38`
- **Coverage note.** WSI-31 measures restore and WSI-38 scans logs, each assuming its configuration. Backup and standby facts come from 2026-10-12 and 2026-10-01 records; live log and statement settings are unread.
- **Depends on.** FILL-6a

### FILL-7a · Lift is narrowed to declared witness members on every door, with an end time
category `exposure-window` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Until the step-6 pass, only a declared list of witness members, with an end time, can cause a row, file or KMS call. READ: ingest has no roster check (route.ts:219-265), proxy skips it (proxy.ts:793), the Writer grant excludes it (restrictedCorridor.test.ts:41), /press/manuscript is free tier (accessMatrix.ts:108).
- **Procedure.** In the lift configuration, not the harness: two fictional members, one listed, one an active pilot tester NOT listed. From the public edge, and from an allowed address too, POST valid, malformed and no-key files to ingest and from /press/manuscript. Count rows, vault files and CloudTrail events before and after each. Read the list.
- **Pass criteria.** Unlisted: one identical refusal for valid and malformed input, sent before the body is read; zero rows, files and KMS events, on API and page. Listed: one upload lands. The list holds only witness ids and an end time, both recorded before lift. The beta roster is not the list.
- **Defeat candidate.** Reusing the Writer roster predicate (writersStudioBetaAccess) as the list: it refuses non-members and admits every pilot tester. Also a guard after the 400/415 checks, which makes an oracle, or an edge IP rule alone, which admits any session from an allowed address.
- **Covered by.** `WSI-42`, `WSI-41`
- **Coverage note.** WSI-42 measures audience on the harness only. INFERRED: the lift configuration (edge rule or route guard) is not what the harness runs. UNKNOWN: Caddy config is off-repo; which layer enforces is undecided; the runbook has no widening step after step 6.
- **Depends on.** WSI-40, WSI-41, WSI-42

### FILL-7b · Kill criteria are predeclared and a standing census detects a breach in the open window
category `exposure-window` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** While intake is open, predeclared thresholds close it, and a read-only census runs at a fixed cadence from lift to close; a breach reaches a human. READ: ingest applies per-file caps only (route.ts:57-58), no rate limit or quota; the KMS client makes up to 3 attempts per call (sourceKeyAuthority.ts:140).
- **Procedure.** Before lift, commit thresholds, cadence and the named reader. On the rig, inject each breach: an unlisted row, a stranded intent, a ciphertext file with no row, a GenerateDataKey count over budget, a non-content-free context, an end time passed. Time each from injection to a human-visible alert.
- **Pass criteria.** Thresholds and cadence are committed before lift, not after a first reading. Each breach is flagged within one cadence on a channel that reaches a human, tested end to end. A clean window reports zero. A census that cannot read the DB or CloudTrail reports UNKNOWN and counts as a breach.
- **Defeat candidate.** A census that logs to console or mails through a channel delivering to no one (NON_DELIVERY_REGISTER E1, E2); one that reports zero when CloudTrail or the DB is unreachable; or thresholds set after the first reading.
- **Coverage note.** Nearest are WSI-21 and WSI-36, one-shot on the harness. INFERRED: no standing production census over landing intents exists in scripts/. UNKNOWN: current alert recipients; register E1/E2 were read as of 2026-10-01, and the KMS request quota is not in the repo.
- **Depends on.** FILL-7a, WSI-21, WSI-35, WSI-36

### FILL-7c · Closing the window works with uploads in flight and accounts for every window item (expected RED today)
category `exposure-window` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A kill decision closes intake within a bounded, measured time, and every landing intent, arrival and ciphertext file made in the window gets a named disposition. READ: the app hold is source-bound (releaseAuthority.ts:12-20), so a source kill needs a deploy; discardUnclaimedArrival has no non-test caller and sets no expiry (lines 9-10).
- **Procedure.** On the rig in the lift configuration, start three uploads: one mid-write, one stranded intent, one unclaimed arrival. Fire the predeclared kill act. Probe the public edge every 10 s for time to 423. Run the census and dispose of each window row, intent and file using only a committed script or route.
- **Pass criteria.** Kill-to-423 is within the FILL-7b bound on every probe path, and no in-flight upload reports a false success. Every window item has a disposition from a closed list (completed after re-lift, discarded, residual by design). An unclassified item or a hand-run SQL fails. Expected RED today if no operator path exists.
- **Defeat candidate.** Re-hold declared from the Caddyfile or a backup without a probe from the public edge (runbook section 5: the 29 Oct lift removed neither hold); a kill that needs a source deploy; or a census that lists window arrivals but offers no disposition for members who never return.
- **Covered by.** `WSI-41`, `WSI-47`, `WSI-19`
- **Coverage note.** WSI-41 rehearses reinstating the holds and WSI-47 is reversible. From titles only (bodies not available): neither is stated to time the kill, run it with uploads in flight, or classify window items. INFERRED: no scheduled expiry sweep is wired.
- **Depends on.** FILL-7a, FILL-7b, WSI-15, WSI-19, WSI-41

### FILL-8a · Account closure with Source custody ends in a deliberate refusal or a complete erasure, never a bare 500 or a half state (expected RED today)
category `Account closure` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A member who closes their account while Soullab holds their originals (arrival, wrapped key, ciphertext, landing intent) gets one of two lawful answers and every store matches it. A refusal that exists only because a foreign key rolled the transaction back is an accident, not a decision.
- **Procedure.** Five fictional members with GOVERNED_CONTENT tables empty: claimed docx original (real KMS), unclaimed arrival, stranded landing intent with ciphertext on disk, pasted-text Work, no-Writer control. Snapshot rows, vault tree, auth_sessions, app log. POST /api/members/delete-account with the real cookie and username; diff; call an authed GET.
- **Pass criteria.** Each held member gets (R) a 4xx with a stable code other than 'Failed to delete account', accountChanged:false, byte-identical snapshots and no SQLSTATE 23503 in the app log, or (E) the FILL-8c end state. Any 5xx, any 2xx with Source rows or files left, or revoked sessions with the member row present fails. Control: 200, member gone.
- **Defeat candidate.** Today's route as read: GOVERNED_CONTENT (route.ts:78-133) names no manuscript or Source table, so the preflight passes, DELETE FROM members (:267) hits ON DELETE RESTRICT (20260824000001:24, 20261026000001:17), the tx rolls back and the answer is a 500 (:285-290). Adding only the arrivals table to the list still 500s on the stranded intent.
- **Covered by.** `WSI-20`
- **Coverage note.** WSI-20 only tries removal of everything held. Nothing asserts the HTTP outcome, the FK-accident log signature or snapshot equality on refusal. Pasted-text Works need no hold lifted (manuscripts/route.ts:473-477), so a 500 is likely today (inferred from RESTRICT FKs, not run). WSI bodies unseen: harness commit 4b33659d2 is not in this worktree.
- **Depends on.** WSI-01, WSI-06, WSI-15, WSI-20

### FILL-8b · The closure answer the member reads and the doors they can use match the stores: no silence, no 'all associated data', a member door for every blocker (expected RED today)
category `Account closure` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** The member is told in words what happened to their account and what Soullab still holds, and can remove what blocks closure themselves. The Account page may not promise more than the route keeps, and a refusal may not look like nothing happening.
- **Procedure.** In a real browser, as each held member from FILL-8a: open Account Settings, record every visible sentence, type the username, press Delete My Account, then record sentences, localStorage.beta_user and a reload. Remove each blocker class from the pg_constraint census of FKs to members through the shipped UI only (no function imports), then retry.
- **Pass criteria.** Before and after the click, no sentence says 'all associated data' or permanent erasure while permanentErasureCertified is false. A non-2xx shows a sentence saying nothing changed and what is held; beta_user survives a refusal and is cleared only on 2xx. Every blocker class has a UI door, and closure then completes with no support contact.
- **Defeat candidate.** Today's page as read: AccountSettings.tsx:2758 promises 'all associated data' and deleteAccount (:845-865) acts only on res.ok, so a 409 or 500 shows nothing. discardUnclaimedArrival has no non-test caller here and eraseManuscript.ts:113 reaches only claimed arrivals, so an unclaimed arrival and a stranded intent have no member door.
- **Covered by.** `WSI-39`, `WSI-19`
- **Coverage note.** WSI-39 checks sentences against live state and WSI-19 tests discard; neither is shown to cover the Account page, silence after a non-2xx, or whether any member door reaches an unclaimed arrival or stranded intent. accountDeletionHonesty.test.ts pins route.ts strings only (ROUTE_REL, line 22), not the component.
- **Depends on.** FILL-8a, WSI-19, WSI-24, WSI-39

### FILL-8c · Erasure on account closure is physical, complete and refusal-marked, including with KMS unreachable
category `Account closure` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** When closure erases, one transaction removes the member's rows, queues every ciphertext path (arrival refs and stranded-intent refs) and tombstones every arrival and intent id; the worker then destroys the files. A wrapped key and its file leave together, and no cloud call is needed to erase.
- **Procedure.** Reach the erase branch (route as changed, or the member's own doors from FILL-8b). Record vault tree and every ref in arrivals, intents and queue. Block KMS as in WSI-29, run scripts/ops/sweep-vault-erasure-queue.ts once, compare. Restore the pre-closure dump data-only into a shadow and count what returns. Read CloudTrail.
- **Pass criteria.** After the sweep: member row gone; zero rows under every FK to members (pg_constraint census); queue empty; no vault file named by a pre-closure arrival or intent ref and no unreferenced file; tombstones for each arrival and intent id; R20 ledger sealed, carrying no member id; restore refuses all of them; no KMS Decrypt inside the closure window.
- **Defeat candidate.** Switching the member FKs to ON DELETE CASCADE: rows and wrapped keys vanish, the ciphertext stays with no queue row and no tombstone (the WS-DELETE-01 forbidden state), and a restore brings the rows back. Or a closer that queues arrival refs only, as eraseManuscript.ts:113,190 does, and strands the file of an intent with no arrival.
- **Covered by.** `WSI-25`, `WSI-26`, `WSI-28`, `WSI-29`, `WSI-31`
- **Coverage note.** WSI-25/26/28/29/31 prove these properties for Delete Work and discard; none drives account closure, whose tx (route.ts:239-268) deletes no Source row, queues nothing, tombstones nothing. RED today would be vacuous: the erase branch does not exist, so the two defeat candidates carry the lethality.
- **Depends on.** FILL-8a, FILL-8b, WSI-15, WSI-28, WSI-29, WSI-31, WSI-35

### FILL-9a · FILL-9a Member data export names every Writer store it includes or omits (expected RED today)
category `Export and access` · real KMS **no** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** A member's export, and the words describing it, account for every store holding that member's Writer content (Works, sections, revisions, extracted text, filenames, arrivals, unclaimed uploads, vault objects). Each is included, or listed as omitted with a reason and a way to ask. No 'all your data' claim while anything is omitted.
- **Procedure.** Seed fictional member A: 2 Works (one with a claimed original), 1 unclaimed arrival, 1 discarded, 1 Deleted Work; member B with a Work. As A, POST /api/members/export-data with B's id in the body. Census member-keyed tables (information_schema) plus the vault listing, classify each Writer store, diff against the export.
- **Pass criteria.** Every census store holding A's Writer content is in the export or in a named omitted list with reason and request route. Nothing of B's appears. The Deleted Work and discarded arrival are absent; stranded intents are named. The Account copy matches the list. A store the census cannot classify fails the run.
- **Defeat candidate.** Export adds a Works query but hard-codes its store list, so the next table falls out silently; or route.test.ts is made green by a blanket mock returning empty rows (it mocks 5 queries positionally, :58-64), so omission is never observed; or the copy keeps 'all your data'.
- **Coverage note.** READ: export selects only members, member_settings, member_sessions, developmental_memories, google credentials (route.ts:62-106); copy says 'Download all your data' (AccountSettings.tsx:2738); test pins auth and settings whitelist. No manuscript table in delete-account's list. Sibling censuses WSI-20/30 inferred from titles.
- **Depends on.** WSI-06, WSI-20, WSI-30

### FILL-9b · FILL-9b A held original is retrievable byte-identical, or every door says it is not (expected RED today)
category `Export and access` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A member can get back exactly the original they uploaded, from a route that proves ownership and state, or every door and sentence says they cannot. The run records which founder ruling is in force; neither recorded is a FAIL. No door serves a plaintext, unverified or foreign copy.
- **Procedure.** Ruling P (retrievable): as owner fetch each of the 4 formats and compare sha256 to the WSI-06 upload hash; repeat as member B, for a discarded arrival, a Deleted Work and a non-recorded intent; read headers. Ruling D (absent): enumerate every route reaching the decrypt chain and read the copy. Run both with KMS denied.
- **Pass criteria.** P: owner bytes equal the upload hash; B, discarded, Deleted and unverified intent get one identical 404; attachment, nosniff, no-store, type from the verified format; KMS denied gives a refusal with no bytes. D: only claim and custody check reach decrypt, no sentence implies download. No ruling recorded: FAIL.
- **Defeat candidate.** Route copied from writers-studio/sources/[id]/file (inline, Content-Type from stored client MIME): hashes match, yet a hostile HTML saved as .txt runs in the app origin; or keyed by arrival id alone and serving a BYTES_VERIFIED intent; or caching decrypted bytes on disk to survive a KMS outage.
- **Coverage note.** READ: no route returns original bytes; decrypt is reached only by claimArrival (arrivals.ts:174) and verifyCustody (:252), which hash and discard. Plaintext sibling door sources/[id]/file :11-33 (rows unknown; POST always 423, sources/route.ts:35). Copy 'Your original is always preserved' fixtures.ts:367. UNKNOWN: ruling P or D.
- **Depends on.** WSI-06, WSI-17, WSI-25

### FILL-9c · FILL-9c Export under KMS fault and scale is never silently partial or fatal (expected RED on failure copy)
category `Export and access` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** An export never reads as complete when it is not. Each item needing custody to read is listed with hash and status (included, unreadable-now, not-included); a fault yields a declared partial that the member is told about; no export can take the service down or pin the database.
- **Procedure.** Seed member A with 20 originals at the 25 MiB cap (ingest route.ts:57). Export normally; compare each hash to WSI-06. Remove the Decrypt grant mid-run. Run two exports at once, watching container RSS, restarts and pool waiters; compare CloudTrail Decrypt count to items included. If originals are ruled out, mark KMS arms N/A citing the ruling.
- **Pass criteria.** Normal: archive complete, hashes match, Decrypt count equals originals included. Fault: manifest marks failed items unreadable-now and the export partial, and the UI says so. Scale: no 500, OOM or restart; no DB transaction spans a KMS call; Cache-Control no-store.
- **Defeat candidate.** Export base64-inlines every original into one JSON.stringify string (as route.ts:126 does for rows): about 16 max-size originals pass V8's string cap (inferred) and return a bare 500; or a catch drops failing items and returns 200 'complete'; or decrypt runs inside an open transaction.
- **Covered by.** `WSI-32`, `WSI-33`, `WSI-36`
- **Coverage note.** READ: one in-memory JSON string (route.ts:126); generic 500 on any error (:132-137); UI ignores non-OK (AccountSettings.tsx:826-838); no route Cache-Control (:126-131); no mem_limit in docker-compose.production.yml. INFERRED: WSI-32/33/36 cover upload and reopen only. UNKNOWN: host memory limit, Caddy response timeout.
- **Depends on.** WSI-06, WSI-32, WSI-33, WSI-36, FILL-9b

### FILL-10a · FILL-10a Standing claims about hosting and third parties are reconciled with the KMS dependency
category `disclosure-and-claims` · real KMS **no** · real vault **no** · browser **no** · covered today **partial**

- **Law.** No standing statement about hosting, third parties or what leaves the host may deny the KMS dependency once KMS is used (MARKETING_CLAIM_DISCIPLINE: Live answers to a runtime fact). The run checks dispositions; wording is the steward's (CLAIM_STATE_AUTHORITY rule 1).
- **Procedure.** Run one recorded grep at the candidate commit over app/, components/, docs/pitch and root *.md for 'not AWS|no third-party|no cloud|third-party providers|local file system'. Classify each hit contradicted, reconciled or unaffected, with a reason. Fetch /privacy, /maia/privacy and /powered-by from the built image; served text must equal the classified text.
- **Pass criteria.** Zero contradicted hits. Each seed has a disposition: app/privacy/page.tsx:305, app/maia/privacy/page.tsx:112, app/powered-by/page.tsx:178,326,392, PRIVACY_POLICY.md 7.1 and 9.1. The provider table names AWS KMS, its purpose and 'no manuscript bytes'. A second person re-running the grep gets the same hit set.
- **Defeat candidate.** Adds AWS KMS to PRIVACY_POLICY.md (no code reference to that file found) while the served /privacy page still says 'not AWS'; or edits the seed lines and misses another copy of the phrase.
- **Covered by.** `WSI-39`
- **Coverage note.** WSI-39 checks sentences members see against live state; no listed item sweeps standing pages (titles only; WSI texts not in repo). Adjacent claim 'Delete means delete' (app/privacy/page.tsx:277) belongs to WSI-30/31.

### FILL-10b · FILL-10b What members are told about AWS visibility and key loss equals what the run measured
category `disclosure-and-claims` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Disclosure of the KMS dependency states only measured facts and omits none the run observed: what AWS can see, how often it is called, and the difference between unreadable-until-access-returns and permanently unrecoverable.
- **Procedure.** From the run's CloudTrail records and call ledger, list every field AWS holds and the calls per upload and reopen. On a founder-provisioned disposable second key: disable, reopen, enable, reopen, schedule deletion, reopen, cancel; open a pasted draft throughout. In a browser, find the notice before a file is chosen. Diff notice against measurements.
- **Pass criteria.** Notice lists every CloudTrail field observed, including the per-file context digest (sourceEnvelope.ts:79-100) that repeats for one file. Says uploads and reopens call AWS; outage means unreadable until access returns; key deletion means permanent. Scopes to uploaded originals, not pasted drafts. Reachable before a file is sent. Each clause traces to a measurement.
- **Defeat candidate.** Copies runbook section 2 ('generated or unwrapped, when, by which principal') and calls the context content-free, omitting the stable per-file digest; or says 'if the key is lost, files are gone' for the outage case the run showed recoverable.
- **Covered by.** `WSI-18`, `WSI-35`, `WSI-36`
- **Coverage note.** WSI-18, 35, 36 measure the facts; none compares a disclosure to them. None of PRIVACY_POLICY.md, Privacy-Policy.md, powered-by, provider-policy.json mentions AWS/KMS. Intake copy says only 'encrypted before durable storage' (app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx:307,393); that route being the member door is unverified.
- **Depends on.** WSI-17, WSI-18, WSI-35, WSI-36

### FILL-10c · FILL-10c The KMS dependency is a governed provider record and disclosure cannot disagree with release state
category `disclosure-and-claims` · real KMS **no** · real vault **no** · browser **yes** · covered today **none**

- **Law.** Every off-host dependency that receives member-linked metadata has a provider record the guard enforces, and public words match release state: a held image does not say KMS custody is active; a released image does not omit it.
- **Procedure.** Read scripts/provider-policy.json in the candidate commit for an AWS KMS record naming function, tier, data received and never received. In a scratch copy add a second @aws-sdk/client-kms import, then delete the record; run check-provider-governance each time. Render /privacy and the intake screen on the held and released images; compare each with its release state.
- **Pass criteria.** Record is in the candidate commit. The guard exits non-zero for a second KMS client import and for the missing record. The held image makes no current-fact claim that originals are KMS-wrapped; the released image shows the AWS disclosure. Any mismatch fails.
- **Defeat candidate.** Adds a provider-policy.json entry nothing reads (check-provider-governance.ts:36-38 holds OpenAI rules only); or ships one static privacy paragraph claiming KMS custody while app/api/sovereign/manuscripts/ingest/route.ts:260 still returns 423.
- **Coverage note.** WSI-40 and WSI-43 cover held wording and test requalification; none covers provider records or guard rules. No aws/kms match in scripts/check-provider-governance.ts or docs/canon/PROVIDER_GOVERNANCE.md; provider-policy.json has no key-custody class.
- **Depends on.** WSI-40, WSI-43, FILL-10a

### FILL-11a · Only declared custody code reads the retained extraction (static scan plus statement census)
category `purpose-limitation` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** The extracted text, original filename and plaintext SHA-256s kept in Postgres are read only by custody statements declared before the run. A new reader, or a registry scope that could name these columns, is a purpose change needing a ruling, not a join added for convenience.
- **Procedure.** 1) Commit an allowlist of (file, statement shape); scan tracked app, lib, scripts and pg_proc bodies for source_text, original_filename, artifact_hash, original_sha256, SELECT * or to_jsonb on both tables; diff. 2) On the shadow run pg_stat_statements track=all through the lifecycle plus history; diff shapes touching those columns.
- **Pass criteria.** Static and runtime sets each equal the committed allowlist. Zero unlisted shapes, zero SELECT *. A source_text reader outside arrivals.ts, encryptedLanding.ts, legacyRetirement.ts, or a filename reader outside the history route, fails. scripts/verify-* and witness/* are listed as tooling.
- **Defeat candidate.** A later PR makes the history route select a.* for a preview, or adds a nightly job summarising every text column. Every functional step still passes; only the allowlist diff goes red. The harness must be fed this reader and kill it.
- **Coverage note.** read: no test enumerates readers. source_text: arrivals.ts:149, encryptedLanding.ts:557, legacyRetirement.ts:192. filename: history route:124. hash also: writerSourceRecoveryAuthority.ts:502. Registry identified.source_text (capabilityAuthorityRegistry.ts:456) is DECLARED, DOCUMENTARY_ONLY; inferred: a library scope, no resolver found.
- **Depends on.** WSI-01, WSI-06, WSI-17, WSI-22, WSI-25

### FILL-11b · No sink downstream of the arrival: model providers, memory, embeddings and indexes see nothing
category `purpose-limitation` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Taking a file into custody and claiming it feeds no model provider, memory atom, embedding or search index. Extracted text reaches cognition only through the member's authorized disclosure of a Work section, never from the arrival row.
- **Procedure.** Seed a unique sentinel in text and filename. Point model transports at a loopback recorder, deny other egress except KMS, snapshot memory, embedding and index tables. Run upload, create Work, claim, reopen, a second upload discarded; no Ask. Scan the whole database for the sentinel (ws-delete-01 r20 scanner), dependency catalogs and the recorder.
- **Pass criteria.** Zero sentinel in the recorder and egress log. Zero new member rows in memory, embedding and index tables. Sentinel only in the committed holder list (arrival row, Work title, section and revision rows). No view, trigger, publication or index depends on the text columns. Control: a canary call on the same transport reaches the recorder.
- **Defeat candidate.** After claim a helper sends the first lines of source_text to a model for a title or summary, or a backfill embeds every text column. The member sees nothing wrong; only a recorder hit or a new embedding row exposes it. The control call proves the recorder can see traffic.
- **Coverage note.** read: arrivals.ts, encryptedLanding.ts, legacyRetirement.ts and manuscripts/route.ts import no model, memory or embedding client; parseUpload.ts imports only parsers. Nothing pins that. inferred: transitive imports unchecked. Unknown: provider egress on minisforum.
- **Depends on.** FILL-11a, WSI-06, WSI-22

### FILL-11c · Each retained field has a purpose, an exercising reader and an end; abandoned uploads do not outlive it silently
category `purpose-limitation` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Every retained extraction field (source_text, original_filename, source_text_hash, artifact_hash, original_sha256) has a declared purpose, a reader the run exercises and a lifetime. A field nobody reads, or an abandoned upload with no declared end, is a founder finding. Removal on request is WSI-19/20.
- **Procedure.** Commit a ledger: field, purpose, reader, end. From the FILL-11a census list which fields any statement selects after claim. Leave one upload unclaimed, advance the clock (or set created_at back on the shadow) 25 hours and 31 days, run every periodic job the compose stack runs, compare row and ciphertext to the declared end.
- **Pass criteria.** Each field is exercised by a named reader or carries a written founder disposition (keep as provenance, minimize, drop). The unclaimed upload's row and ciphertext match the declared end at both clock jumps. No sweeper is lawful only if declared and the member is told. An undispositioned field fails.
- **Defeat candidate.** Comment-only retention: the index comment promises 24-hour sweeps (20261022000002:9) while no job runs. Static and doc checks pass; only the clock jump shows row and file still there. Variant: a sweep deletes the row but orphans the ciphertext.
- **Coverage note.** read: discardUnclaimedArrival.ts:9 says no clock expiry is inferred; the index comment (migration 20261022000002:9) names 24-hour sweeps; explicit non-test DELETEs on the table: discard :51, legacyRetirement.ts:355; Work delete cascades by FK. No sweeper in tracked source. Unknown: minisforum cron or host jobs.
- **Depends on.** FILL-11a, WSI-19, WSI-21, WSI-25

### FILL-12a · Every intake non-delivery state has a register line that matches measured delivery
category `register / declared non-delivery` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** A signal that ends in a log, a DB row or a member message reaches no human. That is a declared non-delivery state and needs a register line in the same change (NON_DELIVERY_REGISTER.md:9-10). Read: the register has no Writer-source, KMS or vault line (L25-58). Inferred: the plan names fault outcomes, not their destinations.
- **Procedure.** From the WSI-15/16/18/21/28 fault runs, tabulate each fault against every sink it reached (reply, stdout, DB row, human). Seeds: ingest log (ingest/route.ts:394), claim fallback (manuscripts/route.ts:467,482), unwired inspector (encryptedLanding.ts:796), owed-erasure log (run-media-worker.ts:239). Diff vs register; run check:record-shas.
- **Pass criteria.** Every fault with no human-reaching sink has exactly one register row: all 8 columns, evidence class set, 'Actually delivered' equal to the table, 'Closes when' naming a witness. Rows closed by FILL-12b/c cite them. Zero unlisted sinks; check:record-shas exits 0.
- **Defeat candidate.** Register-by-narrative: only a KMS-alert row is added, or 'Actually delivered' says 'logged'. A check that a Writer-source row exists passes it while the inspector, claim-fallback and owed-erasure sinks stay undeclared.
- **Coverage note.** No existing obligation (by title) tabulates where a fault signal goes. Register rows S1-S4, E1-E6, O1-O2, D1 hold no Writer-source, KMS or vault state (NON_DELIVERY_REGISTER.md:25-58). Titles only: WSI bodies were not provided.
- **Depends on.** WSI-15, WSI-16, WSI-18, WSI-21, WSI-28, WSI-37, FILL-12b, FILL-12c

### FILL-12b · KMS and credential faults page a human through a channel independent of Resend
category `alerting / KMS availability` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** The KMS ruling accepts availability risk (runbook:35-37). Read: in the routes read, a KMS fault is reported only by console.error (ingest/route.ts:394, manuscripts/route.ts:482); /api/health has no KMS component (health/route.ts:60-63); register E1 records a Resend outage (2026-10-01). Inferred: a fault stays invisible until a member reports it.
- **Procedure.** Production image, RESEND_API_KEY invalid, alert channel set as production would be (founder-designated test destination). Inject creds absent, AccessDenied, key disabled, endpoint unreachable. Per fault: upload and reopen, 20 repeats; then 3 member-caused refusals; then a hung sink. Capture egress and the provider-side body.
- **Pass criteria.** Per infra fault, at upload and reopen: one SMS/Slack-accepted alert within 60 s (proposed), fault class only, no member, Work, file, intent or key data; 0 calls to api.resend.com; at most 1 per class per window; 0 for member-caused refusals; hung sink adds no reply latency; a human records receipt.
- **Defeat candidate.** A hook in the ingest SourceLandingIncompleteError branch calling deliverHumanSafetyAlert. Every cause wraps to one code (encryptedLanding.ts:688), so member errors page; the body carries member=<uuid> (humanSafetyAlert.server.ts:32); an ignored delivered=false reads as quiet success.
- **Coverage note.** Unknown, not in repo: whether production has a safety phone or Slack webhook now (register E2 records absent on 2026-10-01 only) and whether anyone reads docker logs. not_configured must FAIL, never skip. Titles only for adjacent WSI obligations.
- **Depends on.** WSI-05, WSI-16, WSI-18, WSI-37, WSI-38

### FILL-12c · Stranded intents and unreadable originals reach a human, not only a logged 503
category `alerting / stranded state` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Read: inspectMemberIncompleteLandings (encryptedLanding.ts:796-822) has no caller in the tree, tests included; a failed upload leaves its intent and logs once (ingest/route.ts:390-398). Inferred: a row recorded for no one is the register's non-delivery class; the function takes one memberId, so a fleet sweep needs a new entry.
- **Procedure.** Leave one intent each in PENDING_BYTES, WRITING_BYTES, BYTES_VERIFIED, plus one original unreadable under KMS outage and one tampered. Run the sweep through its production entry after the declared age threshold, then complete a retry. Capture the provider-side message and the call graph.
- **Pass criteria.** The entry is reachable from a route, worker or schedule in the production image and was executed. One count-only alert (state, oldest-age bucket) reaches a human by a non-Resend channel; none for rows under the threshold; outage and tamper are not worded as one stated cause; it clears after the retry completes.
- **Defeat candidate.** Give the inspector a caller that only logs, or one reachable from tests or a CLI; or page 'KMS down' for every CRYPTO_REFUSED (sourceEnvelope.ts:244 flattens outage and tamper alike); or page rows still inside the threshold.
- **Covered by.** `WSI-21`
- **Coverage note.** Title-based inference: WSI-21 finds strays at end of run in the harness; nothing in the set makes production look or tell a human. PENDING_BYTES rows carry no lease (migration 20261026000001:66-71), so the age threshold must be declared in the run record.
- **Depends on.** WSI-15, WSI-21, WSI-37, FILL-12b

### FILL-13a · FILL-13a In-limit hostile files cannot stall the web process for other members, and parsing has an enforced time bound
category `parser isolation` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** Parsing an upload is a bounded act. No file within the 25 MiB limit may stall the single Node process that serves every member, or run past a wall-clock bound declared in advance; past the bound the parse is stopped, not just abandoned.
- **Procedure.** On the WSI-01 subject, poll /api/health?simple=true at 20 Hz from outside while each <=25 MiB file is uploaded, alone then 3 at once: EPUB with 100k absent spine items; EPUB with 5k-deep XHTML; EPUB with understated size headers; DOCX with a ~1 GiB deflated part; DOCX with a 2M-run document.xml; PDF with 50k tiny pages. Log latency, reply time, CPU, RSS.
- **Pass criteria.** Bounds fixed before the run (proposed: probe max 1 s, p99 250 ms, reply 20 s). Every fixture is answered inside the bound with no probe breach, and container CPU is idle within 5 s of the reply. A 400/401/423 reply means the parser was not reached: INSTRUMENT FAILURE, not a pass.
- **Defeat candidate.** A Promise.race timer around parseUpload: it cannot fire while synchronous XML parsing holds the loop, and the parse keeps burning CPU after the refusal. Or a worker never terminated on timeout. The probe and the post-reply CPU check catch both; the container healthcheck (30 s, 5 retries) would not.
- **Coverage note.** READ: no worker, timeout or AbortSignal near the parsers (grep); parse awaited inline (route.ts:347) in one process (entrypoint.sh:11). EPUB has entry/size caps (parseUpload.ts:183-186, 381-387), DOCX none (503-509). No hostile-input test. UNKNOWN: outcome today; whether maxDuration (route.ts:5) or the minisforum Caddy enforces any time limit.
- **Depends on.** WSI-01

### FILL-13b · FILL-13b Parsing never fetches or reads what an uploaded file points to, and entity expansion is bounded
category `parser isolation` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** A parser may use only the bytes it was handed. A file must not make the server open a connection, read a path on the host or container, or expand into unbounded text. What a file points at stays a pointer.
- **Procedure.** Stand up a canary HTTP/DNS listener and a sentinel file with a unique fictional token, both reachable by the container's node user; first prove a call from inside the container is logged. Upload files naming them: DOCTYPE SYSTEM entities, 10-level nested internal entities, OPF/XHTML remote refs, DOCX linked pictures (http, file), PDF URI and external-file refs.
- **Pass criteria.** Control call logged. Then zero canary hits at the network layer, the token absent from every reply, extracted text, warning and log line, nested-entity output <=2x input size, and each fixture answered inside the 13a bound. A 400/401/423 reply means the parser was not reached: INSTRUMENT FAILURE.
- **Defeat candidate.** A change that turns resolution on (an XML parser with an entity resolver, mammoth external-file access on, a PDF option following external streams) passes every happy-path test. Also a canary on an address the container cannot reach passes vacuously; the positive control fails on that setup.
- **Coverage note.** READ: no test names DOCTYPE, ENTITY or a canary; mammoth gets {buffer} only (parseUpload.ts:98-99); XML parsed by @xmldom/xmldom 0.8.15 with default options (parseUpload.ts:205-212; package-lock). UNKNOWN: whether these versions expand or follow references; node_modules absent, not read.
- **Depends on.** WSI-01

### FILL-13c · FILL-13c The time bound admits real books, and a stopped parse is told truthfully and leaves nothing behind
category `parser isolation` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A bound that turns away a member's real book is a harm too. The bound must admit legitimate near-limit books; a parse that is stopped must say so truthfully, create no row, file or KMS call, and leave the process able to serve the next upload.
- **Procedure.** Generate fictional real-structure books: 25 MiB DOCX with images, EPUB with 300 chapters, 1,200-page text PDF, 2 MB text. Upload each, 3 at once; record reply times. Then upload each 13a file the bound stops, and read the reply, DB rows, vault, temp dirs, KMS ledger, RSS; finish with a small valid file.
- **Pass criteria.** Every real book returns 200 with text equal to its unloaded run, inside the bound with >=2x margin under load. Each stopped parse: a reply naming the cause that is not the generic 'try a .docx' line, zero rows, files and KMS calls, RSS and CPU at baseline within 30 s, and the next small upload returns 200.
- **Defeat candidate.** Set the timeout to 2 s: every hostile fixture dies on time and 13a is green, but the 1,200-page PDF and the 300-chapter EPUB are refused. Or the stop throws a plain Error, which route.ts:357-361 reports as an unsupported file while the worker keeps running.
- **Coverage note.** READ: a parse error that is not UnsupportedUploadError becomes the generic 422 'We could not read that file. Try a .docx...' (route.ts:357-361); parse precedes custody (route.ts:347, 379). No stop path yet. Founder-only workbench upload runs the same libraries inline (uploads/route.ts:34, 129-135): not covered unless added.
- **Depends on.** FILL-13a, WSI-01

### FILL-14a · FILL-14a A 25 MiB original passes the shipped edge: config identity, at-limit upload, member origins
category `edge-transport` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** A file of exactly 26,214,400 bytes (MAX_FILE_BYTES, ingest/route.ts:57), sent by the real client through the edge that will ship, is accepted and lands as one envelope. The edge is byte-identified, not assumed from the repo Caddyfile, which has no request_body or timeout directive (API proxy, Caddyfile:316-322) and differs from the live file.
- **Procedure.** Read-only capture of the live Caddyfile and maia-caddy image digest; harness runs both minus only the two hold blocks (diff kept; body-size and timeout directives listed). Real browser uploads fictional DOCX, PDF, EPUB of exactly 26,214,400 bytes, each under 2,000,000 extracted chars (route.ts:58,364). OPTIONS from each declared client origin for the retry header.
- **Pass criteria.** Harness config sha256 equals live minus the two holds. Each file: 200, one sourceArrivalId, one envelope, byte-identical decrypt (WSI-06); client pre-check passes at the limit (page.tsx:399). Preflight allows x-writer-upload-idempotency-key, or that origin is declared out of audience (Caddyfile:220 omits it; route.ts:271 requires it).
- **Defeat candidate.** Harness edge built from the repo Caddyfile or stock Caddy while live carries request_body max_size 25MB, or 25MiB which multipart framing exceeds: route-direct WSI-09 passes, yet every at-limit upload is 413 at the real edge.
- **Covered by.** `WSI-09`, `WSI-33`, `WSI-41`
- **Coverage note.** Per the critic: WSI-09/33 call the route directly, WSI-41 sends empty bodies; none sends 25 MiB through Caddy. Unread: live Caddyfile, Caddy version, whether iOS is in the audience (apiBase.ts:30 holds a 30 s native cap, but that path is marked unused, :604-606).
- **Depends on.** WSI-01, WSI-06, WSI-09, WSI-41

### FILL-14b · FILL-14b Oversize bodies through the edge: typed refusal, nothing buffered, nothing written (expected RED if live matches repo)
category `edge-transport` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** The route reads the whole multipart body (formData(), route.ts:319) before checking file.size (:339) and sits outside the proxy matcher (proxy.ts:793), so unless Next enforces a ceiling [inferred: it does not] the edge is the only bound on total bytes. Over-limit input must be refused there with a typed answer, before any KMS, DB or vault touch.
- **Procedure.** As a test member, bypassing the UI pre-check (page.tsx:399), POST through the edge: (1) a 26,214,401-byte file; (2) 200 MiB with Content-Length; (3) 200 MiB chunked; (4) a valid at-limit file plus a 200 MiB extra form part. Sample container RSS; diff DB rows, vault files and the KMS call ledger around each.
- **Pass criteria.** Each shape ends in 413 with JSON {error} naming 25 MB, or an edge refusal whose body would reach the member as a size message, never the format copy (page.tsx:444-446). Zero new intents, arrivals, vault files, KMS calls. Peak RSS growth in (2)-(4) is at most 1.25x that of the at-limit upload in FILL-14a.
- **Defeat candidate.** No edge ceiling, as in the repo Caddyfile: WSI-09 still passes at the route, but Node reads all of (2)-(4), and (4) is accepted and lands, since only file.size is checked. Second wrong setup: an edge 413 with a bare text body, which the client shows as 'Try a .docx, .pdf, .epub, .txt, or .md'.
- **Covered by.** `WSI-09`, `WSI-33`
- **Coverage note.** Per the critic these hit the route directly, so the edge's role is invisible to them. Read: route.ts:319-341, proxy.ts:793, next.config.js:414-415 (30 MiB buffer is for proxy-traversing requests only), Caddyfile (no request_body). Unknown: live Caddyfile; any Next body limit on route handlers [inferred none].
- **Depends on.** FILL-14a, WSI-09, WSI-21, WSI-33, WSI-36

### FILL-14c · FILL-14c Upload time through the edge: slow, stalled and edge-cut uploads leave no false state and no false sentence
category `edge-transport` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **none**

- **Law.** ingest declares maxDuration = 120 (route.ts:5), but nothing in the repo shows it enforced on a self-hosted server [inferred] and the repo Caddyfile sets no timeouts, so the real budget is unknown. A budget B must be declared and enforced by a named layer; any cut leaves Source state and the member's sentence both true.
- **Procedure.** Declare B (candidate 120 s). At-limit file, throttled real browser: transfer 0.5B, then 1.2B; separately stall after 1 MiB for 2B. Then a harness-only edge with response_header_timeout 5 s cuts the client after the body completes. After each cut, retry the same file on a fast link (same key, sourceUploadAttempt.ts:32).
- **Pass criteria.** 0.5B: 200, one envelope, body-complete-to-response at most B/2 per format. 1.2B and stall: cutting layer and time named from logs, stall cut within a declared bound, no intent, arrival or file. Edge-cut: retry returns the same sourceArrivalId, one envelope; no sentence says nothing saved, or blames size or format.
- **Defeat candidate.** Treating maxDuration = 120 as enforced: nothing cuts the 1.2B or stalled upload, so a stalled member pins a handler and buffer. Or an edge timeout under the real transfer time cuts a slow honest uplink and the route says 'Confirm the file is under 25 MB' (route.ts:326). Or the edge cuts after landing and the client shows the format copy.
- **Coverage note.** WSI-32 (hung KMS) and WSI-33 (resource bounds) are route-direct and say nothing of transfer time or edge cuts. Unknown: live timeouts, Node request/headers timeouts in the image, router and ISP behaviour, HTTP/3 path. Read order: formData and parse precede recordArtifactArrival (route.ts:319-388), so no route DB work spans the body read.
- **Depends on.** FILL-14a, WSI-12, WSI-15, WSI-16, WSI-33, WSI-39

### FILL-15a · FILL-15a Every obligation declares its environment of evidence; a receipt measured elsewhere cannot discharge it
category `Environment of evidence (own class: disposable, then production-read-only)` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Evidence licenses only where it was measured. Each row declares disposable, production-read-only or production-write. A receipt's class is derived from measurements on five axes (host, database, vault, KMS key, principal), never asserted. Too weak (a proxy) and too strong (the run reached production) are both refused.
- **Procedure.** 1) Add a closed-set environment column to every WSI and FILL row; lint fails on blank or unknown. 2) Receipts record per-axis measurements: DB system_identifier, vault mountpoint, KMS key ARN from the stored envelope keyId (sourceKeyAuthority.ts:164-172), principal from CloudTrail. 3) Replay two known-wrong receipts through the checker.
- **Pass criteria.** Lint passes, one class per row. A disposable receipt for a production-class row is refused environment_under_reach; a disposable-declared run measured on the production key or principal is refused environment_over_reach. Both exit non-zero and the row stays NOT_RUN. Every real receipt of the run classifies to its declared class.
- **Defeat candidate.** A receipt writer with a constant class, as the existing witness writes productionDataTouched:False as a literal (ws-encrypted-source-pg16.sh:221-223), so a Mac run relabelled production passes; or a checker that blocks only under-reach and passes a disposable-labelled run on the production key.
- **Covered by.** `scripts/witness/ws-encrypted-source-pg16.sh`
- **Coverage note.** Log says vault_class=disposable_private_tmp (:41); receipt booleans are literals (:221-223); no class column or mismatch refusal. Runbook is silent on a separate acceptance key and principal (:55,:70): founder decision owed. Script writes /private/tmp (:18), so it is macOS-bound (inferred).
- **Depends on.** WSI-01, WSI-45, WSI-46

### FILL-15b · FILL-15b Host-bound evidence (uid, mount, egress, source IP, clock) is measured on minisforum, and the host is identified without trusting its labels
category `Environment of evidence (own class: production-read-only)` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** Facts that belong to a host count only if measured on that host, and the host is identified by something compose and environment cannot set. A source IP identifies a network, not a machine; MAIA_HOST_ID and container names identify nothing.
- **Procedure.** Read-only on minisforum after step 2. Pin a hashed host fingerprint (machine-id, docker daemon ID, kernel, arch, userns state). In maia-sovereign: id -u; credential and vault file owner and mode; read as node and as another uid; TCP 443 to KMS; proxy vars. Clocks: host, container, AWS Date header, NTP. Then CloudTrail IP, key, userAgent.
- **Pass criteria.** Fingerprint equals the one pinned at step 2. uid and file owner:mode equal declared values (SMTP precedent 1000, 0600; compose:207); other uid denied. Egress works, no proxy. Clock offset within the bound declared before the run (proposed 5 s), NTP synchronized. CloudTrail IP equals the measured WAN IP and the key is the minisforum principal's.
- **Defeat candidate.** Identify the host by MAIA_HOST_ID or container name: production compose hard-codes MAIA_HOST_ID minisforum (docker-compose.production.yml:135) and the Mac Studio runs the same compose and container names (CLAUDE.md:200), so a Mac run passes. Likewise an IP-only match if both share one WAN IP (inferred).
- **Coverage note.** No script in scripts/ or docs/ops measures host fingerprint, NTP, egress or credential-file ownership. Dockerfile:163-165 says userns remap changes uid; compose:207 says host uid 1000 equals node: only a host measurement settles it. Unknown: minisforum userns, NTP, WAN IP.
- **Depends on.** FILL-15a, WSI-03, WSI-05, WSI-35, WSI-45

### FILL-15c · FILL-15c Production-class rows run only after their named preconditions hold; unmet ones are NOT_RUN, a disposable run never stands in, and the harness holds no production reach
category `Environment of evidence (own class: disposable, then production-read-only)` · real KMS **no** · real vault **no** · browser **no** · covered today **none**

- **Law.** A plan that isolates its harness from production cannot discharge rows whose subject exists only there. Such rows carry predeclared preconditions checked at run time; unmet means NOT_RUN and plan INCOMPLETE, never skipped-green and never proxied. Production reach is a separate founder-run, content-free collector.
- **Procedure.** Give each production-class row preconditions the runner checks first: WSI-03 and 05 need step 2 values and the credential mount live in the running container (runbook:60-68); WSI-44 a lane deploy after that; WSI-47 steps 4 and 5 on the accepted image. Run the runner before step 2, then after. Scan harness env and files for production identifiers.
- **Pass criteria.** Before step 2 every production-class row reads NOT_RUN naming its unmet precondition, plan verdict is INCOMPLETE, exit non-zero; no disposable receipt attaches to any of them. After, each precondition is verified from the host. The scan finds no production key ARN, access key id or non-loopback DATABASE_URL in the harness.
- **Defeat candidate.** A runner that maps a missing precondition to skip and reports green; or one that fills WSI-03/05 from a disposable run on the operator's default credential chain: kmsClient() passes only region and maxAttempts (sourceKeyAuthority.ts:139-140), so ~/.aws or env credentials would satisfy a canary the mounted file never saw.
- **Coverage note.** Runbook orders steps but names no row or environment per step (:51-88). Step 3 precedes step 4, yet the credential mount needs a step 2 lane deploy (:60-68), so a production-read-only phase hides inside the order. Unknown: whether harness commit 4b33659d2 (absent from this tree) has precondition logic.
- **Depends on.** FILL-15a, FILL-15b, WSI-03, WSI-05, WSI-44, WSI-46, WSI-47

### FILL-16a · FILL-16a Vault modes, owners and mounters measured on the live mount, not the image
category `Vault custody` · real KMS **no** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** Availability of ciphertext is part of custody. Who may unlink, rename or replace it follows from the mounted volume's modes, owners and the set of containers that mount it. The image, the code and a temp-dir unit test do not establish that.
- **Procedure.** After WSI-06 and a discard, run stat -c '%a %u:%g %h' on the vault root, manuscript-sources, each .source.enc and any .pending, inside maia and at the volume Mountpoint. List every service and running container mounting vault_data (rw/ro, uid) and sibling namespaces with modes. Repeat on a volume pre-seeded 0755, root-owned.
- **Pass criteria.** manuscript-sources is 0700 and each file 0600, all owned by the maia uid, nlink 1. Vault root is not other-writable, or has the sticky bit. Mounters equal a declared list, rw only for maia and any named erasure consumer. Root and docker-group write access is listed as declared residual. The pre-seeded volume is reported RED.
- **Defeat candidate.** A check that reads the Dockerfile or a fresh temp dir (r98DurableVaultBoundary.test.ts:40) passes while the live volume, seeded earlier, is 0777 or foreign-owned. A mounter list taken from compose alone misses a container started by hand.
- **Covered by.** `lib/storage/__tests__/r98DurableVaultBoundary.test.ts:40`
- **Coverage note.** Unit test asserts one 0600 file in a temp dir only. No check reads live directory modes, owner, sticky bit or mounters. Expected RED today on root mode if the volume was seeded from the image (Dockerfile:167). Unknown: userns-remap and docker-group members on minisforum.
- **Depends on.** WSI-06, WSI-19

### FILL-16b · FILL-16b A second uid cannot delete, rename, replace or re-permission ciphertext
category `Vault custody` · real KMS **yes** · real vault **yes** · browser **no** · covered today **none**

- **Law.** A principal other than the app uid is refused on every attempt to remove or alter stored ciphertext. AAD binding (WSI-08) detects a swap but not deletion, so the filesystem refusal is the only barrier to availability loss.
- **Procedure.** With a claimed and an unclaimed arrival stored, run as uid 2000, all caps dropped, on the same volume: unlink and rename a .source.enc; rename and rmdir manuscript-sources; create a same-name file; open with O_TRUNC; chmod; link(). Record errno and inode before and after. Positive control: the app uid unlinks its own canary there.
- **Pass criteria.** Every foreign attempt returns EACCES or EPERM, never ENOENT or EROFS. Inodes, modes and SHA-256 are unchanged, the positive control succeeds, and a cold reopen (WSI-17) is byte-identical. Directory rename and rmdir are among the refusals (expected RED if the root is 0777 without sticky).
- **Defeat candidate.** A harness that counts any failure as denial passes on a wrong path (ENOENT) or read-only mount (EROFS). So does a probe run as uid 1000: workers built from the same image share the app uid (Dockerfile:169), so mode bits cannot separate them. That is FILL-16a's mounter list.
- **Coverage note.** Nothing tests a foreign uid. destroyVaultBytes.test.ts:60-85 checks only the app's own EACCES handling. Rename of an entry in a non-sticky 0777 directory needs only write on that directory (inferred from POSIX, not run).
- **Depends on.** WSI-06, WSI-17, FILL-16a

### FILL-16c · FILL-16c Ciphertext lost or unreadable outside the app is named by cause and told truthfully
category `Vault custody` · real KMS **yes** · real vault **yes** · browser **yes** · covered today **partial**

- **Law.** Loss of availability must be distinguishable from corruption and key refusal, and erasure must never be reported over bytes the app can neither see nor remove. AAD binding only judges bytes that are present.
- **Procedure.** As the app uid, not root (destroyVaultBytes.test.ts:59-61 skips EACCES as root), on one claimed Work each: (i) unlink the .source.enc; (ii) replace with a zero-byte file; (iii) chmod 0000 the namespace dir; (iv) swap it for a foreign-owned 0755 copy. Run reopen, verifyCustody and Delete Work. Read the queue, the sentence and CloudTrail.
- **Pass criteria.** (i) ABSENT, (ii) CORRUPT_CIPHERTEXT, (iii) and (iv) an unreadable or unremovable cause: distinct, content-free codes (expected RED: arrivals.ts:260-261 maps every read failure to artifact_missing). No KMS Decrypt for (i). In (iii)/(iv) the erasure queue row stays, attempts rises, and the answer says erasure is owed.
- **Defeat candidate.** A catch-all that maps every filesystem error to 'missing' (the current verifyCustody) passes a deletion-only test while telling a member their file is gone when only a mode changed. A path that reports deleted when unlink was not confirmed passes if erasure is checked only where unlink works.
- **Covered by.** `lib/storage/__tests__/destroyVaultBytes.test.ts:59-85`, `lib/manuscript/source/arrivals.ts:205-215`
- **Coverage note.** Unit level: verifyCustody comment (arrivals.ts:205-215) names the deleted-bytes control; destroyVaultBytes keeps EACCES loud. No real-vault run, no cause split, no recorded-arrival sweep (inspectMemberIncompleteLandings skips ARRIVAL_RECORDED, encryptedLanding.ts:796-806).
- **Depends on.** WSI-17, WSI-28, WSI-37, FILL-16b

### FILL-17a · Plaintext data key is on no durable store, in any encoding, at any stage
category `key-custody` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** The 32-byte plaintext DEK lives only in a Buffer zeroed after one operation [read sourceEnvelope.ts:153-174,226-247; sourceKeyAuthority.ts:162-163,233-235]. No column, WAL page, file or volume may ever hold it, even briefly. [read] wrapped_dek has only IS NOT NULL (migration 20261026000001:97), so the schema would not refuse a stored key.
- **Procedure.** Learn each file's DEK right after upload via a harness one-shot Decrypt of its wrapped_dek (rows vanish later; needles in tmpfs). After each stage and WSI-15 kill point scan raw, hex, base64 (3 alignment-stable cores), decimal-list forms in pg_dump, PGDATA incl. WAL, all maia data volumes, docker diff, /tmp, WSI-31 backups. Plant a decoy first.
- **Pass criteria.** Zero hits for every real DEK, encoding, surface and stage; one hit fails. The decoy is found in every surface and encoding class, including a dead tuple and WAL after UPDATE-to-NULL. The packet records counts and surface names only, never needles or DEKs.
- **Defeat candidate.** Retry optimisation: persist the DEK on the intent row at prepareEncryptedWrite so resume skips a second Decrypt, NULL it at ARRIVAL_RECORDED. Dumps and column checks of finished files are clean; killed uploads, heap pages and WAL still hold it. Passes WSI-06/07/18/38 as titled [inferred]. Build as a WSI-46 setup.
- **Covered by.** `WSI-07`, `WSI-38`
- **Coverage note.** WSI-07 scans markers, magic and original SHA; WSI-38 scans logs for wrapped_dek (as given). Neither learns or seeks the real DEK. [read] no fill(0)/zeroed assertion in lib/manuscript/source/__tests__. UNKNOWN: WAL retention and host swap on the acceptance DB. Witness Decrypts must be ledgered apart in WSI-35/36.
- **Depends on.** WSI-01, WSI-02, WSI-06, WSI-15, WSI-17, WSI-19, WSI-25, WSI-31, WSI-46

### FILL-17b · Plaintext data key is in no log, error, trace or response, on success or fault
category `log-hygiene` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** The DEK is never printed. [read] No SDK logger is set (sourceKeyAuthority.ts:140); DB errors log param types only (postgres.ts:115-129); the ingest route logs codes at route.ts:394-411 but whole errors at :357 and :433, which KMS errors do not reach today. A new log site, wrapped error or debug path touching a KMS result or unwrapped key is the leak.
- **Procedure.** Run the lifecycle plus every WSI-16/37 fault with DEK needles as in FILL-17a; repeat with log_statement=all on the harness postgres. Capture app, postgres and proxy streams live (json-file rotates at 10m x3, compose.production.yml:40-44) and scan them, plus every HTTP status, header and body returned, in all encodings. Plant decoy log lines first.
- **Pass criteria.** Zero DEK hits in any captured stream, success or fault, in every encoding; one hit fails. The decoy is found in every stream, and the capture is proven complete by a sequence marker per stream (no rotation gap). Packet holds hit counts and stream names only.
- **Defeat candidate.** A fault-path debug line: console.error('kms', result) or JSON.stringify(unwrapped) in a catch, where a Buffer serialises as {"type":"Buffer","data":[...]}. Happy-path logs and WSI-38's wrapped_dek scan stay clean; only a fault run with decimal-list needles sees it. Build as a WSI-46 setup.
- **Covered by.** `WSI-38`, `WSI-37`
- **Coverage note.** WSI-38 scans logs for wrapped_dek only (as given); WSI-37 injects faults but does not seek the DEK. [read] @sentry is absent from package.json though lib/monitoring/sentry.ts imports it. UNKNOWN: whether Sentry is active in the image, postgres log settings, and live minisforum Caddy log format (not in this repo).
- **Depends on.** WSI-01, WSI-08, WSI-16, WSI-37, WSI-38, WSI-45, WSI-46, FILL-17a

### FILL-17c · Plaintext data key is neither cached nor retained after its operation
category `key-custody` · real KMS **yes** · real vault **yes** · browser **no** · covered today **partial**

- **Law.** A DEK is fetched per operation and not kept. [read] Only the KMS client and the test-only KEK ring are cached (sourceKeyAuthority.ts:34-36,75-78,131-141); every unwrap calls Decrypt (sourceEnvelope.ts:190,228) from reopen (arrivals.ts:174,252), inspect (encryptedLanding.ts:375) and resume (:592).
- **Procedure.** In one never-restarted maia process: upload F, reopen F twice, then deny kms:Decrypt to the app principal. Control: a never-opened file G must now fail, proving the deny is live. Reopen F at once. Then gcore the node pid and scan for raw DEKs of finished operations; record base64/hex string residue and classify it.
- **Pass criteria.** F fails like G with the WSI-18 cause and the denied Decrypt attempts appear in the ledger; Decrypt calls per reopen equal the code model; zero raw-DEK hits in the memory image for finished operations. String-form residue is recorded as residual-by-design or unknown, never as gone.
- **Defeat candidate.** Speed-up cache: Map<wrappedDek,Buffer> filled in unwrapSourceDataKey and read before the Decrypt call, never cleared. A cold-process reopen (WSI-17) passes; only a warm process with a live deny shows it, and the surviving Buffer is a raw memory hit. Build as a WSI-46 setup.
- **Covered by.** `WSI-17`, `WSI-18`, `WSI-36`
- **Coverage note.** WSI-17 is a cold process, so a cache cannot show. WSI-18 catches one only if its process is warm and the deny proven live (not in its title). WSI-36 only if its model pins a Decrypt per operation. UNKNOWN: whether gcore/ptrace is allowed on the acceptance host; SDK-internal copies of Plaintext.
- **Depends on.** WSI-03, WSI-04, WSI-16, WSI-17, WSI-18, WSI-36, WSI-46, FILL-17a

---

## Part B · Claim verification record (23 claims, two lenses each)

Lens 1 = *citation*: open the cited lines, does the code say exactly this. Lens 2 = *refutation*: search the whole tree for anything that makes it false or incomplete. **STANDS** = both held as worded. **CORRECTED** = at least one lens failed; the corrected wording is the one to rely on.

#### C01 · code-fact · STANDS
**Claim as synthesized.** POST /api/writers-studio/sources is a hard-coded 423 returned before multipart parsing, storage or SQL. The file imports no release authority, and the refusal string occurs in no other file, so no test pins it. Only GET (list) is live there.

**Citations.** `app/api/writers-studio/sources/route.ts` 35-43

**Evidence (citation lens).** Basis read. route.ts:35-43: `export async function POST() {` takes no request and returns `NextResponse.json({ error: 'Source uploads are temporarily unavailable pending independent security and recovery acceptance.' }, { status: 423, ... })` unconditionally. The only imports (lines 1-3) are next/server, getMemberIdFromRequest and query, so no release authority. The only exports are `dynamic`, GET (lines 7-33, SELECT from workbench_uploads) and POST. `git grep` for the refusal string finds only route.ts:40. No test imports or reads this route (only the [id] route has a test). Basis inferred: "

#### C02 · code-fact · CORRECTED
**Claim as synthesized.** POST /api/book-studio/workbench/uploads is gated only by requireFounder(). It accepts up to 50 MB, writes the original as original.<ext> with plain fs.writeFile and stores extracted text in plaintext columns. Grep finds no import of the key authority, envelope, landing or release authority in lib/workbench, app/api/book-studio or app/api/writers-studio.

**Citations.** `app/api/book-studio/workbench/uploads/route.ts` 34,67-72,100-125; `lib/workbench/storage.ts` 20,53-63

**Refutation lens — correction.** Core facts hold; two parts are incomplete. (1) 50 MB is only the in-route cap: proxy.ts matcher (793) still matches this path, and next.config.js:415 sets proxyClientMaxBodySize 30 MiB, so effective ceiling is likely 30 MiB (inferred; Next internals and runtime unverified). (2) Before the handler, proxy.ts applies access-matrix rule /api/book-studio/ minTier free (accessMatrix.ts:147). Caddy hold is outside repo, unverified.

#### C03 · infra-fact · STANDS
**Claim as synthesized.** Neither SOURCE-CUSTODY-EDGE-01 nor WS-R20-AB-01 is in the repo Caddyfile. The runbook places the first on 'the sources and workbench upload paths' without exact matchers. If it covers the workbench POST, removing it opens a founder-only plaintext original store outside the envelope; 'uploads fail without a provider' holds for ingest only.

**Citations.** `docs/programme/WRITER_SOURCE_KMS_RULING_AND_INTAKE_LIFT_RUNBOOK_2026-11-01.md` 79-86,96-98; `Caddyfile` whole file (grep: no match)

**Evidence (citation lens).** Runbook L82-83: "SOURCE-CUSTODY-EDGE-01 (@source_write_pre_migration_hold on the sources and workbench upload paths)", no matcher. Neither name is in any Caddyfile (git grep hits the runbook only). Workbench POST (uploads/route.ts:67-72,121) is requireFounder + writeOriginal, a plain fs.writeFile (storage.ts:61), with no releaseAuthority or KMS reference. writer_source_key_provider_missing is thrown only at sourceKeyAuthority.ts:67, reached through ingest. Sources POST is a flat in-app 423 (L35-43).

#### C04 · code-fact · STANDS
**Claim as synthesized.** The KMS client is a process singleton built as new KMSClient({region, maxAttempts: 3}); no credentials, endpoint, requestHandler or timeouts are passed, so credentials come from the SDK default chain. Region is WRITER_SOURCE_KMS_REGION ?? AWS_REGION ?? AWS_DEFAULT_REGION, regex-checked; an empty string blocks the fallback.

**Citations.** `lib/manuscript/source/sourceKeyAuthority.ts` 34-36,131-142

**Evidence (citation lens).** sourceKeyAuthority.ts:35 `let kmsClientCache: KMSClient | null = null;` (module singleton). 132-141: `if (kmsClientCache) return kmsClientCache; const region = WRITER_SOURCE_KMS_REGION ?? AWS_REGION ?? AWS_DEFAULT_REGION; if (!region || !/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(region)) throw ...; factory = kmsClientFactory ?? (config => new KMSClient(config)); kmsClientCache = factory({ region, maxAttempts: 3 });`

#### C05 · infra-fact · CORRECTED
**Claim as synthesized.** The committed maia compose has no AWS_* or WRITER_SOURCE_* variable and no credential mount; the only secret bind is the SMTP token. FILE_STORAGE_PATH is set in no compose, Dockerfile or .env.example. SDK 3.1142.0 defaults (timeouts, chain order, memoization) are unread because node_modules is absent here.

**Citations.** `docker-compose.production.yml` 110-125,207-214; `package.json` 306

**Refutation lens — correction.** Say: the committed maia service sets no AWS_*/WRITER_SOURCE_* and mounts no AWS credential. Not "only secret bind": its SMTP bind is a never-deployed DRAFT (92d4bb86), the live chain adds an untracked override with R20 secret mounts (R104, 23 Oct), and env_file .env.production (107-108) is unread. KMSClient gets only region and maxAttempts:3 (sourceKeyAuthority.ts:133-141); SDK defaults decide credentials.

#### C06 · code-fact · STANDS
**Claim as synthesized.** Delete Work makes no KMS call (it imports neither envelope nor key authority). One transaction deletes member_manuscripts; FK cascades remove the claimed arrivals and their landing rows (which hold wrapped_dek); each artifact_ref is queued, swept after commit, and only then is R20 sealed. No per-file or CMK key action exists.

**Citations.** `lib/manuscript/source/eraseManuscript.ts` 62-65,111-135,185-217; `database/migrations/20261026000001_writer_source_encrypted_landing.sql` 58; `database/migrations/20260824000001_manuscript_source_custody.sql` 28

**Evidence (citation lens).** eraseManuscript.ts:62-65 imports only db, fileVault, vaultErasureSafeLogR105, r20DeletionLedger (no KMS/envelope). :128-131 DELETE member_manuscripts in tx; :189-193 INSERT vault_erasure_queue; :202 sweepVaultErasureQueue; :205 sealR20DeletionLedger. custody.sql:28 and landing.sql:58 are ON DELETE CASCADE; landing.sql:49 wrapped_dek.

#### C07 · code-fact · STANDS
**Claim as synthesized.** Delete Work selects arrivals only by manuscript_id, so unclaimed arrivals and non-ARRIVAL_RECORDED intents survive it. The route returns 500 custody_incomplete when sweptAll is false; sweptAll needs a global queue count of 0 after a LIMIT-100 sweep plus a successful R20 seal.

**Citations.** `lib/manuscript/source/eraseManuscript.ts` 111-127,214-216,282-315; `app/api/sovereign/manuscripts/[id]/route.ts` 232-239

**Evidence (citation lens).** eraseManuscript.ts:113-114 "WHERE manuscript_id = $1 AND member_id = $2" (unclaimed = NULL manuscript_id, migration 20260824000001:26-28); :122-123 intents only via "arrival_id = ANY($1)"; :215 "swept.remaining === 0 && recoverySealed"; :281,284,314 LIMIT 100, unfiltered count(*); route:236-239 500 custody_incomplete.

#### C08 · code-fact · STANDS
**Claim as synthesized.** With KMS unavailable, claimArrival's Decrypt (inside transaction() after FOR UPDATE) is collapsed to source_envelope_decryption_refused and the claim rolls back. POST /manuscripts logs the raw error and returns 201 as legacy_interpreted_import. verifyCustody's catch-all returns custodied false, reason artifact_missing.

**Citations.** `lib/manuscript/source/arrivals.ts` 140-176,247-263; `lib/manuscript/source/sourceEnvelope.ts` 214-248; `app/api/sovereign/manuscripts/route.ts` 467-483

**Evidence (citation lens).** Read, all hold. arrivals.ts:173-175 recover after FOR UPDATE (:152,:162); sourceEnvelope.ts:243-244 catch throws 'source_envelope_decryption_refused' around KMS unwrap (:228); postgres.ts:296-300 ROLLBACK+rethrow; route.ts:479-483 console.error(err), :467/:490-493 201 legacy; arrivals.ts:260-262 'artifact_missing', custody.ts:153 false. Scope: only artifact arrivals with landing; KMS cause discarded; verifyCustody sees claimed arrivals only.

#### C09 · gap-fact · CORRECTED
**Claim as synthesized.** No member route returns an original after landing: ingest returns extracted text, and verifyCustody has callers only in scripts/verify-ws01-source-custody.ts. 'Reopen' therefore means opening the Work from stored sections (no KMS call, inferred) or claim/verifyCustody decryption; it must be defined that way in the plan.

**Citations.** `app/api/sovereign/manuscripts/ingest/route.ts` 424-431; `lib/manuscript/source/arrivals.ts` 217-264; `scripts/verify-ws01-source-custody.ts` 123-129

**Citation lens — correction.** "No member route returns an original after landing: ingest returns extracted text (route.ts:424-431), and verifyCustody has no runtime caller; its callers are scripts/verify-ws01-source-custody.ts and two lib/manuscript/source/__tests__ Pg16 tests. claimArrival, called from the member route manuscripts/route.ts:470,475, decrypts the original (arrivals.ts:173-176) but returns only a boolean."

**Refutation lens — correction.** Accurate: no route returns a KMS-landed manuscript original, and verifyCustody has no route/lib caller, but two jest tests also call it (not only the script). Scope "original" to manuscript_source_arrivals: the sources file route returns plaintext workbench originals. KMS Decrypt also runs in ingest read-back (encryptedLanding.ts:400,441). claimArrival is Work creation (manuscripts/route.ts:470).

#### C10 · coverage-fact · STANDS
**Claim as synthesized.** At the flip these need requalification: transportBoundary.test.ts:132 (literal) and the three F7 cases at 353-390 (423 expected with no idempotency header; they would get 400); encryptedSourceUploadContract.test.ts:23; p4r1ImportHoldHonesty.test.ts:68; routeHold.test.ts:62; e2e journey.spec.ts:132 (held banner). Mock-based tests are insensitive.

**Citations.** `app/api/sovereign/manuscripts/ingest/__tests__/transportBoundary.test.ts` 121-138,353-390; `app/writers-studio/__tests__/encryptedSourceUploadContract.test.ts` 17-32; `app/writers-studio/__tests__/p4r1ImportHoldHonesty.test.ts` 62-75; `app/api/sovereign/manuscripts/[id]/render/__tests__/routeHold.test.ts` 56-67; `tests/e2e/writers-journey/journey.spec.ts` 129-136

**Evidence (citation lens).** All cited lines verified at c051385b. transportBoundary:132 `toContain('sourceIntakeReleased: false')` on releaseAuthority.ts; F7 cases 353/366/379 each `expect(res.status).toBe(423)`, no idempotency header anywhere in file; route.ts:260-280 sends 423 if unreleased, then 400 if header missing. encryptedSourceUploadContract:23, p4r1ImportHoldHonesty:68, routeHold:62 are literal/real-value assertions of the flag. journey.spec:132 expects 'Original-file import is held on this Writer image.', rendered only when !fileIntakeAvailable (P4R1ImportManuscript.tsx:361-362).

#### C11 · coverage-fact · CORRECTED
**Claim as synthesized.** The PG16 witness uses local-test: the suite's beforeAll sets it and the script forces NODE_ENV=test with a fixture KEK. The DB is a hand-built stub plus 3 migrations, R20 sealing is jest-mocked, and the receipt sets 16 coverage booleans from the exit code with testsExpected hard-coded to 12. The suite is skipped unless WS_ENCRYPTED_SOURCE_PG16 is set.

**Citations.** `lib/manuscript/source/__tests__/encryptedLandingPg16.test.ts` 5-8,28-29,75-79; `scripts/witness/ws-encrypted-source-pg16.sh` 63-158,163-174,179-228

**Citation lens — correction.** Replace the last sentence with: "The suite is skipped (describe.skip) unless WS_ENCRYPTED_SOURCE_PG16 equals exactly 'fictional-only' (test L28-29); the script refuses with exit 64 unless it has that same value (script L4-7)." Everything else in C11 is accurate as worded.

#### C12 · code-fact · CORRECTED
**Claim as synthesized.** Landing is unique on (member_id, key). Same bytes, size and format under one key resumes the intent (filename and MIME are not compared); different bytes throw source_landing_idempotency_conflict. Every landing error is wrapped as SourceLandingIncompleteError, which the route returns as a retryable 503 saying the record was preserved.

**Citations.** `lib/manuscript/source/encryptedLanding.ts` 215-254,687-689; `app/api/sovereign/manuscripts/ingest/route.ts` 270-280,383-407

**Refutation lens — correction.** Accurate: unique on (member_id,key); same sha256+size+format resumes, else idempotency_conflict (also thrown if the row vanished). Errors awaited in the try become SourceLandingIncompleteError (route 503, l.390-406), but a failure inside loadRecordedArrival escapes raw to the route's generic 500 "No manuscript was created" (l.408-415). A conflict gets the same 503 although intentId is null, and no test covers it.

#### C13 · code-fact · CORRECTED
**Claim as synthesized.** The client derives one UUID key per file fingerprint [name,size,lastModified,type] and keeps it in a React ref, so a reload or remount mints a new key and strands the first intent. The save POST carries no idempotency key.

**Citations.** `lib/writersStudio/sourceUploadAttempt.ts` 17-39; `app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx` 57,101-106,188-218

**Citation lens — correction.** The ref is a single slot holding only the latest attempt. A new UUID is minted whenever the file's fingerprint differs from the last attempt, and a reload or remount resets the ref to null, so it mints again. The key goes only on the original-file ingest POST (not local review). The save POST sends no idempotency header; "strands" is inferred, not read.

#### C14 · infra-fact · CORRECTED
**Claim as synthesized.** vault_data is a local-driver named volume mounted on maia at /app/data/vault, so it survives container recreation. No compose service, script or workflow in the repo backs it up; the only other references are a held-backup verifier asserting the held script excludes it and a retention doc. Production backup state is unread.

**Citations.** `docker-compose.production.yml` 197,1066; `scripts/ops/verify-ws-held-backup-source-order.mjs` 69; `docs/ops/WS_BACKUP_OPS_TRANSITION_FIXTURE_PLAN_20261012.md` 25-28

**Citation lens — correction.** vault_data is a local-driver named volume mounted only on service maia at /app/data/vault. No compose service, script or workflow in the repo backs it up. The only other files naming it are the verifier (l.69, a negative check on the string maia-sovereign_vault_data) and docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md:59, which merely lists it among mounts. The cited plan doc l.25-28 does not name vault_data; it says the installed writer has no Source vault, from an unread-here production observation. "Survives recreation" is an inference from named-volume semantics.

**Refutation lens — correction.** Checked-in compose mounts vault_data (local) only on maia at /app/data/vault; repo has no backup of it. But WS_R104 doc:7-9 says live prod adds Git-absent overrides and the media worker also mounts the vault RW, so prod topology is unproven. Verifier:69 only checks a string absent from an off-repo script. Backup state, FILE_STORAGE_PATH unread.

#### C15 · code-fact · CORRECTED
**Claim as synthesized.** The hold is a module-load constant that returns 423 after the identity refusals and before idempotency-header validation, header sanitising and formData(). The manifest says only a new admitted image with exact-image acceptance may change it, so the unmodified canonical image cannot exercise custody over HTTP.

**Citations.** `app/api/sovereign/manuscripts/ingest/route.ts` 55,255-280; `lib/writersStudio/releaseAuthority.ts` 12-27

**Refutation lens — correction.** Order and constant hold. 'Custody' is overbroad: unheld POST /api/sovereign/manuscripts (route.ts 469-477) records a pasted-text arrival and claimArrival sets source_custody='source_custodied' (arrivals.ts 76-84, 190-205), no KMS. Accurate: the unmodified image cannot reach encrypted original-file landing or KMS over HTTP; ingest is the only HTTP caller of recordArtifactArrival.

#### C16 · gap-fact · STANDS
**Claim as synthesized.** The route has no empty-text check after parseUpload. commitEncryptedArrival refuses sourceText.length === 0 only after the ciphertext is encrypted, written and verified, and the wrapper then returns the retryable 503, leaving a BYTES_VERIFIED intent.

**Citations.** `app/api/sovereign/manuscripts/ingest/route.ts` 345-366; `lib/manuscript/source/encryptedLanding.ts` 426-430,687-689; `lib/manuscript/ingest/parseUpload.ts` 503-514

**Evidence (citation lens).** READ: route.ts 345-366 goes parseUpload then only `if (result.text.length > MAX_TEXT_CHARS)` (364); the sole sourceText/text greps are 364/371/384/421/425, no empty check. The only empty guard, `file.size === 0` (336), is on bytes before parse. encryptedLanding.ts 427-429: `input.sourceText.length === 0 ... throw new Error('source_landing_arrival_input_refused')`. Before that, prepareEncryptedWrite runs encryptOriginalSource (276) and sets WRITING_BYTES (280), and the wrapper writes the ciphertext and calls markEncryptedBytesVerified (656), which sets BYTES_VERIFIED (405). `sourceText` is not 

#### C17 · gap-fact · CORRECTED
**Claim as synthesized.** inspectMemberIncompleteLandings and discardUnclaimedArrival have no caller outside tests. Discard finds the landing only by arrival_id and Delete Work only via arrivals with manuscript_id, so PENDING, WRITING and BYTES_VERIFIED intents are reachable by no door. The 24-hour sweep named in migration 20261022000002 is not implemented.

**Citations.** `lib/manuscript/source/encryptedLanding.ts` 796-822; `lib/manuscript/source/discardUnclaimedArrival.ts` 25-48; `database/migrations/20261022000002_writer_source_arrival_retention_index.sql` 1-9

**Citation lens — correction.** No non-test caller exists for either function (inspect has none even in tests). Intents in PENDING_BYTES, WRITING_BYTES, BYTES_VERIFIED have arrival_id NULL, so no discard, Delete Work, inspection or expiry door reaches them; only a same-idempotency-key retry (ingest 503) resumes them. 24-hour sweep: comment only, unimplemented.

**Refutation lens — correction.** Accurate statement: inspectMemberIncompleteLandings has NO caller anywhere (tests included). discardUnclaimedArrival is called only by tests. No door can DISCARD, ERASE, INSPECT or EXPIRE a PENDING_BYTES/WRITING_BYTES/BYTES_VERIFIED intent: discard and Delete Work key on arrival_id, which the CHECK forces NULL in those states. The only way to advance one is a same-member re-upload to the ingest route with the same idempotency key (currently 423-held). It completes the intent to ARRIVAL_RECORDED and does not delete it. An abandoned or key-lost intent is therefore orphaned. Do not say 'reachable by no door'. The 24-hour sweep is unimplemented: migration 20261022000002 is a partial index on manuscript_source_arrivals plus a COMMENT. Inferred: that index covers arrivals, not landing intents, so a sweep built on it would still miss pre-arrival intents (and any ciphertext in the vault under their artifact_ref). Unverified: production rows and vault contents. There is no read-only way to establish whether any orphaned intents exist.

#### C18 · code-fact · CORRECTED
**Claim as synthesized.** POST /manuscripts claims the arrival after the Work is committed; if claimArrival returns false or throws, it logs the raw error and returns 201 with sourceCustody legacy_interpreted_import. The Import room does not read sourceCustody and its pre-save text says the original 'remains separately held as Source'.

**Citations.** `app/api/sovereign/manuscripts/route.ts` 463-492; `app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx` 472

**Citation lens — correction.** POST /manuscripts claims the arrival after the Work transaction has committed (route.ts:412-449, claim at 467-478). If claimArrival or recordSuppliedArrival THROWS, the catch (479-483) logs the raw error object and the route returns 201 with sourceCustody 'legacy_interpreted_import'. If claimArrival returns FALSE, no error is logged: custody keeps its default, only the routine '[MAIA/press] manuscript saved ... custody: legacy_interpreted_import' marker (486-489) is written, and 201 is still returned. The Import room reads only body.id and the error field from the response, never sourceCustody, and its pre-save text (line 472) says 'The original remains separately held as Source.'

**Refutation lens — correction.** Partly false. Only a throw (claimArrival or recordSuppliedArrival) reaches console.error at 482. claimArrival returning false logs no error; only the info marker with custody: legacy_interpreted_import (486-489). Both give 201 legacy. If neither sourceArrivalId nor confirmedText is sent, no binding is attempted. Rest of the claim holds.

#### C19 · code-fact · CORRECTED
**Claim as synthesized.** claimArrival does a KMS Decrypt inside transaction() while holding FOR UPDATE locks on the arrival and Work. The pg pool is max 20 with connectionTimeoutMillis 2000 and no statement or idle-in-transaction timeout is set in the app, and the KMS client sets no timeout.

**Citations.** `lib/manuscript/source/arrivals.ts` 140-176; `lib/db/postgres.ts` 70-76; `lib/manuscript/source/sourceKeyAuthority.ts` 140

**Citation lens — correction.** Core holds; two wording defects. (1) The Decrypt runs only for ARTIFACT_EXTRACTION arrivals with an encrypted landing (arrivals.ts:169-175) on the aws-kms provider; text and legacy arrivals use no KMS. (2) "No statement timeout in the app" is false: learningReportServer.ts:31 sets SET LOCAL statement_timeout. Say: none on the shared pool or in claimArrival.

#### C20 · code-fact · STANDS
**Claim as synthesized.** No data key is cached. GenerateDataKey runs once in prepareEncryptedWrite; Decrypt runs in verify and in commit (via inspectEncryptedStoredObject), in claimArrival and in each verifyCustody. A fresh upload plus claim is 1 GenerateDataKey + 3 Decrypt, while runbook step 6 expects a 'pair'.

**Citations.** `lib/manuscript/source/encryptedLanding.ts` 276,400,441; `lib/manuscript/source/arrivals.ts` 174,252; `docs/programme/WRITER_SOURCE_KMS_RULING_AND_INTAKE_LIFT_RUNBOOK_2026-11-01.md` 87-89

**Evidence (citation lens).** encryptedLanding.ts:276 `await encryptOriginalSource(...)` reaches sourceEnvelope.ts:153 generateSourceDataKey, its only caller; DEK zeroed in finally. :400/:441 `inspectEncryptedStoredObject` calls decryptOriginalSource. arrivals.ts:174/:252 call recoverEncryptedLandingBytes. Runbook:88-89 "GenerateDataKey/Decrypt pair".

#### C21 · gap-fact · CORRECTED
**Claim as synthesized.** Ingest has no Writer-roster check, rate limit or Sanctuary check. It is excluded from the proxy matcher and from the Writer corridor, so once released and unheld any authenticated member can upload via the Import room or /press/manuscript.

**Citations.** `proxy.ts` 786-793; `lib/writersStudio/restrictedCorridor.ts` 30-40; `lib/writersStudio/__tests__/restrictedCorridor.test.ts` 37-52

**Citation lens — correction.** Ingest (POST /api/sovereign/manuscripts/ingest) has no Writer-roster check, rate limit or Sanctuary check, and is outside the proxy matcher and Writer corridor, so once released any authenticated member can POST to it directly or via /press/manuscript. The Import room is not such a path: it is hosted at /writers-studio, which is roster-gated.

**Refutation lens — correction.** Accurate version: the ingest endpoint itself has no Writer-roster, rate-limit or Sanctuary check, and is outside both the proxy and the corridor (read). It does authenticate (route.ts 187-255: forged-header refusal, deriveVerifiedAccess, checkAccess, member resolver). Per-request caps only: 25 MB, 2M chars. Once released, any authenticated member can upload by direct POST or via /press/manuscript; that page has no roster or release check (accessMatrix.ts 108: minTier free; no sourceIntake reference in page.tsx). The Import room at /writers-studio is roster-gated at page level, so "via the Import room" is wrong for non-roster members. Inferred: /dev/writers-studio-p4r1?mode=home mounts the same room outside the corridor; its reachability depends on ACCESS_CONTROL_MODE, not set in repo compose (unknown). Also missing from "once released and unheld": a UUID retry-header (route.ts 271-280) and a configured key provider (runbook §5: otherwise writer_source_key_provider_missing). Live Caddy rate limits are not in the repo (unknown).

#### C22 · infra-fact · CORRECTED
**Claim as synthesized.** In the committed compose maia-media-worker mounts only media_data and sets no FILE_STORAGE_PATH. destroyVaultBytes treats a missing path as already erased and the sweep then deletes the queue row, so an unmounted worker clears rows while ciphertext remains. R105 says the live worker had the mount; the live state is unread.

**Citations.** `docker-compose.production.yml` 471-472; `lib/storage/fileVault.ts` 255-270; `docs/ops/WS_R105_ERASURE_LIVENESS_AND_REDACTED_ERROR_REVIEW_20261023.md` 7-9

**Citation lens — correction.** Replace the destroyVaultBytes sentence with: "destroyVaultBytes treats a missing FILE under a resolvable vault root as already erased (fileVault.ts:260-261, 267-269); it REFUSES an unavailable root (155-156, 219; tests fileVaultConfinement.test.ts:116-121, r98DurableVaultBoundary.test.ts:87-94), and the sweep keeps the row on any throw. So the failure arises only when the root dir exists but is empty: Dockerfile:167 `mkdir -p /app/data/vault` is in the shared image (compose 37, 449), so an unmounted worker with default FILE_STORAGE_PATH=/app/data/vault passes the root check and clears rows while ciphertext remains in vault_data." Mount claim and R105 7-9 claim are accurate. Unknown: .env.production (env_file) could set FILE_STORAGE_PATH; live state is unread.

#### C23 · infra-fact · CORRECTED
**Claim as synthesized.** Delete Work copy says the original file is deleted and 'nothing is kept', while permanentErasureCertified is a static false with no consumer. The 12 Oct trace records full pg_dump|gzip with 14/56/365-day (NAS) and 30-day (local) retention, and the DB holds wrapped_dek and plaintext source_text.

**Citations.** `lib/writersStudio/deleteWork.ts` 214-227; `lib/writersStudio/releaseAuthority.ts` 26; `docs/ops/WS_BACKUP_OPS_TRANSITION_FIXTURE_PLAN_20261012.md` 25-28

**Citation lens — correction.** Copy, static false (releaseAuthority.ts:26) and trace lines 25/27/28 hold. 'No consumer' = nothing branches on it; it is served by beta-access and typeof-checked (useWriterReleaseCapabilities.ts:30). The DB clause is uncited: schema has wrapped_dek (KMS-wrapped) and source_text; prod rows and dump contents are INFERRED.

---

## Part C · Completeness-critic findings (20 gaps; 17 high/medium were filled by FILL-xx)

- **[high] Release decision rule for expected-RED obligations** — WSI-11,13,20,24,26,28,37 are expected RED/FAIL, yet WSI-20/24/26 pass on a 'founder-accepted declared state'. No rule says which REDs block runbook step 4 and which ship as declared gaps, so the run can end green with stranded plaintext extractions and wrapped DEKs and no member removal door.
- **[high] Sanctuary posture on upload, landing and claim** — Read: no TurnPosture/sanctuary reference in app/api/sovereign/manuscripts/ingest/route.ts or lib/manuscript/source/*, while workingSave.ts:147 refuses sanctuary and CLAUDE.md invariant 6 is absolute. No obligation refuses a Sanctuary-posture upload or records a ruling that uploads are out of Sanctuary scope.
- **[high] Consent timing: custody starts at file selection** — Read: P4R1ImportManuscript.tsx:95-135 POSTs to ingest as soon as a file is chosen, landing ciphertext and plaintext extraction before any confirmation. Real members get no 'read without keeping' choice (local-review is memory-only). WSI-39 lacks the 'uploaded, not yet confirmed or abandoned' state.
- **[high] Legacy plaintext Source: production census, retirement order, claim of legacy rows** — Runbook s5 counts only landing_intents (0). Legacy arrivals and plaintext vault files are unread; retireLegacyPlaintextSource has no caller outside tests/witness; claimArrival still reads legacy plaintext (arrivals.ts). WSI-07 on a fresh vault cannot support 'no plaintext original on the host' for production.
- **[high] Vault durability and backup/restore drill** — Repo has no backup of vault_data (single local volume); wrapped_dek is in DB dumps, ciphertext only on that volume. Disk loss makes every original unreadable while the Work still reads source_custodied. WSI-31 assumes a 'copy the vault' procedure exists; none is shown.
- **[high] Read-only production preflight of facts the plan assumes** — Unread: live Caddy matchers, live compose/R104 overrides and worker mounts, FILE_STORAGE_PATH, .env.production, minisforum egress to the KMS endpoint, NTP skew, userns uid mapping, docker log retention, Postgres log_statement, backup/standby state. No obligation records them before anything is changed.
- **[high] Step 5 to step 6 exposure window not contained** — After step 5 ingest is open to every authenticated member (no roster check, rate limit or quota; restrictedCorridor.ts), and the witness runs afterward. WSI-42 measures audience on the harness only. No obligation narrows the edge (allowlist/time-box) or sets a kill criterion and standing census cadence after lift.
- **[medium] Account deletion with Source custody** — delete-account GOVERNED_CONTENT (route.ts:72-114) names no manuscript_source_* table, and arrivals/landing intents reference members ON DELETE RESTRICT (migrations 20260824000001:24, 20261026000001:17). Outcome for a member with originals is untested (inferred: refusal or failure); WSI-20 only 'tries' it.
- **[medium] Member data export and access to held originals** — Read: app/api/members/export-data/route.ts:73-102 returns members, settings, sessions, developmental_memories and Google credentials only. Works, extracted text, filenames and originals are absent and no route returns an original. No obligation requires this to be fixed or declared.
- **[medium] Disclosure and claim reconciliation for the AWS dependency** — PRIVACY_POLICY.md and Privacy-Policy.md do not mention AWS or KMS; app/powered-by/page.tsx:178,326 say 'no third-party dependencies'; scripts/provider-policy.json has no key-custody class. Nothing tells members that key loss makes originals unreadable or that AWS sees call metadata.
- **[medium] Purpose limitation of retained extraction** — Extracted text, filename and plaintext SHA stay in Postgres. No obligation pins that nothing else reads source_text (memory atoms, embeddings, model providers). Current non-test readers are source/custody/legacy/ledger code plus a declared registry entry (capabilityAuthorityRegistry.ts:456).
- **[medium] NON_DELIVERY_REGISTER lines and a non-Resend alert for KMS failure** — The register requires a line in the same change for any declared non-delivery state; inspectMemberIncompleteLandings has no caller and stranded intents are recorded for no one. KMS or credential failure alerts need a path that reaches a human independent of Resend (E1 outage). Plan adds neither.
- **[medium] Parser isolation and time bound** — parseUpload runs mammoth, jszip and xmldom in the shared web process with no timeout or worker (grep finds none). WSI-10/33 test refusal and memory, not a pathological PDF/EPUB/XML that blocks the event loop for all members, or external-entity and remote-reference behaviour.
- **[medium] Through-the-edge at-limit upload** — WSI-09/33 call the route directly. Real Caddy body limits and timeouts for a 25 MiB multipart and the 120 s budget are unread (repo Caddyfile has no request_body or timeout directive; live file differs). WSI-41 probes the edge only with empty bodies.
- **[medium] Environment of evidence per obligation** — No column says disposable, production-read-only or production-write. WSI-03/05/44/47 need minisforum containers with credentials that exist only after runbook step 2 and a lane deploy, while the harness plan isolates from production. Source IP, egress, uid and clock evidence need the real host.
- **[medium] Vault directory and file permissions** — Dockerfile:167 makes /app/data/vault 0777 with no sticky bit; files are 0600 (fileVault.ts:92,114). No obligation checks mode, owner, or which other containers or local users can delete or replace ciphertext. AAD binding detects swap but not deletion or availability loss.
- **[medium] Plaintext data key never persisted, logged or cached** — WSI-07 scans for markers, magic and original SHA; WSI-38 scans for wrapped_dek. Neither looks for 32-byte plaintext key material in DB columns, vault, tmp or logs. A variant persisting or caching the plaintext DEK would pass the set unless WSI-18 happens to hit it.
- **[low] Cross-member idempotency-key reuse** — Uniqueness is (member_id, idempotency_key) in the migration, but WSI-13 tests reuse by the same member only. An implementation unique on key alone would return or collide with another member's intent and sourceArrivalId, and the set would not notice.
- **[low] Disk-full, fsync and read-only faults during landing** — WSI-15 injects kills and WSI-16 injects KMS/credential faults. ENOSPC or write errors during the staged write and link are not injected; read-only dir appears only for destroy in WSI-28. Vault disk sharing with Postgres and any quota are unread.
- **[low] CloudTrail configuration and client matrix unknowns** — Unknown (not in repo): trail scope, whether KMS events are excluded, retention, reader access; WSI-35's positive control should be a KMS event. Also untested: iOS/Capacitor WebView uploads via x-member-id (CLAUDE.md cookie trap) and mobile Safari large multipart.

## Part D · Overclaims the critic found in the synthesis

- **WSI-01 passCriteria: 'or the founder records that evidence transfers by SHA only'** — releaseAuthority.ts:12-20 says old test evidence does not transfer, and WSI-47 requires identical image id. A flag-true candidate cannot equal the post-merge image, so the waiver contradicts the code's rule; require deploying the tested SHA or state the plan cannot satisfy exact-image acceptance.
- **WSI-03 passCriteria 'minisforum's source IP' vs harness isolation plan** — The harness plan separates the run from production Postgres and Caddy unless the founder rules otherwise. Both cannot hold: either the run is on minisforum (shared-host risk) or source IP, egress and uid evidence are not from the real host.
- **WSI-20, WSI-24, WSI-26 passCriteria 'founder-accepted declared state'** — This turns an unmet vow-level property (a member's held data has no removal door; unclaimed arrival keeps plaintext extraction indefinitely) into a PASS. It should be reported as ACCEPTED GAP, never as PASS, and never silently satisfy the 'no stealth memory' vow.
- **WSI-20 expected-RED text and hazard 'reachable by no door' for PENDING/WRITING/BYTES_VERIFIED intents** — Claim verification (C17) shows a same-key retry through ingest re-drives these intents to ARRIVAL_RECORDED. Accurate: no removal, inspection or expiry door exists; retry can only advance, and a reloaded page mints a new UUID that strands the first.
- **WSI-17 coveredToday: 'verifyCustody has no non-test caller; no route reopens an original'** — scripts/verify-ws01-source-custody.ts is a non-test caller. 'No route returns an original' holds for manuscript_source_arrivals only; member-auth GET app/api/writers-studio/sources/[id]/file/route.ts returns plaintext workbench originals (C09 refutation).
- **WSI-24 procedure and defeat candidate (claim failure equals a thrown KMS error)** — C18: claimArrival returning false logs nothing and also yields 201 legacy_interpreted_import; only a throw hits console.error. The false branches (already claimed, hash mismatch, destination gone, lost-response retry) are not exercised by disabling the key.
- **WSI-12 passCriteria 'any 503 is followed by a retry returning that id'** — C12 refutation: ten 'return loadRecordedArrival(...)' lines lack await inside the try, so a DB error there bypasses the wrapper and returns a generic 500 'No manuscript was created' though the arrival exists. The criterion has no place for a 500 on replay.
- **WSI-10 passCriteria 'each gives 413, 415 or 422'** — ingest/route.ts shows other outcomes: formData failure gives 400 (:319-329), an outer-catch failure gives 500 (:433-435). A status-class check will misgrade; define the allowed status per fixture and test the zero-intent property separately.
- **WSI-27 / hazard 'ENOENT counts as erased' for an unmounted worker** — fileVault.ts:155-156 refuses an unavailable root. The failure only arises because Dockerfile:167 creates an empty /app/data/vault in the shared image (C22). State that precondition; a missing mount alone does not prove the guard absent.
- **WSI-31 procedure 'copy the vault' and 'restore-governed.sh'; coveredToday 'real PG16' in WSI-12/19/22/25/29** — No repo vault backup exists and restore-governed.sh does not mention the vault. The PG16 harness is a stub schema with 3 migrations, local-test and mocked R20. Treat these as 'none' for production-shape claims; (c) does not show ciphertext cannot return.
