# Soullab Studio — Practitioner Loop

## Purpose

The Practitioner Loop is the systematic workflow that transforms lived client experience into structured council synthesis and targeted intervention design.

It exists to reduce the gap between what actually happens in the field and what the council is synthesizing. Without this loop, council output is shaped primarily by practitioner summary — which is inevitably selective, partially projective, and filtered through the practitioner's own interpretive framework. With the loop, the council works from layered evidence: the client's own words, discrete field signals, and named practitioner observations.

The loop is not bureaucracy. It is precision.

---

## The Loop

```
Field Experiences
      ↓
Client Inquiry
      ↓
Practitioner Observations
      ↓
Council Synthesis   ←── (Decisions)
      ↓
Intervention Hypothesis
Practice Design
Observation Window  ←── (Changes)
      ↓
Follow-up Intention
      ↓
(next session) → Field Experiences again
```

Each stage feeds the next. Each stage can function alone if others are absent — the council degrades gracefully.

---

## Stages

### 1. Field Experiences / Field Signals

**What it is:** Discrete signals from the field between sessions — somatic, relational, behavioral, emotional, symbolic, cognitive.

**Source:** Can come from the client (self-report), the practitioner (observation), or MAIA (future).

**Why it matters:** The pattern the council needs to see is not always visible in session. Between-session experience carries the precursor signals, the activation moments, the quiet shifts. These are primary data.

**Examples:**
- `[somatic/client]` tight chest urgency before speaking, intensity 8/10
- `[relational/client]` interrupted spouse twice during emotionally charged conversation
- `[emotional/practitioner]` client seemed relieved after naming the urge
- `[symbolic/client]` dream of being in a room where no one could hear

**Design principle:** Keep entries short and specific. The council reads them. Signal-to-noise matters.

---

### 2. Client Inquiry

**What it is:** Structured questions for the client to answer before a council session — surfaces the pre-reflective layer that practitioner summary misses.

**Why practitioner summary is insufficient:** Practitioners compress, reframe, and interpret. The council working from practitioner summary alone is synthesizing a synthesis — one layer removed from the client's actual experience. Client inquiry gives the council direct access to first-person phenomenological data: the client's own words, in their own framing.

**Why it matters:** The client's words often contain the answer the council is searching for. "I feel like if I don't speak immediately the moment will be gone forever" is more precise than "client shows urgency in conversation."

**Prompt sets available:**
- Conversational Urgency / Interruption
- Grief / Loss Beneath Behavior
- Somatic Precursor Mapping
- Relational Activation
- Hypnotherapy / NLP Preparation

**Design principle:** The practitioner selects a prompt set before the session or between sessions. The client answers in 5–10 minutes. The council sees the answers verbatim, labelled as first-person phenomenology.

**Absence handling:** If no inquiry is recorded, the council notes the gap. It does not infer client experience from practitioner summary alone. Honest absence is more useful than confident inference.

---

### 3. Practitioner Observations

**What it is:** Named, typed second-person observations from the practitioner — distinct from general session notes.

**Why distinct from notes:** Notes are prose summaries. Observations are named events. The difference matters for the council prompt: "client interrupted twice during emotionally charged material" is categorically different from "client was talkative." The council can weigh named events as hypothesis-generating evidence; it cannot do the same with impressionistic prose.

**Observation types:**
- In session
- Relational field
- Somatic shift
- Pattern notice
- Interruption
- Repair
- Other

**Design principle:** One observation, one thing. Keep them short. The council reads them. "Visible chest tightening before speaking about mother" is better than "client seemed nervous when family came up."

**Projection note:** Practitioner observations are labelled in the council prompt as hypothesis-generating, not confirmed fact. The council is instructed to account for practitioner projection when weighing second-person data.

---

### 4. Council Synthesis (Decisions)

**What it is:** The AIN council consultation, now working from the full evidence bundle: client inquiry + field signals + practitioner observations + prior notes.

**What changed:** Prior to this upgrade, council worked from a flat practitioner summary. Now it receives segmented, sourced evidence:
- CLIENT INQUIRY — first-person phenomenology (primary evidence)
- FIELD SIGNALS — discrete observations (secondary evidence)
- PRACTITIONER OBSERVATIONS — second-person, hypothesis-generating
- NOTES — prior context

**Prompt constraints (applied automatically):**
- Prioritize direct evidence over practitioner interpretation
- Distinguish inferences from confirmed evidence
- Name tensions and uncertainties — do not resolve them prematurely
- Suggest the next smallest useful intervention hypothesis
- If data is absent or sparse, say so
- Honest uncertainty is more useful than confident inference

**Absence handling:** If any source is missing, the council proceeds with what is available. It does not fill gaps with false certainty.

---

### 5. Intervention Design (Changes)

**What it is:** The structured planning layer for what to do next — distinct from the Personal Portal's change tracking.

**The question this answers:** What are we testing? With what modality? What would count as success? What is the risk? How long before reviewing?

**Fields:**
- **Title** — short name for this experiment
- **Hypothesis** — what we believe is happening and what we are testing
- **Modality** — hypnosis, NLP, somatic, relational, journaling, MAIA practice, mixed, other
- **Instructions** — step-by-step practice or protocol
- **Success signals** — observable markers (not clinical claims)
- **Risk / caution** — what to watch for
- **Observation window** — how long before reviewing

**Prompt constraints (applied to Changes council):**
- Propose the next smallest useful intervention, not a complete treatment plan
- Distinguish witness-first (awareness work) from technique installation
- Name success signals: observable markers, not clinical claims
- Name one risk/caution
- Specify an observation window
- If data is sparse, recommend gathering evidence first

**Status tracking:** draft → active → completed / abandoned

---

### 6. Follow-up Intention

The practitioner's intention for the next session, arising from the intervention design. Stored in the `follow_up_intention` field on both ChangeExperiment and the parent Change record.

---

## Practitioner vs Personal Portal

These are different instruments for different purposes.

| Dimension | Personal Portal | Practitioner |
|-----------|----------------|--------------|
| Orientation | Existential, inward | Observational, interventional |
| Decisions | What is the person discerning? | What is the practitioner discerning from evidence? |
| Changes | How is life shifting? | What experiment is being designed? |
| Council input | Practitioner-written context | Segmented evidence bundle |
| Success | Personal clarity | Observable change in field |

They use the same philosophical vocabulary — Decisions, Changes, Council — but the internal structures serve different functions. This is deliberate. The shared vocabulary maintains platform coherence. The different structures maintain functional precision.

---

## Responsible Use of Hypnotherapy / NLP Templates

The built-in intervention templates are practitioner-facing starting points, not client-facing prescriptions.

They are designed for practitioners who already understand:
- When to witness before installing technique
- How to recognize dissociation risk
- How to close regression work safely
- What contraindications apply to their specific client

The templates include:
- When to use
- Cautions
- Suggested steps
- Signs it is working

None of these constitute medical or clinical claims. They are structured starting points that the practitioner adapts to the individual.

**The cardinal rule:** Witness first. Technique second. Do not install a pattern interrupt before the phenomenology is understood.

---

## Integration Points (Code)

| What | Where |
|------|-------|
| Domain types | `lib/studio/practitioner/types.ts` |
| Built-in prompt sets | `lib/studio/practitioner/promptSets.ts` |
| Intervention templates | `lib/studio/practitioner/interventionTemplates.ts` |
| DB migration | `database/migrations/20260312000001_studio_practitioner_loop.sql` |
| Field signals API | `app/api/studio/field-signals/` |
| Observations API | `app/api/studio/practitioner-observations/` |
| Client inquiry API | `app/api/studio/client-inquiry/` |
| Change experiments API | `app/api/studio/changes/[id]/experiments/` |
| Evidence bundle loading | `app/api/studio/decisions/[id]/consult/route.ts` + `app/api/studio/changes/[id]/consult/route.ts` |
| Prompt assembly | `lib/studio/leadership/situationTypes.ts` + `lib/studio/changes/changeTypes.ts` |
| UI components | `components/studio/practitioner/` |
