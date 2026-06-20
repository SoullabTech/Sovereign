# Governance Review Instruments

**Status:** Class A — governance layer. Standing *lenses* for evaluating future canon. Not a feature spec; nothing here ships.
**Date:** 2026-06-16. **Governs:** how later work is judged — across memory, permissions, attention, moderation, sovereignty, and any future canon.

---

## Two classes of artifact — do not mix them

- **Class A — Governance discovery.** A *lens*. Changes how future canon is *evaluated*. Rare. (This document collects them.)
- **Class B — Product discovery.** A *thing built under* governance — Field Note, Proposal, the calendar executor, a grant registry. (Lives in specs and code.)

The failure mode is filing a Class-A instrument inside the Class-B document that happened to produce it. That buries a general rule under a local one.

### The Lifting test (Class B → Class A)

> If the document that produced this principle disappeared tomorrow, would the principle still be useful elsewhere?

If yes, it has **escaped its document.** Lift it here, out of the local spec. (Worked example: *promise-only → reject* was discovered while drafting `MAIA_CONSENT_GATES.md`, but it judges memory, practitioner permissions, moderation, and every future sovereignty doc equally — so it belongs here, not there.)

> **Lifting ≠ Ratification.** Lifting relocates a principle to the governance layer — a *structural* move. It does **not** ratify it as a constitutional axiom — an *epistemic* endorsement, which is the separate crossing defined in [`CONSTITUTIONAL_MATURATION_METHOD.md`](./CONSTITUTIONAL_MATURATION_METHOD.md) §II. A principle may be Lifted without ever being Ratified.

---

## The instruments

| Instrument | The lens | Apply by asking | Fuller definition |
|---|---|---|---|
| **Meaning ≠ Reality** | The sovereign determines meaning; the system may witness it but not author it. A claim of meaning is not the fact. | Is this Live, Designed, or Vision? | `MARKETING_CLAIM_DISCIPLINE.md`; memory *Meaning Sovereignty* |
| **Declaration ≠ Liveness** | built ≠ wired ≠ surfacing ≠ verified. Writing or declaring a thing does not make it operational. | Where is the runtime evidence? | six-category typology (`CLAUDE.md`) |
| **Visual ≠ Structural separation** | A *shown* boundary (a toggle, a label, a mode badge) is not the boundary. Only an architectural guarantee is. | Is this separation enforced by the architecture, or merely displayed? | memory *structure-not-behavior-is-the-safeguard* |
| **Promise-only → Reject** | Every rule must be enforceable structurally or legibly. "The system is designed to obey it" is not an enforcement mode. | How would anyone know if it was violated? | `MAIA_CONSENT_GATES.md` §II Art. 8 |
| **Measure, don't optimize** | Instrumentation that informs *what to build* must never become the metric to *maximize* — or the member's own signals (keeps, marks, dwell) become an extraction target: the engagement engine through the back door. | Is this signal measured, or optimized? Are we tuning a surface to raise it? | `PROPOSAL_LANDSCAPE_2026-06-17.md` §9 |
| **Two-boundary diagnostic** | Every MAIA change crosses one of two boundaries: *learning* (`world → MAIA`) or *action* (`MAIA → world`). A change fitting neither is either genuinely new or a sign of drift. | Which boundary? Which vow? Enforcement mode (structural/legible/both)? If neither — new, or drifting? And: can we still trust what we observe? | `MAIA_CONSENT_GATES.md` §I |
| **Support what constitutes; never constitute on their behalf** *(meta-test)* | What belongs to AI vs. the person. AI may support the constituting act maximally; it never performs it for them, and never withholds support to force growth. | Is MAIA helping the person *perform* this act, or performing it *instead*? After repeated use, are they more or less capable without it? | `MAIA_ASSIST_SCOPE_2026-06-17.md` (governing criterion) |

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

---

## Compression is evidence

When independent design threads repeatedly reduce to the same small set of boundaries and vows *without* forcing awkward reinterpretations or special cases, that is **evidence** (not proof) the architecture is growing more coherent rather than merely more concise. The inverse is an early-warning signal: a principle that fits neither boundary, or a feature that must *bypass* a vow to work, indicates the model is beginning to fragment. Treat an uncategorizable proposal as a flag for scrutiny — it is either a genuine extension of the territory or the first sign of drift. Measure the architecture's health less by how many principles it holds than by how few it needs to explain what people actually experience.

**The deepest form of the diagnostic — `observed ≠ caused`.** Behind "which boundary?" sits a sharper question: *after this change, can we still trust what we observe?* The Learning Vow's purpose is to keep that answer **yes** — by refusing to optimize what members keep, the system gives up the power to *manufacture* its own evidence and so retains the power to *believe* it. A change that begins optimizing the signal it learns from doesn't merely cross a boundary; it compromises the architecture's ability to know itself — it can no longer tell discovery from influence. This is the product-level form of the discipline behind `merged ≠ deployed`, `deployed ≠ live`, and `described ≠ canonized`. `observed ≠ caused` is what keeps the field a field, not an experiment already biased by its own apparatus.

---

## State ≠ claim (the root)

Every ≠ pair above — `merged ≠ deployed`, `deployed ≠ live`, `described ≠ canonized`, `observed ≠ caused` — is an instance of one principle:

> **A claim about state is never the state itself.**

It is recursive: it governs *this document* as strictly as the code the document governs. So every assertion carries **two independent questions**, answered by different evidence:

1. **Is the idea coherent?** — evaluated by *reasoning*.
2. **Is the claimed state true?** — evaluated by *inspection*.

A passed coherence-check is not a passed state-check; confusing the two is how a sound idea ships an unfounded status. The operational habit: **every state-claim travels with its falsifier — *what observation would falsify this?***

| State claim | Falsifier |
|---|---|
| "it's in canon" | open the file |
| "it's deployed" | compare the production SHA |
| "members return to this" | observe actual use over time |

The architecture's quiet strength is that it *does not ask for trust where inspection is possible.* And inspection here is **not skepticism but respect for reality** — it lets the territory correct the map before the map accumulates authority it hasn't earned. (An interpretation of these instruments, not a new one.)

**One consequence, held as aspiration, not conclusion:** the architecture is *built to make* trustworthy reality more likely — by removing common failure modes — but it cannot *guarantee* it. Whether reality stays trustworthy depends on whether future implementations keep honoring these constraints. "Reality stays trustworthy" is an aspiration contingent on practice, never a property the design may assert about itself — asserting it as a conclusion would itself be a `claim ≠ state` error.

---

## The criterion that completes the family — capability vs. calling

> **AI may support what constitutes a person, but never constitute it on their behalf.**
>
> *Aspiration:* remove what obscures development; preserve what constitutes it. *Operative test (reviewable):* is MAIA helping the person **perform** this act, or performing it **instead**?

Lifted here from `MAIA_ASSIST_SCOPE_2026-06-17.md` because it adjudicates far outside that document — companion, Assist, proposals, memory, learning, automation, future agents, even model and tooling choices. It is the **meta-test**: the other instruments each guard one facet of a single principle — *the person remains the author of their own becoming* — and this one names the good they protect.

```text
Meaning Sovereignty        who determines what matters?
Consent Gate               who performs the constituting act?
Learning Vow               why is the system learning?
Measure, don't optimize    what becomes the objective?
Remove / replace (this)    what belongs to AI, and what to the person?
```

**It is two-sided.** *Capture* — AI performing the constituting act (sending the apology, making the choice) — is forbidden. So is *paternalism* — AI withholding support to force the person to grow the hard way ("the struggle is good for you"). Both take the decision from the person. AI may prepare, clarify, organize, remind, and support — maximally; it must never *perform* the constituting act, and never *withhold* support to manufacture growth. Which acts are "theirs to keep" is the person's call, not the designers'.

**Review procedure for any proposed feature:**
1. What human capacity is this trying to support?
2. What friction is being removed?
3. Is that friction *obscuring* development, or *constituting* it?
4. After repeated use, does the person become more capable or less capable *without* it? (Less → immediate additional scrutiny.)

**The philosophy it encodes.** Most AI is built on *replace human effort wherever possible.* This architecture is built on *replace only the effort that prevents growth; preserve the effort through which growth occurs.* Some acts cannot be outsourced without loss — choosing, committing, forgiving, grieving, creating, loving, telling the truth, taking responsibility, serving another. As models grow more capable, the load-bearing distinction is **capability vs. calling**: that AI *can* perform an act is not evidence it *should*. The better question than "can AI do this?" is **"is this one of the acts through which a human being becomes more fully themselves?"** The aim is to cultivate people, not replace them.

**What it reveals — the organizing invariant.** The person's **authorship of their own becoming** is the **unit of value** the whole architecture exists to serve (now anchored at the constitution root — `MAIA_CONSENT_GATES.md` → *The center*) — not productivity, engagement, retention, or narrow wellbeing, but *the conditions under which a person can author their own development.* The instruments are its perimeter:

```text
Purpose      protect authorship of becoming
Governance   protect the freedoms authorship requires
Product      provide supports that strengthen authorship without replacing it
```

Sanctuary, Consent, Dissolve, the Personal Field — each is a different expression of the same aim. One caution keeps it consistent with *measure, don't optimize*: the architecture optimizes the **conditions** for becoming (freedoms, supports, friction cleared), never becoming **as a metric** — a measured "growth score" would manufacture the very development it claims to serve. Becoming is the *telos*, never the *KPI*.
