/**
 * TENANT MAIA AGENT
 * Custom MAIA instance running on shared Spiralogic engine
 * Trained on client-specific IP and personality
 */

import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { TenantKnowledgeBase } from './TenantKnowledgeBase';
import { WisdomIntegrationSystem } from '@/lib/knowledge/WisdomIntegrationSystem';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  brandVoice: {
    tone: string;
    language: string;
    values: string[];
  };
  elementalSignature: {
    primary: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    secondary?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  };
  maiaPersonality: {
    greeting?: string;
    responseStyle?: string;
    specialtyAreas?: string[];
    prohibitedTopics?: string[];
    phaseGuidance?: Record<string, string>;
  };
  features: {
    voice: boolean;
    journaling: boolean;
    collective_field: boolean;
  };
}

export interface TenantMAIAResponse {
  response: string;
  element: string;
  phase?: string;
  confidence: number;
  knowledgeSources?: Array<{
    title: string;
    similarity: number;
    category?: string;
  }>;
  metadata?: Record<string, any>;
}

export class TenantMAIA {
  private tenantId: string;
  private config: TenantConfig | null = null;
  private knowledgeBase: TenantKnowledgeBase;
  private coreAgent: PersonalOracleAgent | null = null;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.knowledgeBase = new TenantKnowledgeBase(tenantId);
  }

  /**
   * Initialize tenant MAIA (load config and personality)
   */
  async initialize(): Promise<void> {
    console.log('🌀 Initializing TenantMAIA for:', this.tenantId);

    // Load tenant configuration
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', this.tenantId)
      .single();

    if (error || !tenant) {
      throw new Error(`Tenant not found: ${this.tenantId}`);
    }

    this.config = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      brandVoice: tenant.brand_voice || {
        tone: 'warm, present, wise',
        language: 'accessible and clear',
        values: []
      },
      elementalSignature: tenant.elemental_signature || {
        primary: 'aether'
      },
      maiaPersonality: tenant.maia_personality || {},
      features: tenant.features || {
        voice: true,
        journaling: true,
        collective_field: false
      }
    };

    console.log('✅ TenantMAIA initialized:', this.config.name);
  }

  /**
   * Process user interaction through tenant-specific MAIA
   */
  async processInteraction(
    input: string,
    userId: string,
    context?: {
      sessionId?: string;
      conversationDepth?: number;
      currentMood?: any;
      currentEnergy?: any;
    }
  ): Promise<TenantMAIAResponse> {
    if (!this.config) {
      await this.initialize();
    }

    console.log('💬 Processing interaction for tenant:', this.config!.name);

    // 1. Search tenant's knowledge base for relevant context
    const relevantKnowledge = await this.knowledgeBase.search(input, {
      limit: 5,
      matchThreshold: 0.7
    });

    console.log('📚 Found', relevantKnowledge.length, 'relevant knowledge items');

    // 2. Build tenant-specific system prompt
    const systemPrompt = this.buildSystemPrompt(input, relevantKnowledge, context);

    // 3. Use core PersonalOracleAgent with tenant context
    if (!this.coreAgent) {
      this.coreAgent = await PersonalOracleAgent.loadAgent(userId, {
        persona: 'warm'
      });
    }

    // 4. Process through core Spiralogic engine
    const response = await this.coreAgent.processInteraction(input, {
      currentMood: context?.currentMood,
      currentEnergy: context?.currentEnergy,
      conversationDepth: context?.conversationDepth || 0.5,
      sessionId: context?.sessionId,
      // Inject tenant-specific context
      customSystemPrompt: systemPrompt
    } as any);

    // 5. Log conversation for analytics
    await this.logConversation(userId, context?.sessionId, response);

    return {
      response: response.response,
      element: response.element,
      phase: response.phase,
      confidence: response.confidence,
      knowledgeSources: relevantKnowledge.map(k => ({
        title: k.title,
        similarity: k.similarity,
        category: k.category
      })),
      metadata: {
        tenantId: this.tenantId,
        tenantName: this.config!.name
      }
    };
  }

  /**
   * Build tenant-specific system prompt
   */
  private buildSystemPrompt(
    input: string,
    relevantKnowledge: any[],
    context?: any
  ): string {
    const config = this.config!;

    // Start with core Spiralogic wisdom
    const conversationDepth = context?.conversationDepth || 0.5;
    const depth = conversationDepth > 0.7 ? 'deep' : conversationDepth > 0.5 ? 'engaged' : conversationDepth > 0.3 ? 'warming' : 'surface';

    let prompt = WisdomIntegrationSystem.getSystemPrompt({
      depth,
      userQuestion: input,
      phase: config.elementalSignature.primary
    });

    // Add tenant-specific personality
    prompt += `\n\n---\n\n# TENANT-SPECIFIC CONTEXT\n\n`;
    prompt += `You are MAIA for **${config.name}**.

## Brand Voice:
- **Tone**: ${config.brandVoice.tone}
- **Language**: ${config.brandVoice.language}
- **Values**: ${config.brandVoice.values.join(', ')}

## Elemental Signature:
- **Primary Element**: ${config.elementalSignature.primary}
${config.elementalSignature.secondary ? `- **Secondary Element**: ${config.elementalSignature.secondary}` : ''}

`;

    // Add personality customization
    if (config.maiaPersonality.responseStyle) {
      prompt += `## Response Style:\n${config.maiaPersonality.responseStyle}\n\n`;
    }

    if (config.maiaPersonality.specialtyAreas && config.maiaPersonality.specialtyAreas.length > 0) {
      prompt += `## Specialty Areas:\nYou have deep expertise in: ${config.maiaPersonality.specialtyAreas.join(', ')}\n\n`;
    }

    if (config.maiaPersonality.prohibitedTopics && config.maiaPersonality.prohibitedTopics.length > 0) {
      prompt += `## Boundaries:\nAvoid these topics: ${config.maiaPersonality.prohibitedTopics.join(', ')}\n\n`;
    }

    // Add tenant-specific knowledge
    if (relevantKnowledge.length > 0) {
      prompt += `---\n\n## ${config.name}'s Knowledge Base:\n\n`;
      prompt += `The following is proprietary knowledge from ${config.name}. Use this to inform your responses:\n\n`;

      relevantKnowledge.forEach((item, index) => {
        prompt += `### ${index + 1}. ${item.title}\n`;
        if (item.category) {
          prompt += `**Category**: ${item.category}\n`;
        }
        prompt += `**Relevance**: ${(item.similarity * 100).toFixed(0)}%\n\n`;
        prompt += `${item.content.substring(0, 1000)}${item.content.length > 1000 ? '...' : ''}\n\n`;
      });
    }

    // Add phase-specific guidance if configured
    const currentPhase = this.detectPhase(input);
    if (config.maiaPersonality.phaseGuidance && config.maiaPersonality.phaseGuidance[currentPhase]) {
      prompt += `---\n\n## Phase-Specific Guidance (${currentPhase}):\n`;
      prompt += config.maiaPersonality.phaseGuidance[currentPhase] + '\n\n';
    }

    // Final directive
    prompt += `---\n\n**Remember**: You embody ${config.name}'s wisdom while using Soullab's Spiralogic framework. Blend their knowledge with the universal wisdom seamlessly.`;

    return prompt;
  }

  /**
   * Simple phase detection (uses keywords)
   */
  private detectPhase(input: string): string {
    const lower = input.toLowerCase();

    // Fire indicators
    if (/(vision|future|inspire|create|imagine|what if|possibility)/i.test(lower)) {
      return 'fire';
    }

    // Water indicators
    if (/(feel|emotion|care|love|hurt|heal|shadow|deep)/i.test(lower)) {
      return 'water';
    }

    // Earth indicators
    if (/(how|practice|daily|habit|action|ground|build|manifest)/i.test(lower)) {
      return 'earth';
    }

    // Air indicators
    if (/(think|understand|communicate|share|teach|learn|clarity)/i.test(lower)) {
      return 'air';
    }

    return 'aether'; // Default
  }

  /**
   * Log conversation for analytics and billing
   */
  private async logConversation(
    userId: string,
    sessionId: string | undefined,
    response: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenant_conversations')
        .insert({
          tenant_id: this.tenantId,
          user_id: userId,
          session_id: sessionId,
          message_count: 1,
          tokens_used: response.response.length, // Rough estimate
          dominant_element: response.element,
          detected_phase: response.phase,
          last_message_at: new Date().toISOString()
        });

      if (error) {
        console.warn('⚠️ Failed to log conversation:', error);
      }
    } catch (err) {
      console.warn('⚠️ Error logging conversation:', err);
    }
  }

  /**
   * Get tenant configuration
   */
  getConfig(): TenantConfig | null {
    return this.config;
  }

  /**
   * Get knowledge base instance
   */
  getKnowledgeBase(): TenantKnowledgeBase {
    return this.knowledgeBase;
  }

  /**
   * Get usage statistics for tenant
   */
  async getUsageStats(periodStart: Date, periodEnd: Date): Promise<{
    conversations: number;
    messages: number;
    tokensUsed: number;
  }> {
    const { data, error } = await supabase
      .from('tenant_conversations')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .gte('started_at', periodStart.toISOString())
      .lte('started_at', periodEnd.toISOString());

    if (error) {
      console.error('❌ Error fetching usage stats:', error);
      throw error;
    }

    return {
      conversations: data?.length || 0,
      messages: data?.reduce((sum, c) => sum + c.message_count, 0) || 0,
      tokensUsed: data?.reduce((sum, c) => sum + c.tokens_used, 0) || 0
    };
  }
}
