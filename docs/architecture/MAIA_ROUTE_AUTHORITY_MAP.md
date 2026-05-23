# MAIA Route Authority Map

**Created**: 2026-05-23  
**Thread**: De-frag / runtime restoration  
**Status**: Control surface — update before modifying any MAIA route  
**Purpose**: Prevent "fixed the wrong route" recurrence. Every route answers six questions before any edit touches it.

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

### `/api/sovereign/app/maia`
| Field | Value |
|-------|-------|
| **File** | `app/api/sovereign/app/maia/route.ts` |
| **Status** | `live-secondary` ⚠️ |
| **Lines** | ~427 |
| **Traffic evidence** | Possibly receiving traffic alongside /list — unclear split. Needs audit. |
| **Calls getMaiaResponse()** | ✅ YES — `lib/sovereign/maiaService` |
| **memoryHealth wired** | ❌ NO — Cut 1 not applied here |
| **memoryAtomsLoader wired** | ❌ NO — Cut 1 not applied here |
| **Provider routing** | Indirect via `getMaiaResponse()` → `modelService.ts` |
| **Orientation wiring** | ❌ NO |
| **@ts-nocheck** | ⚠️ YES |
| **Owner thread** | `de-frag` |
| **Allowed future edits** | De-frag thread must determine: (a) is this route still receiving traffic, (b) if yes — apply Cut 1, (c) if no — classify dormant. Do not apply orientation wiring until (a) is answered. |
| **Notes** | Has Phase 1.5 memory orchestrator wired (buildMemoryInfluencePlan, forwardReadiness). Missing memoryHealth and atoms. If this route is live, it is the "fixed the wrong route" failure surface. |

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

## Critical Ambiguity

### Is `/api/sovereign/app/maia` receiving live traffic?

Both `sovereign/app/maia` (427 lines, no Cut 1) and `sovereign/app/maia/list` (1143 lines, Cut 1 wired) call `getMaiaResponse()`. Only `/list` has memoryHealth and atoms wired. If both are receiving traffic:

- Turns hitting `/maia` get Phase 1.5 memory (orchestrator) but no atoms, no memoryHealth
- Turns hitting `/maia/list` get the full Cut 1 spine
- The member experiences MAIA as amnesiac depending on which route is hit

**Required before `buildMaiaRuntimeContext()` wrapper**: confirm which route(s) the frontend actually calls. Check client-side fetch calls and Capacitor routing.

---

## De-frag Sequence (Updated)

```
1. [DONE]     Canonical route identified: sovereign/app/maia/list
2. [DONE]     Cut 1 wired: memoryHealth + atoms in /list
3. [DONE]     §V falsifiability suite: 18/18 on production
4. [THIS DOC] Route authority map: surface is now explicit
5. [NEXT]     Confirm /sovereign/app/maia traffic (is it live?)
6. [NEXT]     buildMaiaRuntimeContext() wrapper — only after step 5 is answered
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
