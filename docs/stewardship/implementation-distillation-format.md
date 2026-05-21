# Implementation Distillation Format

The shape contact takes after stewardship metabolization, before reaching implementation (Claude Code or human implementer). Replaces forwarding raw tester contact directly into implementation threads.

Purpose: implementation receives clarified architectural questions, not raw emotional fields. The emotional truth survives in the intake record (see `contact-intake-template.md`); only the distilled form moves downstream.

Keep brief. If the distillation gets long, the contact probably isn't ready for implementation yet.

---

## Distillation

**Source intake reference:** (link or filename of the intake record)
**Categorization:** (coherence violation / phenomenological signal / preference / imported expectation)
**Observation status:** (new / repeated / pattern)

---

## Architectural tension

One or two sentences. What is actually in tension structurally? Not what the user said. What the system needs to resolve.

---

## Coherence-condition reference

Which existing condition(s) does this engage? (Oath / Sovereignty Invariants / The Clearing / Sanctuary / specific canon doc / continuity invariant / etc.)

If the tension doesn't engage any existing condition cleanly, name that — the contact may be revealing something not yet articulated, which is itself a signal worth observing rather than implementing.

---

## Implementation-facing question

Single question. Bounded. Technical or architectural in form, not phenomenological.

**Examples:**
- "Can conversation-state persistence survive capture transitions without hard-nav teardown?"
- "Does the keep-capture surface need a non-destructive overlay path?"

**Not:**
- "How do we make capture feel less jarring?"
- "How do we honor the user's deep process?"

---

## Explicit non-goals

What this distillation is *not* asking implementation to do. Useful to prevent scope drift.

**Examples:**
- Not asking for a new capture mode.
- Not asking for user-facing copy changes.
- Not asking for telemetry or analytics.

---

## Tester-proposed remedies

If the tester suggested specific fixes, list them here — marked explicitly as non-authoritative. Implementation should consider them only insofar as they align with the architectural tension, not because they were suggested.

```
> Tester suggestion: [verbatim]
> Status: non-authoritative
> Aligned with tension: yes / no / partial
```

---

## Constraints on the implementation thread

- Pre-classified — implementation does not need to re-discern category.
- Bounded — single question only.
- Stable — doctrine should not be evolving in the implementation thread that receives this.
- If the implementation thread starts drifting into governance / doctrine / architecture revision, that's a signal to pause and route back upstream.
