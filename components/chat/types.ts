export type ElementalHint = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type ThinkingState = 'idle' | 'thinking' | 'responding';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'maia';
  timestamp: Date;
  elementalHints?: ElementalHint[];
  isJournalTagged?: boolean;
  symbols?: string[];
  transformationPotential?: number;
}

export interface ConversationGroup {
  messages: Message[];
  sender: 'user' | 'maia';
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface SacredInputState {
  message: string;
  isFocused: boolean;
  isExpanded: boolean;
  showQuickActions: boolean;
}