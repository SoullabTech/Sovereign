/**
 * Cross-System Convergence Copy Kit
 *
 * Audience-adaptive copy for the insight that when multiple wisdom systems
 * (Western, Chinese, Mayan astrology) align on a theme, that's signal—not noise.
 *
 * Three registers:
 * - mystic: initiatory, reverent, imaginal (seekers, depth work)
 * - pragmatic: grounded, clear, decision-oriented (coaches, developers)
 * - product: intelligent, modern, trustworthy (onboarding, investors)
 */

export type AudienceMode = 'mystic' | 'pragmatic' | 'product';
export type TooltipSize = 'xs' | 's';
export type UIContext = 'card' | 'modal' | 'inline';

export interface AudienceCopy {
  mystic: string;
  pragmatic: string;
  product: string;
}

/**
 * One-liner variants (headline / hero)
 */
export const ONE_LINERS: AudienceCopy = {
  mystic: "When ancient maps converge, the soul is being spoken to from more than one direction.",
  pragmatic: "When multiple wisdom systems point to the same theme, that's a signal worth acting on.",
  product: "MAIA cross-checks multiple astrology systems—alignment means confidence, divergence reveals nuance."
};

/**
 * Universal one-liner (no explicit mode)
 */
export const UNIVERSAL_ONE_LINER = "When the maps converge, take it as a stronger signal.";

/**
 * Adaptive lines (same meaning, different register)
 * For profile-switchable UI without explicit mode labels
 */
export const ADAPTIVE_LINES: AudienceCopy = {
  mystic: "When the maps converge, the message is asking to be trusted.",
  pragmatic: "When the maps converge, confidence goes up.",
  product: "When the maps converge, the theme is likely real."
};

/**
 * Tooltip copy by size and audience
 */
export const TOOLTIPS: Record<TooltipSize, AudienceCopy> = {
  xs: {
    mystic: "When maps converge, Spirit is speaking twice.",
    pragmatic: "When systems agree, treat it as a strong signal.",
    product: "Cross-checked insights: alignment = confidence, divergence = nuance."
  },
  s: {
    mystic: "Convergence = the same message arriving through multiple symbols.",
    pragmatic: "Two or more systems agree → higher confidence.",
    product: "MAIA triangulates across systems to strengthen decisions."
  }
};

/**
 * Card copy (dashboard / "How MAIA Thinks")
 */
export const CARD_COPY: AudienceCopy = {
  mystic: "When multiple maps converge, the soul is being addressed from more than one direction.",
  pragmatic: "When multiple systems point to the same theme, that's a signal worth acting on.",
  product: "MAIA cross-checks systems—alignment boosts confidence; divergence reveals nuance."
};

/**
 * Modal copy (first-time explainer)
 */
export const MODAL_COPY = {
  title: "Cross-System Convergence",
  body: {
    mystic: "Different symbolic languages can carry the same message. Agreement is a chorus; disagreement is a prism.",
    pragmatic: "We compare multiple systems. Agreement increases confidence; differences show which layer you're working on.",
    product: "We triangulate insights across astrology frameworks to reduce noise and surface stronger patterns."
  } as AudienceCopy
};

/**
 * Inline explainer (beneath results / "Why this matters")
 */
export const INLINE_EXPLAINER: AudienceCopy = {
  mystic: "Convergence = confirmation. Divergence = deeper dimensionality.",
  pragmatic: "Convergence = act. Divergence = clarify the question.",
  product: "Convergence = reliability. Divergence = resolution."
};

/**
 * Get copy for a specific UI context and audience
 */
export function getCopy(context: UIContext, audience: AudienceMode): string {
  switch (context) {
    case 'card':
      return CARD_COPY[audience];
    case 'modal':
      return MODAL_COPY.body[audience];
    case 'inline':
      return INLINE_EXPLAINER[audience];
    default:
      return UNIVERSAL_ONE_LINER;
  }
}

/**
 * Get tooltip copy by size and audience
 */
export function getTooltip(size: TooltipSize, audience: AudienceMode): string {
  return TOOLTIPS[size][audience];
}

/**
 * Get adaptive line based on user profile
 * Falls back to universal if audience unknown
 */
export function getAdaptiveLine(audience?: AudienceMode): string {
  if (!audience) return UNIVERSAL_ONE_LINER;
  return ADAPTIVE_LINES[audience];
}

/**
 * Full copy object for a given audience
 * Useful for pre-loading all copy for a user's profile
 */
export function getAudienceCopyKit(audience: AudienceMode) {
  return {
    oneLiner: ONE_LINERS[audience],
    adaptive: ADAPTIVE_LINES[audience],
    tooltipXS: TOOLTIPS.xs[audience],
    tooltipS: TOOLTIPS.s[audience],
    card: CARD_COPY[audience],
    modalTitle: MODAL_COPY.title,
    modalBody: MODAL_COPY.body[audience],
    inline: INLINE_EXPLAINER[audience]
  };
}
