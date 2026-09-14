# WHOLE-FIRST-RETURN CENSUS — instrument

```text
Authority          FR-W5 · b4bb6252
Mode               READ ONLY
Subject            Whole-view first asked return
Failure witnessed  first SHOW CHANGE reaches the section but NOT the exact locus
Repair             ⛔ NOT YET PERMITTED
```

```text
RULE
Do not begin with a theory of the defect.
Trace the live path first.
⛔ Do not edit code, tests, state, or schema during this census.
```

### ⚠️ Operational note — this census is founder-side

⛔ The subject is **not present in this checkout** (charter §0, unchanged at `dd7059b4`). The
Whole-view return path, its components and its tests live on the Mac Studio runtime. Jarvis holds
the instrument and adjudicates what comes back; it reads none of it.

### ⚠️ Two carry-forward cautions from this programme's own failures

```text
BCS-M1   ⛔ Do NOT conclude a responsibility is absent because a NAME is absent.
         Search for the RELATION, not the vocabulary. This lane has made that error before.

F6       ⛔ A same-named symbol in Whole and Section is NOT thereby the same object.
         Same-name ≠ same-thing is the schema-identity hazard, one layer up.
```

---

## C1 — Identify the actual surface

> What component renders `SHOW CHANGE` in Whole view?

```text
• file
• component / function
• event handler ACTUALLY invoked
• relevant props / state received
• whether Whole and Section share the same control, wrapper, or handler
```

⛔ The last line is a finding, not a formality — record *shared*, *wrapped*, or *separate*, and say
how you established it.

## C2 — Trace the first invocation end-to-end

> On a cold Whole-view first `SHOW CHANGE`, trace every step from click to viewport movement.

Record **in execution order**:

```text
click
→ handler
→ state / action dispatched
→ proposal / change lookup
→ section / locus resolution
→ reveal / jump request
→ render / effect / ref consumption
→ scroll / focus call
→ request reset / cleanup
```

For every transition:

```text
• file + symbol
• value passed
• condition / guard
• synchronous · effect-driven · deferred · render-dependent
```

⛔ **No explanation yet. Just the path.**

## C3 — Identify the exact navigation target

> What does Whole view actually ask to reveal on first invocation?

Established **from code, not from naming**:

```text
A  section shell
B  exact text locus
C  element / ref representing the proposal
D  intermediate identifier resolved later
E  something else
```

```text
Record the EXACT VALUE and its REFERENT.
```

⭐ This matters because the witnessed failure was **SECTION-ADDRESSED**, not *nothing happened*.
Something was asked for and reached. The question is **what**.

## C4 — Compare Whole / first with Whole / second

> What is materially different before the **second** invocation?

Diff **runtime-relevant state only**:

```text
• refs now mounted / registered        • render completed after first invocation
• locus now resolved                   • effect dependency changed
• state initialized by first invocation• selection / proposal state changed
• section became active                • pending jump / reveal token changed
• measurements now available           • scroll container identity changed
```

⛔ **Do not conclude which difference causes the defect. Produce the DIFFERENCE SET.**

## C5 — Compare cold Whole / first with cold Section / first

> Trace cold Section / first through the same stages as C2, then produce the **smallest structural
> diff**.

```text
WHOLE-FIRST path   versus   SECTION-FIRST path
Record only differences CAPABLE OF AFFECTING LOCUS EXPOSURE.
```

The witness already established:

```text
Cold Whole / first     SECTION-ADDRESSED — FAIL
Cold Section / first   LOCUS-ADDRESSED   — PASS
```

⛔ The census must explain what the substrate **actually does differently** — ⛔ **without assuming
the view itself is causal.**

## C6 — Census the reveal guard

> Locate the mechanism distinguishing **automatic reveal acts** from **voluntary member scrolling**.

```text
• owning file / symbol        • who clears it
• state used                  • what automatic acts it PERMITS
• who sets it                 • what voluntary acts it REFUSES to override
```

Confirm whether the Whole-first path crosses this mechanism differently from:

```text
Whole-second · Section-first · passive scroll
```

```text
⛔ DO NOT MODIFY IT. Positional sovereignty is a SEALED PASS in both views.
```

## C7 — Establish mount / ref readiness

> At the moment Whole-first requests the locus, does the exact target already exist and resolve?

For each relevant target / ref:

```text
requested at:      available at:
registered at:     consumed at:
```

```text
If readiness cannot be established statically → mark UNKNOWN.
⛔ DO NOT INFER "race condition" FROM UNKNOWN.
```

## C8 — Establish whether any first-use initialization exists

> Enumerate code executing **only**, or **differently**, before the first successful reveal.

```text
• lazy initialization      • proposal hydration        • cached locations
• first render effects     • DOM measurement           • previous / active proposal state
• one-shot state           • registration maps
• default values           • view initialization
```

⭐ This tests **the surviving possibility** recorded at the Gate A close: a **view-independent
initialization defect masked by Section view**. C8 is the cell that keeps that reading alive
against the more comfortable "it's a Whole-view bug."

## C9 — Find existing tests

> What tests currently exercise this return path?

For each test:

```text
• file                              • cold or already-initialized
• scenario                          • first or subsequent invocation
• Whole or Section                  • expected target: SECTION or EXACT LOCUS
• whether voluntary scrolling is tested
```

```text
⭐ Explicitly identify the MISSING TEST corresponding to the witnessed FAIL, if absent.
```

## C10 — Locate the narrowest repair boundary — **without repairing**

> After C1–C9, name the smallest code boundary at which the witnessed requirement could be restored.

```text
⛔ DO NOT WRITE THE FIX.

Output only:
  candidate boundary:
  why this boundary:
  protected behaviours touching it:
  tests that would falsify an unsafe change:
  uncertainties still unresolved:
```

⭐ *protected behaviours touching it* is checked against the **FR-W5 invariant set**, not against
judgement.

---

## Required census conclusion

```text
MECHANISM STATUS

ESTABLISHED:
  [only facts DIRECTLY READ FROM CODE]

NOT ESTABLISHED:
  [remaining unknowns]

SMALLEST CANDIDATE REPAIR BOUNDARY:
  [file / symbol / path]

FR-W5 INVARIANTS AT RISK:
  [none / named set]

IMPLEMENTATION:
  NOT PERFORMED
```

---

## ⛔⛔ HARD STOP

```text
⛔ STOP AFTER THE CENSUS.

Do NOT turn "smallest candidate repair boundary" into an edit in the same act.
Return the census for adjudication FIRST.
```

> ⭐ This preserves exactly what FR-W5 established: **the symptom licenses an investigation of
> mechanism — not a guessed mechanism, and not yet a patch.**
