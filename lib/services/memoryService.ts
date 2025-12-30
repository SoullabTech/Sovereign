'use client';

/**
 * MEMORY SERVICE - Client-side stubs
 *
 * The actual memory persistence happens via:
 * - /api/consciousness/memory/store (writes to conversation_turns)
 * - /api/consciousness/memory/recall (reads from conversation_turns)
 *
 * These functions are stubs to prevent runtime errors in components
 * that import them. They log warnings so we can track usage.
 */

export interface ConversationMemory {
  oracleAgentId: string;
  content: string;
  memoryType: 'conversation' | 'ritual' | 'dream' | 'reflection' | 'insight' | 'question';
  sourceType: 'voice' | 'text' | 'ritual' | 'dream' | 'journal';
  emotionalTone?: string;
  wisdomThemes?: string[];
  elementalResonance?: string;
  sessionId?: string;
  // OracleConversation-expected properties
  userId?: string;
  role?: 'user' | 'oracle' | 'assistant' | 'system';
  conversationMode?: string;
}

export async function saveConversationMemory(memory: ConversationMemory) {
  // Stub: Memory persistence now happens via /api/consciousness/memory/store
  // This function is kept for backwards compatibility
  console.log('[memoryService] saveConversationMemory is a stub - using API routes instead');
  return { success: true, memory: null };
}

export async function getConversationHistory(oracleAgentId: string, limit = 20) {
  // Stub: Memory retrieval now happens via /api/consciousness/memory/recall
  console.log('[memoryService] getConversationHistory is a stub - using API routes instead');
  return { success: true, memories: [] };
}

export async function getOracleAgentId(userId: string): Promise<string | null> {
  // Stub: Oracle agent lookup not needed for new memory system
  // The conversation_turns table uses user_id directly
  console.log('[memoryService] getOracleAgentId is a stub - user_id used directly');

  // Return the userId itself as a fallback identifier
  // This allows components to have a non-null value to work with
  if (userId && userId !== 'guest') {
    return userId;
  }
  return null;
}

/**
 * Get relevant memories for elemental agents
 * Stub implementation - returns empty array for now
 */
export async function getRelevantMemories(userId: string, context?: any): Promise<any[]> {
  // TODO: Implement semantic memory retrieval via API route
  return [];
}

/**
 * Store memory item from elemental agents
 * Stub implementation - no-op for now
 */
export async function storeMemoryItem(userId: string, memory: any): Promise<void> {
  // TODO: Implement memory storage via API route
  return;
}
