'use client';

import type { ConversationMessage } from '@/types/conversation';

// Sovereignty mode: Conversation storage service disabled (Supabase removed)
// All conversation persistence uses localStorage only

export interface StoredMessage {
  id?: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'oracle';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export async function saveMessage(
  sessionId: string,
  userId: string,
  message: ConversationMessage
): Promise<{ success: boolean; error?: any }> {
  console.log('[conversationStorage] Sovereignty mode: Message persistence disabled');
  return { success: true };
}

export async function saveMessages(
  sessionId: string,
  userId: string,
  messages: ConversationMessage[]
): Promise<{ success: boolean; count: number; error?: any }> {
  console.log('[conversationStorage] Sovereignty mode: Batch save disabled');
  return { success: true, count: 0 };
}

export async function getConversationHistory(
  sessionId: string,
  userId: string,
  limit = 100
): Promise<{ success: boolean; messages: ConversationMessage[]; error?: any }> {
  console.log('[conversationStorage] Sovereignty mode: History retrieval disabled (use localStorage)');
  return { success: true, messages: [] };
}

export async function getAllUserConversations(
  userId: string
): Promise<{ success: boolean; sessions: any[]; error?: any }> {
  console.log('[conversationStorage] Sovereignty mode: Session listing disabled');
  return { success: true, sessions: [] };
}

export async function deleteConversation(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> {
  console.log('[conversationStorage] Sovereignty mode: Deletion disabled');
  return { success: true };
}

export async function clearAllConversations(
  userId: string
): Promise<{ success: boolean; deletedCount: number; error?: any }> {
  console.log('[conversationStorage] Sovereignty mode: Clear all disabled');
  return { success: true, deletedCount: 0 };
}
