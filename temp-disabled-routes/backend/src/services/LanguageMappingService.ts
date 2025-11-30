/**
 * Language Mapping Service
 * 
 * Transforms internal consciousness technology codes into phenomenological language
 * that feels natural and accessible. Supports expert mode toggle for revealing
 * internal structures when requested.
 */

import { LanguageMapping, ShadowMapping, Theme, ShadowSignal } from "../types/collectiveDashboard";

export class LanguageMappingService {
  // ==========================================================================
  // ELEMENTAL MAPPINGS (Water-2 → "deep emotional churn / rebirth work")
  // ==========================================================================
  
  private static readonly ELEMENTAL_MAPPINGS: LanguageMapping[] = [
    // Water Element
    { internal: "Water-1", phenomenological: "gentle emotional awareness / feeling safe to feel", category: "elemental" },
    { internal: "Water-2", phenomenological: "deep emotional churn / rebirth work", category: "elemental" },
    { internal: "Water-3", phenomenological: "tender grief surfacing / compassion capacity growing", category: "elemental" },
    
    // Fire Element  
    { internal: "Fire-1", phenomenological: "inner spark awakening / motivation returning", category: "elemental" },
    { internal: "Fire-2", phenomenological: "courage rising / decisive energy gathering", category: "elemental" },
    { internal: "Fire-3", phenomenological: "creative ignition / bold experiment energy", category: "elemental" },
    
    // Earth Element
    { internal: "Earth-1", phenomenological: "grounding into body / practical focus", category: "elemental" },
    { internal: "Earth-2", phenomenological: "organizing life basics / making things steady", category: "elemental" },
    { internal: "Earth-3", phenomenological: "systems clicking into place / dependable rhythm", category: "elemental" },
    
    // Air Element
    { internal: "Air-1", phenomenological: "mental fog lifting / communication opening", category: "elemental" },
    { internal: "Air-2", phenomenological: "clear thinking returning / honest dialogue", category: "elemental" },
    { internal: "Air-3", phenomenological: "pattern insight / connecting the dots", category: "elemental" },
    
    // Aether Element
    { internal: "Aether-1", phenomenological: "sensing something more / spiritual curiosity", category: "elemental" },
    { internal: "Aether-2", phenomenological: "liminal sensing / meaning opening", category: "elemental" },
    { internal: "Aether-3", phenomenological: "numinous coherence / quiet certainty", category: "elemental" }
  ];

  // ==========================================================================
  // ARCHETYPAL MAPPINGS
  // ==========================================================================
  
  private static readonly ARCHETYPAL_MAPPINGS: LanguageMapping[] = [
    { internal: "mother", phenomenological: "nurturing energy rising / protective care", category: "archetype" },
    { internal: "father", phenomenological: "clear boundaries / wise structure", category: "archetype" },
    { internal: "child", phenomenological: "wonder returning / playful spontaneity", category: "archetype" },
    { internal: "trickster", phenomenological: "creative chaos / breakthrough disruption", category: "archetype" },
    { internal: "sage", phenomenological: "wisdom emerging / teaching moments", category: "archetype" },
    { internal: "warrior", phenomenological: "courageous action / protective strength", category: "archetype" },
    { internal: "lover", phenomenological: "heart opening / intimate connection", category: "archetype" },
    { internal: "creator", phenomenological: "making something new / artistic flow", category: "archetype" },
    { internal: "destroyer", phenomenological: "letting go / clearing space", category: "archetype" },
    { internal: "healer", phenomenological: "restorative care / integration support", category: "archetype" },
    { internal: "seeker", phenomenological: "curious exploration / quest energy", category: "archetype" },
    { internal: "guide", phenomenological: "mentoring wisdom / showing the way", category: "archetype" }
  ];

  // ==========================================================================
  // SHADOW PATTERN MAPPINGS (gentle, non-pathologizing)
  // ==========================================================================
  
  private static readonly SHADOW_MAPPINGS: ShadowMapping[] = [
    {
      internal: "deflection",
      label: "gentle avoidance showing up",
      suggestion: "naming one small truth out loud tends to restore momentum."
    },
    {
      internal: "victim", 
      label: "feeling stuck in old stories",
      suggestion: "try asking 'what's one small thing I can influence right now?'"
    },
    {
      internal: "perfectionism",
      label: "waiting for everything to be perfect",
      suggestion: "experiment with 'good enough for now' and see what opens."
    },
    {
      internal: "spiritual_bypass",
      label: "floating above the messy human parts",
      suggestion: "bring one spiritual insight into a practical daily choice."
    },
    {
      internal: "intellectualization",
      label: "thinking about feelings instead of feeling them", 
      suggestion: "pause and notice what's happening in your body right now."
    },
    {
      internal: "control",
      label: "gripping tightly to how things should go",
      suggestion: "practice allowing one small thing to unfold naturally."
    }
  ];

  // ==========================================================================
  // SPIRAL PHASE MAPPINGS
  // ==========================================================================
  
  private static readonly PHASE_MAPPINGS: LanguageMapping[] = [
    { internal: "initiation", phenomenological: "fresh beginning / building trust", category: "phase" },
    { internal: "challenge", phenomenological: "facing resistance / working with difficulty", category: "phase" },
    { internal: "integration", phenomenological: "weaving insights together / embodying new awareness", category: "phase" },
    { internal: "mastery", phenomenological: "natural flow / embodied wisdom", category: "phase" },
    { internal: "transcendence", phenomenological: "moving beyond / evolutionary leap", category: "phase" }
  ];

  // ==========================================================================
  // PUBLIC MAPPING METHODS
  // ==========================================================================

  /**
   * Convert internal code to phenomenological theme
   */
  static mapToTheme(internalCode: string, confidence: number, expertMode: boolean = false): Theme {
    // Check all mapping categories
    const mapping = this.findMapping(internalCode);
    
    if (!mapping) {
      // Fallback for unmapped codes
      return {
        id: `theme.${internalCode.toLowerCase()}`,
        label: this.humanizeCode(internalCode),
        confidence,
        ...(expertMode && { internal: { code: internalCode } })
      };
    }

    return {
      id: `theme.${mapping.category}.${internalCode.toLowerCase()}`,
      label: mapping.phenomenological,
      confidence,
      ...(expertMode && { internal: { code: internalCode } })
    };
  }

  /**
   * Convert internal shadow pattern to gentle signal
   */
  static mapToShadowSignal(
    internalType: string, 
    intensity: number, 
    expertMode: boolean = false
  ): ShadowSignal {
    const mapping = this.SHADOW_MAPPINGS.find(m => m.internal === internalType);
    
    if (!mapping) {
      return {
        id: `shadow.${internalType}`,
        label: this.humanizeShadowType(internalType),
        intensity,
        suggestion: "gentle awareness often brings natural shifts.",
        ...(expertMode && { internal: { code: internalType } })
      };
    }

    return {
      id: `shadow.${internalType}`,
      label: mapping.label,
      intensity,
      suggestion: mapping.suggestion,
      ...(expertMode && { internal: { code: internalType } })
    };
  }

  /**
   * Generate Maya-style timing hint
   */
  static generateTimingHint(
    dominantElements: string[], 
    confidence: number,
    expertMode: boolean = false
  ): string {
    const elementDescriptions = dominantElements
      .map(el => this.getElementalTiming(el))
      .filter(Boolean);

    if (elementDescriptions.length === 0) {
      return "gentle rhythms favor patient attention";
    }

    const primary = elementDescriptions[0];
    const expertNote = expertMode ? ` (${dominantElements.join(", ")})` : "";
    
    return `${primary}${expertNote}`;
  }

  /**
   * Generate Maya-style reflection copy
   */
  static generateHeaderReflection(
    coherence: number,
    topThemes: Theme[],
    expertMode: boolean = false
  ): string {
    const coherencePhrase = this.getCoherencePhrase(coherence);
    const themeDescriptions = topThemes.slice(0, 2).map(t => t.label);
    
    let reflection = `${coherencePhrase}. I'm seeing ${themeDescriptions.join(", with ")}.`;
    
    if (coherence > 70) {
      reflection += " If you've been waiting to start, this is a supportive window.";
    }

    if (expertMode && topThemes.length > 0) {
      const codes = topThemes
        .filter(t => t.internal?.code)
        .map(t => t.internal!.code)
        .join(", ");
      if (codes) {
        reflection += ` (${codes})`;
      }
    }

    return reflection;
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private static findMapping(internalCode: string): LanguageMapping | undefined {
    return [
      ...this.ELEMENTAL_MAPPINGS,
      ...this.ARCHETYPAL_MAPPINGS, 
      ...this.PHASE_MAPPINGS
    ].find(m => m.internal === internalCode);
  }

  private static humanizeCode(code: string): string {
    return code
      .replace(/([A-Z])/g, ' $1')
      .replace(/[-_]/g, ' ')
      .toLowerCase()
      .trim()
      .replace(/^\w/, c => c.toUpperCase());
  }

  private static humanizeShadowType(type: string): string {
    const typeMap: Record<string, string> = {
      deflection: "gentle avoidance patterns",
      victim: "feeling stuck in old stories", 
      perfectionism: "waiting for perfect conditions",
      spiritual_bypass: "floating above the human experience",
      intellectualization: "thinking instead of feeling",
      control: "holding tightly to outcomes"
    };
    
    return typeMap[type] || this.humanizeCode(type);
  }

  private static getElementalTiming(element: string): string {
    const timingMap: Record<string, string> = {
      fire: "good window for courageous starts",
      water: "flow with natural rhythms", 
      earth: "steady progress brings results",
      air: "clear communication opens doors",
      aether: "meaning and connection are available"
    };
    
    return timingMap[element.toLowerCase()] || "";
  }

  private static getCoherencePhrase(coherence: number): string {
    if (coherence >= 80) return "Today has a clear, aligned feel";
    if (coherence >= 70) return "Today has a steady feel";
    if (coherence >= 60) return "Today has a gently shifting quality";
    if (coherence >= 50) return "Today feels mixed, with different currents";
    if (coherence >= 40) return "Today has an unsettled, searching quality";
    return "Today feels tender and uncertain";
  }

  // ==========================================================================
  // PRACTICE SUGGESTIONS
  // ==========================================================================

  static generatePracticeTiles(themes: Theme[], shadowSignals: ShadowSignal[]): string[] {
    const practices = [];

    // Theme-based practices
    for (const theme of themes.slice(0, 2)) {
      if (theme.label.includes("courage")) {
        practices.push("take one small brave step");
      } else if (theme.label.includes("clear thinking")) {
        practices.push("write down what's actually true");
      } else if (theme.label.includes("emotional")) {
        practices.push("let yourself feel for 60 seconds");
      } else if (theme.label.includes("systems")) {
        practices.push("organize one small area completely");
      } else if (theme.label.includes("meaning")) {
        practices.push("pause and sense what matters most");
      }
    }

    // Shadow-based practices (already included in suggestions)
    for (const signal of shadowSignals.slice(0, 1)) {
      practices.push(signal.suggestion.split('.')[0].toLowerCase());
    }

    // Universal fallbacks
    if (practices.length === 0) {
      practices.push("take three conscious breaths");
      practices.push("name one thing you're grateful for");
    }

    return [...new Set(practices)].slice(0, 3); // Remove duplicates, max 3
  }
}