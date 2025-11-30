import { IOrchestrator } from "../core/interfaces/IOrchestrator";
import { IMemory } from "../core/interfaces/IMemory";
import { IAnalytics } from "../core/interfaces/IAnalytics";
import { UnifiedResponse } from "../core/types/UnifiedResponse";
import { get } from "../core/di/container";
import { TOKENS } from "../core/di/tokens";
import { VoiceQueue } from "../services/VoiceQueue";
import { getVoiceIdForElement, getVoiceIdForPersonality } from "../config/voice";

export class ConsciousnessAPI {
  constructor(
    private orchestrator: IOrchestrator,
    private memory: IMemory,
    private analytics: IAnalytics
  ) {}

  private getVoiceIdForElement(element?: string): string | undefined {
    return getVoiceIdForElement(element);
  }

  private getVoiceIdForPersonality(personality?: string): string | undefined {
    return getVoiceIdForPersonality(personality);
  }

  async chat(req: { userId: string; text: string; element?: string; personality?: string }): Promise<UnifiedResponse> {
    const t0 = Date.now();
    const out = await this.orchestrator.process({
      userId: req.userId, text: req.text, element: req.element as any
    });

    // Fire-and-forget voice synthesis (non-blocking)
    // Priority: personality > element > default
    try {
      const voiceQueue = get<VoiceQueue>(TOKENS.VOICE_QUEUE);
      const voiceId = req.personality 
        ? this.getVoiceIdForPersonality(req.personality)
        : this.getVoiceIdForElement(req.element);
        
      voiceQueue.enqueue({ 
        userId: req.userId, 
        text: out.text,
        voiceId: voiceId
      });
      
      console.log(`🎤 Queued voice synthesis: ${voiceId} for "${out.text.substring(0, 30)}..."`);
    } catch (error) {
      // Voice queue not available or failed - continue without blocking
      console.warn('Voice synthesis unavailable:', error);
    }

    await this.memory.append(req.userId, { role:'user', text:req.text, ts:Date.now() });
    await this.memory.append(req.userId, { role:'assistant', text:out.text, ts:Date.now() });

    const meta = { 
      ...(out.meta ?? {}), 
      latencyMs: Date.now() - t0,
      voiceQueued: true 
    };
    const res = { ...out, meta };
    this.analytics.emit('chat.completed', { userId: req.userId, latencyMs: meta.latencyMs });
    return res;
  }
}