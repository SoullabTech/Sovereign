// frontend

export type ConversationStyle = 'gentle' | 'direct' | 'playful' | 'clinical' | 'wise';

export type ConversationStylePreference = {
  style: ConversationStyle;
  allowInterruptions?: boolean;
  maxTurnsPerReply?: number;
};

export const DEFAULT_CONVERSATION_STYLE: ConversationStylePreference = {
  style: 'gentle',
  allowInterruptions: false,
  maxTurnsPerReply: 4,
};

export function getDefaultConversationStyle(): ConversationStylePreference {
  return DEFAULT_CONVERSATION_STYLE;
}