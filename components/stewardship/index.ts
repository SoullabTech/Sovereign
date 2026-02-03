/**
 * Stewardship Components
 *
 * UI components for the upgrade prompt and threshold system.
 * Philosophy: Invitations, not pressure. Adults choose.
 */

export { UpgradePromptModal } from './UpgradePromptModal';
export type { UpgradePromptData } from './UpgradePromptModal';

export { FeatureGateBanner } from './FeatureGateBanner';

export { AnnualCheckinModal } from './AnnualCheckinModal';

export { HelperFundPrompt } from './HelperFundPrompt';

export { useUpgradePrompt, useFeatureGate } from './useUpgradePrompt';
