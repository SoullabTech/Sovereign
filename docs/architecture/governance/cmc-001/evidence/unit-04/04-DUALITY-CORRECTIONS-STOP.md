# CMC-001 · Unit 4 · Artifact 4 — Duality verdict, corrections, capabilities, stop state

Referent `52a3b924b7cf52013c1c8b0d635359c2cad672fc`.

---

# 1. The duality — verdict

Two DEEP context bodies were posed: **A** = the `maiaService` DEEP context
(`includePatterns: true`, `maxThemes: 10`, C1–C4 addenda, `relationshipMemory`,
`conversationHistory`); **B** = the `consciousness-orchestrator` context
(`memoryBridge.recall` `:409`, `obsidianVault.query` `:421`).

## Verdict: **DIFFERENTLY PURPOSED BY ORIGIN, AND CURRENTLY NEITHER — DISJOINT AND BOTH INERT.**

Not *redundant*: they retrieve from disjoint substrates with disjoint identity models.
Not *complementary*: no code path merges, compares, or hands one to the other.
Not *contradictory*: contradiction requires both to make claims; neither reaches the model.

### Why they cannot be redundant — the identity models differ in kind

| | **A — `maiaService` DEEP** | **B — orchestrator** |
|---|---|---|
| Store | member DB / relationship memory / atoms | four in-process JS collections + `./memory/memory.json` on the container FS |
| Member binding | `loadRelationshipMemory(userId, …)` — userId-scoped | **`MemoryQuery` has no member field** (`membridge:22-28`) |
| Lifetime | durable, per member | per process; reset on restart/redeploy |
| Populated by | the member's actual history | nothing in the request path; all layers init empty |
| Provenance | themes, breakthroughs, patterns with source | `Memory` type has no member/source field |

A is a **member continuity substrate**. B is a **process-local scratch cache that was
designed for a single-tenant prototype**. They are not two renderings of one thing.

### Why they are disjoint rather than layered — the boundary is the proof

`corch:1018` rebuilds the context from `{sessionId, userId, sessionHistory}`. Everything A
produced lives on `meta` and `consciousnessContext`, neither of which crosses. There is no
translation layer, no fallback from B to A, no enrichment of B by A. The two bodies **never
occupy the same scope**. **OBSERVED.**

### Why both are inert

- **A is inert** because its carriers are unreachable on DEEP-primary: S1 default-off
  (`maiaService:2083`), S2 unreachable (Artifact 3 — the constant draft is `isGold`),
  S3 drops `meta`. Unit 3 established `RETRIEVED_BUT_UNCONSUMED`; Unit 4 closes the last
  open door (S2) and confirms it.
- **B is inert** because its substrate is empty, its query is member-anonymous, its
  `depth` argument truncates any result to zero, its two upstream inputs
  (`witnessing.essence`, `witnessing.patterns`) are `undefined`, and the one model call it
  does feed (stage 7) has its output discarded by a stubbed stage 10.

### The consequence for the governing question (§VIII)

> *What kind of influence is this contributor intended to have, and does the underlying
> system retain enough provenance to justify that influence?*

- **A**: rich provenance, **zero influence**. Provenance exceeds influence — a waste, not
  a hazard.
- **B**: **zero provenance**, and its intended influence (per `generateSystemPrompt`'s dead
  prose — *"Deep memory patterns and recall"*) is latent orientation asserted through a
  model. Influence intent exceeds provenance. **Were B ever populated and wired, it would
  be the exact §XIII defect at maximum severity**: member-unattributable content
  JSON-truncated to 200 bytes and asserted as MAIA's recall. Recorded, not repaired (§XIX).
- **M4 `applySelfletDeliveryGuard`**: the inverse of both — real member provenance,
  maximal assertion (verbatim prepend), **no model mediation and no hedging surface**.
  On DEEP it is the only member-derived content that reaches the member.

### The single sentence

> **On the canonical DEEP-primary path at this referent, no member memory from either body
> reaches the model or the member. The member receives a hard-coded three-word constant,
> optionally prefixed by a selflet acknowledgment.**

---

# 2. Answer to the primary question

> *When canonical `/list` selects DEEP, what memory/context does
> `consciousness-orchestrator.processRequest` actually retrieve, transform, select, compose
> and deliver to the model?*

| Verb | Answer |
|---|---|
| **retrieve** | `sessionId`, `userId`, `sessionHistory: []`. From its own substrate: M1 (empty, member-anonymous), M2 (vault, `context: undefined`), M3 (`witness`, the only member-scoped call). |
| **transform** | `JSON.stringify(...).substring(0, 200)` on four streams (`corch:566-575`). Everything else becomes scalars: counts, coherences, depths. |
| **select** | `allMemories.slice(0, query.depth \|\| 10)` where `depth ∈ (0,1)` → zero rows. Vault results filtered on an undefined term. |
| **compose** | One string: `Synthesize these consciousness streams: Witnessing: … \| Memories: … \| Elemental: … \| Psychological: …`. Knowledge and spiral-quest excluded. |
| **deliver to the model** | That string → `aiBridge.generateEnhancedSynthesis` (`corch:475`), stage 7. **This is the only model dispatch the orchestrator makes.** |
| **deliver to the member** | **Nothing from any of it.** Stage 10 discards stage 7's text and returns the constant `'Woven consciousness response'`. |

---

# 3. Corrections to Units 1–3 (§XXXV.D)

| # | Prior claim | Correction | Authority |
|---|---|---|---|
| **U4-C1** | Unit 3 §B-3: S2 (validation repair) is a live conditional carrier of C1–C4, "conditional on failure". | S2 is **unreachable** on DEEP-primary. The draft it judges is a constant that produces zero ruptures → `ALLOW`/`isGold`. C1–C4 have no reachable carriage on DEEP at all. | `socraticValidator.ts:60-124` blob `dfea134d…` read against the OBSERVED constant `corch:938` |
| **U4-C2** | Unit 3 §B-2: "The three phase entry points … build their prompts via `buildObserverPrompt` and siblings" — implying all three reach the orchestrator. | **Phase 2 never calls the orchestrator.** Only `cwrapper:126` (Phase 1) and `:224` (Phase 3) do. Phase 2 dispatches `aiBridge.generateLayerWisdom` directly and is the only DEEP phase yielding a genuinely generated response. | `cwrapper:158-197` blob `42dd2c21…` |
| **U4-C3** | Unit 3 STOP: "whether `sacredCore`/`memoryBridge`/`obsidianVault` are substantive or stubbed … is the next unit's question." | Resolved. `memoryBridge` = real class, empty substrate, no member identity in its type. `obsidianVault` = real class, operator-side FS corpus, silent no-op when unconfigured. `sacredCore` = **substantive and member-scoped** — and its output is discarded. | Artifact 2 |
| **U4-C4** | Unit 3 §B-4: "Terminal DEEP model request composition — UNRESOLVED." | Resolved. The terminal *member-facing* composition is not a model request: it is `weaveResponse`'s string literal. The only orchestrator model request is stage 7, whose output is never read. | `corch:790-947` |
| **U4-C5** | Implicit in Units 1–3: DEEP is the deepest continuity path. | At this referent DEEP carries **strictly less** member continuity into the model than FAST or CORE, which do call `formatRelationshipMemoryForPrompt` (`maiaService:1091`, `maiaVoice:892`). The depth ordering is inverted. | Artifact 2 + Unit 3 §B-1 |
| **U4-C6** | `cmc-recon-evidence/doc-B-memory-substrate.md` (dated 2026-05-23) lists the active memory substrate and names `oracle/conversation` the "SOLE SUBSTANTIVE CONSUMER". | `lib/bridges/memory-systems-bridge.ts` and `lib/bridges/obsidian-vault-bridge.ts` appear in **no** section of doc-B — not active, not preserved-but-bypassed, not underutilized. A second substrate reachable from a canonical-live route is absent from the substrate map. doc-B is prior evidence, not canon; canonical source wins. | `git grep -l 'memory-systems-bridge' 52a3b92…` → `lib/orchestration/consciousness-orchestrator.ts`, `lib/ritual/sacred-journey.ts` |

**No `SURFACE_SUBSTITUTION` was committed by this unit.** One was *avoided*:
`generateSystemPrompt`'s prose (`corch:973-990`) describes exactly the memory architecture
the mandate asks about and would have been a plausible answer. It is uncalled dead code.
§III: dispatch outranks nearby abstractions.

---

# 4. Provenance discontinuities (§XXXV.C / §XIV)

The mandate (§XIV) asks for **the latest point at which each producer's structure and
provenance still exist**. Recorded; **not modified**.

| # | Discontinuity | Site | Last structured point |
|---|---|---|---|
| **D1** | Member identity is absent from the substrate **type**, not merely dropped in transit. | `membridge:22-28` `MemoryQuery`; `:38-48` `Memory` | Never existed. Cannot be recovered by moving a boundary. |
| **D2** | The whole A-body dies at a three-key context rebuild. | `corch:1018` | `maiaService` `meta` / `consciousnessContext` — fully structured. |
| **D3** | Four structured streams → `JSON.stringify().substring(0,200)`. | `corch:569-572` | The `streams` object at `corch:473`, fully structured. This is §XIII's serialization defect, reproduced independently in a second orchestrator. |
| **D4** | The one member-scoped generation is discarded. | `corch:806`, `:938` | `witness` return at `corch:400` — carries `message`, `tracking`, `metadata`, `wisdomSources`. |
| **D5** | Cross-module contract mismatch: consumers read `witnessing.essence` / `.patterns`; the producer returns neither. Masked by `// @ts-nocheck` (`corch:1`). | `corch:410`, `:421` vs `sacred:168-175` | Producer side is structured; the field names never existed. |
| **D6** | Unit-type mismatch: coherence fraction `[0,1]` consumed as a row count. | `corch:411` → `membridge:180` | `sacred:392-403`. |
| **D7** | Persisted memory is loaded into a map that retrieval never reads. | `membridge:398-420` vs `:155-186` | `./memory/memory.json` on disk. |
| **D8** | Explicit member recall reaches the member by string concatenation with no model mediation and no hedging surface. | `maiaService:349` | `selfletContext.requiredAcknowledgment` — structured at the call site. |

---

# 5. Capability candidates (§XVII / §XXXV.E) — record only, no design

1. **`SacredOracleCoreEnhanced.processInput` (M3)** — the strongest candidate. Already
   member-scoped (`sacred:161`), already layered (`consciousnessEnhancement`,
   `elementalWisdom`, `anamnesisRecall`, `knowledgeDepth`, `sacred:398-401`), already emits
   `wisdomSources` — a **provenance-carrying field**, which is precisely what §XIII says was
   lost elsewhere. Currently discarded.
2. **`wisdomSources` as a provenance channel** — a producer-side named list of contributing
   sources travelling alongside content. The shape §XIV's "merge while structured" implies.
3. **The layered-depth score** (`sacred:392-403`) — depth as an accumulation of *which
   layers contributed*, not a free scalar. An assertion-warrant primitive: depth derived
   from contribution count is auditable in a way a model-emitted confidence is not.
4. **`applySelfletDeliveryGuard` idempotency** (`maiaService:339-345`) — marker-checked,
   ack-checked, prepend-last. A well-formed guarantee-of-inclusion mechanism. Its
   *assertion* policy is the open question, not its mechanics.
5. **The Socratic validator's rupture taxonomy** (`socraticValidator.ts:16-124`) — five
   layers, severity-graded, repair-prompt-generating. Structurally sound. Its blind spot is
   that it detects pathology and cannot detect **vacuity**; a null response is `isGold`.
6. **The stage/stream decomposition itself** (`corch:149-230`) — witness → recall →
   knowledge → analyze → elemental → enhance → synthesize is a coherent contribution
   ordering. The stages are stubs; the ordering is a design asset.

---

# 6. Runtime-only unknowns (§XXXV.F)

Each requires runtime witness (Phase 2) or induced failure (a separately authorized test
unit per §XV). **None was performed.**

| # | Question | Why static analysis cannot close it |
|---|---|---|
| **R1** | Which of the two constants a real member receives — `'Woven consciousness response'` or the 4500 ms-timeout fallback. | Wall-clock outcome of `Promise.race` (`maiaService:2051-2055`) against ten bridge initializers + a model call. **`RUNTIME_BRANCH_UNRESOLVED`.** |
| **R2** | Whether `activate()` (`corch:119-146`) completes or throws in production. | Depends on `OBSIDIAN_VAULT_PATH`, `MEMORY_PATH`, AI-bridge credentials. Determining it by removal is induced failure — **deferred per §XV**. |
| **R3** | Whether `./memory/memory.json` exists and is non-empty in production. | Container FS state. (Moot for retrieval — D7 — but material to the auto-save write.) |
| **R4** | Frequency of Phase 1 / 2 / 3 selection for real traffic. | `detectMetaTriggers` / `detectTemporalPatterns` over real member input. Decides how often the constant vs. a real Phase-2 response is served. |
| **R5** | Whether `[SELFLET] Prepending past-self acknowledgment` (`maiaService:348`) appears in production logs on DEEP turns. | Existing-log question; permitted under §XV **if** logs are already retained. Not attempted — no log access under STATIC ONLY. |
| **R6** | Whether the deployed SHA equals `52a3b92…`. | **`DEPLOYED_REFERENT_UNBOUND`.** Every finding here is bound to the inspected SHA only. |

## A recorded write, not performed by this unit (§XXIII.12 — assessed, not triggered)

`memory-systems-bridge.ts:446-450` installs `setInterval(() => this.saveMemory(), 300000)`
inside `connectAll()`, and `saveMemory` (`:426-441`) does `fs.mkdirSync(persistencePath,
{recursive:true})` + `fs.writeFileSync(memory.json, …)`. If the orchestrator activates in
production, the process writes to the container filesystem every five minutes for its
lifetime.

**This is not a §XXIII.12 stop.** §XXIII.12 concerns unauthorized writes by the
investigation. This is *product code doing what it was written to do*, discovered
statically, unexecuted. Recorded under §XIX (record, do not repair) and flagged for R2/R3.
**No cleanup attempted; none would be lawful here.**

---

# 7. Stop state (§XXXV.G)

## `UNIT_COMPLETE`

The Unit 3 boundary that produced `STOPPED_UNENUMERATED_ASSEMBLY_SITE` has been surveyed
within the authorized envelope and the primary question is answered.

**No new stop was triggered:**

- **§XXIII.4** (unenumerated assembly site) — the site *is* this unit's subject; the four
  modules Unit 3 deferred (`MemorySystemsBridge`, `ObsidianVaultBridge`,
  `SacredOracleCoreEnhanced`, `AIIntelligenceBridge`) were reached and characterized. No
  *further* unenumerated assembly site appeared: stage 10 terminates in a literal, so the
  chain ends rather than branching.
- **§XXIII.5** (code contradicts comment) — `generateSystemPrompt` and the file header
  describe a memory architecture the code does not implement. **No stop**: no claim in this
  unit rests on that comment. It is recorded as a §IV avoided substitution.
- **§XXIII.6** (contributor resolves to multiple producers) — M1 resolves to four layers
  (`AnamnesisLayer`, session, `PatternRecognizer`, `CollectiveMemoryPool`). **No stop**:
  all four are enumerated in one file at one blob, all four are empty, and none is an
  independent *producer* — they are sub-collections of one bridge.
- **§XXIII.8** (runtime contradicts static) — no runtime evidence was gathered, so no
  contradiction is possible. R1/R2 are recorded as open, not as contradictions.
- **§XXIII.9** (architectural choice required) — approached but **not crossed**. Every
  finding is behavioral characterization. No repair, no consolidation, no design. What
  *should* happen to two disjoint memory bodies is not this unit's question and is not
  answered anywhere in these artifacts.

**Boundaries held:** no runtime witness · no production write · no repair · no architecture
design · no MFR-001 or frontier material · no `between/chat` · no refused Oracle lane ·
**zero repository files modified**.

**Not traced, deliberately:** `AIIntelligenceBridge.generateEnhancedSynthesis` internals and
`multiEngineOrchestrator` (stage 7's output is discarded, so its composition cannot affect
the member on this path — but it *is* live for Phase 2, which is a legitimate next unit);
`PsychologicalFrameworksBridge`; `ElementalOracleBridge`; `SpiralQuestSystem`;
`FractalFieldSpiralogics`; `ReciprocalLearningEcosystem`; `nestedObserverSystem`;
`lib/learning/enhanced-maia-service.ts` and `lib/ritual/sacred-journey.ts` (the two other
orchestrator importers — **outside the `/list` → DEEP chain**, and reachability from a
canonical-live route is unestablished for both).
