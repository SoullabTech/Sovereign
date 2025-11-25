'use client';

import { createClientComponentClient } from '@/lib/supabase';
import type { ConversationMessage } from '@/types/conversation';

/**
 * Conversation Storage Service
 *
 * Persists conversation messages to Supabase for:
 * - Cross-device sync
 * - Long-term storage
 * - Conversation history retrieval
 *
 * Works in conjunction with localStorage for hybrid approach:
 * - localStorage: instant restore (same device)
 * - Supabase: cross-device sync and backup
 */

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

/**
 * Save a single message to Supabase
 */
export async function saveMessage(
  sessionId: string,
  userId: string,
  message: ConversationMessage
): Promise<{ success: boolean; error?: any }> {
  const supabase = createClientComponentClient();

  try {
    const { error } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role: message.role === 'oracle' ? 'oracle' : 'user',
        content: message.text,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata || {},
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    console.log('💾 [Supabase] Message saved');
    return { success: true };
  } catch (error) {
    console.error('💾 [Supabase] Failed to save message:', error);
    return { success: false, error };
  }
}

/**
 * Batch save multiple messages to Supabase
 * More efficient than saving one at a time
 */
export async function saveMessages(
  sessionId: string,
  userId: string,
  messages: ConversationMessage[]
): Promise<{ success: boolean; count: number; error?: any }> {
  if (messages.length === 0) {
    return { success: true, count: 0 };
  }

  const supabase = createClientComponentClient();

  try {
    const messagesToInsert = messages.map(msg => ({
      session_id: sessionId,
      user_id: userId,
      role: msg.role === 'oracle' ? 'oracle' : 'user',
      content: msg.text,
      timestamp: msg.timestamp.toISOString(),
      metadata: msg.metadata || {},
      created_at: new Date().toISOString(),
    }));

    const { error, count } = await supabase
      .from('conversation_messages')
      .insert(messagesToInsert);

    if (error) throw error;

    console.log(`💾 [Supabase] Batch saved ${count || messages.length} messages`);
    return { success: true, count: count || messages.length };
  } catch (error) {
    console.error('💾 [Supabase] Failed to batch save messages:', error);
    return { success: false, count: 0, error };
  }
}

/**
 * Retrieve conversation messages from Supabase by sessionId
 */
export async function getMessagesBySession(
  sessionId: string,
  limit: number = 100
): Promise<{ success: boolean; messages: ConversationMessage[]; error?: any }> {
  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log(`💾 [Supabase] No messages found for session ${sessionId}`);
      return { success: true, messages: [] };
    }

    // Convert stored messages back to ConversationMessage format
    const messages: ConversationMessage[] = data.map((stored: any) => ({
      role: stored.role,
      text: stored.content,
      timestamp: new Date(stored.timestamp),
      metadata: stored.metadata || {},
    }));

    console.log(`💾 [Supabase] Retrieved ${messages.length} messages for session ${sessionId}`);
    return { success: true, messages };
  } catch (error) {
    console.error('💾 [Supabase] Failed to retrieve messages:', error);
    return { success: false, messages: [], error };
  }
}

/**
 * Delete old conversation messages to save storage
 * Keeps messages from last N days
 */
export async function cleanupOldMessages(
  userId: string,
  daysToKeep: number = 30
): Promise<{ success: boolean; deletedCount: number; error?: any }> {
  const supabase = createClientComponentClient();

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error, count } = await supabase
      .from('conversation_messages')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    console.log(`💾 [Supabase] Cleaned up ${count || 0} old messages (older than ${daysToKeep} days)`);
    return { success: true, deletedCount: count || 0 };
  } catch (error) {
    console.error('💾 [Supabase] Failed to cleanup old messages:', error);
    return { success: false, deletedCount: 0, error };
  }
}

/**
 * Get all sessions for a user (for cross-device session list)
 */
export async function getUserSessions(
  userId: string,
  limit: number = 50
): Promise<{ success: boolean; sessions: Array<{ sessionId: string; lastMessageAt: Date; messageCount: number }>; error?: any }> {
  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('session_id, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1000); // Get recent messages to aggregate by session

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, sessions: [] };
    }

    // Aggregate messages by session
    const sessionMap = new Map<string, { lastMessageAt: Date; messageCount: number }>();

    data.forEach((msg: any) => {
      const existing = sessionMap.get(msg.session_id);
      const msgDate = new Date(msg.timestamp);

      if (!existing) {
        sessionMap.set(msg.session_id, {
          lastMessageAt: msgDate,
          messageCount: 1
        });
      } else {
        existing.messageCount++;
        if (msgDate > existing.lastMessageAt) {
          existing.lastMessageAt = msgDate;
        }
      }
    });

    // Convert to array and sort by last message time
    const sessions = Array.from(sessionMap.entries())
      .map(([sessionId, info]) => ({
        sessionId,
        lastMessageAt: info.lastMessageAt,
        messageCount: info.messageCount
      }))
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      .slice(0, limit);

    console.log(`💾 [Supabase] Found ${sessions.length} sessions for user ${userId}`);
    return { success: true, sessions };
  } catch (error) {
    console.error('💾 [Supabase] Failed to get user sessions:', error);
    return { success: false, sessions: [], error };
  }
}

/**
 * Check if messages exist for a session (quick check before full retrieval)
 */
export async function hasMessages(sessionId: string): Promise<boolean> {
  const supabase = createClientComponentClient();

  try {
    const { count, error } = await supabase
      .from('conversation_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) throw error;

    return (count || 0) > 0;
  } catch (error) {
    console.error('💾 [Supabase] Failed to check for messages:', error);
    return false;
  }
}
