// ElevenLabs Voice Service for High-Quality Voice Synthesis
export class ElevenLabsVoice {
  private apiKey: string;
  private voiceId: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || '';
    this.voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_AUNT_ANNIE || 
                   process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || 
                   'y2TOWGCXSYEgBanvKsYJ'; // Aunt Annie's voice
    
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found, falling back to Web Speech API');
    }
  }
  
  async speak(text: string): Promise<void> {
    if (!this.apiKey) {
      // Fallback to Web Speech API
      return this.speakWithWebSpeech(text);
    }
    
    try {
      // Call ElevenLabs API
      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      // Get audio data
      const audioData = await response.arrayBuffer();
      
      // Play audio using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      // Wait for audio to finish
      return new Promise((resolve) => {
        source.onended = () => resolve();
      });
      
    } catch (error) {
      console.error('ElevenLabs voice error, falling back to Web Speech:', error);
      return this.speakWithWebSpeech(text);
    }
  }
  
  private async speakWithWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find best voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        'Google UK English Female',
        'Microsoft Zira',
        'Samantha',
        'Victoria',
        'Kate'
      ];
      
      for (const preferred of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferred));
        if (voice) {
          utterance.voice = voice;
          break;
        }
      }
      
      // Optimize for naturalness
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 0.9;
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      window.speechSynthesis.speak(utterance);
    });
  }
}

// Singleton instance
let elevenLabsVoice: ElevenLabsVoice | null = null;

export function getElevenLabsVoice(): ElevenLabsVoice {
  if (!elevenLabsVoice) {
    elevenLabsVoice = new ElevenLabsVoice();
  }
  return elevenLabsVoice;
}