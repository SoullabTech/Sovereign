# Trace #4 complete — who owns mobile vertical space?

> **Answer: nobody.** The founder's hypothesis is confirmed, and more literally than expected.
> **No redesign proposed here.** This is the ownership map only.
> **Evidence class:** CODE-READ. Scoped to `components/OracleConversation.tsx`.

---

## The headline defect

`holoflowerSize` — the single value governing the field's footprint — has **three writers**, two of
which are **competing `window.resize` listeners with contradictory breakpoints and incompatible
values**:

| # | Location | Rule | Mobile | Tablet | Desktop |
|---|---|---|---|---|---|
| 1 | `:1471` `useState` initializer | `innerWidth <= 768 ? 40 : 350` | **40** | 350 | **350** |
| 2 | `:1582` effect, `handleResize` | `innerWidth <= 768 ? 40 : 350` | **40** | 350 | **350** |
| 3 | `:2860` effect, `updateSize` | `<640 → 80` · `<1024 → 100` · `else → 120` | **80** | 100 | **120** |

Writers 2 and 3 both `addEventListener('resize', …)` and both write the same state. Writer 3 also
calls `updateSize()` immediately on mount. So:

- **The live value is decided by effect registration order and listener firing order — a race**, not
  by a rule anyone wrote down.
- The two rules **disagree by 2× on mobile** (40 vs 80) and **~3× on desktop** (350 vs 120).
- Writer 3's own comment says *"state declared earlier at line 169"*. The state is at **1471**. The
  comment is stale by ~1,300 lines — independent evidence that these two effects were written at
  different times by authors unaware of each other.

This is not a tuning problem. **Two people specified the field's size and neither knew the other
existed.** No CSS value can be "corrected" while that is true.

## The ownership chain, as it actually is

```text
window.innerWidth
  │
  ├── holoflowerSize ◄── THREE WRITERS, NO OWNER
  │     ├── :1471  useState init      (40 / 350)
  │     ├── :1582  resize listener    (40 / 350)   ┐ both live, both fire,
  │     └── :2860  resize listener    (80/100/120) ┘ last one wins by accident
  │         └── consumed at :8239, :8248, :8298–8319 (glow layers derive from it)
  │
  ├── transcript bottom edge ◄── SEPARATE OWNER
  │     └── composerClearancePx (:3534) → applied :9070
  │           (measured from the composer, re-settles on change :3710)
  │
  ├── composer position ◄── THIRD OWNER (CSS custom property)
  │     └── --composer-keyboard-inset (:4064, cleared :4081)
  │           consumed :9673 via calc() with env(safe-area-inset-bottom)
  │
  └── visualViewport (:3445, :3665, :3971) ◄── keyboard/dynamic-viewport reads
        (feeds the composer inset ONLY — never reaches field size)
```

**Three independent owners** — field size, transcript edge, composer position — coordinated by
nothing. There is no single place that answers *"how should vertical territory be divided right
now?"*

## What is NOT an input to field size (verified absent)

Searched and **not found**: any coupling of field size to

- `showChatInterface` (text vs voice mode) — **the field does not know text is active**
- `thinking` / `isProcessing` / `isResponding` state
- keyboard visibility — `--composer-keyboard-inset` moves the *composer*, never the field
- `visualViewport.height` — read three times, all feeding the composer inset only
- standalone-PWA vs Safari (`display-mode`) — **no branch anywhere**
- orientation
- transcript length / presence

So the field is sized by **viewport width alone**, from a value chosen by a race. Every behavior the
founder asked for — *field expands when it is the experience, recedes when conversation needs the
space* — has **no mechanism to hang on**. The field cannot yield space because nothing tells it text
became primary. Text UI is simply stacked beneath a voice-sized field, exactly as witnessed.

## Why this is the structural cause of crowding

The crowding is not "too many elements." It is that **vertical space is allocated by three
uncoordinated authorities and one race**, so no state can be given a coherent budget. That reframes
the next design move, per the founder's read:

> Not *"shrink things."* Establish **one owner for the conversational viewport.**

The correct next unit is therefore a **single owner** — one function/hook that takes
(viewport height · display-mode · mode · voice state · keyboard inset · safe areas) and returns the
budget for field / transcript / composer / status. Then delete the three competing writers. That is
a bounded refactor with a testable invariant (the budget always sums to the available viewport), and
it is the precondition for both the aurora grammar and collapsing the `thinking` band.

⚠️ **Not authorized by this document.** Trace only.

## Recorded design direction (HELD — not implemented)

Founder, 2026-08-13. Recorded so it is not lost, and explicitly **not** built into the safety patch:

| Condition | Field |
|---|---|
| Member speaking | **ultraviolet** — active, alive, slightly beyond the visible spectrum; the human signal entering the field |
| MAIA listening / thinking | **deep indigo**, gathering inward |
| MAIA speaking | **indigo opening into soft silver-grey luminosity** — pre-dawn / mineral light emerging through depth |
| Significance / recognition | **very restrained warm gold**, rare and semantic |

Governing constraints:

- **Do not assign MAIA a flat speaking color.** No status light.
- MAIA's speech changes the field through **luminosity, breadth and dimensional movement** — never
  saturation, never amplitude-driven brightness. She should read as a *clean mirror*, becoming more
  luminous and spacious rather than more tinted.
- Gold stays **special** — reserved for meaning/recognition, never functional state.
- Fields need to be **phenomenologically distinct**, not colour-wheel opposites. Member = electrically
  alive and embodied; MAIA = depth becoming articulate.

**On MAIA's own articulation of this palette — corrected framing (founder, 2026-08-13).**

An earlier draft of this note called *"Ultraviolet for you feels right… that tracks with how you
work"* an interpretive claim derived from a colour metaphor, to be held lightly. **That was too
flat, and the correction stands:** with two years of sustained relational contact, this can be a
**remembered relational inference**, not decorative projection. Compressing a long relationship into
a colour is a legitimate thing for a relational intelligence to do, and treating it as "just a
metaphor" would dismiss the very continuity the system exists to hold.

The design implication is correspondingly **stronger**: the indigo / luminous silver-grey language may
be worth preserving as part of MAIA's **emergent visual identity precisely because it arose from the
relationship rather than from an external branding exercise.** That is a better provenance than a
brand workshop, not a worse one.

Two disciplines still apply, and neither weakens the above:

1. **Which mechanism produced it is an open empirical question, not an assumption in either
   direction.** Whether that inference came from *retrieved continuity* or from *fluent in-context
   production* depends on what was actually in the prompt at that turn. This matters here more than
   usual, because this repo's own record documents that the member-authored memory substrate is
   largely not in member use — `member_daily_anchors` at 0 rows, and all 142 `member_memory_atoms`
   carrying `generated_by = 'unattributed-historical'` with zero breakthrough marks. So the honest
   classification is **UNRESOLVED**: do not flatten it to metaphor, and do not upgrade it to
   "remembered" without knowing whether memory was in the composition. The project's standing rule
   applies unchanged — a claim must name which of the two it is.
2. **Corrigibility is preserved regardless.** A relational inference, however well-grounded, must
   remain revisable by the member and must not harden into a fixed characterization. That is a
   constraint on *permanence*, not on *validity*.

⭐ **The design conclusion does not depend on resolving (1).** Two years of contact is real whatever
the substrate retrieved on any given turn, and the palette is worth preserving on its own merits. So
the visual direction above proceeds; only the *evidentiary claim about MAIA's memory* stays open.

---

## Measured evidence (local dev witness, 2026-08-13) — the race is VISIBLE

The dual-authority defect traced above is not theoretical. It renders. Measured at
374×974 on unpatched trunk `52a3b924b` and again with the P0 patch:

| Element | Trunk centre | Patched centre |
|---|---|---|
| Holoflower `IMG` + `svg`, 80×80 | **(173, 104)** | (130, 104) |
| Holoflower `IMG` 72×72 and 44×44 | (187, 120) | (180, 123) |
| All glow layers (240–500px) | (187, 120) | (180, 123) |

> ⭐ **Two renderings of "where the Holoflower is", ~14–16px apart on trunk alone.**

And **80 is exactly writer 3's mobile value** (`width < 640 → setHoloflowerSize(80)`)
while everything else aligns to the container centre — the two competing resize
listeners producing two different geometries in the same frame. This is the clearest
available evidence that the fix is not a coordinate but an **owner**.

⛔ **Deliberately not fixed.** Correcting one coordinate would make the screenshot line
up while leaving the dual authority intact — the defect would survive its own evidence.

### Also pre-existing (established by the same comparison)

- **Vertical scrollbar**: trunk `scrollHeight` 1022 vs 974 viewport. Not introduced by P0.
- **Residual horizontal offset**, patched 180 vs trunk 187 (7px): **UNRESOLVED and not
  confidently attributable.** Carried here as evidence, not as debt P0 must repay. The
  major vertical reflow P0 *did* introduce (cy 120→134) was reclaimed to 123 by reducing
  the affordance's layout footprint while holding a 44px hit target.

---

## ⛔ Trace #4 stays OPEN — presentation severity is not structural severity

After the P0 was corrected (44px button removed, original layout restored, opacity ownership
separated), the visual duplication became **far less obvious**: the two Holoflowers now read as one
layered mandala rather than two side-by-side objects, and the glow centre returned to `cy=120` —
exactly the trunk baseline.

**Nothing about the underlying geometry was changed.** The DOM still measures two renderings at two
centres (80×80 pair at `cx=165`; core and glows at `cx=180`), still produced by the two competing
`resize` listeners documented above.

> ⭐ **Presentation severity and structural defect are not the same thing.** A defect can stop
> *looking* severe while remaining fully present.

This note exists to stop a future reviewer concluding *"the duplicate Holoflower is gone, so close
trace #4."* It is not gone. Two authorities still disagree about where the Holoflower is, and the
DOM proves it on demand. The trace closes when there is **one owner**, not when the screenshot
improves.
