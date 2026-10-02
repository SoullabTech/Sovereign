---
room: Personal Decisions
human_activity: Holding a real choice in view, gathering perspective, noticing what changes, and choosing without surrendering authorship of the decision.
surfaces:
  - app/decisions/page.tsx
  - app/decisions/layout.tsx
  - app/decisions/new/page.tsx
  - app/decisions/[id]/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — Decisions makes choice visible as one movement in a life rather than an optimization problem
  - INHABITABLE_ARCHITECTURE_STANDARD — a decision is a lived room of discernment, not a council dashboard
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — perspectives may inform the member; they never make the choice
  - RELATIONSHIPS-UX-01 — evidence, observation, hypothesis and member meaning remain distinguishable
  - MAIA_OATH — reflection and perspective, never authority
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/journal-room.md
  - docs/architecture/RELATIONSHIPS-UX-01.md
shared_with_house: warm architectural field, editorial serif hierarchy, explicit provenance, quiet MAIA/perspective presence, human-language gestures, and reversible depth.
distinct_to_room: Decisions is organized around a live choice. The member's question remains central while stakes, state, time pressure, council perspectives, lived consequences and later reconsideration remain subordinate lenses.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-02-threshold-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-02-threshold-mobile.png
experience_verification: 2026-09-27 architecture instantiated and authenticated on isolated localhost:3699 through DECISIONS-UX-02. Temporary member data proved personal-scope list binding, open/resolved separation, and removal of the old council-dashboard arrival while /studio/decisions remained untouched. Residue zero.
---

# DECISIONS-UX-01 — Personal Decisions Room Experience Architecture

## 1. Core thesis

Personal Decisions is the House room for **discernment around a real choice**.

It is not a leadership dashboard, optimization engine, voting mechanism, confidence display, or recommendation machine.

The member should feel:

> **I can hold this choice long enough to see more clearly without handing it over.**

## 2. Governing laws

1. **The decision belongs to the member.**
   Council, MAIA, symbolic lenses, remembered experience and other people may add perspective; none owns the choice.

2. **The question comes before the apparatus.**
   Arrival begins from what is being chosen, not filters, statuses, council state or data fields.

3. **Perspective is plural and provisional.**
   A council response is a set of ways of seeing. It is never a verdict.

4. **Recommendation cannot masquerade as decision authority.**
   Existing recommendation fields may be presented as provisional direction from the council, never as what the member should do.

5. **No confidence percentage over a human choice.**
   Model confidence, framing weights and emergence labels are implementation detail unless they have a human-useful, non-authoritative meaning. They do not belong in the primary Personal Decisions experience.

6. **Phenomenon first; decision metadata second.**
   The member names the choice and its context before stakes, state or time pressure become foregrounded.

7. **Time matters because choices develop.**
   A Decision may be revisited after something happens. Iterations and experiences describe movement, not progress.

8. **A resolved Decision is still a member-owned record, not proof the council was right.**

## 3. Personal / Practice separation

The existing Decisions substrate serves two legitimately different human contexts:

- **Personal Decisions** — the member's own choice;
- **Practice Decisions** — practitioner decision support involving clients, teams, protocols and professional evidence.

DECISIONS-UX-01 governs **Personal Decisions only** at `/decisions`.

It does not redesign `/studio/decisions`.

This separation is load-bearing. Personal experience must not inherit:

- client selectors;
- team context;
- practitioner observations;
- protocols;
- intervention language;
- professional evidence bundles.

## 4. Canonical states

These are attentional states, not wizard steps.

### Arrival

Question:

> **What choice is asking something of you?**

The room offers:

- begin a Decision;
- return to an unresolved Decision;
- quietly revisit a resolved one.

### Frame

Purpose: put the choice into the member's own words.

Primary authored material:

- the decision / choice itself;
- context: what is happening around it.

Only after those words exist may the room ask about:

- what is at stake;
- how much time pressure is real;
- what the member notices in their present state.

These are context, not diagnoses.

### Decision Room

The member's decision question stays materially stable.

The room may hold:

- context;
- provenance / where this came from;
- stakes;
- current state;
- time pressure;
- experiences since;
- perspective gathered;
- what the member is carrying now.

### Perspective

The existing Decision Council becomes an invited practice:

> **Gather perspectives**

Before invocation, the room explains:

> Different lenses may expose tensions, assumptions and possibilities. They do not make the choice.

Council output should be spatially separated into:

- observations / framings;
- tensions;
- risks / uncertainties;
- possible directions;
- questions worth sitting with.

No displayed confidence percentage.

### Notice

After something happens, the member can record:

> **What changed?**

This uses existing Decision experiences and/or iteration notes without requiring immediate re-consultation.

### Revisit

The member may return after new evidence or experience.

A new council consultation is explicit and should compare prior perspective with what has actually changed, rather than treating the previous recommendation as a baseline truth.

### Choose / Resolve

The final authority is the member.

The current substrate has status='complete' but no first-class member-authored chosen-outcome field.

That is a real substrate gap.

DECISIONS-UX-01 does not invent a fake resolution field or coerce consultant_notes / follow_up_intention into the chosen decision.

A later act must decide whether the member's actual choice deserves its own durable field.

## 5. Threshold visual authority

The Personal Decisions threshold should share the House's warm architectural field but feel more focused and balanced than Changes.

Changes is atmospheric movement.

Decisions is **held tension around a choice**.

Allowed visual language:

- two-sided balance without literal scales;
- quiet axial geometry;
- warm gold with restrained cool counterpoint;
- converging/diverging lines;
- one stable central question;
- spacious margins;
- material paper or parchment for the member's choice;
- subtle polarity without binary good/bad coding.

Avoid:

- literal scales of justice;
- red/green option scoring;
- winner/loser visuals;
- probability meters;
- confidence bars;
- pros/cons spreadsheet grammar;
- AI recommendation cards as the primary object;
- corporate leadership-dashboard styling.

## 6. Arrival composition

Desktop:

1. House threshold / room identity.
2. Large orientation question.
3. One primary **Bring a decision into view** threshold.
4. Open Decisions as living choice objects.
5. Resolved Decisions quieter and lower.

Mobile preserves the same hierarchy vertically.

## 7. Existing substrate preserved

DECISIONS-UX-01 keeps:

- studio_decisions personal scope;
- exact member ownership;
- title / context;
- stakes;
- time pressure;
- emotional state;
- existing council result;
- iteration history;
- decision experiences;
- decision chain;
- mentor reflection;
- follow-up intention;
- House provenance;
- Decision → Daily Anchor crossing.

No schema change is authorized by this architecture act.

## 8. Exact stop

The first implementation should bind only:

> **DECISIONS-UX-02 — PERSONAL DECISIONS THRESHOLD + EXISTING DECISION LIST READ ONLY**

That act should replace the personal dashboard arrival, preserve the practice route untouched, and stop before redesigning Decision creation or council invocation.