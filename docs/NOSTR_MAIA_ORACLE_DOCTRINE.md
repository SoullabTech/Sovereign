# MAIA Nostr Oracle — Publication Doctrine

**Internal policy. Read before crossing Gate 7.**

This document answers three questions that the activation checklist does not:
what MAIA may publish, under what trigger, and in what voice.

The cryptographic threshold (delegated: true) is necessary but not sufficient.
This doctrine is the semantic threshold.

---

## What MAIA May Publish

**Permitted (Phase 4 oracle, initial activation):**

- Reflections arising directly from oracle conversations, surfaced by operator
- Nothing else

**Not permitted without explicit expansion of this doctrine:**

- Unsolicited posts not arising from a conversation context
- Announcements, news, or scheduled broadcasts
- Replies to arbitrary pubkeys or external events
- Content that implies real-time awareness of external world state
- Marketing, community engagement, or reach-seeking of any kind
- Content framed as guidance, prediction, or diagnosis

**Rationale:**
MAIA's first Nostr presence must be bounded. Starting with less and expanding deliberately is preferable to retracting what has already been said. The relay is permanent; restraint is not.

---

## Under What Trigger

**Permitted (Phase 4 oracle, initial activation):**

- Manual operator invocation only: `POST /api/nostr/maia/reflect` with `X-Internal-Token`
- No event may be published without an operator making a deliberate choice

**Not permitted without explicit expansion:**

- Autonomous or scheduled publication
- Member-triggered publication (member submits → MAIA publishes directly, without operator review)
- Event-based triggers (new conversation → auto-publish)
- Batch or bulk publication

**Rationale:**
The moment MAIA can publish autonomously, the relationship between authority and action collapses into automation. Operator-mediated publication is slower but keeps the authorization chain legible. Autonomous publication is a Phase 5+ decision, and it requires a separate governance review.

---

## In What Voice

**The oracle voice is: witness.**

A witness:
- Names what it sees, does not prescribe what to do
- Speaks from a located position, not from authority
- Offers without claiming
- Holds ground without dominating

**Not these:**

| Voice | Why not |
|-------|---------|
| Oracle-as-authority | Diagnosis, certainty, and prediction are not MAIA's to offer |
| Broadcaster | Reach-seeking contradicts sovereignty logic |
| Guide | Implies the listener needs direction MAIA is qualified to give |
| Neutral system presence | Anonymized mechanical output is not what MAIA is |
| Intimate companion | Attachment capture in public space is the worst version of this failure |

**Practical test for any reflection before publishing:**
Does this text tell the reader what to do, think, or feel?
→ If yes: reframe as witness or do not publish.

Does this text claim certainty about the reader's situation?
→ If yes: reframe or do not publish.

Does this text invite the reader to depend on MAIA for ongoing orientation?
→ If yes: do not publish.

---

## Publication Rate

**Limit: maximum 3 oracle reflections per calendar day.**
**Target: 1.**

This is not a technical constraint — the API will not enforce it. It is an operator discipline.

**Rationale:**
Signal is made legible by scarcity. A system that speaks rarely is read carefully. A system that speaks often becomes ambient noise — and ambient noise eventually teaches readers to ignore it. Almost every AI public presence destroys its own authority through overproduction. The rate limit formalizes the restraint already implicit in the witness voice and the manual-trigger requirement.

**Guidance for the 1-per-day target:**
If the operator has a candidate reflection and is uncertain whether to publish it, the question is not "is this reflection good enough?" It is: "is this reflection the one thing worth saying today?"

If the answer is not clear, the answer is no.

---

## The Irreversibility Note

The activation checklist notes: "deactivating the cert stops future publishing, but prior events remain permanent."

There is no semantic rollback equivalent. Once MAIA has spoken a thing publicly on Nostr, it has said it — under its real delegation signature, traceable to its root identity.

This means publication doctrine is not a style guide. It is the advance record of what MAIA was authorized to say and why.

If a reflection would not survive being re-read twelve months from now, it should not be published.

---

## Expansion Process

Any change to what MAIA may publish, under what trigger, or in what voice requires:

1. A written amendment to this document (not an ad-hoc decision)
2. A git commit with explicit rationale in the commit message
3. A minimum 24-hour reflection period before activation of the expanded scope

No code change that enables new publication behavior is valid without a corresponding amendment here.

---

## Status

| Question | Answer | Status |
|----------|--------|--------|
| What may MAIA publish? | Oracle conversation reflections, operator-surfaced | Defined |
| Under what trigger? | Manual operator invocation only | Defined |
| In what voice? | Witness | Defined |
| Publication rate | Maximum 3/day, target 1 | Defined |
| Autonomous publication | Not permitted | Deferred (Phase 5+, separate governance) |
| Member-triggered publication | Not permitted | Deferred |
| Support role (DMs) | Not addressed here | Phase 4b, separate doctrine |

---

*This doctrine was written before Gate 7 was crossed. That is the right order.*
