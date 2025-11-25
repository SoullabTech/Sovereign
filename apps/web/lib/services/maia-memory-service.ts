/**
 * MAIA Memory Service
 * Handles saving and retrieving conversation memories from maia_messages table
 * This is the NEW memory system with coherence tracking and elemental resonance
 *
 * 🧠 HYBRID MEMORY: Now integrated with mem0 for semantic memory
 */

import { createClient } from '@supabase/supabase-js';
import {
  saveConversationPair as saveToHybridMemory,
  getConversationHistory as getFromHybridMemory,
  getBreakthroughMoments as getBreakthroughsFromHybrid
} from './maia-memory-hybrid-adapter';

// Using service role key as fallback if anon key is not available
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey
);

export interface MaiaMessageData {
  userId: string;
  sessionId: string;
  role: 'user' | 'maia';
  content: string;
  coherenceLevel?: number;
  motionState?: string;
  elements?: Record<string, number>;
  shadowPetals?: string[];
  context?: string;
  isBreakthrough?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Save a message to maia_messages table
 * Automatically updates session tracking and coherence log
 */
export async function saveMaiaMessage(message: MaiaMessageData) {
  try {
    // Ensure session exists first
    const { data: existingSession } = await supabase
      .from('maia_sessions')
      .select('id')
      .eq('session_id', message.sessionId)
      .single();

    if (!existingSession) {
      // Create session if it doesn't exist
      await supabase.from('maia_sessions').insert({
        user_id: message.userId,
        session_id: message.sessionId,
        coherence_level: message.coherenceLevel || 0.7,
        metadata: {
          created_by: 'maia-memory-service',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Save message
    const { data, error } = await supabase
      .from('maia_messages')
      .insert({
        session_id: message.sessionId,
        user_id: message.userId,
        role: message.role,
        content: message.content,
        coherence_level: message.coherenceLevel,
        motion_state: message.motionState,
        elements: message.elements || {},
        shadow_petals: message.shadowPetals || [],
        context: message.context,
        is_breakthrough: message.isBreakthrough || false,
        metadata: message.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to save MAIA message:', error);
      return { success: false, error };
    }

    console.log(`✅ MAIA message saved: ${message.role} (${message.content.substring(0, 50)}...)`);
    return { success: true, data };

  } catch (err: any) {
    console.error('❌ Error in saveMaiaMessage:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Save both user input and MAIA response as a conversation pair
 * 🧠 NOW USES HYBRID MEMORY: Saves to Supabase + mem0 (if enabled)
 */
export async function saveMaiaConversationPair(
  userId: string,
  sessionId: string,
  userMessage: string,
  maiaResponse: string,
  options?: {
    coherenceLevel?: number;
    element?: string;
    isBreakthrough?: boolean;
    context?: string;
  }
) {
  // 🧠 Use hybrid adapter - saves to Supabase (always) + mem0 (if ENABLE_MEM0=true)
  await saveToHybridMemory(
    userId,
    sessionId,
    userMessage,
    maiaResponse,
    {
      coherenceLevel: options?.coherenceLevel,
      element: options?.element,
      isBreakthrough: options?.isBreakthrough
    }
  );

  return { success: true };
}

/**
 * Get recent conversation history for a user
 */
export async function getMaiaConversationHistory(
  userId: string,
  limit: number = 20
) {
  try {
    const { data, error } = await supabase
      .from('maia_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Failed to retrieve conversation history:', error);
      return { success: false, messages: [] };
    }

    return { success: true, messages: data || [] };
  } catch (err: any) {
    console.error('❌ Error retrieving conversation history:', err);
    return { success: false, messages: [] };
  }
}

/**
 * Get breakthrough moments for a user
 */
export async function getMaiaBreakthroughs(userId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('maia_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('is_breakthrough', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, breakthroughs: [] };
    return { success: true, breakthroughs: data || [] };
  } catch (err) {
    return { success: false, breakthroughs: [] };
  }
}
