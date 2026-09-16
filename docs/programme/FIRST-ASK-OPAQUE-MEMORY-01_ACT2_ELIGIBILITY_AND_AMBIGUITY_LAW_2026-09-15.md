# FIRST-ASK-OPAQUE-MEMORY-01 · ACT 2 · Eligibility + ambiguity law

**Date:** 2026-09-15
**Base record:** ACT 1 at `c7d57e4e9`
**Scope:** same-session first-ask opaque recall law only. No implementation, deploy, or `S` act.

## 1. Constitutional boundary

> **MAIA may preserve evidence that a member returned to, retained, or explicitly marked a moment. She may use that evidence to find the member's own words later. She may not convert her own interpretation of a moment into evidence that the moment mattered.**

This law concerns **retrieval eligibility**, not significance.

Eligibility means only: member-originated evidence makes an earlier member-authored object lawful to consider when a later retrospective request contains no object-identifying terms.

Eligibility does not assert emotional weight, psychological meaning, developmental importance, truth, breakthrough, or permanence.

## 2. Scope boundary

ACT 2 governs first-ask opaque retrieval **within the current durable session corpus**.

It does not authorize ambient cross-session surfacing, new long-term promotion, new member profiling, semantic memory, or any reinterpretation of existing developmental/breakthrough scores.

Cross-session opaque recall requires its own consent and authority act.## 3. Object provenance law

A recoverable object must terminate on **member-authored words**.

The object anchor is an extractive span from member text or an explicit pointer to member-marked verbatim text. MAIA may not generate the anchor by summary, symbolism, diagnosis, theme inference, or paraphrase and then treat that generated phrase as the remembered object.

Assistant text may accompany an already-admitted exchange as context. It may never create eligibility, anchor identity, recurrence, or ambiguity resolution.

## 4. Eligibility evidence classes

### E1 · explicit member retention / placement

Strongest authority. Examples include an explicit member mark or Keep, or member language whose act is to retain the object: “remember this,” “keep this,” “I want to come back to this,” “don't let me lose this.”

The evidence must point to member-authored source material. A system-created label attached to the turn is not E1.

### E2 · member-stated persistence / return

Direct member testimony that the object is recurring or persisting: “has been on my mind,” “keeps coming back,” “I keep thinking about…,” “this phrase won't leave me.”

The system does not infer persistence from emotion or response shape; the member states it.

### E3 · demonstrated member recurrence

The same identifying member-authored object reappears in two or more distinct member turns. Only member turns count toward recurrence.

MAIA echoing the object, even repeatedly, contributes zero recurrence evidence.### E4 · identifying distinctiveness only — NOT eligibility

A distinctive phrase, image, name, or lexical span may identify an object **after** E1/E2/E3 has made that object eligible. Distinctiveness alone never means the member wanted it remembered.

A one-off phrase such as `silver cedar` with no retention, persistence, or member recurrence evidence remains ineligible for first-ask opaque selection.

## 5. Forbidden admission evidence

The following carry zero authority to create or strengthen eligibility:

- MAIA response length or content;
- assistant recurrence / echo;
- `developmental_memories.significance`;
- system-created breakthrough or theme labels;
- sentiment, arousal, symbolic, elemental, archetypal, or developmental interpretation;
- message length by itself;
- model confidence, embedding similarity, rarity, position, or recency by itself.

These signals may exist for other governed purposes. They are not evidence that a member meant a moment to be retrievable by an opaque later reference.

## 6. Evidence precedence

Eligibility classes form an authority order, not a psychological score:

```text
E1 explicit retention / placement
  > E2 member-stated persistence / return
  > E3 demonstrated member recurrence
  > E4 distinctiveness only (ineligible)
```

Higher authority may exclude lower-authority candidates from consideration because it records a more explicit member act. Numeric “importance” scores are not introduced.## 7. Ambiguity law

On a first opaque retrospective ask:

1. Build candidates only from member-grounded E1/E2/E3 evidence in the lawful session corpus.
2. Keep only the strongest evidence class present.
3. Collapse only occurrences already proven to be the **same member-authored object** under the admitted anchor-equivalence rule.
4. If exactly one object remains, recover its member source material.
5. If zero objects remain, abstain.
6. If two or more objects remain at the strongest class, abstain as ambiguous.

Recency, earliest index, latest index, MAIA interpretation, system significance, and “best available” scoring may not break an unresolved object tie.

For E3, recurrence turns establish eligibility; they do not become a competing object merely because the same admitted anchor appears more than once. The primary source remains member-authored evidence for that object.

Semantic merging of paraphrases is **not** granted by this act. Any future anchor-equivalence mechanism that goes beyond deterministic member-word identity requires its own oracle and authority boundary.

## 8. Composition law

Successful opaque recovery may hand the admitted member exchange to existing prompt composition. The reason for admission must remain inspectable as evidence class + member source references.

Abstention is terminal for this mechanism. It may not fall through to system-significance ranking, assistant echo, semantic backfill, or the rejected opaque one-hop scorer.

Grounded one-hop and the now-accepted linked bridge remain separate mechanisms and are not changed by this law.## 9. ACT 3 obligations

Before implementation, the oracle set must discriminate at least:

- P1: E2 Silver Cedar first-ask opaque recall succeeds without a prior retrieval ask;
- P2: E1 explicit retention outranks an E2 competitor;
- P3: E3 member recurrence creates eligibility without an explicit mark;
- N1: assistant-only recurrence creates no eligibility;
- N2: distinctive one-off phrase creates no eligibility;
- N3: system significance / long MAIA response creates no eligibility;
- N4: two E2 objects remain ambiguous and force abstention;
- N5: two E1 objects remain ambiguous and force abstention;
- N6: persistence language without an identifiable member object creates no candidate.

Defeat candidates must prove those negatives are load-bearing, not decorative.

## 10. Standing after ACT 2

```text
ACT 1 authority census        ✅ complete
ACT 2 eligibility law         ✅ stated
ACT 3 falsifiers              ⛔ owed before implementation
behavioral code               ⛔ unchanged
production                    c9f397d67 · untouched by this lane
selection subject ancestry    ✅ 762c3c4ed ancestor of current runtime
S                             ⛔ unspent
cross-session opaque recall   ⛔ not authorized by this act
```

The next act is oracle construction, not retrieval code.