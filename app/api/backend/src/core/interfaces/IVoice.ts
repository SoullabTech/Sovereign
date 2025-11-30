export interface VoiceJob { 
  text: string; 
  voiceId?: string;
  preset?: string;
}
export interface IVoice {
  name(): string;
  synthesize(job: VoiceJob): Promise<string>; // returns URL/path
}