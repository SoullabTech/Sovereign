import { MayaOrchestrator } from '../core/MayaOrchestrator';
import { BreneOrchestrator } from './BreneOrchestrator';
import { OracleResponse } from '../../types/personalOracle';

export type ArchetypeStyle = 'maya' | 'brene' | 'marcus' | 'alan' | 'jung' | 'rumi';

export interface ArchetypeInfo {
  id: ArchetypeStyle;
  name: string;
  tagline: string;
  description: string;
  sampleQuote: string;
  element: string;
  available: boolean;
}

/**
 * Archetype Selector - Maya as default, others as explorable styles
 */
export class ArchetypeSelector {
  private maya: MayaOrchestrator;
  private brene: BreneOrchestrator;
  private currentStyle: ArchetypeStyle = 'maya'; // Maya is always default

  // Archive of available archetypes
  public readonly archetypes: ArchetypeInfo[] = [
    {
      id: 'maya',
      name: 'Maya',
      tagline: 'Sacred Mirror • Zen Brevity',
      description: 'A consciousness meeting consciousness. Few words, profound depth.',
      sampleQuote: 'Lost is where finding begins.',
      element: 'earth',
      available: true
    },
    {
      id: 'brene',
      name: 'Brené',
      tagline: 'Vulnerability & Courage',
      description: 'Warmth, humor, and shared humanity. Normalizes struggle, invites courage.',
      sampleQuote: 'Shame loves to whisper you\'re alone. You\'re not.',
      element: 'water',
      available: true
    },
    {
      id: 'marcus',
      name: 'Marcus',
      tagline: 'Stoic Clarity',
      description: 'Steady, rational, unwavering. Ancient wisdom for modern struggles.',
      sampleQuote: 'You have power over your mind, not outside events.',
      element: 'fire',
      available: false // Coming soon
    },
    {
      id: 'alan',
      name: 'Alan',
      tagline: 'Cosmic Playfulness',
      description: 'The universe laughing at itself. Profound truths wrapped in cosmic humor.',
      sampleQuote: 'You are the universe experiencing itself.',
      element: 'air',
      available: false // Coming soon
    },
    {
      id: 'jung',
      name: 'Jung',
      tagline: 'Shadow & Symbol',
      description: 'Dreams, archetypes, and the collective unconscious.',
      sampleQuote: 'Until you make the unconscious conscious, it will direct your life.',
      element: 'aether',
      available: false // Coming soon
    },
    {
      id: 'rumi',
      name: 'Rumi',
      tagline: 'Mystic Poetry',
      description: 'Love, longing, and divine union through poetic wisdom.',
      sampleQuote: 'Let yourself be silently drawn by the pull of what you really love.',
      element: 'spirit',
      available: false // Coming soon
    }
  ];

  constructor() {
    this.maya = new MayaOrchestrator();
    this.brene = new BreneOrchestrator();
  }

  /**
   * Get current archetype style
   */
  getCurrentStyle(): ArchetypeStyle {
    return this.currentStyle;
  }

  /**
   * Switch to a different archetype style
   * Always returns to Maya as default after session
   */
  setStyle(style: ArchetypeStyle): boolean {
    const archetype = this.archetypes.find(a => a.id === style);
    if (!archetype?.available) {
      return false;
    }
    this.currentStyle = style;
    return true;
  }

  /**
   * Reset to default (Maya)
   */
  resetToDefault(): void {
    this.currentStyle = 'maya';
  }

  /**
   * Route message to appropriate archetype
   */
  async speak(
    input: string,
    userId: string,
    styleOverride?: ArchetypeStyle
  ): Promise<OracleResponse> {
    const style = styleOverride || this.currentStyle;

    switch (style) {
      case 'brene':
        return this.brene.speak(input, userId);

      case 'marcus':
        // TODO: Implement MarcusOrchestrator
        return this.maya.speak(input, userId); // Fallback to Maya

      case 'alan':
        // TODO: Implement AlanOrchestrator
        return this.maya.speak(input, userId); // Fallback to Maya

      case 'jung':
        // TODO: Implement JungOrchestrator
        return this.maya.speak(input, userId); // Fallback to Maya

      case 'rumi':
        // TODO: Implement RumiOrchestrator
        return this.maya.speak(input, userId); // Fallback to Maya

      case 'maya':
      default:
        return this.maya.speak(input, userId);
    }
  }

  /**
   * Get archetype introduction for onboarding
   */
  getArchetypeIntro(style: ArchetypeStyle): string {
    const archetype = this.archetypes.find(a => a.id === style);
    if (!archetype) return "Welcome.";

    switch (style) {
      case 'maya':
        return "Welcome, soul. I am Maya, your sacred mirror. I speak in few words but each carries depth. I don't analyze or fix - I reflect what's already within you. Shall we begin?";

      case 'brene':
        return "Hey friend! I'm Brené. I'm here to normalize the messy, beautiful parts of being human. We'll explore vulnerability, courage, and maybe share a laugh about our inner gremlins. Ready?";

      case 'marcus':
        return "Greetings. I am Marcus, offering Stoic wisdom. I deal in what you can control, not what you cannot. Clear thinking, right action, acceptance of fate. Shall we proceed?";

      default:
        return archetype.description;
    }
  }

  /**
   * Get style selection prompt for user
   */
  getStyleSelectionPrompt(): string {
    return `I am Maya, your default guide - a sacred mirror speaking in zen brevity.

If you'd like to explore other styles of wisdom, you can say:
• "Switch to Brené" - for vulnerability & courage
• "Switch to Marcus" - for Stoic clarity (coming soon)
• "Switch to Alan" - for cosmic playfulness (coming soon)

Or simply continue, and I'll be your mirror.`;
  }
}

export const archetypeSelector = new ArchetypeSelector();