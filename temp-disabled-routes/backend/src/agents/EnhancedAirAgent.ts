import { AgentResponse } from "../types/agentResponse";
/**
 * Enhanced Air Agent - Powered by Claude for Superior Communication
 * Integrates with Sesame Conversational Intelligence for optimal voice synthesis
 */

import { elementalRouter } from '../services/ElementalIntelligenceRouter';
import { logOracleInsight } from '../utils/oracleLogger';
import { getRelevantMemories, storeMemoryItem } from '../services/memoryService';
import { logger } from '../utils/logger';

export interface AirAgentQuery {
  input: string;
  userId: string;
  context?: any;
  communicationGoal?: 'clarity' | 'expression' | 'understanding' | 'articulation';
}

export interface AirAgentResponse {
  message: string;
  confidence: number;
  communicationInsights: {
    clarity: number;
    structure: string[];
    breathworkSuggestion: string;
    voiceOptimization: any;
  };
  symbols: string[];
  metadata: any;
}

/**
 * Air Agent - The Master of Communication and Clarity
 * Uses Claude's superior language capabilities for optimal expression
 */
export class EnhancedAirAgent {
  private element = 'air';
  
  /**
   * Process query through Claude-powered Air intelligence
   */
  async process(query: AirAgentQuery): Promise<AirAgentResponse> {
    try {
      logger.info('Air Agent processing with Claude', {
        userId: query.userId,
        hasContext: !!query.context,
        goal: query.communicationGoal
      });

      // Get relevant memories for context
      const memories = await getRelevantMemories(query.userId, query.input, 5);
      
      // Enhance context with communication-specific data
      const enhancedContext = {
        ...query.context,
        memories,
        communicationGoal: query.communicationGoal || 'clarity',
        previousCommunicationPatterns: await this.analyzeCommunicationPatterns(memories),
        linguisticPreferences: await this.detectLinguisticPreferences(query.userId)
      };

      // Process through Claude via the elemental router
      const claudeResponse = await elementalRouter.processElementalInput(
        'air',
        query.input,
        enhancedContext
      );

      // Enhance response for Sesame CI integration
      const voiceOptimizedResponse = await this.optimizeForVoiceSynthesis(
        claudeResponse.response,
        query.communicationGoal
      );

      // Extract communication insights
      const communicationInsights = await this.extractCommunicationInsights(
        claudeResponse,
        query.input
      );

      // Store the interaction with Air-specific metadata
      await this.storeAirInteraction(
        query.userId,
        query.input,
        voiceOptimizedResponse,
        claudeResponse
      );

      // Log the oracle insight
      logOracleInsight({
        userId: query.userId,
        element: 'air',
        insight: voiceOptimizedResponse,
        symbols: claudeResponse.symbols,
        confidence: claudeResponse.confidence
      });

      return {
        message: voiceOptimizedResponse,
        confidence: claudeResponse.confidence,
        communicationInsights,
        symbols: claudeResponse.symbols,
        metadata: {
          ...claudeResponse.insights,
          voiceReady: true,
          claudeModel: 'claude-3-opus',
          sesameOptimized: true
        }
      };

    } catch (error) {
      logger.error('Air Agent processing error', { error, userId: query.userId });
      throw error;
    }
  }

  /**
   * Optimize response for Sesame voice synthesis
   */
  private async optimizeForVoiceSynthesis(
    response: string,
    goal?: string
  ): Promise<string> {
    // Add natural pauses for breath
    let optimized = response.replace(/\. /g, '. ... ');
    
    // Add emphasis markers for important words
    optimized = optimized.replace(
      /\b(clarity|truth|understanding|communication|breath)\b/gi,
      '**$1**'
    );

    // Structure for voice cadence based on goal
    switch (goal) {
      case 'clarity':
        // Short, clear sentences
        optimized = this.breakIntoShortSentences(optimized);
        break;
      case 'expression':
        // More flowing, expressive cadence
        optimized = this.addExpressiveCadence(optimized);
        break;
      case 'understanding':
        // Slower, more deliberate pacing
        optimized = this.addDeliberatePacing(optimized);
        break;
      case 'articulation':
        // Precise, well-enunciated structure
        optimized = this.enhanceArticulation(optimized);
        break;
    }

    return optimized;
  }

  /**
   * Extract deep communication insights
   */
  private async extractCommunicationInsights(
    claudeResponse: any,
    userInput: string
  ): Promise<any> {
    // Analyze clarity score
    const clarityScore = this.analyzeClarityScore(claudeResponse.response);
    
    // Extract structural elements
    const structure = this.extractCommunicationStructure(claudeResponse.response);
    
    // Get breathwork suggestion from Claude's insights
    const breathworkSuggestion = claudeResponse.insights?.breathPattern || 
      'Natural rhythmic breathing for clear communication';
    
    // Voice optimization recommendations
    const voiceOptimization = {
      pace: this.recommendPace(userInput),
      tone: this.recommendTone(claudeResponse.response),
      emphasis: this.identifyEmphasisPoints(claudeResponse.response),
      pauses: this.identifyPausePoints(claudeResponse.response)
    };

    return {
      clarity: clarityScore,
      structure,
      breathworkSuggestion,
      voiceOptimization
    };
  }

  /**
   * Analyze communication patterns from memories
   */
  private async analyzeCommunicationPatterns(memories: any[]): Promise<any> {
    const patterns = {
      dominantStyle: 'balanced',
      averageLength: 0,
      complexity: 'medium',
      emotionalTone: 'neutral'
    };

    if (memories.length === 0) return patterns;

    // Analyze patterns from past interactions
    const lengths = memories.map(m => m.content.split(' ').length);
    patterns.averageLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    if (patterns.averageLength < 20) patterns.dominantStyle = 'concise';
    else if (patterns.averageLength > 50) patterns.dominantStyle = 'elaborate';

    return patterns;
  }

  /**
   * Detect user's linguistic preferences
   */
  private async detectLinguisticPreferences(userId: string): Promise<any> {
    // In production, this would analyze user's historical language patterns
    return {
      vocabulary: 'accessible',
      sentenceStructure: 'varied',
      metaphoricalThinking: true,
      preferredClarity: 'high'
    };
  }

  /**
   * Break text into short, clear sentences
   */
  private breakIntoShortSentences(text: string): string {
    return text.replace(/([.!?])\s+/g, '$1\n\n')
      .split('\n')
      .map(sentence => {
        if (sentence.split(' ').length > 15) {
          // Break long sentences at conjunctions
          return sentence.replace(/,\s+(and|but|or|yet|so)\s+/gi, '.\n\n$1 ');
        }
        return sentence;
      })
      .join('\n');
  }

  /**
   * Add expressive cadence to text
   */
  private addExpressiveCadence(text: string): string {
    // Add musical pauses and rhythm
    return text
      .replace(/,/g, ', ... ')
      .replace(/—/g, ' — ... — ')
      .replace(/\?/g, '? ... ');
  }

  /**
   * Add deliberate pacing for understanding
   */
  private addDeliberatePacing(text: string): string {
    // Add longer pauses between concepts
    return text
      .replace(/\. /g, '. .... ')
      .replace(/: /g, ': ... ')
      .replace(/; /g, '; ... ');
  }

  /**
   * Enhance articulation markers
   */
  private enhanceArticulation(text: string): string {
    // Add emphasis on key syllables
    const keyWords = ['important', 'essential', 'crucial', 'vital', 'key'];
    let enhanced = text;
    
    keyWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      enhanced = enhanced.replace(regex, `[${word.toUpperCase()}]`);
    });
    
    return enhanced;
  }

  /**
   * Analyze clarity score of response
   */
  private analyzeClarityScore(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return 0;
    
    const avgWordsPerSentence = response.split(' ').length / sentences.length;
    const complexWords = response.match(/\b\w{10,}\b/g)?.length || 0;
    
    // Simple clarity formula
    let clarity = 1.0;
    if (avgWordsPerSentence > 20) clarity -= 0.2;
    if (avgWordsPerSentence > 30) clarity -= 0.3;
    if (complexWords > 5) clarity -= 0.1;
    
    return Math.max(0.3, clarity);
  }

  /**
   * Extract communication structure
   */
  private extractCommunicationStructure(response: string): string[] {
    const structure = [];
    
    if (response.includes('First')) structure.push('Sequential organization');
    if (response.includes('However')) structure.push('Contrasting viewpoints');
    if (response.includes('Therefore')) structure.push('Logical conclusions');
    if (response.includes('?')) structure.push('Socratic questioning');
    if (response.includes('Let')) structure.push('Invitational language');
    
    return structure.length > 0 ? structure : ['Direct communication'];
  }

  /**
   * Recommend speaking pace
   */
  private recommendPace(input: string): string {
    const urgency = input.toLowerCase().includes('urgent') || 
                   input.toLowerCase().includes('quick');
    const complexity = input.split(' ').length > 30;
    
    if (urgency) return 'moderate-fast';
    if (complexity) return 'slow-deliberate';
    return 'moderate';
  }

  /**
   * Recommend tone based on content
   */
  private recommendTone(response: string): string {
    if (response.includes('?')) return 'inquisitive';
    if (response.includes('!')) return 'emphatic';
    if (response.includes('peace') || response.includes('calm')) return 'soothing';
    return 'balanced';
  }

  /**
   * Identify emphasis points in text
   */
  private identifyEmphasisPoints(text: string): string[] {
    const emphasisWords = [];
    
    // Words in quotes
    const quoted = text.match(/"([^"]+)"/g);
    if (quoted) emphasisWords.push(...quoted);
    
    // Words in bold
    const bold = text.match(/\*\*([^*]+)\*\*/g);
    if (bold) emphasisWords.push(...bold);
    
    // Key conceptual words
    const concepts = ['truth', 'clarity', 'understanding', 'communication'];
    concepts.forEach(concept => {
      if (text.toLowerCase().includes(concept)) {
        emphasisWords.push(concept);
      }
    });
    
    return [...new Set(emphasisWords)];
  }

  /**
   * Identify natural pause points
   */
  private identifyPausePoints(text: string): number[] {
    const pauseIndices = [];
    
    // After punctuation
    ['. ', ', ', ': ', '; ', '? ', '! '].forEach(punct => {
      let index = text.indexOf(punct);
      while (index !== -1) {
        pauseIndices.push(index + 1);
        index = text.indexOf(punct, index + 1);
      }
    });
    
    return pauseIndices.sort((a, b) => a - b);
  }

  /**
   * Store Air-specific interaction data
   */
  private async storeAirInteraction(
    userId: string,
    input: string,
    response: string,
    claudeData: any
  ): Promise<void> {
    await storeMemoryItem(
      userId,
      `Air Query: ${input}\nAir Response: ${response}`,
      'air',
      'enhanced_air_agent',
      claudeData.confidence,
      {
        model: 'claude-3-opus',
        communicationInsights: claudeData.insights,
        symbols: claudeData.symbols,
        voiceOptimized: true,
        timestamp: new Date().toISOString()
      }
    );
  }
}

// Export singleton instance
export const enhancedAirAgent = new EnhancedAirAgent();