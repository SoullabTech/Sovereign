# Sovereignty Architecture — Layer State

**Date:** 2026-05-23
**Branch:** `clean-main-no-secrets`
**Purpose:** Snapshot, not refinement. Read against the five-layer sovereignty framing (inference / memory / meaning / interpretation / infrastructure / governance / embodiment) to record where the architecture actually is — so that a future mid-swap moment has an honest baseline to work from.

---

## Framing

Sovereignty in this architecture is multi-layered, not binary. "Local model" is one axis among seven. The architecture is doing its job: it makes the cognition provider swappable. The swap target is what doesn't yet exist at the required quality bar.

This is a hardware + model-selection problem, not an architecture failure.

---

## Layer 1 — Local-first continuity substrate

| Status | Component | Commit |
|--------|-----------|--------|
| ✅ | Atoms (Layer 5) wired into canonical route | `08bc4c876` |
| ✅ | memoryHealth (Layer 15) wired | `08bc4c876` |
| ✅ | Phase 1.5 orchestrator on live sovereign route | `462e879e4` |
| ✅ | Bridge D spiral state persistence | (prior) |
| ✅ | Cut 1 — continuity substrate restoration | `93b42d092` |
| ⚠️ | Cut 2 — Spiral Orientation, built but parked on live route | `e340a1921` + `5eabe290c` |
| ❌ | UFI (orchestration brain stem) | not built |
| ❌ | RFI ("becoming active now") | not built |
| ❌ | FIS governance (premature certainty collapse prevention) | not built |
| ❌ | Sacred layer (`crossing_allowed=FALSE`) | not built |
| ❌ | Resonant / Morphic layers | not built |
| ❌ | Layers 3–4 (relational, episodic), 6–10 (developmental, symbolic, somatic, resonant, morphic) | not built |

**Of the named 15-layer architecture, layers 1+2+5+15 are wired. Eleven remain.**

---

## Layer 2 — Multi-model cognition

| Status | Component | Commit |
|--------|-----------|--------|
| ✅ | `assertProviderAvailable()` pre-generation guard | `034b573d8` |
| ✅ | `buildMaiaRuntimeContext()` contract — route/memory/provider/fallback visible per turn | `64da37a19` |
| ✅ | MAIA route registry + bidirectional CI guard | `91fe76580` |
| ✅ | Route Authority Map | `5385392c2` |
| ✅ | Claude primary + Ollama fallback (qwen2.5:7b) | `c80dbba9e` |
| ⚠️ | Function-by-substrate routing declared (ordinary→local, deep→Claude), enforced only as fallback toggle | — |
| ❌ | Local model meeting "deep" quality bar | not available |

**The architecture supports federated cognition. The federation does not yet have a viable second member for deep reasoning.**

---

## Layer 3 — Field-centered architecture

| Status | Component | Commit |
|--------|-----------|--------|
| ✅ | Field Lab (`/maia/field-lab`) + opt-in tester gate | `a757ddcac` |
| ✅ | Relational Navigation Room (only experiment) | `a194a5590` |
| ✅ | The Clearing canon | `0f4545303` |
| ✅ | Spiral Continuity Engine canon | `0f4545303` |
| ✅ | FIS, pattern primitive, substitution doctrine | `ca0d3d696` |
| ⏳ | Field observations from real walks | awaiting |

**Posture: not refinement. Lived contact is the next epistemic source.**

---

## Layer 4 — Metadata-center independence

| Status | Component |
|--------|-----------|
| ✅ | Self-hosted production stack (minisforum + Caddy + Docker + PostgreSQL) |
| ✅ | Sovereign API surface (`app/api/sovereign/*`) |
| ✅ | No managed hosting, no managed DB, no CDN MITM |
| ⚠️ | Deep cognition still depends on Anthropic — Claude is structurally swappable but currently load-bearing |
| ❌ | Embeddings provenance — unverified whether local |
| ❌ | Local deep-reasoning capability |

**Sovereignty here is conditional. The condition is the swap target at Layer 2.**

---

## Layer 5 — Programmatic structure (recurrence-prevention + de-frag)

| Status | Component |
|--------|-----------|
| ✅ | 8-point recurrence-prevention architecture committed |
| ✅ | 10-point continuity substrate restoration program committed |
| ✅ | MAIA Route Authority Map + Known Divergence Patterns |
| ✅ | Cut 1 deployed |
| ⚠️ | Cut 2 built, parked |
| ❌ | Cut 3+ undefined |

---

## Uncommitted state at snapshot time

- `CLAUDE.md` — +63 lines: context-mode routing rules (meta-process discipline, not feature work)
- `app/api/sovereign/app/maia/list/route.ts` — marked modified, diff is empty (metadata-only)

---

## Constraint log — the Ollama revert is a forward pointer, not a dead end

The provider sequence:
1. `1bb29e1d0` — Ollama qwen2.5:14b-instruct installed (replacing broken deepseek-r1:8b)
2. `6d36ed4ac` — `MAIA_TEXT_PROVIDER=local` set; Ollama primary on sovereign path
3. `dec807ff6` — Reverted to Claude primary; 14b too large for available RAM
4. `c80dbba9e` — Fallback model dropped to qwen2.5:7b (fits RAM without swapping)

**What this entry tells future-us:**
- The wire for Ollama-primary exists and was once active. Re-enabling is a config flag (`MAIA_TEXT_PROVIDER=local`), not a refactor.
- The blocker was not architecture. It was RAM + model size + quality tradeoff at the 7b–14b band.
- When a local model becomes available that (a) fits the minisforum RAM envelope and (b) clears the depth bar that currently requires Claude, the swap is a single env change plus quality verification.
- This is the threshold to watch. Tracking question: *Does a 13b–30b model land that punches at Claude-Sonnet depth and fits in our RAM?*

---

## Honest threshold

The sovereignty arc has one structural gap that everything else turns on:

> **No local model currently carries deep reasoning at the quality bar MAIA needs.**

Until that changes, "metadata-center independence" remains partial. Claude is currently the substrate, not merely a contributor. The architecture is correct — it makes the substrate swappable. The swap target is what's missing.

Everything else (15-layer build-out, field observations, Cuts 3+) is sequencing work against an already-named program.

---

## Sequencing implication

Two parallel tracks:

1. **Lived-contact track** (Layer 3) — field observations, no theory refinement, doctrine-refinement-ceiling discipline holds. Watch the canaries; do not pre-patch.
2. **Substrate-completion track** (Layers 1, 2, 4) — Cuts 3+, layer 3/4/6 wiring, embedding localization, watch for a viable local deep-reasoning model.

Both proceed without forcing convergence. The architecture is mature enough to hold both threads without collapsing one into the other.

---

## Closing image

*The architecture is doing its job. It is keeping the substrate question open while the field question matures. The swap target will come. When it does, the wire is already there.*
