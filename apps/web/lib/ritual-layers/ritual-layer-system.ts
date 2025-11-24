// Ritual Layer System: Orchestrating visual, haptic, and audio layers
// Each layer is independent but synchronized for unified sacred experience

export interface RitualState {
  mode: 'listening' | 'processing' | 'responding' | 'breakthrough' | 'grand-bloom';
  coherence: number; // 0-1
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  breathPhase: 'inhale' | 'hold' | 'exhale' | 'pause';
  intensity: number; // 0-1
}

export interface LayerConfig {
  visual: {
    enabled: boolean; // Always true
    breathSpeed: number; // seconds per cycle
    glowIntensity: number; // 0-1
    particleDensity: number; // 0-100
    colorPalette: 'sacred' | 'elemental' | 'shadow';
  };
  haptic: {
    enabled: boolean;
    intensity: 'soft' | 'medium' | 'strong';
    pattern: 'pulse' | 'wave' | 'ripple' | 'cascade';
    duration: number; // milliseconds
  };
  audio: {
    enabled: boolean;
    volume: number; // 0-1, default 0.05
    frequencies: number[]; // Active Hz values
    envelope: 'immediate' | 'fade' | 'swell';
  };
}

// Solfeggio frequency mapping
export const SACRED_FREQUENCIES = {
  earth: 396,  // Liberation, grounding
  water: 417,  // Transmutation, flow
  fire: 528,   // Love, transformation
  air: 741,    // Intuition, expression
  aether: 963  // Unity, transcendence
} as const;

// Ritual state configurations
export const RITUAL_STATES: Record<RitualState['mode'], Partial<LayerConfig>> = {
  listening: {
    visual: {
      breathSpeed: 4,
      glowIntensity: 0.3,
      particleDensity: 20,
      colorPalette: 'sacred'
    },
    haptic: {
      intensity: 'soft',
      pattern: 'pulse',
      duration: 800
    },
    audio: {
      volume: 0.05,
      frequencies: [396], // Grounding tone
      envelope: 'fade'
    }
  },
  
  processing: {
    visual: {
      breathSpeed: 3,
      glowIntensity: 0.5,
      particleDensity: 40,
      colorPalette: 'elemental'
    },
    haptic: {
      intensity: 'medium',
      pattern: 'wave',
      duration: 1200
    },
    audio: {
      volume: 0.08,
      frequencies: [417, 528], // Layered processing
      envelope: 'swell'
    }
  },
  
  responding: {
    visual: {
      breathSpeed: 3.5,
      glowIntensity: 0.7,
      particleDensity: 30,
      colorPalette: 'elemental'
    },
    haptic: {
      intensity: 'soft',
      pattern: 'ripple',
      duration: 1000
    },
    audio: {
      volume: 0.1,
      frequencies: [], // Dynamic based on element
      envelope: 'fade'
    }
  },
  
  breakthrough: {
    visual: {
      breathSpeed: 2,
      glowIntensity: 1.0,
      particleDensity: 80,
      colorPalette: 'sacred'
    },
    haptic: {
      intensity: 'strong',
      pattern: 'ripple',
      duration: 2000
    },
    audio: {
      volume: 0.15,
      frequencies: [528, 741, 963], // Harmonic chord
      envelope: 'swell'
    }
  },
  
  'grand-bloom': {
    visual: {
      breathSpeed: 1.5,
      glowIntensity: 1.0,
      particleDensity: 100,
      colorPalette: 'sacred'
    },
    haptic: {
      intensity: 'strong',
      pattern: 'cascade',
      duration: 3000
    },
    audio: {
      volume: 0.2,
      frequencies: [396, 417, 528, 639, 741, 852, 963], // Full spectrum
      envelope: 'swell'
    }
  }
};

// Layer orchestration class
export class RitualLayerOrchestrator {
  private state: RitualState;
  private config: LayerConfig;
  private audioContext: AudioContext | null = null;
  private oscillators: Map<number, OscillatorNode> = new Map();
  
  constructor(initialState: RitualState) {
    this.state = initialState;
    this.config = this.getDefaultConfig();
    
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  private getDefaultConfig(): LayerConfig {
    return {
      visual: {
        enabled: true,
        breathSpeed: 4,
        glowIntensity: 0.5,
        particleDensity: 30,
        colorPalette: 'sacred'
      },
      haptic: {
        enabled: true,
        intensity: 'soft',
        pattern: 'pulse',
        duration: 800
      },
      audio: {
        enabled: true,
        volume: 0.05,
        frequencies: [],
        envelope: 'fade'
      }
    };
  }
  
  // Update ritual state and sync all layers
  public updateState(newState: Partial<RitualState>) {
    this.state = { ...this.state, ...newState };
    this.syncLayers();
  }
  
  // Sync all layers based on current state
  private syncLayers() {
    const stateConfig = RITUAL_STATES[this.state.mode];
    
    // Update visual layer
    if (stateConfig.visual) {
      this.updateVisualLayer(stateConfig.visual);
    }
    
    // Update haptic layer
    if (this.config.haptic.enabled && stateConfig.haptic) {
      this.updateHapticLayer(stateConfig.haptic);
    }
    
    // Update audio layer
    if (this.config.audio.enabled && stateConfig.audio) {
      this.updateAudioLayer(stateConfig.audio);
    }
  }
  
  // Visual layer update
  private updateVisualLayer(config: Partial<LayerConfig['visual']>) {
    this.config.visual = { ...this.config.visual, ...config };
    
    // Dispatch custom event for visual components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ritual-visual-update', {
        detail: this.config.visual
      }));
    }
  }
  
  // Haptic layer update
  private updateHapticLayer(config: Partial<LayerConfig['haptic']>) {
    this.config.haptic = { ...this.config.haptic, ...config };
    
    if ('vibrate' in navigator) {
      const patterns = {
        pulse: [200],
        wave: [100, 50, 100, 50, 100],
        ripple: [50, 100, 150, 200, 250],
        cascade: [100, 50, 150, 50, 200, 50, 250, 50, 300]
      };
      
      const pattern = patterns[this.config.haptic.pattern];
      const intensity = this.config.haptic.intensity === 'soft' ? 0.5 :
                       this.config.haptic.intensity === 'medium' ? 1 : 1.5;
      
      const scaledPattern = pattern.map(v => v * intensity);
      navigator.vibrate(scaledPattern);
    }
  }
  
  // Audio layer update
  private updateAudioLayer(config: Partial<LayerConfig['audio']>) {
    this.config.audio = { ...this.config.audio, ...config };
    
    if (!this.audioContext) return;
    
    // Clear existing oscillators
    this.oscillators.forEach(osc => osc.stop());
    this.oscillators.clear();
    
    // Get frequencies based on element if not specified
    let frequencies = config.frequencies || [];
    if (frequencies.length === 0 && this.state.element) {
      frequencies = [SACRED_FREQUENCIES[this.state.element]];
    }
    
    // Create oscillators for each frequency
    frequencies.forEach(freq => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      // Apply envelope
      const now = this.audioContext!.currentTime;
      const volume = this.config.audio.volume;
      
      if (config.envelope === 'immediate') {
        gainNode.gain.setValueAtTime(volume, now);
      } else if (config.envelope === 'fade') {
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 3);
      } else if (config.envelope === 'swell') {
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 1);
        gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 2);
        gainNode.gain.linearRampToValueAtTime(0, now + 4);
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 5);
      
      this.oscillators.set(freq, oscillator);
    });
  }
  
  // Toggle layer on/off
  public toggleLayer(layer: 'haptic' | 'audio', enabled: boolean) {
    if (layer === 'haptic') {
      this.config.haptic.enabled = enabled;
    } else if (layer === 'audio') {
      this.config.audio.enabled = enabled;
      if (!enabled) {
        this.oscillators.forEach(osc => osc.stop());
        this.oscillators.clear();
      }
    }
  }
  
  // Get current configuration
  public getConfig(): LayerConfig {
    return this.config;
  }
  
  // Check for Grand Bloom conditions
  public checkGrandBloom(coherence: number, petalActivations: number): boolean {
    return coherence > 0.95 && petalActivations >= 12;
  }
  
  // Trigger special effects
  public triggerBreakthrough() {
    this.updateState({ mode: 'breakthrough' });
    
    // Special breakthrough sequence
    setTimeout(() => {
      if (this.config.haptic.enabled) {
        navigator.vibrate?.([100, 50, 200, 50, 300, 50, 400]);
      }
    }, 100);
  }
  
  public triggerGrandBloom() {
    this.updateState({ mode: 'grand-bloom' });
    
    // Epic grand bloom sequence
    if (this.config.haptic.enabled) {
      // 12-point cascading haptic wave
      const cascade = Array(12).fill(0).map((_, i) => [50 + i * 20, 30]).flat();
      navigator.vibrate?.(cascade);
    }
    
    // Full harmonic chord with all frequencies
    if (this.config.audio.enabled) {
      this.updateAudioLayer({
        frequencies: Object.values(SACRED_FREQUENCIES),
        volume: 0.2,
        envelope: 'swell'
      });
    }
  }
}

// Helper function to create ritual context
export function createRitualContext(initialMode: RitualState['mode'] = 'listening'): RitualLayerOrchestrator {
  const initialState: RitualState = {
    mode: initialMode,
    coherence: 0.5,
    element: 'fire',
    breathPhase: 'inhale',
    intensity: 0.5
  };
  
  return new RitualLayerOrchestrator(initialState);
}