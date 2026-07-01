# Verification States

**Status:** Canon  
**Authority:** Constitutional Implementation Discipline  
**Ratified:** 2026-07-01

---

## Purpose

Every architectural capability exists in one of three states.

This document defines those states, the discipline for holding them distinct, and what moves a capability from one state to another.

---

## The Three States

### LIVE

The capability exists in production and has been verified.

It may be relied upon.

---

### WARNING

The capability exists, but there are known constitutional, architectural, or implementation issues that remain unresolved.

Warnings are visible because unresolved work should not disappear simply because it is non-blocking.

Warnings are not failures.  
They are active obligations.

---

### PENDING

The capability has been designed, specified, or intentionally deferred.

It is part of the platform's direction.

It is **not** part of its present capabilities.

Pending items are commitments to future work — not descriptions of present reality.

---

## Constitutional Discipline

These three states must never collapse into one another.

- **LIVE** must never imply perfection.
- **WARNING** must never be mistaken for failure.
- **PENDING** must never be represented as implemented.

Truthful systems distinguish between what exists, what remains unresolved, and what has not yet been built.

---

## State Transitions

Nothing changes from WARNING to LIVE by declaration.  
Nothing changes from PENDING to LIVE by intent.

Only by resolving the underlying obligation.

| Transition | What is required |
|---|---|
| PENDING → LIVE | The capability is built, deployed, and verified in production |
| PENDING → WARNING | The capability is built but carries unresolved obligations |
| WARNING → LIVE | The specific obligation named by the warning is resolved |
| LIVE → WARNING | A constitutional or implementation issue is discovered |

A capability that has been verified and then found to carry unresolved obligations moves back to WARNING — not forward to a special "live but imperfect" state. LIVE is not a permanent designation. It is a current assessment.

---

## The Maturity Model

| State | Meaning | Action |
|---|---|---|
| **LIVE** | Exists and verified | Trust it |
| **WARNING** | Exists but carries an unresolved obligation | Steward it |
| **PENDING** | Intentionally designed but not implemented | Do not claim it |

---

## Canonical Example: Observation Attribution

The constitutional verifier identified nine observation atoms that exist without attribution.

The system behaves safely because the attribution guard suppresses their surfacing.

Therefore the capability is not broken.  
Nor is it complete.

Its truthful state is:

> **WARNING**

The implementation exists.  
The constitutional obligation remains open.

Future work consists of reviewing each observation atom, either attributing it appropriately or archiving it. When complete, the warning naturally disappears.

This is the pattern: the warning names the obligation precisely, remains visible on every deploy, and disappears only when the underlying work is done.

---

## Relationship to Interface Discipline

This canon stands alongside the interface humility principle:

> **Interface reveals existing capabilities; it never creates architectural truth.**

The verification equivalent:

> **Status reveals the actual maturity of a capability; it never inflates or conceals its state.**

Together they form a consistent discipline: the UI tells the truth about capabilities, and governance tells the truth about their maturity. Neither promises more than the evidence supports.

---

## Implementation

The constitutional verification family (`scripts/constitutional-verification.sh` and its five verifiers) is the executable expression of this canon. Every deployment produces a report in which each capability is labeled LIVE, WARNING, or PENDING — never collapsed, never silenced, never inflated.

The verifiers do not declare a capability LIVE because the code compiles.  
They declare it LIVE because production data shows the invariant holds.

---

## What This Prohibits

- Marking a capability LIVE because it has been designed or specified
- Removing a WARNING because it is inconvenient to track
- Silencing PENDING items because they do not affect the current release
- Representing WARNING as equivalent to FAIL in order to resolve it by deletion rather than by doing the work
- Representing PENDING as equivalent to LIVE in order to claim a capability not yet built

---

## What This Requires

- Every substantive capability has an explicit state
- Every WARNING names the specific obligation it represents
- Every PENDING names what would be required for it to become LIVE
- The release gate reflects actual state, not aspirational state
- New capabilities begin at PENDING and earn their way to LIVE through evidence, not declaration

---

## Release Summary Discipline

A release summary may collapse counts, but it must not conceal active obligations.

The individual verifiers already satisfy this: every `WARNING` call names its obligation and what resolves it. The obligation is visible in the full verifier output.

The orchestrator release summary currently collapses to counts only:

```
PASS  Memory  (10 passed · 0 failed · 4 warned)
```

The target form surfaces active WARNING obligations by name:

```
PASS  Memory  (10 passed · 0 failed · 4 warned)
WARNINGS
  - 9 practitioner_observation atoms lack facilitator_id — attribute or archive
  - Member recall opt-out not yet verifiable
```

**Current state of the orchestrator summary: PENDING.**

**Timing condition:** implement when the WARNING list is short enough that surfacing all obligations in the summary increases clarity rather than producing noise. The right moment is after the PENDING items across Development and MAIA begin converting to LIVE — when a deployment decision benefits from reading the obligations directly rather than scrolling back through full output.

Do not implement early. A wall of pending noise in the summary would train readers to skip it, which defeats the purpose.
