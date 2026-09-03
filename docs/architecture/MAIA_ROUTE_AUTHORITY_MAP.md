# MAIA Route Authority Map

**Created**: 2026-05-23  
**Thread**: De-frag / runtime restoration  
**Status**: Control surface — update before modifying any MAIA route  
**Purpose**: Prevent "fixed the wrong route" recurrence. Every route answers six questions before any edit touches it.

---

## ⚠️ Critical Warning — Typecheck Is Not Route Safety

If a route file starts with `// @ts-nocheck`, TypeScript will not check its imports, types, or call sites. A route file under `@ts-nocheck` can:

- pass `npm run typecheck` cleanly
- pass `next build` cleanly
- deploy without warning
- **fail at runtime** when the module loader tries to resolve a non-existent import

**This is not theoretical.** On 2026-05-23, the canonical route `/api/sovereign/app/maia/list` contained an unresolved import — `import { buildMemberSpiralOrientation, type SpiralOrientationResult } from '@/lib/maia/spiralOrientation'` — pointing at a file that did not exist. The actual implementation was at `lib/orientation/spiralOrientation.ts`, and exported `DomainOrientation[]`, not `SpiralOrientationResult`. The route file had `@ts-nocheck` at line 1. **Typecheck passed.** The runtime would have failed on the next live MAIA turn when the module loader tried to resolve the missing path. The failure was caught only because the de-frag thread re-read the route on a separate diagnostic pass.

The import is now commented out (commit `5eabe290c`) and the canonical route is clean — verified in production logs the same day. **The warning stands because the mechanism that allowed the broken import to ship undetected is still present on every `@ts-nocheck` route in the codebase.** This bug is fixed; the pattern that hid it is not.

**Implications for the authority protocol:**

1. **Any route bearing live traffic should not have `@ts-nocheck`.** It is a prototype-era artifact that becomes a load-bearing risk once a route enters Tier 1 or Tier 2.
2. **Removing `@ts-nocheck` from canonical routes is on the de-frag sequence (step 9).** Until then, every import added to a `@ts-nocheck` route must be manually verified to resolve against an actual file.
3. **Deploy verification should include a runtime import-resolution check, not just typecheck.** `docker compose up --build` catches some missing modules at boot, but only if the affected route is invoked during the build's preflight.
4. **`@ts-nocheck` is not a neutral comment.** Treat it as an opt-out from the language's safety guarantees. Per-route `@ts-nocheck` status is flagged in each route's table below.

---

## Status Key

| Status | Meaning |
|--------|---------|
| `canonical-live` | The authoritative production entry point. All continuity wiring must be here. |
| `live-secondary` | Receiving production traffic; may have different wiring than canonical. Needs audit. |
| `reference-live` | Live and functional but not the sovereign chat path. May diverge safely. |
| `dormant` | Exists, compiles, but UI no longer routes to it. No traffic expected. |
| `legacy` | Active but bypassed; points into the old `_backend` architecture. |
| `disabled` | Returns error code; intentionally closed. |
| `reference` | Supporting route (session, voice, data retrieval). Not a chat ingress. |
| `scaffold` | Pre-wired structure with unimplemented integration points. |
| `deprecated` | Should be removed; retained only to avoid 404 breakage. |

## Thread Ownership Key

| Thread | Owns |
|--------|------|
| `de-frag` | Live path integrity, memoryHealth, atoms wiring, provider routing, fallback copy |
| `orientation` | Spiral Orientation / Missions design — read-only until spine is verified |
| `legacy-ref` | Legacy / reference routes — no active work; monitor only |
| `divination` | Oracle divination routes — independent of memory stack |

---

## TIER 1 — Canonical Live (Sovereign Chat Path)

### `/api/sovereign/app/maia/list`
| Field | Value |
|-------|-------|
| **File** | `app/api/sovereign/app/maia/list/route.ts` |
| **Status** | `canonical-live` |
| **Lines** | ~1143 |
| **Traffic evidence** | Primary route the frontend hits for all MAIA chat turns |
| **Calls getMaiaResponse()** | ✅ YES — `lib/sovereign/maiaService` |
| **memoryHealth wired** | ✅ YES — Cut 1 (Layer 15) |
| **memoryAtomsLoader wired** | ✅ YES — Cut 1 (Layer 5) |
| **Provider routing** | Indirect via `getMaiaResponse()` → `modelService.ts` → `MAIA_TEXT_PROVIDER` env var |
| **Orientation wiring** | ⏸ PARKED — import + call site + responseData field commented out (Cut 2 pending Path A/B decision) |
| **@ts-nocheck** | ⚠️ YES — prototype-era artifact on a now-load-bearing route. Masks runtime import failures from typecheck. |
| **Owner thread** | `de-frag` |
| **Allowed future edits** | Only via de-frag thread. No orientation wiring until Cut 2 authorized. |
| **Notes** | "list" in filename is misleading — this is the chat ingress, not a list endpoint. ROUTING INVARIANT block at top. `force-dynamic`. |

---

## TIER 2 — Live Secondary (Production Traffic, Different Wiring)

### `/api/between/chat`
| Field | Value |
|-------|-------|
| **File** | `app/api/between/chat/route.ts` |
| **Status** | `live-secondary` |
| **Lines** | ~2669 |
| **Traffic evidence** | Live; cited as reference implementation in sovereign route comments |
| **Calls getMaiaResponse()** | ❌ NO (uses `generateMaiaTurn` / `generateSimpleMaiaResponse` via `maiaOrchestrator`) |
| **memoryHealth wired** | ✅ YES |
| **memoryAtomsLoader wired** | ✅ YES |
| **Provider routing** | Via `maiaOrchestrator` chain (not direct modelService) |
| **Orientation wiring** | ❌ NO |
| **@ts-nocheck** | NO |
| **Owner thread** | `de-frag` |
| **Allowed future edits** | Observe for divergence from sovereign/list. No orientation wiring yet. |
| **Notes** | ROUTING INVARIANT block at top. `force-dynamic`. Reference implementation for the sovereign path. |

---

## TIER 3 — Reference Live (Supporting Routes, Not Chat Ingress)

### `/api/sovereign/app/maia/voice`
| Field | Value |
|-------|-------|
| **File** | `app/api/sovereign/app/maia/voice/route.ts` |
| **Status** | `reference` |
| **Lines** | ~52 |
| **Calls getMaiaResponse()** | ❌ NO |
| **memoryHealth wired** | ❌ NO (not applicable — TTS only) |
| **memoryAtomsLoader wired** | ❌ NO |
| **Orientation wiring** | ❌ NO |
| **Owner thread** | `de-frag` (monitor only) |
| **Notes** | TTS-only. Imports `synthesizeMaiaVoice`. No memory surface. Safe from orientation wiring. |

### `/api/sovereign/session/finalize`
| Field | Value |
|-------|-------|
| **File** | `app/api/sovereign/session/finalize/route.ts` |
| **Status** | `reference` |
| **Lines** | ~48 |
| **Calls getMaiaResponse()** | ❌ NO |
| **memoryHealth wired** | ❌ NO |
| **Owner thread** | `de-frag` (monitor only) |
| **Notes** | Sanctuary purge / continuity summary pipeline. Canonically important but not a chat ingress. |

### `/api/sovereign/session/summaries`
| Field | Value |
|-------|-------|
| **File** | `app/api/sovereign/session/summaries/route.ts` |
| **Status** | `reference` |
| **Lines** | ~40 |
| **Calls getMaiaResponse()** | ❌ NO |
| **memoryHealth wired** | ❌ NO |
| **Owner thread** | `de-frag` (monitor only) |
| **Notes** | CORE/DEEP context priming. Sanctuary sessions excluded by design (summary = NULL). |

### `/api/maia/relational-navigation`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/relational-navigation/route.ts` |
| **Status** | `reference-live` |
| **Lines** | ~306 |
| **Calls getMaiaResponse()** | ❌ NO |
| **memoryHealth wired** | ❌ NO |
| **Owner thread** | `legacy-ref` |
| **Notes** | Canon-anchored. Explicit negative-form invariants in docblock. References THE_CLEARING, SPIRAL_CONTINUITY_ENGINE, MAIA_SOVEREIGNTY_INVARIANTS. Field Lab experiment. Leave unchanged. |

### `/api/maia/field`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/field/route.ts` |
| **Status** | `reference-live` |
| **Lines** | ~201 |
| **Calls getMaiaResponse()** | ❌ NO |
| **Owner thread** | `legacy-ref` |
| **Notes** | MCP-exposed (`get_member_field`). Direct DB queries. No orchestrator. Safe from memory/orientation wiring. |

### `/api/maia/trajectory/focus`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/trajectory/focus/route.ts` |
| **Status** | `reference` |
| **Lines** | ~97 |
| **Owner thread** | `orientation` (design reference only) |
| **Notes** | CRUD for `trajectory_focus` table — the domain intention substrate used by Spiral Orientation design. Do not modify until orientation thread is authorized. |

### `/api/maia/trajectory/state`, `/api/maia/trajectory/state-history`, `/api/maia/trajectory/threshold`, `/api/maia/trajectory/thresholds`
| Field | Value |
|-------|-------|
| **Status** | `reference` |
| **Owner thread** | `orientation` (design reference only) |
| **Notes** | Trajectory and threshold substrate. Read-only reference for orientation design work. |

---

## TIER 4 — Dormant (Exists, Compiles, No Live Traffic)

### `/api/sovereign/app/maia`
| Field | Value |
|-------|-------|
| **File** | `app/api/sovereign/app/maia/route.ts` |
| **Status** | **`retired`** — STRUCTURALLY RETIRED 2026-09-03 (CMT-01 Step 3; previously `dormant` since 2026-05-23). Answers **HTTP 410** with `X-Recommended-Endpoint: /api/sovereign/app/maia/list`. |
| **Lines** | ~70 (410 boundary only) |
| **Traffic evidence** | 2026-05-23 48h audit: 0 hits. **2026-09-03 30-day witness** (`docker logs --since 720h maia-caddy`, exact path, excluding `/list`): **zero matching entries in retained logs** (container logs are capped at 10m × 3; the 2026-08-10 RU-0 audit had recorded 3,388 runs/30d, so "retained" is load-bearing). Plus source census: no first-party client; remaining references from deprecated paths. |
| **Calls getMaiaResponse()** | ❌ **NO** — both call sites removed. Pinned by `__tests__/cmt-01-step3-b-retirement.test.ts`. |
| **memoryHealth wired** | ❌ NO |
| **memoryAtomsLoader wired** | ❌ NO |
| **Provider routing** | Indirect via `getMaiaResponse()` → `modelService.ts` |
| **Orientation wiring** | ❌ NO |
| **@ts-nocheck** | ⚠️ YES |
| **Owner thread** | `legacy-ref` (reclassified from `de-frag`) |
| **Allowed future edits** | **None.** A later deletion of the file is a separate decision (spec §2.2: explicit 410 first); until then the route must keep answering 410 with the successor. Re-adding conversation logic fails certification. |
| **Notes** | Phase 1.5 memory orchestrator wiring was added in commit `930cc412e` under the misapprehension that this was the canonical route. The wiring is preserved as a no-op reference; it has never fired in production. The supersession docblock at the top of `route.ts` cross-references this map and Divergence Pattern #5. **First real application of Pattern #5's supersession protocol.** |

### `/api/oracle/conversation`
| Field | Value |
|-------|-------|
| **File** | `app/api/oracle/conversation/route.ts` |
| **Status** | `dormant` |
| **Lines** | ~2978 |
| **Traffic evidence** | Per sovereign route comment: "a route the live UI no longer hits" |
| **Calls getMaiaResponse()** | ❌ NO |
| **memoryHealth wired** | ✅ YES — most complete Cut 1 implementation (12 canonical layers, labeled in-file) |
| **memoryAtomsLoader wired** | ✅ YES |
| **Provider routing** | `MultiLLMProvider` from `lib/consciousness/LLMProvider` (oracle path only) |
| **Orientation wiring** | ❌ NO |
| **Owner thread** | `legacy-ref` |
| **Allowed future edits** | Preserve as reference. Do not apply orientation wiring. If traffic evidence confirms dormancy, candidate for formal deprecation. |
| **Notes** | Historically the primary oracle route. Has the most complete memory instrumentation of any route. Its Cut 1 implementation is reference material for the de-frag thread. The sovereign route's Cut 1 was modeled on this. |

### `/api/maia/ipp-conversation`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/ipp-conversation/route.ts` |
| **Status** | `dormant` |
| **Lines** | ~993 |
| **@ts-nocheck** | ⚠️ YES |
| **Owner thread** | `legacy-ref` |

### `/api/maia/enhanced-consciousness`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/enhanced-consciousness/route.ts` |
| **Status** | `dormant` |
| **Lines** | ~654 |
| **Notes** | Phase III prototype. "Quantum Field Memory + Consciousness Evolution + Collective Intelligence." `@ts-nocheck`. |
| **Owner thread** | `legacy-ref` |

### `/api/maia/memory-enhanced-response`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/memory-enhanced-response/route.ts` |
| **Status** | `dormant` |
| **Lines** | ~531 |
| **Notes** | `@ts-nocheck`. Imports `QuantumFieldPersistence`, `SessionMemoryService`. Legacy field architecture. |
| **Owner thread** | `legacy-ref` |

### `/api/maia/spiralogic`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/spiralogic/route.ts` |
| **Status** | `dormant` |
| **Lines** | ~456 |
| **Notes** | `@ts-nocheck`. Mercury function / spiralogic cell inference. Not wired to live chat path. |
| **Owner thread** | `legacy-ref` |

### `/api/maia/consciousness-integration`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/consciousness-integration/route.ts` |
| **Status** | `dormant` |
| **Lines** | ~365 |
| **@ts-nocheck** | ⚠️ YES |
| **Owner thread** | `legacy-ref` |

### `/api/maia/meditation`, `/api/maia/metacognition`, `/api/maia/field-driven-response`, `/api/maia/feedback`, `/api/maia/relational-signal`, `/api/maia/relational-signal/count`, `/api/maia/translate`, `/api/maia/personal-metrics`, `/api/maia/realtime-status`, `/api/maia/prompt-library/active`, `/api/maia/session/start`, `/api/maia/session/process`, `/api/maia/log-turn`
| Field | Value |
|-------|-------|
| **Status** | `dormant` (pending traffic audit) |
| **getMaiaResponse** | ❌ NO (all) |
| **memoryHealth** | ❌ NO (all) |
| **memoryAtomsLoader** | ❌ NO (all) |
| **Owner thread** | `legacy-ref` |
| **Notes** | No continuity wiring. Not in the sovereign chat path. Leave unchanged during de-frag. |

---

## TIER 5 — Legacy (Active but Reaches Bypassed Architecture)

### `/api/oracle/memory`
| Field | Value |
|-------|-------|
| **File** | `app/api/oracle/memory/route.ts` |
| **Status** | `legacy` |
| **Lines** | ~117 |
| **Notes** | Imports `PersonalOracleAgent`, `EnhancedMemoryRetrieval`, `LlamaService` from `app/api/_backend/`. This is the bypassed MAIA-PAI architecture (the "Maya's Unified Memory Brain Stem" five-parallel-layer system). Do not restore. Monitor for accidental traffic. |
| **Owner thread** | `legacy-ref` |

### `/api/oracle/trust`
| Field | Value |
|-------|-------|
| **File** | `app/api/oracle/trust/route.ts` |
| **Status** | `legacy` |
| **Lines** | ~135 |
| **Notes** | `@ts-nocheck`. Uses lazy import for `PersonalOracleAgent` from `_backend`. Same bypassed architecture. |
| **Owner thread** | `legacy-ref` |

---

## TIER 6 — Disabled

### `/api/maia/chat`
| Field | Value |
|-------|-------|
| **File** | `app/api/maia/chat/route.ts` |
| **Status** | `disabled` |
| **Lines** | ~62 |
| **Notes** | Returns 410 Gone. Explicit comment: "🚫 DISABLED due to external API dependencies that violate sovereignty. Use /api/sovereign/app/maia." Correct handling — keep disabled, do not re-enable. |
| **Owner thread** | `legacy-ref` |

---

## TIER 7 — Divination (Independent of Memory Stack)

### `/api/oracle/iching`, `/api/oracle/runes`, `/api/oracle/tarot`
| Field | Value |
|-------|-------|
| **Status** | `reference-live` |
| **getMaiaResponse** | ❌ NO |
| **memoryHealth** | ❌ NO (not applicable) |
| **Owner thread** | `divination` |
| **Notes** | Divination endpoints. Import from `lib/divination`. Independent of the memory/consciousness stack. Safe from de-frag and orientation work. |

---

## TIER 8 — Scaffold (Pre-wired, Unimplemented)

### `/api/maya/presence-mode`
| Field | Value |
|-------|-------|
| **File** | `app/api/maya/presence-mode/route.ts` |
| **Status** | `scaffold` |
| **Lines** | ~276 |
| **Notes** | Note: `maya`, not `maia`. Biometric-driven mode switching (`dialogue | patient | scribe`). Two TODOs for consciousness state and learning integration — never implemented. Separate from MAIA sovereign path. |
| **Owner thread** | `legacy-ref` |

---

## Sovereignty Flags

These require action independent of de-frag sequencing:

| Route | Flag | Risk |
|-------|------|------|
| `/api/maia/memory/ingest` | ⚠️ Uses `OPENAI_API_KEY` via `VectorEmbeddingService` | Sovereignty violation — external model provider in memory write path |
| `/api/maia/memory/resonance` | ⚠️ Uses `OPENAI_API_KEY` via `VectorEmbeddingService` | Sovereignty violation — external model provider in memory search path (MCP-exposed) |
| All `@ts-nocheck` routes | ⚠️ `// @ts-nocheck` masks runtime import failures | Typecheck passes; runtime can still fail silently (confirmed: the Cut 2 park commit identified this exact failure mode on `/list`) |

---

## Critical Ambiguity — RESOLVED

### ~~Is `/api/sovereign/app/maia` receiving live traffic?~~ **RESOLVED 2026-05-23**

**Result: NO.** 48h production-log audit on 2026-05-23 returned 99 hits to `/api/sovereign/app/maia/list` and **zero hits** to `/api/sovereign/app/maia` (bare). The route has been reclassified `dormant` in Tier 4 and its top-of-file docblock now carries the supersession header per Divergence Pattern #5's protocol.

**Audit details retained for traceability:**

- **Devtools capture (2026-05-23):** production iOS Safari (`/maia` page, member `ce284751...`) confirmed the actual fetch URL is `/api/sovereign/app/maia/list`. Server logs from the same turn showed `[MAIA/sovereign] memory-plan`, `[MAIA/sovereign] memoryHealth`, and `[MAIA/sovereign] atoms: none surfacable for this member` — Cut 1 firing on the canonical route.
- **48h log audit (2026-05-23):** `docker logs maia-sovereign --since 48h | grep -oE "/api/sovereign/app/maia[/a-z_-]*" | sort | uniq -c` → only `/list/route` references returned (99 occurrences). No bare-route hits, no other child-route hits.

**Implications closed:**

- The "Required before `buildMaiaRuntimeContext()` wrapper" precondition is satisfied. The canonical surface is known.
- The "member experiences MAIA as amnesiac depending on which route is hit" risk is closed — only `/list` receives traffic, and `/list` has the full Cut 1 spine.
- Divergence Pattern #5's supersession protocol was applied to real code for the first time in the same commit as this resolution.

---

## Known Divergence Patterns

Five recurring failure modes that this map exists to prevent. Each has produced or nearly produced an incident in the current de-frag cycle. Naming them explicitly so future contributors recognize the shape before it bites again.

### 1. Route created for one purpose, repurposed silently

A route file is created with a name that describes its original purpose (`list`, `enhanced`, `between`, etc.). Over time the UI begins sending different traffic to it. The name no longer describes what it does. The next contributor reads the name and assumes the wrong scope.

*Example:* `/api/sovereign/app/maia/list/route.ts` serves chat ingress, not a list endpoint. The "list" name is a relic.

**Protocol:** When a route's purpose changes, update its top-of-file docblock in the same commit. Add a `ROUTING INVARIANT` block that names the actual purpose. Do not rename the file casually — clients depend on the URL — but make the misleading name harmless by documenting reality at the top.

### 2. `@ts-nocheck` masking runtime import failures

See the Critical Warning section above. A `@ts-nocheck` directive at the top of a route file silently disables type and import resolution checks for the whole file. Typecheck passes; runtime can fail when the module loader tries to resolve a non-existent path.

**Protocol:** No `@ts-nocheck` on Tier 1 or Tier 2 routes. Removing existing directives from load-bearing routes is on the de-frag sequence (step 9). Until removed, every new import added to a `@ts-nocheck` route must be manually verified to resolve against an actual file.

### 3. Misleading legacy labels in client analytics and response handlers

The client may emit analytics events or log labels that reference an old route name even after the actual fetch URL has changed.

*Example:* On 2026-05-23, devtools showed the request URL as `/api/sovereign/app/maia/list` while `[Analytics] api_call` reported `endpoint: '/api/between/chat'` and the client response handler logged `THE BETWEEN response data`. The labels were stale; the actual route was correct. A reader trusting the analytics would have been routed to investigate the wrong server-side surface.

**Protocol:** When a route migration happens, audit and update analytics labels, client-side log markers, and response handler comments in the same commit as the routing change. Stale labels turn diagnostic logs into red herrings.

### 4. Cross-thread parallel wiring without reconciliation

When two threads (e.g., de-frag and orientation) modify adjacent surfaces in parallel, one thread may add imports or call sites for a module the other thread placed at a different path. Both diverge in the same commit window.

*Example:* On 2026-05-23, the de-frag thread added imports referencing `@/lib/maia/spiralOrientation` (path) and `SpiralOrientationResult` (type) while the orientation thread had placed the actual file at `lib/orientation/spiralOrientation.ts` and exported `DomainOrientation[]`. Three layers diverged at once: path, type name, return shape. `@ts-nocheck` masked all three from typecheck.

**Protocol:** Cross-thread wiring requires (a) an explicit reconciliation note in the commit message, (b) verification that both the import path AND return shape match the implementation, (c) authorization to cross the boundary from the thread that owns the affected file. When in doubt, park the wiring (comment out with parking note) rather than ship a guess.

### 5. Route created, verified, then silently superseded — without the original being marked dormant

A route is built, tested, deployed, confirmed working. Over time the UI migrates to a different route. The original keeps existing — still compiles, still passes typecheck, still has the most obvious-named file in its directory — but no longer receives traffic. New contributors read the original (because it has the canonical-looking name) and assume it's still live. Time is spent fixing the wrong route.

*Example:* `/api/oracle/conversation/route.ts` (~2978 lines, the most complete Cut 1 implementation of any route in the codebase) was historically the primary oracle route. The UI has since migrated to `/api/sovereign/app/maia/list`. Early in the 2026-05-23 de-frag session, Cut 1 patches were applied to `/api/oracle/conversation` under the assumption it was canonical. The patches were correct code; the route was wrong code.

**The failure pattern isn't "people create duplicates." It's "people don't mark the old one when they move."**

**Protocol:** When a route is superseded — whether by a UI client change, a route refactor, or a new endpoint — the original route's top-of-file docblock must be updated *in the same commit* with:

```ts
/**
 * STATUS: dormant (see docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md)
 * SUPERSEDED BY: <new canonical route path>
 * SUPERSEDED ON: YYYY-MM-DD
 * REASON: <one line>
 *
 * Do not add new wiring here. Patches to this route will not reach live traffic.
 */
```

The route map (this document) must be updated in the same commit so the doc and the code agree on which route is live. A divergence between this map and the routes themselves is itself an incident.

---

## De-frag Sequence (Updated)

```
1. [DONE]     Canonical route identified: sovereign/app/maia/list
2. [DONE]     Cut 1 wired: memoryHealth + atoms in /list
3. [DONE]     §V falsifiability suite: 18/18 on production
4. [THIS DOC] Route authority map: surface is now explicit
5. [DONE]     Confirm /sovereign/app/maia traffic — 0 hits in 48h audit; reclassified dormant 2026-05-23
6. [NEXT]     buildMaiaRuntimeContext() wrapper — step 5 is answered
7. [DEFERRED] CI guard
8. [DEFERRED] assertProviderAvailable()
9. [DEFERRED] Remove @ts-nocheck from canonical routes
10. [BLOCKED]  Spiral Orientation wiring — blocked until Path A/B decision
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-05-23 | Initial map created | de-frag thread |
| 2026-05-23 | Added prominent `@ts-nocheck` warning at top + Known Divergence Patterns section (5 patterns including "route silently superseded without being marked dormant"). Annotated Critical Ambiguity with devtools-verified canonical route. | de-frag thread |
| 2026-05-23 | 48h traffic audit confirmed `/api/sovereign/app/maia` (bare) receives zero traffic. Reclassified `live-secondary ⚠️` → `dormant`; moved section from Tier 2 to Tier 4; updated route file's top-of-file docblock with supersession header (STATUS/SUPERSEDED BY/SUPERSEDED ON/REASON) per Divergence Pattern #5 protocol. Critical Ambiguity section resolved. De-frag step 5 marked DONE. First real application of the supersession protocol. | de-frag thread |
