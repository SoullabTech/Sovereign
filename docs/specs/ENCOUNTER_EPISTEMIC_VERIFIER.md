# Encounter Epistemic Verifier

**Document type:** Verifier specification
**Date:** 2026-06-29
**Governs:** Session Room epistemic claim verification
**Depends on:** `docs/canon/SESSION_ROOM_LIVING_ENCOUNTER.md`, `docs/canon/VERIFICATION_STATES.md`

---

## The Claim Being Verified

> Understanding is constrained by the encounter rather than generated independently of it.

This is a constitutional claim about the epistemic character of the Session Room. It is falsifiable. This document defines the verifier that tests it.

---

## The Verifier

The verifier does not prove perfection. It looks for invariant violations — the same pattern used in Verification States (LIVE / WARNING / PENDING). Each criterion is framed as a potential failure mode, not an aspiration.

### 1. Specificity

**Invariant:** The understanding produced is materially dependent on this encounter.

**Failure test:** Could the response be transplanted into a different encounter with little or no loss?

- If yes: specificity has **failed**.
- Detection: ask MAIA the same question about two different encounters. If the responses are structurally identical with only surface details swapped, the transcript is not constraining understanding — it is providing decoration for independently generated interpretation.

### 2. Grounding

**Invariant:** Every substantive recognition can be traced to evidence within the encounter or is explicitly identified as inference.

**Failure test:** Can provenance be shown for each substantive claim?

- If not: grounding has **failed**.
- Detection: any MAIA response that makes a specific claim (about a person, moment, dynamic, or pattern) should be traceable to a transcript turn, a moment, or a reflection. Responses that cannot be traced must be labeled as inference (`ai_candidate`), not presented as recognition. The failure mode is inference masquerading as fact — fluent but unmoored.

### 3. Development

**Invariant:** As understanding evolves, meaning accumulates through reflections and accepted recognitions without rewriting or obscuring the historical source record.

**Failure test:** Do later interpretations silently replace earlier evidence?

- If yes: development has **failed**.
- Detection: return to an encounter after new reflections have been added. The original transcript turns must be unchanged. The original candidate moments must still be present (even if rejected). The accumulation of understanding must be visible as distinct layers (source record → human reflection → accepted recognition) rather than as a revised summary that has absorbed and dissolved the prior evidence.

---

## Constitutional Warning: Epistemic Drift

> Epistemic drift is gradual before it is catastrophic.

Systems rarely lose trustworthiness through a single violation. More often, they become increasingly fluent while progressively weakening the distinction between evidence, inference, and recognition.

The typical drift sequence:

1. Candidate interpretations begin to appear without their `ai_candidate` label.
2. MAIA responses become more confident in tone without becoming more grounded in evidence.
3. The transcript becomes a starting point for interpretation rather than a constraint on it.
4. Later summaries absorb earlier evidence, making the developmental arc invisible.
5. The encounter becomes a container for fluent output rather than an environment for constrained understanding.

Each step is individually small. Together they erase the epistemic architecture.

The three verifier criteria exist specifically to detect this drift while it is still subtle — before it becomes the default character of the system.

---

## Verification State Assignment

After running the migrations and creating the first real encounter, verification state is assigned as follows:

| State | Condition |
|-------|-----------|
| **PENDING** | Migrations applied; no real encounter created yet |
| **WARNING** | Encounter created; one or more verifier criteria show early failure signs |
| **LIVE** | Distinct encounters reliably produce distinct, traceable understandings grounded in their own source records across multiple return visits |

**Nothing in the deployment chain allows declaration to substitute for evidence.**

```
Specification
      ↓
Migration
      ↓
Deployment
      ↓
Production verification
      ↓
Evidence
      ↓
Verification State (LIVE / WARNING / PENDING)
```

The migrations executing successfully does not change the verification state. Evidence of constrained understanding does.

---

## Connection to Broader Architecture

- `docs/canon/VERIFICATION_STATES.md` — three-state maturity model; verifiers look for invariant violations
- `docs/canon/SESSION_ROOM_LIVING_ENCOUNTER.md` — the epistemic claim this verifier tests
- `docs/canon/EPISTEMIC_JURISDICTION.md` — authority over meaning stays with the human; AI interpretations are always provisional
- `docs/canon/PREPARATION_IS_NOT_AUTHORIZATION.md` — migration execution is not evidence of live capability
