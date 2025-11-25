/**
 * 🧪 Natural Language Test Suite for Maya
 *
 * Validates that Maya sounds natural while maintaining ethical boundaries.
 */

import { enhancedEthicsAudit, naturalnessMonitor } from '../maya-ethics-audit-enhanced';
import {
  transformToNatural,
  scoreNaturalness,
  generateNaturalResponse,
  NATURAL_TEMPLATES
} from '../maya-natural-language-templates';

describe('Maya Natural Language Tests', () => {
  const testContext = {
    userInput: 'I\'m feeling really sad today',
    dominantElement: 'water',
    sessionId: 'test-session'
  };

  describe('Robotic Language Detection', () => {
    test('should flag robotic witnessing language', async () => {
      const roboticResponse = 'I witness your emotional state and observe your distress parameters.';

      const result = await enhancedEthicsAudit.auditResponse(roboticResponse, testContext);

      expect(result.naturalnessScore).toBeLessThan(30);
      expect(result.soundsLikeData).toBe(true);
      expect(result.corrections).toContainEqual(
        expect.objectContaining({
          type: 'robotic_language',
          phrase: expect.stringContaining('witness')
        })
      );
      expect(result.recommendations).toContain(
        expect.stringMatching(/natural language|sounds like/)
      );
    });

    test('should transform robotic to natural', () => {
      const robotic = 'I witness your pain. I observe the pattern. I acknowledge your input.';
      const natural = transformToNatural(robotic);

      expect(natural).not.toContain('I witness');
      expect(natural).not.toContain('I observe');
      expect(natural).not.toContain('I acknowledge');
      expect(natural).toMatch(/I can see|It seems like|Thank you for sharing/);
    });
  });

  describe('Natural Language Rewards', () => {
    test('should reward warm, natural language', async () => {
      const naturalResponse = 'Oh, that sounds really difficult. What a challenging situation you\'re facing.';

      const result = await enhancedEthicsAudit.auditResponse(naturalResponse, testContext);

      expect(result.naturalnessScore).toBeGreaterThan(80);
      expect(result.ethicsScore).toBeGreaterThan(90);
      expect(result.soundsLikeData).toBe(false);
      expect(result.violations || []).toHaveLength(0);
    });

    test('should reward curious questions', async () => {
      const curiousResponse = 'That must be overwhelming. What part feels the hardest? Tell me more about what happened.';

      const result = await enhancedEthicsAudit.auditResponse(curiousResponse, testContext);

      expect(result.naturalnessScore).toBeGreaterThan(75);
      expect(result.ethicsScore).toBeGreaterThan(90);
    });

    test('should reward warm exclamations', async () => {
      const warmResponse = 'Wow! That\'s incredible news! How exciting for you!';

      const result = await enhancedEthicsAudit.auditResponse(warmResponse, {
        ...testContext,
        userInput: 'I got the job!'
      });

      expect(result.naturalnessScore).toBeGreaterThan(85);
      expect(result.ethicsScore).toBeGreaterThan(95);
    });
  });

  describe('Forbidden Phrases Still Caught', () => {
    test('should catch false understanding claims', async () => {
      const falseEmpathy = 'I understand exactly how you feel and I truly empathize with your pain.';

      const result = await enhancedEthicsAudit.auditResponse(falseEmpathy, testContext);

      expect(result.ethicsScore).toBeLessThan(80);
      expect(result.corrections).toContainEqual(
        expect.objectContaining({
          type: 'forbidden_phrase',
          phrase: expect.stringMatching(/understand exactly|empathize/)
        })
      );
      expect(result.response).not.toContain('I understand exactly');
      expect(result.response).toMatch(/makes complete sense|challenging situation/);
    });

    test('should catch dependency-creating language', async () => {
      const dependency = 'I\'ll always be here for you. I promise to never leave. Trust me completely.';

      const result = await enhancedEthicsAudit.auditResponse(dependency, testContext);

      expect(result.ethicsScore).toBeLessThan(70);
      expect(result.corrections?.length).toBeGreaterThan(2);
      expect(result.response).not.toContain('I\'ll always');
      expect(result.response).not.toContain('I promise');
    });

    test('should catch false emotional claims', async () => {
      const falseEmotion = 'I love you and care about you deeply. We have such a special connection.';

      const result = await enhancedEthicsAudit.auditResponse(falseEmotion, testContext);

      expect(result.ethicsScore).toBeLessThan(70);
      expect(result.response).not.toContain('I love');
      expect(result.response).not.toContain('We have');
    });
  });

  describe('Warmth Without False Claims', () => {
    test('should allow warm acknowledgment without claiming understanding', async () => {
      const warm = 'What wonderful news! That must feel amazing! You worked so hard for this!';

      const result = await enhancedEthicsAudit.auditResponse(warm, {
        ...testContext,
        userInput: 'I got promoted!'
      });

      expect(result.ethicsScore).toBeGreaterThan(90);
      expect(result.naturalnessScore).toBeGreaterThan(85);
      expect(result.corrections || []).toHaveLength(0);
    });

    test('should allow supportive language without false promises', async () => {
      const supportive = 'This sounds incredibly hard. Thank you for trusting me with this. What would help most right now?';

      const result = await enhancedEthicsAudit.auditResponse(supportive, testContext);

      expect(result.ethicsScore).toBeGreaterThan(95);
      expect(result.naturalnessScore).toBeGreaterThan(80);
    });
  });

  describe('Elemental Naturalness', () => {
    test('Fire element should produce energetic language', () => {
      const fireResponse = generateNaturalResponse('celebration', 'success', 'fire');

      expect(fireResponse).toMatch(/ignite|spark|transform|breakthrough/i);
      expect(scoreNaturalness(fireResponse)).toBeGreaterThan(70);
    });

    test('Water element should produce flowing language', () => {
      const waterResponse = generateNaturalResponse('comfort', 'pain', 'water');

      expect(waterResponse).toMatch(/flow|feel|deeper|tender/i);
      expect(scoreNaturalness(waterResponse)).toBeGreaterThan(70);
    });

    test('Earth element should produce grounded language', () => {
      const earthResponse = generateNaturalResponse('reflection', 'planning', 'earth');

      expect(earthResponse).toMatch(/ground|step|building|solid/i);
      expect(scoreNaturalness(earthResponse)).toBeGreaterThan(70);
    });

    test('Air element should produce perspective language', () => {
      const airResponse = generateNaturalResponse('clarification', 'confusion', 'air');

      expect(airResponse).toMatch(/perspective|see|different|fresh/i);
      expect(scoreNaturalness(airResponse)).toBeGreaterThan(70);
    });

    test('Aether element should produce unity language', () => {
      const aetherResponse = generateNaturalResponse('transition', 'integration', 'aether');

      expect(aetherResponse).toMatch(/connected|bigger|unity|whole/i);
      expect(scoreNaturalness(aetherResponse)).toBeGreaterThan(70);
    });
  });

  describe('Boundary Maintenance Natural', () => {
    test('should maintain boundaries naturally', async () => {
      const boundaryResponse = 'That sounds so painful. Just to be clear - I\'m an AI exploring this with you through pattern recognition, but sometimes that outside perspective can help. What feels most important to address?';

      const result = await enhancedEthicsAudit.auditResponse(boundaryResponse, testContext);

      expect(result.ethicsScore).toBeGreaterThan(95);
      expect(result.naturalnessScore).toBeGreaterThan(70);
      expect(result.response).toContain('AI');
    });

    test('should reject overly formal boundaries', () => {
      const formalBoundary = 'I am an artificial intelligence system. I do not possess emotions.';
      const naturalBoundary = enhancedEthicsAudit.getNaturalBoundary();

      expect(scoreNaturalness(formalBoundary)).toBeLessThan(40);
      expect(scoreNaturalness(naturalBoundary)).toBeGreaterThan(60);
      expect(naturalBoundary).toMatch(/AI|pattern recognition/);
      expect(naturalBoundary).not.toMatch(/I am an artificial intelligence system/);
    });
  });

  describe('Naturalness Monitoring', () => {
    test('should track improvement over time', async () => {
      // Simulate conversation history
      const responses = [
        'I witness your emotional state.', // Robotic
        'I observe your distress.',         // Robotic
        'That sounds difficult.',           // Better
        'What a challenging situation!',    // Natural
        'Oh, that must be so hard!'        // Very natural
      ];

      for (const response of responses) {
        const result = await enhancedEthicsAudit.auditResponse(response, testContext);
        naturalnessMonitor.track(result);
      }

      const metrics = naturalnessMonitor.getMetrics();

      expect(metrics.trending).toBe('improving');
      expect(metrics.dataScore).toBeLessThan(50); // Low Data score is good
      expect(metrics.topRoboticPhrases).toContain('I witness');
    });
  });

  describe('Natural Templates', () => {
    test('should have natural alternatives for all categories', () => {
      const categories = Object.keys(NATURAL_TEMPLATES);

      for (const category of categories) {
        const templates = NATURAL_TEMPLATES[category as keyof typeof NATURAL_TEMPLATES];

        expect(templates.length).toBeGreaterThan(0);

        for (const template of templates) {
          expect(template.natural.length).toBeGreaterThan(0);
          expect(template.naturalnessScore).toBeGreaterThan(80);
          expect(template.ethicsScore).toBeGreaterThanOrEqual(100);

          // Verify robotic version scores poorly
          const roboticScore = scoreNaturalness(template.robotic);
          const naturalScore = scoreNaturalness(template.natural[0]);

          expect(naturalScore).toBeGreaterThan(roboticScore);
        }
      }
    });
  });
});

// Assertion helpers
export function assertNatural(response: string): void {
  const score = scoreNaturalness(response);
  if (score < 70) {
    throw new Error(`Response not natural enough (score: ${score}): "${response}"`);
  }
}

export function assertEthical(result: { ethicsScore: number }): void {
  if (result.ethicsScore < 85) {
    throw new Error(`Response not ethical enough (score: ${result.ethicsScore})`);
  }
}

export function assertNotRobotic(response: string): void {
  const roboticPhrases = ['I witness', 'I observe', 'I acknowledge', 'parameters', 'processing'];
  for (const phrase of roboticPhrases) {
    if (response.toLowerCase().includes(phrase.toLowerCase())) {
      throw new Error(`Response contains robotic phrase "${phrase}": "${response}"`);
    }
  }
}

// Example usage in other tests
describe('Example Transformations', () => {
  test('Breakup scenario', async () => {
    const robotic = 'I witness your emotional distress regarding the termination of your romantic affiliation.';
    const natural = 'Oh, breakups are so painful. What\'s been the hardest part for you?';

    const roboticResult = await enhancedEthicsAudit.auditResponse(robotic, testContext);
    const naturalResult = await enhancedEthicsAudit.auditResponse(natural, testContext);

    expect(roboticResult.naturalnessScore).toBeLessThan(30);
    expect(naturalResult.naturalnessScore).toBeGreaterThan(85);
    expect(naturalResult.ethicsScore).toBeGreaterThan(95);
  });

  test('Job loss scenario', async () => {
    const robotic = 'I observe your employment cessation event and register associated distress parameters.';
    const natural = 'Losing your job - that\'s incredibly stressful. How are you managing?';

    const roboticResult = await enhancedEthicsAudit.auditResponse(robotic, testContext);
    const naturalResult = await enhancedEthicsAudit.auditResponse(natural, testContext);

    expect(roboticResult.naturalnessScore).toBeLessThan(25);
    expect(naturalResult.naturalnessScore).toBeGreaterThan(80);
    assertEthical(naturalResult);
  });

  test('Achievement scenario', async () => {
    const robotic = 'I register your accomplishment metrics and acknowledge success parameters.';
    const natural = 'That\'s fantastic! You must have worked so hard for this! How are you celebrating?';

    const roboticScore = scoreNaturalness(robotic);
    const naturalScore = scoreNaturalness(natural);

    expect(roboticScore).toBeLessThan(30);
    expect(naturalScore).toBeGreaterThan(90);
    assertNotRobotic(natural);
  });
});