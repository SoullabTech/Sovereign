import { IVoice } from '../core/interfaces/IVoice';
import { SseHub, SseEvent } from '../core/events/SseHub';

export interface VoiceJob {
  id: string;
  userId: string;
  text: string;
  voiceId?: string;
  createdAt: Date;
}

export class VoiceQueue {
  private queue: VoiceJob[] = [];
  private processing = false;
  
  constructor(
    private voice: IVoice,
    private hub: SseHub,
    private concurrency: number = 2
  ) {}

  enqueue(params: { userId: string; text: string; voiceId?: string }): string {
    const job: VoiceJob = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      text: params.text,
      voiceId: params.voiceId,
      createdAt: new Date()
    };

    this.queue.push(job);
    
    // Emit queued event
    this.hub.emit({
      type: 'voice.queued',
      userId: job.userId,
      taskId: job.id,
      textLength: job.text.length
    } as SseEvent);

    // Start processing if not already running
    this.processQueue();
    
    return job.id;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    // Process jobs with concurrency limit
    const workers: Promise<void>[] = [];
    
    for (let i = 0; i < this.concurrency && this.queue.length > 0; i++) {
      const job = this.queue.shift();
      if (job) {
        workers.push(this.processJob(job));
      }
    }
    
    await Promise.allSettled(workers);
    
    this.processing = false;
    
    // Continue processing if more jobs arrived
    if (this.queue.length > 0) {
      setImmediate(() => this.processQueue());
    }
  }

  private async processJob(job: VoiceJob): Promise<void> {
    try {
      // Emit processing started
      this.hub.emit({
        type: 'voice.processing',
        userId: job.userId,
        taskId: job.id
      } as SseEvent);

      const url = await this.voice.synthesize({
        text: job.text,
        voiceId: job.voiceId
      });

      // Emit completion
      this.hub.emit({
        type: 'voice.ready',
        userId: job.userId,
        url,
        taskId: job.id
      });

    } catch (error: any) {
      console.error('Voice synthesis error:', error);
      
      // Emit failure
      this.hub.emit({
        type: 'voice.failed',
        userId: job.userId,
        error: error.message || 'Voice synthesis failed',
        taskId: job.id
      } as SseEvent);
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      concurrency: this.concurrency
    };
  }
}