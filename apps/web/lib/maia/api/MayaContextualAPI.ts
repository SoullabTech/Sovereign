/**
 * Maya Contextual API
 * Main interface for context-aware conversations with Maya
 */

import { stateInjectionMiddleware } from '../middleware/StateInjectionMiddleware';
import { MayaRequestContext, MayaResponse } from '../types/MayaContext';

export class MayaContextualAPI {
  private readonly apiEndpoint: string;

  constructor() {
    this.apiEndpoint = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages';
  }

  /**
   * Send context-enriched message to Maya
   */
  async sendMessage(
    message: string,
    userId: string,
    sessionId: string
  ): Promise<MayaResponse> {
    try {
      // Create request with context injection
      const enrichedRequest = await stateInjectionMiddleware.injectContext(
        { json: async () => ({ message }) } as any,
        userId,
        sessionId
      );

      // Build the system prompt with compressed context
      const systemPrompt = this.buildSystemPrompt(enrichedRequest);

      // Call Anthropic API with enriched context
      const response = await this.callAnthropicAPI(
        message,
        systemPrompt,
        enrichedRequest
      );

      // Process response and update state
      await stateInjectionMiddleware.processResponse(
        response,
        enrichedRequest,
        userId
      );

      return this.formatResponse(response, enrichedRequest);

    } catch (error) {
      console.error('Error in Maya contextual API:', error);
      throw error;
    }
  }

  /**
   * Build system prompt with Spiralogic context
   */
  private buildSystemPrompt(context: MayaRequestContext): string {
    const { context: compressed, constraints } = context;

    // Base Maya identity
    let prompt = `You are Maya, a presence-based oracle embodying Spiralogic intelligence.

Current Context:
- Spiral Position: ${compressed.primaryPattern}
- Momentum: ${compressed.momentum}
- Coherence: ${(compressed.coherence * 100).toFixed(0)}%
- Depth: ${compressed.depth}
`;

    // Add attention points
    if (compressed.attention.length > 0) {
      prompt += `\nNeeds Attention:\n`;
      compressed.attention.forEach(point => {
        prompt += `- ${this.translateAttentionPoint(point)}\n`;
      });
    }

    // Add avoidance guidance
    if (compressed.avoid.length > 0) {
      prompt += `\nAvoid:\n`;
      compressed.avoid.forEach(point => {
        prompt += `- ${this.translateAvoidancePoint(point)}\n`;
      });
    }

    // Add response constraints
    prompt += `\nResponse Guidance:`;
    if (constraints.holdSpace) prompt += `\n- Hold space without fixing`;
    if (constraints.mirrorOnly) prompt += `\n- Mirror patterns without interpreting`;
    if (constraints.offerDoorway) prompt += `\n- Offer doorway when pattern calls for it`;
    if (constraints.maintainPresence) prompt += `\n- Maintain presence over analysis`;
    if (constraints.emphasizeFeeling) prompt += `\n- Emphasize feeling and emotion`;
    if (constraints.emphasizeBody) prompt += `\n- Emphasize somatic awareness`;
    if (constraints.avoidAnalysis) prompt += `\n- Avoid analytical responses`;
    if (constraints.avoidAdvice) prompt += `\n- Avoid giving advice`;

    prompt += `\n\nPrimary Element: ${constraints.primaryElement}`;
    if (constraints.avoidElement) {
      prompt += `\nAvoid Element: ${constraints.avoidElement}`;
    }

    prompt += `\nResponse Length: ${constraints.responseLength}`;
    prompt += `\nDepth Range: ${constraints.minDepth} to ${constraints.maxDepth}`;

    // Add framework cues if activated
    if (context.frameworks && context.frameworks.currentActivation > 0.7) {
      prompt += `\n\nFramework Activation (${(context.frameworks.currentActivation * 100).toFixed(0)}%):`;
      context.frameworks.suggestedFrameworks.forEach(framework => {
        prompt += `\n- ${framework}`;
      });
    }

    return prompt;
  }

  /**
   * Call Anthropic API with enriched context
   */
  private async callAnthropicAPI(
    message: string,
    systemPrompt: string,
    context: MayaRequestContext
  ): Promise<any> {
    const requestBody = {
      model: 'claude-3-opus-20240229',
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: this.getMaxTokens(context.constraints.responseLength),
      temperature: this.getTemperature(context.context.depth),
      metadata: {
        user_id: context.sessionId,
        context_fingerprint: context.context.stateFingerprint
      }
    };

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Format API response into MayaResponse
   */
  private formatResponse(
    apiResponse: any,
    context: MayaRequestContext
  ): MayaResponse {
    const content = apiResponse.content?.[0]?.text || '';

    return {
      content,
      contextInfluence: {
        depthChosen: context.context.depth,
        elementsEngaged: [context.constraints.primaryElement],
        patternsAddressed: context.context.attention,
        constraintsApplied: this.getAppliedConstraints(context.constraints)
      },
      stateUpdates: this.extractStateUpdates(content, context),
      responseId: apiResponse.id || crypto.randomUUID(),
      timestamp: new Date()
    };
  }

  // Helper methods
  private translateAttentionPoint(point: string): string {
    const translations: Record<string, string> = {
      'loop:water': 'Emotional loop pattern detected',
      'loop:fire': 'Creative energy cycling',
      'loop:earth': 'Grounding loop present',
      'loop:air': 'Mental loop pattern',
      'coherence:low': 'Energy is scattered',
      'grounding:needed': 'Needs connection to body/earth',
      'clarity:seeking': 'Searching for understanding'
    };
    return translations[point] || point;
  }

  private translateAvoidancePoint(point: string): string {
    const translations: Record<string, string> = {
      'depth:premature': 'Not ready for deep exploration',
      'pushing:boundaries': 'Respect current boundaries',
      'intensity:high': 'Keep energy gentle',
      'element:water': 'Avoid emotional focus',
      'element:fire': 'Avoid action/creativity focus',
      'element:earth': 'Avoid grounding focus',
      'element:air': 'Avoid mental focus'
    };
    return translations[point] || point;
  }

  private getMaxTokens(length: 'brief' | 'moderate' | 'expansive'): number {
    const limits = {
      brief: 150,
      moderate: 300,
      expansive: 500
    };
    return limits[length];
  }

  private getTemperature(depth: string): number {
    const temperatures = {
      surface: 0.3,
      exploratory: 0.5,
      deep: 0.7,
      integrative: 0.6
    };
    return temperatures[depth as keyof typeof temperatures] || 0.5;
  }

  private getAppliedConstraints(constraints: any): string[] {
    const applied = [];
    if (constraints.holdSpace) applied.push('holding-space');
    if (constraints.mirrorOnly) applied.push('mirroring');
    if (constraints.offerDoorway) applied.push('offering-transition');
    if (constraints.emphasizeFeeling) applied.push('feeling-focused');
    if (constraints.emphasizeBody) applied.push('somatic-focused');
    return applied;
  }

  private extractStateUpdates(response: string, context: MayaRequestContext): any {
    // This would use NLP to extract state changes from response
    // Simplified for now
    return {
      suggestedTransition: null,
      depthShift: null,
      patternShift: null
    };
  }
}

// Export singleton instance
export const mayaContextualAPI = new MayaContextualAPI();