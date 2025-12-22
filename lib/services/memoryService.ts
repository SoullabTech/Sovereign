'use client';

// Sovereignty mode: Memory service disabled (Supabase removed)

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
  console.log('[memoryService] Sovereignty mode: Memory persistence disabled');
  return { success: true, memory: { id: 'local-memory' } };
}

export async function getConversationHistory(oracleAgentId: string, limit = 20) {
  console.log('[memoryService] Sovereignty mode: Memory retrieval disabled');
  return { success: true, memories: [] };
}

export async function getOracleAgentId(userId: string): Promise<string | null> {
  console.log('[memoryService] Sovereignty mode: Agent lookup disabled');
  return null;
}
