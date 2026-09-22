# JARVIS — WRITER'S STUDIO FLAGSHIP FLOW 01
# F1 / V10 Founder Visual Adjudication Packet v1

Candidate reviewed: `0722e044e` documentation head carrying token candidate `0b844f198`  
Evidence class entering F1: `E4 RENDERED`  
Founder gate: `E5 / E6`

This packet is an adjudication aid. It does not itself issue Founder authority.

---

# I. Source-Verified Facts

These are not human visual judgments; they are verified in the candidate source.

## 1. Primary navigation is honest

`StudioChrome.tsx` renders only:

```text
Write
Develop
Review
```

No active `Home`, `Library`, `Search`, `Explore`, or `Export` destination is present in the flagship shell.

---

## 2. Review manuscript context is structurally persistent on desktop

`flagship.css`:

```css
.fs-reviewgrid {
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(0,0.95fr);
}

.fs-context {
  position:sticky;
  top:0;
  max-height:calc(100vh - 190px);
}
```

Below `1180px` it intentionally becomes one column and the context pane becomes static.

Therefore the large-screen Review architecture is not merely a top-of-page preview: the candidate is designed to keep manuscript context beside the intelligence while the Review pane scrolls.

Runtime interaction still remains a human/browser witness.

---

## 3. Write MAIA is structurally prevented from resizing the manuscript when opened

The desktop Write composition permanently reserves `--maia-w`.

The manuscript stage uses the same reserved gutter whether MAIA is open or closed, and `.fs-maia` is absolutely positioned in that reserved space.

Therefore mounting MAIA does not, by CSS construction, change manuscript width.

Below `1024px`, the reservation is released and MAIA becomes a bottom sheet. The sheet includes the held passage and the stage adds bottom clearance.

Runtime scroll/locus restoration still remains a witness.

---

## 4. Mobile lens overflow is intentional, not accidental

`.fs-modetabs` uses:

```css
overflow-x:auto;
white-space:nowrap;
```

The mobile screenshot therefore represents a horizontally scrollable lens strip, not a clipped static row.

Whether that interaction is understandable and elegant remains a human judgment.

---

## 5. Stale state already has the required post-acknowledgement compact form

`StaleReading` implements two distinct states:

### Before acknowledgement
full stale-reading panel.

### After `Not now`
persistent `.fs-stalestrip` with:
- earlier-version disclosure;
- reread-is-member's-call trust line;
- Previous reading;
- Read again.

The required compact persistent trust state is therefore implemented structurally.

The unresolved V10 question is the proportion of the **pre-acknowledgement** state.

---

# II. Human Visual Reading

## A. Visual system

**Strong / converged**

The candidate now consistently expresses:

```text
Work         warm paper + serif
System       neutral stone + sans
Action       lucid blue
Warm accent  restrained gold
MAIA         violet
Measurement  slate
```

The token normalization accomplished its intended visual correction.

Recommendation:
> **Do not reopen the color system.**

---

## B. Cross-mode family

**Strong**

Write, Develop, and Review now visibly belong to the same Studio.

Recommendation:
> **Do not reopen the shared shell or mode-family premise.**

---

## C. Develop

**Highly resolved**

`Your novel, seen whole` + member-text opening + Continuity Map + provenance grammar produces the intended altitude change without reading as analytics.

Recommendation:
> **Hold.**

---

## D. Write

**Strong**

Manuscript remains primary. MAIA is visually contextual. Work/system/action roles are clear.

Remaining witness:
- exact scroll/locus on MAIA open/close;
- felt question: does MAIA feel beside the writer rather than like a utility sidebar?

No broad visual revision recommended.

---

## E. Review

**Architecture is now right.**

The Work is back beside the intelligence.

The remaining issues are narrow.

---

# III. Recommended F1 Adjudication

## Recommendation: `REVISE` — NARROWLY

Not a redesign.

Two visual/content changes are recommended before Founder PASS.

---

# IV. V10-R1 — Reduce Pre-Acknowledgement Stale-State Dominance

The stale state is truthful and necessary.

The issue is proportion.

At desktop it is the largest warm system region.
At mobile it consumes almost the entire first meaningful viewport before findings appear.

Required outcome:

> **Impossible to miss, but not the subject of Review.**

Preserve:
- stale fact;
- last-read date;
- Work-updated date;
- reread CTA;
- Not now;
- access to change detail;
- access to previous reading;
- sovereignty/trust line.

### Desktop
Tighten vertical rhythm and reduce chromatic mass without hiding evidence.

### Mobile
Prefer a compact factual summary in the first state, with detailed changes reachable from `See what changed`.

Example information order:

```text
This chapter changed since MAIA last read it.

MAIA read: 17 Sep
Updated: 21 Sep
4 changes since that reading · See what changed

[Read this chapter again] [Not now]

MAIA will not read the new version without your request.
Previous reading →
```

Exact wording remains subject to the Language Canon.

Do not remove historical access.

---

# V. V10-R2 — Retire `What MAIA found` as the Long-Term Review Identity

Current heading:

> **What MAIA found**

This still frames Review as MAIA's report.

That conflicts with the emerging Review product, which will hold:
- facts from the text;
- member observations;
- MAIA observations;
- followed threads.

Recommended neutral heading:

> **Observations**

Supporting copy can preserve current capability truth:

> **In the order they occur in your novel.**

Provenance then tells the member whether each item is:
- IN YOUR TEXT
- YOU NOTICED THIS
- MAIA NOTICED THIS
- etc.

If member observations are not yet implemented, do not add member-specific supporting copy prematurely.

Goal:
> Review belongs to the Work, not to MAIA.

---

# VI. Human Witnesses That Do NOT Require Revision Yet

These should remain human/browser gates rather than pre-emptive code changes.

## HW1 — Mobile lens strip

Question:

> Does horizontal lens navigation feel intentional and understandable on a real phone?

If YES:
hold.

If NO:
open a separate small affordance refinement.

Do not redesign the lens system in advance.

---

## HW2 — MAIA relational presence

Question:

> Does MAIA feel beside the writer rather than installed as a utility sidebar?

Source proves geometry stability.
Only the human witness can answer relationship/feel.

---

## HW3 — Write locus stability

Verify in browser:

```text
select passage
record scroll + passage position + manuscript width
open MAIA
close MAIA
```

Expected:
- same manuscript width;
- same selected locus;
- same scroll;
- no occlusion.

This is runtime evidence, not visual preference.

---

# VII. What Is Explicitly Frozen

A V10 revision act should NOT change:

- overall warm/cool visual system;
- dark rail premise;
- serif/sans division;
- provenance grammar;
- Continuity Map measure ramp;
- Review two-part architecture;
- Develop Overview composition;
- Write manuscript-first architecture;
- three-mode navigation;
- MAIA authority;
- facets;
- persistence;
- First Arrival;
- Intent-First.

---

# VIII. Draft Founder Decision

If the Founder agrees with this adjudication, the clean issue is:

> **FOUNDER V10 ADJUDICATION — `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01 / F1`**
>
> Against candidate evidence ending at `0722e044e` carrying token candidate `0b844f198`:
>
> **V10 = REVISE, NARROWLY.**
>
> Accept:
>
> - the visual-system normalization;
> - the warm-literary / cool-interaction / restrained-gold language;
> - the three-mode Studio family;
> - Write manuscript-first composition;
> - Develop Overview composition;
> - Review's two-part `Review intelligence + manuscript context` architecture.
>
> Authorize **F2 / V10R1 narrow visual remediation only** for:
>
> 1. reducing the pre-acknowledgement stale-reading state's visual and vertical dominance while preserving all trust evidence and historical access; and
> 2. replacing `What MAIA found` as Review's primary identity with a neutral Work-centered observation heading consistent with current capability truth.
>
> Preserve the existing compact acknowledged stale strip.
>
> Do not alter navigation, product IA, facets, persistence, provenance semantics, observation authority, First Arrival, Intent-First, or MAIA authority.
>
> Re-render:
>
> - Review desktop 1440;
> - Review desktop 1920;
> - Review mobile 390;
> - Write sanity 1440;
> - Develop sanity 1440.
>
> Return for **F1 / V10 re-adjudication**.
>
> Mobile lens-strip feel, MAIA relational feel, and exact Write locus stability remain separate human/runtime witnesses and are not authority for broader redesign.

---

# IX. Evidence Status After This Decision

If adopted:

```text
Visual law             E1 GREEN
Token normalization    E2 IMPLEMENTED
Mechanical witness     E3 PASS
Candidate renders      E4 RENDERED
V10 human review       E5 REVISE
Founder acceptance     E6 NOT YET
Canonical admission    NOT IMPLIED
Production             UNTOUCHED
```

---

# X. Product Direction

The candidate is no longer searching for its visual identity.

The remaining V10 work is:

> **reduce trust-state dominance and make Review belong to the Work rather than to MAIA.**

Everything else should stay narrow until those changes are re-rendered.
