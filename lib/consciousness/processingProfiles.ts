// backend: lib/consciousness/processingProfiles.ts
/**
 * CONDITIONAL CONSCIOUSNESS PROCESSING PROFILES
 *
 * Implements FAST/CORE/DEEP processing modes to make "full consciousness"
 * conditional based on conversation content rather than running the
 * full cathedral every turn.
 *
 * Phase 2 Integration: Now developmentally aware via Cognitive Profile Service
 */

import { getCognitiveProfile, type CognitiveProfile } from './cognitiveProfileService';

export type ProcessingProfile = 'FAST' | 'CORE' | 'DEEP';

export interface ProcessingProfileResult {
  profile: ProcessingProfile;
  reasoning: string;
  estimatedTime: number; // ms
  meta?: {
    cognitiveProfile?: CognitiveProfile | null;
  };
}

export interface ConversationRouter {
  chooseProcessingProfile(input: {
    message: string;
    turnCount: number;
    lastDepth?: ProcessingProfile;
    conversationHistory?: any[];
    userId?: string;
    sessionId?: string;
  }): Promise<ProcessingProfileResult>;
}

export class MaiaConversationRouter implements ConversationRouter {

  async chooseProcessingProfile(input: {
    message: string;
    turnCount: number;
    lastDepth?: ProcessingProfile;
    conversationHistory?: any[];
    userId?: string;
    sessionId?: string;
  }): Promise<ProcessingProfileResult> {

    const { message, turnCount, lastDepth, userId, sessionId } = input;
    const text = message.trim().toLowerCase();
    const textLength = message.trim().length;

    // ============================================================================
    // PHASE 2: COGNITIVE PROFILE AWARENESS
    // ============================================================================
    let cognitiveProfile: CognitiveProfile | null = null;

    try {
      // Try userId first, fallback to sessionId
      if (userId) {
        cognitiveProfile = await getCognitiveProfile(userId);
      } else if (sessionId) {
        cognitiveProfile = await getCognitiveProfile(sessionId);
      }

      if (cognitiveProfile) {
        console.log(
          `🧠 [Router] Cognitive awareness: avg=${cognitiveProfile.rollingAverage.toFixed(2)}, ` +
          `stability=${cognitiveProfile.stability}, ` +
          `spiritual_bypassing=${(cognitiveProfile.bypassingFrequency.spiritual * 100).toFixed(0)}%, ` +
          `intellectual_bypassing=${(cognitiveProfile.bypassingFrequency.intellectual * 100).toFixed(0)}%`
        );
      }
    } catch (err) {
      console.warn('⚠️  [Router] Failed to load cognitive profile (non-blocking):', err);
    }

    // ============================================================================
    // CONTENT-BASED ROUTING (Initial profile determination)
    // ============================================================================
    let profile: ProcessingProfile;
    let reasoning: string;
    let estimatedTime: number;

    // -----------------------------
    // 0) Emergency: empty / noise → FAST
    // -----------------------------
    if (!text || textLength === 0) {
      profile = 'FAST';
      reasoning = 'Empty message - using fast path';
      estimatedTime = 1500;
    }

    // -----------------------------------
    // 1) ULTRA-RESTRICTIVE DEEP invitations only
    // -----------------------------------
    else {
      const explicitDeepPhrases = [
        'take me deeper',
        'go deep with me',
        'go as deep as you can',
        'i want to go deep',
        'shadow work',
        'guide me into the shadow',
        'help me with my trauma',
        'take me into the roots',
        'ritualize this',
        'let\'s do a ritual',
        'initiation work',
      ];

      const wantsDeep = explicitDeepPhrases.some((phrase) => text.includes(phrase));

      // Also allow DEEP if: long message AND later in relationship AND user is clearly in process language
      const processLanguageHints = [
        'pattern that keeps repeating',
        'i always end up',
        'no matter what i do',
        'core wound',
        'deepest fear',
        'i don\'t want to keep living this way',
      ];

      const looksLikeCoreWound =
        textLength > 700 && processLanguageHints.some((hint) => text.includes(hint));

      const relationshipDeveloped = turnCount >= 5;

      if (wantsDeep || (looksLikeCoreWound && relationshipDeveloped)) {
        profile = 'DEEP';
        reasoning = 'Explicit deep work invitation or developed core wound processing';
        estimatedTime = 15000;
      }

      // --------------------------
      // 2) FAST: truly light stuff
      // --------------------------
      else {
        const isShort = textLength < 60;
        const hasNoSentenceEnd = !/[?.!]/.test(text);

        // Quick greetings / check-ins stay FAST
        const greetingPatterns = ['hi', 'hey', 'hello', 'yo', 'good morning', 'good evening'];

        const isGreeting =
          greetingPatterns.some((g) => text === g || text.startsWith(g + ' ')) ||
          text.includes('how are you') ||
          text.includes('checking in') ||
          text.includes('just saying hi');

        if (isGreeting && isShort) {
          profile = 'FAST';
          reasoning = 'Simple greeting - using fast path';
          estimatedTime = 1500;
        }

        // Very short + light → FAST
        else if (isShort && hasNoSentenceEnd) {
          profile = 'FAST';
          reasoning = 'Short message without complexity - using fast path';
          estimatedTime = 1500;
        }

        // ----------------------------------
        // 3) CORE: default for real content
        // ----------------------------------
        else {
          const corePatterns = [
            'meaning',
            'purpose',
            'anxiety',
            'panic',
            'depression',
            'relationship',
            'family',
            'partner',
            'marriage',
            'work',
            'job',
            'career',
            'direction',
            'stuck',
            'burned out',
            'burnt out',
            'overwhelmed',
            'healing',
            'transformation',
            'confused',
            'don\'t know what to do',
          ];

          if (corePatterns.some((pattern) => text.includes(pattern)) || textLength > 150) {
            profile = 'CORE';
            reasoning = 'Real life topics requiring MAIA\'s grounded presence';
            estimatedTime = 4000;
          }

          // ---------------------------------
          // 4) Early relationship bias → FAST
          // ---------------------------------
          else if (turnCount < 3) {
            profile = 'FAST';
            reasoning = 'Early conversation - building relationship gradually';
            estimatedTime = 1500;
          }

          // -------------------
          // 5) Safe default → CORE
          // -------------------
          else {
            profile = 'CORE';
            reasoning = 'Default to CORE processing for meaningful content';
            estimatedTime = 4000;
          }
        }
      }
    }

    // ============================================================================
    // COGNITIVE ROUTING ADJUSTMENTS
    // Apply developmental awareness to bias the initial content-based decision
    // ============================================================================

    if (cognitiveProfile) {
      const avg = cognitiveProfile.rollingAverage;
      const stability = cognitiveProfile.stability;
      const spiritualBypass = cognitiveProfile.bypassingFrequency.spiritual;
      const intellectualBypass = cognitiveProfile.bypassingFrequency.intellectual;

      // DOWN-REGULATE: Low cognitive altitude → prefer CORE (structured guidance)
      if (avg < 2.5 && profile === 'DEEP') {
        profile = 'CORE';
        reasoning = `Low cognitive level (${avg.toFixed(2)}) - providing structured guidance instead of deep work`;
        console.log(`🧠 [Router] DOWN-REGULATED DEEP→CORE (low cognitive altitude)`);
      }

      // DOWN-REGULATE: High bypassing → cap at CORE (grounding first)
      if ((spiritualBypass > 0.4 || intellectualBypass > 0.4) && profile === 'DEEP') {
        profile = 'CORE';
        const bypassType = spiritualBypass > 0.4 ? 'spiritual' : 'intellectual';
        reasoning = `High ${bypassType} bypassing (${Math.max(spiritualBypass, intellectualBypass) * 100}%) - grounding before deep work`;
        console.log(`🧠 [Router] DOWN-REGULATED DEEP→CORE (high ${bypassType} bypassing)`);
      }

      // UP-REGULATE: High stable users → upgrade FAST to CORE
      if (avg >= 4.0 && stability === 'ascending' && profile === 'FAST') {
        profile = 'CORE';
        estimatedTime = 4000;
        reasoning = `High cognitive level (${avg.toFixed(2)}) + ascending trajectory - providing depth`;
        console.log(`🧠 [Router] UP-REGULATED FAST→CORE (high cognitive altitude + ascending)`);
      }

      // UP-REGULATE: Field-safe users with complex input → allow DEEP
      if (cognitiveProfile.fieldWorkSafe && textLength > 400 && profile === 'CORE') {
        profile = 'DEEP';
        estimatedTime = 15000;
        reasoning = `Field-safe cognitive profile (avg ${avg.toFixed(2)}) + complex input - full consciousness orchestration`;
        console.log(`🧠 [Router] UP-REGULATED CORE→DEEP (field-safe + complex)`);
      }
    }

    return {
      profile,
      reasoning,
      estimatedTime,
      meta: { cognitiveProfile }
    };
  }

}

// Singleton instance
export const maiaConversationRouter = new MaiaConversationRouter();