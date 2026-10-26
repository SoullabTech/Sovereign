// Legacy compatibility wrapper — synthesis is performed by the Soullab server.
import { requestSoullabTts } from './serverTtsClient';
export class ElevenLabsVoice {
  async speak(text: string): Promise<void> {
    try {
      const audioData = await requestSoullabTts(text, { voice: 'nova', format: 'mp3' });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      return new Promise((resolve) => { source.onended = () => resolve(); });
    } catch (error) {
      console.error('Soullab server voice failed, falling back to Web Speech:', error);
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