/**
 * Onboarding State Machine — single source of truth
 *
 * getNextOnboardingStep() is the canonical function for determining
 * where a member should go next. Use it everywhere:
 *   - magic-link GET handler
 *   - magic-link-success recovery
 *   - /begin ProfileStep redirect
 *   - /onboarding completion
 *   - /maia entry guard
 *
 * Server truth > client state. This function works from DB row data,
 * never from localStorage or URL params.
 */

export type OnboardingPhase =
  | 'needs_profile'    // member exists but hasn't completed profile step
  | 'needs_faq'        // profile done; FAQ not yet seen
  | 'needs_prefs'      // FAQ done; preference step not yet done
  | 'complete';        // fully onboarded

export interface OnboardingTarget {
  phase: OnboardingPhase;
  /** Canonical next path for this member */
  path: string;
  /** Human-readable label for resume banners */
  label: string;
  /** True when the member is fully onboarded and should be in MAIA */
  ready: boolean;
}

/**
 * Minimal member shape required for routing decisions.
 * Compatible with any partial DB row — null-safe throughout.
 */
export interface OnboardingMemberRow {
  onboarded?: boolean | null;
  onboarding_step?: string | null;
}

/**
 * Canonical next-step resolver.
 *
 * Rules (in priority order):
 *  1. onboarded === true  →  complete, go to /maia
 *  2. onboarding_step === 'complete'  →  complete, go to /maia
 *  3. onboarding_step === 'onboarding'  →  needs_prefs, go to /onboarding
 *  4. onboarding_step === 'faq'  →  needs_faq, go to /faq
 *  5. onboarding_step === 'test-elemental'  →  needs_faq, go to /faq
 *     (passkey/email step is complete; FAQ is next regardless of path taken)
 *  6. anything else  →  needs_profile, go to /begin
 */
export function getNextOnboardingStep(
  member: OnboardingMemberRow | null | undefined
): OnboardingTarget {
  if (!member) {
    return {
      phase: 'needs_profile',
      path: '/begin',
      label: 'Create your profile to get started',
      ready: false,
    };
  }

  if (member.onboarded === true || member.onboarding_step === 'complete') {
    return {
      phase: 'complete',
      path: '/maia',
      label: 'Your journey is ready',
      ready: true,
    };
  }

  if (member.onboarding_step === 'onboarding') {
    return {
      phase: 'needs_prefs',
      path: '/onboarding',
      label: 'Finish setting your preferences',
      ready: false,
    };
  }

  if (member.onboarding_step === 'faq' || member.onboarding_step === 'test-elemental') {
    return {
      phase: 'needs_faq',
      path: '/faq',
      label: 'Continue to the orientation',
      ready: false,
    };
  }

  // Covers: null, 'begin', or any unknown value
  return {
    phase: 'needs_profile',
    path: '/begin',
    label: 'Complete your profile to continue',
    ready: false,
  };
}

/**
 * Server-side convenience: given a raw DB row, return the target path.
 * Drop-in replacement for the inline `isOnboarded ? '/maia' : ...` pattern.
 */
export function resolveOnboardingPath(member: OnboardingMemberRow | null | undefined): string {
  return getNextOnboardingStep(member).path;
}
