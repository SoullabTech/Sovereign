# Founder — Field Signals

Read-only observability surface for participatory reality theme signals.

- **Page:** `/founder/field-signals`
- **API:** `GET /api/founder/field-signals`
- **Auth:** `requireFounder()` (env-var allowlist `FOUNDER_MEMBER_IDS`)
- **Source:** `member_theme_signals` (migration `20260316000001_participatory_reality_themes.sql`, deployed 2026-03-16)

## What this is

A small read surface to make the existing participatory theme stream legible
during the current observation window. Listening, not enforcing.

## What you're seeing

Each row is one detection record from `member_theme_signals`:

- **theme** — which of the six surfaced (Field Awareness, Pattern Recurrence,
  Embodied Coherence, Adaptive Unfolding, Wise Acceptance, Ripeness)
- **signal_type** — `active` | `emerging` | `blocked` | `integrating`
- **resonance_strength** — heuristic confidence 0–1, scored from language
  markers (not diagnostic)
- **element** — Spiralogic primary element for the theme at detection time
- **context** — structural JSONB (e.g. `source`, `processing_path`); never
  session content
- **member / session / journal** — short ID slices for cross-reference only
- **detected_at** — relative time of detection

## What you're NOT seeing

- **No session content.** The source table never stores what was said. No join
  out to `maia_turns.user_text` is performed for excerpts.
- **No canon compliance flags.** The `canonComplianceEvaluator` (PR #157) is
  not present on this branch. When the evaluator lands and writes to
  `maia_turns.observer_insights`, a sibling endpoint can carry that stream.
- **No aggregation, charts, exports, or interpretation.** This is a raw read.

## How to interpret

- **Low signal volume is expected** in the current window. Sparse signals are
  information about marker coverage, not absence of work.
- **`resonance_strength` is a soft heuristic** from language markers. Treat it
  as a relative ordering within a window, not an absolute measurement.
- **`signal_type` distribution is more telling than count.** A run of `blocked`
  on `wise_acceptance` is a different field state than a run of `integrating`
  on `pattern_recurrence`.
- **Compare windows** before drawing conclusions — 24h vs 7d vs 30d each tells
  a different story about marker exercise.

## Filters

- `window`: `24h` / `7d` / `30d` (default `7d`)
- `theme`: any of the six themes (default: all)
- `signal`: `active` / `emerging` / `blocked` / `integrating`
- `element`: `fire` / `water` / `earth` / `air` / `aether`
- `limit`: default `100`, max `200`

## Detection path

- Detection: [participatoryRealityHelper.ts](../../lib/consciousness/participatoryRealityHelper.ts) → `detectThemes()`
- Storage: `member_theme_signals` (fire-and-forget write via `storeThemeSignal()`)
- Wired in: [oracle/conversation/route.ts](../../app/api/oracle/conversation/route.ts), [between/chat/route.ts](../../app/api/between/chat/route.ts)

## Discipline

This page is a listening tool. It does not change MAIA behavior, run any
evaluator, or store new data. If detection ever moves to enforcement, that
should be a separate, explicit decision — not a side effect of inspection.
