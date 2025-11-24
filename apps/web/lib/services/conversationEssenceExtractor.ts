// frontend
// apps/web/lib/services/conversationEssenceExtractor.ts

export type BreakthroughLevel = 'none' | 'low' | 'medium' | 'high';

export interface ConversationEssenceAnalysis {
  isJournalCommand: boolean;
  breakthroughLevel: BreakthroughLevel;
  tags: string[];
  summary?: string;
}

/**
 * Very simple heuristic placeholder:
 * In the original build this would look at the text and decide if
 * MAIA should route into journaling mode.
 */
export function detectJournalCommand(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes('journal this') ||
    lower.includes('save this') ||
    lower.includes('write this down') ||
    lower.includes('log this')
  );
}

/**
 * Placeholder breakthrough detector.
 * In the real version this would analyze intensity, pattern shifts, etc.
 */
export function detectBreakthroughPotential(message: string): BreakthroughLevel {
  if (!message || typeof message !== 'string') {
    return 'none';
  }

  const lower = message.toLowerCase();

  if (
    lower.includes('everything is changing') ||
    lower.includes('i finally see') ||
    lower.includes('this is huge') ||
    lower.includes('life-changing')
  ) {
    return 'high';
  }

  if (
    lower.includes('i think i understand') ||
    lower.includes('something is shifting') ||
    lower.includes('this feels important')
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Optional helper – if OracleConversation ends up calling something like this.
 */
export function analyzeConversationEssence(message: string): ConversationEssenceAnalysis {
  const isJournal = detectJournalCommand(message);
  const breakthroughLevel = detectBreakthroughPotential(message);

  const tags: string[] = [];
  if (isJournal) tags.push('journal');
  tags.push(`breakthrough:${breakthroughLevel}`);

  return {
    isJournalCommand: isJournal,
    breakthroughLevel,
    tags,
  };
}

// Support both named and default imports
const conversationEssenceExtractor = {
  detectJournalCommand,
  detectBreakthroughPotential,
  analyzeConversationEssence,
};

export default conversationEssenceExtractor;