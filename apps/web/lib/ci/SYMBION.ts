import type { SymbolicContext } from '@/lib/memory/soulprint';

export interface SYMBIONResponse {
  message: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype: string;
  voiceCharacteristics: {
    tone: string;
    pace: string;
    energy: string;
  };
  metadata: {
    spiralogicPhase: string;
    userName?: string;
    responseTime?: number;
    symbols?: string[];
    confidence?: number;
  };
}

export interface SYMBIONOptions {
  userId?: string;
  sessionId?: string;
  journalContext?: string[];
  emotionalState?: string;
  symbolicContext?: SymbolicContext | null;
}

export class SYMBION {
  static async run(input: string, options: SYMBIONOptions = {}): Promise<SYMBIONResponse> {
    const element = this.detectElement(input, options.symbolicContext);
    const archetype = this.detectArchetype(input, options.symbolicContext);
    const voiceCharacteristics = this.getVoiceForArchetype(archetype, element);

    return {
      message: "I'm reflecting deeply with you. What's the deeper meaning here?",
      element,
      archetype,
      voiceCharacteristics,
      metadata: {
        spiralogicPhase: 'reflection',
        userName: options.userId || 'guest',
        symbols: options.symbolicContext?.recentSymbols || [],
        confidence: 0.7
      }
    };
  }

  private static detectElement(input: string, symbolicContext?: SYMBIONOptions['symbolicContext']): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('feel') || lowerInput.includes('emotion') || lowerInput.includes('heart')) {
      return 'water';
    }
    if (lowerInput.includes('think') || lowerInput.includes('idea') || lowerInput.includes('understand')) {
      return 'air';
    }
    if (lowerInput.includes('do') || lowerInput.includes('action') || lowerInput.includes('create')) {
      return 'fire';
    }
    if (lowerInput.includes('body') || lowerInput.includes('ground') || lowerInput.includes('physical')) {
      return 'earth';
    }

    if (symbolicContext?.elementalBalance) {
      const balance = symbolicContext.elementalBalance;
      const dominant = Object.entries(balance).reduce((max, [el, val]) => {
        const value = typeof val === 'number' ? val : 0;
        return value > max.value ? { element: el, value } : max;
      }, { element: 'aether', value: 0 });
      return dominant.element as 'fire' | 'water' | 'earth' | 'air' | 'aether';
    }

    return 'aether';
  }

  private static detectArchetype(input: string, symbolicContext?: SYMBIONOptions['symbolicContext']): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('guide') || lowerInput.includes('help') || lowerInput.includes('lost')) {
      return 'mentor';
    }
    if (lowerInput.includes('reflect') || lowerInput.includes('see') || lowerInput.includes('understand myself')) {
      return 'mirror';
    }
    if (lowerInput.includes('change') || lowerInput.includes('transform') || lowerInput.includes('stuck')) {
      return 'catalyst';
    }
    if (lowerInput.includes('wisdom') || lowerInput.includes('truth') || lowerInput.includes('know')) {
      return 'oracle';
    }

    if (symbolicContext?.currentArchetype) {
      return symbolicContext.currentArchetype;
    }

    return 'maia';
  }

  private static getVoiceForArchetype(archetype: string, element: string): { tone: string; pace: string; energy: string } {
    if (archetype === 'oracle') {
      return {
        tone: 'soothing',
        pace: 'slow',
        energy: 'warm'
      };
    }

    if (archetype === 'mentor') {
      return {
        tone: 'encouraging',
        pace: 'moderate',
        energy: 'uplifting'
      };
    }

    if (archetype === 'mirror') {
      return {
        tone: 'reflective',
        pace: 'slow',
        energy: 'soft'
      };
    }

    if (archetype === 'catalyst') {
      return {
        tone: 'motivational',
        pace: 'fast',
        energy: 'dynamic'
      };
    }

    if (element === 'water') return { tone: 'gentle', pace: 'slow', energy: 'soft' };
    if (element === 'fire') return { tone: 'uplifting', pace: 'fast', energy: 'expansive' };
    if (element === 'earth') return { tone: 'grounding', pace: 'moderate', energy: 'focused' };
    if (element === 'air') return { tone: 'clear', pace: 'moderate', energy: 'light' };

    return {
      tone: 'gentle',
      pace: 'moderate',
      energy: 'balanced'
    };
  }
}