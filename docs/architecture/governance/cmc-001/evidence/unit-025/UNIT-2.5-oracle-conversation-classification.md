# CMC-001 Unit 2.5 — Unregistered Route Classification
## `app/api/oracle/conversation/route.ts`

**Mandate**: dbc4d5df3f0806403ee3d14aba4dd573b637dfb0 / blob `8374f1e942c8e4f8b41dab319eb75dabf609681b` — VERIFIED
**Canonical referent**: `origin/clean-main-no-secrets` = `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (fetched fresh 2026-08-12)
**Mode**: STATIC ONLY. No runtime witness. No repair. No registry change. No file modified.

---

## 1. ROUTE STATUS — §VII five fields

Subject blob: `461fdaa9c3980a05834625229a5cca390044c69f` — `app/api/oracle/conversation/route.ts` (3088 lines)

| Field | Value |
|---|---|
| `evidence_basis` | `STATIC_POSSIBLE` (refusal is statically decidable — first executable statement of POST) |
| `route_status` | `UNREGISTERED` — absent from `MAIA_ROUTE_REGISTRY`, `lib/maia/maiaRuntimeContext.ts` blob `4e84b2a204559fa6f2d97e8fece7f64ccba5633c` L60–102 (only 3 keys: `sovereign/app/maia/list`, `between/chat`, `sovereign/app/maia`) |
| `observed_status` | `NOT_OBSERVED` (no runtime authority in this unit) |
| `evidence_date` | 2026-08-12 |
| `referent_binding` | `origin/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc` |

### Classification: **CONSTITUTIONALLY REFUSED LANE** (`disabled`) — not dormant, not dead, not live

OBSERVED — route.ts L433–453:
```
export async function POST(request: NextRequest) {
  // LANE DISABLED — Sanctuary S2 (Kelly ruling K4, 2026-07-17).
  console.log('[ORACLE-LANE] refused — lane disabled (Sanctuary S2, ruling K4 2026-07-17)');
  return NextResponse.json({ error: 'This conversation lane is disabled.',
    reason: 'Legacy route retired pending Sanctuary-governed persistence (S2, 2026-07-17).',
    use: '/api/sovereign/app/maia' }, { status: 410 });
  // Unreachable below — retained for the S5 redesign decision (delete vs revive).
```
The 410 precedes any `request.json()`. Lines 454–3078 are statically unreachable from HTTP.

`export async function OPTIONS` (L3080–3088) still returns 200 with permissive CORS. OBSERVED. It is a preflight only; it carries no MAIA behaviour.

Corroborating authority (not the carrying surface): `tests/constitutional/refusal-registry/refusal-19-oracle-lane-disabled.ts` — Refusal **R19**, grade **A**, `enforcedBy: 'Hard 410 refusal as the first executable statement of POST'`; `evidence: 'Disabled 2026-07-17 (S2). Zero traffic in 60 days of agent_runs.origin_route / runtime_events.route_id.'` R19 explicitly states `passingDoesNotAuthorize`: that the writers are governed, or that the file should be kept — delete-vs-revive is an S5 decision.

`// @ts-nocheck` at L1 was NOT used as evidence of deadness.

---

## 2. ALL DISCOVERED CALLERS (canonical @ 52a3b924)

### A. Client-side fetch call sites — member-reachable (OBSERVED)
| Path:line | Form | Reaching page route |
|---|---|---|
| `components/onboarding/WeekZeroOnboarding.tsx:87` | `await fetch('/api/oracle/conversation', {POST})` | `app/maia/page.tsx` L26 import, L1653–1660 render, gated by `showWeekZeroOnboarding` set at L588 when `!localStorage['week0_onboarding_complete'] && name && name !== 'Friend'` |
| `components/masters/FieldMaiaCompanion.tsx:173` | `await fetch('/api/oracle/conversation', {POST})` | `app/fields/[field]/maia/page.tsx` |
| `app/partners/onboarding/prelude/page.tsx:556` | `<MaiaChat apiEndpoint="/api/oracle/conversation" ...>` | `/partners/onboarding/prelude` |
| `app/labtools/brain-trust/page.tsx:117` | `await fetch('/api/oracle/conversation')` | `/labtools/brain-trust` (internal) |
| `app/labtools/values-compass/page.tsx:209` | `await fetch('/api/oracle/conversation')` | `/labtools/values-compass` (internal) |
| `backups/ultimate-consciousness-system/20251211_080333/page.tsx:695` | `apiEndpoint="/api/oracle/conversation"` | backup dir — not routed |

`components/OracleConversation.tsx` defaults `apiEndpoint = '/api/between/chat'` (L624); it reaches oracle/conversation only when a parent passes the prop — i.e. the prelude page above. No `between/chat` expansion required.

### B. Scripts / tests / CI guards
`scripts/beta-smoke-test.sh:70`; `scripts/maia-simulations/runner.ts:102`; `scripts/test-use-frame-jotc.ts:106`; `scripts/test-archetypal-intelligence.js:47,110,162`; `test-ipp-integration.js:44`; `test-opus-axioms.ts:8`; `scripts/guards/ain-v2-integration-present.ts:26`; `scripts/ci/memory-canon-scrub-wiring.test.ts:6,35,40`; `tests/constitutional/refusal-registry/refusal-16-...ts:12,29`; `refusal-19-oracle-lane-disabled.ts:14`; `lib/maia/prompts/__tests__/memoryCanonGuard.test.ts:11,61`.

### C. Config / inventory / docs
`lib/maia/substrateMap.ts` (20 occurrences as `consumers`); `app/admin/platform-overview/page.tsx:41,125–136,331`; `playground/maia-platform-overview.html`; `typecheck-baseline.json:2184`; `artifacts/typehealth-*.json`; `artifacts/identifier-rename-log.json:747`; `app/api/debug/symbolic-telemetry/route.ts:28`; `.claude/commands/oracle-*.md`; numerous root/Community-Commons `.md`.

### D. Server-side callers
**NONE.** No `lib/**` or `app/api/**` module fetches this endpoint. `app/api/fields/[slug]/oracle/route.ts:4` only names `FieldMaiaCompanion` in a comment. `middleware.ts` contains no `/api/oracle` matcher entry.

---

## 3. DOES A MEMBER-FACING SURFACE REACH IT? — **YES**, and it fails silently

OBSERVED: three member-facing paths POST to the endpoint (§2.A rows 1–3). Since 2026-07-17 every such POST receives **HTTP 410 with a body containing only `error`/`reason`/`use`**.

Both discovered handlers swallow it with an `||` chain and present a hardcoded string **as MAIA**:
- `WeekZeroOnboarding.tsx:104` → `return data.response || data.message || 'Thank you for sharing. I\'m here to support your growth journey.'` (`response.json()` does not throw on 410; the `catch` never fires)
- `FieldMaiaCompanion.tsx:186–191` → `data.message || data.response || data.coreMessage || "I'm here. Take your time."`

INFERRED (static, high confidence): a first-time named member landing on `/maia` who triggers Week-0 onboarding receives canned non-MAIA text with no error surfaced. **This is a recorded defect, not repaired (§XIX).**

---

## 4. DOES IT INDEPENDENTLY INVOKE MAIA / MEMORY? — YES in code, NO from HTTP

OBSERVED — route.ts **does not call `getMaiaResponse()` or `buildMaiaRuntimeContext()`** (zero grep hits at the referent). It runs a wholly parallel stack: `MultiLLMProvider` (`lib/consciousness/LLMProvider`), `memoryPalaceOrchestrator.retrieveMemoryContext()` L902 / `.storeConversationMemory()` L1499 / `.generateMemoryContextPrompt()` L2787, `sessionMemoryService.storeSessionPattern()` L1467, `getRelationshipAnamnesis()` L932/L1543, `loadSpiralState()` L648 / `upsertSpiralState()` L1611, `logMaiaTurn()` L1323, `storeCMLayerSignal()` L2384, plus `enforceFieldSafety`, `spiralogic-core`, `opus-axioms`, `use-frames`, `conversational-keep`.

`lib/maia/substrateMap.ts` names it as `consumers` for **20 substrate entries vs 4 for `sovereign/app/maia/list`** — it remains the largest single declared consumer of the memory substrate inventory. All of it sits below the 410 and is unreachable from HTTP.

---

## 5. SUPERSEDED / DEAD / LEGACY / LIVE — none fit; name the class

**`REFUSED_LANE_WITH_LIVE_CALLERS`** (authority-map vocabulary: `disabled`).

- Not **dead**: it is deployed, imported by the Next.js app router, and actively invoked by member-facing clients.
- Not **dormant**: dormant = "no traffic expected"; here traffic is *actively refused* by a constitutional guard, and callers still exist.
- Not **legacy**: it does not point into `_backend`.
- Not **live**: it produces no MAIA turn.
- **Superseded** is true but insufficient — supersession alone does not describe the ruling, the 410, or the orphaned clients.

Distinguishing property: the *refusal* is live; the *lane* is not; the *callers* are.

---

## 6. THE CRUX — DOES THE REGISTRY CLAIM SURVIVE?

Claim under test (`lib/maia/maiaRuntimeContext.ts:66`): `'sovereign/app/maia/list' … description: 'Primary sovereign chat ingress — all production surfaces'`.

**Verdict: the claim SURVIVES under a narrower interpretation that is already written into the registry's own preamble; but the registry's supporting rationale is STALE, and the *authority map* it derives from is STALE.**

Three distinct surfaces, resolved per §III:

1. **`MAIA_ROUTE_REGISTRY` scope — STILL CORRECT, NOT INCOMPLETE.**
   OBSERVED, file docblock L1–24: the registry is the "required contract for **all `getMaiaResponse()` callers**"; it "Validates routeId against the canonical registry." `oracle/conversation` never calls `getMaiaResponse()`. Its absence is *in-scope-correct*, not an omission. Under the registry's actual scope, "all production surfaces" means **all production surfaces that reach MAIA through `getMaiaResponse()`** — and under that reading nothing at the referent contradicts it, because oracle/conversation reaches nothing at all.
   Caveat OBSERVED: `between/chat` is registered with `callsMaiaResponse: false` "for observability completeness," so the registry's membership rule is not strictly *caller-only* in practice. That inconsistency weakens the exclusion argument but does not falsify the ingress claim.

2. **The registry's *rationale comment* — STALE.** L61–63: "confirmed by frontend traffic audit — every production surface routes here", `registeredAt` 2026-05-23. At the referent this is false as a statement about *code*: three member-facing surfaces still POST to `/api/oracle/conversation`. It is defensible only as a statement about *successful MAIA turns*. Per §IV this is a `SURFACE_SUBSTITUTION` risk — a 2026-05-23 traffic audit was left standing as a present-tense code claim through a 2026-07-17 constitutional change. Registry-witnessed date must travel with it.

3. **`docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md` (blob `9ecf7447c6abc169a1e20cc2397c6515dbbc692d`) — STALE / CONTRADICTED.**
   L194–208 classifies `/api/oracle/conversation` as **`Status: dormant`**, `Traffic evidence: "a route the live UI no longer hits"`, `Allowed future edits: Preserve as reference … candidate for formal deprecation.`
   The map's **own Status Key (L~50)** already defines `disabled` = "Returns error code; intentionally closed." The route now returns 410. **`dormant` is the wrong status by the map's own vocabulary.** The map was created 2026-05-23; the disable landed 2026-07-17 and did not update it — a second instance of the map's own Divergence Pattern #5 ("people don't mark the old one when they move"), inverted.
   Per §III (route authority registry outranks filename interpretation) and §XIX (record, do not repair): **recorded as a defect. Not corrected.**

**Net:** the `/list` primary-ingress claim is not falsified by oracle/conversation's existence, because oracle/conversation cannot produce a MAIA turn. It IS falsified as a claim that no production surface *attempts* another ingress. The precise surviving statement is: *`/list` is the only route through which a production surface successfully reaches MAIA at this referent.*

---

## 7. EVIDENCE BASIS AND REFERENT — summary

Every claim above binds to `origin/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc`, read exclusively via `git show <SHA>:<path>` / `git ls-tree` / `git grep <pattern> <SHA>`. Named blobs: route `461fdaa9c3980a05834625229a5cca390044c69f`; registry `4e84b2a204559fa6f2d97e8fece7f64ccba5633c`; authority map `9ecf7447c6abc169a1e20cc2397c6515dbbc692d`. OBSERVED vs INFERRED marked inline. No runtime observation was taken; every `observed_status` is `NOT_OBSERVED`.

### Corrections to prior ADMITTED evidence
- **CORRECTED**: any prior record carrying `oracle/conversation` as `dormant`/`no traffic`/`~zero live traffic` (sourced from `CLAUDE.md:48`, `app/api/sovereign/app/maia/route.ts:36`, `app/api/sovereign/app/maia/list/route.ts:128`, `scripts/ci/memory-canon-scrub-wiring.test.ts:6`, `MAIA_ROUTE_AUTHORITY_MAP.md:198`). All predate the 2026-07-17 S2 disable. At the referent the correct status is `disabled` / refused-410, and the in-repo caller set is non-empty.
- **NOT CORRECTED**: `sovereign/app/maia/list` as canonical ingress — unaffected.

---

## 8. MUST CMC-001 TOPOLOGY EXPAND BEFORE UNIT 3? — **YES, narrowly**

Warranted expansions (each recorded, none executed):
1. **Add a `route_status` value or an explicit mapping for `disabled`/refused lanes.** §VII's four `route_status` values cannot express "registered nowhere, refused at the handler, still called by clients." `UNREGISTERED` is technically true and materially misleading. Unit 3 will hit this again on other 410'd lanes.
2. **Admit `app/maia/page.tsx` → `WeekZeroOnboarding` into the census surface set.** A member-facing MAIA-presenting surface that returns canned text on 410 is a continuity-relevant defect, and `/maia` is not currently traced.
3. **Separate "ingress claim" from "attempt claim" in §I.** The registry description conflates them; §XXVI's registry-vs-observed split does not cover it.

Not warranted: `between/chat` expansion (no direct call chain required — the prelude page passes the prop explicitly); contributor census of the 2600 unreachable lines; any MFR-001 material.

**No `RUNTIME_REACHABILITY_UNRESOLVED` stop is required.** Reachability was resolved statically in the affirmative direction: the endpoint IS reachable by URL and IS called by in-repo clients; what is statically decidable and dispositive is that every such call terminates at a 410 before body parse. Absence-of-caller reasoning was not used.
