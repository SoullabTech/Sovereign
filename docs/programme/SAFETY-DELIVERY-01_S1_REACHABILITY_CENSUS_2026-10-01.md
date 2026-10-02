# SAFETY-DELIVERY-01 — S1 Reachability Census

**Date:** 2026-10-01
**Evidence base:** commit:`a999932df7aa3d4052ee78f044878026aa4f680b`
**Scope:** S1 only — `MAIASafetyPipeline` as constructed by `lib/agents/PersonalOracleAgent.ts`
**Posture:** evidence correction before implementation

## Question

Does the S1 non-delivery mechanism sit on the canonical member-turn path in current production architecture?

## Finding

**No live reachability is established.**

The earlier register line correctly identified a real local defect: `PersonalOracleAgent` constructs `new MAIASafetyPipeline()` without the alert service or therapist directory that the pipeline requires to deliver crisis/high-risk alerts.

But that file begins with an explicit source annotation saying it is a prototype and is **not in the ship path**. The canonical route authority map identifies `/api/sovereign/app/maia/list` as the primary live member-turn ingress. That route does not import `PersonalOracleAgent`, `MAIASafetyPipeline`, or `IntegratedSafetySystem`.

Therefore the evidence does **not** support the stronger statement that a current member crisis alert reaches this undelivering constructor.

## Evidence

### E1 — The defect exists in the prototype

`lib/agents/PersonalOracleAgent.ts` imports `MAIASafetyPipeline` and constructs it with no dependencies:

`this.safetyPipeline = new MAIASafetyPipeline();`

`lib/safety-pipeline.ts` requires both an alert service and therapist directory before it can deliver crisis or high-risk alerts. Without them it emits `SAFETY_NOTIFY_NO_RECIPIENT` and returns.

### E2 — The source declares itself outside the ship path

The first line of `lib/agents/PersonalOracleAgent.ts` states:

> Prototype agent with Supabase refs and missing exports (not in ship path)

That source annotation is not sufficient by itself, so reachability was traced independently.

### E3 — Canonical live ingress is a different path

`docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md` names `/api/sovereign/app/maia/list` as `canonical-live` and the primary route the frontend hits for MAIA chat turns.

`app/api/sovereign/app/maia/list/route.ts` imports and applies `enforceFieldSafety`, but it does not import or construct `MAIASafetyPipeline`, `PersonalOracleAgent`, or `IntegratedSafetySystem`.

### E4 — Direct reference census does not establish a live member-turn edge

Direct references to `lib/agents/PersonalOracleAgent.ts` exist in old/prototype consciousness, initiation, demo, voice, and MAIA helper surfaces. The census found no direct import from the canonical live `/list` ingress.

Some of those secondary modules may themselves deserve later reachability review. That possibility does not authorize promoting them to production evidence without a traced edge from a live ingress.

## Adjudication

S1 remains a valid **non-delivery architecture finding**, but its classification changes:

- from: confirmed safety-critical member-turn failure;
- to: confirmed prototype non-delivery mechanism, **live reachability not established**.

No alert transport is added in this change.

This is deliberate. Wiring a human pager into a prototype because it contains alarming words would expand authority and operational surface without proving that members ever cross the seam.

## Closure

S1 closes by either lawful path:

1. **Adoption:** a live member-turn producer explicitly adopts this pipeline, provides a delivering alert service and recipient authority, and a crisis alert is witnessed reaching the intended human; or
2. **Removal:** the obsolete prototype pathway is removed/superseded and no live importer remains.

Until one of those occurs, S1 stays visible as an architecture debt item, not as evidence of a current production crisis-alert outage.

## Next boundary

SAFETY-DELIVERY-01 should next census the **actual canonical `/list` safety posture** independently of S1:

- what `enforceFieldSafety` detects;
- what it is designed to prevent;
- whether crisis/self-harm language has any separate live escalation contract;
- whether the intended member experience is resource presentation, human notification, both, or neither.

That is a new design/reachability question. It must not inherit the prototype pipeline's implied authority by accident.
