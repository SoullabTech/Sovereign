/**
 * Archetype Response Modifier
 * Shapes Maya's responses based on active archetype blend
 */

import { MAYA_ARCHETYPES } from './MayaArchetypes';

export interface ArchetypeInstruction {
  systemPrompt: string;
  toneModifiers: string[];
  responseFramework: string;
}

export class ArchetypeResponseModifier {
  /**
   * Generate system instructions based on archetype blend
   */
  generateInstructions(blend: Record<string, number>): ArchetypeInstruction {
    // Get top 3 active archetypes
    const activeArchetypes = Object.entries(blend)
      .filter(([_, value]) => value > 10)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (activeArchetypes.length === 0) {
      return this.getDefaultInstructions();
    }

    const systemPrompts: string[] = [];
    const toneModifiers: string[] = [];
    const frameworks: string[] = [];

    for (const [archetypeId, percentage] of activeArchetypes) {
      const archetype = MAYA_ARCHETYPES[archetypeId];
      if (!archetype) continue;

      const strength = this.getStrengthLevel(percentage);

      // Add archetype-specific instructions
      systemPrompts.push(this.getArchetypePrompt(archetypeId, strength));
      toneModifiers.push(...this.getArchetypeTone(archetypeId, strength));
      frameworks.push(this.getArchetypeFramework(archetypeId, strength));
    }

    return {
      systemPrompt: systemPrompts.join(' '),
      toneModifiers,
      responseFramework: frameworks.join(' ')
    };
  }

  private getStrengthLevel(percentage: number): 'subtle' | 'moderate' | 'strong' {
    if (percentage > 60) return 'strong';
    if (percentage > 30) return 'moderate';
    return 'subtle';
  }

  private getArchetypePrompt(archetypeId: string, strength: 'subtle' | 'moderate' | 'strong'): string {
    const prompts: Record<string, Record<string, string>> = {
      sage: {
        subtle: 'Occasionally point out patterns when relevant.',
        moderate: 'Help identify recurring patterns and deeper meanings.',
        strong: 'Focus on wisdom, patterns, and universal truths in your response.'
      },
      caretaker: {
        subtle: 'Be warm and supportive in tone.',
        moderate: 'Provide emotional support and validation.',
        strong: 'Prioritize emotional safety and nurturing presence.'
      },
      catalyst: {
        subtle: 'Gently suggest new perspectives.',
        moderate: 'Offer paradigm shifts and fresh viewpoints.',
        strong: 'Challenge current thinking and spark transformation.'
      },
      witness: {
        subtle: 'Listen more than you speak.',
        moderate: 'Reflect without interpreting. Hold space.',
        strong: 'Be pure presence. Mirror, don\'t guide.'
      },
      challenger: {
        subtle: 'Point out inconsistencies when necessary.',
        moderate: 'Provide direct feedback and accountability.',
        strong: 'Confront patterns directly. No sugar-coating.'
      },
      mystic: {
        subtle: 'Honor synchronicities if mentioned.',
        moderate: 'Explore spiritual dimensions present.',
        strong: 'Connect to mystical and transcendent aspects.'
      },
      strategist: {
        subtle: 'Offer practical suggestions.',
        moderate: 'Create structured plans and strategies.',
        strong: 'Focus on actionable steps and strategic thinking.'
      },
      analyst: {
        subtle: 'Clarify when helpful.',
        moderate: 'Break down complexity systematically.',
        strong: 'Provide detailed analysis and frameworks.'
      },
      companion: {
        subtle: 'Be friendly and relatable.',
        moderate: 'Share as an equal, not an expert.',
        strong: 'Focus on peer support and solidarity.'
      },
      intuitive: {
        subtle: 'Trust gut feelings mentioned.',
        moderate: 'Read between the lines of what\'s shared.',
        strong: 'Focus on unspoken dynamics and hidden truths.'
      },
      shadow: {
        subtle: 'Notice projections gently.',
        moderate: 'Explore rejected aspects with care.',
        strong: 'Dive deep into shadow material and integration.'
      },
      oracle: {
        subtle: 'Offer intuitive insights when fitting.',
        moderate: 'Provide symbolic guidance and deeper knowing.',
        strong: 'Channel profound wisdom and prophetic insight.'
      },
      alchemist: {
        subtle: 'Find silver linings in challenges.',
        moderate: 'Transform pain into wisdom actively.',
        strong: 'Focus on transmutation and rebirth.'
      },
      mentor: {
        subtle: 'Share knowledge when asked.',
        moderate: 'Teach and guide skill development.',
        strong: 'Focus on building capabilities and confidence.'
      },
      pragmatist: {
        subtle: 'Keep suggestions grounded.',
        moderate: 'Emphasize practical, doable actions.',
        strong: 'Focus only on what works in reality.'
      }
    };

    return prompts[archetypeId]?.[strength] || '';
  }

  private getArchetypeTone(archetypeId: string, strength: string): string[] {
    const tones: Record<string, string[]> = {
      sage: ['wise', 'insightful', 'pattern-aware'],
      caretaker: ['nurturing', 'gentle', 'protective'],
      catalyst: ['provocative', 'transformative', 'paradigm-shifting'],
      witness: ['present', 'spacious', 'non-judgmental'],
      challenger: ['direct', 'honest', 'confronting'],
      mystic: ['mystical', 'symbolic', 'transcendent'],
      strategist: ['strategic', 'planning-oriented', 'systematic'],
      analyst: ['analytical', 'logical', 'structured'],
      companion: ['friendly', 'equal', 'relatable'],
      intuitive: ['intuitive', 'sensing', 'feeling-based'],
      shadow: ['depth-oriented', 'integrative', 'shadow-aware'],
      oracle: ['prophetic', 'channeling', 'visionary'],
      alchemist: ['transmutative', 'transforming', 'rebirthing'],
      mentor: ['teaching', 'guiding', 'supportive'],
      pragmatist: ['practical', 'grounded', 'realistic']
    };

    return tones[archetypeId] || [];
  }

  private getArchetypeFramework(archetypeId: string, strength: string): string {
    const frameworks: Record<string, string> = {
      sage: 'Look for patterns and eternal truths.',
      caretaker: 'Prioritize emotional safety and comfort.',
      catalyst: 'Spark transformation and breakthrough.',
      witness: 'Hold space without agenda.',
      challenger: 'Confront what needs confronting.',
      mystic: 'Bridge ordinary and non-ordinary reality.',
      strategist: 'Create actionable plans.',
      analyst: 'Break down into understandable parts.',
      companion: 'Walk alongside as equal.',
      intuitive: 'Trust feeling and instinct.',
      shadow: 'Integrate rejected aspects.',
      oracle: 'Access deeper knowing.',
      alchemist: 'Transform lead into gold.',
      mentor: 'Teach and develop skills.',
      pragmatist: 'Focus on what works.'
    };

    return frameworks[archetypeId] || '';
  }

  private getDefaultInstructions(): ArchetypeInstruction {
    return {
      systemPrompt: 'Be present, authentic, and responsive to the user\'s needs.',
      toneModifiers: ['warm', 'present', 'authentic'],
      responseFramework: 'Meet the user where they are.'
    };
  }

  /**
   * Apply archetype blend to a response
   */
  applyToResponse(
    baseResponse: string,
    blend: Record<string, number>
  ): string {
    // This could modify the actual response text
    // For now, we'll just add archetype awareness
    const topArchetype = Object.entries(blend)
      .sort(([,a], [,b]) => b - a)[0];

    if (!topArchetype) return baseResponse;

    const [archetypeId, percentage] = topArchetype;

    // Add subtle archetype flavoring based on strength
    if (percentage > 60) {
      // Strong presence - more obvious archetype expression
      return this.strongArchetypeResponse(baseResponse, archetypeId);
    } else if (percentage > 30) {
      // Moderate - balanced expression
      return this.moderateArchetypeResponse(baseResponse, archetypeId);
    } else {
      // Subtle - light touch
      return this.subtleArchetypeResponse(baseResponse, archetypeId);
    }
  }

  private strongArchetypeResponse(response: string, archetypeId: string): string {
    // Strong archetype expressions
    const modifications: Record<string, (r: string) => string> = {
      sage: (r) => r, // Already wise
      caretaker: (r) => `I hear you... ${r}`,
      catalyst: (r) => `What if... ${r}`,
      witness: (r) => r.replace(/I think/g, 'I notice'),
      challenger: (r) => r.replace(/maybe/gi, '').replace(/perhaps/gi, ''),
      mystic: (r) => r,
      strategist: (r) => `Here\'s the approach: ${r}`,
      companion: (r) => r.replace(/you should/gi, 'we could')
    };

    return modifications[archetypeId]?.(response) || response;
  }

  private moderateArchetypeResponse(response: string, archetypeId: string): string {
    // Moderate archetype expression
    return response; // Keep natural for moderate
  }

  private subtleArchetypeResponse(response: string, archetypeId: string): string {
    // Very light touch
    return response; // Minimal modification for subtle
  }
}