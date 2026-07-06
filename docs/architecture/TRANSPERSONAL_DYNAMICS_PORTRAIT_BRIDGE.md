# Transpersonal Dynamics — Spiralogic Substrate + Interpretive Lenses (Portrait bridge)

**Status:** CANDIDATE · design layer · 2026-07-04
**Does NOT authorize:** any build · any schema/generator change · any new template. Design-layer reconciliation for review.

---

## Correction that reframes this doc (2026-07-04, Kelly)

An earlier draft of this doc leaned on Steinbrecher as *the source* and treated the outer
planets as *carrying* archetypal functions. Both were backwards. The corrected model:

1. The **structural substrate is Spiralogic** — the original contribution — not Steinbrecher.
2. Symbolic traditions (Steinbrecher's Inner Guide, Jungian, mythic, alchemical) are
   **interpretive lenses** over that substrate, not the substrate itself.
3. The archetypal functions **instrument / vessel / power are relationships** the outer
   planets form with other planets and personal centers — **not** the outer planets.

---

## The model: the chart as living ecology, not a catalogue

Center of gravity shifts from **"the chart *contains* archetypes"** to **"the chart shows
where archetypal intelligences *participate* in an ongoing elemental transformation."**

An archetype is not *owned* by Mars or Pluto. It **arises** from the interaction of:

- the elemental field,
- planetary functions **and their relationships**,
- developmental stage,
- relationships,
- current transits,
- and lived encounters.

**Lineage (locates the originality; does not dilute it).** The process turn has serious
ancestry — Rudhyar reframed the chart as a *seed-pattern unfolding in time*; Tarnas made the
planetary archetypes *multivalent and dynamic* rather than fixed. That lineage is good news:
it places this work in real company and makes the claim defensible. What is **distinctly this
work**: (a) the Spiralogic elemental-phase field as the organizing **substrate** the chart is
reconfigured onto; (b) the clean **structural / interpretive / encounter** separation that
makes traditions swappable lenses; (c) **operationalizing** it as governed, consent-bound
software with developmental tracking (`facet_id` / `facet_movement`). The originality is
architectural, not a claim to have invented process astrology.

---

## Three layers

- **Structural** — the natal chart reconfigured onto Spiralogic dynamics (5 elements × 3
  phases + Aether; the 12 facets). The *enduring structure of a developmental field*.
- **Interpretive** — swappable symbolic lenses over the same substrate: Jungian shadow work,
  Inner Guide dialogue, mythic descent, alchemical symbolism, contemplative practice. The
  same Plutonian current can be read through any of them; **the current is invariant, the lens
  changes.**
- **Encounter** — the practices, dialogues, reflections, and integrations by which a person
  actually engages the dynamics. Encounter is **essential**: the archetype is not merely
  *identified*, it is *met within an unfolding life*.

```
Natal Pattern
   → Spiralogic dynamics
      → current developmental field
         → archetypal constellation
            → Encounter
               → Integration
```

---

## What an Inner Guide is here

Not a fixed character waiting in the unconscious. A guide is an **expression of the dynamic
field.** As the person's relationship to an underlying pattern changes, the same current
constellates differently:

- the Plutonian current may appear as an **Initiator**,
- later as an **Ancestor**,
- later still as a **Guardian of Thresholds**.

The guide changes because the *relationship* changes — not because a different entity arrived.

---

## Archetypal function = relationship (the correction, expanded)

Instrument / vessel / power are **not** the outer planets. They are how a transpersonal
current **couples** to a personal center. The typology bears this out:

| Function | Coupling (relationship) |
|---|---|
| **Power** | an outer planet conjunct the **Sun** — fused with identity / will |
| **Vessel** | conjunct the **Moon** — fused with feeling / receptivity |
| **Instrument** | on the **Ascendant / 1st** — grounded in body / presence |

Neptune *alone* is not a vessel; Neptune **coupled to a personal center** is. This *is* the
ecology model in miniature — the archetype arises from interaction. And even the coupling is
dynamic: it plays through elemental phase, transit, and encounter over time.

---

## Placement against existing architecture

The **experiential** substrate already exists on `clean-main`: the Spiralogic Inner Guide
Field spec (`docs/framework/inner-guide-field-spec.md`), the `inner_guide_facet_state`
migration, and the lab tool. This bridge connects the **descriptive** Soul Portrait to that
substrate: the portrait's "Transpersonal Dynamics" section reads the *structural couplings*;
the Inner Guide Field runs the *encounter*. Build on the spec's own Build Order; do not fork.

---

## Governing law (carried from canon)

```
Orient, never prescribe.
Mirror, never declare.
Name doorways, never claim spiritual authority.
```

The structural layer shows the **terrain**; the person authors the **encounter** and its
**meaning.** Same law as DEFAULT_FRAMING and the Constitutional Direction of Authority.

---

## Attribution

Interpretive lenses are named to their traditions (Steinbrecher's Inner Guide approach; Jung's
active imagination; etc.) — as *lenses, one among several*, not doctrine. The structural
substrate is Spiralogic / AIN's own.

---

## Open (held)

- The deployed Inner Guide Field spec still uses Steinbrecher's internal term "alien
  construct" for these couplings. Worth revisiting so the **relational** reading is
  foregrounded — but that touches deployed architecture; not now.
- Where the descriptive "Transpersonal Dynamics" section lives (chapter / opt-in appendix /
  distinct type); Intent → template routing; consent posture for experiential vs descriptive.

Next design layer only. No code follows from this doc without separate authorization.
