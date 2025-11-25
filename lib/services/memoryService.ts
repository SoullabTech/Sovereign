'use client';

import { createClientComponentClient } from '@/lib/supabase';

export interface ConversationMemory {
  oracleAgentId: string;
  content: string;
  memoryType: 'conversation' | 'ritual' | 'dream' | 'reflection' | 'insight' | 'question';
  sourceType: 'voice' | 'text' | 'ritual' | 'dream' | 'journal';
  emotionalTone?: string;
  wisdomThemes?: string[];
  elementalResonance?: string;
  sessionId?: string;
}

export async function saveConversationMemory(memory: ConversationMemory) {
  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from('memories')
      .insert({
        oracle_agent_id: memory.oracleAgentId,
        content: memory.content,
        memory_type: memory.memoryType,
        source_type: memory.sourceType,
        emotional_tone: memory.emotionalTone,
        wisdom_themes: memory.wisdomThemes,
        elemental_resonance: memory.elementalResonance,
        session_id: memory.sessionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Memory saved to Supabase:', data.id);
    return { success: true, memory: data };
  } catch (error) {
    console.error('Failed to save memory:', error);
    return { success: false, error };
  }
}

export async function getConversationHistory(oracleAgentId: string, limit = 20) {
  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('oracle_agent_id', oracleAgentId)
      .eq('memory_type', 'conversation')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ Retrieved ${data.length} memories from Supabase`);
    return { success: true, memories: data };
  } catch (error) {
    console.error('Failed to retrieve memories:', error);
    return { success: false, error, memories: [] };
  }
}

export async function getOracleAgentId(userId: string): Promise<string | null> {
  const supabase = createClientComponentClient();

  try {
    // Validate UUID format or user_ prefix format to prevent database errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const userIdRegex = /^user_\d+$/;
    if (!uuidRegex.test(userId) && !userIdRegex.test(userId)) {
      console.log(`[memoryService] Skipping agent lookup for non-UUID/user_ user: ${userId}`);
      return null;
    }

    const { data, error } = await supabase
      .from('oracle_agents')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data?.id || null;
  } catch (error) {
    console.error('Failed to get oracle agent ID:', error);
    return null;
  }
}

/**
 * Get relevant memories for elemental agents
 * Stub implementation - returns empty array for now
 */
export async function getRelevantMemories(userId: string, context?: any): Promise<any[]> {
  // TODO: Implement semantic memory retrieval
  // For now, return empty array so elemental agents don't crash
  return [];
}

/**
 * Store memory item from elemental agents
 * Stub implementation - no-op for now
 */
export async function storeMemoryItem(userId: string, memory: any): Promise<void> {
  // TODO: Implement memory storage
  // For now, no-op so elemental agents don't crash
  return;
}
