# Authorship — The Constitutional Meaning of Authored Acts

*Constitutional note. Companion to [The Architecture of Shared Understanding](./SHARED_UNDERSTANDING.md). **First draft, for iteration** — a candidate to graduate into `docs/canon/` once settled. Designed/Vision; authorizes no build.*

> **A system may notice. A system may offer. Only a human authors.**

## Why this note exists

The generativity audit of *The Architecture of Shared Understanding* closed every derivation gap but two, and named the deepest as a frontier: **what counts as sufficient authorship?** It first looked like a Slice 2 implementation detail — the "promotion gesture" that turns a moment into a shared decision. It is not. It is a constitutional primitive, and it governs far more than a Decisions ledger.

A constitution earns its name by reducing dependence on its authors. If a capable contributor still has to ask *"what would the founders decide here?"* when they reach an authorship question, the constitution is incomplete. This note exists to make authorship derivable — so the software can be built *from* it rather than discovering the rule while coding.

## The triad

Every commitment in the platform orbits one distinction:

- A system may **notice** — observe and surface what is already externalized.
- A system may **offer** — propose, draft, prepare an option.
- A human **authors** — originates the commitment that crosses an irreversible line.

Notice and offer are the system's province. Authoring is the human's — and it is the *only* legitimate source of a commitment. This is the boundary the Consent Gates already draw (`docs/canon/MAIA_CONSENT_GATES.md`) and the warrant model already states: *a future commitment requires authorship as its warrant, never evidence.* A correct prediction is still not an authorization.

## The core question

The question is not *what gesture promotes something?* It is:

> **What makes an act genuinely authored, rather than merely accepted?**

"Merely accepted" is the failure mode that resembles authorship but is not: the rubber-stamp, consent-by-default, the fatigue-click, the dark-patterned *Agree*, the pre-checked box, the option whose only easy path is *yes*. A system can manufacture acceptance. It cannot manufacture authorship — and that difference is exactly what protects a person's standing as the author of their own life.

## What authorship requires (proposed criteria)

An act is authored — not merely accepted — when it is:

1. **Originated or substantively shaped** by the person — they wrote it or materially changed it, not merely approved something pre-written.
2. **Legible** — they understand, in plain terms, what they are committing to, before they commit.
3. **Editable before commitment** — the confirmation is an *edit surface*, not a button. If you cannot change it, you did not author it.
4. **Uncoerced** — no manufactured urgency, no penalty for declining, no asymmetry that makes *yes* the path of least resistance.
5. **Attributable** — provenance: who authored, and when (the provenance contract, `SHARED_UNDERSTANDING.md` §4).
6. **Proportionate to irreversibility** — the harder an act is to undo, the more deliberate the authorship it requires (and the more it should be revocable where its nature allows).

These are proposed, not settled — see Open Questions.

## Authorship vs its weaker cousins

| Looks like authorship | Is actually | Why it fails |
|---|---|---|
| Clicking "Agree" | acceptance | no origination; often no legibility |
| Approving a draft unchanged | acquiescence | no shaping — the system authored it |
| Consenting under time pressure | coerced consent | not uncoerced |
| A default left untouched | non-decision | no act at all |
| Silence treated as yes | inference | the system authored, not the person |

Authorship is the strong form the others only resemble. A constitution that cannot tell them apart will let acceptance masquerade as authorship — which is how sovereignty erodes quietly.

## Where authorship governs

Because authorship is the source of every legitimate commitment, it governs — not exhaustively:

- **promotion** from private to shared standing
- **relationship formation** — entering, defining, ending a relationship
- **memory permanence** — what is allowed to persist
- **consent renewal** — consent is not perpetual; re-authoring
- **delegation** — authoring a grant of authority to another person, or to MAIA
- **AI initiative** — the boundary past which an *offer* would require authorship to *act*
- **collaborative editing** — co-authorship, when several people author one object
- **governance** — changing the rules is itself an authored act

One primitive beneath all of these is what makes it constitutional rather than a pile of feature rules.

## Authorship and stewardship — the two primitives

The platform now rests on two foundational primitives that cover the two ways a system can overreach:

- **Stewardship** governs what the *system* may hold — non-extractive, minimal, legible, deletable (`docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md`; data minimization). It answers overreach by *taking*.
- **Authorship** governs what the *person* commits — the only valid source of a crossing into permanence, sharing, or action. It answers overreach by *deciding on the person's behalf*.

They are complements, neither reducible to the other. Stewardship limits the system's holding; authorship legitimates the person's commitment. Together they are the structural expression of the Oath: *never make a human life narrower than before the companion arrived.*

## What this note does not settle (open questions)

1. **Degrees of authorship.** Does renaming a private note require the same authorship as sharing a record to a team? Authorship likely scales with irreversibility — but the gradient is unspecified.
2. **Delegated authorship.** When a person authorizes MAIA or another to act for them, what keeps the delegation itself genuinely authored — and cleanly revocable?
3. **Co-authorship.** When two people author one shared object, what does each author, and what happens on disagreement?
4. **AI-assisted drafting.** MAIA may draft (an offer). At what point does assistance dilute authorship — when the person accepts MAIA's draft unchanged?
5. **Renewal cadence.** If consent is not perpetual, how often must an act be re-authored, and what triggers renewal?

## How Slice 2 derives from this

The Decisions / Open-Questions ledger's "promotion gesture" is simply *an instance of authorship*: turning a moment into a durable shared object is a commitment, so it must be authored, not merely accepted. Its consent surface must satisfy the criteria above — originated/shaped, legible, editable, uncoerced, attributable, proportionate. Slice 2 should *derive* its gesture from this note, not invent a rule while coding.

## Sources

Builds on `docs/canon/MAIA_CONSENT_GATES.md` (confirmation as edit surface, not rubber-stamp; the warrant model), `RIGHT_TO_REMAIN_UNPOSSESSED.md` (stewardship), and `SHARED_UNDERSTANDING.md` (§4 provenance; the generativity audit that surfaced this frontier). Memory: `feedback_earn_before_name_epistemology` (commitments ← authorship as warrant), `feedback_permission_over_obligation`, `feedback_data_minimization_as_governance`.
