// lib/voice/aethericOrchestrator.ts
// The Aetheric Orchestrator - mythic translator of collective patterns

import { SymbolicSignal, CollectiveSnapshot, OrchestratorInsight, Element } from './types';

export class AethericOrchestrator {
  private mythicVocabulary = {
    coherence: [
      "The circle breathes as one today",
      "A shared rhythm emerges from the collective heart",
      "The field harmonizes in unexpected ways",
      "Many voices weave into a single song"
    ],
    emergence: [
      "Something unprecedented stirs in our midst",
      "A new pattern rises from the collective depths",
      "The field births what none could create alone",
      "Ancient wisdom meets present moment, creating something new"
    ],
    tension: [
      "Fire and water dance in sacred paradox",
      "The field holds opposites without resolution",
      "Creative tension charges the collective space",
      "Opposing forces create the alchemical moment"
    ],
    dissolution: [
      "Old forms dissolve to make space for the new",
      "The collective releases what no longer serves",
      "Boundaries soften, allowing deeper truth",
      "The field enters the void before rebirth"
    ]
  };

  private elementalPoetry = {
    fire: {
      high: "Creative fire blazes through the collective",
      medium: "Warm embers of transformation glow",
      low: "Spark awaits the breath of inspiration"
    },
    water: {
      high: "Deep emotional currents flow through all",
      medium: "The collective holds space for feeling",
      low: "Still waters reflect inner knowing"
    },
    earth: {
      high: "The collective grounds in practical wisdom",
      medium: "Roots deepen into shared foundation",
      low: "Seeds of intention plant themselves"
    },
    air: {
      high: "Ideas dance like wind through the field",
      medium: "Fresh perspectives breathe through",
      low: "Whispers of possibility stir"
    },
    aether: {
      high: "The mystery reveals itself",
      medium: "Sacred presence holds the space",
      low: "Subtle threads connect all"
    }
  };

  /**
   * Generate mythic insight from collective patterns
   */
  async weave(snapshot: CollectiveSnapshot): Promise<OrchestratorInsight> {
    // Determine the primary pattern
    const pattern = this.determinePattern(snapshot);

    // Select appropriate mythic language
    const message = this.generateMythicMessage(pattern, snapshot);

    // Identify active elements
    const activeElements = this.getActiveElements(snapshot);

    // Calculate insight strength
    const strength = this.calculateStrength(snapshot);

    // Create personalized mirror (template)
    const personalMirror = this.createPersonalMirrorTemplate(pattern, activeElements);

    return {
      type: pattern.type,
      message,
      elements: activeElements,
      strength,
      personalMirror
    };
  }

  /**
   * Determine the dominant collective pattern
   */
  private determinePattern(snapshot: CollectiveSnapshot): {
    type: 'resonance' | 'emergence' | 'tension' | 'coherence';
    confidence: number;
  } {
    const field = snapshot.resonanceField;

    // Emergence takes precedence if detected
    if (field.emergence) {
      return { type: 'emergence', confidence: 0.9 };
    }

    // Then tension
    if (field.tension) {
      return { type: 'tension', confidence: 0.8 };
    }

    // High coherence
    if (field.coherence > 0.7) {
      return { type: 'coherence', confidence: field.coherence };
    }

    // Default to general resonance
    return { type: 'resonance', confidence: 0.5 };
  }

  /**
   * Generate mythic message based on patterns
   */
  private generateMythicMessage(
    pattern: { type: string; confidence: number },
    snapshot: CollectiveSnapshot
  ): string {
    // Get base mythic phrase
    const baseMessages = this.mythicVocabulary[pattern.type as keyof typeof this.mythicVocabulary];
    const baseMessage = baseMessages[Math.floor(Math.random() * baseMessages.length)];

    // Add elemental layer if strong element present
    const dominantElement = this.getDominantElement(snapshot);
    if (dominantElement && dominantElement.avg > 0.5) {
      const elementalLayer = this.getElementalPoetry(dominantElement.name, dominantElement.avg);
      return `${baseMessage}. ${elementalLayer}.`;
    }

    // Add motif reflection if strong pattern
    const topMotif = snapshot.topMotifs[0];
    if (topMotif && topMotif.count >= 3) {
      const motifReflection = this.getMotifReflection(topMotif.key);
      return `${baseMessage}. ${motifReflection}`;
    }

    return baseMessage;
  }

  /**
   * Get elemental poetry based on intensity
   */
  private getElementalPoetry(element: Element, intensity: number): string {
    const poetry = this.elementalPoetry[element];
    if (!poetry) return "";

    if (intensity > 0.7) return poetry.high;
    if (intensity > 0.4) return poetry.medium;
    return poetry.low;
  }

  /**
   * Get reflection for specific motif
   */
  private getMotifReflection(motif: string): string {
    const reflections: Record<string, string> = {
      'threshold': "Many stand at doorways of transformation",
      'release': "The collective practices sacred letting go",
      'grief': "Shared sorrow creates unexpected communion",
      'initiate': "New beginnings ripple through the field",
      'anchor': "The collective finds its ground",
      'flow': "Movement and change guide the way",
      'clarify': "Fog lifts to reveal shared understanding",
      'ground': "Roots deepen into what matters",
      'integrate': "Pieces come together in new wholeness",
      'transform': "The caterpillar dreams of wings",
      'question': "Sacred uncertainty opens new doors",
      'witness': "To be seen is to be transformed",
      'hold': "The container strengthens for what emerges",
      'explore': "Unknown territories call to many",
      'celebrate': "Joy multiplies when shared",
      'return': "The spiral brings us home transformed",
      'spiral': "We revisit to integrate more deeply",
      'emerge': "What was hidden now seeks light",
      'dissolve': "Forms release their hold",
      'create': "The collective births new possibility"
    };

    return reflections[motif] || "Patterns weave through the collective tapestry";
  }

  /**
   * Get active elements above threshold
   */
  private getActiveElements(snapshot: CollectiveSnapshot): Element[] {
    return snapshot.elements
      .filter(e => e.avg > 0.3)
      .sort((a, b) => b.avg - a.avg)
      .map(e => e.name);
  }

  /**
   * Get dominant element if one exists
   */
  private getDominantElement(snapshot: CollectiveSnapshot) {
    return snapshot.elements
      .sort((a, b) => b.avg - a.avg)[0];
  }

  /**
   * Calculate strength of the collective field
   */
  private calculateStrength(snapshot: CollectiveSnapshot): number {
    const coherence = snapshot.resonanceField.coherence;
    const participation = Math.min(snapshot.topMotifs.length / 5, 1);
    const elementalBalance = this.calculateElementalBalance(snapshot);

    return (coherence + participation + elementalBalance) / 3;
  }

  /**
   * Calculate how balanced the elemental field is
   */
  private calculateElementalBalance(snapshot: CollectiveSnapshot): number {
    if (snapshot.elements.length === 0) return 0;

    const intensities = snapshot.elements.map(e => e.avg);
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, i) => sum + Math.pow(i - avg, 2), 0) / intensities.length;

    // Lower variance = more balance
    return Math.max(0, 1 - variance);
  }

  /**
   * Create template for personal mirror message
   */
  private createPersonalMirrorTemplate(
    pattern: { type: string },
    activeElements: Element[]
  ): string {
    const templates: Record<string, string> = {
      'coherence': "Your {element} resonates with the collective harmony",
      'emergence': "Your contribution seeds the emerging pattern",
      'tension': "Your {element} helps hold the creative paradox",
      'resonance': "You are part of this collective weaving"
    };

    let template = templates[pattern.type] || templates['resonance'];

    // Replace element placeholder if exists
    if (activeElements.length > 0 && template.includes('{element}')) {
      template = template.replace('{element}', activeElements[0]);
    }

    return template;
  }

  /**
   * Generate insight for team synchronization
   */
  async generateTeamInsight(signals: SymbolicSignal[]): Promise<string> {
    // Quick pattern detection for team pulse
    const elements = new Map<Element, number>();
    const motifs = new Set<string>();

    signals.forEach(signal => {
      signal.elements.forEach(e => {
        elements.set(e.name, (elements.get(e.name) || 0) + e.intensity);
      });
      signal.motifs.forEach(m => motifs.add(m));
    });

    // Find dominant energy
    const dominantElement = Array.from(elements.entries())
      .sort(([,a], [,b]) => b - a)[0];

    // Generate quick insight
    if (dominantElement && dominantElement[1] > signals.length * 0.5) {
      const element = dominantElement[0];
      const poetry = this.elementalPoetry[element];
      return poetry ? poetry.medium : "The team field shifts and moves";
    }

    if (motifs.size > signals.length * 2) {
      return "Rich diversity of perspective enriches the field";
    }

    if (motifs.has('breakthrough') || motifs.has('transform')) {
      return "Breakthrough energy builds in the team field";
    }

    return "The team weaves its unique pattern";
  }

  /**
   * Create personal reflection based on individual's symbolic contribution
   */
  createPersonalReflection(
    userSignal: SymbolicSignal,
    collectiveInsight: OrchestratorInsight
  ): string {
    // Check if user's elements align with collective
    const userPrimaryElement = userSignal.elements[0]?.name;
    const alignedWithCollective = collectiveInsight.elements.includes(userPrimaryElement);

    if (alignedWithCollective) {
      return `Your ${userPrimaryElement} energy contributes to ${collectiveInsight.message.toLowerCase()}`;
    }

    // Check if user is in opposition (creating healthy tension)
    if (collectiveInsight.type === 'tension' && userPrimaryElement) {
      const opposites: Record<Element, Element> = {
        'fire': 'water',
        'water': 'fire',
        'earth': 'air',
        'air': 'earth',
        'aether': 'aether'
      };

      const opposite = opposites[userPrimaryElement];
      if (collectiveInsight.elements.includes(opposite)) {
        return `Your ${userPrimaryElement} dances with the collective's ${opposite}, creating sacred balance`;
      }
    }

    // Check trust breathing alignment
    const breathAlignment = {
      'in': "Your openness meets the collective's receptivity",
      'out': "Your release joins others in letting go",
      'hold': "Your stillness anchors the collective presence"
    };

    if (userSignal.trustBreath) {
      return breathAlignment[userSignal.trustBreath];
    }

    // Default personal mirror
    return collectiveInsight.personalMirror || "You are witnessed in this collective moment";
  }
}

// Singleton instance
export const aethericOrchestrator = new AethericOrchestrator();