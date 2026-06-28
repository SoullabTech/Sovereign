# Resonant Field Intelligence

**Status: Category 1 — Held direction. Not an authorized build spec. Lift conditions stated in §6.**

---

## 1. Operational Definition

Resonant field intelligence is the move from answer-generation to an instrumented environment where interdependent sources of knowing remain mutually available without losing their distinct standing.

The field does not produce answers by collapsing its sources into a single synthesized response. It makes the structure of the inquiry visible and participatory — so that the member can orient within the whole rather than receive a conclusion from it.

This changes what the platform is measuring. Not outputs. Not the person. The evolving conditions under which orientation is or is not occurring.

---

## 2. Constitutional Invariant

**Distinct standing must be preserved. No source may collapse another source into synthesis.**

Each source in the field has standing appropriate to what it actually knows:

- A practitioner observation is not member-confirmed truth.
- An inferred pattern is not an observed fact.
- A provisional hypothesis is not a settled interpretation.
- MAIA's synthesis is not the member's meaning.

When sources are collapsed — when "a practitioner noticed" becomes "you are" — the field fails constitutionally, regardless of whether the observation is accurate.

The `crossing_must_be_false` constraint in `member_memory_atoms` and the `epistemological_status` column are first implementations of this invariant at the schema level. The invariant must extend to every source in the field.

---

## 3. Interdependent Source Map

Each source has a distinct kind of standing. No source is above another. All are interdependent.

| Source | Kind of Standing | What It Actually Knows |
|---|---|---|
| Member's lived experience | Sovereign — highest standing on meaning | What is real for this person now |
| Member correction | Sovereign override | When a representation is wrong |
| Body / sensation | Present-moment reportage | What is happening in the body now |
| Memory | Provenance-tracked continuity | What persisted across time, and from where |
| Practitioner observation | Witnessed — facilitator-level standing | What was observed in a bounded session |
| Relationship context | Relational — interpersonal standing | Recurring dynamics between people |
| External knowledge | Contextual reference | What is known beyond this person's life |
| Symbolic / archetypal | Interpretive lens — not factual claim | What a tradition associates with this pattern |
| MAIA interpretation | Provisional synthesis — lowest factual standing | One way of organizing what has been shared |
| Research observatory | Structural description — no prescriptive authority | Patterns across orientation conditions |

**Member correction is the highest-relevance signal.** When a member says "no — that's not right," the field reorganizes around that correction. No other source overrides it.

**MAIA interpretation has the lowest factual standing.** It is the most recent and most contextually-formed. It should be offered as one way of organizing, not as what is true.

---

## 4. What the Field Studies

The field studies the conditions under which orientation develops — not the person developing.

This is the distinction that keeps the observatory from becoming measurement. The questions are:

- What conditions preceded this moment of clarity?
- What was present when the member reoriented after confusion?
- How long did competing interpretations remain visible before one was chosen?
- What source — body, memory, practitioner, correction — most often preceded a shift?

These are empirical questions about a process. They do not require modeling the member's internal state.

---

## 5. Research Questions

These are the first-generation empirical questions the field makes testable. Each requires operational evidence, not architectural argument.

1. Do visible competing hypotheses reduce premature certainty — does keeping interpretations alive longer improve later judgment?
2. Does provenance visibility increase trust — does knowing *why* MAIA said something change how the member receives it?
3. Do practitioner observations surface meaningfully in later MAIA conversations — and when they do, does the member find them useful or intrusive?
4. Does showing uncertainty ("this conclusion currently rests on one observation") improve or destabilize member confidence?
5. Which sources tend to clarify, which tend to conflict, and which tend to overreach their standing?
6. When do members naturally shift from observation mode to interpretation mode — and what triggers the shift?

None of these can be answered by inspection. They require instrumented sessions, member feedback, and willingness to revise the architecture in response to what is found.

---

## 6. Authorization Gate

**This direction does not authorize construction of the Neuropod, the interactive field UI, or any multi-source display layer.**

The lift condition is specific and testable:

> The current With Me flow must first demonstrate that practitioner-approved observations surface meaningfully in later MAIA conversations — and that MAIA phrases them with epistemic care ("a practitioner observed…") rather than as direct truth ("you are…").

Until that fact is verified in production, everything above this line remains architecture, not product.

**The sequence:**

1. ✅ With Me → bookmark → synthesis → approval → `member_memory_atoms` (built, 2026-06-24)
2. ✅ `epistemological_status` + `witnessed` register + provenance column (built, 2026-06-24)
3. ✅ `formatAtomsForPrompt` renders PRACTITIONER OBSERVATIONS block with epistemic framing (built, 2026-06-24)
4. 🔶 End-to-end verification (2026-06-24): engineering wire ✅ verified in production; "confirm language discipline" decomposed and partially open — see **First Live Production Observation** below.
5. ⬜ Member reports on whether surfaced observations feel useful, intrusive, or mischaracterized
6. ⬜ Only after (4) and (5): consider the next source in the interdependence map

---

## 6.1 First Live Production Observation (2026-06)

**Engineering**

The atoms prompt wire has been verified in production. Observed on one live production turn (n=1):

- Retrieval: 8 atoms loaded.
- Prompt assembly: 2280-character atoms block injected through the CORE addenda path.
- Runtime wiring confirmed by the compiled production bundle.

This retires the plumbing hypothesis ("practitioner observations do not reach the model prompt"). Fix shipped as `3ce95089e` (`atomsAddendum` wired into `maiaService` `baseSystemPrompt` + `MaiaContext` + `ADDENDA_SPECS` + both context literals).

**Behavior**

Behavioral continuity influence was observed on one production turn (n=1). The response contained continuity language ("it's been threading through what you've been working on") that is consistent with the retrieved practitioner observation influencing interpretation. This establishes behavioral influence on one observed turn. It does **not** yet establish reliability across members, contexts, or time.

**Open Research Question**

Two distinct behavioral properties remain to be separated empirically:

1. **Continuity influence** — whether a prior observation shapes the present interpretation.
2. **Explicit provenance** — whether the source of that observation remains visibly answerable to its origin when surfaced.

Only the first currently has direct evidence.

**Next Discriminating Experiment**

Hold the stored practitioner observation constant while varying only the member's present articulation. Use a prompt that is relevant to the stored observation but does not itself express its central insight. The observation to evaluate is not simply whether the prior material is reused, but whether provenance appears precisely when the retrieved observation contributes information *beyond* what the member has already articulated.

No prompt-policy changes are warranted until this discriminating test has been completed. The current data are equally compatible with two competing hypotheses — that the Selection policy is already distinguishing *echoing* from *adding*, or that it is too restraint-weighted — and the experiment above is designed to distinguish them. Preserving both until it has run is the more rigorous position.

---

## 7. Naming

**"Resonant Field" or "Interactive Field" — not "Neuropod."**

"Neuropod" risks pulling the work toward brain-measurement metaphors — neural networks, cognitive scores, optimization of internal states. That is the failure mode this constitution most needs to avoid.

"Resonant Field" preserves the emphasis on environment, not instrument. The field is not measuring the person; it is making the process of inquiry more visible. The person remains the authority on meaning. The field tends the conditions.

Publicly, "Resonant Field Intelligence" is the name for this design philosophy. Internally, the Neuropod concept may be useful as a shorthand for the workspace environment — but it should never become the frame through which the research program is understood.

---

## 8. Connection to Existing Architecture

This direction names what several existing systems are already doing:

- **Corpus Callosum substrate** — parallel epistemic emission from eight voices without synthesis. Already Cat 6. This is field-sampling, not answer-generation.
- **WisdomRouter** — selective integration at ~49%. Already operating as influence on field dynamics, not broadcast synthesis.
- **`epistemological_status` column** — first implementation of the distinct-standing invariant at the schema level.
- **PRACTITIONER OBSERVATIONS prompt block** — first implementation of distinct-standing at the rendering layer.
- **`crossing_must_be_false` constraint** — structural enforcement that no atom may be collapsed into another.
- **Session-view field observer** — first implementation of the observatory layer as a practitioner-facing surface.

The resonant field architecture is not a new system to build. It is the name for what the existing architecture is becoming — once the authorization gates are passed.

---

*Cat 1 direction. Not a build spec. The field studies the conditions under which orientation develops, not the person developing. See: [DEVELOPMENT_IS_THE_CONSEQUENCE.md](../canon/DEVELOPMENT_IS_THE_CONSEQUENCE.md), [MAIA_SOVEREIGNTY_INVARIANTS.md](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md), [COHERENT_EPISTEMOLOGY_ACROSS_SCALES.md](./COHERENT_EPISTEMOLOGY_ACROSS_SCALES.md), [FROM_COLLECTIVE_INTELLIGENCE_TO_EPISTEMIC_GOVERNANCE.md](./FROM_COLLECTIVE_INTELLIGENCE_TO_EPISTEMIC_GOVERNANCE.md).*
