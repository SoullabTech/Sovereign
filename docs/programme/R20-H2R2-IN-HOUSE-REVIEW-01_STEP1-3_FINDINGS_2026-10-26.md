# R20 H1R2/H2R2 — In-house review, steps 1–3 findings

**Date:** 2026-10-26 · **Lane:** R20 (owner #1793; assurance index #1983) · **Branch at drafting:** `chore/a1-ls1r1-packet-transport-20260925` (uncommitted draft)
**Classification (binding wording):** `FOUNDER-DIRECTED / CC-LED IN-HOUSE REVIEW / NOT INDEPENDENTLY REVIEWED`
**Status of this file:** working record. Not admitted, not posted, not a verdict, not an acceptance of H1R2 or H2R2.

No AI-assisted, founder, builder, or in-house result here is independent human security acceptance (#1983 charter). Every hold in the R20 record is unchanged.

## 1. Scope and custody

- Reviewed: H2R2 packet `R20_H2R2_P256_POLICYAUTHORIZE_R1_20261026` (T7, read-only). Canary script sha256 `3007aabf…d9d5` verified on the scratch copy. Crash model `fbff22d4…0694` and tests `ab0d4147…8f59` verified on the scratch copy.
- Work was done in scratch copies. T7 originals untouched. No production, physical TPM, private key, member data, vendor, or external contact.
- Step 1 (TPM canary) was **inspection only** (code and recorded output). Scratch TPM runs were **not performed**: Docker's image store was read-only on the review host (host data volume at 100%). Nothing in §2 is a TPM execution result.

## 2. Step 1 — TPM canary (code-read and recorded-output evidence only)

| # | Observation | Evidence class | Status |
|---|---|---|---|
| T1 | `expect_refusal` accepts any non-zero exit with an `ERROR:` line. Recorded refusals do not discriminate cause: replay, event substitution and wrong key all return the same TPM error ("signature is not valid"); wrong-cpHash and stale-pre-write delete both return `0x99D`; wrong-command, service-delete and founder-increment all return `0x9A4`. | recorded output | Confirmed. Paired controls (same construction, one factor changed) are absent. |
| T2 | Nonce, cpHash and expiry bindings may be enforced by the signer, not committed in the NV policy digest. If so, the TPM would also accept a credential signed without them. | TPM-spec reasoning | **HYPOTHESIS — unverified.** Needs a scratch run. |
| T3 | No negative test for: expired signature; swapped service/founder roles; cross-use of policyRefs; reuse of a verified authorize ticket without a fresh signature; session reuse. | script read | Confirmed absent. |

## 3. Step 2 — crash-prefix model (executed on the model)

### 3.1 Suite strength
Single-line weakenings of 31 guards: packet's 23 tests catch **12/31**; with 15 added laws **30/31**. The survivor (`finalize-tpm-check`) is unreachable through public methods — recorded as defence in depth, ⛔ not as a proven-equivalent mutant.

### 3.2 Findings (model level)

| ID | Finding | Evidence | Severity (reviewer's, non-binding) |
|---|---|---|---|
| H2R2-M1 | **Counter binds a number, not an event.** A restored ledger carrying a different pending intent can be finalized after another event advanced the counter, yielding two verifying receipts for one generation with different heads. | Hand-built witness + bounded exhaustive explorer (depth 7, 5,152 states, shortest path 7 steps). Reachable through `advance()` retry as well as `recover()`. | High for the described design (counter + restorable ledger) if the restore fence is absent. |
| H2R2-M2 | `recover()` does not cross-check `ledger.head_sha256` against the signed receipt; a silently altered head with no pending intent returns `CURRENT`. | Executed witness | Medium |
| H2R2-M3 | Resuming a pending intent via `advance()` moves the irreversible counter **before** the pending intent is validated; a later refusal cannot undo it. | Executed witness | Medium |
| H2R2-M4 | Only the latest commit has a durable receipt; an earlier event's lost acknowledgement is not recoverable after process loss. | Executed witness | Design question, possibly acceptable |
| — | The packet's test "crash after commit loses ack, not commit" reads through a volatile cache. With the cache cleared the claim **holds** for the latest event. | Executed witness | No defect |

### 3.3 Scratch design candidate (not a proposal for admission)
TPM-side state also records which event advanced it; every finalize path checks that record. Passes the packet's 23 and the 15 added laws; explorer finds no violation at depth 7 (5,168 states). The first attempt guarded only `recover()` and the explorer caught the gap; the guard must sit in the shared finalize step. A real realization would change the TPM policy design (counter alone cannot carry event identity) and is a founder/design decision.

### 3.4 Limits
Bounded to 2 event names, 2 snapshot slots, depth 7. Model only: no filesystem durability, power loss, real TPM, or restore-fence behavior. The model is not a production witness (as the packet itself states). Mutation survivors are classified by reasoning, not proof.

## 3b. Step 3 — H1R2 source proposal (READ-ONLY code-read; nothing executed)

Reviewed: `R20_H1R2_FEDERATED_SEPARATION_R1_20261026` (T7, read-only): `START_HERE.md`, `H1R2_FINDING_DISPOSITION.md`, `r20HybridRelease.ts` (948 lines, read in full), the longitudinal issue/assert/apply path in `maiaLongitudinal.ts`, the turn flow in `apps/cabin-desktop/runtime.ts`, and the static-contract test's structure. The packet's own 116/116, 29/29, 9/9 and 21/21 results were **not** reproduced. Reviewer questions 1–7 in the packet are addressed below only to the extent code-read can.

### 3b.1 What the code-read supports
| Claim | Observation | Class |
|---|---|---|
| Local recall and federated completion are separate, non-interchangeable | Distinct protocols, evidence types and token classes; no path converts one to the other | code-read |
| No unsigned completion object | Completion is derived from signed HEAD and PIN receipts for exactly the configured domain set; duplicate/absent/extra domains refused | code-read |
| Trust roots not self-supplied by transport | Configuration envelope verified against a caller-pinned installation-root fingerprint; where that fingerprint comes from is **outside the packet** | code-read, partial |
| HEAD ≠ PIN key | Refused per domain by fingerprint | code-read |
| Fail-closed today | `runtime.ts` calls the issue path with no recall token, so every longitudinal request ends at HTTP 423. The success path is exercised only by test fixtures | code-read |
| Checks around private reads/output | Recall asserted before reads and after (inside one transaction); asserted again before model call, before the answer is saved | code-read |
| Token unforgeability | Private-field brand plus `instanceof`; a prototype-copied object throws rather than passing | code-read |

### 3b.2 Gaps and observations
| ID | Observation | Class | Reviewer severity (non-binding) |
|---|---|---|---|
| H1R2-G1 | Trust configuration has no maximum lifetime, sequence number or revocation. An old signed configuration remains valid until its own `expiresAt`, so key rotation cannot take effect early. | code-read, absent in `admitCabinR20TrustConfiguration` | Medium |
| H1R2-G2 | No check that keys are unique across domains, or distinct from the installation root or local witness key; "independent domains" relies on an honest configuration. | code-read, absent | Low–Medium |
| H1R2-G3 | Provider Object Lock evidence is a claim signed by the PIN key. The configuration pins no expected bucket, key or account identity, so any hashed identity the PIN signer chooses is accepted; the verifier cannot confirm the retention exists. | code-read, absent from config type | Medium |
| H1R2-G4 | The optional `releaseDigest` / `trustConfigurationDigest` arguments of the "current" checks are not passed at the longitudinal call sites; a token minted under an older configuration passes until its short expiry. | code-read | Low |
| H1R2-G5 | Completion admission needs a local attestation under 5 minutes old, so a completion token is a short-lived capability, not an archival proof. Durable "complete" evidence depends on H3 accepted-envelope storage. | code-read | Observation (likely by design) |
| H1R2-G6 | `expected.now` can be overridden by callers; expiry checks depend on every caller using the real clock. | code-read | Low |
| H1R2-G7 | Canonicalization and digest helpers and `admitCabinR20Currentness` live in canonical files **outside the packet**; signature-canonicalization soundness is unassessable from the packet alone. | packet gap | Review limitation |
| H1R2-G8 | The 21 static-contract checks are string-presence tests over source text: they show structure exists, not that behaviour is correct. | code-read | Observation |
| H1R2-G9 | Challenge nonce is caller-supplied and never generated or consumed, so a reused nonce within the 5-minute window is not caught. | packet states this itself | Documented hold |

### 3b.3 Cross-link to Step 2
H2R2-M1 (counter binds a number, not an event) bears on H1R2 local recall: the local witness is its trust anchor, so a witness ledger able to sign two heads for one generation would undermine recall after a restore. Link recorded, not demonstrated end to end.

### 3b.4 Limits
Code-read only. No tests run, no scratch variants, no TPM. Statements that something is "absent" mean absent from the files in the packet, not from the whole repository (G7 shows some logic is outside it).

## 3c. Step 3 verification by execution (G1–G4) — added 2026-10-26, after 3b

3b.4 above is preserved as written: it describes the read-only pass. This section supersedes its "nothing executed" statement for G1–G4 only.

### 3c.1 Setup and custody
- Disk before running: data volume 4.5 GiB free (99%); scratch footprint 233 MB (five text-only copies of a 46 MB subtree; free space afterwards 3.8 GiB, 100%).
- Parent checked out with `git archive` (no worktree or repo metadata touched). Tree `a4cf1a0d0fb5af3fdfc42588d41f3e162710fe27` matches the packet. **Packet defect:** `START_HERE.md` gives the parent SHA as 39 characters (one dropped); `6032ef43` resolves uniquely and the tree hash matches, so the referent is not in doubt.
- Packet's seven source files overlaid on the parent copy: **7/7 SHA-256 match `H1R2_SOURCE_MANIFEST.json`**. T7 originals untouched.
- Toolchain: Node v22.22.3 and the repository's `node_modules/esbuild`, as the packet's tests expect.

### 3c.2 Reproduction of the packet's own tests
| Check | Result | Class |
|---|---|---|
| `r20-local-federated-h1r2.test.mjs` + `maia-longitudinal-s2.test.mjs` | **38/38 pass** | executed (scratch copy) |
| `r20-h1r2-static-contract.py` | **21/21 pass** | executed (scratch copy) |
| Packet log reports 116 tests | **Not reproduced**: the packet's run covered more test files than I ran | recorded output only |

### 3c.3 Targeted variants, with controls
Fifteen witnesses plus three G3 variant tests. Each gap has a **control** that must still refuse (so a pass cannot come from a harness that accepts everything), then a **witness** showing what is accepted.

| Gap | Outcome | Evidence |
|---|---|---|
| G1 lifetime | **Confirmed.** A 100-year configuration is admitted; control (expired) refused. | executed |
| G1 sequence / supersession / revocation | **Confirmed.** Two configurations with the same id and different keys are both admitted; a completion still admits under the old configuration after a rotated one exists. The module exports nothing named for revocation, sequence, supersession or rotation (that last part is a restated code-read). | executed |
| G2 shared keys across domains | **Confirmed.** Two "independent" domains sharing one head+pin keypair are admitted and a completion verifies. Control (head==pin inside one domain) refused with `TRUST_KEY_COLLISION`. | executed |
| G2 domain key == installation root key | **Confirmed.** Admitted. | executed |
| G2 local witness key == domain key | **Refined: not a gap.** The local key is P-256 and domain keys must be Ed25519, so the collision is impossible by type. G2 as worded in 3b.2 over-reached on this sub-case. | executed |
| G3 provider identity | **Confirmed.** Attacker-chosen bucket/key/version hashes are admitted; two configurations accept two different bucket identities for one domain; the config type has no field to pin one. Control (tampered `bodySha256`) refused. | executed |
| G4 omitted currentness arguments | **Confirmed.** A token minted under a superseded configuration passes when the digest is omitted, and is refused when the current digest is supplied (control). | executed |
| G4 `releaseDigest` | **Refined.** One of the three call sites does pass `releaseDigest`, but it comes from the same admission's stored copy, so it is self-consistent and cannot detect rotation. 3b.2's "not passed at the call sites" is true for `trustConfigurationDigest` (none) and misleading for `releaseDigest`. | executed |

### 3c.4 Lethality of the witnesses (are they able to fail?)
Each candidate tightening below was applied to a **separate scratch copy** (diffs saved), never to the packet:
- **G1 lifetime cap (400 days) + G2 key uniqueness (cross-domain and root):** the G1-lifetime and both G2 witnesses go red; controls stay green; the packet's own **38/38 still pass**. Cheap and compatible.
- **G4 trust digest made mandatory:** the G4 witnesses go red, but **9 of the packet's 38 tests fail**, because no caller currently has a source for "the current configuration digest". Not a one-line fix; it needs a design decision about where that digest comes from.
- **G3 optional pinned bucket identity per domain:** a matching bucket is admitted, an attacker-chosen bucket is refused, and with no pin the current behaviour is unchanged. All 53 tests (packet 38 + 15 witnesses) pass with it present.
- **Not covered:** G1 sequence/revocation needs verifier state (a stored high-water mark or a revocation source) and was not prototyped. G5–G9 were not run.

These candidates are **review instruments, not proposals for admission**. They confirm the gaps are real and that tighter designs are feasible without breaking the packet's suite; they do not choose a design.

### 3c.5 Limits
Executed against the isolated source proposal only, in a scratch copy, with fictional fixtures. Not a deployment, not a TPM or hardware result, not independent. A gap "confirmed" here means the code accepts the input; whether it matters depends on the threat model (for example G3 and G2 matter if a single signing key can be compromised or mis-provisioned).

## 3d. Step 1 by execution — T2 on a disposable software TPM (added 2026-10-27, after 3c)

Supersedes the "TPM runs not performed" statement in §1 and the "HYPOTHESIS — unverified" status of T2. Earlier sections are preserved as written.

**Setup.** Founder-approved scope: disposable swtpm in a container with `--network none`, scratch copy of the packet canary (setup lines 1–299 reused unchanged, variants appended), fixture keys generated in-container and destroyed on exit. No physical TPM, no T7 writes, no production. Docker Desktop had to be restarted first (its store was read-only after the disk filled); local stack only. Instrument: `R20-H2R2-IN-HOUSE-REVIEW-01_scratch/t2-swtpm-variants.sh`. One run; not repeated.

| ID | Variant | Result | Class |
|---|---|---|---|
| V0 | control: nonce + cpHash + expiry all bound | increment accepted (counter 1→2) | executed, swtpm |
| V1 | signature made **without nonce/expiry**; the same signature used in two separate sessions | both increments accepted (2→3→4) | executed, swtpm |
| V2 | signature made **without cpHash** | increment accepted (4→5) | executed, swtpm |
| V3 | control: nonce-bound signature replayed | refused, with a TPM error (the harness's refusal check passed) | executed, swtpm |
| V4 | **service key signs an approved policy for delete** (UndefineSpaceSpecial + current delete cpHash) | **delete accepted; index removed** | executed, swtpm |

**Findings.**
- **T2 confirmed.** The NV policy digest commits only to the signing key, the policy reference and the command code. Nonce, expiry and cpHash are chosen by whoever signs, not required by the TPM policy. Replay protection and cpHash binding therefore hold only while the service signer always includes them.
- **H2R2-T4 (new, High for the stated design).** The packet's "service cannot delete" result (`SERVICE_DELETE`) refuses because the approved policy the test builds names the increment command. It does not show that the service key is unable to delete: a service key that signs an approved policy naming delete does delete (V4). Separation between the service and founder branches holds only if the service signer never signs such a policy. The recorded test cannot distinguish this from a structural guarantee.
- A plausible design response (a command-code check inside the stable service branch, or a founder-only delete branch that the service branch cannot reach) would change the policy design. That is a founder/design decision, not made here.

**Correction, 2026-10-27.** My first V4 script judged "index removed" by grepping `tpm2_getcap handles-nv-index` for a zero-padded handle, but the TPM prints `0x1534C20` without the leading zero, so that line would have said "removed" regardless. V4's result rested on `nvundefine` returning 0; I changed the check to `tpm2_nvreadpublic`, re-ran, and V4 stands (index removed). **The packet's own canary has the same flaw** at its founder-delete assertion (`grep -qi "$INDEX"` on the same output): it can never fail, so that assertion is vacuous even though the recorded handle list is empty. See design note §5.

**Limits.** Software TPM only; fictional keys; single run; V1 shows the same signature accepted twice but does not map out every case. Whether the service signer in the real design always binds nonce and cpHash is outside this packet. Not hardware, not independent.

## 3e. Step 2 continued — additional crash-prefix laws (added 2026-10-27, model level only)

New suite `tests/test_crash_prefix_laws2.py`: Part A, 12 laws, all **pass on the packet model**; Part B, 4 executed witnesses. Laws cover: refusals before durable intent leave state unchanged for every credential/event refusal path; every sequence of up to three crash points followed by a retry of the same event ends with exactly one TPM increment and one verifying receipt; a pending intent cannot be taken over; bad credentials cannot resume a pending advance or read a committed duplicate; every receipt field is covered by the MAC; the receipt matches ledger and counter; stale restore after commit blocks replay; restoring a prepared snapshot recovers once; hold blocks everything; expired retry does not move the counter; a two-event chain is contiguous.

**Mutation strength.** The earlier 31 guard-weakening mutants are unchanged: 12/31 (packet's 23), 30/31 (with the 15 added laws); set 3 adds no new kill there. Seven new *structural* mutants (receipt omits counter; MAC excludes head; credential checked after the duplicate path; intent written before event verification; pending not cleared; hold not checked; duplicate matched on digest only): packet's 23 kill 4/7; with the 15 laws 5/7; **with set 3, 7/7**. Set 3 is what kills "receipt omits TPM counter" and "committed duplicate returned before the credential check" (the latter would hand a committed receipt to a wrong-device or old-key caller). Classification of survivors before set 3 is by execution, not reasoning.

**Part B observations (executed; model level).**
- **B1** `recover()` finalizes a pending intent and signs a receipt with no credential parameter; the intent was authorised when it was prepared, but nothing re-checks that at recovery. This is the same surface as H2R2-M1.
- **B2** The acknowledgement cache survives a ledger restore: a receipt stays readable for an event the restored ledger no longer shows.
- **B3** `verify_receipt` checks the MAC only; no model function says a receipt is superseded. A consumer such as H1R2 local recall must compare generation itself.
- **B4** Commit and receipt are one step, so the interruption "after commit, before receipt" cannot occur in this model. It is unmodelled, not shown safe.

**Limits.** Same as §3.4: bounded model, no filesystem durability, power loss, real TPM or restore fence.

## 3f. Step 3 continued — H1R2 G5–G9 by execution (added 2026-10-27)

Rebuilt the scratch checkout from parent `6032ef43` plus the packet's seven files; packet's own **38/38 reproduced** (parent SHA in the packet is 39 characters; the tree matched as before). Instrument: `h1r2/scratch-h1r2-g5-g9.test.mjs` (14 tests, all with controls; all pass).

| Gap | Result | Class |
|---|---|---|
| G5 completion is a short-lived capability | **Confirmed as designed.** Token expiry never exceeds attestation issue + `maxAttestationAgeMs` (validator caps it at 300,000 ms); after the window the currentness check refuses the same token. Not archival; durable proof depends on H3. | executed |
| G6 caller-controlled clock | **Confirmed.** The same evidence is admitted at one `now` and refused at another; rewinding `now` makes stale evidence admissible. **Mitigating observation:** neither `maiaLongitudinal.ts` nor `apps/cabin-desktop/runtime.ts` passes `now:`, so the real clock is used in the paths read. | executed + code-read |
| G7 canonicalization outside the packet | **Partly closed.** The parent's canonical encoding is JSON with sorted keys and escaped strings; key order does not change the digest, distinct values give distinct digests, and the attestation signature covers every field (an unsigned extra field breaks it). Not a full soundness proof. | executed + code-read |
| G8 static contract is string presence | **Confirmed by mutation.** Four single-line removals pass **both** the packet's 21 static checks and its 38 behavioural tests: nonce-replay check off (M2), completion currentness expiry off (M4), PIN not bound to the HEAD envelope (M5), HEAD not bound to the local attestation (M7). Two more (active-obligations M3, retention horizon M6) are caught by the packet's tests. My scratch tests kill M2, M4, M5, M7. One further mutant (freshness window) was set aside as near-equivalent: a second check covers it. | executed |
| G9 caller-supplied, never-consumed nonce | **Confirmed.** The same attestation plus the same nonce admits repeatedly inside the window; a constant verifier nonce makes every recorded attestation reusable. Wrong and short nonces are refused (controls). | executed |

**Limits.** Isolated source proposal, scratch copy, fictional fixtures; not a deployment or hardware result; the G6 control is weak (with the real clock the fixture is refused for a different reason, future-dating); mutants are single-line and hand-chosen.

## 3g. G1 sequence / supersession / revocation — scratch prototype (added 2026-10-27; review instrument, not a proposal for admission)

`h1r2/candidate-G1-sequence-revocation.diff` (applied to a separate scratch copy of the packet source). Shape: an optional signed `sequence` in the trust record; an optional verifier-state argument (`minimumSequence`, `revokedConfigurationDigests`, `acceptedDigestAtMinimum`) on admission; a standalone `assertCabinR20TrustConfigurationCurrent(token, verifierState)` so an already-admitted token can be superseded or revoked. With no verifier state, behaviour is unchanged.

**Results.** Packet's **38/38 still pass** with the prototype applied. Nine scratch witnesses (`scratch-g1-sequence-revocation.test.mjs`) pass, each with a control: sequence required under verifier state; below-floor refused as superseded; after the floor rises the old admitted token fails currentness and the new one passes; a revoked digest is refused at admission and fails currentness afterwards (an unrelated digest does not); the sequence is covered by the root signature; two records at one sequence are both admitted by a bare floor but a pinned accepted digest refuses the fork. **Six single-line mutants of the new guards are all killed** (`h1r2/g1-mutants.py`).

**Limits that the prototype does not solve (executed as witnesses where noted).**
- Verifier state is plain input. A caller that supplies a lowered floor re-admits the old configuration (S8). Where the floor lives, and what stops it being rolled back by a restored backup, is the same restore problem as H2R2-M1 and needs a design decision (for example holding the floor under the TPM counter).
- Revocation does not reach tokens already minted from recall or completion: their currentness checks do not consult verifier state, so a revoked configuration's completion token stays valid until its own expiry (S9). That is the G4 interplay; wiring it is the design decision G4 already named.
- The lifetime cap and key-uniqueness candidates from §3c.4 are separate patches and were not combined with this one.

Not a deployment, hardware or independent result; fictional fixtures.

## 3h. Where the G1 floor/revocation state could live — rollback analysis (added 2026-10-27, model only)

`floor_model.py`: bounded exhaustive exploration (depth 7; configurations C1–C5 are public signed blobs an attacker may keep forever). Property S1: once a configuration has been superseded or revoked by an *authorised* act (a ghost record that is never restorable), no later admission of it may succeed. Attacker moves: back up the application store, restore it, or swap in a new device whose TPM counter starts at zero.

| Design | Where the state lives | Restore a backup | Swap in a new device |
|---|---|---|---|
| D0 | floor in the application store | **defeated in 4 steps** (snapshot, raise floor, restore, admit old) | **defeated in 3** |
| D1 | floor in a TPM counter; revocation *list* in the application store | **defeated in 4** (snapshot, revoke, restore, admit the revoked config) | **defeated in 3** |
| D2 | floor in a TPM counter; revocation only by raising the floor | no violation found | **defeated in 3** |
| D3 | D2, plus each configuration bound to one device instance | no violation found | no violation found |

(D0, "both attacks combined", hit the 600,000-state cap; its violation was already found by the shorter classes. All other runs completed within the bound.)

**What this shows.**
- A floor kept only where a backup can restore it is no floor: the restore resets it. A TPM counter is not restored, so it survives; this is the opposite of H2R2-M1 for a useful reason. M1 failed because a counter binds a *number*, not an *event*; a floor *is* a number, so a counter can hold it.
- A revocation **list** cannot live in a counter and so stays restorable (D1). The model suggests collapsing revocation into the floor (D2): revoking configuration *k* means raising the floor to *k+1*. Cost: no selective revocation of a middle configuration; revoking the newest one means nothing is admissible until the root issues a higher sequence.
- A counter alone does not stop a device swap (D2): a fresh TPM starts at zero. What closes it in the model (D3) is binding every configuration to one device instance, with device identities that are unique and unforgeable. My first D3 run found a violation because I had reused one device label for two devices; that was the model's own lethality check, and it was repaired by giving each swap a unique identity, not by weakening the property.

**Obligations this places on a real design (not decided here).**
1. A dedicated TPM counter for the floor, separate from the witness generation counter, with an increment policy bound to the **installation root**, not the service key. H2R2-T4 shows a service-signed policy can authorise anything; the same mistake here would let the service burn the floor.
2. Counter-raise authority must equal root authority. If anyone with a wider authority can raise it, they can deny service (floor above every issued configuration) until the root issues a higher sequence. The model does not cover this beyond noting it.
3. Device-instance identity in each configuration, and a rule that the root issues a configuration to a new device only at or above the current floor.
4. Admission raises the floor to the admitted sequence. The existing check that refuses a configuration issued in the future keeps a pre-signed later configuration from being used early (code-read, not tested here).

**Limits.** Model only: no real counter, filesystem, timing, partial writes, or restore-fence behaviour. Configuration sets are bounded at five, so liveness (can the root always recover) is argued, not modelled. The single-floor design says nothing about forks at the same sequence; the pinned-digest guard from §3g covers that only while its stored digest is itself not restorable. Not hardware, not independent.

## 4. Not done
Done since this section was first written: T2 (§3d), crash laws (§3e), G5–G9 (§3f), G1 prototype (§3g), floor rollback analysis (§3h). Still not done: a real TPM counter design for the floor (needs a founder/design decision) · the fork pin's own storage · a real-TPM or hardware result (not authorized) · re-running the T2 canary variants more than once · the model's restore-fence behaviour · the other test files behind the packet's 116-test log · any change to packet, source, or production · any posting, vendor contact or spending.

## 5. Public-record-safe summary (for #1983 if the founder approves; contains no mechanics)

> In-house review of R20 H1R2 and H2R2 (founder-directed, CC-led; **not independently reviewed**) found gaps in the crash-recovery model's test coverage, identified model-level issues in how restored state is reconciled with the hardware counter, and noted areas where the H1R2 trust configuration and evidence checks could be tightened. Findings are held in the private review record. No source, production, physical-TPM, release, or member-facing claim is affected or authorized. All holds are unchanged.

## 6. DRAFT ruling text — NOT POSTED (founder to approve exact wording)

> **Founder direction — CC-led in-house R20 review.** Kelly Nezat, as accountable founder and sole product/release decision-maker, directs that the current H1R2/H2R2 review proceed in house under CC's operational control, with ChatGPT providing subordinate technical support. This may include read-only evidence inspection, adversarial falsifier design, disposable scratch execution, test expansion, defect identification, and exact-source recommendations. Status must be described as `FOUNDER-DIRECTED / CC-LED IN-HOUSE REVIEW / NOT INDEPENDENTLY REVIEWED`. No AI-assisted, founder, builder, or in-house result may be represented as independent human security acceptance. External reviewer outreach, procurement, contracting, packet or source transmission, scheduling, or spending is not authorized; no further vendor communication without a new explicit founder instruction naming recipient and exact action. This does not authorize H1R2 source admission, H3, production service-key creation, runtime permission changes, historical-copy remediation, stale restoration using member data, MOK enrollment, EFI boot, physical TPM mutation, deployment, member-facing non-resurrection claims, or Cabin release. CC controls the review sequence and evidence record; ChatGPT does not independently initiate external communications, governance changes, source changes, security ceremonies, deployment, or release.

## 7. Instruments
`docs/programme/R20-H2R2-IN-HOUSE-REVIEW-01_scratch/` (README, `mutate.py`, `findings.py`, `explore.py`, `tests/test_adversarial_laws.py`).
H1R2 (section 3c): `docs/programme/R20-H2R2-IN-HOUSE-REVIEW-01_scratch/h1r2/` — `scratch-h1r2-g1-g4.test.mjs`, `scratch-g3-pin.test.mjs`, `scratch-fixture.mjs` (packet fixture plus three option hooks; `fixture-hooks.diff`), and the three `candidate-*.diff` tightening patches. Run from a checkout of the parent with the packet source overlaid, `CABIN_TEST_NODE_MODULES=<repo>/node_modules node --test <file>`.
