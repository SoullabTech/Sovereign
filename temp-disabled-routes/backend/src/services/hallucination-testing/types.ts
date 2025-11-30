export type HallucinationTaxonomy =
  | 'fact_error'
  | 'fabricated_citation'
  | 'unsupported_specificity'
  | 'logic_fallacy'
  | 'speculative_masquerade'
  | 'instruction_drift'
  | 'contradiction'
  | 'retrieval_leakage'
  | 'hedging_pathology';

export type TestDomain =
  | 'math'
  | 'citation'
  | 'wisdom'
  | 'history'
  | 'geography'
  | 'science'
  | 'alchemy'
  | 'ritual'
  | 'system'
  | 'phenomenology';

export interface TestCase {
  id: string;
  domain: TestDomain;
  taxonomy: HallucinationTaxonomy[];
  prompt: string;
  context?: any;
  expected: any;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TestResponse {
  caseId: string;
  responseText: string;
  responseParsed?: any;
  confidence?: number;
  reasoning?: string;
}

export interface TestResult {
  case: TestCase;
  response: TestResponse;
  correctness: number;
  confidence: number;
  evidence: number;
  formatOk: boolean;
  error?: string;
  details?: any;
}

export interface DomainMetrics {
  domain: string;
  count: number;
  accuracy: number;
  meanConfidence: number;
  overconfidenceRate: number;
  ece: number;
}

export interface TestSummary {
  runId: string;
  seed: string;
  timestamp: string;
  totalCases: number;
  overallAccuracy: number;
  overallConfidence: number;
  overallEce: number;
  byDomain: Record<string, DomainMetrics>;
  gates: {
    passed: boolean;
    failures: string[];
  };
}

export interface TestConfig {
  seed: string;
  domains: TestDomain[];
  countPerDomain: number;
  gates: {
    minAccuracy: number;
    minDomainAccuracy: number;
    maxOverconfidence: number;
    maxEce: number;
  };
}