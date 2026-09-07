# W-03 · FIRST-LOAD RENDER CHARACTERIZATION

```text
LANE      JARVIS-WRITER-ONBOARDING-PRODUCTIZATION-01
OPENED    2026-09-07 · founder ruling FR-B
STATE     PACKET OPEN · execution is the founder's act
EVIDENCE  docs/programme/WRITERS_STUDIO_FOUNDER_WALK_2026-09-07.md §3a, §3b
```

## 0 · Founder rulings that opened this

```text
FR-A  RULED YES — W-08 opens a bounded MAIA cognition / truthfulness unit.
      R-2 ("MAIA should understand Writer's Studio") remains separately
      valid and MUST NOT be cited as closure evidence for W-08.

      The distinction, as ruled: MAIA knew her knowledge of the Studio was
      limited, SAID SO — which complied with the Oath — and then supplied
      nonexistent product facts anyway. The failure occurred AFTER the
      recognition. The general shape is:

          KNOWN UNCERTAINTY → pressure to be helpful → invented specificity

      Teaching her the Studio removes this hallucination's occasion. It does
      not answer the failure mode.

FR-B  RULED YES, as VERIFY → REPAIR IF CONFIRMED → REWALK.
      ⛔ FR-B does not authorize a repair on plausibility. It authorizes a
      CAUSAL TEST. W-03 is first because it is cheap and upstream — not
      because it is established as the cause of W-05.

FR-C … FR-F  DELIBERATELY NOT RULED. Help and hover explanations are not to
      be scoped while it is unknown how much of the terminal confusion
      survives a correct first render.
```

⚠️ **Correction of record.** The run docket's leverage table said W-03 "may
dissolve W-05 outright." That phrasing leaned on a causal claim the walk does
not carry. The walk establishes two facts and no link between them: the first
load omitted from view the control the writer was being told to use, and the
gate was terminal after four unaided moves. **Plausible-first is not
cause-established.**

## 1 · Object

> Determine whether the Writer's Studio first load fails to present the
> `This work` / declaration affordance that a writer needs to proceed.

## 2 · ⭐ The discrimination that decides the whole packet

Two mechanisms produce the same screenshot and demand **different repairs and
different conclusions**:

```text
H1 · NOT RENDERED     the control is absent from the page at first paint
                      → a render / data-loading defect
                      → observation: control absent from the DOM

H2 · RENDERED, OFF-SCREEN
                      the control exists but the page is scrolled past it
                      → a scroll / anchor defect
                      → observation: control present in DOM, outside viewport,
                        page scroll position non-zero at first paint
```

**H2 is the stronger candidate on the walk's own evidence.** In the clipped
screenshot the rail was cut at `Structure 262`, the outline began mid-list at
item 3, and the writing pane began at *Chapter 2* — the whole page was scrolled
down, not partly drawn. `app/writers-studio/canvas/StructuredOutline.tsx:169`
calls `el.scrollIntoView({ block: 'center' })` on the active section, which
scrolls the nearest scrollable ancestor; if that resolves to the document, the
rail head leaves the viewport. The walk URL carried a section parameter
(`&s=1f80f706-…`), so a section was active at load.

⛔ **This is a hypothesis for the walk to discriminate, not a diagnosis.** It is
recorded because it changes the required observation: under H2 the question
*"is the control present?"* answers **yes** and would wrongly clear W-03. The
observation must therefore be **presence AND position**, not presence alone.

## 3 · DO

```text
1  capture the production runtime SHA BEFORE anything else
     ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
   (custody: the founder walk did not capture a SHA. This packet must.)

2  enter Writer's Studio from the House, normally — no direct URL

3  open the same Work, on a CLEAN first load
     no reload before the first observation
     note whether the URL carries a section parameter (&s=…)

4  at first paint, record ALL of:
     [ ] is "This work" VISIBLE in the viewport?          yes / no
     [ ] is it PRESENT in the page at all?                yes / no
         (scroll up without reloading — if it appears, that is H2)
     [ ] page scroll position at first paint               top / not top
     [ ] does the outline start at item 0, or mid-list?
     [ ] does the writing pane start at the work's head, or mid-body?

5  reload ONCE. Record the same five.

6  if reproducible, characterize which of H1 / H2 it is.
```

## 4 · DO NOT

```text
⛔ change onboarding          ⛔ add Help
⛔ add hover copy             ⛔ alter navigation
⛔ repair before reproduction establishes the defect
⛔ treat "control is present" as clearing W-03 — see §2
```

## 5 · If confirmed

```text
open the smallest defect repair
→ deploy
→ repeat Kelly's UNAIDED declaration threshold, from the House

QUESTION AFTER REPAIR
   Can Kelly now pass the gate without help?
```

## 6 · The three outcomes, and what each licenses

```text
W-03 fixed · W-05 disappears
   → much of the navigation problem at this gate was defect-induced
   → R-1 / R-3 scope shrinks, and shrinks honestly

W-03 fixed · W-05 remains
   → a genuine guidance and vocabulary problem, now isolated from defect
   → FR-C … FR-F open with a clean subject

W-03 not reproducible
   → preserve the walk evidence; investigate conditions
   → ⛔ do NOT design around an assumed cause
```

## 7 · Custody

```text
walk evidence      binds to production 2026-09-07, no SHA captured
this packet        MUST capture a SHA before reproducing
rewalk             must be unaided, from the House, on the repaired runtime
                   — a rewalk that starts at a URL proves nothing about a gate
```

## 8 · Execution

⛔ **This session cannot execute this packet.** No route to production: no `ssh`
binary in the container, `soullab.life` returns `000` through the proxy. The
walk and the rewalk are the founder's acts. This document is the instrument.

```text
NO OTHER PRODUCTIZATION UNTIL THE QUESTION IN §5 HAS AN ANSWER.
```
