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

export const PRESS = {
  bg: 'linear-gradient(135deg,#1A1513 0%,#241C18 60%,#1A1513 100%)',
  text: '#F3EDE4',
  accent: '#C9A227',
  ink: '#1A1513',
  rule: '#4A4238',
  ruleSoft: '#3a322b',
} as const;
