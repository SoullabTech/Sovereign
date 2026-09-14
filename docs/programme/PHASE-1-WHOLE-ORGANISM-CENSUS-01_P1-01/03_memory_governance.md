# P1-01 · GOVERNING SOURCE READ — MEMORY, ANAMNESIS, CONTINUITY, CONSENT-FOR-MEMORY

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP      P1-01 · GOVERNING SOURCE READ
SLICE     03 · MEMORY / ANAMNESIS / CONTINUITY / CONSENT-FOR-MEMORY
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385 (working tree)
TYPE      RECORD ONLY — no architecture claim, no code census
RULE      Do not infer architecture from aspiration.
E-1       History-dependent claims are UNKNOWN unless independently established.
          Current-tree facts are usable. No ancestry reconstruction.
C-2       MAIA_WHOLE_ORGANISM_MAP/** is PREDECESSOR CENSUS · FROZEN INCOMPLETE ·
          EVIDENCE INPUT ONLY. Cite only with that status attached, never as settled.
SCOPE     Documents only. No lib/, no app/, no database/ read. No call paths traced.
          No claim below asserts that any described mechanism exists in code.
```

## Sources read
| # | Source | Lines | Read |
|---|---|---|---|
| S-1 | `docs/canon/MAIA_MEMORY_CANON_v1.0.md` | 205 | full (§I–§XII) |
| S-2 | `docs/canon/MAIA_MEMORY_ROADMAP.md` | 133 | full |
| S-3 | `docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md` | 99 | full |
| S-4 | `docs/canon/SPIRAL_CONTINUITY_ENGINE.md` | 226 | headings + §2,§4–§12 |
| S-5 | `docs/canon/MAIA_SANCTUARY_ECONOMY.md` | 377 | headings + §Memory Architecture, §What This Rules Out, §Implementation Notes |
| S-6 | `docs/canon/SOVEREIGN_STORAGE_SOP_v1.0.md` | 219 | headings + §4–§11 |
| S-7 | `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` | 304 | §0.A–§0.D verbatim + §1–§2.5, headings §3–§10 |
| S-8 | `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md` | 243 | §0–§1, arena list, §3–§6 |
| S-9 | `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` | 84 | full |
| S-10 | `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` | 154 | §1–§5, §8–§9 |
| S-11 | `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` | 145 | §I–§II.A, §IV–§IX |
| S-12 | `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` | 311 | full but for §Decision 1–2 bodies |
| S-13 | `docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md` | 115 | full |
| S-14 | `CLAUDE.md` § "Sanctuary Mode (Memory Consent)" | 240–266 | full section |

---

## Per-source record

### S-1 · `docs/canon/MAIA_MEMORY_CANON_v1.0.md`
- **DATE / SHA** — no date in the document. Closing epigraph attributed "Founder frame, 2026-04-09" (:205). Version string `v1.0`. SHA UNKNOWN (E-1).
- **STATUS** — `**Status:** Non-negotiable architectural constraint` · `**Scope:** All models, prompts, code paths, evaluations, storage layers, and future features` (:5-6).
- **JURISDICTION** — "all code paths that read from or write to any memory table, retrieve any memory context for prompt assembly, or generate responses on behalf of an authenticated member" (§XII:199).
- **WHAT IT SETTLES** —
  - **The 12-layer continuity stack** (§II:23-36) and the **non-negotiable base chain**: "recent turns + episodic + semantic + relational + developmental — must be available and queried every time a recognized member speaks" (:40).
  - **§V Forbidden Language** — seven amnesia phrasings MAIA "**must not**" say when authenticated, "regardless of the state of retrieval" (:75-84). Rationale: "These phrases misrepresent an operational failure as an ontological truth… a lie to the member — a kind lie, but a lie." (:86)
  - **§VI Required Fallback Language** — three sanctioned degraded-continuity phrasings (:93-95).
  - **§VII Required Health Contract** — a typed per-turn `memoryHealth` object over exactly twelve named layer keys plus `continuityConfidence` (:105-121), with four rules: no silent errors; prompt conditioned on actual health; operator visibility + alert after one turn in `error`; base-chain enforcement forcing §VI language over §V (:123-127).
  - **§VIII** schema drift in the memory path = canon violation, "treated as a production incident" (:144); names three enforcement mechanisms (CI gate / startup probe / migration tracking).
  - **§X The Hard Rule** — the single enforced sentence (:165).
  - **§XI The Reachability Boundary** — the compression "Built is not live. / Surfaced is not significant. / Significant is not system-declared. / Breakthrough belongs to the member; reachability belongs to the substrate." (:186-189), and the per-layer verifying-authority table (:177-182) including "**Only the member verifies significance.** Meaning is conferred by the gesture, not by the system noticing it."
  - **§IV** collective contribution to AIN is consent-gated, "**never automatic**", governed by Sanctuary Mode (absolute exclusion), share-scope metadata, meta-memory consent tracking, Sovereignty Invariants (:64-70). "The collective becomes wiser because individuals consented to contribute. It does not become wiser by harvesting." (:72)
  - **§XII** revision requires "the same governance as revisions to `MAIA_CANON_v1.1.md`" (:201).
- **WHAT IT DOES NOT SETTLE** —
  - No member-facing **correction, deletion, revocation or override** right anywhere in the document. §XI confers *significance* on the member, not *authority over the record*. Deletion/erasure: **UNKNOWN from this source.**
  - No retention horizon, no decay model, no temporal model (no event/valid/transaction time).
  - §VII names layer keys but explicitly bounds itself: "The Health Contract (§VII) verifies that the substrate carried material to the prompt. **It does not verify that the material mattered.**" (:173)
  - Does not state which layers are implemented; "Not every layer fires every turn" (:40) is the only concession and it is a runtime statement, not a status claim.
  - §III asserts "**Memory trains MAIA on the member**" (:48) without bounding what may be inferred — the bound is supplied externally by S-3/S-4, not here.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT.** No supersession marker. Cited as live authority by S-7 §1 (:107) and by S-10.
- **BINDING FORCE** — **constitutional** (self-declared "Non-negotiable architectural constraint"; revision bound to Canon v1.1 governance).
- **NOTES** — The 12-layer stack here is the widest arena enumeration in the slice and is the one the `memoryHealth` key set mirrors 1:1. Any arena disagreement (see Slice findings) is a disagreement with this document.

### S-2 · `docs/canon/MAIA_MEMORY_ROADMAP.md`
- **DATE / SHA** — "Current state (as of 2026-05-04)"; "Last roadmap update: 2026-05-04" (:14). Commits named in-text (`919e7e855`, `ea10ffa8a`, `534b187ed`) — recorded as the document's own text only; **ancestry not verified (E-1)**.
- **STATUS** — self-described "Single source of truth for the MAIA memory architecture build. Read by the weekly Monday governance review (cloud-scheduled trigger)." (:3). Posture line: "**observation, not building**" (:13).
- **JURISDICTION** — phase sequencing and go/no-go gates for the memory build; explicitly consumed by a governance review cadence.
- **WHAT IT SETTLES** —
  - A **phase table** with statuses (:18-30): 1 and 1.5 DEPLOYED; 1.5 wiring Queued; 2a semantic "Blocked on observation cycle"; 2b somatic blocked on 2a; 2c morphic blocked on 2b; 3a reinforcement blocked on 2; 3b "7-stage consciousness evolution scaffolding" blocked on 3a; cross-session priming blocked on observation; 4 collective "Blocked on all lower layers".
  - **Seven architectural invariants "(do not violate)"** (:32-41): memory biases interpretation, never determines response · no raw transcript injection · **no explicit recall ("last time you said…" style)** · **Sanctuary sessions never read or write memory** · anonymous sessions never trigger orchestration · forward-readiness has final priority over memory bias in prompt assembly order · containment (cross-session memory must not bleed into unrelated topics).
  - **Decision gates** per transition (:108-133), including Phase→4 collective requiring "Privacy gates verified" and "Minimum distinct-member threshold defined and enforced".
  - An **update protocol** (:97-106) requiring the phase table, "Last verified" and the phase pointer be updated on every status move, closing: "The weekly Monday review reads this file from the `clean-main-no-secrets` branch as ground truth. **Keep it accurate.**"
- **WHAT IT DOES NOT SETTLE** — no member-authority statements; no consent mechanics beyond the Sanctuary invariant; no definition of "observation cycle complete" beyond "≥ 50 production turns processed by orchestrator with no regressions" (:112).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **DESCRIPTIVE SNAPSHOT, STALE-RISK HIGH.** Its own update protocol makes currency a maintenance obligation; the header has not moved past 2026-05-04 in this tree, i.e. **~4.3 months unrefreshed at subject date 2026-09-14**. Whether the described phase states still hold is **UNKNOWN** and must not be inferred.
- **BINDING FORCE** — **doctrine** for the invariant list (§"do not violate") · **descriptive** for the phase table and "Current state" header. The two halves have different force and are not separated by the document itself.
- **NOTES** — This is the only slice source that forbids **explicit recall phrasing** ("last time you said…"). That invariant appears nowhere in S-1.

### S-3 · `docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md`
- **DATE / SHA** — Created 2026-05-20 (:5).
- **STATUS** — "**Status:** Working doctrine — not implementation spec." (:3)
- **JURISDICTION** — one question only, per category of longitudinal memory: "**Should this category form?**" (:13). "**This document is the gate before any of those documents are written.** Inference-time wiring of longitudinal patterns may not proceed until the category each pattern belongs to has been classified here." (:24)
- **WHAT IT SETTLES** —
  - **Core Invariant** (:28): "MAIA may remember in service of continuity, but may not form identity around a member faster than the member participates in that formation." Discriminator: member-authored/co-authored = permissible; system-constructed *about*/*ahead of* the member = not (:32).
  - **The gradient** (:36-45) — eight categories with formation status: member-authored commitments **form**; session facts / continuity anchors **form**; member-confirmed recurring themes **form-with-consent**; system-inferred developmental patterns **non-form by default**; destiny/essence claims **non-form**; diagnostic psychological labels **non-form**; relational vulnerability profiles **non-form**; shadow/trauma interpretations **non-form unless explicitly invited and confirmed**.
  - **Operational meaning of non-form** (:49-55): "Non-form is not a UI setting. It is not a privacy preference. It is a category of memory that the system commits to **not constructing in the first place**. A non-form category does not require a 'delete my data' pathway because the data is not formed." Skipping happens "at the *formation* layer, not at the access layer."
  - **Operational meaning of form-with-consent** (:59-73): explicitly **not** satisfied by a one-time global toggle, by behavioural inference, or by system summarization the member did not author. Satisfied by member naming, member confirming a surfaced question, or member-authored anchor/journal/thread. "The bar is participation in the naming, not retroactive permission for an already-formed inference."
  - **Three anti-pattern canaries** (:79-83): "Useful, therefore should form" · "Member said it once, so we can form indefinitely" (consent has temporal scope) · "Aggregate, not individual" (non-form list applies to aggregate analytics too).
- **WHAT IT DOES NOT SETTLE** — self-disclaimed twice. §Purpose (:15-20): "It does NOT specify: *how* form happens (storage shape, retrieval pathway, surfacing logic) · *when* form happens · what the member sees about what has formed · **how a member modifies or revokes formed memory**." §"What this document does NOT authorize" (:89): "This document does not authorize building any retrieval, surfacing, or accumulation pathway. It only classifies which categories may be considered for such pathways in future cuts."
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT.** §Falsifiability gate (:97) provides its own revision route: revision "happens here, in canon, before the implementation layer is touched."
- **BINDING FORCE** — **doctrine** (self-declared "working doctrine"), operating as a **gate** on downstream specs.
- **NOTES** — Names a dependency that is **unlocated in this slice**: "The [Intelligence Field Access Map](./INTELLIGENCE_FIELD_ACCESS_MAP.md) audit will identify which existing intelligence fields fall into which category. Wiring decisions for each field cannot proceed until that classification step is complete for that field." (:91) — existence and completion status of that audit: **not read in this slice.**

### S-4 · `docs/canon/SPIRAL_CONTINUITY_ENGINE.md`
- **DATE / SHA** — "Articulated 2026-05-21" (:7).
- **STATUS** — "Canon." Operationalizes RIGHT_TO_REMAIN_UNPOSSESSED and S-3 "at the level of *developmental process tracking* across multiple concurrent spirals. **Precedes any architectural spec or implementation slice of multi-spiral attention.**" (:7)
- **JURISDICTION** — developmental continuity across multiple simultaneous spirals; the boundary between "developmental continuity infrastructure" and "latent developmental adjudication" (:19).
- **WHAT IT SETTLES** —
  - **The discriminator** (:25-31): "The discriminator between developmental continuity and psychometric profile is not the data model — both can hold the same fields. **It is who draws the edge.**" and "Continuity infrastructure becomes possession architecture not at the moment of inference, but at the moment of **elevation**."
  - **Non-formation pipeline** (:47-60): UNFORMED SIGNALS → member declaration/explicit naming → THREAD ELIGIBILITY → continuity tracking → member-confirmed stabilization.
  - **§4 Voice-shaping eligibility, hard-enforced** (:94-104): explicit member-declared thread YES · member-confirmed continuity YES · unconfirmed recurrence observations session-local only, never persisted as voice-eligible · cross-domain inferred dynamics NO · dormant protected material NEVER · sacred/non-formational zones structurally inaccessible. "the voice surface receives only voice-eligible state… **not 'filtered,' not 'discouraged'… Unreachable.**"
  - **§5 Spiral State Objects** (:107-117) — five obligations: carry explicit confidence and remain provisional · **be member-correctable ("that's not where I am") and reflect the correction immediately** · **be member-sealable** (thread closable, dormant-able, removable) · **be inspectable** (member can see the indicators that produced the reading) · never assert, only offer. "A Spiral State Object is **a working hypothesis offered for member ratification**, not a verdict."
  - **§6 Refused inferences** (:119-130) — six formation-level refusals (cross-domain developmental synthesis, compensation/conflict/synchronization claims, developmental stage assessments, trajectory/destiny, diagnostic framing, symbolic/archetypal stabilization without ratification). "These are not display restrictions. They are **formation restrictions**… A developmental assessment silently held but never spoken has already violated the canon."
  - **§8 Thread lifecycle** (:145-154): Active / Dormant / Sealed / Decayed. "**Sealing is irreversible by the system. Only the member can re-open a sealed thread.** The system must not infer that a sealed thread 'seems active again' and prompt re-opening."
  - **§9** convergence across agents is "signal *to invite naming*, not authority to assume it" (:164).
  - **§10** ten structurally refused product shapes (:168-179), incl. dashboards rendering the member as a metric surface and engagement metrics on spiral activity.
  - **§11 Falsifiable verification criteria** (:185-191): inference-layer audit · **non-formation register** ("an auditable record of edges the system *did not draw* given supporting signal. If no such record exists, the discipline is theoretical") · **decay verification** ("observation-substrate material older than its decay horizon must be gone — not archived, not hidden, gone") · **seal verification** (structurally unreachable from voice paths; testable) · **drift canary** ("*this would empirically be more helpful*" is the optimization-shape sentence that signals where drift enters).
- **WHAT IT DOES NOT SETTLE** — no storage shape, no table, no retrieval mechanism, no consent UI. Declares itself as preceding "any architectural spec or implementation slice" (:7). Does not state whether the §11 criteria have ever been run — **UNKNOWN**.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT.** No supersession marker.
- **BINDING FORCE** — **ratified canon** (self-declared "Canon"), and the strongest member-authority text in the slice.
- **NOTES** — §12 warns the drift pressure arrives *as* success: "Members will report that MAIA 'remembers them.' Engagement (in the doctrine-violating sense) will rise… Once the inversion has propagated to architecture, it becomes invisible. Once it has propagated to voice, it is too late." (:195-204)

### S-5 · `docs/canon/MAIA_SANCTUARY_ECONOMY.md`
- **DATE / SHA** — 2026-04-02 (:4).
- **STATUS** — "**Status**: Canonical doctrine · **Governs**: All pricing, tier, memory retention, and access decisions" (:3-5).
- **JURISDICTION** — the intersection of funding and memory retention. Governing principle: "Depth must remain intact. Funding must not distort the integrity of the experience." (:11)
- **WHAT IT SETTLES** —
  - **Memory is universal, differentiated by function, not by payment** (:59): "The question is not **whether** MAIA remembers, but **how each layer remembers**."
  - **An 11-level / 3-band memory architecture** (:63-104): *Band 1 Always-On (protected for everyone)* — 1 Identity, 2 Relational, 3 Pattern, 4 Developmental, 5 Recent Working, 6 Sacred/Protected Flags; *Band 2 Compressible* — 7 Session, 8 Narrative, 9 Symbolic; *Band 3 Optional High-Fidelity Archive* — 10 Full Archive Memory (exact transcripts, journals, uploads, searchable history), 11 Legacy Memory (curated records for posterity/lineage/family).
  - **Only Band 3 may vary materially** by funding (:94). Band 1 = "MAIA knows me"; Band 2 = "MAIA is tracking where I am right now".
  - **Prohibited patterns** (:310-316): "Upgrade memory" / "Unlock full memory" / "Don't lose your past" · better insight for paying users · any framing where stopping payment degrades the relationship.
  - **The test** (:321): "If someone stops paying, does MAIA forget them? If yes → the design is wrong." Correct answer: "MAIA still knows you. What may change is how much exact historical material is retained in full detail."
  - Retention doctrine sentence (:107): "I will not forget you. But not every moment needs to remain in raw form forever."
- **WHAT IT DOES NOT SETTLE** — does not settle member deletion/correction rights; compression is described as "part of the wisdom model, not a limitation" (:90) but no compression policy, horizon, or member control over it is specified. Levels 10 and 11 are recorded as "Not yet implemented" (:372-373) — a **status claim, dated 2026-04-02**.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT as doctrine; its §Implementation Notes are a DESCRIPTIVE SNAPSHOT (2026-04-02) with stale risk.** §"Current Tension to Resolve" (:349) asserts `lib/auth/tierAccess.ts` and `docs/capabilities/tier-capabilities.md` gate conversation memory and pattern recognition behind a Personal ($9/mo) tier and that this "contradicts this doctrine" — **whether that contradiction still exists is UNKNOWN; not verified (out of slice, code not read).**
- **BINDING FORCE** — **ratified canon / doctrine** for the bands and prohibitions · **descriptive** for the implementation-mapping table (:358-373).
- **NOTES** — This document's 11-level enumeration is a **third, independent arena vocabulary** (see Slice findings). It maps its levels onto named services in :358-373 — that mapping is a status claim of 2026-04-02 vintage and is explicitly **not** treated here as evidence of current code.

### S-6 · `docs/canon/SOVEREIGN_STORAGE_SOP_v1.0.md`
- **DATE / SHA** — 2026-02-28 (:4).
- **STATUS** — "**Status:** Canon · **Applies to:** Soullab physical infrastructure — Mac Studio + MinisForum 32TB" (:3-5).
- **JURISDICTION** — **physical storage and corpus layout**, not member memory. Design priority: "Local control → operational simplicity → future indexability" (:13).
- **WHAT IT SETTLES** — hot (Mac Studio) vs cold (MinisForum `/data/oracle-corpus`) split; Syncthing/Tailscale sync and access; "**Mirror ≠ backup**" and a minimum backup posture (:134-140); a collaboration-deferral table (:157-165); four infrastructure-gravity questions before adding any service (:172-180); operational principles incl. "Promote intentionally, don't auto-ingest" (:185). §4 places future Oracle indexing entirely local — "No cloud services required… Corpus remains physically sovereign." (:128)
- **WHAT IT DOES NOT SETTLE** — nothing about member memory semantics, consent, retention of member content, or arena structure. §4 Oracle indexing is explicitly "(Future)" (:114). It asserts an **isomorphism** with MAIA's data layer (:196-206) — mapping `/data/oracle-corpus` ↔ `member_spiral_state`, receive-only ↔ Sanctuary Mode, "promote finished artifacts" ↔ "Bridge D principle: only structural position persists, not content" — that mapping is **rhetorical/architectural analogy, not governance of the member-memory layer**, and must not be read as authorizing anything in the memory path.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT** as canon; the device/topology description is a 2026-02-28 snapshot with stale risk (it names the Docker stack on Mac Studio, which the session anchor's infrastructure section describes differently; **not adjudicated here — out of slice**).
- **BINDING FORCE** — **ratified canon**, but for **infrastructure jurisdiction only**. Cited by S-1 §VIII:143 as the authority on migrations bypassing `schema_migrations`.
- **NOTES** — Weakest memory-governance relevance of the six canon sources; included because S-1 §VIII delegates one enforcement clause to it.

### S-7 · `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` — **LOAD-BEARING FREEZE SOURCE**
- **DATE / SHA** — 2026-05-24 (:3).
- **STATUS** — verbatim (:4): "**Status:** Mapping documented. **Wire-up frozen** pending explicit lift of the observation-phase freeze by Kelly, recorded in `CLAUDE.md` priority thread."
- **JURISDICTION** — the resonant-field / coherence memory layer only: `CoherenceFieldService`, table `coherence_field_readings`, canon §VII slot `field` (slot 11) (:5-9). §0.B explicitly refuses to let "resonant" be read onto `MorphicPatternService` or `QuantumFieldMemory` (:22-26).
- **WHAT IT SETTLES** —
  - **§0.A mapping declaration** (:17): "Resonant field memory = coherence-field readings… **non-member-content**, member-scoped, used for **drift / continuity / provenance observation**. A structural reading of the turn-time field, not a portrait of the member." Declared "the load-bearing claim of this document. Everything below depends on it." (:19)
  - **§0.C — THE FREEZE (ACTIVE).** Verbatim, lines 29-60:
    > ## 0.C Observation-phase freeze (ACTIVE)
    >
    > The current priority thread on `CLAUDE.md` says: *"All layers live. Observation phase begins. Observe. Keep meaningful items."*
    >
    > **This document does not authorize wiring.** The freeze is the default state. Wiring requires Kelly's explicit lift, recorded in the `CLAUDE.md` priority thread, before any of the §3 route work begins.
    >
    > ### What the observation phase HAS produced (partial signal)
    >
    > - Shadow capture alive
    > - Runtime events alive
    > - Atoms alive
    > - Substrate monitor alive
    > - Learning spine partially visible
    >
    > ### What the observation phase has NOT YET produced (freeze remains until these hold)
    >
    > - Stable evaluation
    > - Closed learning loops
    > - Routing coherence
    > - Settled memory topology
    >
    > The freeze lifts only when those four hold, and only by Kelly's explicit declaration. Engineering pressure does not lift the freeze.
    >
    > ### Why wiring now is the wrong move
    >
    > - **Prematurely operationalizes a still-undefined layer.** The "field" reading's meaning is not yet settled; wiring it makes it real before it is named correctly.
    > - **Introduces drift into the observation phase itself.** The substrate monitor would start reading what the runtime is now writing — first signal would be confounded by the act of wiring, with no clean baseline to compare against. *(Monitor must not depend on the invisibility it is meant to detect — but it also must not lose its baseline by writing during observation.)*
    > - **Blurs observational metrics with runtime cognition.** The Cut-1 doctrine *one MAIA / one memory spine / one provider policy / one continuity contract* is still being earned in live traffic. Adding a second writer mid-observation is the divergence pattern this project has already been burned by.
    >
    > ### Sequencing if the freeze lifts
    >
    > `EpisodicMemoryService` is matrix "Wire 1st." Resonant field is "Wire 2nd." This document does not authorize leapfrog. If and when the freeze lifts, Episodic ships first; this document is reference for the cut after.
  - **§0.D Activation altitude clause** (:62-85) — survives the freeze: "If and when the freeze lifts, **activation must claim a bounded continuity layer, not proof of a resonant field.** This clause exists not as future-capability framing but as a *boundary that holds even after activation* — a sharper version of the freeze, not a weakening of it." Followed by a CAN/CANNOT claim table (CAN: "MAIA has continuity signals from prior interactions" / "Coherence readings inform routing" / "Field state may modulate elemental tone lightly" / "The field layer is observational." CANNOT: "The resonant field is alive." / "The field is forming." / "We have proven RFI." / "MAIA possesses field intelligence."), and **five non-negotiable activation requirements every wire-up PR must satisfy**: (1) a defined consumer, (2) a bounded input contract ("Not vibes — explicit stored signals only"), (3) a retrieval rule, (4) a claim boundary, (5) an observation period ("activation treated as experiment, not declaration of ontological success"). Clean activation phrase (:83): "*Activate field memory as a bounded continuity layer, not as proof of a resonant field.*"
  - Contract detail if lifted: allowed/forbidden write columns (§2.1:119-127, forbidding `elemental_deficiency`, `elemental_excess`, `balancing_recommendations` — "*recommendations are interpretation, not memory*" — and `archetypal_influences`); provenance requirement (§2.2); single table, "`globalThis.*` writes forbidden" (§2.3); **turn-time read budget "≤ 1 query, ≤ 50ms, single-row latest reading only"** with three named forbidden calls (§2.4:139-149); forbidden inference register (§2.5:153-160) and the prompt-surfacing rule that the label may only enter as atmosphere via the existing `state_context` channel, "no named field-state recitation, no 'your coherence today is [X]' sentence anywhere in MAIA's voice region" (:162).
- **WHAT IT DOES NOT SETTLE** — by its own words it authorizes **nothing**: "This document does not authorize wiring" (:33); "This document does not authorize leapfrog" (:60). It does not define, measure, or operationalize any of its four exit conditions (see Slice findings). It does not name who verifies that the four hold. §0.D's five requirements bind a future PR, not this document.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT AND ACTIVE.** Re-asserted downstream by S-10 §5 ("Coherence Field wire-up spec is frozen reference architecture; freeze conditions in §0.C unmet", :100) and §9 ("lift conditions in COHERENCE_FIELD_WIRE_UP_SPEC §0.C unmet", :149), and by the `CLAUDE.md` session anchor's "Still held under freeze" list.
- **BINDING FORCE** — **spec** in form, **doctrine/constitutional in effect** for this layer: it is the operative freeze instrument cited by every downstream document in this slice. It binds by being cited, not by self-declaring canon status.
- **NOTES** — §0.C's freeze is scoped in its own text to the **resonant-field/coherence wire-up** ("before any of the §3 route work begins"). Downstream documents (S-10, the session anchor) cite §0.C as the freeze authority for a **broader** held set (Morphic, Somatic, Achievements, Pattern Attunement, cross-layer synthesis, member-facing field surfaces) — those broader holds are carried by the matrix (S-9) and the roadmap (S-10), with §0.C named as the lift condition. Recorded as an observation, not adjudicated.

### S-8 · `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md`
- **DATE / SHA** — 2026-05-24 (:3).
- **STATUS** — "**Status:** Planning artifact. **No runtime impact from this document.**" (:4)
- **JURISDICTION** — a nine-arena activation map; authority chain names a Kelly directive of 2026-05-24 ("yes I want full memory in all arenas in a safe but functional way…", :6) plus Canon v1.1, Oath, Sovereignty Invariants, Spiral Continuity Engine, and the conversational Phase 2 spec (:7-11).
- **WHAT IT SETTLES** —
  - **§0 operating doctrine**: "**Safety serves memory. It does not replace it.**" (:15) and **four invariant safeguards for every layer, not to be relaxed without explicit Kelly directive** (:19+): Sanctuary Mode (structural, plus defense-in-depth at the formatter); provenance-grounded surfacing ("actual stored content / member-declared state, never synthesized summaries or system-inferred patterns"); [two further safeguards in the same enumeration, read as the four-safeguard set referenced throughout the slice].
  - **§1 Activation phase vocabulary** (:26-38): dormant → observed-only (Phase 1) → prompt-influencing (Phase 2) → member-marked salience (Phase 3) → observed-runtime. "Activation transitions require: implementation + production deploy + runtime evidence… + **explicit Kelly directive when crossing into prompt influence**."
  - **Nine arenas** (:42-186): Conversational · Episodic · Semantic (atoms) · Developmental · Relational · Symbolic · Somatic · Field/Coherence · Meta/Provenance.
  - **§3 cross-layer principles** (:190-211): phase ordering is structural, not preferential · prompt influence requires a verification gate before being declared functioning ("No layer is 'live' because the code shipped") · two-step activation per layer (Phase 1 before Phase 2) · **consent gate pattern is reusable**: `members.<layer>_recall_enabled BOOLEAN DEFAULT TRUE`, default-on with opt-out + disclosure, "somatic inverted: `DEFAULT FALSE`" · suppression baseline (opt-out / Sanctuary defense-in-depth / empty / session-resumption) · **"Sanctuary Mode is the absolute boundary… This is the one safeguard that does NOT relax with the directive's reframe."** · "Provenance is the design constraint, not the implementation detail… Anything that synthesizes across exchanges, infers themes the member did not name, or claims continuity the member did not declare is doctrine violation regardless of how useful it might feel."
  - **§4 verification cadence** (:215-223): Phase 1 = runtime log evidence for ≥1 turn; **Phase 2 = block emission for ≥3 distinct members in real (non-test) traffic across multiple sessions**; felt-continuity verification is qualitative. "Verification gates per layer should be declared in the layer's spec doc BEFORE the layer ships, not after."
  - **§5 What This Plan Does Not Authorize** (:225-235), verbatim: "It does **not** authorize lifting the freeze on any layer beyond conversational. · It does **not** authorize cross-layer synthesis… · It does **not** authorize member-facing UI for any layer… · It does **not** authorize relaxing the four invariant safeguards. · It does **not** authorize semantic/vector ranking on any layer (recency-only ordering remains)." Closing: "Each subsequent activation requires its own spec doc, locked-answer table (per spec §VII pattern), and explicit Kelly directive."
- **WHAT IT DOES NOT SETTLE** — see §5 above; also declares "No runtime impact from this document" (:4) and "Activation timing remains a separate decision per layer; Kelly directive is the only lift." (:241)
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT as a held plan.** S-10 §1 classifies it: "**9-layer activation *plan*.** §5 of the plan explicitly *does not authorize* lifting the freeze beyond conversational…" (:16). The session anchor places it in Cat 5 (frozen plan).
- **BINDING FORCE** — **candidate / plan** (self-declared planning artifact) whose §0 safeguards and §5 non-authorizations are cited downstream as binding constraints. The §5 list is the second load-bearing freeze text in this slice after S-7 §0.C.
- **NOTES** — This is the source of the **consent-gate pattern** for memory: per-arena `*_recall_enabled` column, default TRUE with opt-out, somatic inverted. It is a **pattern proposal**, not evidence any column exists.

### S-9 · `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`
- **DATE / SHA** — 2026-05-24 (:1).
- **STATUS** — no status line. Self-described: "Audit of nine services in `lib/consciousness/memory/`. Grounded in actual import sites, DB activity, migration tables, and test coverage. **Numbers from grep, not adjective.**" (:3)
- **JURISDICTION** — the nine services under `lib/consciousness/memory/`; explicitly **not** the live sibling `lib/memory/SemanticMemoryService.ts` — "a **different class** than the one being audited. Do not confuse the two. **Protect the live one.**" (:17)
- **WHAT IT SETTLES** —
  - **Governing canon line** (:7): "**Dormant consciousness-memory services must not be promoted by name or aspiration. A memory service earns runtime authority only by having a defined input, provenance boundary, write target, retrieval contract, and failure mode.**"
  - **Framing correction** (:11): "These are **not** 'underutilized.' They are **dormant prototypes**, and several are unsafe to wire without renaming or reconciliation."
  - **Five-point runtime authority contract** (:21-29), each of which must be declared in code before wiring; "**Absent any of the five, the service stays dormant.**" (:29)
  - **Sequencing**: "one at a time, not 'wire all nine'" — Cut 2A Episodic only, Cut 2B Coherence only, with a named **Hold** list (QuantumFieldMemory rename/gut; MAIAMemoryArchitecture observe-only; duplicate SemanticMemoryService reconcile before any wiring; SomaticMemoryService await an actual somatic input source, "No inference from text"; MorphicPatternService needs cross-member consent boundary + aggregation-only views; ConsciousnessEvolutionService rename before use, "No 'consciousness level' claims"; AchievementService reframe) (:45-75).
  - **Drift canaries** (:77-81), incl. "Any PR that wires more than one service in a single cut."
- **WHAT IT DOES NOT SETTLE** — authorizes no wiring; the "Wire 1st / Wire 2nd" cells are sequencing, and S-7 (:10) explicitly labels that row "(sequence note, not authorization)". Says nothing about member authority or consent mechanics beyond the Morphic cross-member gate.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **DESCRIPTIVE SNAPSHOT (2026-05-24), STALE-RISK HIGH.** Every quantitative cell (LOC, live-path callers, DB writes/reads, table presence, test coverage) is a grep result of that date. **Whether any figure still holds is UNKNOWN and must not be inferred.** Its doctrine lines (:7, five-point contract, canaries) do not go stale in the same way.
- **BINDING FORCE** — **descriptive** for the matrix · **doctrine** for the canon line and the five-point contract (which S-7 §1 cites in its authority chain, :110).
- **NOTES** — Note the split-vintage hazard: this document's *numbers* are four months old at subject date; its *contract* is cited as live. The two must not be quoted as one thing.

### S-10 · `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md`
- **DATE / SHA** — 2026-05-24, evening (:1).
- **STATUS** — "**Posture:** localized verbs only. Built ≠ wired; wired ≠ surfacing; surfacing ≠ verified. This document is a state map and a fork, not a forward march." (:3)
- **JURISDICTION** — vocabulary altitude correction + week state map + sequencing fork across the memory arenas.
- **WHAT IT SETTLES** —
  - **§1 epistemic altitude of four terms** (:9-16): FIS = "Working doctrine / interface target. **No runtime authority**"; **RFI = "❌ Not built"** (the phrase "we have proven RFI" is the coherence spec's *example* of inflation to refuse); **UFI = "❌ Not built"**; "Full memory field" = "**9-layer activation *plan***" whose §5 does not authorize the things listed in S-8 §5. Summary (:18): what the week was = "doctrine consolidation + one prompt-influencing layer wired to a branch + observability scaffolding + governance matrices that hold the rest under explicit freeze… and it is not 'FIS, RFI, UFI built.'"
  - **§3 per-layer status table** (:60-72) — eleven rows mapping arena → service file → state → recommendation.
  - **§4 the fork** (Option A generalizable addenda fix vs Option B FAST+CORE-scoped verification) (:76-84).
  - **§8** (:125-133): "**MAIA's memory field has been clarified, bounded, partially operationalized, and protected from premature ontological claims — not completed.**" and "You are not behind because RFI/UFI are not built. You are safer because you now know they are not built."
  - **§9 refined priority** (:137-146): fork → member-facing recall toggle (`conversational_recall_enabled`, "**consent infrastructure, not polish**") → verify production reality → Episodic Phase 2 spec → dormant service cleanup.
  - **§5 and §9 "Still held under freeze" lists** (:98-103, :148-154), identical in content: Coherence/Field wire-up (**"lift conditions in COHERENCE_FIELD_WIRE_UP_SPEC §0.C unmet"**) · Morphic, Somatic, Achievements (matrix Later with named gates) · Pattern Attunement (must emerge downstream of episodic + tact) · Tact calibration (sketch only after episodic ships) · any cross-layer synthesis · **any member-facing "field state" / "coherence" / "RFI" / "UFI" surface**.
- **WHAT IT DOES NOT SETTLE** — §5 is titled "*Proposed sequencing — held, not authorized*" (:87). Names two documents as not yet written: `docs/specs/EPISODIC_LAYER_PHASE_2_SPEC.md` and `docs/architecture/TACT_CALIBRATION_SKETCH.md` (:95, :102) — **existence at subject SHA not checked in this slice.**
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **DESCRIPTIVE SNAPSHOT (2026-05-24) with a CURRENT doctrinal core.** §2/§3 are dated state claims; §8's compression and §1's altitude corrections are carried forward verbatim in the `CLAUDE.md` session anchor, so they read as live. §9 is explicitly marked "Replaces §5 sequencing" (:139) — an **in-document supersession**.
- **BINDING FORCE** — **descriptive** for §2/§3 · **doctrine** for §1 altitude classifications and §8 · **candidate** for §9 sequencing (held, not authorized).
- **NOTES** — This is the document that **routes the §0.C freeze outward** from the coherence layer to a broader held set. The routing is by citation, not by a fresh freeze act.

### S-11 · `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`
- **DATE / SHA** — created 2026-05-24; carries two later closure sections dated **2026-05-26** (§VIII) and **2026-07-13** (§IX).
- **STATUS** — "**Status:** Open. · **Scope:** divergence-debt observability — **does NOT fix anything**; documents two structural gaps so they can be addressed deliberately rather than worked around." (:3-4)
- **JURISDICTION** — the mechanism by which a memory arena's content does or does not reach MAIA's prompt per processing tier; i.e. **the reachability seam between memory and cognition**.
- **WHAT IT SETTLES** —
  - **§I the pattern** (:11): "the addendum reaches MAIA's actual prompt only if **every tier's prompt assembly explicitly extracts that named key**. There is no generic iteration."
  - **§IV the rule violated** (:62-64): "*Add a channel; don't smuggle it through another channel.*… **a channel is not added until every active tier explicitly extracts and injects it.** Per-tier completeness is the bar. Anything less is **observability theater**."
  - **§VIII closure (2026-05-26)** — steps 1–3 done on a branch; shared `appendAllContextAddenda` helper with an `ADDENDA_SPECS` const listing "all 20 addenda"; explicitly states behavioural verification "requires production deploy + log inspection per §IV gate" (:99). "This closure note covers what was wired. **It does not claim what was not wired.**" (:107)
  - **§IX closure (2026-07-13)** — DEEP-primary audited; finding: "**There is no prompt seam in the local draft machine by construction.**" (:121) The Claude consultation lane was wired instead, env-gated off by default. **Honest label** (:133): "**Wired ≠ surfacing**… This wire is reachability-complete and traffic-dormant. No 'DEEP live' claim is authorized by this cut; the claim it does authorize is: *no prompt seam remains, on any tier, where a member turn can generate without its consent-gated recall blocks.*"
  - **Deliberately NOT wired, documented** (:137-141): local orchestrator draft (no seam); **`/api/between/chat`** — "an unresolved consent question (surfacing personal member-marked moments in the BETWEEN container is a **sovereign-placement ruling, not a wiring decision**). Requires Kelly's ruling before any recall wiring."; dormant routes.
- **WHAT IT DOES NOT SETTLE** — the §V step-6 production verification for DEEP; episodic's first witness ("Episodic awaits its first witness (zero marked moments exist in production as of this writing)", :135); and the BETWEEN consent placement ruling, explicitly reserved.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT but multi-vintage.** Header still says "Open"; the newest closure is 2026-07-13, i.e. **two months before subject date**. Its runtime claims (`agent_runs` counts, env gate state, "zero marked moments") are **DESCRIPTIVE SNAPSHOTS of 2026-07-13** and are **UNKNOWN now.**
- **BINDING FORCE** — **descriptive** (a finding log) with one **doctrine** line (§IV per-tier completeness bar).
- **NOTES** — The only slice source that documents an **unresolved consent question about placement** (BETWEEN) as distinct from a wiring question.

### S-12 · `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`
- **DATE / SHA** — 2026-09-06 (:4). Commits cited in its own §Record (`925336d4`, `2ae28486`, `88961fe1`, `16df97ae`) — recorded as the document's text; **ancestry not verified (E-1)**.
- **STATUS** — verbatim (:3): "**Status**: Directional architecture document. **Not canon. Not a lane. FROZEN 2026-09-06** after the production audit and two evidence corrections (F2 scope, F3 dual-implementation). Further edits append; they do not revise the findings." · "**Category** (six-category typology): Cat 1 — preserved direction. Held, not authorized." (:6)
- **JURISDICTION** — three schema-level decisions plus one audit, as **inputs to an unauthored Episodic Phase 2 spec**. "Placed in `docs/architecture/`, not `docs/canon/`… frozen reference, not standing permission. **If a future PR cites this document as authority to ship a sweep, a schema, or a decay replacement, that PR has misread it.**" (:14)
- **WHAT IT SETTLES** —
  - **Governing sentence** (:25): "MAIA memory does not repair its beliefs. It preserves the temporal ecology of what was experienced, what was asserted, what was known, and what remains true, **under the authority of the person whose life it remembers**." Inversion of the source tutorial: "**detect → ask → record**, where **only the member's answer creates or closes temporal validity**. The system may detect temporal uncertainty. It may not manufacture the correction." (:27)
  - **Decision 1** — Episodic Phase 2 distinguishes event time from valid time (:50). **Decision 2** — succession carried by the successor via `supersedes`; `superseded_by` derived, never stored (:86). **Decision 3** — staleness is detected and surfaced; status change requires the member: "A candidate reaches the member only through the existing doorway mechanism: `return_preference` must permit it, and the surface cooldown applies. **The member's answer is the only thing that opens or closes an interval. The system never sets `valid_to` from a timer.**" (:120) · "The word **repair** is wrong for MAIA and should not appear in any spec that descends from this note." (:122)
  - **Four-dimension conflation table** (:124-136): epistemic confidence (owner: provenance) · temporal validity (owner: **member**) · retrieval salience (owner: selection policy, "must be legible") · review currentness (owner: sweep candidate, **member answers**). "A single decay scalar cannot represent these." (:137)
  - **Audit findings, frozen** (:253-271): **F1** vector-fallback `valid_to` gap real in code, **ruled out under current data** (zero developmental memories carry a past `valid_to`) — "a latent structural inconsistency with no live exposure, not a defect"; **F2** invisible decay changes which developmental rows survive the non-vector top-12 **retrieval** cut for 2 of the 14 members whose pool exceeds 12 — "**a material upstream selection effect**. It does **not** yet establish that the final prompt-injected `memoryBullets` change"; **F3** only `pattern` is live and decay has two divergent implementations (SQL `calculate_decayed_confidence` vs the TypeScript helper; SQL confirmation term caps at 0.0225) — "**there is no single authoritative definition of decay today.**"
  - **`shouldPromptForConfirmation` has zero callers** — "The ask was designed and never wired." (:44) "Its zero-call status is evidence about an abandoned design possibility, not evidence that it is the right mechanism." (:149)
  - **Pre-registered adjudication table** written before the run so the result could not reshape the question (:275-281).
- **WHAT IT DOES NOT SETTLE** — §"What this document is NOT" (:16-22), verbatim: "not a 'self-healing memory' project · not authorization to open a lane · **not a build plan for Episodic Phase 2 (that spec is still unauthored)** · not a decision to change `confidenceDecay` behavior". Closing (:271): "**No implementation follows from this record. Do not alter decay, wire `shouldPromptForConfirmation`, or fix the vector fallback on the strength of it.**" Carries one open question into Phase 2: does the measured upstream decay effect propagate through final `selectionTrace` into prompt-injected memory (:266).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT, SELF-FROZEN 2026-09-06.** Its "Current state (verified 2026-09-06)" table (:33-46) and audit results are **DESCRIPTIVE**, dated eight days before subject date — the freshest status evidence in the slice, and still a snapshot.
- **BINDING FORCE** — **draft / preserved direction** (self-declared Cat 1, "Not canon. Not a lane."). Binding only in the negative: it refuses to license anything.
- **NOTES** — Records its own instrument-integrity caveats honestly: hook execution NOT WITNESSED on four commits (:172-180); script write-surface corrected from "READ-ONLY" to "no persistent writes" (:180).

### S-13 · `docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`
- **DATE / SHA** — 2026-09-06 (:1).
- **STATUS** — verbatim (:3-6): "**Status:** WORKING DECOMPOSITION, adopted by founder ruling after R12 (2026-09-06). **Not a claim that it exhausts the nature of human memory. Not a schema. Not a runtime change.** Inputs to the Episodic Phase 2 spec… and to the whole memory review. **Authorizes nothing at runtime.**"
- **JURISDICTION** — the decomposition used to reason about relational memory in the human-experience programme. **Replaces** the four-type typology (episodic · semantic · pattern · state-responsive) carried in Synthesis v0.1 R7 from source [22], which "is withdrawn as a supported universal decomposition" (:8-12). Ruling record cited: `inquiries/R12_MEMORY_IDENTITY_TRANSFER_2026-09-06.md` §8 rows 1–4 (:13).
- **WHAT IT SETTLES** —
  - **Two axes.** *Authority* — who or what stands behind a remembered item (classes incl. member-stated = verbatim turn content; member-marked = the member authored its salience, mapped to `is_breakthrough`, anchors, `return_preference`) (:17-31). *Time* — event time (episode `occurred_at`) · valid time (assertion `valid_from`/`valid_to`) · transaction time (row timestamp) · **belief-at-record** ("what did MAIA believe at that point?" — "the discriminator query (5)") (:35-41). "Temporal recall names the axis it resolved on; ambiguity is clarified with the member, never silently chosen." (:43)
  - **Evidence-beneath-derivation rule** (:48-52): a summary must not erase its evidence; a pattern must not replace its observations; "A derived item without reachable evidence is an impression, and licenses *ask*, not *record* (U33)."
  - **§3 Present-member authority, operational form (R7b)** — **the slice's clearest member-authority text** (:56-84): "A present member statement overrides an old MAIA model *as the authoritative account of the member's present self-report*. **It does not rewrite history.**" Worked example: historical "I never want to live in a city again" / present "I've changed…" → "historical statement remains true as history; present statement governs current orientation." MAIA impression path: detect → does not overwrite → asks/explores → member confirms, rejects, nuances, or leaves unresolved → record with provenance. Boundary: "member authority over their present self-report is **not omniscient factual authority over external reality**. Provenance stays intact. **detect → ask → record**, never **infer → overwrite**."
  - **Five design directions** (:88-94): A preserve qualification · B change-sensitive retrieval outranks similarity **only under temporal conflict** (S-12 F2 becomes a safety question) · C implicit contradiction creates a question, not a transition · **D protect authorship of the self-record** — derived material stays "visible where appropriate · provenance-bearing · **correctable** · **retractable** · defeasible. *The system may contribute to the record; it may not silently become the author of the person.*" · **E memory is never leverage** — "'you said before…' establishes continuity, never obligation; past preference does not bind future preference; past vulnerability does not authorize present persuasion; past disclosure does not invite more disclosure; past intimacy does not create relational debt."
  - **§5 P8 refined** (:98-107): "Historical continuity may inform; it may not govern. Recurrence does not create identity ('this is who you really are', 'you always do this' are prohibited uses of remembered material)… **The open future is a design requirement.**" Compression: "Memory should allow a relationship to have a history without requiring a person to remain who they were when that history was made."
- **WHAT IT DOES NOT SETTLE** — §6 verbatim (:109-115): "Does not change any table, loader, prompt, retrieval cut, decay function or consent gate. · Does not close U29–U33; the amplifier evidence is model-output-side and unmeasured in a consented dyad. · **Does not claim the decomposition is complete. New authority classes or time axes are added by spec, with a witness, not by this note.**"
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT.** Itself performs a supersession (withdraws the four-type typology).
- **BINDING FORCE** — **candidate / working decomposition adopted by founder ruling**; authorizes nothing at runtime. Its §3 and §4-D/E read as doctrine-grade statements of member authority but are declared spec inputs, not canon.
- **NOTES** — References repository identifiers (`is_breakthrough`, `return_preference`, `valid_from`/`valid_to`) as **mappings of its axes**, not as status claims. Read here as vocabulary, not as evidence of implementation.

### S-14 · `CLAUDE.md` § "Sanctuary Mode (Memory Consent)" (:240-266)
- **DATE / SHA** — undated section of the session anchor at subject SHA `1a5554300e855d3581085849301a39cbb10ab385`.
- **STATUS** — no status line; sits inside "# Project Invariants (MUST FOLLOW)" of the anchor, which itself opens "These instructions OVERRIDE any default behavior."
- **JURISDICTION** — consent-for-memory at the session level; the absolute exclusion boundary all other memory documents defer to.
- **WHAT IT SETTLES** — six invariants (:246-251), verbatim in substance: **1** no content retention ("not stored, indexed, or used for pattern formation") · **2** no training data ("never enters any model training pipeline") · **3** minimal metadata ("Only log that a sanctuary session occurred (timestamp, duration) — never content") · **4** visual clarity ("User must see unambiguous indication that Sanctuary is active") · **5** **default off** ("Regular sessions build memory; Sanctuary is an explicit opt-in") · **6** **absolute boundary** — "Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term memory, **under any circumstances, including by user request during the session**." Rationale (:255-257): "Real honesty requires safety… Sanctuary is the architectural proof that MAIA serves the person — not the data model." Two pieces of prescribed UI copy (:261-265).
- **WHAT IT DOES NOT SETTLE** — no mechanism, no table, no enforcement point, no defense-in-depth requirement (that addition comes from S-8 §3.6). Does not say what happens to a session already in progress when Sanctuary is toggled. Does not address deletion of **non-**Sanctuary memory.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT** (present at subject SHA in the binding-invariants region).
- **BINDING FORCE** — **constitutional** (project invariant, "MUST FOLLOW"). Every other memory source in the slice defers to it: S-1 §IV ("Sanctuary Mode (absolute exclusion)"), S-2 invariant 4, S-8 §0.1 and §3.6, S-5 §Alignment ("no stealth retention"), S-6's isomorphism table.
- **NOTES** — Invariant 6 is the only clause in the slice where **the member's own in-session request cannot unlock a memory behaviour**. Everywhere else member authority *expands* what may be held; here it cannot.

---

## Slice findings

### 1 · What EXACTLY is frozen, by which document, with enumerated exit conditions (verbatim)

**Freeze instrument: S-7 `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C "Observation-phase freeze (ACTIVE)" (:29-51).** The frozen object is the **wire-up of the resonant-field / coherence memory layer** (`CoherenceFieldService` → `coherence_field_readings` → the §3 route work). Header (:4): "Wire-up frozen pending explicit lift of the observation-phase freeze by Kelly, recorded in `CLAUDE.md` priority thread."

Default and authorization (:33), verbatim:
> **This document does not authorize wiring.** The freeze is the default state. Wiring requires Kelly's explicit lift, recorded in the `CLAUDE.md` priority thread, before any of the §3 route work begins.

**The enumerated exit conditions, verbatim (:43-50):**
> ### What the observation phase has NOT YET produced (freeze remains until these hold)
>
> - Stable evaluation
> - Closed learning loops
> - Routing coherence
> - Settled memory topology
>
> The freeze lifts only when those four hold, and only by Kelly's explicit declaration. Engineering pressure does not lift the freeze.

Two further clauses bind even after lift. **Sequencing (:60):** "`EpisodicMemoryService` is matrix 'Wire 1st.' Resonant field is 'Wire 2nd.' **This document does not authorize leapfrog.**" **Altitude (§0.D:64):** "activation must claim a bounded continuity layer, not proof of a resonant field… a *boundary that holds even after activation* — a sharper version of the freeze, not a weakening of it," enforced by five non-negotiable per-PR requirements (defined consumer · bounded input contract · retrieval rule · claim boundary · observation period).

**A second, distinct freeze text** governs the other arenas: **S-8 §5 "What This Plan Does Not Authorize" (:227-233)**, verbatim: "It does **not** authorize lifting the freeze on any layer beyond conversational. · It does **not** authorize cross-layer synthesis… · It does **not** authorize member-facing UI for any layer… · It does **not** authorize relaxing the four invariant safeguards. · It does **not** authorize semantic/vector ranking on any layer (recency-only ordering remains)." Its exit condition is different in kind — **not four conditions but a per-layer procedure**: "Each subsequent activation requires its own spec doc, locked-answer table…, and explicit Kelly directive." (:235)

**S-10 §5/§9 routes both outward** to a held list (Coherence/Field · Morphic · Somatic · Achievements · Pattern Attunement · Tact calibration · any cross-layer synthesis · any member-facing "field state"/"coherence"/"RFI"/"UFI" surface), naming §0.C as the lift condition for the first item only (:100, :149: "lift conditions in COHERENCE_FIELD_WIRE_UP_SPEC §0.C unmet"). The remaining holds rest on S-9's "Later with named gates" and S-10's own sequencing judgment, **not** on §0.C. **Recorded, not adjudicated:** §0.C is cited more broadly than its own text scopes it.

### 2 · Is the reopen-criteria set dated? When last revised? (verify/contradict register correction C3)

**Dated: yes — 2026-05-24, the document's only date (:3). Revised since: NO, on the documents' own evidence.**

- S-7 carries no revision log, no amendment section, no "last reviewed" line, and no dated re-statement of §0.C anywhere in its 304 lines. The four conditions appear exactly once.
- Every downstream citation **re-asserts without re-dating**: S-10 (2026-05-24, same day) §5:100 and §9:149 both say the conditions are "unmet"; the `CLAUDE.md` session anchor's "Still held under freeze" list repeats the same phrasing. No source in the slice records an attempt to evaluate the four conditions, a party responsible for evaluating them, or a measurement that would settle any one of them.
- At subject date **2026-09-14 the criteria set is ~113 days (3.7 months) old and unrevised**, while the arenas it gates have demonstrably moved around it: S-11 §IX (2026-07-13) reports further wiring and a DEEP audit; S-12 (2026-09-06) reports a production audit with three frozen findings. **Neither touched §0.C.**

**Verdict: the register's correction C3 is CONFIRMED.** The criteria are present and enumerated — they are not missing. The live risk is **staleness plus non-operationalizability**: none of "Stable evaluation", "Closed learning loops", "Routing coherence", "Settled memory topology" is defined, measured, thresholded, or assigned an evaluator **anywhere in this slice**. S-8 §4 and S-2's decision gates both show the project *can* write measurable gates ("≥3 distinct members in real (non-test) traffic across multiple sessions"; "≥ 50 production turns processed by orchestrator with no regressions"), which sharpens rather than excuses the contrast. A freeze whose exit conditions cannot be evaluated cannot be lifted **or** confirmed still-binding by evidence — only re-asserted by citation, which is what every downstream document does.

### 3 · Do the memory documents agree on what the memory arenas ARE? — **NO. Five incompatible enumerations.**

| Source | Count | Arena names as used |
|---|---|---|
| **S-1** §II / §VII | **12** | turn · session · conversational · episodic · semantic · relational · developmental · pattern · somatic-affective · breakthrough · field/collective · meta-memory |
| **S-5** §Memory Architecture | **11** (3 bands) | identity · relational · pattern · developmental · recent working · sacred/protected flags ‖ session · narrative · symbolic ‖ full archive · legacy |
| **S-8** §2 | **9** | conversational · episodic · semantic (atoms) · developmental · relational · symbolic · somatic · field/coherence · meta/provenance |
| **S-7** header | **15** ("15-layer architecture") | only two named: *resonant field* (distinct from *morphic*); maps to S-1 slot 11 `field` |
| **S-9 / S-10 §3** | **9–11 services** | episodic · coherence · semantic (×2, duplicated) · consciousness-evolution/developmental · quantum/field-pattern · morphic · somatic · achievements · architecture-whole |
| **S-13** | **not arenas** | replaces arena decomposition with **Authority × Time** axes; explicitly withdraws the prior four-type typology |

**Flagged disagreements:**
1. **Count is unreconciled: 12 (S-1) vs 11 (S-5) vs 9 (S-8) vs 15 (S-7).** No document reconciles them. S-7 is the only source asserting a 15-layer stack and it names no source for it beyond a memory key, `project_maia_memory_field_architecture_15_layers` (:5) — **unlocated in this slice**.
2. **Arenas present in exactly one source:** *identity*, *narrative*, *full archive*, *legacy*, *sacred/protected flags* (S-5 only) · *turn*, *breakthrough* (S-1 only, as named layers) · *morphic*, *achievements* (S-9/S-2 only) · *conversational* (S-1/S-8, absent from S-5's 11).
3. **`pattern` vs `symbolic` vs `morphic`**: S-1 has *pattern*; S-5 has *pattern* AND *symbolic*; S-8 has *symbolic* but no *pattern* arena; S-9 has *morphic* as the cross-member pattern service. These are treated as neighbours by S-5's mapping table (:362) and as distinct concerns by S-7 §0.B. **No source settles the relation.**
4. **`field` is the most contested name.** S-1 slot 11 = "Field / collective memory… contributed with consent to AIN". S-7 §0.A = "coherence-field readings… **non-member-content**, a structural reading of the turn-time field, not a portrait of the member" — a *different object entirely*, and S-7 §0.B spends a section refusing two adjacent readings of the same word. S-10 §1 lists **RFI** as "❌ Not built" and notes the coherence spec uses "we have proven RFI" as its example of inflation to refuse.
5. **S-1 §VII is the only enumeration with an enforcement mechanism** (the `memoryHealth` key set). Any arena absent from S-1's twelve therefore has no health-contract slot — notably *identity*, *narrative*, *symbolic*, *archive*, *legacy*, *morphic*, *achievements*.

**Conclusion for P1-02: there is no single governing arena vocabulary.** S-1 §II is the only 12-way enumeration bound to an enforcement surface and is the strongest candidate for canonical status, but no document declares it so against the others.

### 4 · Does any document settle member authority over stored memory — correct, delete, override?

**PARTIALLY SETTLED, and the parts are split across documents of different binding force. No single source settles all three verbs.**

| Verb | Settled? | Governing text |
|---|---|---|
| **Correct** | **YES, at doctrine level** | S-4 §5:110 — Spiral State Objects must "be **member-correctable** ('that's not where I am') **and reflect the correction immediately**". S-13 §3:58 — "A present member statement overrides an old MAIA model *as the authoritative account of the member's present self-report*. **It does not rewrite history.**" S-13 §4-D — derived material stays "**correctable · retractable · defeasible**". |
| **Override** | **YES, bounded** | S-13 §3:80 — "detect → ask → record, never infer → overwrite"; boundary: "member authority over their present self-report is **not omniscient factual authority over external reality**." S-12 Decision 3:120 — "**The member's answer is the only thing that opens or closes an interval. The system never sets `valid_to` from a timer.**" |
| **Close / seal** | **YES** | S-4 §8:152 — "**Sealing is irreversible by the system. Only the member can re-open a sealed thread.** The system must not infer that a sealed thread 'seems active again'." |
| **Refuse formation** | **YES, structurally** | S-3 — non-form categories are "not constructed in the first place"; consent-for-formation requires participation in the naming, not a global toggle. S-14 invariant 6 — Sanctuary is absolute *against* the member's own in-session request. |
| **Opt out of recall** | **PROPOSED, not settled** | S-8 §3.4 — `members.<layer>_recall_enabled BOOLEAN DEFAULT TRUE` as a *reusable pattern*; S-10 §9.2 — the toggle is "**consent infrastructure, not polish**" and is *sequenced*, not shipped. |
| **Delete / erase stored memory** | **UNKNOWN — not settled by any source in this slice** | S-3 §Purpose:19 explicitly excludes it: "It does NOT specify… **how a member modifies or revokes formed memory**." S-3 §non-form:53 sidesteps it: "A non-form category **does not require a 'delete my data' pathway because the data is not formed**" — which answers only for non-form categories. S-1 confers *significance* on the member (§XI) but no record authority. S-5 speaks of compression, not deletion. S-4 §8 offers *sealing* (held "only as historical fact of having existed") and *decay* (observation-substrate only: "must be gone — not archived, not hidden, gone", §11) — **neither is member-invoked erasure of formed memory.** |

**Strongest single compression on member authority (S-13 §4-D:92):** "*The system may contribute to the record; it may not silently become the author of the person.*" Adjacent and load-bearing (S-13 §4-E): "memory is never leverage — 'you said before…' establishes continuity, never obligation."

**Open for P1-02:** member-invoked **deletion/erasure of formed memory** has no governing text in this slice. The nearest instruments are sealing (S-4), Sanctuary non-formation (S-14), and archived-but-preserved atom status noted in passing by S-12 (:40, "`archived` = out of recall, still preserved") — the last of which describes a substrate behaviour, not a governance ruling.

### 5 · Which memory documents are DESCRIPTIVE status snapshots that could have gone stale?

Named, with vintage and the specific claims at risk. **None of these may be quoted as current state.**

| Source | Snapshot date | Age at 2026-09-14 | Claims at stale-risk |
|---|---|---|---|
| **S-2** MAIA_MEMORY_ROADMAP | 2026-05-04 (self-declared "Last roadmap update") | ~4.3 months | entire phase table; "Production health"; "Last verified"; open-issues list. Its own update protocol (:97) makes non-refresh a maintenance failure, not a neutral fact. |
| **S-9** MEMORY_SERVICE_STATUS_MATRIX | 2026-05-24 | ~3.7 months | every numeric cell (LOC, live-path callers, DB writes/reads, table presence, tests) — self-described "Numbers from grep". Its five-point contract and canon line do **not** go stale the same way. |
| **S-10** STATE_AND_ROADMAP §2, §3 | 2026-05-24 | ~3.7 months | per-layer state column ("wired-unmerged", "0 live consumers", branch/deploy status); §4 fork presented as undecided. §1 altitude classes and §8 compression read as durable doctrine. |
| **S-11** ADDENDA_CHANNEL_DIVERGENCE | header 2026-05-24; §VIII 2026-05-26; §IX 2026-07-13 | 2–3.7 months, multi-vintage | `agent_runs` counts ("zero DEEP turns in the last 7 days", "CORE 645, FAST 198", "468 rows/72h"); env-gate state; "zero marked moments exist in production"; status "Open". |
| **S-12** TEMPORAL_MEMORY_DIRECTION §Current state + §Audit results | 2026-09-06 | 8 days | freshest in the slice and still a snapshot: zero rows with past `valid_to`; 36 members / 2018 candidate rows / 14 members past the cut / 2 sets changed; "only one memory type exists in production"; "`shouldPromptForConfirmation` — **Zero callers**". Document is self-FROZEN, so it will not self-correct. |
| **S-5** SANCTUARY_ECONOMY §Implementation Notes | 2026-04-02 | ~5.4 months | "Current Tension to Resolve" (tier gating of conversation memory and pattern recognition said to contradict doctrine); the 11-level → service mapping; "Levels 10/11 Not yet implemented". |
| **S-1** §VII, §IX | undated | — | not status claims, but the `memoryHealth` key list and the release checklist **presuppose** a substrate shape; whether the twelve keys exist is **UNKNOWN** and not asserted by the document. |
| **S-6** §1 System Roles | 2026-02-28 | ~6.5 months | device/topology description (e.g. Docker stack sited on Mac Studio) — infrastructure jurisdiction, flagged only, not adjudicated here. |

**Durable (non-snapshot) by contrast:** S-3, S-4, S-13, S-14, S-7 §0.C/§0.D, S-8 §0/§3/§5, S-9's contract lines, S-1 §I–§VI/§VIII/§X–§XII.

### Unlocated governance
- `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md` — S-3:91 makes per-field wiring conditional on this audit's classification step. Existence/completion **not checked in this slice**.
- `docs/specs/EPISODIC_LAYER_PHASE_2_SPEC.md` — named by S-10:95 and S-12:20 as **unauthored**. Three sources (S-10, S-12, S-13) route inputs to it. The single largest governance vacuum in this slice: episodic is repeatedly called the threshold arena, and its spec does not exist.
- `docs/architecture/TACT_CALIBRATION_SKETCH.md` — S-10:102, "not yet written".
- The "15-layer architecture" referenced by S-7:5 (`project_maia_memory_field_architecture_15_layers`) — a memory key, not a repository document; **unlocated**.
- `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` (S-8:11, S-11:6) and `docs/specs/CUT_1_SUBSTRATE_RESTORATION.md` (S-7:112) — cited as authority chain, **not read in this slice**.
- The four-safeguard set of S-8 §0 is cited by name across S-10 and the session anchor; only safeguards 1 and 2 are quoted in the lines read. **Full enumeration not captured here.**

### Contradiction between sources
1. **Arena vocabulary** — five incompatible enumerations (finding 3). Unreconciled by any source.
2. **`field`** — S-1 slot 11 (collective, consent-contributed, member-derived) vs S-7 §0.A (turn-time structural reading, **non-member-content**). Same slot number, different objects.
3. **Freeze scope** — S-7 §0.C scopes itself to the coherence wire-up; S-10 §5/§9 and the session anchor cite it as the lift condition for a wider held set. Not a textual contradiction, but a **scope expansion by citation**.
4. **Attunement vs non-formation** — S-1 §III ("Memory trains MAIA on the member"; "MAIA's nature in relation to each member becomes shaped by what has been shared") states a *capability* that S-3 and S-4 constrain to member-authored/confirmed material. S-1 supplies no bound of its own; the bound is external. Two documents of constitutional/canon force, one of which reads permissively when quoted alone.
5. **Decay has two implementations** — S-12 F3: SQL `calculate_decayed_confidence` vs the TypeScript helper diverge on confirmation semantics; "**there is no single authoritative definition of decay today**." This is a *governance* contradiction (no authoritative definition), reported as a finding, **not verified here**.
6. **Tier gating vs universal memory** — S-5 §Implementation Notes asserts a live contradiction between tier code and the sanctuary-economy doctrine, dated 2026-04-02. Whether it persists is **UNKNOWN**.

### Documents that declare their own non-authority
- **S-7:33** "This document does not authorize wiring." · **:60** "This document does not authorize leapfrog."
- **S-8:4** "Planning artifact. No runtime impact from this document." · **§5:227-233** five explicit non-authorizations · **:241** "Kelly directive is the only lift."
- **S-3:15-20** four explicit exclusions incl. member modification/revocation · **:89** "does not authorize building any retrieval, surfacing, or accumulation pathway."
- **S-12:3** "Not canon. Not a lane. FROZEN 2026-09-06." · **:14** "If a future PR cites this document as authority to ship a sweep, a schema, or a decay replacement, that PR has misread it." · **:271** "No implementation follows from this record."
- **S-13:3-6** "Not a schema. Not a runtime change… **Authorizes nothing at runtime.**" · **§6** five further exclusions.
- **S-11:4** "does NOT fix anything" · **:107** "This closure note covers what was wired. It does not claim what was not wired." · **:133** "No 'DEEP live' claim is authorized by this cut."
- **S-9:29** "Absent any of the five, the service stays dormant." · S-7:10 labels the matrix's Wire-1st/2nd row "(sequence note, not authorization)".
- **S-10:87** "§5. Proposed sequencing — *held, not authorized*."
- **S-1 §XI:173** "It does not verify that the material mattered." — a self-imposed epistemic bound rather than a non-authorization.
- **S-4:7** "Precedes any architectural spec or implementation slice of multi-spiral attention."

### Open questions for P1-02
1. Which arena enumeration governs — S-1's twelve (the only one with an enforcement surface), S-5's eleven, or S-8's nine? No source rules. **Any code census must declare which vocabulary it is counting against.**
2. Who evaluates S-7 §0.C's four conditions, against what measurement, and has anyone ever attempted it? No slice source names an evaluator or a threshold.
3. Does the §0.C freeze in fact govern the wider held list (Morphic / Somatic / Achievements / Pattern Attunement / cross-layer synthesis / member-facing field surfaces), or only the coherence wire-up it textually scopes?
4. **Member-invoked deletion of formed memory has no governing text.** Is that a gap, or is it deliberately answered by S-3's formation-layer refusal plus S-4's sealing? Needs a ruling, not an inference.
5. Is the `memoryHealth` twelve-key contract (S-1 §VII) a live obligation or an aspirational shape? S-1 asserts it as constitutional; nothing in the slice witnesses it.
6. S-12's carried open question: does the measured upstream decay effect propagate through final `selectionTrace` into prompt-injected memory? Declared answerable from existing trace, "No new lane required."
7. S-11's reserved ruling: BETWEEN-container recall placement — "a sovereign-placement ruling, not a wiring decision."
8. S-5's tier-gating contradiction (2026-04-02): resolved, or still live?
9. The Episodic Phase 2 spec is unauthored while three documents route inputs into it and two roadmaps sequence work behind it. What is the governing status of an arena whose spec does not exist?
10. S-2's update protocol has not been honoured since 2026-05-04 while the document declares itself "ground truth" for a weekly governance review. Is that review still running against this file?
