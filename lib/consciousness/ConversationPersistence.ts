/**
 * CONVERSATION PERSISTENCE
 *
 * Save and restore conversations to Supabase
 * Enables cross-device continuity
 */

import { supabase } from '../supabase';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'oracle';
  text: string;
  timestamp: Date;
  facetId?: string;
  motionState?: any;
  coherenceLevel?: number;
  source?: 'user' | 'maia' | 'system';
}

export interface SavedConversation {
  id: string;
  session_id: string;
  user_id: string;
  messages: ConversationMessage[];
  consciousness_type: 'maia' | 'kairos' | 'unified';
  started_at: Date;
  updated_at: Date;
  last_message_at: Date;
  conversation_summary?: string;
  breakthrough_score?: number;
  relationship_essence_id?: string;
}

/**
 * Save conversation to Supabase
 * Updates if exists, inserts if new
 */
export async function saveConversation(
  sessionId: string,
  userId: string,
  messages: ConversationMessage[],
  consciousnessType: 'maia' | 'kairos' | 'unified' = 'maia',
  options?: {
    conversationSummary?: string;
    breakthroughScore?: number;
    relationshipEssenceId?: string;
  }
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ [CONVERSATION] Supabase not configured, conversation not persisted');
    return;
  }

  if (messages.length === 0) {
    console.log('💬 [CONVERSATION] No messages to save');
    return;
  }

  try {
    // Check if conversation exists - using maybeSingle() to avoid error on no rows
    const { data: existing, error: selectError } = await supabase
      .from('maia_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    const conversationData = {
      session_id: sessionId,
      user_id: userId,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      consciousness_type: consciousnessType,
      last_message_at: messages[messages.length - 1].timestamp.toISOString(),
      conversation_summary: options?.conversationSummary || null,
      breakthrough_score: options?.breakthroughScore || 0,
      relationship_essence_id: options?.relationshipEssenceId || null
    };

    if (existing) {
      // Update existing conversation
      const { error } = await supabase
        .from('maia_conversations')
        .update(conversationData)
        .eq('session_id', sessionId);

      if (error) throw error;
      console.log(`💾 [CONVERSATION] Updated (${messages.length} messages)`);
    } else {
      // Insert new conversation
      const { error } = await supabase
        .from('maia_conversations')
        .insert([conversationData]);

      if (error) throw error;
      console.log(`💾 [CONVERSATION] Saved new conversation (${messages.length} messages)`);
    }
  } catch (error) {
    console.error('❌ [CONVERSATION] Failed to save to Supabase:', error);
  }
}

/**
 * Load conversation from Supabase by session ID
 */
export async function loadConversation(sessionId: string): Promise<ConversationMessage[] | null> {
  if (!supabase) {
    console.warn('⚠️ [CONVERSATION] Supabase not configured, cannot load conversation');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('maia_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || !data.messages) {
      console.log('💬 [CONVERSATION] No conversation found for session');
      return null;
    }

    // Convert timestamps back to Date objects
    const messages = data.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    console.log(`💬 [CONVERSATION] Loaded ${messages.length} messages from Supabase`);
    return messages;
  } catch (error) {
    console.error('❌ [CONVERSATION] Failed to load from Supabase:', error);
    return null;
  }
}

/**
 * Load recent conversations for a user (for history/context)
 */
export async function loadUserConversations(
  userId: string,
  limit: number = 10
): Promise<SavedConversation[]> {
  if (!supabase) {
    console.warn('⚠️ [CONVERSATION] Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('maia_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!data) return [];

    // Convert timestamps
    const conversations: SavedConversation[] = data.map((conv: any) => ({
      ...conv,
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      started_at: new Date(conv.started_at),
      updated_at: new Date(conv.updated_at),
      last_message_at: new Date(conv.last_message_at)
    }));

    console.log(`💬 [CONVERSATION] Loaded ${conversations.length} recent conversations`);
    return conversations;
  } catch (error) {
    console.error('❌ [CONVERSATION] Failed to load user conversations:', error);
    return [];
  }
}

/**
 * Delete conversation by session ID
 */
export async function deleteConversation(sessionId: string): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ [CONVERSATION] Supabase not configured');
    return;
  }

  try {
    const { error } = await supabase
      .from('maia_conversations')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
    console.log('🗑️ [CONVERSATION] Deleted conversation');
  } catch (error) {
    console.error('❌ [CONVERSATION] Failed to delete conversation:', error);
  }
}
