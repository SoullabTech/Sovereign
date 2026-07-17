# Collective Intelligence Boundary Model — 2026-07-17

**Ruling status (2026-07-17)**: Accepted by Kelly. Per-item opt-in contribution ratified
(register R6); inferred-theme contributions to the Circles field pulse **suspended by
ruling** pending containment (register R5, D2). See
`GOLD_REFLECTION_DECISION_REGISTER_2026-07-17.md`.

**Status**: Design investigation only. Nothing here authorizes collective ingestion.
Companion to `GOLD_REFLECTION_INDIVIDUAL_ARCHITECTURE_2026-07-17.md`,
`GOLD_REFLECTION_INTERACTION_STUDY_2026-07-17.md`,
`GOLD_REFLECTION_EXISTING_SYSTEM_MAP_2026-07-17.md`.

**Founding sentence**: AIN reflects patterns of human flourishing that emerge across many
sovereign lives without exposing, collapsing, or appropriating any individual life.

**Governing constraint**: A member's private material must not become collective
intelligence merely because it contains a meaningful pattern. Collective learning requires
a separately governed pathway — separate consent, separate storage, separate authority.

---

## 1. Verified current state (source-verified 2026-07-17)

**Exactly one live code path moves one member's material into something other members
see**: the **Circles field pulse**. Everything else labeled "collective," "field," or
"quantum" is per-member telemetry, write-only logging, in-memory experimental code with
zero persistence, or admin-scoped research aggregation never surfaced to members.

### 1.1 The one live cross-member path — Circles field pulse

`lib/circles/fieldPulseService.ts` aggregates anonymized themes across circle members
(`SELECT theme, COUNT(DISTINCT member_id) FROM member_theme_signals JOIN
circle_memberships … GROUP BY theme HAVING COUNT(DISTINCT member_id) >= 2`), surfaced via
`app/api/circles/[circleId]/pulse/route.ts` and `app/api/circles/pulse-summary/route.ts`.
Source table `member_theme_signals` is written per-member by
`lib/consciousness/participatoryRealityHelper.ts` (migration `20260316000001`).

It already embodies three of this model's protections: a cohort threshold (≥2 distinct
members), no counts or percentages exposed, qualitative atmosphere-language only. It
violates or predates three others:

- **No Stage-2 consent act.** Theme signals enter the pulse because the system inferred
  them, not because the member offered them. There is no `collective_eligibility` gesture.
- **Threshold of 2 is far below any re-identification-resistant cohort.** In a small
  circle, "a theme shared by at least two members" is often guessable.
- **Small-group scoping** is exactly what §6 flags as the hardest re-identification case —
  the pulse is scoped to a circle by design.

**Ruling required (adds to §9)**: whether the Circles field pulse is (a) grandfathered as
a distinct, container-internal feature with its own consent story, (b) retrofitted with a
member offering gesture and a higher threshold, or (c) paused until this boundary model is
ratified. It should not silently stand as precedent for the AIN collective layer.

### 1.2 Confirmed absent or inert

- **Corpus Callosum (`agent_runs` / `integration_passes`)**: per-member-scoped,
  write-only telemetry. **Zero readers** — confirmed by grep and by constitutional test
  `tests/constitutional/refusal-registry/refusal-02-integration-passes-no-readers.ts`;
  sibling refusal-06 forbids surfacing these tables in member surfaces. Nothing reads them
  back into prompts. Not collective.
- **No cross-member prompt injection anywhere**: no service loads member B's material into
  member A's prompt. Co-Lab sharing is explicit team membership, structurally gated by
  `scripts/verify-colab-boundaries.ts` (cross-boundary reads blocked at the SQL layer).
- **`MorphicPatternService`** (402 LOC, persists, 0 live callers): the only substrate
  explicitly earmarked for a future collective layer; member-scoped today; the status
  matrix flags "high cross-member leakage risk" if wired. Stays dormant until this model
  is ratified.
- **`QuantumFieldMemory`** (810 LOC, zero persistence), **`CollectiveMemoryField`**
  (in-memory EventEmitter, uncalled), `lib/stubs/CollectiveIntelligence.ts`, and the
  "Indra's Web" constructs: aspirational naming, no runtime collective reality.
- **No k-anonymity / de-identification framework exists.** The only threshold logic in the
  codebase is the field pulse's `>= 2`.
- **Admin/research aggregation** (`lib/research/researchMetricRegistry.ts`,
  `app/api/admin/*` GROUP BY over `member_spiral_state`): cross-member but admin-scoped
  dashboards, never member-surfaced. Should be inventoried under this model's rules when
  ratified, but is not a member-facing collective layer.

### 1.3 The precedent to build on

The **default-private column + member gesture route + loader-side gate** triad exists
twice: atoms `return_preference` (loader gate `lib/maia/memoryAtomsLoader.ts:279`) and
anchors `surface_preference` (`lib/anchor/loadRecentAnchors.ts:66`, migration
`20260702000003`). A future `collective_eligibility` gate should be the third instance of
this grammar — eligibility originating from a member act, enforced at the loader.

---

## 2. The pathway, as stages with gates

Each arrow is a **gate with its own authority**, not a pipe. Material does not flow; it is
admitted, stage by stage, or it stays where it is.

```text
Stage 0  Private member experience
            │  gate: none needed — this is the default and permanent home of everything
            ▼
Stage 1  Member-ratified recognition
            │  gate: the member's keep/revise gesture (individual loop; see Architecture doc)
            ▼
Stage 2  Explicit collective eligibility
            │  gate: a SEPARATE member act, per item, opt-in, default OFF
            │        ("May this, de-identified, teach the commons?") — never bundled
            │        with the keep gesture, never a blanket setting alone
            ▼
Stage 3  Thresholded pattern formation
            │  gate: minimum-cohort threshold + de-identification review
            │        patterns form only across ≥ N distinct members (N ≥ 20 proposed;
            │        Kelly to ratify); below threshold, contributed material is inert
            ▼
Stage 4  Collective reflection
            │  gate: same speech-act discipline as individual reflection —
            │        observation with provenance ("across many lives…"), never norm
            ▼
Stage 5  No reverse inference
               standing invariant: nothing at stage 4 may be used to characterize,
               address, or target any individual member — including the contributors
```

**Precedent to mirror**: the atoms `return_preference` and anchors `surface_preference`
consent grammar — a default-private column, a member gesture route, and a loader-side gate
that reads the member's act, not a deploy flag. Collective eligibility
(`collectiveEligible` in the reflection object) should be the third instance of this
established pattern: **eligibility originates from a member act.**

---

## 3. What may enter collective learning (Stage 2 candidates)

Only material that is already **member-ratified** (Stage 1) and then **separately offered**
(Stage 2):

- Member-approved reflections the member explicitly offers to the commons
- Anonymized themes ("a recurring question about work and belonging") — theme, not text,
  where the member so chooses
- Voluntarily shared stories authored for sharing (the member wrote it to be read)
- Public contributions already made public by the member on the platform
- Repeated questions, offered as questions
- Practices the member explicitly reports as meaningful and offers as such
- Collective language patterns **only above the minimum cohort threshold**

## 4. What may never enter

Categorically ineligible, with no consent pathway that can override:

- Raw transcripts, in whole or in part
- Private memory (atoms, anchors, episodic marks) not individually offered at Stage 2
- **Sanctuary sessions — absolutely.** Sanctuary content cannot enter *individual* memory;
  a fortiori it cannot exist at any collective stage. No exception, including member
  request during the session (Sanctuary invariant 6).
- Client/session material inside practitioner containers — the client's consent to the
  practitioner is not consent to the commons, and the practitioner cannot consent on the
  client's behalf. Practitioner notes likewise.
- Unratified AI interpretations — anything MAIA construed that the member did not
  recognize/keep. Rejected (`not-true`) construals doubly so.
- Sensitive identity and health information, even if member-offered, until a separate
  ruling establishes whether any pathway for it should exist at all (recommend: none in v0)
- Material from cohorts small enough that re-identification is plausible (below threshold,
  or above threshold but with quasi-identifier combinations — see §6)

## 5. Consent pathway design

1. **Per-item, not per-account.** A blanket "share my patterns" toggle is insufficient as
   the sole gate; it manufactures consent at a distance from the material. A blanket
   *ceiling* (member turns collective participation off entirely) is fine and should exist;
   the *floor* is always per-item offering.
2. **Consent is to a described use**, stated at the gesture: de-identified, thresholded,
   pattern-level, no reverse inference. If the use changes, prior consent lapses.
3. **The offer gesture is separate in time and UI from the keep gesture.** Keeping is
   intimate; offering is civic. Bundling them poisons the first with the second.
4. **Withdrawal**: a member may withdraw an offered item at any time. Effect: the item is
   removed from the contribution store and from all *future* pattern formation. Patterns
   already formed above threshold are recomputed on the next formation cycle without it;
   the design must make formation cycles re-runnable from current contributions only
   (no accumulated model state that can't forget). If a withdrawal drops a pattern's
   cohort below threshold, the pattern is retired.
5. **Deletion** (member deletes the underlying private material): implies withdrawal of any
   offering derived from it.

## 6. Anonymization limits — honesty clause

De-identification is a mitigation, not a guarantee. The design must say so plainly to
members. Structural protections that do not depend on scrubbing being perfect:

- **Minimum cohort threshold** (≥ N distinct members, N ≥ 20 proposed) before any pattern
  may form or surface
- **Pattern-level output only**: collective reflections quote no member verbatim unless the
  text was authored-for-sharing; distinctive phrases are as identifying as names
- **Quasi-identifier audit** at Stage 3: rare combinations (role + place + circumstance)
  block surfacing even above cohort threshold
- **No small-group scoping**: collective reflections never scope to a Co-Lab, circle, or
  practice field small enough that members can identify each other's material. Group-scoped
  reflection inside a container is a *different feature* with its own consent design — out
  of scope here and not implied by this model.

## 7. Protection against majority flattening

Collective reflection is not consensus. AIN must not mirror the most common opinion,
majority preference, popularity, engagement weight, or behavioral averages.

- **Rarity is not noise.** A question appearing independently across 25 unrelated lives out
  of thousands is a stronger candidate for collective gold than a sentiment appearing in
  most lives. Formation logic must not weight by frequency alone; independence and
  recurrence-across-difference matter more than volume.
- **Tensions are first-class collective objects**, exactly as contradictions are
  first-class individual objects (Interaction Study, Case 3). "Across many lives, success
  and belonging pull in opposite directions" is a valid collective reflection; "people
  should choose belonging" is not — the collective layer emits observations of plurality,
  never norms, rankings, or advice.
- **No leaderboards of flourishing.** Nothing in the collective layer orders members,
  practices, or lives against each other.

## 8. Separation of private MAIA and collective AIN

- **Separate stores.** Contributions live in a contribution store, not in member memory
  tables. No loader that assembles a member's prompt context may read the collective store
  *as evidence about that member*; no collective formation job may read member memory
  tables directly — it reads only Stage-2 contributions.
- **Separate direction of authority.** Per the Constitutional Direction of Authority,
  authority moves upward through authored experience only. The collective layer sits
  *outside* the member's loop: it may offer a collective reflection as **encounter
  material** ("across many lives…") which the member is free to take up or ignore — it may
  never arrive as a claim about the member ("people like you…"). Reverse inference is not
  just a privacy violation; it is a constitutional one (manufactured higher-order meaning
  moving downward).
- **Separate failure domain.** If the collective layer is wrong, biased, or compromised, no
  individual member's record is touched.

## 9. Decisions requiring Kelly's ruling

1. Minimum cohort threshold N (proposed ≥ 20 distinct members) and whether it is uniform
   or per-material-type.
2. Whether any pathway for sensitive identity/health material should exist at all
   (recommendation: no, in any near horizon).
3. Whether a blanket participation *ceiling* toggle ships before any per-item offering
   exists (recommendation: yes — the off-switch precedes the feature).
4. Formation-cycle cadence and the re-runnable/no-residual-model requirement (this
   constrains future ML choices materially; it should be ratified as an invariant before
   any formation code exists).
5. Whether group-scoped (Co-Lab/circle) reflection is ever pursued as a separate feature,
   or explicitly foreclosed.
6. **Circles field pulse disposition** (§1.1): grandfather as container-internal with its
   own consent story, retrofit with member offering + higher threshold, or pause until
   this model is ratified. Recommendation: (b) retrofit — it is live, member-visible, and
   currently consent-free at Stage 2.
7. **Theme-signal ingestion consent** (upstream of the pulse): `member_theme_signals` rows
   are system-inferred, not member-offered. Whether inferred signals may ever feed any
   cross-member surface without a member act is the sharpest live instance of this
   model's Stage-2 question.

## 10. Stop condition

Nothing in this document authorizes: a contribution store, an offering gesture, formation
jobs, thresholds in code, or any collective surface. This is the boundary model against
which any future proposal is checked.
