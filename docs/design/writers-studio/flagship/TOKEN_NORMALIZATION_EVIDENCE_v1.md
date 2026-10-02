# VISUAL SYSTEM TOKEN NORMALIZATION — CHECKPOINT EVIDENCE

Act: the smallest semantic-token implementation moving the real flagship candidate to
the ruled visual language. Authority: `VISUAL_SYSTEM_CANON_v1.md` §40; founder direction
2026-09-22. Reported on the ladder of `FLAGSHIP_EVIDENCE_AND_READINESS_CANON_v1.md`.

```text
exact canonical            origin/clean-main-no-secrets @ b23ae2d7f
merge-base with candidate  65aca2460
exact candidate            0b844f198   (token act)
evidence level             E4 RENDERED  · E5/E6 OWED TO THE FOUNDER (V10)
```

## Files changed (source only; docs excluded)
- `app/writers-studio/flagship/DevelopReview.tsx`
- `app/writers-studio/flagship/WriteRoom.tsx`
- `app/writers-studio/flagship/flagship.css`

## Components affected
`WriteRoom` (Ask MAIA tool class, alternative "reading" label, inline ink tokens, one px→rem) ·
`DevelopReview` (Ask MAIA tool class ×2, spiral-map inline tokens) ·
every rule in `flagship.css` (alias migration, 122 references). ⛔ No component gained, lost or
changed a behaviour; `ReviewPanels` · `StudioChrome` · `DevelopViews` untouched in source.

## Before → after semantic token map

| Role (canon §40) | Before | After | Value | Δ |
|---|---|---|---|---|
| ground.work | `--field` | `--ground-work` | #F7F4ED | kept warm |
| ground.system | `--shell` #F2F0EA | `--ground-system` | #F4F3F0 | cooler, less tan |
| surface.quiet | `--panel` #EAE6DC | `--surface-quiet` | #ECEBE6 | tan → stone |
| surface.raised | `--card` #FBFAF6 | `--surface-raised` | #FCFBF9 | neutral |
| surface.active | `--active` #DED5C0 | `--surface-active` | #E4E2DC | tan → neutral |
| text.work / primary | `--ink` | `--text-work` · `--text-primary` | #26231E | kept warm near-black |
| text.secondary | `--secondary` #4C473E | `--text-secondary` | #4B4D53 | sepia → slate |
| text.muted | `--muted` #766E61 | `--text-muted` | #686A72 | sepia → slate · contrast-repaired |
| text.quiet | `--quiet` #9A9185 | `--text-quiet` | #84868F | contrast-repaired |
| (undefined) | `--tertiary` ⚠️ | `--text-muted` | — | **was resolving to nothing** |
| action.* | `--action` family | unchanged + `--action-hover` | #2F5D86 | kept |
| accent.warm | `--gold` / `--goldfill` / `--goldon` | `--accent-warm` / `-fill` / `-on` / `-ink` | #8A6727 | kept; two literals absorbed |
| status.stale | (used held gold) | `--status-stale` / `-tint` / `-edge` | #7F5C1D / #F6EDDA / #D6B672 | **new role** · distinct from held |
| status.error | `--del` | `--status-error` | #9A5B4A | kept |
| status.success | `--ins` + rgba literal + #F4F7F4 | `--status-success` / `-tint` / `-on` | #4A6B4E | literals absorbed |
| measure ramp | `--goldfill`/`--gold` @ opacity | `--measure-1/2/3` | #C9CCD2 / #9AA0AA / #5E6673 | **gold → measured slate** |
| provenance.* | ad hoc per chip | `--prov-member/template/text/maia-*` | aliases to roles | four kinds, four looks |
| rail.current | `--goldfill` inset | `--rail-current` | #8FB4D9 | selection, not warmth |
| rail rules/meta | 3× rgba(255,255,255,…) | `--rail-rule` · `--rail-meta` | — | literals absorbed |
| atmosphere | 3 hex + 2 rgba in a gradient | `--atmo-1/2/3` · `--atmo-light/warm` | — | literals absorbed |
| shadows | 3× rgba(0,0,0,…) | `--shadow-layer/float/drawer` | — | literals absorbed |
| radius | per-rule px | `--r-sm/md/lg/pill` defined | 3/6/9/999 | ⚠️ defined, not yet applied per rule |

Magic values outside the token block: **6 hex + 10 rgba → 0**. Retired names referenced
anywhere in `app/writers-studio/flagship/`: **0** (proven by grep after alias retirement).

## Role corrections — where gold was carrying system UI
Moved to **ACTION**: Ask MAIA tool · send · reading-in-place selection · current-version dot ·
active-nav inset. To **secondary ink**: word-count delta. To **MEASURE**: sequence bars,
Continuity Map cells + legend. To **MAIA**: finding icon, carried observation. To **STATUS**:
stale panel, stale strip, stale freshness pill.
Gold **kept** (warm attention by role): brand mark · member avatar · chapter labels · epigraph ·
held passage (Write and Review context pane) · member-declared / template provenance · Develop
opening threshold · Read-in-context gate · the sovereignty promise.

## Contrast / accessibility
23 role pairs computed against WCAG 2.2 AA (4.5:1 text · 3:1 UI/large/boundary). 4 failed on
first pass; all repaired and re-verified: text-muted 4.45→4.86 · text-quiet 2.87→3.27 ·
status-stale 4.23→5.23 · lowest presence cell 1.45 (fill) → **3.60 at the boundary** via a
1px inset outline (1.4.11), keeping the ramp legible as a ramp. ⚠️ Computed, not axe-scanned —
R7's automation gap stands; this is the manual half.

## Renders (controlled-component witness · real components · real CSS · real Chromium · fixture data)
`docs/design/contracts/screenshots/flagship-b2/` — 44/44, **ALL mechanical laws PASS**.
Required witnesses: `7-review__desktop-1440.png` · `7-review__desktop-1920.png` ·
`2-write-maia__desktop-1440.png` (Write sanity) · `6-develop__desktop-1440.png` (Develop
sanity) · `7-review__mobile-390.png` (mobile sanity). Cross-mode: Write and Develop moved
*with* Review — same ground, same ink, same action register, same provenance grammar.

## Known deviations (declared, not hidden)
1. **Radius and spacing rhythm**: tokens declared; per-rule px values not yet migrated. Applying
   them touches ~60 rules for no visible change and was held out of the smallest act.
2. **Stale panel is still a large warm block** on Review. It is now STATUS-toned, not held-gold,
   and distinct by hue — but it remains the warmest system region on the page. ⭐ Founder's call
   at V10 whether status-stale should cool further; ⛔ not changed unilaterally.
3. **Elemental theme swatches** (`e.color` on the spiral legend) are data-driven member-declared
   colours, not system tokens — out of this act's scope and named so they are not mistaken for
   magic values.
4. **`studioTheme.ts` was audited, not adopted.** It is the legacy *dark-ground* system
   (`#1D1812` dominant; `pressTheme` ink `#1A1513`) — the "dark/black dominant workspace" §35
   names as a legacy falsifier. It shares with the flagship only the serif and the violet MAIA
   family. ⛔ Importing from it would import the ground the flagship exists to replace. Its ten
   consumers are the pre-flagship rooms and are untouched.

## Zero product-semantic changes
No navigation change · no destination added · Review IA unchanged beyond the ruled two-part
composition · observation/provenance behaviour unchanged · no photography · no new feature
state · intent-first not touched · persistence not touched · facets not implemented · MAIA
authority unchanged. Class renames only: `fs-tool--gold → fs-tool--key` · `fs-altreading`.

## Three latent defects found by the act (all fixed in 0b844f198)
- `.fs-reading` was defined twice — alternative label and Review freshness pill; the later rule
  won shared properties.
- `.fs-stalestriptrust` used `var(--tertiary)`, which no token defined.
- Retiring the aliases exposed **eight inline `var(--…)` references in TSX and one px
  `fontSize`** — invisible to every mechanical law, because no law reads those colours. ⭐ The
  render witness passed *before and after* the aliases were removed; only the grep saw it.

```text
green law matrix ≠ existing product behaviour
E4 RENDERED · NOT E5 · NOT E6 · V10 IS THE FOUNDER'S
```
