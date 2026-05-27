# Framework Access Map — 2026-05-25

**Purpose:** Honest six-category typology of MAIA's framework substrate, in response to "ensure she has full access to 27+ frameworks." Diagnostic only — does not authorize implementation.

## Headline

MAIA does **not** have access to "27+ frameworks" today. She has access to a **13-framework therapeutic registry** (cat 6, narrow) and a much larger pool of **archetype/framework files that are cat 3/4** (built or dormant, not feeding the live route). The Obsidian Vault is reachable through a `@ts-nocheck` prototype bridge with **zero callers in the live sovereign route**.

## What is actually wired (cat 6 — narrow)

**Registry:** [lib/consciousness/therapeuticFrameworks.ts](lib/consciousness/therapeuticFrameworks.ts)
- **13 therapeutic frameworks:** auto, jungian, cbt, somatic, ifs, relational, humanistic, existential, hemispheric, alchemical, archetypal, tcm, family_constellations
- **5 reflection lenses:** auto, jungian, somatic, relational, narrative

**Wire path:**
- FAST tier: [lib/sovereign/maiaService.ts:1108-1232](lib/sovereign/maiaService.ts:1108) — `therapeuticFrameworkAddendum` concatenated into prompt, logged as `🧘 [FAST] Therapeutic framework applied`
- CORE tier: [lib/sovereign/maiaVoice.ts:811](lib/sovereign/maiaVoice.ts:811) — `safeAddendum(context.therapeuticFrameworkAddendum)` extracted in `buildMaiaWisePrompt`
- DEEP tier: **likely blocked at `buildComprehensiveVoicePrompt`** — same divergence-debt pattern as conversational Phase 2 ([ADDENDA_CHANNEL_DIVERGENCE §II.B](docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md)). Needs verification.

**Activation condition:** only fires when user selects a non-`auto` framework via UI. Default = `auto` = pure Spiralogic. For most members, frameworks are silent.

## What is built but not wired (cat 3)

40+ framework/archetype files across `lib/archetypes/`, `lib/consciousness/`, `lib/voice/`, `lib/agents/` — none feeding `app/api/sovereign/app/maia/list/route.ts`. Examples:
- `lib/archetypes/MayaArchetypes.ts`
- `lib/consciousness/ArchetypalConstellation.ts`
- `lib/consciousness/master-member-archetype-intelligence.ts`
- `lib/voice/ArchetypeRouter.ts`
- `lib/intelligence/CBTEngine.ts`
- `lib/intelligence/CrossFrameworkSynergyEngine.ts`

## What is dormant by design (cat 4)

- **[lib/dormant-frameworks-layer.ts](lib/dormant-frameworks-layer.ts)** — *self-described as "completely dormant until user explicitly asks / complexity overwhelm / natural emergence."* Imported by `witness-paradigm-orchestrator`, `sacred-oracle-core(-enhanced)` — none in live route.
- **[lib/bridges/psychological-frameworks-bridge.ts](lib/bridges/psychological-frameworks-bridge.ts)** — MicroPsi/LIDOR/ACT-R/SOAR/LIDA/POET. Imported only by `consciousness-orchestrator.ts`. Not in live route.
- **[lib/bridges/obsidian-vault-bridge.ts](lib/bridges/obsidian-vault-bridge.ts)** — `@ts-nocheck` prototype. Reads `process.env.OBSIDIAN_VAULT_PATH` (default empty). Imported by `fractal-field-spiralogics`, `spiralogic-engine`, `consciousness-orchestrator` — none in live route.

## Obsidian Vault state

**Path:** `/Users/soullab/Obsidian Vaults/MAIA-Consciousness/` (folders: 00-Inbox through 08-Logs)

**Framework files found by keyword search:** 2 (`02-Synthesis/Framework — Shamanic-Jungian Convergence.md` + one rename-backup). The vault is a **synthesis/research vault**, not predominantly a framework library.

**OBSIDIAN_VAULT_PATH env var:** unverified in `.env.production`. Bridge silently no-ops if unset.

## Where is "27"?

My count comes up short of 27 for any single interpretation:
- 13 therapeutic + 5 reflection = 18
- 5 dormant-layer types (elemental/archetypal/somatic/systemic/narrative) = 23
- + scattered archetype/CBT/Jung engines = potentially ~28+ if counted broadly across cat 3/4

This may need Kelly's master list to resolve. Without it, "ensure she has full access to 27" cannot be made operational — we don't know which 27.

## Why this is not just "wire them up"

The discipline from the conversational Phase 2 cut applies directly:
1. **Built ≠ wired ≠ surfacing ≠ verified** — most framework files are cat 3, not cat 6
2. **Each remaining arena requires its own Phase 2-equivalent spec** ([CLAUDE.md](CLAUDE.md) §"Current priority thread")
3. **Default-on for 27 frameworks would blow the prompt budget** — every addendum compounds `PROMPT_BLOCK_CHARS`
4. **No-static-UI-claim-without-verified-state** — Kelly's existing doctrine refuses "she has access to X" without runtime evidence
5. **Conversational Phase 2 is still on branch awaiting fork resolution + deploy + verify** (per priority thread). Opening a second arena before the first ships violates "do not open two nervous systems at once" ([memory/project_observation_phase_freeze_doctrine.md](.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/project_observation_phase_freeze_doctrine.md)).

## Constitutive frame (Kelly, 2026-05-25, third pass)

Per [memory/project_integration_operational_definition.md](../../../.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/project_integration_operational_definition.md):

**"Integrated" means five criteria, not "feature complete":**
1. Metabolized into the living runtime
2. Behaviorally understood
3. Attributionally legible
4. Relationally tested under real member contact
5. Stable enough that adding differentiation won't destabilize coherence

The 13 frameworks *emit* (criterion-1-partial via the FAST `🧘` log line). Whether they pass criteria 2-5 is a *separate open question* that step 2 of the sequence (verify under real contact) is meant to answer.

**Governance register:** *sequenced, not refused.* The 27 are not refused; the 40 are not abandoned; both are *staged.* Refusal language and expansion language are equally suspect — sequencing language is correct.

**Dormancy is biology, not negation.** Living systems keep latent capacity inactive until conditions justify activation. The 40 dormant cat-3/4 files staying dormant is healthy selective recruitment, not architectural failure. Premature activation and total abandonment are symmetric failure modes.

**Prototype framing:** the [`obsidian-vault-bridge.ts`](../../lib/bridges/obsidian-vault-bridge.ts) `@ts-nocheck` prototype is *present, provisional, non-authoritative* — acknowledged without being elevated.

**Constitutive reframe (load-bearing):** *integration before accumulation* is now a criterion of healthy cognition, not a sequencing preference. A cognitive architecture that accumulates without integrating is not yet thinking coherently, regardless of inventory size.

## Refinement — the sharper question (Kelly, 2026-05-25, second pass)

Per [memory/project_contact_fidelity_threshold.md](../../../.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/project_contact_fidelity_threshold.md):

The framing of "should framework cognition exist?" is **retired** — the live 13 already establish that it does. The mature question replacing it:

> *What degree of symbolic differentiation can the live runtime integrate without losing contact fidelity?*

**Reclassification of step 3:** "Resolve DEEP divergence inside the already-live 13" is **coherence work inside an existing nervous system** — not opening-a-second-nervous-system. The original sequencing put it after step 2 (verification under real contact); that ordering may or may not still bind once Phase 2 stabilizes — the doctrine refines the category, the sequencing decision still belongs to Kelly.

**Wiring the 40 dormant frameworks remains opening-a-second-nervous-system** and remains refused.

**McGilchristian principle (load-bearing):** corpus callosum biology *regulates differentiated coordination*; it does not increase connectivity infinitely. Selective integration (WisdomRouter ~49%) is correct function. The goal is NOT higher symbolic density — it is *preserved contact fidelity under whatever density the substrate is already metabolizing.* Homogenization is the failure mode that looks like integration.

**Symmetric errors to refuse:**
- *Inflation:* "we always had this" applied to recent telemetry-verified patterns
- *Under-recognition:* "just old canon" applied to recent stage 4-5 substrate crossings

The framework arena progresses by **deepening contact within what is operational** before extending into what is dormant.

## Ratified sequence (Kelly, 2026-05-25, first pass — held below for continuity, refined by section above)

Per [memory/project_integration_before_accumulation.md](../../../.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/project_integration_before_accumulation.md) — McGilchristian doctrine: *living systems deepen through differentiation-and-integration, not undifferentiated accumulation.* The framework arena is sequenced as follows; **no step proceeds before the previous one is metabolized**:

1. **Stabilize Conversational Phase 2** — current step. Fork resolution → merge to `clean-main-no-secrets` → deploy to minisforum → verify `[MAIA] conversational-block` emission on `sovereign/app/maia/list` across FAST + CORE.
2. **Verify live runtime behavior under real contact** — member sessions, not just gate checks. Watch for drift / convergence / relational quality under Phase 2.
3. **Resolve DEEP divergence inside the already-live 13** — extend [ADDENDA_CHANNEL_DIVERGENCE §V](ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md) fix to the therapeutic-framework channel (same shape as conversational addenda). FAST + CORE + DEEP coverage for the 13 frameworks already in the registry.
4. **Observe for drift / convergence / relational quality** — a period of just watching. No new wiring.
5. **Audit dormant framework inventory without wiring** — read every cat-3/4 file in `lib/`, produce inventory with provenance + activation conditions + safe-surfacing notes. Diagnostic only. Preserves the *dormant symbolic inventory vs live cognitive substrate* distinction.
6. **Only then decide what deserves promotion into runtime cognition** — per-framework Phase 1 (observability) → Phase 2 (prompt influence) cut. Never bulk activation.

**Constraint shared with all six steps:** maintain attribution preservation — adding the dormant 40 simultaneously with Phase 2 would make it impossible to know what changed behavior, which layer caused drift, whether improvements came from memory orchestration or framework inflation. Inflation without attribution is pseudo-learning.

**Why options #1, #3 alone, #4 were rejected:**
- **#1 (share canonical 27 list first):** felt orderly and expansive — that orderliness-feel is the left-hemisphere-overreach signature, not integration readiness. Representational inflation before metabolizing current architecture.
- **#3 alone (audit cat-3 files now):** valid diagnostically but only at step 5. Premature audit can become implicit authorization.
- **#4 (defer entirely):** over-freezes the live 13 which ARE materially earned cat-6 status. The discipline is integration of what's live before accumulation of what's potential, not freezing the live.
- **#2 (verify + DEEP-extend the 13):** correct, but only AFTER step 2 — placed as step 3 in the sequence above, not as immediate move.

**Test before any future "should we wire X" question:** (a) what nervous-system-scale change is currently being metabolized? (b) would adding X make attribution of (a)'s effects harder? (c) is X potential intelligence or already operational? (d) would adding X cross a category boundary from 1-5 to 6? If yes to (b) or (d), hold until metabolized.

**The 27 frameworks are not refused — they are sequenced.** They wait until the 13 are integrated.
