// Haptic feedback system for Sacred Portal

export type HapticIntensity = 'soft' | 'medium' | 'strong' | 'breakthrough';
export type HapticPattern = 'pulse' | 'wave' | 'ripple' | 'bloom';

// Check if device supports haptics
export function supportsHaptics(): boolean {
  return 'vibrate' in navigator;
}

// Trigger single haptic pulse
export function triggerHapticPulse(intensity: HapticIntensity = 'soft') {
  if (!supportsHaptics()) return;
  
  switch (intensity) {
    case 'soft':
      // Gentle tap - for breath sync, petal touches
      navigator.vibrate(20);
      break;
    case 'medium':
      // Noticeable pulse - for state transitions
      navigator.vibrate([0, 30, 20, 30]);
      break;
    case 'strong':
      // Strong feedback - for breakthroughs
      navigator.vibrate([0, 60, 30, 60, 30, 40]);
      break;
    case 'breakthrough':
      // Climactic pattern - for grand bloom
      navigator.vibrate([0, 100, 50, 100, 50, 100, 50, 80, 40, 60, 30, 40, 20, 20]);
      break;
  }
}

// Trigger haptic pattern
export function triggerHapticPattern(pattern: HapticPattern, duration = 1000) {
  if (!supportsHaptics()) return;
  
  switch (pattern) {
    case 'pulse':
      // Regular heartbeat pattern
      const pulseInterval = setInterval(() => {
        navigator.vibrate(30);
      }, 800);
      setTimeout(() => clearInterval(pulseInterval), duration);
      break;
      
    case 'wave':
      // Rising and falling wave
      navigator.vibrate([
        0, 10, 10, 20, 10, 30, 10, 40,
        10, 30, 10, 20, 10, 10
      ]);
      break;
      
    case 'ripple':
      // Expanding ripple effect
      navigator.vibrate([
        0, 20, 40, 30, 60, 40, 80, 50,
        60, 40, 40, 30, 20, 20
      ]);
      break;
      
    case 'bloom':
      // Grand bloom pattern for 12-petal activation
      navigator.vibrate([
        0, 50, 30, 60, 40, 70, 50, 80,
        60, 90, 70, 100, 80, 90, 70, 80,
        60, 70, 50, 60, 40, 50, 30, 40,
        20, 30, 10, 20
      ]);
      break;
  }
}

// Sync haptics with frequency (for silent resonance)
export function syncHapticWithFrequency(freq: number, duration = 3000) {
  if (!supportsHaptics()) return;
  
  // Map frequency to haptic rhythm
  // Lower frequencies = slower pulses
  // Higher frequencies = faster pulses
  const pulseDuration = Math.floor(1000 / (freq / 100)); // Simplified mapping
  const pulseStrength = freq < 400 ? 40 : freq < 600 ? 30 : 20;
  
  const hapticInterval = setInterval(() => {
    navigator.vibrate(pulseStrength);
  }, pulseDuration);
  
  setTimeout(() => clearInterval(hapticInterval), duration);
}

// Haptic feedback for coherence level
export function hapticCoherence(level: number) {
  if (!supportsHaptics()) return;
  
  if (level > 0.9) {
    triggerHapticPulse('breakthrough');
  } else if (level > 0.7) {
    triggerHapticPulse('strong');
  } else if (level > 0.5) {
    triggerHapticPulse('medium');
  } else {
    triggerHapticPulse('soft');
  }
}

// Haptic feedback for element activation
export function hapticElement(element: string) {
  if (!supportsHaptics()) return;
  
  // Different patterns for different elements
  const patterns: Record<string, number[]> = {
    fire: [0, 50, 20, 50], // Quick, energetic
    water: [0, 30, 50, 30, 50, 30], // Flowing
    earth: [0, 80, 40, 80], // Solid, grounding
    air: [0, 20, 10, 20, 10, 20], // Light, quick
    aether: [0, 40, 30, 50, 40, 60, 50, 70] // Ascending
  };
  
  const pattern = patterns[element.toLowerCase()] || [0, 30];
  navigator.vibrate(pattern);
}

// Stop all haptic feedback
export function stopHaptics() {
  if (!supportsHaptics()) return;
  navigator.vibrate(0);
}

// Haptic breath sync for meditation
export class HapticBreathSync {
  private intervalId: number | null = null;
  
  start(inhaleMs = 4000, holdMs = 4000, exhaleMs = 4000) {
    if (!supportsHaptics()) return;
    
    const cycle = () => {
      // Inhale - gradual increase
      navigator.vibrate([0, 10, 20, 20, 30, 30, 40, 40]);
      
      setTimeout(() => {
        // Hold - gentle pulse
        navigator.vibrate(20);
      }, inhaleMs);
      
      setTimeout(() => {
        // Exhale - gradual decrease
        navigator.vibrate([0, 40, 30, 30, 20, 20, 10, 10]);
      }, inhaleMs + holdMs);
    };
    
    cycle();
    this.intervalId = window.setInterval(cycle, inhaleMs + holdMs + exhaleMs);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      stopHaptics();
    }
  }
}