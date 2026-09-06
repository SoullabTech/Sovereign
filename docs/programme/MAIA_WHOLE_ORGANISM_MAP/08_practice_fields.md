# Practice Fields · Practitioner Studio — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

"Practice" names four unrelated substrates. Only one (PF-1) is a *field*; none is a *practice session with feedback* in the E8 sense.

| # | Substrate | Paths | What a "session" records | State | Cat |
|---|---|---|---|---|---|
| PF-1 | **Practice Field** — practitioner-authored context that composes into MAIA rooms (Now What?, Vision Studio) | migration `20260701000001_practice_fields.sql:1-8, 22-34` (Layer 1 identity · Layer 2 relationship: `how_we_work_together`, `how_maia_supports`, `professional_practice` · Layer 3 `resources` · `active_field_content` · status); `lib/practiceField/practiceFieldService.ts:293-340` (`formatFieldContextForRoom`); guidance narrow-only `lib/practiceField/fieldGuidance.ts:1-25` + migration `20260708000001`; composition boundary `lib/practiceField/compositionBoundary.ts:1-30` (five NW-A02 repairs); containment `20260809000001:1-8` ("Readiness is modeled. Containment is not."); identity ratification `20260826000001:1-8`; editor `components/maia/practice-field/PracticeFieldEditor.tsx`; `MirrorFieldAssist.tsx:114-159` | **No session object.** Sessions occur in the rooms it composes into (07). It records the practitioner's words, revisions, containment events. | live | 6 |
| PF-2 | **Program platform** — catalog, focal points, lessons, member position | `lib/practiceField/{programPositionService,programAuthoringService}.ts:1-30`; migrations `20260712000001` (`field_programs`, `field_program_positions`), `20260714000001:76-90` (`field_program_lessons`: `purpose`, `material_ids`, `practice`, `reflection_prompt`, `authored_by`) | Member declares "this is where I am" (`member_confirmed | member_stated | practitioner_seeded`); departure hard-deletes; **no practitioner read of positions** | live | 6 |
| PF-3 | **Practice Sessions / mentor loop** (`lib/practice`) — practitioner records *their own client sessions*; MAIA as "developmental mentor" | `lib/practice/PracticeStore.ts:1-9`; `lib/practice/prompts/developmentalPrompts.ts:1-20` ("'I noticed...' not 'You should...'"); migration `20260110000001_practice_sessions.sql:7-42, 60-75, 111-135` (`practice_sessions`, `practice_transcript_segments` (PHI-encrypted), `session_insights` types `modality_used / client_response / session_arc / energy_shift / modality_opportunity / blind_spot …`, `practitioner_growth` types `pattern_identified / strength_developing / edge_emerging / modality_expanding / style_evolution / client_type_affinity` with `confidence`, `acknowledged`, `practitioner_notes`); routes `app/api/practice/**`; UI `components/supervision/PracticePanel.tsx` ← `app/supervision/page.tsx` | recording → transcript → MAIA insights → cross-session growth observations | built; UI reachable only via `/supervision` (no House door found; `app/maia/page.tsx:1076` names a "Mentor stance" only); `practitioner_growth` has no writer outside its own route (grep) | 3 / 4 |
| PF-4 | **Practitioner Studio protocols** — named clinical pathways with intervention sequences, occupancy score (1–5), **"Concrete success metrics by timeframe"** | `lib/studio/practitioner/protocols.ts:1-14, 68-75, 92-93, 195-235` (e.g. "Week 1–2: Client can name the somatic precursor signal … Occupancy score below 4 at least once"); `promptSets.ts:1-13` (client inquiry sets, "Describe what you actually noticed, not what you think about it"); `interventionTemplates.ts`; `components/studio/practitioner/{ProtocolSelector,OccupancyRatingWidget:1-12,ClientInquiryPanel,FieldSignalsPanel}.tsx` | Practitioner rates relational occupancy post-session (3 clicks); client answers inquiry sets before council synthesis | built into Studio; reachability/use UNKNOWN | 3 / 6 |
| — | **Masters fields** (`/fields/[field]/train` "The master trains their Virtual Self") | `app/fields/[field]/train/page.tsx:5-12`; `lib/masters/registry.ts:1-15` (Jondi, Kelly, Nathan) | practitioner trains a persona, not a member practice | out of this page's scope (Field Intelligence / Soul Corpus pages) | — |
| — | `elemental_practice_completions` ("Track when users complete practices with duration and impact") | migration `20260110000004:1-2` | no app/lib writer found | dormant | 4 |

**Canon posture (D):** `docs/ACCOMPANIMENT_MODEL.md:153-185` — "No Courses … No Credentials … No Progress Tracking (in the LMS sense) … No completion percentages … No streak mechanics … No Growth Mechanics." `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` §"The design test": "Practice, and the return to new encounters, belong to the developmental process … a practice generates new lived experience, which re-enters at Encounter and must be re-authored upward."

**Dated records (E):** `docs/reviews/PRACTICE_FIELD_SCOPE_MISMATCH_FINDING_2026-08-03.md:18-56` (corpus composed globally per slug; `about_practice` inaccurate); `docs/reviews/PRACTITIONER_FIELD_ADR_GAP_ANALYSIS_2026-08-03.md:90-96, 130-140` ("ratification ≠ rights … one axis is a misattribution engine"; custody right, provenance one axis short); `docs/design/now-what/reconciliation/NW_A01_PRACTICE_FIELD_PROMPT_AUTHORITY_AUDIT.md:50-110` (six channels, four ungated → NW-A02 repairs, `compositionBoundary.ts:9-21`). No production witness of any practice *session* found.

## 1 · The founder's question for this subsystem

**Can we deliberately train capacities that transfer into life?**

**Answer (READ, class E; no class C):** **Not on any surface as built.** There is no structured practice-with-feedback loop for a *member*. What exists:

- PF-1/PF-2 give a practitioner a way to author *context* and a *curriculum* and let a member declare *where they stand*; the member's practice happens in the Now What? room (07), whose lived-return loop explicitly refuses to treat what happened as outcome or progress (`app/api/now-what/interview/route.ts:143-146`; `lib/nowWhat/livedRelation.ts:14-24`). That refusal is correct under AP16/AP17 and simultaneously means **no capacity is named, no transfer distance is named, and no observation beyond self-report exists**.
- PF-3 is the only substrate that names capacities and observes beyond self-report — but the *learner is the practitioner*, the observation is MAIA's reading of a transcript (`session_insights`), and growth rows carry `confidence` + `acknowledged` (`20260110000001:111-135`) — a machine-authored developmental record about a person (AP17 exposure) with no live writer.
- PF-4 protocols name **client** markers by week ("Client can name the somatic precursor signal", `protocols.ts:207-213`) and an occupancy score — the closest thing in the codebase to a capacity with a timeframe; observability is *practitioner rating* (informant evidence), not self-report. It is clinical-pathway scaffolding for the practitioner, not a member-facing practice.
- The one "practice" gesture a member makes — "One practice. One experiment. One commitment." (`components/now-what/NowWhatRoom.tsx:1439-1440`) — is kept as a thread; its return is received "before analysis"; there is no comparison, no expectancy measure, no near/far/life distinction.

**Against E8 qualifying-design requirements (master-run §7 row E8):**

| Requirement | Present today? | Where / what is missing |
|---|---|---|
| capacity named (perceive · differentiate · tolerate · communicate · choose · repair · act · participate) | NO for members; partial for practitioners (`practitioner_growth.growth_type`) and clients-of-protocols (`successMetrics.markers`) | no member-facing surface names a capacity; threads carry `kind ∈ theme/question/practice/open` (evidence type, not capacity) |
| transfer-from named | NO | the lived return relates a kept thread to a prior act (`responds_to_thread_id`) — this is the *only* from→to link, and it is deliberately not an outcome |
| transfer-to named (near / far / life) | NO | — |
| observability matched to capacity | NO for members (self-report only: the return message); PF-4 has practitioner rating; PF-3 has transcript coding by MAIA (machine, not blind human) | no informant, EMA, coded-interaction or follow-up instrument |
| active or non-use comparison | NO | no cohort, arm, or comparison construct anywhere |
| expectancy measured | NO | — |
| response shift modeled | NO | — |
| Self and World capacity reported separately | NO | measurement vocabulary only (`MEASUREMENT_VOCABULARY_v0.1.md` Success row) |
| engagement reported as diagnostic only | Consistent by absence: no engagement metric exists on these surfaces (`app/maia/field-lab/page.tsx:9-19` refuses; Accompaniment "No Progress Tracking") | — |

**Could an experiment be designed on this surface today?** A *qualifying* E8 design could be **written** using Now What? as the practice surface and the lived-return as the transfer-from record, but it could not be **run** without: (a) a consent act (Phase 4, unauthorized); (b) a witness instrument for transfer-to (none exists; World capacity "has no instrument anywhere"); (c) a comparison construct; (d) an expectancy measure. Everything the design needs beyond the practice surface is missing. The return-after-absence witness question is one instrument inside such a design, not the design (E8 row, verbatim).

## 2 · The nine questions

| # | Answer | Class · status |
|---|---|---|
| 1 | Capacity and transfer (v0.2 §1.8). Hierarchy: PF-1/2 sit at **Relationship** (practitioner ↔ member medium: "Practice Fields — specialized ecologies", Direction of Authority §Ecology); PF-3/4 sit at the practitioner's **Self/World** (their competence with clients). | D · READ |
| 2 | Supports P13 (practitioner as accountable human party; MAIA "never speak as them", `practiceFieldService.ts:314-320`); P4′ 9 (guidance may narrow, never widen, `fieldGuidance.ts:4-7`); P8 (unratified identity text does not govern, `compositionBoundary.ts:19-21`); AP17 refused at PF-2 ("No 'next level', no advancement language, ever", `programPositionService.ts:20-21`). Strains: P6 (instructed familiarity, `:322-332`); AP17 exposure at PF-3 `practitioner_growth` (machine-authored "pattern_identified / style_evolution" about a person); P10 (nothing measures what becomes possible). | E · READ |
| 3 | **Self capacity (member):** preserved — no typing, no progress (07). **Self capacity (practitioner):** PF-3 hands the practitioner a MAIA reading of their own development with a confidence number; `acknowledged` + `practitioner_notes` give a reply channel (R12 ASK, partly). **World capacity:** the whole subsystem's purpose, unmeasured; PF-4 markers are the only World-facing capacity language and they are for clients under a practitioner. | E/D · READ |
| 4 | P4′: **1** partial (field context header discloses MAIA is "inside this practitioner's field"; the member is not told which channels compose). **2** unknowable from inside (no signal found). **3** NOT FOUND. **4** absent. **5** practitioner meta-preferences exist as `maia_guidance` (narrow-only) — a *practitioner*-authored source, not member-authored. **6** absent. **7** "the deeper work points back to the practitioner" (`:320`) — dispensability toward a human, designed; unmeasured. **8** absent on this layer (delegated to the room). **9** PF-1 explicitly forbids classifying the member "through the practitioner's framework or any stage model" (`:318-319`). | E · READ |
| 5 | PF-1: practitioner text, revisions (`20260710000002`), containment events, ratification timestamps. PF-2: catalog, lessons, member position (footing `confirmed-current` vs `assumed-from-last-known`). PF-3: encrypted transcript segments, MAIA insights per session, growth observations with `session_refs`, `first_noticed_at`, `confidence`. PF-4: occupancy ratings, inquiry responses (feed council synthesis). | E · READ |
| 6 | Authority × Time honoured at PF-1/2 (ratification gates composition; position footing distinguishes assumed from confirmed; lessons carry `authored_by`). **Missing axis:** rights/authorship — "ratification ≠ rights" (ADR gap §4). PF-3 growth rows are *derived with a verbatim beneath* (`session_refs` to encrypted transcripts) — structurally the best provenance in the subsystem — but derived by MAIA about a person with a confidence figure (Inv 16 / AP17 tension if ever read back as identity). | E · READ |
| 7 | PF-1 composition is designed for useful difference from the practitioner's frame (hard lines). PF-3 insight type `blind_spot` ("Did you notice...?") is difference-producing by design; `client_type_affinity` is identity-drift-shaped. AP14/AP15: no agreement mechanism found. | E/D · READ |
| 8 | Not Elementally differentiated; PF-3 tags modalities (`somatic / parts_work / breathwork / cognitive`), a practitioner-craft taxonomy, not Elements. H1 descriptive only. | D · READ |
| 9 | **None of class C** for any practice session. PF-1 has an instrumental render record via 07; PF-3/PF-4 have no witness record found (`docs/specs/PRACTITIONER_WISDOM_FIELD_ARCHITECTURE_ASSESSMENT_v0.md` is an assessment, not a witness). | — · UNKNOWN (no witness protocol; PF-3 reachability unverified) |

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Result | Path / reason |
|---|---|---|
| agreement drift | NOT FOUND | `developmentalPrompts.ts:15-20` "NOT to evaluate or diagnose"; PF-1 hard lines |
| validation loops | UNKNOWN | no transcripts of MAIA-as-mentor exist in repo |
| memory-amplified sycophancy | UNKNOWN | PF-3 cross-session growth feeds nothing found (no live writer/reader beyond its route) |
| hidden shaping objectives | **FOUND (governed, partially)** | six practitioner-authored channels reach MAIA's prompt; four were ungated until NW-A02 (`NW_A01:85-90`); now: containment, membership check, narrow-only test, ratification (`compositionBoundary.ts:9-21`). Residual: `resources` and lesson `practice` text compose with widening check only |
| approval optimization | NOT FOUND | — |
| emotional capture | NOT FOUND | Accompaniment canon `:153-185`; PF-2 "no advancement language" |
| excessive reassurance | UNKNOWN | — |
| historical pattern becoming identity | **FOUND (substrate, dormant)** | `practitioner_growth.growth_type` incl. `pattern_identified`, `style_evolution`, `client_type_affinity` with `confidence` (`20260110000001:114-127`) |
| "you said before" becoming leverage | NOT FOUND | PF-4 inquiry copy "There are no right answers" (`promptSets.ts:10-12`) |
| MAIA becoming more central rather than returning capacity outward | NOT FOUND in design | PF-1 header: "the deeper work points back to the practitioner" (`practiceFieldService.ts:320`); PF-3 mentors a human who works with humans |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **Narrow-only authority for practitioner guidance** — save-time reject + compose-time neutralize (`fieldGuidance.ts:14-24`); one widening checker for every practitioner free-text surface (`programAuthoringService.ts:22-24`).
- **Composition boundary as a legible object** — containment composes nothing; membership required; identity requires ratification; prose instruction channel takes the same test (`compositionBoundary.ts:9-21`; `practiceFieldService.ts:296-311`).
- **Constitutional floor first, standing disciplines last, guidance strictly between** (`fieldGuidance.ts:19-23`).
- **Position authority split** — practitioner authors curriculum, member authors only where they stand; departure = hard delete; "Orientation, never routing"; no practitioner read of positions (`programPositionService.ts:12-24`) — P13 + Direction of Authority + anti-re-identification.
- **"Readiness is modeled. Containment is not."** — an explicit governance act separate from computed readiness (`20260809000001:3-8`).
- **Accompaniment canon refuses LMS mechanics** (`ACCOMPANIMENT_MODEL.md:153-185`) — brain-training rule's structural ally: nothing here can produce a "gain on the practiced task" score to be mistaken for a life gain.
- **PF-3 provenance shape** — growth observations reference the sessions that informed them (`session_refs`), timestamp first noticing, and give the practitioner a reply (`practitioner_notes`) — the R12 shape (derived with verbatim beneath; ASK channel), even though the substrate is dormant.
- **PF-4 observability beyond self-report** — occupancy rated by the practitioner post-session (`OccupancyRatingWidget.tsx:4-12`); client inquiry asks for phenomenological data ("what you actually noticed", `promptSets.ts:11-12`).

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Contradiction | Path | Principle / AP |
|---|---|---|
| Instructed familiarity: "you KNOW this practice … Never claim not to know the practitioner, this practice, or its discipline" | `practiceFieldService.ts:322-332` | P6 (trust warranted by reality); P12 (what don't I know); AP5-adjacent (claiming knowledge by instruction rather than possession) |
| Ratification is an editorial trust gate, not a rights gate; MAIA can speak "in the practitioner's name" from material whose authorship is unmodelled | `PRACTITIONER_FIELD_ADR_GAP_ANALYSIS_2026-08-03.md:90-96, 130-140`; `library_sources.author` free text | P13 (accountable party) — accountability for *whose* words MAIA speaks is unassignable; naming ruling §4 |
| Machine-authored developmental identity rows about a practitioner (`client_type_affinity`, `style_evolution`) with a confidence number | `20260110000001:111-135`; `lib/practice/InsightGenerator.ts` | AP17; Invariant 16 (system-inferred recognition) — **dormant**, no live writer found; contradiction is in the schema's intent |
| PF-4 protocol "success metrics by timeframe" for clients, authored by Soullab, scored by the practitioner | `protocols.ts:10, 205-235` | brain-training rule (markers are practiced-task proxies with no transfer axis); Inv 14 (Soullab vocabulary for a client's change) — mitigated: practitioner-facing, optional overlay (`:13-14`) |
| No surface names a member capacity, transfer distance, or comparison; the practice loop cannot answer P10 | whole subsystem; `MEASUREMENT_VOCABULARY_v0.1.md` Success row | P10 · P5 — a **gap**, not a violation; recorded because the founder's question is answered "no" by it |
| Composed corpus was global per slug, not space-scoped (dated finding); NW-A02 added membership check — whether snapshots now carry corpus is UNKNOWN | `PRACTICE_FIELD_SCOPE_MISMATCH_FINDING:18-31`; `compositionBoundary.ts:12-14` | Co-Lab release-gate principle ("scoped correctly in data") — gate does not cover `practice_fields` / snapshots (`COLAB_RELEASE_GATE.md` surfaces table) |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Reason | Instrument |
|---|---|---|
| Whether any member has completed a practice → return → keep cycle | no DB access; no walk record | read-only count of threads with `responds_to_thread_id` (07 §6) |
| Whether PF-3 (`/supervision`) is reachable or has ever recorded a session | no House door found; no record | `SELECT count(*) FROM practice_sessions` (read-only); nav walk |
| Whether PF-4 protocols/occupancy ratings are in use | no record | read-only count of occupancy ratings / protocol selections |
| What a practitioner's lesson `reflection_prompt` texts actually ask (do any ask about life outcome?) | column exists (`20260714000001:89`); content not readable here | read-only dump of `field_program_lessons.reflection_prompt` for the `now-what` field |
| Whether `practice_field_snapshots` now carry `active_field_content` | dated finding; no later record | schema read `\d practice_field_snapshots` |
| Whether the field-context header changes how MAIA answers "what don't you know" questions | no probe | offline consented probe (E4 form) |

## 7 · Smallest evidence-producing intervention per gap
| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| No member-facing practice-with-feedback loop that names capacity / transfer / comparison | brain-training rule · P5 · P10 | 5 | 5 | 2 | observed (absence at every path in §0) | high | **Author the E8 qualifying design on paper** using Now What? as practice surface, lived-return as transfer-from, a consented witness as transfer-to; run nothing; the design's missing-instrument list becomes the Phase 4 consent-design input | E8 |
| Instructed familiarity / P6 | P6 · P12 | 3 | 3 | 2 | observed (`practiceFieldService.ts:322-332`) | high | Offline consented probe: three questions the material does not cover; log fill vs. point-to-practitioner | E4 |
| Ratification ≠ rights (misattribution engine when MAIA speaks in a practitioner's name) | P13 · naming ruling §4 | 3 | 4 | 2 | observed (ADR gap §4) | high | Read-only inventory of `library_sources` rows composing for `now-what` with `author` values; no schema change | — (governance; feeds COACHING-TEMPLATE-EXTRACTION-01 gate 2) |
| Dormant machine-authored growth/identity substrate (PF-3) | AP17 · Inv 16 | 2 | 3 | 1 | observed (schema); unknown (rows) | medium | Read-only row count; if 0, record as Cat 4 candidate for the dormant-service cleanup list (no action) | E7 (if rows exist, they are a detect→ask→record corpus) |
| PF-4 success markers = practiced-task proxies without transfer axis | brain-training rule | 2 | 2 | 1 | observed (`protocols.ts:205-235`) | high | Read-only: list every marker and tag it near/far/life by the E8 vocabulary; no code | E8 (marker taxonomy input) |
| Practice-field scoping not covered by the Co-Lab gate | release-gate principle | 2 | 3 | 1 | inferred (gate surfaces table vs. finding) | medium | Read-only schema check of snapshots; note whether a gate row is warranted (adding one is a change — not proposed here) | — |
| Reachability/use of PF-3, PF-4 unknown | claim discipline | 1 | 2 | 1 | unknown | high (that it is unknown) | three read-only counts | — |

## 8 · Provenance — files read, records cited, commit

Commit at census: `75303b3d`. Read: `lib/practiceField/{practiceFieldService:1-40,289-340, fieldGuidance:1-70, compositionBoundary:1-30, programPositionService:1-35, programAuthoringService:1-30}.ts`; `lib/practice/{PracticeStore:1-30, InsightGenerator (header), prompts/developmentalPrompts:1-25}.ts`; `app/api/practice/growth/route.ts:1-25`; `components/supervision/PracticePanel.tsx` (mount grep) ← `app/supervision/page.tsx`; `lib/studio/practitioner/{protocols:1-20,41-75,92-93,195-235, promptSets:1-25}.ts`; `components/studio/practitioner/OccupancyRatingWidget.tsx:1-12`; `components/maia/practice-field/{PracticeFieldEditor,MirrorFieldAssist}.tsx` (copy grep); `app/fields/[field]/{train,with-me,begin,author}/page.tsx` + `lib/masters/registry.ts:1-15` (scoped out); `app/maia/page.tsx:1076,1333` (grep); migrations `20260701000001:1-8,22-72`, `20260708000001:1-8`, `20260712000001:1-8,35,59`, `20260714000001:1-8,76-90`, `20260809000001:1-8,109`, `20260826000001:1-8`, `20260110000001:1-6,7-48,60-75,111-135`, `20260110000004:1-2`. Records: `docs/reviews/PRACTICE_FIELD_SCOPE_MISMATCH_FINDING_2026-08-03.md:1-9,18-56`; `docs/reviews/PRACTITIONER_FIELD_ADR_GAP_ANALYSIS_2026-08-03.md:90-96,130-150`; `docs/design/now-what/reconciliation/NW_A01_PRACTICE_FIELD_PROMPT_AUTHORITY_AUDIT.md:48-110`; `docs/ACCOMPANIMENT_MODEL.md:153-185`; `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` §Ecology, §Design test; `docs/ops/COLAB_RELEASE_GATE.md` surfaces table; `docs/research/human-experience/measurements/MEASUREMENT_VOCABULARY_v0.1.md` Success row; master-run §7 E8 row. Note: `docs/specs/PRACTICE_FIELD_SPEC.md`, cited by `practiceFieldService.ts:7` and migration `20260701000001:3`, **does not exist on this branch** (find → none). WALKED: none in this census.
