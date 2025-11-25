/**
 * Adapter for PersonalOracleAgent to use Hybrid Memory System
 *
 * This provides backward compatibility while enabling mem0 integration
 * - If ENABLE_MEM0=false: Works exactly like before (Supabase only)
 * - If ENABLE_MEM0=true: Adds semantic search via mem0
 */

import { createClient } from '@supabase/supabase-js';

// Feature flag
const MEM0_ENABLED = process.env.ENABLE_MEM0 === 'true';

// Lazy-load mem0 only if enabled
let MemoryClient: any = null;
let mem0Client: any = null;

if (MEM0_ENABLED && process.env.MEM0_API_KEY) {
  try {
    const mem0Module = require('mem0ai');
    MemoryClient = mem0Module.MemoryClient;
    mem0Client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });
    console.log('🧠 mem0 integration enabled');
  } catch (err) {
    console.warn('⚠️ mem0 module not available, falling back to Supabase only');
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Save conversation pair (user + MAIA) to memory
 * Saves to Supabase (always) and mem0 (if enabled)
 */
export async function saveConversationPair(
  userId: string,
  sessionId: string,
  userMessage: string,
  maiaResponse: string,
  options?: {
    coherenceLevel?: number;
    element?: string;
    isBreakthrough?: boolean;
  }
): Promise<void> {
  // 1. Save to Supabase (primary)
  try {
    // User message
    await supabase.from('maia_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: userMessage,
      context: 'conversation'
    });

    // MAIA response
    const elements = options?.element ? { [options.element]: 1.0 } : {};
    await supabase.from('maia_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'maia',
      content: maiaResponse,
      coherence_level: options?.coherenceLevel || 0.7,
      elements,
      is_breakthrough: options?.isBreakthrough || false,
      context: 'conversation'
    });

    console.log(`✅ Supabase: Saved conversation pair`);
  } catch (err: any) {
    console.error(`❌ Supabase save failed:`, err.message);
  }

  // 2. Save to mem0 (optional semantic indexing)
  if (MEM0_ENABLED && mem0Client) {
    try {
      await mem0Client.add(
        [
          { role: 'user', content: userMessage },
          { role: 'assistant', content: maiaResponse }
        ],
        {
          user_id: userId,
          metadata: {
            session_id: sessionId,
            coherence_level: options?.coherenceLevel,
            element: options?.element,
            is_breakthrough: options?.isBreakthrough,
            timestamp: new Date().toISOString()
          }
        }
      );
      console.log(`✅ mem0: Indexed conversation pair`);
    } catch (err: any) {
      console.warn(`⚠️ mem0 save failed (non-critical):`, err.message);
    }
  }
}

/**
 * Retrieve conversation history
 * Returns Supabase (always) + mem0 semantic matches (if enabled and query provided)
 */
export async function getConversationHistory(
  userId: string,
  options?: {
    limit?: number;
    semanticQuery?: string;
  }
): Promise<any[]> {
  const limit = options?.limit || 10;
  const memories: any[] = [];

  // 1. Get chronological history from Supabase (baseline)
  try {
    const { data, error } = await supabase
      .from('maia_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // x2 for user + maia pairs

    if (!error && data) {
      memories.push(...data);
      console.log(`💭 Supabase: Retrieved ${data.length} messages`);
    }
  } catch (err: any) {
    console.error(`❌ Supabase retrieval failed:`, err.message);
  }

  // 2. Optionally enrich with mem0 semantic search
  if (MEM0_ENABLED && mem0Client && options?.semanticQuery) {
    try {
      const semanticResults = await mem0Client.search(
        options.semanticQuery,
        {
          user_id: userId,
          limit: 3 // Top 3 semantic matches
        }
      );

      if (semanticResults && Array.isArray(semanticResults)) {
        // Add semantic results with a flag
        semanticResults.forEach((result: any) => {
          memories.push({
            role: 'semantic',
            content: result.memory,
            created_at: result.created_at,
            relevance: result.score,
            _source: 'mem0'
          });
        });
        console.log(`🧠 mem0: Added ${semanticResults.length} semantic matches`);
      }
    } catch (err: any) {
      console.warn(`⚠️ mem0 search failed (non-critical):`, err.message);
    }
  }

  return memories;
}

/**
 * Get breakthrough moments
 */
export async function getBreakthroughMoments(
  userId: string,
  limit: number = 5
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('maia_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('is_breakthrough', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  } catch (err) {
    console.error('❌ Error retrieving breakthroughs:', err);
    return [];
  }
}
