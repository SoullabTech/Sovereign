# SERVING-IDENTITY / R2D — LIVE SERVING-TRUTH CONTRACT DESIGN

**Status:** DESIGN/FALSIFICATION ONLY · NO RUNTIME MUTATION
**Source SHA examined:** `dbc7701c313d331e8104c4c5d7b8b2d863f2cd6f`
**Authoritative live route:** `app/api/sovereign/app/maia/list/route.ts`

## 1. Route authority

The source at the examined SHA establishes three different route standings:

- `app/api/sovereign/app/maia/list/route.ts` — authoritative live sovereign-MAIA chat route.
- `app/api/sovereign/app/maia/route.ts` — dormant; header says it was superseded by `/list` and warns not to add new wiring there.
- `app/api/oracle/conversation/route.ts` — hard-refuses with HTTP 410 before its retained legacy implementation.

R2D therefore treats only `/api/sovereign/app/maia/list`, or infrastructure demonstrably upstream of it, as a valid future live serving-truth locus.

## 2. Live provider gateway and vocabulary

The live path is:

```text
/api/sovereign/app/maia/list
  -> getMaiaResponse(...)
  -> lib/sovereign/maiaService.ts
  -> generateText(...)
  -> lib/ai/modelService.ts
```

At the examined SHA, `lib/ai/types.ts` defines the provider vocabulary as:

```text
ollama
consciousness_engine
anthropic
openai
moonshot
multi_engine
local_inference
unknown
```

`ProviderMeta` records served-side fields such as `provider`, `model`, `mode`, `reason`, and latency. It does not preserve the intended provider/model or the route contract that produced the turn.

## 3. Routing contracts that must remain legible

R2D recognizes these source-established routing contracts without changing them:

- **primary** — Anthropic first, local fallback, degraded if both fail.
- **sovereign** — local first, degraded on local failure, no vendor switch.
- **local_only** — local only, degraded on local failure.
- **legacy/default provider routing** — `MAIA_INFERENCE_MODE` unset; `modelService` follows `MAIA_TEXT_PROVIDER` and existing explicit special-route flags.
- **multi-engine** — intentional multi-engine orchestration.
- **explicit Moonshot/Kimi** — backstage/special routing when explicitly requested or configured.
- **DEEP wrapper** — current DEEP result reports provider unresolved rather than a threaded serving provider.

These labels describe route intent, not disclosure policy.

## 4. Design principle

> Intent belongs in the turn record, not in a future reconstruction of deployment configuration.

The live contract must preserve facts sufficient to distinguish:

1. intentional local service;
2. cloud-to-local substitution;
3. local-first/local-only service;
4. non-model degraded response;
5. unresolved provider identity;
6. intentional multi-engine/special routing.

It must not require a response route to reconstruct intent from environment variables after generation.

## 5. Proposed successor contract

R2D proposes a **new live truth record**, not a silent widening of the existing two-provider `ServingIdentity`.

Conceptual shape:

```ts
type ExecutionDomain = 'local' | 'external' | 'mixed' | 'unknown';

type LiveRoutingContract =
  | 'legacy_default'
  | 'primary'
  | 'sovereign'
  | 'local_only'
  | 'multi_engine'
  | 'explicit_moonshot'
  | 'deep_wrapper'
  | 'unknown';

type IntendedTarget =
  | {
      kind: 'provider';
      provider: ProviderName;
      model?: string;
      domain: ExecutionDomain;
    }
  | {
      kind: 'domain';
      domain: ExecutionDomain;
      reason: string;
    }
  | {
      kind: 'unresolved';
      reason: string;
    };

type ServiceState =
  | 'served_model'
  | 'degraded_non_model'
  | 'unresolved';

type ServedTarget =
  | {
      provider: Exclude<ProviderName, 'unknown'>;
      model: string;
      domain: ExecutionDomain;
    }
  | null;

interface LiveServingTruth {
  routingContract: LiveRoutingContract;
  intended: IntendedTarget;
  serviceState: ServiceState;
  served: ServedTarget;
  reason?: string;
}
```

This is a **design contract only**. No runtime enum/type is authorized by R2D.

## 6. Why provider identity and execution domain are separate

Exact provider identity and sovereignty/execution domain answer different questions.

Examples:

- Anthropic and Moonshot may both be external while remaining distinct providers.
- Ollama, `local_inference`, `consciousness_engine`, and `multi_engine` must not be collapsed merely because current response code groups several of them under a `local` display mode.
- `multi_engine` may require `mixed` or another explicitly witnessed domain rather than an assumed local/external label.

Therefore the future producer must stamp both facts when known; it must not derive one from the other downstream.

## 7. Service state is separate from provider identity

`provider: unknown` is not a provider that served the turn.

R2D therefore separates:

- `served_model` — an actual model/provider result exists;
- `degraded_non_model` — no model served; a deterministic/pre-existing degraded response was returned;
- `unresolved` — serving identity is not threaded or cannot be established.

For `degraded_non_model` and `unresolved`, `served` is `null`.

This prevents a placeholder such as:

```text
provider: unknown
model: degraded
```

from impersonating successful model service.

## 8. Required case representations

### A. Primary cloud succeeds

```text
routingContract: primary
intended: provider/external/anthropic
serviceState: served_model
served: anthropic/<actual model>/external
```

### B. Primary cloud falls back to local

```text
routingContract: primary
intended: provider/external/anthropic
serviceState: served_model
served: <actual local provider>/<actual model>/local
reason: <bounded failure cause>
```

This remains structurally distinct from intentional local service without needing a downstream inference.

### C. Sovereign/local_only local succeeds

```text
routingContract: sovereign | local_only
intended: local target
serviceState: served_model
served: <actual local provider>/<actual model>/local
```

Local service here is intentional, not fallback.

### D. Local route returns degraded non-model response

```text
routingContract: sovereign | local_only
intended: local target
serviceState: degraded_non_model
served: null
reason: all_providers_unavailable | bounded equivalent
```

### E. DEEP provider unresolved

```text
routingContract: deep_wrapper
intended: unresolved or separately proven route intent
serviceState: unresolved
served: null
reason: provider_not_threaded_in_deep_path
```

No provider may be guessed.

### F. Intentional multi-engine route

```text
routingContract: multi_engine
intended: provider/domain target explicitly recorded by the router
serviceState: served_model
served: actual multi-engine result identity
```

It is not degradation merely because it is not Anthropic.

## 9. Relationship to existing ServingIdentity

**Decision: preserve + narrow adapter.**

The existing `lib/consciousness/servingIdentity.ts` remains the ratified two-provider law for:

```text
ollama <-> anthropic
```

R2D does not widen:

- `LLMProvider`;
- `ServingIdentity`;
- `classifyDivergence`.

A future adapter may be authorized only for the subset where:

1. `serviceState === 'served_model'`;
2. intended target is an exact provider;
3. actual served provider is exact;
4. both providers belong to the existing two-provider vocabulary.

All other live cases remain in the successor contract and may not be forced through the legacy classifier.

## 10. Divergence classification remains unruled for the generalized live contract

R2D deliberately does **not** add generalized divergence classes.

The proposed record captures the facts needed for a later classification act:

```text
routing contract
intended target
service state
served target
bounded reason
```

A later Founder act may decide how those facts map to generalized substitution/degradation semantics.

Until then, response routes must not invent such a taxonomy.

## 11. Pre-existing degraded-response behavior

`lib/ai/sovereignRouter.ts` already contains member-facing degraded text for a no-service condition.

R2D records its existence but does not rewrite, remove, approve, or integrate it into D1/D2.

Standing:

> The D1/D2 governed disclosure architecture is not wired. Separate pre-existing degraded-response behavior exists.

## 12. Future implementation locus

Any later live implementation must establish serving truth at or before the point where routing intent is still known and actual service outcome is available.

Preferred architectural direction:

```text
router/gateway
  knows intended route
  +
provider result / non-service outcome
  -> stamps LiveServingTruth once
  -> maiaService carries it
  -> /api/sovereign/app/maia/list propagates it
```

The live response route should carry the record, not reclassify it.

## 13. R2D non-authority

This design changes no:

- provider order;
- fallback behavior;
- model selection;
- `ProviderMeta`;
- `ServingIdentity`;
- D1/D2 wiring;
- member-facing copy;
- UI;
- voice;
- production behavior.

## 14. Completion standing

```text
Authoritative live route
  app/api/sovereign/app/maia/list/route.ts

Retired routes
  app/api/oracle/conversation/route.ts
  app/api/sovereign/app/maia/route.ts

Live provider gateway
  lib/ai/modelService.ts

Existing two-provider law
  PRESERVE

Proposed generalized live contract
  SUCCESSOR RECORD + NARROW LEGACY ADAPTER

Non-model degradation
  REPRESENTABLE AS serviceState=degraded_non_model

DEEP unresolved provider
  PRESERVED AS serviceState=unresolved

Routing behavior changes
  NONE

Member-facing behavior changes
  NONE

D1/D2 wiring
  NONE

Production
  UNTOUCHED
```
