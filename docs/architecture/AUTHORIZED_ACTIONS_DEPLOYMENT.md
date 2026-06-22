# Authorized Actions: Deployment & Beta Brief

- **Status as of 2026-06-18** — plan for Calendar's Stage 6 (production / field). Companion to `AUTHORIZED_ACTIONS_LDV.md` + `AUTHORIZED_ACTIONS_CERTIFICATION.md`.
- **Scope**: the Calendar executor (rungs 1–5 cleared on the proposal branch; rung 6 = this brief).

> **The purpose of beta is not to validate the architecture. It is to let the architecture encounter reality.**

The architecture has already earned its current claims through implementation and certification (rungs 1–5). Beta does not re-prove them. It exists to discover where real human behavior exposes assumptions the architecture didn't anticipate. The next teacher is the field, not the design team.

## Stage 6 is a sub-ladder (observe behavior, not opinions)

- **6A — internal team.** Daily dogfood; logs / edge cases / failures; tight loop. Certifies *operational correctness.*
- **6B — trusted practitioners (10–20).** Watch edits, confirmations, dismissals, abandonment. Certifies *behavioral fidelity.*
- **6C — first wave.** Broader practitioner beta; refine before GA. Certifies *scale + diversity.*

"I like it" is far less informative than "60% of proposals are edited before confirmation." Measure what people *do.*

## Two dashboards — kept separate, and ordered

| Product | Constitutional |
|---|---|
| DAU / retention | Proposal Fidelity |
| Feature usage | Human authorship preserved |
| Task completion | Appropriate authorization |
| Performance | Boundary integrity |
| Satisfaction | Increase in user agency |

A product can succeed while violating its constitution; a constitutionally sound feature may still need UX work to succeed as a product. Keeping the dashboards separate stops one from quietly optimizing the other away.

**Precedence (not co-equal):** when the two conflict, the **constitution wins** — sovereignty-first ("human agency always outweighs engagement, retention, or performance metrics"). The constitutional dashboard is a **veto** on product changes, not a tradeoff against them. A change that lifts task-completion by weakening appropriate-authorization does not ship.

## Proposal Fidelity — four rates, not one number

| Rate | Meaning | Reading |
|---|---|---|
| **Correction** | MAIA misunderstood — a field edited that MAIA should have gotten right | drift; the thing to fix |
| **Refinement** | MAIA gave a good draft the human completed (detail MAIA couldn't know) | the surface succeeding |
| **Immediate Confirmation** | proposal already sufficient | healthy *only if reviewed* — see below |
| **Dismissal** | proposal missed intent or wasn't wanted | misfire (esp. dismissal-after-no-edit) |

- Do **not** optimize toward "accepted unchanged." The card is an edit surface by design; minimizing edits trains rubber-stamping — the exact failure the consent gate prevents. The win is *appropriate* edits + *appropriate* confirmations.
- **Immediate Confirmation is two-sided:** "the draft was right" (good) vs "they didn't read it" (rubber-stamping). Distinguish by whether review plausibly happened (e.g. confirmation was not instantaneous). This is a *constitutional* signal — did authorship occur? — not an engagement metric.

## Instrumentation — measure the structure of authorship, not the content

The constitutional unit of measurement is *the structure of authorship*, never the personal content. You do not need to know that "Lunch with Nathan" became "Lunch with Nathan and Heather." You need:
- title edited ✓
- participants edited ✓
- confirmation-after-edit ✓

Log **structure** (which field changed; accepted / dismissed; reason-category); never the values. **Exclude Sanctuary sessions entirely.** The measurement system inherits the same privacy boundary the executor upholds.

## Sequencing

Ship Calendar to 6A in **parallel** with email-as-executor-#2. Calendar is valuable enough to put in front of people now; beta's job is field-teaching, not architecture-proving. This is the **Field crossing** — never "done," a standing falsification source, consent-bounded.
