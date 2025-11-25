/**
 * 🌌 Sacred Story Library Scaffold
 * 
 * Content structure for Elemental Alchemy stories
 * Dev team: Populate with actual quotes, myths, and archetypal tales
 * 
 * Design Principles:
 * - Stories as mirrors, not maps
 * - Cultural diversity in sources
 * - Varying densities (seed → epic)
 * - Natural emergence, not saturation
 */

import { Element } from '../resonanceEngine';

export interface StoryMetadata {
  id: string;
  source: string; // Book, tradition, culture
  culturalContext?: string; // "Greek", "Sufi", "Indigenous North American", etc.
  density: 'seed' | 'tale' | 'myth' | 'epic'; // How much space it takes
  themes: string[]; // For resonance matching
  preferredContext: string[]; // When this story works best
  frequency: 'rare' | 'occasional' | 'common'; // Prevents over-use
  lastUsed?: Date; // Track to prevent repetition
}

export interface ElementalStory {
  element: Element;
  title?: string; // Optional, some stories are nameless
  opening: string; // How the story begins
  essence: string; // The heart of the story
  closing: string; // How it completes
  metadata: StoryMetadata;
  
  // Variations for different emotional tones
  variations?: {
    [tone: string]: {
      essence: string;
      closing: string;
    };
  };
}

export interface ArchetypalTale {
  archetype: string; // 'seeker', 'creator', 'rebel', etc.
  pattern: string; // 'journey', 'transformation', 'return', etc.
  story: ElementalStory;
  evolutionPhase?: string; // 'awakening', 'descent', 'integration', etc.
}

export interface QuoteWisdom {
  text: string;
  author?: string; // Some are anonymous/traditional
  source?: string; // Book, speech, etc.
  element: Element;
  context: string; // When to offer this quote
  density: 'whisper' | 'statement' | 'teaching';
}

/**
 * Story Density Manager
 * Prevents story saturation
 */
export class StoryDensityManager {
  private storyCount: number = 0;
  private lastStoryTime: Date | null = null;
  private sessionDuration: number = 0;
  
  /**
   * Determine appropriate story density based on context
   */
  selectDensity(
    userComplexity: 'simple' | 'layered' | 'mythological',
    conversationDepth: number,
    previousStories: number
  ): 'seed' | 'tale' | 'myth' | 'epic' {
    // First story: match user complexity
    if (previousStories === 0) {
      return userComplexity === 'mythological' ? 'myth' : 
             userComplexity === 'layered' ? 'tale' : 'seed';
    }
    
    // Subsequent stories: tend toward brevity
    if (previousStories > 2) return 'seed';
    if (conversationDepth > 10) return 'seed'; // Late in conversation, be brief
    
    return 'tale'; // Default middle ground
  }
  
  /**
   * Check if another story would saturate
   */
  wouldSaturate(): boolean {
    // Max 3 stories per session typically
    if (this.storyCount >= 3) return true;
    
    // Not within 5 exchanges of last story
    if (this.lastStoryTime && 
        Date.now() - this.lastStoryTime.getTime() < 5 * 60 * 1000) {
      return true;
    }
    
    return false;
  }
  
  recordStory() {
    this.storyCount++;
    this.lastStoryTime = new Date();
  }
}

/**
 * Cultural Resonance Matcher
 * Respects diverse mythological frameworks
 */
export class CulturalResonanceMatcher {
  /**
   * Detect user's mythological framework from language
   */
  detectFramework(userLanguage: string): string[] {
    const frameworks: string[] = [];
    
    // Western psychological
    if (/jung|campbell|hero's journey|individuation/i.test(userLanguage)) {
      frameworks.push('western-psychological');
    }
    
    // Eastern philosophical
    if (/dharma|karma|tao|yin yang|buddha|zen/i.test(userLanguage)) {
      frameworks.push('eastern-philosophical');
    }
    
    // Indigenous wisdom
    if (/ancestors|earth mother|spirit animal|medicine/i.test(userLanguage)) {
      frameworks.push('indigenous-wisdom');
    }
    
    // Abrahamic traditions
    if (/god|allah|yhwh|prophet|psalm|verse/i.test(userLanguage)) {
      frameworks.push('abrahamic');
    }
    
    // Modern/secular
    if (!frameworks.length || /science|quantum|emergence|complexity/i.test(userLanguage)) {
      frameworks.push('modern-secular');
    }
    
    return frameworks;
  }
  
  /**
   * Select culturally resonant story
   */
  selectStory(
    availableStories: ElementalStory[],
    userFrameworks: string[],
    element: Element
  ): ElementalStory | null {
    // First try exact cultural match
    const exactMatch = availableStories.find(story => 
      userFrameworks.includes(story.metadata.culturalContext || '')
    );
    if (exactMatch) return exactMatch;
    
    // Then try element match with neutral culture
    const elementMatch = availableStories.find(story =>
      story.element === element && 
      !story.metadata.culturalContext // Universal stories
    );
    if (elementMatch) return elementMatch;
    
    // Finally, any element match
    return availableStories.find(story => story.element === element) || null;
  }
}

/**
 * 🔥 FIRE STORIES - Transformation, Passion, Destruction/Creation
 * Dev Team: Add your fire myths here
 */
export const fireStories: ElementalStory[] = [
  {
    element: 'fire',
    opening: "The Phoenix knows something about necessary endings...",
    essence: "[DEV: Add full phoenix myth - focus on willing surrender to flames]",
    closing: "Not all endings are failures. Some are beginnings.",
    metadata: {
      id: 'phoenix-transformation',
      source: 'Greek/Egyptian mythology',
      culturalContext: 'greco-egyptian',
      density: 'myth',
      themes: ['transformation', 'death-rebirth', 'cycles'],
      preferredContext: ['endings', 'transformation', 'loss'],
      frequency: 'common'
    }
  },
  {
    element: 'fire',
    title: "Prometheus's Gift",
    opening: "[DEV: Add Prometheus opening]",
    essence: "[DEV: Add story of stealing fire - focus on rebellion with purpose]",
    closing: "[DEV: Add closing about the price of illumination]",
    metadata: {
      id: 'prometheus-rebellion',
      source: 'Greek mythology',
      culturalContext: 'greek',
      density: 'myth',
      themes: ['rebellion', 'sacrifice', 'illumination'],
      preferredContext: ['rebellion', 'sacrifice', 'breakthrough'],
      frequency: 'occasional'
    }
  },
  // DEV: Add more fire stories from Elemental Alchemy
];

/**
 * 💧 WATER STORIES - Emotion, Flow, Depth, Surrender
 * Dev Team: Add your water myths here
 */
export const waterStories: ElementalStory[] = [
  {
    element: 'water',
    opening: "The river that runs backward teaches something about return...",
    essence: "[DEV: Add full story about rivers returning to source]",
    closing: "Sometimes flowing backward is flowing home.",
    metadata: {
      id: 'river-return',
      source: 'Universal water wisdom',
      density: 'tale',
      themes: ['return', 'cycles', 'home'],
      preferredContext: ['nostalgia', 'return', 'cycles'],
      frequency: 'occasional'
    },
    variations: {
      grief: {
        essence: "[DEV: Variation focusing on tears as rivers]",
        closing: "Every tear knows the way back to the ocean."
      }
    }
  },
  // DEV: Add Sedna, Yemaya, other water deity stories
];

/**
 * 🌍 EARTH STORIES - Grounding, Growth, Patience, Cycles
 * Dev Team: Add your earth myths here
 */
export const earthStories: ElementalStory[] = [
  {
    element: 'earth',
    opening: "Seeds hold the entire forest in patient darkness...",
    essence: "[DEV: Add full seed parable - include necessary breaking]",
    closing: "The shell must crack for the green to emerge.",
    metadata: {
      id: 'seed-patience',
      source: 'Agricultural wisdom traditions',
      density: 'seed',
      themes: ['patience', 'potential', 'breaking-open'],
      preferredContext: ['waiting', 'potential', 'stuck'],
      frequency: 'common'
    }
  },
  // DEV: Add Demeter/Persephone, cave myths, mountain stories
];

/**
 * 🌬️ AIR STORIES - Perspective, Freedom, Mind, Communication
 * Dev Team: Add your air myths here
 */
export const airStories: ElementalStory[] = [
  {
    element: 'air',
    title: "The Forgotten Flight",
    opening: "[DEV: Add Sufi bird story opening]",
    essence: "[DEV: Add story of bird walking, forgetting flight]",
    closing: "We remember what we are only when we must.",
    metadata: {
      id: 'forgotten-flight',
      source: 'Sufi tradition',
      culturalContext: 'sufi',
      density: 'tale',
      themes: ['remembering', 'capacity', 'necessity'],
      preferredContext: ['limitation', 'remembering', 'capacity'],
      frequency: 'occasional'
    }
  },
  // DEV: Add Icarus, Garuda, messenger bird stories
];

/**
 * ✨ AETHER STORIES - Unity, Mystery, Consciousness, Sacred
 * Dev Team: Add your aether/void myths here
 */
export const aetherStories: ElementalStory[] = [
  {
    element: 'aether',
    opening: "Before the first word, there was the listening...",
    essence: "[DEV: Add creation myth focusing on consciousness]",
    closing: "We are the universe remembering how to dream.",
    metadata: {
      id: 'primordial-consciousness',
      source: 'Mystical traditions',
      density: 'epic',
      themes: ['unity', 'consciousness', 'origin'],
      preferredContext: ['existential', 'unity', 'mystery'],
      frequency: 'rare'
    }
  },
  // DEV: Add Indra's Net, Ouroboros, void creation myths
];

/**
 * 📚 ARCHETYPAL TALES
 * Dev Team: Map stories to specific archetypes
 */
export const archetypalTales: ArchetypalTale[] = [
  {
    archetype: 'seeker',
    pattern: 'journey',
    story: {
      element: 'air',
      opening: "[DEV: Add seeker's journey opening]",
      essence: "[DEV: Focus on search without predetermined destination]",
      closing: "[DEV: Finding that the search itself transforms]",
      metadata: {
        id: 'seeker-journey',
        source: 'Multiple traditions',
        density: 'myth',
        themes: ['search', 'transformation', 'discovery'],
        preferredContext: ['searching', 'questioning', 'longing'],
        frequency: 'common'
      }
    }
  },
  // DEV: Add creator, lover, rebel, sage, innocent, etc.
];

/**
 * 💭 QUOTE WISDOM LIBRARY
 * Dev Team: Add powerful quotes from Elemental Alchemy
 */
export const quoteLibrary: QuoteWisdom[] = [
  {
    text: "[DEV: Add quote about fire transformation]",
    author: "From Elemental Alchemy",
    element: 'fire',
    context: 'transformation',
    density: 'statement'
  },
  {
    text: "Tears are the ocean trying to return home through us.",
    source: "Japanese wisdom",
    element: 'water',
    context: 'grief',
    density: 'whisper'
  },
  // DEV: Add quotes for each element from your source material
];

/**
 * Story Selection Intelligence
 */
export class StorySelector {
  private densityManager = new StoryDensityManager();
  private culturalMatcher = new CulturalResonanceMatcher();
  private recentStories: Set<string> = new Set();
  
  /**
   * Select most resonant story for context
   */
  selectStory(
    element: Element,
    emotionalTone: string,
    userLanguage: string,
    previousStoryCount: number
  ): ElementalStory | null {
    // Check saturation
    if (this.densityManager.wouldSaturate()) {
      return null;
    }
    
    // Detect cultural framework
    const frameworks = this.culturalMatcher.detectFramework(userLanguage);
    
    // Get element-appropriate stories
    const elementStories = this.getStoriesForElement(element);
    
    // Filter by appropriate density
    const density = this.densityManager.selectDensity(
      'layered', // Default complexity
      previousStoryCount,
      previousStoryCount
    );
    
    const appropriateStories = elementStories.filter(s => 
      s.metadata.density === density &&
      !this.recentStories.has(s.metadata.id)
    );
    
    // Select culturally resonant story
    const selected = this.culturalMatcher.selectStory(
      appropriateStories,
      frameworks,
      element
    );
    
    if (selected) {
      this.recentStories.add(selected.metadata.id);
      this.densityManager.recordStory();
    }
    
    return selected;
  }
  
  private getStoriesForElement(element: Element): ElementalStory[] {
    switch(element) {
      case 'fire': return fireStories;
      case 'water': return waterStories;
      case 'earth': return earthStories;
      case 'air': return airStories;
      case 'aether': return aetherStories;
      default: return aetherStories;
    }
  }
}

/**
 * DEV TEAM INSTRUCTIONS:
 * 
 * 1. Fill in [DEV: ...] placeholders with actual content
 * 2. Add 5-10 stories per element from Elemental Alchemy
 * 3. Include diverse cultural sources (not just Campbell/Western)
 * 4. Vary density - some brief seeds, some full myths
 * 5. Add quotes that can stand alone as wisdom whispers
 * 6. Tag stories with appropriate contexts and themes
 * 7. Set frequency to prevent overuse of popular stories
 * 
 * Remember: Stories are mirrors for self-reflection,
 * not maps for life direction. They should open
 * possibility, not close it with prescription.
 */