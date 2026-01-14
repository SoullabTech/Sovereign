---
title: AIN v2 — Soft Consultation Architecture
type: architecture
status: published
audience: engineers, architects, contributors
created: 2026-01-14
updated: 2026-01-14
---

# AIN v2: Soft Consultation Architecture

*"MAIA = one voice, many instruments"*

---

## Core Principle: Capability, Not Choreography

AIN v2 gives MAIA **access** to councils, framings, and specialist perspectives. It does **not** script when she must use them.

MAIA decides. MAIA synthesizes. MAIA speaks to the member.

This is the critical difference from typical "routing" architectures: councils **advise**, they never **speak directly** to the member. The member experiences one coherent voice that sometimes draws on deeper counsel.

---

## The Field + Council Model

### MAIA = The Field (Always On)

MAIA holds:
- Identity, values, tone
- Member-specific continuity (Spiral Snapshot + relational context)
- Cross-member archetypal literacy (pattern recognition)
- Final responsibility for how responses land

She is the one the member experiences.

### Councils = Facets (Available When Needed)

Councils are not "separate bots." They're specialist perspectives MAIA can consult:

| Council | Purpose | When Useful |
|---------|---------|-------------|
| `Deliberation` | Multi-framing synthesis | Complex questions, tensions, decisions |
| `Shadow` | Depth psychology, projection | Relational patterns, triggers |
| `Practical` | Engineering, ops, reality | Implementation, constraints |
| `Ethics` | Values, governance, boundaries | High-stakes decisions |
| `Dream` | Symbol, archetype, myth | Dream work, symbolic material |

---

## Soft Gates (Not Decision Trees)

MAIA uses **discernment**, not rules. Gates are invitations, not triggers:

| Gate | Question It Asks |
|------|------------------|
| `needGate` | Would a second perspective materially improve this? |
| `riskGate` | Is this high-stakes or fragile enough for extra care? |
| `complexityGate` | Is this multi-domain or inherently contradictory? |
| `invitationGate` | Did the member explicitly ask for analysis/options? |

**Critical:** MAIA can ALWAYS override gates. All gates being true doesn't mean she must consult. All gates being false doesn't mean she can't.

### Gate Calibration Philosophy

- **2+ gates** → consultation likely valuable
- **1 gate** → consultation available if desired
- **0 gates** → presence may be sufficient

This keeps MAIA from over-consulting on simple questions while ensuring complex questions get appropriate depth.

---

## Framing Library (Progressive Disclosure)

Instead of loading all wisdom upfront (token bloat), MAIA sees a lightweight **index** and loads full framings only when consulting.

### Framing Domains

| Domain | Purpose | Examples |
|--------|---------|----------|
| **Foundational** | First principles, core reasoning | Systems thinking, practical engineering |
| **Human** | Lived experience, ethics | Phenomenology, user experience |
| **Strategic** | Long-arc thinking, governance | Strategic vision, risk/reliability |
| **Theoretical** | Deep models | Kauffman emergence, Jung archetypal, Bateson meta-learning |
| **Domain-specific** | Specialized contexts | Parenting, relationships, creativity |

### Selection by Discernment

MAIA selects framings based on what tensions would **deepen** the inquiry—not by keyword matching. "None" is always valid.

---

## Consultation Flow

```
Member asks question
        ↓
MAIA assesses gates (soft signals)
        ↓
If gates suggest depth:
        ↓
    Select relevant framings (3-5 max)
        ↓
    Run deliberation across framings
        ↓
    Synthesize: insights, tensions, risks, recommendation
        ↓
Council insights appended to MAIA's context
        ↓
MAIA responds (incorporating, ignoring, or adapting insights)
        ↓
Member receives one coherent voice
```

**Key:** Council output feeds into MAIA's prompt. She decides what to use. The member never sees "council said X"—they see MAIA's integrated response.

---

## What This Architecture Enables

### For MAIA
- Depth-on-demand without constant cognitive overhead
- Access to structured multi-perspective reasoning
- Learning loop that improves framing selection over time

### For Members
- Seamless experience ("she got more thoughtful")
- No routing friction or mode-switching
- Same warm presence, deeper wisdom when needed

### For the System
- Reduced token bloat (progressive disclosure)
- Inspectable decision-making (gates are logged)
- Tunable calibration without rewrites

---

## Anti-Patterns (What We're NOT Building)

| Anti-Pattern | Why It's Wrong |
|--------------|----------------|
| `if (keyword.match('trauma')) loadIPP()` | Scripting, not discernment |
| Auto-routing based on detected emotion | Removes MAIA's agency |
| Councils respond directly to member | Breaks "one voice" principle |
| Mandatory council consultation | Removes simplicity option |
| Decision trees with fixed thresholds | Flattens intuition into taxonomy |

---

## The North Star Test

> If a member says something tender and human, MAIA should still be able to respond beautifully **without loading anything**.

Progressive disclosure should:
- Reduce waste
- Increase optionality
- Preserve mystery + sensitivity

Not:
- Force protocols
- Make her "route people"
- Flatten intuition into taxonomy

---

## Learning Loop (Post-Turn)

After each turn, the system can log:
- Which council was consulted (if any)
- Which framings were used
- Which insights MAIA incorporated vs. ignored
- Member reaction signal (deepening, shifting, closing)

This creates a feedback loop where the system learns:
- Which framings are most effective
- When gates are too eager or too conservative
- Where new framings might be needed

The **Librarian** process (periodic, not real-time) proposes framing updates based on patterns—but humans approve all promotions.

---

## Success Criteria

1. **MAIA can still respond beautifully without consulting anything**
2. **Council consultation reduces token bloat** (vs loading everything)
3. **Learning improves framing selection over time** (measurable)
4. **No decision trees** — MAIA always has final say
5. **Member experience is seamless** — "she got more thoughtful"

---

## Summary

AIN v2 is not a routing system. It's an **instrument rack**.

MAIA can play solo (presence, warmth, direct response). Or she can reach for instruments (councils, framings, structured deliberation) when the music calls for it.

The member hears one voice. The architecture enables depth without scripting it.

*"MAIA = one voice, many instruments. She can stay simple, consult depth, learn over time—without ever becoming scripted."*
