# AIN Visual Language — Candidate

**Status: CANDIDATE (Cat-1 preserved direction).** No implementation authorized.
**Date:** 2026-07-29
**Operative vocabulary:** `AIN_SEMANTIC_PRIMITIVES_v0.1.md`

---

## 1. Origin and reframing

The initiative began as an aesthetic question — *could AIN develop an illustration-led
visual language comparable to Deepstash's?* A read-only audit of member-facing surfaces
reframed it.

> **The visual language problem is not primarily an illustration problem.
> It is a semantics problem.**

AIN is already communicating visually, at volume, without an agreed language. Adding
illustration first would make an incoherent vocabulary more persuasive rather than more
truthful.

---

## 2. Evidence base — audit findings (2026-07-29, read-only)

**Illustration.** No illustration system exists; the logo is repeated as decoration
across three competing pipelines (raw `<img>`, `<Holoflower>`, `RoomHoloflower` /
`RhythmHoloflower`) over unreconciled asset variants (`holoflower.svg|.png|-v2|-amber|
-studio`, `logo_flower 2.png`). Only ~15 files contain inline SVG, nearly all glyphs;
the rest is lucide-react, which carries no house voice. `EnvironmentMapView.tsx` is the
single genuine composition.

**Motion inconsistency (the core finding).** Pulse means four unrelated things
(healthy · loading · **recording** · emergency). Breathing is inverted between rooms
(idle presence vs. active listening). Loading has ~6 incompatible spellings across
amber/orange/white/sage/violet/blue with no shared primitive. Fade-up-16 serves both
page arrival and modal entry, so "a screen appeared" and "a threshold was crossed" look
identical.

**State surfaces.** Empty states are bare text with no composition. Errors render
uniformly as `text-red-400 text-xs` regardless of severity. Success is a checkmark or
the word "Saved" — no moment.

**Accessibility.** `prefers-reduced-motion` is honoured in 4 places. Absent from all 62
framer-motion files, all 24 pulses, all 38 spinners, and two infinite loops.

**Colour.** Purple/plum appears on arrival surfaces and wholesale across `community/*`,
`realtime-monitor`, `training`, `field-dashboard`. See ruling R1/R2 — the arrival case
is **not** reported as a violation.

**Prose carrying orientation.** `NowWhatRoom.tsx` (1785 lines, 58 `<p>`),
`VisionStudioRoom.tsx` (26 `<p>`), `app/maia/orientation` (entirely typographic, no
diagram of the thing being oriented to).

---

## 3. Four tracks

Decoupled deliberately, so the ambitious program cannot become a reason to defer
defects that already have sufficient evidence.

### Track A — Immediate integrity repairs *(justified on existing evidence)*
- Recording indicator: unique, unmistakable, never shared with health (Sanctuary Inv. 4)
- Shared `<Loading>` primitive replacing ~6 spellings
- `prefers-reduced-motion` coverage
- Any further consent-legibility defects

These improve **correctness**, not aesthetics. They do not wait on Tracks B–D.

### Track B — Visual semantics
The language itself: `AIN_SEMANTIC_PRIMITIVES_v0.1.md`. One meaning per primitive,
across colour, motion, shape, light, texture, typography, space, rhythm.

### Track C — Motion grammar
How the language behaves — per-primitive duration, easing, permitted and forbidden
contexts, reduced-motion equivalents. **Restricted to navigational, state, and
member-authored-act semantics.** Excludes recognition, pattern-gathering, and
"transformation with continuity."

### Track D — Visual identity
Illustration, atmosphere, editorial direction, elemental expression, texture.
Style bible, three candidate directions, component laboratory, prototypes.

**Sequencing rule:** D never precedes B.

---

## 4. Standing holds

| Held | Why |
|---|---|
| Recognition / Becoming / Ripening / Dormancy as primitives | System has no standing to author developmental meaning (`SEMANTIC_PRIMITIVES` §3) |
| "Living field" — constellation navigation, relationship gravity, evolving geography | Member-facing field-state surface; frozen under `COHERENCE_FIELD_WIRE_UP_SPEC` §0.C and the RFI/UFI Cat-1 hold |
| "Return — what remains alive" prototype | No substrate: zero member marks exist in production; would render empty (cf. Journey Point analysis, parked Cat-1) |
| MAIA as recurring anthropomorphic identity | Attachment capture; see `SEMANTIC_PRIMITIVES` §6 |
| Runtime external image generation | Provider admission question — `docs/canon/PROVIDER_GOVERNANCE.md` |

---

## 5. Approach to identity work, when Track D opens

Favour **SVG, typography, composition, texture, and small motion primitives** over
generated raster illustration. SVG is versioned, diffable, animatable, accessible,
theme-aware, and produced in-repo without an external provider. Raster illustration
used sparingly, with provenance metadata (`SEMANTIC_PRIMITIVES` §7).

Prototype moments, when authorized — four, not five (the fifth is held above):
first arrival · what this place is · the Larry–participant–MAIA relationship ·
carrying something between sessions.

Each field may speak the same language with a different accent (House, Now What?,
Author, Practitioner, Journal, Vision, Publishing). One metaphor must not be applied
indiscriminately — a constellation may be right for relationships and wrong for
manuscript editing.

---

## 6. Coordination

Any lane that moves must account for: the open theme train (#667/#668/#669, awaiting
founder), and unpushed Tier 0 repairs in Now What? (publication blocked until merged).

---

## 7. Open rulings

Carried in `AIN_SEMANTIC_PRIMITIVES_v0.1.md` §8 (R1–R4). Summary: the warm-plum scope
ruling, the `community/*` purple question, Track A go-ahead, and ratification of the
admissible primitive set.
