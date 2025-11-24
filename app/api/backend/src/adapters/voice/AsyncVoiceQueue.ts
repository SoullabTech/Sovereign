import { IVoice, VoiceJob } from '../../core/interfaces/IVoice';

export interface VoiceTask {
  id: string;
  job: VoiceJob;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface VoiceQueueListener {
  onTaskCompleted(task: VoiceTask): void;
  onTaskFailed(task: VoiceTask): void;
}

export class AsyncVoiceQueue implements IVoice {
  private tasks = new Map<string, VoiceTask>();
  private queue: VoiceTask[] = [];
  private processing = false;
  private listeners: VoiceQueueListener[] = [];
  
  constructor(private voiceProvider: IVoice) {}

  name(): string {
    return `async-queue(${this.voiceProvider.name()})`;
  }

  addListener(listener: VoiceQueueListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: VoiceQueueListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) this.listeners.splice(index, 1);
  }

  async synthesize(job: VoiceJob): Promise<string> {
    const taskId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: VoiceTask = {
      id: taskId,
      job,
      userId: 'system', // Default - should be passed in from context
      status: 'pending',
      createdAt: new Date()
    };

    this.tasks.set(taskId, task);
    this.queue.push(task);
    
    // Start processing if not already running
    this.processQueue();
    
    // Return task ID for tracking
    return taskId;
  }

  async getTaskStatus(taskId: string): Promise<VoiceTask | null> {
    return this.tasks.get(taskId) || null;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      
      try {
        task.status = 'processing';
        this.tasks.set(task.id, task);
        
        const result = await this.voiceProvider.synthesize(task.job);
        
        task.status = 'completed';
        task.result = result;
        task.completedAt = new Date();
        this.tasks.set(task.id, task);
        
        // Notify listeners
        this.listeners.forEach(listener => listener.onTaskCompleted(task));
        
      } catch (error: any) {
        task.status = 'failed';
        task.error = error.message;
        task.completedAt = new Date();
        this.tasks.set(task.id, task);
        
        // Notify listeners
        this.listeners.forEach(listener => listener.onTaskFailed(task));
      }
    }
    
    this.processing = false;
  }

  // Cleanup old tasks (call periodically)
  cleanup(olderThanMs: number = 3600000): void { // 1 hour default
    const cutoff = new Date(Date.now() - olderThanMs);
    
    Array.from(this.tasks.entries()).forEach(([id, task]) => {
      if (task.createdAt < cutoff && task.status !== 'processing') {
        this.tasks.delete(id);
      }
    });
  }
}