// lib/agents/modules/FractalIntegration.ts
import { FractalContext, ElementalCurrent, SpiralVisit } from '../types/fractal';
import { PromptSelector } from '../utils/PromptSelector';

/**
 * Simplified Fractal Integration for PersonalOracleAgent
 * Bridges the existing agent with the fractal system
 */
export class FractalIntegration {
  private spiralMemory: Map<string, SpiralVisit[]> = new Map();
  private trustLevel: number = 50;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Build fractal context from user input and current state
   */
  buildContext(
    input: string,
    state: {
      isFirstTime?: boolean;
      trustLevel?: number;
      interactionCount?: number;
      momentState?: any;
    }
  ): FractalContext {
    // Detect active elements from input
    const activeCurrents = this.detectActiveCurrents(input);

    // Build basic context
    const context: FractalContext = {
      userId: this.userId,
      session: {
        isFirstTime: state.isFirstTime || state.interactionCount === 1,
        startTime: new Date()
      },
      activeCurrents,
      trustLevel: state.trustLevel || this.trustLevel,
      userExpression: input
    };

    // Check for spirals
    const spiral = this.detectSpiral(input);
    if (spiral) {
      context.spiral = spiral;
    }

    // Check for breakthroughs
    const breakthrough = this.detectBreakthrough(input);
    if (breakthrough) {
      context.breakthrough = breakthrough;
    }

    // Set breathing mode based on trust
    if (context.trustLevel < 30) {
      context.breathingMode = 'contraction';
    } else if (context.trustLevel < 50) {
      context.breathingMode = 'stabilization';
    } else if (context.trustLevel < 70) {
      context.breathingMode = 'expansion';
    } else {
      context.breathingMode = 'integration';
    }

    return context;
  }

  /**
   * Get the appropriate system prompt for the context
   */
  getSystemPrompt(context: FractalContext): string {
    return PromptSelector.selectBlended(context);
  }

  /**
   * Detect active elemental currents from input
   */
  private detectActiveCurrents(input: string): ElementalCurrent[] {
    const currents: ElementalCurrent[] = [];
    const lowerInput = input.toLowerCase();

    // Fire (transformation, passion, anger)
    if (/angry|frustrated|passionate|transform|burn|change|rebel/.test(lowerInput)) {
      currents.push({
        element: 'fire',
        intensity: this.calculateIntensity(input, 'fire')
      });
    }

    // Water (emotion, flow, grief)
    if (/sad|tears|grief|flow|emotional|feeling|cry|heart/.test(lowerInput)) {
      currents.push({
        element: 'water',
        intensity: this.calculateIntensity(input, 'water')
      });
    }

    // Earth (practical, grounded)
    if (/practical|plan|stable|ground|body|physical|step/.test(lowerInput)) {
      currents.push({
        element: 'earth',
        intensity: this.calculateIntensity(input, 'earth')
      });
    }

    // Air (mental, curious)
    if (/think|wonder|curious|perspective|idea|mind|question/.test(lowerInput)) {
      currents.push({
        element: 'air',
        intensity: this.calculateIntensity(input, 'air')
      });
    }

    // Aether (spiritual, integration)
    if (/soul|spirit|divine|sacred|meaning|purpose|whole/.test(lowerInput)) {
      currents.push({
        element: 'aether',
        intensity: this.calculateIntensity(input, 'aether')
      });
    }

    // Default to aether if nothing specific
    if (currents.length === 0) {
      currents.push({ element: 'aether', intensity: 30 });
    }

    return currents;
  }

  /**
   * Calculate intensity of an element
   */
  private calculateIntensity(input: string, element: string): number {
    const elementWords: Record<string, string[]> = {
      fire: ['angry', 'furious', 'burn', 'transform', 'passionate'],
      water: ['sad', 'tears', 'grief', 'flow', 'emotional', 'feeling'],
      earth: ['practical', 'plan', 'stable', 'ground', 'body'],
      air: ['think', 'wonder', 'curious', 'perspective', 'idea'],
      aether: ['soul', 'spirit', 'divine', 'sacred', 'meaning']
    };

    const words = elementWords[element] || [];
    const lowerInput = input.toLowerCase();

    let intensity = 30; // Base

    // Count matches
    const matches = words.filter(w => lowerInput.includes(w)).length;
    intensity += matches * 15;

    // Check emphasis
    if (input.includes('!')) intensity += 10;
    if (input === input.toUpperCase() && input.length > 5) intensity += 20;

    return Math.min(100, intensity);
  }

  /**
   * Detect spiral patterns
   */
  private detectSpiral(input: string): any {
    const indicators = ['again', 'back to', 'same old', 'keep coming back'];
    const lowerInput = input.toLowerCase();

    const isSpiral = indicators.some(ind => lowerInput.includes(ind));
    if (!isSpiral) return null;

    // Simple theme extraction
    const theme = this.extractTheme(input);

    // Update spiral memory
    if (!this.spiralMemory.has(theme)) {
      this.spiralMemory.set(theme, []);
    }

    const visits = this.spiralMemory.get(theme)!;
    visits.push({
      timestamp: new Date(),
      newWisdom: '',
      emotionalTone: []
    });

    return {
      theme,
      spiralCount: visits.length + 1,
      isRegression: false,
      visits
    };
  }

  /**
   * Detect breakthrough moments
   */
  private detectBreakthrough(input: string): any {
    const indicators = ['realize', 'understand now', 'breakthrough', 'aha', 'finally'];
    const lowerInput = input.toLowerCase();

    const isBreakthrough = indicators.some(ind => lowerInput.includes(ind));
    if (!isBreakthrough) return null;

    return {
      isActive: true,
      phrase: input.slice(0, 100),
      context: 'User breakthrough',
      timestamp: new Date()
    };
  }

  /**
   * Extract theme from input
   */
  private extractTheme(input: string): string {
    const themes = ['abandonment', 'trust', 'love', 'fear', 'relationship', 'work'];
    const lowerInput = input.toLowerCase();

    for (const theme of themes) {
      if (lowerInput.includes(theme)) {
        return theme;
      }
    }

    return 'unnamed pattern';
  }

  /**
   * Update trust level
   */
  updateTrust(delta: number) {
    this.trustLevel = Math.max(0, Math.min(100, this.trustLevel + delta));
  }
}