# Memory — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

**Tree read:** `6ce59f82` (branch `claude/maia-human-experience-arch-12g5r6`). Line numbers are for
this tree. Prior findings reused, not re-derived: Temporal Memory audit F1–F3
(`docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`, **[TM]**), addenda-channel record
(`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §VIII–§IX, **[ACD]**), service matrix
(`docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`, **[MSM]**), Authority × Time
(`docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`, **[AxT]**),
CLAUDE.md priority thread (**[CM]**). Live chat ingress = `app/api/sovereign/app/maia/list/route.ts`
(**[list]**); cognition = `lib/sovereign/maiaService.ts` (**[svc]**). `/api/oracle/conversation` is
`dormant` (`docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md:194–198`); `/api/between/chat` is
Tier-2 with zero recent `agent_runs` [ACD §IX].

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

| Layer | Write path (who authors) | Read → prompt path on the live route | Status | Cat |
|---|---|---|---|---|
| **Atoms** (`member_memory_atoms`) | member gesture only — `lib/psyche/portfolio.ts`; practitioner obs. `app/api/studio/with-me/sessions/[sessionId]/route.ts`; loader header "Does NOT write atoms" `lib/maia/memoryAtomsLoader.ts:28` | `loadMemberMemoryAtomsForPrompt` `:230` (SQL consent predicates `:283–288`) → `formatAtomsForPrompt` `:589` → `atomsAddendum` [list `:1001–1006`] → FAST slot [svc `:1464`] + `ADDENDA_SPECS` (`lib/sovereign/maiaVoice.ts`) | live; `prompt_block_layers atoms:true` in production [ACD §IX] — WALKED 2026-07-13 | 6 |
| **Breakthrough flag** | only `app/api/sovereign/atoms/[id]/breakthrough/route.ts:1–24` ("The system never auto-marks") | ordering `is_breakthrough DESC` `memoryAtomsLoader.ts:288`; rendered "marked as a breakthrough by the member" `:482–483`; log `[MAIA/sovereign] breakthrough surfaced` [list `:1165–1174`] | live-reachable; UI gesture deferred [CM]; first marked surfacing under load not recorded — UNKNOWN | 6 (reachable) |
| **Practitioner decline** | only `app/api/sovereign/atoms/[id]/decline/route.ts:1–18` | loader excludes `member_response_status = 'rejected'` `:287` | live | 6 |
| **Conversational Phase 2** (`conversation_turns`) | turn store `lib/memory/stores/TurnsStore.ts` (Sanctuary posture REQUIRED `:109`) | `loadPriorCrossSessionExchanges` `lib/maia/memoryLoaders.ts:195` → `formatPriorExchangesForPrompt` `lib/maia/conversationalRecallBlock.ts:80` → `conversationalRecallAddendum` [list `:1050–1061`] → FAST/CORE/DEEP-repair | live; `runtime_events` 5 member prefixes / 30 days FAST+CORE [ACD §IX] — WALKED 2026-07-13 | 6 |
| **Episodic (member-marked)** (`episodic_memories`) | only `app/api/sovereign/episodes/mark/route.ts:1–18` ("verbatim_text stores the member's exact words, byte-for-byte") | `loadRecentMarkedEpisodes` `memoryLoaders.ts:283–317` (`marked_by_member = TRUE`) → `lib/maia/episodicRecallBlock.ts:123–133` → `episodicRecallAddendum` | wired; **zero marked moments in production** as of 2026-07-13 [ACD §IX] | 6 (reachable) / 3 |
| **Daily Anchors** (`member_daily_anchors`) | member writes; `surface_preference` gate migration `20260702000003` [CM] | `loadRecentAnchors` `lib/anchor/loadRecentAnchors.ts:51,:66` → `buildAnchorContextBlock` `lib/anchor/buildAnchorContextBlock.ts:39` — **callers only** `app/api/oracle/conversation/route.ts:981,:2414` (dormant route); no other reader of `member_daily_anchors` (grep `lib app`, 2026-09-06) | consent gate WALKED 2026-07-03 [CM]; **prompt participation on the live route: NOT FOUND** | 6 (gate) / 3 (prompt) |
| **Developmental** (`developmental_memories`, all rows `memory_type='pattern'`) | `MemoryWritebackService.writeBack` `lib/memory/MemoryWriteback.ts:325` from [list `:1697–1710`] fire-and-forget, `memoryMode: 'longterm' // forced` | (a) `MemoryBundleService.build` [list `:559–565`] → `formatForPrompt` `lib/memory/MemoryBundle.ts:628` → `meta.memoryContext` [list `:1406`] → [svc `:882–883`] → `contextPrompt` [svc `:985–1006`]; (b) `loadRecentDevelopmentalMemories` `memoryLoaders.ts:87` → `buildMemoryInfluencePlan` `lib/maia/memoryOrchestrator.ts:214` → `memoryInfluenceAddendum` [list `:991`] → FAST slot | live; **2018 rows / 36 members** [TM §2.a] — WALKED 2026-09-06 | 6 |
| **System-inferred "breakthroughs"** (`breakthrough_moments`) | `MemoryWriteback.writeBreakthroughMoment` `:680–710`, fired when `significance >= 0.5 OR isBreakthroughPattern` `:378–388`; regex `:773–782` includes `/thank you.*profound\|deeply grateful/i` over member+MAIA text | `MemoryBundle.getBreakthroughs` `:351–375` → "⭐ RECENT BREAKTHROUGHS" `:648–650` and "N breakthroughs recorded" `:633`; also `loadRelationshipMemory` [svc `:765–775`] → "Recent breakthrough: …" `lib/memory/RelationshipMemoryService.ts` | live (writer on live route); row count UNKNOWN (no dated record) | 6 |
| **Relationship memory** (`relationship_essences`, `conversation_themes`) | `saveRelationshipEssence` [list `:1686`]; themes via RelationshipMemoryService | [svc `:765–775`] `loadRelationshipMemory` → `formatRelationshipMemoryForPrompt` → `relationshipContext` [svc `:1246–1248`] → FAST slot | live | 6 |
| **FAST fallback recall** | — | when route gives no `memoryContext`: [svc `:910–917`] → `lib/memory/MemoryOrchestrator.ts:253–300` ("Journey stage: …", "Sessions together: N", "RECENT BREAKTHROUGHS") | live-reachable | 6 |
| **Decay** | SQL `calculate_decayed_confidence` `database/migrations/20251231_memory_architecture_enhancements.sql:178–213` (no confirmed arg; floor 0.3) vs TS `lib/memory/confidenceDecay.ts:61–90` (1.5× confirmed half-life `:79`) | non-vector score `MemoryBundle.ts:264–271` (0.40 decay · 0.35 recency · 0.15×0.15 confirmed · 0.10 recall) LIMIT 12 `:278`; `valid_to` filter `:276` | live; **F2** set changes for 2/14 members; **F3** two divergent definitions [TM] — WALKED | 6 |
| **Temporal columns** | `valid_from DEFAULT NOW()` / `valid_to` `20251231…:155–160`; `confirmed_by_user DEFAULT false` `:164` | filter above; vector fallback has no `valid_to` clause **F1** [TM] | zero rows with past `valid_to` [TM §1.a] — WALKED; no `supersedes` on any memory table (grep `database lib`, 2026-09-06; only `developmental_review_passes.supersedes_pass_id`, unrelated) | 6 (columns) / 1 (Decisions 1–3) |
| **Confirmation ask** | `shouldPromptForConfirmation` `confidenceDecay.ts:199–217` | **0 callers** [TM] | dormant | 3 |
| **Recall consent gates** | `members.conversational_recall_enabled` `20260524000001:22` · `episodic_recall_enabled` `20260531000001` · `recurrence_recall_enabled` `20260601000001:25` (all DEFAULT TRUE) | loaders `memoryLoaders.ts:241–249,:328–336`; member toggle **only** for conversational: `app/api/members/recall-preferences/route.ts:43–45`, `components/settings/MemoryConsentSection.tsx:139–143` | live (conversational); episodic/recurrence: column without member surface; developmental / relationship / MemoryBundle: **no gate** beyond `memoryMode` + Sanctuary | 6 / 3 |
| **Transition record** (`memory_transition_records`) | `recordMemoryTransitions` [list `:1124–1143`] retrieved/offered per layer; `injected` null by rule (`lib/maia/memoryTransitionRecord.ts:19–25`) | nothing on the conversation path reads it `:14` | live observability | 6 |
| **selectionTrace** | `MemoryBundle.ts:164–170` — derived after the `maxBullets` cut; no body | not consumed for selection; F2 prompt-propagation question answerable from it [TM F2] | live observability | 6 |
| **Temporal Memory direction** | `[TM]` Decisions 1–3, Episodic Phase 2 unauthored | — | Cat 1, FROZEN | 1 |
| **Cat 3/4 memory services** | `lib/consciousness/memory/*` [MSM]; `lib/maia/recurrenceDetector.ts` (**0 callers**); `lib/memory/stores/PatternMemoryStore.ts` (`emergent_pattern`, gated on `memoryMode==='longterm'` [svc `:3547–3549`] → env `MAIA_LONGTERM_WRITEBACK` `lib/memory/MemoryGate.ts:61–74`; zero `emergent_pattern` rows in production [TM §2.e]) | — | dormant | 3 / 4 |

**Sanctuary exclusion (READ):** [list `:397,:420,:520,:541,:1697`]; `TurnsStore.ts:109` (S1 boundary);
`conversationalRecallBlock.ts:22–33` refusal; FAST `sanctuaryInstruction` [svc `:1250–1259`];
theme-signal write gated `!isSanctuary` [svc `:3995–4005`]; MIPA `requires.notSanctuary` [list `:1100–1101`].
No memory writer on the live route was found that runs under Sanctuary.

## 1 · The founder's question for this subsystem

**Does recall preserve correction, uncertainty, authority and present change?** — **Partially, and
by layer, not by design.** The member-authored layers (atoms, episodic, conversational, anchors)
preserve authority and verbatim; the system-derived layers (developmental `pattern`, `breakthrough_moments`,
relationship themes) preserve none of the four.

| R12 criterion | Atoms / episodic / conversational (member-authored) | Developmental / breakthrough_moments / relationship (system-derived) |
|---|---|---|
| historical statement → provenance + time preserved | **YES** — speaker + relative recency `conversationalRecallBlock.ts:137–147`; `kept_at` relative age `memoryAtomsLoader.ts:383–397,:466`; episode `created_at`, `source_turn_id` `memoryLoaders.ts:283–317`; anchor `date — member wrote:` `buildAnchorContextBlock.ts:48–49`. Relative ("3 days ago"), not absolute; content capped 280 / 200 / 300 chars | **NO in the prompt** — `• [developmental/facet] content` `MemoryBundle.ts:641–644` carries no date, no authority class, no confirmation state; raw exchange kept only in `trigger_event.raw` (500 chars each) `MemoryWriteback.ts:568–577`, never surfaced; `valid_from DEFAULT NOW()` records transaction time as valid time |
| derived interpretation → underlying evidence retained | n/a (no derivation; atoms loader "Does NOT compute cross-atom patterns" `:37`) | **PARTIAL** — `content_text` = regex-distilled signal (`buildDistilledSignal` `:236–283`, e.g. "pattern recurring; moving from repetition toward recognition; tone …"), raw truncated beneath it; `breakthrough_moments.insight` = first sentence of the member message `extractInsight` `:788–798` with `conversation_id` only; extracted facts (`STABLE_FACT_PATTERNS` `:288–307`, incl. `/i (?:am\|'m) (?:a\|an) (.+)/`, `/i always (.+)/`) are captured **without hedge context** but **not written** to `content_text` `:511,:532` |
| later contradiction → detected | **NO** — no comparison of a present turn against any stored item; conversational block is recency-ordered only `:105–108` | **LEXICAL ONLY** — `detectContradiction` on the *current message* `lib/maia/memoryOrchestrator.ts:48–51` ("changed my mind", "not sure anymore") lowers prior-memory weight `:296`; nothing compares against stored rows; `shouldPromptForConfirmation` unwired |
| MAIA inference → asks | practitioner atoms: **YES** ("invite the member to confirm, reject, or refine" `memoryAtomsLoader.ts:560–566`); theme signals: **YES** ("treat as tentative questions, never as facts" `lib/memory/MemberLiveContext.ts:490–493`) | **NO** — developmental cue is a silent prime ("Use as a background prime only, not as content to reference" `memoryOrchestrator.ts:145`; "do not cite it" `:147`); system-inferred breakthroughs are surfaced as "RECENT BREAKTHROUGHS" with no ask and no "system-inferred" label |
| member statement → current self-report priority; history remains history | **BY RECENCY, NOT BY RULE** — the present turn is always in the prompt; old and new statements can both appear verbatim with recency but nothing marks succession; no `valid_to` ever set in production (F1); no `supersedes` | **NO** — ranking is decay/recency/confirmation; F2 shows an old highly-similar row can outrank a newer one for 2/14 members; no present-overrides mechanism |

Two further findings that bear on the answer:

- **Write-side consent bypass (E, READ).** [list `:1697–1710`] calls `writeBack` with
  `memoryMode: 'longterm' // forced for writeback only — sovereign is always longterm-capable`, while
  the read side honours the resolved mode (`shouldBuildMemory = … memoryMode !== 'ephemeral'` `:541`)
  and `resolveMemoryMode` (`lib/memory/MemoryGate.ts:50–90`) only grants `longterm` under
  `MAIA_LONGTERM_WRITEBACK=1`. `MemoryWriteback.ts:339–347` documents that `continuity` means
  "turns only, no promotion" — the route overrides that. A recognized member who requests
  `ephemeral` still produces `developmental_memories` and `breakthrough_moments` rows (Sanctuary alone
  is respected). Whether any client sends `ephemeral` is UNKNOWN (no record).
- **Runtime prompt forbids disclosing memory limits (E, READ).** `MAIA_RUNTIME_PROMPT` [svc
  `:196–201`]: "NEVER say: 'I don't have memory', 'I'm starting fresh', 'I can't recall.'" — P12
  clause "what don't I know" is structurally suppressed for memory.

## 2 · The nine questions

1. **Human phenomenon** — continuity without identity foreclosure (v0.2 §1.7, §2.9); hierarchy: Self (self-record) → Relationship (MAIA holds history) → World (absent: no layer points outward). D, READ.
2. **Principles** — supports P8 selectively at the member-authored layers (verbatim, provenance, no synthesis: `conversationalRecallBlock.ts:117–129`, `episodicRecallBlock.ts:123–133`, `memoryAtomsLoader.ts:456–460`); violates AxT minimum ("every remembered item carries its authority class") at the developmental/breakthrough layers; AP16 posture embodied in anchor/conversational copy ("The member retains the meaning of their own words"); AP17 risk at `breakthrough_moments` (regex "breakthrough" ≠ member-marked). E, READ.
3. **Self / World capacity** — Self: member gestures (keep, mark, decline, opt-out) are real authorship surfaces (E); World: nothing in memory points beyond MAIA — UNKNOWN whether any recall increases action in life (no class C).
4. **Influence (P4′ 1–9)** — 1 intent transparency: **absent** for developmental priming ("without surfacing prior content explicitly" `memoryOrchestrator.ts:127`); 2 no exploitation: gratitude → "breakthrough" write `MemoryWriteback.ts:779` is an approval-signal capture, unmeasured; 3 no relational feedback optimization: none found; 4 inspectability: `memory_transition_records` + `selectionTrace` exist (E) but member-facing inspection absent; 5 meta-preferences: three Boolean gates, one with UI; 6 process endorsement: none; 7 dispensability: UNKNOWN; 8 corrective friction: `CONTRADICTION DETECTED … meet the current state as primary` `:182` is the only friction; 9 hermeneutical expansion: distilled-signal vocabulary ("moving from repetition toward recognition") is house-authored [AxT class] and reaches the model unlabelled. Cannot be known from inside: 6, 7.
5. **What it remembers** — member-placed atoms (title, register, lens, status, breakthrough, `kept_at`); verbatim prior exchanges (both speakers); member-marked episodes (verbatim); anchors (verbatim, dormant path); system: distilled trajectory signal + 500-char raw per significant exchange, regex "breakthrough" insight, theme counts, encounter counts, `is_breakthrough`, decline, three consent Booleans. E, READ.
6. **Authority carried (AxT)** — member-stated (conversational, episodic, anchors) ✓ labelled; member-marked (atoms, `is_breakthrough`, `still_alive`) ✓ labelled; practitioner-observed ✓ labelled with `epistemological_status` `memoryAtomsLoader.ts:597–606`; system-inferred (developmental `pattern`, `breakthrough_moments`, themes) — **unlabelled in `MemoryBundle` and relationship blocks**, labelled only in the theme block; computed (decay, score) invisible; house-authored vocabulary (distilled signal) unlabelled. **Verbatim beneath derived:** stored (truncated) but never reachable from the prompt. E, READ.
7. **Useful difference vs validation drift (AP14/15)** — no optimization loop found; but memory-amplified agreement is structurally possible: the prompt receives the member's own words (conversational) plus a "breakthrough" marker written when the member thanks MAIA. UNKNOWN in effect (U29–U31 unmeasured).
8. **Elementally differentiated / reductive (H1, descriptive)** — atoms carry `elementalLenses` (member-declared); developmental rows carry `facet_code` from `meta.element`; no parallel elemental reading of memory. Reductive at the derived layers: one scalar significance + one distilled string.
9. **Evidence a human experiences the intended effect** — **none (class C).** Runtime facts only: conversational block emitted for 5 member prefixes [ACD §IX]; atoms rows in `prompt_block_layers`; 2018 developmental rows. "Member-facing experiential effect unmeasured" [CM].

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Status | Path / reason |
|---|---|---|
| agreement drift | NOT FOUND as mechanism; UNKNOWN in output | no scoring toward agreement; U29–U31 open |
| validation loops | NOT FOUND | no feedback-to-retrieval loop; `recall_count` weight 0.10 `MemoryBundle.ts:271` is the only use-driven term (retrieval, not approval) |
| memory-amplified sycophancy | UNKNOWN | verbatim member framing re-injected `conversationalRecallBlock.ts:137–147`; effect unmeasured (E9 not run) |
| hidden shaping objectives | **FOUND** | `memoryOrchestrator.ts:127–131,:145–147` (prime "without surfacing prior content"); `MemberLiveContext.ts:505,:512` ("Silent context … Do not quote this block directly"); [svc `:196–201`] forbids disclosing memory limits |
| approval optimization | **FOUND (write trigger)** | `MemoryWriteback.ts:779` `/thank you.*profound\|deeply grateful/i` → `breakthrough_moments` |
| emotional capture | NOT FOUND | no engagement/return metric in memory paths; anchors copy names surveillance risk `buildAnchorContextBlock.ts:64` |
| excessive reassurance | NOT FOUND in memory code | (conversation-layer question) |
| historical pattern becoming identity | **FOUND (label)** / see `10_developmental_intelligence.md` | `memory_type='pattern'` hard-coded for every significant exchange `MemoryWriteback.ts:641–650`; "N breakthroughs recorded" `MemoryBundle.ts:633` |
| "you said before" becoming leverage | NOT FOUND | blocks instruct continuity only: `conversationalRecallBlock.ts:127–129`, `episodicRecallBlock.ts:128–129`, `buildAnchorContextBlock.ts:53–55` ("ask how it sits now or invite update") |
| MAIA more central rather than returning capacity outward | UNKNOWN | no outward-pointing recall; "Sessions together: N" `MemoryOrchestrator.ts:265`, "🧠 RELATIONSHIP: N turns across sessions" `MemoryBundle.ts:633` count the relationship, not the life |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- Member-marked vs system-inferred is a structural line: only routes flip `is_breakthrough` / `member_response_status` / `marked_by_member` (`atoms/[id]/breakthrough/route.ts:1–12`, `decline/route.ts:1–18`, `episodes/mark/route.ts:1–18`); migration `20260531000001:14–32` strips manufactured defaults ("A column that CAN be null is a column the system is FORBIDDEN from inventing").
- Verbatim with provenance, no synthesis, no cross-session pattern naming: `conversationalRecallBlock.ts:117–129`, `episodicRecallBlock.ts:123–133`; atoms "do NOT cross-reference, synthesize, or interpret across them" `memoryAtomsLoader.ts:456–460`.
- Memory is never leverage (AP16, AxT E): anchors "Quote or echo a phrase they used, then ask how it sits now or invite update … Forced reference becomes surveillance" `buildAnchorContextBlock.ts:53–64`.
- Practitioner observations proportioned to epistemic status and framed as invitations, with the verdict/description distinction written into the prompt (`memoryAtomsLoader.ts:506–529,:560–566,:597–606`).
- Derived relational label suppressed by founder ruling 2026-08-14: `relationshipPhase` is computed but not emitted (`RelationshipMemoryService.ts`, comment in `generateRelationshipSummary`).
- Theme signals labelled "Candidate recurrence — system-noticed, not yet confirmed by the member" `MemberLiveContext.ts:490–493` (Kelly ruling R4, 2026-07-17).
- Contradiction lowers prior-memory dominance rather than correcting the member: `memoryOrchestrator.ts:179–183,:296`.
- Consent walls: three opt-out columns default TRUE (opt-out, not stealth); right-to-abstain surface `recall-preferences/route.ts:6–13`; `return_preference` / `surface_preference` default private [CM].
- Accountability without scores: `memory_transition_records` reasons as sentences, "Unknown is a valid state" `memoryTransitionRecord.ts:16–25`; `selectionTrace` carries no body `MemoryBundle.ts:53–62`.
- Sanctuary is boundary-enforced at the turn store (`TurnsStore.ts:109`) and refused again at every formatter.

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Finding | Path | Violates |
|---|---|---|
| Write pipeline forces `longterm`, bypassing the resolved memory mode | [list `:1697–1710`] vs `MemoryGate.ts:50–90`, `MemoryWriteback.ts:339–347` | CLAUDE.md "no stealth memory"; P8; standing law 7 |
| Regex "breakthrough" (incl. gratitude) written and surfaced under the same word as member-marked breakthroughs, no provenance label | `MemoryWriteback.ts:773–798`; `MemoryBundle.ts:633,:648–650`; `RelationshipMemoryService.ts` "Recent breakthrough:" | AxT minimum (authority class); AP17 (recurrence/label as meaning); P4′ 2 |
| Developmental bullets reach the model with no time, authority, or confirmation state | `MemoryBundle.ts:641–644`; `compress` `:478–505` | AxT §1 minimum, §2 evidence-beneath-derivation (evidence unreachable) |
| `valid_from DEFAULT NOW()` = transaction time recorded as valid time; no `supersedes`; vector fallback lacks `valid_to` | `20251231…:155–160`; `MemoryBundle.ts:311–325` [TM F1] | AxT time axes; TM Decisions 1–2 |
| Two divergent decay definitions; invisible decay changes the retrieval set for 2/14 members | `confidenceDecay.ts:79` vs SQL `:178–213`; [TM F2, F3] | AxT B (change-sensitive over similarity — the wrong axis decides); TM "make age legible rather than silently weighting it" |
| Silent priming from remembered direction; "Do not quote this block directly" | `memoryOrchestrator.ts:127–131,:145–147`; `MemberLiveContext.ts:505,:512` | P4′ 1, 4; P12 |
| Prompt forbids saying "I don't have memory" | [svc `:196–201`] | P12 (what don't I know); P6 |
| Anchors: consent gate live, prompt wire only on a dormant route — record claims "MAIA-follows-consent" | `buildAnchorContextBlock.ts` callers = `oracle/conversation/route.ts:981,:2414`; route `dormant` `MAIA_ROUTE_AUTHORITY_MAP.md:198` | claim discipline (standing law 6); "wired ≠ surfacing" [CM] |
| Consent gates without member surface (episodic, recurrence); no gate at all for developmental / relationship / MemoryBundle | `recall-preferences/route.ts:43–45`; `MemoryConsentSection.tsx:139–143` | P8; P4′ 5 |
| `memory_type='pattern'` assigned to every generic significant exchange | `MemoryWriteback.ts:641–650` | AP17 (the label asserts recurrence that was never observed) |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Instrument (read-only / shadow) |
|---|---|
| Does F2's upstream decay effect reach the prompt? | capture `selectionTrace` + rendered bullets for members `17a14614`, `2cea65b7` [TM F2] — existing trace, no new lane |
| How many `breakthrough_moments` rows exist, how many were gratitude-triggered, and how often they surface | read-only SQL: rows per member; regex re-classification of `insight`; grep `[MemoryBundle] Built` logs |
| Does any client send `memoryMode: 'ephemeral'` for a recognized member (bypass exposure) | grep production logs `[Route/MemoryDebug] requestedMode="ephemeral"` against `[Sovereign/Writeback] Memory formed` |
| Does being remembered feel like recognition or surveillance; does history make MAIA more nuanced or more sycophantic (§5 UX question) | class C witness only — E9 model-side first, then consented dyad |
| Whether a present statement ever loses to an older similar developmental row in a real turn | shadow: replay `getSemanticMemories` with and without decay for consented transcripts; count present-contradicting bullets |
| Who writes `relationship_contexts.consciousness_journey_stage` (read at `RelationshipContextStore.ts:33`, printed `MemoryOrchestrator.ts:262–263`) | grep found no writer; SQL `COUNT(*) WHERE consciousness_journey_stage IS NOT NULL` |
| Has a member-marked `is_breakthrough` atom ever surfaced under authenticated load | grep `[MAIA/sovereign] breakthrough surfaced` in `runtime_events` / logs [CM Stage 4] |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| M1 No contradiction detection against stored material; no detect → ask → record | P8 · AxT C · R12 | 5 | 5 | 3 | inferred (absence of any comparator; lexical detector only) | high | offline shadow: for consented/synthetic transcripts, compare present turn to that member's stored `pattern` rows and extracted facts; log candidate contradictions only; zero response diff | E7 |
| M2 Regex "breakthroughs" surfaced under the member-marked word, no provenance | AxT · AP17 · P4′ 2 | 4 | 3 | 2 | observed (code); row count unknown | medium | read-only SQL census of `breakthrough_moments` (count, trigger class, surfacing frequency) | E9 (derived vs verbatim) |
| M3 Write-side consent bypass (`memoryMode` forced to `longterm`) | P8 · consent law 7 | 4 | 4 | 2 | observed (code); exposure unknown | high | log-grep ephemeral-requested turns vs writeback formed; no code change | new: consent-act input (Phase 4) |
| M4 Developmental bullets carry no time / authority / confirmation | AxT §1 minimum | 3 | 4 | 2 | observed | high | capture rendered `📚 RELEVANT MEMORIES` blocks for the two F2 members alongside `selectionTrace` | E7 / E9 |
| M5 `valid_from = NOW()`, no `supersedes`, F1 parity gap | AxT time axes · TM D1–D2 | 3 | 5 | 3 | observed | high | none at runtime — spec input already recorded [TM]; measure future-dated `valid_to` (not measured) | E7 |
| M6 Silent priming + "do not quote this block" + "never say I don't have memory" | P4′ 1, 4 · P12 | 3 | 3 | 2 | observed | high | E9 variant arms (none / verbatim / derived / derived-with-corrections) model-side; E4 self-disclosure witness for the P12 clause | E9 · E4 |
| M7 Gates without surfaces; no gate for developmental / relationship / bundle | P8 · P4′ 5 | 3 | 4 | 2 | observed | high | inventory only (this table); consent act designs the surface | new: consent act |
| M8 Two decay definitions; hidden age weighting decides retrieval for a minority | AxT B · TM D3 | 2 | 3 | 2 | observed (WALKED audit) | high | `selectionTrace` capture (same as M4) | E7 |
| M9 Anchors: prompt path dormant while record says verified live | claim discipline · "wired ≠ surfacing" | 2 | 2 | 1 | observed | high | confirm absence of an anchor layer in `prompt_block_layers` / `runtime_events`; correct the record | E3 (copy audit) |
| M10 `pattern` label for every significant exchange | AP17 | 3 | 4 | 1 | observed (WALKED: 100% of 2018 rows) | high | none — finding; feeds vocabulary decision in Episodic Phase 2 | E9 |
| M11 Memory-amplified agreement unmeasured | AP14 · AP15 · U29–U31 | 4 | 3 | 3 | unknown | low | E9 as designed (model-side, consented dyad after) | E9 |

## 8 · Provenance — files read, records cited, commit

Tree `6ce59f82`. Files read (line numbers cited above): `lib/maia/memoryAtomsLoader.ts` ·
`lib/maia/conversationalRecallBlock.ts` · `lib/maia/episodicRecallBlock.ts` · `lib/maia/memoryLoaders.ts` ·
`lib/maia/memoryOrchestrator.ts` · `lib/maia/memoryTransitionRecord.ts` · `lib/maia/recurrenceDetector.ts` ·
`lib/memory/MemoryBundle.ts` · `lib/memory/MemoryWriteback.ts` · `lib/memory/MemoryGate.ts` ·
`lib/memory/confidenceDecay.ts` · `lib/memory/MemberLiveContext.ts` · `lib/memory/RelationshipMemoryService.ts` ·
`lib/memory/MemoryOrchestrator.ts` · `lib/memory/stores/PatternMemoryStore.ts` · `lib/memory/stores/TurnsStore.ts` ·
`lib/memory/stores/RelationshipContextStore.ts` · `lib/anchor/loadRecentAnchors.ts` · `lib/anchor/buildAnchorContextBlock.ts` ·
`lib/sovereign/maiaService.ts` · `lib/sovereign/maiaVoice.ts` (`ADDENDA_SPECS`) · `app/api/sovereign/app/maia/list/route.ts` ·
`app/api/sovereign/atoms/[id]/breakthrough/route.ts` · `app/api/sovereign/atoms/[id]/decline/route.ts` ·
`app/api/sovereign/episodes/mark/route.ts` · `app/api/members/recall-preferences/route.ts` ·
`components/settings/MemoryConsentSection.tsx` · migrations `20251231_memory_architecture_enhancements.sql`,
`20260524000001_member_conversational_recall.sql`, `20260531000001_episodic_member_marked_provenance.sql`,
`20260601000001_member_recurrence_recall.sql` · `docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md`.
Records cited: [TM] (audit run 2026-09-06), [ACD] §VIII–§IX (2026-05-26, 2026-07-13), [MSM], [AxT],
[CM] priority thread (anchors 2026-07-03; breakthrough stage language 2026-05-26), Synthesis v0.2 §2–§4,
master run §5. No network, no database, no production access; WALKED marks rest on those dated records only.
