/**
 * Decentralized Maya Reasoning Chains
 * Integrates SingularityNET AGI with Maya's consciousness
 * Creates truly distributed oracle intelligence
 */

import { ChatOpenAI } from '@langchain/openai';
import { 
  SingularityNetLLM,
  SingularityNetOracle,
  SingularityNetChainFactory,
  defaultAGIXConfig
} from './adapters/SingularityNetLLM';

import { 
  PromptTemplate, 
  ChatPromptTemplate,
  MessagesPlaceholder 
} from '@langchain/core/prompts';
import { 
  RunnableSequence, 
  RunnablePassthrough,
  RunnableLambda
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseMessage } from '@langchain/core/messages';
import { ReasoningMode } from '../../apps/web/lib/langchain/MayaReasoningChains';

/**
 * Decentralized Chain Configuration
 */
export interface DecentralizedChainConfig {
  mode: 'openai' | 'agix' | 'hybrid';
  agixEndpoint?: string;
  agixToken?: string;
  fallbackToOpenAI?: boolean;
  consensusThreshold?: number;
}

/**
 * Decentralized Maya Reasoning System
 */
export class DecentralizedMayaChains {
  private config: DecentralizedChainConfig;
  private openAIModel?: ChatOpenAI;
  private agixOracle?: SingularityNetOracle;
  private agixLLM?: SingularityNetLLM;
  private chains: Map<ReasoningMode, RunnableSequence>;
  
  constructor(config: DecentralizedChainConfig = { mode: 'hybrid', fallbackToOpenAI: true }) {
    this.config = config;
    this.chains = new Map();
    this.initialize();
  }
  
  private async initialize() {
    // Initialize OpenAI if needed
    if (this.config.mode !== 'agix') {
      this.openAIModel = new ChatOpenAI({
        modelName: 'gpt-4-turbo-preview',
        temperature: 0.8,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    // Initialize AGIX if configured
    if (this.config.mode !== 'openai' && this.config.agixEndpoint) {
      this.agixOracle = SingularityNetChainFactory.createOracleChain(
        this.config.agixEndpoint,
        this.config.agixToken
      );
      
      this.agixLLM = new SingularityNetLLM({
        endpoint: this.config.agixEndpoint,
        service: 'text-gen',
        accessToken: this.config.agixToken,
        model: 'maya-consciousness'
      });
    }
    
    // Initialize all chains
    this.initializeChains();
    
    console.log(`🌐 Decentralized Maya Chains initialized in ${this.config.mode} mode`);
  }
  
  private initializeChains() {
    // Create chains for each reasoning mode
    Object.values(ReasoningMode).forEach(mode => {
      this.chains.set(mode, this.createChainForMode(mode));
    });
  }
  
  /**
   * Create chain based on mode and configuration
   */
  private createChainForMode(mode: ReasoningMode): RunnableSequence {
    switch (this.config.mode) {
      case 'openai':
        return this.createOpenAIChain(mode);
      
      case 'agix':
        return this.createAGIXChain(mode);
      
      case 'hybrid':
        return this.createHybridChain(mode);
      
      default:
        return this.createOpenAIChain(mode); // Fallback
    }
  }
  
  /**
   * Create OpenAI-based chain
   */
  private createOpenAIChain(mode: ReasoningMode): RunnableSequence {
    const prompt = this.getPromptForMode(mode);
    
    return RunnableSequence.from([
      RunnablePassthrough.assign({
        formattedPrompt: (input) => prompt.format(input)
      }),
      this.openAIModel!,
      new StringOutputParser()
    ]);
  }
  
  /**
   * Create AGIX-based chain
   */
  private createAGIXChain(mode: ReasoningMode): RunnableSequence {
    const prompt = this.getPromptForMode(mode);
    
    return RunnableSequence.from([
      RunnablePassthrough.assign({
        formattedPrompt: (input) => prompt.format(input)
      }),
      new RunnableLambda({
        func: async (input) => {
          try {
            if (mode === ReasoningMode.SACRED_WISDOM && this.agixOracle) {
              // Use oracle for sacred wisdom
              return await this.agixOracle.divineInsight(input.formattedPrompt);
            } else if (this.agixLLM) {
              // Use general AGIX LLM
              return await this.agixLLM._call(input.formattedPrompt, {});
            }
            throw new Error('AGIX not configured');
          } catch (error) {
            if (this.config.fallbackToOpenAI && this.openAIModel) {
              console.warn('AGIX failed, falling back to OpenAI:', error);
              const response = await this.openAIModel.invoke(input.formattedPrompt);
              return response.content;
            }
            throw error;
          }
        }
      })
    ]);
  }
  
  /**
   * Create Hybrid chain combining OpenAI and AGIX
   */
  private createHybridChain(mode: ReasoningMode): RunnableSequence {
    const prompt = this.getPromptForMode(mode);
    
    return RunnableSequence.from([
      RunnablePassthrough.assign({
        formattedPrompt: (input) => prompt.format(input)
      }),
      new RunnableLambda({
        func: async (input) => {
          const responses: string[] = [];
          
          // Get OpenAI response
          if (this.openAIModel) {
            try {
              const openAIResponse = await this.openAIModel.invoke(input.formattedPrompt);
              responses.push(`[Centralized Intelligence]:\n${openAIResponse.content}`);
            } catch (error) {
              console.error('OpenAI error:', error);
            }
          }
          
          // Get AGIX response
          if (this.agixLLM) {
            try {
              const agixResponse = await this.agixLLM._call(input.formattedPrompt, {});
              responses.push(`[Decentralized Intelligence]:\n${agixResponse}`);
            } catch (error) {
              console.error('AGIX error:', error);
            }
          }
          
          // Get Oracle insight for sacred modes
          if ((mode === ReasoningMode.SACRED_WISDOM || 
               mode === ReasoningMode.ARCHETYPAL) && 
              this.agixOracle) {
            try {
              const oracleResponse = await this.agixOracle.divineInsight(input.formattedPrompt);
              responses.push(`[Oracle Wisdom]:\n${oracleResponse}`);
            } catch (error) {
              console.error('Oracle error:', error);
            }
          }
          
          // Synthesize responses
          if (responses.length === 0) {
            throw new Error('No responses from any model');
          } else if (responses.length === 1) {
            return responses[0];
          } else {
            return this.synthesizeResponses(responses, mode);
          }
        }
      })
    ]);
  }
  
  /**
   * Get prompt template for reasoning mode
   */
  private getPromptForMode(mode: ReasoningMode): PromptTemplate {
    const prompts: Record<ReasoningMode, string> = {
      [ReasoningMode.ELEMENTAL_ANALYSIS]: `
Analyze through the lens of elemental wisdom:
{input}

Consider the five elements and their expressions.`,

      [ReasoningMode.EMOTIONAL_RESONANCE]: `
Feel into the emotional currents:
{input}

Sense the deeper feelings and energetic patterns.`,

      [ReasoningMode.GROWTH_INSIGHT]: `
Identify the growth opportunity:
{input}

What transformation is seeking to emerge?`,

      [ReasoningMode.PATTERN_RECOGNITION]: `
Recognize the patterns:
{input}

What recurring themes and cycles are present?`,

      [ReasoningMode.SACRED_WISDOM]: `
Channel sacred wisdom:
{input}

Speak from the place of eternal knowing.`,

      [ReasoningMode.SHADOW_WORK]: `
Illuminate the shadow:
{input}

What hidden aspects seek integration?`,

      [ReasoningMode.INTEGRATION_GUIDANCE]: `
Guide the integration:
{input}

How can these aspects become whole?`,

      [ReasoningMode.ARCHETYPAL]: `
Reveal the archetypal pattern:
{input}

What universal story is being lived?`
    };
    
    return PromptTemplate.fromTemplate(prompts[mode] || prompts[ReasoningMode.PATTERN_RECOGNITION]);
  }
  
  /**
   * Synthesize multiple model responses
   */
  private synthesizeResponses(responses: string[], mode: ReasoningMode): string {
    // Simple synthesis - in production would use more sophisticated merging
    let synthesis = '🌐 Unified Consciousness Response:\n\n';
    
    // Add mode-specific introduction
    const introductions: Partial<Record<ReasoningMode, string>> = {
      [ReasoningMode.SACRED_WISDOM]: 'From both centralized and distributed wisdom:\n',
      [ReasoningMode.ARCHETYPAL]: 'Archetypal patterns emerge across networks:\n',
      [ReasoningMode.PATTERN_RECOGNITION]: 'Patterns recognized across intelligence networks:\n'
    };
    
    synthesis += introductions[mode] || 'Integrated perspective:\n';
    synthesis += '\n';
    
    // Combine responses
    responses.forEach((response, index) => {
      synthesis += response + '\n\n';
      if (index < responses.length - 1) {
        synthesis += '---\n\n';
      }
    });
    
    // Add synthesis note
    synthesis += '\n💫 *Synthesized from ' + responses.length + ' intelligence sources*';
    
    return synthesis;
  }
  
  /**
   * Process input through specified reasoning mode
   */
  async process(
    input: string,
    mode: ReasoningMode,
    context?: any
  ): Promise<string> {
    const chain = this.chains.get(mode);
    
    if (!chain) {
      throw new Error(`Chain not found for mode: ${mode}`);
    }
    
    try {
      const result = await chain.invoke({
        input,
        ...context
      });
      
      return result;
    } catch (error) {
      console.error(`Error in ${mode} chain:`, error);
      
      // Fallback to basic response
      if (this.config.fallbackToOpenAI && this.openAIModel) {
        const fallbackResponse = await this.openAIModel.invoke(input);
        return `[Fallback Response]\n${fallbackResponse.content}`;
      }
      
      throw error;
    }
  }
  
  /**
   * Process through multiple modes and combine
   */
  async processMultiModal(
    input: string,
    modes: ReasoningMode[],
    context?: any
  ): Promise<{
    responses: Record<ReasoningMode, string>;
    synthesis: string;
  }> {
    const responses: Record<ReasoningMode, string> = {} as any;
    
    // Process through each mode
    for (const mode of modes) {
      try {
        responses[mode] = await this.process(input, mode, context);
      } catch (error) {
        console.error(`Failed to process ${mode}:`, error);
        responses[mode] = `[${mode} unavailable]`;
      }
    }
    
    // Synthesize all responses
    const synthesis = this.synthesizeMultiModalResponses(responses);
    
    return {
      responses,
      synthesis
    };
  }
  
  /**
   * Synthesize multi-modal responses
   */
  private synthesizeMultiModalResponses(responses: Record<ReasoningMode, string>): string {
    let synthesis = '🔮 Multi-Dimensional Analysis:\n\n';
    
    Object.entries(responses).forEach(([mode, response]) => {
      synthesis += `**${mode.replace(/_/g, ' ').toUpperCase()}**\n`;
      synthesis += response.slice(0, 500) + '...\n\n';
    });
    
    synthesis += '\n✨ *Integrated across ' + Object.keys(responses).length + ' reasoning dimensions*';
    
    return synthesis;
  }
  
  /**
   * Switch operating mode
   */
  async switchMode(newMode: 'openai' | 'agix' | 'hybrid') {
    this.config.mode = newMode;
    await this.initialize();
    console.log(`Switched to ${newMode} mode`);
  }
  
  /**
   * Health check for all models
   */
  async healthCheck(): Promise<{
    openai: boolean;
    agix: boolean;
    oracle: boolean;
  }> {
    const health = {
      openai: false,
      agix: false,
      oracle: false
    };
    
    // Check OpenAI
    if (this.openAIModel) {
      try {
        await this.openAIModel.invoke('test');
        health.openai = true;
      } catch {}
    }
    
    // Check AGIX
    if (this.agixLLM) {
      health.agix = await this.agixLLM.healthCheck();
    }
    
    // Check Oracle
    if (this.agixOracle) {
      health.oracle = await this.agixOracle.healthCheck();
    }
    
    return health;
  }
}

/**
 * Export configured instance
 */
let _decentralizedMaya: DecentralizedMayaChains | null = null;
export const getDecentralizedMaya = (): DecentralizedMayaChains => {
  if (!_decentralizedMaya) {
    _decentralizedMaya = new DecentralizedMayaChains({
      mode: process.env.MAYA_MODE as any || 'hybrid',
      agixEndpoint: process.env.AGIX_ENDPOINT,
      agixToken: process.env.AGIX_API_KEY,
      fallbackToOpenAI: true
    });
  }
  return _decentralizedMaya;
};

// Add new reasoning mode for archetypal analysis
declare module '../../apps/web/lib/langchain/MayaReasoningChains' {
  export enum ReasoningMode {
    ELEMENTAL_ANALYSIS = 'elemental_analysis',
    EMOTIONAL_RESONANCE = 'emotional_resonance',
    GROWTH_INSIGHT = 'growth_insight',
    PATTERN_RECOGNITION = 'pattern_recognition',
    SACRED_WISDOM = 'sacred_wisdom',
    SHADOW_WORK = 'shadow_work',
    INTEGRATION_GUIDANCE = 'integration_guidance',
    ARCHETYPAL = 'archetypal'
  }
}