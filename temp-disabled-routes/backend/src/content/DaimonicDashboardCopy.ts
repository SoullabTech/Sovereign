/**
 * Daimonic Dashboard Copy Kit
 * Phenomenological phrases for each widget - never clinical or technical
 * Maintains mystery while revealing patterns
 */

export interface CopyVariations {
  standard: string[];
  expert: string[];
}

export class DaimonicDashboardCopy {
  
  /**
   * Collective Field Banner Copy
   */
  static getFieldBannerCopy(weatherCondition: string, transmissionQuality: string): CopyVariations {
    const weatherCopy = {
      ordinary: {
        standard: [
          "The field feels calm and steady, like a quiet morning.",
          "Peaceful currents flowing through the collective space.",
          "The archetypal weather is mild and approachable today.",
          "A time of gentle stirring in the shared depths."
        ],
        expert: [
          "Field intensity: Low (0.1-0.3) | Baseline archetypal activity",
          "Ordinary weather: Minimal trickster interference detected",
          "Standard transmission conditions with low collective charge"
        ]
      },
      charged: {
        standard: [
          "The air is charged with potential—something is stirring in the collective.",
          "Electric undercurrents moving through the shared field.",
          "The field hums with anticipation and possibility.",
          "Archetypal energies are gathering momentum."
        ],
        expert: [
          "Field intensity: Moderate-High (0.5-0.7) | Mixed trickster signals",
          "Charged conditions: Elevated tension with moderate clarity",
          "Active archetypal constellations forming across participants"
        ]
      },
      clear: {
        standard: [
          "The field is luminous and clear—shared insights are flowing freely.",
          "Crystal clarity in the collective transmission channels.",
          "The archetypal weather is bright and transparent.",
          "A rare window of unobstructed collective understanding."
        ],
        expert: [
          "Field intensity: High (0.7+) | Low trickster interference (<0.3)",
          "Clear transmission: Optimal conditions for shared insights",
          "High coherence between individual and collective patterns"
        ]
      },
      stormy: {
        standard: [
          "The field feels stormy, with teaching riddles moving through like weather fronts.",
          "Turbulent energies carrying important lessons through the collective.",
          "The archetypal weather is intense—wisdom wrapped in confusion.",
          "Storm systems of transformation crossing the shared space."
        ],
        expert: [
          "Field intensity: High (0.7+) | High trickster activity (0.6+)",
          "Stormy conditions: Maximum teaching potential with high complexity",
          "Elevated paradox and contradiction across collective patterns"
        ]
      }
    };

    const transmissionCopy = {
      clear: {
        standard: [
          "Transmissions are clear and direct.",
          "Messages are arriving without distortion.",
          "The signal is clean and easy to receive.",
          "Communication channels are wide open."
        ],
        expert: [
          "Clear transmission: <20% noise ratio",
          "Direct signal path with minimal interference",
          "High coherence across multiple participants"
        ]
      },
      riddles: {
        standard: [
          "Messages are arriving wrapped in riddles and paradox.",
          "The teachings come sideways, requiring careful attention.",
          "Wisdom is presenting itself in puzzle form today.",
          "The field speaks in koans and contradictions."
        ],
        expert: [
          "High riddle content: 70%+ paradoxical messaging",
          "Elevated trickster activity requiring interpretation",
          "Complex signal patterns with embedded teachings"
        ]
      },
      static: {
        standard: [
          "High activity is creating some static—listen carefully.",
          "The volume is up but clarity requires extra attention.",
          "Strong signals with some interference patterns.",
          "The field is very active—filter through the noise."
        ],
        expert: [
          "Signal saturation: High intensity with moderate clarity",
          "Multiple competing archetypal transmissions",
          "Requires selective attention to extract meaning"
        ]
      },
      silence: {
        standard: [
          "The field is quiet—a time for individual reflection.",
          "The collective channels are resting today.",
          "A contemplative pause in the archetypal weather.",
          "The deeper currents are moving below the surface."
        ],
        expert: [
          "Minimal field activity: <0.2 intensity",
          "Low collective engagement - individual processing phase",
          "Background archetypal activity only"
        ]
      }
    };

    const weather = weatherCopy[weatherCondition as keyof typeof weatherCopy];
    const transmission = transmissionCopy[transmissionQuality as keyof typeof transmissionCopy];
    
    return {
      standard: [...(weather?.standard || []), ...(transmission?.standard || [])],
      expert: [...(weather?.expert || []), ...(transmission?.expert || [])]
    };
  }

  /**
   * Archetypal Pattern Map Copy
   */
  static getArchetypalMapCopy(dominantArchetype: string, element: string, intensity: number): CopyVariations {
    const archetypeDescriptions = {
      Transformation: {
        standard: [
          "The Transformation archetype is moving through the collective.",
          "Deep change is constellating across multiple participants.",
          "The field carries themes of dissolution and renewal.",
          "Metamorphosis energy is particularly active right now."
        ],
        expert: [
          `Transformation archetype: ${(intensity * 100).toFixed(0)}% activation`,
          `Primary element: ${element} | Phase: Active dissolution`,
          `Multi-participant synchronistic alignment detected`
        ]
      },
      Initiation: {
        standard: [
          "Initiation energy is flowing through the shared space.",
          "The field carries themes of breakthrough and courage.",
          "Multiple participants are encountering threshold experiences.",
          "The archetype of beginning is strongly present."
        ],
        expert: [
          `Initiation archetype: ${(intensity * 100).toFixed(0)}% activation`,
          `Primary element: ${element} | Phase: Active confrontation`,
          `Threshold experiences clustering across participants`
        ]
      },
      Integration: {
        standard: [
          "Integration themes are weaving through the collective.",
          "The field emphasizes grounding and embodiment.",
          "Multiple participants are working to bring insights into form.",
          "The archetype of synthesis is gently active."
        ],
        expert: [
          `Integration archetype: ${(intensity * 100).toFixed(0)}% activation`,
          `Primary element: ${element} | Phase: Embodiment focus`,
          `Collective grounding patterns emerging`
        ]
      },
      Liberation: {
        standard: [
          "Liberation energy is moving through the shared field.",
          "The collective carries themes of freedom and release.",
          "Multiple participants are experiencing expanded perspective.",
          "The archetype of transcendence is particularly clear."
        ],
        expert: [
          `Liberation archetype: ${(intensity * 100).toFixed(0)}% activation`,
          `Primary element: ${element} | Phase: Perspective expansion`,
          `Collective breakthrough patterns detected`
        ]
      },
      Unity: {
        standard: [
          "Unity consciousness is touching the collective space.",
          "The field holds themes of wholeness and recognition.",
          "Multiple participants are sensing deeper connections.",
          "The archetype of synthesis is luminously present."
        ],
        expert: [
          `Unity archetype: ${(intensity * 100).toFixed(0)}% activation`,
          `Primary element: ${element} | Phase: Recognition synthesis`,
          `High coherence across individual-collective boundary`
        ]
      }
    };

    const descriptions = archetypeDescriptions[dominantArchetype as keyof typeof archetypeDescriptions];
    
    if (!descriptions) {
      return {
        standard: [`The ${dominantArchetype} archetype is active in the field.`],
        expert: [`${dominantArchetype}: ${(intensity * 100).toFixed(0)}% activation`]
      };
    }

    return descriptions;
  }

  /**
   * Field Intensity Chart Copy
   */
  static getFieldIntensityCopy(currentIntensity: number, trend: 'rising' | 'falling' | 'stable'): CopyVariations {
    const intensityLevel = currentIntensity > 0.7 ? 'high' : currentIntensity > 0.4 ? 'moderate' : 'low';
    
    const copy = {
      high: {
        standard: [
          "The field is highly activated—strong currents moving through.",
          "Intense archetypal weather with significant collective activity.",
          "The shared space is electric with transformational energy.",
          "Peak conditions for collective breakthrough experiences."
        ],
        expert: [
          `High intensity: ${(currentIntensity * 100).toFixed(0)}% field activation`,
          `Trend: ${trend} | Peak collective engagement detected`,
          `Multiple simultaneous archetypal constellations active`
        ]
      },
      moderate: {
        standard: [
          "Balanced activity flowing through the collective field.",
          "Moderate archetypal weather with steady engagement.",
          "The field carries a comfortable charge for exploration.",
          "Good conditions for both individual and group work."
        ],
        expert: [
          `Moderate intensity: ${(currentIntensity * 100).toFixed(0)}% field activation`,
          `Trend: ${trend} | Stable collective participation levels`,
          `Balanced archetypal activity across multiple themes`
        ]
      },
      low: {
        standard: [
          "Quiet conditions in the collective field—time for integration.",
          "Gentle archetypal weather with space for reflection.",
          "The shared field is restful and contemplative.",
          "Good conditions for individual processing and preparation."
        ],
        expert: [
          `Low intensity: ${(currentIntensity * 100).toFixed(0)}% field activation`,
          `Trend: ${trend} | Individual processing phase detected`,
          `Background archetypal activity with minimal collective charge`
        ]
      }
    };

    return copy[intensityLevel];
  }

  /**
   * Transmission Status Gauge Copy
   */
  static getTransmissionCopy(clarity: number, recommendation: string): CopyVariations {
    const clarityLevel = clarity > 0.7 ? 'excellent' : clarity > 0.4 ? 'good' : clarity > 0.2 ? 'mixed' : 'difficult';
    
    const copy = {
      excellent: {
        standard: [
          "Conditions favor grounded insight.",
          "The field supports clear understanding and shared wisdom.",
          "Excellent clarity for both individual and collective work.",
          "The archetypal channels are wide open and clear."
        ],
        expert: [
          `Transmission clarity: ${(clarity * 100).toFixed(0)}%`,
          `Optimal signal-to-noise ratio detected`,
          `Recommendation: ${recommendation}`
        ]
      },
      good: {
        standard: [
          "Good conditions for careful exploration.",
          "The field supports steady progress with attention.",
          "Clear enough for meaningful work with some patience.",
          "The channels are open but require focus."
        ],
        expert: [
          `Transmission clarity: ${(clarity * 100).toFixed(0)}%`,
          `Moderate signal clarity with manageable interference`,
          `Recommendation: ${recommendation}`
        ]
      },
      mixed: {
        standard: [
          "Proceed with extra attention to mixed signals.",
          "The field carries both clarity and confusion—discern carefully.",
          "Some static in the channels requires patient listening.",
          "Truth and distraction are both present—filter mindfully."
        ],
        expert: [
          `Transmission clarity: ${(clarity * 100).toFixed(0)}%`,
          `Mixed signal conditions - elevated discernment required`,
          `Recommendation: ${recommendation}`
        ]
      },
      difficult: {
        standard: [
          "Focus on individual practice and inner work.",
          "The collective channels are noisy—return to personal clarity.",
          "Heavy weather in the field—shelter in individual practices.",
          "Time for solo work while the collective storm passes."
        ],
        expert: [
          `Transmission clarity: ${(clarity * 100).toFixed(0)}%`,
          `Poor signal conditions - individual focus recommended`,
          `Recommendation: ${recommendation}`
        ]
      }
    };

    return copy[clarityLevel];
  }

  /**
   * Synchronistic Resonances Copy
   */
  static getResonanceCopy(theme: string, participantCount: number, strength: number): CopyVariations {
    const strengthLevel = strength > 0.7 ? 'strong' : strength > 0.4 ? 'moderate' : 'emerging';
    
    return {
      standard: [
        `${participantCount} participants are encountering similar ${theme.toLowerCase()} themes.`,
        `A ${strengthLevel} resonance around "${theme}" is moving through the field.`,
        `Synchronistic alignment on ${theme.toLowerCase()} across multiple individuals.`,
        `The field is weaving connections through shared ${theme.toLowerCase()} experiences.`
      ],
      expert: [
        `Theme: ${theme} | Participants: ${participantCount} | Strength: ${(strength * 100).toFixed(0)}%`,
        `Synchronistic cluster detected with ${strengthLevel} coherence`,
        `Multi-participant pattern recognition across ${theme} domain`
      ]
    };
  }

  /**
   * Seasonal/Lunar Correlations Copy
   */
  static getSeasonalCopy(season: string, lunarPhase: string, correlation: string): CopyVariations {
    return {
      standard: [
        `${season} ${lunarPhase} moon patterns show ${correlation}.`,
        `The ${lunarPhase} moon in ${season} season correlates with heightened daimonic activity.`,
        `Natural cycles are amplifying archetypal themes during this ${season} ${lunarPhase} period.`,
        `The seasonal-lunar combination supports ${correlation.toLowerCase()}.`
      ],
      expert: [
        `Season: ${season} | Lunar: ${lunarPhase} | Correlation: ${correlation}`,
        `Temporal pattern analysis: ${season}-${lunarPhase} = elevated activity`,
        `Cyclical amplification detected in archetypal constellation patterns`
      ]
    };
  }

  /**
   * Network Visualization Copy
   */
  static getNetworkCopy(clusterCount: number, totalConnections: number): CopyVariations {
    return {
      standard: [
        `${clusterCount} synchronistic clusters are forming across the network.`,
        `The field shows ${totalConnections} meaningful connections between participants.`,
        `Collective patterns are weaving ${clusterCount} distinct resonance clusters.`,
        `The archetypal web contains ${totalConnections} active connection threads.`
      ],
      expert: [
        `Clusters: ${clusterCount} | Connections: ${totalConnections}`,
        `Network topology: ${clusterCount} discrete resonance communities`,
        `Graph analysis: ${totalConnections} edges across ${clusterCount} components`
      ]
    };
  }

  /**
   * Error States Copy
   */
  static getErrorCopy(errorType: 'no_data' | 'loading' | 'connection'): CopyVariations {
    const errorCopy = {
      no_data: {
        standard: [
          "The field is resting—no significant patterns to report right now.",
          "Quiet period in the collective space—a time for individual reflection.",
          "The archetypal weather is calm and still today."
        ],
        expert: [
          "No data: Insufficient collective activity for pattern detection",
          "Below minimum threshold for meaningful collective analysis",
          "Individual processing phase - collective patterns dormant"
        ]
      },
      loading: {
        standard: [
          "Attuning to the collective field...",
          "Listening to the archetypal currents...",
          "Reading the patterns in the shared space..."
        ],
        expert: [
          "Loading collective field analysis...",
          "Processing archetypal pattern data...",
          "Calculating synchronistic correlations..."
        ]
      },
      connection: {
        standard: [
          "Unable to sense the collective field right now—try again shortly.",
          "The connection to the shared space is unclear at the moment.",
          "Having trouble reading the archetypal weather—please refresh."
        ],
        expert: [
          "Connection error: Unable to retrieve collective field data",
          "Database connection timeout - retry in progress",
          "Service temporarily unavailable - attempting reconnection"
        ]
      }
    };

    return errorCopy[errorType];
  }

  /**
   * Interactive Elements Copy
   */
  static getInteractiveCopy(): Record<string, CopyVariations> {
    return {
      expertToggle: {
        standard: ["Switch to technical view"],
        expert: ["Switch to phenomenological view"]
      },
      refreshButton: {
        standard: ["Refresh the field reading"],
        expert: ["Reload collective data"]
      },
      timeRangeSelector: {
        standard: ["View different time periods"],
        expert: ["Adjust temporal analysis window"]
      },
      archetypalFilter: {
        standard: ["Focus on specific archetypal themes"],
        expert: ["Filter by archetype activation levels"]
      },
      privacyInfo: {
        standard: ["All patterns are anonymized and privacy-protected"],
        expert: ["Data aggregated with full participant anonymization"]
      }
    };
  }

  /**
   * Tooltip Copy
   */
  static getTooltipCopy(): Record<string, CopyVariations> {
    return {
      fieldIntensity: {
        standard: ["How active the collective archetypal field is right now"],
        expert: ["Calculated from avg_tension + avg_surprise across all participants"]
      },
      transmissionClarity: {
        standard: ["How clear the messages coming through the field are"],
        expert: ["Signal-to-noise ratio: field_intensity minus trickster_risk"]
      },
      archetypalActivation: {
        standard: ["Which archetypal themes are most active in the collective"],
        expert: ["Frequency analysis of recurring patterns across participant data"]
      },
      synchronisticResonance: {
        standard: ["When multiple people encounter similar themes simultaneously"],
        expert: ["Temporal clustering of thematically similar daimonic encounters"]
      },
      seasonalCorrelation: {
        standard: ["How natural cycles affect collective archetypal activity"],
        expert: ["Statistical correlation between temporal cycles and field intensity"]
      }
    };
  }

  /**
   * Get random copy variation
   */
  static getRandomVariation(copy: CopyVariations, mode: 'standard' | 'expert' = 'standard'): string {
    const options = copy[mode];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get contextual copy based on conditions
   */
  static getContextualCopy(
    condition: string,
    intensity: number,
    mode: 'standard' | 'expert' = 'standard'
  ): string {
    // This would select appropriate copy based on multiple contextual factors
    // For now, return a contextually appropriate default
    
    if (condition === 'stormy' && intensity > 0.8) {
      return mode === 'standard' 
        ? "The field is in full storm—powerful teachings moving through in riddle form."
        : `Critical intensity: ${(intensity * 100).toFixed(0)}% | Maximum trickster activity detected`;
    }
    
    if (condition === 'clear' && intensity > 0.7) {
      return mode === 'standard'
        ? "Luminous clarity in the collective—rare conditions for shared insight."
        : `Optimal conditions: ${(intensity * 100).toFixed(0)}% intensity with <20% interference`;
    }
    
    return mode === 'standard'
      ? "The field carries its daily weather of archetypal currents."
      : `Standard conditions: ${(intensity * 100).toFixed(0)}% baseline activity`;
  }
}