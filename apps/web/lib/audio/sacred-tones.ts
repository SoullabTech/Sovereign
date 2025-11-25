// Sacred Audio System - Solfeggio frequencies mapped to elements

// Map Solfeggio frequencies to elements
export const sacredTones: Record<string, number> = {
  // Primary elements
  fire: 528,   // transformation / love
  water: 417,  // change / release
  earth: 396,  // grounding / stability
  air: 741,    // clarity / expression
  aether: 963, // transcendence / unity
  
  // Additional frequencies for 12-petal system
  void: 285,   // quantum field / regeneration
  light: 639,  // heart connection / relationships
  shadow: 174, // pain relief / foundation
  spirit: 852, // intuition / return to order
  time: 432,   // universal harmony
  space: 777,  // angelic realm / consciousness
  unity: 888,  // abundance / flow
};

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Play single frequency tone using Web Audio API (subtle)
export function playSacredTone(
  freq: number, 
  duration = 3,
  volume = 0.05 // Very subtle by default
) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  // Subtle fade in and out
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(volume, ctx.currentTime + duration - 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Play chord of multiple frequencies
export function playChord(
  elements: string[], 
  duration = 4,
  volume = 0.03 // Even more subtle for chords
) {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  
  // Master volume control
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(volume, ctx.currentTime + duration - 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  gain.connect(ctx.destination);

  elements.forEach((el, index) => {
    const freq = sacredTones[el.toLowerCase()];
    if (freq) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      
      // Slight detuning for richness
      if (index > 0) {
        osc.detune.value = (index - elements.length / 2) * 2;
      }

      osc.connect(gain);
      osc.start(ctx.currentTime + index * 0.05); // Slight stagger
      osc.stop(ctx.currentTime + duration);
    }
  });
}

// Play all 12 tones for grand bloom (with aether overlay)
export function playGrandBloom(
  duration = 6,
  volume = 0.02 // Very subtle for full chord
) {
  const allElements = Object.keys(sacredTones).filter(el => el !== 'aether');
  const ctx = getAudioContext();
  
  // Play main chord
  playChord(allElements, duration, volume);
  
  // Overlay aether tone (963 Hz) as crown
  setTimeout(() => {
    playSacredTone(963, duration - 0.5, volume * 1.5); // Slightly louder aether
  }, 500);
  
  // Add subtle bell-like harmonic
  const bell = ctx.createOscillator();
  const bellGain = ctx.createGain();
  
  bell.type = 'triangle';
  bell.frequency.value = 963 * 2; // Octave above aether
  
  bellGain.gain.setValueAtTime(0, ctx.currentTime);
  bellGain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 1);
  bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  bell.connect(bellGain).connect(ctx.destination);
  bell.start(ctx.currentTime + 1);
  bell.stop(ctx.currentTime + duration);
}

// Play sequence of tones
export function playSequence(
  elements: string[],
  interval = 0.5,
  noteDuration = 1,
  volume = 0.05
) {
  elements.forEach((el, index) => {
    const freq = sacredTones[el.toLowerCase()];
    if (freq) {
      setTimeout(() => {
        playSacredTone(freq, noteDuration, volume);
      }, index * interval * 1000);
    }
  });
}

// Get pulse duration based on frequency (for silent resonance)
export function getPulseDuration(freq: number): number {
  // Scale frequency to visual pulse duration
  // Lower frequencies = slower pulses (Earth grounding)
  // Higher frequencies = faster pulses (Air clarity)
  // Range: ~1s (Aether 963Hz) to ~4s (Shadow 174Hz)
  const minFreq = 174;
  const maxFreq = 963;
  const minDuration = 1.0;
  const maxDuration = 4.0;
  
  const normalized = (freq - minFreq) / (maxFreq - minFreq);
  return maxDuration - (normalized * (maxDuration - minDuration));
}

// Get frequency for element
export function getFrequencyForElement(element: string): number {
  return sacredTones[element.toLowerCase()] || 528;
}

// Play elemental tone with state awareness
export function playElementalTone(
  element: string,
  state: 'on' | 'silent' | 'off',
  duration = 3,
  volume = 0.05
) {
  if (state === 'off') return;
  
  if (state === 'silent') {
    // Silent resonance - no audio, just return frequency for visual sync
    return getFrequencyForElement(element);
  }
  
  // Normal audio playback
  const freq = getFrequencyForElement(element);
  playSacredTone(freq, duration, volume);
  return freq;
}

// Cleanup audio context
export function cleanupAudio() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}