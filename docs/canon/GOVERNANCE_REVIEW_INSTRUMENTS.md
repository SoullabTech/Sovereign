# Governance Review Instruments

**Status:** Class A — governance layer. Standing *lenses* for evaluating future canon. Not a feature spec; nothing here ships.
**Date:** 2026-06-16. **Governs:** how later work is judged — across memory, permissions, attention, moderation, sovereignty, and any future canon.

---

## Two classes of artifact — do not mix them

- **Class A — Governance discovery.** A *lens*. Changes how future canon is *evaluated*. Rare. (This document collects them.)
- **Class B — Product discovery.** A *thing built under* governance — Field Note, Proposal, the calendar executor, a grant registry. (Lives in specs and code.)

The failure mode is filing a Class-A instrument inside the Class-B document that happened to produce it. That buries a general rule under a local one.

### The promotion test (Class B → Class A)

> If the document that produced this principle disappeared tomorrow, would the principle still be useful elsewhere?

If yes, it has **escaped its document.** Lift it here, out of the local spec. (Worked example: *promise-only → reject* was discovered while drafting `MAIA_CONSENT_GATES.md`, but it judges memory, practitioner permissions, moderation, and every future sovereignty doc equally — so it belongs here, not there.)

---

## The instruments

| Instrument | The lens | Apply by asking | Fuller definition |
|---|---|---|---|
| **Meaning ≠ Reality** | The sovereign determines meaning; the system may witness it but not author it. A claim of meaning is not the fact. | Is this Live, Designed, or Vision? | `MARKETING_CLAIM_DISCIPLINE.md`; memory *Meaning Sovereignty* |
| **Declaration ≠ Liveness** | built ≠ wired ≠ surfacing ≠ verified. Writing or declaring a thing does not make it operational. | Where is the runtime evidence? | six-category typology (`CLAUDE.md`) |
| **Visual ≠ Structural separation** | A *shown* boundary (a toggle, a label, a mode badge) is not the boundary. Only an architectural guarantee is. | Is this separation enforced by the architecture, or merely displayed? | memory *structure-not-behavior-is-the-safeguard* |
| **Promise-only → Reject** | Every rule must be enforceable structurally or legibly. "The system is designed to obey it" is not an enforcement mode. | How would anyone know if it was violated? | `MAIA_CONSENT_GATES.md` §II Art. 8 |

---

## The review procedure

For any proposed article or feature, ask first:

```
How is this enforced?
    structural?  legible?  both?   → proceed to merit review
    neither (promise-only)?        → reject
```

The reviewer does **not** need to decide whether the rule is wise — only whether a violation would be *detectable*. That property is what makes the test usable by anyone, independent of agreement with the rule.

**This is a floor, not a ceiling.** A detectable-but-unwise rule still fails on its merits. Passing the enforcement test earns a rule the right to be *considered*, not adopted.
