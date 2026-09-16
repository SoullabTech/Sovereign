# RELATIONAL-CLAIM-IDENTITY-01 — Charter

**Status:** BOUNDED RESEARCH + SHADOW SUBSTRATE ONLY
**Date:** 2026-09-16
**Canonical base:** `a0e3aa45e5bbeaabbbf49996dd4b93edb865dec2`
**Predecessor:** `GESTALT-STANDING-SHADOW-01` · final `9a2390c13`

## Governing question

> **What exactly is the thing being related to?**

A conversational turn is a container. Standing, correction, adoption, antecedent reference, and supersession must bind to the exact claim/proposition they govern rather than silently to the entire turn.

## Authority

C0–C7 are authorized as research/shadow work only: canonical bind; claim-unit contract; deterministic identity scheme; falsifiers; offline parser/annotator; claim-level replay; out-of-band transcript witness; adjudication.

No prompt change, MAIA cognition exposure, member-facing behavior, schema migration, memory write, production-response change, or serving-path import is authorized.

## Hard boundary

Adjacency is not antecedent identity. A member saying “that is exactly it,” “no,” or “I already told you” after a MAIA turn does not authorize whole-turn confirmation/correction when more than one claim unit could be the referent.## C1 · Claim-unit contract

A claim unit is the smallest span this lane is willing to treat as one addressable speech act without further model inference.

Each unit carries:

```text
ClaimUnit {
  claim_id
  turn_id
  start_char
  end_char
  exact_text_hash
  kind
  segmentation_status
}
```

`kind` is structural only: `assertion | question | directive | fragment | quotation`.

`quotation` is first-class because an exact quoted member-authored span can be the epistemic referent independently of the MAIA assertion and question surrounding it. A quotation receives no privileged standing merely by being quoted; automatic confirmation binding is permitted only when deterministic structure establishes a quotation-confirmation frame or an explicit quoted selector identifies it.

`segmentation_status` is `atomic | composite | uncertain`. Only `atomic` units may receive automatic claim-level standing from a generic backward gesture. `composite` and `uncertain` units require stronger referent evidence or remain unresolved.
## C2 · Identity law

Claim identity is positional and source-bound, not semantic.

```text
claim_id = SHA256(
  version + turn_id + start_char + end_char + exact_span_bytes
)
```

Consequences:

- the same sentence repeated in another turn gets a different claim id;
- editing the source bytes changes claim identity;
- semantic similarity never merges claim ids;
- a summary cannot substitute for the source claim;
- claim identity never implies claim truth or standing.

## Gesture binding law

A generic member gesture may bind automatically only when the eligible referent set contains exactly one atomic claim of the relevant speech-act class. Otherwise the result is `AMBIGUOUS`.

A confirmation gesture targets confirmable claims (`assertion`/`fragment`/`quotation`), never a question. A `quotation` is eligible for privileged automatic binding only through a deterministic quotation-confirmation frame or explicit quoted selector; quotation alone is not enough. A restart protest such as “I already told you” may target a sole question as a conversational act, but does not thereby correct every assertion in the turn.
## C3 · Frozen falsifiers

Before any live-corpus witness, the claim-identity substrate must prove:

1. identical text in different turns produces different claim ids;
2. editing source bytes changes claim identity;
3. exact source spans round-trip to the original turn bytes;
4. a confirmation never binds to a question;
5. one atomic assertion + one question permits confirmation of the assertion only;
6. one atomic question + assertions permits a restart protest to bind only to the question;
7. multiple eligible atomic claims make a generic gesture `AMBIGUOUS`;
8. composite/uncertain units never gain standing from a generic gesture;
9. semantic similarity/repetition never merges claim identity;
10. no eligible atomic referent produces `UNRESOLVED`, never a guessed target;
11. identical wording at two source spans still yields distinct claim ids;
12. a whole-conversation restart report remains `META_PATTERN / NO_TARGET` rather than collapsing onto one preceding claim;
13. interrogative syntax remains a question even with non-question punctuation;
14. contracted interrogatives remain questions;
15. a quotation-confirmation frame binds the quoted claim, not surrounding MAIA prose or the confirmation question;
16. quotation without a deterministic confirmation frame remains non-privileged and ambiguous when other confirmable claims exist.

A separate serving-isolation test must also remain green: no app/lib serving surface may import the shadow claim-identity module.

## Candidate selection

The stronger candidate at `lib/maia/claimIdentityShadow/` is the sole canonical candidate for this lane. It earned that standing because it represents `quotation` as a first-class claim kind, preserves exact source spans, distinguishes meta-pattern gestures from single-claim standing acts, and survived the frozen production replays.

The earlier `lib/maia/relationalClaimIdentity/` prototype is rejected as a weaker duplicate and must be removed before closure. Its useful laws are subsumed by the stronger candidate; it must not remain as a competing epistemic implementation.

## C4–C7 sequence

C4 builds an offline deterministic annotator over frozen MAIA turns. C5 replays the confirmation/contest cases that forced the predecessor lane to refuse whole-turn standing. C6 runs out-of-band against read-only production transcript snapshots with hashed telemetry only. C7 adjudicates whether claim identity is stable enough to become a prerequisite for standing.

## STOP boundary

Even if C1–C7 pass, this lane does not authorize prompt injection, serving-path imports, model-context exposure, member-facing claim IDs, schema migration, member-memory writes, or production response changes. Any standing integration requires a separately authorized successor.