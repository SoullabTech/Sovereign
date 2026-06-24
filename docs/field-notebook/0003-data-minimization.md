# 0003 — Data Minimization / Non-formation

> Worked example for the **two-trajectory schema** (TEMPLATE, this revision). The architecture
> did not move; our *understanding* did — the case demonstrates that those are different things.

- Date opened:  2026-06-18
- Last reviewed: 2026-06-18
- Status:        demoted
- Entry type:    internal-governance
- Confidence:    L3 (the principle) · L1 (the remembered case)

## Context
When MAIA *could* form an inference or interpretive edge about a member, should it? The standard
reflex is to collect now and decide later. The question was whether non-formation — declining to
draw the edge at all — is itself a primary discipline.

## Constitutional Prediction
`docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md` §2 "Non-formation as the primary memory discipline"
(lines 45–68): *the first act of sacred memory is restraint — not drawing the edge in the first
place.* Reinforced by the non-extractive stewardship filing (commit `648bd336d`).

### Expected Observation
Omitted columns and unformed inferences by default; deeper interpretive tiers gated by explicit
invitation (Sanctuary); no diagnostic labels formed by watching.

### Potential Falsifier
A schema or inference layer that forms behavioral or interpretive edges **by default, without
invitation**, would refute the discipline.

## Decision
Canonized the principle (non-formation §2; non-extractive stewardship `648bd336d`). Built:
Sanctuary consent gate on retention; artifact-only reasoning (the Externalization Principle —
read what's externalized, never externalize the interior). Rejected: automatic edge formation.

## Observation
Verified 2026-06-18 against `clean-main-no-secrets`:
- RIGHT_TO_REMAIN_UNPOSSESSED.md headers run **§1–§6**; the discipline lives at **§2**. There is
  **no "§7 Data Minimization" section** on clean-main — consistent with memory's own note that
  PR #490 is *"gated on founder merge"* (pending, not filed).
- Commit `648bd336d` exists.
- The string `deleted_from_ip` appears nowhere in git history — which **neither confirms nor
  refutes** the omission precedent, because an omitted column leaves no trace.

## Epistemic Outcome
Headline: **Underdetermined** (with a downward confidence move on the remembered specifics).
Per claim:
- *Non-formation is canon* → **Confirmed** (confidence: up — §2 + `648bd336d` located on clean-main).
- *It was filed as "§7"* → **Underdetermined** (confidence: down — pending PR #490, not on clean-main).
- *`deleted_from_ip` was a deliberate omission precedent* → **Underdetermined** (confidence: down —
  absence is consistent with the claim but cannot establish it).

Note what did **not** happen: the principle-falsifier never fired. The claim was *demoted*
(status over-promoted: assumed-live → pending), not *falsified* (content contradicted). This entry
is the corpus's clearest example of why those are different epistemic events.

## Divergence
The **principle is solid and verified.** Two *remembered specifics* were carried into the
conversation as live canon when they were pending/unconfirmed. The error corrected here lives in
the *consumer of the record*, not in the architecture.

## Promotion
**Claimed** — Level: Constitution · Date: 2026-06-17 (per memory) · Rationale: data-minimization as derived canon.
**Verified** — Level: Constitution for the **principle** (non-formation §2 + `648bd336d`) · Date: 2026-06-18 · Evidence: doc headers §1–§6; commit present · Verified by: Claude (git, this session).
**Refuted / Demoted** — the "§7 / `deleted_from_ip`" *case description* → **assumed-live → pending/unverified** (not refuted) · 2026-06-18 · §7 absent on clean-main, precedent unconfirmable from absence · overturned: the habit of citing a pending filing as established canon.

## Confidence note
L3 for the principle; L1 for the remembered case (location pending, precedent unconfirmed).
Confidence delta this review: **down** on the case, **up** on the principle. Last reviewed 2026-06-18.

## Self-audit
**Mistaken picture:** a reader with only this entry would conclude *privacy was the project's
highest value* — that MAIA is organized around protecting data. True but incomplete: non-formation
exists to keep the person free to remain unread, in service of agency, not to maximize secrecy.
**Generative case that would restore the whole:** the entry where memory was deliberately
*surfaced* (with consent) and that surfacing *increased* the member's coherence — privacy and
disclosure as two hands of the same sovereignty, not privacy as a ceiling. *(That aspiration-case
does not yet exist in the corpus — this pointer is its commission.)*

## Open Questions
- Is PR #490 merged to clean-main? Under what section number?
- Locate PR #489's migration; confirm the `deleted_from_ip` omission from its *rationale*, not its absence.
- Reconcile memory `feedback_data_minimization_as_governance` — annotate it pending/unverified
  (update the memory, not the principle; reality decides which side changes).
