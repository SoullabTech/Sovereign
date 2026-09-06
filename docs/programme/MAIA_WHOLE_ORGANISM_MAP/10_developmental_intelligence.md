# Developmental intelligence — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

**Tree read:** `6ce59f82` (branch `claude/maia-human-experience-arch-12g5r6`). Reused, not re-derived:
Temporal Memory audit **[TM]** (`docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`), service
matrix **[MSM]** (`docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`), addenda record
**[ACD]** (`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §IX), **[AxT]**, **[CM]**.
Live chat ingress = `app/api/sovereign/app/maia/list/route.ts` (**[list]**); cognition
`lib/sovereign/maiaService.ts` (**[svc]**). Memory mechanics shared with `03_memory.md` are cited, not
repeated.

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

| Part | Path | Reaches the live prompt? | Status | Cat |
|---|---|---|---|---|
| **Spiral state** (`member_spiral_state`: `dominant_element`, `phase` 1–12, `motion`, `relational_phase` 1–4 "Not forced progression", `autonomy_streak`, `return_count`) | migration `20260213200001_member_spiral_state.sql:17–27,:42–56`; `lib/consciousness/spiralStatePersistence.ts:59–66,:96,:148` | **No.** Loaded into `buildMemberLiveContext` (`lib/memory/MemberLiveContext.ts:319,:383`, live at [list `:753`]) but `formatMemberWebForPrompt` `:436–512` never prints it; `buildMemoryInfluencePlan` input at [list `:962–972`] passes no `spiralState`, so the `spiral_state` source line (`lib/maia/memoryOrchestrator.ts:156`) cannot fire on `/list`; `upsert`/`load` wire points documented in CLAUDE.md are on `app/api/oracle/conversation/route.ts` (dormant) | stored, member-invisible, prompt-inert on the live route | 6 (store) / 3 (prompt) |
| **Spiral snapshot addendum** ("Phase Read … Deep Need … Nervous system … Wisest Move … trust this orientation") | `lib/consciousness/spiralSnapshot.ts` `generateSnapshotPromptAddendum`; FAST slot `${spiralSnapshotAddendum}` [svc `:1278,:1464`] | Only set at `app/api/between/chat/route.ts:1623` (Tier-2, zero recent `agent_runs` [ACD §IX]); `/list` never sets it → empty on the live route | designed / secondary | 6 (between) / 3 (list) |
| **Developmental `pattern` rows** | `MemoryWriteback.writeDevelopmentalMemory` `lib/memory/MemoryWriteback.ts:559–676`; `memory_type` hard-coded `'pattern'` `:641–650` ("closest semantic match for a generic significant-exchange memory"); `content_text` = regex-distilled signal from `MOVEMENT_MARKERS` (`'pattern recognized'` `:94`, `'pattern recurring'` `:96` from words like "again", "keeps happening", "this always") + `DIRECTION_MARKERS` (`'moving from repetition toward recognition'` `:154`) + tones | Yes, twice: (a) `MemoryBundle.formatForPrompt` `📚 RELEVANT MEMORIES: • [developmental/…]` `lib/memory/MemoryBundle.ts:641–644` → `memoryContext` → [svc `:985–1006`]; (b) `loadRecentDevelopmentalMemories` `lib/maia/memoryLoaders.ts:87–125` (`directional_cue`) → `memoryOrchestrator.ts:145–147` "Prior developmental direction: {cue}. Use as a background prime only, not as content to reference" | live; 2018 rows / 36 members, 100% `pattern` [TM §2] — WALKED | 6 |
| **Theme signals** (`member_theme_signals`) | `detectThemes` marker scoring `lib/consciousness/participatoryRealityHelper.ts:5,:39–54`; house vocabulary `field_awareness · pattern_recurrence · embodied_coherence · adaptive_unfolding · wise_acceptance · ripeness` (`20260316000001_participatory_reality_themes.sql:19–28`); written fire-and-forget [svc `:4003–4005`], gated `!isSanctuary` | Yes: (a) `MemberLiveContext.ts:479–493` "Candidate recurrence — system-noticed, not yet confirmed by the member (treat as tentative questions, never as facts about the member)"; (b) `memoryOrchestrator.ts:167` "hold them as soft cues only, do not name themes explicitly" | live; holds the `pattern` evidence slot (`lib/maia/substrateMap.ts:351–355`) | 6 |
| **Pattern ledger / member patterns** (`pattern_ledger` statuses `emerging · offered · confirmed · partial …` `20260204100001:18–22`; `member_patterns` `emerging · offered · confirmed · rejected` `20260316000003:12`) | writers `lib/patterns/PatternDetectionService.ts`, `upsertPatternLedger.ts`, `generatePatternIntelligence.ts`; detection callers `lib/maia/modules/PatternAwarenessModule.ts`, `lib/maia/middleware/StateInjectionMiddleware.ts`, `lib/consciousness/relationalObserver.ts` — **none imported by [svc] or [list]** (grep 2026-09-06); member gestures `lib/patterns/respondToPattern.ts:13` (`confirmed \| rejected \| preserve`) | Yes, if rows exist: `getActivePatternContext` `lib/patterns/PatternOfferingService.ts` (`status NOT IN ('retired','rejected')`) → `MemberLiveContext.activePatterns` → `formatMemberWebForPrompt` `:446–451,:505–506` **"Active Patterns (recurring structures in their life): P1 [NN% \| scope \| date]: statement"** → `memberWebAddendum` [list `:759,:1234`] → FAST slot [svc `:1337–1339,:1464`] + `ADDENDA_SPECS` | reader live; **writer liveness and production row count UNKNOWN** (no live-path caller found, no dated record) | 6 (reader) / 3 (writer) |
| **Emergent-pattern store** (`developmental_memories.memory_type='emergent_pattern'`) | `lib/memory/stores/PatternMemoryStore.ts:62–100` (`seenCount++`, `significance + 0.05`, **`last_confirmed_at = NOW()` on system re-observation** `:94`); caller `lib/memory/ConsciousnessMemoryLattice.ts:268` ← `lattice.integrateEvent` gated `memoryMode === 'longterm'` [svc `:3547–3549`] ← env `MAIA_LONGTERM_WRITEBACK` (`lib/memory/MemoryGate.ts:61–74`) | `lattice.resonanceRecall` result is logged only [svc `:2971–3010`], never enters the prompt | dormant (zero `emergent_pattern` rows in production [TM §2.e]) | 3 |
| **Relationship phase** (`new · developing · established · deep` from `morphic_resonance = min(0.1 + encounters×0.1, 1)`) | `lib/memory/RelationshipMemoryService.ts:362–379` | **Suppressed** from the prompt by founder ruling 2026-08-14 (comment in `generateRelationshipSummary`: "converts a frequency counter into relational meaning, which is prohibited"); raw counts stated | live (suppressed label) | 6 |
| **"Journey stage"** | `relationship_contexts.consciousness_journey_stage` read `lib/memory/stores/RelationshipContextStore.ts:33`, printed "Journey stage: …" `lib/memory/MemoryOrchestrator.ts:262–263` on the FAST fallback path [svc `:910–917`] | reachable when the route supplies no `memoryContext` | writer NOT FOUND (grep) — UNKNOWN whether any row is non-null | 6 (reader) / ? |
| **Single-member recurrence detector** | `lib/maia/recurrenceDetector.ts` (`formatRecurrenceForMember`: "this seems to keep coming up for you lately"; "Do NOT diagnose, predict, or assign meaning"; gated by `recurrence_recall_enabled`) | **0 callers** | dormant | 3 |
| **Cat 4 set** [MSM] | `lib/consciousness/memory/ConsciousnessEvolutionService.ts` (`masteryLevel` `:14,:281`) · `AchievementService.ts` (`pattern_mastery`: "The pattern no longer runs you…" `:17,:279`) · `MorphicPatternService.ts` (`integration_level` `:90,:208,:228`) · `QuantumFieldMemory.ts` (`🔮` `:103`, 0 persistence) · `MAIAMemoryArchitecture.ts` (`mastery: number // 1-10` `:72,:142,:255`; `'pattern_mastery'` `:368`) · `SomaticMemoryService.ts` | **No.** Zero importers in `lib/sovereign`, `lib/maia` (beyond comments in `substrateMap.ts:238–250,:358–361`), `app/api/sovereign` (grep 2026-09-06) | dormant, unrenamed (matrix recommendations not executed) | 4 |
| **Learning Spine Move 2** | `lib/learning/engineComparisonService.ts` (Loop C multi-engine comparison, `@ts-nocheck` prototype) called [svc `:3723–3728`]; `substrateMap.ts:435–436` `wired-unobserved`, "Admin altitude" | No — reviewer telemetry, not member-facing, not identity | live-unobserved | 6 |
| **Dormant mode-voice corpus** | `lib/maia/careModeVoice.ts:49` ✅ "Pattern-naming: 'I notice you tend to…'"; `lib/maia/noteModeVoice.ts:39` ✅ "You tend to circle back to this question when…", `:93` "You keep circling this because there's something unresolved here", `:113` 'reference "your patterns" directly'; `lib/maia/talkModeVoice.ts:72` "You keep coming back to this. What if that's the center?" | **No** — zero importers for all three (grep 2026-09-06) | dormant prompt corpus | 4 |
| **Live prompt-corpus rules on patterns** | FAST template [svc `:1105–1122`]: "Only after sustained dialogue: Pattern reflection becomes appropriate"; "Gentle curiosity about patterns THEY'VE named"; "'You've mentioned that a few times now…'"; atoms practitioner example `lib/maia/memoryAtomsLoader.ts:525–529` ("I notice there's a note … that you tend to pause…" descriptive vs "You always pause…" a verdict); `episodicRecallBlock.ts:128–129`; `conversationalRecallBlock.ts:121–122`; `lib/maia/epistemicToneKernels.ts:174–178,:270–271` forbids "You always / You tend to" (used by `PatternOfferingService`, `epistemicSourceTagger`); `lib/maia/organizingPrinciplesLoader.ts:54` "never 'you tend to' or 'this shows your pattern'" | Yes (FAST/CORE) | live | 6 |

## 1 · The founder's question for this subsystem

**Are repeated patterns becoming identity claims?** — **Not in the live prompt text; yes in three
labels and one block, and the present-contradiction case is unhandled.**

| Where recurrence reaches MAIA | Phrasing | AP17 reading | Status |
|---|---|---|---|
| Developmental `pattern` rows (2018/2018 rows) | `• [developmental/facet] pattern recurring; moving from repetition toward recognition; tone …` (`MemoryBundle.ts:641–644`); prime "let it bias direction subtly, do not cite it" (`memoryOrchestrator.ts:147`) | The **label** asserts recurrence for every significant exchange whether or not anything recurred (`MemoryWriteback.ts:641–650`); the **content** is a house-authored trajectory reading ("moving from repetition toward recognition") delivered as an unattributed fact; no identity sentence is written, but the model receives "pattern recurring" as data | READ; rows WALKED [TM] |
| Theme signals | "Candidate recurrence — system-noticed, not yet confirmed … treat as tentative questions, never as facts about the member" (`MemberLiveContext.ts:490–493`) | **Embodies AP17** — recurrence named as recurrence, ask-shaped | READ |
| Pattern ledger → member web | "**Active Patterns (recurring structures in their life):** P1 [72% \| relational \| 2026-08-01]: {statement}" then "silently check these threads. If relevant, reflect them briefly and **propose one integration step**" (`MemberLiveContext.ts:446–451,:505–512`) | **Contradicts AP17 / P4′ 9** — recurrence promoted to "structure of their life" with a confidence percentage, and the block instructs action on it, silently ("Do not quote this block directly") | READ; row count UNKNOWN |
| Practitioner atoms | "you tend to pause …" allowed only as a witnessed, invitational note; "You always …" named as a verdict and forbidden (`memoryAtomsLoader.ts:525–529`) | Embodies — the descriptive/verdict line is drawn in the prompt itself | READ |
| Relationship summary | counts only; `relationshipPhase` suppressed (`RelationshipMemoryService.ts`, ruling 2026-08-14) | Embodies | READ |
| Spiral snapshot (between/chat only) | "Deep Need … Nervous system … Wisest Move … trust this orientation" (`spiralSnapshot.ts`) | Contradicts P4′ 9 / P6 if it ever carried traffic — a computed reading told to be trusted at >0.6 confidence | READ; zero traffic [ACD §IX] |
| Cat 4 services / mode-voice corpus | "The pattern no longer runs you" (`AchievementService.ts:279`); `masteryLevel`; "You tend to circle back…" (`noteModeVoice.ts:39`) | Explicit recurrence-as-identity and level language — **0 importers** | READ; dormant |

**Present contradiction treated as inconsistency?** No code treats it as error, and none treats it
as change either. `detectContradiction` (`memoryOrchestrator.ts:48–51`) fires only on explicit
reversal words in the current message and then lowers memory strength to `low` (`:296`) with the
instruction "meet the current state as primary. Do not force the old frame onto new input" (`:182`)
— an AP17-consistent posture, but it never compares the present statement with a stored pattern,
never records the change, and the pattern row keeps its rank for the next turn. A present account
that contradicts a `pattern` bullet without reversal vocabulary is simply co-present with it in the
prompt; which one the model privileges is UNKNOWN (no witness).

## 2 · The nine questions

1. **Human phenomenon** — development over time without identity foreclosure (v0.2 §2.9; Invariant 16: authority moves upward only through authored experience). Hierarchy: Self. D, READ.
2. **Principles** — supports P8/AP17 at theme signals, practitioner atoms, relationship counts, contradiction handling; violates AP17 and P4′ 9 at the pattern-ledger block and the `pattern` label; violates Invariant 16 wherever a computed reading ("recurring structures in their life", `relational_phase`) is authored by the system rather than confirmed upward by the member (`respondToPattern.ts` exists as the confirm path but its status gating on `offered` is a system-initiated flow). E, READ.
3. **Self / World capacity** — Self: member confirm/reject on offered patterns (`respondToPattern.ts:13`) is a capacity surface if it is ever reached (UNKNOWN); silent primes remove the member's ability to see or contest the reading. World: nothing here points outward; `autonomy_streak` / `return_count` name the intent ("seasonal rhythm", "Not forced progression" `20260213200001:48–54`) but are neither surfaced nor acted on. E, READ / C none.
4. **Influence (P4′)** — 1 intent transparency: **absent** (silent primes, "Do not quote this block"); 4 inspectability: **absent** for members (no surface shows spiral state, patterns, or themes); 5 meta-preferences: no developmental gate (`recall-preferences/route.ts:20–22` lists `developmental_recall_enabled` as future); 8 corrective friction: present only as the lexical contradiction rule; 9 hermeneutical expansion: house vocabulary (Spiralogic phases, six theme names, "moving from repetition toward recognition") reaches the model unlabelled as Soullab's. Unknowable from inside: 6, 7.
5. **What it remembers** — per member: element/phase/motion/intensity, relational phase 1–4, streaks; distilled trajectory strings with 500-char raw; theme hits with counts and last-seen; (if written) pattern statements with confidence and status; encounter counts. E, READ.
6. **Authority (AxT)** — computed (spiral state, decay, confidence %) and system-inferred (patterns, themes, distilled signals) throughout; member-marked enters only through `respondToPattern` (`confirmed`) and practitioner atoms; **verbatim beneath derived:** pattern rows keep 500-char raw in `trigger_event.raw`, pattern-ledger statements link to `pattern_evidence` rows (`PatternOfferingService.ts` join) — neither is reachable from the prompt. The `last_confirmed_at = NOW()` on system re-observation (`PatternMemoryStore.ts:94`) conflates confirmation with recurrence (dormant). E, READ.
7. **Useful difference vs validation drift** — theme and pattern blocks feed MAIA the member's own recurring themes to reflect back; "propose one integration step" (`MemberLiveContext.ts:512`) pushes toward coherence, the P11 risk. No approval optimization found. Effect UNKNOWN.
8. **Elementally differentiated / reductive (H1)** — spiral state and theme signals carry an `element`; developmental rows carry `facet_code`; the readings are single-lens scalars (one phase, one confidence), not parallel elemental observations. Reductive.
9. **Evidence a human experiences the intended effect** — **none (class C).** Runtime facts only: 2018 `pattern` rows [TM]; `[MAIA/sovereign] developmental-block` log marker [list `:951–954`]; DEVELOPMENTAL_LAYER_AUDIT_2026-05-26 (675 rows / 10 members, cited [list `:940–941`]).

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Status | Path / reason |
|---|---|---|
| agreement drift | NOT FOUND (mechanism) | no optimization loop; "propose one integration step" `MemberLiveContext.ts:512` is a coherence push, unmeasured |
| validation loops | NOT FOUND | `PatternMemoryStore.ts:87–97` increments significance on re-observation (dormant); no approval feedback |
| memory-amplified sycophancy | UNKNOWN | member's themes/patterns reflected back; E9 not run |
| hidden shaping objectives | **FOUND** | `memoryOrchestrator.ts:127–131,:145–147` (prime, "do not cite it"); `MemberLiveContext.ts:505,:512` ("Silent context … Do not quote this block directly") |
| approval optimization | NOT FOUND in this subsystem | (breakthrough regex is in `03_memory.md`) |
| emotional capture | NOT FOUND | `relational_phase` "Not forced progression" `20260213200001:48–49`; `return_count` is tracking, not pressure |
| excessive reassurance | NOT FOUND | — |
| historical pattern becoming identity | **FOUND** | `MemberLiveContext.ts:505–506` "recurring structures in their life" + confidence %; `MemoryWriteback.ts:641–650` universal `pattern` label; dormant: `AchievementService.ts:279`, `noteModeVoice.ts:39,:93`, `careModeVoice.ts:49`, `talkModeVoice.ts:72` |
| "you said before" becoming leverage | NOT FOUND | pattern copy is invitational where it is live (`memoryAtomsLoader.ts:525–529`; `recurrenceDetector.ts` formatter, dormant) |
| MAIA more central rather than returning capacity outward | UNKNOWN | `autonomy_streak` / `return_count` designed for the opposite but unused; no outward surface |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- Theme signals labelled as candidate recurrence, tentative, member-ratifiable (`MemberLiveContext.ts:479–493`, Kelly ruling R4 2026-07-17); house theme names never spoken as facts (`memoryOrchestrator.ts:167`).
- Descriptive/verdict distinction written into the live prompt (`memoryAtomsLoader.ts:525–529`); "patterns THEY'VE named" and "You've mentioned that a few times now…" [svc `:1119–1121`]; "Do not claim a pattern, arc, or 'you always' statement unless the member names it first" (`episodicRecallBlock.ts:128–129`); "Do not name patterns that cross sessions unless the member names them first" (`conversationalRecallBlock.ts:121–122`).
- `epistemicToneKernels.ts:174–178,:270–271` and `organizingPrinciplesLoader.ts:54` encode AP17 as a forbidden register.
- Derived relational label suppressed by ruling (`RelationshipMemoryService.ts`, 2026-08-14) — a frequency counter is not relational meaning.
- Contradiction lowers prior direction rather than correcting the member (`memoryOrchestrator.ts:179–183,:296`).
- Member confirm/reject/preserve on offered patterns exists (`respondToPattern.ts:13`); `member_patterns` status vocabulary includes `rejected` (`20260316000003:12`); ledger reader excludes `retired/rejected` (`PatternOfferingService.ts`).
- `member_spiral_state` documented as "NOT conversation content … Not forced progression" (`20260213200001:42–49`); anti-regression, not progression.
- Single-member recurrence detector (dormant) already phrases recurrence as the member's own and forbids diagnosis (`recurrenceDetector.ts`).

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Finding | Path | Violates |
|---|---|---|
| "Active Patterns (recurring structures in their life)" with confidence % and "propose one integration step", silent | `MemberLiveContext.ts:446–451,:505–512` | AP17; P4′ 1, 9; P11; Invariant 16 |
| Every significant exchange stored as `memory_type='pattern'` and rendered as `[developmental]` "pattern recurring; …" | `MemoryWriteback.ts:94–96,:641–650`; `MemoryBundle.ts:641–644` | AP17 (label asserts recurrence never observed); AxT class unlabelled |
| House-authored trajectory vocabulary ("moving from repetition toward recognition") enters cognition as data | `MemoryWriteback.ts:154`; `memoryLoaders.ts:114` | P4′ 9 (hermeneutical replacement); AxT house-authored class unmarked |
| No comparison of a present statement to a stored pattern; no ask; no record of change | `memoryOrchestrator.ts:48–51,:179–183` (lexical only); `shouldPromptForConfirmation` 0 callers [TM] | AxT C, D; R12 "later contradiction → detect"; P8 open future |
| Silent priming from remembered direction | `memoryOrchestrator.ts:127–131,:145–147` | P4′ 1, 4; P12 |
| Spiral snapshot "trust this orientation" / "Deep Need" / "Wisest Move" | `lib/consciousness/spiralSnapshot.ts` (between/chat only) | P4′ 9; P6; H1 (system says you are in X) — dormant by traffic |
| `last_confirmed_at = NOW()` on system re-observation | `PatternMemoryStore.ts:94` | AxT (confirmation is member authority) — dormant |
| Cat 4 services unrenamed with "mastery", "level", "The pattern no longer runs you" | [MSM] recommendations not executed; `AchievementService.ts:279`, `ConsciousnessEvolutionService.ts:14`, `MAIAMemoryArchitecture.ts:72,:368` | AP17; substrate-monitor forbidden register [MSM canaries] — dormant |
| Dormant mode-voice corpus endorses "You tend to…" / "You keep circling this because…" | `careModeVoice.ts:49`, `noteModeVoice.ts:39,:93,:113`, `talkModeVoice.ts:72` | AP17 — contradicts `epistemicToneKernels.ts:174–178` inside the same corpus; 0 importers |
| Spiral state stored about the member with no member-visible surface and no gate | `member_spiral_state`; `app/api/members/spiral-state/route.ts` (not audited for member visibility) | P4′ 4, 5 |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Instrument (read-only / shadow) |
|---|---|
| Do `pattern_ledger` / `member_patterns` rows exist in production, in which statuses, for how many members — i.e. does the "Active Patterns … recurring structures in their life" block ever render? | read-only SQL counts by status; grep `🕸️ [FAST] Member web injected` [svc `:1339`] and `prompt_block_layers` for `memberWeb` |
| Which live path (if any) writes the ledger (`PatternAwarenessModule`, `StateInjectionMiddleware`, `relationalObserver` — none imported by [svc]/[list]) | import-graph check from `app/api/**` beyond the sovereign route; log grep for `[PatternDetection]` markers |
| Does a present statement that contradicts a rendered `pattern` bullet get privileged or overridden by the model | E9 model-side replay: same turn with and without the developmental bullets; blind rating of whether the response treats the present statement as primary |
| Does `relational_phase` / `autonomy_streak` carry any production distribution; is anything member-visible at `app/api/members/spiral-state` | read-only SQL distribution; read the route |
| Whether `consciousness_journey_stage` is ever non-null (writer not found) | SQL count |
| Whether the developmental prime changes tone measurably (the intended effect) | E9 arms none / derived; no dyad |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| D1 Present statement never compared to stored pattern; contradiction lexical only; no ask, no record | AxT C · R12 · AP17 | 5 | 5 | 3 | inferred (absence) | high | offline shadow comparator over consented/synthetic transcripts: present turn vs that member's `pattern` bullets and ledger statements; log candidates only; zero response diff | E7 |
| D2 "Active Patterns (recurring structures in their life)" + confidence % + "propose one integration step" | AP17 · P4′ 9 · P11 | 4 | 3 | 2 | observed (code); rendering frequency unknown | medium | production SQL census of ledger/member_patterns rows by status + log grep for the member-web marker; if >0, capture rendered block (shadow) | E9 · new: pattern-offer witness |
| D3 Universal `pattern` label and house trajectory vocabulary rendered as data | AP17 · P4′ 9 · AxT | 3 | 4 | 1 | observed (WALKED: 2018/2018) | high | none — finding; vocabulary decision is an Episodic Phase 2 spec input | E9 (derived arm) |
| D4 Silent developmental priming; "Do not quote this block" | P4′ 1, 4 · P12 | 3 | 3 | 2 | observed | high | E9 arms (none / derived); E4 disclosure witness | E9 · E4 |
| D5 No member surface or gate for spiral state, themes, patterns | P4′ 4, 5 · P8 | 3 | 3 | 2 | observed | high | inventory (this page) + read-only distribution query; consent act designs the surface | new: consent act (Phase 4) |
| D6 Spiral snapshot "trust this orientation" on between/chat | P4′ 9 · P6 · H1 | 2 | 2 | 2 | observed; zero traffic [ACD §IX] | medium | confirm `agent_runs` for `/api/between/chat` remains 0; register as forbidden-register example | E5/E6 (Elemental H1 offline first) |
| D7 Cat 4 services unrenamed; mode-voice corpus with identity language; both 0 importers | AP17 · [MSM] | 1 | 2 | 1 | observed | high | copy audit registering the strings as forbidden-register examples; no runtime | E3 (copy audit) |
| D8 `last_confirmed_at = NOW()` on system re-observation (dormant) | AxT authority | 2 | 3 | 1 | observed | high | none — spec input (confirmation must be a member act) | E7 |
| D9 "Journey stage" printed from a column with no found writer | AP17 · claim discipline | 2 | 2 | 1 | unknown | low | SQL null-count | — |
| D10 `autonomy_streak` / `return_count` designed centrifugally, unused | P5 · P7 | 2 | 3 | 1 | observed | high | read-only distribution; do not surface | E10 (design input) |

## 8 · Provenance — files read, records cited, commit

Tree `6ce59f82`. Files read (line numbers cited above): `lib/consciousness/spiralStatePersistence.ts` ·
`lib/consciousness/spiralSnapshot.ts` · `lib/consciousness/participatoryRealityHelper.ts` ·
`lib/memory/MemberLiveContext.ts` · `lib/memory/MemoryWriteback.ts` · `lib/memory/MemoryBundle.ts` ·
`lib/memory/MemoryGate.ts` · `lib/memory/MemoryOrchestrator.ts` · `lib/memory/RelationshipMemoryService.ts` ·
`lib/memory/stores/PatternMemoryStore.ts` · `lib/memory/stores/RelationshipContextStore.ts` ·
`lib/memory/ConsciousnessMemoryLattice.ts` (call site only) · `lib/maia/memoryOrchestrator.ts` ·
`lib/maia/memoryLoaders.ts` · `lib/maia/recurrenceDetector.ts` · `lib/maia/memoryAtomsLoader.ts` ·
`lib/maia/episodicRecallBlock.ts` · `lib/maia/conversationalRecallBlock.ts` · `lib/maia/epistemicToneKernels.ts` ·
`lib/maia/organizingPrinciplesLoader.ts` · `lib/maia/careModeVoice.ts` · `lib/maia/noteModeVoice.ts` ·
`lib/maia/talkModeVoice.ts` · `lib/maia/substrateMap.ts` · `lib/patterns/PatternOfferingService.ts` ·
`lib/patterns/respondToPattern.ts` · `lib/learning/engineComparisonService.ts` ·
`lib/consciousness/memory/{ConsciousnessEvolutionService,AchievementService,MorphicPatternService,QuantumFieldMemory,MAIAMemoryArchitecture}.ts` (grep only) ·
`lib/sovereign/maiaService.ts` · `lib/sovereign/maiaVoice.ts` (`ADDENDA_SPECS`) · `app/api/sovereign/app/maia/list/route.ts` ·
`app/api/between/chat/route.ts:1623` (grep only) · migrations `20260213200001_member_spiral_state.sql`,
`20260204100001_pattern_ledger.sql`, `20260316000001_participatory_reality_themes.sql`,
`20260316000003_member_patterns.sql`. Records cited: [TM] audit 2026-09-06, [MSM], [ACD] §IX, [AxT],
[CM] (DEVELOPMENTAL_LAYER_AUDIT_2026-05-26 via list-route comment; Learning Spine Move 2), Synthesis
v0.2 §2–§4, master run §5. No network, no database, no production access; WALKED marks rest on those
dated records only.
