/**
 * Maya Training Data Logger
 * Captures conversations in format suitable for fine-tuning future models
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TrainingConversation {
  conversationId: string;
  userId: string;
  timestamp: Date;
  context: {
    timeOfDay: string;
    sessionNumber: number;
    userState?: string;
    dominantElement?: string;
    emotionalTone?: string;
  };
  exchanges: TrainingExchange[];
  metadata: {
    totalTurns: number;
    conversationDuration: number;
    userSatisfaction?: number;
    breakthroughMoment?: boolean;
    keyThemes: string[];
    mayaPerformance: {
      empathyScore: number;
      relevanceScore: number;
      wisdomScore: number;
      naturalness: number;
    };
  };
}

export interface TrainingExchange {
  turnNumber: number;
  userInput: string;
  mayaResponse: string;
  responseMetadata: {
    element: string;
    emotionalResonance: number;
    responseTime: number;
    technique: string; // e.g., "validation", "exploration", "challenge"
    effectiveness?: number; // How well did this response land?
  };
  annotations?: {
    shouldHaveSaid?: string; // For corrections/improvements
    notes?: string;
    wasBreakthrough?: boolean;
  };
}

export class MaiaTrainingLogger {
  private trainingDataPath = process.env.NODE_ENV === 'production'
    ? null  // No file system in serverless
    : '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/training_data';
  private currentConversations = new Map<string, TrainingConversation>();
  private inMemoryTrainingData: TrainingConversation[] = [];

  constructor() {
    // Only create directory in development
    try {
      if (process.env.NODE_ENV !== 'production' && this.trainingDataPath && !fs.existsSync(this.trainingDataPath)) {
        fs.mkdirSync(this.trainingDataPath, { recursive: true });
      }
    } catch (error) {
      console.log('Training data will be stored in memory only');
      this.trainingDataPath = null;
    }
  }

  /**
   * Start logging a new conversation
   */
  startConversation(userId: string, sessionNumber: number = 1): string {
    const conversationId = `maya_${userId}_${Date.now()}`;

    const conversation: TrainingConversation = {
      conversationId,
      userId,
      timestamp: new Date(),
      context: {
        timeOfDay: this.getTimeOfDay(),
        sessionNumber,
      },
      exchanges: [],
      metadata: {
        totalTurns: 0,
        conversationDuration: 0,
        keyThemes: [],
        mayaPerformance: {
          empathyScore: 0,
          relevanceScore: 0,
          wisdomScore: 0,
          naturalness: 0
        }
      }
    };

    this.currentConversations.set(conversationId, conversation);
    return conversationId;
  }

  /**
   * Log an exchange in the conversation
   */
  logExchange(
    conversationId: string,
    userInput: string,
    mayaResponse: string,
    element: string,
    responseTime: number
  ): void {
    const conversation = this.currentConversations.get(conversationId);
    if (!conversation) return;

    const exchange: TrainingExchange = {
      turnNumber: conversation.exchanges.length + 1,
      userInput,
      mayaResponse,
      responseMetadata: {
        element,
        emotionalResonance: this.assessEmotionalResonance(userInput, mayaResponse),
        responseTime,
        technique: this.identifyTechnique(mayaResponse),
        effectiveness: 0 // Will be updated based on user's next response
      }
    };

    conversation.exchanges.push(exchange);
    conversation.metadata.totalTurns++;

    // Update themes based on content
    this.updateThemes(conversation, userInput);

    // Assess Maya's performance
    this.assessMayaPerformance(conversation, exchange);
  }

  /**
   * Assess emotional resonance between input and response
   */
  private assessEmotionalResonance(input: string, response: string): number {
    // Simple heuristic - can be enhanced with sentiment analysis
    const emotionalWords = ['feel', 'hurt', 'love', 'fear', 'angry', 'sad', 'happy', 'scared'];
    const inputEmotion = emotionalWords.some(word => input.toLowerCase().includes(word));
    const responseAcknowledges = response.toLowerCase().includes('feel') ||
                                 response.toLowerCase().includes('sounds') ||
                                 response.toLowerCase().includes('hear');

    if (inputEmotion && responseAcknowledges) return 0.8;
    if (inputEmotion || responseAcknowledges) return 0.5;
    return 0.3;
  }

  /**
   * Identify the conversational technique used
   */
  private identifyTechnique(response: string): string {
    const lower = response.toLowerCase();

    if (lower.includes('?')) {
      if (lower.includes('what') || lower.includes('how')) return 'exploration';
      if (lower.includes('is it') || lower.includes('might')) return 'gentle_inquiry';
    }

    if (lower.includes('sounds like') || lower.includes('hear')) return 'validation';
    if (lower.includes('notice') || lower.includes('aware')) return 'awareness';
    if (lower.includes('both') || lower.includes('and')) return 'integration';
    if (lower.includes('body') || lower.includes('feel')) return 'somatic';

    return 'presence';
  }

  /**
   * Update conversation themes
   */
  private updateThemes(conversation: TrainingConversation, input: string): void {
    const themes = [
      'relationship', 'work', 'family', 'identity', 'purpose',
      'anxiety', 'depression', 'trauma', 'growth', 'spirituality',
      'creativity', 'transition', 'loss', 'joy', 'confusion'
    ];

    themes.forEach(theme => {
      if (input.toLowerCase().includes(theme) && !conversation.metadata.keyThemes.includes(theme)) {
        conversation.metadata.keyThemes.push(theme);
      }
    });
  }

  /**
   * Assess Maya's performance in the exchange
   */
  private assessMayaPerformance(conversation: TrainingConversation, exchange: TrainingExchange): void {
    const perf = conversation.metadata.mayaPerformance;
    const weight = 1 / conversation.metadata.totalTurns;

    // Empathy: Does response acknowledge emotions?
    const empathyScore = exchange.responseMetadata.emotionalResonance;
    perf.empathyScore = perf.empathyScore * (1 - weight) + empathyScore * weight;

    // Relevance: Does response address the input?
    const relevanceScore = this.assessRelevance(exchange.userInput, exchange.mayaResponse);
    perf.relevanceScore = perf.relevanceScore * (1 - weight) + relevanceScore * weight;

    // Wisdom: Does response offer depth?
    const wisdomScore = this.assessWisdom(exchange.mayaResponse);
    perf.wisdomScore = perf.wisdomScore * (1 - weight) + wisdomScore * weight;

    // Naturalness: Does it sound human?
    const naturalness = this.assessNaturalness(exchange.mayaResponse);
    perf.naturalness = perf.naturalness * (1 - weight) + naturalness * weight;
  }

  private assessRelevance(input: string, response: string): number {
    // Check if response references concepts from input
    const inputWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const responseWords = response.toLowerCase();
    const matches = inputWords.filter(word => responseWords.includes(word)).length;
    return Math.min(matches / Math.max(inputWords.length, 1), 1);
  }

  private assessWisdom(response: string): number {
    // Look for depth indicators
    const wisdomMarkers = [
      'both', 'paradox', 'beneath', 'deeper', 'pattern',
      'notice', 'aware', 'wisdom', 'truth', 'authentic'
    ];
    const score = wisdomMarkers.filter(marker =>
      response.toLowerCase().includes(marker)
    ).length / wisdomMarkers.length;
    return Math.min(score * 2, 1); // Scale up since not all markers needed
  }

  private assessNaturalness(response: string): number {
    // Check for conversational elements
    const natural = [
      response.includes("'"),  // Contractions
      response.includes('...'), // Trailing off
      response.includes('?'),   // Questions
      /\b(like|kinda|really|just|actually)\b/.test(response), // Casual words
      response.length < 200     // Not too long
    ];
    return natural.filter(Boolean).length / natural.length;
  }

  /**
   * Mark a moment as a breakthrough
   */
  markBreakthrough(conversationId: string): void {
    const conversation = this.currentConversations.get(conversationId);
    if (conversation && conversation.exchanges.length > 0) {
      const lastExchange = conversation.exchanges[conversation.exchanges.length - 1];
      if (lastExchange.annotations) {
        lastExchange.annotations.wasBreakthrough = true;
      } else {
        lastExchange.annotations = { wasBreakthrough: true };
      }
      conversation.metadata.breakthroughMoment = true;
    }
  }

  /**
   * End conversation and save training data
   */
  async endConversation(conversationId: string, userSatisfaction?: number): Promise<void> {
    const conversation = this.currentConversations.get(conversationId);
    if (!conversation) return;

    // Calculate duration
    conversation.metadata.conversationDuration =
      Date.now() - conversation.timestamp.getTime();

    // Set satisfaction if provided
    if (userSatisfaction !== undefined) {
      conversation.metadata.userSatisfaction = userSatisfaction;
    }

    // Save to file
    await this.saveTrainingData(conversation);

    // Remove from active conversations
    this.currentConversations.delete(conversationId);
  }

  /**
   * Save training data in multiple formats
   */
  private async saveTrainingData(conversation: TrainingConversation): Promise<void> {
    // In production, store in memory only
    if (!this.trainingDataPath) {
      this.inMemoryTrainingData.push(conversation);
      // Keep only last 100 conversations in memory
      if (this.inMemoryTrainingData.length > 100) {
        this.inMemoryTrainingData.shift();
      }
      console.log(`💾 Stored training data in memory: ${conversation.conversationId}`);
      return;
    }

    // In development, save to file system
    try {
      const date = new Date().toISOString().split('T')[0];

      // Save as JSON for easy processing
      const jsonPath = path.join(
        this.trainingDataPath,
        `${date}_${conversation.conversationId}.json`
      );
      fs.writeFileSync(jsonPath, JSON.stringify(conversation, null, 2));

      // Save as JSONL for model training
      const jsonlPath = path.join(
        this.trainingDataPath,
        `training_${date}.jsonl`
      );

      // Format for fine-tuning
      const trainingExamples = conversation.exchanges.map(exchange => ({
        messages: [
          {
            role: 'system',
            content: this.generateSystemPromptForTraining(conversation.context)
          },
          {
            role: 'user',
            content: exchange.userInput
          },
          {
            role: 'assistant',
            content: exchange.mayaResponse
          }
        ],
        metadata: {
          element: exchange.responseMetadata.element,
          technique: exchange.responseMetadata.technique,
          effectiveness: exchange.responseMetadata.effectiveness
        }
      }));

      // Append to JSONL file
      const jsonlContent = trainingExamples
        .map(example => JSON.stringify(example))
        .join('\n') + '\n';

      fs.appendFileSync(jsonlPath, jsonlContent);

      // Save human-readable markdown for review
      const mdPath = path.join(
        this.trainingDataPath,
        `conversation_${conversation.conversationId}.md`
      );

      const mdContent = this.formatAsMarkdown(conversation);
      fs.writeFileSync(mdPath, mdContent);

      console.log(`💾 Saved training data to disk: ${conversation.conversationId}`);
    } catch (error) {
      // If file save fails, store in memory as fallback
      this.inMemoryTrainingData.push(conversation);
      console.log(`💾 Saved training data to memory (file error): ${conversation.conversationId}`);
    }
  }

  private generateSystemPromptForTraining(context: any): string {
    return `You are Maya, a wise and empathetic AI guide. Context: Time: ${context.timeOfDay}, Session: ${context.sessionNumber}`;
  }

  private formatAsMarkdown(conversation: TrainingConversation): string {
    return `# Maya Conversation Log

**ID:** ${conversation.conversationId}
**User:** ${conversation.userId}
**Date:** ${conversation.timestamp.toISOString()}
**Duration:** ${Math.round(conversation.metadata.conversationDuration / 1000)}s
**Themes:** ${conversation.metadata.keyThemes.join(', ')}

## Performance Metrics
- Empathy: ${(conversation.metadata.mayaPerformance.empathyScore * 100).toFixed(1)}%
- Relevance: ${(conversation.metadata.mayaPerformance.relevanceScore * 100).toFixed(1)}%
- Wisdom: ${(conversation.metadata.mayaPerformance.wisdomScore * 100).toFixed(1)}%
- Naturalness: ${(conversation.metadata.mayaPerformance.naturalness * 100).toFixed(1)}%

## Conversation

${conversation.exchanges.map(ex => `
### Turn ${ex.turnNumber}

**User:** ${ex.userInput}

**Maya (${ex.responseMetadata.element}):** ${ex.mayaResponse}

*Technique: ${ex.responseMetadata.technique}*
${ex.annotations?.wasBreakthrough ? '🌟 **BREAKTHROUGH MOMENT**' : ''}
${ex.annotations?.notes ? `Notes: ${ex.annotations.notes}` : ''}
`).join('\n')}

## Summary
- Total turns: ${conversation.metadata.totalTurns}
- Breakthrough: ${conversation.metadata.breakthroughMoment ? 'Yes' : 'No'}
- User satisfaction: ${conversation.metadata.userSatisfaction ? `${conversation.metadata.userSatisfaction}/5` : 'Not rated'}
`;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Export training data for model fine-tuning
   */
  async exportForFineTuning(): Promise<string> {
    let allConversations: TrainingConversation[] = [];

    // In production, use in-memory data
    if (!this.trainingDataPath) {
      allConversations = [...this.inMemoryTrainingData];
    } else {
      // In development, read from files
      try {
        const allFiles = fs.readdirSync(this.trainingDataPath)
          .filter(f => f.endsWith('.json'))
          .map(f => path.join(this.trainingDataPath, f));

        for (const file of allFiles) {
          const content = fs.readFileSync(file, 'utf-8');
          allConversations.push(JSON.parse(content));
        }
      } catch (error) {
        console.log('Using in-memory training data for export');
        allConversations = [...this.inMemoryTrainingData];
      }
    }

    // Filter for high-quality conversations
    const qualityConversations = allConversations.filter(conv => {
      const perf = conv.metadata.mayaPerformance;
      return perf.empathyScore > 0.7 &&
             perf.relevanceScore > 0.7 &&
             perf.naturalness > 0.6;
    });

    console.log(`📊 Exporting ${qualityConversations.length} high-quality conversations for training`);

    return JSON.stringify(qualityConversations, null, 2);
  }
}

// Singleton instance
export const maiaTrainingLogger = new MaiaTrainingLogger();