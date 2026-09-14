# P1-04 · G3 · AUTHORITY — what gates, what governs, and what the records could not find

```text
GRAPH     G3 AUTHORITY
EDGES     GATES (E1, 14) · GATES-PARTIALLY (E1, 25) · GATE-NAMED-QUALIFIED (E1, 20)
          · CI-GATED-ONLY (E1, 4) · GOVERNS (E1, 20) · NAMES-WITHOUT-IMPLEMENTING (E1, 7)
          · HAS-AUTHORITY rung (E1, 1)
MARKERS   NONE FOUND × 85 gates, × 194 governing sources — node markers, ⛔ not missing edges
ABSENT    NOT DETERMINED × 64 gates — E4 UNKNOWN, ⛔ never a refusal or a zero
```

> ⛔ **The separations hold here or nowhere.** `INFERENCE ≠ RELATIONAL AUTHORITY`. Execution,
> persistence, cognition, output, routing and a decision-producing capability establish **no**
> authority edge. Every edge below comes from a record that names a gate or a governing source.

## 1 · ⭐⭐ One node in 221 is established at `HAS AUTHORITY`

```text
P3-D-06   enforceFieldSafety → FieldSafetyDecision
          LADDER              HAS AUTHORITY  (D §6 ans.4 path (e): "the only object in
                              Domain D at HAS AUTHORITY")
          GOVERNANCE GATE     PARTIAL
          GOVERNING SOURCE    NONE LOCATED
          CLASS               E1 for the rung; E1 for both qualifications
```

⭐ **The organism's one established authority-bearing object has a partial gate and no located
governing source.** ⛔ Not a defect claim, not a repair proposal: it is what two fields of one row
say, carried together so the rung is never read alone. And ⛔ `DECIDES` is empty (G2 §1), so this
node's rung was not reached by promotion from below — the register placed it there directly.

## 2 · The gate layer

### GATES — PRESENT (E1, 14)

| P3 row | GOVERNANCE GATE — PRESENT (E1) | named object |
|---|---|---|
| `P3-A-01` | PRESENT, RUNTIME-GATED — ensureSchemaReady→503 (:296-306) · missing message→400 (:366) · assertProviderAvailable→503 ( | Canonical member chat turn — POST /api/s |
| `P3-A-04` | PRESENT — FULL FOUR standing texts appended unconditionally (maiaVoice.ts:530/:536/:540/:544). ⚠️ MAIA_SAFE_MODE=true  | CORE tier prompt assembly and generation |
| `P3-A-07` | PRESENT — identity must be verified else 401 (:38-40) · feature flag WRITERS_STUDIO_FOCUS_ENABLED · WriterCanonicalOnl | Writers-Studio canonical turn — POST /ap |
| `P3-A-13` | PRESENT — refusal-19-oracle-lane-disabled.ts (grade A), asserting the body is never read and the content writers (stor | /api/oracle/conversation — blocked lane |
| `P3-B-03` | PRESENT, RUNTIME-GATED (SQL boundary) — five refusal predicates incl. sacred_protected absolute refusal (:285), PRACTI | loadMemberMemoryAtomsForPrompt (memoryHe |
| `P3-B-04` | PRESENT — conversational_recall_enabled read at loader (:245), default-on, graceful-true on error; member-writable via | loadPriorCrossSessionExchanges (conversa |
| `P3-B-21` | PRESENT (prompt floor + post-generation scrub). ⚠️ Whether the scrubbed text replaces member-facing text on the sovere | memoryCanonGuard (MEMORY_CANON_GUARD_PRO |
| `P3-B-23` | PRESENT AND STRUCTURAL — private constructor, fails closed (ANY affirmative signal wins), cannot be forged by an objec | TurnPosture / contentWritable (Sanctuary |
| `P3-C-01` | ⭐ PRESENT AND ENFORCED IN SCHEMA — UPDATE refused by trigger; insert trigger admits exactly seven observation keys and | developmental_readings — frozen developm |
| `P3-C-02` | PRESENT — append-only by trigger; standing ∈ {keep, dismiss, unresolved}; unset is zero events, "there is no default;  | developmental_observation_standing_event |
| `P3-C-04` | PRESENT AND NARROW at the surfacing site — explicit member handoff only (list/route.ts:906-910, fires on a client-supp | member_relationships + relationship_entr |
| `P3-C-09` | ⭐⭐ PRESENT, AND IT IS A REFUSAL — "System-inferred member themes (member_theme_signals) are SUSPENDED from the … Do no | member_theme_signals (participatory real |
| `P3-D-09` | PRESENT AND NAMED — env flag + named absence event `field_context_unavailable` + declared non-mutation boundary (the o | D-OBJ-9 `getFieldContext` / `buildFieldC |
| `P3-G-04` | ⭐ PRESENT — *the only structural runtime provider gate found in domain G* (altitude RUNTIME-GATED) | `runStructured` + `resolveStructuredMode |

### GATES-PARTIALLY — partial · qualified · defeated in one path (E1, 25, carried verbatim)

⭐ *A gate that governs one of two call sites is carried as partial, ⛔ never rounded up to
present nor down to absent.*

| P3 row | GOVERNANCE GATE — PARTIAL / QUALIFIED / DEFEATED (E1, carried verbatim) | named object |
|---|---|---|
| `P3-A-03` | PARTIAL, AND DIVERGENT — receives PLATFORM_KNOWLEDGE_ADDENDUM only (maiaService.ts:5, used :1505); INTERFACE | FAST tier prompt assembly and generation |
| `P3-A-06` | PARTIAL — egress discipline only (finalizeMemberFacingText), added because "this path previously skipped all | RCN early-return cognition — maiaRcnProc |
| `P3-A-10` | PARTIAL / CI-GATED — refusal-14-identity-predicate-guard.ts · refusal-24-cross-session-continuity-truthfulne | Egress — member-facing finalization (fin |
| `P3-A-11` | PARTIAL — SAFE_MODE at between/chat/route.ts:370 · pipeline provenance header 'orchestrator.generateMaiaTurn | /api/between/chat — live-secondary lane |
| `P3-A-16` | PARTIAL — sovereignty refusal at the gateway, which at least four independent model reaches do not pass. Det | Model / provider dispatch — generateText |
| `P3-B-01` | PARTIAL — sanctuary contentWritable refuses at TurnsStore write boundaries (:113, :206, :256) | TurnsStore + meta.conversationHistory (s |
| `P3-B-05` | PARTIAL — episodic_recall_enabled is READ and enforced (memoryLoaders.ts:332) and cited as consentBasis (pro | loadRecentMarkedEpisodes (episodic, memb |
| `P3-B-06` | PARTIAL — route :943 allowCrossSessionMemory && userId (derived :520 as isRecognizedUser && !isSanctuary). ⛔ | loadRecentDevelopmentalMemories → buildM |
| `P3-B-07` | PARTIAL — same route :943 gate as B-06; no per-layer consent gate | loadRecentThemeSignals (pattern cue) — m |
| `P3-B-10` | PARTIAL — sanctuary gate at route :750 | buildMemberLiveContext ("member web") |
| `P3-B-13` | PARTIAL — sanctuary gate at route :908 | Relational Context Bridge (getMemberActi |
| `P3-B-14` | PARTIAL — sanctuary gate at route :1105 | loadRecentIChingReadings (divination rec |
| `P3-B-15` | PARTIAL — write gated by allowLatticeWrite (:3676); read: none — the recall runs and is discarded regardless | ConsciousnessMemoryLattice — resonance r |
| `P3-B-20` | PARTIAL — canon citation only (memoryHealth.ts:4 cites docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII); ⛔ no runt | buildMemoryHealth / recordRuntimeTurn —  |
| `P3-C-03` | PARTIAL, SINGLE-SITED — admitPersistedStateForShaping() strips INFERRED_DEVELOPMENTAL_FIELDS (lib/relational | member_spiral_state (Bridge D) [Band II] |
| `P3-C-05` | PARTIAL — sanctuary honoured at the enclosing block (list/route.ts:1826); ⛔ no consent gate, no member notic | member_relational_signals (system-detect |
| `P3-C-08` | PARTIAL — status/register guards at both read sites; disclosed denominator and stated criterion at gathering | living_field_affinities (system-created  |
| `P3-C-10` | PARTIAL — ⭐ the strongest consent reasoning found on a memory write in this domain: refuses Sanctuary-origin | episodic_memories [Band VI] |
| `P3-D-02` | PARTIAL / DEFEATED IN ONE PATH — `isPFIMindEnabled()` governs (a) and does not govern (b) | D-OBJ-2 PFI mind state — `generatePFIMin |
| `P3-D-05` | PARTIAL — in-source "H2"/"W2" commentary only; per constraint 6 a citation is not a located source | D-OBJ-5 `routePanconsciousField` → `Fiel |
| `P3-D-06` | PARTIAL — in-source constitutional commentary only | D-OBJ-6 `enforceFieldSafety` → `FieldSaf |
| `P3-E-03` | PARTIAL — Sanctuary on the FieldContext is a real gate; ⛔ NONE FOUND on the element computation itself | `ElementalOracleBridge` → `elementalResu |
| `P3-E-05` | PARTIAL — one exists, on SHAPING only (Refusal R16, P3-E-10), and it does not name `dominant_element` or `ph | `member_spiral_state` substrate + `upser |
| `P3-E-12` | PARTIAL — Sanctuary refusal is a real gate; ⛔ no further governance located for the non-Sanctuary default-on | Corpus Callosum trace — `corpusCallosumS |
| `P3-H-08` | ⚠️ PARTIAL — `restartAuthority.ts` documents a P0 and encodes the policy in one place; the consent rule itse | `lastSendWasVoiceRef` + `lib/voice/resta |

### GATE-NAMED-QUALIFIED — a gate is named, and the record qualifies what it reaches (E1, 20)

⭐ This class exists because the register repeatedly found a **real gate at the wrong altitude or
out of reach** — an access gate where the claim needed one, a boundary that is unreachable, a
registry that does not run at request time. ⛔ Folding these into `PRESENT` would manufacture
governance; folding them into `NONE FOUND` would erase work that exists.

| P3 row | GOVERNANCE GATE — NAMED, with the record's own qualification (E1) | named object |
|---|---|---|
| `P3-A-17` | ⭐ The refusal registry is the largest governance artifact in this domain and it DOES NOT RUN AT REQUEST TIME | Runtime governance instruments actually  |
| `P3-B-22` | It is itself the gate; ⛔ no governing rule located for the mode vocabulary | MemoryGate.resolveMemoryMode — env + all |
| `P3-C-13` | ⭐⭐ The most explicit relational-authority boundary in domain C — and it is unreachable. ⛔ Being authored is  | lib/relationship/scope.ts — the four-sco |
| `P3-C-14` | Reasoning stated in-file; ⛔ unreachable. ⭐ The module that reasons most carefully about what a practitioner  | lib/coachField/practitionerProjection.ts |
| `P3-D-29` | per-slug route auth (not read by D) | D-OBJ-29 "Fields" collaborative workspac |
| `P3-D-30` | `living_field_participant_consents` table exists — ⛔ its enforcement NOT traced by D | D-OBJ-30 "Living Field" (`living_field_a |
| `P3-D-31` | shelf validation `getShelfExperiments()` | D-OBJ-31 "Field Lab" experiment shelf |
| `P3-D-35` | `requireLabAccess()` (access gate; ⛔ no gate on the claim the number makes) | D-OBJ-35 Field Coherence Index dashboard |
| `P3-D-36` | `requireLabAccess()` | D-OBJ-36 `/labtools/coherence` — breath/ |
| `P3-D-38` | `requireLabAccess()` | D-OBJ-38 `/labtools/relational-field` se |
| `P3-D-39` | self-only access gate (per the route header) | D-OBJ-39 `/api/maia/field` — "field perc |
| `P3-E-04` | the env flag + mode condition select the computation (INF-3: selection authorizes nothing); no further gate  | Talk-mode `fieldAwareness` block (elemen |
| `P3-E-10` | ⭐ IT IS THE GATE — the single named, tested refusal attached to a developmental-state field in Domain E | `admitPersistedStateForShaping` — Refusa |
| `P3-F-06` | MULTIPLE AND STRUCTURAL — Sanctuary suppression · cross-session memory mode · member scoping as a bound para | F-06 `divinationRecallLoader` — member's |
| `P3-F-09` | an inline self-authored restraint at :32 — ⭐ the only self-authored restraint found outside the canonical wr | F-09 `app/api/studio/changes/[id]/mentor |
| `P3-F-10` | member scoping (:71) | F-10 `app/api/oracle/iching/route.ts` —  |
| `P3-F-14` | ⭐ `SYMBOLIC_LENS_BOUNDARY` applied at route.ts:732 (see P3-F-31) — the only real gate in Domain F. ⛔ No opt- | F-14 `maiaAstrologyContextService` — nat |
| `P3-F-28` | `SYMBOLIC_LENS_BOUNDARY` at route.ts:732 | F-28 `mayanAstrology` (Mayan profile, vi |
| `P3-H-05` | ⭐ `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` + the closed-set CI gate — *the strongest | `await handleTextMessage(cleanedText)` — |
| `P3-H-07` | G-T1 `assertProviderQualified` (R15 allowlist, fail-closed) · G-T2 `cloudVoicePolicy` · G-T3 `checkCloudCons | `maiaSpeak` · `handleSpeakMessage` · `ap |

### CI-GATED-ONLY (E1, 4) — `INF-2` in force

⛔ A static or build-time instrument is **not** a request-time gate. These four are carried as
their own class for that reason and ⛔ are not counted as runtime governance anywhere in G3.

| P3 row | GOVERNANCE GATE — CI-GATED ONLY (E1; INF-2 bars reading as runtime governance) | named object |
|---|---|---|
| `P3-A-08` | CI-GATED ONLY — refusals R25–R31 (tests/constitutional/refusal-registry/refusal-25…31-canonical-*.ts | CMT-01 canonical-turn shadow on /list |
| `P3-H-04` | CI-GATED non-degradation pin only — ⛔ no authorization ruling found for any individual guard. Per IN | `handleVoiceTranscript` guard set N1–N12 |
| `P3-H-06` | CI-GATED source-shape test only — ⛔ no ruling document found naming modality-independence as law | `commitOracleTurn(reason)` — one idempot |
| `P3-H-11` | CI-GATED negative assertion only | `sendStreamingMessage` / `useStreamingVo |

## 3 · The governing-source layer

### GOVERNS — located, unqualified in the record (E1, 20)

| P3 row | GOVERNING SOURCE located, unqualified in the record (E1) | named object |
|---|---|---|
| `P3-A-08` | CMT-01_M0-M2_WITNESS_2026-09-03.md (:99 live zeroDiff witness NOT yet obtained; :198 first shadow deploy ran as  | CMT-01 canonical-turn shadow on /list |
| `P3-A-10` | docs/canon/MAIA_CANON_v1.1 provenance headers (named in record) | Egress — member-facing finalization (fin |
| `P3-A-13` | refusal-19-oracle-lane-disabled.ts (CI instrument, not a governing document) | /api/oracle/conversation — blocked lane |
| `P3-A-14` | docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md · docs/architecture/VOICE_CANONICAL_CONVERGENCE_0 | /api/voice/stream-conversation — the sec |
| `P3-B-20` | docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII — cited, ⛔ content not re-adjudicated by the source record | buildMemoryHealth / recordRuntimeTurn —  |
| `P3-B-23` | The six documented Sanctuary invariants (CLAUDE.md); invariant 2 (no training data) NOT EVALUABLE from domain B; | TurnPosture / contentWritable (Sanctuary |
| `P3-B-25` | memory/project_recurrence_prevention_architecture.md is cited at maiaRuntimeContext.ts:22 in domain A and ⛔ NOT  | lib/maia/recurrenceDetector.ts |
| `P3-C-01` | docs/programme/WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md, cited in-migration; INV-0/1/2/3/4/22/25 named | developmental_readings — frozen developm |
| `P3-C-02` | WS2-07-BUILD-07F_DESIGN_2026-09-05.md, named as design of record; D3/D6/D7 cited in-schema | developmental_observation_standing_event |
| `P3-C-08` | docs/canon/ECOLOGY_OF_MIRRORS.md, cited in-route — governs INSPECTABILITY, ⛔ not selection weight or the LIMIT 1 | living_field_affinities (system-created  |
| `P3-C-13` | docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md, cited in-file at :5-6; ⛔ existence NOT VER | lib/relationship/scope.ts — the four-sco |
| `P3-E-29` | ⭐ the only Spiralogic artifact E found with ratified backing (P1-01; UG-E7) | `lib/spiralogic/registration/` — the cha |
| `P3-F-14` | MAIA_SOVEREIGNTY_INVARIANTS.md:241-252 — Invariant 13 (Claim-Type Floor) names the wrapper as its operationaliza | F-14 `maiaAstrologyContextService` — nat |
| `P3-F-28` | MAIA_SOVEREIGNTY_INVARIANTS.md:245 (Invariant 13 names Mayan) | F-28 `mayanAstrology` (Mayan profile, vi |
| `P3-F-31` | MAIA_SOVEREIGNTY_INVARIANTS.md:245-246 (Invariant 13, Claim-Type Floor; Tier 2 hard refusal) | `SYMBOLIC_LENS_BOUNDARY` (the wrapper it |
| `P3-F-34` | MAIA_SOVEREIGNTY_INVARIANTS.md:246 (the governing source exists; the implementation does not) | Invariant 13 Tier-2 consequential-foreca |
| `P3-G-11` | `scripts/provider-policy.json` (tiering) — ⚠️ and `docs/canon/PROVIDER_GOVERNANCE.md` is named but NOT READ; `do | the OpenAI SDK / `api.openai.com` surfac |
| `P3-G-12` | `scripts/provider-policy.json`; ⚠️ `docs/canon/PROVIDER_GOVERNANCE.md` named by the policy file's `_doc` key and | `scripts/check-provider-governance.ts` + |
| `P3-G-18` | DEPLOYMENT-SAFETY-01, founder ruling 2026-09-14 — ⚠️ attributed in-file (`deploy-production.sh:61`) for the fail | `run_migrations_or_abort` / `cmd_migrate |
| `P3-H-05` | `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` (named in `CLAUDE.md` as a hard acceptance gate | `await handleTextMessage(cleanedText)` — |

### ⭐ NAMES-WITHOUT-IMPLEMENTING (E1, 7)

A governing source is located **and the record itself says it does not implement, is not
located in turn, carries no status, or declares it has no runtime authority.** ⛔ These are not
`GOVERNS` edges and ⛔ not `NONE LOCATED` markers; they are their own edge type, because the
distinction between *no rule was found* and *a rule was found that binds nothing* is exactly
what this graph exists to keep visible.

| P3 row | GOVERNING SOURCE named — and the record itself says it does not implement / carries no authority (E1) | named object |
|---|---|---|
| `P3-D-43` | the canon document itself, which declares it has no runtime authority | `FIS Field State Primitive` |
| `P3-E-28` | the naming documents carry no status (UG-E7) | the S-16 12-phase document vocabulary —  |
| `P3-F-03` | MAIA_SOVEREIGNTY_INVARIANTS.md:246 names Tarot in Tier 2 — ⛔ no implementing mechanism found (P3-F-34) | F-03 `lib/divination/tarot/` (5 files, 1 |
| `P3-F-11` | MAIA_SOVEREIGNTY_INVARIANTS.md:246 names Tarot in Tier 2 — ⛔ unimplemented (P3-F-34) | F-11 `POST /api/oracle/tarot` — ⚠️ UNAUT |
| `P3-F-27` | MAIA_SOVEREIGNTY_INVARIANTS.md:245 names Vedic; no implementing binding located | F-27 `lib/astrology/chineseAstrology.ts` |
| `P3-F-32` | CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:104 asserts a mechanism the code does not contain (C-F2) | `safe_for_retrieval` |
| `P3-H-07` | ⚠️ `VOICE-SOVEREIGNTY-01 · "Founder canon ruling, 2026-08-27"` exists only as a doctrine block inside the module | `maiaSpeak` · `handleSpeakMessage` · `ap |

## 4 · ⭐⭐ The negative space, kept in two kinds

The instrument's absence rule is load-bearing here more than anywhere else.

```text
NONE FOUND — a domain SEARCHED and found nothing. E1 about the search.
             Carried as a NODE MARKER on the node, ⛔ never as a missing edge.
   gates              85 of 221
   governing sources 194 of 221

NOT DETERMINED — the record did not settle it. E4 UNKNOWN. A genuine graph ABSENCE.
   gates              64 of 221
   ⛔ never rendered as a refusal, a zero, or a negative finding

NOT APPLICABLE — no code object to gate.  9 of 221
```

**`NONE FOUND` gates, by domain:** D 27 · G 13 · I 12 · F 10 · A 6 · E 5 · H 5 · C 4 · B 3.
**`NONE LOCATED` governing sources, by domain:** D 45 · B 28 · F 28 · E 27 · H 16 · G 15 ·
A 13 · I 12 · C 10.

⭐ **Domain I is 12 of 12 on both.** Every one of the twelve member/practitioner capability
records carries `GOVERNANCE GATE: NONE FOUND` **and** `GOVERNING SOURCE: NONE LOCATED` — the
result its own domain commit named as *"twelve NONE FOUND"*, reproduced here from the fields
rather than from that message.

⚠️ **And that is the one place a reader will be most tempted to import Flow B.** ⛔ It is not
imported. `AUTH-EXPOSURE-01` is a separate lane at a separate altitude; its five static proved
exposures, its 859/944 structural finding and `W-1…W-4` appear nowhere in this graph and
contribute to no edge here. What G3 states about domain I is only what domain I's own twelve
records state. *The two lanes agreeing is corroboration available to a later step; it is not
evidence this step may spend.*

## 5 · What G3 does **not** establish

```text
⛔ that any object is ungoverned              NONE FOUND / NONE LOCATED are facts about searches
⛔ that any gate is sufficient                PRESENT is presence, not adequacy
⛔ that any object decides                    DECIDES is empty; ⛔ nothing promoted into it
⛔ that inference confers authority           INFERENCE ≠ RELATIONAL AUTHORITY, throughout
⛔ any repair                                 no proposal appears in this graph
```

---
_G3 assembled from the P1-03 register only. Every edge names its row and field; every absence is
typed as either a recorded search or an unknown._
