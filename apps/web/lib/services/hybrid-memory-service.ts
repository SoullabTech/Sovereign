/**
 * Hybrid Memory Service - Supabase + mem0
 *
 * Strategy:
 * - Supabase: Primary memory store (chronological, reliable)
 * - mem0: Semantic memory overlay (pattern detection, nuanced recall)
 *
 * Safety:
 * - Supabase always works (fallback)
 * - mem0 failures are caught and logged (non-breaking)
 * - Feature flag to enable/disable mem0
 */

import { createClient } from '@supabase/supabase-js';
import { MemoryClient } from 'mem0ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Initialize mem0 client (only if API key is set)
const mem0Client = process.env.MEM0_API_KEY
  ? new MemoryClient({ apiKey: process.env.MEM0_API_KEY })
  : null;

// Feature flag for mem0 integration
const MEM0_ENABLED = process.env.ENABLE_MEM0 === 'true' && mem0Client !== null;

console.log(`🧠 Hybrid Memory Service initialized:`);
console.log(`   Supabase: ✅ Always enabled`);
console.log(`   mem0: ${MEM0_ENABLED ? '✅ Enabled' : '⏸️ Disabled'}`);

export interface HybridMemoryMessage {
  userId: string;
  sessionId: string;
  role: 'user' | 'maia';
  content: string;
  coherenceLevel?: number;
  elements?: Record<string, number>;
  isBreakthrough?: boolean;
  context?: string;
}

export interface EnrichedMemory {
  source: 'supabase' | 'mem0';
  role: 'user' | 'maia';
  content: string;
  created_at: string;
  relevance?: number; // For mem0 semantic matches
  tags?: string[]; // For mem0 metadata
}

/**
 * Save message to both Supabase (primary) and mem0 (semantic index)
 */
export async function saveToHybridMemory(message: HybridMemoryMessage): Promise<{
  supabase: boolean;
  mem0: boolean;
}> {
  const results = { supabase: false, mem0: false };

  // 1. ALWAYS save to Supabase (primary, critical)
  try {
    const { error } = await supabase.from('maia_messages').insert({
      session_id: message.sessionId,
      user_id: message.userId,
      role: message.role,
      content: message.content,
      coherence_level: message.coherenceLevel,
      elements: message.elements || {},
      is_breakthrough: message.isBreakthrough || false,
      context: message.context
    });

    if (!error) {
      results.supabase = true;
      console.log(`✅ Supabase: Saved ${message.role} message`);
    } else {
      console.error(`❌ Supabase save failed:`, error.message);
    }
  } catch (err: any) {
    console.error(`❌ Supabase error:`, err.message);
  }

  // 2. OPTIONALLY save to mem0 (semantic indexing)
  if (MEM0_ENABLED && mem0Client) {
    try {
      await mem0Client.add(
        [{ role: message.role, content: message.content }],
        {
          user_id: message.userId,
          metadata: {
            session_id: message.sessionId,
            coherence_level: message.coherenceLevel,
            is_breakthrough: message.isBreakthrough,
            timestamp: new Date().toISOString()
          }
        }
      );

      results.mem0 = true;
      console.log(`✅ mem0: Indexed ${message.role} message`);
    } catch (err: any) {
      // mem0 failure is non-critical
      console.warn(`⚠️ mem0 save failed (non-critical):`, err.message);
      results.mem0 = false;
    }
  }

  return results;
}

/**
 * Retrieve enriched memory from both sources
 */
export async function getEnrichedMemory(
  userId: string,
  options: {
    limit?: number;
    semanticQuery?: string;
    includeBreakthroughs?: boolean;
  } = {}
): Promise<EnrichedMemory[]> {
  const { limit = 10, semanticQuery, includeBreakthroughs = true } = options;
  const enrichedMemories: EnrichedMemory[] = [];

  // 1. ALWAYS get chronological history from Supabase (baseline)
  try {
    const { data: supabaseMessages, error } = await supabase
      .from('maia_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // x2 for user + maia pairs

    if (!error && supabaseMessages) {
      supabaseMessages.forEach(msg => {
        enrichedMemories.push({
          source: 'supabase',
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at
        });
      });
      console.log(`💭 Supabase: Retrieved ${supabaseMessages.length} messages`);
    }
  } catch (err: any) {
    console.error(`❌ Supabase retrieval failed:`, err.message);
  }

  // 2. OPTIONALLY enrich with mem0 semantic search
  if (MEM0_ENABLED && mem0Client && semanticQuery) {
    try {
      const mem0Results = await mem0Client.search(
        semanticQuery,
        {
          user_id: userId,
          limit: 5 // Top 5 semantic matches
        }
      );

      if (mem0Results && Array.isArray(mem0Results)) {
        mem0Results.forEach((result: any) => {
          // Avoid duplicates from Supabase
          const isDuplicate = enrichedMemories.some(
            m => m.content === result.memory
          );

          if (!isDuplicate) {
            enrichedMemories.push({
              source: 'mem0',
              role: 'user', // mem0 doesn't distinguish role in search results
              content: result.memory,
              created_at: result.created_at || new Date().toISOString(),
              relevance: result.score
            });
          }
        });
        console.log(`🧠 mem0: Added ${mem0Results.length} semantic matches`);
      }
    } catch (err: any) {
      // mem0 failure is non-critical
      console.warn(`⚠️ mem0 search failed (non-critical):`, err.message);
    }
  }

  // 3. Get breakthroughs if requested
  if (includeBreakthroughs) {
    try {
      const { data: breakthroughs } = await supabase
        .from('maia_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_breakthrough', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (breakthroughs) {
        console.log(`⭐ Retrieved ${breakthroughs.length} breakthroughs`);
      }
    } catch (err: any) {
      console.warn(`⚠️ Breakthrough retrieval failed:`, err.message);
    }
  }

  return enrichedMemories;
}

/**
 * Health check for hybrid memory system
 */
export async function checkHybridMemoryHealth(): Promise<{
  supabase: boolean;
  mem0: boolean;
  details: string;
}> {
  const health = { supabase: false, mem0: false, details: '' };

  // Test Supabase
  try {
    const { error } = await supabase
      .from('maia_messages')
      .select('id')
      .limit(1);
    health.supabase = !error;
  } catch (err) {
    health.supabase = false;
  }

  // Test mem0 (only if enabled)
  if (MEM0_ENABLED && mem0Client) {
    try {
      // Simple test: try to retrieve with a test query
      await mem0Client.search(
        'test',
        {
          user_id: 'health-check',
          limit: 1
        }
      );
      health.mem0 = true;
    } catch (err) {
      health.mem0 = false;
    }
  } else {
    health.details = 'mem0 disabled via config';
  }

  return health;
}
