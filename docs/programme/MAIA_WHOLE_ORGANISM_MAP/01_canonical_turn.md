# Canonical turn — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

**Tree read:** `cf6d9ebf` (branch `claude/maia-human-experience-arch-12g5r6`). Line numbers are for
this tree. Prior findings from `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md`
(tree `a4305f4`, 2026-09-03) are cited as **[census §n]** and were **not re-derived** unless a line
number below says so.

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

| Part | Path | Status | Cat |
|---|---|---|---|
| Sole sovereign cognition entry | `getMaiaResponse()` — `lib/sovereign/maiaService.ts:2649` | live; called from `app/api/sovereign/app/maia/list/route.ts:1365` (canonical surface, 5/5 `<OracleConversation>` mounts [census §1.4]) | 6 |
| Tier fork | `fastPathResponse` `:728` · `corePathResponse` `:1558` · `deepPathResponse` `:2013`; profile chosen by `maiaConversationRouter.chooseProcessingProfile` (`lib/consciousness/processingProfiles.ts:49`), consumed at `maiaService.ts:3083–3091` | live | 6 |
| FAST prompt | inline template literal, one line, ~31 positional slots — `maiaService.ts:1464` | live (majority of turns [census §4.1]) | 6 |
| CORE prompt | `buildMaiaWisePrompt` — `lib/sovereign/maiaVoice.ts:549`; called `maiaService.ts:1803`, repair `:1972`; `appendAllContextAddenda` `maiaVoice.ts:507` appends floor (speech-act boundary `:497`, platform map, platform boundary, `INTERFACE_HUMILITY_GUARDRAIL` `:484`) | live | 6 |
| DEEP prompt | primary: `consciousnessOrchestrator` (no system-prompt seam [census §4]); repair: `buildComprehensiveVoicePrompt` — `lib/sovereign/intelligentVoiceAdaptation.ts:224` via `maiaVoice.ts:965` | live but rare (DEEP fires on explicit-depth invitations only — `processingProfiles.ts:104–140`) | 6 |
| Open channel | `MaiaRequest.meta?: Record<string, unknown> & {…}` — `maiaService.ts:597`; **212** `(meta as any)` reads in `maiaService.ts` on this tree (`grep -c`) | live | 6 |
| Canonical-turn seam (CMT-01 M0–M2) | `lib/maia/canonical-turn/` — `construct.ts` (the only constructor; fail-closed; deep-freeze `:52–60`), `adjudicate.ts` (MIPA, pure `:34`), `producerRegistry.ts` (38 producers, axes `authoredBy · participationClass · authority`), `policy.ts` (pp-1; `inferenceCap: null` `:30`; `ROOM_POLICIES` `:50–57`), `manifest.ts` (`[MAIA/manifest]` `:33`, emission only, no table `:9–11`), `shadow.ts` (`[MAIA/shadow]` `:21`, digests only `:13`), `types.ts` (`cognitionPath: 'getMaiaResponse' \| 'room_direct' \| 'shadow'` `:189`) | live as **instrument**: constructed on `/list` in shadow (`list/route.ts:1281–1333`), `cognitionPath: 'shadow'` `:1325`; kill-switch `MAIA_CANONICAL_SHADOW=0` `:1281`; **zero authority over the response** (`:1274–1275`) | 6 (instrument) |
| Canonical seam as response authority (M3) | spec `docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md` | **NOT AUTHORIZED** (CLAUDE.md CMT-01 thread) | 5 |
| Dormant sacred-mirror block | `lib/sovereign/sacredMirrorProtocol.ts:3` `sacredMirrorCadenceBlock` — **zero importers** | dormant | 4 |
| Clarify-engagement-shape | `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md:3` "Design closed 2026-05-26 (Gate 3). Implementation deliberately deferred"; no code found (`lexicalDensity` hits are manuscript-structure only) | designed, not built | 1/5 |

**WALKED (dated):** shadow zero-diff on production `/list`, runtime `b20f2742e`, 2026-09-04 17:56:39Z —
`docs/programme/PROOF-9-WITNESS_2026-09-04.md:7–34` (`zeroDiff true · legacy 12 / canonical 12`);
MEMBER_ONLY no-regression witness, `docs/programme/MEMORY-PRODUCER-PARTITION-01.md:748–830`.
The 2026-09-03 first M2 deploy was **not** accepted as witness (provenance lost; `CMT-01_M0-M2_WITNESS_2026-09-03.md:194–266`).

## 1 · The founder's question for this subsystem

> *Does the current cognition path preserve multiple interpretations or collapse them too early?*

**Answer (E, READ): it collapses — serially, to scalars, before the model sees the input — and the
only parallel readings that exist are logged after cognition, never composed into it.** Every
signal about the member is reduced to one value at the point it is formed; alternatives, where
computed at all, are kept in `meta` or logs and never reach a prompt. What preserves plurality is
(a) the model's own latent capacity, which the prompt does not ask for, and (b) two prompt texts
(FAST Talk-mode "sacred mirror", CORE-only Interface Humility) that ask the model to defer
interpretation. The canonical-turn manifest preserves *participation* plurality (which producers
were admitted) — not *interpretive* plurality — and is shadow-only.

**Where a single interpretation is formed (each collapses before cognition):**

| # | Point | Path | What is kept | What is lost |
|---|---|---|---|---|
| 1 | Processing profile | `processingProfiles.ts:95–221` → one `profile` + `reasoning` string; down-regulated by a stored **cognitive profile** (`rollingAverage`, `bypassingFrequency.spiritual/intellectual`) `:233–258`; consumed `maiaService.ts:3083–3091` | one tier | the case for the other tiers; the member's own request for depth is inferred, not asked |
| 2 | Mythic Atlas facet | `maiaService.ts:2945` (`getMythicAtlasContext` → HTTP `MYTHIC_ATLAS_URL \|\| localhost:8000`, `lib/services/mythicAtlasService.ts:49,66`); `finalFacet = atlasResult?.primary ?? 'UNKNOWN::UNKNOWN'` `:3021`; alternatives copied into `meta.deliberation` only when gap < 15 % `:3019–3065`; **committee deliberation is a commented-out TODO** `:3067–3079` | one facet; drives memory recall `:2973–2977` and memory integration `:3566–3570` | every alternative; and when Atlas is absent the facet is **defaulted to `EARTH-1`** for memory integration `:3570` |
| 3 | Elemental (two independent inferences) | (a) `ElementalOracleBridge.processAll({fastMode:true})` FAST `:842–863`, CORE `:1650–1658`, DEEP `:2196–2221` → `dominant` = max keyword score (`lib/bridges/elemental-oracle-bridge.ts:391–396`); stored only for logging `:863,:1680,:2221`. (b) `conversationElementalTracker.processMessage` `:1730,:2155` → `profile.dominantElement` (`lib/consciousness/conversation-elemental-tracker.ts:289`) → `summary: "Conversation: ${dominantElement} element, N turns"` `:1738` and `consciousnessInsights.dominantElement` `:1741` → CORE prompt line "Current elemental resonance: X" (`maiaVoice.ts:739`). (a)'s `dominant` also enters CORE `buildFieldContext({ element })` `:1914` → `formatFieldAddendum` `:1919` (`lib/field/fieldOrchestrator.ts:47,123,205,217`) | one element string per mechanism, injected as a fact | the score vector; the disagreement between (a) and (b); intensity of the non-dominant elements |
| 4 | Awareness / complexity / voice level | `detectAwarenessLevel` `maiaVoice.ts:571–575`; `detectInputComplexity` `:581`; `synthesizeOptimalVoice` `intelligentVoiceAdaptation.ts:283–300` | one level each | — |
| 5 | Bloom level → scaffolding | `detectBloomLevel` `maiaService.ts:2857`; FAST `:1218–1231`, DEEP `:2250`, validator `:647`: *"User is currently at Bloom Level N … Pull them toward Level N+1 … Do NOT mention Bloom's Taxonomy explicitly"* | one level + a **direction** | the member's own aim |
| 6 | Wisdom routing | `routeWisdom(input)` → one `pattern` → one agent voice `promptInjection` into the prompt: FAST `:1262–1268` + slot `${wisdomInjection}` `:1464`; CORE `:1879–1884`; DEEP `:2106–2112` (`lib/consciousness/WisdomRouter.ts:313–360`) | one voice | any second reading |
| 7 | Memory compression | history capped at 10 `:2694`; `MemoryBundle` top-5 slice `lib/memory/MemoryBundle.ts:155` (`maxBullets` default 5 `:92`) | 5 bullets | the rest (selection kept in `selectionTrace` `:164–171`, not in prompt) |
| 8 | RCN corpus override | confidence ≥ 0.7 → `rawResponse = formatRcnForMaia(…)`; cognition bypassed `maiaService.ts:3120–3135` | a corpus answer | MAIA cognition entirely |
| 9 | Socratic validator | post-hoc `REGENERATE` on one verdict `:660–680` | — | the first draft |

**What survives into the prompt as more than one reading:** nothing of the same signal. The only
counter-pressure is text: FAST Talk-mode block `maiaService.ts:1101–1150` (*"Never rush to
interpretation"*, *"Stay with what they ACTUALLY said"*, *"Assume there's 'something deeper'
without evidence"* → NEVER) and `INTERFACE_HUMILITY_GUARDRAIL` `maiaVoice.ts:484–494` (*"A signal is a
question, never a verdict … Do not collapse a signal into a conclusion without checking it with the
member first"*) — the latter reaches CORE and DEEP-repair only; FAST does not call
`appendAllContextAddenda` [census §4.1, tree `a4305f4`; the FAST slot list at `:1464` on this tree
contains no floor constants — READ]. `MAIA_RUNTIME_PROMPT.ts:13` treats contradictions "as part of
the spiral — not as failure". So: the *mind* is told to hold; the *inputs it is given* are already
resolved, and two of them (Bloom pull, CARE-mode "name the pattern" `:1158`) push toward resolution.

## 2 · The nine questions

1. **Human phenomenon.** Understanding (v0.2 §1.1: felt vs accurate understanding only moderately coupled; revision as the safeguard §2.2) and presence (§1.6). Hierarchy: **Self** primarily — the turn is where MAIA's model of the member is formed and voiced. (D, READ)
2. **Principles.** Supports P12 (speech-act boundary `maiaVoice.ts:497`; Interface Humility `:484`), P6, P13 (fail-closed constructor `construct.ts:8–10`), P11 in text. Violates/strains **P11** (nine scalar collapses, §1), **P4′ c1 / P12 clause 5** (undisclosed Bloom pull `:1224–1228`; undisclosed bypassing-based down-regulation `processingProfiles.ts:246–252`), **AP17** (a stored cognitive profile with "bypassing frequency" governs routing `cognitiveProfileService.ts:83–96`), R12 derived-retains-evidence (`summary` `:1738` is derived with no evidence beneath it). (E, READ)
3. **Self / World capacity.** Self: partially preserved by Interface Humility (member "authors the meaning"), absent on FAST. World: nothing in the turn points outward; no mechanism here returns capacity beyond MAIA (E, READ). Both UNKNOWN as outcomes (no class C).
4. **Influence (P4′ 1–9).** 1 intent transparency: **absent** (Bloom, bypassing, wisdom-voice selection are undisclosed). 2 no exploitation of susceptibility: unknowable from inside. 3 no relational feedback optimization: **met** (no approval/reward signal enters the turn — grep `rating|thumbs|reward` in `maiaService.ts` returns only unrelated lines). 4 induced shifts inspectable: **partly** — manifest + shadow give structural inspectability (`manifest.ts`), content not inspectable to the member. 5 member-authored meta-preferences: **absent** (only `declared.*` producers: epistemic path, therapeutic framework, reflection lens, maia mode — `producerRegistry.ts:256–288`). 6 process endorsement: absent. 7 dispensability: unknown. 8 corrective friction: **partly** — `MAIA_RUNTIME_PROMPT.ts:341` "tell me and we'll keep adjusting". 9 hermeneutical expansion: unknown. (E/D, READ)
5. **What it remembers.** Writes per turn: exchange to `conversation_turns` (`maiaService.ts:2659–2679` exchangeId; tail `TurnsStore.addExchange`), consent-state record `:2681–2686`, `agent_runs`/`integration_passes` `:3822–3892`, semantic embedding `:3615`, memory lattice `integrateEvent` `:3563` (with the defaulted facet, §1 row 2), optional `expansion_events` (flag `:3801`). Reads: last 10 turns `:2694`, route-supplied addenda (`shadow.ts:24–42` lists the 16 legacy keys). Manifest: **emission only, no durable table** (`manifest.ts:9–11`). Sanctuary: `TurnPosture.resolve(meta)` `:2656` passed to writers. (E, READ)
6. **Authority of that information.** Registry axes make authority explicit: `situate` (member/house/practitioner) vs `compute` vs `infer` (`producerRegistry.ts:61–330`); `member.atoms` = `marked`, `retrieved.*` = retrieved, `inferred.*` = inferred — verbatim *is* distinguishable from derived **in the manifest**. **In the prompt** they are concatenated with no ranking (`:1464`), and `inferenceCap: null` (`policy.ts:30`). Time axis: none in the turn (Temporal Memory direction, CLAUDE.md). (E, READ)
7. **Useful difference vs validation drift (AP14, AP15).** Prompt dispositions lean toward mirroring/validation: Talk "Reflect their words back simply" `:1113`; CARE "explicit validation" `:1158`. No instruction to offer difference except Interface Humility's "one way to read this… does this fit?". Outcome UNKNOWN (no transcript instrument). AP15: no optimization loop found. (E, READ)
8. **Elementally differentiated or reductive (H1 descriptive).** Reductive: elements appear as one label string (§1 row 3), not as differentiated hypotheses. (E, READ)
9. **Human evidence.** None (class C absent). Nearest: PROOF-9 `:35–38` "Member experience" is a structural witness, not a study.

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Status | Path / reason |
|---|---|---|
| agreement drift | UNKNOWN | no transcript instrument; prompt leans to mirroring (`maiaService.ts:1113`) |
| validation loops | NOT FOUND (mechanism) | no member-approval signal re-enters the prompt |
| memory-amplified sycophancy | UNKNOWN | memory addenda concatenate into FAST prompt `:1464` (atoms, conversational/episodic recall, memberWeb); no E9-style measurement exists |
| hidden shaping objectives | **FOUND** | Bloom "Pull them toward Level N+1 … Do NOT mention" `:1224–1228`, `:2250`; cognitive-profile down-regulation on "bypassing" `processingProfiles.ts:246–252`; CARE rhythm "name the pattern" `:1158` |
| approval optimization | NOT FOUND | no rating/reward/retention signal in `maiaService.ts` |
| emotional capture | NOT FOUND (code); copy flag | return-warmth examples "Glad to see you back" `maiaVoice.ts:775,778` — for E3 copy audit |
| excessive reassurance | FOUND (bounded) | CARE "Reduce pressure in one sentence" set `:1158`, self-limited ("omit if hollow") |
| historical pattern becoming identity | **FOUND** (mechanism) / counter-mechanism FOUND | `getCognitiveProfile` rolling averages + eligibility thresholds `cognitiveProfileService.ts:83–96` govern routing; `conversationElementalTracker` dominant element into `summary` `:1738`. Counter: Identity Guard `enforceIdentityPredicateConstraint` reframes system-authored identity assertions before emission `maiaService.ts:2640–2644` |
| "you said before" becoming leverage | NOT FOUND (leverage) | "You've mentioned that a few times now…" `:1120` is gated to later turns and uses their words; memory-recall instruction "quote or reference what they said" `:872–876` is informational |
| MAIA more central rather than returning capacity outward | UNKNOWN | nothing in the turn points outward; sovereignty-return lives in the conductor (other page) |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- `INTERFACE_HUMILITY_GUARDRAIL` `maiaVoice.ts:484–494` — P2, P11, P6, Invariant 16 restated in prompt (CORE/DEEP-repair only).
- `MEMORY_SPEECH_ACT_BOUNDARY` `maiaVoice.ts:497` — P12, Invariant 11 ("promise late").
- Identity Guard `maiaService.ts:2640–2644` — AP17 enforcement at egress.
- FAST Talk-mode pacing `maiaService.ts:1101–1150` — P1 ("earn understanding"), P11.
- `MAIA_RUNTIME_PROMPT.ts:13,172` — contradictions not pathology; "I don't know, but here's what I notice".
- Registry axes `authoredBy · participationClass · authority` (`producerRegistry.ts`) — Authority × Time's "verbatim beneath derived" made structural; MIPA pure and reproducible (`adjudicate.ts:4–6`).
- Fail-closed constructor, "never silently thinner" (`construct.ts:8–10`) — P13 accountability; shadow zero-diff discipline (`shadow.ts`) — P4′ c4 inspectability of change.
- Sanctuary posture resolved once per turn and passed to every writer `maiaService.ts:2656` — consent vow.
- `now-what/interview` documents its own divergence [census §1.3] — claim discipline.

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Finding | Path | Violates |
|---|---|---|
| FAST tier receives no constitutional floor (speech-act boundary, platform boundary, Interface Humility) while two comments assert it does | [census §4.1: `maiaVoice.ts:506`, `:886–888` vs FAST body]; this tree: `:1464` slot list | P6, P12; "a floor a flag can remove is not a floor" (`roomComposition` prior art, census addendum) |
| Undisclosed Bloom "pull toward next level" | `maiaService.ts:1224–1228`, `:2250` | P4′ c1 (intent transparency), P12 clause 5, AP15-adjacent (optimizing toward a system-chosen developmental direction) |
| Routing governed by a stored "bypassing" classification of the member | `processingProfiles.ts:233–258`; `cognitiveProfileService.ts:83–96` | AP17, P4′ c1, Invariant 16 (system manufactures a higher-order reading) |
| Atlas facet defaulted to `EARTH-1` when absent, written into memory integration | `maiaService.ts:3566–3570` | Interface Humility's own rule ("do not synthesize over the gap"); R12 derived-retains-evidence; P8 |
| Alternatives computed then discarded (deliberation TODO) | `:3055–3079` | P11 |
| `summary` = "Conversation: X element, N turns" — derived, no evidence beneath | `:1738` | R12; Authority × Time |
| Open `meta` channel (212 casts) — content and authority not inspectable | `:597` | P13, P4′ c4 (recorded by CMT-01; repair = M3, unauthorized) |
| `inferenceCap: null` — restraint mechanism present, unset | `policy.ts:30` | P8 restraint (a pp-1 decision, recorded not judged) |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Instrument |
|---|---|
| Whether the model's output actually resolves member contradiction too quickly | blind-rated consented transcripts (E5 method applied to P11; Phase 4 consent gate) |
| Whether floor absence on FAST changes behavior | paired FAST prompt with/without floor, offline, zero production diff |
| How often Bloom scaffolding, bypassing down-regulation, and Atlas default-facet fire in production | read-only log/DB census of `[Dialectical Scaffold]`, `[Router] DOWN-REGULATED`, and default-facet integrations — no record in repo |
| Whether `MYTHIC_ATLAS_URL` is reachable in production (else every turn runs the `UNKNOWN::UNKNOWN`/`EARTH-1` branch) | `agent_runs` where `agent_name='MythicAtlas'` status/latency — not read (no DB access) |
| DEEP-primary prompt content (`consciousnessOrchestrator`) and the `between/chat` lane's collapse points | not read this pass [census §4, §5] |
| Whether shadow zero-diff still holds on `cf6d9ebf` | last WALKED on `b20f2742e` (PROOF-9) |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, higher = riskier) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|
| G1 Serial scalar collapse before cognition (profile · facet · element · level · voice) | P11, AP17 | 4 | 5 | 2 | Shadow-only `[MAIA/interpretation-shadow]` line per turn: counts/digests of the alternatives *already computed* (Atlas `alternatives`, element score vector, router `reasoning`, both element inferences) — zero response diff, no new producer | E5 → E6 |
| G2 Hidden shaping objectives (Bloom pull; bypassing down-regulation) | P4′ c1, P12 c5, AP15 | 4 | 3 | 1 | Read-only production count of `[Dialectical Scaffold]` and `[Router] DOWN-REGULATED` markers over a window; then a disclosure-text audit (copy only) | E4 (self-disclosure stance) · new |
| G3 FAST tier lacks the constitutional floor | P6, P12 | 4 | 5 | 3 | Run the existing CMT-01 falsifiers (`tests/constitutional/refusal-registry/cmt-01-gates.ts`, R25/R26 expected RED) and record; repair = M3 (founder stop) | E4 · E9 |
| G4 Alternatives discarded; Atlas absent → `EARTH-1` default enters memory | P11, P8, R12 | 3 | 3 | 1 | Read-only census: frequency of `shouldDeliberate` and of default-facet memory integrations | E5 · E7 |
| G5 Two independent elemental inferences, one scalar each, both reach CORE prompt | P11, H1 | 3 | 3 | 1 | Shadow digest per turn of the element strings that reached the prompt vs. the score vector; agreement rate between (a) and (b) | E6 |
| G6 No instrument for interpretation collapse in output | P11 | 4 | 2 | 1 | Offline blind-rater protocol on consented transcripts (after Phase 4 consent act) | E5 · E1 |
| G7 Derived `summary` without evidence | R12, P8 | 2 | 2 | 1 | Shadow digest of `summary` vs its inputs; no prompt change | E9 |
| G8 Open `meta` channel | P13 | 2 | 5 | 2 | None new — CMT-01 M3 is the intervention and is a founder stop | CMT-01 |

## 8 · Provenance — files read, records cited, commit

**Commit:** `cf6d9ebf`. **Files read (READ):** `lib/sovereign/maiaService.ts` (:597, :660–680, :728, :832–900, :980–1000, :1090–1135, :1212–1232, :1258–1272, :1464, :1476–1492, :1558, :1640–1700, :1728–1745, :1900–1925, :2013, :2190–2240, :2530–2560, :2618–2645, :2649–2700, :2940–2985, :3020–3135, :3200–3235, :3560–3575, :3790–3900); `lib/sovereign/maiaVoice.ts` (:484–600, :733–790, :959–965); `lib/sovereign/intelligentVoiceAdaptation.ts:224–300`; `lib/sovereign/sacredMirrorProtocol.ts`; `lib/consciousness/processingProfiles.ts`; `lib/consciousness/cognitiveProfileService.ts:58–110`; `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` (grep only); `lib/consciousness/conversation-elemental-tracker.ts:289`; `lib/field/fieldOrchestrator.ts` (grep); `lib/memory/MemoryBundle.ts` (grep); `lib/services/mythicAtlasService.ts` (grep); `lib/consciousness/WisdomRouter.ts:1–60, 300–360`; `lib/maia/canonical-turn/{construct,adjudicate,manifest,shadow,policy,producerRegistry,types}.ts`; `app/api/sovereign/app/maia/list/route.ts:1240–1370`. **Records cited:** `MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` (§0–§5, addendum); `CMT-01_M0-M2_WITNESS_2026-09-03.md`; `CMT-01_M2_SHADOW_DEPLOY_RUNBOOK_2026-09-03.md`; `PROOF-9-WITNESS_2026-09-04.md` (WALKED); `MEMORY-PRODUCER-PARTITION-01.md` §13; `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md`; `SYNTHESIS_v0.2_2026-09-06.md` §1–§4; CLAUDE.md CMT-01 thread. **Not read:** `consciousnessOrchestrator`, `lib/consciousness/maiaOrchestrator.ts` beyond corpus-callosum lines, production logs or database.
