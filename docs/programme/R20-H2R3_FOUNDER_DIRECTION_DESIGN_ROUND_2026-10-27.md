# R20 H2R3 — founder direction: design round (design only)

**Date:** 2026-10-27 · **Status:** local record of a founder ruling; not admitted to the canonical record, not posted to GitHub (posting needs your exact-text approval) · **Classification:** `FOUNDER-DIRECTED / CC-LED IN-HOUSE REVIEW / NOT INDEPENDENTLY REVIEWED`
Source note: `R20-H2R3-TPM-POLICY-DESIGN-NOTE_FOR_RULING_2026-10-27.md`.

## 1. Ruling, as given by Kelly Nezat (accountable founder)
"I accept R1–R5 as recommended. Record the ruling locally as direction for a new H2R3 design round (design only), then re-run the explorer and floor model on chain-based models in scratch."

| | Ruling | Recorded wording |
|---|---|---|
| R1 | Event binding | Direction: an NV **extend chain** for the event record, generation carried inside the event digest. |
| R2 | Separation | Direction: command code in the **fixed** policy branch, plus a recovery path that re-validates the service credential (obligation O-1). |
| R3 | Trust floor | Direction: a **root-authorised trust chain** over a counter. **Final only after R4 is verified.** |
| R4 | Device-instance binding | Precondition: verify the local witness key is non-exportable and device-unique **before R3 is treated as final.** Not yet verified. |
| R5 | Process | A new **H2R3** design round. Model and floor work are re-run on chain-based models first. H2R2 packet evidence does not carry over. |

## 2. What this ruling is, and is not
- **Is:** direction for a design round, and authority to re-run the explorer and floor model on chain-based models **in scratch**.
- **Is not:** authorisation to implement, provision, create an index or key, change any TPM policy, admit H1R2 source, build H3, change runtime permissions, restore with member data, run MOK/EFI/physical-TPM steps, deploy, make a member-facing claim, release Cabin, or contact anyone. Every existing hold stands.
- A design that passes these models is **not** a design that is admitted: acceptance falsifiers (design note §4) must exist and be lethal first, under a later founder act.
- The H2R2 packet's recorded canary evidence is **not** evidence for the H2R3 design.

## 3. Open conditions carried forward
R4 verification (device-instance binding) · O-1 (recovery must not sign without a valid credential) · explorer and floor model on chains (in progress, scratch) · falsifier suite authoring · chain-loss behaviour (hold, never guess) · availability under a misbehaving signer or root (denial possible, recovery needs a root act) · hardware TPM result (not authorised).

## 4. Correction
An earlier chat message called the note `R20-H3R2-…`; that was my typo. The file has always been `R20-H2R3-…`.
