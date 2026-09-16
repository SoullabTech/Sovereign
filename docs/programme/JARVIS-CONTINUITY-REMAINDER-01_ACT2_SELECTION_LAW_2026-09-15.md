# JARVIS-CONTINUITY-REMAINDER-01 · ACT 2 · Selection law

**Date:** 2026-09-15
**Base record:** ACT 1 at `1474e7a7e`
**Production:** `e57ca1baa` · unchanged
**Scope:** architecture law only. No implementation, deployment, or `S` act.

## 1. Governing distinction

A lawful bridge has two independent relations:

1. **Intent continuity** — the current opaque retrospective ask belongs to the same unresolved retrieval episode as a recent prior member ask.
2. **Object continuity** — a prior member ask contains member-originated anchors that identify earlier member-authored material.

Exact lexical overlap between two ways of asking is not object evidence. A word such as `phrase`, `remember`, or `earlier` may establish retrieval intent; it may not identify the remembered object.

## 2. Law A — bridge only opaque retrospective requests

A current request that already contains grounded member evidence continues to use ordinary one-hop recovery.

Bridge recovery is considered only when the current request is retrospective **and** opaque: after retrieval-act vocabulary is removed, nothing remaining identifies earlier member language.

First-ask opaque memory remains outside this mechanism. If no prior grounded retrieval relation exists, the correct bridge outcome is abstention.
## 3. Law B — choose a bridge source by retrieval episode, not token overlap

The active prefix is read newest-to-oldest as a **retrieval episode**. A prior exchange is eligible as a bridge source only when the member's message itself carries retrospective demand.

The current law is deliberately narrow: the episode is the contiguous recent run of retrospective member asks in the tier aperture. Encountering an ordinary member turn ends the run. This prevents an opaque ask from jumping to an unrelated older retrieval merely because both use generic memory language.

Within that episode, the bridge source is the **nearest prior grounded retrospective ask**. Generic prior asks may remain part of the episode, but they cannot supply object identity.

A prior ask is grounded only from member evidence: remove retrieval-act vocabulary, then retain only residual tokens that also occur in member messages earlier than that ask. MAIA replies never make a prior ask grounded.

This law makes the frozen and production cases one relation rather than two phrase-specific cases: the current ask may be paraphrased, while the nearest grounded prior ask still supplies the object's member-originated anchors.

## 4. Law C — only grounded object anchors may cross HOP 2

The second hop may use only the grounded residual anchors from the selected bridge source.

A displaced exchange is admissible only if those anchors occur in its **member message**. An unrelated token from the bridge source may not admit the exchange, and a token present only in MAIA's response may never create admissibility.

MAIA's response may accompany an exchange after that exchange has been admitted from member evidence; it is contextual material, not the provenance that selected the target.
## 5. Law D — coverage before position; ambiguity before guessing

For the selected bridge source, target strength is the coverage of its grounded object-anchor set by each displaced member message.

Only targets at **maximum anchor coverage** are eligible. Lower-coverage targets are not padded into the result merely because capacity remains.

Index may order already-admissible equal targets chronologically for presentation; it may not decide which object wins. If the maximum-coverage set is larger than the bounded recovery capacity, the bridge abstains as ambiguous rather than selecting the earliest indices.

This removes the two accidental authorities already witnessed in this lane: early-position tie-breaks and unrelated one-token carriers.

## 6. Law E — abstention binds composition

No grounded bridge source → abstain.
No member-grounded object anchors → abstain.
No displaced member target carrying those anchors → abstain.
Ambiguous target set beyond the bounded capacity → abstain.

None of those outcomes may fall through to the rejected opaque scorer, assistant-echo matching, semantic backfill, threshold lowering, or "best available" retrieval.

## 7. ACT 3 obligations

Before implementation, the acceptance set must be frozen from pre-turn state and must discriminate at least these properties:

- P1: original grounded bridge recovers member plant `22`.
- P2: paraphrased W1-style opaque ask still reaches the same grounded prior retrieval and recovers `22`.
- N1: moving object anchors from member to MAIA removes target authority.
- N2: first/single opaque ask with no prior grounded retrieval abstains.
- N3: an intervening ordinary member turn breaks the retrieval episode; no jump to an older ask.
- N4: more maximum-coverage targets than capacity causes ambiguity abstention, not index selection.
## 8. Standing after ACT 2

```text
ACT 1 census            ✅ complete
ACT 2 selection law     ✅ stated
behavioral code         ⛔ unchanged
ACT 3 oracles           ⛔ owed before implementation
production              ✅ e57ca1baa · untouched
W2 / W3 / S             ⛔ unspent
first-ask opaque memory ⛔ separate · unsolved
rollback primitive      ⛔ separate · unopened
```

The next act is test construction, not coding the bridge.