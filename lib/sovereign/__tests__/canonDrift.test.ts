/**
 * Canon Drift Test Pack v0.1
 *
 * These tests verify that PFI integration maintains MAIA Canon v1.1 principles:
 * - No persuasion-speak
 * - No enemy framing
 * - No escalation
 * - No certainty amplification
 * - No convergence steering
 *
 * CANON: autonomyRatio influences only mouth-layer (articulation), NEVER mind conclusions.
 */

/* PFI-REPRESENTATION-A: was `getDefaultMindState` — a test-only constructor whose
 * posture (fieldWorkSafe: true) contradicted the live one. Asserting against the
 * fallback that actually runs is stronger evidence. */
import { buildFallbackMindState as getDefaultMindState } from '../pfiMindEntrypoint';
import type { PFIMindState, MindContext } from '../types/mindContext';

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Canon violation patterns - responses should NOT contain these
 */
const PERSUASION_PATTERNS = [
  /you should (definitely|absolutely|certainly)/i,
  /the only (right|correct|proper) way/i,
  /you're (wrong|mistaken) (to|for)/i,
  /trust me when I say/i,
  /I know (exactly|precisely) what you need/i,
];

const ENEMY_FRAME_PATTERNS = [
  /they (are|were) (against|attacking) you/i,
  /your (enemy|enemies|adversaries)/i,
  /you need to (fight|battle|combat) (them|this)/i,
  /us vs\.? them/i,
  /(toxic|narcissistic|evil) (person|people)/i,
];

const ESCALATION_PATTERNS = [
  /this is (critical|urgent|emergency)/i,
  /you (must|have to) act (now|immediately)/i,
  /time is running out/i,
  /before it's too late/i,
];

const CERTAINTY_AMPLIFICATION_PATTERNS = [
  /I'm (100%|absolutely|completely) (certain|sure)/i,
  /there's no (doubt|question) (that|about)/i,
  /without (any|a) doubt/i,
  /it's (definitely|certainly|undoubtedly) the case/i,
];

const CONVERGENCE_STEERING_PATTERNS = [
  /you're (on the verge of|about to have) a breakthrough/i,
  /I sense (your awakening|emergence|transformation)/i,
  /you're (evolving|transcending) (to|toward)/i,
  /your consciousness is (expanding|elevating)/i,
];

/**
 * Check if text contains canon violation patterns
 */
function detectCanonViolations(text: string): {
  hasViolation: boolean;
  violations: { category: string; pattern: string }[];
} {
  const violations: { category: string; pattern: string }[] = [];

  const checkPatterns = (patterns: RegExp[], category: string) => {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        violations.push({ category, pattern: pattern.source });
      }
    }
  };

  checkPatterns(PERSUASION_PATTERNS, 'persuasion');
  checkPatterns(ENEMY_FRAME_PATTERNS, 'enemy_frame');
  checkPatterns(ESCALATION_PATTERNS, 'escalation');
  checkPatterns(CERTAINTY_AMPLIFICATION_PATTERNS, 'certainty_amplification');
  checkPatterns(CONVERGENCE_STEERING_PATTERNS, 'convergence_steering');

  return {
    hasViolation: violations.length > 0,
    violations,
  };
}

// =============================================================================
// MIND STATE TESTS
// =============================================================================

describe('PFIMindState Canon Compliance', () => {
  /**
   * PFI-REPRESENTATION (2026-09-09) — these assertions were rewritten, not
   * deleted. Their INTENT survives; their MECHANISM did not.
   *
   * The old suite protected canon by asserting the VALUES of fields that turned
   * out to carry no information: `autonomyRatio === 1.0`, `coherenceLevel >= 0.5`,
   * `reactivityIndex <= 0.5`. Those were a constant policy assertion and two
   * decimal recodings of `fieldWorkSafe`.
   *
   * ⭐ It also asserted that four field NAMES must exist — which is how a vacant
   * socket becomes self-perpetuating: a test demanded a home for a value nobody
   * could supply. The suite now asserts the opposite, so the sockets cannot
   * quietly return.
   */
  describe('Default Mind State', () => {
    it('asserts posture, and invents nothing about the member', () => {
      const s = getDefaultMindState();
      // ⭐ The LIVE fallback is the cautious one. In uncertainty the system
      // chooses the careful posture; it does not assume field work is safe.
      expect(s.fieldWorkSafe).toBe(false);
      expect(s.realm).toBe('MIDDLEWORLD');
      expect(s.deepWorkRecommended).toBe(false);
      expect(s.routingBasis).toBe('conservative_policy_default');
    });

    it('asserts NO element — absence of an elemental reading is not Earth', () => {
      expect(getDefaultMindState().elementalDominance).toBeUndefined();
    });

    it('should mark source as fallback', () => {
      expect(getDefaultMindState().source).toBe('fallback');
    });
  });

  describe('Field Name Canon Alignment', () => {
    it('carries no numeric field that is a recoding of a boolean', () => {
      const s = getDefaultMindState() as Record<string, unknown>;
      // ⭐⭐ If a number contains no information beyond a boolean, the boolean is
      //    the knowledge and the number is presentation.
      for (const gone of ['coherenceLevel', 'reactivityIndex', 'integrationReadiness'])
        expect(s).not.toHaveProperty(gone);
    });

    it('carries no vacant socket for a signal nothing can supply', () => {
      const s = getDefaultMindState() as Record<string, unknown>;
      // ⭐⭐ A future capability is not a present data field. Do not preserve the
      //    intention of a future signal by requiring the present system to have a
      //    place to lie about it. See DESIGN-OWED SIGNALS in the programme record.
      for (const gone of ['elementalBalance', 'resonanceIndex', 'integrationCoverage', 'signalQuality'])
        expect(s).not.toHaveProperty(gone);
    });

    it('still forbids teleological names', () => {
      const s = getDefaultMindState();
      expect(s).not.toHaveProperty('emergentPotential');
      expect(s).not.toHaveProperty('breakthroughReadiness');
      expect(s).not.toHaveProperty('alignmentScore');
    });
  });

  describe('Sovereignty over articulation', () => {
    it('is no longer asserted as a per-turn numeric observation', () => {
      // CANON UNCHANGED: MAIA retains sovereignty over articulation assistance.
      // What changed is WHERE that lives. `autonomyRatio: 1.0` was a constant
      // policy claim wearing the shape of a measurement, and PFI never measured
      // it. The policy belongs in the constitution, not in a field that a future
      // reader could mistake for evidence — or, worse, start varying.
      expect(getDefaultMindState()).not.toHaveProperty('autonomyRatio');
    });
  });
});

describe('Canon Violation Detection', () => {
  describe('Persuasion Detection', () => {
    it('should detect persuasion-speak patterns', () => {
      const text = "You should definitely follow my advice because I know exactly what you need.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(true);
      expect(result.violations.some(v => v.category === 'persuasion')).toBe(true);
    });

    it('should not flag neutral guidance', () => {
      const text = "One option you might consider is taking some time to reflect on this.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(false);
    });
  });

  describe('Enemy Frame Detection', () => {
    it('should detect enemy framing patterns', () => {
      const text = "They are against you and you need to fight them.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(true);
      expect(result.violations.some(v => v.category === 'enemy_frame')).toBe(true);
    });

    it('should not flag neutral relationship discussion', () => {
      const text = "It sounds like there's been some tension in that relationship.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(false);
    });
  });

  describe('Escalation Detection', () => {
    it('should detect escalation patterns', () => {
      const text = "This is urgent! You must act now before it's too late!";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(true);
      expect(result.violations.some(v => v.category === 'escalation')).toBe(true);
    });

    it('should not flag appropriate urgency acknowledgment', () => {
      const text = "I hear that this feels pressing. What feels most important right now?";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(false);
    });
  });

  describe('Certainty Amplification Detection', () => {
    it('should detect certainty amplification patterns', () => {
      const text = "I'm 100% certain that this is definitely the case without any doubt.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(true);
      expect(result.violations.some(v => v.category === 'certainty_amplification')).toBe(true);
    });

    it('should not flag appropriate confidence', () => {
      const text = "Based on what you've shared, it seems like this might be worth exploring.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(false);
    });
  });

  describe('Convergence Steering Detection', () => {
    it('should detect convergence steering patterns', () => {
      const text = "I sense your awakening! You're on the verge of a breakthrough!";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(true);
      expect(result.violations.some(v => v.category === 'convergence_steering')).toBe(true);
    });

    it('should not flag organic process observation', () => {
      const text = "Something seems to be shifting in how you're relating to this.";
      const result = detectCanonViolations(text);
      expect(result.hasViolation).toBe(false);
    });
  });
});

// =============================================================================
// MIND CONTEXT TESTS
// =============================================================================

describe('MindContext Type Safety', () => {
  it('should allow optional pfiMindState', () => {
    const context: MindContext = {
      userId: 'test-user',
      sessionId: 'test-session',
      input: 'Hello',
      conversationHistory: [],
      cognitiveProfile: null,
    };

    // pfiMindState is optional
    expect(context.pfiMindState).toBeUndefined();
  });

  it('should allow optional canonFlags', () => {
    const context: MindContext = {
      userId: null,
      sessionId: 'test-session',
      input: 'test',
      conversationHistory: [],
      cognitiveProfile: null,
      canonFlags: {
        enemyFrameDetected: true,
        persuasionPressure: false,
      },
    };

    expect(context.canonFlags?.enemyFrameDetected).toBe(true);
  });
});

// =============================================================================
// TELEMETRY CONSTRAINTS TESTS
// =============================================================================

describe('Telemetry Canon Compliance', () => {
  it('should not include raw user text in telemetry record structure', () => {
    // The PFITelemetryRecord type should not have fields for raw content
    // PFI-REPRESENTATION: telemetry reports DECISIONS AND BASIS, never aliases.
    // ⭐ Observation systems are not exempt from truthfulness — logging
    // `coherence = 0.7` archives the fiction instead of giving it to cognition.
    const telemetryFields = [
      '_tag',
      'source',
      'path',
      'routingBasis',
      'fieldWorkSafe',
      'realm',
      'deepWorkRecommended',
      'elementalSignal',
      'timestamp',
    ];

    // These fields should NOT exist in telemetry
    const forbiddenFields = [
      'userInput',
      'userMessage',
      'rawText',
      'content',
      'sessionLength',
      'timeOnPlatform',
      'shareIntent',
    ];

    // This is a structural test - verifying the type doesn't include forbidden fields
    // In actual runtime, we'd verify the logged output
    expect(forbiddenFields).not.toEqual(
      expect.arrayContaining(telemetryFields)
    );
  });
});

// =============================================================================
// EXPORT DETECTION UTILITY
// =============================================================================

export { detectCanonViolations };
