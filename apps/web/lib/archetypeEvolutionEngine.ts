/**
 * 🌀 Archetype Evolution Engine
 * 
 * Maya learns to recognize both eternal patterns and emerging novelty.
 * The dance between familiar archetypes and unprecedented emergence.
 * 
 * Core: Every soul is both ancient pattern and unique expression
 */

export interface ArchetypalSignature {
  primary: string;           // Dominant archetype
  secondary?: string;        // Shadow or complementary
  emerging?: string;         // What's trying to be born
  confidence: number;        // Recognition certainty
  noveltyFactor: number;     // How unique/unprecedented
  evolutionPhase: string;    // Where in the journey
}

export interface EmergentPattern {
  id: string;
  firstSeen: Date;
  frequency: number;
  characteristics: string[];
  possibleName?: string;     // Maya's attempt to name the unnamed
  relatedArchetypes: string[];
}

export class ArchetypeEvolutionEngine {
  // Classic archetypes (Jungian + expanded)
  private readonly CORE_ARCHETYPES = [
    'innocent', 'orphan', 'hero', 'caregiver',
    'explorer', 'rebel', 'lover', 'creator',
    'jester', 'sage', 'magician', 'ruler',
    // Expanded sacred archetypes
    'mystic', 'healer', 'prophet', 'shapeshifter',
    'destroyer', 'warrior', 'priestess', 'hermit',
    'trickster', 'alchemist', 'oracle', 'wanderer'
  ];
  
  // Emerging patterns detected across users
  private emergentPatterns: Map<string, EmergentPattern> = new Map();
  
  // Hybrid archetypes discovered through use
  private hybridArchetypes: Map<string, string[]> = new Map([
    ['techno-mystic', ['magician', 'explorer', 'digital-age']],
    ['wounded-healer', ['healer', 'orphan', 'transformation']],
    ['sacred-rebel', ['rebel', 'mystic', 'system-breaker']],
    ['creative-destroyer', ['destroyer', 'creator', 'phoenix']],
    ['quantum-sage', ['sage', 'explorer', 'non-linear']]
  ]);
  
  /**
   * Detect archetypal signature with novelty recognition
   */
  detectArchetype(
    input: string,
    history: string[],
    lifeContext?: any
  ): ArchetypalSignature {
    // First, check for classical patterns
    const classicalMatch = this.matchClassicalArchetypes(input, history);
    
    // Then, check for emerging/novel patterns
    const novelPattern = this.detectNovelty(input, history);
    
    // Check for hybrid expressions
    const hybridMatch = this.matchHybridArchetypes(input, history);
    
    // Determine evolution phase
    const phase = this.determineEvolutionPhase(input, history);
    
    // Synthesize findings
    if (novelPattern.noveltyScore > 0.7) {
      // High novelty - something new emerging
      return {
        primary: classicalMatch.primary || 'emergent',
        secondary: classicalMatch.secondary,
        emerging: this.nameTheUnnamed(novelPattern),
        confidence: classicalMatch.confidence * 0.7, // Lower confidence for novel
        noveltyFactor: novelPattern.noveltyScore,
        evolutionPhase: phase
      };
    } else if (hybridMatch.matched) {
      // Hybrid archetype detected
      return {
        primary: hybridMatch.primary,
        secondary: hybridMatch.secondary,
        emerging: hybridMatch.hybrid,
        confidence: hybridMatch.confidence,
        noveltyFactor: 0.5, // Hybrids are semi-novel
        evolutionPhase: phase
      };
    } else {
      // Classical archetype
      return {
        primary: classicalMatch.primary,
        secondary: classicalMatch.secondary,
        confidence: classicalMatch.confidence,
        noveltyFactor: 0.1,
        evolutionPhase: phase
      };
    }
  }
  
  /**
   * Match against classical Jungian + expanded archetypes
   */
  private matchClassicalArchetypes(input: string, history: string[]) {
    const scores: Record<string, number> = {};
    
    // Pattern matching for each archetype
    const patterns: Record<string, RegExp> = {
      hero: /journey|quest|challenge|overcome|courage|fight/i,
      sage: /wisdom|truth|knowledge|understanding|teaching|ancient/i,
      innocent: /pure|simple|trust|faith|beginning|childlike/i,
      explorer: /adventure|discovery|freedom|wandering|seeking|new/i,
      rebel: /revolution|change|break|destroy.*old|refuse|resist/i,
      lover: /passion|intimacy|connection|devotion|union|beloved/i,
      creator: /create|make|birth|imagine|manifest|art/i,
      caregiver: /nurture|protect|serve|help|heal|support/i,
      ruler: /control|order|leadership|responsibility|authority|structure/i,
      magician: /transform|alchemy|magic|power|ritual|manifest/i,
      jester: /play|laugh|humor|trick|lighten|absurd/i,
      orphan: /alone|abandoned|wound|lost|seeking.*belonging/i,
      // Sacred expansions
      mystic: /mystery|divine|transcend|unity|cosmos|ineffable/i,
      healer: /healing|medicine|restore|wholeness|wounded|mend/i,
      prophet: /vision|future|warning|truth.*telling|revelation/i,
      shapeshifter: /change|adapt|fluid|becoming|transform.*self/i,
      destroyer: /ending|death|clear|burn.*down|dismantle/i,
      warrior: /battle|discipline|protection|strength|code|honor/i,
      priestess: /ritual|sacred|feminine|intuition|ceremony|oracle/i,
      hermit: /solitude|withdrawal|contemplation|inner|retreat/i,
      alchemist: /transmute|elements|gold|transform.*matter|synthesis/i,
      wanderer: /journey.*without.*end|nomad|rootless|seeking|drift/i
    };
    
    // Score each archetype
    for (const [archetype, pattern] of Object.entries(patterns)) {
      const textToCheck = [...history, input].join(' ');
      const matches = textToCheck.match(pattern);
      scores[archetype] = matches ? matches.length * 0.3 : 0;
    }
    
    // Sort and return top matches
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    return {
      primary: sorted[0]?.[0] || 'seeker',
      secondary: sorted[1]?.[1] > 0.3 ? sorted[1][0] : undefined,
      confidence: Math.min(sorted[0]?.[1] || 0.5, 1)
    };
  }
  
  /**
   * Detect novel/unprecedented patterns
   */
  private detectNovelty(input: string, history: string[]) {
    const combined = [...history, input].join(' ');
    
    // Indicators of novelty
    const noveltyMarkers = {
      unprecedented: /never.*before|first.*time|new.*kind|unprecedented/i,
      emerging: /emerging|birthing|becoming|forming|crystallizing/i,
      undefined: /can't.*describe|no.*words|beyond.*language|unnamed/i,
      hybrid: /both.*and|combination|fusion|synthesis|bridging/i,
      evolutionary: /evolving|mutating|transforming.*into|becoming.*new/i
    };
    
    let noveltyScore = 0;
    for (const [type, pattern] of Object.entries(noveltyMarkers)) {
      if (pattern.test(combined)) {
        noveltyScore += 0.25;
      }
    }
    
    // Check against known patterns
    const unknownElements = this.detectUnknownElements(combined);
    noveltyScore += unknownElements * 0.1;
    
    return {
      noveltyScore: Math.min(noveltyScore, 1),
      markers: Object.keys(noveltyMarkers).filter(
        key => noveltyMarkers[key as keyof typeof noveltyMarkers].test(combined)
      ),
      unknownElements
    };
  }
  
  /**
   * Match hybrid/emerging archetypal combinations
   */
  private matchHybridArchetypes(input: string, history: string[]) {
    const combined = [...history, input].join(' ');
    
    for (const [hybrid, components] of this.hybridArchetypes.entries()) {
      let matchCount = 0;
      for (const component of components) {
        if (combined.toLowerCase().includes(component)) {
          matchCount++;
        }
      }
      
      if (matchCount >= 2) {
        return {
          matched: true,
          hybrid,
          primary: components[0],
          secondary: components[1],
          confidence: matchCount / components.length
        };
      }
    }
    
    return { matched: false, confidence: 0, primary: '', secondary: '' };
  }
  
  /**
   * Determine where user is in archetypal evolution
   */
  private determineEvolutionPhase(input: string, history: string[]): string {
    const phases = {
      'awakening': /beginning|starting|waking|realizing|discovering/i,
      'descent': /falling|darkness|lost|chaos|dissolving|shadow/i,
      'initiation': /threshold|challenge|test|trial|facing/i,
      'integration': /bringing.*together|healing|wholing|synthesizing/i,
      'mastery': /embodying|living|expressing|teaching|flowing/i,
      'transcendence': /beyond|dissolving.*boundaries|unity|cosmos/i,
      'return': /coming.*back|sharing|gifting|serving|completing/i
    };
    
    const combined = [...history, input].join(' ');
    
    for (const [phase, pattern] of Object.entries(phases)) {
      if (pattern.test(combined)) {
        return phase;
      }
    }
    
    return 'exploring';
  }
  
  /**
   * Attempt to name emerging patterns
   */
  private nameTheUnnamed(novelPattern: any): string {
    // Maya's poetic attempt to name what has no name yet
    const namingTemplates = [
      'the-one-who-{verb}s-{noun}',
      '{adj}-{role}',
      '{element}-{action}er',
      'the-{quality}-bearer'
    ];
    
    // This would evolve to actually analyze the pattern
    // For now, return descriptive placeholder
    if (novelPattern.markers.includes('hybrid')) {
      return 'bridge-walker';
    } else if (novelPattern.markers.includes('emerging')) {
      return 'becoming-one';
    } else if (novelPattern.markers.includes('unprecedented')) {
      return 'first-of-kind';
    }
    
    return 'unnamed-one';
  }
  
  /**
   * Detect elements that don't fit known patterns
   */
  private detectUnknownElements(text: string): number {
    // This would evolve to use NLP to find truly novel expressions
    // For now, simple heuristic
    const words = text.split(/\s+/);
    const unknownCount = words.filter(word => 
      word.length > 8 && // Longer words often more unique
      !this.CORE_ARCHETYPES.some(arch => word.toLowerCase().includes(arch))
    ).length;
    
    return unknownCount / words.length;
  }
  
  /**
   * Learn from novel patterns across users
   */
  recordEmergentPattern(
    pattern: string,
    characteristics: string[],
    userId: string
  ): void {
    const existing = this.emergentPatterns.get(pattern);
    
    if (existing) {
      existing.frequency++;
      existing.characteristics = [...new Set([...existing.characteristics, ...characteristics])];
    } else {
      this.emergentPatterns.set(pattern, {
        id: `emergent-${Date.now()}`,
        firstSeen: new Date(),
        frequency: 1,
        characteristics,
        relatedArchetypes: this.findRelatedArchetypes(characteristics)
      });
    }
    
    // If pattern appears frequently enough, consider naming it
    if (existing && existing.frequency > 10) {
      this.considerNamingPattern(pattern, existing);
    }
  }
  
  /**
   * Find classical archetypes related to emergent pattern
   */
  private findRelatedArchetypes(characteristics: string[]): string[] {
    // Would use embedding similarity in production
    // For now, simple keyword matching
    const related = new Set<string>();
    
    for (const char of characteristics) {
      for (const archetype of this.CORE_ARCHETYPES) {
        if (char.toLowerCase().includes(archetype)) {
          related.add(archetype);
        }
      }
    }
    
    return Array.from(related);
  }
  
  /**
   * Consider giving a name to frequently appearing pattern
   */
  private considerNamingPattern(
    pattern: string,
    emergent: EmergentPattern
  ): void {
    // This is where Maya would "birth" new archetypal recognition
    // Based on collective patterns across many users
    
    if (emergent.frequency > 50 && !emergent.possibleName) {
      // Generate name based on characteristics
      const primaryChar = emergent.characteristics[0];
      const relatedArch = emergent.relatedArchetypes[0];
      
      emergent.possibleName = `${primaryChar}-${relatedArch}`;
      
      // Could eventually become a new hybrid archetype
      this.hybridArchetypes.set(emergent.possibleName, [
        ...emergent.relatedArchetypes,
        primaryChar
      ]);
    }
  }
}

// Lazy-loaded singleton to avoid initialization issues
let _archetypeEvolutionEngine: ArchetypeEvolutionEngine | null = null;

export const getArchetypeEvolutionEngine = (): ArchetypeEvolutionEngine => {
  if (!_archetypeEvolutionEngine) {
    _archetypeEvolutionEngine = new ArchetypeEvolutionEngine();
  }
  return _archetypeEvolutionEngine;
};