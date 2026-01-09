# MAIA Clinical Supervision Streaming
## "Live without confusion" supervision that reduces cognitive load and stays evidence-anchored

**What it is**
A supervision dashboard that streams a **live transcript** and **live supervision insights** during an active session, with clear truthfulness about what you're seeing (live vs reconnecting vs fallback). Clicking an insight opens its full body and can **jump the transcript to the relevant moment**—so supervision stays grounded in observed material, not vague recall.

**What it's for**
Clinical supervisors, training directors, and clinicians who want:
- Faster orientation in-session without "hunting" through text
- Reliable recall anchored to exact transcript segments
- Decision support that preserves supervisory authority and clinical ethics

---

## Why this matters clinically
Supervision often fails in real time for one reason: **attention is scarce.**
When the supervisor has to search, scroll, re-construct, and remember—supervision becomes delayed, fuzzier, and more cognitively expensive.

MAIA's supervision streaming is designed to:
- **Reduce cognitive overhead** (less hunting, less re-reading)
- **Preserve interpretive authority** (AI as signal, not diagnosis)
- **Increase reliability under real conditions** (reconnects, dedupe, "freshness" honesty)
- **Keep insights checkable** (jump to the moment; don't argue from summary alone)

---

## What changes in practice
### 1) "Freshness truth" (no pretending)
The UI makes it obvious whether you're seeing:
- **Live** streaming
- **Reconnecting** (with the stream catching up)
- **Fallback** mode (polling / delayed refresh)

This isn't just engineering polish—it's **clinical safety**. You know what kind of confidence is warranted.

### 2) Evidence anchoring instead of memory hunting
Insights are only clinically useful when they can be **verified**.
MAIA anchors insights to the transcript (preferably exact segment IDs; otherwise time-range fallback) so you can confirm meaning in context.

### 3) Clinically-safe guidance, not authoritative interpretation
Insights are framed as:
- patterns worth noticing
- risks to consider
- intervention opportunities to explore

…and they are designed to **return you to observed language and interaction**, not replace judgment.

---

## How it feels in practice
**Vignette 1: Rupture moment without losing the session**
A supervisee misses a subtle rupture. You see an insight, click it, and you're brought to the exact moment—so you can name the shift and coach a repair move without pausing the session to search.

**Vignette 2: Risk signal that stays evidence-grounded**
A risk-related phrase appears. Instead of a blunt alarm, the system highlights the segment, surfaces context, and invites verification—supporting clarity and containment without turning the tool into an authority.

**Vignette 3: Technique coaching with minimal cognitive overhead**
You're shaping a supervisee's reflective listening. You click two anchored segments, compare micro-moments, and generate a short practice plan—without re-reading the entire transcript.

**Vignette 4: Documentation that doesn't distort the clinical record**
After session, you export a supervision-ready summary that keeps a clean separation between:
(a) observed excerpts, (b) hypotheses, and (c) recommended next actions.

**Vignette 5: Late-joining supervisor (mid-session catch-up)**
You join 18 minutes in. The view clearly signals "what's live," highlights major moments, and gives you rapid orientation—without requiring the supervisee to retell the story.

**Vignette 6: Post-hoc review with the supervisee (learning loop)**
Supervisor + supervisee review a flagged segment together. The discussion stays anchored in observed material—so learning is concrete, not verdict-based.

**Vignette 7: Alliance repair tracked across sessions (continuity of care)**
Across sessions, you can locate prior rupture/repair attempts quickly. The narrative remains evidence-based rather than dependent on imperfect recall.

---

## Trust calibration
The safest clinical posture is: **"AI as signal, not diagnosis."**
This system is built to support that stance.

### What you can safely rely on
- **Live-state honesty:** the UI tells you if you are live, reconnecting, or in fallback mode.
- **Exact evidence access:** when a segment anchor exists, the jump is precise.
- **Auditability:** insights can be checked against transcript language (you don't have to "believe" the summary).
- **Workflow support:** reduces cognitive load so your attention stays on clinical process.

### What you must verify
- **Meaning and intent:** confirm the insight's claim by reading the anchored segment.
- **Clinical significance:** decide what matters (and what doesn't) for this client/system.
- **Risk interpretation:** treat risk signals as prompts for assessment—not conclusions.
- **Context:** check adjacent segments; a single excerpt can mislead without surrounding interaction.

**Rule of thumb:**
If you wouldn't document it without verifying the moment, don't document it because the insight said it.

---

## A simple workflow
**During session**
1. Monitor live transcript and state indicator (live/reconnecting/fallback).
2. When an insight appears, click it to open details.
3. Jump to the anchored segment and verify in context.
4. Coach or intervene with the supervisee using observed material.

**After session**
1. Review anchored highlights (rupture/repair, risk signals, technique moments).
2. Export a supervision-ready summary for documentation/training.
3. Carry forward patterns intentionally across sessions (continuity).

---

## Safety boundaries
- This system is not a clinician. It does not replace supervision, assessment, or documentation standards.
- It is designed to **protect authority**, **reduce cognitive load**, and **increase checkability**—not to "be right."

---

## Where to go deeper
For architecture, failure modes, and technical contract details, see:
- `docs/supervision/CLINICAL_SUPERVISION_STREAMING.md`
- `docs/supervision/ARCHITECTURE.md`
- `docs/supervision/WHY_THIS_IS_HARD.md`
