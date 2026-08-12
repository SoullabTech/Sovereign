> **STATUS: `DESIGNED / NOT YET PROVEN BY IMPLEMENTATION`** — founder ruling 2026-08-12.
>
> Implementation is **authorized but paused** pending a controlled maintenance window
> (Docker management recovery → fresh verified backup → live-edge verification).
> T3 is a hard falsification gate: any unexplained prompt delta stops the work.
>
> **Program ID provenance:** `SECREM-001` was assigned by the executing unit, not by
> founder designation. Recorded here under the demonstrated
> `docs/architecture/governance/<program-id>/` convention so the design does not remain
> uncustodied. If a different ID or location is ruled, this is a one-file move.
>
> Deployment precondition unchanged: `LIVE_EDGE_UNRESOLVED`. Nothing here may be read as
> a claim that the production exposure is closed.

---

# SECREM-001 — Security Remediation Design (DESIGN ONLY / NOT AUTHORIZED)

Cold executor, 2026-08-12. **No file was modified. No implementation. No runtime witness. No exploit constructed.**

## 0. Referent binding

- Canonical ref resolved fresh: `origin/clean-main-no-secrets` = `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (OBSERVED)
- Working tree branch: `feature/labtools-redesign` (non-canonical, dirty) — **never read for source identity**
- All reads via `git show <SHA>:<path>` / `git grep <pat> <SHA>`
- Blob identities re-derived at this SHA (OBSERVED, all match admitted evidence):
  - `lib/sovereign/maiaVoice.ts` → `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c`
  - `lib/consciousness/conversationContext.ts` → `ac6c116891c43773ca4255b60be5be061e897fd0`
  - `lib/sovereign/maiaService.ts` → `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1`

Convention: **OBSERVED** = read at canonical SHA this session. **INFERRED** = reasoned. **RECOMMENDATION** = design claim, not finding.

---

## 1. Re-derivation of the load-bearing facts

Only what my design rests on. CMC-001 not reopened.

**F1 (OBSERVED).** Guard present at exactly two sites, byte-identical predicate:
- `lib/sovereign/maiaVoice.ts:543` in `buildMaiaWisePrompt` (FAST/CORE primary + CORE repair)
- `lib/sovereign/maiaVoice.ts:963` in `buildMaiaComprehensivePrompt` (DEEP repair)

Predicate: `maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50`.

**F2 (OBSERVED).** Both branches `return` a literal prompt string interpolating `maiaPaiConfig.depthGuidance` (`:551`, `:1011`) and both return **before** the canonical assembly path. `appendAllContextAddenda` is reached only at `:913` (wise) and `:1045` (comprehensive) — downstream of both returns. Suppression of all addenda is therefore structural, not incidental.

**F3 (OBSERVED).** Exact branch spans, for scoping the diff:
- FAST/CORE: `maiaVoice.ts:542–568` (comment 542, `if` 543, closing `}` 568)
- DEEP: `maiaVoice.ts:962–1033` (comment 962, `if` 963, closing `}` 1033)

**F4 (OBSERVED).** `getDepthConfig` (`conversationContext.ts:74`) returns `maxTokens` ∈ {200,400,800} adaptive, {100,200,300} classic, plus a `default` case with `depthGuidance: ''` (line 124). Minimum across all branches is **100**. No server value satisfies `<= 50`. Unit 9 re-derived and confirmed.

**F5 (OBSERVED — the decisive new fact).** `maiaPaiConfig` / `context.conversationContext` has **no other consumer anywhere in the repository**. A repo-wide grep at canonical for `depthConfig|depthGuidance` and for every declared sub-field of `MaiaContext.conversationContext` yields:
- `depthConfig` read: only `maiaVoice.ts:539`, `:959` (both feeding the guard)
- `depth` read: only `maiaVoice.ts:540`, `:960` (both feeding the guard)
- `throughline`, `stakes`, `trustLevel`, `messageCount`, `contextPrompt`: **zero readers** repo-wide
- `depthConfig.maxTokens`: **zero readers in `maiaService.ts`** — it does *not* cap generation anywhere

**INFERRED from F4+F5:** the guard branch is unreachable from every server-side producer, and its removal cannot change any behavior reachable from server-produced values. The branch is reachable *only* by client-supplied input. It has **no legitimate server-side purpose** — not "a purpose we should preserve carefully", but no purpose at all.

**F6 (OBSERVED).** Producers of `meta.conversationContext`:
- `lib/consciousness/maiaOrchestrator.ts:515–523` — the **only** legitimate server producer; sets `depthConfig: depthConfig` from `getDepthConfig('adaptive')` (min 200), nested inside the `meta` of its `getMaiaResponse({...})` call at `:480`.
- Both in-scope routes, via `...meta` spread (`route.ts:292`, `list/route.ts:1211`) — pure client passthrough, no validation.

**F7 (OBSERVED).** `meta.conversationContext` → `MaiaContext.conversationContext` conversion happens at **four** sites, all `as any`:
- `lib/sovereign/maiaService.ts:1540` (CORE primary)
- `lib/sovereign/maiaService.ts:2180` (DEEP repair)
- `lib/learning/enhanced-maia-service.ts:294` and `:369` (separate service, own `buildMaiaWisePrompt` call at `:297`)

**F8 (OBSERVED).** `getMaiaResponse` callers: `app/api/sovereign/app/maia/route.ts:279` and `:424`; `app/api/sovereign/app/maia/list/route.ts:1184`; `lib/consciousness/maiaOrchestrator.ts:480`, `:1027`, `:1160`. Additional independent reachers of `buildMaiaWisePrompt`: `lib/learning/enhanced-maia-service.ts:297`, `lib/learning/learning-orchestrator.ts:226`.

**F9 (OBSERVED).** No client in `components/`, `app/**.tsx`, or hooks sends `conversationContext` in a request body. The two hits (`TransformationalExperience.tsx:223`, `BookChat.tsx:94`) are unrelated local string variables, not request fields.

**F10 (OBSERVED).** No zod / schema validation exists on either in-scope route. The routes do already carry a meta-hygiene *precedent*: server-built addenda are spread **after** `...meta` specifically so "server-built addenda cannot be overridden by stale client-supplied meta" (`route.ts:293–294`, `list/route.ts:1212–1213`). `conversationContext` is not among the fields so protected.

**F11 (OBSERVED).** An in-repo validation precedent exists and is the right shape: `lib/maia/presence/place.ts:109 validatePlaceContext(raw: unknown)` — "strict allowlist of fields; everything else is dropped. Never throws."

**F12 (OBSERVED — continuity constraint check).** The Socratic validator entry points are `validateAndRepairResponse(...)` at `maiaService.ts:1738` (CORE) and `:2158` (DEEP). The DEEP regeneration closure at `:2165–2230` constructs `repairedContext` and calls `buildMaiaComprehensivePrompt` at `:2230`; that function reaches `appendAllContextAddenda` at `maiaVoice.ts:1045`. **The guard at `:963` is the thing that intercepts this closure before it can deliver continuity.**

**INFERRED (constraint satisfied):** removing the guard does not touch the validator or the regeneration mechanism at all — it removes an early-return that *blocks* them. The repair strictly restores the continuity path rather than altering it. **No stop condition is triggered.** The founder-escalation clause does not fire.

---

## 2. THE SEVEN RETURNS

### 2.1 The exact trust boundary

**RECOMMENDATION.** The boundary that *should* reject or normalize is **not** the HTTP route. It is the **`MaiaContext` construction sites** — the four `(meta as any).conversationContext as any` assignments at F7. That is the precise instant where a field with no provenance stops being "an arbitrary key on an untyped `meta` bag" and becomes a **typed field of the context object that prompt assembly treats as server-authored**. Untrusted becomes trusted at the cast, not at the parse.

Naming it as the route boundary is the tempting error. The route boundary is where the data *enters*; the cast is where it *acquires authority*. Two of the four cast sites are not on either in-scope route's file at all.

**But — the operative recommendation:** for *this* defect, the correct move is not to police that boundary. It is to **remove the authority the boundary confers**. Nothing on the far side of the cast reads the field except an unreachable branch (F5). Delete the branch and the boundary becomes an inert data channel with no consumers — a boundary that cannot be crossed because there is nothing on the other side.

### 2.2 The smallest code surface

**Primary (the whole security fix):** one file, two functions.

| File (canonical `52a3b92`) | Function | Change |
|---|---|---|
| `lib/sovereign/maiaVoice.ts` | `buildMaiaWisePrompt` | delete lines **542–568** (the guard block) |
| `lib/sovereign/maiaVoice.ts` | `buildMaiaComprehensivePrompt` | delete lines **962–1033** (the guard block) |

That is the entire remediation. Both functions then fall through to their existing canonical assembly (`:913` / `:1045`) unconditionally.

**Optional hygiene, SEPARATE commit (RECOMMENDATION: yes, but not in the security commit):**

| File | Change |
|---|---|
| `lib/sovereign/maiaVoice.ts:46–59` | remove the now-unread `conversationContext?: {...}` field from `MaiaContext` |
| `lib/sovereign/maiaService.ts:1540`, `:2180` | remove the two `as any` assignments |
| `lib/learning/enhanced-maia-service.ts:294`, `:369` | remove the two assignments |
| `lib/consciousness/maiaOrchestrator.ts:515–523` | remove the now-consumerless producer block |

**INFERRED:** the compiler proves this hygiene pass safe — after F5, removing the field surfaces every remaining reference as a type error, and there are none but the assignment sites listed. Keeping it in a separate commit means the security fix is reviewable in isolation and revertable without disturbing four other files.

**Explicitly NOT in the surface:** no route file, no schema library, no Caddy config, no validator, no regeneration closure.

### 2.3 Which layer — and is defence in depth warranted?

**RECOMMENDATION: one layer only — prompt assembly. Defence in depth here is scope creep.**

Reasoning:

- **Request validation (route layer): reject.** A route fix protects exactly two of six `getMaiaResponse` call sites (F8) and none of the two independent `buildMaiaWisePrompt` reachers in `lib/learning/` (F7, F8). It would leave the vulnerable code standing and defend it partially — the worst combination, because it creates the appearance of closure. It also requires choosing a schema library the routes do not currently use (F10).
- **Service normalization: reject.** Would require the same clamp at four cast sites (F7), each independently maintainable and independently forgettable. It normalizes a value that nothing consumes.
- **Prompt assembly: accept.** Two edits in one file, and the defect ceases to exist rather than being filtered. `appendAllContextAddenda` becomes unconditional on both paths.

Defence in depth is warranted when the primary control can fail open or when the dangerous capability must remain available for a legitimate case. Neither holds: after the deletion there is **no code path that reads client `depthConfig` at all**, and F4+F5 establish there is no legitimate case to preserve. Adding validation on top of removal would be validating a field with zero readers — cost with no marginal risk reduction, plus a new maintenance surface that will drift.

**The one exception I do recommend (cheap, static, not runtime):** add a CI assertion in `scripts/ci/` (the existing `maia-route-guard.test.ts` pattern) that fails if `maiaVoice.ts` ever again reads a `context.conversationContext.*` sub-field, or more generally if a `depthGuidance`-shaped client value is interpolated into a returned prompt literal. This is regression prevention, not a second runtime control — it costs nothing at request time and prevents silent reintroduction, which is the real residual risk once the field is gone from the type.

### 2.4 Required regression tests

**Must be proven still works** (the harder half, and the one the constraint demands):

- **T1 — DEEP failure-triggered regeneration still delivers continuity.** Drive `validateAndRepairResponse` (`maiaService.ts:2158`) to a failing validation so the closure at `:2165` runs; assert `buildMaiaComprehensivePrompt`'s output contains the addenda emitted by `appendAllContextAddenda` (`maiaVoice.ts:1045`). **This is the single most important test in the set** — it is the sole continuity path on DEEP (founder constraint) and the path the guard was intercepting.
- **T2 — CORE regeneration path.** Same for `maiaService.ts:1738`/`:1747`.
- **T3 — Opening-turn behavior is unchanged for real traffic.** With a server-produced `depthConfig` (`maxTokens: 200`, adaptive/opening, per F4), assert the prompt produced before and after the change is **identical**. This is the direct empirical test of the F4+F5 unreachability inference; if it fails, the inference is wrong and the design must be revisited.
- **T4 — Addenda channel intact.** Extend `lib/sovereign/__tests__/platformKnowledgeWiring.test.ts` (already exercises `appendAllContextAddenda`) to cover an opening-depth context, i.e. the exact case the guard used to short-circuit.
- **T5 — Orchestrator path unaffected.** `maiaOrchestrator.ts:480` still produces a well-formed response with its `conversationContext` block present in `meta` (pre-hygiene) or absent (post-hygiene).
- **T6 — The two in-scope routes' happy paths** unchanged end to end.

**Must be proven blocked:**

- **T7 — Client-supplied `conversationContext.depthConfig` acquires no prompt authority.** Pass a `meta.conversationContext` with `depth: 'opening'` and a low `maxTokens` through `getMaiaResponse`; assert (a) the returned system prompt contains **no** substring originating from the supplied `depthGuidance`, and (b) `appendAllContextAddenda`'s output **is** present. Assert on absence of *influence*, using an inert marker string — **not** an exploit payload, and not a demonstration of the pre-fix behavior. This test must be written to pass post-fix and is not to be run against the vulnerable build.
- **T8 — Structural/CI assertion** per §2.3: no `context.conversationContext.*` read reappears in `maiaVoice.ts`.

**INFERRED:** T3 and T7 together are the completeness argument. T3 says nothing legitimate changed; T7 says nothing illegitimate survives.

### 2.5 Blast radius and affected callers

Everything reaching the two edited functions (all OBSERVED at canonical):

**Direct callers of `buildMaiaWisePrompt`:** `maiaService.ts:1592`, `maiaService.ts:1747`, `enhanced-maia-service.ts:297`, `learning-orchestrator.ts:226`.
**Direct callers of `buildMaiaComprehensivePrompt`:** `maiaService.ts:2230`, plus the import at `enhanced-maia-service.ts:20`.
**Upstream of those:** `getMaiaResponse` (`maiaService.ts:2379`) called from `maia/route.ts:279`, `:424`; `maia/list/route.ts:1184`; `maiaOrchestrator.ts:480`, `:1027`, `:1160`. Route registry: `lib/maia/maiaRuntimeContext.ts` (records `maia/route.ts` as the dormant predecessor to `/list`, superseded 2026-05-23, still calling `getMaiaResponse`).
**Tests touching the surface:** `lib/sovereign/__tests__/platformKnowledgeWiring.test.ts`, `scripts/ci/maia-route-guard.test.ts`, `__tests__/turn-write-idempotency.test.ts`, `tests/constitutional/refusal-registry/refusal-14-*.ts`, `refusal-21-*.ts`.

**RECOMMENDATION on radius:** the *edit* radius is one file; the *behavioral* radius is every MAIA turn on every tier. That sounds large and is in fact the point — but per F4+F5, the behavioral delta on server-produced input is provably **nil**, because the deleted code was unreachable from every server producer. The only observable change is on requests that were exploiting the field. INFERRED, and T3 is precisely the test that converts this inference into evidence before deploy.

**Legitimate clients affected (§ the founder's question):** none found (F9). No client sends the field. **Caveat, and I flag it as a genuine limit:** this is a static repo search of canonical. It cannot see a third-party integrator, an unversioned mobile build, or a cached bundle. RECOMMENDATION: before the hygiene commit (not needed for the primary fix), add one release of request-level telemetry counting inbound bodies carrying `conversationContext`, and confirm zero. The primary fix does not need this — dropping the field's *effect* is safe even if a client sends it, since the effect was never legitimate.

### 2.6 Explicit non-goals

This repair must **not** become:

1. **A refactor of the addenda channel.** `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.C (the DEEP-primary `consciousnessOrchestrator` path being unwired) is adjacent, visible in comments at `maiaService.ts:2210–2221`, and tempting. It is out of scope.
2. **A cleanup of the Socratic validator or the regeneration mechanism.** Founder constraint, and independently correct: on DEEP that closure is currently MAIA's only continuity delivery. Touch nothing at `maiaService.ts:1738` or `:2158`.
3. **A general `meta` validation framework.** The untyped `meta` bag with ~30 `(meta as any)` reads is a real architectural debt and a legitimate future unit. Fixing it here would multiply the diff by an order of magnitude and bury the security change.
4. **Work on the other three referred defects** (onboarding 410 fall-through, response-cache cross-context reuse, voice/output divergence). Out of scope.
5. **Removal or alteration of the MAIA-PAI depth mechanism as a concept.** `getDepthConfig` and the orchestrator's depth tracking stay. Only the unreachable prompt-override branch goes.
6. **A behavioral change to opening-turn tone.** If T3 shows any prompt delta on server-produced input, that is a signal the design is wrong — not a change to be accepted and normalized.
7. **A re-opening of CMC-001.** The static map is closed.

### 2.7 Deployment precondition

**RECOMMENDATION: treat this as an infrastructure dependency, separate from and blocking the design's deployment — not as part of the design.**

The design rests on one unverified environmental assumption: **that the deployed edge is the in-repository Caddy configuration, forwarding request bodies unmodified.** CMC-001 established the in-repo Caddy behavior (admitted); it did not establish that the running production edge is that configuration. If production terminates elsewhere (a CDN, a managed proxy, an out-of-repo Caddyfile), then the map from "canonical source" to "what the service receives" is unproven, and a source-level fix could be complete while the deployed path differs.

Precondition, to be discharged by whoever owns infrastructure, **not** by this unit and **not** by exercising the defect:

- **P1.** Bind the deployed edge to a specific configuration artifact — config hash or deployment manifest — and confirm it corresponds to the in-repo Caddy config at a named SHA. Document, do not probe.
- **P2.** Confirm no intermediary injects, rewrites, or merges JSON request bodies on the two in-scope routes.
- **P3.** Confirm the deployed application build descends from the canonical lineage that receives the fix — remote ref + SHA, per canonical-ref-binding discipline. A fix on `clean-main-no-secrets` protects production only if production is built from it.
- **P4 (production-safe substitute for any live-edge exercise).** Discharge P1–P3 by **configuration inspection and deployment provenance**, never by sending a crafted request to production. No exploit construction is authorized by this unit, and none is required: the source-level proof (F1–F5) plus T3/T7 in CI is sufficient evidence of the code fix. The edge question is a question about *which code is running*, and that is answered by provenance, not by traffic.

**INFERRED:** P1–P3 gate *deployment confidence*, not the *correctness of the design*. The design is correct at canonical regardless of the edge. If P1–P3 cannot be discharged, the fix should still ship — it strictly reduces attack surface — but the claim "this defect is closed in production" may not be made until they are.

---

## 3. Single recommended option

### OPTION A — Delete both guard branches. Nothing else in the security commit.

`lib/sovereign/maiaVoice.ts`, lines 542–568 and 962–1033 removed. Both functions fall through to their existing canonical assembly path unconditionally.

Followed by, as a **separate** commit once T1–T8 are green: removal of the now-dead `MaiaContext.conversationContext` field and its four assignment sites and one producer (§2.2), plus the CI assertion (§2.3).

### Rationale

1. **It is the only option that makes the defect cease to exist rather than be filtered.** Validation leaves a dangerous consumer standing behind a guard that must stay correct forever, at four independent cast sites, across at least two service modules. Deletion removes the consumer. There is nothing left to guard.
2. **It is provably behavior-preserving on legitimate traffic.** F4 (server minimum 100) and F5 (zero other consumers) jointly establish the deleted code is unreachable from every server-side producer. T3 converts that from inference to evidence before deploy.
3. **It is the smallest surface that covers every caller.** Two hunks in one file cover all six `getMaiaResponse` entry points *and* the two independent `lib/learning/` reachers. No route-level design achieves that without touching four or more files.
4. **It strictly improves continuity rather than risking it.** The guard's harm is displacing `appendAllContextAddenda`. Removing it restores addenda on the DEEP repair path — the founder's protected path — without touching the validator or the regeneration closure. The hard constraint is satisfied by construction, not by careful avoidance.
5. **Normalize-vs-reject is moot, and that is the strongest signal the design is right.** Both normalization and rejection presuppose the field is worth keeping. F5 says it is worth nothing: no reader, no effect, no purpose. Between two ways of sanitizing a field with zero consumers, the correct answer is neither. (Had a consumer existed, I would have recommended **reject-and-drop** on the `validatePlaceContext` model — allowlist, never throw, drop silently — because normalizing a token budget to a server minimum still lets the attacker choose *which* legitimate branch runs, whereas dropping restores full server authority. Recording this so the reasoning survives if F5 is ever falsified.)

### The strongest argument against Option A

**The unreachability proof is a whole-repository static argument, and a whole-repository static argument is exactly the kind that fails quietly at the edges.**

F5 depends on having enumerated *every* reader of `context.conversationContext` at canonical. That enumeration is grep-based. It would miss a dynamic access (`context[key]`, a spread into a differently-named local, a serialization that round-trips the object into another shape), or a consumer added on a branch not yet merged, or the `327 colliding basenames` hazard producing a second `maiaVoice.ts` whose lineage I did not trace. Validation degrades gracefully under such a miss — an unnoticed legitimate consumer receives a clamped value and keeps working. Deletion does not: an unnoticed consumer receives `undefined`, and the failure could be a silent loss of behavior rather than a loud crash.

Against that, honestly weighed: T3 is designed to catch precisely this, since any surviving legitimate reader would produce a prompt delta on server-produced input; the compiler catches every *static* reference the moment the field leaves the type in the hygiene commit; and the graceful degradation that validation offers is degradation toward *preserving a code path that F4 proves no server can legitimately reach anyway*. The counter-argument is real but it argues for **T3 being blocking**, not for changing the option. If T3 shows any delta, the design is falsified and must return to the founder.

A second, weaker objection: Option A leaves the untyped `meta` bag and its ~30 `as any` reads untouched, so the *class* of defect — client-controlled fields reaching prompt assembly without provenance — remains open. That is correct and deliberate (§2.6 non-goal 3). This unit closes one instance. The class deserves its own mandate.

---

## 4. Status

**DESIGNED / NOT AUTHORIZED / NOT IMPLEMENTED.**

No file in `/Users/soullab/MAIA-SOVEREIGN` was modified, created, or deleted. Repository access was read-only via `git show` / `git grep` / `git ls-tree` at `52a3b924b7cf52013c1c8b0d635359c2cad672fc`. No MAIA request was issued, no runtime observed, no payload constructed. Every item in §2 and §3 is a recommendation for founder ruling, not a finding and not an authorization.
