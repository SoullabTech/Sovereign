/**
 * FOCUS MODULE
 *
 * ADHD-friendly focus tools for Soullab.
 * "Be a nervous-system ally, not a second operating system."
 *
 * Core Loop: Capture -> Choose -> Do -> Close
 */

export { FocusScheduler } from './FocusScheduler';
export type { FocusTask, FocusReminder, MessageDraft } from './FocusScheduler';

export { FocusReminderService, focusReminderService } from './FocusReminderService';

// Weight tracking for stewardship thresholds
export {
  WeightTracking,
  logAction,
  getWeeklyWeight,
  getMonthlyWeight,
  getMemberStewardship,
  checkThreshold,
  checkAndLogAction,
  updateMemberTier,
  grantSponsoredAccess,
  ACTION_WEIGHTS,
  TIER_THRESHOLDS,
} from './weightTracking';
export type {
  ActionType,
  StewardshipTier,
  ThresholdLevel,
  ThresholdCheck,
  MemberStewardship,
  WeightLogEntry,
} from './weightTracking';
