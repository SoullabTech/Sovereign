import { IVoice, VoiceJob } from '../../core/interfaces/IVoice';

export class StubVoice implements IVoice {
  name(): string {
    return 'stub';
  }

  async synthesize(job: VoiceJob): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    return `stub-audio-${Date.now()}.mp3`;
  }
}