# Spiralogic Soul Portrait

**Status:** Live in dev · first instance authored (Augusten) · single static route, unlisted.
**Date:** 2026-06-18

A human-centered, astrology-*informed* reflection that integrates natal placements,
Spiralogic elemental interpretation, archetypal psychology, and developmental guidance —
written as **a wise letter, not a deterministic forecast.**

## Design law (non-negotiable)

These are enforced **structurally** by the renderer (`framing` is a required field and is
rendered unconditionally, top and close), not left to prose discipline:

1. **Symbolic architecture, not fate.** A chart describes patterns to work with; it does not decide who someone becomes.
2. **Archetypes are companions, not cages.** A person is never reduced to a label.
3. **A becoming, not a fixed identity.** Orientation toward maturation — never diagnosis, never "chosen / special above others."

This aligns with the project canon: *spiritually intelligent, not spiritually authoritative*
(see `CLAUDE.md` → non-negotiables; `docs/canon/`).

## Files

| Path | Role |
|---|---|
| `lib/soulPortrait/schema.ts` | Reusable contract: `SoulPortrait` type, `ELEMENT_META`, `ARCHETYPE_CATALOG`, `DEFAULT_FRAMING`. |
| `lib/soulPortrait/portraits/augusten.ts` | First instance — Augusten Lucas Nezat (age 14). |
| `lib/soulPortrait/registry.ts` | `slug → SoulPortrait`. The seam where a generator later plugs in. |
| `components/soulPortrait/SoulPortraitRenderer.tsx` | `'use client'` renderer for *any* portrait. Never changes per-person. |
| `app/soul-portrait/[slug]/page.tsx` | Server route. `generateStaticParams` + `noindex`, 404 on unknown slug. |

## Schema (the reusable report)

`person · birthData · natalChartSummary · openingLetter · soulSignature ·
elementalProfile · archetypalProfile · seerAndProphet · challengesAsTraining ·
developmentalStage · reflectionQuestions · guidanceForParents · soulVocation · framing`

These render as the **nine core sections** in order: Opening Letter · Soul Signature ·
Elemental Architecture · Archetypal Profile · **The Seer and the Prophet** · Challenges as
Training · Becoming a Young Man · Questions for This Season · Parent/Guide Notes.

Elements follow the canonical Spiralogic model (`lib/maia/spiralogicReference.ts`):
Earth (grounding) · Water (feeling) · Fire (activation) · Air (perspective) · Aether (integration).

## Template-driven now, generated later

Today each portrait is a hand-authored object. The renderer and route already accept *any*
`SoulPortrait`, so a generator (chart data + stage → populated schema, drawing defaults from
`ELEMENT_META` / `ARCHETYPE_CATALOG`) can register portraits in `registry.ts` — or that
lookup can become a DB read — **without touching the renderer or route.**

## Realized: Gift Portrait + the relationship posture (2026-06-18)

A second exemplar is built: **Katie Claire McCullen** (`/soul-portrait/katie`) — the first **Gift Portrait** (uncle → niece). A genuinely different chart produced a genuinely different portrait (her own archetype ecology, a different centerpiece — "The Healer of the Hearth" — no shared boilerplate), validating that the architecture adapts to the individual.

It also introduced a real primitive: a portrait is shaped not only by its *recipient* but by the **relationship through which it is offered** — which changes the *voice/posture, not the truth/symbolism*. Encoded as:
- `SoulPortrait.mode`: `'self' | 'parent-child' | 'gift' | 'legacy'`
- `SoulPortrait.offeredBy`: `{ relationship, giverName?, giftOpening?, cherished? }` — rendered as an "offered with love" framing; the giver's love may be present but **never overwrites the recipient's becoming**.
- `guidanceForParents` is now optional (parent-child only).

Exemplars: **Augusten** = parent-child · **Katie** = gift · (**Kelly** = self, pending). Source note: the Astrograph/Seltzer natal report was used as **chart data only** (copyrighted text; all portrait prose written fresh). Naming debt: the featured-section field is still `seerAndProphet` though it now holds any centerpiece.

## Deferred / honest gaps

- **Privacy.** Portraits may describe minors (`person.isMinor`). The route is `noindex` and
  intentionally **not linked from any navigation** — access is by direct, unlisted URL only.
  A multi-user / generated version **must add real auth + consent gating** before any portrait
  is broadly reachable.
- **AccessMatrix.** `/soul-portrait/[slug]` is currently an *unmapped* route (allowed in dev
  Mode A). Confirm the production middleware mode treats it as intended before relying on prod access.
- **Birth data.** Augusten's portrait is read from placements; full birth date/time/place not on hand.
