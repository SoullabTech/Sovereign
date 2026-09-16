# FIRST-ASK-OPAQUE-MEMORY-01 · ACT 4 · Evidence Recognition Contract

**Date:** 2026-09-15
**Base:** ACT 3 frozen at `8fd08fbb9`
**Scope:** recognition law only. No recovery implementation, production change, cross-session expansion, or `S` act.

## 1. Constitutional boundary

> **MAIA may preserve evidence that a member returned to, retained, or explicitly marked a moment. She may use that evidence to find the member's own words later. She may not convert her own interpretation of a moment into evidence that the moment mattered.**

ACT 2 defined which evidence classes may govern first-ask opaque recall. This act defines the narrowest auditable way raw session material may be recognized into those classes.

Recognition is not interpretation. A recognizer may establish only:

1. what member-authored span identifies the object;
2. which member-authored act supplies E1, E2, or E3 standing;
3. where that evidence occurred.

It may not infer why the object mattered, how emotionally important it was, what it symbolized, or what MAIA believes the member meant.

## 2. Output contract

Every recognized claim must be representable as:

```text
class                 E1 | E2 | E3
anchor.text           exact member-authored substring
anchor.sourceTurn     member turn containing that substring
anchor.start/end      offsets into that member turn when recognition is textual
evidenceTurns         member turn indices establishing the class
basis                 named recognition rule, never a free-form model rationale
```

`anchor.text` is extractive. Case-folding and boundary punctuation may be used for matching, but the value carried forward for recovery is copied from the member turn. A generated synonym, summary, title, embedding label, theme, archetype, or paraphrase is not an anchor.

If a recognizer cannot produce a bounded member-authored object span, it produces no eligibility claim.

## 3. E1 · explicit member retention / placement

### 3.1 Structured gestures

An authenticated member Keep, episodic mark, or other already-governed member placement that points to a source turn is E1 by the gesture itself. No language model or textual inference is needed to decide that the member placed it.

The source object remains the member-authored source turn or the member-authored verbatim material named by the gesture. The gesture does not authorize MAIA's surrounding response as the remembered object.

### 3.2 Textual retention directives

For same-session recognition without a structured gesture, the initial recognizer may admit only narrow prospective retention constructions that contain their own object span, for example:

```text
Remember this phrase: amber willow.
Keep this image: blue cathedral.
I want to come back to winter orchard.
Don't let me lose the phrase silver cedar.
```

The construction must be prospective retention, not a retrospective lookup. Therefore:

```text
Do you remember me saying something about silver cedar?
What do you remember about silver cedar?
```

are not E1. They are retrieval acts.

A bare directive such as `remember this` or `keep this` with no same-turn object span does not receive textual E1 standing in the initial recognizer. A structured gesture may point to another source turn; an unstructured pronoun may not.

## 4. E2 · member-stated persistence / return

E2 requires two things in the same member turn:

1. an explicit member statement of persistence, recurrence, or return; and
2. a bounded member-authored object span.

The initial recognizer is deliberately template-bounded. Admissible shapes include conservative variants of:

```text
<OBJECT> has been on my mind.
<OBJECT> is an image that's been on my mind today.
I've been thinking about <OBJECT>.
I keep thinking about <OBJECT>.
<OBJECT> keeps coming back to me.
I keep returning to <OBJECT>.
I can't stop thinking about <OBJECT>.
```

The object capture must be a literal substring of the member turn. If the language establishes persistence but supplies only a pronoun or deictic with no bounded object — `this has been on my mind`, `it keeps coming back` — recognition fails closed.

The recognizer may grow only by adding separately tested member-language forms. It may not fall back to an LLM judgment that a sentence “sounds persistent.”

## 5. E3 · demonstrated MEMBER recurrence

E3 is behavioral evidence, not semantic interpretation.

The initial recognizer may establish E3 only from an exact normalized contiguous phrase that:

- appears in at least two distinct member turns;
- contains at least two lexical tokens;
- survives removal of stopwords and retrieval-act vocabulary as a content-bearing phrase;
- is not established by an assistant occurrence;
- is carried forward as the exact member-authored span from one of its member occurrences.

Matching may normalize case and boundary punctuation only. Stemming, synonyms, embeddings, semantic similarity, and assistant echoes are not part of E3 recognition.

When overlapping repeated spans exist, the recognizer keeps the maximal exact repeated span rather than manufacturing several nested objects from one recurrence. If several independent repeated member phrases remain, recognition returns several E3 claims; ACT 2 ambiguity law, not the recognizer, decides whether recovery must abstain.

A single distinctive phrase is never E3.

## 6. Inputs that have zero recognition authority

The recognizer must be structurally unable to widen eligibility from:

```text
assistant / MAIA text
developmental_memories.significance
breakthrough labels created by the system
emotion or sentiment scores
message length
assistant-response length
embedding similarity
directional_cue / distilled signal
theme or archetype assignment
recency or index position
```

These may exist elsewhere in MAIA. They are not evidence that the member retained, returned to, or marked an object.

A member turn that explicitly quotes or attributes an object to MAIA (`you said ...`, `MAIA called it ...`) is also excluded from the initial E1/E2/E3 recognizer. This prevents assistant-authored content from being laundered into member authority merely because the member repeated it while describing MAIA's speech. A later act may govern member adoption explicitly; this one does not.

## 7. Recognition and selection remain separate

The recognizer returns all lawful evidence claims. It does not choose the memory.

ACT 2 remains the sole selector:

```text
E1 > E2 > E3
one strongest lawful object       → eligible for recovery
none                              → abstain
multiple equally strong objects   → abstain
```

Recency, earliest/latest index, rarity, confidence, or “best available” may not enter through recognition as disguised tie-breakers.

## 8. Same-session boundary

This contract initially governs same-session first-ask opaque recall only. Raw `conversation_turns` are the canonical source words for that use.

`developmental_memories.trigger_event.raw.userMessage` may be useful as corroborating retained bytes or future recovery substrate, but its existence and its `significance` score do not create recognition standing. Cross-session opaque recall requires a separate consent and retention ruling.

## 9. ACT 5 obligations before runtime implementation

A raw-text acceptance set must be frozen before production recognizer code exists. It must prove at least:

- E1 prospective retention is recognized extractively;
- retrospective `remember` questions are not misclassified as E1;
- E2 recognizes the real Silver Cedar construction and returns `silver cedar` from member text;
- E2 persistence with only `this` / `it` fails closed;
- E3 requires recurrence across distinct MEMBER turns;
- assistant-only recurrence cannot establish E3;
- a distinctive one-off cannot establish E3;
- system significance cannot establish any class;
- assistant-attributed content cannot be laundered through a member quote;
- every returned anchor is an exact substring of a member source turn.

Defeat candidates must demonstrate that these negatives are capable of killing plausible but unlawful recognizers.

## 10. Standing

```text
ACT 1 authority census       ✅ c7d57e4e9
ACT 2 eligibility law        ✅ dacb4fa77
ACT 3 selection oracles      ✅ 8fd08fbb9
ACT 4 recognition contract   ✅ stated by this record
ACT 5 recognition oracles    ⛔ owed before implementation
runtime recognizer           ⛔ nonexistent / unauthorized
first-ask recovery code      ⛔ untouched
production                   ⛔ untouched by this lane
S                            ⛔ unspent
cross-session opaque recall  ⛔ unopened
```

A recognizer that guesses more is not more capable under this contract. It is less lawful.