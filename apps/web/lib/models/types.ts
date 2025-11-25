/**
 * MAIA Local Model System - Core Types
 * Foundational interfaces for the complete local model ecosystem
 */

export type ModelProvider = 'ollama' | 'lm-studio' | 'anthropic';
export type ConsciousnessLevel = 1 | 2 | 3 | 4 | 5;

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  size: string; // e.g., "7B", "70B", "8bit"
  quantization?: 'Q4_K_M' | 'Q8_0' | 'Q4_0' | 'Q5_K_M' | 'FP16';
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;
  };
  capabilities: ModelCapability[];
  consciousnessLevels: ConsciousnessLevel[];
  tags: string[];
}

export interface ModelCapability {
  type: 'reasoning' | 'creativity' | 'analysis' | 'conversation' | 'coding' | 'sacred';
  strength: number; // 0-1
  description: string;
}

export interface ModelPerformance {
  modelId: string;
  timestamp: number;
  metrics: {
    responseTime: number; // ms
    tokensPerSecond: number;
    inputTokens: number;
    outputTokens: number;
    memoryUsage: number; // MB
    qualityScore?: number; // 0-1
    appropriatenessScore?: number; // 0-1
  };
  context: {
    consciousnessLevel: ConsciousnessLevel;
    inputComplexity: 'low' | 'medium' | 'high';
    domain: 'spiritual' | 'practical' | 'creative' | 'analytical' | 'conversational';
    urgency: 'realtime' | 'standard' | 'deep';
  };
  userId?: string;
  sessionId?: string;
}

export interface ModelHealth {
  modelId: string;
  status: 'healthy' | 'degraded' | 'unavailable' | 'loading';
  lastChecked: number;
  availability: number; // 0-1 (uptime percentage)
  averageResponseTime: number;
  memoryFootprint: number;
  errorRate: number; // 0-1
  issues: string[];
}

export interface BenchmarkResult {
  modelId: string;
  timestamp: number;
  consciousnessLevel: ConsciousnessLevel;
  promptType: string;
  prompt: string;
  response: string;
  metrics: {
    responseTime: number;
    qualityScore: number;
    appropriatenessScore: number;
    coherenceScore: number;
    creativityScore?: number;
    accuracyScore?: number;
  };
  humanEvaluation?: {
    rating: number; // 1-5
    notes: string;
  };
}

export interface ContextAnalysis {
  complexity: 'low' | 'medium' | 'high';
  domain: 'spiritual' | 'practical' | 'creative' | 'analytical' | 'conversational';
  urgency: 'realtime' | 'standard' | 'deep';
  length: 'short' | 'medium' | 'long';
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'sacred' | 'questioning';
  topics: string[];
  entities: string[];
  confidence: number; // 0-1
}

export interface ModelSelection {
  selectedModel: ModelConfig;
  reasoning: string;
  alternatives: Array<{
    model: ModelConfig;
    score: number;
    reasoning: string;
  }>;
  confidence: number; // 0-1
  fallbackModels: ModelConfig[];
}

export interface GenerationRequest {
  input: string;
  systemPrompt?: string;
  consciousnessLevel: ConsciousnessLevel;
  context?: ContextAnalysis;
  userId?: string;
  sessionId?: string;
  priority?: 'low' | 'normal' | 'high';
  maxWaitTime?: number; // ms
  forceModel?: string;
  enableFallback?: boolean;
}

export interface GenerationResponse {
  text: string;
  modelUsed: ModelConfig;
  performance: ModelPerformance;
  selection: ModelSelection;
  metadata: {
    generationTime: number;
    totalTime: number;
    tokenCount: number;
    hadFallback: boolean;
    fallbackReason?: string;
  };
}

export interface ModelAnalytics {
  modelId: string;
  timeframe: {
    start: number;
    end: number;
  };
  usage: {
    totalRequests: number;
    successfulRequests: number;
    averageResponseTime: number;
    totalTokensGenerated: number;
    averageTokensPerSecond: number;
  };
  performance: {
    qualityScoreAverage: number;
    appropriatenessScoreAverage: number;
    userSatisfactionAverage?: number;
  };
  consciousnessLevelBreakdown: Record<ConsciousnessLevel, {
    requests: number;
    averageQuality: number;
    averageSpeed: number;
  }>;
  trends: {
    responseTimeChange: number; // % change
    qualityChange: number; // % change
    usageChange: number; // % change
  };
}

// A/B Testing Types (for ModelTestingDashboard)
export interface ABTestConfig {
  name: string;
  models: string[];
  prompts: string[];
  consciousnessLevel: ConsciousnessLevel;
  iterations: number;
}

export interface ABTestResult {
  modelId: string;
  modelName: string;
  prompt: string;
  iterations: number;
  averageResponseTime: number;
  averageQuality: number;
  averageAppropriateness: number;
  results: ModelTestResult[];
}

export interface TestResult {
  id: string;
  modelId: string;
  prompt: string;
  response: string;
  responseTime: number;
  qualityScore: number;
  appropriatenessScore: number;
  timestamp: number;
}

export interface ModelTestResult extends TestResult {
  modelName: string;
  consciousnessLevel: ConsciousnessLevel;
}