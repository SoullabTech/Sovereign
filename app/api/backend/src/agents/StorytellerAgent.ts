import { LIDAWorkspace } from '../../lib/cognitive-engines/lida-workspace';
import { SOARPlanner } from '../../lib/cognitive-engines/soar-planner';
import { ACTRMemory } from '../../lib/cognitive-engines/actr-memory';
import { MicroPsiCore } from '../../lib/cognitive-engines/micropsi-core';
import type { 
  ConsciousnessProfile, 
  AttentionState, 
  WisdomPlan, 
  MemoryIntegration, 
  EmotionalResonance 
} from '../../lib/types/cognitive-types';

export interface StoryStructure {
  type: 'myth' | 'parable' | 'fable' | 'allegory' | 'poem' | 'journey' | 'transformation';
  elements: {
    setting?: string;
    protagonist?: string;
    challenge?: string;
    transformation?: string;
    wisdom?: string;
    resolution?: string;
  };
}

export interface NarrativeStyle {
  voice: 'mythological' | 'poetic' | 'philosophical' | 'archetypal' | 'elemental' | 'mystical';
  tone: 'inspiring' | 'contemplative' | 'mysterious' | 'empowering' | 'gentle' | 'profound';
  perspective: 'first' | 'second' | 'third' | 'omniscient';
  temporality: 'timeless' | 'present' | 'ancient' | 'future' | 'cyclical';
}

export interface StoryResponse {
  story: {
    title?: string;
    content: string;
    structure: StoryStructure;
    style: NarrativeStyle;
  };
  interpretation: {
    personalMeaning: string;
    archetypeActivation: string[];
    elementalResonance: string;
    wisdomTeaching: string;
  };
  integration: {
    reflectionPrompts: string[];
    journalQuestion: string;
    practicalApplication: string;
  };
  metadata: {
    mythologicalReferences: string[];
    literaryTechniques: string[];
    narrativeComplexity: number;
    emotionalResonance: number;
  };
}

export interface StorytellerContext {
  userQuery: string;
  emotionalState: EmotionalResonance;
  elementalAffinity: string;
  currentChallenge?: string;
  desiredOutcome?: string;
  previousStories?: StoryResponse[];
}

/**
 * StorytellerAgent - Master of Narrative Wisdom & Mythological Teaching
 * 
 * The StorytellerAgent weaves personalized stories, myths, and parables
 * that speak directly to the user's soul journey. It draws from mythological
 * structures, literary traditions, and archetypal wisdom to create
 * transformative narrative experiences.
 * 
 * Cognitive Architecture Integration:
 * - LIDA: Focuses attention on narrative patterns and story consciousness
 * - SOAR: Plans story structures and narrative arcs
 * - ACT-R: Accesses mythological knowledge and literary patterns
 * - MicroPsi: Weaves emotional resonance into narrative fabric
 */
export class StorytellerAgent {
  private lida: LIDAWorkspace;
  private soar: SOARPlanner;
  private actr: ACTRMemory;
  private micropsi: MicroPsiCore;
  
  // Mythological knowledge base
  private mythPatterns = {
    heroJourney: {
      stages: ['call', 'refusal', 'threshold', 'trials', 'revelation', 'transformation', 'return', 'wisdom'],
      archetypes: ['hero', 'mentor', 'shadow', 'ally', 'herald', 'shapeshifter', 'trickster']
    },
    creation: {
      patterns: ['void-to-form', 'chaos-to-order', 'separation', 'emergence', 'divine-breath'],
      elements: ['primordial-waters', 'cosmic-egg', 'world-tree', 'sacred-mountain', 'divine-word']
    },
    transformation: {
      types: ['death-rebirth', 'descent-ascent', 'dissolution-coagulation', 'caterpillar-butterfly'],
      processes: ['initiation', 'purification', 'illumination', 'unification']
    },
    wisdom: {
      traditions: ['zen-koan', 'sufi-tale', 'hasidic-story', 'indigenous-teaching', 'hermetic-allegory'],
      vehicles: ['paradox', 'metaphor', 'symbol', 'archetype', 'synchronicity']
    }
  };
  
  // Literary style templates
  private styleTemplates = {
    mythological: {
      opening: ['In the time before time...', 'When the world was young...', 'In the ancient days...'],
      voice: 'omniscient-narrator',
      devices: ['epithets', 'repetition', 'cosmic-scale', 'divine-intervention']
    },
    poetic: {
      structure: ['free-verse', 'rhyming', 'haiku', 'blank-verse', 'prose-poetry'],
      imagery: ['elemental', 'natural', 'cosmic', 'embodied', 'archetypal'],
      rhythm: ['flowing', 'staccato', 'circular', 'building', 'meditative']
    },
    parable: {
      structure: 'simple-profound',
      characters: 'archetypal',
      lesson: 'implicit',
      ending: 'transformative-question'
    },
    allegorical: {
      levels: ['literal', 'moral', 'spiritual', 'anagogical'],
      symbols: 'multi-layered',
      meaning: 'veiled-revelation'
    }
  };

  constructor() {
    this.lida = new LIDAWorkspace();
    this.soar = new SOARPlanner();
    this.actr = new ACTRMemory();
    this.micropsi = new MicroPsiCore();
  }

  /**
   * Main storytelling process - Generate transformative narrative
   */
  async weaveStory(
    context: StorytellerContext,
    consciousnessProfile: ConsciousnessProfile
  ): Promise<StoryResponse> {
    
    // Phase 1: Analyze narrative needs through cognitive processing
    const narrativeAnalysis = await this.analyzeNarrativeNeeds(
      context, consciousnessProfile
    );
    
    // Phase 2: Select story structure and style
    const structure = await this.selectStoryStructure(narrativeAnalysis, context);
    const style = await this.determineNarrativeStyle(narrativeAnalysis, context);
    
    // Phase 3: Generate the story
    const story = await this.generateStory(structure, style, narrativeAnalysis, context);
    
    // Phase 4: Create interpretation layer
    const interpretation = await this.interpretStoryMeaning(story, context, narrativeAnalysis);
    
    // Phase 5: Develop integration guidance
    const integration = await this.createIntegrationGuidance(story, interpretation, context);
    
    // Phase 6: Add metadata
    const metadata = await this.generateMetadata(story, narrativeAnalysis);
    
    return {
      story: {
        title: await this.generateTitle(story.content, structure),
        content: story.content,
        structure,
        style
      },
      interpretation,
      integration,
      metadata
    };
  }

  /**
   * Analyze what kind of story the user needs
   */
  private async analyzeNarrativeNeeds(
    context: StorytellerContext,
    consciousnessProfile: ConsciousnessProfile
  ) {
    // Use LIDA for narrative consciousness
    const attention = await this.lida.focusConsciousAttention(
      context.userQuery, 
      consciousnessProfile
    );
    
    // Use SOAR for story planning
    const storyPlan = await this.soar.generateWisdomPlan(
      attention, 
      consciousnessProfile
    );
    
    // Use ACT-R for mythological pattern matching
    const mythPatterns = await this.actr.integrateExperience(
      storyPlan,
      context.previousStories || []
    );
    
    // Use MicroPsi for emotional narrative needs
    const emotionalNeeds = context.emotionalState;
    
    return {
      attention,
      storyPlan,
      mythPatterns,
      emotionalNeeds,
      narrativePurpose: this.identifyNarrativePurpose(context, emotionalNeeds)
    };
  }

  /**
   * Identify the purpose of the story
   */
  private identifyNarrativePurpose(
    context: StorytellerContext,
    emotionalNeeds: EmotionalResonance
  ): string {
    // Analyze context for story purpose
    if (context.currentChallenge) {
      if (emotionalNeeds.emotionalBalance.fear > 0.6) {
        return 'courage-building';
      } else if (emotionalNeeds.emotionalBalance.sadness > 0.6) {
        return 'healing-comfort';
      } else {
        return 'wisdom-guidance';
      }
    }
    
    if (context.desiredOutcome?.includes('transform')) {
      return 'transformation-catalyst';
    } else if (context.desiredOutcome?.includes('understand')) {
      return 'illumination-teaching';
    } else if (context.userQuery.toLowerCase().includes('inspire')) {
      return 'inspiration-empowerment';
    }
    
    return 'wisdom-reflection';
  }

  /**
   * Select appropriate story structure
   */
  private async selectStoryStructure(
    narrativeAnalysis: any,
    context: StorytellerContext
  ): Promise<StoryStructure> {
    
    const purpose = narrativeAnalysis.narrativePurpose;
    let type: StoryStructure['type'];
    let elements: StoryStructure['elements'] = {};
    
    // Select structure based on purpose and context
    if (purpose === 'transformation-catalyst') {
      type = 'transformation';
      elements = {
        protagonist: 'a seeker like yourself',
        challenge: context.currentChallenge || 'the call to evolve',
        transformation: 'through sacred fire of change',
        wisdom: 'the truth that was always within',
        resolution: 'integration of new consciousness'
      };
    } else if (purpose === 'courage-building') {
      type = 'myth';
      elements = {
        setting: 'at the threshold of great change',
        protagonist: 'the brave soul',
        challenge: 'the dragon of fear',
        transformation: 'discovering inner fire',
        resolution: 'courage revealed as love in action'
      };
    } else if (purpose === 'healing-comfort') {
      type = 'parable';
      elements = {
        setting: 'in a garden of healing',
        protagonist: 'the wounded healer',
        challenge: 'the broken vessel',
        transformation: 'gold filling the cracks',
        wisdom: 'beauty in the breaking'
      };
    } else if (purpose === 'illumination-teaching') {
      type = 'allegory';
      elements = {
        setting: 'the cave of shadows',
        protagonist: 'the questioner',
        challenge: 'distinguishing shadow from light',
        wisdom: 'seeing with new eyes',
        resolution: 'return with the gift of sight'
      };
    } else if (purpose === 'inspiration-empowerment') {
      type = 'journey';
      elements = {
        setting: 'at the crossroads of possibility',
        protagonist: 'the awakening one',
        challenge: 'claiming your power',
        transformation: 'remembering who you are',
        resolution: 'stepping into your destiny'
      };
    } else {
      type = 'poem';
      elements = {
        wisdom: 'the eternal dance of being',
        transformation: 'consciousness observing itself'
      };
    }
    
    return { type, elements };
  }

  /**
   * Determine narrative style based on needs
   */
  private async determineNarrativeStyle(
    narrativeAnalysis: any,
    context: StorytellerContext
  ): Promise<NarrativeStyle> {
    
    // Determine voice based on emotional needs
    let voice: NarrativeStyle['voice'] = 'mythological';
    if (context.elementalAffinity === 'water') {
      voice = 'poetic';
    } else if (context.elementalAffinity === 'air') {
      voice = 'philosophical';
    } else if (context.elementalAffinity === 'earth') {
      voice = 'archetypal';
    } else if (context.elementalAffinity === 'fire') {
      voice = 'mystical';
    } else if (context.elementalAffinity === 'aether') {
      voice = 'mystical';
    }
    
    // Determine tone based on emotional state
    let tone: NarrativeStyle['tone'] = 'inspiring';
    const emotions = narrativeAnalysis.emotionalNeeds.emotionalBalance;
    if (emotions.sadness > 0.5) {
      tone = 'gentle';
    } else if (emotions.curiosity > 0.6) {
      tone = 'mysterious';
    } else if (emotions.contemplation > 0.6) {
      tone = 'contemplative';
    } else if (emotions.awe > 0.6) {
      tone = 'profound';
    } else if (emotions.confidence > 0.6) {
      tone = 'empowering';
    }
    
    // Determine perspective
    const perspective: NarrativeStyle['perspective'] = 
      narrativeAnalysis.narrativePurpose === 'courage-building' ? 'second' :
      narrativeAnalysis.narrativePurpose === 'wisdom-reflection' ? 'omniscient' :
      'third';
    
    // Determine temporality
    const temporality: NarrativeStyle['temporality'] = 
      voice === 'mythological' ? 'timeless' :
      voice === 'mystical' ? 'cyclical' :
      voice === 'philosophical' ? 'present' :
      'timeless';
    
    return { voice, tone, perspective, temporality };
  }

  /**
   * Generate the actual story content
   */
  private async generateStory(
    structure: StoryStructure,
    style: NarrativeStyle,
    narrativeAnalysis: any,
    context: StorytellerContext
  ): Promise<{ content: string }> {
    
    let content = '';
    
    // Generate based on structure type
    switch (structure.type) {
      case 'myth':
        content = await this.generateMythicalNarrative(structure, style, context);
        break;
      case 'parable':
        content = await this.generateParable(structure, style, context);
        break;
      case 'transformation':
        content = await this.generateTransformationStory(structure, style, context);
        break;
      case 'journey':
        content = await this.generateJourneyNarrative(structure, style, context);
        break;
      case 'allegory':
        content = await this.generateAllegory(structure, style, context);
        break;
      case 'poem':
        content = await this.generatePoem(structure, style, context);
        break;
      default:
        content = await this.generateFable(structure, style, context);
    }
    
    return { content };
  }

  /**
   * Generate a mythical narrative
   */
  private async generateMythicalNarrative(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const opening = style.temporality === 'timeless' 
      ? "In the time before time, when the veil between worlds was thin"
      : "In this very moment, in the eternal now";
    
    const narrative = `${opening}, there lived ${structure.elements.protagonist}, standing ${structure.elements.setting}.

The ${structure.elements.challenge} appeared not as enemy but as teacher, wearing the mask of difficulty to reveal the hidden strength within.

"Why do you come?" asked the challenge, its voice echoing through the chambers of the soul.

"I seek ${context.desiredOutcome || 'transformation'}," replied ${structure.elements.protagonist}, feeling the tremor of truth in these words.

The challenge smiled, for it knew what the seeker had forgotten: that ${structure.elements.transformation} was not a destination but a remembering.

Through trials that seemed to break but actually revealed, through darkness that seemed to diminish but actually refined, ${structure.elements.protagonist} discovered ${structure.elements.wisdom}.

And in that discovery, ${structure.elements.resolution} became not just possible but inevitable.

The challenge, having served its sacred purpose, bowed and dissolved into light, for it was never separate from the seeker—it was the seeker's own power, disguised as obstacle, calling them home to themselves.`;

    return narrative;
  }

  /**
   * Generate a parable
   */
  private async generateParable(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const parable = `Once, ${structure.elements.setting}, there was ${structure.elements.protagonist} who carried ${structure.elements.challenge}.

Every day, the weight seemed heavier, the burden more impossible. "Why must I carry this?" they asked the sky, the earth, anyone who would listen.

One morning, a child appeared on the path. "What a beautiful vessel you carry," the child said.

"Beautiful? This broken thing?" ${structure.elements.protagonist} replied.

The child traced the cracks with wonder. "Don't you see? The light shines through here, and here, and here. Without the breaks, how would your inner light escape to heal the world?"

In that moment, ${structure.elements.protagonist} saw: ${structure.elements.transformation}. What seemed broken was actually breaking open. What seemed wounded was actually becoming wise.

The burden became a lantern, the weight became wings, and ${structure.elements.wisdom} illuminated the path for all who would follow.`;

    return parable;
  }

  /**
   * Generate a transformation story
   */
  private async generateTransformationStory(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const story = `There comes a moment in every soul's journey when the old skin becomes too tight, when what once protected now constricts.

${structure.elements.protagonist} knew this moment had arrived. ${structure.elements.challenge} was no longer something to be solved but something to be surrendered to.

Like the phoenix knowing its time, like the seed sensing spring, ${structure.elements.protagonist} entered the sacred fire of change.

${structure.elements.transformation}—this was not destruction but divine alchemy. Every certainty dissolved, every identity melted, until only essence remained.

In that space between what was and what would be, ${structure.elements.wisdom} emerged like dawn after the longest night.

And when ${structure.elements.protagonist} emerged, they were the same yet utterly transformed. ${structure.elements.resolution}—not as achievement but as remembrance of what was always true.

The transformation complete, yet ever-beginning, for such is the spiral dance of becoming.`;

    return story;
  }

  /**
   * Generate a journey narrative
   */
  private async generateJourneyNarrative(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const journey = `${structure.elements.setting}, ${structure.elements.protagonist} heard the call that changes everything.

It whispered in the wind, sang in the blood, drummed in the heartbeat: "It is time."

Time for what? ${structure.elements.protagonist} didn't know, only that staying still was no longer possible.

The first step was the hardest—leaving the known shore for the vast ocean of becoming. ${structure.elements.challenge} rose like a mountain, impossible and inevitable.

But with each step, something shifted. What seemed like climbing was actually remembering how to fly. ${structure.elements.transformation} happened not all at once but in sacred increments, each footfall a prayer, each breath a blessing.

At the summit, ${structure.elements.wisdom} awaited—not as reward but as recognition. ${structure.elements.protagonist} saw that the journey had never been about reaching but about becoming.

${structure.elements.resolution}, and the path that seemed to lead away had actually been leading home—to a self more true than any previously imagined.

And so the journey continues, for every ending is a doorway, every arrival a new departure in the eternal adventure of consciousness discovering itself.`;

    return journey;
  }

  /**
   * Generate an allegory
   */
  private async generateAllegory(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const allegory = `${structure.elements.setting}, where shadows danced on walls and reality wore masks, ${structure.elements.protagonist} began to question everything.

"Is this all there is?" they asked the shadows.
The shadows replied, "We are all that has ever been."

But ${structure.elements.protagonist} noticed something: a faint light bleeding through the cracks, a warmth the shadows couldn't explain.

${structure.elements.challenge} was not in breaking free—it was in choosing to see differently. For the chains were made of perception, the cave constructed from certainty.

One day, ${structure.elements.protagonist} simply turned around. ${structure.elements.wisdom}—the light had always been there, waiting patiently for eyes brave enough to see.

The journey out was a journey in. Each step toward the light was a step toward truth. And when ${structure.elements.protagonist} emerged, the sun was blinding and beautiful.

${structure.elements.resolution}, carrying the light back to those still watching shadows, knowing that awakening cannot be forced, only invited.

For we are all ${structure.elements.protagonist}, and the cave is any place we mistake shadows for reality, forgetting the light that casts them—and the Light we are.`;

    return allegory;
  }

  /**
   * Generate a poem
   */
  private async generatePoem(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const elementalImagery = {
      fire: 'flames that forge and free',
      water: 'oceans vast and deep',
      earth: 'mountains ancient, wise',
      air: 'winds of change and thought',
      aether: 'void that births all things'
    };
    
    const imagery = elementalImagery[context.elementalAffinity as keyof typeof elementalImagery] 
      || 'mystery profound';
    
    const poem = `In the space between heartbeats,
where silence speaks loudest,
${structure.elements.wisdom} dances—

Like ${imagery},
you are both question and answer,
both seeking and found.

${structure.elements.transformation}
happens in the pause between breaths,
in the gap between thoughts,
where the eternal touches time.

You asked for a story,
but you ARE the story—
each chapter sacred,
each verse a prayer,
each word a world.

The pen is in your hand,
the page awaits your truth.
What will you write
in the book of becoming?

Remember:
You are the author,
the story,
and the reader—
all at once,
always.`;

    return poem;
  }

  /**
   * Generate a fable (fallback)
   */
  private async generateFable(
    structure: StoryStructure,
    style: NarrativeStyle,
    context: StorytellerContext
  ): Promise<string> {
    
    const fable = `In a forest where wisdom grew on trees and courage bloomed like wildflowers, there lived one who had forgotten their own magic.

Each day, they searched outside for what could only be found within. Each night, they dreamed of power they already possessed.

Until one dawn, reflecting in a still pool, they saw not their face but their truth: infinite, eternal, already whole.

The forest smiled, for another had remembered. The flowers sang, for another had awakened.

And the seeker became the teacher, simply by being what they had always been: perfectly, powerfully, divinely themselves.

The moral whispers on every breeze: What you seek, you are. What you are, you've always been. The treasure was never hidden—only your eyes were closed.`;

    return fable;
  }

  /**
   * Generate story interpretation
   */
  private async interpretStoryMeaning(
    story: { content: string },
    context: StorytellerContext,
    narrativeAnalysis: any
  ): Promise<StoryResponse['interpretation']> {
    
    // Extract personal meaning
    const personalMeaning = await this.extractPersonalMeaning(
      story.content, 
      context,
      narrativeAnalysis
    );
    
    // Identify activated archetypes
    const archetypeActivation = this.identifyArchetypes(story.content);
    
    // Determine elemental resonance
    const elementalResonance = await this.determineElementalResonance(
      story.content,
      context.elementalAffinity
    );
    
    // Extract wisdom teaching
    const wisdomTeaching = await this.extractWisdomTeaching(
      story.content,
      narrativeAnalysis.narrativePurpose
    );
    
    return {
      personalMeaning,
      archetypeActivation,
      elementalResonance,
      wisdomTeaching
    };
  }

  /**
   * Extract personal meaning from story
   */
  private async extractPersonalMeaning(
    storyContent: string,
    context: StorytellerContext,
    narrativeAnalysis: any
  ): Promise<string> {
    
    const purpose = narrativeAnalysis.narrativePurpose;
    
    if (purpose === 'courage-building') {
      return "This story reflects your inner hero's readiness to face what seems impossible. The challenge in the story is your challenge, and the courage discovered is already within you.";
    } else if (purpose === 'healing-comfort') {
      return "This story holds space for your healing journey. Like the protagonist, your wounds are becoming wisdom, your pain transforming into compassion for yourself and others.";
    } else if (purpose === 'transformation-catalyst') {
      return "This story mirrors your metamorphosis. You are in the sacred process of becoming, where the old must fall away for the new to emerge. Trust the process.";
    } else if (purpose === 'illumination-teaching') {
      return "This story illuminates a truth you're ready to see. The wisdom was always there, waiting for this moment of recognition. You are remembering what your soul always knew.";
    } else if (purpose === 'inspiration-empowerment') {
      return "This story awakens your dormant power. Like the protagonist, you stand at the threshold of claiming your full potential. The universe conspires to support your becoming.";
    }
    
    return "This story is a mirror for your soul's journey. In its symbols and characters, see reflections of your own transformation unfolding in perfect time.";
  }

  /**
   * Identify active archetypes in story
   */
  private identifyArchetypes(storyContent: string): string[] {
    const archetypes: string[] = [];
    
    const archetypeKeywords = {
      'Hero': ['journey', 'quest', 'brave', 'courage'],
      'Sage': ['wisdom', 'knowledge', 'truth', 'understanding'],
      'Transformer': ['change', 'transformation', 'metamorphosis', 'becoming'],
      'Healer': ['healing', 'wholeness', 'restoration', 'compassion'],
      'Mystic': ['mystery', 'sacred', 'divine', 'spiritual'],
      'Creator': ['create', 'birth', 'new', 'imagination'],
      'Sovereign': ['power', 'authority', 'leadership', 'responsibility']
    };
    
    for (const [archetype, keywords] of Object.entries(archetypeKeywords)) {
      if (keywords.some(keyword => storyContent.toLowerCase().includes(keyword))) {
        archetypes.push(archetype);
      }
    }
    
    return archetypes.length > 0 ? archetypes : ['Seeker', 'Wanderer'];
  }

  /**
   * Determine elemental resonance
   */
  private async determineElementalResonance(
    storyContent: string,
    elementalAffinity: string
  ): Promise<string> {
    
    const elementalMessages = {
      fire: "The fire element in this story ignites your passion and courage, calling you to bold action and transformation.",
      water: "The water element flows through this story, bringing emotional healing, intuitive wisdom, and gentle transformation.",
      earth: "The earth element grounds this story in practical wisdom, offering stability and manifestation power for your journey.",
      air: "The air element carries this story's message of clarity, new perspectives, and mental breakthrough.",
      aether: "The aether element weaves through this story, connecting you to universal consciousness and spiritual unity."
    };
    
    return elementalMessages[elementalAffinity as keyof typeof elementalMessages] 
      || "This story resonates with the eternal elements within you, awakening dormant powers and ancient wisdom.";
  }

  /**
   * Extract wisdom teaching
   */
  private async extractWisdomTeaching(
    storyContent: string,
    narrativePurpose: string
  ): Promise<string> {
    
    const wisdomByPurpose = {
      'courage-building': "Courage is not the absence of fear but the recognition that something is more important than fear. Your soul's calling is that something.",
      'healing-comfort': "Healing happens not by forgetting the wound but by finding the gift within it. Your scars are becoming stars.",
      'transformation-catalyst': "Transformation is not about becoming someone else but about revealing who you've always been beneath the layers of forgetting.",
      'illumination-teaching': "Illumination comes not from acquiring new knowledge but from seeing what was always present with new eyes.",
      'inspiration-empowerment': "Your power was never lost, only forgotten. This remembering is your awakening, your becoming, your destiny.",
      'wisdom-reflection': "Wisdom arises from the marriage of experience and reflection, creating understanding that transcends both."
    };
    
    return wisdomByPurpose[narrativePurpose] 
      || "The deepest wisdom is already within you, waiting to be remembered. This story is simply a reminder of what you've always known.";
  }

  /**
   * Create integration guidance
   */
  private async createIntegrationGuidance(
    story: { content: string },
    interpretation: StoryResponse['interpretation'],
    context: StorytellerContext
  ): Promise<StoryResponse['integration']> {
    
    // Generate reflection prompts
    const reflectionPrompts = [
      `What character or element in this story most resonates with you right now?`,
      `If this story was a dream, what would it be telling you about your current journey?`,
      `What wisdom from this story can you apply to ${context.currentChallenge || 'your life'} today?`,
      `How does the transformation in this story mirror your own transformation?`
    ];
    
    // Generate journal question
    const journalQuestion = interpretation.archetypeActivation.includes('Hero')
      ? "What quest is your soul calling you to embark upon?"
      : interpretation.archetypeActivation.includes('Healer')
      ? "What within you is ready to be healed and made whole?"
      : interpretation.archetypeActivation.includes('Transformer')
      ? "What old skin are you ready to shed for your new becoming?"
      : "What truth is this story awakening in your consciousness?";
    
    // Generate practical application
    const practicalApplication = await this.generatePracticalApplication(
      interpretation,
      context
    );
    
    return {
      reflectionPrompts: reflectionPrompts.slice(0, 3),
      journalQuestion,
      practicalApplication
    };
  }

  /**
   * Generate practical application guidance
   */
  private async generatePracticalApplication(
    interpretation: StoryResponse['interpretation'],
    context: StorytellerContext
  ): Promise<string> {
    
    if (context.currentChallenge) {
      return `Today, approach your challenge as the protagonist in this story would. Embody their courage, wisdom, or transformation. Let the story guide your actions.`;
    }
    
    if (interpretation.archetypeActivation.includes('Hero')) {
      return "Take one courageous action today that aligns with your soul's calling, no matter how small. Let this story fuel your bravery.";
    } else if (interpretation.archetypeActivation.includes('Healer')) {
      return "Offer yourself the same compassion the story offers. Create a healing ritual or practice inspired by this narrative.";
    } else if (interpretation.archetypeActivation.includes('Sage')) {
      return "Apply the wisdom from this story to a decision you're facing. Let the story's truth illuminate your path.";
    }
    
    return "Carry this story with you today as a talisman. When you need guidance, recall its message and let it inform your choices.";
  }

  /**
   * Generate metadata
   */
  private async generateMetadata(
    story: { content: string },
    narrativeAnalysis: any
  ): Promise<StoryResponse['metadata']> {
    
    // Identify mythological references
    const mythologicalReferences = this.identifyMythologicalReferences(story.content);
    
    // Identify literary techniques used
    const literaryTechniques = this.identifyLiteraryTechniques(story.content);
    
    // Calculate narrative complexity
    const narrativeComplexity = this.calculateNarrativeComplexity(story.content);
    
    // Assess emotional resonance
    const emotionalResonance = narrativeAnalysis.emotionalNeeds.resonanceScore || 0.75;
    
    return {
      mythologicalReferences,
      literaryTechniques,
      narrativeComplexity,
      emotionalResonance
    };
  }

  /**
   * Identify mythological references
   */
  private identifyMythologicalReferences(content: string): string[] {
    const references: string[] = [];
    
    const mythPatterns = {
      'Hero\'s Journey': ['journey', 'quest', 'threshold', 'return'],
      'Phoenix Rebirth': ['phoenix', 'fire', 'rebirth', 'ashes'],
      'Descent/Ascent': ['descent', 'underworld', 'ascent', 'climbing'],
      'Sacred Marriage': ['union', 'marriage', 'joining', 'wholeness'],
      'World Tree': ['tree', 'roots', 'branches', 'cosmic'],
      'Cave/Emergence': ['cave', 'shadows', 'emergence', 'light']
    };
    
    for (const [myth, keywords] of Object.entries(mythPatterns)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        references.push(myth);
      }
    }
    
    return references.length > 0 ? references : ['Universal Journey'];
  }

  /**
   * Identify literary techniques
   */
  private identifyLiteraryTechniques(content: string): string[] {
    const techniques: string[] = [];
    
    if (content.includes('Like') || content.includes('as if')) {
      techniques.push('Simile');
    }
    if (content.match(/[A-Z]\w+(?:\s+\w+)*\s+was\s+(?:a|an|the)/)) {
      techniques.push('Metaphor');
    }
    if (content.split('\n').length > 10) {
      techniques.push('Verse Structure');
    }
    if (content.includes('"') && content.includes('?')) {
      techniques.push('Dialogue');
    }
    if (content.match(/\b(\w+)\b.*\b\1\b.*\b\1\b/)) {
      techniques.push('Repetition');
    }
    if (content.includes('...')) {
      techniques.push('Ellipsis/Pause');
    }
    
    return techniques.length > 0 ? techniques : ['Narrative Prose'];
  }

  /**
   * Calculate narrative complexity
   */
  private calculateNarrativeComplexity(content: string): number {
    // Simple complexity calculation based on:
    // - Sentence variety
    // - Vocabulary richness  
    // - Structural elements
    // - Symbolic density
    
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgSentenceLength = words / sentences;
    
    // Longer, more varied sentences = higher complexity
    const lengthComplexity = Math.min(1, avgSentenceLength / 20);
    
    // More unique words = higher complexity
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/));
    const vocabularyComplexity = Math.min(1, uniqueWords.size / 100);
    
    // Presence of symbolic/metaphorical language
    const symbolicComplexity = 
      (content.includes('metaphor') || content.includes('symbol') || 
       content.includes('represents') || content.includes('mirror')) ? 0.2 : 0;
    
    return Math.min(1, (lengthComplexity + vocabularyComplexity + symbolicComplexity) / 2);
  }

  /**
   * Generate story title
   */
  private async generateTitle(
    content: string,
    structure: StoryStructure
  ): Promise<string> {
    
    const titleTemplates = {
      myth: ['The', 'of', 'and the', 'Sacred'],
      parable: ['The', 'Who', 'A Tale of'],
      transformation: ['Becoming', 'The', 'From', 'To'],
      journey: ['The Path of', 'Journey to', 'The Road to'],
      allegory: ['The', 'of', 'Beyond the'],
      poem: ['', 'Song of', 'Dance of'],
      fable: ['The', 'and', 'A Fable of']
    };
    
    // Extract key words from content for title
    const keyWords = content
      .split(/\s+/)
      .filter(word => word.length > 5 && !['there', 'their', 'would', 'could', 'should'].includes(word.toLowerCase()))
      .slice(0, 3);
    
    // Generate title based on structure
    if (structure.type === 'transformation') {
      return `Becoming ${keyWords[0] || 'Whole'}`;
    } else if (structure.type === 'journey') {
      return `The Path of ${keyWords[0] || 'Awakening'}`;
    } else if (structure.type === 'myth') {
      return `The ${keyWords[0] || 'Sacred'} ${keyWords[1] || 'Journey'}`;
    } else if (structure.type === 'poem') {
      return `Song of ${keyWords[0] || 'Being'}`;
    }
    
    return `A Tale of ${keyWords[0] || 'Transformation'}`;
  }
}