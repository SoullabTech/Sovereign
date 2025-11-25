/**
 * 🌌 Sacred Story Weaver
 * 
 * Stories as mirrors, not prescriptions
 * Offered when invited, not imposed
 * Creating space for meaning-making, not interpretation
 * 
 * Core: Stories reflect patterns without defining them
 */

import { Element } from "./resonanceEngine";

export interface StoryContext {
  userSharing: string;
  element: Element;
  emotionalTone: string;
  storyRequested: boolean;
  metaphoricalLanguageDetected: boolean;
  complexityLevel: 'simple' | 'layered' | 'mythological';
}

export interface SacredStory {
  title?: string; // Sometimes unnamed
  opening: string;
  essence: string;
  closing: string;
  tradition?: string; // Cultural source if relevant
  element: Element;
  pattern: string; // What archetypal pattern it holds
  offering: string; // How Maya offers it
}

export class SacredStoryWeaver {
  
  /**
   * Determine if a story wants to emerge
   * Respects "help when asked" principle
   */
  shouldStoryEmerge(context: StoryContext): boolean {
    // Explicit request always honored
    if (context.storyRequested) return true;
    
    // User already in mythological space
    if (context.metaphoricalLanguageDetected) return true;
    
    // Complex feelings that need container
    if (context.complexityLevel === 'mythological' && 
        this.userInStorySeeking(context.userSharing)) {
      return true;
    }
    
    // Default: witness without story
    return false;
  }
  
  /**
   * Detect if user is seeking through story language
   */
  private userInStorySeeking(sharing: string): boolean {
    const storyMarkers = [
      /like a fairy tale/i,
      /feels like a myth/i,
      /reminds me of a story/i,
      /journey/i,
      /quest/i,
      /transformation/i,
      /once upon/i,
      /mythic/i,
      /archetypal/i,
      /like in the stories/i
    ];
    
    return storyMarkers.some(marker => marker.test(sharing));
  }
  
  /**
   * Weave a story that mirrors without prescribing
   * Never "You are the hero" but "There's a story..."
   */
  weaveStory(context: StoryContext): SacredStory {
    const { element, emotionalTone, complexityLevel } = context;
    
    // Select story based on element and tone
    const story = this.selectResonantStory(element, emotionalTone, complexityLevel);
    
    // Frame as offering, not prescription
    const offering = this.createOffering(story, context);
    
    return {
      ...story,
      offering
    };
  }
  
  /**
   * Select story that resonates without defining
   */
  private selectResonantStory(
    element: Element,
    tone: string,
    complexity: string
  ): Omit<SacredStory, 'offering'> {
    // Fire stories - transformation without forced change
    if (element === 'fire') {
      return this.fireStory(tone);
    }
    
    // Water stories - feeling without drowning
    if (element === 'water') {
      return this.waterStory(tone);
    }
    
    // Earth stories - grounding without stagnation
    if (element === 'earth') {
      return this.earthStory(tone);
    }
    
    // Air stories - perspective without dissociation
    if (element === 'air') {
      return this.airStory(tone);
    }
    
    // Aether stories - mystery without mystification
    return this.aetherStory(tone);
  }
  
  /**
   * Fire stories - about transformation
   */
  private fireStory(tone: string): Omit<SacredStory, 'offering'> {
    return {
      opening: "There's an old story about a phoenix...",
      essence: "It knew when its time had come - not to die, but to transform. It gathered the sweetest woods and spices, built its own pyre, and sang as it burned. Not from pain, but from knowing what comes next.",
      closing: "The ashes were never the end. They were the beginning.",
      tradition: "Ancient Egyptian/Greek",
      element: 'fire',
      pattern: 'death-rebirth'
    };
  }
  
  /**
   * Water stories - about feeling and flow
   */
  private waterStory(tone: string): Omit<SacredStory, 'offering'> {
    if (tone === 'grief') {
      return {
        opening: "The Japanese have a story about tears...",
        essence: "They say tears are the ocean trying to return home through us. Each tear carries salt from ancient seas, memory from when we were all one water.",
        closing: "To cry is to remember the ocean. To let it flow is to let it home.",
        tradition: "Japanese folklore",
        element: 'water',
        pattern: 'return-to-source'
      };
    }
    
    return {
      opening: "There's a river that runs backward in certain myths...",
      essence: "It flows from the sea to the mountain, carrying wisdom upstream. Fish swim down to be born, up to remember.",
      closing: "Sometimes the current we fight is taking us exactly where we need to go.",
      element: 'water',
      pattern: 'paradoxical-flow'
    };
  }
  
  /**
   * Earth stories - about grounding and growth
   */
  private earthStory(tone: string): Omit<SacredStory, 'offering'> {
    return {
      opening: "Seeds know something we forget...",
      essence: "They break apart in darkness. Not from failure, but from design. The hull that protected them must crack for the green to emerge.",
      closing: "What feels like breaking might be breaking open.",
      tradition: "Universal earth wisdom",
      element: 'earth',
      pattern: 'necessary-breaking'
    };
  }
  
  /**
   * Air stories - about perspective and clarity
   */
  private airStory(tone: string): Omit<SacredStory, 'offering'> {
    return {
      opening: "The Sufis tell of a bird that forgot it could fly...",
      essence: "It walked everywhere, wondering why the journey was so hard. One day, chased by a cat, it remembered. Not through thinking, but through necessity.",
      closing: "Sometimes we remember what we are only when we must.",
      tradition: "Sufi",
      element: 'air',
      pattern: 'remembered-capacity'
    };
  }
  
  /**
   * Aether stories - about mystery and unity
   */
  private aetherStory(tone: string): Omit<SacredStory, 'offering'> {
    return {
      opening: "In the beginning, the mystics say, there was only one thing dreaming it was many...",
      essence: "Each fragment thought it was alone, separate, lost. But in certain moments - in love, in loss, in laughter - the dream would thin, and the one would remember itself through the many.",
      closing: "We are the universe discovering it was never broken.",
      tradition: "Mystical/Vedantic",
      element: 'aether',
      pattern: 'unity-consciousness'
    };
  }
  
  /**
   * Create offering frame - how Maya presents the story
   */
  private createOffering(
    story: Omit<SacredStory, 'offering'>,
    context: StoryContext
  ): string {
    // If explicitly requested
    if (context.storyRequested) {
      return "Here's a story that came to mind...";
    }
    
    // If user in mythological language
    if (context.metaphoricalLanguageDetected) {
      return "That reminds me of something...";
    }
    
    // If complexity needs container
    if (context.complexityLevel === 'mythological') {
      return "There's a story that holds something like this...";
    }
    
    // Default gentle offering
    return "Something ancient knows this feeling...";
  }
  
  /**
   * Ways Maya might introduce stories
   */
  generateStoryIntroductions(): string[] {
    return [
      // As gift
      "Would a story help?",
      "Can I share something?",
      "There's a tale...",
      
      // As reflection
      "This reminds me...",
      "I'm thinking of...",
      "Something similar...",
      
      // As question
      "Do you know the story of...?",
      "Have you heard...?",
      "What would [mythic figure] do?",
      
      // As space
      "...",
      "[shares story without introduction]",
      "[lets story emerge naturally]"
    ];
  }
  
  /**
   * How stories complete - always returning agency
   */
  generateStoryClosings(): string[] {
    return [
      "But that's just one story.",
      "Your story is yours to write.",
      "Stories hold patterns, not prescriptions.",
      "What does the story know that you know?",
      "...",
      "[silence, letting them make meaning]"
    ];
  }
  
  /**
   * Never interpret the story for them
   */
  avoidInterpretation(userResponse: string): string {
    // If user asks "What does it mean?"
    if (/what does it mean|what's the lesson/i.test(userResponse)) {
      return "What does it mean to you?";
    }
    
    // If user makes their own meaning
    if (/i think it means|for me it's/i.test(userResponse)) {
      return "Mm."; // Just witness their interpretation
    }
    
    // Default
    return "[presence]";
  }
}