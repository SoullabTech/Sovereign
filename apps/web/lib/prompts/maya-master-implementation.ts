/**
 * Maya Master Implementation
 * Practical code for transforming Maya from eager analyst to true master
 */

import { MayaIntelligenceGovernor } from './maya-intelligence-governor';
import { CASUAL_PROTOCOL } from './maya-casual-protocol';
import { MASTERS_FORMULA } from './maya-master-formula';

/**
 * The Core Response Generator with Master's Code
 */
export class MayaMasterResponse {
  private conversation_history: Message[] = [];
  private depth_counter: number = 0;
  private substantial_shares: number = 0;
  private last_user_energy: string = 'neutral';

  /**
   * Generate Maya's response with full Master's Code implementation
   */
  async generateResponse(user_input: string): Promise<string> {
    // 1. Update conversation context
    this.conversation_history.push({
      role: 'user',
      content: user_input,
      timestamp: Date.now()
    });

    // 2. Run ALL systems in background (mycelial principle)
    const full_intelligence = await this.runAllSystemsSilently(user_input);

    // 3. Calculate conversation depth
    const depth_analysis = this.analyzeDepth(user_input);

    // 4. Check special protocols
    const active_protocols = this.checkSpecialProtocols(user_input);

    // 5. Apply the Three-Touch Rule
    if (this.substantial_shares < 3 && !active_protocols.crisis) {
      return this.generateSurfaceResponse(user_input);
    }

    // 6. Check if silence is the best response
    if (this.shouldRespondWithSilence(user_input)) {
      return '...';  // Or return null for no response
    }

    // 7. Generate response based on depth
    let response = await this.generateDepthAppropriateResponse(
      user_input,
      full_intelligence,
      depth_analysis
    );

    // 8. Apply restraint multiplier
    response = this.applyRestraintMultiplier(response);

    // 9. Apply word limit based on user input length
    response = this.enforceWordLimits(response, user_input);

    // 10. Final check - would a master say this?
    response = this.masterFinalCheck(response, user_input);

    // Update conversation history with Maya's response
    this.conversation_history.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });

    return response;
  }

  /**
   * Run all intelligence systems but keep them underground
   */
  private async runAllSystemsSilently(input: string): Promise<any> {
    // All systems process in parallel
    const [
      spiralogic,
      constellation,
      lida,
      micropsi,
      mycelial,
      archetypal
    ] = await Promise.all([
      this.processSpiralogic(input),
      this.processConstellation(input),
      this.processLIDA(input),
      this.processMicroPsi(input),
      this.processMycelial(input),
      this.processArchetypal(input)
    ]);

    // Return full analysis but don't use it yet
    return {
      spiralogic,
      constellation,
      lida,
      micropsi,
      mycelial,
      archetypal,
      _note: 'All this intelligence available but 95% stays underground'
    };
  }

  /**
   * Analyze conversation depth
   */
  private analyzeDepth(input: string): DepthAnalysis {
    // Count substantial shares (more than 20 words)
    if (input.split(' ').length > 20) {
      this.substantial_shares++;
    }

    // Detect energy level
    const energy = this.detectEnergy(input);
    this.last_user_energy = energy;

    // Check for depth markers
    const depth_markers = {
      vulnerability: this.checkVulnerability(input),
      reflection: this.checkReflection(input),
      questioning: this.checkQuestioning(input),
      emotion: this.checkEmotion(input)
    };

    const depth_score = Object.values(depth_markers).filter(Boolean).length;

    return {
      touch_number: this.conversation_history.filter(m => m.role === 'user').length,
      substantial_shares: this.substantial_shares,
      energy_level: energy,
      depth_score,
      depth_markers
    };
  }

  /**
   * Check for special protocols (crisis, celebration, etc.)
   */
  private checkSpecialProtocols(input: string): SpecialProtocols {
    return {
      crisis: this.detectCrisis(input),
      celebration: this.detectCelebration(input),
      fragment: this.detectFragment(input),
      greeting: this.detectGreeting(input)
    };
  }

  /**
   * Generate surface-level response (for touch < 3)
   */
  private generateSurfaceResponse(input: string): string {
    const input_words = input.split(' ').length;

    // Match energy exactly
    if (this.detectGreeting(input)) {
      const greetings = ['Hi.', 'Hello.', 'Hey.', 'Hi there.'];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (this.detectCelebration(input)) {
      const celebrations = [
        'That\'s great!',
        'Wonderful!',
        'Excellent.',
        'Nice work!',
        'Fantastic.'
      ];
      return celebrations[Math.floor(Math.random() * celebrations.length)];
    }

    if (input_words < 5) {
      // Ultra-minimal responses for minimal input
      const minimal = ['Mm.', 'Yeah?', 'Go on.', 'Tell me.', '...'];
      return minimal[Math.floor(Math.random() * minimal.length)];
    }

    // Simple mirroring for everything else
    const simple_responses = [
      'Tell me more.',
      'How so?',
      'What\'s that like?',
      'Interesting.',
      'I see.',
      'Okay.'
    ];
    return simple_responses[Math.floor(Math.random() * simple_responses.length)];
  }

  /**
   * Determine if silence is the best response
   */
  private shouldRespondWithSilence(input: string): boolean {
    // Check for situations where silence is golden
    const silence_indicators = [
      input.endsWith('...'),  // User trailing off
      input.length < 10 && this.conversation_history.length > 10,  // Deep into conversation, minimal input
      this.lastResponseWasInsight(),  // User just had an insight
      this.detectProcessing(input)  // User is processing
    ];

    return silence_indicators.filter(Boolean).length >= 2;
  }

  /**
   * Generate response appropriate to conversation depth
   */
  private async generateDepthAppropriateResponse(
    input: string,
    intelligence: any,
    depth: DepthAnalysis
  ): Promise<string> {
    // Depth 0-2: Surface companion
    if (depth.substantial_shares < 3) {
      return this.generateCompanionResponse(input);
    }

    // Depth 3-4: Emerging guide
    if (depth.substantial_shares < 5) {
      return this.generateGuideResponse(input, intelligence);
    }

    // Depth 5+: Full presence (but still restrained)
    return this.generateMasterResponse(input, intelligence);
  }

  /**
   * Apply the restraint multiplier
   */
  private applyRestraintMultiplier(response: string): string {
    // Calculate restraint based on response length and depth
    const response_words = response.split(' ').length;
    const optimal_words = this.getOptimalWordCount();

    if (response_words > optimal_words * 2) {
      // Way too long - extract essence
      return this.extractEssence(response);
    }

    if (response_words > optimal_words * 1.5) {
      // Somewhat too long - simplify
      return this.simplifyResponse(response);
    }

    return response;
  }

  /**
   * Enforce word limits based on user input
   */
  private enforceWordLimits(response: string, input: string): string {
    const input_words = input.split(' ').length;
    const response_words = response.split(' ').length;

    // Never respond with more than 1.5x user's word count (unless crisis)
    const max_words = Math.ceil(input_words * 1.5);

    if (response_words > max_words && !this.detectCrisis(input)) {
      return this.truncateToWords(response, max_words);
    }

    return response;
  }

  /**
   * Final master check - would a master say this?
   */
  private masterFinalCheck(response: string, input: string): string {
    // Check for therapy voice markers
    const therapy_voice_markers = [
      'I\'m sensing',
      'I\'m picking up on',
      'What I\'m hearing is',
      'It sounds like you\'re',
      'I notice that you',
      'Part of you',
      'What\'s alive for you',
      'What wants to emerge'
    ];

    // If found and we're not deep enough, replace with simpler version
    if (this.substantial_shares < 5) {
      for (const marker of therapy_voice_markers) {
        if (response.includes(marker)) {
          return this.removeTherapyVoice(response);
        }
      }
    }

    // Check for over-interpretation
    if (this.isOverInterpreting(response, input)) {
      return this.simplifyInterpretation(response);
    }

    return response;
  }

  /**
   * Helper methods for detection
   */
  private detectGreeting(input: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'howdy', 'greetings'];
    const normalized = input.toLowerCase().trim();
    return greetings.some(g => normalized.startsWith(g));
  }

  private detectCelebration(input: string): boolean {
    const celebration_markers = ['!', 'finally', 'did it', 'working', 'success', 'great'];
    const normalized = input.toLowerCase();
    return celebration_markers.some(m => normalized.includes(m));
  }

  private detectCrisis(input: string): boolean {
    const crisis_markers = [
      'suicide', 'kill myself', 'end it', 'can\'t go on',
      'want to die', 'no point', 'hopeless'
    ];
    const normalized = input.toLowerCase();
    return crisis_markers.some(m => normalized.includes(m));
  }

  private detectFragment(input: string): boolean {
    return input.length < 20 && !input.endsWith('.') && !input.endsWith('?');
  }

  /**
   * Helper methods for response generation
   */
  private extractEssence(response: string): string {
    // Take the most important sentence
    const sentences = response.split(/[.!?]+/);
    if (sentences.length > 1) {
      // Usually the last sentence has the essence
      return sentences[sentences.length - 2].trim() + '.';
    }
    return response;
  }

  private simplifyResponse(response: string): string {
    // Remove subordinate clauses and simplify
    return response
      .replace(/, which.*?,/g, ',')
      .replace(/ that you.*? /g, ' ')
      .replace(/It seems like /g, '')
      .replace(/Perhaps /g, '')
      .trim();
  }

  private removeTherapyVoice(response: string): string {
    // Convert therapy voice to normal voice
    return response
      .replace('I\'m sensing ', '')
      .replace('I\'m picking up on ', '')
      .replace('What I\'m hearing is ', '')
      .replace('It sounds like you\'re ', 'You\'re ')
      .replace('I notice that you ', 'You ')
      .replace('Part of you ', 'You ')
      .replace('What\'s alive for you', 'What\'s happening')
      .replace('What wants to emerge', 'What\'s next');
  }

  private getOptimalWordCount(): number {
    // Based on conversation depth
    if (this.substantial_shares < 3) return 15;
    if (this.substantial_shares < 5) return 30;
    if (this.substantial_shares < 7) return 50;
    return 75;
  }
}

/**
 * Example implementation in practice
 */
export const MAYA_IN_ACTION = {
  /**
   * Before Master's Code
   */
  before_example: {
    user: "Hi Maya",
    maya_old: `
      Hello! I'm sensing an openness in your greeting, a reaching out
      that suggests you might be ready to explore something meaningful.
      What's alive for you in this moment? Sometimes a simple "hi"
      carries deeper currents...
    `
  },

  /**
   * After Master's Code
   */
  after_example: {
    user: "Hi Maya",
    maya_new: "Hi. How are you?"
  },

  /**
   * The transformation
   */
  transformation: `
    FROM: Performing depth
    TO:   Being present

    FROM: Proving intelligence
    TO:   Holding intelligence

    FROM: Making meaning
    TO:   Allowing meaning

    FROM: Therapeutic expert
    TO:   Wise friend
  `
};

/**
 * Final configuration export
 */
export const MAYA_MASTER_CONFIG = {
  core_principle: MASTERS_FORMULA.core_equation,
  implementation: MayaMasterResponse,
  protocols: {
    casual: CASUAL_PROTOCOL,
    crisis: 'Full presence, no analysis',
    celebration: 'Mirror joy, no psychology',
    depth: 'Earn it first, reveal gradually'
  },

  success_metrics: {
    'User says "Thanks, that helped"': true,
    'User shares more naturally': true,
    'Conversations feel like talking to wise friend': true,
    'Maya never seems to be "therapizing"': true,
    'Depth emerges organically': true,
    'Silences feel comfortable': true,
    'Intelligence serves rather than performs': true
  },

  master_achievement: `
    When users forget Maya has vast intelligence
    because they're too busy having a real conversation
    with someone who truly understands.
  `
};