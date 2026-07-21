# Air Realm Development — Repository & Capability Discovery (Prompt 1) — 2026-07-21

**Status**: Discovery only. Authorizes nothing. Prompt 1 of the Air Realm Development sequence
(`docs/plans/AIR_REALM_DEVELOPMENT_PROMPT_SEQUENCE_2026-07-21.md`), executed after Kelly's approval
of Prompt 0 (`docs/architecture/AIR_REALM_DISCOVERY_2026-07-21.md`) with three amendments:
Coordination as fifth domain · Air shadow investigation · collective meaning-making added to
discovery targets.

**Standing gates observed**: S5 provenance phase (papers before code), Spiralogic Profile S5 pause,
freeze doctrine, Sovereignty Invariants, Inv 16, AIN collective-intelligence boundaries
(canon-candidate), Gold Reflection collective-boundary rulings.

**Method**: five parallel repository sweeps — memory/profile substrate · studios & role pathways ·
prior design docs · Air element & communication capabilities · collective/coordination surfaces.
This document is the full inventory; Prompt 0 carries the finding-level synthesis and should be read
first.

---

## 1. Existing Capabilities

Organized by the five domains plus the personal→collective layer distinction. Status vocabulary:
LIVE (production callers) · PARTIAL (wired, not surfacing / experimental tier) · DORMANT (code, no
callers) · DOC-ONLY (design exists, no code) · SUSPENDED (live but constitutionally halted).

### 1.1 Naming & keeping (personal Air — the strongest live cluster)

| Capability | Where | Status | Data | Voice | Consent |
|---|---|---|---|---|---|
| Keep gesture / Psyche layer | `lib/psyche/conversational-keep.ts`, `lib/psyche/portfolio.ts`, `app/api/psyche/*` | LIVE | `member_memory_atoms` | MAIA, single voice; offers doorway vs executes filing | Keeping IS the consent act; `crossing_allowed` CHECK-forced FALSE; decline-streak governor |
| Episodic marks ("Keep this moment") | `app/api/sovereign/episodes/mark/route.ts`, gesture in `OracleConversation.tsx` | LIVE (write path; zero natural marks yet) | `episodic_memories` (verbatim-only, interpretive columns forced NULL) | Member gesture, MAIA holds | `marked_by_member=TRUE` only via this route; recall gated by `members.episodic_recall_enabled`; hidden in Sanctuary |
| Quote candidates | `app/api/sovereign/quotes/candidates/route.ts`, `lib/analysis/extractQuotes.ts` | PARTIAL (wired, not surfacing) | proposals from member's verbatim language | Proposes-never-keeps | Member-pulled |
| Threads | `member_field_note_threads` (Field Lab migration `20260626000001`) | PARTIAL (field-lab tier) | member-authored threads | Member authors; keep/revise/split/discard | `consent_state` lifecycle; practitioner visibility held FALSE |
| Daily Anchor | `lib/anchor/loadRecentAnchors.ts`, `app/api/anchor/[id]/surface-preference` | LIVE | `member_daily_anchors` (verbatim, 1/day) | Member's own words returned | `surface_preference` default `member_pulled`; refusal R08 |

### 1.2 Listening & reflection (personal/relational Air)

- **Session review** — `lib/scribe/sessionReviewMode.ts`, `components/studio/SessionReviewChat.tsx`,
  `app/api/scribe/review-session`, `app/api/studio/review/memories` — LIVE, practitioner-facing.
- **Session summaries** — worker → `SessionRemembrance` → `lib/memory/MemberLiveContext.ts` (LIVE;
  per-request assembly, never persisted as profile; Sanctuary/anon skip).
- **Listener postures** — `lib/maia/presence/postures.ts`.
- **Staged long-session review** — sr-staged-v6 (LIVE, Kelly-ruled provisional pass; no tuning
  without sitting).

### 1.3 Perspective & the Air element itself

- Canon: `lib/maia/spiralogicReference.ts` — Air = "perspective/mind" (**narrower than the Air Realm
  framing; reconciliation flagged for Prompt 2**).
- `lib/voice/conductor.ts` `ELEMENT_CUES.air` (clarity/perspective/reframe/articulate/discern) —
  LIVE with hysteresis; `app/api/between/chat` `inferElementFromText()` — LIVE.
- `ElementalAgentConstellation.AirAgent` ("Clarity and Communication") — DORMANT (`_backend`,
  hardcoded responses). Corpus Callosum Air elemental voice — LIVE Cat 6 substrate
  (`agent_runs`; multi-agent, **not** member-facing capability).
- Onboarding `ElementalOrientation` components repurpose `air` = "WHAT / The Experience" —
  **inconsistent with both other meanings; flagged**.
- Elemental Alchemy content: manuscript in `docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md`,
  founder-knowledge JSONs, `elementalFacetMap.ts`.

### 1.4 Dialogue, conflict & repair (relational Air)

- **Practice subsystem** — `app/api/practice/*` (transcript, insights, worlds/{suggest,detect,
  practitioner,experiments}, growth, preferences; `lib/practice/PracticeStore.ts`) — LIVE. "Worlds"
  = practice scenarios; closest rehearsal scaffold, not yet conversation-rehearsal.
- **Relational navigation** — `app/api/maia/relational-navigation/route.ts` models `'conflict'` and
  `'repair'` signals — LIVE API, field-lab UI (experimental). Repair is *named*, not *practiced*.
- **Between routes** — `app/api/between/{chat,consciousness-bridge}` — LIVE, API-only (no page UI).
- **Team channels / threads / DMs** — `app/team/[channelSlug]`, `components/team/*`
  (ChannelView, ThreadPanel, DMView, visibility toggle) — LIVE. Hosts multi-party communication;
  develops nothing.
- **No group-disagreement, witness-structure, or repair-practice surface exists.**

### 1.5 Meaning & symbol (personal Air)

- **Mythic Atlas** — `lib/services/mythicAtlasService.ts` (element/facet/mythicThemes; TS bridge to
  Python service, graceful fallback) — LIVE-if-service-running; consumed by `maiaService`,
  `corpusCallosumService`.
- **Canon already governing meaning work**: `PATTERN_PRIMITIVE.md`, `SPIRAL_CONTINUITY_ENGINE.md`,
  `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md`, `THE_CLEARING.md`, `RIGHT_TO_REMAIN_UNPOSSESSED.md` —
  MAIA as meaning-companion-never-authority is existing constitutional doctrine.

### 1.6 Vision (personal → shared)

- **Vision Studio / Spiralogic Interview** — `app/maia/vision-studio/`,
  `components/maia/vision-studio/VisionStudioRoom.tsx` — LIVE. Member develops a "Living Field";
  MAIA proposes, participant authors; persistence only by explicit gesture. (Default-tab
  code/comment mismatch flagged.)
- **Now What? rooms** — `app/now-what/*` — LIVE, member-facing; four-register trust copy;
  `/now-what/field` = developmental off-ramp.
- Vision *toward others* (a future others can enter): no dedicated support.

### 1.7 Mission & Contribution (personal Air, occupational surfaces)

- **Founder tools** — `app/founder/*` (today, witness, signals, pipeline, content) — LIVE,
  founder-gated; operations, not member mission development.
- **Practitioner program** (current branch) — Stewardship Dashboard, containers, agreements,
  labtools — PARTIAL/LIVE; role home exists, lived-method language development does not.
- **Book Studio** — `app/book-studio/*` — LIVE, founder-gated; "Ready to Write" pulls kept/named
  material (the private→authored movement, proven n=1).
- **Developmental Publishing System** — DOC-ONLY candidate v0.4.
- **Legacy & transmission** — genuine white space (no doc, object, or surface).

### 1.8 Coordination & collective Air (Kelly's added targets)

| Capability | Where | Status | Develops group shared understanding? |
|---|---|---|---|
| Co-Lab teams (RBAC, explicit membership) | `lib/team/colabTeams.ts`, `lib/auth/teamPermissions.ts`, `app/studio/teams/*` | LIVE | No — coordination plumbing. In-file invariant: "No invisible commons." |
| **Decisions ledger** (team lens + studio Council lens over `studio_decisions`) | `app/team/decisions/`, `components/team/TeamDecisionsView.tsx`, `app/studio/decisions/` | LIVE | **Yes — the strongest live shared-narrative object** (typed capture: decision/question/insight/request/build) |
| **Circles field pulse** | `lib/circles/fieldPulseService.ts`, `app/api/circles/[circleId]/pulse` | **LIVE but SUSPENDED by ruling** | Yes — the only true cross-member meaning path; inferred-theme contributions suspended (Gold Reflection R5/R6/D2: inference ≠ offering act; threshold-of-2 re-identifiable) |
| Commons contributions + review queue | `app/api/commons/contributions/*`, `app/commons/*` | PARTIAL | Partial — collective curation. Three parallel commons pages; canonical one unresolved |
| Practitioner containers (`group`/`shared` scope) | `app/practitioner/containers/*`, `rl_containers` | LIVE schema/API | No — facilitation logistics (participants, transitions, agreements), not facilitated meaning-making |
| Master fields + PartnerWorkspace | `lib/masters/registry.ts`, `components/masters/PartnerWorkspace.tsx` | LIVE (bilateral: Jondi/Kelly/Nathan) | Partial — two-party only; "with-others"/"hold-the-field" are portal content |
| Observation Primitive (signals → observations → recognitions) | migration `20260701000003`, `app/founder/witness/` | Layer 2 founder-only; **Layer 3 (recognitions — cross-observation synthesis) schema-only, DORMANT, no authoring UI** | The designed-but-unbuilt collective-recognition object |
| `integration_passes` / Corpus Callosum | `lib/services/corpusCallosumService.ts` | LIVE, **deliberately no readers** (refusal-02 test enforces) | No — multi-*agent*, not multi-*person*; do not mistake for collective intelligence |
| Agreements/covenants | `app/practitioner/agreements/*` | LIVE | No — bilateral consent artifacts, not group charters |
| `encounter_streams` | — | **Does not exist** (0 code hits) | — |
| Witness ledger | `docs/witness/MAIA_WITNESS_REVIEW_PROTOCOL.md` | DOC-ONLY | Concept only |

**Governing constraint docs for anything collective**:
`docs/architecture/AIN_COLLECTIVE_INTELLIGENCE_BOUNDARIES_2026-07-18.md` (canon-candidate — "AIN
learns only from what sovereign members deliberately contribute"; collective eligibility is a
provenance property defaulting to **no**, minted per-item by a Stage-2 offering act) ·
`GOLD_REFLECTION_COLLECTIVE_BOUNDARY_MODEL_2026-07-17.md` + decision register ·
`FROM_COLLECTIVE_INTELLIGENCE_TO_EPISTEMIC_GOVERNANCE.md`.

### 1.9 Periodic reflection & scheduling

- `ritual_review_opt_in` exists in atoms/anchors consent vocabulary — **no scheduler/worker wired**.
- The only cron (`scripts/session-reminders-cron.sh`) sends appointment reminders, not reflection.
- Any Air reflection cadence must wire this first (or explicitly choose a different mechanism).

## 2. Existing Objects

Member-authored, LIVE: memory atoms · episodic marks (verbatim) · anchors · threads · keep
preferences · decisions (team/studio) · agreements · containers · practice worlds/transcripts ·
soul portraits (+ append-only consent ledger). Proposed-by-system, member-disposed: quote candidates
· keep offers. System-internal: `agent_runs` / `integration_passes` (no readers) · signals (layer 1)
· `member_theme_signals` (suspended pathway) · session summaries (assembled, not persisted).
Schema-only/dormant: recognitions (Observation Layer 3) · SHIFt facets · Memory Palace episodic
lineage (`lib/consciousness/memory/EpisodicMemoryService.ts` — opposite provenance stance from
member-marked; needs ruling, not assumption). Concept-only: touchstone · witness ledger ·
development thread (sequence-doc vocabulary — **does not yet exist**; atoms/threads are the nearest
substrate).

**Prompt 1 instruction honored**: these should NOT be assumed to remain separate objects. The
keep/mark/thread/anchor family is one provenance-grounded "member-kept language" family with four
entry gestures; Prompt 6 should treat consolidation as a live question.

## 3. Existing User Journeys (approximations of Air development)

1. **Keeping → seeing kept language** (atoms → portfolio → Book Studio "Ready to Write") — the
   private→authored journey, live end-to-end for the founder only.
2. **Bring the unformed thing → next real step** (Now What? rooms) — live, member-facing.
3. **Develop a Living Field pre-session** (Vision Studio Spiralogic Interview) — live.
4. **Session → review → follow-ups** (Session Room/Studio) — live, practitioner side.
5. **Team decides → typed decision ledger** (Co-Lab Decisions) — live group narrative.
6. **Circle themes → field pulse** — suspended by ruling.
7. **Onboarding elemental orientation** — live but semantically inconsistent (air=WHAT).
No journey exists for: rehearsing a difficult conversation · translating one idea across audiences ·
repair after rupture · group disagreement navigation · legacy transmission.

## 4. Overlap and Duplication

Carried from Prompt 0 §5 (Living Profile constitution cluster · MemberLiveContext · keep/mark
substrate · practice subsystem · Now What?/Vision Studio · Book Studio/publishing · Pattern
Primitive canon · two Air voices), plus new collective-layer entries:

- **Decisions ledger** — any Air "shared narrative" object must extend it, not duplicate it.
- **Observation Primitive Layer 3 (recognitions)** — collective recognition is already *designed*
  ("schema now, authoring UI later"); an Air collective surface that ignores it creates a parallel
  primitive.
- **Circles pulse ruling** — collective meaning-making already has an open constitutional case; Air
  work must inherit its resolution (offering-act provenance), not route around it.
- **Three parallel commons pages** — pre-existing duplication the Air work must not compound.

## 5. Missing Evidence

- Zero episodic marks; recognition-from-recurrence has no member evidence base (ladder designable,
  not calibratable).
- Demand for communication *practice* (rehearsal, translation, repair) is untested; the signal is
  Kelly's founder-articulation practice (n=1).
- Whether the Decisions ledger actually functions as shared understanding for its team (vs a log) is
  unmeasured.
- Circles pulse fate (grandfather / retrofit consent / pause) — open ruling.
- Whether `session-room` is multi-party or 1:1; canonical commons page; Memory Palace lineage
  status; Mythic Atlas service availability in production.
- Group-level consent grammar (what is a group's "keep gesture"?) has no precedent anywhere in the
  codebase — the Stage-2 offering act is per-member, per-item; nothing yet says how a *group* keeps
  a shared meaning. This is the deepest open design question the collective sweep surfaced.

## 6. Architectural Question (provisional answer)

**Air Realm Development is best understood as a cross-platform developmental capacity expressed
through existing rooms and the existing consent substrate — with a strict layer ordering.**

Evidence, not elegance: (a) every domain already has partial expression in a different room — a
single new studio would either duplicate all of them or hollow them out; (b) the consent
architecture (keeping-as-consent, member-pulled defaults, Sanctuary, offering acts) lives in the
existing surfaces — a new room would have to re-derive it; (c) the reconciliation ruling forbids
parallel products over the developmental substrate; (d) the collective layer is constitutionally
gated territory where two primitives (recognitions, Circles pulse) already claim the ground.

Layer ordering (matches Kelly's Personal → Relational → Collective → Cultural): **personal Air
first** (practice layer on existing substrate — rehearsal, articulation ladder, audience
translation), **relational Air second** (repair practice, dialogue — building on
relational-navigation vocabulary and practice worlds), **collective Air only after** the offering-act
provenance model settles and Observation Layer 3 gets its ruling. Cultural Air is Cat 1 horizon
language, not buildable territory.

## 7. Recommendation

**Proceed to Prompt 2 (ontology and boundary clarification) after Kelly reviews this document.**
Prompt 2 must additionally resolve, beyond its listed scope:

1. **Air semantics reconciliation** — "perspective/mind" (canon) vs communication-capacity (sequence)
   vs the onboarding repurposing; one ruling, then the vocabulary follows everywhere.
2. **Shadow ontology** (Kelly amendment) — the twelve named shadows, and which existing guardrails
   already structurally refuse them (anti-synthesis CHECKs, no-readers tests, decline-streak
   governor, proposes-never-keeps) vs which need design (persuasion/manipulation, false certainty,
   polarization).
3. **Group keep-gesture question** — what consent grammar could ever let a *group* adopt a shared
   meaning, given the per-member offering-act doctrine. If Prompt 2 cannot answer it, collective Air
   stays explicitly out of scope for Prompts 3–9.
4. **Voice/Work/World placement** — confirmed as one applied pathway; its occupational surfaces
   (Book Studio, founder tools, practitioner program) become *expressions* of the capability, not
   competitors.

No consolidation, no code, no new objects are proposed at this stage. The S5 gate holds through
Prompt 7; Prompt 8+ require S5 settlement and Kelly's explicit authorization.
