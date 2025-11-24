/**
 * Symbol Dictionary - Modular archetypal symbol recognition system
 * Maps recurring mythic symbols to elemental and psychological meanings
 */

export interface SymbolEntry {
  names: string[];           // Keywords to detect
  element: string;           // Primary elemental association
  meaning: string;           // Core symbolic meaning
  transformationPotential: number; // 0-1 scale
  contexts: {
    appearance: string;      // When this symbol typically appears
    message: string;         // What it's trying to communicate
    practice?: string;       // Suggested ritual/practice
  };
  relationships?: string[];  // Related symbols
}

export interface SymbolCategory {
  name: string;
  description: string;
  symbols: Record<string, SymbolEntry>;
}

/**
 * Core Symbol Dictionary
 * Organized by symbolic categories
 */
export const SYMBOL_DICTIONARY: Record<string, SymbolCategory> = {
  
  // CELESTIAL SYMBOLS
  celestial: {
    name: "Celestial Bodies",
    description: "Sky beings that guide from above",
    symbols: {
      Moon: {
        names: ['moon', 'lunar', 'crescent', 'full moon', 'new moon'],
        element: 'Water',
        meaning: 'Cycles, intuition, the unconscious, feminine mysteries',
        transformationPotential: 0.8,
        contexts: {
          appearance: 'During emotional processing or cyclical transitions',
          message: 'Honor your rhythms. Not all growth is linear.',
          practice: 'Moon gazing meditation, lunar cycle tracking'
        },
        relationships: ['Tide', 'Blood', 'Dream']
      },
      
      Sun: {
        names: ['sun', 'solar', 'sunrise', 'sunset', 'daybreak'],
        element: 'Fire',
        meaning: 'Consciousness, vitality, masculine principle, illumination',
        transformationPotential: 0.7,
        contexts: {
          appearance: 'At moments of clarity or new beginnings',
          message: 'Your power is rising. Step into your radiance.',
          practice: 'Sun salutation, dawn meditation'
        },
        relationships: ['Phoenix', 'Gold', 'Crown']
      },
      
      Stars: {
        names: ['star', 'stars', 'constellation', 'cosmos', 'galaxy'],
        element: 'Aether',
        meaning: 'Destiny, navigation, infinite possibility, ancestors',
        transformationPotential: 0.6,
        contexts: {
          appearance: 'When seeking direction or remembering purpose',
          message: 'You are part of something vast. Trust the larger pattern.',
          practice: 'Star gazing, constellation mapping your journey'
        },
        relationships: ['Compass', 'Map', 'Ancestors']
      }
    }
  },

  // ANIMAL GUIDES
  animals: {
    name: "Animal Guides",
    description: "Creature teachers bringing specific medicine",
    symbols: {
      Stag: {
        names: ['stag', 'deer', 'hart', 'antler', 'buck'],
        element: 'Earth',
        meaning: 'Noble leadership, regeneration, connection to forest wisdom',
        transformationPotential: 0.7,
        contexts: {
          appearance: 'When called to step into leadership or sovereignty',
          message: 'Your antlers are your crown. Lead with gentle strength.',
          practice: 'Forest walking, antler visualization for boundaries'
        },
        relationships: ['Forest', 'Crown', 'King']
      },
      
      Snake: {
        names: ['snake', 'serpent', 'viper', 'cobra', 'python'],
        element: 'Fire',
        meaning: 'Transformation, shedding, kundalini, primal wisdom',
        transformationPotential: 0.95,
        contexts: {
          appearance: 'During major life transitions or awakening',
          message: 'It\'s time to shed the old skin. Transformation is here.',
          practice: 'Serpent breathing, shedding ritual with paper burning'
        },
        relationships: ['Phoenix', 'Dragon', 'Spiral']
      },
      
      Wolf: {
        names: ['wolf', 'wolves', 'pack', 'howl', 'lone wolf'],
        element: 'Air',
        meaning: 'Instinct, loyalty, wildness, teaching, pathfinding',
        transformationPotential: 0.6,
        contexts: {
          appearance: 'When torn between wildness and civilization',
          message: 'Trust your instincts. Your pack (chosen family) needs you.',
          practice: 'Howling practice, tracking your instincts journal'
        },
        relationships: ['Pack', 'Moon', 'Hunt']
      },
      
      Raven: {
        names: ['raven', 'crow', 'corvid', 'blackbird'],
        element: 'Aether',
        meaning: 'Magic, messages between worlds, transformation, trickster',
        transformationPotential: 0.8,
        contexts: {
          appearance: 'At thresholds between life chapters',
          message: 'The veil is thin. Messages from beyond are coming through.',
          practice: 'Oracle work, divination, shadow integration'
        },
        relationships: ['Death', 'Rebirth', 'Message']
      }
    }
  },

  // NATURAL FEATURES
  landscape: {
    name: "Sacred Landscape",
    description: "Earth features holding deep medicine",
    symbols: {
      Mountain: {
        names: ['mountain', 'peak', 'summit', 'climb', 'ascent'],
        element: 'Earth',
        meaning: 'Achievement, perspective, sacred challenge, stability',
        transformationPotential: 0.5,
        contexts: {
          appearance: 'When facing major challenges or seeking overview',
          message: 'The climb transforms you. Each step is sacred.',
          practice: 'Walking meditation uphill, building cairns'
        },
        relationships: ['Stone', 'Cave', 'Eagle']
      },
      
      River: {
        names: ['river', 'stream', 'current', 'flow', 'rapids'],
        element: 'Water',
        meaning: 'Life force, emotional flow, journey, cleansing',
        transformationPotential: 0.6,
        contexts: {
          appearance: 'When emotions need to move or life feels stagnant',
          message: 'Let yourself flow. The river knows the way.',
          practice: 'Water blessing, emotional release by moving water'
        },
        relationships: ['Ocean', 'Rain', 'Tears']
      },
      
      Cave: {
        names: ['cave', 'cavern', 'grotto', 'underground', 'darkness'],
        element: 'Earth',
        meaning: 'Womb, unconscious depths, initiation, hidden treasures',
        transformationPotential: 0.9,
        contexts: {
          appearance: 'During descent into shadow work or deep healing',
          message: 'The treasure lies in the darkness. Descend to ascend.',
          practice: 'Cave visualization, darkness meditation'
        },
        relationships: ['Womb', 'Dragon', 'Crystal']
      },
      
      Tree: {
        names: ['tree', 'oak', 'pine', 'roots', 'branches', 'forest'],
        element: 'Earth',
        meaning: 'Connection between worlds, ancestry, growth, shelter',
        transformationPotential: 0.4,
        contexts: {
          appearance: 'When needing grounding or ancestral connection',
          message: 'Your roots run deep. You are held by ancient wisdom.',
          practice: 'Tree meditation, ancestry altar work'
        },
        relationships: ['Roots', 'Ancestors', 'Forest']
      }
    }
  },

  // THRESHOLD SYMBOLS
  thresholds: {
    name: "Threshold Markers",
    description: "Symbols of transition and transformation",
    symbols: {
      Bridge: {
        names: ['bridge', 'crossing', 'passage', 'span', 'connection'],
        element: 'Air',
        meaning: 'Transition, connection, moving between states',
        transformationPotential: 0.7,
        contexts: {
          appearance: 'Between life chapters or paradigms',
          message: 'You\'re crossing over. Don\'t look back.',
          practice: 'Bridge visualization, threshold ritual'
        },
        relationships: ['Gate', 'Door', 'Path']
      },
      
      Mirror: {
        names: ['mirror', 'reflection', 'looking glass', 'surface'],
        element: 'Water',
        meaning: 'Self-recognition, shadow work, truth-seeing, doubling',
        transformationPotential: 0.8,
        contexts: {
          appearance: 'When facing self-truth or projection',
          message: 'What you see in others lives in you. Own your reflection.',
          practice: 'Mirror gazing, shadow dialogue work'
        },
        relationships: ['Shadow', 'Twin', 'Lake']
      },
      
      Spiral: {
        names: ['spiral', 'helix', 'coil', 'vortex', 'labyrinth'],
        element: 'Aether',
        meaning: 'Evolution, return with difference, sacred geometry, DNA',
        transformationPotential: 0.9,
        contexts: {
          appearance: 'When revisiting old patterns at new levels',
          message: 'You\'re not going in circles. You\'re spiraling up.',
          practice: 'Walking spiral meditation, drawing sacred spirals'
        },
        relationships: ['Snake', 'Shell', 'Galaxy']
      },
      
      Gate: {
        names: ['gate', 'door', 'portal', 'entrance', 'threshold'],
        element: 'Aether',
        meaning: 'Initiation, permission, new realm access, guardian',
        transformationPotential: 0.85,
        contexts: {
          appearance: 'Before major life transitions',
          message: 'You have permission to enter. The guardian awaits.',
          practice: 'Threshold blessing, gatekeeper dialogue'
        },
        relationships: ['Key', 'Guardian', 'Password']
      }
    }
  },

  // ELEMENTAL FORCES
  elements: {
    name: "Elemental Forces",
    description: "Pure elemental energies manifesting",
    symbols: {
      Flame: {
        names: ['flame', 'fire', 'blaze', 'ember', 'spark'],
        element: 'Fire',
        meaning: 'Passion, purification, inspiration, destruction/creation',
        transformationPotential: 0.8,
        contexts: {
          appearance: 'When old forms need burning for new growth',
          message: 'Let it burn. Phoenix rises from these ashes.',
          practice: 'Candle magic, fire ceremony, anger as fuel ritual'
        },
        relationships: ['Phoenix', 'Forge', 'Sun']
      },
      
      Ocean: {
        names: ['ocean', 'sea', 'waves', 'tide', 'depths'],
        element: 'Water',
        meaning: 'Collective unconscious, vast emotion, origin, mystery',
        transformationPotential: 0.7,
        contexts: {
          appearance: 'When individual merges with collective',
          message: 'You are drop and ocean both. Feel the vastness.',
          practice: 'Ocean breathing, salt water ritual'
        },
        relationships: ['Whale', 'Pearl', 'Abyss']
      },
      
      Storm: {
        names: ['storm', 'thunder', 'lightning', 'tempest', 'hurricane'],
        element: 'Air',
        meaning: 'Sudden change, clearing, divine power, disruption',
        transformationPotential: 0.9,
        contexts: {
          appearance: 'When life needs dramatic clearing',
          message: 'The storm clears what needs clearing. Let it rage.',
          practice: 'Storm dancing, lightning visualization for breakthroughs'
        },
        relationships: ['Lightning', 'Rain', 'Wind']
      },
      
      Crystal: {
        names: ['crystal', 'gem', 'diamond', 'quartz', 'stone'],
        element: 'Earth',
        meaning: 'Clarity, information storage, perfection through pressure',
        transformationPotential: 0.5,
        contexts: {
          appearance: 'When clarity emerges from pressure',
          message: 'Pressure creates diamonds. Your clarity is forming.',
          practice: 'Crystal meditation, gem elixir making'
        },
        relationships: ['Cave', 'Mountain', 'Light']
      }
    }
  }
};

/**
 * Symbol Detection Engine
 * Scans text for archetypal symbols using the dictionary
 */
export class SymbolDetector {
  private dictionary: typeof SYMBOL_DICTIONARY;

  constructor(customDictionary?: typeof SYMBOL_DICTIONARY) {
    this.dictionary = customDictionary || SYMBOL_DICTIONARY;
  }

  /**
   * Detect all symbols present in text
   */
  detectSymbols(text: string): Array<{
    symbol: string;
    category: string;
    entry: SymbolEntry;
  }> {
    const detected: Array<{
      symbol: string;
      category: string;
      entry: SymbolEntry;
    }> = [];
    
    const lowerText = text.toLowerCase();

    // Scan all categories and symbols
    for (const [categoryKey, category] of Object.entries(this.dictionary)) {
      for (const [symbolKey, symbolEntry] of Object.entries(category.symbols)) {
        // Check if any of the symbol's names appear in the text
        const found = symbolEntry.names.some(name => lowerText.includes(name));
        
        if (found) {
          detected.push({
            symbol: symbolKey,
            category: categoryKey,
            entry: symbolEntry
          });
        }
      }
    }

    return detected;
  }

  /**
   * Get transformation potential for detected symbols
   */
  getTransformationPotential(symbols: string[]): number {
    let totalPotential = 0;
    let count = 0;

    for (const symbol of symbols) {
      // Search for symbol in dictionary
      for (const category of Object.values(this.dictionary)) {
        if (category.symbols[symbol]) {
          totalPotential += category.symbols[symbol].transformationPotential;
          count++;
          break;
        }
      }
    }

    return count > 0 ? totalPotential / count : 0;
  }

  /**
   * Get suggested practices based on detected symbols
   */
  getSuggestedPractices(symbols: string[]): string[] {
    const practices: Set<string> = new Set();

    for (const symbol of symbols) {
      for (const category of Object.values(this.dictionary)) {
        const entry = category.symbols[symbol];
        if (entry?.contexts.practice) {
          practices.add(entry.contexts.practice);
        }
      }
    }

    return Array.from(practices);
  }

  /**
   * Get symbol relationships (find related symbols)
   */
  getRelatedSymbols(symbol: string): string[] {
    for (const category of Object.values(this.dictionary)) {
      const entry = category.symbols[symbol];
      if (entry?.relationships) {
        return entry.relationships;
      }
    }
    return [];
  }

  /**
   * Add custom symbol to dictionary (runtime extension)
   */
  addSymbol(category: string, symbolKey: string, entry: SymbolEntry): void {
    if (!this.dictionary[category]) {
      this.dictionary[category] = {
        name: category,
        description: 'Custom category',
        symbols: {}
      };
    }
    
    this.dictionary[category].symbols[symbolKey] = entry;
  }

  /**
   * Get narrative for detected symbols
   */
  generateSymbolNarrative(
    detectedSymbols: Array<{ symbol: string; category: string; entry: SymbolEntry }>
  ): string {
    if (detectedSymbols.length === 0) {
      return 'No archetypal symbols detected in this session.';
    }

    const symbolNames = detectedSymbols.map(d => d.symbol);
    const elements = [...new Set(detectedSymbols.map(d => d.entry.element))];
    const avgTransformation = detectedSymbols.reduce((sum, d) => sum + d.entry.transformationPotential, 0) / detectedSymbols.length;

    let narrative = `The symbols of ${symbolNames.join(', ')} have appeared in your journey. `;
    
    if (avgTransformation > 0.8) {
      narrative += 'These are powerful transformation markers — profound change is underway. ';
    } else if (avgTransformation > 0.6) {
      narrative += 'These symbols suggest you\'re in active transition. ';
    } else {
      narrative += 'These symbols offer gentle guidance and support. ';
    }

    narrative += `They carry ${elements.join(' and ')} medicine. `;

    // Add specific messages
    const messages = detectedSymbols
      .slice(0, 2) // Take first 2 symbols
      .map(d => d.entry.contexts.message);
    
    if (messages.length > 0) {
      narrative += messages.join(' ');
    }

    return narrative;
  }
}

// Export singleton instance
export const symbolDetector = new SymbolDetector();

// Export for extension
export default SymbolDetector;