import { VoiceTask } from '../../adapters/voice/AsyncVoiceQueue';

export interface VoiceCompletedEvent {
  type: 'voice_completed';
  taskId: string;
  userId: string;
  audioUrl: string;
  text: string;
  timestamp: Date;
}

export interface VoiceFailedEvent {
  type: 'voice_failed';
  taskId: string;
  userId: string;
  text: string;
  error: string;
  timestamp: Date;
}

export type VoiceEvent = VoiceCompletedEvent | VoiceFailedEvent;

export interface VoiceEventListener {
  (event: VoiceEvent): void;
}

export class VoiceEventBus {
  private listeners: VoiceEventListener[] = [];

  subscribe(listener: VoiceEventListener): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: VoiceEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) this.listeners.splice(index, 1);
  }

  emit(event: VoiceEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Voice event listener error:', error);
      }
    });
  }

  emitVoiceCompleted(task: VoiceTask): void {
    this.emit({
      type: 'voice_completed',
      taskId: task.id,
      userId: task.userId,
      audioUrl: task.result!,
      text: task.job.text,
      timestamp: new Date()
    });
  }

  emitVoiceFailed(task: VoiceTask): void {
    this.emit({
      type: 'voice_failed',
      taskId: task.id,
      userId: task.userId,
      text: task.job.text,
      error: task.error!,
      timestamp: new Date()
    });
  }
}