---
room: Astrology — Interpretive Composition
human_activity: Reading relationships within the natal chart while being able to tell calculated fact, symbolic tradition, possible expression, current sky, and one's own recognition apart.
surfaces:
  - app/astrology/page.tsx
  - app/astrology/astrology-room.module.css
change_class: experiential
principles:
  - ASTROLOGY-UX-01 — facts, symbolic tradition, synthesis, possible expression, activation and member meaning remain distinct
  - ASTROLOGY-UX-02 — the chart is encountered as a whole before isolated interpretation
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — symbolic language cannot silently become truth about the member
  - MAIA_OATH — interpretation remains invitational and inspectable
reference_surfaces:
  - docs/design/contracts/astrology-room-experience-architecture.md
  - docs/design/contracts/astrology-room-whole-chart-orientation.md
  - docs/design/contracts/personal-decision-live-room.md
shared_with_house: explicit epistemic boundaries, readable prose, quiet material surfaces, member authority, and no automatic memory promotion.
distinct_to_room: Astrology can be exact about chart geometry while remaining provisional about meaning. Its interpretive sections visibly label which layer of knowing is being shown.
screenshot_desktop: docs/design/contracts/screenshots/astrology-ux-03-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-ux-03-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3701 with a temporary member and real calculated natal chart. The room rendered layered aspect readings under Calculated relation, Symbolic tradition, One possible expression, One possible counterpoint, and For your own recognition. Static hard-coded natal-transit claims such as Jupiter conjunct Natal Sun were absent, and Past life mastery language was absent. Show the current sky fetched the existing current-transits route and rendered 10 real current planetary positions as current-sky facts only. Zero MAIA/LLM conversation POSTs occurred before or after showing the current sky. Desktop and mobile captures passed; temporary session/member were removed.
---

# ASTROLOGY-UX-03 — Whole-Chart Interpretive Composition + Epistemic Layering

## Purpose

Make the deeper Astrology room intelligible without allowing interpretation to masquerade as calculation or identity.

The governing sequence is:

> **Calculated fact**
> → **symbolic tradition**
> → **possible expression**
> → **member recognition**

Current sky is held separately from natal meaning.

## The chart in relation

The former flat Major Aspects grid is replaced by:

> **Patterns to hold together**

The room selects a small set of tight aspects for which the existing aspect library has material and renders each through visibly separate layers.

### Calculated relation

Example:

> Sun square Saturn · 2.1° orb

This is chart geometry.

### Symbolic tradition

Existing aspect symbolism is shown as a tradition/lens rather than as fact about the member.

### One possible expression

Existing integrated/gift language is presented explicitly as one possible expression.

### One possible counterpoint

Existing shadow/reactive language is presented explicitly as a possible difficulty, not a diagnosis.

### For your own recognition

The existing core question becomes the member-facing interpretive threshold.

The question is allowed to remain unanswered.

## Planetary detail

Expanded Planetary Positions retain their existing depth but change the epistemic labels:

- `Planetary Archetype` → **planetary symbolism**;
- `Sign Expression` → **sign symbolism**;
- `House Activation` → **house symbolism**;
- generated placement synthesis → **One symbolic synthesis**.

The synthesis carries an explicit boundary:

> **Read as a possibility to test against lived experience, not as a statement of identity.**

## Lunar nodes

The former node copy declared:

> Your soul's evolutionary path

> Past life mastery

Those claims exceeded what the chart calculation establishes.

The node section now separates:

- exact node sign, degree and house;
- one named modern Western evolutionary interpretation;
- a direct statement that this is symbolic tradition, not calculated destiny or proof of past lives.

## Current sky

The prior page contained two static natal-activation examples:

- Jupiter conjunct Natal Sun;
- Saturn trine Natal Moon.

They were rendered regardless of the member's actual chart or the actual current sky.

UX-03 removes those claims entirely.

The replacement is:

> **The current sky is a separate layer**

The member may explicitly choose:

> **Show the current sky →**

That action uses the existing real current-transits route.

The room then displays factual current positions only.

It explicitly states:

> **No natal influence is inferred here. This view shows the current sky only.**

A future natal-transit activation surface must calculate an actual current-to-natal aspect before claiming an activation.

## Steinbrecher lens

The existing Steinbrecher/alien-pattern calculation remains available, but its UI authority changes.

The room now identifies it as:

> **STEINBRECHER LENS**

and states that the configuration is calculated while the interpretation belongs to a specific symbolic framework.

Existing descriptions are visibly introduced as:

> **This tradition describes the pattern as…**

rather than as an unqualified statement about forces objectively operating through the member.

## Other systems

Chinese Astrology copy no longer promises `cosmic destiny`.

It now names:

> zodiac animal, element, and traditional cycle symbolism

Synastry copy similarly avoids `soul-growth vectors` and refers to relationship patterns and symbolic dynamics.

## No hidden cognition

UX-03 is composed entirely from:

- existing natal calculations;
- existing aspect library material;
- existing archetype libraries;
- existing current-transit calculation;
- existing member-owned chart data.

The witness verified **zero MAIA/LLM conversation POSTs**.

No interpretation is written to memory.

## Explicitly unchanged

UX-03 does not:

- add new astrological calculations;
- create natal-transit aspect calculations;
- add MAIA chart conversation;
- change birth-data consent;
- change chart ownership;
- persist interpretation;
- generate member traits;
- alter report generation;
- change Vedic/Mayan/Chinese calculation substrates.

## Exact stop

> **ASTROLOGY-UX-03 — PASS · INTERPRETIVE LAYERS MADE VISIBLE · STATIC FALSE TRANSIT CLAIMS REMOVED · NO MAIA CONVERSATION YET**

The next clean boundary is:

> **ASTROLOGY-UX-04 — MAIA CONVERSATION THROUGH THE CHART + EXPLICIT CONTEXT CUSTODY ONLY**

That act should mount the canonical MAIA conversation inside Astrology, keep the chart visible, send no chart content on open, and allow the member to explicitly bring selected chart context into the conversation. It must not create astrological memory or let MAIA speak as chart authority.