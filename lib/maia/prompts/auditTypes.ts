/**
 * Shared types for field-aware audit prompt builders.
 */

export interface AuditFieldContext {
  masterName: string;
  tone: string;
  frameworks: string[];
  systemPromptBlock: string;
}
