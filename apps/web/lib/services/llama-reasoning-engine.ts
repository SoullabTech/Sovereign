/**
 * Llama 3.1 Reasoning Engine
 * Sits above Supabase + Mem0 as a reasoning/interpretation layer
 *
 * Key features:
 * - 128K context window for long narrative arcs
 * - Tool calling for memory orchestration
 * - Multilingual support
 * - Self-hostable for independence
 */

import { HfInference } from '@huggingface/inference';

// Deployment options
export type LlamaDeploymentMode =
  | 'huggingface-api'      // Hugging Face Inference API (easiest, Phase 2)
  | 'tgi-local'            // Text Generation Inference (Phase 4, self-hosted)
  | 'vllm-local';          // vLLM (Phase 4, self-hosted)

export type LlamaModelSize = '8B' | '70B' | '405B';

export interface LlamaConfig {
  deploymentMode: LlamaDeploymentMode;
  modelSize: LlamaModelSize;
  apiKey?: string;           // For HuggingFace API
  endpoint?: string;         // For self-hosted
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface LlamaResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Llama 3.1 Reasoning Engine
 * Orchestrates memory retrieval via tool calling
 */
export class LlamaReasoningEngine {
  private client: HfInference | null = null;
  private config: LlamaConfig;
  private modelId: string;

  constructor(config: LlamaConfig) {
    this.config = {
      maxTokens: 2048,
      temperature: 0.75,
      topP: 0.9,
      ...config
    };

    // Set model ID based on size
    this.modelId = this.getModelId(config.modelSize);

    // Initialize client based on deployment mode
    if (config.deploymentMode === 'huggingface-api') {
      if (!config.apiKey) {
        throw new Error('HuggingFace API key required for huggingface-api mode');
      }
      this.client = new HfInference(config.apiKey);
    }
    // TGI/vLLM would use custom endpoints (Phase 4)
  }

  /**
   * Get Hugging Face model ID for Llama 3.1
   */
  private getModelId(size: LlamaModelSize): string {
    const modelMap = {
      '8B': 'meta-llama/Llama-3.1-8B-Instruct',
      '70B': 'meta-llama/Llama-3.1-70B-Instruct',
      '405B': 'meta-llama/Llama-3.1-405B-Instruct'
    };
    return modelMap[size];
  }

  /**
   * Generate response with tool calling support
   */
  async generate(
    systemPrompt: string,
    userMessage: string,
    availableTools?: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>
  ): Promise<LlamaResponse> {
    if (!this.client) {
      throw new Error('Llama client not initialized');
    }

    // Build messages with tool definitions
    let fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}`;

    // Add tool definitions if provided
    if (availableTools && availableTools.length > 0) {
      fullPrompt += `

## Available Tools

You can call the following tools by outputting JSON in the format:
<tool_call>{"name": "tool_name", "parameters": {...}}</tool_call>

Tools:
${availableTools.map(tool => `
- ${tool.name}: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters)}
`).join('\n')}
`;
    }

    fullPrompt += `<|eot_id|><|start_header_id|>user<|end_header_id|>

${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    try {
      // Call Llama 3.1 via Hugging Face Inference API
      const response = await this.client.textGeneration({
        model: this.modelId,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          return_full_text: false
        }
      });

      const generatedText = response.generated_text;

      // Parse tool calls if present
      const toolCalls = this.parseToolCalls(generatedText);

      return {
        content: generatedText,
        toolCalls,
        usage: {
          inputTokens: fullPrompt.length / 4, // Rough estimate
          outputTokens: generatedText.length / 4
        }
      };
    } catch (error: any) {
      console.error('❌ Llama 3.1 generation failed:', error);
      throw new Error(`Llama generation failed: ${error.message}`);
    }
  }

  /**
   * Parse tool calls from generated text
   * Llama 3.1 outputs tool calls in <tool_call>...</tool_call> format
   */
  private parseToolCalls(text: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    const regex = /<tool_call>(.*?)<\/tool_call>/gs;
    let match;

    while ((match = regex.exec(text)) !== null) {
      try {
        const toolCall = JSON.parse(match[1]);
        toolCalls.push(toolCall);
      } catch (e) {
        console.warn('⚠️ Failed to parse tool call:', match[1]);
      }
    }

    return toolCalls;
  }

  /**
   * Generate with conversation history (utilizes 128K context)
   */
  async generateWithHistory(
    systemPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    currentMessage: string,
    availableTools?: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>
  ): Promise<LlamaResponse> {
    // Build full conversation in Llama 3.1 format
    let fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|>`;

    // Add tool definitions
    if (availableTools && availableTools.length > 0) {
      fullPrompt += `<|start_header_id|>system<|end_header_id|>

## Available Tools

${availableTools.map(tool => `
- ${tool.name}: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters)}
`).join('\n')}<|eot_id|>`;
    }

    // Add conversation history
    conversationHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      fullPrompt += `<|start_header_id|>${role}<|end_header_id|>

${msg.content}<|eot_id|>`;
    });

    // Add current message
    fullPrompt += `<|start_header_id|>user<|end_header_id|>

${currentMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    if (!this.client) {
      throw new Error('Llama client not initialized');
    }

    try {
      const response = await this.client.textGeneration({
        model: this.modelId,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          return_full_text: false
        }
      });

      const generatedText = response.generated_text;
      const toolCalls = this.parseToolCalls(generatedText);

      return {
        content: generatedText,
        toolCalls,
        usage: {
          inputTokens: fullPrompt.length / 4,
          outputTokens: generatedText.length / 4
        }
      };
    } catch (error: any) {
      console.error('❌ Llama 3.1 generation with history failed:', error);
      throw new Error(`Llama generation failed: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.textGeneration({
        model: this.modelId,
        inputs: '<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\nSay "OK"<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n',
        parameters: {
          max_new_tokens: 10,
          temperature: 0.1
        }
      });
      return true;
    } catch (error) {
      console.error('❌ Llama health check failed:', error);
      return false;
    }
  }
}

/**
 * Factory function for creating Llama engine based on env config
 */
export function createLlamaEngine(): LlamaReasoningEngine | null {
  const enabled = process.env.ENABLE_LLAMA === 'true';

  if (!enabled) {
    console.log('⏸️ Llama 3.1 reasoning engine disabled');
    return null;
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ HUGGINGFACE_API_KEY not set, Llama engine disabled');
    return null;
  }

  const modelSize = (process.env.LLAMA_MODEL_SIZE || '8B') as LlamaModelSize;
  const deploymentMode = (process.env.LLAMA_DEPLOYMENT_MODE || 'huggingface-api') as LlamaDeploymentMode;

  console.log(`🦙 Initializing Llama 3.1 ${modelSize} (${deploymentMode})`);

  return new LlamaReasoningEngine({
    deploymentMode,
    modelSize,
    apiKey,
    maxTokens: parseInt(process.env.LLAMA_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.LLAMA_TEMPERATURE || '0.75')
  });
}
