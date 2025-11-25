/**
 * Llama Oracle Adapter
 * Bridges PersonalOracleAgent with Llama 3.1 reasoning engine
 *
 * This allows MAIA to use Llama 3.1 instead of Claude for reasoning,
 * while maintaining the same oracle interface
 */

import { LlamaReasoningEngine, LlamaResponse } from './llama-reasoning-engine';
import { getMemoryToolDefinitions, executeMemoryTool } from './memory-tools';

export interface LlamaOracleResponse {
  response: string;
  element?: string;
  metadata?: any;
  suggestions?: string[];
  toolCallsMade?: Array<{ tool: string; result: any }>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Process oracle interaction using Llama 3.1 + memory tools
 */
export async function processWithLlama(
  engine: LlamaReasoningEngine,
  userId: string,
  userMessage: string,
  systemPrompt: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<LlamaOracleResponse> {
  const toolCallsMade: Array<{ tool: string; result: any }> = [];

  // Get memory tool definitions
  const memoryTools = getMemoryToolDefinitions();

  // Phase 1: Generate initial response with tool calling capability
  let llamaResponse: LlamaResponse;

  if (conversationHistory && conversationHistory.length > 0) {
    // Use full context window (128K tokens)
    llamaResponse = await engine.generateWithHistory(
      systemPrompt,
      conversationHistory,
      userMessage,
      memoryTools
    );
  } else {
    // First interaction
    llamaResponse = await engine.generate(
      systemPrompt,
      userMessage,
      memoryTools
    );
  }

  // Phase 2: Execute any tool calls requested by Llama
  if (llamaResponse.toolCalls && llamaResponse.toolCalls.length > 0) {
    console.log(`🦙 Llama requested ${llamaResponse.toolCalls.length} tool calls`);

    for (const toolCall of llamaResponse.toolCalls) {
      try {
        console.log(`  → Executing: ${toolCall.name}`);
        const result = await executeMemoryTool(toolCall.name, toolCall.parameters);
        toolCallsMade.push({ tool: toolCall.name, result });
      } catch (error: any) {
        console.error(`  ❌ Tool call failed: ${error.message}`);
        toolCallsMade.push({
          tool: toolCall.name,
          result: { error: error.message }
        });
      }
    }

    // Phase 3: Generate final response with tool results
    const toolResultsContext = toolCallsMade
      .map(tc => `[${tc.tool}]: ${JSON.stringify(tc.result, null, 2)}`)
      .join('\n\n');

    const finalPrompt = `Based on these memory retrieval results:

${toolResultsContext}

Now provide your oracle response to the user.`;

    const finalResponse = await engine.generate(
      systemPrompt,
      finalPrompt,
      [] // No more tools in final generation
    );

    return {
      response: finalResponse.content,
      toolCallsMade,
      usage: {
        inputTokens: (llamaResponse.usage?.inputTokens || 0) + (finalResponse.usage?.inputTokens || 0),
        outputTokens: (llamaResponse.usage?.outputTokens || 0) + (finalResponse.usage?.outputTokens || 0)
      }
    };
  }

  // No tool calls, return direct response
  return {
    response: llamaResponse.content,
    toolCallsMade: [],
    usage: llamaResponse.usage
  };
}

/**
 * Convert MAIA system prompt to Llama-optimized format
 * (Llama 3.1 has different strengths, so we emphasize tool use)
 */
export function adaptMaiaPromptForLlama(originalPrompt: string): string {
  return `${originalPrompt}

## Memory Orchestration

You have access to memory tools that let you intelligently retrieve context:

- **lookup_supabase**: Recent chronological conversation history
- **query_mem0**: Semantic search across all past conversations for patterns/themes
- **recall_breakthroughs**: Specific breakthrough moments for callbacks
- **get_enriched_context**: Hybrid chronological + semantic memory

**When to use memory tools:**
- User references something from the past → query_mem0 with semantic query
- Need recent continuity → lookup_supabase
- Want to reflect breakthroughs back → recall_breakthroughs
- Need comprehensive context → get_enriched_context

**Your advantage:** 128K context window means you can hold long narrative arcs. Use it to maintain deep continuity across extended Spiralogic journeys.

Call tools by outputting:
<tool_call>{"name": "tool_name", "parameters": {...}}</tool_call>

Then use the retrieved memories to inform your oracle response.`;
}

/**
 * Shadow mode: Run Llama alongside Claude for comparison
 */
export async function shadowTestLlama(
  engine: LlamaReasoningEngine,
  userId: string,
  userMessage: string,
  systemPrompt: string,
  claudeResponse: string
): Promise<{
  claude: string;
  llama: string;
  llamaTools: Array<{ tool: string; result: any }>;
  comparison: {
    lengthDiff: number;
    tokenUsage: { llama: any; claude?: any };
  };
}> {
  // Adapt prompt for Llama
  const llamaPrompt = adaptMaiaPromptForLlama(systemPrompt);

  // Generate Llama response
  const llamaResult = await processWithLlama(
    engine,
    userId,
    userMessage,
    llamaPrompt
  );

  // Compare
  const lengthDiff = llamaResult.response.length - claudeResponse.length;

  console.log('🔍 Shadow Test Results:');
  console.log(`   Claude length: ${claudeResponse.length} chars`);
  console.log(`   Llama length: ${llamaResult.response.length} chars`);
  console.log(`   Llama tools used: ${llamaResult.toolCallsMade?.length || 0}`);
  console.log(`   Llama tokens: ${llamaResult.usage?.inputTokens || 0} in / ${llamaResult.usage?.outputTokens || 0} out`);

  return {
    claude: claudeResponse,
    llama: llamaResult.response,
    llamaTools: llamaResult.toolCallsMade || [],
    comparison: {
      lengthDiff,
      tokenUsage: {
        llama: llamaResult.usage,
        claude: undefined // Could track Claude usage if needed
      }
    }
  };
}
