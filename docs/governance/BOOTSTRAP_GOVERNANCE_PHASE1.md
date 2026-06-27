# Bootstrap Governance — Phase 1

**Status:** Active (Phase 1).

**Nature of this document.** This record *describes a governance commitment that has already been adopted.* It does not create new governance, and it does not define system behavior — the change-governance enforcement layer does that. Where this document and the implementation differ on *behavior*, the implementation is authoritative; this document is authoritative only for the *commitment* recorded below.

## Purpose

MAIA's change governance requires independent approval for sensitive changes. While the project has a single founder and no constituted independent review body, certain change classes can have **no eligible approver** — the sole founder cannot approve their own pull request, and no other reviewer role is yet filled.

Left unaddressed, this forces every such change through an administrative override, which erodes the very governance the override bypasses.

**Bootstrap Governance Phase 1** is the explicit, temporary arrangement that resolves this deadlock *through* the governance process rather than around it: a designated bootstrap reviewer may stand in for the otherwise-missing approval under defined conditions, until the permanent review body exists.

This is a recognized stage, not a workaround. It ends on a defined, observable condition (see *Sunset condition* below) — not at an unspecified future point.

## Scope

- The bootstrap arrangement in effect is a **bootstrap reviewer who may substitute for an otherwise-unavailable founder approval**, under the conditions defined by the enforcement layer (a founder/author approval deadlock with no constituted independent review body).
- **Behavior is defined by the implementation, not by this document.** The exact triggering conditions, the change classes affected, and the substitution rules live in the enforcement layer and may change there independently. This document records *that* a bootstrap arrangement exists and *the commitment governing its life* — not its mechanics.
- The arrangement applies **only during Phase 1.**

## Bootstrap Governance Commitment

The arrangement is adopted with the following binding commitment:

1. **Sunset condition (objective).** This phase **ends when the Guardian Circle — an independent review body — is constituted and operational.** This is an observable state, not an aspiration; constituting the Circle restores the intended approval process for sensitive changes.
2. **Mandatory review trigger.** A review of the bootstrap arrangement **must occur upon the earliest of:**
   - **90 days** after adoption of this phase;
   - admission of external contributors with governance responsibilities;
   - governance over high-impact production changes;
   - constitution of the Guardian Circle.

   Each review must conclude in exactly one of: **retire** (Phase 1 closes), **replace**, or **renew with a recorded rationale.** If the phase is **renewed**, the recorded rationale **must explain why the sunset condition has not yet been met, and why continuation remains the least-governance-privileged option available** — keeping the justification substantive rather than procedural.
3. **No silent permanence.** Any continuation of the arrangement beyond a review **requires a recorded rationale.** The absence of a review is not authorization to continue.

The risk this commitment guards against: a temporary bridge — a single closely-held reviewer standing in for absent governance — quietly becoming the de facto permanent model.

## Descriptive vs. Prescriptive

This document contains **prescriptive governance commitments** — choices about how the project intends to govern itself. They are binding because they are *adopted*, not because they are empirically true.

They are deliberately **not** descriptive architectural claims. Statements about how the system actually behaves belong with the implementation and should earn confidence through evidence. Keeping the two separate prevents a governance record from asserting more factual certainty than the implementation supports.

## Verification

Two distinct questions, deliberately kept separate (consistent with treating the implementation as authoritative for behavior and this document as authoritative only for the commitment):

**Governance verification — has the commitment been fulfilled?**
- An independent **Guardian Circle is constituted and operational** (independent reviewers, not the founder alone).
- The bootstrap arrangement is **formally retired** (or renewed/replaced with a recorded rationale), and this **document is revised** to mark Phase 1 closed and record the transition.

**Technical verification — does the enforcement layer implement the commitment?**
- The **enforcement layer no longer applies the bootstrap substitution path**: sensitive changes again require the intended independent approval.
- This is shown by **evidence** (e.g., a representative sensitive change is gated as intended), not asserted by this document.

Until both governance and technical verification hold, Phase 1 remains active and subject to the mandatory review trigger above.
