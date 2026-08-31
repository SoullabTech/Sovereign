# Personal Field — Case-Study Gathering Protocol

**Date:** 2026-06-15
**Status:** Diagnostic instrument. **Precedes redesign.** Produces the evidence surface the redesign must answer to. **Amended 2026-06-15** to co-register the verb-organization axis with the object model (symmetric falsifiability — see §0).
**Relationship to existing work:**
- Re-grounds the **13 case studies** and holds the **8-object taxonomy** in `docs/specs/PERSONAL_FIELD_REDESIGN_2026-06-15.md` §3 as a *hypothesis*, not a settled frame.
- Companion to `docs/specs/PERSONAL_PORTAL_CASE_STUDY_EVALUATION_2026-06-14.md`.
- Method per memory `feedback_diagnose_before_build_symptom_vs_model`; direction per `project_personal_field_attend_to_life`.

---

## 0. Constraint & stance (the spine)

> **Do not ask people what features they want. Ask what they were tending to.**

- The unit of evidence is an **episode of attending**, not a feature wish, not a screen, not a tab.
- **Open-code first.** The eight proposed field-objects — People · Commitments · Creations · Questions · Decisions · Practices · Inner states · Places of belonging — are a **comparison lens applied in §5**, never the coding frame in §1–§3. They stay sealed until clustering.
- The design telos is *to help a person attend to their life*, not to make them file it. So we capture **what would have helped lightly** — never **what taxonomy they would build**.
- **Two architectures, equal standing (co-registered 2026-06-15).** The eight-object model **and** a **verb-organization** model — the field may be organized by the person's *relationship to* a thing (waiting-on, returning-to, avoiding), not by what the thing *is* — are now tested **symmetrically**. The protocol must be able to **falsify the object model in favor of the verb model**, not merely confirm-or-deny objects. Neither is the coding frame (§1–§3); both are decided by dual clustering (§5) and an explicit axis rule (§6). *"Verb surface over a noun substrate" stays a hypothesis with a decision rule — never quietly upgraded to architecture.* (Layers: Layer 1 = open coding §1–§3; Layer 2 = dual clustering §5; Layer 3 = axis decision §6.)
- This instrument closes three deviations already present in the current redesign work:
  1. **Elicitation gap** — the 13 cases were framed as *"what you see when you open the page"* (navigation-shaped). That is the exact framing this protocol exists to escape.
  2. **Taxonomy over-confirmed** — the 8 objects are presented as derived; they must be re-tested as a prior. Candidates that already surfaced in the raw cases (Loss/grief, Body/health, Resources) were folded into Threads/Inner-states and must be tested as *distinct* (§5–§6).
  3. **Redesign jumped ahead** — "Cut 0 locked" preceded episode-grounding. No build is licensed until §6 produces a confirmed-or-revised model.

**Definition of done:** ≥10–15 episode-grounded cases coded · **dual-axis clustering run — object + verb (§5)** · crosswalk tables complete (§5) · **axis decision recorded — object / verb / hybrid (§6)** · §6 decision recorded per hypothesized object (and per verb-class if verb/hybrid) · a field model written in the data's own language — **object list, verb list, or verb-surface/noun-substrate**.

---

## 1. Interview prompt set

**Goal:** surface concrete, recent episodes in the person's own words, anchored on **verbs not nouns**. Funnel: warm recall → episode elicitation → per-episode deepening → light "what was missing." Never "what feature."

**Opening frame (say aloud):**
> "I'm not going to ask what you'd want this to do. I'm going to ask about moments — recent times you were tending to something in your life. Specific and small beats important and abstract."

**Episode elicitation (get 3–5 episodes per participant; pick prompts, don't run them all):**
- "In the last few days, when did your attention land on something you're carrying — a person, a decision, a piece of work, a worry? Walk me through one."
- "When did you last open *anything* — notes, your phone, a calendar, your own head at 2am — because something was tugging at you? What was it?"
- "What's something you keep coming back to that doesn't have a home anywhere?"
- "When did you last *avoid* attending to something you knew was there?" *(elicits the `avoided` state)*
- "What did you tend to this morning, before anyone needed anything from you?" *(elicits mundane/low-drama attendings)*

**Per-episode deepeners (the capture spine — ask for each episode):**
| Ask | Captures |
|---|---|
| What were you actually doing or trying to do? | **attending verb** (gerund) |
| What was it about — who or what? | **object of attention** (concrete) |
| How did it sit with you — heavy, warm, nagging, neutral? | **charge** (tone + intensity) |
| Is that open, in-motion, settled, recurring, or something you're avoiding? | **temporal state** |
| What did you reach for to deal with it? | **reached for** |
| What was missing — what did you wish existed in that moment? | **missing** |
| If something could have helped, what would it do *without* turning your life into a to-do list? | **help-without-over-organizing** |

**Interviewer rule:** when a participant answers with a feature ("I'd want a reminder system"), redirect to the episode — "What were you trying not to forget, and what actually happened?"

**Variant — 3-day attending diary (recommended for ≥1/3 of the sample):** participants jot one line whenever they notice themselves tending to something. Catches the `avoided` and mundane states that retrospective interviews under-report. Each diary line is then deepened (table above) in a 15-min follow-up.

---

## 2. Case capture template

One filled template per episode. Verbatim-anchored, field-named.

```
CASE ID: PF-<nn>
SOURCE: <participant code> · <date> · <interview | diary | self>
RAW (their words, 1–3 sentences, verbatim):
  "..."

EPISODE (one neutral line — what happened):
ATTENDING VERB (their action, gerund): e.g. deciding / tending / returning-to / making /
  worrying-about / repairing / remembering / preparing / releasing / avoiding
VERB-TYPE: [ behavioral — inferable from activity | meaning-laden — member-owned ]  (see §4 guard)
OBJECT OF ATTENTION (concrete, what it was about):
CHARGE (emotional/relational tone + intensity 0–3):
TEMPORAL STATE: [ open | active | settled | recurring | avoided ]
REACHED FOR (what they used — app / person / notebook / nothing):
MISSING (what they wished existed, in the moment):
WHAT WOULD HAVE HELPED (lightly — without over-organizing the field):

OPEN CODE (pre-cluster — see §3; participant's words, NOT one of the eight):
  primary object-label:
  secondary (only if genuinely dual):
  ambiguity / boundary flags:

PROVENANCE: verbatim ☐  paraphrased ☐  inferred ☐   (inference MUST be marked)
```

**Temporal-state definitions (for coder consistency):**
- **open** — unresolved, no action yet (a question sitting)
- **active** — currently in motion (a project being worked)
- **settled** — resolved/decided, may carry residue (a decision made, a thing done)
- **recurring** — returns on a cycle (a practice, a standing relationship)
- **avoided** — present in awareness, deliberately not attended (the thing you flinch from)

---

## 3. Coding method — open coding, before any clustering

**Pass A — Open code, blind to the eight.**
- Label each case's **verb** and **object** in the participant's own words. Do *not* map to People/Commitments/etc. If a coder catches themselves writing "Commitments," stop and write the literal thing ("the promise to call his sister back").
- One primary object-label **and one primary verb-class** per case; secondary only if truly dual.
- Two coders independently where possible. Reconcile by **discussion**, not by voting into pre-set buckets.
- Coders work from a sheet that **does not list the eight.**

**Pass B — Attribute code (structured).**
- Tag the fixed dimensions: verb-class, temporal state, charge, reached-for-type, missing-type. These are closed; the **object-label stays open**.

**Emergent glossaries (two, equal standing).** Maintain *two* living lists as they appear (verbatim-derived): **object-labels** and **verb-classes** (the gerunds from the capture template). Coin a new label in either list whenever existing ones don't fit — **bias toward splitting over forcing** during open coding. Merging happens later, in §5. Neither list is privileged: the verb glossary is **not a sub-attribute of objects**, it is a co-equal candidate organizing axis.

**Boundary cases.** If two coders give materially different object-labels to the same case, flag it as a *boundary case*. These are the most informative inputs to §6 — do not resolve them by fiat.

---

## 4. Bias guards (this is where it fails quietly)

- **Feature-leak guard** — strike any case whose "object" is actually a UI element ("a better calendar"). Re-elicit the underlying episode, or discard.
- **Eight-object contamination guard** — the eight are sealed through §1–§3. Coders never see the list until §5.
- **Navigation-framing guard** — when a participant starts designing ("you should have a tab for…"), redirect to the last concrete episode. Design-talk is not data.
- **Salience guard** — importance ≠ frequency. Deliberately solicit small/mundane and `avoided` attendings, or the taxonomy skews toward crises.
- **Interviewer-vocabulary guard** — never introduce object-nouns ("so that's a *commitment*?"). Mirror the participant's words.
- **Inference guard** — anything not said is marked `inferred`; inferred objects are excluded from primary counts (§6), used only as secondary signal.
- **Meaning-attribution guard (behavioral vs meaning-laden verbs).** Verbs split into two classes, and the system's licence differs by class — this is a **guardrail, not a hypothesis** (Meaning Sovereignty, `project_meaning_sovereignty_principle`):

  | Behavioral (inferable from activity) | Meaning-laden (member-owned) |
  |---|---|
  | returning-to · reopening | grieving · accepting |
  | waiting-on · tracking | forgiving · letting-go |
  | avoiding | holding-sacred |

  The system may legitimately *notice* a behavioral verb ("you've reopened this three times"); it may **never conclude** a meaning-laden one ("you are grieving"). In coding: tag each case's verb-type (§2). Meaning-laden verbs are admissible as **member-stated only** (never `inferred`), and a behavioral verb must not be relabeled into a meaning verb during clustering.
- **Re-grounding guard (for the existing 13)** — each of the current 13 cases is admissible only if a real episode sits behind it. Triage: (a) **keep** — re-code from its episode through §2; (b) **re-gather** — has no episode, only a page-view framing → re-elicit or discard. Seed the strongest cases from Kelly's own real episodes ("last time you opened Personal Field, or wished you had a place for something — what were you tending to?").
- **Sample guard** — name who is in the 10–15 and who is not (member / practitioner / new user). A home page that emerges only from power users describes a different field. State the population the conclusion is licensed for.

---

## 5. Dual clustering pass (now, and only now, the priors enter)

Run **two independent bottom-up sorts** over the same cases — neither privileged. The eight-object model and the verb-organization model enter here as **co-equal comparison lenses**, never as the coding frame (§1–§3).

**Step 1 — Object sort.** Card-sort the verbatim **object-labels** by affinity. Let clusters form from the data; name each in the data's language. Per cluster record: case count, temporal-state distribution, typical charge, dominant verb-class, recurring "what was missing."

**Step 2 — Verb sort (independent).** Separately card-sort the verbatim **verb-classes** by affinity — ideally a second coder, or the same coder after a break, working from a sheet that hides the object sort. Per cluster record: case count, **how many distinct objects the cluster spans**, temporal-state spread, typical charge, behavioral-vs-meaning mix (§4), recurring "what was missing." *Spanning many objects is the central verb-axis signal.*

**Step 3 — Overlay the priors.**
- *Object axis:* place the hypothesized eight beside the emergent object-clusters — does each **match** one cleanly, **split** across several, **merge** two, or fall **outside** all eight?
- *Verb axis:* mark which verb-clusters **cut across** multiple object-clusters, and which are behavioral vs meaning-laden.

**Step 4 — Crosswalk tables.**

*Object crosswalk:*
| Emergent object-cluster (data's words) | Nearest hypothesized object | Relationship (match / split / merge / orphan) | Cases | Participants |
|---|---|---|---|---|

*Verb crosswalk (the axis test):*
| Verb-cluster (data's words) | # distinct objects spanned | Tighter than object clustering here? | Behavioral / meaning | Cases | Participants |
|---|---|---|---|---|

**Step 5 — test the known pressure points explicitly:**
- **Object-stable / relationship-moving** — for every object appearing in ≥2 cases, did the **object stay constant while the verb changed** (Nathan: made-with → waiting-on → present-to)? Count them. Frequent object-stable/verb-moving cases are direct evidence that the *relationship*, not the object, is the moving — and more informative — dimension.
- **Commitments vs Decisions** — distinct, or one object in two stances? (Temporal state may distinguish: `open` = Decision; `settled`-with-future-obligation = Commitment — note this is itself a *verb/stance* distinction on one object, i.e. a verb-axis signal.)
- **Places of belonging** — a standalone object, or a *charge/quality* attaching to People/Practices?
- **Orphans** — do Resources/means, Loss/grief, Body/health recur as their own clusters rather than folding into Threads/Inner-states? (They appeared in the raw 13 — see deviation #2.)

---

## 6. Decision rules — confirm / revise / reject the field model

**Pre-registered** (so the conclusion is not fitted to the hypothesis after the fact). Suggested thresholds for an N≈10–15 / 5–8-participant sample — tune before running, not after.

**Step 0 — Axis decision (decided BEFORE any per-object rule).** Using §5 Steps 2–5, decide how the field is *primarily organized*. This question now has **equal standing** with the object question — the protocol must be able to choose the verb model, not merely confirm-or-deny objects.

- **Verb-organized** — **≥3 verb-classes each cluster cleanly across ≥3 distinct objects**, the verb crosswalk is tighter / more predictive than the object crosswalk (fewer boundary cases, more stable verb·temporal signature), **and** object-stable/verb-moving cases (§5 Step 5) are common.
- **Object-organized** — object clusters are clean and stable; verb-classes mostly stay *within* single objects (don't span). The eight (revised) carry the model.
- **Hybrid — verb surface over noun substrate** — objects are the stable substrate **and** ≥3 verbs span them: the home *surfaces* the current verb while *storing* the object. (This is the redesign mockup's implicit structure — admissible only if **earned here**, never assumed. "Verb surface over noun substrate" stays a hypothesis until this rule fires.)

Record the axis with its evidence. Then run the per-object rules below; if the axis is **verb-organized or hybrid**, run the per-verb rules too.

**Per hypothesized object, classify on the evidence:**
- **Confirmed** — a distinct cluster in **≥4 cases across ≥3 participants**, with a stable verb/temporal signature.
- **Merge** — two hypothesized objects share one cluster with no reliable inter-coder boundary → collapse (record merged definition + any distinguishing attribute).
- **Split** — one hypothesized object fragments into ≥2 clusters with different verbs/temporal-states/charges → split (e.g. Practices → daily-discipline vs occasional-ritual).
- **Revise** — cluster exists but the hypothesized name mis-describes it → rename in the data's language.
- **Reject** — <4 cases, or appears only when interviewer-led → drop from the model.
- **Add** — an orphan cluster meets the Confirmed threshold but matches none of the eight → add as a new field-object.

**Per verb-class (run only if Step 0 = verb-organized or hybrid):** apply the same Confirmed / Merge / Split / Revise / Reject / Add tests to verb-clusters. *Confirmed verb* = a distinct verb-cluster **spanning ≥3 objects** in **≥4 cases across ≥3 participants**, stable temporal/charge signature. Tag each confirmed verb **behavioral or meaning-laden** (§4): this fixes whether the system may *infer* it ("reopened 3×") or must let the member *name* it ("you are grieving" — never inferred).

**Model-level decision:**
- The **axis decision (Step 0)** governs what "the model" *is*: an object list, a verb list, or a verb-surface/noun-substrate pairing. The rules above apply to whichever axis (or both) Step 0 selects.
- **Object-organized, ≥6 of 8 confirm, orphans minor** → the eight (lightly revised) become the field-object model; redesign may proceed against it.
- **Verb-organized, or 3+ merges / splits / adds on either axis** → the priors were useful but the real model differs → rewrite the model from the clusters (in the data's language) and run a small second sample before redesign.

**Deliverable either way:** a field model grounded in episodes, each element carrying its (verb signature · temporal-state profile · typical charge · what-was-missing · behavioral-or-meaning). That profile is exactly what a home screen should surface — and what the redesign now answers to.

> The home page is **not decided here.** This protocol decides **what the home page is made of — and whether it is made of objects or of the person's relationships to them.** Redesign (and the proposed Cut 0) is licensed only after §6 produces a confirmed-or-revised model.
