/**
 * Trust Layer Labels
 *
 * Human-readable labels, descriptions, and colors for all trust modes.
 * Single source of truth — prevents trust language from drifting across pages.
 *
 * Color semantics:
 *   teal  = restricted / contained / safe
 *   blue  = standard / active
 *   amber = attention / exception
 *   red   = confidential / maximum restriction
 *   slate = neutral / full exposure
 */

// ── Calendar Disclosure ────────────────────────────────────

export const DISCLOSURE_LABELS = {
  busy_only: {
    label: 'Busy only',
    shortDescription: 'Calendar shows only that time is blocked.',
    longDescription: 'No client name, notes, or session details are shared to the calendar. External viewers see a busy block with no identifying information.',
    color: 'teal' as const,
  },
  generic: {
    label: 'Generic',
    shortDescription: 'Session type visible, no client name.',
    longDescription: 'The calendar shows the session type (e.g. "Follow Up") but not the client name or notes. This is the recommended default for shared calendars.',
    color: 'teal' as const,
  },
  full: {
    label: 'Full details',
    shortDescription: 'Client name and notes visible on calendar.',
    longDescription: 'The full session title, client name, and notes are visible on the external calendar. Use only when your calendar is private or when disclosure is intended.',
    color: 'slate' as const,
  },
} as const;

// ── Session Privacy ────────────────────────────────────────

export const PRIVACY_LABELS = {
  private: {
    label: 'Private',
    shortDescription: 'Only you can access this session.',
    longDescription: 'Session content is not shared, summarized, or available to AI. This is the most restrictive mode.',
    color: 'teal' as const,
  },
  standard: {
    label: 'Standard',
    shortDescription: 'Normal session, AI available if enabled.',
    longDescription: 'Session operates normally. AI features are available if Session Support is turned on.',
    color: 'blue' as const,
  },
  sensitive: {
    label: 'Sensitive',
    shortDescription: 'Elevated privacy, limited sharing.',
    longDescription: 'Session content is handled with elevated care. Sharing and export are restricted. AI features are available only if explicitly enabled.',
    color: 'amber' as const,
  },
  confidential: {
    label: 'Confidential',
    shortDescription: 'Maximum privacy, no AI processing.',
    longDescription: 'No AI summaries, no pattern extraction, no export. Session content stays entirely within the session boundary.',
    color: 'red' as const,
  },
} as const;

// ── Session Support (AI Participation) ─────────────────────

export const SESSION_SUPPORT_LABELS = {
  enabled: {
    label: 'On',
    shortDescription: 'MAIA may assist with reflection and follow-up.',
    longDescription: 'MAIA can generate summaries, insights, and follow-up artifacts from this session. Session content may contribute to longitudinal patterns.',
    color: 'blue' as const,
  },
  disabled: {
    label: 'Off',
    shortDescription: 'No AI support during this session.',
    longDescription: 'MAIA will not generate summaries, insights, or follow-ups. Session content stays within the session and does not enter AI processing.',
    color: 'teal' as const,
  },
} as const;

// ── Color → Tailwind class mapping ─────────────────────────

export const TRUST_BADGE_COLORS = {
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400' },
  slate: { bg: 'bg-slate-700', text: 'text-slate-400' },
} as const;

export type TrustColor = keyof typeof TRUST_BADGE_COLORS;
