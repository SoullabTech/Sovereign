# Writer original-file intake · KMS acceptance plan (2026-11-02)

```
STANDING:  PLAN AND EVIDENCE RECORD ONLY. Original-file upload remains HELD at all three layers.
           Nothing in this document lifts a hold, edits releaseAuthority.ts, edits compose or
           Caddy, configures a key, creates AWS resources, or admits member data.
BASE:      canonical commit: `c051385be80ad29c42ae40806bc3acf062f52cda` (read-only worktree)
BRANCH:    claude/writer-source-intake-acceptance-plan (docs only; no PR opened)
LANE:      runbook step 3 (acceptance run) in docs/programme/WRITER_SOURCE_KMS_RULING_AND_INTAKE_LIFT_RUNBOOK_2026-11-01.md
EVIDENCE:  one read-only workflow, 75 agents, 0 errors: 7 subsystem readers, 3 independent acceptance
           designs, 1 synthesis, 46 skeptic checks (2 lenses x 23 claims), 1 completeness critic,
           17 gap-fill drafters. Nothing was executed. No production, AWS or member data was touched.
COMPANION: WRITER_SOURCE_INTAKE_ACCEPTANCE_PLAN_APPENDIX_2026-11-02.md (98 obligations, claim record)
```

## 0. Claim state

Per the claim-state discipline, *built is not wired, wired is not surfacing, surfacing is not verified.*

| Capability | State |
|---|---|
| Encrypted original-file landing (ciphertext-first, AES-256-GCM, KMS-wrapped data key) | **BUILT.** Reachable only through `POST /api/sovereign/manuscripts/ingest`, which returns 423 on the shipped image. |
| Real-KMS behaviour of that code | **NOT VERIFIED.** The only witness in canonical uses the `local-test` provider. |
| Member-facing original-file upload | **HELD** (source manifest) + two Caddy edge holds (unread, not in repo) + no key provider configured. |
| A member-facing way to get an original back | **DOES NOT EXIST** (see F7). |

## 1. What I could not do, and what that means

**The harness named in the runbook was not reconciled, because I cannot see it.** The runbook says the prepared harness is on local commit `4b33659d2`, "not on canonical". That object is not in this container's object store, and the runbook itself calls it local, so I take it to live on your machine (I cannot see your machine, and a bare commit cannot be looked up on the remote). Reconciling code I cannot read would be invention.

**The harness-shaped thing that *is* in canonical is not step-3 evidence.** `scripts/witness/ws-encrypted-source-pg16.sh` plus `encryptedLandingPg16.test.ts` (claim C11, verified):

- uses the `local-test` key provider, which production forbids by design;
- runs against a hand-built stub schema plus three migrations, not a production-shaped database;
- mocks the R20 erasure ledger in jest;
- derives 16 coverage booleans from one exit code and hard-codes `testsExpected` to 12, so reusing its receipt would carry an over-claim into the record;
- is skipped unless `WS_ENCRYPTED_SOURCE_PG16` equals exactly `fictional-only`.

It is good evidence that the *library* works under a fake key. It cannot discharge a real-KMS obligation.

**Need from you:** push `4b33659d2` to any branch, or tell me to author the harness fresh. Either way the plan below holds; only the starting point changes.

## 2. Findings that change the plan

Ranked by consequence. **VERIFIED** = read in canonical and held under both skeptic lenses. **CORRECTED** = the original wording failed a lens; the wording here is the corrected one. **INFERRED** = labelled in place. Claim IDs refer to the appendix, Part B.

**F1 · The sources POST is hard-held in app code, and it breaks the Materials door as built.** `POST /api/writers-studio/sources` is a hard-coded 423 (`SOURCE-LAUNCH-HOLD`, `app/api/writers-studio/sources/route.ts:35-41`) returned before multipart parsing, storage or SQL. It imports no release authority and no test pins it (C01, VERIFIED). The only in-tree upload body for it, `ingestWorkbenchUpload`, has no route caller. The frozen door branch (remote tip `937bc77ea`, intact) carries a *live* POST that came in with merge `a2652d01` (PR #1648), which is **not in canonical**. The door creates every attached file and every kept note through that POST, then binds the result with `POST …/living-works/{id}/materials`. **If the door were merged onto canonical as it stands, it could neither attach a file nor keep a note: the first write would be refused.** This corrects what I told you last turn: I said the door's attach "may be held at the edge". It is held in app code. (This container's local `claude/happy-cannon-17pn9x` was recreated at canonical; the remote branch is untouched.)

**F2 · Removing `SOURCE-CUSTODY-EDGE-01` may open a plaintext store outside the new envelope.** `POST /api/book-studio/workbench/uploads` is gated only by `requireFounder()`, accepts up to 50 MB in-route (effective ceiling probably 30 MiB through proxy config: INFERRED), writes the original as `original.<ext>` with a plain `fs.writeFile`, and stores extracted text in plaintext columns. Nothing under `lib/workbench`, `app/api/book-studio` or `app/api/writers-studio` imports the key authority, envelope, landing or release authority (C02, CORRECTED). No app-layer release gate protects it, and the Caddy matchers are not in the repo (C03). Blast radius is founder accounts only, but it contradicts "originals land encrypted". The runbook's step 5 removes the edge hold without asking this.

**F3 · A flip releases ingest to every authenticated member.** The ingest endpoint has no Writer-roster check, rate limit, quota or Sanctuary check, and sits outside the proxy matcher and the Writer corridor. It does authenticate (C21, CORRECTED). `/press/manuscript` has no roster or release check. The Import room *is* roster-gated, but the endpoint is not, so direct POST works for anyone signed in. Between step 5 and the step 6 witness the door is open to that whole population.

**F4 · Some encrypted bytes have no removal door.** Intents in `PENDING_BYTES`, `WRITING_BYTES` or `BYTES_VERIFIED` have `arrival_id` NULL, so no discard, Delete Work, inspection or expiry door reaches them. `inspectMemberIncompleteLandings` has no caller anywhere; `discardUnclaimedArrival` is called only by tests; the 24-hour sweep named in a migration comment is not implemented (C17, CORRECTED). Only a same-key retry through ingest can advance an intent, and a page reload mints a new key (INFERRED: strands the first). A scanned PDF makes it worse: the route has no empty-text check, so ciphertext is written and verified, then commit refuses empty text, and the member sees a retryable 503 that can never succeed (C16, VERIFIED). Those are bytes and a wrapped key held for a member with no way to remove them, which sits badly with "no stealth memory".

**F5 · A claim failure is told to the member as success.** `POST /manuscripts` claims the arrival *after* the Work commits. If `claimArrival` throws, the route logs the raw error and returns 201 `legacy_interpreted_import`. If it returns false it logs nothing and still returns 201. The Import room never reads `sourceCustody`, and its pre-save copy says the original "remains separately held as Source" (C18, C08, CORRECTED). With KMS unreachable, the claim's Decrypt is refused and rolled back, so the member gets a Work whose original was never claimed, under copy saying it was.

**F6 · Delete Work vs what the copy says.** Delete Work makes no KMS call. One transaction deletes `member_manuscripts`; foreign-key cascades remove claimed arrivals and landing rows (which hold the wrapped key); ciphertext is queued, swept after commit, then R20 is sealed (C06, VERIFIED). Unclaimed arrivals and non-recorded intents survive it. The route returns 500 `custody_incomplete` unless the global queue count is zero after a 100-row sweep, so another member's stuck row can fail yours (C07, VERIFIED). The copy says "nothing is kept". `permanentErasureCertified` is a static `false` that nothing branches on, and the 12 Oct trace records full `pg_dump` retention of 14/56/365 days (NAS) and 30 days (local). The dumps' contents are INFERRED to include `wrapped_dek` and `source_text` (C23, CORRECTED).

**F7 · "Reopen" has no member-facing meaning today.** No route returns a landed original. `verifyCustody` has no runtime caller (its callers are one script and two jest tests); `claimArrival` decrypts but returns a boolean (C09, CORRECTED). The plan therefore cannot test "reopen" until you define it (decision D7). A member-authenticated GET on `sources/[id]/file` does return plaintext *workbench* originals, a different store.

**F8 · The KMS client has no timeouts, and one Decrypt runs inside a DB transaction.** The client is a singleton built with `region` and `maxAttempts: 3` only; credentials come from the SDK default chain, and the SDK's own defaults are unread because `node_modules` is absent here (C04, VERIFIED). `claimArrival` runs Decrypt under `FOR UPDATE` row locks, only for encrypted extraction arrivals on the `aws-kms` provider. The pool is max 20 with a 2 s connect timeout, and no statement timeout exists on the shared pool (C19, CORRECTED). A hung KMS can pin locks and connections. Whether the default chain probes instance metadata on a non-AWS host, and how slowly, is UNREAD; the harness measures it.

**F9 · A worker without the vault mount can mark erasure done while ciphertext remains.** The committed compose gives `maia-media-worker` only `media_data`. `destroyVaultBytes` treats a *missing file under a resolvable root* as erased; it refuses an unavailable root. But `Dockerfile:167` creates an empty `/app/data/vault` in the shared image, so an unmounted worker passes the root check and clears queue rows (C22, CORRECTED). Whether the live worker has the mount is UNREAD (R105 says it did).

**F10 · The vault has no backup in the repo.** `vault_data` is a local-driver named volume on `maia` at `/app/data/vault`; nothing in the repo backs it up (C14, CORRECTED). Live production adds git-absent compose overrides (R20, R104), so the real topology is unproven. If the volume is lost, wrapped keys survive in the database dump while the ciphertext does not (INFERRED).

**F11 · KMS call count differs from the runbook.** One upload plus claim is **1 `GenerateDataKey` + 3 `Decrypt`** (verify, commit inspect, claim); each `verifyCustody` adds one. Runbook step 6 expects a "pair" (C20, VERIFIED). The CloudTrail check must expect the real counts.

**F12 · Six tests pin the hold and must be requalified, not edited to green** (C10, VERIFIED): `transportBoundary.test.ts:132` and its three F7 cases at 353-390 (they expect 423 with no idempotency header and would now get 400), `encryptedSourceUploadContract.test.ts:23`, `p4r1ImportHoldHonesty.test.ts:68`, `routeHold.test.ts:62`, and e2e `journey.spec.ts:132`. In each, the literal is incidental to the real law (gate order, chooser conditional, identity chain, export and erasure fences), which must survive.

**F13 · Idempotency has rough edges.** Landing is unique on `(member_id, key)`. A key reused with different bytes is refused safely but surfaced as a retryable 503 with a "preserved record" message and no 409, and no test covers it. Ten `return loadRecordedArrival(...)` lines inside the `try` lack `await`, so a database error on replay escapes as a generic 500 "No manuscript was created" although the arrival exists (C12, CORRECTED).

**What also holds, so the picture is balanced.** Landing order is sound: intent row, then one data key, then ciphertext fsynced at mode 0600, then verification by Decrypt, then one transaction to record the arrival. Crash recovery was read as handled for every boundary except the narrow link/unlink window (nlink 2 wedges that intent with no cleanup). Auth, identity forgery refusal and access-matrix denial all precede any body read. The KMS encryption context is content-free by construction. Plaintext remains in Postgres for extracted text, filename, MIME and plaintext SHA-256, so "encrypted" means **original bytes only** and acceptance criteria must say so.

## 3. Decisions only you can make

My lean is given for each. These are recommendations, not rulings.

| # | Decision | Lean |
|---|---|---|
| D1 | **Audience at the flip**: Writer roster only, or every signed-in member? Rate limit or quota? | Roster only, enforced server-side at ingest, plus a rate limit. Run step 6 in a contained window (witness-member allowlist at the edge, with an end time) before any wider exposure. |
| D2 | **Workbench and sources POST**: add an in-code hold tied to the release manifest so protection stops depending on an unversioned Caddyfile? | Yes. Keep `SOURCE-CUSTODY-EDGE-01` until it lands. Read the live Caddyfile first (see §6, Phase 0). |
| D3 | **Stranded intents and textless files (F4)**: flip blocker, or a declared non-delivery state for the first wave? | Blocker, via a small repair: refuse empty extracted text *before* custody, and give members a visible "unfinished uploads" list with discard. If you declare it instead, it needs a register line, an owner, a member-facing sentence and a closure condition. |
| D4 | **Claim failure (F5)**: still save the Work as `legacy_interpreted_import`, or refuse? | Refuse and keep the arrival unclaimed with a door to retry or discard. At minimum, change the copy so it never says "held as Source" unless that is true. |
| D5 | **"Nothing is kept" (F6)**: reword now, or accept the gap under the backup-erasure lane? | Reword now to what is true (live copy removed; backups age out on schedule). Keep `permanentErasureCertified` false. |
| D6 | **Sanctuary**: does Source import fall under it? No code on this path consults posture. | An upload is a deliberate Work act, not a conversation, but invariant 6 is absolute. Decide, then make code and copy match. Refusing when the client signals Sanctuary is the safe default. |
| D7 | **What "reopen" means (F7)**: open the Work from stored sections, custody verification by decryption, or a future "get my original back" surface? | Define it as the first two for now; treat the third as separate, and word the "held as Source" copy accordingly. |
| D8 | **Where step 3 runs, and which key**: a throwaway twin KMS key with the production policy for destructive probes (disable, deny, deletion window, rotation)? Does a flag-true harness image count as evidence, given the manifest says evidence does not transfer between images? | Twin key, strongly: disabling or scheduling deletion of the production key makes every stored original unreadable. Harness evidence covers behaviour; the exact deployed image must itself be witnessed in step 6. |
| D9 | **KMS timeouts**: may an explicit SDK request and connection timeout be added before step 4? The runbook authorizes no code change for it. | Yes, as a separate small change. |
| D10 | **Loss and continuity**: region; second key or escrow; back up `vault_data` (retention, copies); who may call `ScheduleKeyDeletion`; an alert channel that is not Resend. | One key is a single point of permanent loss. Decide vault backup and the alert path before step 4. |
| D11 | **Credential**: long-lived access key in a 0600 file, or short-lived? Rotation as a lane-deploy recreate of `maia` in a maintenance window? | Accept the file for the first wave; measure in the harness whether the process caches credentials. |

## 4. Release-disposition rule (proposed, needs your ruling)

The critic's highest finding: the plan has many expected-RED results, and no rule says which block step 4. **Without one, the run can end green with stranded plaintext extractions, wrapped keys, and no member removal door.**

Proposed rule, fixed *before* any run:

- Every obligation is predeclared **BLOCKER** (must PASS) or **DECLARED GAP** (ships only with a register line, owner, member-facing sentence and closure condition).
- A declared gap is reported as **ACCEPTED GAP, never PASS.** A founder-accepted state does not satisfy the vow-level property it describes.
- The step-4 verdict is computed from per-obligation receipts, not typed.
- The new non-delivery states this lane has found (F4's stranded intents; any KMS alert with no human path) get lines in `docs/ops/NON_DELIVERY_REGISTER.md` **in the same change** that declares them. I have added none, because nothing is declared yet.

Expected-RED classes (26 obligations carry the marker; the appendix has them) and my proposed disposition:

| Class | Obligations | Proposed |
|---|---|---|
| Textless-file refusal before custody | WSI-11 | BLOCKER (small repair) |
| Stranded intents / unclaimed arrivals have a removal door | WSI-20, WSI-26, FILL-1b | BLOCKER, or declared gap per D3 |
| Claim-failure honesty | WSI-24, FILL-3c | BLOCKER for the copy; the member door may be a declared gap |
| Audience equals declared audience | WSI-42, FILL-7a/7b/7c | BLOCKER (D1) |
| Sanctuary scope | FILL-2a/2b/2c | BLOCKER once D6 is ruled |
| Vault backup and consistent pair | FILL-5a/5c, WSI-31 | DECLARED GAP until D10 |
| Distinct, content-free cause per fault | WSI-37 | DECLARED GAP, unless alerts (D10) depend on it |
| Member export names every Writer store | FILL-9a/9b/9c | DECLARED GAP, but it must be disclosed |

## 5. What the acceptance run is made of

98 obligations: 47 synthesized (WSI) + 51 gap-fills (FILL). **None is fully covered by anything in the repository today** (46 have no coverage; 52 partial). Thirty need no real KMS and can run first; sixty-eight do. Every obligation carries a procedure, pass criteria and a *defeat candidate*, a plausible wrong implementation or setup that the run must fail. That is the project's own discipline: an acceptance run that cannot fail is not an instrument.

Three environments of evidence, declared per obligation, because a receipt measured elsewhere cannot discharge a production-class row (FILL-15):

| Env | What | Examples |
|---|---|---|
| **E0** read-only production preflight | Facts the plan assumes and nobody has read | live Caddy matchers; live compose and worker mounts; `FILE_STORAGE_PATH`; egress to the KMS endpoint; clock skew; uid mapping; backup state; legacy plaintext Source census |
| **E1** disposable harness, fictional data | Library and route behaviour, faults, crash points | formats and size boundary; idempotency and concurrency; kill at each landing boundary; KMS and credential faults; reopen; discard; claim; Delete Work; logging scans; honesty of every member-visible sentence |
| **E2** production witness (step 6) | The exact deployed image, contained and reversible | one fictional upload by a test member; CloudTrail pair-count check; Co-Lab gate with 0 failed; discard and erase |

Harness requirements that matter most (full list in the appendix): a flag-true release-candidate image; a production-shaped schema (baseline plus every migration, not a stub); a vault volume mounted as in production; a twin KMS key; the credential as an owner-only file on `maia` only, never in `.env.production`; the real R20 ledger; the real media worker with a control worker started *without* the mount; fault injectors (packet drop to KMS, IAM deny, key disable, `SIGSTOP`/`SIGKILL` at database-observed states, read-only vault); generated fictional fixtures (the repo has no PDF or EPUB fixtures, no scanned PDF, no high-ratio zip); scanners proven to fire on planted positives; a receipt computed from results; and a **library of deliberately wrong setups** that the harness must kill, so the harness is itself proven lethal.

## 6. Order of work

| Phase | Who | What |
|---|---|---|
| **0** | You, on minisforum, read-only | Read the live Caddyfile matchers and 423 body; live `maia` and `maia-media-worker` mounts and env; `FILE_STORAGE_PATH`; egress to `kms.<region>.amazonaws.com:443` and metadata endpoint behaviour; backup state; counts of intents, unclaimed and legacy plaintext arrivals; `FOUNDER_MEMBER_IDS`. I have no `ssh` here and ran none of it. |
| **1** | Session, no AWS | Author the harness skeleton, fixtures, scanners and wrong-setup library; run the 30 no-KMS obligations. Needs §1 resolved. |
| **2** | You | Runbook steps 1-2: KMS key and a twin, IAM principal, CloudTrail, credential file. Credentials never pass through a session. |
| **3** | Session + harness | The 68 real-KMS obligations against the twin key. |
| **4** | Separate authorizations, small changes off canonical | Candidate repairs: empty-text refusal before custody; roster gate and rate limit at ingest; Sanctuary refusal; in-code hold on the workbench POST; claim-failure honesty; unfinished-uploads door and sweep; explicit KMS timeouts; the missing `await`s; Delete Work copy. None is made. Each answers D1-D9 first. |
| **5** | Step 4 of the runbook | Flip the manifest. Requalify the six tests in F12 *without* losing their laws. |
| **6** | You + session | Step 5 edge-hold removal in a contained window; step 6 production witness (E2); kill criteria predeclared. |

## 7. Growth-obligation answers (carried and extended)

The runbook answered these for KMS itself. What this lane adds:

- **Uncertainty introduced, and how it is preserved.** Whether the real KMS client behaves as the code assumes (credential chain, timeouts, retries) is unknown and is the first thing the harness measures. Everything unread is listed in §8 as unknown, not assumed.
- **Provenance and ownership.** Extracted text, filename, MIME and plaintext SHA-256 stay in Postgres in the clear. The member owns the Work; the original is currently custodied but not returnable. D7 and D5 decide what the member is told.
- **New responsibility.** Stranded encrypted bytes with no removal door (F4), a key whose loss is permanent, and a flip that widens the audience (F3) are responsibilities the lift creates. None should ship as an unwritten assumption.

## 8. Unread (UNKNOWN, not assumed)

**On minisforum:** the live Caddyfile (matchers, order, 423 body, body-size and timeout limits); live compose chain and overrides; `maia-media-worker` mounts; `FILE_STORAGE_PATH`; Docker userns mapping and file ownership; egress and clock; backup, standby and NAS state after 23 Oct; current counts of landing intents, unclaimed and legacy plaintext arrivals, workbench rows; `FOUNDER_MEMBER_IDS`; any cron or systemd job running the erasure sweep.
**AWS side:** key policy and the behaviour of the `kms:EncryptionContext:soullab:domain` condition; CloudTrail scope, delay and fields; throttling and latency.
**Engineering:** `@aws-sdk/client-kms` 3.1142.0 default timeouts, retry mode and credential-chain order (needs the installed package or debug logging); whether `formData()`, mammoth, pdf-parse, jszip or xmldom write temp files or echo document fragments in errors; peak memory for a 25 MiB upload; whether `maxDuration = 120` is enforced when self-hosted; how `delete-account` treats members holding arrivals (their foreign keys are `RESTRICT`); whether the e2e journey spec runs in any CI; the contents of `4b33659d2`.

## 9. Not authorized by this document

Lifting either Caddy hold. Changing `releaseAuthority.ts`. Editing compose, Caddy, tests or any source file. Creating AWS resources or touching a credential. Admitting member originals or running anything against production. Opening a PR, merging, or deploying. Un-freezing `claude/happy-cannon-17pn9x`, which is untouched. Every item in §6 Phase 4 is a proposal, not an act.
