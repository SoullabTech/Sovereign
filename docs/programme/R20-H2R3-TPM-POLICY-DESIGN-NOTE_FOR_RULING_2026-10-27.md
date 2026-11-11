# R20 TPM-policy design note — event binding, structural separation, trust floor (for founder ruling)

**Date:** 2026-10-27 · **Status:** DESIGN NOTE FOR RULING — local, not admitted, not posted. **Nothing here is implemented, authorised, or a proposal for admission.** · **Classification:** `FOUNDER-DIRECTED / CC-LED IN-HOUSE REVIEW / NOT INDEPENDENTLY REVIEWED`
Answers decisions A(a)–(c) of `R20-H2R2-IN-HOUSE-REVIEW-01_PRIORITISED_SUMMARY_2026-10-27.md`. Evidence: `…STEP1-3_FINDINGS_2026-10-26.md` (§ numbers) and scratch instruments in `R20-H2R2-IN-HOUSE-REVIEW-01_scratch/`.
Evidence tags: **[swtpm]** executed on a disposable software TPM · **[model]** executed on a bounded model · **[code-read]** · **[unverified]**. No tag means hardware or production; none is claimed.

## 1. The three defects this note answers

1. **Event binding (H2R2-M1).** The counter says *how many* advances happened, not *which*. A restored ledger holding a different pending intent can be finalised after another event advanced the counter. [model, §3.2]
2. **Separation (T2/T4).** The NV policy fixes only key, reference and command code, and the command code sits in the part the signer chooses. A service key that signs a delete policy deletes the index; the packet's "service cannot delete" test cannot tell. [swtpm, §3d — re-verified 2026-10-27 with a sound presence test]
3. **Trust floor (G1).** No placement for sequence/revocation state survives a restored backup *and* a device swap. [model, §3h]

## 2. One coherent shape (recommended)

Use one mechanism — **NV extend indexes** (value ← SHA-256(old ‖ data); append-only) — for both the event record and the trust record, and move the command code into the **fixed** policy.

### (a) Event binding: an event chain, not a counter
- Provision an extend index `EV`. Each advance extends it with the event digest. The TPM value after event *n* is a hash chain over events 1…*n*, so it encodes **which** events happened and in what order. Generation stays in the event digest, because an extend index cannot be read as a count.
- The ledger stores the chain value it committed. Finalise (advance resume **and** recover) recomputes `H(previousChain ‖ pendingEventDigest)` and requires it to equal the TPM value. A restored ledger carrying a different pending intent cannot match; a stale ledger with no pending intent mismatches and holds. This is the "TPM records which event advanced it" candidate that closed M1 in the explorer (§3.3), now with a concrete TPM primitive.
- [swtpm] Extend semantics confirmed: the value equals `H(old‖data)` and advances uniquely per event; a plain write cannot rewind it. [model] **Not yet shown:** the full crash-prefix protocol over a chain; the explorer must be re-run on a chain-based model before this is trusted.
- *Alternatives:* counter + a second object recording the event (two non-atomic TPM operations create a new crash window); PCR (not persistent across reboot). Extend is the only single-operation primitive found that carries event identity.
- *Costs:* a new index (platform provisioning); the chain cannot be reconstructed if the ledger loses previous values, so loss means **hold**, never guess; the counter is retired for this purpose.

### (b) Structural service/founder separation
- Service branch = `PolicyAuthorize(service key)` **then** `PolicyCommandCode(NV_Extend)`, both committed in the NV's fixed policy digest. Founder branch = `PolicySigned(founder)` + `PolicyCommandCode(UndefineSpaceSpecial)` as in the packet.
- [swtpm] With this layout a service approval that omits the command code, or names delete, **cannot delete**: both attempts were refused and the index stayed present. The signer no longer decides which command the service branch may run.
- **What stays signer-controlled (not structural):** nonce, expiry and cpHash. A service signature without them is accepted. With (a), the worst a misbehaving signer can then do is extend the chain with data of its choosing or replay an extend, which breaks the ledger/TPM match and causes **hold** — a denial, not a forged event or a delete.
- **Obligation O-1:** that claim holds only if `recover()` stops signing receipts without a credential (B1, §3e). A signature without cpHash plus ledger write access could otherwise have an attacker-chosen event finalised. Recovery must re-validate the service credential and carry the service's signature over the event digest in the pending intent.

### (c) Trust floor: a root-authorised trust chain
- A second extend index `TC`, with the same fixed-policy shape under the **installation root** key (`PolicyAuthorize(root)` → `PolicyCommandCode(NV_Extend)`). Each trust configuration names `previousChain`; the verifier admits it only if the TPM value equals `H(previousChain ‖ configDigest)`, i.e. it is the latest extended configuration.
- This one mechanism gives: **floor** (anything older no longer matches), **fork resistance** (a different configuration at the same position cannot match), **revocation** (the root extends a revoke marker, so no live configuration matches until a new one is extended), and **counter-raise authority = root authority** by construction.
- *Alternative:* a root-authorised counter with consecutive sequence numbers. Simpler, but gives no fork resistance or revocation without extra state that a backup could restore (§3h D1).
- **Device binding is a precondition, [unverified]:** configurations must bind to one device *instance*, which holds only if the local witness key is non-exportable and device-unique. The packet does not establish that. The model result for device binding (§3h D3) was for the counter variant; the chain variant is **not yet modelled**.
- Currentness must be read at **use**, not only at admission, or revocation never reaches tokens already minted (G4/S9). That is a code decision for a later lane.

## 3. What changes, and what does not

| Property | Today (H2R2/H1R2 as submitted) | With this shape |
|---|---|---|
| One receipt per generation under restore | not guaranteed (M1) | enforced by chain match [model owed] |
| Service can delete | yes, if it signs it [swtpm] | no [swtpm] |
| Replay / no-cpHash signature | accepted [swtpm] | accepted, but only causes hold [reasoned; needs O-1] |
| Floor / revocation survive restore | no [model] | yes, if chain index is not restorable [model owed] |
| Backup restore of the ledger | silent divergence risk | detected, holds |
| Availability | — | denial possible by a signer or root that extends garbage; recovery needs a root act |
| Hardware | software TPM only | still unproven on a physical TPM |

**This is a new policy design.** The H2R2 packet's recorded canary evidence does not carry over to it. It needs its own canary, falsifier suite and review round (I suggest the name `H2R3`), under the existing holds.

## 4. Acceptance falsifiers to author before anything is admitted (lethality first)
1. T2 variants V1/V2 stay *accepted* but must produce only a hold downstream; V4 must be *refused* (done once: refused).
2. The crash-prefix explorer re-run on a chain model: no equivocation at depth ≥ 7, with the mutants from §3e killed.
3. A restore-fence suite: stale ledger, wrong pending, lost acknowledgement, two receipts for one generation.
4. A chain-based floor model with the same restore and device-swap attacks as §3h, plus a defeat candidate with a non-unique device identity (must die).
5. The H1R2 G8 mutants (nonce, completion expiry, PIN↔HEAD, HEAD↔attestation) must be killed by committed tests.
6. **Vacuity check for every "index is gone / still present" assertion** (see §5).

## 5. A defect found while verifying this note
`run_h2r2_p256_policyauthorize_canary.sh` checks that the founder delete worked with `grep -qi "$INDEX"` on `tpm2_getcap handles-nv-index`. This TPM prints the handle as `0x1534C20` (no leading zero) while `$INDEX` is `0x01534c20`, so the grep **can never match** and the check **can never fail**. The recorded handle list is empty, which is genuine evidence in that run, but the script's own assertion is vacuous. My first T2 script carried the same flaw; I fixed it (it now uses `tpm2_nvreadpublic`) and re-ran, and the V4 result stands. [swtpm]

## 6. Decisions requested
| | Decision | My recommendation |
|---|---|---|
| R1 | Event binding | Extend chain (a), with generation inside the event digest |
| R2 | Separation | Command code in the fixed branch (b), plus recovery that re-validates the credential (O-1) |
| R3 | Trust floor | Root-authorised trust chain (c) over a counter |
| R4 | Device-instance binding | Require verification that the witness key is non-exportable and device-unique **before** R3 is final |
| R5 | Process | Treat this as a new `H2R3` design round; re-run the explorer and floor model on chains first |

## 7. Not authorised by this note
No change to the TPM, provisioning or any policy; no new index; no key creation; no source admission (H1R2 or otherwise); no H3; no runtime-permission change; no restoration with member data; no MOK, EFI or physical TPM step; no deployment; no member-facing claim; no Cabin release; no external contact. All existing holds stand. Scratch checks ran on a disposable software TPM only, with fictional keys, in a container with no network.
