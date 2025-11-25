// Mirror Interface - Sacred Dialogue Components
export { default as MirrorInterface } from './MirrorInterface';
export { default as MessageBubble } from './MessageBubble';
export { default as SacredInputBar } from './SacredInputBar';
export { default as LogoThinkingIndicator } from './LogoThinkingIndicator';
export { default as ConversationFlow } from './ConversationFlow';

// Types
export * from './types';

// Utility functions
export const createMessage = (
  content: string,
  sender: 'user' | 'maia',
  options?: {
    elementalHints?: Array<'fire' | 'water' | 'earth' | 'air' | 'aether'>;
    isJournalTagged?: boolean;
    symbols?: string[];
    transformationPotential?: number;
  }
) => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  content,
  sender,
  timestamp: new Date(),
  ...options
});

export const getMessageDelay = (messageLength: number): number => {
  // Base delay 300ms, +100ms per 50 characters, max 900ms
  return Math.min(300 + Math.floor(messageLength / 50) * 100, 900);
};

export const detectElementalHints = (content: string): Array<'fire' | 'water' | 'earth' | 'air' | 'aether'> => {
  const hints: Array<'fire' | 'water' | 'earth' | 'air' | 'aether'> = [];
  const lowerContent = content.toLowerCase();
  
  // Fire keywords
  if (lowerContent.match(/\b(fire|flame|burn|passion|energy|power|courage|anger|transform)\b/)) {
    hints.push('fire');
  }
  
  // Water keywords
  if (lowerContent.match(/\b(water|flow|emotion|feeling|intuition|heal|cleanse|tears|ocean)\b/)) {
    hints.push('water');
  }
  
  // Earth keywords
  if (lowerContent.match(/\b(earth|ground|stable|practical|body|nature|grow|roots|solid)\b/)) {
    hints.push('earth');
  }
  
  // Air keywords
  if (lowerContent.match(/\b(air|wind|thought|mind|ideas|communicate|breath|freedom|light)\b/)) {
    hints.push('air');
  }
  
  // Aether keywords
  if (lowerContent.match(/\b(spirit|soul|consciousness|divine|transcend|wisdom|sacred|unity)\b/)) {
    hints.push('aether');
  }
  
  return hints;
};