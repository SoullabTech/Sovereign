/**
 * Onboarding Metadata Utilities
 *
 * Manages the onboarding context that flows from Facet Router
 * through Sacred Soul Induction to MAIA's first contact
 */

export type OnboardingReason =
  | "inner"
  | "direction"
  | "work"
  | "relationships"
  | "support"
  | "explore";

export type OnboardingFeeling = "air" | "water" | "fire" | "earth" | "neutral";

export interface OnboardingMetadata {
  isFirstContact: boolean;
  reason?: OnboardingReason;
  feeling?: OnboardingFeeling;
  partnerContext?: string;
}

export function getOnboardingMetadata(): OnboardingMetadata | null {
  if (typeof window === "undefined") return null;

  // Check if this is a first contact situation
  const pending = localStorage.getItem("sl_onboarding_first_contact_pending");
  if (pending !== "true") return null;

  const reason = localStorage.getItem("sl_onboarding_reason") as OnboardingReason | null;
  const feeling = localStorage.getItem("sl_onboarding_feeling") as OnboardingFeeling | null;
  const partnerContext = localStorage.getItem("sl_partner_context") || "general";

  return {
    isFirstContact: true,
    reason: reason || undefined,
    feeling: feeling || undefined,
    partnerContext,
  };
}

export function clearOnboardingFirstContactFlag() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sl_onboarding_first_contact_pending");
}

/**
 * Store onboarding context from Facet Router
 */
export function storeOnboardingContext(
  reason: OnboardingReason,
  feeling: OnboardingFeeling,
  partnerContext: string = "general"
) {
  if (typeof window === "undefined") return;

  localStorage.setItem("sl_onboarding_reason", reason);
  localStorage.setItem("sl_onboarding_feeling", feeling);
  localStorage.setItem("sl_partner_context", partnerContext);
  localStorage.setItem("sl_onboarding_first_contact_pending", "true");
}

/**
 * Store neutral defaults for users who opt out
 */
export function storeNeutralOnboardingContext(partnerContext: string = "general") {
  storeOnboardingContext("explore", "neutral", partnerContext);
}