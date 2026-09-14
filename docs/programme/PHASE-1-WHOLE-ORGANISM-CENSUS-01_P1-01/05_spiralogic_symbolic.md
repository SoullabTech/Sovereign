# P1-01 · GOVERNING SOURCE READ — SPIRALOGIC / ELEMENTAL INTELLIGENCE + SYMBOLIC / ORACLE CORPUS LAYER

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP      P1-01 · GOVERNING SOURCE READ
SLICE     05 · Spiralogic / elemental intelligence, symbolic + oracle corpus layer
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385 (working tree)
TYPE      RECORD ONLY — no architecture claim, no code census
RULE      Do not infer architecture from aspiration.
RULE      Do not infer authority from symbolic sophistication. An elaborate
          archetypal or elemental framework document proves an elaborate
          document exists.
E-1       SHALLOW clone. History-dependent claims are UNKNOWN unless the document
          states them. No git log / blame / ancestry reconstruction.
C-2       MAIA_WHOLE_ORGANISM_MAP/** is PREDECESSOR CENSUS · FROZEN INCOMPLETE ·
          EVIDENCE INPUT ONLY. (Not cited in this slice — nothing from it was read.)
```

## Sources read

| # | Source | Lines | Read |
|---|---|---|---|
| S-1 | `docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md` | 110 | full |
| S-2 | `docs/canon/ICHING_STRUCTURAL_ENGINE.md` | 160 | full |
| S-3 | `docs/canon/ORACLE_CORPUS_DESIGN_v1.0.md` | 197 | full |
| S-4 | `docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` | 198 | full |
| S-5 | `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md` | 158 | full |
| S-6 | `docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md` | 225 | full |
| S-7 | `docs/canon/MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md` | 50 | full |
| S-8 | `docs/canon/NEXT_SIGNAL_LOOP_SPEC.md` | 345 | full |
| S-9 | `docs/canon/SOULLAB_THEME.md` | 260 | full |
| S-10 | `docs/canon/NOMENCLATURE_AND_WORLD_ALIGNMENT_PRINCIPLE_2026-08-05.md` | 263 | full |
| S-11 | `docs/canon/use-frames/USE_FRAME_ACTIVATION.md` | 298 | full |
| S-12 | `docs/canon/use-frames/JOHN_OF_THE_CROSS_USE_FRAME.md` | ~250 | §1-60, §83-130, §217-end |
| S-13 | `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md` | 153 | §1-40, §125-153 |
| S-14 | `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md` | 132 | §1-22 |
| S-15 | `docs/canon/SPIRAL_CONTINUITY_ENGINE.md` | 226 | headings + all normative lines |
| S-16 | `docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md` | 167 | full |
| S-17 | `docs/architecture/MAIA_SPIRAL_ORIENTATION_CUT2.md` | 119 | §1-85 |
| S-18 | `docs/framework/facets/*.md` (15 files) | — | `fire-phase-1.md` §1-25 + directory listing |
| S-19 | `docs/canon/SOULLAB_VOICE_DOCTRINE_DAOIST.md` | 136 | §1-30 |
| S-20 | `docs/specs/SPIRALOGIC_JOURNEY_FRAMEWORK_2026-07-09.md` | 87 | §1-22 |
| S-21 | `docs/MAIA_SPIRALOGIC_INTEGRATION_GUIDE.md` | 394 | §1-25 |
| S-22 | `lib/maia/spiralogicReference.ts` | 8 | full (existence + vocabulary only) |
| S-23 | `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` §Invariant 13 | 241-258 | that section only — CROSS-SLICE CITATION |

Directory listed and governed-by determined: `docs/canon/use-frames/` contains exactly two files (S-11, S-12). `USE_FRAME_ACTIVATION.md` governs the directory; `JOHN_OF_THE_CROSS_USE_FRAME.md` is the single instance.

---

## Per-source record

### S-1 · `docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md`
- **DATE / SHA** — none stated. UNKNOWN (E-1).
- **STATUS** — no status line. Title self-declares "Integration Doctrine"; filename is `_DOCTRINE`. Cited by S-23:245 as "the Symbolic Guidance Layer Doctrine", companion to Invariant 13.
- **JURISDICTION** — how the I Ching / Daoist symbolic layer may enter MAIA's responses, relative to Spiralogic.
- **WHAT IT SETTLES** — Role separation, stated as three normative lines (:32-34): *"Spiralogic names the developmental terrain. I Ching illuminates the posture within that terrain. Daoist logic shapes how the posture is spoken."* Spiralogic is declared "the native ontology" (:13). The symbolic layer must be optional, scoped, reversible (:46-57), feature-flagged (`ichingPatternLayer`, `daoistVoiceLayer`, :57). Plain-language override when a member is distressed (:90-93). Named prohibitions: must never sound like "fate declaration, hidden certainty, mystical domination, or 'truth from above'" (:42). Phase 1 is declared "(current)" = silent internal mapping, logging only, no user-facing output (:61-65).
- **WHAT IT DOES NOT SETTLE** — Does not define Spiralogic; it presupposes it. Does not settle whether the "Phase 1 (current)" claim is true of this tree (that is a code question, out of scope here — and the document carries no date, so *current* is unanchored). Does not define "facet confidence threshold" numerically (:85-88). Does not say who may authorize Phase 2/3/4. Does not settle whether the I Ching layer may ever be shown to the member with its hexagram identity (S-2 prohibits by default; this document's Phase 4 contemplates an optional "deeper reading" mode, :81).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face; cited as live by S-23 (ratified invariants), which is the strongest available evidence of currency.
- **BINDING FORCE** — doctrine.
- **NOTES** — This is the closest thing in the slice to a *power-separation* document: it assigns terrain to Spiralogic, posture to I Ching, phrasing to Daoist logic. Its Design Test (:102-108) is a gate written in question form, with a declared failure direction ("it is starting to disassemble").

### S-2 · `docs/canon/ICHING_STRUCTURAL_ENGINE.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — no status line, no canon declaration. Title asserts "Engine".
- **JURISDICTION** — the internal mechanics of the I Ching layer: facet → hexagram mapping, guidance extraction, Daoist voice transform.
- **WHAT IT SETTLES** — A concrete four-step loop (:32-48) and a 15-entry `facetToHexagram` seed map in TypeScript (:134-150) binding `fire_1 … aether_3` to hexagram numbers. An elemental alignment table (:53-59) mapping Water/Fire/Earth/Air/Aether to I Ching and Chinese-logic qualities. Design constraints (:96-104): do NOT expose hexagram numbers by default, do not over-explain, do not turn this into fortune telling.
- **WHAT IT DOES NOT SETTLE** — Whether any of it is built, wired or authorized: it names a "Oracle Integration Point" flow (:153-160) with functions (`mapToHexagram`, `applyDaoistVoice`) but declares no build status, no gate, no owner, no review. It does not state the provenance or authority of the seed map — *who decided Water 2 is Hexagram 29, and against what*, is UNKNOWN. It carries no consent, no plain-language override (S-1 supplies that), and no refusal surface.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN. Consistent with S-1 and not contradicted by it.
- **BINDING FORCE** — UNKNOWN. It sits in `docs/canon/` but declares no status; its content is design/spec material. Treat as **candidate** at most. ⚠ This is the sharpest instance of the slice-specific rule: a 15-row archetypal mapping table with code types is *sophistication*, not authority.
- **NOTES** — This document, not S-1, is where the symbolic layer acquires a *claim about the member's state* ("Here is how reality is moving right now.", :104) — see Slice findings §3.

### S-3 · `docs/canon/ORACLE_CORPUS_DESIGN_v1.0.md`
- **DATE / SHA** — 2026-02-28 (:4).
- **STATUS** — `**Status:** Canon` (:3). Depends on `SOVEREIGN_STORAGE_SOP_v1.0.md` (:5).
- **JURISDICTION** — what material may enter `/data/oracle-corpus` and therefore become retrievable into MAIA's context. Ingestion boundary, not response boundary.
- **WHAT IT SETTLES** — Three knowledge states — Working (never indexed), Curated (the only indexed layer), Archive (never indexed) (:29-63). Inclusion criteria (:69-77) and exclusion criteria (:91-100), with the operative test *"If you would give this to a student as teaching material, it can enter the corpus."* Fixed folder structure (:108-117) on which weighting depends. Promotion is manual and gated on an explicit `_corpus-ready/` move (:125-139). Governing retrieval rule: **"If corpus quality drops, reduce retrieval — do not expand it."** (:177) and "When in doubt, retrieve less." (:155).
- **WHAT IT DOES NOT SETTLE** — Nothing about what MAIA may *conclude*. It governs supply, not inference. Does not settle whether any indexing pipeline exists ("when retrieval is enabled", :135, is conditional). Does not settle who audits the corpus or on what cadence. Does not address member-authored material entering the corpus at all — the corpus it describes is founder/teaching material only.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face. No supersession marker.
- **BINDING FORCE** — ratified canon (self-declared `Status: Canon`).
- **NOTES** — Its own closing sentence is a power claim worth recording: *"What MAIA retrieves shapes what members experience. Curation is the act of deciding what kind of presence MAIA is."* (:197).

### S-4 · `docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md`
- **DATE / SHA** — 2026-02-28 (:4).
- **STATUS** — `**Status:** Canon` (:3). Depends on S-3 and S-5.
- **JURISDICTION** — required per-document metadata for corpus entries.
- **WHAT IT SETTLES** — Five mandatory fields: `tier + authority + source_type + status + safe_for_retrieval` (:195). Enumerated vocabularies for each (:39-96). Only `stable` documents should be active in retrieval; `review` gets a 0.5 weight modifier (:96). **`safe_for_retrieval: false` ⇒ indexed but never retrieved** (:104) — an explicit human sign-off surface, justified because "some documents are true but not helpful to surface mid-session" (:106). A seven-item promotion checklist (:143-151). Corpus-drift symptom list and the rule that the response to drift is a corpus audit, not prompt tuning (:157-172).
- **WHAT IT DOES NOT SETTLE** — Enforcement: nothing here states that an unmetadata'd document is *refused* by any mechanism; the discipline is procedural. Does not settle who may set `safe_for_retrieval: true`. Does not answer its own §"Current Corpus Location" question (:176-188) — it poses it as an open prerequisite.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face.
- **BINDING FORCE** — ratified canon (self-declared).
- **NOTES** — `safe_for_retrieval` is the only *content-suppression* primitive found anywhere in this slice.

### S-5 · `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md`
- **DATE / SHA** — 2026-02-28 (:4).
- **STATUS** — `**Status:** Canon` (:3).
- **JURISDICTION** — relative influence of corpus material on MAIA's responses.
- **WHAT IT SETTLES** — Four tiers with numeric weights: Voice 2.0, Core Frameworks 1.5, Teachings 1.0, Research 0.6 (:97-100), applied at folder level at index time, multiplicative re-rank at query time (:103). **Tier 2 — Core Frameworks explicitly names "Spiralogic reference (12-phase system)", "Five-element model", "AIN ontological framework", "The MAIA Canon"** (:41-47), described as "the structural lenses MAIA applies when making meaning… the grammar of MAIA's thinking, not just its vocabulary" (:49). Governance rules (:125-131): Tier 1 frozen except by explicit decision; Tier 2 stable; nothing moves backward. Full influence stack (:138-145) placing system prompt and conversation history as fixed poles.
- **WHAT IT DOES NOT SETTLE** — Whether the weighting is implemented ("Implementation Notes" is written prospectively). Does not settle which document *is* the Spiralogic reference it names as Tier 2 — see Slice findings §1. Does not govern non-retrieved influence (prompt-resident framework text) at all; that path is outside the weighting model by construction.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face.
- **BINDING FORCE** — ratified canon (self-declared).
- **NOTES** — :49 is the strongest in-corpus statement that Spiralogic is intended as an *interpretive grammar*, not merely vocabulary. It is a statement about corpus weighting, not about member inference.

### S-6 · `docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — `**Status:** Phase 1 (prompt-layer injection + domain detection)` (:3); `Canon alignment: Sovereignty Invariants, Oath, Non-Ambient Cognition` (:4). It declares a *phase*, not a ratification.
- **JURISDICTION** — cross-tradition knowledge domains MAIA may draw on and how it must speak across them.
- **WHAT IT SETTLES** — A 12-domain map (:33-46) in which **Spiralogic is domain 6, "Elemental intelligence and developmental transformation"** — i.e. one tradition among twelve, alongside Jungian, Islamic psychology, neuroscience. Response protocol for cross-domain inquiry (:149-156). **Guardrails (:160-167)**: no false equivalence; **"No synthetic authority — MAIA is a mediator, not a scholar or teacher"**; always preserve lineage; allow tension; no aesthetic appropriation; **"Non-ambient — Knowledge field is entered by inquiry, not imposed"**. Phase plan (:185-201) with Phase 1 flag `knowledgeFieldLayer` **default off** (:191). Relationship table (:207-213) asserting "Each domain maps to element affinity" and "SAL selects language; KF provides the content".
- **WHAT IT DOES NOT SETTLE** — Whether Phase 2 (member-level affinity weighting) or Phase 3 is authorized — they are listed, not gated. §8 "Growing With Members" (:171-181) proposes storing per-member domain affinity signals with a resonance score; **no consent gate, no retention limit, no member visibility is stated** for those signals. Does not reconcile "MAIA is a mediator, not a scholar or teacher" with Spiralogic being simultaneously the native ontology (S-1:13) and one domain here.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face; self-scoped to Phase 1.
- **BINDING FORCE** — spec (a phased design document sitting in `canon/`), with an embedded guardrail set of doctrine character.

### S-7 · `docs/canon/MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — no status line.
- **JURISDICTION** — the domain list itself.
- **WHAT IT SETTLES** — The twelve domains in one-line form (:8-19). Guiding rules (:30-36): name traditions; do not collapse distinct systems into false sameness; **"Use this field in service of understanding, not synthetic authority"**. Names implementation paths (:44-50): `lib/maia/knowledge/knowledgeField.ts`, prompt block, wired into `app/api/oracle/conversation/route.ts` "non-ambient, domain-detection gated", flag `knowledgeFieldLayer`.
- **WHAT IT DOES NOT SETTLE** — Everything S-6 leaves open. The §Implementation block is a *claim about code*; per this lane's rule it is recorded as a claim, not verified.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face; subordinate to S-6 which cites it (:48).
- **BINDING FORCE** — descriptive (a list + guiding rules), UNKNOWN as to ratification.

### S-8 · `docs/canon/NEXT_SIGNAL_LOOP_SPEC.md`
- **DATE / SHA** — none. Cites commits `9e34922d6`, `1a86e21ef` and branch `claude/dreamy-allen` (:5, :75) — history-dependent, therefore UNKNOWN per E-1.
- **STATUS** — `**Status:** Draft specification. Not implemented.` (:3).
- **JURISDICTION** — the practitioner-facing council consultation loop (Studio Changes / Decisions), not MAIA's member conversation.
- **WHAT IT SETTLES** — Six invariants (:21-28), of which three bear directly on interpretation: **(1) "No advancement without new signal"** — iteration >1 with no new evidence must not produce a narrower or more confident reading of the same data; **(2) "Evidence is tagged"** Observed / Reported / Inferred; **(6) Sovereignty** — the synthesis proposes, the practitioner decides. Explicit non-goal: **"No automated evidence classification (the practitioner tags; the system does not guess)"** (:311).
- **WHAT IT DOES NOT SETTLE** — It settles nothing about the live system: it declares itself not implemented. It does not govern MAIA's member-facing conversation at all. It does not state who ratifies it or whether it was superseded.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a draft; implementation status per document = not implemented.
- **BINDING FORCE** — draft / spec (self-declared).
- **NOTES** — Its invariant 1 and its "reinterpretation of the same data is not learning" anti-pattern (:64) are the only *anti-inflation-of-confidence* rules located in this slice. They govern a practitioner surface, not a member one.

### S-9 · `docs/canon/SOULLAB_THEME.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — `## Status / Canonical visual system for Soullab and MAIA core surfaces.` (:6-7).
- **JURISDICTION** — visual language: palette, field hierarchy, domain accent variance, prohibitions.
- **WHAT IT SETTLES** — Four structural layers Void/Field/Surface/Signal (:74-79). Domain accents keyed by `data-domain` (:90-96). Fixed palette hex values (:107-136). Prohibitions (:230-238). Accessibility floor (:242-247) with light mode explicitly **not canonical at present** (:249).
- **WHAT IT DOES NOT SETTLE** — Nothing symbolic or interpretive. ⚠ It uses "field" as a *visual* term ("a continuous field of aware containment", :61) which collides lexically with "field" as used in S-6 (knowledge field) and in the elemental/Spiralogic corpus. The document does not flag the collision.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face.
- **BINDING FORCE** — ratified canon (self-declared canonical) — scope: visual only.
- **NOTES** — In this slice its only load-bearing contribution is the elemental/symbolic surfaces' *absence*: there is no colour-per-element mapping here, though S-16:41-48 asserts one ("Sacred Geometry Mapping", "Each phase generates specific geometric UI elements and color harmonies"). See Slice findings §Contradiction.

### S-10 · `docs/canon/NOMENCLATURE_AND_WORLD_ALIGNMENT_PRINCIPLE_2026-08-05.md`
- **DATE / SHA** — 2026-08-05 (:4).
- **STATUS** — `**STATUS: DRAFT — CANDIDATE CANON. Not ratified.**` … *"this document does not carry canon authority until Kelly rules it in. Until then it may inform design conversation but may not be cited as a gate."* (:4-6). Founder review same day classified it "high-value candidate canon" (:8), still unratified.
- **JURISDICTION** — surface vocabulary across deployment worlds; the boundary between platform architecture and the client's meaning system.
- **WHAT IT SETTLES** — *Proposes*, does not settle (unratified). Core rule: "The platform architecture is universal. The experience vocabulary is contextual." (:35). Rider 1: vocabulary resolves at read time, never a storage layer (:81-87). **Rider 2 precedence: member's own words > world vocabulary > platform vocabulary** (:89-100), with :100 flagged for verbatim protection: *"A practitioner's nomenclature may frame the room; it may not rename what the member said inside it."* Rider 3: nomenclature alignment is not capability claiming (:105-111). Three design tests (:119-126). Gate declaration with an evidence-producer rule — **the users, never the build team** (:128-141).
- **WHAT IT DOES NOT SETTLE** — Explicitly enumerated in §"What ratification must still decide" (:245-263): standalone canon vs amendment to Invariant 14; whether Rider 2 precedence is ruled as stated; grandfathering; **the world-formation boundary — who decides when a "world" deserves its own vocabulary layer** (:251-260). It also does not settle whether *Spiralogic itself* is platform vocabulary (internal only, per :98) or world vocabulary — a question with direct consequences for whether elemental language may appear on member surfaces.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT, unratified.
- **BINDING FORCE** — candidate (explicitly self-declared non-authoritative; may not be cited as a gate).
- **NOTES** — This is a document that declares its own non-authority in its first six lines. Record it as the model case.

### S-11 · `docs/canon/use-frames/USE_FRAME_ACTIVATION.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — `**Status:** spec / decision document. **No code yet.**` (:3).
- **JURISDICTION** — how a use-frame (a prompt-shaping artifact bound to a retrieved corpus) may be activated.
- **WHAT IT SETTLES** — Defines what a use-frame *is*: stance, themes, discernment boundary, vocabulary mapping; **"not a personality, a voice, or a system prompt override… a provisional lens"** (:19-29). Evaluates three activation paths and **recommends Option 1 (retrieval-hit) with seven strict boundaries** (:122-180): similarity threshold (suggested 0.60), explicit `library_sources.id` scoping, single-frame-per-turn ceiling, **member language as boost not trigger**, provisional discernment clauses always carried, telemetry on every fire, per-frame kill switch off by default. It marks one paragraph as canon (:182-187): **"Explicit mention of a tradition or figure may open retrieval, but does not itself authorize field activation."** Explicitly rejects Option 2 (phrase triggering) as *violating* the non-ambient cognition canon — "phrase-detection *is* interpretation" (:76-78) — and Option 3 (care-lens opt-in) as "always-on theology" (:105).
- **WHAT IT DOES NOT SETTLE** — Five decisions are declared open (:286-295): adopt Option 1? threshold value? member-language boost now or deferred? telemetry destination? v1 scope? So the recommendation is not a ruling. Also deferred (:251-264): query-side vocabulary expansion, source weighting, multi-frame composition, frame versioning.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as an open decision document.
- **BINDING FORCE** — spec, with one paragraph self-labelled "(canon)" (:182) whose ratification is UNKNOWN. ⚠ A document that declares "No code yet" and lists five undecided questions cannot be read as governing.

### S-12 · `docs/canon/use-frames/JOHN_OF_THE_CROSS_USE_FRAME.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — `**Status:** canon — apply whenever the John of the Cross corpus is retrieved or referenced.` (:3). ⚠ Its own §Wiring says "**not yet built**" (:241 ff) and that "automatic injection is not" appropriate.
- **JURISDICTION** — stance, themes and boundaries when the John of the Cross corpus is in play. The only instantiated use-frame.
- **WHAT IT SETTLES** — Stance: **"MAIA does not speak as St. John of the Cross"** (:34); allowed vs disallowed phrasing lists (:37-48) — disallowed includes "This is the dark night.", "You are being purified.", "God is doing this to you." The operative distinction (:49-50): *"MAIA may offer a frame the member can try on; MAIA may not pronounce a frame onto the member."* **Discernment boundary declared load-bearing (:83-112)**: depression, trauma response, abuse, acute illness/grief, burnout, and suicidal ideation must not be framed as a dark night; crisis "always route to safety first; never frame". Five test signals for evaluation (:217-238).
- **WHAT IT DOES NOT SETTLE** — Activation (delegated to S-11, itself undecided). Whether a "canon" status on a frame whose wiring is explicitly unbuilt means the *stance* is binding on manual/evaluative use only (:241-250 says exactly that: "manual or evaluative use of both is appropriate, automatic injection is not").
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — ratified canon *as a stance document* (self-declared); **draft/spec as to wiring** (self-declared "the wiring is deliberately not yet built. This document is the spec.").
- **NOTES** — The clearest MAY-SAY / MAY-NOT-CONCLUDE separation in the slice. Its disallowed-phrasing list is a direct constraint on claims about a person.

### S-13 · `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md`
- **DATE / SHA** — 2026-07-09; ratification dates 2026-07-09/10 stated in the status block.
- **STATUS** — `**Status:** **FULLY RATIFIED (Kelly, 2026-07-10)**` (:3) — "No open questions remain at the grammar layer." Outstanding and outside its jurisdiction: the wiring crossing (Kelly-gated) and the interpretive-layer dominance rule. Deliverable declared **"Built-unwired"** (:4).
- **JURISDICTION** — the deterministic mapping from a natal chart to a Spiralogic profile. Explicitly declares itself the *grammar* layer, with interpretation out of scope.
- **WHAT IT SETTLES** — ⭐ **The only normative definition of Spiralogic located in this slice.** Quoted in full at :9: *"Spiralogic registration v1 defines the twelve zodiac signs as a deterministic 4×3 elemental grammar: Fire, Water, Earth, and Air each express through three phases corresponding to cardinal, fixed, and mutable modality. Aether is not treated as a thirteenth phase-bearing element, but as the integrative coherence field through which elemental registrations are witnessed, synthesized, and brought into relation. Planet, house, aspect, and dignity may modulate interpretation but do not alter the base elemental-phase registration."* The registration/modulation hierarchy is tabulated (:12-20); modulation layers are "out of scope for v1 registration — they belong to interpretation (rendering / MAIA), never to the base profile" (:21). Finding 6 ruled: vector/circle/spiral are **interpretive-layer display vocabulary** for phases 1/2/3; the grammar schema stays {1,2,3} (:3). :139 requires that "A portrait that contradicts its chart FAILS TO SHIP, not ships wrong."
- **WHAT IT DOES NOT SETTLE** — By its own scoping: everything interpretive. It does not settle what an element/phase *means about a person*, nor what MAIA may say about it. It does not settle wiring — `registerChart` is Built-unwired and the wiring crossing is a separate founder-gated act (:4, :131). ⚠ It defines Spiralogic **as registered from a birth chart**, which is narrower than every other source in this slice, all of which treat elements/phases as read from present behaviour or language.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT and ratified at the grammar layer.
- **BINDING FORCE** — constitutional at its own layer (a ratified "constitutional sentence" with a named ratifier and date) — jurisdiction strictly the registration grammar.

### S-14 · `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md`
- **DATE / SHA** — 2026-07-09; frozen subject `clean-main-no-secrets @ c7019ee95` (:4) — history-dependent, unverifiable here (E-1).
- **STATUS** — `**Status:** EXTRACTED FROM CODE (describes what the code does, not what it intends)` (:4).
- **JURISDICTION** — a falsifiability record of the then-existing registration code path.
- **WHAT IT SETTLES** — Nothing normative. It records inputs, schemas and mapping rules with file:line citations into `ephemerisCalculator.ts` and the Soul Portrait route, each "a testable proposition" (:19).
- **WHAT IT DOES NOT SETTLE** — Anything about the current tree: it pins a SHA this census cannot read. Do not treat its code citations as facts about `1a55543`.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — HISTORICAL ONLY relative to this SHA.
- **BINDING FORCE** — descriptive.
- **NOTES** — Exemplary in form: it declares in its own status line that it describes rather than governs.

### S-15 · `docs/canon/SPIRAL_CONTINUITY_ENGINE.md`
- **DATE / SHA** — articulated 2026-05-21 (:7).
- **STATUS** — `Canon. Articulated 2026-05-21.` (:7). Operationalizes `RIGHT_TO_REMAIN_UNPOSSESSED.md` and `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md`; declares it "Precedes any architectural spec or implementation slice of multi-spiral attention."
- **JURISDICTION** — developmental process tracking across multiple concurrent spirals; the boundary between accompanying a developmental process and adjudicating it.
- **WHAT IT SETTLES** — ⭐ The guardrail spine for the interpretive power of Spiralogic. **"Continuity infrastructure becomes possession architecture not at the moment of inference, but at the moment of elevation."** (:29). Two substrates, of which the observation substrate "forgets on purpose" (:90) — decay declared "a structural ethic", not an optimization. Voice-shaping eligibility is hard-enforced; unconfirmed recurrence observations are "session-local only; never persisted as voice-eligible" (:100). **Spiral State Objects are "held as hypotheses, never as conclusions" — "a working hypothesis offered for member ratification, not a verdict"** (:107-117). **§6 Refused inferences — edges the system commits to not drawing** (:119-130), including cross-domain developmental synthesis ("your work decisions reflect your grief pattern") and compensation/conflict/synchronization claims between spirals; and the decisive clause: *"These are not display restrictions. They are formation restrictions… A developmental assessment silently held but never spoken has already violated the canon."* (:130). Longitudinal reflection is invitation, never delivery (:132-143). Sealing is irreversible by the system (:154). No consensus inference from multi-agent convergence (:156-164). §11 gives falsifiable verification criteria including a decay check (:183-189).
- **WHAT IT DOES NOT SETTLE** — It does not define Spiralogic; it governs what may be done with it. It does not settle which surfaces are in scope, nor name the tables/objects it governs. §13 relates it to other canon but does not resolve precedence against S-16's domain-phase model.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — constitutional / ratified canon. This is the strongest binding document in the slice on *what may be concluded about a person*.
- **NOTES** — :130 ("formation restrictions", "silently held… has already violated the canon") is directly on point for X-19. Quoted, not adjudicated.

### S-16 · `docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — **no status line.** Filename asserts "CANONICAL"; it sits in `docs/` root, not `docs/canon/`. Attribution: "Based on Kelly Nezat's *Elemental Alchemy* … Chapter 9" (:5).
- **JURISDICTION** — the 12-phase grid itself: Fire/Water/Earth/Air × 1/2/3, arcs, and "MAIA Recognition" indicators.
- **WHAT IT SETTLES** — A complete phase grid with per-phase quality/process/experience and a **"MAIA Recognition"** column (:15-18, :23-27, :34-38, :43-47). Cardinal/Fixed/Mutable detection indicators keyed to member **language patterns** (:52-70: "'Something is starting' language patterns"). Regressive/progressive arc recognition (:71-80). Framework-arm activation per phase, naming clinical and therapeutic modalities: "Shadow work, trauma healing, therapeutic modalities" at Water 2 (:125); "Emotional intelligence, vulnerability work" at Water 1. Sacred geometry → UI mapping (:141-151). Closing: "MAIA operates as the **consciousness GPS**" that helps users Locate / Orient / Navigate / Integrate (:163-167).
- **WHAT IT DOES NOT SETTLE** — Its own authority. It carries no status, no date, no ratifier, no gate, and no refusal surface. It contains a TypeScript shape with **per-life-domain phase state** (`career / relationship / parenting / health / creativity / spirituality: PhaseState`), plus `dominantSpiral`, `crossSpiralTensions`, `emergentSynergies`, `overallTorusMovement` (:100-111) — none of which is marked as proposed, built, or authorized.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN. Not marked superseded; **directly contradicted on two points** by S-17 and S-15 (see Contradiction §).
- **BINDING FORCE** — **UNKNOWN**. Despite the filename, nothing in the document claims ratification. ⚠ This is the slice's principal instance of the rule *do not infer authority from symbolic sophistication*: it is the most elaborate elemental document located and the least governed.

### S-17 · `docs/architecture/MAIA_SPIRAL_ORIENTATION_CUT2.md`
- **DATE / SHA** — 2026-05-23 (:3).
- **STATUS** — `**Status**: Design complete → Implementation` (:4). `**Canon constraint**: Read-only. No new tables. No writes. No phase assertions. Evidence → questions, not conclusions.` (:6).
- **JURISDICTION** — a read-only computed orientation view over existing substrate, surfaced once per turn.
- **WHAT IT SETTLES** — Its negative scope, stated first (:10-16): **"Not per-domain phase assignment (canon-conflict trap — phase is a unitary Spiralogic signal, not decomposable by life domain)"**; not a psychometric profile; not cross-domain synthesis; not a developmental trajectory claim; not triggered synthesis. Corrects an earlier design assumption against actual schemas (:31-42) — `member_theme_signals.theme` carries Spiralogic *process themes* (field_awareness, pattern_recurrence, embodied_coherence, adaptive_unfolding, wise_acceptance, ripeness), explicitly "Not life domains". Output shape carries `suggestedQuestions` and an explicit `uncertainty: string[]` "what cannot be determined" (:70-71). Question generation is "programmatically from data — NOT from inference or synthesis" (:82).
- **WHAT IT DOES NOT SETTLE** — Whether it was implemented as designed (its status arrow points at implementation; the tree is not censused here). It does not settle the status of S-16, which it contradicts without naming it.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT on its face.
- **BINDING FORCE** — spec, carrying an explicitly stated canon constraint.

### S-18 · `docs/framework/facets/*.md` (15 files: {fire,water,earth,air,aether}-phase-{1,2,3})
- **DATE / SHA** — none in the file read. UNKNOWN.
- **STATUS** — no status line in `fire-phase-1.md`.
- **JURISDICTION** — per-facet descriptive content: element, phase, title, psychological function, core theme, primary developmental task, common subjective signs.
- **WHAT IT SETTLES** — That a complete 5×3 facet corpus exists with a consistent schema (`fire-phase-1.md:8-24`). ⚠ **It includes aether-phase-1/2/3, i.e. Aether as a phase-bearing element — which S-13's ratified constitutional sentence explicitly denies** ("Aether is not treated as a thirteenth phase-bearing element").
- **WHAT IT DOES NOT SETTLE** — Any authority, status, or use constraint. "Common subjective signs" lists (`:19-24`) are recognition material with no stated guardrail against being used as diagnostic indicators.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN.
- **BINDING FORCE** — descriptive.

### S-19 · `docs/canon/SOULLAB_VOICE_DOCTRINE_DAOIST.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — no status line; declares `> This is the operating system for all Oracle responses.` (:3).
- **JURISDICTION** — expression: how Oracle responses are phrased.
- **WHAT IT SETTLES** — Core principle: **"Do not explain the experience. Shape the conditions in which the user discovers it."** (:7-8). Five voice laws (:11-30): say less; image over abstraction; allow paradox; **no premature meaning ("avoid labeling too early; let the user arrive at recognition")**; (fifth law beyond the range read).
- **WHAT IT DOES NOT SETTLE** — Scope of "all Oracle responses" is undefined against the modes (Talk/Care/Note) and the plain-language override in S-1:90-93. No status, no ratifier.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN.
- **BINDING FORCE** — doctrine (self-titled), ratification UNKNOWN.
- **NOTES** — Law 4 "no premature meaning" is a MAY-SAY constraint that functions as a partial MAY-CONCLUDE constraint by suppressing the utterance, not the inference — the exact gap S-15:130 names as insufficient.

### S-20 · `docs/specs/SPIRALOGIC_JOURNEY_FRAMEWORK_2026-07-09.md`
- **DATE / SHA** — 2026-07-09 (:3).
- **STATUS** — `**Status:** FRAMEWORK CANDIDATE (doc only — authorizes nothing; each build step below is its own gate)` (:3).
- **JURISDICTION** — a proposed member pathway through a registered Spiralogic profile ("this can become our Gene Keys", founder directive quoted :5).
- **WHAT IT SETTLES** — Nothing; self-declared as authorizing nothing. It does state a discipline claim (:15): "the registration grammar is the spine that never moves; LLM variation is bounded and leashed; claim discipline governs every surface", and a sovereignty caveat (:19): "within sovereignty invariants (no dependency capture, no authority, upward-only meaning)".
- **WHAT IT DOES NOT SETTLE** — Every build step; each is its own gate by its own terms.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a candidate.
- **BINDING FORCE** — candidate (explicit self-declared non-authority).

### S-21 · `docs/MAIA_SPIRALOGIC_INTEGRATION_GUIDE.md`
- **DATE / SHA** — none. UNKNOWN.
- **STATUS** — no status line. Asserts `## System Architecture Complete ✅` and "now fully implemented and ready for integration" (:3-5).
- **JURISDICTION** — claims to describe a built 12-phase Spiralogic awareness system.
- **WHAT IT SETTLES** — ⛔ **Nothing.** It is an implementation *claim* with no date, no SHA, no gate, no ratifier. Per the lane rule, a completion claim in a document is evidence that the claim was written. It names a `/api/maia/spiralogic` endpoint, "SpiralogicCell detection with confidence scoring", alchemical stage mapping (Nigredo/Albedo/Rubedo), and "Framework Arms Selection (IPP, CBT, Jungian, Shamanic, Somatic, IFS, Mindfulness)" (:13-21).
- **WHAT IT DOES NOT SETTLE** — Whether any of it exists at `1a55543`; whether confidence-scored phase detection is authorized against S-15:119-130 and S-17:6.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN.
- **BINDING FORCE** — descriptive at best; **UNKNOWN** as to accuracy and authority. Flagged: it is the highest-confidence-sounding document in the slice and the least anchored.

### S-22 · `lib/maia/spiralogicReference.ts` — EXISTENCE + DECLARED VOCABULARY ONLY
- **DATE / SHA** — n/a.
- **STATUS** — code file, 8 lines. Recorded per instruction; no runtime assessment made, no call paths traced.
- **JURISDICTION** — n/a (a source file, not a governing document).
- **WHAT IT SETTLES** — Records that the file named as the Spiralogic reference in `CLAUDE.md` ("Consciousness framework: Spiralogic (see `/lib/maia/spiralogicReference.ts`)") exists and exports exactly **one** symbol: `SPIRALOGIC_REFERENCE`, a template-literal prose block. Declared vocabulary: five elements with one-word glosses — **Earth (grounding/embodiment), Water (feeling/psyche), Fire (activation/will), Air (perspective/mind), Aether (integration/wholeness)** — plus "dissolution → integration → embodiment, revisited in spirals". ⚠ **No phases. No 1/2/3. No cardinal/fixed/mutable. No hexagrams. No facets.** Its final line is a disambiguation instruction: *"IMPORTANT: In this context, 'Spiralogic' is NOT a Sonic game, programming term, or generic web concept."*
- **WHAT IT DOES NOT SETTLE** — Everything. It is a disambiguation string, not a framework definition.
- **BINDING FORCE** — descriptive (declared vocabulary only).
- **NOTES** — The vocabulary it declares is a strict subset of every documentary source in this slice, and its element glosses are not identical to S-2:53-59 or S-16. Recorded as a fact about the file's contents, not as a claim about what runs.

### S-23 · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` §Invariant 13 — CROSS-SLICE CITATION
- **DATE / SHA** — section undated within the read range; the invariants document belongs to another slice.
- **STATUS** — an Invariant in the ratified invariants document; Invariant 13 is titled "Claim-Type Floor (Consequential Prediction)".
- **JURISDICTION** — the claim type of any symbolic statement, across all traditions.
- **WHAT IT SETTLES** — **"The governor on a symbolic statement is its claim type, not its tradition."** (:243). Tier 1 (soft): any interpretive framework — "Mayan, Western, Wu Xing, BaZi, Da Yun, **Spiralogic**, archetypal, I Ching" — "may be offered only *as a lens*… Never as a statement about the member's reality ('this is what is happening to you'). The member remains the verifier. (Operationalized as the deployed `SYMBOLIC_LENS_BOUNDARY` wrapper; companion to the Symbolic Guidance Layer Doctrine.)" (:245). Tier 2 (hard): consequential forecasts are refused as knowledge regardless of source (:246). Boundary against over-firing (:250). Three non-conflatable layers — accuracy, governance, relevance (:252). **Gate (:254): "No symbolic system whose source material is predictive … may be wired into MAIA until Tier 2 is enforced for it."**
- **WHAT IT DOES NOT SETTLE** — It governs claim type only, explicitly not accuracy and not relevance (:252). It does not define Spiralogic.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — constitutional.
- **NOTES** — Cited here because it is the only located document that names Spiralogic *alongside* astrology/I Ching/Tarot and assigns all of them the same governor. Adjudication belongs to the invariants slice, not this one.

---

## Slice findings

### 1. Is there a single governing document that defines Spiralogic normatively?

**DISTRIBUTED — with one ratified normative definition of strictly narrower scope than the word's general use.**

The only located document that *defines* Spiralogic with a named ratifier and date is **S-13**, whose status line reads `**Status:** **FULLY RATIFIED (Kelly, 2026-07-10)** … No open questions remain at the grammar layer.` Its definition is the "constitutional sentence" quoted at S-13:9 — a deterministic 4×3 elemental grammar over the twelve zodiac signs, with Aether as integrative coherence field and *not* a phase-bearing element.

But that definition is scoped to **registration from a natal chart**, and its deliverable is declared `Built-unwired` (S-13:4). Every other source uses "Spiralogic" for something it does not cover:

- S-1:13 — "Spiralogic stays the native ontology"; S-1:32 — "Spiralogic names the developmental terrain" (no definition given; presupposed).
- S-5:41-47 — "Spiralogic reference (12-phase system)" as a Tier-2 corpus object; the document names a reference it does not identify.
- S-6:40 / S-7:13 — Spiralogic as **domain 6 of 12**, "elemental intelligence and developmental transformation", peer to Jungian and neuroscience.
- S-16 — a 12-phase grid read from present language patterns, with no status line at all.
- S-17:14 — "phase is a unitary Spiralogic signal"; S-17:39 — Spiralogic *process themes* (`field_awareness`, `ripeness`, …) which appear in no other source read.
- S-18 — 15 facet files including **aether-phase-1/2/3**, contradicting S-13's ratified sentence.
- S-22 — a five-element vocabulary with **no phases at all**, and it is the file `CLAUDE.md` points to.

**No document reconciles these.** Conclusion: one ratified definition exists at the registration layer; the *interpretive* and *conversational* meanings of Spiralogic are UNLOCATED as ratified canon and are carried by documents of UNKNOWN binding force.

### 2. Does any document settle whether Spiralogic is (a) vocabulary, (b) computed state, (c) a developmental claim about the member, or (d) all three?

**No single document settles it. The sources split, and the split is visible.**

- **(a) vocabulary** — S-22 is *only* vocabulary (five element glosses + a disambiguation warning); S-10's Rider 1 would make world vocabulary a rendering layer only (unratified); S-13:3's Finding 6 rules vector/circle/spiral to be "interpretive-layer display vocabulary".
- **(b) computed state** — S-13 makes it deterministically computed from a chart, and explicitly *not* from conversation. S-17 makes it a read-only computed *orientation view* over stored substrate, with `uncertainty` as a first-class output field and "**No phase assertions**" as a stated canon constraint (S-17:6). S-21 claims "SpiralogicCell detection with confidence scoring" from conversation, i.e. computed state of a third kind. S-2:134-150 computes a hexagram from a facet. These are three different computations bearing one name.
- **(c) a developmental claim about the member** — S-16 is the source that most nearly asserts this: a "MAIA Recognition" column per phase, cardinal/fixed/mutable detection from language patterns, `dominantSpiral` and `crossSpiralTensions` per life domain, and "MAIA operates as the consciousness GPS" (S-16:163). **S-15 and S-17 refuse this directly**: S-15:117 — "a working hypothesis offered for member ratification, not a verdict"; S-15:123 — cross-domain developmental synthesis "never auto-generated; only emerges through member naming"; S-17:14 — per-domain phase assignment is a "canon-conflict trap"; S-23:245 — Spiralogic is a Tier-1 lens, "never as a statement about the member's reality".
- **(d) all three** — asserted by no document; implied by the aggregate.

**Both sides, shown.** S-16 (no status, no date, filename says CANONICAL) describes Spiralogic as a detection-and-navigation system producing per-domain developmental state. S-15 (self-declared Canon, dated 2026-05-21) forbids exactly that shape, at formation not display: *"A developmental assessment silently held but never spoken has already violated the canon."* (S-15:130). This census does not rank them; it records that S-15 declares a status and S-16 does not.

### 3. The symbolic / oracle corpus documents: MAY SAY vs MAY KNOW vs MAY CONCLUDE

These are three distinct powers and the corpus documents divide unevenly across them.

**MAY KNOW (what enters MAIA's epistemic field) — well governed.**
S-3 (ingestion boundary: three knowledge states, inclusion/exclusion criteria, manual promotion gate), S-4 (five mandatory metadata fields; `safe_for_retrieval:false` ⇒ indexed but never retrieved; drift audit), S-5 (four weight tiers, 2.0/1.5/1.0/0.6, multiplicative re-rank), S-6/S-7 (which traditions are in the field at all). All three corpus documents are self-declared **Canon** and dated 2026-02-28. The governing rule of the set is S-3:177 — *"If corpus quality drops, reduce retrieval — do not expand it."*

**MAY SAY (phrasing and register) — governed by doctrine of UNKNOWN ratification.**
S-19 (five voice laws; "no premature meaning"), S-1 Layer 3 (Daoist expression refinement; plain-language override), S-2:96-104 (do not expose hexagram numbers; not fortune telling), S-12:37-50 (allowed vs disallowed phrasing, verbatim), S-6:160-167 (name the lineage, no aesthetic appropriation), S-9 (visual register). Of these only S-12 self-declares canon status.

**MAY CONCLUDE ABOUT A PERSON — the thinnest layer, and the only one with constitutional cover.**
Almost none of the corpus documents address it: S-3/S-4/S-5 govern *supply*, and are silent on inference. The documents that do govern conclusion are **S-15** (formation restrictions; refused inferences; hypotheses not verdicts), **S-12:83-112** (the discernment boundary — do not frame trauma, depression, abuse, illness, crisis as a dark night), **S-17:6** ("No phase assertions. Evidence → questions, not conclusions"), **S-6:163** ("No synthetic authority — MAIA is a mediator, not a scholar or teacher"), and **S-23** (claim-type floor, Tier 1 / Tier 2).

⚠ **The gap, stated plainly:** a well-governed corpus (MAY KNOW) plus a well-governed voice (MAY SAY) does not produce a governed conclusion. S-2 is the document in this slice that crosses from knowing into concluding — *"Use the I Ching to know what is happening"* (S-2:3) and *"This is: 'Here is how reality is moving right now.'"* (S-2:104) — and it is the document with **no status line, no date, and no refusal surface**.

### 4. Which documents could produce a claim about a person, and what guardrails do they state? (X-19 input — QUOTED, NOT ADJUDICATED)

| Source | Could produce a claim about a person | Guardrail it states |
|---|---|---|
| S-2 I Ching engine | Yes — facet → hexagram → "what is happening" | Only: don't show hexagram numbers, don't over-explain, not fortune telling (:98-104). No consent, no hypothesis framing, no refusal path. |
| S-16 12-phase grid | Yes — per-domain phase, dominant spiral, cross-spiral tensions, arc | **None stated.** No status, no limits section. |
| S-21 integration guide | Yes — "SpiralogicCell detection with confidence scoring" | **None stated.** |
| S-18 facets | Yes — "common subjective signs" read as indicators | **None stated.** |
| S-6 Knowledge Field | Yes — per-member domain affinity signals (:171-181) | "No forced profiling: signals are passive, never quiz-based" (:177); "track movement, not position" (:179); non-ambient (:167); no synthetic authority (:163). ⚠ No consent gate, retention limit or member visibility stated for the stored signal. |
| S-12 John of the Cross | Yes — "you are in a dark night" | Strongest in slice: disallowed-phrasing list (:43-48); discernment boundary declared load-bearing (:83-112); "always route to safety first; never frame" (:104). |
| S-11 use-frame activation | Yes — frame injection shaping interpretation | Seven boundaries (:144-180), incl. member language as boost **not** trigger, single-frame ceiling, per-frame kill switch off by default. ⚠ All five adoption decisions are open (:286-295). |
| S-1 symbolic guidance | Yes — facet-conditioned symbolic colouring | Optional/scoped/reversible; confidence threshold; plain-language override (:83-93); "never sound like fate declaration, hidden certainty, mystical domination, or 'truth from above'" (:42). |
| S-17 spiral orientation | Bounded — evidence → questions | "Read-only. No new tables. No writes. **No phase assertions.** Evidence → questions, not conclusions." (:6); `uncertainty[]` as output (:71). |
| S-15 continuity engine | Governs the whole class | Hypotheses not verdicts (:117); refused inferences list (:119-130); **"These are not display restrictions. They are formation restrictions… A developmental assessment silently held but never spoken has already violated the canon."** (:130); invitation not delivery (:136); no consensus inference (:164). |
| S-23 Invariant 13 | Governs the whole class | "The governor on a symbolic statement is its claim type, not its tradition" (:243); Tier 1 lens-only, "the member remains the verifier" (:245); Tier 2 hard refusal (:246); wiring gate (:254). |

X-19 relevance is recorded, not ruled: **S-15:130** and **S-23:245** are the two located sentences that speak to inference silently becoming relational authority. Both are quoted above in full context. No adjudication is made here.

### 5. Unlocated governance

Named symbolic systems for which **no governing document was located in this slice**:

- **Tarot** — named in S-23:246, `TRANSPARENT_ENCHANTMENT.md:133` and `SACREDNESS_AS_ARCHITECTURAL_ORIENTATION.md:157` as a symbolic surface to be governed; `find docs -iname "*tarot*"` returns nothing. Governance UNLOCATED.
- **Astrology as an interpretive surface** — `docs/design/contracts/astrology.md` and `docs/architecture/audits/ASTROLOGY_MEMBER_ENTRY_STATE_2026-08-16.md` exist (not read in this slice); `docs/Community-Commons/Astrology-Systems/` holds member-facing Chinese and Mayan manuals. No canon-level document governing astrological interpretation was located. S-13 governs only the deterministic sign→element/phase registration.
- **Alchemical stage vocabulary (Nigredo / Albedo / Rubedo)** — asserted as implemented in S-21:14. No governing document located.
- **"Framework Arms" (IPP, CBT, Jungian, Shamanic, Somatic, IFS, Mindfulness)** — selected *per phase* in S-16:117-137 and S-21:15. These are clinical and therapeutic modality names being selected by a computed phase. **No governing document for that selection was located in this slice.** Flagged as the highest-consequence unlocated governance found.
- **The `facetToHexagram` seed map's provenance** (S-2:134-150) — who authored it, against what source, and by what authority: UNKNOWN.
- **Spiralogic *process themes*** (`field_awareness`, `pattern_recurrence`, `embodied_coherence`, `adaptive_unfolding`, `wise_acceptance`, `ripeness` — S-17:39) — appear in no other source read and in no framework document located. Vocabulary present in a schema, governance UNLOCATED.
- **Aether's status** — S-13's ratified sentence says Aether is not phase-bearing; S-18 ships `aether-phase-1/2/3`; S-2:147-149 maps `aether_1/2/3` to hexagrams; S-16 omits Aether from the 12-phase grid but assigns it the Spiral in sacred geometry (S-16:148). No document reconciles this.
- **`SYMBOLIC_LENS_BOUNDARY`** — S-23:245 calls it "the deployed … wrapper". No specification document for it was located under `docs/canon/`; it is referenced in `docs/specs/MAYAN_PROVENANCE_AWARE_ARCHITECTURE_SPEC_2026-06-05.md` and `docs/reviews/HOUSE_00_STANDING_RECORD.md`. Its own governing document is UNLOCATED in this slice.

### Contradiction between sources

1. **Per-domain phase.** S-16:100-111 defines phase state per life domain (career/relationship/parenting/health/creativity/spirituality) plus `crossSpiralTensions`. S-17:14 names exactly this a "canon-conflict trap — phase is a unitary Spiralogic signal, not decomposable by life domain". S-15:123 refuses cross-domain developmental synthesis. Unreconciled; S-16 carries no status, S-17 and S-15 do.
2. **Aether.** S-13:9 (ratified): Aether is *not* a phase-bearing element. S-18: `aether-phase-{1,2,3}.md` exist. S-2:147-149 maps `aether_1/2/3` to hexagrams. Unreconciled.
3. **Source of the signal.** S-13: Spiralogic is registered from a birth chart, deterministically, no LLM. S-16:52-70 / S-21: phase is detected from conversational language with confidence scoring. Both call the output a Spiralogic phase. Unreconciled.
4. **Spiralogic's rank.** S-1:13 "native ontology" vs S-6:40 one of twelve knowledge domains vs S-5:41 one Tier-2 corpus folder among others. Not contradictory on their face, but no document states the precedence.
5. **Element→colour/geometry.** S-16:141-151 asserts per-element sacred geometry and that "each phase generates specific geometric UI elements and color harmonies". S-9, the self-declared canonical visual system, contains no element mapping and prohibits "random per-page accent colors" (:235). Unreconciled.
6. **Hexagram visibility.** S-2:99 "Do NOT expose hexagram numbers by default"; S-1:81 contemplates an "optional user-visible 'deeper reading' mode" at Phase 4. Sequenced rather than contradictory, but no gate is named for the transition.

### Documents that declare their own non-authority

- **S-10** — `STATUS: DRAFT — CANDIDATE CANON. Not ratified… may not be cited as a gate.` (:4-6).
- **S-20** — `FRAMEWORK CANDIDATE (doc only — authorizes nothing; each build step below is its own gate)` (:3).
- **S-8** — `Draft specification. Not implemented.` (:3).
- **S-11** — `spec / decision document. **No code yet.**` (:3) + five open decisions (:286-295).
- **S-12** — status "canon" for stance, but `Wiring (implementation note — not yet built)` … "automatic injection is not [appropriate]" (:241-250).
- **S-14** — `EXTRACTED FROM CODE (describes what the code does, not what it intends)` (:4).
- **S-13** — ratified *at the grammar layer only*; deliverable declared `Built-unwired`; wiring crossing explicitly outside its jurisdiction (:3-4).
- **S-6** — declares a Phase, not a ratification; flag `knowledgeFieldLayer` default **off** (:191).

⛔ Documents that declare **no** status and are therefore of UNKNOWN authority despite substantial normative-sounding content: **S-2, S-7, S-16, S-18, S-19, S-21**.

### Open questions for P1-02

1. Which document is the "Spiralogic reference (12-phase system)" that S-5:42 assigns Tier 2 weight? S-16, S-18, S-22, or none of them?
2. What is the binding force of S-16 (`CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md`)? Its filename claims canon; its content carries none of the markers. Founder question.
3. Is S-2 (`ICHING_STRUCTURAL_ENGINE.md`) a governing document or a design sketch? It is the only document in the slice that authorizes a conclusion about a member's state, and it states no status.
4. Does S-13's ratified constitutional sentence bind the *conversational* use of the words "element" and "phase", or only chart registration? Aether's status turns on this.
5. What governs per-phase selection of therapeutic modalities (S-16:117-137, S-21:15)? No document located.
6. Was the recommendation in S-11 (Option 1 + seven boundaries) ever ruled? Its own §Decision needed says no.
7. Does S-6:171-181's per-member domain affinity signal require a consent gate under the memory-consent canon? Not stated in-document.
8. S-9's "field" and S-6's "field" and Spiralogic's "field" are three different referents in three canon documents. Is a terminology ruling owed?
