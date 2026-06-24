# The Claim–Evidence Rubric

> **The first Instrument under [THE_CONSTITUTIONAL_SOVEREIGN.md](./THE_CONSTITUTIONAL_SOVEREIGN.md)** (§5, §6).
> **Status: DRAFT — test design only.** Claude drafted the *design* (categories,
> evidentiary standards, format, failure modes). It is for **Nathan**, the
> durable-form steward, to sharpen (apprentice-may-correct-master, even on the test
> design — §6.1) and then to **perform**. Claude does not classify: a classification
> produced by Claude would be received, not demonstrated, and stewardship is
> demonstrated, not received (§4). The verdict is by evidence; Kelly judges, and is
> bound by §4.2 to receive an unwelcome result as the system working.
>
> This is Nathan's first bounded stewardship transfer: the **durable-form mirror.**

---

## 1. The shift that makes it govern

This is **not** an instrument for classifying the platform. It is an instrument for
**making claims.**

A capability does not *have* a maturity level in the abstract. Rather: **a specific
claim about a capability has earned a particular evidentiary status.** "MAIA has
unified developmental memory" is a *claim*; the rubric asks *what evidence licenses
us to make it.* This keeps the audit attached to revisable propositions instead of
reifying maturity into a property of the software — and makes the rubric continuous
with the Marketing Claim Discipline (*"we do not tell tomorrow's story as if it were
today's"*). It governs every outward claim **and** the internal strategic story.

## 2. Where the claims come from (anti-evasion)

If the rubric classifies claims, then whoever writes the claims controls what gets
examined. So claims are **harvested from what is actually being said or planned** —
the strategic story, the deck, the website, onboarding, demos, internal planning —
**not authored fresh to be easy to support.** If we are saying it anywhere, it
enters the audit. (This is exactly the Marketing Claim Discipline's scope.)

**Compound claims are decomposed.** "Unified memory that increases authorship" is
one *technical* claim ("memory is unified") and one *constitutional* claim ("it
increases authorship") wearing a single sentence. Split them; route each to its
axis. One sentence per atomic claim.

**This principle generalizes beyond marketing:** governance audits **what the
organization is actually saying and doing — not what it wished it had said and
done.** It applies equally to investor decks, practitioner training, onboarding,
roadmap presentations, keynotes, and internal messages. The audit follows reality;
reality never follows the audit.

## 3. Two axes (never conflate them)

| Axis | The question it answers |
|------|--------------------------|
| **Technical evidence** | What has actually been built, wired, surfaced, and verified? |
| **Constitutional evidence** | What are we justified in saying about its effect on the person's **authorship**? |

A claim can legitimately be **Cat 6 technical and Cat 2 constitutional at the same
time.** Memory retrieval may be production-verified (technical Cat 6); the claim
that it *increases human authorship* has not earned production evidence
(constitutional Cat 2). **Technical maturity may never smuggle in a constitutional
claim.** Moving the constitutional axis is precisely what the beta exists to do.

### 3.1 The technical ladder (evidentiary status of a *technical* claim)

Aligns with the existing six-category typology and the built ≠ wired ≠ surfacing ≠
verified discipline:

- **T1 Held** — a preserved intention; no implementation.
- **T2 Designed** — spec / canonical primitive exists; no runtime.
- **T3 Built** — service + migration exist; zero live callers.
- **T4 Wired** — reachable in a live path, but no production evidence of use (flagged / dormant).
- **T5 Surfacing** — production evidence it fires / produces rows, not yet verified as the claimed behavior.
- **T6 Verified** — production runtime evidence the technical claim is true as stated.

### 3.2 The constitutional ladder (evidentiary status of an *authorship-effect* claim)

- **C1 Asserted** — we say it; no evidence about people.
- **C2 Theorized** — we have a reasoned account of the effect; no observation.
- **C3 Anecdotal** — individual member reports (consent-bound narrative); not systematic.
- **C4 Patterned** — a structural signal across members (consent-bound, structure-not-content), but not yet via a corruption-proof instrument.
- **C5 Instrumented** — observed by the §5 instrument (measures becoming without violating sovereignty, cannot become a target). **Requires that instrument.**
- **C6 Verified** — instrumented *and* survives its falsifiers over time.

> **The constitutional axis is currently floored.** C5–C6 require the §5 instrument,
> which **does not yet exist.** So nearly every authorship/developmental claim sits
> at **C1–C2 today**, regardless of its technical tier. The single most important
> early output of this audit will be naming that plainly: *we are not yet justified
> in publicly making almost any developmental claim.* That is the sovereign and the
> Marketing Claim Discipline working — not the instrument failing. It must never
> read a low constitutional tier as a low *technical* one, nor a low-capability
> season of a member as evidence against a claim (§1.3).

Frame the floor as **constitutional humility, not deficiency.** The platform is not
saying "we haven't proved this yet" (an apology for missing evidence); it is saying
**"our constitution requires a higher standard of evidence before we make claims
about another person's development"** (a deliberate refusal to overclaim). Those
sound alike and build very different cultures — one apologizes, the other holds a
line. The single guard: humility about *claims* must drive relentlessly toward
*building the §5 instrument* that would let us earn them. Humility that does not
pursue the evidence is just permanent hedging — a way never to be wrong by never
saying anything.

## 4. The Evidence Burden (four questions, per atomic claim, per axis)

1. **What is the claim?** — exactly one sentence.
2. **What evidence supports it?** — links, logs, tests, production observations.
   Reproducible artifacts, never the classifier's say-so. (A tier asserted without
   cited evidence is itself a finding: *unevidenced.*)
3. **What evidence would lower this classification?** — the **falsifiers.** Not just
   confirming evidence; the observations that would force a downgrade. *This is the
   load-bearing question — it institutionalizes the willingness to be corrected.*
4. **What evidence would justify raising it?** — the next observable threshold.

## 5. Decision Impact (attached to every classification — what makes it govern)

> **What decision does this classification newly license or forbid?**

Two-way:
- A higher tier **licenses** — a claim we may now make publicly; a feature we may now
  name as live.
- A lower tier **forbids** — a claim we must stop making, relabel, or delay; an
  announcement we must withdraw; a beta invitation we must postpone.

**If the answer is "none," the audit generated information but exercised no
constitutional authority — it was ceremonial.** A standing "none" is itself flagged.

The first real constitutional test is **not** producing the audit. It is the first
time the audit forces a consequence someone would have preferred not to accept. Until
a classification changes a decision, the mirror is accurate but merely *advisory*; a
constitution that never changes a decision is not governing. The governing loop:

> evidence → judgment → constrained action → action observed against reality.

## 6. Reporting format (one block per atomic claim)

```
CLAIM:            <exactly one sentence>
AXIS:             technical | constitutional
TIER:             T1–T6 | C1–C6
SUPPORTING:       <links / logs / tests / prod observations — reproducible>
WOULD LOWER:      <falsifiers — what would force a downgrade>
WOULD RAISE:      <the next observable threshold>
DECISION IMPACT:  <what this newly licenses or forbids — or "none" (flagged)>
SOURCED FROM:     <where this claim is actually being made: deck / site / story / …>
```

## 7. Failure modes of the instrument itself

So the mirror cannot quietly fail:

- **Claim-selection evasion** (auditing only convenient claims) → §2 harvesting from the actual claim surface.
- **Authoritative-not-evidenced classification** (a tier by say-so) → §4 Q2; unevidenced is a finding.
- **Technical → constitutional smuggling** → §3 two axes, never merged; the constitutional floor (§3.2).
- **Ceremonial audit** (no consequence) → §5 Decision Impact; a standing "none" is flagged.
- **Goodhart** (people stop making claims, or inflate evidence, to game the audit) → §2 harvesting + §4 Q3 falsifiers; and the rubric is itself answerable to the sovereign, not to the score.

## 8. Roles (the §4 boundary, explicit)

- **Claude** — drafted this design; may challenge ambiguities in the rubric. **Does not classify.**
- **Nathan** (durable-form steward) — sharpens this rubric, then performs the classifications, citing evidence. Owns the mirror. His standing grows by demonstrated stewardship (§4), including the standing to tell the founder "your Cat 6 is a Cat 3."
- **Kelly** (steward of becoming / founder) — judges by the evidence; is constrained by it where the strategic story exceeds the verified build; receives the unwelcome result as the system working (§4.2).
