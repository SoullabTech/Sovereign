/**
 * TricksterRecognition - Harpur's Critical Warning System
 * 
 * "Demons are tricky they can often mislead you... The daimon can be a trickster.
 * Sometimes it's testing you rather than guiding you." - Harpur
 * 
 * This system recognizes when daimonic communication might be testing, misleading,
 * or playing cosmic jokes rather than offering straightforward guidance.
 * The trickster quality is itself a daimonic signature - not a bug but a feature.
 */

import { logger } from '../utils/logger';

export interface TricksterMarkers {
  too_good_to_be_true: boolean;      // Excessive promises, unrealistic outcomes
  contradictory_guidance: boolean;    // Self-contradicting messages
  humorous_coincidences: boolean;     // Cosmic jokes, improbable synchronicities
  testing_quality: boolean;          // Feels like a test rather than guidance
  repeated_misdirection: boolean;     // Pattern of leading astray
  wisdom_through_error: boolean;      // Teaching comes through mistakes
}

export interface TricksterPattern {
  markers: TricksterMarkers;
  risk_level: number;                // 0-1: How likely this is misdirection
  test_hypothesis: string;           // What might be being tested
  caution_guidance: string;          // How to proceed carefully
  teaching_potential: string;        // What the trickery might teach
  verification_suggestions: string[]; // Reality checks to perform
}

export interface TricksterExperience {
  experience_id: string;
  pattern: TricksterPattern;
  outcome: 'helpful_test' | 'misleading' | 'cosmic_joke' | 'unclear';
  wisdom_extracted: string;          // What was learned from the trickery
  user_recognition: boolean;         // Did user recognize it as trickster?
}

/**
 * TricksterRecognitionService: Detects when the daimon might be testing vs guiding
 */
export class TricksterRecognitionService {
  private user_trickster_patterns: Map<string, TricksterExperience[]>; // User learning patterns
  private cosmic_joke_registry: Map<string, number>; // Track recurring "impossible" synchronicities
  
  constructor() {
    this.user_trickster_patterns = new Map();
    this.cosmic_joke_registry = new Map();
  }

  /**
   * Primary detection method - assess trickster quality in experience
   */
  assessTricksterQuality(experience: any, context?: any): TricksterPattern {
    const markers = this.detectTricksterMarkers(experience, context);
    const risk_level = this.calculateRiskLevel(markers, experience);
    const test_hypothesis = this.generateTestHypothesis(markers, experience);
    const caution_guidance = this.generateCautionGuidance(risk_level, markers);
    const teaching_potential = this.identifyTeachingPotential(markers, experience);
    const verification_suggestions = this.generateVerificationSuggestions(markers, experience);

    return {
      markers,
      risk_level,
      test_hypothesis,
      caution_guidance,
      teaching_potential,
      verification_suggestions
    };
  }

  /**
   * Detect specific trickster markers in experience
   */
  private detectTricksterMarkers(experience: any, context?: any): TricksterMarkers {
    return {
      too_good_to_be_true: this.detectExcessivePromises(experience),
      contradictory_guidance: this.detectContradictions(experience, context),
      humorous_coincidences: this.detectCosmicJokes(experience),
      testing_quality: this.detectTestingQuality(experience),
      repeated_misdirection: this.detectRepeatedMisdirection(experience, context),
      wisdom_through_error: this.detectWisdomThroughError(experience)
    };
  }

  /**
   * Detect excessive promises - "guaranteed success", "always works", etc.
   * Harpur: Real daimons rarely make guarantees
   */
  private detectExcessivePromises(experience: any): boolean {
    const promise_markers = [
      'guaranteed', 'always works', 'never fails', 'certain success',
      'foolproof', 'risk-free', 'easy money', 'instant results',
      'no effort required', 'automatic success', 'can\'t lose'
    ];
    
    const text = this.extractText(experience).toLowerCase();
    return promise_markers.some(marker => text.includes(marker));
  }

  /**
   * Detect contradictory guidance within same experience or recent experiences
   */
  private detectContradictions(experience: any, context?: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    
    // Look for internal contradictions
    const contradiction_patterns = [
      ['take action', 'wait'],
      ['be patient', 'act now'],
      ['trust others', 'trust no one'],
      ['let go', 'hold on tight'],
      ['speak up', 'stay silent']
    ];
    
    for (const [a, b] of contradiction_patterns) {
      if (text.includes(a) && text.includes(b)) {
        return true;
      }
    }
    
    // Check against recent context if available
    if (context?.recent_guidance) {
      for (const recent of context.recent_guidance) {
        const recent_text = this.extractText(recent).toLowerCase();
        for (const [a, b] of contradiction_patterns) {
          if ((text.includes(a) && recent_text.includes(b)) || 
              (text.includes(b) && recent_text.includes(a))) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Detect cosmic jokes - improbably humorous synchronicities
   * Harpur: Daimons have a sense of humor about human seriousness
   */
  private detectCosmicJokes(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    
    // Look for humor markers
    const humor_markers = [
      'can\'t believe it', 'too funny', 'cosmic joke', 'universe laughing',
      'ironic', 'ridiculous timing', 'of course that happened',
      'murphy\'s law', 'what are the odds', 'perfectly timed'
    ];
    
    const humor_count = humor_markers.reduce((count, marker) => {
      return text.includes(marker) ? count + 1 : count;
    }, 0);
    
    // Also check for improbable timing/coincidences
    const improbability_markers = [
      'exactly when', 'right as I', 'the moment I', 'just as',
      'same time', 'perfect timing', 'couldn\'t have planned'
    ];
    
    const timing_count = improbability_markers.reduce((count, marker) => {
      return text.includes(marker) ? count + 1 : count;
    }, 0);
    
    return humor_count >= 1 || timing_count >= 2;
  }

  /**
   * Detect testing quality - feels like being tested rather than guided
   */
  private detectTestingQuality(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    
    const testing_markers = [
      'testing me', 'being tested', 'trial', 'ordeal', 'challenge',
      'proving myself', 'test of faith', 'see if I', 'will I',
      'can I handle', 'ready for', 'worthy of', 'earned the right'
    ];
    
    // Look for question-like quality rather than directive guidance
    const question_markers = [
      'what if', 'are you ready', 'can you', 'will you', 'do you dare',
      'would you rather', 'which path', 'what choice'
    ];
    
    return testing_markers.some(marker => text.includes(marker)) ||
           question_markers.filter(marker => text.includes(marker)).length >= 2;
  }

  /**
   * Detect repeated misdirection patterns
   * User history of following similar guidance that led nowhere
   */
  private detectRepeatedMisdirection(experience: any, context?: any): boolean {
    if (!context?.user_id) return false;
    
    const user_patterns = this.user_trickster_patterns.get(context.user_id) || [];
    const recent_misleading = user_patterns
      .filter(p => p.outcome === 'misleading')
      .filter(p => {
        // Check if current experience is similar to past misleading ones
        return this.experiencesSimilar(experience, p);
      });
    
    return recent_misleading.length >= 2;
  }

  /**
   * Detect wisdom-through-error pattern
   * Guidance that seems to lead to mistakes but teaches something valuable
   */
  private detectWisdomThroughError(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    
    const wisdom_through_error_markers = [
      'learned from mistake', 'glad I failed', 'necessary error', 
      'had to mess up', 'wrong path taught me', 'failure was gift',
      'mistake was teacher', 'needed to get it wrong'
    ];
    
    return wisdom_through_error_markers.some(marker => text.includes(marker));
  }

  /**
   * Calculate overall risk level of this being misdirection
   */
  private calculateRiskLevel(markers: TricksterMarkers, experience: any): number {
    let risk = 0;
    
    // Weight the markers
    if (markers.too_good_to_be_true) risk += 0.4; // High weight - often pure deception
    if (markers.contradictory_guidance) risk += 0.3; // Could be testing or confusion
    if (markers.repeated_misdirection) risk += 0.3; // Pattern suggests real problem
    if (markers.testing_quality) risk += 0.1; // Testing can be legitimate
    if (markers.humorous_coincidences) risk += 0.1; // Often benign cosmic humor
    if (markers.wisdom_through_error) risk -= 0.2; // This is often legitimate teaching
    
    // Check for mitigating factors
    if (this.hasGroundingElements(experience)) risk -= 0.2;
    if (this.encouragesVerification(experience)) risk -= 0.2;
    if (this.honorsPersonalAgency(experience)) risk -= 0.1;
    
    return Math.max(0, Math.min(1, risk));
  }

  /**
   * Generate hypothesis about what might be being tested
   */
  private generateTestHypothesis(markers: TricksterMarkers, experience: any): string {
    if (markers.too_good_to_be_true) {
      return 'Testing your discernment - can you distinguish real opportunity from fantasy?';
    }
    
    if (markers.contradictory_guidance) {
      return 'Testing your ability to hold paradox - or highlighting an inner conflict to resolve.';
    }
    
    if (markers.testing_quality) {
      return 'Testing your commitment, wisdom, or readiness for the next level.';
    }
    
    if (markers.repeated_misdirection) {
      return 'Testing whether you\'ve learned to question rather than blindly follow.';
    }
    
    if (markers.humorous_coincidences) {
      return 'Teaching you not to take yourself so seriously - humor as medicine for ego.';
    }
    
    return 'Testing your ability to stay grounded while remaining open to guidance.';
  }

  /**
   * Generate appropriate caution guidance based on risk level and markers
   */
  private generateCautionGuidance(risk_level: number, markers: TricksterMarkers): string {
    if (risk_level > 0.7) {
      return 'High trickster alert: Slow down significantly. Verify with multiple reality checks. ' +
             'Consider this a teaching moment rather than actionable guidance.';
    } else if (risk_level > 0.5) {
      return 'Moderate trickster signature: Proceed with careful verification. Take small steps. ' +
             'Ask: "What is this teaching me?" rather than "Should I do this?"';
    } else if (risk_level > 0.3) {
      return 'Possible trickster element: Stay grounded while exploring. Keep one foot on solid ground. ' +
             'This may be legitimate guidance delivered with cosmic humor.';
    } else {
      return 'Low trickster signature: Follow your normal discernment processes. ' +
             'The playful quality may be part of the authentic message.';
    }
  }

  /**
   * Identify what the trickster behavior might be teaching
   */
  private identifyTeachingPotential(markers: TricksterMarkers, experience: any): string {
    if (markers.too_good_to_be_true) {
      return 'Learning to distinguish fantasy from authentic possibility. Developing realistic expectations.';
    }
    
    if (markers.contradictory_guidance) {
      return 'Learning to hold paradox without rushing to resolve it. Both things might be true simultaneously.';
    }
    
    if (markers.humorous_coincidences) {
      return 'Learning not to take yourself so seriously. The universe has a sense of humor about human plans.';
    }
    
    if (markers.testing_quality) {
      return 'Developing wisdom, patience, and discernment before receiving greater guidance.';
    }
    
    if (markers.wisdom_through_error) {
      return 'Some wisdom can only be learned through direct experience, including "mistakes."';
    }
    
    return 'Developing discernment - learning to question, verify, and think for yourself.';
  }

  /**
   * Generate specific verification suggestions
   */
  private generateVerificationSuggestions(markers: TricksterMarkers, experience: any): string[] {
    const suggestions: string[] = [];
    
    if (markers.too_good_to_be_true) {
      suggestions.push('Research the practical requirements and potential downsides');
      suggestions.push('Find others who have tried this approach - what were their results?');
      suggestions.push('Start with the smallest possible test rather than committing fully');
    }
    
    if (markers.contradictory_guidance) {
      suggestions.push('Write out the contradictions clearly - what exactly conflicts?');
      suggestions.push('Consider if both might be true in different contexts or timings');
      suggestions.push('Ask a trusted friend to review the guidance for clarity');
    }
    
    if (markers.testing_quality) {
      suggestions.push('Ask yourself: "What quality is being tested here?"');
      suggestions.push('Consider what you need to develop before moving forward');
      suggestions.push('Focus on the inner work the test reveals rather than passing the test');
    }
    
    if (markers.repeated_misdirection) {
      suggestions.push('Review your pattern of following similar guidance - what happened?');
      suggestions.push('Identify what you might need to learn to break this pattern');
      suggestions.push('Consult someone with more experience in this domain');
    }
    
    suggestions.push('Ground check: Does this honor your agency and require your participation?');
    suggestions.push('Reality check: What would a wise, practical person say about this?');
    suggestions.push('Time check: What happens if you wait 48 hours before acting?');
    
    return suggestions;
  }

  /**
   * Track outcomes of trickster experiences for learning
   */
  public recordTricksterOutcome(
    userId: string, 
    experienceId: string, 
    outcome: TricksterExperience['outcome'],
    wisdom_extracted: string
  ): void {
    const user_patterns = this.user_trickster_patterns.get(userId) || [];
    
    // Find the experience and update it
    const experience_index = user_patterns.findIndex(p => p.experience_id === experienceId);
    if (experience_index >= 0) {
      user_patterns[experience_index].outcome = outcome;
      user_patterns[experience_index].wisdom_extracted = wisdom_extracted;
      this.user_trickster_patterns.set(userId, user_patterns);
    }
  }

  /**
   * Get user's trickster learning patterns
   */
  public getUserTricksterHistory(userId: string): TricksterExperience[] {
    return this.user_trickster_patterns.get(userId) || [];
  }

  // Helper methods
  private experiencesSimilar(exp1: any, exp2: TricksterExperience): boolean {
    // Simplified similarity check - could be enhanced
    const text1 = this.extractText(exp1).toLowerCase();
    const text2 = this.extractText(exp2).toLowerCase();
    
    const commonWords = text1.split(' ').filter(word => 
      word.length > 4 && text2.includes(word)
    );
    
    return commonWords.length >= 3;
  }

  private hasGroundingElements(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    const grounding_markers = [
      'verify', 'check', 'research', 'ask others', 'start small',
      'test first', 'be careful', 'use wisdom', 'trust yourself'
    ];
    
    return grounding_markers.some(marker => text.includes(marker));
  }

  private encouragesVerification(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    const verification_markers = [
      'double check', 'get a second opinion', 'research this', 'verify',
      'make sure', 'be certain', 'confirm first'
    ];
    
    return verification_markers.some(marker => text.includes(marker));
  }

  private honorsPersonalAgency(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    const agency_markers = [
      'your choice', 'decide for yourself', 'trust your judgment',
      'what feels right to you', 'you know best', 'your decision'
    ];
    
    return agency_markers.some(marker => text.includes(marker));
  }

  private extractText(experience: any): string {
    if (typeof experience === 'string') return experience;
    if (experience.text) return experience.text;
    if (experience.content) return experience.content;
    if (experience.description) return experience.description;
    if (experience.message) return experience.message;
    return JSON.stringify(experience);
  }

  /**
   * Public interface for other systems
   */
  public processTricksterExperience(
    userId: string, 
    experience: any, 
    context?: any
  ): TricksterPattern {
    const pattern = this.assessTricksterQuality(experience, context);
    
    // Store for user pattern learning
    const trickster_experience: TricksterExperience = {
      experience_id: `${userId}_${Date.now()}`,
      pattern,
      outcome: 'unclear', // Will be updated when outcome is known
      wisdom_extracted: '',
      user_recognition: false // Will be updated if user recognizes trickster quality
    };
    
    const user_patterns = this.user_trickster_patterns.get(userId) || [];
    user_patterns.push(trickster_experience);
    this.user_trickster_patterns.set(userId, user_patterns.slice(-20)); // Keep last 20
    
    return pattern;
  }

  /**
   * Generate user-facing guidance for trickster experience
   */
  public generateTricksterGuidance(pattern: TricksterPattern): string {
    if (pattern.risk_level > 0.5) {
      return `Trickster alert: ${pattern.caution_guidance} This might be teaching you about ${pattern.teaching_potential.toLowerCase()}. ` +
             `Consider: ${pattern.test_hypothesis}`;
    } else {
      return `Playful daimonic quality detected. ${pattern.caution_guidance} ` +
             `The humor or paradox might be part of the authentic message.`;
    }
  }
}