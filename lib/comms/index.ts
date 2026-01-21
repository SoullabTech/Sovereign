/**
 * COMMS SPINE: Module Index
 *
 * Unified communication platform layer for MAIA.
 *
 * @module lib/comms
 */

// Types
export * from './types';

// Events
export {
  emitEvent,
  emitEvents,
  emitMessageCreated,
  emitSafetyFlagged,
  emitSafetyAcknowledged,
  emitMAIAClassified,
  emitThreadCreated,
  getEvents,
} from './events';

// Services
export {
  getInbox,
  getUnreadCounts,
  hasSafetyConcerns,
} from './InboxService';

export {
  getThread,
  getEffectivePolicy,
  sendMessage,
  markMessagesRead,
  findOrCreateThread,
} from './ThreadService';

export {
  getSafetyDashboard,
  acknowledgeSafetyFlag,
  createSafetyFlag,
  escalateSafetyFlag,
  analyzeSafetyCues,
} from './SafetyService';

// MAIA Analyzer
export {
  analyzeCommsMessage,
  detectSafety,
  classifyType,
  inferUrgency,
  analyzeSentiment,
} from './maiaAnalyzer';
export type { MaiaClassification, MaiaSafetyResult, MaiaAnalysisResult } from './maiaAnalyzer';
