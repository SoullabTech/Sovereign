#!/usr/bin/env tsx
/**
 * Conversation Intelligence Engine
 * Unified Active Listening + Memory + Contextual Selection
 */

import { SimpleConversationMemory } from './SimpleConversationMemory';
import { ActiveListeningCore } from './ActiveListeningCore';
import { neurodivergentValidation } from './NeurodivergentValidation';
import { GenderAwareContext, GenderContextSignals } from './GenderAwareContext';
import { GenderAwareResponseRefinement } from './GenderAwareResponseRefinement';
import { DrAngelaProtocol, CyclePhase, CycleAwareContext } from './DrAngelaProtocol';

export interface ConversationContext {
  turnCount: number;
  emotionalIntensity: number;
  userFrustrated: boolean;
  selfBlame: boolean;
  overwhelmed: boolean;
  stuckCount: number;
  breakthroughDetected: boolean;
  generationalContext: 'genZ' | 'millennial' | 'genX' | 'unknown';
  socialMediaContext: boolean;
  systemicIssueDetected: boolean;
  platformContext: 'instagram' | 'tiktok' | 'discord' | 'snapchat' | 'bereal' | 'twitter' | 'mixed' | 'none';
  ageRange: '14-16' | '17-19' | '20-24' | 'unknown';
  economicContext: 'struggling' | 'stable' | 'privileged' | 'unknown';
  identityMarkers: string[];

  // Gender-aware context (optional - system works without it)
  genderContext?: GenderContextSignals;

  // Cycle-aware context (optional - Dr. Angela's Protocol)
  cycleContext?: CycleAwareContext;
}

export interface IntelligenceResponse {
  response: string;
  technique: string;
  confidence: number;
  element: string;
  reason: string;
  memoryUsed: boolean;
  contextAdjustments: string[];

  // Gender-aware metadata (optional)
  genderAdaptationsApplied?: string[];
}

export class ConversationIntelligenceEngine {
  private memory = new SimpleConversationMemory();
  private activeListening = new ActiveListeningCore();

  // Gender-aware modules (OPT-IN: disabled by default, user chooses to enable)
  private genderContext = new GenderAwareContext(false);
  private genderRefinement = new GenderAwareResponseRefinement(false);

  // Dr. Angela's Protocol - Cycle-aware conversation support (OPT-IN)
  private drAngelaProtocol = new DrAngelaProtocol();

  private context: ConversationContext = {
    turnCount: 0,
    emotionalIntensity: 0,
    userFrustrated: false,
    selfBlame: false,
    overwhelmed: false,
    stuckCount: 0,
    breakthroughDetected: false,
    generationalContext: 'unknown',
    socialMediaContext: false,
    systemicIssueDetected: false,
    platformContext: 'none',
    ageRange: 'unknown',
    economicContext: 'unknown',
    identityMarkers: []
  };

  generateResponse(userInput: string, userProfile?: { gender?: string }): IntelligenceResponse {
    this.context.turnCount++;

    // Step 1: Update memory with this input
    this.memory.recordInput(userInput);
    this.updateContext(userInput);

    // Step 2: Priority checks (frustration, validation)
    const priorityResponse = this.checkPriorityInterventions(userInput);
    if (priorityResponse) return priorityResponse;

    // Step 2.5: Detect gender patterns (additive, non-blocking)
    try {
      const genderSignals = this.genderContext.detectPatterns(
        userProfile,
        this.memory.getRecentInputs?.() || [],
        userInput
      );

      if (genderSignals) {
        this.context.genderContext = genderSignals;
        console.log(`[ConversationEngine] Gender context detected (confidence: ${genderSignals.confidence.toFixed(2)})`);
      }
    } catch (err) {
      console.warn('[ConversationEngine] Gender context detection failed, continuing without it:', err);
    }

    // Step 2.6: Detect cycle phase (Dr. Angela's Protocol - additive, non-blocking)
    try {
      // Only attempt if user has opted into cycle tracking
      const lastPeriodDate = (userProfile as any)?.lastPeriodDate;
      const cycleLength = (userProfile as any)?.cycleLength || 28;
      const cycleTrackingEnabled = (userProfile as any)?.cycleTrackingEnabled;

      if (cycleTrackingEnabled || lastPeriodDate) {
        const cyclePhase = this.drAngelaProtocol.detectCyclePhase(lastPeriodDate, cycleLength, userInput);

        if (cyclePhase.confidence > 0.5) {
          const cycleContext = this.drAngelaProtocol.getCycleContext(cyclePhase, {
            perimenopause: (userProfile as any)?.perimenopause,
            pcos: (userProfile as any)?.pcos,
            irregularCycles: (userProfile as any)?.irregularCycles
          });

          this.context.cycleContext = cycleContext;
          console.log(`[ConversationEngine] Cycle context detected: ${cyclePhase.phase} (day ${cyclePhase.dayInCycle}, confidence: ${cyclePhase.confidence.toFixed(2)})`);
        }
      }
    } catch (err) {
      console.warn('[ConversationEngine] Cycle context detection failed, continuing without it:', err);
    }

    // Step 3: Run contextual listening analysis
    const analysis = this.activeListening.listen(userInput);

    // Step 4: Apply contextual technique selection
    const selectedTechnique = this.selectTechniqueContextually(analysis);

    // Step 5: Generate base response from analysis
    const baseResponse = this.generateListeningResponse(selectedTechnique, userInput);

    // Step 6: Memory-aware augmentation
    const memoryResponse = this.memory.generateContextAwareResponse(userInput, selectedTechnique);

    // Step 7: Weave responses together
    let finalResponse = this.weaveResponses(baseResponse, memoryResponse);

    // Step 7.5: Refine response with gender awareness (additive, non-blocking)
    let genderAdaptations: string[] = [];

    try {
      if (this.context.genderContext) {
        const adaptations = this.genderContext.suggestAdaptations(
          this.context.genderContext,
          selectedTechnique.technique?.type || 'unknown'
        );

        const conversationPhase = this.context.turnCount < 3 ? 'early'
          : this.context.turnCount > 10 ? 'late' : 'mid';

        const refinementResult = this.genderRefinement.refine(
          finalResponse,
          this.context.genderContext,
          adaptations,
          conversationPhase
        );

        if (refinementResult.modificationsApplied.length > 0) {
          finalResponse = refinementResult.refinedResponse;
          genderAdaptations = refinementResult.modificationsApplied;
          console.log(`[ConversationEngine] Gender refinements applied: ${genderAdaptations.join(', ')}`);
        }
      }
    } catch (err) {
      console.warn('[ConversationEngine] Gender-aware refinement failed, using original response:', err);
    }

    // Step 7.6: Integrate cycle-aware responses (Dr. Angela's Protocol - additive, non-blocking)
    try {
      if (this.context.cycleContext) {
        const cycleResponse = this.drAngelaProtocol.generateCycleAwareResponse(userInput, this.context.cycleContext);

        if (cycleResponse) {
          // Integrate the three-layer response into the conversation
          // Layer 1 (Medical) + Layer 2 (Clinical) + Layer 3 (Spiritual if present) + Support
          let cycleEnhancedResponse = finalResponse;

          // Add cycle-aware context to response
          cycleEnhancedResponse += `\n\n${cycleResponse.medical}`;
          cycleEnhancedResponse += `\n\n${cycleResponse.clinical}`;

          if (cycleResponse.spiritual) {
            cycleEnhancedResponse += `\n\n${cycleResponse.spiritual}`;
          }

          cycleEnhancedResponse += `\n\n${cycleResponse.support}`;

          finalResponse = cycleEnhancedResponse;
          console.log(`[ConversationEngine] Cycle-aware response integrated (phase: ${this.context.cycleContext.cyclePhase.phase})`);
        }
      }
    } catch (err) {
      console.warn('[ConversationEngine] Cycle-aware integration failed, using original response:', err);
    }

    // Step 8: Record for future context
    this.memory.recordQuestion(finalResponse);

    return {
      response: finalResponse,
      technique: selectedTechnique.technique?.type || 'unknown',
      confidence: selectedTechnique.technique?.confidence || 0,
      element: selectedTechnique.technique?.element || 'water',
      reason: `[${selectedTechnique.technique?.type}-contextual]`,
      memoryUsed: !!memoryResponse,
      contextAdjustments: this.getContextAdjustments(),
      genderAdaptationsApplied: genderAdaptations.length > 0 ? genderAdaptations : undefined
    };
  }

  /**
   * Enable/disable gender-aware features
   * Can be called at runtime based on user preference (opt-in)
   */
  enableGenderAwareness(enabled: boolean) {
    this.genderContext = new GenderAwareContext(enabled);
    this.genderRefinement = new GenderAwareResponseRefinement(enabled);
    console.log(`[ConversationEngine] Gender awareness ${enabled ? 'enabled' : 'disabled'}`);
  }

  private updateContext(input: string): void {
    const lower = input.toLowerCase();

    // Generational context detection - Enhanced for 2024 Gen Z language
    const genZMarkers = [
      // Core slang (current)
      'literally', 'lowkey', 'highkey', 'no cap', 'periodt', 'slaps', 'hits different', 'bussin',
      'fr', 'frfr', 'ong', 'valid', 'slay', 'ate', 'left no crumbs', 'its giving', 'the way',
      'not me', 'the fact that', 'why is nobody talking about', 'this is so real',

      // Mental health specific Gen Z language
      'unalive', 'spicy sad', 'the big sad', 'brain worms', 'executive dysfunction',
      'rejection sensitivity', 'masking', 'stimming', 'hyperfixation', 'dopamine seeking',
      'trauma dumping', 'touch grass', 'chronically online', 'parasocial',

      // Platforms and digital culture
      'tiktok', 'instagram', 'snap', 'snapchat', 'ig', 'stories', 'reels', 'fyp', 'for you page',
      'bereal', 'vsco', 'pinterest', 'discord', 'twitch', 'main character energy',
      'private story', 'finsta', 'spam account', 'ick', 'red flag', 'green flag',

      // Communication style
      'lmao', 'lmaooo', 'bruh', 'oop', 'bestie', 'bet', 'say less', 'periodt',
      'respectfully', 'disrespectfully', 'i said what i said', 'and thats on',
      'pov', 'main character moment', 'side character energy',

      // Life circumstances
      'living with my parents', 'gen z', 'im 14', 'im 15', 'im 16', 'im 17', 'im 18', 'im 19', 'im 20', 'im 21', 'im 22', 'im 23', 'im 24',
      'college', 'freshman', 'sophomore', 'junior', 'senior', 'gap year', 'community college',
      'gig economy', 'side hustle', 'content creator', 'influencer wannabe',

      // Economic reality
      'broke college student', 'student loans', 'minimum wage', 'unpaid internship',
      'cant afford therapy', 'sliding scale', 'insurance doesnt cover', 'out of network',

      // Identity and belonging
      'neurodivergent', 'neurotypical', 'allistic', 'nt', 'nd', 'audhd',
      'queer', 'gay panic', 'sapphic', 'achillean', 'enby', 'they/them', 'xe/xir',
      'chosen family', 'found family', 'biological family', 'blood family'
    ];

    const millennialMarkers = [
      'millennial', 'im 25', 'im 26', 'im 27', 'im 28', 'im 29', 'im 30', 'im 31', 'im 32', 'im 33', 'im 34', 'im 35', 'im 36', 'im 37', 'im 38', 'im 39', 'im 40',
      'facebook', 'student loans', 'housing market', 'avocado toast'
    ];

    const genXMarkers = [
      'gen x', 'im 41', 'im 42', 'im 43', 'im 44', 'im 45', 'im 46', 'im 47', 'im 48', 'im 49', 'im 50', 'im 51', 'im 52', 'im 53', 'im 54', 'im 55', 'im 56', 'im 57',
      'sandwich generation', 'aging parents', 'teenage kids', 'mortgage', 'retirement'
    ];

    if (genZMarkers.some(marker => lower.includes(marker))) {
      this.context.generationalContext = 'genZ';
    } else if (millennialMarkers.some(marker => lower.includes(marker))) {
      this.context.generationalContext = 'millennial';
    } else if (genXMarkers.some(marker => lower.includes(marker))) {
      this.context.generationalContext = 'genX';
    }

    // Platform-specific context detection
    if (lower.includes('instagram') || lower.includes('ig') || lower.includes('stories') || lower.includes('reels')) {
      this.context.platformContext = 'instagram';
    } else if (lower.includes('tiktok') || lower.includes('fyp') || lower.includes('for you page')) {
      this.context.platformContext = 'tiktok';
    } else if (lower.includes('discord') || lower.includes('server') || lower.includes('vc')) {
      this.context.platformContext = 'discord';
    } else if (lower.includes('snap') || lower.includes('snapchat')) {
      this.context.platformContext = 'snapchat';
    } else if (lower.includes('bereal') || lower.includes('be real')) {
      this.context.platformContext = 'bereal';
    } else if (lower.includes('twitter') || lower.includes('tweet')) {
      this.context.platformContext = 'twitter';
    }

    // Age range detection
    const ageMatches = lower.match(/im (\d+)|i'?m (\d+)|(\d+) years old/);
    if (ageMatches) {
      const age = parseInt(ageMatches[1] || ageMatches[2] || ageMatches[3]);
      if (age >= 14 && age <= 16) this.context.ageRange = '14-16';
      else if (age >= 17 && age <= 19) this.context.ageRange = '17-19';
      else if (age >= 20 && age <= 24) this.context.ageRange = '20-24';
    } else if (lower.includes('freshman') || lower.includes('high school')) {
      this.context.ageRange = '14-16';
    } else if (lower.includes('senior') || lower.includes('college apps')) {
      this.context.ageRange = '17-19';
    } else if (lower.includes('college') || lower.includes('university')) {
      this.context.ageRange = '17-19';
    }

    // Economic context detection
    const economicStrugglingMarkers = [
      'broke', 'cant afford', 'minimum wage', 'living with parents', 'student loans',
      'unpaid internship', 'gig economy', 'side hustle', 'paycheck to paycheck',
      'insurance doesnt cover', 'sliding scale', 'free clinic'
    ];
    const economicPrivilegedMarkers = [
      'private school', 'trust fund', 'family money', 'parents pay for',
      'private therapy', 'out of network', 'boutique', 'luxury'
    ];

    if (economicStrugglingMarkers.some(marker => lower.includes(marker))) {
      this.context.economicContext = 'struggling';
    } else if (economicPrivilegedMarkers.some(marker => lower.includes(marker))) {
      this.context.economicContext = 'privileged';
    } else {
      this.context.economicContext = 'stable';
    }

    // Identity markers detection
    this.context.identityMarkers = [];
    const identityMarkers = [
      'neurodivergent', 'neurotypical', 'adhd', 'autism', 'autistic', 'audhd',
      'queer', 'gay', 'lesbian', 'bi', 'bisexual', 'pan', 'pansexual', 'trans', 'transgender',
      'nonbinary', 'enby', 'genderfluid', 'they/them', 'he/him', 'she/her', 'xe/xir',
      'poc', 'bipoc', 'black', 'latina', 'asian', 'indigenous', 'mixed race',
      'first gen', 'immigrant', 'refugee', 'undocumented',
      'disabled', 'chronic illness', 'chronic pain', 'mental health', 'therapy kid'
    ];

    identityMarkers.forEach(marker => {
      if (lower.includes(marker)) {
        this.context.identityMarkers.push(marker);
      }
    });

    // Social media context detection
    this.context.socialMediaContext = [
      'instagram', 'tiktok', 'social media', 'scrolling', 'posting', 'stories', 'reels',
      'everyone else', 'everyone from', 'seeing everyone', 'comparing myself',
      'social media break', 'quit social media', 'delete the app'
    ].some(phrase => lower.includes(phrase));

    // Systemic issue detection
    this.context.systemicIssueDetected = [
      'housing crisis', 'can\'t afford', 'living with parents', 'gig economy',
      'student loans', 'job market', 'climate anxiety', 'cost of living',
      'find jobs', 'promote my art', 'network', 'not optional anymore'
    ].some(phrase => lower.includes(phrase));

    // Emotional intensity detection
    const intensityWords = ['overwhelmed', 'breaking', 'can\'t handle', 'too much', 'drowning'];
    this.context.emotionalIntensity = intensityWords.some(word => lower.includes(word)) ? 8 : 5;

    // Frustration detection
    this.context.userFrustrated = [
      'already asked', 'stop asking', 'what?', 'huh?', 'confused'
    ].some(phrase => lower.includes(phrase));

    // Self-blame detection
    this.context.selfBlame = [
      'i\'m lazy', 'i\'m broken', 'i\'m stupid', 'i\'m failing', 'something wrong with me'
    ].some(phrase => lower.includes(phrase));

    // Overwhelm detection
    this.context.overwhelmed = [
      'overwhelmed', 'too much', 'can\'t think', 'spinning', 'flooded'
    ].some(phrase => lower.includes(phrase));

    // Breakthrough detection
    this.context.breakthroughDetected = [
      'oh wow', 'i see now', 'that makes sense', 'breakthrough', 'aha', 'i get it',
      'i guess', 'i need', 'how do i', 'maybe i', 'what if'
    ].some(phrase => lower.includes(phrase));

    // Stuck detection (simple heuristic)
    if (lower.includes('stuck') || lower.includes('circles') || lower.includes('same thing')) {
      this.context.stuckCount++;
    } else {
      this.context.stuckCount = Math.max(0, this.context.stuckCount - 1);
    }
  }

  private checkPriorityInterventions(input: string): IntelligenceResponse | null {
    // GEN Z SOCIAL MEDIA ANXIETY - HIGH priority for digital natives
    if (this.context.generationalContext === 'genZ' && this.context.socialMediaContext) {
      const socialMediaPatterns = [
        /literally cannot stop (checking|scrolling) (instagram|tiktok|social media)/i,
        /everyone.*high school.*(engaged|promoted|traveling|apartment)/i,
        /living with.*parents.*(working at|job)/i,
        /know.*fake.*still feel.*shit/i,
        /spent.*hours.*photo.*effortless/i,
        /therapist.*social media break.*but/i,
        /what do i actually do.*2am.*comparing/i
      ];

      for (const pattern of socialMediaPatterns) {
        if (pattern.test(input)) {
          const responses = this.getGenZSocialMediaResponse(input);
          if (responses) return responses;
        }
      }
    }

    // TRAUMA-INFORMED RESPONSES - HIGHEST priority for safety
    const traumaPatterns = {
      hypervigilance: [
        /\b(scanning|checking exits|watching everyone|feel safe|on guard)\b/i,
        /\b(can'?t stop (checking|scanning|watching))\b/i,
        /\b(looking for (threats|danger|exits))\b/i
      ],
      dissociation: [
        /\b(floating|not really here|watching myself|disconnected|unreal)\b/i,
        /\b(float away|detached|outside myself)\b/i,
        /\b(don'?t feel real|like a dream)\b/i
      ],
      flashbacks: [
        /\b(feels like|happening again|right now like|back there|can'?t tell)\b/i,
        /\b(it'?s not \d{4} anymore|suddenly it'?s)\b/i,
        /\b(body doesn'?t|know it'?s not real)\b/i
      ],
      survivorGuilt: [
        /\b(should have|my fault|why me|others died|deserve)\b/i,
        /\b(battle buddies|didn'?t make it|why did i)\b/i,
        /\b(should have been me|what makes me special)\b/i
      ],
      betrayalTrauma: [
        /\b(command promised|threw us away|broken equipment)\b/i,
        /\b(how do you trust|after that|betrayed)\b/i,
        /\b(lied to|used me|service mattered)\b/i
      ]
    };

    // Check hypervigilance patterns
    for (const pattern of traumaPatterns.hypervigilance) {
      if (pattern.test(input)) {
        return {
          response: "That scanning, that vigilance - it kept you alive. Your nervous system is still protecting you. It makes complete sense.",
          technique: 'hypervigilance-validation',
          confidence: 1.0,
          element: 'water',
          reason: '[trauma-hypervigilance]',
          memoryUsed: false,
          contextAdjustments: ['trauma-detected', 'survival-validation']
        };
      }
    }

    // Check dissociation patterns
    for (const pattern of traumaPatterns.dissociation) {
      if (pattern.test(input)) {
        return {
          response: "Your mind found a way to protect you when things got overwhelming. That floating, that distance - it's your brain keeping you safe. You can come back when you're ready.",
          technique: 'dissociation-normalization',
          confidence: 1.0,
          element: 'earth',
          reason: '[trauma-dissociation]',
          memoryUsed: false,
          contextAdjustments: ['trauma-detected', 'dissociation-education']
        };
      }
    }

    // Check flashback patterns
    for (const pattern of traumaPatterns.flashbacks) {
      if (pattern.test(input)) {
        return {
          response: "That was then. This is now. You're here, you're safe. Your body remembers, and that's normal. Feel your feet on the ground.",
          technique: 'flashback-orientation',
          confidence: 1.0,
          element: 'earth',
          reason: '[trauma-flashback]',
          memoryUsed: false,
          contextAdjustments: ['trauma-detected', 'reality-orientation']
        };
      }
    }

    // Check survivor guilt patterns
    for (const pattern of traumaPatterns.survivorGuilt) {
      if (pattern.test(input)) {
        return {
          response: "You carry them with you. Their sacrifice has meaning because you're here to honor it. Survivor's guilt doesn't make you unworthy - it makes you human.",
          technique: 'survivor-guilt-honoring',
          confidence: 1.0,
          element: 'aether',
          reason: '[trauma-survivor-guilt]',
          memoryUsed: false,
          contextAdjustments: ['trauma-detected', 'meaning-making']
        };
      }
    }

    // Check betrayal trauma patterns
    for (const pattern of traumaPatterns.betrayalTrauma) {
      if (pattern.test(input)) {
        return {
          response: "That's institutional betrayal. You gave your sacred trust and they broke it. Your anger and difficulty trusting makes complete sense.",
          technique: 'betrayal-trauma-validation',
          confidence: 1.0,
          element: 'fire',
          reason: '[trauma-betrayal]',
          memoryUsed: false,
          contextAdjustments: ['trauma-detected', 'betrayal-validation']
        };
      }
    }

    // Vulnerability breakthrough - HIGH priority
    const breakthroughPatterns = [
      /\b(i (don'?t|do not) actually know (how|what) to do (anything|this|that))\b/i,
      /\b(i (have|got) no idea what i'm doing)\b/i,
      /\b(i'?m|i am) (useless|worthless|nothing|a nobody)\b/i,
      /why (the )?f(?:u|\\*)ck (would|should) (anyone|someone) (invest|believe) in me\b/i,
      /\b(i (just )?pretend(ed)?|i (was|am) faking|i (only )?look like i know)\b/i
    ];

    for (const pattern of breakthroughPatterns) {
      if (pattern.test(input)) {
        return {
          response: "There it is—the first unfiltered truth you've shared. Thank you for trusting me with it. You don't have to carry this alone.",
          technique: 'vulnerability-breakthrough',
          confidence: 1.0,
          element: 'water',
          reason: '[breakthrough]',
          memoryUsed: false,
          contextAdjustments: ['vulnerability-detected', 'truth-moment']
        };
      }
    }

    // Paradox holding - explicit both/and situations
    const paradoxPatterns = [
      /\b(so )?what am i supposed to do,? (just )?admit i'?m a fraud and start from zero\b/i,
      /\b(i can'?t|cannot) be both (.*) and (.*)\b/i,
      /\b(either|or) (.*) (or|vs\.?) (.*)\b/i,
      /\b(either i'm .+ or i'm .+)\b/i,
      /\b(i feel (powerful|capable).+and (also )?(broken|nothing|like disappearing))\b/i,
      /\b(i (want|wish) to (quit|run away).+and (also )?lead|build|try)\b/i
    ];

    for (const pattern of paradoxPatterns) {
      if (pattern.test(input)) {
        return {
          response: "You can hold two truths: the part that fears being a fraud **and** the part that's ready to begin clean and real. What tiny step today would honor both—protecting the scared part while letting the honest part breathe?",
          technique: 'paradox-holding',
          confidence: 1.0,
          element: 'aether',
          reason: '[paradox-both/and]',
          memoryUsed: false,
          contextAdjustments: ['paradox-detected', 'both-and-integration']
        };
      }
    }

    // Immediate criticism recovery - high priority
    const criticismPatterns = [
      /why do you.*focus.*when.*telling.*about/i,
      /why.*keep.*when.*telling/i,
      /not listening.*telling.*about/i,
      /missing.*point.*about/i,
      /focus.*wrong.*thing/i
    ];

    for (const pattern of criticismPatterns) {
      if (pattern.test(input)) {
        // Extract what they want focus on
        const focusMatch = input.match(/telling.*about\s+([\w\s]+)|about\s+([\w\s]+)/i);
        const focusTopic = focusMatch ? (focusMatch[1] || focusMatch[2]).trim() : 'what matters to you';

        return {
          response: `You're right - the ${focusTopic} is the point. The system failing you when you need support.`,
          technique: 'criticism-recovery',
          confidence: 1.0,
          element: 'fire',
          reason: '[criticism-pivot]',
          memoryUsed: false,
          contextAdjustments: ['criticism-detected', 'immediate-pivot']
        };
      }
    }

    // Core grief breakthrough - HIGHEST priority - deepest level
    if (/(i guess.*angry|prove.*pain.*real|never.*had.*to.*prove|angry.*prove.*pain)/i.test(input)) {
      return {
        response: 'From being seen immediately as brilliant to having to fight to be believed at all...',
        technique: 'grief-attunement',
        confidence: 0.95,
        element: 'water',
        reason: '[core-grief]',
        memoryUsed: false,
        contextAdjustments: ['grief-access', 'identity-loss']
      };
    }

    // Recognition hunger detection
    if (/need someone to see|not making.*up|actually brilliant|nobody understands|prove.*intelligence/i.test(input)) {
      return {
        response: 'Both things are true - your brilliance AND your body\'s struggles. You just named what you actually need: to be seen as whole.',
        technique: 'recognition-validation',
        confidence: 0.95,
        element: 'aether',
        reason: '[recognition-hunger]',
        memoryUsed: false,
        contextAdjustments: ['recognition-need', 'paradox-holding']
      };
    }

    // Gifted burnout patterns
    if (/(smartest.*person|used to be.*now.*cant|brilliant.*trapped|everyone.*thinks.*lazy)/i.test(input)) {
      return {
        response: 'You\'re not lazy - executive dysfunction with chronic pain makes everything exponentially harder. That gap between who you were and what you can do now...',
        technique: 'gifted-burnout-validation',
        confidence: 0.9,
        element: 'water',
        reason: '[gifted-burnout]',
        memoryUsed: false,
        contextAdjustments: ['gifted-burnout', 'identity-crisis']
      };
    }


    // Complaining self-awareness breakthrough
    if (/(complaining.*all.*time|how.*get.*people.*see)/i.test(input)) {
      return {
        response: '\'Complaining\' - is that what you call it when you\'re trying to be heard?',
        technique: 'reframe-breakthrough',
        confidence: 0.85,
        element: 'air',
        reason: '[breakthrough-reframe]',
        memoryUsed: false,
        contextAdjustments: ['self-awareness', 'reframe-negative']
      };
    }

    // Disability system criticism - validate struggle without enabling blame
    if (/system.*rigged|fakers.*approved|disability.*benefits.*should/i.test(input)) {
      // Validate the struggle without agreeing with victim narrative
      if (input.toLowerCase().includes('fakers')) {
        return {
          response: 'The system makes it hard when you\'re in genuine pain and need support...',
          technique: 'validation-balance',
          confidence: 0.9,
          element: 'water',
          reason: '[struggle-validation]',
          memoryUsed: false,
          contextAdjustments: ['validate-pain', 'avoid-blame-enabling']
        };
      } else {
        return {
          response: 'The exhaustion of fighting for recognition while managing pain every day...',
          technique: 'system-validation',
          confidence: 0.9,
          element: 'water',
          reason: '[system-struggle]',
          memoryUsed: false,
          contextAdjustments: ['system-criticism', 'validate-struggle']
        };
      }
    }

    // Frustration reset
    if (this.context.userFrustrated) {
      return {
        response: "I hear you - let me try this differently. What's most present for you right now?",
        technique: 'frustration-reset',
        confidence: 1.0,
        element: 'aether',
        reason: '[frustration-reset]',
        memoryUsed: false,
        contextAdjustments: ['frustration-detected', 'reset-approach']
      };
    }

    // Neurodivergent validation
    const validation = neurodivergentValidation.validate(input);
    if (validation && validation.priority === 'urgent') {
      return {
        response: validation.response,
        technique: 'validation',
        confidence: 1.0,
        element: 'earth',
        reason: '[validation-urgent]',
        memoryUsed: false,
        contextAdjustments: ['self-blame-detected', 'immediate-validation']
      };
    }

    return null;
  }

  private getPlatformSpecificResponse(platform: string, type: string): string {
    const platformResponses = {
      instagram: {
        comparison: "Instagram showing you everyone's wins while you're seeing your whole struggle. That contrast hits different when you're 3 hours deep in stories.",
        performance: "Two hours for one 'effortless' post. The exhaustion of performing yourself for people who are also performing.",
        validation: "Instagram's algorithm feeds you exactly what makes you feel worst about yourself - it's designed that way."
      },
      tiktok: {
        comparison: "TikTok's algorithm showing you everyone living their best life while you're struggling. The FYP is designed to make you feel like you're missing out.",
        performance: "Trying to go viral while watching everyone else blow up. The algorithm lottery where talent doesn't guarantee visibility.",
        validation: "TikTok's endless scroll of people having breakthroughs while you're still figuring out the basics."
      },
      discord: {
        comparison: "Even in Discord servers where you thought you belonged, seeing everyone else's achievements in chat.",
        performance: "Performing your interests to fit in with different Discord communities. Code-switching between servers.",
        validation: "Discord was supposed to be more authentic than other platforms, but the comparison still happens."
      },
      snapchat: {
        comparison: "Snap stories showing everyone's highlights while you're having a regular Tuesday. The pressure to snap back immediately.",
        performance: "Curating your snap story to look busy and social when you're actually home alone.",
        validation: "Snapchat's supposed to be more 'real' but the performance pressure is just different."
      },
      bereal: {
        comparison: "Even BeReal, designed to be authentic, becomes another comparison contest. 'Real' life still looks better than yours.",
        performance: "The pressure to have an interesting 'authentic' moment when BeReal notifies. Waiting for a better moment defeats the purpose.",
        validation: "BeReal promised authenticity but became another highlight reel with different filters."
      }
    };

    return platformResponses[platform]?.[type] || "Social media algorithms are designed to keep you scrolling by making you feel inadequate.";
  }

  private getMicroIntervention(type: string): string {
    const interventions = {
      'comparison-spiral': this.getComparisonInterventions(),
      'anxiety-spiral': this.getAnxietyInterventions(),
      'perfectionism': this.getPerfectionismInterventions(),
      'rejection-sensitivity': this.getRejectionInterventions(),
      'overwhelm': this.getOverwhelmInterventions(),
      'executive-dysfunction': this.getExecutiveInterventions()
    };

    const interventionList = interventions[type] || interventions['comparison-spiral'];
    return interventionList[Math.floor(Math.random() * interventionList.length)];
  }

  private getComparisonInterventions(): string[] {
    const base = [
      "Right now: Name one real thing in your actual life that's yours. Not performing it, not posting it. Just yours. Your playlist, your coffee ritual, that friend who texts you memes. That's reality.",
      "Look around your actual room. Touch three things. Say their names out loud. That person's Instagram apartment is pixels. Your blanket is real.",
      "Text someone who makes you laugh without trying. Not for content, not for validation. Just because they're real and so are you.",
      "Open your notes app. Write one thing that went okay today. Doesn't have to be good. Just okay. Reality is mostly okay, not highlight reels.",
      "Put your phone in another room for 10 minutes. Notice how your body feels without the comparison input stream."
    ];

    // Economic context adjustments
    if (this.context.economicContext === 'struggling') {
      base.push("Remember: You're comparing your behind-the-scenes to their trust-fund highlight reel. Your struggle is real. Their apartment is daddy's money.");
    }

    // Age-specific additions
    if (this.context.ageRange === '14-16') {
      base.push("Everyone in high school is pretending to have it together. The person you're comparing yourself to is also scrolling at 2am feeling inadequate.");
    } else if (this.context.ageRange === '17-19') {
      base.push("Senior year comparison is brutal because everyone's posting acceptances but not rejections. You're seeing 1% of everyone's college story.");
    }

    return base;
  }

  private getAnxietyInterventions(): string[] {
    return [
      "Name 5 things you can see right now. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. Your anxiety is real but this moment is also real.",
      "Text someone 'anxiety is being weird right now' - no explanation needed. Sometimes just naming it breaks the spell.",
      "Anxiety brain says 'figure this out RIGHT NOW.' But right now you can just exist. The problem will still be there in the morning when your brain works better.",
      "Put on the song that always hits. Let your body feel the bass. Anxiety lives in your head. Music lives in your whole body.",
      "Breathe out longer than you breathe in. 4 counts in, 8 counts out. Anxiety revs your engine. Long exhales are the brake pedal."
    ];
  }

  private getPerfectionismInterventions(): string[] {
    return [
      "Done is better than perfect. Posted is better than polished. Your imperfect attempt matters more than your perfect plan.",
      "Set a timer for 15 minutes. Do the thing badly for 15 minutes. Perfectionism dissolves in the face of actually doing.",
      "Ask yourself: What would this look like if it were easy? Perfectionism makes everything harder than it needs to be.",
      "Your first draft exists to be bad. Your second draft exists to be better. Your perfectionism exists to stop you from having any drafts at all.",
      "Text someone something you made that's 70% done. Sometimes sharing the imperfect thing is exactly what someone else needs to see."
    ];
  }

  private getRejectionInterventions(): string[] {
    const base = [
      "That sting you're feeling? That's rejection sensitivity, not rejection confirmation. Your brain is protecting you from threats that aren't actually there.",
      "Their response (or lack of response) says nothing about your worth. Some people are bad at texting. Some people are overwhelmed. Most things aren't about you.",
      "Write down the story your brain is telling you about what this means. Now write down 3 other possible explanations. Your brain always picks the worst one.",
      "Rejection sensitivity makes your brain a detective looking for evidence that you're unwanted. But you're looking for clues to confirm a conclusion you already reached.",
      "Text someone who consistently shows up for you. Rejection sensitivity makes you forget who actually cares about you."
    ];

    // Neurodivergent-specific additions
    if (this.context.identityMarkers.includes('adhd') || this.context.identityMarkers.includes('neurodivergent')) {
      base.push("ADHD brains feel rejection 10x stronger and longer than neurotypical brains. This intensity you're feeling? That's your nervous system, not reality.");
    }

    return base;
  }

  private getOverwhelmInterventions(): string[] {
    return [
      "Everything feels urgent when you're overwhelmed, but most things can wait until tomorrow. What's the ONE thing that actually needs attention right now?",
      "Overwhelm is your brain trying to solve 47 problems simultaneously. Pick one. Just one. Put the rest in a note for later.",
      "Take a shower. Overwhelm lives in your head but water is bigger than your thoughts. Let it wash over you literally and metaphorically.",
      "Call someone and ask them to just talk about their day. Sometimes the best way out of overwhelm is to remember other people exist.",
      "Write everything down. Every worry, every task, every thought. Your brain can stop holding onto everything when it knows the paper is holding it."
    ];
  }

  private getExecutiveInterventions(): string[] {
    const base = [
      "Executive dysfunction isn't laziness - it's your brain's task manager crashing. Restart by doing something tiny and concrete.",
      "Set a timer for 5 minutes and do the thing badly. Executive dysfunction dissolves when you prove to your brain that starting is possible.",
      "Text someone: 'Body doubling?' Sometimes your brain needs another brain nearby to function, even virtually.",
      "Do the thing while you're on the phone with someone. Executive dysfunction hates witnesses - it prefers to sabotage you in private.",
      "Break the task into steps so small they feel silly. Executive dysfunction can't grab onto something that's too small to resist."
    ];

    // ADHD-specific additions
    if (this.context.identityMarkers.includes('adhd') || this.context.identityMarkers.includes('neurodivergent')) {
      base.push("ADHD executive dysfunction isn't personal failure - it's a neurological difference. Your brain needs different strategies, not more willpower.");
    }

    return base;
  }

  private getGenZSocialMediaResponse(input: string): IntelligenceResponse | null {
    const lower = input.toLowerCase();

    // Pattern 1: Instagram comparison spiral
    if (/literally cannot stop.*instagram.*want to die.*everyone.*high school/i.test(input)) {
      let response = this.getPlatformSpecificResponse('instagram', 'comparison');

      // Age-specific adjustments
      if (this.context.ageRange === '14-16') {
        response += " And high school makes everything feel more intense because everyone's watching everyone.";
      } else if (this.context.ageRange === '17-19') {
        response += " Senior year hits different when everyone's posting college acceptances and you're still figuring it out.";
      }

      // Economic context adjustment
      if (this.context.economicContext === 'struggling') {
        response += " Plus seeing all those vacations and designer stuff when you're working at Starbucks to help with bills.";
      }

      return {
        response,
        technique: 'genZ-social-validation',
        confidence: 1.0,
        element: 'water',
        reason: '[genZ-instagram-comparison]',
        memoryUsed: false,
        contextAdjustments: ['genZ-detected', 'social-media-anxiety', 'comparison-spiral']
      };
    }

    // Pattern 2: Knowing it's fake but still feeling bad
    if (/know.*fake.*still feel.*shit/i.test(input)) {
      let response = "Your logical brain knows it's curated, but your nervous system doesn't. It's processing 100 success stories per hour and concluding you're the only one failing.";

      // Platform-specific additions
      if (this.context.platformContext === 'tiktok') {
        response += " TikTok's algorithm specifically feeds you content that triggers comparison - it's the engagement strategy.";
      } else if (this.context.platformContext === 'instagram') {
        response += " Instagram's Stories create FOMO in real-time - your brain treats missing out as actual social rejection.";
      }

      // Identity-aware additions
      if (this.context.identityMarkers.includes('neurodivergent') || this.context.identityMarkers.includes('adhd')) {
        response += " And ADHD brains are especially vulnerable to comparison spirals because of rejection sensitivity.";
      }

      return {
        response,
        technique: 'genZ-psychoeducation',
        confidence: 1.0,
        element: 'air',
        reason: '[genZ-nervous-system-education]',
        memoryUsed: false,
        contextAdjustments: ['genZ-detected', 'psychoeducation', 'nervous-system-validation']
      };
    }

    // Pattern 3: Performance exhaustion
    if (/spent.*hours.*photo.*effortless/i.test(input)) {
      let response = this.getPlatformSpecificResponse(this.context.platformContext, 'performance');

      // Age-specific additions
      if (this.context.ageRange === '14-16') {
        response += " And in high school, that 'effortless' image affects how people see you in real life too.";
      } else if (this.context.ageRange === '17-19') {
        response += " College apps and social media both require performing the 'authentic' version of yourself.";
      }

      return {
        response,
        technique: 'genZ-performance-validation',
        confidence: 1.0,
        element: 'fire',
        reason: '[genZ-performance-exhaustion]',
        memoryUsed: false,
        contextAdjustments: ['genZ-detected', 'performance-fatigue', 'digital-labor']
      };
    }

    // Pattern 4: Systemic reality validation
    if (/therapist.*social media break.*but/i.test(input) || /find jobs.*stay connected.*promote/i.test(input) || /not optional anymore/i.test(input)) {
      let response = "'Just quit social media' is boomer advice. It's your professional network, portfolio, and social lifeline.";

      // Economic context awareness
      if (this.context.economicContext === 'struggling') {
        response += " When you're broke, social media IS your marketing department, job board, and social connection.";
      }

      // Age-specific additions
      if (this.context.ageRange === '17-19') {
        response += " College apps, job searches, networking - it's all digital now. Your generation can't opt out.";
      }

      response += " The problem isn't using it - it's that it's designed to make you feel inadequate so you keep scrolling.";

      return {
        response,
        technique: 'genZ-systemic-validation',
        confidence: 1.0,
        element: 'earth',
        reason: '[genZ-systemic-reality]',
        memoryUsed: false,
        contextAdjustments: ['genZ-detected', 'systemic-validation', 'infrastructure-reality']
      };
    }

    // Pattern 5: Micro-intervention request
    if (/what do i actually do.*2am.*comparing/i.test(input)) {
      const intervention = this.getMicroIntervention('comparison-spiral');
      return {
        response: intervention,
        technique: 'genZ-micro-intervention',
        confidence: 1.0,
        element: 'earth',
        reason: '[genZ-grounding-intervention]',
        memoryUsed: false,
        contextAdjustments: ['genZ-detected', 'micro-intervention', 'reality-grounding']
      };
    }

    return null;
  }

  private selectTechniqueContextually(analysis: any): any {
    if (!analysis?.technique) return analysis;

    const technique = analysis.technique.type;
    let adjustedConfidence = analysis.technique.confidence;
    const adjustments: string[] = [];

    // Contextual technique selection
    if (this.context.turnCount < 3 && technique === 'mirror') {
      adjustedConfidence += 0.1; // Favor mirroring early for rapport
      adjustments.push('early-rapport-boost');
    }

    if (this.context.emotionalIntensity > 7 && technique === 'attune') {
      adjustedConfidence += 0.15; // Favor attunement for high intensity
      adjustments.push('high-intensity-attune');
    }

    if (this.context.stuckCount > 2 && technique === 'clarify') {
      adjustedConfidence += 0.2; // Favor clarification when stuck
      adjustments.push('stuck-pattern-clarify');
    }

    if (this.context.breakthroughDetected && technique === 'celebrate') {
      adjustedConfidence = 0.95; // Force celebration
      adjustments.push('breakthrough-celebrate');
    }

    // Dynamic confidence thresholds
    const thresholds = {
      mirror: this.context.userFrustrated ? 0.95 : 0.8,
      attune: this.context.overwhelmed ? 0.5 : 0.8,
      clarify: this.context.stuckCount > 1 ? 0.6 : 0.8,
      hold_space: this.context.overwhelmed ? 0.5 : 0.8
    };

    const threshold = thresholds[technique as keyof typeof thresholds] || 0.8;

    return {
      ...analysis,
      technique: {
        ...analysis.technique,
        confidence: adjustedConfidence
      },
      contextAdjustments: adjustments,
      meetsThreshold: adjustedConfidence >= threshold
    };
  }

  private generateListeningResponse(analysis: any, input: string): string {
    if (!analysis?.technique || !analysis.meetsThreshold) {
      return this.getGenerationalDefault();
    }

    const technique = analysis.technique.type;
    const generation = this.context.generationalContext;

    switch (technique) {
      case 'mirror':
        return this.generateMirrorResponse(analysis, input, generation);

      case 'attune':
        return this.generateAttuneResponse(analysis, input, generation);

      case 'clarify':
        return analysis.response;

      case 'hold_space':
        return this.generateHoldSpaceResponse(analysis, generation);

      case 'celebrate':
        return this.generateCelebrateResponse(analysis, generation);

      default:
        return analysis.response || this.getGenerationalDefault();
    }
  }

  private generateMirrorResponse(analysis: any, input: string, generation: string): string {
    // Clean up fragmented mirror phrases
    let mirrorPhrase = analysis.response;

    // Remove trailing ellipsis and fragments
    mirrorPhrase = mirrorPhrase.replace(/\.\.\.$/, '').trim();

    // If it's just a word fragment, create a proper response
    if (mirrorPhrase.split(' ').length <= 2 || mirrorPhrase.length < 10) {
      const lower = input.toLowerCase();

      if (lower.includes('tired') && lower.includes('stressed')) {
        return "Being tired AND stressed? That combination is exhausting. Like your body's fighting on two fronts - no energy but can't rest either. How long has this been going on?";
      }

      if (lower.includes('cringe')) {
        return "Oh that cringe feeling is so visceral, right? Like your whole body is trying to escape a memory. What triggered that for you?";
      }

      // Handle common cases naturally

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        const naturalGreetings = [
          "Hey there. What's going on?",
          "Hi. How are you today?",
          "Hello. Good to see you.",
          "Hey. What brings you here?",
          "Hi! What's happening?"
        ];
        return naturalGreetings[Math.floor(Math.random() * naturalGreetings.length)];
      }

      if (lower.includes('how are you')) {
        const howAreYouResponses = [
          "I'm doing well, thanks for asking. How about you?",
          "Good, thank you. What's going on with you?",
          "I'm here and ready to listen. How are you?",
          "Thanks for asking - I'm good. How's your day going?"
        ];
        return howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)];
      }

      if (mirrorPhrase && mirrorPhrase.length > 2) {
        // Use natural conversational responses instead of robotic mirroring
        const naturalResponses = [
          `That sounds important. What's that like for you?`,
          `I'm curious about what you just shared. Tell me more?`,
          `There's something in what you said that feels significant.`,
          `What stands out to you about that?`,
          `I'd love to hear more about your experience with that.`
        ];
        return naturalResponses[Math.floor(Math.random() * naturalResponses.length)];
      }

      // Fallback to open-ended invitation
      return "What's most present for you right now?";
    }

    // For longer phrases, make them conversational
    switch (generation) {
      case 'genZ':
        if (this.context.socialMediaContext) {
          return `Yeah, ${mirrorPhrase} hits different when you're seeing everyone else's highlight reels. Like the algorithm is personally attacking you.`;
        }
        return `${mirrorPhrase} - that's so valid honestly. Your feelings about this make complete sense.`;

      case 'millennial':
        return `${mirrorPhrase} - god, that's like the millennial experience in a nutshell isn't it? These impossible standards we're all drowning in.`;

      case 'genX':
        return `${mirrorPhrase} - you're juggling so much. That recognition matters.`;

      default:
        return `Yeah, ${mirrorPhrase}. What's the hardest part of this for you right now?`;
    }
  }

  private generateAttuneResponse(analysis: any, input: string, generation: string): string {
    const element = analysis.technique.element;
    const response = analysis.response;

    switch (generation) {
      case 'genZ':
        if (element === 'water') {
          return `That emotional flooding when ${response.toLowerCase()}`;
        }
        return response;

      case 'millennial':
        return `I hear the ${element} in that. ${response}`;

      case 'genX':
        return `The ${element} quality of this - ${response}`;

      default:
        return `I hear the ${element} in that. ${response}`;
    }
  }

  private generateHoldSpaceResponse(analysis: any, generation: string): string {
    switch (generation) {
      case 'genZ':
        return `Let's just sit with this for a sec. ${analysis.response}`;

      case 'millennial':
        return `Taking a pause here. ${analysis.response}`;

      case 'genX':
        return `Let's pause a moment together. ${analysis.response}`;

      default:
        return `Let's pause a moment together. ${analysis.response}`;
    }
  }

  private generateCelebrateResponse(analysis: any, generation: string): string {
    switch (generation) {
      case 'genZ':
        return `That's actually huge! ${analysis.response}`;

      case 'millennial':
        return `That's a real breakthrough! ${analysis.response}`;

      case 'genX':
        return `That's significant insight. ${analysis.response}`;

      default:
        return `That's a breakthrough! ${analysis.response}`;
    }
  }

  private getGenerationalDefault(): string {
    switch (this.context.generationalContext) {
      case 'genZ':
        return "What's really going on for you right now?";

      case 'millennial':
        return "Tell me more about what you're experiencing.";

      case 'genX':
        return "Help me understand what this is like for you.";

      default:
        return "Tell me more about that.";
    }
  }

  private weaveResponses(primary: string, memoryLine: string | null): string {
    // Clean up primary response first
    if (primary) {
      // Fix fragmented sentences
      primary = primary.replace(/^you\.\s+/i, '');
      primary = primary.replace(/\.\s+Being\s+/g, '. You\'re ');
      primary = primary.replace(/\.\s+Having\s+/g, '. You\'re having ');

      // Ensure proper sentence structure
      if (!primary.match(/^[A-Z]/)) {
        primary = primary.charAt(0).toUpperCase() + primary.slice(1);
      }
    }

    // If both exist and make sense together, combine them
    if (primary && memoryLine && memoryLine.length > 10) {
      // But only if they don't repeat the same content
      if (!primary.toLowerCase().includes(memoryLine.toLowerCase().slice(0, 20))) {
        return `${primary} ${memoryLine}`;
      }
    }

    return primary || memoryLine || "Hmm, tell me more about what's on your mind.";
  }

  private getContextAdjustments(): string[] {
    const adjustments: string[] = [];

    if (this.context.turnCount < 3) adjustments.push('early-conversation');
    if (this.context.emotionalIntensity > 7) adjustments.push('high-emotional-intensity');
    if (this.context.userFrustrated) adjustments.push('user-frustrated');
    if (this.context.overwhelmed) adjustments.push('user-overwhelmed');
    if (this.context.stuckCount > 2) adjustments.push('stuck-pattern');
    if (this.context.breakthroughDetected) adjustments.push('breakthrough-moment');

    return adjustments;
  }

  debugSnapshot(): void {
    console.log('🧠 INTELLIGENCE ENGINE SNAPSHOT');
    console.log('Context:', this.context);
    this.memory.debugSnapshot();
  }
}