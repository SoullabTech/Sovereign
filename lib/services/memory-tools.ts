/**
 * Memory Tool Interface
 * Provides tool calling definitions for Llama 3.1 to orchestrate memory retrieval
 *
 * This turns Supabase + Mem0 into "tools" that the reasoning engine can call explicitly
 */

import { getMaiaConversationHistory, getMaiaBreakthroughs } from './maia-memory-service';
import { getEnrichedMemory } from './hybrid-memory-service';

export interface MemoryTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

/**
 * Tool: lookup_supabase
 * Retrieve chronological conversation history from Supabase
 */
export const lookupSupabaseTool: MemoryTool = {
  name: 'lookup_supabase',
  description: 'Retrieve recent chronological conversation history from Supabase database. Use this for recalling recent exchanges and maintaining continuity.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to retrieve history for'
      },
      limit: {
        type: 'number',
        description: 'Number of recent messages to retrieve (default: 20)',
        default: 20
      }
    },
    required: ['user_id']
  },
  execute: async (params: { user_id: string; limit?: number }) => {
    const { user_id, limit = 20 } = params;
    const result = await getMaiaConversationHistory(user_id, limit);

    if (!result.success) {
      return { error: 'Failed to retrieve Supabase history' };
    }

    // Format for LLM consumption
    return {
      source: 'supabase',
      messages: result.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        coherence_level: msg.coherence_level,
        is_breakthrough: msg.is_breakthrough
      }))
    };
  }
};

/**
 * Tool: query_mem0
 * Perform semantic search across conversation history via mem0
 */
export const queryMem0Tool: MemoryTool = {
  name: 'query_mem0',
  description: 'Perform semantic/meaning-based search across all past conversations. Use this when looking for patterns, themes, or specific topics regardless of when they occurred.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to search memories for'
      },
      query: {
        type: 'string',
        description: 'Semantic query to search for (e.g., "times they felt stuck", "breakthrough moments with fire energy")'
      },
      limit: {
        type: 'number',
        description: 'Number of semantic matches to retrieve (default: 5)',
        default: 5
      }
    },
    required: ['user_id', 'query']
  },
  execute: async (params: { user_id: string; query: string; limit?: number }) => {
    const { user_id, query, limit = 5 } = params;

    const memories = await getEnrichedMemory(user_id, {
      semanticQuery: query,
      limit,
      includeBreakthroughs: false
    });

    // Filter to mem0 results only
    const mem0Results = memories.filter(m => m.source === 'mem0');

    return {
      source: 'mem0',
      query,
      matches: mem0Results.map(m => ({
        content: m.content,
        relevance: m.relevance,
        timestamp: m.created_at,
        tags: m.tags
      }))
    };
  }
};

/**
 * Tool: recall_breakthroughs
 * Retrieve marked breakthrough moments for explicit callbacks
 */
export const recallBreakthroughsTool: MemoryTool = {
  name: 'recall_breakthroughs',
  description: 'Retrieve breakthrough moments from conversation history. Use this when you want to reference specific moments of insight, transformation, or recognition.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to retrieve breakthroughs for'
      },
      limit: {
        type: 'number',
        description: 'Number of breakthroughs to retrieve (default: 5)',
        default: 5
      }
    },
    required: ['user_id']
  },
  execute: async (params: { user_id: string; limit?: number }) => {
    const { user_id, limit = 5 } = params;
    const result = await getMaiaBreakthroughs(user_id, limit);

    if (!result.success) {
      return { error: 'Failed to retrieve breakthroughs' };
    }

    return {
      source: 'supabase',
      breakthroughs: result.breakthroughs.map(bt => ({
        content: bt.content,
        timestamp: bt.created_at,
        coherence_level: bt.coherence_level,
        elements: bt.elements
      }))
    };
  }
};

/**
 * Tool: get_enriched_context
 * Hybrid approach: Get both chronological + semantic memory
 */
export const getEnrichedContextTool: MemoryTool = {
  name: 'get_enriched_context',
  description: 'Retrieve both recent chronological history (Supabase) and semantically relevant memories (mem0). Use this when you need comprehensive context.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to retrieve context for'
      },
      semantic_query: {
        type: 'string',
        description: 'Optional semantic query to enrich with relevant past memories'
      },
      recent_limit: {
        type: 'number',
        description: 'Number of recent messages (default: 10)',
        default: 10
      },
      include_breakthroughs: {
        type: 'boolean',
        description: 'Whether to include breakthrough moments (default: true)',
        default: true
      }
    },
    required: ['user_id']
  },
  execute: async (params: {
    user_id: string;
    semantic_query?: string;
    recent_limit?: number;
    include_breakthroughs?: boolean;
  }) => {
    const {
      user_id,
      semantic_query,
      recent_limit = 10,
      include_breakthroughs = true
    } = params;

    const memories = await getEnrichedMemory(user_id, {
      limit: recent_limit,
      semanticQuery: semantic_query,
      includeBreakthroughs: include_breakthroughs
    });

    // Separate by source
    const supabaseMemories = memories.filter(m => m.source === 'supabase');
    const mem0Memories = memories.filter(m => m.source === 'mem0');

    return {
      chronological: supabaseMemories.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.created_at
      })),
      semantic_matches: mem0Memories.map(m => ({
        content: m.content,
        relevance: m.relevance,
        timestamp: m.created_at
      })),
      total_context_items: memories.length
    };
  }
};

/**
 * Get all available memory tools for Llama 3.1
 */
export function getMemoryTools(): MemoryTool[] {
  return [
    lookupSupabaseTool,
    queryMem0Tool,
    recallBreakthroughsTool,
    getEnrichedContextTool
  ];
}

/**
 * Execute a tool by name
 */
export async function executeMemoryTool(
  toolName: string,
  parameters: any
): Promise<any> {
  const tools = getMemoryTools();
  const tool = tools.find(t => t.name === toolName);

  if (!tool) {
    throw new Error(`Unknown memory tool: ${toolName}`);
  }

  try {
    return await tool.execute(parameters);
  } catch (error: any) {
    console.error(`❌ Memory tool execution failed (${toolName}):`, error);
    return { error: error.message };
  }
}

/**
 * Get tool definitions for Llama 3.1 (without execute functions)
 */
export function getMemoryToolDefinitions() {
  return getMemoryTools().map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }));
}
