# MOTION-CENSUS-01 — Finding 2 Repair

**2026-09-20 · founder-authorized** ("Ball in Court: address the 6-surface
turn-visibility repair")
**Standing** ✅ **GUARD GREEN** · ⚠️ **TYPECHECK UNRUN IN THIS CONTAINER** ·
⛔ NOT DEPLOYED · ⛔ NOT VERIFIED BY A MEMBER · PRODUCTION UNTOUCHED

---

## The law satisfied

> **MAIA's turn must be readable without an animation having completed.**

`scripts/witness/maia-turn-visibility.ts`: **RED (6 surfaces, 8 sites) → GREEN.**
The guard is unchanged; only the code moved.

## ⭐ The repair, and why this shape

`initial={{ opacity: 0 }}` on a motion element **sets** inline `opacity: 0` and
relies on the animation engine to drive it to 1. A failure leaves MAIA's words in
the DOM and unreadable.

A CSS keyframe inverts that. The element's **resting** opacity is 1; the
animation only borrows 0 for its own duration. An animation that never runs, is
unsupported, or is switched off leaves the turn **visible**.

**Same fade, same duration, opposite failure mode.** This is the canon's own
prescription — *"use CSS transitions instead of `motion.div`"* — not a new idea.

### ⭐ Only opacity moved. Transform stayed.

A transform that fails to run leaves the element at its natural position, which
is **visible**. Only opacity is the readability hazard. So each surface keeps its
existing rise, slide and scale on the motion element, at its existing duration
and easing, and **only the opacity animation moved to CSS**.

That is why the visual character is preserved rather than flattened: nothing was
removed that was not itself the hazard.

```
initial={{ opacity: 0, y: 10 }}   →   initial={{ y: 10 }}   + .maia-turn-enter
animate={{  opacity: 1, y: 0  }}   →   animate={{  y: 0  }}
```

`exit` is untouched everywhere. A turn that is **leaving** should go invisible;
that is not the hazard.

### `app/globals.css`

One keyframe, one class, one reduced-motion guard. The rule carries two
prohibitions in comment, because both would silently undo it:

⛔ never `animation-fill-mode: backwards/both` — reintroduces the invisible
resting state.
⛔ never move the fade back onto a motion prop.

### ⭐⭐ `MaiaBubble.tsx` — the different repair

It keyed the turn node on its own streaming text under `AnimatePresence
mode="wait"`, so every token remounted the node and restarted the fade from
invisible, with the enter further delayed by the outgoing node's exit.

Moving opacity to CSS alone would have made this **worse** — a remount per token
would re-run the CSS animation and flicker. So the key and the wrapper both go:
**streaming text updates in place**, which is what streaming text should do. The
bubble around it still enters once. The caret keeps its own pulse.
Now-unused `AnimatePresence` import dropped.

## Surfaces

| surface | change | live? |
|---|---|---|
| `OracleConversation.tsx` ⭐ live `/maia` | `y` was 0 on every side, so opacity was the *only* animation; `initial`/`animate` dropped, `exit` kept | 26 importers |
| `MessageBubble.tsx` | keeps 10px rise | 10 |
| `ChatMessage.tsx` | keeps 12px rise + 0.98 scale; assistant boxShadow pulse untouched | 4 |
| `ConversationFlow.tsx` | keeps 20px slide | 1 |
| `MaiaBubble.tsx` | keeps 20px rise; **keyed remount removed** | 4 |
| `BetaMinimalMirror.tsx` | keeps 20px rise | **0 — dead code** |

⚠️ `BetaMinimalMirror.tsx` has **no importers**. Repaired anyway so the guard is
uniformly green; ⛔ its deletion is not proposed here and was not taken.

## ⚠️ One defect I introduced and caught

The first pass added a per-surface duration via a CSS custom property in a
`style` prop. On `OracleConversation.tsx` that element **already had a `style`
prop** (`textShadow`) — React keeps the last, so the variable would have been
silently dropped, and a duplicate JSX attribute is an error besides.

Caught by re-reading the diff, not by a test. ⭐ **Fixed by deleting the feature,
not by merging the props**: 300 vs 400 vs 500ms on a fade does not justify three
`style` props and a TS cast. All surfaces now use the single CSS default. The
variable survives in the stylesheet with a default, so per-surface tuning stays
available and nothing sets it today.

*Recorded because the near-miss is the useful part: the repair for a silent
failure mode nearly shipped with a silent failure of its own.*

## ⚠️ Two instrument limitations, named so the numbers are not misread

1. **The census still reports 1.7% reduced-motion coverage. For these six
   surfaces that is now an undercount.** They honour `prefers-reduced-motion`
   through the centralized rule in `app/globals.css`, which is not a `.tsx` file
   and so is outside the census population. ⛔ The census was not adjusted to
   flatter the repair.
2. **Entrance-from-invisible moved only 493 → 492.** Correct and expected: the
   census counts *files*, and these files still animate their **chrome** from
   invisible (`OracleConversation.tsx` alone retains 15 such instances in scribe
   and indicator UI). ⛔ Only turn text was in scope. The chrome was not touched
   and is not claimed to be repaired.

## Verification — what was and was not run

**RUN HERE** — `maia-turn-visibility.ts` **GREEN** · `motion-census.ts` (deltas
above) · esbuild parse of all 7 changed files **OK** · diff re-read
adversarially, which is what surfaced the duplicate `style`.

⚠️ **NOT RUN HERE — no `node_modules` in this container:**
- `npm run typecheck` — **the enforced no-regression gate.** ⛔ Owed before merge.
- `npm run check:design-canon` — these are member-facing `.tsx` under
  `components/`, so an **Experience Contract may be required**. ⛔ Unknown until
  the gate runs.
- `__tests__/voice-non-degradation.test.ts` and the conversation test suites.

⛔ **NOT VERIFIED BY A MEMBER, AND NOT DEPLOYED.** Per this repository's own
standard after the 2026-09-07 voice fix: *a fix verified only by its author's
tests is a claim about code, not about MAIA.* The decisive observation is a real
conversation on `/maia` where messages appear and remain readable, and where
streaming text in `MaiaBubble` settles rather than flickers.

## Owed

1. `npm run typecheck` · `check:design-canon` · test suites, on a host with
   dependencies installed. **Any of these red supersedes the green above.**
2. An Experience Contract if the design gate asks for one.
3. Member-facing verification before this is called done.

⛔ NOT AUTHORIZED BY THIS RECORD: deploy · merge to `clean-main-no-secrets` ·
deleting `BetaMinimalMirror.tsx` · repairing chrome entrance animations ·
touching the other 486 files the census counts · wiring the guard into
`preflight`.
