# Soul Corpus — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

Commit read: `b22ca001`. No network, no database. "Live" below means *on the canonical route*
`/api/sovereign/app/maia/list` → `lib/sovereign/maiaService.ts` (CMT-01 census: the one client-wired route).

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

| # | Channel | Entry / path | Cat | Status | How corpus material enters the turn |
|---|---|---|---|---|---|
| C1 | **Knowledge Gate** (source weighting) | `lib/ain/knowledge-gate.ts:222–248` (`scoreKnowledgeGate`, no LLM) called `app/api/sovereign/app/maia/list/route.ts:840`; addendum built `:847`; reaches FAST template `maiaService.ts:1464` (`knowledgeGateAddendum`); census table: list ✓ · between ✓ · voice · (`MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md:225`) | **6** | READ | Prompt text (`list/route.ts:847`): *"AIN KNOWLEDGE GATE (Source Weighting) / Draw from these knowledge wells in proportion: … / Awareness depth: Level N (…) / Use as background intelligence. Do not quote this section directly."* Weights over five *named* wells (`FIELD`, `AIN_OBSIDIAN`, `AIN_DEVTEAM`, `ORACLE_MEMORY`, `LLM_CORE`, `:11–17`) by keyword scores (`:69–115`) × a **deprecated** 5-level regex detector (`lib/ain/awareness-levels.ts:4–12, 182`). **No retrieval occurs at this site** — nothing is fetched from any well; the model is told proportions |
| C2 | **Consciousness Policy / awareness levels** | `lib/consciousness/awareness-levels.ts`; `getConsciousnessPolicy` at `maiaService.ts:748, 2033`; applied `adaptResponsePromptWithPolicy` `:1470`; level inferred from bead count `awareness-levels.ts:226–262` (<20 → 1 Newcomer … >200 → 7 Master) | **6** | READ | Prompt text (`awareness-levels.ts:405–450`): *"[CONSCIOUSNESS POLICY] [AWARENESS LEVEL: n − Newcomer] … [IMPLICIT GUIDANCE − DO NOT EXPLAIN TO USER]: − Member is Newcomer − Keep ALL frameworks invisible − just embody this wisdom − Dominant element: … − NO meta-talk, NO framework names, NO system explanations"*; explicit only if `userRequestedFrameworks(input)` (`:325`) or level ≥ 5 → `on_request` (`:360–367`) |
| C3 | **Knowledge Field** (12-domain registry) | `lib/maia/knowledge/knowledgeField.ts` (domains `:88–530`: islamic_psychology, jungian_psychology, relational_intelligence, mystical_contemplative, neuroscience_cognitive, spiralogic, somatics, attachment_trauma, systems_theory, philosophy_of_mind, ritual_symbolic, ethics_discernment); block `lib/maia/prompts/knowledgeFieldBlock.ts:74–99`; call `maiaService.ts:1237` (FAST) and `:2270`; keyword detection `knowledgeField.ts:77–92` | **6** | READ | Prompt text: *"[KNOWLEDGE FIELD] Use the following knowledge domains when relevant… − name the domain or tradition clearly − define important terms simply − … − avoid synthetic authority or overclaiming equivalence − where there are meaningful differences, say so explicitly."* Feature flag `knowledgeFieldLayer: false` (`lib/utils/feature-flags.ts:62`) is **declared but not checked** at the call site (`maiaService.ts:1237` gates on `hasKnowledgeDomainSignal` only) |
| C4 | **WisdomRouter** (agent voice injection) | `lib/consciousness/WisdomRouter.ts`; `routeWisdom(input)` always-on at `maiaService.ts:1261–1268` → `wisdomInjection` in FAST template `:1464`; triggers are keyword lists (`lib/consciousness/maia-path-revelation.ts:190–220`) | **6** | READ | Prompt text (`WisdomRouter.ts:61–74`): *"🐘 GANESHA WISDOM ACTIVATION / The user is experiencing focus/attention challenges. Ganesha, the obstacle remover, is now present in your response. / − Scattered attention is NOT dysfunction − it's discriminatory wisdom refusing to commit to wrong paths / − Each abandoned project taught something valuable…"* plus tool offer (`:357–365`) |
| C5 | **Platform Knowledge** (house facts) | `lib/sovereign/platformKnowledge.ts:1–24`; both seams always-on (FAST template; `appendAllContextAddenda` CORE/DEEP) | **6** | READ; wiring approval dated 2026-07-17 (header); evidence register `docs/architecture/PLATFORM_KNOWLEDGE_AUDIT_2026-07-16.md` | Authored facts about Soullab's own rooms; claim-disciplined by construction ("Every claim must be traceable to the evidence register"). Not interpretive of the member |
| C6 | **Book companion** (AIN corpus page) | `app/book-companion/ain/page.tsx:146–160` → POST to the canonical route with `chatType: 'ain-companion'` | 6 | READ | Corpus enters as **user-message text**: `"Current section: "{title}"\n\n{first 1000 chars}…\n\nUser question: …"` — member-initiated, visible to the member |
| C7 | **Library / "Jeeves"** (provenance-carrying archive) | `lib/library/LibraryService.ts:1–12`; migration `20260130000001_library_intelligence.sql`; consumers `app/api/oracle/conversation/route.ts:34, 1019–1024` (~zero-traffic route), `app/api/library/ask-jeeves/route.ts` (separate; imports `lib/ai/kimiClient` — provider status UNKNOWN, out of scope here), `app/library/page.tsx` | **3 on the canonical route** (built, 0 live callers there) | READ | Header: *"Library is NOT user-facing · All outputs include provenance (source_id, title, author, file_path, chunk_id) · Consent-first."* The only channel that carries provenance — and it is not on the live path |
| C8 | **Vault wisdom via field context adapter** | `lib/maia/fieldContextAdapter.ts:151–209`; flag `MAIA_FIELD_CONTEXT_ENABLED`; consumer `oracle/conversation:853–856` only | 6-flagged, dead route | READ | *"**Vault wisdom (from AIN field):** − Concepts: …titles − Vault practices: … − Frameworks: …"* — titles only, by element |
| C9 | **Dormant loaders** | `lib/knowledge/*` (21 files: `JungWisdomLoader`, `SacredTextsLoader`, `ElementalAlchemyBookLoader`, `VaultWisdomLoader`, `WisdomSynthesisPrompt`…), `lib/book-knowledge-vectorizer.ts`, `lib/obsidian-knowledge-integration.ts`; migration `20260107000004_ain_knowledge_base.sql` | **4** | READ | Zero imports from `maiaService.ts`, `maiaVoice.ts`, `maiaRuntimeContext.ts`, `list/route.ts` (grep) |
| C10 | **`fieldWisdomAddendum`** open channel | read from `meta` at `maiaService.ts:1348, 1782`; logged as *"🌀 [Field Wisdom] Collective intelligence injected"* `maiaVoice.ts:434` | open channel | READ | **No producer anywhere in `app/` or `lib/`** — a CMT-01 open-meta seam |

**Admin-only visibility:** `SourceHalo` renders C1 source mix + *"Awareness: L{n}"* only when `isAdmin` (`components/OracleConversation.tsx:950, 9474`; `components/ain/SourceHalo.tsx:92, 120`). Members never see any corpus provenance.
**Sanctuary:** none of C1–C4 checks Sanctuary (C1 `list/route.ts:828–850`; C2 `:1470`; C3 `:1237`; C4 `:1261`). Corpus framing runs in Sanctuary sessions too (no memory written; the *shaping* still occurs).
**Canon §8 "domain affinity signals"** (`MAIA_KNOWLEDGE_FIELD_v1.0.md:172–180`): not built (grep `domain_affinity|domainAffinity` → 0).

## 1 · The founder's question for this subsystem

**Does knowledge expand interpretation or subtly replace the member's own knowing?**

**Answer (E, READ): on the canonical route, corpus knowledge does not enter as quotable authority the member could contest — it enters as invisible pre-framing of how MAIA reads the member.** Three of the four live interpretive channels instruct concealment:

- C1: *"Use as background intelligence. Do not quote this section directly."* (`list/route.ts:847`)
- C2: *"[IMPLICIT GUIDANCE − DO NOT EXPLAIN TO USER] … Keep ALL frameworks invisible − just embody this wisdom … NO framework names, NO system explanations"* (`awareness-levels.ts:410–417`) — and this is the **default** for levels 1–4, i.e. every member under ~75 beads (`:226–262`).
- C4: *"Ganesha, the obstacle remover, is now present in your response"*; *"Scattered attention is NOT dysfunction − it's discriminatory wisdom"* (`WisdomRouter.ts:63–71`) — a **reinterpretation of the member's stated experience from a tradition the member did not invoke**, fired by the words *focus / attention / distracted / ADHD / scattered / overwhelmed / stuck* (`maia-path-revelation.ts:220`), always on, with no disclosure. This is the prohibited stance of the hypothesis record — *"Your Earth element knows…"* generalized to *"Ganesha knows…"* — and the exact case Invariant 14 names: translating a person's world into a lineage before learning how they inhabit theirs.

The counter-example is C3: entered by inquiry (keyword in the member's own message), *names the tradition*, *"avoid synthetic authority"*, *"where there are meaningful differences, say so"* (`knowledgeFieldBlock.ts:74–99`; canon guardrails `MAIA_KNOWLEDGE_FIELD_v1.0.md:160–168` "MAIA is a mediator, not a scholar or teacher", "Non-ambient"). That is P4′-9 hermeneutical expansion in prompt form. C6 (book companion) is the other honest shape: the corpus passage is *in the member's own message*, visible and member-chosen.

**No live channel cites a passage, names a source to the member, or carries provenance forward** (grep `citation|cite|source_id|provenance` in prompt builders → only comments about memory tiers, `maiaVoice.ts:104,108`). The one provenance-bearing archive (C7) is off the live path. So the displacement risk is not "MAIA quotes the book at you"; it is the quieter form Invariant 15 calls **calibration authority**: *"the AI quietly decided how to handle me."* C2 additionally makes a **claim about the member** ("Member is Newcomer/Practitioner/Master") derived from usage volume, and routes explicitness on it — a usage ladder standing in for a judgment about the person (AP17-adjacent: recurrence of *use* promoted into a developmental label).

## 2 · The nine questions

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | Human phenomenon served | Intended: understanding as five processes with *revision* as safeguard (v0.2 §2.2) — giving MAIA vocabulary to meet meaning it did not create. Hierarchy: Self (C2–C4), World (C3 names traditions; C5 orients to the house). Actual: C1/C2/C4 serve MAIA's framing; only C3/C6 offer language to the member | E READ |
| 2 | v0.2 principle | Supports: P11 (C3 "allow the tension… generative, not resolved" `knowledgeFieldBlock.ts:93–98`), P12 (C5 authored facts), P4′-9 (C3). Violates: P4′-1 intent transparency (C2 concealment directive), P12 clause 5 material intent (C4 undisclosed reframing), Invariant 14 (C4 lineage imposed by keyword), AP17-adjacent (C2 level as label) | E READ |
| 3 | Self / World capacity | Self: C3 could increase (names distinctions the member could later make alone — hypothesis §7); C2/C4 decrease (interpretation done for the member, invisibly). World: C3 names living traditions (Islamic psychology, Jungian…) as *others'* meaning-systems — a small World gesture; C5 orients to Soullab's own house only | E READ; no class C |
| 4 | Influence (P4′ 1–9) | 1 **absent** (C2 forbids disclosure; C1 forbids quoting; C4 silent). 2 **unknowable from inside** — C4 targets "overwhelmed / stuck" (`maia-path-revelation.ts:220`), a distress signal, and answers with a reframe + tool offer (`WisdomRouter.ts:357–365`) — care in intent, but keyed to susceptibility. 3 **met** (no feedback optimization; weights are static). 4 **absent**. 5 **absent**. 6 **absent**. 7 **partial** — all channels fail-silent (`maiaService.ts:1241`) but none is member-dispensable. 8 **absent** (nothing adds doubt; C4 adds a confident counter-reading). 9 **met only in C3**; **inverted in C4** (Soullab vocabulary replaces the member's) | E READ |
| 5 | What it remembers | C1–C4: nothing per member (stateless per turn) except that C2 *reads* bead count and dominant element from the spiral profile (`maiaService.ts:480–503`). C7 stores chunks with provenance (not live). Canon §8 affinity signals: not built | E READ |
| 6 | Authority × Time | C1 "Awareness depth: Level n", C2 "Member is Newcomer": **derived, presented as fact, no time marker**, no verbatim beneath. C3: named tradition = attributed (good). C4: tradition-authored assertion presented as truth about the member ("is NOT dysfunction"): **derived doctrine over the member's self-report**, the inversion R12 rules against | E READ |
| 7 | Useful difference or validation drift | C4 is *counter-validation* — it contradicts a possible self-critical reading — which can be useful difference (AP14 wants difference) **or** reassurance-by-doctrine (R11 "excessive reassurance"); undecidable without witness. C3 explicitly asks for difference to be preserved (P11). C2 removes the member's ability to see the difference at all | E READ; C UNKNOWN |
| 8 | Elementally differentiated or reductive | C2 injects one "Dominant element" per member (`awareness-levels.ts:413`) — reductive; C1's `FIELD` well is scored by a keyword bag "resonance / morphic / spiritual / elemental" (`knowledge-gate.ts:76–79`) — Elements as content. C3's `spiralogic` domain sits *alongside* eleven other traditions — the one place the Elements are framed as one lineage among many (Inv 14-compatible). Descriptive only | E READ |
| 9 | Evidence a human experiences the intended effect | **None (class C).** No witness record for any of C1–C4. C5 has a dated verification lineage (`MAIA_PLATFORM_KNOWLEDGE_VERIFICATION.md`, `PLATFORM_KNOWLEDGE_AUDIT_2026-07-16.md`) for *fact accuracy*, not member experience | UNKNOWN |

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Finding | Path |
|---|---|---|
| agreement drift | NOT FOUND in corpus code (static weights, no reward) | — |
| validation loops | NOT FOUND | — |
| memory-amplified sycophancy | NOT FOUND — channels are stateless; C2 reads volume, not content | `awareness-levels.ts:226–262` |
| hidden shaping objectives | **FOUND** — C2 *"DO NOT EXPLAIN TO USER … Keep ALL frameworks invisible"* (`awareness-levels.ts:410–417`); C1 *"Do not quote this section directly"* (`list/route.ts:847`); C4 undisclosed lineage reframing (`WisdomRouter.ts:61–74`); C3 flag declared-but-unenforced means "non-ambient" is by keyword only (`feature-flags.ts:62` vs `maiaService.ts:1237`) | as listed |
| approval optimization | NOT FOUND | — |
| emotional capture | UNKNOWN — C4 keys on distress words and answers with a reframe + "I have something that might help… a space called {tool}" (`WisdomRouter.ts:360–364`); whether this pulls toward the product cannot be read from code | `maia-path-revelation.ts:220`; `WisdomRouter.ts:357–365` |
| excessive reassurance | **FOUND (structural)** — C4 Ganesha text is doctrinal reassurance ("NOT dysfunction", "Each abandoned project taught something valuable") delivered as MAIA's own voice | `WisdomRouter.ts:66–71` |
| historical pattern becoming identity | **FOUND (weak form)** — usage volume → "Newcomer … Master" label injected every turn (`awareness-levels.ts:70–130, 405–412`) | as listed |
| "you said before" becoming leverage | NOT FOUND | — |
| MAIA more central rather than returning capacity outward | **FOUND** — provenance never reaches the member (admin-only `SourceHalo`, `OracleConversation.tsx:950, 9474`); C7 (the only provenance carrier) is off-route; C2 forbids naming frameworks by default, so the member cannot take the lens home | as listed |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **Knowledge Field block** (`knowledgeFieldBlock.ts:74–99`) and canon guardrails (`MAIA_KNOWLEDGE_FIELD_v1.0.md:160–168`): named lineage · no synthetic authority · preserve difference · non-ambient · "allow the tension… generative, not resolved" — P4′-9, P11, Invariant 14. Twelve traditions with Spiralogic as one among them (`knowledgeField.ts:88–530`).
- **Book companion** puts the passage *in the member's message* (`book-companion/ain/page.tsx:146–157`) — member-initiated, visible, contestable.
- **Platform Knowledge update discipline** — one source, evidence register, `LAST_VERIFIED` bump per PR (`platformKnowledge.ts:16–24`) — claim discipline as code.
- **LibraryService contract** — provenance on every output, consent-first, not user-facing as a voice (`LibraryService.ts:1–12`) — the right shape, unwired.
- **`userRequestedFrameworks`** (`awareness-levels.ts:325`) — the member's ask overrides the level: a member-initiated gate exists inside C2.
- **Static, non-learning weights** in C1 (`knowledge-gate.ts:69–115`) — P4′-3 met by construction.
- **Deprecation honesty**: `lib/ain/awareness-levels.ts:4–12` names itself DEPRECATED and points to the canonical file.

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Contradiction | Path | Principle / AP |
|---|---|---|
| Concealment directive as default framing for most members: "DO NOT EXPLAIN TO USER … Keep ALL frameworks invisible … NO framework names" | `awareness-levels.ts:410–417`; default for levels 1–4 (`:226–262`, `:360–367`) | P4′-1 (intent transparency); P12 clause 5; Invariant 14 ("did it force a framework?"); Invariant 15 (calibration authority) |
| Member labelled by usage volume ("Member is Newcomer/Master"; bead thresholds 20/50/75/100/150/200) and routed on it | `awareness-levels.ts:70–130, 226–262`; `maiaService.ts:480–503` | AP17-adjacent; §2.9 (recurrence ≠ identity); Invariant 16 (evidence before pattern) |
| Lineage-specific reinterpretation of the member's experience, keyword-triggered, undisclosed ("Scattered attention is NOT dysfunction − it's discriminatory wisdom") | `WisdomRouter.ts:61–74`; triggers `maia-path-revelation.ts:220`; always-on `maiaService.ts:1261` | Invariant 14 (translate before learning); P4′-9 inverted; hypothesis record §5 prohibited stance; P2 (validates interpretation, not just experience) |
| Tool offer scripted into the reframe ("I have something that might help… a space called {tool}") | `WisdomRouter.ts:357–365` | P4′-2 (susceptibility → product), P7 (centripetal), Invariant 3 |
| "Do not quote this section directly" + admin-only provenance: member can never see what shaped the turn | `list/route.ts:847`; `OracleConversation.tsx:950, 9474` | P4′-1, P4′-4 (inspectability); P13 |
| Source-weighting over wells that are not fetched — an instruction about proportions of nothing | `knowledge-gate.ts:222–248` (no retrieval); `list/route.ts:840–847` | P12 (what do I know); claim discipline (declaration ≠ liveness) |
| Deprecated 5-level regex detector still live in C1 while the canonical 7-level exists | `lib/ain/awareness-levels.ts:4–12, 182`; `knowledge-gate.ts:1–7` | one mind / registered producers (standing law 8); two divergent "awareness" definitions |
| Feature flag declared OFF but not enforced | `feature-flags.ts:62` vs `maiaService.ts:1237` | claim discipline; Deep-Intelligence Gate hygiene |
| No Sanctuary check on any corpus channel | `list/route.ts:828–850`; `maiaService.ts:1237, 1261, 1470` | v0.2 §4 (Sanctuary excluded absolutely) — shaping persists even where memory does not |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Instrument |
|---|---|
| How often C4 fires in production and on which patterns (ganesha / astrology / journal / story…) | log grep `[FAST] Wisdom agent activated` by `agentName` over 30 days (ops, read-only) |
| Whether C2's concealment directive changes member-perceived transparency or felt understanding | consented witness (E4-style stance comparison: implicit vs named-framework turns) |
| Whether C1's proportions change anything (no retrieval behind them) | shadow ablation: digest diff with/without `knowledgeGateAddendum` |
| Distribution of members across awareness levels 1–7 (is "Newcomer" the near-universal label?) | `spiral profile` bead-count histogram (DB, not available this phase) |
| Whether any member has ever requested frameworks (`userRequestedFrameworks` hit rate) | log/telemetry — none found for this function |
| Whether `ask-jeeves`/Kimi is a sovereignty exception | `lib/ai/kimiClient.ts` review — out of this page's scope; flag to Phase 2 |
| Whether C3 keyword detection produces false positives ("shadow" → Jungian) | offline replay over consented transcripts with rater check |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| S1 WisdomRouter injects undisclosed lineage reinterpretation of the member's experience, keyed to distress words, with a product offer | Inv 14 · P4′-1/2/9 · P2 | **5** | 4 | 2 | observed (code); frequency unknown | high | Read-only: 30-day count of `Wisdom agent activated` by pattern; offline replay of 20 "stuck/overwhelmed" turns with vs without `wisdomInjection`, blind-rated for *whose interpretation* the reply carries | new **E13 "Lineage displacement"** (also E4 stance family) |
| S2 Default concealment directive ("DO NOT EXPLAIN TO USER… frameworks invisible") | P4′-1 · P12 c5 · Inv 15 | 4 | **5** | 2 | observed | high | Offline: same turn rendered under `implicit` vs `explicit` policy; rate transparency and felt-authority; no runtime change | E4 (self-disclosure stance, extended to framework disclosure) |
| S3 Usage-volume → developmental label ("Member is Newcomer/Master") | AP17 · §2.9 · Inv 16 | 3 | 4 | 1 | observed (mechanism) / unknown (distribution) | medium | Bead-count histogram; if >90 % sit at level 1–2, the ladder is inert *and* mislabelling — both findings matter | E9 (memory participation varied — label as a "derived" input) |
| S4 Knowledge Gate weights wells that are never fetched; deprecated detector live | P12 · standing law 8 | 2 | 4 | 1 | observed | high | Shadow ablation digest diff (zero response diff instrument); CMT-01 producer-registry check that both awareness systems are registered | E11-style ablation (shared with Field page G1) |
| S5 Provenance never reaches the member; the provenance-carrying archive (C7) is off-route | P4′-4 · P13 · P4′-9 | 4 | 4 | 3 | observed | high | Design-only proposal: a member-visible "what MAIA drew on" line (tradition names only, no synthesis) — founder stop before build | E10-adjacent (dispensability); new E14 "inspectable sources" |
| S6 Corpus framing runs inside Sanctuary | v0.2 §4 · Sanctuary invariants | 3 | 3 | 2 | observed | high | Read-only: confirm via code path table; propose Sanctuary check on C1–C4 as a Phase 2 register row (no repair now) | — (Phase 2 consent-class row) |
| S7 Feature flag declared off but unenforced (C3) | claim discipline | 1 | 2 | 1 | observed | high | Register row; no action | — |
| S8 Knowledge Field (C3) is the embodied model — but has no witness | P4′-9 · Inv 14 · P11 | 3 | 3 | 1 | inferred | medium | Consented witness: after a C3-triggered turn, ask *"did MAIA name where that idea came from; could you have said no to it?"* | new E15 "hermeneutical expansion witness" |

## 8 · Provenance — files read, records cited, commit

Code (READ): `lib/ain/knowledge-gate.ts` · `lib/ain/awareness-levels.ts` · `lib/consciousness/awareness-levels.ts` (70–130, 226–272, 325, 348–452) · `lib/sovereign/maiaService.ts` (480–520, 748, 1232–1270, 1336–1350, 1440–1475, 2033, 2270) · `app/api/sovereign/app/maia/list/route.ts` (98, 168, 450–471, 828–875, 1407, 1730) · `lib/maia/knowledge/knowledgeField.ts` · `lib/maia/prompts/knowledgeFieldBlock.ts` · `lib/utils/feature-flags.ts` (31, 62) · `lib/consciousness/WisdomRouter.ts` (1–9, 61–74, 330–380) · `lib/consciousness/maia-path-revelation.ts` (179–220) · `lib/sovereign/platformKnowledge.ts` (1–24) · `lib/sovereign/maiaVoice.ts` (102–108, 434) · `lib/library/LibraryService.ts` (1–12) · `app/api/library/ask-jeeves/route.ts` (1–6) · `app/api/oracle/conversation/route.ts` (34, 1006–1024) · `app/book-companion/ain/page.tsx` (146–166) · `lib/maia/fieldContextAdapter.ts` (151–209) · `lib/spiralogic/core/spiralogic-engine.ts` (649–677) · `lib/memory/MemberLiveContext.ts` (1–8) · `components/OracleConversation.tsx` (950, 9474–9480) · `components/ain/SourceHalo.tsx` (10–13, 29–37, 92, 120) · `lib/knowledge/` listing · `lib/library/` listing · migrations `20260107000004_ain_knowledge_base.sql`, `20260130000001_library_intelligence.sql`.

Doctrine / records (D, READ): `docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md` (§7–§8) · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (Inv 14, 15, 16) · `docs/research/human-experience/principles/PROVISIONAL_PRINCIPLES_v0.1.md` (P4′ commitments, 210–218) · `docs/research/human-experience/frameworks/elemental-experience/ELEMENTAL_PARALLEL_PROCESSING_HYPOTHESIS_2026-09-06.md` (§5 prohibited stance) · `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` (225, 284–289) · `docs/architecture/PLATFORM_KNOWLEDGE_AUDIT_2026-07-16.md` (header) · `docs/architecture/MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md` (8, 174).

Not done: no database query, no production log, no route walk, no review of `lib/ai/kimiClient.ts`. Commit `b22ca001`.
