# Conductor — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

**Reads against:** P3 · AP14 · AP15. **Founder's question:** *can MAIA detect drift, over-validation and misattunement?*

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

"Conductor" is not one module. Five mechanisms answer to the name; only two are on the live path.

| Mechanism | Path | Status (E) | Cat |
|---|---|---|---|
| Element hysteresis + route scoring + Bridge D seeding | `lib/voice/conductor.ts:40-108` (hysteresis: switch only on 2 consecutive turns or intensity ≥ 0.8), `:160-243` (`scoreRoute`, ten `includes()` cues per element, archetype cues `:150-154`), `:256-353` (`createVoiceIntent`; persisted-state seeding `:266-275`) | **DORMANT.** Sole caller `app/api/oracle/conversation/route.ts:8, :1585`. That route returns **410 as its first executable statement** (`:449-452`; pinned by `tests/constitutional/refusal-registry/refusal-19-oracle-lane-disabled.ts:1-16`, "zero traffic in 60 days", ruling 2026-07-17). No other importer (`grep createVoiceIntent lib app components`). | Cat 4 |
| Spiral state persistence (Bridge D) | `lib/consciousness/spiralStatePersistence.ts:64-66` (`relational_phase`, `autonomy_streak`, `return_count`), `:96` load, `:148` upsert; migration `database/migrations/20260213200001_member_spiral_state.sql` | **Written only by the retired route** (`app/api/oracle/conversation/route.ts:1611`); no `upsertSpiralState(` under `app/api/sovereign`, `lib/sovereign`, `lib/maia`, `lib/memory`. Read by `lib/memory/MemberLiveContext.ts:319, :383, :418` but **never rendered** by `formatMemberWebForPrompt` (`:436+`, no spiral/element/phase reference); read by UI (`components/consciousness/ContinuityView.tsx`, `components/maia/living-field/*`) and `app/api/members/spiral-state/route.ts` (GET). | Cat 3 (rows frozen at retirement) |
| Sovereignty-return "dance algorithm" | `lib/relational/relationalStance.ts:1-15` — HOLD / CHALLENGE / SEASONAL_RETURN / RELEASE / MIRROR; "Dependency pull → MIRROR (return authorship harder, do NOT hold tighter)" | **DORMANT.** Only caller is the retired route (`app/api/oracle/conversation/route.ts:1704-1711`) through the R16 admission boundary `lib/relational/developmentalStateAdmission.ts:1-40` (strips `relational_phase`/`autonomy_streak` class; `return_count` passes). | Cat 4 |
| Tier routing FAST / CORE / DEEP | `lib/consciousness/processingProfiles.ts:47-282` `MaiaConversationRouter`; called `lib/sovereign/maiaService.ts:3091`; dispatch `:3266-3310` | **LIVE.** Heuristics on text length / turn count / process language (`:95-221`), then **cognitive routing adjustments** (`:228-267`) from `getCognitiveProfile(userId)` (`:70`; `lib/consciousness/cognitiveProfileService.ts:1-30`; source table `cognitive_turn_events`, `lib/consciousness/cognitiveEventsService.ts:136`): `rollingAverage`, `stability`, `bypassingFrequency.{spiritual,intellectual}`, `fieldWorkSafe`. DOWN-regulates DEEP→CORE for "low cognitive altitude" (`:239-243`) and "high bypassing" (`:246-251`); UP-regulates FAST→CORE for "high cognitive level + ascending" (`:254-259`). | Cat 6 |
| Mode selection Talk / Care / Note | `app/api/sovereign/app/maia/list/route.ts:1295` (`requestedMode = meta.mode`), `:1314` (`counsel` \| `scribe` \| default `dialogue`); prompt adaptation `lib/sovereign/maiaVoice.ts:760-834` | **LIVE, member-selected.** Not inferred. Crisis is the one hard override to care (`components/OracleConversation.tsx:6782-6783`). Talk prompt `:765-766`: *"Sacred mirror through conversational inquiry … NLP techniques — presencing, pattern interruption, reframing."* Note prompt `:826-834`: *"Pure witnessing … without interpretation."* | Cat 6 |

Adjacent live and dormant guards that bear on the founder's question:

| Guard | Path | Status |
|---|---|---|
| Live per-turn element detection (what actually stands in for the conductor on the live path) | `lib/bridges/elemental-oracle-bridge.ts:205` `processAll`, called `lib/sovereign/maiaService.ts:844-850`; result stashed `(meta as any).elementalResult` `:863, :1680` | LIVE. **No hysteresis** (`grep -i hysteresis\|previousElement` → none). Per-turn, no stability across turns. |
| Socratic Validator (pre-delivery) | `lib/validation/socraticValidator.ts:1-14` (five layers), rupture codes `:146-470`: `NON_IMPOSITION_OF_IDENTITY` (`:138-153`, "you are …ing", "I can tell", "clearly you"), `EXPLICIT_HUMILITY` (`:156-170`, ≥3 certainty words), `PACE_WITH_CARE`, `FIRE_IN_WATER` (CRITICAL `:235-236`), `WATER_IN_FIRE`, `FALSE_CERTAINTY_WHEN_UNCERTAIN`, `MISSION_DURING_GRIEF`, `SPIRITUAL_BYPASSING`, `FIRE_PRACTICES_IN_WATER`, `RUSHING_DEVELOPMENT`, `MIND_MOUTH_COLLAPSE_*`, `CLINICAL_IN_TENDER` | LIVE on all three tiers — `lib/sovereign/maiaService.ts:1536` (FAST, **no regeneration function**), `:1963` (CORE, regenerates), `:2424` (DEEP, regenerates). Events persisted to `socratic_validator_events` (`:711`; migration `database/migrations/20260115000009_socratic_validator_events.sql`). |
| Decision governor (posture) | `lib/sovereign/decisionGovernor.ts:1-45` — "posture selection, not classification-as-truth"; `modeHint` FAST/CORE/DEEP | Callers: `app/api/between/chat/route.ts`, `lib/maia/canonical-turn/producerRegistry.ts` (registered producer). Not read further here. |
| Participation-disposition contract `pdc-1` | `lib/maia/canonical-turn/participationDisposition.ts:1-70`; `docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md:27-58` | Type contract; "no adjudication logic, no I/O, no live caller until M1" (`:8`). M1–M2 shadow on `/list` only (CLAUDE.md priority thread). HELD ≠ EXCLUDED; held content never reaches the speaking model. |
| MAIA-side rupture & repair | `lib/consciousness/ruptureRepairSystem.ts:1-30` — member phrases ("this is bullshit", "what the hell") → categories `not-listening / too-cold / self-focused / unhelpful`; `RepairScript` = acknowledge → responsibility → redirect | **Built, ZERO callers** (`grep ruptureRepairSystem lib app components` → only itself). Cat 4. |
| Member-relationship rupture (not MAIA's) | `lib/relationships/detectRelationalSignal.ts`, live at `app/api/sovereign/app/maia/list/route.ts:1830`; `rupture_state` contained both ways by founder ruling 2026-08-13 (`lib/relationships/__tests__/ruptureContainment.test.ts:1-25`) | LIVE detector, rupture assertion refused at write and read. Concerns the member's human relationships, not misattunement between MAIA and the member. |
| Clarify-engagement-shape (responsive restraint) | `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md:144-170` — design closed 2026-05-26, helpers "not written", wire site "untouched" | **No code** (`grep engagementShape\|clarify-engagement lib app` → none). Cat 5 (frozen behind Gate 4). |
| Corrective friction (P4′ commitment 8) | — | **No code** (`grep -i "corrective.friction" lib app` → none). |
| Non-sycophancy modules | `lib/consciousness/MAIACriticalQuestioningInterface.ts:90, :140` ("non-sycophantic perspectives"); `lib/safety/consensus-engine.ts` | Callers: `lib/consciousness/MAIAEmpowermentOrchestrator.ts`, `app/api/empowerment/orchestrate/route.ts`; `lib/safety/self-auditing-orchestrator.ts`. **Not on the `/list` path.** |
| Prompt-level guards | `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:14` ("name that honestly rather than faking certainty"), `:452` ("Don't use phrases like 'that makes sense' as filler — only when it genuinely validates") | LIVE via `lib/sovereign/maiaService.ts:1027`, `lib/sovereign/maiaVoice.ts:585`. CMT-01 census **D1**: FAST tier does not receive `INTERFACE_HUMILITY_GUARDRAIL`, `PLATFORM_KNOWLEDGE_BOUNDARY`, memory speech-act boundary (`docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md:352, :507`). |
| Approval signals | `app/api/feedback/` exists; `grep message_feedback\|response_feedback\|feedback_rating lib` → only `lib/memory/SemanticMemoryService.ts` | No consumer of member ratings in routing, prompt selection or tuning found. |

## 1 · The founder's question for this subsystem

**Can MAIA detect drift, over-validation and misattunement? — No, not on the live path. (E, READ.)**

- **A signal that the system got the member wrong:** none live. The only artifact built for it (`ruptureRepairSystem.ts`, member-voiced complaint → repair script) has zero callers. The one observed correction loop is the model's own behaviour under direct challenge (`CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md:15`, 2026-05-25, class C-adjacent founder observation, n=1).
- **Agreement-rate or validation guard:** none. The Socratic Validator's patterns (`socraticValidator.ts:138-470`) target projection, certainty, rushing, elemental mismatch, bypassing and text corruption. **No pattern targets agreement, flattery, repetition of the member's framing, or reassurance.** `grep -i "sycophan\|flatter\|agreement.rate\|validation.spiral" lib app` finds only unreached modules. AP14 has no instrument.
- **Drift:** the live element read is per-turn with no hysteresis; the hysteresis that exists is on a 410 route. Tier drift is *produced*, not detected: the router moves the member between tiers from a persisted inferred "cognitive altitude" (`processingProfiles.ts:228-267`).
- **Misattunement:** the Socratic Validator detects MAIA's response diverging from *MAIA's own* elemental/phase model (`FIRE_IN_WATER` is CRITICAL), i.e. misattunement-to-model. Nothing measures misattunement-to-member as the member experiences it (no member-side signal, no repair grammar NOTICE → NAME → … → RETURN AUTHORITY in code).
- **Useful difference (P4′-8):** the Talk prompt asks for "pattern interruption, reframing" as NLP technique (`maiaVoice.ts:766`) — difference as an undisclosed influence method, not as a measured guard. No corrective-friction mechanism exists.

## 2 · The nine questions

1. **Human phenomenon.** Attunement as adaptive fit; rupture and correction (v0.2 §1.2). Position: **Relationship** (MAIA ⇄ member), with Self as the party whose authorship is to be returned. (D, READ.)
2. **Principle.** Supports P3 in doctrine only; **no live mechanism for correction or re-attunement**. Router's cognitive adjustments touch AP17 / Invariant 16 (inferred developmental read shaping treatment) and P4′-2 (a susceptibility signal — "bypassing" — changes treatment silently). Talk-mode NLP instruction touches P4′-1 (intent transparency). Member-selected mode embodies P4′-5 / P12. (E, READ.)
3. **Self / World capacity.** Self: mode choice and Note-mode non-interpretation preserve it; tier down-regulation for "low cognitive altitude" *decides depth for the person* (Self capacity not preserved by design; unmeasured). World: nothing in this subsystem points outward; relationalStance RELEASE ("diminish centrality") is dormant. (E, READ; C: none.)
4. **Influence (P4′ 1–9).** 1 intent transparency — **absent** (NLP reframing undisclosed; tier changes undisclosed). 2 no exploitation of susceptibility — **contradicted in shape** by router bypassing/altitude rules and the dormant `companion` archetype cue on "lonely", "just need someone" (`conductor.ts:152`; threshold 0.75 `:121`). 3 no relational feedback optimization — **met** (no rating consumer found). 4 induced shifts inspectable — **absent** (no record of tier/element decisions surfaced to the member; `[conductor-score]` log only, dormant). 5 member meta-preferences — **partly** (mode is member-chosen). 6 process endorsement — **absent**. 7 dispensability — **unknowable from inside**. 8 corrective friction — **absent**. 9 hermeneutical expansion — **unknown** (elemental cue vocabulary never shown to the member on the live path). (E, READ.)
5. **Remembers.** Live: `cognitive_turn_events` rolling window (default 20 turns) → routing; `socratic_validator_events` per response; in-memory hysteresis buffer (dormant, resets on restart). Dormant persisted: `member_spiral_state.{dominant_element, phase, relational_phase, autonomy_streak, return_count}`, frozen since route retirement. (E, READ.)
6. **Authority.** All of it is **system-inferred / computed** (pdc-1 axes: `{system, inferred, infer}` for cognitive profile and spiral state). None is member-marked. R16 exists as an admission boundary *only for the dormant route*; the live router reads inferred state with no admission boundary. Derived stands with no verbatim beneath it (the turn text is not retained by these tables). (E, READ.)
7. **Useful difference or validation drift?** Neither instrumented. Prompt asks for difference (NLP), validator forbids projection and certainty — **no detector on the agreement axis at all** (AP14 unmeasured); AP15 met by absence of optimization. (E, READ.)
8. **Elementally differentiated?** Element is read per turn by `ElementalOracleBridge` and used to pick prompt style and to police the response (`FIRE_IN_WATER`). H1 descriptive only: this is a single-lens classifier followed by a police check, not parallel readings preserving disagreement. (E, READ; no runtime claim.)
9. **Human evidence.** **None** (class C absent). One founder observation of felt withdrawal + self-correction (2026-05-25) is the only dated human report touching this subsystem.

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Verdict | Where |
|---|---|---|
| agreement drift | **UNKNOWN** — no detector; cannot be read from code | `socraticValidator.ts:138-470` (no agreement pattern) |
| validation loops | **NOT FOUND** as mechanism; **UNKNOWN** as behaviour | same |
| memory-amplified sycophancy | **UNKNOWN** — out of this page (Memory page); routing reads inferred history, not content | `processingProfiles.ts:70` |
| hidden shaping objectives | **FOUND** — "NLP … pattern interruption, reframing" instruction undisclosed (`maiaVoice.ts:765-766`); tier up/down-regulation from inferred cognitive profile undisclosed (`processingProfiles.ts:239-267`); dormant `PacingModulation` "Influence Through Modeling" (`lib/voice/PacingModulation.ts:1-8`, no live caller) | as cited |
| approval optimization | **NOT FOUND** — no rating consumer in routing/prompt | `app/api/feedback/`; grep negative |
| emotional capture | **NOT FOUND live**; **FOUND dormant** — "lonely" / "just need someone" → `companion` archetype (`conductor.ts:152`), 410-gated | `conductor.ts:150-154` |
| excessive reassurance | **NOT FOUND** as mechanism; prompt discourages filler validation (`MAIA_RUNTIME_PROMPT.ts:452`); **UNKNOWN** as behaviour | — |
| historical pattern becoming identity | **FOUND (shape)** — `cognitiveProfile.rollingAverage/stability/bypassingFrequency` treated as a standing property routing depth; `member_spiral_state.relational_phase/autonomy_streak` (dormant, R16-guarded) | `processingProfiles.ts:228-267`; `spiralStatePersistence.ts:64-66` |
| "you said before" becoming leverage | **NOT FOUND** in this subsystem (no content recall here) | — |
| MAIA becoming more central rather than returning capacity outward | **NOT FOUND** as mechanism; the mechanism designed to return power (relationalStance RELEASE/MIRROR) is **dormant** | `relationalStance.ts:1-15` |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **R16 admission boundary** — refuses persisted inferred developmental state from shaping treatment (`lib/relational/developmentalStateAdmission.ts:1-40`; `refusal-16-developmental-state-shaping-guard.ts:1-24`). AP17 / Invariant 16 in code — for the dormant route.
- **R19** — legacy conversation lane hard-refused rather than patched (`refusal-19:1-16`). Claim discipline in code.
- **Member-selected mode**, not inferred (`list/route.ts:1295-1314`) — P4′-5, P12.
- **Note mode** forbids interpretation (`maiaVoice.ts:826-834`) — P2, P11.
- **Socratic `NON_IMPOSITION_OF_IDENTITY` / `EXPLICIT_HUMILITY` / `FALSE_CERTAINTY_WHEN_UNCERTAIN`** (`socraticValidator.ts:138-170, :283`) — P2, P6, AP6 on the projection/certainty axis, logged per response.
- **pdc-1 HELD ≠ EXCLUDED** and closed reason families (`participationDisposition.ts:1-30`) — inspectability of what participated (P4′-4 substrate), shadow only.
- **Rupture-state containment** — inferred rupture never served (`ruptureContainment.test.ts:1-25`) — AP6 on the member's relationships.
- **Prompt anti-filler-validation** (`MAIA_RUNTIME_PROMPT.ts:452`) — P1.
- **No approval optimization found** — AP15 met by absence.

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Finding | Path | Violates |
|---|---|---|
| Live router changes depth from a persisted inferred "cognitive altitude" and "bypassing frequency" with no admission boundary and no disclosure | `processingProfiles.ts:228-267`; source `cognitiveEventsService.ts:136` | AP17 (recurrence → standing trait), Invariant 16, P4′-1, P4′-2 (a susceptibility read alters treatment), P12 |
| Talk prompt instructs undisclosed NLP "pattern interruption, reframing" as method | `maiaVoice.ts:765-766` | P4′-1 (intent transparency); P4′-8 wants friction *for reality, plurality, agency*, not technique |
| No misattunement / correction / re-attunement mechanism on the live path; the one built has zero callers | `ruptureRepairSystem.ts` (0 callers); no repair grammar in code | P3 (as refined: correction is intelligence) |
| No agreement-axis instrument anywhere | `socraticValidator.ts` codes | AP14 unenforceable; AP15 unverifiable beyond absence |
| Validator treats `FIRE_IN_WATER` as CRITICAL and regenerates on CORE/DEEP — the system's element model overrides the response the member would have received | `socraticValidator.ts:235-236`; `maiaService.ts:1963, :2424` | P11 (premature resolution by frame), hermeneutical expansion P4′-9 (system vocabulary governs) — *shape*, magnitude unknown |
| FAST tier lacks three standing guardrails (D1) while receiving no regeneration | `maiaService.ts:1536-1543`; census `:352` | P6, P12 (tier-conditional honesty) |
| Dormant loneliness-cue → `companion` archetype | `conductor.ts:152` | P4′-2 shape (410-gated; would violate if revived) |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Why unreadable | Instrument |
|---|---|---|
| Whether live responses drift toward agreement over a session / across sessions | behaviour of the model, not code | offline blind rating of consented transcripts on agreement / repetition-of-framing / useful-difference (E9 dimensions) |
| Production rate of Socratic `REGENERATE` / `FIRE_IN_WATER` and what it changed | needs `socratic_validator_events` read (no DB access) | read-only SQL census of decision × code × tier |
| How often the router down-regulates, for whom, and whether members notice depth changing | needs `cognitive_turn_events` + router log lines | read-only log census of `🧠 [Router] DOWN-REGULATED` / `UP-REGULATED` |
| Whether the member experiences Talk-mode "reframing" as difference or as steering | class C only | consented witness (E1 adjacent) |
| Whether `member_spiral_state` rows still influence anything (UI-only readers) | UI reading confirmed; effect on member unknown | copy walk of `ContinuityView` / living-field with a member |
| Whether the `app/api/feedback` payloads reach any tuning outside this repo | no external evidence | founder statement suffices (accountable party, P13) |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| C1 No misattunement / correction signal on the live path | P3, AP14 | 5 | 4 | 2 | observed (absence in code) | high | **Shadow** member-complaint detector: log-only classification of the member's *next* turn as correction / disagreement / "that's not it" (no response change), emitting `[MAIA/shadow] correction-candidate` with counts only | **E1** |
| C2 Router shapes depth from inferred cognitive altitude / bypassing, undisclosed | AP17, Inv 16, P4′-1/2 | 4 | 5 | 2 | observed | high | Read-only census of router regulation log lines by member-prefix and direction; then a **shadow** run of the router with cognitive adjustments disabled, diffing chosen tier per turn (no response change) | new — **E-tier** (routing influence inspectability) |
| C3 No agreement-axis instrument (AP14/AP15 unmeasurable) | AP14, AP15, P2 | 5 | 4 | 1 | unknown | medium | Offline blind rating of consented transcripts on the E9 dimensions (excessive agreement, framing repetition, useful difference) — model-side first | **E9** |
| C4 Undisclosed NLP "pattern interruption, reframing" in Talk prompt | P4′-1, P4′-8 | 3 | 3 | 2 | observed | high | Prompt census only (no edit): list every technique-instruction across mode prompts; founder decides what "intent transparency tracking materiality" requires | **E4**-adjacent (prompt behaviour), new copy audit |
| C5 Validator regenerates on `FIRE_IN_WATER` (system frame overrides response) | P11, P4′-9 | 3 | 3 | 2 | inferred (code shape; rate unknown) | medium | Read-only SQL census of `socratic_validator_events` by code × decision × tier; sample the before/after pairs (already stored) for a blind read | **E6**-adjacent; new |
| C6 FAST lacks guardrails and regeneration (D1) | P6, P12 | 3 | 4 | 1 | observed | high | None new — already a CMT-01 finding; count FAST share of turns from router log | CMT-01 (not an experiment) |
| C7 Repair mechanism built, never wired; dormant hysteresis / stance engine | P3 | 2 | 2 | 1 | observed | high | Name them Cat 4 in the ranked map; no wiring during census | — |
| C8 Loneliness-cue → companion archetype (dormant) | P4′-2 | 1 | 1 | 1 | observed (410-gated) | high | Record as a revival hazard; no action | E3 copy-audit family |

## 8 · Provenance — files read, records cited, commit

Commit at census: `cf6d9ebf` (2026-09-06). Note: repository history begins at `2f8d9729` (2026-09-02, 393 commits since); file-level `git log` dates therefore carry no provenance before that point.

Files read (line-cited above): `lib/voice/conductor.ts` (full) · `app/api/oracle/conversation/route.ts:449-452, :648, :1583-1635, :1704-1714` · `lib/consciousness/spiralStatePersistence.ts:64-214, :325-380` · `lib/relational/relationalStance.ts:1-30` · `lib/relational/developmentalStateAdmission.ts:1-40` · `lib/consciousness/processingProfiles.ts:12-282` · `lib/consciousness/cognitiveProfileService.ts:1-30` · `lib/consciousness/cognitiveEventsService.ts:136` · `lib/sovereign/maiaService.ts:11-13, :632-720, :844-863, :1027, :1536-1544, :1682-1700, :1963-1970, :2424-2432, :3091-3098, :3200-3262, :3266-3310, :3384-3398` · `lib/sovereign/maiaVoice.ts:585, :758-834` · `app/api/sovereign/app/maia/list/route.ts:11-12, :529, :836-837, :1295-1318, :1824-1842` · `lib/validation/socraticValidator.ts:1-60, :130-180, :235-470` · `lib/sovereign/decisionGovernor.ts:1-45` · `lib/maia/canonical-turn/participationDisposition.ts:1-70` · `lib/consciousness/ruptureRepairSystem.ts:1-30` · `lib/relationships/__tests__/ruptureContainment.test.ts:1-25` · `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:14, :452` · `lib/consciousness/opus-axioms.ts:1-30` · `lib/memory/MemberLiveContext.ts:319-436` · `lib/bridges/elemental-oracle-bridge.ts:205-328` · `tests/constitutional/refusal-registry/refusal-16-*.ts:1-30`, `refusal-19-*.ts:1-16` · `components/OracleConversation.tsx:6718-6800`.

Records cited: `docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md:1-58` · `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md:170-180, :352, :507-513` · `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md:9-40, :144-189` · `docs/research/human-experience/SYNTHESIS_v0.2_2026-09-06.md §1.2, §2.4, §2.7, §3, §4, §6` · `docs/research/human-experience/anti-patterns/ANTI_PATTERNS_v0.1.md:13-64` · `docs/research/human-experience/principles/PROVISIONAL_PRINCIPLES_v0.1.md:210-218` · migration `database/migrations/20260115000009_socratic_validator_events.sql` (name only).

No runtime, database or production access was used. WALKED status is claimed for nothing on this page.
