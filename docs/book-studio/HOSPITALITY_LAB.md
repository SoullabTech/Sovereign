# Hospitality Lab

A research notebook and **operational jurisprudence**.

Not a UX log. Not a feature tracker. The governing procedural rule that enforces the Constitution's principles in practice:

> No structural conclusion without structural evidence.  
> No experiential conclusion without experiential evidence.  
> No design iteration without both.

The Constitution says: *preserve sovereignty, do not overclaim, let human experience retain authority.* The Hospitality Lab turns those into procedure.

---

## Structure

Each experiment has exactly five sections:

| Section | Content |
|---|---|
| **Structural change** | What changed in the environment |
| **Prediction** | What you expect readers to report |
| **Disconfirmation** | What reports would show the prediction was wrong |
| **Observation** | What readers actually reported |
| **Decision** | What changed because of the evidence |

The **disconfirmation** entry is not optional. It protects the Lab from becoming a confirmation log. It turns each experiment into a place where the architecture can be genuinely surprised by the people who inhabit it.

**Standing review question for every experiment:**

> *What observation would convince us we are wrong?*

---

## Protocol

**Reader selection:** 3–5 first-time readers. No prior knowledge of the environment, the design philosophy, or MAIA. Familiar voices may participate but should not dominate.

**Instruction given:** "Read until you naturally stop. Afterwards I'll ask you five questions." Nothing else. No framing. No intent.

**Five questions (collected after, never before):**
1. When did the book begin?
2. What interrupted it?
3. What disappeared?
4. What remained visible?
5. What, if anything, made you leave?

No interpretation in the question set. No leading. Just transcript.

---

## The orientation window

Each environment has an **orientation window** — the interval during which the reader is still deciding: *"What kind of place is this?"*

This is not a fixed duration. A novel may need thirty seconds. A poem may need five. A philosophical text may need two pages. The invariant is the transition, not the elapsed time. 

The architecture's task is to shape what happens during that window — without engineering the outcome.

---

## One laboratory, multiple thresholds

As the platform creates additional environments, the protocol does not change. What changes is the threshold under investigation.

| Environment | Threshold |
|---|---|
| Book | "May I dwell with this text?" |
| Conversation | "May I speak here?" |
| Portrait | "May I recognize myself here?" |
| Sanctuary | "May I entrust something here?" |
| Journal | "May I think aloud here?" |
| Calendar | "May I inhabit this structure?" |
| Living Field | "May I become in this place?" |

Do not create seven methods. Keep one laboratory. The threshold is what changes.

---

## The discipline

One structural change → collect reports → **one subtraction** → repeat.

If a cycle returns multiple candidates for change, choose the one that creates the simplest conditions for the next thing to be discovered. Do not optimize. Do not improve. Remove what blocks dwelling.

---

---

## Experiment 1 — Book Reading Environment (PR #523)

**Date:** 2026-06-23  
**Status:** Observation pending — environment deployed, readers not yet recruited  
**Threshold:** "May I dwell with this text?"  
**PR:** https://github.com/SoullabTech/Sovereign/pull/523

---

### Structural change

Created `/book-studio/book` — a dedicated reading environment outside visible Studio chrome.

Five subtraction gates implemented:
1. **No competing voice** — no MAIA surface, no interpretive affordances, no "ask me" prompt
2. **No retrieval posture** — no search, no index, TOC hidden behind a near-invisible glyph
3. **No scroll-world** — page-turn only (arrow keys, swipe, click half-screen); scroll wheel suppressed
4. **No visual urgency** — single faint exit link ("← Read Flow", 12% opacity), nothing else
5. **Remember without spectacle** — session-local position restore via `sessionStorage`; no percentage, no progress bar

Typography unchanged from Read Flow. Margins widened to 12vw each side. Fade through near-black (~150ms) between pages. "Enter Book" threshold link at bottom of Read Flow (15% opacity, small-caps).

---

### Prediction

- **Copyright/permissions page** — skipped or invisible. Most readers treat this as prefatory matter and move through it without registering it as "the book beginning."
- **Preface or invocation** — likely where the orientation window closes for most readers; the epigraph may mark the threshold.
- **Fade transition** — registers as breath rather than lag.
- **Near-invisible controls** — feel trustworthy rather than abandoned. Readers report they knew how to proceed even if they couldn't articulate the mechanism.
- **Dominant unknown** — whether anything in the first 30–60 seconds produces the quality of having forgotten the interface, or whether it remains detectable throughout.

---

### Disconfirmation

What reports would show these predictions are wrong:

- Readers continue describing the interface itself after the invocation — controls remain visible, mechanism stays conscious, the software never recedes.
- Readers identify the copyright page as actively disorienting (wrong register, broke immersion) rather than invisible.
- The fade transition is described as lag, hesitation, or "glitchiness" rather than breath.
- Readers describe the controls as too sparse — they felt uncertain whether the environment was working or broken.
- The orientation window does not close at the Preface/invocation threshold — readers report it closing at Chapter 1 body text, or not closing at all.
- Multiple readers independently identify the same unexpected element (typography, timing, margin width, the TOC glyph) as the dominant interruption — something we did not predict as significant.

---

### Observation

*(Pending — fill in from reader transcripts after first session)*

**Reader 1:**

**Reader 2:**

**Reader 3:**

**Reader 4 (optional):**

**Reader 5 (optional):**

**Patterns across readers:**

**Surprises (what we did not predict):**

---

### Decision

*(One subtraction only. Named only after observations are collected and surprises documented. Do not fill in before transcripts exist.)*

---

---

*The Hospitality Lab is not a product document. It does not measure completion. It measures what the environment teaches us about itself through the people who inhabit it. The willingness to let experience correct theory is not just good research practice — it is one more expression of the architecture refusing to speak with authority where only the inhabitant can.*
