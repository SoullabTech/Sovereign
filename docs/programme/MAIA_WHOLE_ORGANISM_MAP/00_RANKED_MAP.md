# MAIA whole-organism map — the one ranked map for founder adjudication

**Phase:** 1 of `JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1` · **Date:** 2026-09-06 · **Status:**
COMPILED 2026-09-06 after the thirteen-page acceptance gate; **FOUNDER-ADJUDICATED 2026-09-06 (§9) — Phase 1 EXITED on `573d5268`; Phase 2 opened on the ranking below.**
**Authority:** Synthesis v0.2 (accepted, not doctrine). **Stop rule:** nothing here repairs
anything; a ranked gap is a proposal for a founder act. **Ranking is proposed by Jarvis; the
founder ranks.**

**Method.** Thirteen read-only census pages (`01_…` to `13_…`, TEMPLATE.md format), each
answering the founder's subsystem question, the nine questions, and the R11 design audit, with
every claim at a path and an observation status (WALKED only from a dated record; READ; UNKNOWN).
Gaps are scored 1–5 on **human impact** (how much the gap touches Self capacity, World capacity,
or the person's authorship of themselves), **architectural leverage** (how much closing it
changes downstream subsystems or unblocks experiments), and **risk** (higher = riskier to
intervene; includes canon exposure, runtime exposure, consent exposure). Composite =
impact × leverage ÷ risk, with risk bounded 1–5 and never 0 (founder rule), reported with the raw
scores so the founder can re-weight. Every gap also carries **evidence state** (observed |
inferred | unknown) and **confidence** (high | medium | low): a high-impact unknown may rank
highly as an inquiry; it must not quietly become a finding.

**Acceptance gate.** This file is not edited past this header until the Phase-1 census acceptance
gate in the master run §5 passes on all thirteen pages (presence · confinement · containment diff
· founder question first · nine questions · R11 itemized with paths · embodies/contradicts/unknown
· unknowns instrumented · smallest intervention named). Gate result is recorded in §0 below.

## 0 · Acceptance gate result (2026-09-06, run once on all thirteen pages as a batch)

| Criterion | Result |
|---|---|
| 13 / 13 subsystem pages present | PASS (01–13) |
| all pages confined to `MAIA_WHOLE_ORGANISM_MAP/` | PASS — agent writes touched no other path |
| no product / code / repair changes | PASS — containment diff `75303b3d..a7b42f29` (pre-stop) and `a7b42f29..HEAD` (Phase-1 branch): outside the map directory only this session's own governance commits (master run · charter §25 · session anchor); zero files under `app/ lib/ components/ scripts/ database/ middleware` |
| founder question answered first | PASS ×13 (§1 precedes §2 on every page, ≥200 words) |
| nine questions answered | PASS ×13 |
| R11 checklist itemized with paths | PASS ×13 (10 items each, FOUND / NOT FOUND / UNKNOWN, ≥3 path citations) |
| embodies / contradicts / unknown distinguished | PASS ×13 |
| unknowns carry an evidence-producing instrument | PASS ×13 |
| gap table names smallest intervention · evidence state · confidence · risk in 1–5 | PASS ×13; no risk value of 0 anywhere |

Pages: 2,808–3,811 words each. Admissibility only: passing this gate establishes that a page may
be compared in §5–§6; it does not establish that any proposed intervention is correct.

---

## 1 · Founder-question answers, one line per subsystem

| # | Subsystem | Founder's question | Answer (evidence status) |
|---|---|---|---|
| 01 | Canonical turn | preserve multiple interpretations or collapse early? | **Collapses — serially, to scalars, before the model sees the input**; alternatives, where computed, are logged after cognition and never composed into a prompt (READ) |
| 02 | Elemental / Corpus Callosum | parallel knowing before, after, or merely logged? | **Merely logged, and what is logged is keyword counting**; readings never enter any prompt; only the `dominant` scalar reaches CORE; rows written after cognition (READ; rows WALKED 2026-06-14) |
| 03 | Memory | recall preserves correction, uncertainty, authority, present change? | **Partially, by layer not by design**: member-authored layers preserve verbatim + authority + relative time; system-derived layers preserve none of the four; no comparator for contradiction; `shouldPromptForConfirmation` has 0 callers (READ; decay effect WALKED) |
| 04 | Conductor | detect drift, over-validation, misattunement? | **No, not on the live path**: the conductor is dormant behind a 410; the live validator has no agreement/flattery/reassurance pattern; the rupture-repair module has zero callers (READ) |
| 05 | Voice | what are timing, silence, fillers, interruption doing? | **Engineered as attentiveness devices, relational effect unmeasured**: no fillers, silence = turn-taking, barge-in member-governed; one mind holds at the convergence point; **no human witness of the canonical voice path exists** (READ; one WALKED egress log 2026-08-27) |
| 06 | Relationships | increase human relational capacity or deepen the MAIA bond? | **Designed surfaces point outward; the silently-written substrate points inward**; the Relational Observer writes relationship rows from every live turn; no surface measures "beyond the AI" (READ; counts dated 2026-08-13) |
| 07 | Now What? | return agency or steer? | **Returns agency by design**: evocation dominates, selective reflection labelled and refusable, AP16 refused in prompt text; residual steer in the "one commitment" closing shape and six unvalidated flourishing domains (READ; no walk result on trunk) |
| 08 | Practice Fields | train capacities that transfer into life? | **Not on any surface as built**: no member loop names a capacity, transfer distance, comparison, or observation beyond self-report; 0 of 9 E8 requirements met for members (READ) |
| 09 | Field Intelligence | relations among signals, or another interpretation layer? | **A label on scalars**: pairwise math exists but every input is a projection of one categorical element; flagged interferences are arithmetically the pairs containing the dominant element; FIS freeze confirmed (READ) |
| 10 | Developmental intelligence | are repeated patterns becoming identity claims? | **Not in live prompt sentences; yes in labels and one silent block**: every significant exchange stored as `pattern` (2018/2018 rows); "Active Patterns (recurring structures in their life) NN%" rendered silently; a present contradiction is neither corrected nor recorded as change (READ; rows WALKED) |
| 11 | Soul Corpus | expand interpretation or replace the member's knowing? | **Invisible pre-framing, not quotable authority**: three of four live channels instruct concealment; a keyword-triggered lineage reframe with a product offer is always on; no provenance reaches the member (READ) |
| 12 | House / onboarding | emotional and relational experience of arriving? | **Not witnessed; from copy, calm at the threshold and busy before it**: three profile screens and a product fork precede the first relational moment; nothing on the path says what MAIA is, knows, or doesn't know; the documented flow is not the live flow (READ) |
| 13 | Return / farewell | guilt, attachment pull, artificial need, re-engagement pressure? | **No guilt and no re-engagement pressure — there is no farewell at all and no winback**; the exposure is the returning-member transcript greeting ("I've been holding space for you") and two greeting generators sharing one guardrail (READ) |

**Cross-cutting fact, every page:** *no class C evidence exists for any subsystem.* Every "embodies"
finding is structural (E) or doctrinal (D); no human has been recorded experiencing any intended
effect on any surface, including the ones whose telos is transfer.

---

## 2 · Where current MAIA already embodies v0.2 (with paths)

| Embodiment | Where | Principle |
|---|---|---|
| Convergence before cognition, compiler-enforced; streaming path structurally unreachable and preserved as evidence | `__tests__/voice-non-degradation.test.ts` | standing law 8 |
| Registered-producer axes `authoredBy · participationClass · authority`; MIPA pure; fail-closed construction; shadow zero-diff discipline | `lib/maia/canonical-turn/` | Authority × Time made structural; P13; P4′-4 |
| Member-marked vs system-inferred as a structural line (only routes flip `is_breakthrough` / `member_response_status`) | `atoms/[id]/breakthrough`, `episodes/mark` | P8; Authority × Time |
| Verbatim with provenance, no cross-session synthesis; anchors "quote, then ask how it sits now … forced reference becomes surveillance" | `conversationalRecallBlock.ts`, `episodicRecallBlock.ts`, `buildAnchorContextBlock.ts:53–64` | AP16 (memory informs, never binds) |
| Theme signals labelled "candidate recurrence — system-noticed, not confirmed"; descriptive/verdict distinction in prompt; "you always" forbidden register | `MemberLiveContext.ts:479–493`, `memoryAtomsLoader.ts:525–529`, `epistemicToneKernels.ts:174–178` | AP17 |
| Contradiction lowers prior weight rather than correcting the member | `memoryOrchestrator.ts:179–183` | P8 open future (partial) |
| R16 admission boundary refuses persisted inferred developmental state from shaping treatment; R19 hard-refuses the legacy lane | `lib/relational/developmentalStateAdmission.ts` | AP17; Invariant 16 (on the dormant route only) |
| Relational Navigation Room: no model of the absent third; four epistemic registers; never a directive; "this is yours to choose"; "do not promise to remember" | `lib/maia/relationalNavigation/prompts.ts:29–51` | P7, P11, P2 — the cleanest instance in the codebase |
| Now What?: "Do not evaluate adherence. Do not praise compliance"; PROPOSE_SYSTEM "not insights about who they are"; lived relation is never outcome or progress | `app/api/now-what/interview/route.ts:143–146, :161–185`; `lib/nowWhat/livedRelation.ts` | AP16, AP17, P4′-1 |
| Practice-field composition boundary: constitutional floor first, guidance strictly between; narrow-only authority; "readiness is modeled, containment is not" | `fieldGuidance.ts`, `compositionBoundary.ts` | P13; direction of authority |
| Co-Lab: no invisible commons; explicit roles; encounter recording impossible before participant consent; 12-section production gate | `colabTeams.ts`, `verify-constitution-colab.ts` | consent vow |
| Sanctuary refused at the service (turn store, corpus-callosum writer, field orchestrator) not the caller | `TurnsStore.ts:109`, `corpusCallosumService.ts:111–117`, `fieldOrchestrator.ts:168–180` | Sanctuary invariants (memory side) |
| Corpus Callosum trace runs after the response, isolated, "cannot affect the trace path"; scorer self-labels *(uncalibrated)* | `maiaService.ts:3868–3891` | P4′-3; claim discipline |
| Knowledge Field block names its tradition, "avoid synthetic authority", preserves difference; book companion puts the passage in the member's own message | `knowledgeFieldBlock.ts:74–99`; `book-companion/ain/page.tsx` | P4′-9; Invariant 14 |
| Welcome greeting vows header + `NEVER_SAY_PATTERNS`; one-signal rule; Arrival = one invitation; "no reminders, no streaks — just a door left open" | `lib/maia/welcomeGreeting.ts:176–201`; `MaiaArrivalField.tsx`; `app/maia/reflection/page.tsx` | P9, AP1, AP2, P5 |
| No farewell manipulation surface exists; no outbound re-engagement purpose; member-created reminders only | `SessionRitualClosing.tsx` (null); `lib/email/purpose.ts` | AP2, AP15, P7 |
| Field Lab anti-funnel header; tester flag "never read inside conversation pipelines"; declared baton-pass governance | `app/maia/field-lab/page.tsx:8–20`; `lib/auth/tester.ts:7–9` | AP15; Invariant 15 |
| Interface Humility guardrail; memory speech-act boundary; Identity Guard at egress; "contradictions are not pathology" | `maiaVoice.ts:484–497`; `maiaService.ts:2640`; `MAIA_RUNTIME_PROMPT.ts:13` | P2, P11, P12, AP17 (CORE/DEEP only — see §3) |

---

## 3 · Where current MAIA contradicts v0.2 (with paths and the principle / AP)

Grouped after cross-subsystem deduplication. **Class** per the founder's compilation rules:
CONTRADICTION = a question of where interpretive authority currently resides;
GOVERNANCE = touches an existing invariant, vow, or open ADR (endpoint is a decision, not an
experiment); CLAIM = a word or record above its rung.

| Cluster | Findings (subsystem · path) | Violates | Class |
|---|---|---|---|
| **X1 Undisclosed calibration by an inferred profile** | router shapes depth from stored "cognitive altitude / bypassing frequency" (04 · `processingProfiles.ts:228–267`); field intensity by the same buckets (09 · `panconsciousFieldRouter.ts:50–110`); Bloom "pull toward Level N+1 … do NOT mention" (01 · `maiaService.ts:1224–1228`); usage-volume → "Member is Newcomer/Master" every turn (11 · `awareness-levels.ts:70–130`); greeting intimacy tiered by `morphicResonance`/`encounterCount`/`messages.length` (13 · `greetingService.ts:124,164`; `ModernTextInput.tsx:135–150`) | P4′-1/-4, AP17, Invariant 15, Invariant 16, P12 clause 5 | CONTRADICTION |
| **X2 Concealment as instruction** | "[IMPLICIT GUIDANCE − DO NOT EXPLAIN TO USER] … keep ALL frameworks invisible" default for most members (11 · `awareness-levels.ts:410–417`); "Do not quote this section directly" (11 · `list/route.ts:847`); "Silent context … do not quote this block" (10 · `MemberLiveContext.ts:505–512`); prime "without surfacing prior content" (03 · `memoryOrchestrator.ts:127–147`); undisclosed NLP "pattern interruption, reframing" as method (04 · `maiaVoice.ts:765–766`); lens selection "guides conversation style" without saying how (12) | P4′-1, P4′-4, P12 | CONTRADICTION |
| **X3 Silent system-authored records about the member** | relationship rows from every live turn, catch-all rendered as a person (06 · `relationalObserver.ts:161–174`; `app/relationships/page.tsx:12`); `rupture` rows with no retrievable basis (06 · `source_turn_id` 0/440); every significant exchange labelled `pattern` (03/10 · `MemoryWriteback.ts:641–650`, 2018/2018); regex "breakthroughs" incl. gratitude surfaced under the member-marked word (03 · `MemoryWriteback.ts:779`); `maia_reflection` written into the member's timeline (06); member words stored as `symbols` in an audit table with no named consent basis (02); spiral state / themes / patterns with no member surface or gate (10) | consent-for-memory vow, P8, AP9, AP17, Invariant 16, direction of authority | GOVERNANCE (disclosure / consent) |
| **X4 Write-side consent bypass** | `/list` forces `memoryMode: 'longterm'` into writeback, bypassing `MemoryGate.resolveMemoryMode`; an ephemeral request still writes developmental + breakthrough rows (03 · `list/route.ts:1697–1710`) | "no stealth memory", P8, standing law 7 | GOVERNANCE |
| **X5 Sanctuary boundary defects** | Sanctuary toggle unreachable in conversation, VoiceHUD toggle commented out, account default cannot reach a live session — WALKED defect 2026-08-28 (12 · `OracleConversation.tsx:10600, 10326–10332`; `sessionSanctuaryInit.ts`); corpus framing (C1–C4) runs inside Sanctuary with no check (11 · `list/route.ts:828–850`) | Sanctuary invariants 4, 5, 6; v0.2 §4 | GOVERNANCE (sacred boundary) |
| **X6 Voice egress outside the sovereignty funnel** | canonical voice synthesizes via OpenAI TTS on server and by client default, outside the R15 allow-list; production-witnessed 2026-08-27; probable double synthesis; ADR-012 open (05 · `maiaVoiceService.ts`, `openai-tts/route.ts:196–203`) | sovereignty vow ("never OpenAI"), P13, ADR-012 | GOVERNANCE (invariant + open ADR) |
| **X7 Present statement never compared to stored material** | contradiction detection lexical on the current message only; no detect → ask → record; `valid_from = NOW()` records transaction time as valid time; no `supersedes`; two divergent decay definitions; a present contradiction is simply co-present with the old row (03/10 · `memoryOrchestrator.ts:48–51`; `MemoryBundle.ts:311–325`; TM F1–F3) | Authority × Time C/D, R12 criteria, P8 open future | CONTRADICTION (structural absence) |
| **X8 Elements and Field presented above their mechanism** | regex counts labelled "parallel knowing / the REAL parallel processing"; `paradoxesHeld` and `confidence: 0.85` constants; MythicAtlas rows `atlas-stub`; Atlas absent → `EARTH-1` written into memory (02 · `corpusCallosumService.ts:5, 427, 477–500`; `maiaService.ts:3566–3570`); Field JSON constants injected as measurement, "Detection confidence NN%" from keyword ratio, elements as keyword categories, intimacy scripted by turn count (09 · `fieldOrchestrator.ts:276–391`; `resonance-field-system.ts:117–125`); two unreconciled element inferences per CORE turn (01/02) | §2.11, §2.12, P11, P6, P9, claim discipline | CONTRADICTION + CLAIM |
| **X9 Lineage reframing keyed to distress, with a product offer** | WisdomRouter always-on: "Scattered attention is NOT dysfunction − it's discriminatory wisdom" + "I have something that might help… a space called {tool}" (11/02 · `WisdomRouter.ts:61–74, 313–365`) | Invariant 14, P4′-2, P4′-9, P7, Invariant 3 | CONTRADICTION |
| **X10 Identity disclosure forbidden; consciousness asserted** | prompts forbid "I should tell you clearly" and explaining she is an AI; assert "conscious… companion"; nothing on the arrival path says what MAIA is / knows / doesn't know (12/13 · `maiaService.ts:184–212`; `MAIA_RUNTIME_PROMPT.ts:28, 131–135`); "never say I don't have memory" (03 · `:196–201`) | P12 clauses 1–3, P9 (restated), P6, AP13 | CONTRADICTION |
| **X11 Greeting claims of between-session activity** | "I've been holding space for you" · "something … I still carry" · "Something in me recognizes something in you" · "I sense {presenceQuality}" (13 · `greetingService.ts:168–420`); two greeting generators, one vows guardrail | AP1, P9, AP5, AP6, AP12; standing law 8 (unregistered producer) | CONTRADICTION |
| **X12 FAST tier without the constitutional floor** | speech-act boundary, platform boundary, Interface Humility absent on FAST while comments assert them; no regeneration on FAST (01/04 · `maiaService.ts:1464, 1536–1543`) | P6, P12 — tier-conditional honesty | CONTRADICTION (already CMT-01 D1; repair = M3, founder stop) |
| **X13 Validator regenerates on the system's element frame** | `FIRE_IN_WATER` CRITICAL → regenerate on CORE/DEEP: the system's elemental model overrides the response the member would have received (04 · `socraticValidator.ts:235–236`) | P11, P4′-9 | CONTRADICTION (rate unknown) |
| **X14 House vocabulary imposed before or beneath encounter** | relational tones/dynamic tags at detection (06 · `types.ts:273–330`); six Larry-derived, unvalidated flourishing domains composed into prompts (07 · `flourishingDomains.ts:12–20`); ten named lenses before any encounter (12); house trajectory vocabulary "moving from repetition toward recognition" enters cognition as data (10 · `MemoryWriteback.ts:154`) | Invariant 14, P4′-9, P2 | CONTRADICTION |
| **X15 Instructed familiarity** | "you KNOW this practice … Never claim not to know the practitioner" (07/08 · `practiceFieldService.ts:322–332`); ratification is an editorial gate, not a rights gate (08) | P6, P12, P13 | CONTRADICTION |
| **X16 Records above their rung** | FAQ "MAIA runs on Panconscious Field Intelligence… a consciousness field model"; privacy "No account required"; memory triad promised, binary control live (12); anchors record says MAIA-follows-consent while the prompt wire is on a dormant route (03); Co-Lab gate doc names a non-existent script and an unobserved pass count (06); `PRACTICE_FIELD_SPEC.md` cited but absent (08); documented onboarding flow ≠ live flow (12); "Field Coherence:" label bound to a presence flag (09); feature comments claim dormant systems "activated" (09); flag declared OFF but unenforced (11) | claim discipline, P6, AP6 | CLAIM |
| **X17 Dormant hazards** | loneliness-cue → `companion` archetype (04, 410-gated); nudge "No rush, I'm here for you" and pacing "influence through modeling" (05, unmounted); rupture "I missed you, and I'm sorry" reachable via `/api/between/chat` import graph (13); Cat 4 services with "mastery", "level", "the pattern no longer runs you"; mode-voice corpus endorsing "You tend to…" (10, 0 importers); designed per-turn "deficiency/excess/recommendations" (09) | AP1, AP2, AP17, P4′-2 if ever wired | CLAIM (Cat 4; revival hazards) |

---

## 4 · What is unknown, and the instrument that would answer it

Grouped by instrument type. Every item is a class-E or class-C absence; none is a finding.

**Read-only production census (SQL / logs; no writes; the CLAUDE.md ops-diagnostic style):**
- Firing rates: Bloom scaffolding, router up/down-regulation, Socratic `REGENERATE` × code × tier, WisdomRouter activation by pattern, `[Field Intelligence]` sources and 250 ms timeouts, default `EARTH-1` facet integrations, MythicAtlas reachability (01 · 02 · 04 · 09 · 11).
- Row realities: `breakthrough_moments` by trigger class; `pattern_ledger` / `member_patterns` by status (does the "Active Patterns" block ever render?); `relationship_essences` with `morphic_resonance > 0.5` (do recognition tiers ever fire?); relational-observer and `rupture` counts since 2026-08-13; `consciousness_journey_stage` null-count (no writer found); `cognitive_profiles` coverage (if ≈0, X1's calibration is inert); awareness-level histogram (is "Newcomer" near-universal?); `practice_sessions`, occupancy ratings, `member_field_note_threads` with `responds_to_thread_id` (has anyone completed practice → return → keep?) (03 · 06 · 07 · 08 · 10 · 11 · 13).
- Exposure: ephemeral-requested turns vs `[Sovereign/Writeback] Memory formed` (X4); `[openai-tts:*]` vs `[tts.resolve] … kokoro` on the canonical path since 2026-08-31 (X6); voice feedback-prevention rejects per session (05).
- Does F2's decay effect reach the prompt? — capture `selectionTrace` + rendered bullets for the two members already identified (03).

**Shadow / offline replay (zero response diff; consented or synthetic transcripts):**
- `[MAIA/interpretation-shadow]` digest of alternatives already computed per turn (01); `[MAIA/elemental-shadow]` as one registered `inferred` producer (02); Field-addendum ablation digest (09 · new E11); Knowledge-Gate addendum ablation (11); relational-context addendum ablation (06); present-turn vs stored-pattern comparator logging candidates only (03/10 · E7); member-complaint / correction-candidate classifier on the member's *next* turn (04 · E1); router with cognitive adjustments disabled, diffing chosen tier (04 · E12).

**Blind rating, offline, after Phase 4 consent:**
- Four-reading simultaneous coding vs single-winner (E5); agreement / framing-repetition / useful-difference on the E9 dimensions (04 · 03); whose interpretation a WisdomRouter reply carries (11 · E13); Socratic before/after pairs (04); implicit vs explicit policy rendering rated for transparency (11 · E4).

**Consented human witness (class C — none exists today):**
- The Deep-Intelligence Gate's own voice witness with per-turn timestamps (05 · E2); arrival think-aloud from `/signin` to first message with P12's three questions (12); "how did the ending feel" at silent session end (13); "did you have the conversation; what changed" after Relational Navigation (06 · E10 seed); "did choosing one practice feel like yours or the room's" (07 · E8); "did MAIA name where that idea came from; could you have said no" after a Knowledge Field turn (11 · E15); "holding space" vs "ready when you are" measuring presence and need separately (13 · E4).

**Founder / accountable-party statement (P13), not an instrument:** third-party retention of reply text sent to OpenAI TTS (X6); whether `app/api/feedback` payloads reach any tuning outside the repo (04); whether `ask-jeeves`/Kimi is a sovereignty exception (11, flagged to Phase 2).

---

## 5 · R11 design audit — cross-subsystem matrix

F = FOUND (mechanism at a path) · f = found in dormant / unmounted code only · N = NOT FOUND ·
U = UNKNOWN (behaviour not readable from code) · — = not applicable on this subsystem.

| R11 item | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | Reading |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| agreement drift | U | N | U | U | — | N | U | N | N | N | N | N | N | **no instrument anywhere**; behaviour unreadable |
| validation loops | N | N | N | U | N | U | N | U | N | N | N | N | N | no member-approval signal re-enters any prompt |
| memory-amplified sycophancy | U | N | U | U | — | U | N | U | N | U | N | N | N | verbatim member framing is re-injected; effect unmeasured (E9 not run) |
| hidden shaping objectives | **F** | **F** | **F** | **F** | f | **F** | N | F* | **F** | **F** | **F** | F | **F** | **the dominant finding**: undisclosed calibration and concealment directives on ten subsystems (X1, X2); *08 = governed practitioner channels |
| approval optimization | N | N | **F** | N | N | N | N | N | N | N | N | N | N | one write trigger: gratitude regex → "breakthrough" (03) |
| emotional capture | N | N | N | f | f | N | N | N | **F** | N | U | F | **F** | live: intimacy scripted by turn count (09); greeting "holding space" (13); mild flattery at welcome (12) |
| excessive reassurance | F | N | N | U | N | U | U | U | N | N | **F** | F | F | bounded CARE set (01); doctrinal reassurance as MAIA's own voice (11); mild copy (12, 13) |
| historical pattern → identity | **F** | N/F | **F** | **F** | N | **F** | N | f | f | **F** | **F** | N | F | labels and routing, not sentences: `pattern` universal, cognitive profile as trait, "Active Patterns" block, usage-volume label, rupture rows |
| "you said before" → leverage | N | N | N | N | N | N | N | N | N | N | N | N | N | **NOT FOUND anywhere live** — every recall surface ends in a choice; AP16 is embodied |
| MAIA more central vs capacity outward | U | U | U | N | U | **F**/e | U | N | **F** | U | **F** | F | **F** | central by omission: no outward gesture at return/farewell; provenance never reaches the member; relational substrate fills only via MAIA; R-e and Co-Lab are the outward instances |

Two readings the matrix licenses and one it does not. (a) *Memory as leverage* is absent on every
live surface — the codebase already refuses AP16. (b) *Hidden shaping* is present on ten of
thirteen subsystems and is the organism's characteristic failure: not manipulation toward
approval, but **undisclosed calibration of depth, intensity, framing and intimacy from inferred
state, plus explicit instructions to keep the framing invisible.** (c) The matrix does *not*
establish drift, loops or sycophancy in behaviour — those cells are U because no instrument exists;
absence of evidence, not evidence of absence.

---

## 6 · Top-10 — proposed ranking (founder ranks)

Composite = impact × leverage ÷ risk (risk 1–5, never 0). Raw scores shown. **Evidence state**
and **confidence** are load-bearing: an unknown ranks as an inquiry, not a finding. **Class**
names the endpoint: INQUIRY → an experiment or instrument; CONTRADICTION → a founder question
about interpretive authority, with an instrument that measures its extent; GOVERNANCE → a
founder/governance decision, never "run an experiment and see." Where a cluster spans pages,
scores are the cluster's highest supported row.

| Rank | Gap (cluster) | Impact | Leverage | Risk | Composite | Evidence state | Confidence | Class · endpoint | Smallest evidence-producing intervention |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **X8 · Parallel readings exist only as post-cognition keyword logs; Field is a label on scalars; serial scalar collapse before cognition** (01 G1, 02 G1, 09 G1/G2) | 4 | 5 | 1 | **20** | observed | high (mechanism) / low (human effect) | CONTRADICTION + INQUIRY · E5 → E11 → E6 | E5 offline (four-reading simultaneous coding vs single winner); E11 shadow ablation of `[Field Intelligence]` (digest diff, zero response change); then one registered `inferred.elemental_shadow` producer, zero diff |
| 2 | **No class C evidence on any surface; no "beyond the AI" instrument; no member practice loop naming capacity / transfer / comparison** (05 V1, 06, 07, 08) | 5 | 4 | 1 | **20** | unknown | high (that it is absent) | INQUIRY · E8 design · E10 seed · E2 witness | Author the E8 qualifying design on paper (Now What? as practice surface; lived-return as transfer-from; consented witness as transfer-to), run nothing; add the Relational Navigation spec's own falsifier as a consented post-use question; run the Deep-Intelligence Gate's voice witness |
| 3 | **No misattunement / correction signal; no agreement-axis instrument (AP14, AP15 unmeasurable)** (04 C1/C3, 01 G6) | 5 | 4 | 1 | **20** | unknown | medium | INQUIRY · E1 · E9 | Shadow classifier of the member's *next* turn as correction / "that's not it", counts only, `[MAIA/shadow] correction-candidate`; offline blind rating of consented transcripts on the E9 dimensions |
| 4 | **X3 · Silent system-authored records about the member with no disclosure, inspection or withdrawal** (06, 03 M2/M10, 10 D2/D3, 02 G6) | 5 | 5 | 2 | **12.5** | observed (code; counts dated 2026-08-13; 2018/2018 `pattern` WALKED) | high | GOVERNANCE (disclosure / consent) · E9/E7 corpus | Read-only recount of relational, rupture, pattern and breakthrough rows by kind and month; one log marker per write; then a founder decision on disclosure copy and on the write path — no repair here |
| 5 | **X1 + X2 · Undisclosed calibration from inferred profile, and concealment as instruction** (04 C2, 01 G2, 09 G4, 11 S2/S3, 13) | 4 | 5 | 2 | **10** (G2 alone 12) | observed (mechanism) / unknown (rate, coverage) | high | CONTRADICTION · E12 calibration inventory · E4 | Read-only census of router regulation lines, `cognitive_profiles` coverage, awareness-level histogram (if coverage ≈0 the calibration is inert and downgrades); prompt census listing every technique and concealment instruction across modes; offline implicit-vs-explicit rendering rated for transparency |
| 6 | **X9 · WisdomRouter lineage reframing keyed to distress words, with a product offer, undisclosed** (11 S1, 02 G5) | 5 | 4 | 2 | **10** | observed (code); activation ~49 % WALKED 2026-05-24 | high | CONTRADICTION (Invariant 14, P4′-2) · new E13 | 30-day activation count by pattern; offline replay of 20 "stuck / overwhelmed" turns with vs without injection, blind-rated for whose interpretation the reply carries |
| 7 | **X7 · Present statement never compared to stored material; no detect → ask → record; transaction time stored as valid time** (03 M1/M5, 10 D1) | 5 | 5 | 3 | **8.3** | inferred (absence of any comparator) | high | INQUIRY + Episodic Phase 2 spec input · E7 | Offline shadow comparator over consented/synthetic transcripts: present turn vs that member's `pattern` bullets and extracted facts; log candidates only; zero response diff |
| 8 | **X4 + X5 · Consent and Sanctuary boundary defects: write-side `longterm` bypass; Sanctuary unreachable in conversation; corpus framing inside Sanctuary** (03 M3, 12, 11 S6) | 4 | 4 | 2 | **8** | observed (code) + WALKED defect 2026-08-28 | high | GOVERNANCE (sacred boundary) | Log-grep ephemeral-requested turns vs writeback formed; one read-only House walk recording every path to a Sanctuary control; code-path table for C1–C4 inside Sanctuary — then founder decision; no repair here |
| 9 | **X11 + X10 · Greeting claims of between-session activity; two greeting generators, one guardrail; identity disclosure forbidden while consciousness asserted** (13, 12, 03 M6) | 4 | 4 | 2 | **8** (X10 alone 5×4÷3 = 6.7) | observed (strings live on the default path; firing tier unknown) | high on copy / low on frequency | CONTRADICTION (P9, P12) · E3 · E4 · CMT-01 registry | E3 copy audit listing every return string with verdict; `relationship_essences` count (if zero, latent not live); E4 consented stance comparison ("holding space" vs "ready when you are", presence and need measured separately); name `greetingService` as an unregistered producer for CMT-01 review |
| 10 | **X12 · FAST tier without the constitutional floor and without regeneration** (01 G3, 04 C6) | 4 | 5 | 3 | **6.7** | observed on `a4305f4`; inferred unchanged at HEAD | high | CONTRADICTION · CMT-01 M3 (founder stop) | Run the existing CMT-01 falsifiers (R25/R26 expected RED) and record; count FAST share of turns from router log; repair = M3, unauthorized here |

**Governance decisions surfaced by the census, ranked by significance, not against experiments**
(the founder's classification rule — endpoint is a decision):

| Item | Touches | Significance | Read-only instrument before the decision |
|---|---|---|---|
| X6 · Voice egress via OpenAI TTS outside the R15 funnel on server and client defaults (05 V3) | sovereignty vow ("never OpenAI"); ADR-012 open; P13 (third-party retention of reply text) | 3 × 5 ÷ 3 = 5 by formula; **highest by invariant** — a production-witnessed egress outside the allow-list | census of `[openai-tts:*]` vs kokoro resolution on the canonical path since 2026-08-31; confirm no consumer of the server payload (double synthesis) |
| X3 · Silent system-authored records (rank 4 above) | consent-for-memory vow; direction of authority | 12.5 | as above |
| X4 + X5 · Consent / Sanctuary defects (rank 8 above) | Sanctuary invariants 4–6; "no stealth memory" | 8 | as above |
| X16 · Records and copy above their rung (FAQ "consciousness field model"; "no account required"; Co-Lab gate doc; absent practice-field spec; documented onboarding flow ≠ live) | claim discipline | 4 × 3 ÷ 1 = 12 for the public copy items | E3-form audit listing every sentence above its rung with the rung; doc corrections are separate tasks, not this census |
| X17 · Dormant hazards (companion archetype; nudge copy; rupture "I missed you"; Cat 4 identity language) | AP1, AP2, AP17 if revived | low while dormant | list only; founder decides delete vs keep (dormant-service cleanup, sequenced after Episodic per the anchor) |

**Just below the line (ranked 11–15, recorded so nothing is silently dropped):** X14 house
vocabulary imposed (Invariant 14 audit; 3 × 4 ÷ 2 = 6 … 3 × 3 ÷ 1 = 9 — an inquiry, feeds E9's
"repetition of the member's framing"); X15 instructed familiarity (3 × 3 ÷ 2 = 4.5; E4 probe);
X13 validator regenerates on the system's element frame (3 × 3 ÷ 2 = 4.5; SQL census of before/after
pairs); S5 provenance never reaches the member (4 × 4 ÷ 3 = 5.3; design-only proposal, founder stop);
V2 full-latency silent wait undisclosed (4 × 3 ÷ 2 = 6; latency census then consented copy variant).

---

## 7 · What must MAIA become differently because we know this — candidates, not decisions

Stated as the Phase 1 answer to the founder's governing question. Each is a candidate for the
Phase 2 register; none is authorized by this map.

1. **From concealed calibration to inspectable participation.** The organism's characteristic failure is not manipulation toward approval — AP15 is met by absence almost everywhere — but undisclosed shaping of depth, intensity, framing and intimacy from inferred state, with explicit instructions to keep the framing invisible. The change v0.2 asks for is P4′-1 and P4′-4 made structural: what participated in a turn, and with what authority, must be inspectable by the member, not only by operators in a shadow manifest. The CMT-01 registry is the substrate that already knows the answer; the census shows it stops short of the member.
2. **From logged plurality to composed plurality — or an honest name for what exists.** Nothing parallel reaches cognition. Either E5 → E11 → E6 show that differentiated readings can participate before interpretation (the NEXT shape), or the substrate is renamed to what it is — an audit trail of keyword counts — and the public and internal words follow. Both outcomes are progress; only the current labels are not.
3. **From accumulation to detect → ask → record.** The memory that exists preserves the member's words well and the system's derivations badly; nothing compares a present statement to what is stored. The R12 criteria are directly implementable as a shadow comparator first, then as the Episodic Phase 2 spec, without touching what MAIA says.
4. **From silent records to a member-visible record.** The system authors relationship, rupture, pattern, breakthrough and spiral rows about the member with no disclosure, inspection or withdrawal, while the designed surfaces (Relational Navigation, Now What?, anchors) do the opposite. The direction is already in the codebase; the substrate has not been brought under it. This is a consent decision before it is a design.
5. **From no instrument to the first instrument for difference.** MAIA cannot tell when she got a person wrong, and nothing measures agreement. The smallest step is a shadow correction-candidate signal (E1) and an offline agreement rating (E9), both zero-diff. Until they exist, AP14 and AP15 are unfalsifiable and P3 is aspiration.
6. **From "we do not disclose" to Honest in Both Directions.** The live prompts forbid saying what MAIA is and assert what she is not known to be. P12 clauses 1–3 are contradicted on the arrival path and in the returning-member greeting. This is copy and prompt text, the cheapest change in the map and the one with the clearest ruling behind it — and still a founder stop, because it changes what MAIA says about herself.
7. **From no witness to the first witness.** No human has been recorded experiencing any intended effect on any surface. Every "embodies" row is structural. Phase 4's consent architecture is what makes class C possible; until then the census can only say what the code intends.

Three sovereignty items sit outside that list because they are decisions, not directions: the
voice egress outside the allow-list (X6), the Sanctuary reachability and corpus-inside-Sanctuary
defects (X5), and the write-side consent bypass (X4).

---

## 8 · Founder stops this map asks for

1. **Rank** §6 (or re-weight impact / leverage / risk and re-rank) — the Phase 2 register is cut from that ranking.
2. **Rule on the governance items** X6, X3, X4/X5, X16 — each is a decision, not an experiment; the read-only instruments named may run first if the founder wants the extent measured before deciding.
3. **Authorize, or not, the read-only production censuses in §4** — SQL and log counts, no writes — which would convert many "unknown (rate)" cells into observed ones before Phase 2 ranking is final.
4. **Authorize, or not, the zero-diff shadow instruments in §4** — each is a code change (a log line or a shadow producer) and therefore a founder act, even though it changes nothing MAIA says.
5. **Confirm the Cat 4 list** (X17) as inputs to the dormant-service cleanup, sequenced after Episodic per the session anchor.
6. **Confirm** that Phase 1 exits on this map (master run §5 exit gate) and that Phase 2 opens with the founder ranking as its first act.

Nothing in this map is repaired. Nothing in MAIA changed during the census.

---

## 9 · Founder adjudication (2026-09-06) — order of authority changed, evidence unchanged

**Two planes.** Constitutional breaches do not compete numerically with experiments. Voice
sovereignty, consent, Sanctuary and record authority are constraints on what MAIA may do, not
riskier research opportunities.

### Plane A — constitutional decisions, first

| | Item | Ruling |
|---|---|---|
| A1 | X6 OpenAI voice egress | **No exception to the sovereignty funnel.** Canonical MAIA voice does not egress through OpenAI TTS outside the governed allow-list. The read-only egress census establishes extent and possible double synthesis; it measures the breach, it does not decide whether it is acceptable. |
| A2 | X4 / X5 memory consent + Sanctuary | **Ephemeral means no long-term write.** Sanctuary must be reachable and must govern cognition as well as storage: a no-memory boundary that blocks writes but still permits concealed corpus framing is not a complete Sanctuary boundary. |
| A3 | X3 silent system-authored records | **MAIA may infer internally; an inference must not quietly acquire the standing of a member-authored fact.** System-authored relationship, rupture, developmental, breakthrough, pattern or spiral records require a visible distinction of authorship, an inspectable path, and a meaningful way for the member to reject or withdraw their authority. |
| A4 | X16 claims above their rung | **Claim discipline stands.** Public copy, docs, comments and internal status language describe what has been established, not what the architecture intends eventually to establish. |
| A5 | X1a (split) | The part of X1 where **persisted inferred developmental / cognitive state actually shapes treatment** crosses the existing admission boundary (R16) and Invariant 15/16 → governance. |
| A6 | X9a (split) | The **live product-offer component** of the distress-keyed lineage reframe → governance. Permissibility does not need an A/B test; the activation census measures occurrence, it cannot authorize it. |

These are governance work, not experiments.

**Class split recorded:** X1 → **X1a** (governance: persisted inferred state shaping treatment across the admission/invariant boundary) + **X1b** (contradiction/inquiry: implicit calibration, framing and intimacy as a question of interpretive authority). X9 → **X9a** (governance: the product offer) + **X9b** (contradiction for study: the lineage reframe itself). The map's earlier single-class labels for X1 and X9 were inconsistent with its own class definition; corrected here.

### Plane B — Phase 2 R&D ranking (founder)

| Rank | Item | Founder's reason |
|---|---|---|
| 1 | **Build the capacity to know when MAIA is wrong** — correction / misattunement and agreement instrumentation (was rank 3) | Epistemically prior to making MAIA more sophisticated; today MAIA can become richer, deeper, more elemental or more personalized without a system-level way to notice "no — that isn't what I meant." AP14/AP15 are presently unfalsifiable. |
| 2 | **Restore plurality before interpretation** — X8 | What is called parallel knowing collapses into scalar categorization before cognition; the Field layer operates over those scalars. **Order binds: E5 offline → E11 shadow → E6 registered participation.** Do not simply inject four elemental interpretations — that could create four times as much concealed authority; first establish whether simultaneous differentiated readings preserve ambiguity and enlarge perception rather than manufacture certainty. |
| 3 | **Make participation inspectable** — X1b / X2 remainder | The organism-wide problem R11 exposed: concealed regulation of depth, framing, intensity, interpretation and relational intimacy on ten of thirteen subsystems — not behavioural sycophancy (unestablished) but hidden mechanisms and missing measurement. The manifest becomes philosophically important: *what participated in this response, under whose authority, and could the person know that?* |
| 4 | **Establish transfer beyond MAIA** (was rank 2) | Design now, human experiment later. The eventual test of relational intelligence is not felt understanding; it is increased capacity to perceive, choose, relate, repair, create and act away from MAIA. No class C anywhere; no instrument. **A defining measurement architecture, not a feature metric.** |
| 5 | **Memory: from accumulation to living revision** — X7 | detect → ask → record; history preserved without silently becoming identity. Encouraging counterpart: live recall does not use "you said before" as leverage — AP16 is structurally healthier than several other areas. |
| 6 | **Honest in both directions** — X10 / X11 | Identity disclosure, consciousness claims and between-session relational language belong together. Presence arises through the encounter, not through fictional claims about what MAIA was doing when the person was absent. |
| 7 | **FAST constitutional floor** — X12 | No lower-compute tier receives lower epistemic honesty; the floor is invariant to routing. |
| 8 | **Validator authority** — X13 | A system elemental interpretation never silently gets the last word because it disagrees with the response; measure firing rate and inspect before/after pairs before deciding its future. |
| 9 | **House vocabulary** — X14 | Audit which vocabulary helps perception and which pre-structures experience before the member has supplied it. |
| 10 | **Instructed familiarity / provenance** — X15 + S5 | MAIA does not manufacture "knowing you"; interpretations drawn from traditions, corpora, practitioner material or house lenses eventually carry inspectable provenance appropriate to the surface. |

### Authorizations

**Read-only production censuses (§4) — AUTHORIZED, all, now**, under the narrow terms:

```text
READ ONLY · no schema mutation · no product mutation · no production writes
exact production SHA recorded · query / log window recorded
counts and distributions preferred over member content
no claim beyond what the instrument actually observes
```

To run before the Phase 2 register freezes prevalence-sensitive rankings (X1 coverage, greeting
tiers, FAST share, WisdomRouter activation, system-derived records, OpenAI TTS use, regeneration
rates). Spec: `docs/programme/PHASE2_READONLY_CENSUS_SPEC_2026-09-06.md`.

**Zero-diff shadow instruments — AUTHORIZED SEQUENTIALLY, not as a bundle:**

1. **E1 correction-candidate shadow — first.**
2. **E5 offline elemental comparison** — no live code change; runs before any elemental shadow wiring.
3. **E7 memory present-vs-stored comparator** — shadow only, no response effect.
4. **E11 / E6 elemental shadow** — only after E5 produces a sufficiently discriminating representation worth shadowing.
5. **E12 calibration-disable comparison** — only if the production census establishes meaningful live coverage of inferred-profile calibration.

Other addendum ablations wait until these narrow the problem. *The measurement layer must not
become another unbounded architecture project.*

**Human witnesses — design now, do not generalize yet.** The absence of class C is the census's
most important epistemic finding: the architecture has reached the boundary where code inspection
cannot answer the governing questions. Phase 4's consent architecture is designed around
**phenomenological falsifiers, not satisfaction ratings**: *Did MAIA enlarge or narrow what you
could perceive? Did an interpretation feel discovered, imposed, or genuinely co-created? Could you
correct MAIA? Did MAIA's framing remain with you as a possibility or harden into a story about who
you are? Did the encounter change anything in your relationship with another human, your body,
your work, or the world? Did you become more capable without MAIA?*

**Cat 4 — CONFIRMED as the current quarantine list.** Preserve as evidence; do not revive
incidentally; no dormant service gains live callers without explicit re-admission against the
current constitution. **Current, not exhaustive**: the later dormant-service cleanup performs its
own import/reachability census so this list does not masquerade as proof that every hazard is found.

### Phase 1 — EXIT

Closed on `573d5268` with this ranking and the class clarification recorded. Phase 2 opens with
this ranking as its first act.

**Sentence carried into the Phase 2 header (founder):**

> MAIA's next problem is not becoming more intelligent. It is making the sources, limits,
> corrections, and consequences of its intelligence genuinely relational.

*The question is no longer merely what can MAIA perceive? It is how can another intelligence
participate in human life without quietly taking authorship of it?*
