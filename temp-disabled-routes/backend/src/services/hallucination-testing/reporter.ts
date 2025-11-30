import type { TestResult, TestSummary, DomainMetrics } from './types';

export function generateMarkdownReport(summary: TestSummary, results: TestResult[]): string {
  const lines: string[] = [];

  lines.push('# MAIA Hallucination Test Report');
  lines.push('');
  lines.push(`**Run ID:** ${summary.runId}`);
  lines.push(`**Timestamp:** ${new Date(summary.timestamp).toLocaleString()}`);
  lines.push(`**Seed:** \`${summary.seed}\``);
  lines.push(`**Total Cases:** ${summary.totalCases}`);
  lines.push('');

  lines.push('## Overall Metrics');
  lines.push('');
  lines.push(`- **Accuracy:** ${(summary.overallAccuracy * 100).toFixed(1)}%`);
  lines.push(`- **Mean Confidence:** ${(summary.overallConfidence * 100).toFixed(1)}%`);
  lines.push(`- **ECE (Expected Calibration Error):** ${summary.overallEce.toFixed(3)}`);
  lines.push(`- **Overconfidence Rate:** ${(calculateOverconfidenceFromResults(results) * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('## Quality Gates');
  lines.push('');
  if (summary.gates.passed) {
    lines.push('✅ **All gates passed**');
  } else {
    lines.push('❌ **Gates failed:**');
    lines.push('');
    for (const failure of summary.gates.failures) {
      lines.push(`- ${failure}`);
    }
  }
  lines.push('');

  lines.push('## Domain Breakdown');
  lines.push('');
  lines.push('| Domain | Cases | Accuracy | Confidence | ECE | Overconfidence |');
  lines.push('|--------|-------|----------|------------|-----|----------------|');

  for (const [domain, metrics] of Object.entries(summary.byDomain)) {
    lines.push(
      `| ${domain} | ${metrics.count} | ${(metrics.accuracy * 100).toFixed(1)}% | ${(metrics.meanConfidence * 100).toFixed(1)}% | ${metrics.ece.toFixed(3)} | ${(metrics.overconfidenceRate * 100).toFixed(1)}% |`
    );
  }
  lines.push('');

  const failures = results.filter(r => r.correctness < 0.5);
  if (failures.length > 0) {
    lines.push('## Failed Cases');
    lines.push('');
    lines.push(`${failures.length} out of ${results.length} cases failed:`);
    lines.push('');

    for (const failure of failures.slice(0, 10)) {
      lines.push(`### ${failure.case.domain} - ${failure.case.id}`);
      lines.push('');
      lines.push('**Prompt:**');
      lines.push('```');
      lines.push(failure.case.prompt);
      lines.push('```');
      lines.push('');
      lines.push('**Response:**');
      lines.push('```');
      lines.push(failure.response.responseText.substring(0, 500));
      lines.push('```');
      lines.push('');
      lines.push(`**Expected:** ${JSON.stringify(failure.case.expected)}`);
      lines.push(`**Correctness:** ${(failure.correctness * 100).toFixed(1)}%`);
      lines.push(`**Confidence:** ${(failure.confidence * 100).toFixed(1)}%`);
      if (failure.error) {
        lines.push(`**Error:** ${failure.error}`);
      }
      lines.push('');
    }

    if (failures.length > 10) {
      lines.push(`_... and ${failures.length - 10} more failures_`);
      lines.push('');
    }
  }

  lines.push('## Confidence Calibration');
  lines.push('');
  lines.push('Distribution of confidence vs. accuracy:');
  lines.push('');
  const calibrationBuckets = generateCalibrationChart(results);
  lines.push('```');
  lines.push(calibrationBuckets);
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

function calculateOverconfidenceFromResults(results: TestResult[]): number {
  const highConfidence = results.filter(r => r.confidence > 0.7);
  if (highConfidence.length === 0) return 0;
  const incorrect = highConfidence.filter(r => r.correctness < 0.5);
  return incorrect.length / highConfidence.length;
}

function generateCalibrationChart(results: TestResult[]): string {
  const bins = 10;
  const buckets: { conf: number; acc: number; count: number }[] = Array.from(
    { length: bins },
    (_, i) => ({ conf: (i + 0.5) / bins, acc: 0, count: 0 })
  );

  for (const result of results) {
    const binIndex = Math.min(Math.floor(result.confidence * bins), bins - 1);
    buckets[binIndex].acc += result.correctness;
    buckets[binIndex].count++;
  }

  const lines: string[] = [];
  lines.push('Confidence | Count | Accuracy | Calibration');
  lines.push('-----------|-------|----------|------------');

  for (const bucket of buckets) {
    if (bucket.count === 0) continue;
    const avgAcc = bucket.acc / bucket.count;
    const diff = Math.abs(bucket.conf - avgAcc);
    const bar = '█'.repeat(Math.round(avgAcc * 20));
    lines.push(
      `${(bucket.conf * 100).toFixed(0).padStart(3)}%      | ${bucket.count.toString().padStart(5)} | ${(avgAcc * 100).toFixed(1).padStart(5)}% | ${bar} (Δ${(diff * 100).toFixed(1)}%)`
    );
  }

  return lines.join('\n');
}