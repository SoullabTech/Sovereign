/**
 * Chat Integration API
 * RESTful API for integrating FIS into chat applications
 */

import { FIS, ApplicationContext, FISResponse } from '../IntegrationAdapter';

/**
 * Chat API endpoint handler
 */
export class FieldIntelligenceChatAPI {
  /**
   * Process chat message through Field Intelligence
   * POST /api/fis/chat
   */
  static async processChatMessage(request: {
    message: string;
    userId: string;
    sessionId: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    preferences?: {
      style?: 'therapeutic' | 'casual' | 'deep' | 'playful';
      depth?: number; // 0-1
      safety?: boolean;
    };
  }): Promise<FISResponse> {

    const context: ApplicationContext = {
      type: 'chat',
      userId: request.userId,
      sessionId: request.sessionId,
      constraints: {
        safetyMode: request.preferences?.safety ?? true,
        depthLimit: request.preferences?.depth ?? 0.5
      }
    };

    const input = {
      message: request.message,
      history: request.conversationHistory || [],
      preferences: request.preferences || {}
    };

    const response = await FIS.participate(input, context);

    // Add chat-specific formatting
    return {
      ...response,
      formatted: this.formatForChat(response),
      suggestedFollowUps: this.generateFollowUps(response)
    } as FISResponse & { formatted: string; suggestedFollowUps: string[] };
  }

  /**
   * Stream chat response through Field Intelligence
   * For real-time applications
   */
  static async* streamChatMessage(request: {
    message: string;
    userId: string;
    sessionId: string;
  }): AsyncGenerator<Partial<FISResponse>> {

    const context: ApplicationContext = {
      type: 'chat',
      userId: request.userId,
      sessionId: request.sessionId
    };

    // Initial field sensing
    yield { metadata: { contextAdaptation: 'chat', resonance: 0 } } as any;

    // Get full response
    const response = await FIS.participate({ message: request.message }, context);

    // Stream words with natural pacing based on field state
    const words = response.content.split(' ');
    const pacingDelay = this.calculatePacingDelay(response.metadata.fieldState);

    for (const word of words) {
      yield { content: word + ' ' } as Partial<FISResponse>;
      await this.delay(pacingDelay);
    }

    // Final metadata
    yield { metadata: response.metadata } as Partial<FISResponse>;
  }

  /**
   * Get chat suggestions based on field state
   */
  static async getChatSuggestions(
    userId: string,
    currentFieldState?: any
  ): Promise<string[]> {

    const suggestions: string[] = [];

    if (!currentFieldState) {
      return [
        "What's on your mind?",
        "How are you feeling today?",
        "What would you like to explore?"
      ];
    }

    const { emotionalWeather, sacredMarkers, semanticLandscape } = currentFieldState;

    // Generate contextual suggestions
    if (sacredMarkers?.threshold_proximity > 0.7) {
      suggestions.push("Take a moment to breathe");
      suggestions.push("What's emerging for you?");
    }

    if (emotionalWeather?.texture === 'turbulent') {
      suggestions.push("What's stirring for you?");
      suggestions.push("Can you say more about that feeling?");
    }

    if (semanticLandscape?.meaning_emergence === 'forming') {
      suggestions.push("What else?");
      suggestions.push("How does that land with you?");
    }

    return suggestions;
  }

  private static formatForChat(response: FISResponse): string {
    const { content, metadata } = response;

    // Add emphasis for certain intervention types
    switch (metadata.interventionType) {
      case 'celebration':
        return `✨ ${content}`;
      case 'witnessing':
        return `💫 ${content}`;
      case 'grounding':
        return `🌍 ${content}`;
      default:
        return content;
    }
  }

  private static generateFollowUps(response: FISResponse): string[] {
    const followUps: string[] = [];
    const { interventionType, fieldState } = response.metadata;

    switch (interventionType) {
      case 'inquiry':
        followUps.push("Let me think about that");
        followUps.push("I'm not sure");
        followUps.push("Can you ask it differently?");
        break;

      case 'celebration':
        followUps.push("Thank you!");
        followUps.push("I'm excited about this");
        followUps.push("What's next?");
        break;

      case 'witnessing':
        followUps.push("That means a lot");
        followUps.push("Thank you for seeing that");
        followUps.push("I needed to hear that");
        break;

      default:
        followUps.push("Tell me more");
        followUps.push("I see");
        followUps.push("What else?");
    }

    return followUps;
  }

  private static calculatePacingDelay(fieldState: any): number {
    // Sacred moments = slower pacing
    if (fieldState?.sacredMarkers?.threshold_proximity > 0.7) {
      return 150; // ms between words
    }

    // Turbulent emotions = moderate pacing
    if (fieldState?.emotionalWeather?.texture === 'turbulent') {
      return 100;
    }

    // Celebration = faster pacing
    if (fieldState?.emotionalWeather?.temperature > 0.8) {
      return 50;
    }

    return 75; // default
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * WebSocket handler for real-time chat
 */
export class FieldIntelligenceWebSocket {
  private connections = new Map<string, any>();

  handleConnection(socket: any, userId: string) {
    const sessionId = `ws-${Date.now()}`;
    this.connections.set(userId, { socket, sessionId });

    socket.on('message', async (data: string) => {
      const message = JSON.parse(data);
      await this.handleMessage(message, userId, sessionId);
    });

    socket.on('close', () => {
      this.connections.delete(userId);
    });
  }

  private async handleMessage(message: any, userId: string, sessionId: string) {
    const connection = this.connections.get(userId);
    if (!connection) return;

    const context: ApplicationContext = {
      type: 'chat',
      userId,
      sessionId,
      environment: { realtime: true }
    };

    const response = await FIS.participate(message, context);

    // Send response with field metadata for rich client experiences
    connection.socket.send(JSON.stringify({
      type: 'field_response',
      content: response.content,
      metadata: response.metadata,
      visualHints: this.generateVisualHints(response.metadata.fieldState)
    }));
  }

  private generateVisualHints(fieldState: any) {
    return {
      backgroundColor: this.mapEmotionalWeatherToColor(fieldState.emotionalWeather),
      animationSpeed: fieldState.temporalDynamics?.conversation_tempo || 0.5,
      particleEffect: fieldState.sacredMarkers?.numinous_presence > 0.5 ? 'sacred' : 'none'
    };
  }

  private mapEmotionalWeatherToColor(weather: any): string {
    if (!weather) return '#ffffff';

    const { temperature, texture, density } = weather;

    if (texture === 'flowing' && temperature > 0.7) {
      return '#ffe4b5'; // Warm, flowing = peachy
    } else if (texture === 'turbulent') {
      return '#e6e6fa'; // Turbulent = lavender
    } else if (density < 0.3) {
      return '#f0f8ff'; // Low density = alice blue
    }

    return '#ffffff';
  }
}