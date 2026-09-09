# EVIDENCE-NAMING-01 — name the observation before naming its meaning

> ⭐⭐ **The specificity of a claim may not exceed the specificity of the evidence that supports it.**
> ⭐⭐ **A measurement should not acquire a diagnosis merely by being given one as a name.**

**Opened 2026-09-09.** Discovered by the *Sacred Is Not A Symptom* audit; ⛔ **not a violation of that
canon.** Its mechanism is vocabulary-invariant and it **passes** that canon's substitution falsifier.
It read as a sacred-as-symptom defect only because of what it is called.

⭐ **This rule will be needed in far more places than spirituality.**

## The instance

`lib/memory/ConsciousnessMemoryLattice.ts:643`

```ts
if (mentalCount > emotionalCount * 3) patterns.push('potential_spiritual_bypassing');
```

**What the evidence can establish:**

```text
mental_tagged_events > 3 × emotional_tagged_events   over a seven-day window
```

**What the name claims:** *spiritual bypassing* — a relationship to experience, over an unbounded
time frame, with an attributed motive. ⛔ **The ratio supports none of that.**

## ⚠️ The existing gloss is ALSO too strong

`lib/memory/stores/PatternMemoryStore.ts:47` describes the same pattern as:

> *"Mental insights without emotional integration"*

⭐ **That is a second overclaim, and a subtler one.** The ratio establishes **fewer emotional-tagged
events** — not *lack of emotional integration*. **Integration is another inference**, requiring
evidence about how material was metabolized, which no event count carries. A member may integrate
emotionally without generating emotional-tagged events at all.

## Owed

Rename toward the measurement, e.g. `high_mental_to_emotional_ratio` or
`mental_emotional_imbalance_signal`, described as:

> *"Mental-tagged events exceeded emotional-tagged events by more than 3:1 over the observed window."*

⭐ **Then something later may interpret what that means, with additional evidence.** The
interpretation is not forbidden — it is simply not this measurement's to assert.

⛔ **NOT REPAIRED.** Requires a census of readers of `potential_spiritual_bypassing`
(`ConsciousnessMemoryLattice:674`, `PatternMemoryStore`) before the identifier changes, since a
rename that leaves a consumer matching the old string silently disables the pattern.

## Register

```text
Instance         ConsciousnessMemoryLattice:643  ·  PatternMemoryStore:13,47
Mechanism        seven-day event-count ratio; vocabulary-invariant
Canon violated   EVIDENCE-NAMING (not Sacred-as-Symptom)
Status           OPEN
```
