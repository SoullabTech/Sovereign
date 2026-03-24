/**
 * First Descent — Types
 *
 * Minimal type definitions for the threshold experience.
 * No state machine, no element types, no pattern types.
 */

export type DescentStep = 'threshold' | 'input' | 'reply' | 'complete';

export interface DescentSeed {
  originInput: string;
  maiaReply: string;
  completedAt: string;
  promptVersion?: string;
  modelUsed?: string;
}
