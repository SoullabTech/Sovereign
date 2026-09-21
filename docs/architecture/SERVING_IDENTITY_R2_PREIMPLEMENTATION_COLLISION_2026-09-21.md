# SERVING-IDENTITY / R2 — PRE-IMPLEMENTATION CONTRACT COLLISION

**Branch:** `feature/serving-identity-r2`  
**Authorized parent:** `22c529daedf9e992c2b044bd0462e14b880302bf`  
**Finding status:** RUNTIME IMPLEMENTATION HELD · CONTRACT AMENDMENT REQUIRED

## 1. Purpose

R2 was authorized to implement live serving truth with the accepted service-state distinction:

```text
served_model
degraded_non_model
unresolved
```

Before mutating runtime code, the live `getMaiaResponse()` path was audited for every response-producing path that can reach `/api/sovereign/app/maia/list`.

That audit found intentional non-model response producers that cannot be truthfully represented by the accepted three-state contract.

Per R2 §XVIII:

> If serving truth cannot be added without changing routing behavior, stop and report the collision.

The collision here is not routing behavior. It is **representational incompleteness**. Continuing without adjudication would require silently widening the accepted R2D contract.

## 2. Collision A — field-safety refusal

In `lib/sovereign/maiaService.ts`, field safety may refuse before any model handoff.

The path returns a member-facing `text` response with:

```text
processingProfile: FAST
provider: absent
```

The source explicitly states that on a Writer turn this is a **pre-handoff refusal** and that the Work never reached a model.

This state is known:

```text
a model did not serve
the response was intentionally produced by field-safety policy
```

It is not:

- `served_model`;
- `degraded_non_model` — the response is an intentional safety refusal, not degraded provider capacity;
- `unresolved` — whether a model served is known.

## 3. Collision B — high-confidence RCN

In `lib/sovereign/maiaService.ts`, high-confidence RCN can produce the response directly and return early.

The path returns:

```text
text: rcnText
processingProfile: DEEP  // compatibility label
rcn.used: true
provider: absent
```

The source states:

> RCN returns a response of its own, produced without the Writer canonical turn.

For ordinary non-Writer MAIA turns, that response can become the member response without a model provider serving that response.

Again, the state is known:

```text
a model did not serve
the response was intentionally produced by RCN
```

It is not provider degradation and it is not unresolved.

## 4. Collision C — top-level processing failure

The catch path of `getMaiaResponse()` returns deterministic failure text and explicitly returns:

```text
provider: undefined
```

This path plausibly fits `degraded_non_model`, because response production is a fallback after processing failure.

It demonstrates why **intentional non-model service** and **degraded non-model response** must remain distinct.

## 5. Current live response collapses these states

The live `/api/sovereign/app/maia/list` route currently derives:

```text
providerUsed = orchestratorResult.provider?.provider || "unknown"
modelUsed    = orchestratorResult.provider?.model || "unknown"
```

Therefore all of these can currently collapse toward provider/model `unknown`:

- field-safety refusal;
- RCN response;
- genuine unresolved provider identity;
- top-level failure;
- any other providerless response path.

This is exactly the category error R2 exists to remove.

## 6. Why the accepted R2D contract cannot represent the truth

The accepted contract defines:

```text
serviceState:
  served_model
  degraded_non_model
  unresolved

served:
  provider/model target or null
```

There is no truthful representation for:

> An intentional, successfully produced, non-model response.

Encoding it as `degraded_non_model` falsely asserts degradation.

Encoding it as `unresolved` falsely asserts uncertainty.

Encoding it as `served_model` falsely asserts model service.

Therefore R2 cannot meet its own completion law under the accepted type without a contract amendment.

## 7. Minimal amendment proposed

Add one service state:

```text
served_non_model
```

and generalize the served target from provider-only to a discriminated union:

```ts
type LiveServedTarget =
  | {
      kind: 'model';
      provider: ProviderName;
      model: string;
      domain: ExecutionDomain;
    }
  | {
      kind: 'non_model';
      subsystem: LiveNonModelSubsystem;
      domain: ExecutionDomain;
    }
  | null;
```

with a deliberately bounded subsystem vocabulary initially sufficient for witnessed live paths, for example:

```text
field_safety
rcn
deterministic_fallback
```

Exact vocabulary should be adjudicated rather than inferred.

## 8. Resulting state separation

The amended state space would distinguish:

```text
served_model
  an actual model/provider served

served_non_model
  a known intentional non-model subsystem produced the response

degraded_non_model
  a fallback/degraded response was produced because intended model service failed

unresolved
  whether/which serving producer handled the response is not established
```

This preserves the governing requirement:

> truthfully carry what was intended, what actually served, whether a model served at all, and what remains unknown.

## 9. Falsifier amendment required

The executable R2 matrix should gain at least:

### R2-F10 — intentional non-model service is not degradation

A field-safety or RCN response must not be classified `degraded_non_model`.

### R2-F11 — intentional non-model service is not unresolved

A known RCN/field-safety producer must not collapse to `unresolved` merely because no ProviderMeta exists.

### R2-F12 — non-model subsystem cannot impersonate provider/model service

A non-model response must not manufacture `provider=unknown/model=<subsystem>` as a served model target.

Defeat candidates must be isolated under the same discrimination law as R2D.

## 10. Standing

```text
R2 implementation
  NOT STARTED

Runtime files mutated
  NONE

Routing behavior changed
  NO

Provider behavior changed
  NO

Accepted R2D contract
  INCOMPLETE FOR LIVE RESPONSE POPULATION

Collision
  INTENTIONAL NON-MODEL RESPONSE PRODUCERS

Amendment required
  YES

Production
  UNTOUCHED
```

## Controlling finding

> **Known non-model service is neither provider degradation nor uncertainty. A serving-truth contract that cannot say that must be repaired before it is wired into the living system.**
