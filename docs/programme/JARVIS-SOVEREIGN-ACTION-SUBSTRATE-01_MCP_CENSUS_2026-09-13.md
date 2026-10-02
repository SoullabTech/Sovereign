# JARVIS-SOVEREIGN-ACTION-SUBSTRATE-01 — MCP SUBSTRATE CENSUS

**Date:** 2026-09-13
**Class:** Read-only census. No code change, no wiring, no deploy, no lane opened.
**Occasion:** Founder proposal (2026-09-13) to open a bounded Jarvis action lane, resting on the premise *"we already have an MCP foundation."*
**Verification vocabulary:** inherits `JARVIS-COLLABORATION-ARCHITECTURE-CENSUS-01_2026-09-05.md` §2 — `present · partial · absent · unverified · deliberately refused`; realization and verification held as separate axes.

---

## 1. The premise, tested

> *"We do not need to invent Jarvis's tool layer from zero. We need to census, reconcile and constitutionalize the existing MCP substrate."*

**Sustained — and the substrate is larger than the proposal stated.** The proposal named `mcp-servers/{ain,beads,ganglion}` (servers Soullab *exposes*). It did not name `lib/mcp/**` — a 20-file **client** layer that *consumes* external MCP servers. That layer is the load-bearing find, because it is the one with a wire into MAIA.

## 2. What exists

| Component | LOC / shape | State | Evidence |
|---|---|---|---|
| `mcp-servers/ain` | 1,081 LOC · 5 tools (`ain_awareness`, `ain_field_state`, `ain_guidance`, `ain_insight`, `ain_query`) · 2 resources | **present**, unregistered | source read; no `.mcp.json` in repo |
| `mcp-servers/beads` | 490 LOC, single `index.ts` | **present**, unregistered | source read |
| `mcp-servers/ganglion` | 529 LOC Python | **present**, unregistered | source read |
| `lib/mcp/` client layer | 20 files: `MCPClientManager`, `MCPClientService`, `MCPEventBridge`, 6 adapters, 6 `*ConsciousnessIntegration` classes | **present** | `find lib/mcp -type f` |
| **Registration with any agent runtime** | — | **absent** | no `.mcp.json`; searched, not found |
| **Consent gate on MCP member data** | — | **absent** | zero matches for `consent\|sanctuary` in `MCPConsciousnessIntegration.ts` |
| **Refusal-registry entry for MCP** | — | **absent** | 31 entries enumerated; none covers MCP |

**Last touched:** one commit (`66da58b4`). The substrate is not under active maintenance.

## 3. 🔴 THE FINDING — MCP ALREADY HAS A WIRE INTO MAIA COGNITION

`lib/consciousness/maiaOrchestrator.ts:440–465` calls `getMCPConsciousnessIntegration().generateOracleEnrichment(userId, message)` on **every turn through that orchestrator**, and assigns the result to `mcpContext` / `mcpEnrichment` on the context object (`:530–536`) — biometric correlation, schedule timing, task workload, "consciousness markers."

This is **not** a proposed capability. It is checked-in code on a path imported by `app/api/between/chat/route.ts`, `app/api/voice/stream-conversation/route.ts`, `lib/sovereign/maiaService.ts`, `lib/sovereign/maiaVoice.ts` and `lib/maia/canonical-turn/producerRegistry.ts`.

### Why it is nevertheless not reaching members today

Three independent reasons — **only one of which is intentional**:

1. ⛔ **`mcpContext` has ZERO consumers.** `grep -rn "mcpContext" lib app` outside the orchestrator returns nothing. It is produced and never read. *This is the decisive fact and it is load-bearing in the de-escalating direction.*
2. **The transports cannot resolve in production.** Four adapters shell to `npx -y @anthropic-ai/mcp-server-apple-health` and similar — macOS-oriented packages, in a Linux container. Connection fails; the call is wrapped in `try/catch` (`:464`) and degrades silently to `layersFailed.push('mcp-context')`.
3. **Nothing registered the servers.** No `.mcp.json`.

### ⛔ What is NOT true

**It is not gated off.** Four integrations default **ON**: `MCP_APPLE_HEALTH_ENABLED !== 'false'`, `MCP_CALENDAR_ENABLED !== 'false'`, `MCP_OBSIDIAN_ENABLED !== 'false'`, `MCP_BEADS_ENABLED !== 'false'` (`lib/mcp/config.ts:96–120`). No `MCP_*` variable appears in `.env.example`, so an unconfigured environment evaluates these to `true`. The substrate is **declared-on, connection-inert, output-unconsumed** — safe by accident on two counts and by omission on the third.

**Production state is `unverified`.** This census did not read production env or logs. It asserts the source tree only.

### Consequence for the proposed lane

The founder's containment clause — *"explicitly scoped so it cannot alter MAIA cognition"* — **cannot be established by declaration.** A wire already exists. Scope becomes structurally true only if the lane's first act addresses it. That is a founder fork, recorded in §5, not decided here.

## 4. Salvage adjudication (proposal §2, sustained with one addition)

- **transport / tool protocol / audit infrastructure — SALVAGE.**
- **old psychological authority — DO NOT SALVAGE.** Confirmed by name: `awareness-detect.ts`, `knowledge-gate.ts`, `evolution-guidance.ts` (`ain_guidance`), `collective-insight.ts`. These assert developmental state *about a member* and must be adjudicated against Invariant 16 (Constitutional Direction of Authority) and `refusal-16-developmental-state-shaping-guard.ts` before any re-registration.
- ⭐ **ADDITION — `lib/mcp/integrations/*ConsciousnessIntegration.ts` inherits the same suspicion.** These name themselves as consciousness inference over calendar, health and task data. The proposal's salvage list did not cover them because it did not know they existed.

## 5. Open founder questions (not decided here)

- **Q1 — Containment.** Does the lane's first act **quarantine** the `maiaOrchestrator:440–465` enrichment call (making the "cannot alter MAIA cognition" scope structurally true), or leave it untouched as inert legacy (scope true only by accident)?
- **Q2 — Default-on posture.** Do the four `!== 'false'` defaults get inverted to explicit opt-in as a standalone hygiene act, independent of the lane?
- **Q3 — Refusal coverage.** Should "no MCP-sourced member data reaches MAIA cognition without a named consent gate" become refusal-32, before any adapter work?

## 6. Standing

**LANE NOT OPENED · NO CODE CHANGED · NO SERVER REGISTERED · NO ADAPTER BUILT · NO DEPLOY · PRODUCTION UNREAD.**

Classification is deliberately conservative: nothing here is called a violation whose semantics were never constituted. An unconsumed variable is not a disclosure; a default-on flag with no working transport is not an active channel. **But neither is a defence — it is an absence of consequence, not an absence of authority.**

> *The tool layer does not need to be invented. It needs to be found, bounded, and told what it may not do.*
