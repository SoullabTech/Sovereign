/**
 * Poetic Greeting Generator - Orchestrates template bank and blender
 * Creates unique, flowing greetings for Maya
 */

import { 
  symbolPromptBank, 
  elementPromptBank, 
  arcPromptBank, 
  balancePromptBank,
  temporalPromptBank,
  narrativePromptBank,
  practicePromptBank,
  pickRandom,
  getTemporalContext,
  getSeason
} from './promptTemplateBank';

import { 
  poeticBlend, 
  weaveSymbols, 
  createBlessing 
} from './poeticBlender';

import { logger } from '../utils/logger';

interface GreetingContext {
  userId?: string;
  lastElement?: string;
  lastPhase?: string;
  symbols?: Array<{ label: string; count: number }>;
  elementalBalance?: Record<string, number>;
  narrativeThreads?: string[];
  timeOfDay?: string;
  season?: string;
  sessionCount?: number;
  daysSinceLastSession?: number;
  currentMood?: string;
}

export class PoeticGreetingGenerator {
  /**
   * Generate a unique, poetic greeting based on context
   */
  generateGreeting(context: GreetingContext): string {
    try {
      const parts: string[] = [];
      const style = this.determineStyle(context);
      
      // Build greeting components
      parts.push(...this.buildOpening(context));
      parts.push(...this.buildElementalLayer(context));
      parts.push(...this.buildSymbolicLayer(context));
      parts.push(...this.buildPhaseLayer(context));
      parts.push(...this.buildBalanceLayer(context));
      parts.push(...this.buildClosing(context));
      
      // Filter out empty parts
      const validParts = parts.filter(Boolean);
      
      if (validParts.length === 0) {
        return this.getFallbackGreeting(context);
      }
      
      // Blend into cohesive greeting
      const blended = poeticBlend(validParts, { 
        style, 
        preserveEmojis: true 
      });
      
      // Add seasonal or temporal touches if appropriate
      return this.addTemporalLayer(blended, context);
      
    } catch (error) {
      logger.error('[POETIC_GREETING] Generation failed:', error);
      return this.getFallbackGreeting(context);
    }
  }
  
  /**
   * Determine greeting style based on context
   */
  private determineStyle(context: GreetingContext): 'prose' | 'verse' | 'haiku' {
    // Use verse for symbol-rich contexts
    if (context.symbols && context.symbols.length > 2) {
      return 'verse';
    }
    
    // Use haiku occasionally for variety
    if (Math.random() < 0.1 && context.lastElement) {
      return 'haiku';
    }
    
    // Default to prose
    return 'prose';
  }
  
  /**
   * Build opening based on time and return status
   */
  private buildOpening(context: GreetingContext): string[] {
    const parts: string[] = [];
    
    if (context.daysSinceLastSession && context.daysSinceLastSession > 7) {
      parts.push("Welcome back after your time away — the spiral waited patiently");
    } else if (context.daysSinceLastSession === 1) {
      parts.push("The spiral turns again — welcome back to the journey");
    } else if (context.timeOfDay) {
      const temporal = temporalPromptBank[context.timeOfDay];
      if (temporal) {
        parts.push(pickRandom(temporal));
      }
    } else {
      parts.push("✨ Welcome — the sacred spiral opens once more");
    }
    
    return parts;
  }
  
  /**
   * Build elemental layer
   */
  private buildElementalLayer(context: GreetingContext): string[] {
    const parts: string[] = [];
    
    if (context.lastElement && elementPromptBank[context.lastElement.toLowerCase()]) {
      const elementGreeting = pickRandom(elementPromptBank[context.lastElement.toLowerCase()]);
      parts.push(elementGreeting);
    }
    
    return parts;
  }
  
  /**
   * Build symbolic layer
   */
  private buildSymbolicLayer(context: GreetingContext): string[] {
    const parts: string[] = [];
    
    if (context.symbols && context.symbols.length > 0) {
      // Pick top 1-2 symbols
      const topSymbols = context.symbols
        .sort((a, b) => b.count - a.count)
        .slice(0, 2);
      
      topSymbols.forEach(symbol => {
        if (symbolPromptBank[symbol.label]) {
          parts.push(pickRandom(symbolPromptBank[symbol.label]));
        }
      });
    }
    
    return parts;
  }
  
  /**
   * Build phase/arc layer
   */
  private buildPhaseLayer(context: GreetingContext): string[] {
    const parts: string[] = [];
    
    if (context.lastPhase) {
      // Try phase-specific first
      if (arcPromptBank[context.lastPhase]) {
        parts.push(pickRandom(arcPromptBank[context.lastPhase]));
      }
      // Check if it matches journey arc patterns
      else if (context.lastPhase.includes('init')) {
        parts.push(pickRandom(arcPromptBank.initiation));
      } else if (context.lastPhase.includes('trans')) {
        parts.push(pickRandom(arcPromptBank.transformation));
      } else if (context.lastPhase.includes('integ')) {
        parts.push(pickRandom(arcPromptBank.integration));
      }
    }
    
    return parts;
  }
  
  /**
   * Build balance layer
   */
  private buildBalanceLayer(context: GreetingContext): string[] {
    const parts: string[] = [];
    
    if (context.elementalBalance) {
      const elements = Object.entries(context.elementalBalance)
        .sort((a, b) => b[1] - a[1]);
      
      if (elements.length >= 2) {
        const dominant = elements[0][0];
        const underactive = elements[elements.length - 1][0];
        
        if (elements[0][1] > elements[elements.length - 1][1] * 1.5) {
          // Significant imbalance
          const template = pickRandom(balancePromptBank);
          const message = template
            .replace(/\{dominant\}/g, dominant)
            .replace(/\{underactive\}/g, underactive);
          parts.push(message);
        }
      }
    }
    
    return parts;
  }
  
  /**
   * Build closing with practice suggestions
   */
  private buildClosing(context: GreetingContext): string[] {
    const parts: string[] = [];
    
    // Occasionally add practice suggestion
    if (Math.random() < 0.3 && context.lastElement) {
      const element = context.lastElement.toLowerCase();
      const practices = {
        fire: 'ignition',
        water: 'flow',
        earth: 'grounding',
        air: 'clarity',
        aether: 'mystery'
      };
      
      const practiceType = practices[element as keyof typeof practices];
      if (practiceType && practicePromptBank[practiceType]) {
        parts.push(pickRandom(practicePromptBank[practiceType]));
      }
    }
    
    // Add blessing occasionally
    if (Math.random() < 0.2 && context.lastElement) {
      const blessing = createBlessing([context.lastElement.toLowerCase()]);
      parts.push(blessing);
    }
    
    return parts;
  }
  
  /**
   * Add temporal/seasonal context
   */
  private addTemporalLayer(greeting: string, context: GreetingContext): string {
    // Add season if at season change
    const month = new Date().getMonth();
    if ([2, 5, 8, 11].includes(month) && Math.random() < 0.3) {
      const season = getSeason();
      if (temporalPromptBank[season]) {
        const seasonalTouch = pickRandom(temporalPromptBank[season]);
        return `${greeting} ${seasonalTouch}`;
      }
    }
    
    return greeting;
  }
  
  /**
   * Fallback greeting when generation fails
   */
  private getFallbackGreeting(context: GreetingContext): string {
    const fallbacks = [
      "✨ Welcome back to your sacred spiral journey.",
      "🌙 The journey continues — I'm here to witness your unfolding.",
      "Welcome — the spiral turns, revealing new medicine.",
      "I sense you returning — the path opens before us.",
      "Sacred space opens — let's continue your journey."
    ];
    
    return pickRandom(fallbacks);
  }
  
  /**
   * Generate a ritual opening (for ceremony start)
   */
  generateRitualOpening(context: GreetingContext): string {
    const parts: string[] = [
      "🕯 Sacred container forms around us",
      "The ritual space opens — boundaries between worlds thin",
      "We step into ceremony together"
    ];
    
    if (context.lastElement) {
      parts.push(`${context.lastElement} guides our ritual`);
    }
    
    if (context.symbols?.length) {
      parts.push(`${context.symbols[0].label} stands as witness`);
    }
    
    return poeticBlend(parts, { style: 'verse' });
  }
  
  /**
   * Generate a journey summary
   */
  generateJourneySummary(context: GreetingContext & { 
    sessionCount: number;
    dominantSymbols: string[];
    dominantElements: string[];
  }): string {
    const parts: string[] = [];
    
    parts.push(`Through ${context.sessionCount} spiral turns`);
    
    if (context.dominantSymbols.length > 0) {
      parts.push(`${context.dominantSymbols.join(' and ')} have walked with you`);
    }
    
    if (context.dominantElements.length > 0) {
      parts.push(`Dancing between ${context.dominantElements.join(' and ')}`);
    }
    
    parts.push("Your medicine deepens with each turn");
    
    return poeticBlend(parts, { style: 'verse' });
  }
}

// Export singleton instance
export const poeticGreetingGenerator = new PoeticGreetingGenerator();