/**
 * Pricing & Threshold System
 *
 * Exports for the pricing, tier, and upgrade prompt system.
 */

// Threshold detection
export {
  type PractitionerTier,
  type MemberSupportLevel,
  type ThresholdContext,
  type ThresholdResult,
  type PromptType,
  PRACTITIONER_THRESHOLDS,
  MEMBER_THRESHOLDS,
  COOLDOWN_DAYS,
  shouldPromptStudioUpgrade,
  shouldPromptSupporter,
  checkFeatureGate,
  PROMPT_MESSAGES,
} from './thresholds';

// Prompt service
export {
  type PromptRecord,
  type UsageMetrics,
  recordPromptShown,
  recordPromptResponse,
  getLastPrompt,
  isInCooldown,
  getUsageMetrics,
  incrementUsageMetric,
  checkForUpgradePrompt,
} from './promptService';

// Helper Fund
export {
  type HelperFundApplication,
  type HelperFundContribution,
  type HelperFundStats,
  submitHelperFundApplication,
  getApplicationStatus,
  approveApplication,
  declineApplication,
  hasActiveScholarship,
  createContribution,
  pauseContribution,
  cancelContribution,
  getMemberContribution,
  getHelperFundStats,
} from './helperFund';
