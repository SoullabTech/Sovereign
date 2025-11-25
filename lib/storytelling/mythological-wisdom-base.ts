/**
 * Mythological Wisdom Base
 * 
 * Deep storytelling traditions from:
 * - Joseph Campbell: The Hero's Journey, Power of Myth, Masks of God
 * - Martin Shaw: Wild storytelling, bone memory, wilderness mythology
 * - Hermann Hesse: Individuation, Eastern philosophy, spiritual journey
 */

export interface MythologicalTradition {
  name: string;
  core_teachings: string[];
  narrative_techniques: string[];
  archetypal_patterns: string[];
  wisdom_themes: string[];
}

export const CAMPBELL_TRADITION: MythologicalTradition = {
  name: "Joseph Campbell - The Monomyth",
  core_teachings: [
    "Follow your bliss and the universe will open doors where there were only walls",
    "The cave you fear to enter holds the treasure you seek",
    "We must be willing to let go of the life we planned so as to have the life that is waiting for us",
    "The privilege of a lifetime is being who you are",
    "Myths are public dreams, dreams are private myths"
  ],
  narrative_techniques: [
    "The Call to Adventure - refusing and accepting destiny",
    "Crossing the Threshold - leaving the ordinary world",
    "The Belly of the Whale - symbolic death and rebirth",
    "Meeting the Mentor/Goddess - divine assistance",
    "Atonement with the Father - confronting ultimate power",
    "Apotheosis - divine knowledge achieved",
    "The Ultimate Boon - achievement of the quest",
    "The Return - bringing wisdom back to the world",
    "Master of Two Worlds - balancing material and spiritual",
    "Freedom to Live - living in the moment without fear"
  ],
  archetypal_patterns: [
    "Hero", "Mentor", "Threshold Guardian", "Herald", "Shapeshifter",
    "Shadow", "Ally", "Trickster", "Divine Mother", "Divine Father",
    "Temptress", "Child", "Maiden", "Crone", "Wise Old Man"
  ],
  wisdom_themes: [
    "Separation - Initiation - Return",
    "Death and Rebirth",
    "The Sacred Marriage",
    "The Wasteland and its Healing",
    "The Grail Quest",
    "Transformation through Trials",
    "The Eternal Return",
    "Unity of Opposites"
  ]
};

export const SHAW_TRADITION: MythologicalTradition = {
  name: "Martin Shaw - Wild Mythology",
  core_teachings: [
    "We are mythic beings living in mythic times disguised as mundane ones",
    "The wild requires your fiercest and most tender self",
    "Stories are beings, not things - they have their own agency",
    "Initiation is the death of who you think you are",
    "The forest knows your name before you do",
    "Myth is the original internet - it connects all things",
    "Court the wild, not comfort",
    "Your wound is your gift to the village"
  ],
  narrative_techniques: [
    "Bone memory - stories that live in the marrow",
    "The Rough Gods - encountering the untamed divine",
    "Wilderness fasting - emptying to be filled",
    "The Hut at the Edge of the Village - liminal storytelling",
    "Speaking stories, not reading them - oral tradition",
    "The Tangle - getting wonderfully lost in story",
    "Grief Rituals - honoring what's been lost",
    "The Scatterlings - finding your mythic tribe",
    "Breaking the Spell - waking from cultural trance",
    "The Eloquence of Initiatory Darkness"
  ],
  archetypal_patterns: [
    "The Wild Twin", "The Handless Maiden", "Iron John",
    "Baba Yaga", "The Seal Woman", "The Green Man",
    "The Firebird", "The Dark Forest", "The Speaking Animals",
    "The Bone Mother", "The Wild Hunt", "The Salmon of Knowledge",
    "The Shapeshifter", "The Forest Bride", "The Wounded King"
  ],
  wisdom_themes: [
    "Courting the Wild Feminine/Masculine",
    "The Village and the Forest",
    "Ritual and Rupture",
    "The Mythic Imagination",
    "Grief as Praise",
    "The Underworld Journey",
    "Animal Powers and Plant Teachers",
    "The Ancestral Ground",
    "Living Myth vs Dead Mythology",
    "The Return of the Sacred"
  ]
};

export const HESSE_TRADITION: MythologicalTradition = {
  name: "Hermann Hesse - The Journey Within",
  core_teachings: [
    "Within you there is a stillness and sanctuary to which you can retreat at any time",
    "I have been and still am a seeker, but I have ceased to question stars and books",
    "Wisdom cannot be imparted. Wisdom that a wise man attempts to impart always sounds like foolishness",
    "The bird fights its way out of the egg. The egg is the world. Whoever will be born must destroy a world",
    "Every man is more than just himself; he also represents the unique, the very special and always significant and remarkable point at which the world's phenomena intersect",
    "The truth is lived, not taught",
    "For what is a man without his dreams?",
    "Words do not express thoughts very well. They always become a little different immediately after they are expressed"
  ],
  narrative_techniques: [
    "The Glass Bead Game - synthesis of all knowledge",
    "Siddhartha's River - listening to the eternal flow",
    "Steppenwolf's Magic Theater - confronting multiple selves",
    "Demian's Mark of Cain - the outsider's blessing",
    "Narcissus and Goldmund - spirit and flesh united",
    "The Journey to the East - the secret league of seekers",
    "Knulp's Wandering - freedom through non-attachment",
    "Beneath the Wheel - the cost of conformity",
    "The Dual Nature - embracing light and shadow",
    "The Immortals - transcendent wisdom figures"
  ],
  archetypal_patterns: [
    "The Seeker", "The Outsider", "The Scholar-Mystic",
    "The Sensual Saint", "The Wanderer", "The Awakened One",
    "The Wolf of the Steppes", "The Magister Ludi",
    "The Ferryman", "The Courtesan-Teacher", "The Friend-Shadow",
    "The Daemon", "The Mother World", "The Father World"
  ],
  wisdom_themes: [
    "Individuation and Self-Realization",
    "East Meets West",
    "The Unity of Opposites",
    "Art as Spiritual Practice",
    "The Outsider's Path",
    "Love as Teacher",
    "The River of Life",
    "Breaking Social Conditioning",
    "The Search for Meaning",
    "Transcendence Through Suffering",
    "The Eternal Return to Self"
  ]
};

export interface StorytellingWisdom {
  opening_invocations: string[];
  transition_phrases: string[];
  wisdom_closings: string[];
  teaching_questions: string[];
}

export const MASTER_STORYTELLING_WISDOM: StorytellingWisdom = {
  opening_invocations: [
    // Campbell style
    "In that place where the known world touches the unknown, where maps end and mystery begins...",
    "The call came, as it always does, disguised as ordinary life...",
    "Before the beginning, after the end, in the eternal now of myth...",
    
    // Shaw style
    "This is a story that has been walking towards you your whole life...",
    "In the time when animals spoke and humans listened...",
    "The old stories say, and the old stories know...",
    "Once, when the veil was thinner and magic leaked through...",
    
    // Hesse style
    "Within the soul's labyrinth, where all paths lead home...",
    "In the secret garden of the self, where truth blooms in silence...",
    "Between the world of appearances and the world of essence..."
  ],
  
  transition_phrases: [
    // Campbell transitions
    "And so the threshold appeared, demanding courage...",
    "The road of trials began, each test a teacher...",
    "In the belly of the whale, transformation stirred...",
    
    // Shaw transitions
    "The forest leaned in, eager to tell its part...",
    "Something wild and holy moved through the story...",
    "The rough gods laughed, and everything changed...",
    
    // Hesse transitions
    "The river spoke, and in its voice was all voices...",
    "Between one self and another, a door opened...",
    "The game continued, each move revealing deeper truth..."
  ],
  
  wisdom_closings: [
    // Campbell endings
    "And so they returned, bearing the elixir of life for all...",
    "The two worlds were one, had always been one...",
    "The hero's journey ended where it began, but nothing was the same...",
    
    // Shaw endings
    "The story released them back to their life, forever changed...",
    "And the wild remembered their name, as it always had...",
    "They became the story they had been seeking...",
    
    // Hesse endings
    "All rivers flow to the sea, all seekers find their way...",
    "The game was over, the game had just begun...",
    "In seeking the truth, they had become it..."
  ],
  
  teaching_questions: [
    // Campbell questions
    "What threshold are you being called to cross?",
    "Where in your life is the treasure hidden in the cave you fear?",
    "What gift are you meant to bring back from your journey?",
    
    // Shaw questions
    "What part of you belongs to the village, what part to the forest?",
    "What story has been stalking you, waiting to be told?",
    "How is your wound becoming medicine for the world?",
    
    // Hesse questions
    "What world must you destroy to be born into who you are?",
    "Where does your river flow, and what does it say?",
    "Which self are you inhabiting today, and which waits in shadow?"
  ]
};

export class MythologicalNarrativeEngine {
  /**
   * Select appropriate tradition based on user's need
   */
  selectTradition(context: {
    challenge?: string;
    emotionalState?: any;
    desiredOutcome?: string;
  }): MythologicalTradition {
    // Campbell for classic hero's journey and transformation
    if (context.challenge?.includes('journey') || 
        context.challenge?.includes('quest') ||
        context.desiredOutcome?.includes('transform')) {
      return CAMPBELL_TRADITION;
    }
    
    // Shaw for wild wisdom and grief work
    if (context.challenge?.includes('loss') ||
        context.challenge?.includes('wild') ||
        context.challenge?.includes('grief') ||
        context.desiredOutcome?.includes('authentic')) {
      return SHAW_TRADITION;
    }
    
    // Hesse for inner journey and individuation
    if (context.challenge?.includes('meaning') ||
        context.challenge?.includes('self') ||
        context.challenge?.includes('identity') ||
        context.desiredOutcome?.includes('understanding')) {
      return HESSE_TRADITION;
    }
    
    // Default to Campbell for general transformation
    return CAMPBELL_TRADITION;
  }
  
  /**
   * Weave traditions together for rich narrative
   */
  blendTraditions(
    primary: MythologicalTradition,
    secondary?: MythologicalTradition
  ): {
    techniques: string[];
    themes: string[];
    archetypes: string[];
  } {
    const techniques = [...primary.narrative_techniques];
    const themes = [...primary.wisdom_themes];
    const archetypes = [...primary.archetypal_patterns];
    
    if (secondary) {
      // Add complementary elements from secondary tradition
      techniques.push(...secondary.narrative_techniques.slice(0, 3));
      themes.push(...secondary.wisdom_themes.slice(0, 2));
      archetypes.push(...secondary.archetypal_patterns.slice(0, 3));
    }
    
    return {
      techniques: [...new Set(techniques)], // Remove duplicates
      themes: [...new Set(themes)],
      archetypes: [...new Set(archetypes)]
    };
  }
  
  /**
   * Generate opening based on tradition
   */
  generateMythicOpening(tradition: MythologicalTradition): string {
    switch (tradition.name) {
      case CAMPBELL_TRADITION.name:
        return "In the ordinary world, before the call to adventure came, there lived one who did not yet know they were a hero...";
        
      case SHAW_TRADITION.name:
        return "Listen: this story has been following you through the forest of your life, waiting for this moment to find you...";
        
      case HESSE_TRADITION.name:
        return "In the deepest chamber of the soul, where all contradictions dissolve into unity, a journey was about to begin...";
        
      default:
        return "In the time between times, in the place between places, where all stories are born...";
    }
  }
  
  /**
   * Apply narrative technique to story
   */
  applyNarrativeTechnique(
    story: string,
    technique: string,
    tradition: MythologicalTradition
  ): string {
    // This would be expanded with specific implementations
    // for each narrative technique from each tradition
    return story;
  }
  
  /**
   * Extract archetypal wisdom
   */
  extractArchetypalWisdom(
    archetype: string,
    tradition: MythologicalTradition
  ): string {
    const wisdomMap: Record<string, Record<string, string>> = {
      [CAMPBELL_TRADITION.name]: {
        'Hero': "You are being called to your own heroic journey. The treasure you seek lies beyond your comfort zone.",
        'Mentor': "Wisdom comes to guide you. Trust the teachers who appear on your path.",
        'Shadow': "What you resist in others lives unintegrated within you. The shadow holds your hidden gold."
      },
      [SHAW_TRADITION.name]: {
        'The Wild Twin': "Your untamed self is calling. What would you do if you were truly free?",
        'Baba Yaga': "The fierce feminine tests your readiness. Are you willing to be devoured and reborn?",
        'The Forest Bride': "The wild is proposing to you. Will you marry the mystery?"
      },
      [HESSE_TRADITION.name]: {
        'The Seeker': "The search itself is the finding. Every step on the path is the destination.",
        'The Outsider': "Your difference is your gift. The mark that sets you apart is your contribution.",
        'The Awakened One': "Enlightenment is not escape but full presence. Wake up to this moment."
      }
    };
    
    return wisdomMap[tradition.name]?.[archetype] || 
      "Ancient wisdom stirs within you, waiting to be remembered.";
  }
}