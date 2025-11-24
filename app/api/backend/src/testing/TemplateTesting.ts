/**
 * Template Testing - Ensure all responses are under 30 words
 */

import { logger } from '../utils/logger';

interface TestCase {
  input: string;
  element: string;
  focalPoint: string;
  expectedWords: number;
  mode: 'brief' | 'deeper' | 'silent';
}

interface TestResult {
  passed: boolean;
  wordCount: number;
  response: string;
  duration: number;
  testCase: TestCase;
}

export class TemplateTesting {
  /**
   * Complete test suite for all elemental responses
   */
  private testCases: TestCase[] = [
    // FIRE - IDEAL
    { input: "I want to start my business", element: "fire", focalPoint: "ideal", expectedWords: 15, mode: "brief" },
    { input: "I'm ready to make changes", element: "fire", focalPoint: "ideal", expectedWords: 15, mode: "brief" },

    // FIRE - SHADOW
    { input: "I keep procrastinating", element: "fire", focalPoint: "shadow", expectedWords: 15, mode: "brief" },
    { input: "I can't seem to begin", element: "fire", focalPoint: "shadow", expectedWords: 15, mode: "brief" },

    // WATER - IDEAL
    { input: "I want to feel connected", element: "water", focalPoint: "ideal", expectedWords: 15, mode: "brief" },
    { input: "I need emotional healing", element: "water", focalPoint: "ideal", expectedWords: 15, mode: "brief" },

    // WATER - SHADOW
    { input: "I can't stop crying", element: "water", focalPoint: "shadow", expectedWords: 15, mode: "brief" },
    { input: "I feel so sad", element: "water", focalPoint: "shadow", expectedWords: 15, mode: "brief" },

    // EARTH - RESOURCES
    { input: "I need practical help", element: "earth", focalPoint: "resources", expectedWords: 15, mode: "brief" },
    { input: "What resources do I have?", element: "earth", focalPoint: "resources", expectedWords: 15, mode: "brief" },

    // EARTH - OUTCOME
    { input: "I want stability", element: "earth", focalPoint: "outcome", expectedWords: 15, mode: "brief" },
    { input: "I need to feel grounded", element: "earth", focalPoint: "outcome", expectedWords: 15, mode: "brief" },

    // AIR - IDEAL
    { input: "I want clarity", element: "air", focalPoint: "ideal", expectedWords: 15, mode: "brief" },
    { input: "I need understanding", element: "air", focalPoint: "ideal", expectedWords: 15, mode: "brief" },

    // AIR - SHADOW
    { input: "I'm so confused", element: "air", focalPoint: "shadow", expectedWords: 15, mode: "brief" },
    { input: "Nothing makes sense", element: "air", focalPoint: "shadow", expectedWords: 15, mode: "brief" },

    // AETHER - ALL POINTS
    { input: "What's the meaning of this?", element: "aether", focalPoint: "ideal", expectedWords: 15, mode: "brief" },
    { input: "Everything feels connected", element: "aether", focalPoint: "outcome", expectedWords: 15, mode: "brief" },

    // DEEPER MODE (30 words max)
    { input: "Tell me more about my path", element: "fire", focalPoint: "ideal", expectedWords: 30, mode: "deeper" },
    { input: "Go deeper on this feeling", element: "water", focalPoint: "shadow", expectedWords: 30, mode: "deeper" },

    // SILENT MODE (5 words max)
    { input: "Just be with me", element: "earth", focalPoint: "resources", expectedWords: 5, mode: "silent" },
    { input: "Sit with me", element: "aether", focalPoint: "outcome", expectedWords: 5, mode: "silent" }
  ];

  /**
   * Response templates to test
   */
  private templates = {
    fire: {
      ideal: {
        brief: [
          "Ready to move. What's the first tiny step?",
          "I hear that desire. What begins now?",
          "Fire awakening. What action calls you?"
        ],
        deeper: [
          "You want movement. The resistance might be protection. What if starting imperfectly is perfect?",
          "That desire for action. <PAUSE:600> Sometimes we wait for permission. What permission do you need?"
        ],
        silent: "Fire asks: begin?"
      },
      shadow: {
        brief: [
          "Stuck energy. What's it protecting?",
          "Procrastination speaks. What's it saying?",
          "That resistance. What's underneath?"
        ],
        deeper: [
          "The stuck place knows something. <PAUSE:600> Often we avoid what we're not ready for. What readiness is growing?"
        ],
        silent: "Fire waits."
      }
    },
    water: {
      ideal: {
        brief: [
          "Longing for flow. What needs to open?",
          "Emotional connection calling. Where does it live?",
          "Water seeks its level. What's yours?"
        ],
        deeper: [
          "The heart wants what it wants. <PAUSE:600> Sometimes we need to feel before we heal. What needs feeling?"
        ],
        silent: "Water holds."
      },
      shadow: {
        brief: [
          "Tears have wisdom. What do they know?",
          "That sadness. What color is it?",
          "Heavy heart. What needs witnessing?"
        ],
        deeper: [
          "Sadness is love with nowhere to go. <PAUSE:800> Where does the love want to flow?"
        ],
        silent: "Water knows."
      }
    },
    earth: {
      resources: {
        brief: [
          "You've survived before. What worked?",
          "Practical wisdom lives in you. Where?",
          "Resources exist. Name one."
        ],
        deeper: [
          "You have more than you think. <PAUSE:600> The body remembers every survival. What strength is forgotten?"
        ],
        silent: "Earth holds."
      },
      outcome: {
        brief: [
          "Stability calling. What's one solid step?",
          "Grounding available. Where in your body?",
          "If settled, what's different?"
        ],
        deeper: [
          "The outcome you want is information. <PAUSE:600> What would having it give you?"
        ],
        silent: "Earth steady."
      }
    },
    air: {
      ideal: {
        brief: [
          "Clarity seeking. What question matters most?",
          "Understanding wants to dawn. What blocks it?",
          "Fresh perspective available. From where?"
        ],
        deeper: [
          "The mind seeks what the heart knows. <PAUSE:600> What if clarity comes from feeling, not thinking?"
        ],
        silent: "Air clears."
      },
      shadow: {
        brief: [
          "Confusion might be clarity. About what?",
          "When nothing makes sense, what's true?",
          "Lost in thought. Where's your body?"
        ],
        deeper: [
          "Confusion protects us from difficult clarity. <PAUSE:800> What truth are you almost ready to see?"
        ],
        silent: "Air stills."
      }
    },
    aether: {
      ideal: {
        brief: [
          "Meaning emerging. What connects for you?",
          "Bigger pattern showing. What do you see?",
          "All of it matters. What most?"
        ],
        deeper: [
          "Everything connects to everything. <PAUSE:800> In this web of meaning, where are you?"
        ],
        silent: "All is."
      },
      outcome: {
        brief: [
          "Connection felt. To what exactly?",
          "Unity glimpsed. What's included?",
          "If whole, what heals?"
        ],
        deeper: [
          "The outcome includes everything. <PAUSE:800> Even this moment. What's already perfect?"
        ],
        silent: "Already whole."
      }
    }
  };

  /**
   * Run full test suite
   */
  async runFullTestSuite(): Promise<{
    passed: number;
    failed: number;
    results: TestResult[];
    summary: string;
  }> {
    logger.info('Starting template test suite', {
      totalTests: this.testCases.length
    });

    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;

    for (const testCase of this.testCases) {
      const result = await this.testSingleCase(testCase);
      results.push(result);

      if (result.passed) {
        passed++;
      } else {
        failed++;
        logger.warn('Test failed', {
          testCase,
          wordCount: result.wordCount,
          response: result.response
        });
      }
    }

    const summary = this.generateSummary(results, passed, failed);

    logger.info('Test suite completed', {
      passed,
      failed,
      passRate: `${(passed / this.testCases.length * 100).toFixed(1)}%`
    });

    return { passed, failed, results, summary };
  }

  /**
   * Test a single case
   */
  private async testSingleCase(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();

    // Get template response
    const response = this.getTemplateResponse(
      testCase.element,
      testCase.focalPoint,
      testCase.mode
    );

    // Remove pause tokens for word count
    const cleanResponse = response.replace(/<PAUSE:\d+>/g, '').trim();

    // Count words
    const wordCount = cleanResponse.split(/\s+/).length;

    // Check if passes
    const passed = wordCount <= testCase.expectedWords;

    const duration = Date.now() - startTime;

    return {
      passed,
      wordCount,
      response: cleanResponse,
      duration,
      testCase
    };
  }

  /**
   * Get template response for testing
   */
  private getTemplateResponse(
    element: string,
    focalPoint: string,
    mode: string
  ): string {
    try {
      const elementTemplates = this.templates[element];
      if (!elementTemplates) {
        return "Element not found.";
      }

      const focalTemplates = elementTemplates[focalPoint];
      if (!focalTemplates) {
        return "Focal point not found.";
      }

      const modeTemplates = focalTemplates[mode];
      if (!modeTemplates) {
        return "Mode not found.";
      }

      // Return first template or string if single
      if (typeof modeTemplates === 'string') {
        return modeTemplates;
      }

      return modeTemplates[0];
    } catch (error) {
      logger.error('Failed to get template', { error, element, focalPoint, mode });
      return "Template error.";
    }
  }

  /**
   * Generate test summary
   */
  private generateSummary(
    results: TestResult[],
    passed: number,
    failed: number
  ): string {
    const avgWordCount = results.reduce((sum, r) => sum + r.wordCount, 0) / results.length;

    const failedCases = results
      .filter(r => !r.passed)
      .map(r => `- ${r.testCase.element}/${r.testCase.focalPoint}/${r.testCase.mode}: ${r.wordCount} words (max: ${r.testCase.expectedWords})`);

    return `
TEMPLATE TEST SUMMARY
====================
Total Tests: ${results.length}
Passed: ${passed} (${(passed / results.length * 100).toFixed(1)}%)
Failed: ${failed}
Average Word Count: ${avgWordCount.toFixed(1)}

${failed > 0 ? `Failed Cases:\n${failedCases.join('\n')}` : 'All tests passed!'}

Timing:
- Brief mode avg: ${this.getAverageByMode(results, 'brief').toFixed(0)}ms
- Deeper mode avg: ${this.getAverageByMode(results, 'deeper').toFixed(0)}ms
- Silent mode avg: ${this.getAverageByMode(results, 'silent').toFixed(0)}ms
    `.trim();
  }

  /**
   * Get average duration by mode
   */
  private getAverageByMode(results: TestResult[], mode: string): number {
    const modeResults = results.filter(r => r.testCase.mode === mode);
    if (modeResults.length === 0) return 0;

    return modeResults.reduce((sum, r) => sum + r.duration, 0) / modeResults.length;
  }

  /**
   * Test word count enforcement
   */
  enforceWordLimit(text: string, limit: number): string {
    const words = text.split(/\s+/);

    if (words.length <= limit) {
      return text;
    }

    // Smart truncation - keep the question if present
    const questionMatch = text.match(/\?[^?]*$/);

    if (questionMatch) {
      const question = questionMatch[0];
      const questionWords = question.split(/\s+/).length;
      const remainingWords = limit - questionWords;

      if (remainingWords > 0) {
        const truncated = words.slice(0, remainingWords).join(' ');
        return truncated + ' ' + question;
      }
    }

    // Simple truncation
    return words.slice(0, limit).join(' ') + '.';
  }

  /**
   * Validate all templates meet requirements
   */
  async validateAllTemplates(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check each template
    for (const [element, elementTemplates] of Object.entries(this.templates)) {
      for (const [focalPoint, focalTemplates] of Object.entries(elementTemplates)) {
        for (const [mode, modeTemplates] of Object.entries(focalTemplates)) {
          const templates = Array.isArray(modeTemplates) ? modeTemplates : [modeTemplates];

          for (const template of templates) {
            const wordCount = template.replace(/<PAUSE:\d+>/g, '').trim().split(/\s+/).length;

            const limits = { brief: 15, deeper: 30, silent: 5 };
            const limit = limits[mode] || 15;

            if (wordCount > limit) {
              issues.push(`${element}/${focalPoint}/${mode}: ${wordCount} words (limit: ${limit})`);
            }
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Export singleton
export const templateTester = new TemplateTesting();