# REENTRY

*Status: continuity scaffolding document for future re-entry into the sovereign intelligence work.*

---

## Current State

The articulation layer for sovereign reflective intelligence has reached a stable stopping point.

The project currently includes:

- [`docs/orientation/sovereign-intelligence-orientation.md`](./sovereign-intelligence-orientation.md)
- [`docs/orientation/sovereign-intelligence-roadmap.md`](./sovereign-intelligence-roadmap.md)
- updated [`docs/phase1-sovereign-inference.md`](../phase1-sovereign-inference.md)

The architecture is no longer speculative.

A substantial portion of the sovereign inference pathway already exists in code:

- `sovereignRouter.ts`
- `localInferenceClient.ts`
- `services/local-inference/`
- Ollama integration
- inference modes (`sovereign`, `local_only`, `primary`)
- health checks
- circuit breaker
- degraded-response path
- token logging

The main unresolved issue is not infrastructure existence.

It is:

> routing coverage and lived operational contact.

---

## Key Invariants

These are currently treated as load-bearing.

### Sovereignty

Federation distributes compute, not continuity.

No cognitive surface bypasses `sovereignRouter` without explicit documented exemption.

Sovereignty includes:

- infrastructural sovereignty
- interpretive sovereignty
- relational sovereignty
- developmental sovereignty

### Architecture

Architecture carries part of the intelligence burden.

The system should increasingly rely on:

- memory
- continuity
- restraint
- symbolic grammar
- orchestration
- governance
- boundedness

rather than escalating indefinitely through raw model capability.

### Collective Intelligence

The field learns without consuming the person.

Community intelligence should emerge through:

- doctrine
- grammar
- practitioner discernment
- relational infrastructure

rather than aggregation of intimate continuity.

### Developmental Orientation

Operational contact precedes closure.

Lived contact outranks elegant articulation.

Weekly review outranks reactive optimization.

Acceptable capability loss must not be confused with doctrinal failure.

---

## What Has Been Resolved

### Clarified

MAIA is currently sovereign at the deployment layer but largely Claude-dependent at the cognition layer.

The previous assumption that Daily Anchor was the first local inference surface was incorrect. Daily Anchor is deterministic and contains no AI generation path.

The first sovereign cognitive surface should instead be:

- a bounded mirror response
- short reflection
- or another constrained generative path

### Discovered

The sovereign inference infrastructure already exists and is production-capable.

Activation requires:

- `MAIA_INFERENCE_MODE=sovereign`
- Docker sovereign profile
- reachable Ollama host
- loaded local model

Current default model: `deepseek-r1:8b`

### Exposed

Several important surfaces bypass sovereign routing entirely:

- voice reasoning
- consciousness dialogues
- elemental router

These currently call Anthropic directly.

Phase 1 therefore contains two tracks:

**Track A — Activation.** Activate sovereign routing on surfaces already using `modelService.generateText()`.

**Track B — Refactor.** Move bypass surfaces behind `sovereignRouter`.

---

## What Remains Open

### Phase 1 Questions

- Which model family best matches MAIA's relational signature?
- Which hardware pattern becomes practitioner-reproducible?
- Which bounded generative surface enters first?
- What escalation thresholds actually prove necessary?
- Which losses are acceptable vs dangerous in lived contact?

### Federation & Governance

Still intentionally unresolved:

- what data may move between nodes
- what remains permanently local
- what federation compatibility means
- whether any aggregation-layer learning is compatible with the canon
- whether doctrine / grammar / practitioner propagation is sufficient without federated optimization

No commitment has been made beyond the current invariants.

These questions are intentionally deferred until after Phase 1 operational contact.

---

## Where To Restart

If returning after absence:

### First — Read

1. [`docs/orientation/sovereign-intelligence-orientation.md`](./sovereign-intelligence-orientation.md)
2. [`docs/orientation/sovereign-intelligence-roadmap.md`](./sovereign-intelligence-roadmap.md)
3. [`docs/phase1-sovereign-inference.md`](../phase1-sovereign-inference.md)

### Then — Verify

- Is `maia-local-inference` reachable?
- Is Ollama running?
- Which model is loaded?
- Which surfaces currently use `modelService.generateText()`?
- Which surfaces still bypass `sovereignRouter`?

### Then — Resume

Resume with:

- bounded mirror-response testing
- sovereign routing activation
- weekly classification review
- acceptable vs dangerous loss observation
- practitioner observation
- phenomenological comparison

Not with:

- new doctrine synthesis
- governance closure
- federation formalization
- premature canonization
- capability-maximization reflex

---

## What Not To Prematurely Collapse

Do not prematurely collapse:

- activation into full sovereign coverage
- local inference into solved sovereignty
- collective intelligence into aggregation
- federation into centralization
- capability gaps into failure
- elegance into truth
- articulation into operational validation
- symbolic coherence into lived developmental outcome

The project is now beyond pure articulation.

The next teacher is operational contact.

---

## Closing Orientation

The current working hypothesis is not:

> "larger intelligence automatically produces better human outcomes."

The current working hypothesis is:

> Human flourishing may depend more on the relational, architectural, developmental, and communal conditions under which intelligence is encountered than on unlimited capability alone.

This remains unproven.

Phase 1 exists to begin testing it under real conditions.
