export class MayaVoice {
  private voice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;
  
  async initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    
    const voices = await new Promise<SpeechSynthesisVoice[]>(resolve => {
      const v = speechSynthesis.getVoices();
      if (v.length) resolve(v);
      else speechSynthesis.addEventListener('voiceschanged', () => resolve(speechSynthesis.getVoices()), { once: true });
    });
    
    this.voice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Victoria') || 
      v.name.includes('Female')
    ) || voices[0];
    
    this.isInitialized = true;
  }
  
  speak(text: string, mood: 'mystical' | 'gentle' | 'urgent' = 'mystical') {
    if (typeof window === 'undefined') return;
    
    // Different moods for different contexts
    const moods = {
      mystical: { rate: 0.9, pitch: 1.1, volume: 0.8 },
      gentle: { rate: 0.85, pitch: 1.0, volume: 0.7 },
      urgent: { rate: 1.0, pitch: 1.2, volume: 0.9 }
    };
    
    const settings = moods[mood];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    if (this.voice) utterance.voice = this.voice;
    
    speechSynthesis.speak(utterance);
    return new Promise(resolve => {
      utterance.onend = resolve;
    });
  }
  
  stop() {
    speechSynthesis.cancel();
  }
}

export const mayaVoice = new MayaVoice();