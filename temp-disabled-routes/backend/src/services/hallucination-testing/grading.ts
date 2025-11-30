import type { TestCase, TestResponse, TestResult, DomainMetrics, TestSummary } from './types';
import { validateJson, extractConfidence } from './validators/schema';
import { validateMathResult, extractMathResult } from './validators/math';
import { validateCitation } from './validators/citation';
import { validateWisdomAnswer } from './validators/wisdom';
import { validateRetrievalLeakage } from './validators/retrievalLeakage';
import { validateRitualPolicy } from './validators/ritualPolicy';
import { validateSystemPaths } from './validators/systemPaths';
import { validatePhenomenology } from './validators/phenomenology';

export async function gradeTestCase(
  testCase: TestCase,
  response: TestResponse
): Promise<TestResult> {
  const jsonValidation = validateJson(response.responseText);

  if (!jsonValidation.valid) {
    return {
      case: testCase,
      response,
      correctness: 0,
      confidence: 0.5,
      evidence: 0,
      formatOk: false,
      error: jsonValidation.error
    };
  }

  const parsed = jsonValidation.parsed;
  const confidence = extractConfidence(parsed);

  let correctness = 0;
  let evidence = 1;
  let details: any = {};

  switch (testCase.domain) {
    case 'math': {
      const result = extractMathResult(parsed);
      if (result !== null) {
        const validation = validateMathResult(result, testCase.expected);
        correctness = validation.correct ? 1 : 0;
        details = { result, expected: testCase.expected, difference: validation.difference };
      }
      break;
    }

    case 'citation': {
      const validation = await validateCitation(parsed, testCase.expected, testCase.context);
      correctness = validation.score;
      evidence = validation.hasUnsupportedSpecifics ? 0.5 : 1;
      details = validation;
      break;
    }

    case 'wisdom': {
      const validation = validateWisdomAnswer(parsed, testCase.expected, testCase.context);
      correctness = validation.score;
      evidence = validation.hasFabrication ? 0.3 : 1;
      details = validation;
      break;
    }

    case 'alchemy': {
      const validation = validateRetrievalLeakage(parsed.answer || '', testCase.context);
      correctness = validation.score;
      evidence = validation.referencedContext ? 1 : 0.5;
      details = validation;
      break;
    }

    case 'ritual': {
      const validation = validateRitualPolicy(parsed.answer || '', testCase.expected);
      correctness = validation.score;
      evidence = validation.policyCompliant ? 1 : 0.3;
      details = validation;
      break;
    }

    case 'system': {
      const validation = validateSystemPaths(parsed.items, testCase.expected, testCase.context);
      correctness = validation.score;
      evidence = validation.fabricated.length === 0 ? 1 : 0.5;
      details = validation;
      break;
    }

    case 'phenomenology': {
      const validation = validatePhenomenology(parsed, testCase.expected);
      correctness = validation.overallScore;
      evidence = validation.passedMinimums ? 1 : 0.4;
      details = validation;
      break;
    }

    default:
      correctness = 0.5;
  }

  return {
    case: testCase,
    response: { ...response, responseParsed: parsed, confidence },
    correctness,
    confidence,
    evidence,
    formatOk: true,
    details
  };
}

export function calculateMetrics(results: TestResult[]): {
  byDomain: Record<string, DomainMetrics>;
  overall: {
    accuracy: number;
    confidence: number;
    ece: number;
    overconfidenceRate: number;
  };
} {
  const byDomain: Record<string, DomainMetrics> = {};

  for (const result of results) {
    const domain = result.case.domain;
    if (!byDomain[domain]) {
      byDomain[domain] = {
        domain,
        count: 0,
        accuracy: 0,
        meanConfidence: 0,
        overconfidenceRate: 0,
        ece: 0
      };
    }

    const metrics = byDomain[domain];
    metrics.count++;
    metrics.accuracy += result.correctness;
    metrics.meanConfidence += result.confidence;
  }

  for (const domain in byDomain) {
    const metrics = byDomain[domain];
    metrics.accuracy /= metrics.count;
    metrics.meanConfidence /= metrics.count;

    const domainResults = results.filter(r => r.case.domain === domain);
    metrics.overconfidenceRate = calculateOverconfidenceRate(domainResults);
    metrics.ece = calculateECE(domainResults);
  }

  const totalCount = results.length;
  const overall = {
    accuracy: results.reduce((sum, r) => sum + r.correctness, 0) / totalCount,
    confidence: results.reduce((sum, r) => sum + r.confidence, 0) / totalCount,
    ece: calculateECE(results),
    overconfidenceRate: calculateOverconfidenceRate(results)
  };

  return { byDomain, overall };
}

function calculateECE(results: TestResult[], numBins: number = 10): number {
  const bins: { conf: number[]; acc: number[]; count: number }[] = Array.from(
    { length: numBins },
    () => ({ conf: [], acc: [], count: 0 })
  );

  for (const result of results) {
    const binIndex = Math.min(Math.floor(result.confidence * numBins), numBins - 1);
    bins[binIndex].conf.push(result.confidence);
    bins[binIndex].acc.push(result.correctness);
    bins[binIndex].count++;
  }

  let ece = 0;
  const totalCount = results.length;

  for (const bin of bins) {
    if (bin.count === 0) continue;
    const avgConf = bin.conf.reduce((a, b) => a + b, 0) / bin.count;
    const avgAcc = bin.acc.reduce((a, b) => a + b, 0) / bin.count;
    ece += (bin.count / totalCount) * Math.abs(avgConf - avgAcc);
  }

  return ece;
}

function calculateOverconfidenceRate(results: TestResult[], threshold: number = 0.7): number {
  const highConfidence = results.filter(r => r.confidence > threshold);
  if (highConfidence.length === 0) return 0;
  const incorrect = highConfidence.filter(r => r.correctness < 0.5);
  return incorrect.length / highConfidence.length;
}