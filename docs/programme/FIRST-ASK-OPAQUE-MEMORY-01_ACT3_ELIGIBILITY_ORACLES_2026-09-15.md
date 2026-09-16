# FIRST-ASK-OPAQUE-MEMORY-01 · ACT 3 · Eligibility oracles

**Date:** 2026-09-15
**Law:** ACT 2 at `dacb4fa77`
**Suite:** `tests/constitutional/lane1/first-ask-opaque-eligibility-acceptance.ts`
**Rule:** oracle frozen before any production retrieval implementation or `S` act.

## 1. What this suite proves

This suite tests the ACT 2 **admission + selection law** over declared evidence facts.

It deliberately does **not** pretend the raw-text recognizer has already been designed. Each case declares which evidence class its construction contains, who authored the source/anchor/evidence, and the source index. The reference law then decides whether a first opaque ask may recover.

This separation is load-bearing: a regex, embedding model, or LLM classifier is not allowed to become constitutional authority merely because it was convenient to write the oracle.

A later evidence-recognition act must separately prove how raw member language is mapped into E1/E2/E3 without widening these classes.

## 2. Frozen positive oracles

```text
P1  E2 Silver Cedar first ask          → [0]
P2  E1 explicit retention vs E2        → [2] · E1 wins
P3  E3 demonstrated member recurrence  → [1]
```

P1 is the central capability claim: no prior retrieval ask exists. Eligibility comes from the member's own persistence language, not a bridge.## 3. Frozen negative oracles

```text
N1  assistant-only recurrence              → []
N2  distinctive one-off phrase             → []
N3  high system significance               → []
N4  two E2 objects                         → [] · ambiguous
N5  two E1 objects                         → [] · ambiguous
N6  persistence language, no object anchor → []
N7  assistant-authored anchor              → []
```

These cases establish that eligibility cannot be manufactured by assistant echo, system scoring, lexical distinctiveness alone, or a tie-break over equally authoritative member evidence.

## 4. Reference-law result

```text
10 / 10 oracles green
```

The reference law:

1. admits only E1/E2/E3 with member source + member anchor + member evidence;
2. keeps the strongest authority class present;
3. groups only the same admitted object key;
4. recovers exactly one object;
5. abstains on zero or multiple strongest-class objects.

No psychological significance score exists in the model.## 5. Defeat-candidate lethality

All nine deliberately wrong rules die:

- always abstain → dies on P1/P2/P3;
- distinctiveness creates eligibility → dies on N2;
- assistant recurrence counts → dies on N1;
- assistant anchor counts → dies on N7;
- system significance admits → dies on N3;
- newest candidate breaks ambiguity → dies on N4/N5;
- oldest candidate breaks ambiguity → dies on N4/N5;
- explicit-only memory → dies on P1/P3;
- no E1>E2>E3 precedence → dies on P2.

```text
9 / 9 defeat candidates killed
```

The negatives therefore carry discriminating force; they are not explanatory prose around a permissive implementation.

## 6. What remains intentionally unproven

ACT 3 does not establish:

- how raw text is recognized as E1, E2, or E3;
- how an identifying member span is extracted without system paraphrase;
- whether deterministic lexical identity is sufficient for E3 recurrence;
- any semantic/paraphrase equivalence rule;
- cross-session opaque recall;
- production serving behavior.

Those questions cannot inherit authority from this selection suite.## 7. Standing after ACT 3

```text
ACT 1 authority census        ✅ c7d57e4e9
ACT 2 eligibility law         ✅ dacb4fa77
ACT 3 law-level oracles       ✅ 10/10 green · 9/9 mutants killed
raw-text recognizer           ⛔ not designed / not authorized
production implementation     ⛔ untouched
production runtime            c9f397d67 · unchanged by this lane
S                             ⛔ unspent
cross-session opaque recall   ⛔ unopened
```

The next lawful act is an **evidence-recognition census/design**, not implementation: determine the narrowest auditable way to recognize E1/E2/E3 and extract member-authored anchors from raw turns without importing system significance or assistant meaning.