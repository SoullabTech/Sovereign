/**
 * Soullab Press canonical palette — shared by the Studio shell (Layer 2) and
 * the Manuscript Room (Layer 3) so the member crosses between them without
 * feeling they changed products.
 *
 * Espresso ground, warm cream text, deep-amber accent (#C9A227, matching the
 * public Press landing's ogCard). A literary environment, not a dashboard.
 *
 * These values are duplicated in app/press/manuscript/page.tsx and
 * WorkingDraftEditor.tsx. They are NOT imported there on purpose: PR #825 is
 * open against both files, and reaching into them for a cosmetic import would
 * create a conflict for no gain. Reconcile once #825 lands.
 */
export const SERIF = 'Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif';

/**
 * ── HOW ATMOSPHERE PROPAGATES (WS-ATMOSPHERE-01, 2026-09-07) ──────────────
 *
 * Every value below is a CSS custom property with TODAY'S EXACT COLOUR as its
 * fallback. Nothing about how these are consumed changed: all thirty-three
 * Studio surfaces already pass these tokens into inline `style` props, and
 * `var()` resolves there like anywhere else. So one wrapper setting
 * `--ws-*` carries a chosen atmosphere through every room at once — and a
 * surface the provider never wraps still renders the Atelier palette exactly.
 *
 * The fallback is the safety property, not a convenience: if the atmosphere
 * system were deleted tomorrow, every colour here is still literally present.
 */
export const PRESS = {
  bg: 'var(--ws-bg, linear-gradient(135deg,#1A1513 0%,#241C18 60%,#1A1513 100%))',
  text: 'var(--ws-ink-primary, #F3EDE4)',
  accent: 'var(--ws-gold, #C9A227)',
  ink: 'var(--ws-on-accent, #1A1513)',
  rule: 'var(--ws-rule, #4A4238)',
  ruleSoft: 'var(--ws-rule-soft, #3a322b)',
} as const;
