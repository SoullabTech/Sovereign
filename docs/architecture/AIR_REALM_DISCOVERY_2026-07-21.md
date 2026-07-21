# Air Realm Discovery — 2026-07-21

**Status**: Discovery only. Authorizes nothing. Prompt 0 of the Air Realm Development sequence
(`docs/plans/AIR_REALM_DEVELOPMENT_PROMPT_SEQUENCE_2026-07-21.md`).
**APPROVED by Kelly 2026-07-21** with three amendments (recorded in the sequence doc): Coordination
added as fifth domain; Air shadow/distortion investigation added; collective meaning-making /
shared-reality creation added to Prompt 1 discovery targets. Prompt 1 authorized.
**Standing gates observed**: S5 provenance phase (feature dev stopped — this is a paper, not a build),
Spiralogic Profile S5 pause, freeze doctrine, Sovereignty Invariants, Inv 16.

**Questions this document answers**
- **Primary**: Is Air Realm Development already emerging across multiple existing systems?
- **Secondary**: Should Voice, Work & World become one pathway within a broader Air capability?

**Method**: four parallel repository sweeps (memory/profile substrate · studios & role pathways ·
prior design docs · Air element & communication capabilities), 2026-07-21, on branch
`feature/practitioner-program-platform`.

---

## 1. Answer to the primary question

**Yes — Air Realm Development is already emerging, but in a specific and partial way: the platform
has extensive Air *witnessing* infrastructure and almost no Air *development* infrastructure.**

Nearly every Air capacity named in the sequence doc has an existing surface that *holds, receives, or
reflects* the member's language. Almost none of them *develops the member's capacity* to listen,
name, dialogue, translate, or repair. The systems are built to keep what a person says; they are not
yet built to help a person become more able to say it, hear it, or carry it into relationship.

That asymmetry is the central discovery. It matches the sequence doc's own distinction: the platform
already embodies "witness before interpret" — what does not yet exist is the practice layer where
witnessing becomes capacity.

## 2. Evidence: existing capabilities mapped to the seven Air capacities

### Listening (hearing oneself; hearing another)
- **Session review** — `lib/scribe/sessionReviewMode.ts`, `components/studio/SessionReviewChat.tsx`,
  `app/api/scribe/review-session/route.ts` (LIVE, practitioner-facing). The member's session becomes
  re-hearable.
- **Listener postures** — `lib/maia/presence/postures.ts`.
- **Session summary worker** → `SessionRemembrance` consumed by `lib/memory/MemberLiveContext.ts`
  (LIVE MAIA-facing aggregation; assembled per request, never persisted as profile).
- Nothing helps a member practice *listening to another person*.

### Naming (finding language; reducing confusion)
- **Keep gesture / Psyche Engagement Layer** — `lib/psyche/conversational-keep.ts`,
  `lib/psyche/portfolio.ts`, `member_memory_atoms` (LIVE). Human-natural filing vocabulary
  (keep/ideas/decisions/dreams/journal/reflections/protected); keeping is the consent act; hard
  invariants forbid synthesis (`crossing_allowed` CHECK-forced FALSE).
- **Quote candidates** — `app/api/sovereign/quotes/candidates/route.ts` + `lib/analysis/extractQuotes.ts`
  (wired/reachable, not surfacing) — proposes the member's own verbatim language back, never keeps.
- **Threads** — `member_field_note_threads` (Field Lab): member-authored keep/revise/split/discard.
- **Episodic marks** — "Keep this moment" (`app/api/sovereign/episodes/mark/route.ts`, LIVE write
  path, verbatim-only, interpretive columns forced NULL). Zero natural marks yet.
- This is the strongest existing cluster: naming-by-keeping is live, consented, provenance-grounded.

### Perspective (multiple viewpoints; translation between worlds)
- **Air already means this in canon code**: `lib/maia/spiralogicReference.ts` defines Air as
  **"perspective/mind"**. `lib/voice/conductor.ts` `ELEMENT_CUES.air` = clarity, perspective,
  reframe, pattern, insight, understand, meaning, reflect, articulate, discern (LIVE, with
  hysteresis). `app/api/between/chat/route.ts` infers air from think/understand/words/communicate/
  clarity (LIVE).
- **Dormant Air voice**: `ElementalAgentConstellation.ts` `AirAgent` ("Clarity and Communication",
  `_backend`, hardcoded responses, likely no live callers) — plus the Corpus Callosum Air elemental
  voice emitting `agent_runs` rows in production (Cat 6, mechanism not mythology).
- **No audience-translation tool exists** — nothing helps a member shape one idea for a client vs a
  reader vs an investor vs no one yet. Genuine white space.

### Dialogue (questions; conflict navigation; relational repair)
- **Practice subsystem** — `app/api/practice/*` (transcript, insights/generate, worlds/{suggest,
  detect,practitioner,experiments,list}, growth, preferences; `lib/practice/PracticeStore.ts`).
  LIVE. "Worlds" = practice scenarios — the closest existing scaffold for rehearsing conversations,
  though not framed as conversation rehearsal.
- **Relational navigation** — `app/api/maia/relational-navigation/route.ts` explicitly models
  `'conflict'` and `'repair'` signals (auth-gated; UI in field-lab = experimental tier).
- **Between routes** — `app/api/between/chat` + `consciousness-bridge` (LIVE, API-level).
- Repair is *named in signal vocabulary* but there is no repair-practice experience.

### Meaning (interpretation; symbolism; worldview formation)
- **Mythic Atlas** — `lib/services/mythicAtlasService.ts` (element/facet/mythicThemes classifier;
  live-if-Python-service-running, graceful fallback), consumed by `maiaService` and
  `corpusCallosumService`.
- **Atoms registers + elemental lenses** on kept material; **Book Studio mirror sources**
  (`lib/bookStudio/mirrorSources.ts`) — the member's kept meaning feeding authorship.
- **Canon already governs this ground**: `docs/canon/PATTERN_PRIMITIVE.md` (recurring-pattern
  recognition), `docs/canon/SPIRAL_CONTINUITY_ENGINE.md`, `docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md`,
  `docs/canon/THE_CLEARING.md`, `docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md`. MAIA-as-meaning-companion
  (never meaning-authority) is already constitutional doctrine, not a new idea.

### Vision (articulating futures; inviting participation)
- **Vision Studio / Spiralogic Interview** — `app/maia/vision-studio/` +
  `components/maia/vision-studio/VisionStudioRoom.tsx` (LIVE): member develops a "Living Field"
  pre-session; MAIA proposes, participant authors; nothing persists without explicit gesture.
- **Now What? rooms** — `app/now-what/*` (LIVE, member-facing; four-register trust copy;
  `/now-what/field` = "the member's own field. The developmental off-ramp"). Closest existing analog
  to bringing an unformed thing and working it until a next real step appears.
- Vision *toward others* (a future others can enter) has no dedicated support.

### Mission (communicating purpose; leadership language; shared direction)
- **Founder tools** — `app/founder/*` (today, witness, signals, pipeline, content; LIVE,
  founder-gated). Currently Kelly-facing operations, not member mission development.
- **Pitch/press artifacts** — `docs/pitch/` (FOUNDER_BIO, MICRO_PITCHES, case studies) — authored
  documents, not a capability.
- **Practitioner program** (current branch) — Stewardship Dashboard (Clarity/Responsibility/Closure/
  Capacity/Sustainability), practitioner onboarding: the practitioner *role* has a home; the
  practitioner's *language for their lived method* does not.

### Cross-cutting: writing & authorship
- **Book Studio** — `app/book-studio/*` (LIVE, founder-gated). "Ready to Write" already pulls the
  member's kept/named material — the exact private→authored movement the sequence envisions, proven
  for one member (Kelly) and one book.
- **Developmental Publishing System** — `docs/pitch/DEVELOPMENTAL_PUBLISHING_SYSTEM_CANDIDATE.md`
  (v0.4, candidate): "development happens and authorship never moves."
- **Writing Project Layer** — `docs/architecture/WRITING_PROJECT_LAYER.md` (ontology only, no UI/schema).

### Legacy & transmission
- **No dedicated doc, object, or surface found.** The docs sweep confirms legacy/stewardship-as-
  transmission is genuine white space (Karen's Table exists as a personal project, not a capability).

## 3. What "Air" currently means — a semantic conflict to resolve before anything else

Three inconsistent meanings coexist:

1. **Canon code**: Air = "perspective/mind" (`spiralogicReference.ts`) — narrower than the sequence
   doc's communication framing.
2. **Conductor/between cues**: Air ≈ clarity/reframe/articulate/understand — closest to the new framing.
3. **Onboarding misuse**: `components/{beta,onboarding}/ElementalOrientation.tsx` repurpose element
   ids as HOW/WHY/WHO/WHAT/SOUL slots — `air` = "WHAT / The Experience" ("listens deeply, asks good
   questions"). Inconsistent with both other meanings.

Any Air Realm capability inherits this vocabulary. Reconciling Air's semantic range (and fixing or
explicitly excusing the onboarding repurposing) belongs to Prompt 2 (ontology) — flagged here so it
is not discovered late.

## 4. Answer to the secondary question

**Yes. Voice, Work & World should become one pathway inside the broader Air capability.** Three
independent lines of evidence:

1. **Its territory is already occupationally fragmented.** The author has Book Studio; the founder
   has `app/founder/*` and pitch docs; the practitioner has the practitioner program. A standalone
   VWW product would be a fourth occupational silo. The capacities underneath them (naming,
   articulation, audience translation, meaning) are shared — exactly what a capability-level frame
   captures and a role-level product fragments.
2. **The relational half of Air has no occupational home at all.** Conflict/repair signals,
   between-routes, and dialogue practice serve *relationship*, not *career*. A VWW-shaped product
   would have no place for them; the Air frame does.
3. **The governance record warns against the alternative.** `docs/architecture/LIVING_PROFILE_RECONCILIATION_2026-07-20.md`
   explicitly warns against building parallel products over the same developmental substrate, and the
   Spiralogic Profile Constitution (ACCEPTED 2026-07-20, build-gated) already owns
   "longitudinal developmental profile" territory. A cross-platform capacity that *uses* the existing
   substrate (atoms, marks, threads, anchors, MemberLiveContext) avoids the parallel-product trap; a
   new studio would walk into it.

This confirms Kelly's provisional judgment: **cross-platform developmental capacity, not a single
room** — with one refinement from the evidence: the capacity should be *expressed through existing
rooms first* (Now What?, Vision Studio, Session Room, Book Studio) rather than acquiring its own
surface, because the rooms already carry the consent architecture.

## 5. Overlap and duplication register

| Existing system | Relationship to Air Realm | Risk if ignored |
|---|---|---|
| Spiralogic Living Profile constitution cluster (ACCEPTED, unbuilt, S5-gated) | Owns longitudinal developmental-profile territory | Parallel product; violates reconciliation ruling |
| Psyche keep/atoms layer (LIVE) | Already the naming + consent substrate | Duplicate "kept language" object |
| Episodic marks (LIVE, zero emissions) | Already the "moment worth keeping" object | Duplicate marking gesture |
| Quote candidates (wired, not surfacing) | Already "your recurring language, offered back" | Duplicate recognition surface |
| Practice subsystem (`app/api/practice/*`, LIVE) | Closest scaffold for rehearsal | Second practice engine |
| Now What? rooms + Vision Studio (LIVE) | Closest experiential analogs | Competing room |
| Book Studio + Dev Publishing candidate | The private→public authorship boundary, already designed | Second publishing path |
| Pattern Primitive + Spiral Continuity canon | Already govern recognition-from-recurrence | Re-inventing evidence rules Prompt 3 would write |
| Corpus Callosum Air agent (Cat 6) + dormant `AirAgent` | Existing "Air voice" machinery | Two Air voices; violates one-MAIA |

## 6. Missing evidence (cannot be designed from the repo alone)

- **Zero episodic marks exist**; conversational recall is verified but recognition-from-recurrence has
  no member evidence base yet. The evidence ladder (Prompt 3) can be designed but not calibrated.
- Whether members *want* communication practice (rehearsal, repair, audience translation) is untested
  — no member has asked the platform for it; the demand signal is Kelly's own founder-articulation
  practice (n=1).
- `ritual_review_opt_in` exists in schema/consent vocabulary but **no scheduler/worker is wired** —
  periodic reflection is designed, not live. Any Air periodic-reflection experience must first
  resolve this.
- "Touchstone" has no code object (concept only) — vocabulary in prior conversations does not map
  1:1 to substrate.
- Whether the dormant `AirAgent`/Memory-Palace episodic lineage (`lib/consciousness/memory/EpisodicMemoryService.ts`)
  is intended substrate or legacy to be excluded — opposite provenance stances from the member-marked
  system; needs a ruling, not an assumption.

## 7. Recommendation

**Proceed to Prompt 1 (full capability discovery under the Air frame) after Kelly reviews this
document** — with three preconditions carried forward:

1. **Air semantics reconciliation** goes on the Prompt 2 (ontology) agenda: "perspective/mind" vs
   communication-capacity vs the onboarding repurposing.
2. **Reconcile-not-parallel**: Prompt 6 (product architecture) must position Air Realm relative to
   the Spiralogic Profile Constitution and the Living Profile reconciliation before proposing any
   object or surface. The default posture is: Air Realm capacities are *expressed through* the
   existing keep/mark/thread/anchor substrate and existing rooms, not built beside them.
3. **S5 gate holds**: Prompts 0–7 are papers and remain legitimate under "papers before code";
   Prompt 8+ (implementation plan and build) additionally require the S5 provenance phase to settle
   and Kelly's explicit authorization, per the standing project gates.

The one-sentence finding: **Air Realm Development is not a new thing to build — it is the name of
what the witnessing substrate is already reaching toward, minus the practice layer that would make
it developmental.** The platform can hold what a person says; it cannot yet help them become more
able to say, hear, or repair it. That gap — rehearsal, audience translation, repair practice,
legacy transmission — is where genuine new work lives, and all of it sits downstream of Kelly's
review of this frame.
