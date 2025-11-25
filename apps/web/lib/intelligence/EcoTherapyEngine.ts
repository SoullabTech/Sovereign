/**
 * ECO-THERAPY / NATURE-BASED THERAPY ENGINE
 *
 * Based on Ecopsychology, Nature-Based Therapy, and Wilderness Therapy
 *
 * Detects:
 * - Nature connection vs disconnection
 * - Ecological grief / climate anxiety
 * - Biophilia (innate connection to life)
 * - Restorative nature experiences
 * - Place-based belonging
 *
 * Core Insight: Human psyche co-evolved with nature. Disconnection from
 * the natural world creates existential dis-ease. Reconnection restores
 * context, belonging, and aliveness.
 *
 * Elemental Resonance: AETHER (ecological field) + EARTH (place, grounding)
 */

export interface EcoTherapyState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Nature Connection
  natureConnection: {
    connected: boolean;
    disconnected: boolean;
    longing: boolean; // Longing for nature
    level: number; // 0-1 (0 = total disconnect, 1 = deep connection)
    indicators: string[];
  };

  // Biophilia (love of life/nature)
  biophilia: {
    detected: boolean;
    expressions: string[]; // How biophilia shows up
    vitality: number; // 0-1 (aliveness through nature)
    indicators: string[];
  };

  // Ecological Grief / Climate Anxiety
  ecologicalGrief: {
    detected: boolean;
    type: 'climate-anxiety' | 'species-loss' | 'habitat-destruction' | 'general-grief' | 'none';
    intensity: number; // 0-1
    overwhelm: boolean; // Is it overwhelming?
    indicators: string[];
  };

  // Restorative Nature Experiences
  restoration: {
    detected: boolean;
    type: 'forest' | 'water' | 'mountains' | 'garden' | 'wilderness' | 'urban-nature' | 'mixed';
    healing: boolean; // Is nature providing healing?
    indicators: string[];
  };

  // Place-Based Belonging
  placeBelonging: {
    detected: boolean;
    rooted: boolean; // Feeling rooted in a place
    displaced: boolean; // Feeling displaced/unrooted
    bioregionalAwareness: boolean; // Awareness of local ecosystem
    indicators: string[];
  };

  // Nature as Mirror/Teacher
  natureMirroring: {
    detected: boolean;
    patterns: string[]; // Natural patterns that mirror inner process
    teaching: boolean; // Nature teaching/showing something
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    aether: number; // Ecological field, web of life, interconnection
    earth: number; // Grounding in place, rootedness, embodiment
  };
}

export class EcoTherapyEngine {
  extract(text: string): EcoTherapyState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    const natureConnection = this.detectNatureConnection(lower);
    const biophilia = this.detectBiophilia(lower);
    const ecologicalGrief = this.detectEcologicalGrief(lower);
    const restoration = this.detectRestoration(lower);
    const placeBelonging = this.detectPlaceBelonging(lower);
    const natureMirroring = this.detectNatureMirroring(lower);

    const elementalResonance = this.calculateElementalResonance(
      natureConnection,
      placeBelonging
    );

    if (natureConnection.connected || natureConnection.disconnected) {
      indicators.push(...natureConnection.indicators);
    }
    if (biophilia.detected) indicators.push(...biophilia.indicators);
    if (ecologicalGrief.detected) indicators.push(...ecologicalGrief.indicators);
    if (restoration.detected) indicators.push(...restoration.indicators);
    if (placeBelonging.detected) indicators.push(...placeBelonging.indicators);
    if (natureMirroring.detected) indicators.push(...natureMirroring.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.7 : 0;

    return {
      detected,
      confidence,
      indicators,
      natureConnection,
      biophilia,
      ecologicalGrief,
      restoration,
      placeBelonging,
      natureMirroring,
      elementalResonance
    };
  }

  private detectNatureConnection(text: string): EcoTherapyState['natureConnection'] {
    let connected = false;
    let disconnected = false;
    let longing = false;
    let level = 0.5;
    const indicators: string[] = [];

    // Connected to nature
    const connectionPatterns = [
      /\b(walk|hike|forest|woods|mountain|river|ocean|tree|garden)\b/i,
      /\b(nature|outside|outdoors|earth|land|wild)\b/i,
      /\b(feel (connected|alive|grounded|whole) (in|with) nature)\b/i
    ];

    for (const pattern of connectionPatterns) {
      if (pattern.test(text)) {
        connected = true;
        level = 0.7;
        indicators.push('nature-connection');
        break;
      }
    }

    // Disconnected from nature
    if (/\b(disconnected from|cut off from|lost connection|never (go|get) outside)\b/i.test(text)) {
      disconnected = true;
      level = 0.2;
      indicators.push('nature-disconnection');
    }

    // Longing for nature
    if (/\b(miss|long for|need|crave).{0,20}(nature|outside|forest|ocean|mountain)\b/i.test(text)) {
      longing = true;
      level = 0.4;
      indicators.push('nature-longing');
    }

    // Deep connection
    if (/\b(belong|part of|one with|home).{0,20}(nature|earth|land|wild)\b/i.test(text)) {
      connected = true;
      level = 0.9;
      indicators.push('deep-nature-connection');
    }

    return { connected, disconnected, longing, level, indicators };
  }

  private detectBiophilia(text: string): EcoTherapyState['biophilia'] {
    let detected = false;
    const expressions: string[] = [];
    let vitality = 0.5;
    const indicators: string[] = [];

    // Love of life/nature
    const biophilicPatterns = [
      { pattern: /\b(love|adore) (the|being in) (nature|forest|ocean|mountains)\b/i, expression: 'love of nature' },
      { pattern: /\b(alive|vital|energized|renewed).{0,20}(nature|outside|earth)\b/i, expression: 'vitality through nature' },
      { pattern: /\b(awe|wonder|beauty|magnificent).{0,20}(nature|tree|mountain|sky)\b/i, expression: 'awe in nature' },
      { pattern: /\b(animals|birds|trees|plants).{0,20}(bring|give).{0,20}(joy|peace|comfort)\b/i, expression: 'connection to living beings' }
    ];

    for (const { pattern, expression } of biophilicPatterns) {
      if (pattern.test(text)) {
        detected = true;
        expressions.push(expression);
        vitality = 0.8;
        indicators.push('biophilia');
      }
    }

    return { detected, expressions, vitality, indicators };
  }

  private detectEcologicalGrief(text: string): EcoTherapyState['ecologicalGrief'] {
    let detected = false;
    let type: EcoTherapyState['ecologicalGrief']['type'] = 'none';
    let intensity = 0.5;
    let overwhelm = false;
    const indicators: string[] = [];

    // Climate anxiety
    if (/\b(climate|warming|crisis|emergency).{0,20}(anxiety|anxious|terrified|scared)\b/i.test(text)) {
      detected = true;
      type = 'climate-anxiety';
      intensity = 0.8;
      indicators.push('climate-anxiety');
    }

    // Species loss / extinction
    if (/\b(extinct|species|animals|biodiversity).{0,20}(dying|loss|gone|disappear)\b/i.test(text)) {
      detected = true;
      type = 'species-loss';
      intensity = 0.7;
      indicators.push('species-loss-grief');
    }

    // Habitat destruction
    if (/\b(forest|trees|habitat|ecosystem).{0,20}(destroy|cut|loss|gone)\b/i.test(text)) {
      detected = true;
      type = 'habitat-destruction';
      intensity = 0.7;
      indicators.push('habitat-destruction-grief');
    }

    // General ecological grief
    if (/\b(griev(e|ing)|mourn(ing)?|heartbroken).{0,20}(earth|planet|nature|world)\b/i.test(text)) {
      detected = true;
      type = 'general-grief';
      intensity = 0.8;
      indicators.push('ecological-grief');
    }

    // Overwhelm
    if (detected && /\b(overwhelm|too much|can't bear|hopeless|helpless)\b/i.test(text)) {
      overwhelm = true;
      intensity = 0.9;
      indicators.push('ecological-overwhelm');
    }

    return { detected, type, intensity, overwhelm, indicators };
  }

  private detectRestoration(text: string): EcoTherapyState['restoration'] {
    let detected = false;
    let type: EcoTherapyState['restoration']['type'] = 'mixed';
    let healing = false;
    const indicators: string[] = [];

    // Type of nature
    if (/\b(forest|woods|trees)\b/i.test(text)) {
      detected = true;
      type = 'forest';
      indicators.push('forest-restoration');
    } else if (/\b(ocean|sea|beach|waves|water|river|lake)\b/i.test(text)) {
      detected = true;
      type = 'water';
      indicators.push('water-restoration');
    } else if (/\b(mountain|peak|summit|cliff)\b/i.test(text)) {
      detected = true;
      type = 'mountains';
      indicators.push('mountain-restoration');
    } else if (/\b(garden|soil|plant|grow)\b/i.test(text)) {
      detected = true;
      type = 'garden';
      indicators.push('garden-restoration');
    } else if (/\b(wilderness|wild|remote)\b/i.test(text)) {
      detected = true;
      type = 'wilderness';
      indicators.push('wilderness-restoration');
    } else if (/\b(park|trail|green space)\b/i.test(text)) {
      detected = true;
      type = 'urban-nature';
      indicators.push('urban-nature-restoration');
    }

    // Healing/restorative experience
    if (/\b(heal|healing|restore|restoring|soothe|calm|peace|relief).{0,20}(nature|outside|forest|ocean)\b/i.test(text)) {
      healing = true;
      indicators.push('nature-as-healer');
    }

    return { detected, type, healing, indicators };
  }

  private detectPlaceBelonging(text: string): EcoTherapyState['placeBelonging'] {
    let detected = false;
    let rooted = false;
    let displaced = false;
    let bioregionalAwareness = false;
    const indicators: string[] = [];

    // Rooted in place
    if (/\b(rooted|belong|home|my (land|place|bioregion))\b/i.test(text)) {
      detected = true;
      rooted = true;
      indicators.push('place-rooted');
    }

    // Displaced/unrooted
    if (/\b(displaced|unrooted|don't belong|no (place|home)|lost)\b/i.test(text)) {
      detected = true;
      displaced = true;
      indicators.push('place-displaced');
    }

    // Bioregional awareness
    if (/\b(bioregion|watershed|ecosystem|native|indigenous).{0,20}(plant|species|land)\b/i.test(text)) {
      detected = true;
      bioregionalAwareness = true;
      indicators.push('bioregional-awareness');
    }

    return { detected, rooted, displaced, bioregionalAwareness, indicators };
  }

  private detectNatureMirroring(text: string): EcoTherapyState['natureMirroring'] {
    let detected = false;
    const patterns: string[] = [];
    let teaching = false;
    const indicators: string[] = [];

    // Nature as mirror
    const mirrorPatterns = [
      { pattern: /\b(like (the|a) (tree|river|mountain|ocean))\b/i, mirror: 'natural metaphor' },
      { pattern: /\b(seasons?|cycles?).{0,20}(my|life|process)\b/i, mirror: 'seasonal/cyclical patterns' },
      { pattern: /\b(nature (shows|teaches|reminds))\b/i, mirror: 'nature as teacher' },
      { pattern: /\b(storm|weather).{0,20}(inside|within|emotions?)\b/i, mirror: 'weather as emotion mirror' }
    ];

    for (const { pattern, mirror } of mirrorPatterns) {
      if (pattern.test(text)) {
        detected = true;
        patterns.push(mirror);
        indicators.push('nature-mirroring');
      }
    }

    // Nature teaching
    if (/\b(nature (teaches|shows|tells|reminds)|learn(ed|ing) from (the )?(tree|forest|ocean))\b/i.test(text)) {
      teaching = true;
      indicators.push('nature-as-teacher');
    }

    return { detected, patterns, teaching, indicators };
  }

  private calculateElementalResonance(
    natureConnection: EcoTherapyState['natureConnection'],
    placeBelonging: EcoTherapyState['placeBelonging']
  ): EcoTherapyState['elementalResonance'] {
    // AETHER = Ecological field, web of life, interconnection
    const aether = natureConnection.level;

    // EARTH = Grounding in place, rootedness
    const earth = placeBelonging.rooted ? 0.8 : (placeBelonging.displaced ? 0.2 : 0.5);

    return { aether, earth };
  }
}

export const ecoTherapyEngine = new EcoTherapyEngine();
