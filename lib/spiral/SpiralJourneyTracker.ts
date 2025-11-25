/**
 * Spiral Journey Tracking System
 * Maps user progression through 12 archetypal facets across multiple life spirals
 * Based on spiral dynamics and integral theory
 */

export interface SpiralFacet {
  id: string;
  name: string;
  stage: number; // 1-12 position on spiral
  description: string;
  keywords: string[];
  color: string;
  sacredGeometry: string; // Visual representation pattern
}

export interface LifeSpiral {
  id: string;
  name: string;
  domain: 'personal' | 'relational' | 'vocational' | 'spiritual' | 'creative';
  currentFacet: string;
  position: number; // 0-100% through current facet
  velocity: number; // Rate of movement (-1 to 1, negative = regression)
  revolutions: number; // How many times through the spiral
  lastTransition: Date;
  resonance: number; // How aligned this spiral is with others (0-1)
}

export interface UserSpiralState {
  userId: string;
  primarySpiral: string; // Most active spiral
  spirals: LifeSpiral[];
  facetTrends: Record<string, number>; // Trending toward which facets
  intersections: SpiralIntersection[]; // Where spirals overlap
  lastUpdated: Date;
}

export interface SpiralIntersection {
  spiral1: string;
  spiral2: string;
  facet: string;
  strength: number; // How strong the overlap is
  type: 'harmonious' | 'tension' | 'transformation';
}

// The 12 Universal Facets (based on hero's journey + integral stages)
export const SPIRAL_FACETS: SpiralFacet[] = [
  {
    id: 'innocence',
    name: 'Innocence',
    stage: 1,
    description: 'Pure potential, beginner\'s mind, trust',
    keywords: ['new', 'fresh', 'beginning', 'naive', 'open'],
    color: '#FFE5E5',
    sacredGeometry: 'circle'
  },
  {
    id: 'initiation',
    name: 'Initiation',
    stage: 2,
    description: 'First steps, early learning, enthusiasm',
    keywords: ['learning', 'excited', 'trying', 'exploring'],
    color: '#FFD4A3',
    sacredGeometry: 'vesica-piscis'
  },
  {
    id: 'struggle',
    name: 'Struggle',
    stage: 3,
    description: 'Meeting resistance, effort, challenge',
    keywords: ['hard', 'difficult', 'challenge', 'effort', 'stuck'],
    color: '#FFA3A3',
    sacredGeometry: 'triangle'
  },
  {
    id: 'breakthrough',
    name: 'Breakthrough',
    stage: 4,
    description: 'First success, initial mastery',
    keywords: ['breakthrough', 'success', 'finally', 'achieved'],
    color: '#A3FFD4',
    sacredGeometry: 'square'
  },
  {
    id: 'exploration',
    name: 'Exploration',
    stage: 5,
    description: 'Expanding horizons, experimenting',
    keywords: ['exploring', 'trying', 'experimenting', 'discovering'],
    color: '#A3D4FF',
    sacredGeometry: 'pentagon'
  },
  {
    id: 'commitment',
    name: 'Commitment',
    stage: 6,
    description: 'Choosing a path, deepening',
    keywords: ['commit', 'decided', 'focus', 'dedicated', 'serious'],
    color: '#D4A3FF',
    sacredGeometry: 'hexagon'
  },
  {
    id: 'refinement',
    name: 'Refinement',
    stage: 7,
    description: 'Perfecting, mastering, polishing',
    keywords: ['improving', 'refining', 'perfecting', 'mastering'],
    color: '#FFE5A3',
    sacredGeometry: 'heptagon'
  },
  {
    id: 'shadow',
    name: 'Shadow',
    stage: 8,
    description: 'Meeting the dark night, crisis, doubt',
    keywords: ['doubt', 'crisis', 'dark', 'questioning', 'lost'],
    color: '#8B7E8C',
    sacredGeometry: 'octagon'
  },
  {
    id: 'death',
    name: 'Death/Rebirth',
    stage: 9,
    description: 'Ending, transformation, letting go',
    keywords: ['ending', 'dying', 'releasing', 'transforming', 'letting go'],
    color: '#2D1B2E',
    sacredGeometry: 'enneagram'
  },
  {
    id: 'resurrection',
    name: 'Resurrection',
    stage: 10,
    description: 'Rising anew, phoenix, renewed purpose',
    keywords: ['reborn', 'renewed', 'rising', 'phoenix', 'new self'],
    color: '#F4E4C1',
    sacredGeometry: 'decagon'
  },
  {
    id: 'integration',
    name: 'Integration',
    stage: 11,
    description: 'Wholeness, wisdom, teaching others',
    keywords: ['whole', 'integrated', 'wisdom', 'teaching', 'complete'],
    color: '#E4C1F9',
    sacredGeometry: 'hendecagon'
  },
  {
    id: 'transcendence',
    name: 'Transcendence',
    stage: 12,
    description: 'Beyond self, service, unity',
    keywords: ['beyond', 'unity', 'service', 'transcend', 'oneness'],
    color: '#FFFFFF',
    sacredGeometry: 'dodecagon'
  }
];

// Common Life Spirals
export const LIFE_SPIRAL_TEMPLATES = {
  // Personal Development
  SELF: {
    id: 'self',
    name: 'Self/Identity',
    domain: 'personal' as const,
    keywords: ['who am I', 'identity', 'self', 'personal growth']
  },
  BODY: {
    id: 'body',
    name: 'Body/Health',
    domain: 'personal' as const,
    keywords: ['health', 'body', 'physical', 'wellness', 'illness']
  },
  MIND: {
    id: 'mind',
    name: 'Mind/Learning',
    domain: 'personal' as const,
    keywords: ['learning', 'understanding', 'knowledge', 'education']
  },

  // Relational
  FAMILY: {
    id: 'family',
    name: 'Family/Origins',
    domain: 'relational' as const,
    keywords: ['family', 'parents', 'children', 'siblings', 'home']
  },
  PARTNERSHIP: {
    id: 'partnership',
    name: 'Partnership/Love',
    domain: 'relational' as const,
    keywords: ['relationship', 'partner', 'love', 'marriage', 'dating']
  },
  COMMUNITY: {
    id: 'community',
    name: 'Community/Belonging',
    domain: 'relational' as const,
    keywords: ['friends', 'community', 'belonging', 'social', 'group']
  },

  // Vocational
  CAREER: {
    id: 'career',
    name: 'Career/Work',
    domain: 'vocational' as const,
    keywords: ['work', 'job', 'career', 'professional', 'business']
  },
  PURPOSE: {
    id: 'purpose',
    name: 'Purpose/Mission',
    domain: 'vocational' as const,
    keywords: ['purpose', 'mission', 'calling', 'meaning', 'why']
  },
  CREATIVITY: {
    id: 'creativity',
    name: 'Creativity/Expression',
    domain: 'creative' as const,
    keywords: ['creative', 'art', 'expression', 'making', 'creating']
  },

  // Spiritual
  SPIRITUALITY: {
    id: 'spirituality',
    name: 'Spirituality/Faith',
    domain: 'spiritual' as const,
    keywords: ['spiritual', 'faith', 'God', 'divine', 'sacred', 'soul']
  },
  SHADOW_WORK: {
    id: 'shadow_work',
    name: 'Shadow/Healing',
    domain: 'spiritual' as const,
    keywords: ['healing', 'trauma', 'shadow', 'therapy', 'integration']
  },
  CONSCIOUSNESS: {
    id: 'consciousness',
    name: 'Consciousness/Awakening',
    domain: 'spiritual' as const,
    keywords: ['awakening', 'consciousness', 'awareness', 'enlightenment']
  }
};

/**
 * Tracks user progression through multiple spiral journeys
 */
export class SpiralJourneyTracker {
  private userState: UserSpiralState;

  constructor(userId: string) {
    this.userState = {
      userId,
      primarySpiral: 'self',
      spirals: [],
      facetTrends: {},
      intersections: [],
      lastUpdated: new Date()
    };
  }

  /**
   * Detect which spiral and facet a message relates to
   */
  detectSpiralContext(message: string, history: string[] = []): {
    spiral: string;
    facet: string;
    confidence: number;
  }[] {
    const detections: { spiral: string; facet: string; confidence: number }[] = [];
    const lowerMessage = message.toLowerCase();
    const fullContext = [...history, message].join(' ').toLowerCase();

    // Check each spiral template
    for (const [spiralId, template] of Object.entries(LIFE_SPIRAL_TEMPLATES)) {
      let spiralRelevance = 0;

      // Check for spiral keywords
      for (const keyword of template.keywords) {
        if (fullContext.includes(keyword)) {
          spiralRelevance += 0.3;
        }
      }

      if (spiralRelevance > 0) {
        // Now detect which facet within this spiral
        for (const facet of SPIRAL_FACETS) {
          let facetRelevance = 0;

          for (const keyword of facet.keywords) {
            if (lowerMessage.includes(keyword)) {
              facetRelevance += 0.4;
            }
            if (fullContext.includes(keyword)) {
              facetRelevance += 0.1;
            }
          }

          if (facetRelevance > 0) {
            detections.push({
              spiral: spiralId,
              facet: facet.id,
              confidence: Math.min(spiralRelevance + facetRelevance, 1)
            });
          }
        }
      }
    }

    return detections.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Update user's position on detected spirals
   */
  updateSpiralPosition(
    spiralId: string,
    facetId: string,
    movement: number = 0.1
  ): void {
    let spiral = this.userState.spirals.find(s => s.id === spiralId);

    if (!spiral) {
      // Create new spiral tracking
      spiral = this.createSpiral(spiralId);
      this.userState.spirals.push(spiral);
    }

    const currentFacetIndex = SPIRAL_FACETS.findIndex(f => f.id === spiral!.currentFacet);
    const targetFacetIndex = SPIRAL_FACETS.findIndex(f => f.id === facetId);

    // Update position
    if (currentFacetIndex === targetFacetIndex) {
      // Moving within same facet
      spiral.position = Math.min(100, spiral.position + movement * 100);
    } else {
      // Transitioning to new facet
      spiral.currentFacet = facetId;
      spiral.position = movement * 100;
      spiral.lastTransition = new Date();

      // Check if completing a revolution
      if (targetFacetIndex === 0 && currentFacetIndex === 11) {
        spiral.revolutions++;
      }
    }

    // Update velocity
    spiral.velocity = movement > 0 ? Math.min(1, movement) : Math.max(-1, movement);

    // Update trends
    this.updateFacetTrends(facetId, movement);

    // Check for intersections
    this.detectIntersections();
  }

  /**
   * Create a new spiral tracking instance
   */
  private createSpiral(spiralId: string): LifeSpiral {
    const template = Object.values(LIFE_SPIRAL_TEMPLATES).find(t => t.id === spiralId);

    return {
      id: spiralId,
      name: template?.name || spiralId,
      domain: template?.domain || 'personal',
      currentFacet: 'innocence',
      position: 0,
      velocity: 0,
      revolutions: 0,
      lastTransition: new Date(),
      resonance: 0
    };
  }

  /**
   * Update trending facets across all spirals
   */
  private updateFacetTrends(facetId: string, weight: number): void {
    this.userState.facetTrends[facetId] =
      (this.userState.facetTrends[facetId] || 0) + weight;

    // Normalize trends
    const total = Object.values(this.userState.facetTrends).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const facet in this.userState.facetTrends) {
        this.userState.facetTrends[facet] /= total;
      }
    }
  }

  /**
   * Detect where spirals intersect (same facet, different domains)
   */
  private detectIntersections(): void {
    this.userState.intersections = [];

    for (let i = 0; i < this.userState.spirals.length; i++) {
      for (let j = i + 1; j < this.userState.spirals.length; j++) {
        const spiral1 = this.userState.spirals[i];
        const spiral2 = this.userState.spirals[j];

        if (spiral1.currentFacet === spiral2.currentFacet) {
          // Spirals are in the same facet
          const intersection: SpiralIntersection = {
            spiral1: spiral1.id,
            spiral2: spiral2.id,
            facet: spiral1.currentFacet,
            strength: Math.min(spiral1.position, spiral2.position) / 100,
            type: this.determineIntersectionType(spiral1, spiral2)
          };

          this.userState.intersections.push(intersection);
        }
      }
    }
  }

  /**
   * Determine the type of intersection between spirals
   */
  private determineIntersectionType(
    spiral1: LifeSpiral,
    spiral2: LifeSpiral
  ): 'harmonious' | 'tension' | 'transformation' {
    // Same direction = harmonious
    if (Math.sign(spiral1.velocity) === Math.sign(spiral2.velocity)) {
      return 'harmonious';
    }

    // Opposite directions = tension
    if (spiral1.velocity * spiral2.velocity < 0) {
      return 'tension';
    }

    // One moving, one stuck = transformation opportunity
    return 'transformation';
  }

  /**
   * Get visual data for rendering spirals
   */
  getVisualizationData(): {
    spirals: Array<{
      id: string;
      name: string;
      points: { x: number; y: number; facet: string }[];
      currentPosition: { x: number; y: number };
    }>;
    intersections: SpiralIntersection[];
    primaryFacet: string;
  } {
    const spiralVisuals = this.userState.spirals.map(spiral => {
      const points = SPIRAL_FACETS.map((facet, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const radius = 100 + spiral.revolutions * 20;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          facet: facet.id
        };
      });

      const currentIndex = SPIRAL_FACETS.findIndex(f => f.id === spiral.currentFacet);
      const angle = (currentIndex / 12) * Math.PI * 2 - Math.PI / 2;
      const progress = spiral.position / 100;
      const nextAngle = ((currentIndex + 1) / 12) * Math.PI * 2 - Math.PI / 2;
      const currentAngle = angle + (nextAngle - angle) * progress;
      const radius = 100 + spiral.revolutions * 20;

      return {
        id: spiral.id,
        name: spiral.name,
        points,
        currentPosition: {
          x: Math.cos(currentAngle) * radius,
          y: Math.sin(currentAngle) * radius
        }
      };
    });

    // Find primary facet (most trending)
    const primaryFacet = Object.entries(this.userState.facetTrends)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'innocence';

    return {
      spirals: spiralVisuals,
      intersections: this.userState.intersections,
      primaryFacet
    };
  }

  /**
   * Get insights about user's spiral journey
   */
  getInsights(): string[] {
    const insights: string[] = [];

    // Check for stuck spirals
    const stuckSpirals = this.userState.spirals.filter(s =>
      s.velocity === 0 || s.currentFacet === 'struggle' && s.position > 50
    );

    if (stuckSpirals.length > 0) {
      insights.push(`Noticing resistance in ${stuckSpirals[0].name} journey`);
    }

    // Check for rapid progress
    const acceleratingSpirals = this.userState.spirals.filter(s => s.velocity > 0.7);
    if (acceleratingSpirals.length > 0) {
      insights.push(`Breakthrough momentum in ${acceleratingSpirals[0].name}`);
    }

    // Check for intersections
    const transformativeIntersections = this.userState.intersections.filter(
      i => i.type === 'transformation' && i.strength > 0.5
    );

    if (transformativeIntersections.length > 0) {
      const int = transformativeIntersections[0];
      insights.push(`${int.spiral1} and ${int.spiral2} are creating transformation in ${int.facet}`);
    }

    // Check for shadow work
    const shadowSpirals = this.userState.spirals.filter(s => s.currentFacet === 'shadow');
    if (shadowSpirals.length > 0) {
      insights.push(`Deep shadow work happening in ${shadowSpirals[0].name}`);
    }

    return insights;
  }
}