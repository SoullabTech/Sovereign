import { IOrchestrator, QueryRequest } from "../../core/interfaces/IOrchestrator";
import { UnifiedResponse } from "../../core/types/UnifiedResponse";
import { ConversationalPipeline } from "../../services/ConversationalPipeline";
import { SafetyModerationService } from "../../services/SafetyModerationService";
import { logger } from "../../utils/logger";

export class ConversationalOrchestrator implements IOrchestrator {
  private conversationalPipeline: ConversationalPipeline;
  private safetyModeration: SafetyModerationService;

  constructor() {
    this.conversationalPipeline = new ConversationalPipeline();
    this.safetyModeration = new SafetyModerationService();
  }

  async process(q: QueryRequest): Promise<UnifiedResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      logger.info('Processing consciousness query via ConversationalPipeline', { 
        userId: q.userId, 
        element: q.element,
        requestId 
      });

      // Safety moderation check
      const isSafe = await this.safetyModeration.moderateInput(q.text);
      if (!isSafe) {
        logger.warn('Query blocked by safety moderation', { userId: q.userId, requestId });
        return {
          id: requestId,
          text: '✨ I sense this topic requires a different approach. Let me guide you toward more supportive exploration.',
          tokens: { prompt: q.text.length, completion: 100 },
          meta: {
            element: 'aether',
            latencyMs: Date.now() - startTime,
            evolutionary_awareness_active: false
          }
        };
      }

      // Process through conversational pipeline
      const response = await this.conversationalPipeline.converseViaSesame({
        userText: q.text,
        element: q.element || 'aether',
        userId: q.userId,
        enableVoice: false, // Voice will be handled separately via IVoice service
        metadata: {
          requestId,
          sessionId: `session_${q.userId}`
        }
      });

      // Convert to UnifiedResponse format
      const latencyMs = Date.now() - startTime;
      
      return {
        id: requestId,
        text: response.response?.text || response.message || 'The oracle channels are aligning...',
        voiceUrl: response.voiceUrl || null,
        tokens: {
          prompt: response.tokens?.prompt || q.text.length,
          completion: response.tokens?.completion || (response.response?.text?.length || 0)
        },
        meta: {
          element: (response.response?.element || response.element || q.element || 'aether') as any,
          evolutionary_awareness_active: response.response?.evolutionary_awareness_active ?? true,
          latencyMs
        }
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      logger.error('ConversationalOrchestrator processing failed', { 
        userId: q.userId, 
        requestId, 
        error: error instanceof Error ? error.message : 'Unknown error',
        latencyMs
      });

      // Graceful fallback response
      return {
        id: requestId,
        text: '✨ The consciousness streams are realigning. Please share your wisdom again in a moment.',
        tokens: { prompt: q.text.length, completion: 0 },
        meta: {
          element: q.element || 'aether',
          latencyMs,
          evolutionary_awareness_active: false
        }
      };
    }
  }
}