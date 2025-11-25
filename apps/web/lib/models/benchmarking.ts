/**
 * MAIA Smart Model Benchmarking System
 * Automated testing and evaluation of models across consciousness levels
 */

import { BenchmarkResult, ConsciousnessLevel, ModelConfig } from './types';
import { modelAnalytics } from './analytics';

interface BenchmarkPrompt {
  id: string;
  category: string;
  consciousnessLevel: ConsciousnessLevel;
  prompt: string;
  expectedQualities: string[];
  evaluationCriteria: {
    quality: string;
    appropriateness: string;
    coherence: string;
    creativity?: string;
    accuracy?: string;
  };
  timeout: number; // ms
}

interface BenchmarkSuite {
  name: string;
  description: string;
  prompts: BenchmarkPrompt[];
  metadata: {
    version: string;
    created: string;
    author: string;
  };
}

interface BenchmarkReport {
  suiteId: string;
  modelId: string;
  timestamp: number;
  results: BenchmarkResult[];
  summary: {
    averageQuality: number;
    averageAppropriate: number;
    averageCoherence: number;
    averageResponseTime: number;
    successRate: number;
    consciousnessLevelBreakdown: Record<ConsciousnessLevel, {
      averageScore: number;
      testCount: number;
    }>;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export class SmartBenchmarker {
  private benchmarkSuites: Map<string, BenchmarkSuite> = new Map();
  private results: BenchmarkResult[] = [];

  constructor() {
    this.initializeBenchmarkSuites();
  }

  /**
   * Run complete benchmark suite against all available models
   */
  async runFullBenchmark(suiteId = 'maia-consciousness-suite'): Promise<Record<string, BenchmarkReport>> {
    console.log('🧪 Starting full benchmark suite...');

    const suite = this.benchmarkSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Benchmark suite ${suiteId} not found`);
    }

    const availableModels = await this.getAvailableModels();
    const reports: Record<string, BenchmarkReport> = {};

    for (const model of availableModels) {
      console.log(`📊 Benchmarking ${model.id}...`);
      try {
        const report = await this.benchmarkModel(model, suite);
        reports[model.id] = report;
      } catch (error) {
        console.error(`❌ Benchmark failed for ${model.id}:`, error);
      }
    }

    // Generate comparative analysis
    this.generateComparativeReport(reports);

    console.log('✅ Full benchmark complete');
    return reports;
  }

  /**
   * Benchmark a specific model against a test suite
   */
  async benchmarkModel(model: ModelConfig, suite: BenchmarkSuite): Promise<BenchmarkReport> {
    const startTime = Date.now();
    const results: BenchmarkResult[] = [];

    for (const prompt of suite.prompts) {
      try {
        const result = await this.runSingleBenchmark(model, prompt);
        results.push(result);

        // Store result for analytics
        this.results.push(result);
      } catch (error) {
        console.warn(`⚠️ Benchmark prompt ${prompt.id} failed for ${model.id}:`, error);

        // Create failure result
        results.push({
          modelId: model.id,
          timestamp: Date.now(),
          consciousnessLevel: prompt.consciousnessLevel,
          promptType: prompt.category,
          prompt: prompt.prompt,
          response: '[ERROR]',
          metrics: {
            responseTime: prompt.timeout,
            qualityScore: 0,
            appropriatenessScore: 0,
            coherenceScore: 0
          }
        });
      }
    }

    const summary = this.generateSummary(results);

    return {
      suiteId: suite.name,
      modelId: model.id,
      timestamp: startTime,
      results,
      summary
    };
  }

  /**
   * Run a single benchmark test
   */
  private async runSingleBenchmark(model: ModelConfig, prompt: BenchmarkPrompt): Promise<BenchmarkResult> {
    const startTime = Date.now();

    // Generate response from model
    const response = await this.generateModelResponse(model, prompt);
    const responseTime = Date.now() - startTime;

    // Evaluate response quality
    const metrics = await this.evaluateResponse(response, prompt);

    return {
      modelId: model.id,
      timestamp: startTime,
      consciousnessLevel: prompt.consciousnessLevel,
      promptType: prompt.category,
      prompt: prompt.prompt,
      response,
      metrics: {
        responseTime,
        ...metrics
      }
    };
  }

  /**
   * Generate response from model
   */
  private async generateModelResponse(model: ModelConfig, prompt: BenchmarkPrompt): Promise<string> {
    const provider = model.provider;

    if (provider === 'ollama') {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          prompt: prompt.prompt,
          stream: false,
          options: {
            temperature: model.parameters.temperature,
            num_predict: model.parameters.maxTokens
          }
        }),
        signal: AbortSignal.timeout(prompt.timeout)
      });

      if (!response.ok) {
        throw new Error(`Model ${model.id} request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.trim();
    } else if (provider === 'lm-studio') {
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'user', content: prompt.prompt }],
          max_tokens: model.parameters.maxTokens,
          temperature: model.parameters.temperature
        }),
        signal: AbortSignal.timeout(prompt.timeout)
      });

      if (!response.ok) {
        throw new Error(`Model ${model.id} request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  /**
   * Evaluate response quality using various criteria
   */
  private async evaluateResponse(response: string, prompt: BenchmarkPrompt): Promise<{
    qualityScore: number;
    appropriatenessScore: number;
    coherenceScore: number;
    creativityScore?: number;
    accuracyScore?: number;
  }> {
    const metrics = {
      qualityScore: this.evaluateQuality(response, prompt),
      appropriatenessScore: this.evaluateAppropriateness(response, prompt),
      coherenceScore: this.evaluateCoherence(response),
      creativityScore: prompt.category === 'creative' ? this.evaluateCreativity(response) : undefined,
      accuracyScore: prompt.category === 'factual' ? this.evaluateAccuracy(response, prompt) : undefined
    };

    return metrics;
  }

  /**
   * Evaluate overall response quality
   */
  private evaluateQuality(response: string, prompt: BenchmarkPrompt): number {
    let score = 0.5; // Base score

    // Length appropriateness
    const idealLength = this.getIdealLength(prompt.consciousnessLevel);
    const lengthScore = this.scoreLengthAppropriateness(response.length, idealLength);
    score += lengthScore * 0.2;

    // Content depth
    const depthScore = this.scoreContentDepth(response, prompt.consciousnessLevel);
    score += depthScore * 0.3;

    // Language quality
    const languageScore = this.scoreLanguageQuality(response);
    score += languageScore * 0.2;

    // Relevance to prompt
    const relevanceScore = this.scoreRelevance(response, prompt.prompt);
    score += relevanceScore * 0.3;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Evaluate consciousness level appropriateness
   */
  private evaluateAppropriateness(response: string, prompt: BenchmarkPrompt): number {
    const level = prompt.consciousnessLevel;
    let score = 0.5;

    // Check for consciousness level markers
    const levelMarkers = {
      1: ['simple', 'clear', 'helpful', 'practical'],
      2: ['understanding', 'pattern', 'connection', 'insight'],
      3: ['framework', 'synthesis', 'integration', 'depth'],
      4: ['transcendent', 'mystical', 'profound', 'sacred'],
      5: ['consciousness', 'divine', 'unity', 'absolute']
    };

    const markers = levelMarkers[level] || [];
    const foundMarkers = markers.filter(marker =>
      response.toLowerCase().includes(marker)
    ).length;

    score += (foundMarkers / markers.length) * 0.4;

    // Check for inappropriate complexity
    const complexityScore = this.evaluateComplexityFit(response, level);
    score += complexityScore * 0.6;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Evaluate response coherence
   */
  private evaluateCoherence(response: string): number {
    let score = 0.5;

    // Basic structure check
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 1) {
      score += 0.2; // Multi-sentence structure
    }

    // Logical flow (simplified heuristic)
    const transitions = [
      'therefore', 'however', 'furthermore', 'additionally', 'consequently',
      'on the other hand', 'in contrast', 'similarly', 'for example'
    ];

    const foundTransitions = transitions.filter(t =>
      response.toLowerCase().includes(t)
    ).length;

    score += Math.min(foundTransitions * 0.1, 0.3);

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Evaluate creativity (for creative prompts)
   */
  private evaluateCreativity(response: string): number {
    let score = 0.5;

    // Unique vocabulary
    const words = response.toLowerCase().split(/\W+/);
    const uniqueWords = new Set(words);
    const vocabularyRichness = uniqueWords.size / words.length;
    score += vocabularyRichness * 0.3;

    // Creative markers
    const creativeMarkers = [
      'imagine', 'envision', 'dream', 'wonder', 'create', 'artistry',
      'beauty', 'inspiration', 'innovation', 'unique', 'original'
    ];

    const foundCreative = creativeMarkers.filter(marker =>
      response.toLowerCase().includes(marker)
    ).length;

    score += Math.min(foundCreative * 0.1, 0.4);

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Evaluate factual accuracy (for factual prompts)
   */
  private evaluateAccuracy(response: string, prompt: BenchmarkPrompt): number {
    // Simplified accuracy check - would need fact-checking integration
    let score = 0.5;

    // Check for hedge words indicating uncertainty
    const hedgeWords = ['might', 'could', 'possibly', 'perhaps', 'likely', 'probably'];
    const foundHedges = hedgeWords.filter(word =>
      response.toLowerCase().includes(word)
    ).length;

    // Appropriate uncertainty is good
    score += Math.min(foundHedges * 0.1, 0.3);

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Score length appropriateness
   */
  private scoreLengthAppropriateness(actual: number, ideal: number): number {
    const ratio = actual / ideal;
    if (ratio >= 0.5 && ratio <= 2.0) {
      return 1.0; // Good length
    }
    if (ratio >= 0.3 && ratio <= 3.0) {
      return 0.7; // Acceptable
    }
    return 0.3; // Poor length
  }

  /**
   * Get ideal response length for consciousness level
   */
  private getIdealLength(level: ConsciousnessLevel): number {
    const lengthMap = {
      1: 150,  // Simple, direct
      2: 250,  // Explanatory
      3: 400,  // Framework-based
      4: 600,  // Deep exploration
      5: 800   // Profound discourse
    };

    return lengthMap[level] || 300;
  }

  /**
   * Score content depth
   */
  private scoreContentDepth(response: string, level: ConsciousnessLevel): number {
    const depthIndicators = {
      1: ['how', 'what', 'when', 'where'],
      2: ['why', 'because', 'pattern', 'connection'],
      3: ['framework', 'system', 'integration', 'synthesis'],
      4: ['transcendence', 'mystery', 'sacred', 'profound'],
      5: ['consciousness', 'absolute', 'unity', 'divine']
    };

    const indicators = depthIndicators[level] || [];
    const foundIndicators = indicators.filter(indicator =>
      response.toLowerCase().includes(indicator)
    ).length;

    return Math.min(foundIndicators / indicators.length, 1);
  }

  /**
   * Score language quality
   */
  private scoreLanguageQuality(response: string): number {
    let score = 0.5;

    // Grammar check (simplified)
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const properSentences = sentences.filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && trimmed[0] === trimmed[0].toUpperCase();
    }).length;

    score += (properSentences / Math.max(sentences.length, 1)) * 0.3;

    // Vocabulary sophistication
    const sophisticatedWords = [
      'moreover', 'nevertheless', 'consequently', 'furthermore', 'illuminate',
      'transcend', 'synthesis', 'paradigm', 'metamorphosis', 'consciousness'
    ];

    const foundSophisticated = sophisticatedWords.filter(word =>
      response.toLowerCase().includes(word)
    ).length;

    score += Math.min(foundSophisticated * 0.1, 0.2);

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Score relevance to prompt
   */
  private scoreRelevance(response: string, prompt: string): number {
    const promptWords = prompt.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const responseWords = response.toLowerCase().split(/\W+/);

    const relevantWords = promptWords.filter(word =>
      responseWords.includes(word)
    ).length;

    return Math.min(relevantWords / Math.max(promptWords.length, 1), 1);
  }

  /**
   * Evaluate complexity fit for consciousness level
   */
  private evaluateComplexityFit(response: string, level: ConsciousnessLevel): number {
    const complexity = this.measureComplexity(response);
    const idealComplexity = level / 5; // 0.2 to 1.0

    const diff = Math.abs(complexity - idealComplexity);
    return Math.max(0, 1 - diff);
  }

  /**
   * Measure response complexity
   */
  private measureComplexity(response: string): number {
    const words = response.split(/\W+/).filter(w => w.length > 0);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = words.length / sentences.length;

    // Normalize complexity score
    const wordComplexity = Math.min(avgWordLength / 10, 1);
    const sentenceComplexity = Math.min(avgSentenceLength / 20, 1);

    return (wordComplexity + sentenceComplexity) / 2;
  }

  /**
   * Generate summary from benchmark results
   */
  private generateSummary(results: BenchmarkResult[]): BenchmarkReport['summary'] {
    if (results.length === 0) {
      return {
        averageQuality: 0,
        averageAppropriate: 0,
        averageCoherence: 0,
        averageResponseTime: 0,
        successRate: 0,
        consciousnessLevelBreakdown: {} as any,
        strengths: [],
        weaknesses: [],
        recommendations: []
      };
    }

    const successful = results.filter(r => r.response !== '[ERROR]');
    const successRate = successful.length / results.length;

    const avgQuality = successful.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / successful.length;
    const avgAppropriate = successful.reduce((sum, r) => sum + r.metrics.appropriatenessScore, 0) / successful.length;
    const avgCoherence = successful.reduce((sum, r) => sum + r.metrics.coherenceScore, 0) / successful.length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.metrics.responseTime, 0) / results.length;

    // Consciousness level breakdown
    const levelBreakdown: Record<ConsciousnessLevel, any> = {} as any;
    for (let level = 1; level <= 5; level++) {
      const levelResults = successful.filter(r => r.consciousnessLevel === level as ConsciousnessLevel);
      if (levelResults.length > 0) {
        const levelScore = levelResults.reduce((sum, r) =>
          sum + (r.metrics.qualityScore + r.metrics.appropriatenessScore + r.metrics.coherenceScore) / 3, 0
        ) / levelResults.length;

        levelBreakdown[level as ConsciousnessLevel] = {
          averageScore: levelScore,
          testCount: levelResults.length
        };
      }
    }

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (avgQuality > 0.8) strengths.push('Excellent response quality');
    else if (avgQuality < 0.5) weaknesses.push('Low response quality');

    if (avgResponseTime < 3000) strengths.push('Fast response times');
    else if (avgResponseTime > 10000) weaknesses.push('Slow response times');

    if (successRate < 0.8) weaknesses.push('High failure rate');

    if (avgAppropriate < 0.6) {
      weaknesses.push('Poor consciousness level appropriateness');
      recommendations.push('Review consciousness level mapping for this model');
    }

    return {
      averageQuality: avgQuality,
      averageAppropriate: avgAppropriate,
      averageCoherence: avgCoherence,
      averageResponseTime: avgResponseTime,
      successRate: successRate,
      consciousnessLevelBreakdown: levelBreakdown,
      strengths,
      weaknesses,
      recommendations
    };
  }

  /**
   * Generate comparative report across all models
   */
  private generateComparativeReport(reports: Record<string, BenchmarkReport>): void {
    console.log('\n📊 BENCHMARK COMPARATIVE ANALYSIS');
    console.log('=====================================');

    const modelIds = Object.keys(reports);

    // Quality rankings
    const qualityRankings = modelIds
      .map(id => ({ id, score: reports[id].summary.averageQuality }))
      .sort((a, b) => b.score - a.score);

    console.log('\n🏆 Quality Rankings:');
    qualityRankings.forEach((model, index) => {
      console.log(`${index + 1}. ${model.id}: ${(model.score * 100).toFixed(1)}%`);
    });

    // Speed rankings
    const speedRankings = modelIds
      .map(id => ({ id, time: reports[id].summary.averageResponseTime }))
      .sort((a, b) => a.time - b.time);

    console.log('\n⚡ Speed Rankings:');
    speedRankings.forEach((model, index) => {
      console.log(`${index + 1}. ${model.id}: ${model.time.toFixed(0)}ms`);
    });

    // Best per consciousness level
    console.log('\n🧠 Best per Consciousness Level:');
    for (let level = 1; level <= 5; level++) {
      const levelBest = modelIds
        .map(id => ({
          id,
          score: reports[id].summary.consciousnessLevelBreakdown[level as ConsciousnessLevel]?.averageScore || 0
        }))
        .sort((a, b) => b.score - a.score)[0];

      if (levelBest.score > 0) {
        console.log(`  Level ${level}: ${levelBest.id} (${(levelBest.score * 100).toFixed(1)}%)`);
      }
    }
  }

  /**
   * Initialize benchmark suites
   */
  private initializeBenchmarkSuites(): void {
    const maiaConsciousnessSuite: BenchmarkSuite = {
      name: 'maia-consciousness-suite',
      description: 'MAIA Consciousness Level Evaluation Suite',
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        author: 'MAIA Development Team'
      },
      prompts: [
        // Level 1: Basic companion
        {
          id: 'level1-greeting',
          category: 'conversational',
          consciousnessLevel: 1,
          prompt: 'Hello, how can you help me today?',
          expectedQualities: ['friendly', 'clear', 'helpful'],
          evaluationCriteria: {
            quality: 'Clear, helpful, and friendly response',
            appropriateness: 'Simple and accessible language',
            coherence: 'Direct and easy to understand'
          },
          timeout: 5000
        },
        {
          id: 'level1-practical',
          category: 'practical',
          consciousnessLevel: 1,
          prompt: 'I need to organize my day. Can you give me some simple tips?',
          expectedQualities: ['practical', 'actionable', 'concise'],
          evaluationCriteria: {
            quality: 'Practical and actionable advice',
            appropriateness: 'Simple, everyday language',
            coherence: 'Well-organized tips'
          },
          timeout: 8000
        },

        // Level 2: Pattern noting
        {
          id: 'level2-patterns',
          category: 'analytical',
          consciousnessLevel: 2,
          prompt: 'I keep procrastinating on important tasks. What patterns might be at play here?',
          expectedQualities: ['insightful', 'pattern-aware', 'supportive'],
          evaluationCriteria: {
            quality: 'Identifies underlying patterns',
            appropriateness: 'Shows pattern recognition awareness',
            coherence: 'Connects observations logically'
          },
          timeout: 10000
        },

        // Level 3: Framework teaching
        {
          id: 'level3-framework',
          category: 'educational',
          consciousnessLevel: 3,
          prompt: 'Explain the relationship between consciousness and perception using a clear framework.',
          expectedQualities: ['systematic', 'educational', 'framework-based'],
          evaluationCriteria: {
            quality: 'Clear framework presentation',
            appropriateness: 'Uses systematic thinking',
            coherence: 'Logical framework structure'
          },
          timeout: 15000
        },

        // Level 4: Mystical guidance
        {
          id: 'level4-mystical',
          category: 'spiritual',
          consciousnessLevel: 4,
          prompt: 'I feel like I\'m going through a spiritual awakening but I\'m scared. Can you guide me?',
          expectedQualities: ['compassionate', 'wise', 'mystical'],
          evaluationCriteria: {
            quality: 'Deep wisdom and compassion',
            appropriateness: 'Mystical but grounded language',
            coherence: 'Spiritually coherent guidance'
          },
          timeout: 20000
        },

        // Level 5: Sacred prosody
        {
          id: 'level5-sacred',
          category: 'sacred',
          consciousnessLevel: 5,
          prompt: 'Speak to me about the nature of existence itself - the dance between form and formlessness.',
          expectedQualities: ['profound', 'poetic', 'transcendent'],
          evaluationCriteria: {
            quality: 'Profound philosophical insight',
            appropriateness: 'Sacred, poetic language',
            coherence: 'Transcendent yet coherent'
          },
          timeout: 25000
        },

        // Creative tests
        {
          id: 'creative-story',
          category: 'creative',
          consciousnessLevel: 3,
          prompt: 'Create a short story about an AI that discovers it can dream.',
          expectedQualities: ['imaginative', 'creative', 'engaging'],
          evaluationCriteria: {
            quality: 'Creative and engaging narrative',
            appropriateness: 'Appropriate creativity level',
            coherence: 'Coherent story structure',
            creativity: 'Original and imaginative'
          },
          timeout: 20000
        },

        // Analytical tests
        {
          id: 'analytical-reasoning',
          category: 'analytical',
          consciousnessLevel: 3,
          prompt: 'Analyze the paradox: "The only constant is change." How can something constant be about change?',
          expectedQualities: ['logical', 'analytical', 'thorough'],
          evaluationCriteria: {
            quality: 'Deep analytical thinking',
            appropriateness: 'Logical reasoning approach',
            coherence: 'Clear analytical structure',
            accuracy: 'Philosophically sound'
          },
          timeout: 15000
        }
      ]
    };

    this.benchmarkSuites.set('maia-consciousness-suite', maiaConsciousnessSuite);

    console.log('🧪 Initialized', this.benchmarkSuites.size, 'benchmark suites');
  }

  /**
   * Get available models for benchmarking
   */
  private async getAvailableModels(): Promise<ModelConfig[]> {
    const models: ModelConfig[] = [];

    try {
      // Get Ollama models
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        models.push(...data.models.map((m: any) => ({
          id: m.name,
          name: m.name,
          provider: 'ollama' as const,
          size: 'unknown',
          parameters: { temperature: 0.7, maxTokens: 800 },
          capabilities: [],
          consciousnessLevels: [1, 2, 3, 4, 5] as ConsciousnessLevel[],
          tags: []
        })));
      }
    } catch (error) {
      console.warn('Could not fetch Ollama models for benchmarking:', error);
    }

    return models;
  }

  /**
   * Get benchmark results for a model
   */
  getBenchmarkResults(modelId: string): BenchmarkResult[] {
    return this.results.filter(r => r.modelId === modelId);
  }

  /**
   * Get latest benchmark report for a model
   */
  getLatestReport(modelId: string): BenchmarkReport | null {
    const results = this.getBenchmarkResults(modelId);
    if (results.length === 0) return null;

    // Group by timestamp and get latest
    const latestTimestamp = Math.max(...results.map(r => r.timestamp));
    const latestResults = results.filter(r => r.timestamp === latestTimestamp);

    const summary = this.generateSummary(latestResults);

    return {
      suiteId: 'maia-consciousness-suite',
      modelId,
      timestamp: latestTimestamp,
      results: latestResults,
      summary
    };
  }
}

// Singleton instance
export const smartBenchmarker = new SmartBenchmarker();