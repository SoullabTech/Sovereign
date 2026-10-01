# ASTROLOGY-SOUL-JOURNEY-01 — T0 Transit Truth Census

Date: 2026-10-01
Programme: `JARVIS-ASTROLOGY-SOUL-JOURNEY-01`
Unit: `astrology-soul-journey-01-transits-r1`
Canonical inspected: `c6102a347af14600ea49edc108dd720f649d7e2c`

## Purpose

Establish what Soullab can truthfully say about current transits before the transit field becomes a primary member-facing surface.

The governing distinction is:

```text
calculated astronomy / geometry
  ≠ symbolic tradition
  ≠ whole-chart synthesis
  ≠ lived meaning
```

The member remains the authority on lived meaning.
## Existing substrate

The current `/astrology` page already contains a lower "current sky" surface and a House Wheel transit toggle.

Before this unit, the page used `GET /api/astrology/current-transits` only after the wheel toggle was enabled. That GET returns present positions, not natal contacts.

The same route already has a POST contract that accepts a natal chart and returns:

- current transit positions;
- current transit-to-natal aspects;
- aspect type;
- geometric orb;
- an `applying` boolean.

The existing deeper astrology substrate also contains:

- `lib/astrology/transitCalculator.ts`;
- `lib/astrology/transitInterpretation.ts`;
- `lib/astrology/transitRenderContracts.ts`;
- `lib/astrology/transitSnapshot.ts`;
- `lib/astrology/engines/transitsEngine.ts`.
## What is safe for the first field

For the first "What is alive now" field, the presently defensible calculated claims are:

1. present geocentric planetary positions for Sun through Pluto;
2. whether one of the route's admitted aspect geometries is inside its current orb;
3. the current angular orb of that contact;
4. which transiting planet and natal point participate.

The first field therefore limits surfaced transiting bodies to Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.

The current route also supplies Nodes, Chiron, Lilith, Ceres, Pallas, Juno, and Vesta, but several are produced by simplified or mean-motion approximations. They are withheld from this first prominent field until provenance and precision are separately adjudicated.
## Claims that are NOT yet admitted

The current code contains mutually non-equivalent direction/timing logic:

- the API POST derives `applying` from `diff < aspect angle`;
- `transitCalculator.ts` currently stamps `applying: true` with a TODO;
- `transitInterpretation.ts` uses a separate simplified zodiac-direction heuristic.

These are not sufficient evidence for member-facing "applying" or "separating" language.

Likewise, `transitCalculator.ts` creates `activeFrom` and `activeTo` by translating aspect-orb degrees directly into days around the current instant. That is not an independently witnessed ingress/exact/egress calculation.

Therefore T1 MUST NOT state:

- exact transit dates;
- "applying" or "separating";
- entering / peaking / completing;
- exact activation windows;
- predictive outcome language.
## Major / Minor ruling for T1

"Major" and "Minor" are interface lenses, not rankings of a person's life.

For T1:

- **Major** = longer-wave transiting planets Jupiter, Saturn, Uranus, Neptune, Pluto.
- **Minor** = faster transiting bodies Sun, Moon, Mercury, Venus, Mars.
- **All** = both groups ordered by current geometric closeness.

The interface must explicitly say that "Major" names temporal scale, not importance, destiny, intensity, or personal significance.

No hidden score decides what matters to the member.

## Symbolic layer

The first deepening may name ordinary contemporary Western symbolic associations, but must label them as tradition.

It must also state that a transit contact is not the whole chart and belongs beside the natal point's sign, house, natal aspects, other current transits, and lived context.
## Member / MAIA boundary

Opening or expanding a transit does not send chart data to MAIA.

A transit may be brought to MAIA only through an explicit member gesture.

The injected context must:

- identify the calculated geometry;
- distinguish symbolic tradition from calculation;
- preserve the whole-chart boundary;
- forbid prediction, diagnosis, identity claims, and astrological authority over the member;
- return inquiry to lived recognition.

No transit interpretation is automatically kept as member meaning.

## T0 result

**T0 PASS for a bounded T1 field under the restrictions above.**

T0 does not admit exact timing, transit direction, approximate minor bodies, predictive language, or a production deployment.
