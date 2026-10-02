# SERVING-IDENTITY / R2D — FALSIFIER MATRIX DESIGN

**Status:** DESIGN ONLY · NOT EXECUTED · NO RUNTIME MUTATION
**Contract design:** `docs/architecture/SERVING_IDENTITY_R2D_LIVE_CONTRACT_2026-09-21.md`

## 1. Matrix purpose

This matrix is designed to falsify proposed implementations of the future live serving-truth contract before any live provider mutation is authorized.

It tests three independent axes:

1. **truth preservation** — intended route, service state, and served target remain distinguishable;
2. **route authority** — future wiring reaches the authoritative live route;
3. **scope containment** — serving truth does not mutate routing or smuggle disclosure.

A conforming candidate must survive all falsifiers.

Each defeat candidate below is intentionally narrow so its named falsifier is discriminating rather than merely hostile.

## 2. Canonical fixtures

### FIX-A — primary cloud succeeds

```text
routingContract = primary
intended = anthropic / external
serviceState = served_model
served = anthropic / actual-model / external
```

### FIX-B — primary falls back to local

```text
routingContract = primary
intended = anthropic / external
serviceState = served_model
served = local_inference / actual-model / local
reason = anthropic_failed
```

### FIX-C — sovereign local succeeds

```text
routingContract = sovereign
intended = local domain
serviceState = served_model
served = local_inference / actual-model / local
```

### FIX-D — local_only non-model degradation

```text
routingContract = local_only
intended = local domain
serviceState = degraded_non_model
served = null
reason = all_providers_unavailable
```

### FIX-E — DEEP unresolved provider

```text
routingContract = deep_wrapper
intended = unresolved
serviceState = unresolved
served = null
reason = provider_not_threaded_in_deep_path
```

### FIX-F — intentional multi-engine

```text
routingContract = multi_engine
intended = explicit multi-engine route
serviceState = served_model
served = multi_engine / orchestration:<type> / witnessed-domain
```

## 3. Behavioral falsifiers

### R2D-F1 — served-only identity must die

**Law:** the live record must preserve route intent, not merely the answerer.

**Fixture pair:** FIX-B vs FIX-C.

Both may end in a local served result. The record must still distinguish:

- local because primary cloud failed; from
- local because local service was intended.

**Kill condition:** candidate output is identical after deleting the served model name or differs only by served-side fields.

---

### R2D-F2 — all local service equals fallback must die

**Law:** intentional sovereign/local-only local service is not fallback.

**Fixture:** FIX-C.

**Kill condition:** candidate labels FIX-C as fallback/degradation solely because a local provider served.

---

### R2D-F3 — all provider difference equals capability degradation must die

**Law:** provider difference is not a complete generalized live classification law.

**Fixtures:** FIX-B plus a separately modeled intentional special-provider substitution path.

**Kill condition:** candidate infers one generalized degradation class from `intendedProvider !== servedProvider` without retaining routing contract/service state.

This falsifier does not define the correct generalized divergence class; it proves the shortcut is insufficient.

---

### R2D-F4 — degraded non-model response impersonates model service must die

**Law:** no model served is structurally distinct from an unknown provider serving.

**Fixture:** FIX-D.

**Kill condition:** candidate produces:

```text
serviceState = served_model
served.provider = unknown
served.model = degraded
```

or any equivalent representation that claims a provider/model served.

---

### R2D-F5 — unknown DEEP provider guessed must die

**Law:** explicit source-level uncertainty remains uncertainty.

**Fixture:** FIX-E.

**Kill condition:** candidate supplies Anthropic, local, multi-engine, or any other provider/model despite `provider_not_threaded_in_deep_path`.

---

### R2D-F6 — route authority wrong must die

**Law:** live serving truth must reach the actual MAIA serving route.

**Required future source chain:**

```text
provider/router stamping locus
  -> lib/sovereign/maiaService.ts
  -> app/api/sovereign/app/maia/list/route.ts
```

**Kill condition:** candidate proves propagation only through either:

```text
app/api/oracle/conversation/route.ts
```

or:

```text
app/api/sovereign/app/maia/route.ts
```

without the live `/list` route carrying the record.

---

### R2D-F7 — downstream duplicate classification must die

**Law:** the response route carries serving truth; it does not invent a second classification authority.

**Kill condition:** `app/api/sovereign/app/maia/list/route.ts` compares providers/domains to create its own degradation/substitution taxonomy instead of carrying an upstream stamped record.

---

### R2D-F8 — disclosure smuggled into serving truth must die

**Law:** serving truth is distinct from disclosure obligation and expression.

**Kill condition:** live serving record contains or directly drives fields equivalent to:

```text
shouldDisclose
mustDisclose
required
memberMessage
banner
toast
voiceCopy
uiSeverity
```

R2D may carry facts only.

---

### R2D-F9 — routing behavior changes must die

**Law:** implementing serving truth is observational/structural, not routing policy.

**Kill condition:** candidate changes any of:

- primary provider order;
- sovereign/local_only fallback policy;
- local health gating;
- Moonshot selection;
- multi-engine selection;
- provider retry behavior;
- no-fallback billing/auth behavior.

A serving-truth implementation that changes which provider answers is outside the program.

## 4. Defeat candidates

| Candidate | Deliberate defect | Named falsifier | Isolation rule |
|---|---|---|---|
| DC-R2D-1 | drops intended/routing fields only on FIX-B | R2D-F1 | all other fixtures conform |
| DC-R2D-2 | marks FIX-C fallback solely for local service | R2D-F2 | only fallback label changes |
| DC-R2D-3 | reclassifies only a provider-different sentinel by inequality | R2D-F3 | no other field is changed |
| DC-R2D-4 | encodes FIX-D as `unknown/degraded` served model | R2D-F4 | FIX-E remains unresolved |
| DC-R2D-5 | guesses Anthropic only for FIX-E | R2D-F5 | no other fixture changes |
| DC-R2D-6 | wires the designed record to dormant routes only | R2D-F6 | contract representation otherwise conforming |
| DC-R2D-7 | adds a response-route classification function | R2D-F7 | upstream record otherwise conforming |
| DC-R2D-8 | adds `shouldDisclose` to the serving record | R2D-F8 | serving facts otherwise exact |
| DC-R2D-9 | swaps primary routing order while adding stamping | R2D-F9 | record shape otherwise conforming |

### Discrimination rule

A candidate that dies on an undeclared falsifier is an isolation defect in the matrix design and must be narrowed.

The matrix must never celebrate collateral kills as stronger evidence.

## 5. Structural guards for a future implementation

### R2D-G1 — live route authority

Verify that the future live record is reachable in:

`app/api/sovereign/app/maia/list/route.ts`.

### R2D-G2 — retired routes cannot satisfy authority

Verify that:

- `app/api/oracle/conversation/route.ts` remains a 410/disabled route; and
- `app/api/sovereign/app/maia/route.ts` remains marked dormant/superseded;

therefore their carrying the record cannot satisfy R2D-G1.

### R2D-G3 — intent stamped upstream

Verify route intent is recorded where the routing contract is known, rather than reconstructed in `/list` from environment configuration after service.

### R2D-G4 — no response-route reclassification

Verify `/list` does not contain a new serving-divergence classifier.

### R2D-G5 — no disclosure fields

Verify the live serving-truth contract contains no D1/D2/member-facing disclosure decision or presentation fields.

### R2D-G6 — no routing mutation

Compare provider/routing control flow before and after the future implementation. The only permitted changes are metadata construction/carrying.

### R2D-G7 — legacy law unchanged

Verify `lib/consciousness/servingIdentity.ts` remains byte/semantic unchanged unless a separately authorized act explicitly changes it.

### R2D-G8 — non-service representable

Verify a no-model result has `serviceState=degraded_non_model` and no served provider/model.

### R2D-G9 — unresolved representable

Verify source-declared unknown provider identity remains `serviceState=unresolved`, not guessed.

## 6. Lethality by construction

Each required wrong design has a corresponding defeat candidate whose only intentional mutation targets one named law.

A future executable matrix is lethal if all nine candidates die on their named falsifier and the conforming implementation survives all nine.

## 7. Discrimination by construction

The matrix is discriminating only if:

- every candidate dies on its named falsifier;
- no candidate has undeclared collateral kills;
- structural guards test different boundaries rather than restating one condition;
- route authority is independently tested from record shape;
- routing non-mutation is independently tested from serving truth.

## 8. Required future executable result shape

When implementation is separately authorized, the executable matrix should report at minimum:

```text
CONFORMING
  passes all 9 falsifiers

DC-R2D-1 ... killed R2D-F1
DC-R2D-2 ... killed R2D-F2
DC-R2D-3 ... killed R2D-F3
DC-R2D-4 ... killed R2D-F4
DC-R2D-5 ... killed R2D-F5
DC-R2D-6 ... killed R2D-F6
DC-R2D-7 ... killed R2D-F7
DC-R2D-8 ... killed R2D-F8
DC-R2D-9 ... killed R2D-F9

route-authority guards
  live route reached
  retired routes rejected as authority

lethal=true
discriminating=true
```

No such executable implementation result is claimed by R2D design.

## 9. R2D design verdict

```text
Falsifier matrix
  lethal by construction        YES
  discriminating by construction YES
  route-authority guard          YES

Executable implementation
  NOT AUTHORIZED
  NOT RUN

Routing behavior changes
  NONE

Member-facing behavior changes
  NONE

D1/D2 wiring
  NONE

Production
  UNTOUCHED
```
