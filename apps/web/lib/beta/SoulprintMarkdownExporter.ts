/**
 * Soulprint Markdown Exporter
 * Generates beautiful Obsidian-compatible markdown from soulprint data
 */

import { Soulprint } from './SoulprintTracking';

const ELEMENT_EMOJI = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '🌬️',
  aether: '✨'
};

const MILESTONE_EMOJI = {
  breakthrough: '🌟',
  threshold: '🚪',
  integration: '🔗',
  'shadow-encounter': '🌑',
  awakening: '☀️'
};

export class SoulprintMarkdownExporter {

  /**
   * Generate complete Obsidian markdown for a soulprint
   */
  static generateMarkdown(soulprint: Soulprint): string {
    const sections = [
      this.generateFrontmatter(soulprint),
      this.generateHeader(soulprint),
      this.generateElementalBalance(soulprint),
      this.generateActiveSymbols(soulprint),
      this.generateJourneyMilestones(soulprint),
      this.generateEmotionalLandscape(soulprint),
      this.generateAlerts(soulprint),
      this.generateNarrativeThreads(soulprint),
      this.generateArchetypalJourney(soulprint),
      this.generateFooter()
    ];

    return sections.filter(s => s).join('\n\n');
  }

  /**
   * Generate YAML frontmatter for Obsidian
   */
  private static generateFrontmatter(soulprint: Soulprint): string {
    const journeyDays = Math.floor(
      (Date.now() - soulprint.created.getTime()) / (1000 * 60 * 60 * 24)
    );

    const archetypesActive = soulprint.currentArchetype
      ? [soulprint.currentArchetype]
      : [];

    if (soulprint.archetypeHistory.length > 0) {
      const recentArchetypes = soulprint.archetypeHistory
        .slice(-3)
        .map(a => a.toArchetype)
        .filter(a => a && !archetypesActive.includes(a));
      archetypesActive.push(...recentArchetypes);
    }

    const elementalBalanceStr = `{fire: ${soulprint.elementalBalance.fire.toFixed(2)}, water: ${soulprint.elementalBalance.water.toFixed(2)}, earth: ${soulprint.elementalBalance.earth.toFixed(2)}, air: ${soulprint.elementalBalance.air.toFixed(2)}, aether: ${soulprint.elementalBalance.aether.toFixed(2)}}`;

    return `---
type: soulprint
userId: ${soulprint.userId}
userName: ${soulprint.userName || 'Unknown'}
created: ${soulprint.created.toISOString().split('T')[0]}
lastUpdated: ${soulprint.lastUpdated.toISOString().split('T')[0]}
journeyDuration: ${journeyDays} days
spiralogicPhase: ${soulprint.currentPhase}
archetypesActive: [${archetypesActive.join(', ')}]
currentArchetype: ${soulprint.currentArchetype || 'none'}
elementalBalance: ${elementalBalanceStr}
dominantElement: ${soulprint.elementalBalance.dominant || 'balanced'}
deficientElement: ${soulprint.elementalBalance.deficient || 'none'}
shadowIntegration: ${(soulprint.shadowIntegrationScore * 100).toFixed(0)}%
symbolCount: ${soulprint.activeSymbols.length}
milestoneCount: ${soulprint.milestones.length}
tags: [maia, soulprint, ${soulprint.currentPhase}, ${soulprint.elementalBalance.dominant}]
---`;
  }

  /**
   * Generate header section
   */
  private static generateHeader(soulprint: Soulprint): string {
    const journeyDays = Math.floor(
      (Date.now() - soulprint.created.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `# Soul Journey: ${soulprint.userName || soulprint.userId}

**Created:** ${this.formatDate(soulprint.created)}
**Journey Duration:** ${journeyDays} days
**Current Phase:** 🌀 ${this.capitalize(soulprint.currentPhase)}
**Active Archetype:** ${soulprint.currentArchetype ? `🎭 ${soulprint.currentArchetype}` : '—'}
**Shadow Integration:** 🌗 ${(soulprint.shadowIntegrationScore * 100).toFixed(0)}%`;
  }

  /**
   * Generate elemental balance visualization
   */
  private static generateElementalBalance(soulprint: Soulprint): string {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];

    let section = `## ⚖️ Elemental Balance\n\n`;

    elements.forEach(element => {
      const value = soulprint.elementalBalance[element as keyof typeof soulprint.elementalBalance] as number;
      const percentage = (value * 100).toFixed(0);
      const bars = this.generateProgressBar(value);
      const emoji = ELEMENT_EMOJI[element as keyof typeof ELEMENT_EMOJI];

      section += `${emoji} **${this.capitalize(element)}**: ${bars} ${percentage}%\n`;
    });

    const dominant = soulprint.elementalBalance.dominant;
    const deficient = soulprint.elementalBalance.deficient;

    section += `\n**Dominant:** ${this.capitalize(dominant || 'balanced')} `;
    section += this.getElementDescription(dominant);
    section += `\n**Deficient:** ${this.capitalize(deficient || 'none')} `;
    section += deficient ? this.getElementDescription(deficient) : '—';

    return section;
  }

  /**
   * Generate active symbols section
   */
  private static generateActiveSymbols(soulprint: Soulprint): string {
    if (soulprint.activeSymbols.length === 0) {
      return `## 🔮 Active Symbols\n\n*No symbols tracked yet*`;
    }

    let section = `## 🔮 Active Symbols\n`;

    // Sort by frequency
    const sortedSymbols = [...soulprint.activeSymbols].sort((a, b) => b.frequency - a.frequency);

    sortedSymbols.forEach(symbol => {
      const daysSinceFirst = Math.floor(
        (Date.now() - symbol.firstAppeared.getTime()) / (1000 * 60 * 60 * 24)
      );

      section += `\n### ${symbol.symbol}\n`;
      section += `- **First Appeared:** ${this.formatDate(symbol.firstAppeared)} (${daysSinceFirst} days ago)\n`;
      section += `- **Frequency:** ${symbol.frequency} mentions\n`;

      if (symbol.elementalResonance) {
        const emoji = ELEMENT_EMOJI[symbol.elementalResonance as keyof typeof ELEMENT_EMOJI];
        section += `- **Element:** ${emoji} ${this.capitalize(symbol.elementalResonance)}\n`;
      }

      if (symbol.context && symbol.context.length > 0) {
        section += `- **Latest Context:** "${symbol.context[symbol.context.length - 1]}"\n`;
      }
    });

    return section;
  }

  /**
   * Generate journey milestones section
   */
  private static generateJourneyMilestones(soulprint: Soulprint): string {
    if (soulprint.milestones.length === 0) {
      return `## ✨ Journey Milestones\n\n*No milestones recorded yet*`;
    }

    let section = `## ✨ Journey Milestones\n`;

    // Sort by date, most recent first
    const sortedMilestones = [...soulprint.milestones].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    sortedMilestones.forEach(milestone => {
      const emoji = MILESTONE_EMOJI[milestone.type];
      const significance = milestone.significance === 'pivotal' ? '⭐⭐⭐' :
                          milestone.significance === 'major' ? '⭐⭐' : '⭐';

      section += `\n### ${emoji} ${this.capitalize(milestone.type)} - ${this.formatDate(milestone.timestamp)}\n`;
      section += `*${milestone.description}*\n\n`;
      section += `**Significance:** ${significance} ${this.capitalize(milestone.significance)}\n`;

      if (milestone.spiralogicPhase) {
        section += `**Phase:** 🌀 ${this.capitalize(milestone.spiralogicPhase)}\n`;
      }

      if (milestone.element) {
        const emoji = ELEMENT_EMOJI[milestone.element as keyof typeof ELEMENT_EMOJI];
        section += `**Element:** ${emoji} ${this.capitalize(milestone.element)}\n`;
      }
    });

    return section;
  }

  /**
   * Generate emotional landscape section
   */
  private static generateEmotionalLandscape(soulprint: Soulprint): string {
    const state = soulprint.emotionalState;

    let trendEmoji = '→';
    if (state.trend === 'rising') trendEmoji = '↗️';
    if (state.trend === 'falling') trendEmoji = '↘️';
    if (state.trend === 'volatile') trendEmoji = '⚡';

    let section = `## 💫 Emotional Landscape\n\n`;
    section += `**Current State:** ${this.capitalize(state.trend)} ${trendEmoji}\n`;
    section += `**Baseline:** ${state.baseline.toFixed(2)} | **Current:** ${state.current.toFixed(2)}\n`;
    section += `**Volatility:** ${(state.volatility * 100).toFixed(0)}%\n`;

    if (state.dominantEmotions && state.dominantEmotions.length > 0) {
      section += `**Dominant Emotions:** ${state.dominantEmotions.join(', ')}\n`;
    }

    return section;
  }

  /**
   * Generate alerts and recommendations
   */
  private static generateAlerts(soulprint: Soulprint): string {
    const alerts: string[] = [];

    // Emotional volatility
    if (soulprint.emotionalState.volatility > 0.5) {
      alerts.push(`⚠️ High emotional volatility (${(soulprint.emotionalState.volatility * 100).toFixed(0)}%) - Consider grounding practices`);
    }

    // Elemental imbalance
    const deficientValue = soulprint.elementalBalance[
      soulprint.elementalBalance.deficient as keyof typeof soulprint.elementalBalance
    ] as number;

    if (deficientValue < 0.1 && soulprint.elementalBalance.deficient) {
      alerts.push(`⚠️ ${this.capitalize(soulprint.elementalBalance.deficient)} deficiency (${(deficientValue * 100).toFixed(0)}%) - ${this.getElementRecommendation(soulprint.elementalBalance.deficient)}`);
    }

    // Milestone stagnation
    const lastMilestone = soulprint.milestones[soulprint.milestones.length - 1];
    if (lastMilestone) {
      const daysSince = Math.floor((Date.now() - lastMilestone.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 7) {
        alerts.push(`⚠️ No milestones in ${daysSince} days - Journey may need attention`);
      }
    }

    // Symbol stagnation
    if (soulprint.activeSymbols.length === 0) {
      alerts.push(`⚠️ No active symbols - Symbolic language not emerging`);
    }

    // Positive notes
    if (soulprint.shadowIntegrationScore > 0.7) {
      alerts.push(`✅ Strong shadow integration (${(soulprint.shadowIntegrationScore * 100).toFixed(0)}%) - Deep work evident`);
    }

    const dominantValue = soulprint.elementalBalance[
      soulprint.elementalBalance.dominant as keyof typeof soulprint.elementalBalance
    ] as number;

    if (dominantValue > 0.3 && soulprint.elementalBalance.dominant) {
      alerts.push(`✅ ${this.capitalize(soulprint.elementalBalance.dominant)} integration strong - Continue this work`);
    }

    if (alerts.length === 0) {
      return `## 🚨 Alerts & Recommendations\n\n*No alerts - journey appears balanced*`;
    }

    let section = `## 🚨 Alerts & Recommendations\n\n`;
    alerts.forEach(alert => {
      section += `${alert}\n`;
    });

    return section;
  }

  /**
   * Generate narrative threads section
   */
  private static generateNarrativeThreads(soulprint: Soulprint): string {
    if (soulprint.narrativeThreads.length === 0) {
      return `## 🌊 Narrative Threads\n\n*No narrative threads identified yet*`;
    }

    let section = `## 🌊 Narrative Threads\n\n`;

    // Sort by strength
    const sortedThreads = [...soulprint.narrativeThreads].sort((a, b) => b.strength - a.strength);

    sortedThreads.forEach(thread => {
      const strengthBar = this.generateProgressBar(thread.strength);
      const statusEmoji = thread.status === 'integrated' ? '✅' :
                         thread.status === 'integrating' ? '🔄' :
                         thread.status === 'active' ? '🔥' : '🌱';

      section += `- **${thread.theme}** ${strengthBar} ${(thread.strength * 100).toFixed(0)}% `;
      section += `${statusEmoji} ${this.capitalize(thread.status)}\n`;

      if (thread.relatedSymbols && thread.relatedSymbols.length > 0) {
        section += `  *Symbols:* ${thread.relatedSymbols.join(', ')}\n`;
      }
    });

    return section;
  }

  /**
   * Generate archetypal journey section
   */
  private static generateArchetypalJourney(soulprint: Soulprint): string {
    if (soulprint.archetypeHistory.length === 0) {
      return `## 🎭 Archetypal Journey\n\n*No archetype shifts recorded yet*`;
    }

    let section = `## 🎭 Archetypal Journey\n\n`;
    section += `**Current Archetype:** ${soulprint.currentArchetype || 'Unknown'}\n`;
    section += `**Shadow Integration Score:** ${(soulprint.shadowIntegrationScore * 100).toFixed(0)}%\n\n`;

    section += `### Evolution Timeline\n\n`;

    // Sort by timestamp, most recent first
    const sortedHistory = [...soulprint.archetypeHistory].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    sortedHistory.slice(0, 10).forEach((shift, index) => {
      const arrow = index === sortedHistory.length - 1 ? '' : ' → ';
      section += `${this.formatDate(shift.timestamp)}: `;

      if (shift.fromArchetype) {
        section += `${shift.fromArchetype} → `;
      }

      section += `**${shift.toArchetype}**`;

      if (shift.trigger) {
        section += ` *(${shift.trigger})*`;
      }

      if (shift.shadowWork) {
        section += ` 🌑`;
      }

      section += `\n`;
    });

    return section;
  }

  /**
   * Generate footer
   */
  private static generateFooter(): string {
    return `---\n\n*Generated by MAIA Soul System on ${this.formatDate(new Date())}*  \n*[View Live Dashboard](/maia-monitor) | [Export Updated Version](/api/maia/soulprint/export)*`;
  }

  // === HELPER METHODS ===

  private static generateProgressBar(value: number, length: number = 10): string {
    const filled = Math.round(value * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private static getElementDescription(element?: string): string {
    const descriptions: Record<string, string> = {
      fire: '(passion, transformation, will)',
      water: '(emotion, flow, healing)',
      earth: '(grounding, manifestation, stability)',
      air: '(thought, clarity, communication)',
      aether: '(spirit, connection, mystery)'
    };
    return element ? descriptions[element] || '' : '';
  }

  private static getElementRecommendation(element?: string): string {
    const recommendations: Record<string, string> = {
      fire: 'Consider creative action or passion projects',
      water: 'Explore emotional expression or water rituals',
      earth: 'Focus on grounding practices or physical activity',
      air: 'Engage in journaling or intellectual exploration',
      aether: 'Try meditation or spiritual practices'
    };
    return element ? recommendations[element] || 'Balance needed' : '';
  }
}