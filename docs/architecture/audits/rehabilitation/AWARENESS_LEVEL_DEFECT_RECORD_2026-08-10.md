# Awareness-Level Inference — Defect Record

**Date**: 2026-08-10
**Status**: Recorded, not fixed. Deliberately outside CC-U1's boundary.
**Purpose**: Preserve an accurate description of the live awareness-level derivation so a future unit traces the real mechanism instead of an assumed one.

---

## 0. Correction to an earlier claim in this lane

During CC-U1 the production log line

```
💫 [ANAMNESIS-SERVER] Essence loaded: 117 encounters, L7 inferred
```

was reported as evidence that encounter count is laundered into an awareness level — *"quantity of interaction → arithmetic transformation → qualitative developmental claim."*

**That description is wrong about the mechanism.** Verified 2026-08-10:

- `Math.ceil(encounterCount / 20) + 1` occurs **exactly once** in the codebase, at `lib/memory/RelationshipMemoryService.ts:88`, **inside a `console.log` template string**.
- Its value is never assigned, returned, stored, or read. It reaches no prompt and no consumer.

It is a **cosmetic log artifact**, not a live inference. The correct criticism of it is narrow: it prints a fabricated developmental level into operator-visible logs, where it can be — and was — mistaken for a real system claim. That is a real reporting hazard, but it is not the awareness chain.

## 1. The awareness level that actually reaches the prompt

Live path:

```
maiaVoice.ts:568  awarenessLanguageAdapter.detectAwarenessLevel(conversationHistory)
      ↓
maiaVoice.ts:845  awarenessLanguageAdapter.generatePromptBlock(level, systemReferences)
      ↓
maiaVoice.ts:846  adaptedPrompt += <block>
```

Derivation (`lib/consciousness/awareness-language-adapter.ts`) is **vocabulary matching on the member's own messages**, not encounter count:

- counts substring hits against an `optInSignals` jargon list (`archetypal`, `transpersonal`, `integral`, `consciousness levels`, …)
- `>= 5 hits → 'fluent'` · `>= 2 → 'system-aware'` · else a curiosity check over the last 5 messages (`meaning`, `soul`, `purpose`, `growth`, …) → `'curious'` · else `'everyday'`

The emitted block asserts:

```
User Awareness Level: ${awarenessLevel}
System References Used: ${systemReferences}
```

## 2. What is and is not defective here

**Not defective — do not "fix" this away.** The *language rules* the block carries are a containment guardrail, and a good one. They instruct MAIA to match the member's register and explicitly forbid applying system codes to a person:

> *"Do not say 'You are in Water 2' … Default to lived-experience language and treat elemental codes as an internal lens for understanding, not external labels to apply."*

Removing this block would make MAIA **more** likely to impose framework vocabulary, not less.

**Defective:**

1. **Member-level classification asserted as fact.** `User Awareness Level: fluent` is a categorical statement about the person, injected with no hedge, no provenance, and no member visibility or correction path.
2. **Fabricated confidence.** `confidence` is hardcoded per branch (0.9 / 0.8 / 0.7). It is a literal, not a measurement, and it is shaped like one.
3. **Vocabulary is not awareness.** Saying "meaning" once classifies a member as `curious`. The category names a developmental property of the person; the evidence supports only a lexical observation about a message.
4. **Substring matching, uncorrected.** `includes()` matches inside other words, counts the same term repeatedly, and — critically — **counts MAIA's vocabulary echoed back by the member**. A member can be escalated to `fluent` by reusing words the system taught them.
5. **Cultural sovereignty (Invariant 14).** The ladder is keyed to English spiritual-therapeutic vocabulary. Fluency in a different tradition, or in plain speech, reads as `everyday`.

## 3. The honest correction available

The observation underneath is truthful and worth keeping. The defect is entirely in its **grammar**:

| Current | Truthful form |
|---|---|
| `User Awareness Level: fluent` (confidence 0.9) | `The member has used system vocabulary N times in this conversation.` |
| a property of the person | an observation about the messages |

The language rules can key off that observation exactly as they do now. Nothing about MAIA's register-matching behaviour needs to change — only the claim that justifies it.

## 4. Explicitly still open

**This trace does not establish the state of the awareness chain WU-009 described** — bead history aggregation → `dominantElement` → derived awareness level → disclosure gating on FAST/CORE. That is a *different* derivation from the language adapter above, and no consumer of it was found during the CC-U1 trace. Whether it is live, dormant, or already removed is **unverified**. Do not treat this record as having closed it.

## 5. Boundary

Not in CC-U1. Not in CC-U2. This needs its own unit, and its first act should be the consumer trace of §4 — not a rewrite of §2, which is smaller and better understood than it first appeared.
