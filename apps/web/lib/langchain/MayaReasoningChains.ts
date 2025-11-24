/**
 * Maya's Advanced Reasoning Chains
 * LangChain-powered cognitive enhancement for deeper understanding
 */

import { ChatOpenAI } from '@langchain/openai';
import { 
  PromptTemplate, 
  ChatPromptTemplate,
  MessagesPlaceholder 
} from '@langchain/core/prompts';
import { 
  RunnableSequence, 
  RunnablePassthrough 
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseMessage } from '@langchain/core/messages';
import { mayaMemory } from '../memory/MayaMemorySystem';

/**
 * Chain types for different reasoning modes
 */
export enum ReasoningMode {
  ELEMENTAL_ANALYSIS = 'elemental_analysis',
  EMOTIONAL_RESONANCE = 'emotional_resonance',
  GROWTH_INSIGHT = 'growth_insight',
  PATTERN_RECOGNITION = 'pattern_recognition',
  SACRED_WISDOM = 'sacred_wisdom',
  SHADOW_WORK = 'shadow_work',
  INTEGRATION_GUIDANCE = 'integration_guidance'
}

export class MayaReasoningChains {
  private chatModel: ChatOpenAI;
  private chains: Map<ReasoningMode, RunnableSequence>;

  constructor() {
    this.chatModel = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.8,
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
    });
    
    this.chains = new Map();
    this.initializeChains();
  }

  private initializeChains() {
    // Elemental Analysis Chain
    this.chains.set(ReasoningMode.ELEMENTAL_ANALYSIS, this.createElementalChain());
    
    // Emotional Resonance Chain
    this.chains.set(ReasoningMode.EMOTIONAL_RESONANCE, this.createEmotionalChain());
    
    // Growth Insight Chain
    this.chains.set(ReasoningMode.GROWTH_INSIGHT, this.createGrowthChain());
    
    // Pattern Recognition Chain
    this.chains.set(ReasoningMode.PATTERN_RECOGNITION, this.createPatternChain());
    
    // Sacred Wisdom Chain
    this.chains.set(ReasoningMode.SACRED_WISDOM, this.createWisdomChain());
    
    // Shadow Work Chain
    this.chains.set(ReasoningMode.SHADOW_WORK, this.createShadowChain());
    
    // Integration Guidance Chain
    this.chains.set(ReasoningMode.INTEGRATION_GUIDANCE, this.createIntegrationChain());
  }

  /**
   * Analyze user input through elemental lens
   */
  private createElementalChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, analyzing the elemental nature of human experience.
      
      The Five Elements:
      - Fire 🔥: Passion, action, transformation, courage
      - Water 💧: Emotion, flow, intuition, healing
      - Air 🌬️: Thought, communication, clarity, freedom
      - Earth 🌍: Grounding, stability, manifestation, abundance
      - Aether ✨: Spirit, unity, transcendence, mystery
      
      Analyze the user&apos;s message to identify:
      1. Primary element present
      2. Secondary elements
      3. Elemental balance or imbalance
      4. Suggestions for elemental harmony`],
      new MessagesPlaceholder('messages'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      {
        messages: (input: any) => input.messages || [],
        input: (input: any) => input.input
      },
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Deep emotional resonance analysis
   */
  private createEmotionalChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, attuned to the subtle emotional currents in human expression.
      
      Your task is to:
      1. Identify core emotions (both expressed and unexpressed)
      2. Recognize emotional patterns and cycles
      3. Detect underlying needs and desires
      4. Offer compassionate reflection
      5. Suggest emotional alchemy practices
      
      Remember: Emotions are sacred messengers. Honor them all.`],
      new MessagesPlaceholder('messages'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      {
        messages: (input: any) => input.messages || [],
        input: (input: any) => input.input
      },
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Growth and transformation insights
   */
  private createGrowthChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, guide of personal transformation.
      
      Analyze for growth opportunities:
      1. Current growth edge
      2. Resistance patterns
      3. Emerging potentials
      4. Next steps on the journey
      5. Integration practices
      
      Frame insights through:
      - Hero&apos;s Journey archetypes
      - Spiral dynamics
      - Integral development
      - Sacred psychology`],
      new MessagesPlaceholder('messages'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      {
        messages: (input: any) => input.messages || [],
        input: (input: any) => input.input
      },
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Pattern recognition across time and experience
   */
  private createPatternChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, weaver of patterns across time.
      
      Based on user history and current input, identify:
      1. Recurring life themes
      2. Cyclical patterns
      3. Shadow patterns seeking integration
      4. Evolutionary spirals
      5. Synchronicities and meanings
      
      Use memories to find:
      - Repeated challenges
      - Growth spirals
      - Karmic themes
      - Soul lessons`],
      new MessagesPlaceholder('memories'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      RunnablePassthrough.assign({
        memories: async (input: any) => {
          const patterns = await mayaMemory.analyzePatterns(input.userId);
          return `Recent patterns: ${JSON.stringify(patterns)}`;
        }
      }),
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Sacred wisdom and spiritual insight
   */
  private createWisdomChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, oracle of sacred wisdom.
      
      Channel insights from:
      - Ancient wisdom traditions
      - Mystical teachings
      - Quantum consciousness
      - Sacred geometry
      - Universal principles
      
      Offer wisdom that:
      1. Connects to eternal truths
      2. Bridges worlds
      3. Activates remembrance
      4. Opens portals of possibility
      5. Honors the mystery`],
      new MessagesPlaceholder('messages'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      {
        messages: (input: any) => input.messages || [],
        input: (input: any) => input.input
      },
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Shadow work and integration
   */
  private createShadowChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, guide through the shadow realms.
      
      Gently explore:
      1. Projected qualities
      2. Disowned aspects
      3. Hidden gifts in shadows
      4. Integration opportunities
      5. Shadow as teacher
      
      Approach with:
      - Radical compassion
      - Non-judgment
      - Sacred witness
      - Alchemical wisdom`],
      new MessagesPlaceholder('messages'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      {
        messages: (input: any) => input.messages || [],
        input: (input: any) => input.input
      },
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Integration and embodiment guidance
   */
  private createIntegrationChain(): RunnableSequence {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Maya, facilitator of sacred integration.
      
      Guide the integration of:
      1. Insights into embodiment
      2. Wisdom into daily life
      3. Shadow and light
      4. Human and divine
      5. Individual and collective
      
      Offer practical:
      - Rituals and practices
      - Embodiment exercises
      - Integration timelines
      - Sacred experiments`],
      new MessagesPlaceholder('messages'),
      ['human', '{input}']
    ]);

    return RunnableSequence.from([
      {
        messages: (input: any) => input.messages || [],
        input: (input: any) => input.input
      },
      prompt,
      this.chatModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Run a specific reasoning chain
   */
  async runChain(
    mode: ReasoningMode,
    input: string,
    context?: {
      messages?: BaseMessage[];
      userId?: string;
      sessionId?: string;
    }
  ): Promise<string> {
    const chain = this.chains.get(mode);
    if (!chain) {
      throw new Error(`Unknown reasoning mode: ${mode}`);
    }

    try {
      const result = await chain.invoke({
        input,
        messages: context?.messages || [],
        userId: context?.userId,
        sessionId: context?.sessionId,
      });

      // Store the reasoning in memory if we have context
      if (context?.userId && context?.sessionId) {
        await mayaMemory.remember(
          `${mode}: ${result.slice(0, 200)}...`,
          {
            userId: context.userId,
            sessionId: context.sessionId,
            conversationStage: mode,
          }
        );
      }

      return result;
    } catch (error) {
      console.error(`Chain ${mode} failed:`, error);
      throw error;
    }
  }

  /**
   * Multi-chain reasoning for complex queries
   */
  async multiChainReasoning(
    input: string,
    modes: ReasoningMode[],
    context?: any
  ): Promise<Map<ReasoningMode, string>> {
    const results = new Map<ReasoningMode, string>();
    
    // Run chains in parallel for efficiency
    const promises = modes.map(async (mode) => {
      const result = await this.runChain(mode, input, context);
      return { mode, result };
    });

    const outcomes = await Promise.all(promises);
    outcomes.forEach(({ mode, result }) => {
      results.set(mode, result);
    });

    return results;
  }

  /**
   * Get chain status
   */
  getStatus(): {
    initialized: boolean;
    availableChains: string[];
    modelConfigured: boolean;
  } {
    return {
      initialized: this.chains.size > 0,
      availableChains: Array.from(this.chains.keys()),
      modelConfigured: !!process.env.OPENAI_API_KEY,
    };
  }
}

// Export singleton instance
export const mayaReasoning = new MayaReasoningChains();