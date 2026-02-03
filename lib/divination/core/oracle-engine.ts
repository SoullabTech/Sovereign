/**
 * Unified Oracle Engine
 * Integrates I Ching, Tarot, and Runes into a cohesive divination system
 */

import {
  OracleReading,
  IChingReading,
  TarotReading,
  RuneReading,
  ElementalSignature,
  DivinationRitual,
  Hexagram,
  TarotCard,
  Rune,
  DailyOracleGuidance
} from './types';

// Import from each system
import { castIChing, getDailyHexagram, getHexagram } from '../iching';
import { performReading as performTarotReading, dailyDraw as tarotDailyDraw, getDailyCard } from '../tarot';
import { castRunes, dailyRuneDraw, getDailyRune } from '../runes';

/**
 * Oracle types supported
 */
export type OracleType = 'iching' | 'tarot' | 'runes';

/**
 * Unified Oracle Reading combining all systems
 */
export interface UnifiedReading {
  query: string;
  timestamp: Date;
  iching: IChingReading;
  tarot: TarotReading;
  runes: RuneReading;
  synthesis: string;
  elementalBalance: ElementalSignature;
  combinedRitual: DivinationRitual;
  soulMessage: string;
}

/**
 * The Divination Oracle class
 * Central interface for all oracle systems
 */
export class DivinationOracle {
  /**
   * Cast the I Ching
   */
  castIChing(query: string, method: 'yarrow' | 'coins' = 'coins'): IChingReading {
    return castIChing(query, method);
  }

  /**
   * Draw Tarot cards
   */
  drawTarot(query: string, spreadKey: string = 'three-card', allowReversals: boolean = true): TarotReading {
    return performTarotReading(query, spreadKey, allowReversals);
  }

  /**
   * Cast the Runes
   */
  castRunes(query: string, spreadKey: string = 'norns', allowReversals: boolean = true): RuneReading {
    return castRunes(query, spreadKey, allowReversals);
  }

  /**
   * Get a unified reading from all three systems
   */
  getUnifiedReading(query: string): UnifiedReading {
    const iching = this.castIChing(query, 'coins');
    const tarot = this.drawTarot(query, 'three-card');
    const runes = this.castRunes(query, 'norns');

    // Combine elemental balances
    const elementalBalance = this.combineElementalBalances(
      iching.primaryHexagram.elementalResonance,
      this.calculateTarotElemental(tarot),
      this.calculateRuneElemental(runes)
    );

    // Generate synthesis
    const synthesis = this.synthesizeReadings(iching, tarot, runes);

    // Create combined ritual
    const combinedRitual = this.createCombinedRitual(iching, tarot, runes);

    // Generate soul message
    const soulMessage = this.generateSoulMessage(iching, tarot, runes);

    return {
      query,
      timestamp: new Date(),
      iching,
      tarot,
      runes,
      synthesis,
      elementalBalance,
      combinedRitual,
      soulMessage
    };
  }

  /**
   * Get daily guidance from all systems
   */
  getDailyGuidance(date: Date = new Date()): DailyOracleGuidance {
    const hexagram = getDailyHexagram(date);
    const card = getDailyCard(date);
    const rune = getDailyRune(date);

    const elementalBalance = this.combineElementalBalances(
      hexagram.elementalResonance,
      { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 }, // Neutral baseline
      rune.elementalResonance || { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 }
    );

    return {
      date,
      hexagram,
      card,
      rune,
      combinedInsight: this.generateDailyInsight(hexagram, card, rune),
      elementalTheme: this.getDominantElement(elementalBalance),
      recommendedFocus: this.generateDailyFocus(hexagram, card, rune),
      ritual: this.createDailyRitual(hexagram, card, rune)
    };
  }

  /**
   * Get a quick single-symbol reading from any system
   */
  quickReading(system: OracleType): IChingReading | TarotReading | RuneReading {
    switch (system) {
      case 'iching':
        return this.castIChing('Quick guidance');
      case 'tarot':
        return this.drawTarot('Quick guidance', 'single');
      case 'runes':
        return this.castRunes('Quick guidance', 'single');
    }
  }

  /**
   * Get elemental recommendations based on current balance
   */
  getElementalRecommendation(balance: ElementalSignature): {
    deficient: string[];
    excess: string[];
    recommendation: string;
  } {
    const elements = Object.entries(balance) as [string, number][];
    elements.sort((a, b) => a[1] - b[1]);

    const deficient = elements.slice(0, 2).filter(e => e[1] < 0.15).map(e => e[0]);
    const excess = elements.slice(-2).filter(e => e[1] > 0.35).map(e => e[0]);

    const recommendations: Record<string, string> = {
      fire: 'Cultivate passion through creative expression, physical movement, or decisive action.',
      water: 'Nurture emotional flow through journaling, water rituals, or deep conversation.',
      earth: 'Ground yourself through nature walks, practical tasks, or body-based practices.',
      air: 'Stimulate mental clarity through study, meditation, or mindful breathing.',
      aether: 'Connect with spirit through prayer, sacred ritual, or contemplative silence.'
    };

    let recommendation = '';
    if (deficient.length > 0) {
      recommendation += `Strengthen ${deficient.join(' and ')}: ${deficient.map(e => recommendations[e]).join(' ')}`;
    }
    if (excess.length > 0 && deficient.length > 0) {
      recommendation += '\n\n';
    }
    if (excess.length > 0) {
      recommendation += `Balance excess ${excess.join(' and ')} by allowing space for other elements.`;
    }

    if (!recommendation) {
      recommendation = 'Your elemental energies are well balanced. Maintain this harmony through continued awareness.';
    }

    return { deficient, excess, recommendation };
  }

  // Private helper methods

  private combineElementalBalances(
    iching: ElementalSignature,
    tarot: ElementalSignature,
    runes: ElementalSignature
  ): ElementalSignature {
    return {
      fire: (iching.fire + tarot.fire + runes.fire) / 3,
      water: (iching.water + tarot.water + runes.water) / 3,
      earth: (iching.earth + tarot.earth + runes.earth) / 3,
      air: (iching.air + tarot.air + runes.air) / 3,
      aether: (iching.aether + tarot.aether + runes.aether) / 3
    };
  }

  private calculateTarotElemental(reading: TarotReading): ElementalSignature {
    const balance: ElementalSignature = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    for (const { card } of reading.drawnCards) {
      const weight = 1 / reading.drawnCards.length;
      switch (card.element) {
        case 'fire': balance.fire += weight; break;
        case 'water': balance.water += weight; break;
        case 'earth': balance.earth += weight; break;
        case 'air': balance.air += weight; break;
        case 'aether': balance.aether += weight; break;
      }
    }

    return balance;
  }

  private calculateRuneElemental(reading: RuneReading): ElementalSignature {
    const balance: ElementalSignature = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    for (const { rune } of reading.drawnRunes) {
      if (rune.elementalResonance) {
        const weight = 1 / reading.drawnRunes.length;
        balance.fire += rune.elementalResonance.fire * weight;
        balance.water += rune.elementalResonance.water * weight;
        balance.earth += rune.elementalResonance.earth * weight;
        balance.air += rune.elementalResonance.air * weight;
        balance.aether += rune.elementalResonance.aether * weight;
      }
    }

    return balance;
  }

  private getDominantElement(balance: ElementalSignature): string {
    const elements = Object.entries(balance) as [string, number][];
    elements.sort((a, b) => b[1] - a[1]);
    return elements[0][0];
  }

  private synthesizeReadings(
    iching: IChingReading,
    tarot: TarotReading,
    runes: RuneReading
  ): string {
    const hexagram = iching.primaryHexagram;
    const cards = tarot.drawnCards;
    const drawnRunes = runes.drawnRunes;

    let synthesis = `## Unified Oracle Synthesis\n\n`;

    synthesis += `**I Ching - ${hexagram.englishName} (${hexagram.name})**\n`;
    synthesis += `${hexagram.keyword}: ${hexagram.soulInterpretation}\n\n`;

    synthesis += `**Tarot - ${tarot.spread.name}**\n`;
    cards.forEach(({ card, position, isReversed }) => {
      synthesis += `- ${position.name}: ${card.name}${isReversed ? ' (Reversed)' : ''}\n`;
    });
    synthesis += '\n';

    synthesis += `**Runes - ${runes.spread.name}**\n`;
    drawnRunes.forEach(({ rune, position, isReversed }) => {
      synthesis += `- ${position.name}: ${rune.symbol} ${rune.name}${isReversed ? ' (Merkstave)' : ''}\n`;
    });
    synthesis += '\n';

    // Find common themes
    synthesis += `**Convergent Themes**\n`;
    synthesis += this.findConvergentThemes(hexagram, cards.map(c => c.card), drawnRunes.map(r => r.rune));

    return synthesis;
  }

  private findConvergentThemes(
    hexagram: Hexagram,
    cards: TarotCard[],
    runes: Rune[]
  ): string {
    const themes: string[] = [];

    // Check for transformation themes
    const transformationKeywords = ['change', 'transformation', 'death', 'rebirth', 'evolution'];
    const hasTransformation =
      transformationKeywords.some(k => hexagram.keyword.toLowerCase().includes(k)) ||
      cards.some(c => c.keywords.some(k => transformationKeywords.includes(k.toLowerCase()))) ||
      runes.some(r => r.keywords.some(k => transformationKeywords.includes(k.toLowerCase())));

    if (hasTransformation) {
      themes.push('**Transformation** is a central theme across all systems. A significant shift is occurring or needed.');
    }

    // Check for stability themes
    const stabilityKeywords = ['stability', 'foundation', 'earth', 'grounding', 'patience'];
    const hasStability =
      stabilityKeywords.some(k => hexagram.keyword.toLowerCase().includes(k)) ||
      cards.some(c => c.keywords.some(k => stabilityKeywords.includes(k.toLowerCase()))) ||
      runes.some(r => r.keywords.some(k => stabilityKeywords.includes(k.toLowerCase())));

    if (hasStability) {
      themes.push('**Stability** emerges as a theme. Build on solid foundations; patience brings reward.');
    }

    // Check for communication themes
    const commKeywords = ['communication', 'word', 'truth', 'speech', 'wisdom'];
    const hasComm =
      runes.some(r => r.name === 'Ansuz' || r.name === 'Mannaz') ||
      cards.some(c => c.name.includes('Ace of Swords') || c.name === 'The Magician');

    if (hasComm) {
      themes.push('**Communication** is highlighted. Words have power now; speak your truth clearly.');
    }

    if (themes.length === 0) {
      themes.push('The oracles speak in unique voices today. Sit with each message individually, then let them weave together in your contemplation.');
    }

    return themes.join('\n\n');
  }

  private generateSoulMessage(
    iching: IChingReading,
    tarot: TarotReading,
    runes: RuneReading
  ): string {
    const hexagram = iching.primaryHexagram;
    const firstCard = tarot.drawnCards[0].card;
    const firstRune = runes.drawnRunes[0].rune;

    return `The oracle speaks through three voices that are one.

${hexagram.englishName} whispers of ${hexagram.keyword.toLowerCase()}—${hexagram.guidance.split('.')[0].toLowerCase()}.

${firstCard.name} illuminates the path—${firstCard.soulGuidance.split('.')[0].toLowerCase()}.

${firstRune.name} (${firstRune.symbol}) anchors the message—${firstRune.soulGuidance.split('.')[0].toLowerCase()}.

Trust what resonates. Release what does not serve. The oracle reflects your own deep knowing back to you.`;
  }

  private createCombinedRitual(
    iching: IChingReading,
    tarot: TarotReading,
    runes: RuneReading
  ): DivinationRitual {
    const hexagram = iching.primaryHexagram;
    const card = tarot.drawnCards[0].card;
    const rune = runes.drawnRunes[0].rune;

    return {
      name: 'Unified Oracle Integration',
      duration: 45,
      materials: [
        'Journal and pen',
        `Image or drawn symbol of Hexagram ${hexagram.number}`,
        `Your ${card.name} tarot card (or drawn image)`,
        `${rune.name} (${rune.symbol}) rune (stone, drawn, or carved)`,
        'Three candles (one for each system)',
        'Comfortable meditation space'
      ],
      steps: [
        'Create sacred space and light the three candles in a triangle.',
        `Place the I Ching hexagram to the east, symbolizing ${hexagram.englishName}.`,
        `Place ${card.name} to the south, representing your illuminated path.`,
        `Place ${rune.name} to the west, grounding the ancestral wisdom.`,
        'Sit in the center of the triangle and close your eyes.',
        'Breathe deeply and ask each oracle in turn what it wishes you to know.',
        'Allow 5-10 minutes of silent contemplation.',
        'Open your eyes and journal any insights, images, or messages received.',
        'Thank each oracle system and extinguish the candles mindfully.',
        'Carry one symbol with you today as a reminder.'
      ],
      intention: `Integrate the unified wisdom of ${hexagram.englishName}, ${card.name}, and ${rune.name}`,
      bestTiming: 'Dawn or dusk, when the worlds meet',
      element: this.getDominantElement(hexagram.elementalResonance) as any,
      archetype: `${hexagram.archetypeCorrespondence} / ${card.name} / ${rune.name}`
    };
  }

  private generateDailyInsight(hexagram: Hexagram, card: TarotCard, rune: Rune): string {
    return `Today's guidance weaves together:

**${hexagram.englishName}** (${hexagram.name}) — ${hexagram.keyword}
${hexagram.soulInterpretation.split('.')[0]}.

**${card.name}** — ${card.keywords.slice(0, 3).join(', ')}
${card.soulGuidance.split('.')[0]}.

**${rune.symbol} ${rune.name}** — ${rune.meaning}
${rune.soulGuidance.split('.')[0]}.

Let these three voices guide your day.`;
  }

  private generateDailyFocus(hexagram: Hexagram, card: TarotCard, rune: Rune): string {
    // Find common thread
    const allKeywords = [
      hexagram.keyword,
      ...card.keywords,
      ...rune.keywords
    ].map(k => k.toLowerCase());

    // Simple frequency analysis
    const freq: Record<string, number> = {};
    allKeywords.forEach(k => {
      const words = k.split(/\s+/);
      words.forEach(w => {
        if (w.length > 3) {
          freq[w] = (freq[w] || 0) + 1;
        }
      });
    });

    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    if (topWords.length > 0) {
      return `Focus today on: ${topWords.join(', ')}`;
    }

    return `Focus today on: presence, awareness, and receptivity to guidance`;
  }

  private createDailyRitual(hexagram: Hexagram, card: TarotCard, rune: Rune): DivinationRitual {
    return {
      name: 'Daily Oracle Alignment',
      duration: 15,
      materials: [
        'Your daily oracle cards/symbols (optional)',
        'Journal',
        'Single candle'
      ],
      steps: [
        'Light the candle and take three centering breaths.',
        `Speak aloud: "Today I align with ${hexagram.englishName}."`,
        `Visualize ${card.name} and its energy flowing through you.`,
        `Trace ${rune.symbol} in the air and intone "${rune.name}" three times.`,
        'Set one intention for the day based on the combined guidance.',
        'Write your intention in your journal.',
        'Carry the day\'s wisdom with you.'
      ],
      intention: 'Align with the day\'s oracle guidance',
      bestTiming: 'Morning',
      element: hexagram.elementalResonance.fire > 0.3 ? 'fire' :
               hexagram.elementalResonance.water > 0.3 ? 'water' :
               hexagram.elementalResonance.earth > 0.3 ? 'earth' :
               hexagram.elementalResonance.air > 0.3 ? 'air' : 'aether',
      archetype: `${hexagram.archetypeCorrespondence}`
    };
  }
}

/**
 * Default oracle instance
 */
export const oracle = new DivinationOracle();

/**
 * Convenience exports for direct usage
 */
export const {
  castIChing: consultIChing,
  drawTarot: consultTarot,
  castRunes: consultRunes,
  getUnifiedReading: getUnifiedOracleReading,
  getDailyGuidance: getDailyOracleGuidance,
  quickReading: getQuickReading,
  getElementalRecommendation
} = oracle;

export default oracle;
