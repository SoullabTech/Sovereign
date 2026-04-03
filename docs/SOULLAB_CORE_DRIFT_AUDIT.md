# Soullab Core Drift Audit

**Date**: 2026-04-03
**Scope**: `app/` and `components/` directories (.tsx/.jsx only)
**Reference**: `docs/canon/SOULLAB_THEME.md`

---

## Summary

| Category | Count | High | Medium | Low |
|---|---|---|---|---|
| Teal primary usage | 8 files | 3 | 3 | 2 |
| Light backgrounds on dark pages | 3 files | 1 | 2 | 0 |
| Hardcoded hex (should use tokens) | 6+ files | 2 | 3 | 1 |
| Inconsistent page backgrounds | 20+ pages | 5 | 10 | 5+ |
| Ad-hoc wrappers (CorePage candidates) | 9 instances | 5 | 4 | 0 |
| Ad-hoc cards (CoreCard candidates) | 5 instances | 4 | 1 | 0 |
| Emerald as primary accent | 5 instances | 3 | 1 | 1 |
| Duplicate gradient definitions | 3 patterns | 2 | 1 | 0 |

---

## 1. Teal Primary Usage (should be eliminated or constrained to sage contexts)

### HIGH PRIORITY
- **`app/maia/invites/page.tsx`** — `bg-gradient-to-br from-teal-50 via-white to-amber-50/30` as page background. Light teal page in core MAIA flow.
- **`components/onboarding/CompleteWelcomeFlow.tsx`** — Heavy teal usage throughout (bg-teal-*, text-teal-*, border-teal-*). Onboarding is a threshold page.
- **`components/onboarding/BetaTesterGateway.tsx`** — Teal accents on gateway component.

### MEDIUM PRIORITY
- **`app/test-elemental/page.tsx`** — Uses teal in the sacred soul induction flow.
- **`components/onboarding/SacredSoulInduction.tsx`** — Teal borders and text throughout passkey entry.
- **`components/onboarding/ElementalOrientation.tsx`** — Teal styling in orientation steps.

### LOW PRIORITY (may be intentional sage contexts)
- **`app/test-sage/page.tsx`** — Sage/teal visualization page (may be intentionally sage-themed).
- **`components/beta/BetaWelcomeHeader.tsx`** — Minor teal accents.

---

## 2. Light Backgrounds on Dark-Field Pages

### HIGH PRIORITY
- **`app/demo/disposable-pixels/page.tsx`** — `min-h-screen bg-gray-50` (full light page in the MAIA ecosystem).

### MEDIUM PRIORITY
- **`app/practitioners/signup/page.tsx`** — `min-h-screen bg-gray-950` (close to dark but not navy-based).
- **`components/` various** — `bg-white` used in modal interiors and small card elements (acceptable in modals, but check card-level usage).

---

## 3. Hardcoded Hex Colors (should use soullab-* tokens)

### HIGH PRIORITY
- **`app/maia/guide/page.tsx`** — 30+ instances of `#0A1628`, `#0F1D32`, `#1E3A5F`, `#B8860B`, `#060D18`, `#162640`, `#2A4A73`, `#E5E9F0`. This is the *source* of the Soullab Core palette but uses raw hex everywhere. Prime candidate for token migration.
- **`app/signin/page.tsx`** — 20+ instances of same hex values (just converted from teal). Should migrate to soullab-* tokens in a follow-up pass.

### MEDIUM PRIORITY
- **`app/maia/page.tsx`** — Uses `#1a1a2e` (slightly different navy, not aligned with Core palette).
- **`app/studio/metrics/page.tsx`** — Uses `#1a1a2e` (same divergent navy).
- **`components/admin/`** — Various admin components use inline `#0A1628`-family colors.

### LOW PRIORITY
- **Portal pages** (`app/portal/`) — Use `#0D0B14` / `#1A1625` (purple-navy, intentionally different for portal branding).

---

## 4. Inconsistent Page Backgrounds (20+ unique systems)

### Navy-family (close to Core, need token alignment)
| Page | Background | Priority |
|---|---|---|
| `app/maia/guide/page.tsx` | `bg-[#0A1628]` + gradient `#0F1D32 → #0A1628 → #060D18` | HIGH — use `bg-field-core` |
| `app/signin/page.tsx` | `from-[#0F1D32] via-[#0A1628] to-[#060D18]` | HIGH — use `bg-field-core` |
| `app/settings/page.tsx` | `from-[#0a0a1a] to-[#1a1a2e]` | HIGH — wrong navy values |
| `app/capture/page.tsx` | `from-[#0f1419] via-[#1a1f2e] to-[#16213e]` | HIGH — wrong navy values |
| `app/maia/page.tsx` | `bg-[#1a1a2e]` (Suspense fallback) | MED — divergent navy |

### Slate-950 family (close, but not token-backed)
| Page | Background | Priority |
|---|---|---|
| `app/studio/clients/page.tsx` | `bg-slate-950` | MED |
| `app/studio/settings/page.tsx` | `bg-slate-950` | MED |
| `app/studio/tasks/page.tsx` | `bg-slate-950` | MED |
| `app/studio/changes/[id]/page.tsx` | `bg-slate-950` | MED |
| `app/studio/clients/[id]/page.tsx` | `bg-slate-950` | MED |
| `app/studio/groups/page.tsx` | `bg-slate-950` | MED |
| `app/studio/groups/[groupId]/page.tsx` | `bg-slate-950` | MED |
| `app/practitioners/signup/page.tsx` | `bg-gray-950` | MED |

### Purple/indigo family (intentional world theming?)
| Page | Background | Priority |
|---|---|---|
| `app/ain-evolution/page.tsx` | `from-indigo-950 via-purple-950 to-slate-950` | LOW — may be intentional |
| `app/maia/labtools/page.tsx` | `from-black via-gray-900 to-purple-900/20` | LOW |
| `app/maia/soul-consciousness/page.tsx` | `from-purple-900/20 via-black to-indigo-900/20` | LOW |

### Portal system (separate branding)
| Page | Background | Priority |
|---|---|---|
| `app/portal/[slug]/page.tsx` | `#0D0B14 → #1A1625 → #0D0B14` | LOW — portal-specific |
| `app/portal/[slug]/signin/page.tsx` | Same purple-navy | LOW |
| `app/portal/[slug]/register/page.tsx` | Same | LOW |

### Light pages (violations)
| Page | Background | Priority |
|---|---|---|
| `app/demo/disposable-pixels/page.tsx` | `bg-gray-50` | HIGH |
| `app/beta-access/page.tsx` | `from-slate-950 via-slate-900 to-amber-950/20` | MED |

---

## 5. Ad-Hoc Wrappers (CorePage candidates)

### HIGH PRIORITY
- `app/settings/page.tsx:95` — `min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]`
- `app/beta-access/page.tsx:113` — `min-h-screen bg-gradient-to-br from-slate-950...`
- `app/capture/page.tsx:37 & 44` — Duplicated wrapper with custom navy gradient
- `app/ain-evolution/page.tsx:215` — `min-h-screen bg-gradient-to-br from-indigo-950...`
- `app/maia/guide/page.tsx` — Most complex, 30+ hardcoded hex values

### MEDIUM PRIORITY
- `app/studio/clients/page.tsx:143` — `min-h-screen bg-slate-950`
- `app/studio/settings/page.tsx:445` — same
- `app/studio/tasks/page.tsx:509` — same
- `app/studio/changes/[id]/page.tsx:650` — same

---

## 6. Ad-Hoc Cards (CoreCard candidates)

### HIGH PRIORITY
- `app/studio/field/page.tsx:309` — Glass card with blue-purple gradient
- `components/onboarding/FeatureDiscovery.tsx:186` — Glass card with gold border
- `components/onboarding/WelcomeModal.tsx:83` — Glass card with stone gradient
- `components/onboarding/BetaTesterGateway.tsx:231` — Glass card with slate backdrop

### MEDIUM PRIORITY
- `app/studio/page.tsx:424` — Amber gradient card pattern

---

## 7. Emerald as Primary Accent (not success state)

### HIGH PRIORITY
- `app/studio/clients/page.tsx:49` — Emerald as active status theme color
- `app/studio/clients/[id]/page.tsx:293` — Primary action button `bg-emerald-500`
- `app/studio/tasks/page.tsx:933` — Primary action button `bg-emerald-500`

### MEDIUM PRIORITY
- `app/studio/settings/page.tsx:480` — Integration status emerald text

### LOW PRIORITY
- `app/settings/page.tsx:67` — Success confirmation (legitimately success-related)

---

## 8. Duplicate Gradient Definitions

| Gradient | Files | Priority |
|---|---|---|
| `linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)` | 3 portal pages | MED — extract to token if portal stays |
| `linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)` | 2 pages | MED — align to Core |
| `from-[#0F1D32] via-[#0A1628] to-[#060D18]` | guide + signin | HIGH — this IS `bg-soullab-core`, use token |

---

## Recommended Migration Order

### Wave 1: Highest impact, lowest risk
1. **`app/signin/page.tsx`** — Replace hardcoded hex with `soullab-*` tokens (already correct colors, just needs token refs)
2. **`app/maia/guide/page.tsx`** — Replace 30+ hex values with tokens (this page IS the reference implementation)
3. **`app/settings/page.tsx`** — Wrong navy values → CorePage
4. **`app/capture/page.tsx`** — Wrong navy values → CorePage

### Wave 2: Studio alignment
5. **`app/studio/*` (8 pages)** — Replace `bg-slate-950` with `CorePage domain="practitioner"`
6. **Studio emerald buttons** — Replace `bg-emerald-500` with `bg-soullab-accent-primary`

### Wave 3: Onboarding teal cleanup
7. **`components/onboarding/CompleteWelcomeFlow.tsx`** — Full teal→navy conversion
8. **`components/onboarding/SacredSoulInduction.tsx`** — Same
9. **`components/onboarding/ElementalOrientation.tsx`** — Same
10. **`app/maia/invites/page.tsx`** — Light teal page → dark navy

### Wave 4: World/portal theming (lower priority, may be intentional)
11. **`app/ain-evolution/page.tsx`** — Decide: CorePage with `domain="world"` or keep indigo
12. **Portal pages** — Decide: align to Core or keep separate branding
13. **`app/maia/labtools/page.tsx`** — Keep atmospheric variant or align

---

## 9. Additional Findings (Second Audit Pass)

### Teal in Studio (missed in first pass)
- **`app/studio/clients/page.tsx`** — Multiple teal buttons, inputs, badges (bg-teal-500, text-teal-400) — **HIGH**
- **`app/studio/clients/import/page.tsx`** — Teal accent box, button (bg-teal-500/20) — **HIGH**
- **`app/magic-link-error/page.tsx`** — Entire page uses teal+cyan gradient (#A0C4C7, #7FB5B3) — **HIGH** (completely off-brand)

### Correct Usage (reference implementations)
These files already use `maia-navy-*` tokens correctly:
- `app/commons/*` pages — `bg-gradient-to-br from-maia-navy-950 via-maia-navy-900`
- `app/helper-fund/*` pages — same pattern

### Outliers (confirm intent before changing)
- `app/consciousness-monitor/page.tsx` — black + gray-900 + purple (sci-fi theme?)
- `app/journey/page.tsx` — Dynamic animated colors
- `app/practitioner/labtools/page.tsx` — `#0a0f1a` near-black variant

### Overall Stats
- **Total pages audited:** 125+
- **Files with drift:** ~25
- **Drift percentage:** ~20%
- **Canonical usage (already correct):** 6 files

---

## What NOT to change

- Data visualization colors in charts (domain-specific)
- Portal branding (if intentionally separate)
- World/journey atmospheric pages (if the violet/indigo is the domain variant)
- Success/warning/error state colors (these are semantic, not brand)
- Modal interiors using `bg-white` (these sit on top of the field, not within it)
