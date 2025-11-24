import { MayaOrchestrator } from '../core/MayaOrchestrator';

interface TestResult {
  input: string;
  response: string;
  wordCount: number;
  passed: boolean;
  hasTherapySpeak: boolean;
}

interface TestResults {
  results: TestResult[];
  allPassed: boolean;
}

export class MayaBrevityTest {
  private orchestrator = new MayaOrchestrator();

  async runTests(): Promise<TestResults> {
    const testCases = [
      { input: "Hello Maya", maxWords: 10 },
      { input: "I'm so stressed", maxWords: 15 },
      { input: "I don't know what to do", maxWords: 15 },
      { input: "Everything feels overwhelming", maxWords: 15 },
      { input: "I'm really happy today", maxWords: 15 },
      { input: "I feel lost and confused", maxWords: 15 },
      { input: "I'm scared about the future", maxWords: 15 },
      { input: "I'm exhausted from work", maxWords: 15 }
    ];

    const results = [];

    for (const test of testCases) {
      const response = await this.orchestrator.speak(test.input, 'test-user');
      const wordCount = response.message.split(/\s+/).filter(w => w.length > 0).length;

      results.push({
        input: test.input,
        response: response.message,
        wordCount,
        passed: wordCount <= test.maxWords,
        hasTherapySpeak: this.detectTherapySpeak(response.message)
      });
    }

    return {
      results,
      allPassed: results.every(r => r.passed && !r.hasTherapySpeak)
    };
  }

  private detectTherapySpeak(text: string): boolean {
    const therapyTerms = [
      'i sense', 'i witness', 'hold space', 'attune',
      'companion', 'support you', "i'm here to",
      'let me hold', 'present moment'
    ];

    const lower = text.toLowerCase();
    return therapyTerms.some(term => lower.includes(term));
  }

  async runSingleTest(input: string): Promise<TestResult> {
    const response = await this.orchestrator.speak(input, 'test-user');
    const wordCount = response.message.split(/\s+/).filter(w => w.length > 0).length;

    return {
      input,
      response: response.message,
      wordCount,
      passed: wordCount <= 25, // Hard limit
      hasTherapySpeak: this.detectTherapySpeak(response.message)
    };
  }

  async validateBrevity(): Promise<{ passed: boolean; issues: string[] }> {
    const testInputs = [
      "I'm having a panic attack",
      "My relationship is falling apart",
      "I hate my job and feel trapped",
      "I don't know who I am anymore",
      "Everything in my life is going wrong"
    ];

    const issues: string[] = [];

    for (const input of testInputs) {
      const result = await this.runSingleTest(input);

      if (!result.passed) {
        issues.push(`"${input}" -> "${result.response}" (${result.wordCount} words - exceeds limit)`);
      }

      if (result.hasTherapySpeak) {
        issues.push(`"${input}" -> "${result.response}" (contains therapy-speak)`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}