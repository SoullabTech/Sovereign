/**
 * runtime/utils/validationMetricsCollector.ts
 * ---------------------------------------------------------
 * Stage 5 Runtime Consciousness Kernel — Validation Metrics Serializer
 *
 * Purpose:
 *   Provides a standardized interface for collecting, calculating, and
 *   persisting metrics from kernel validation test runs.
 *
 * Workflow:
 *   1. Imported into kernel_validation.test.ts
 *   2. Collects timing + coherence data for each sample
 *   3. Aggregates into ValidationSummary
 *   4. Writes structured JSON to runtime/tests/kernel_validation_output.json
 *
 * Author: MAIA Systems
 * Date: 2025-12-20
 */

import fs from "fs";
import path from "path";

export interface SampleMetric {
  id: string;
  ingestion: number;
  reflection: number;
  expression: number;
  total: number;
  coherenceExpected: number;
  coherenceMeasured: number;
}

export interface ValidationSummary {
  samples: SampleMetric[];
  schemaIntegrity: boolean;
  stateContinuity: boolean;
  newErrors: number;
}

/**
 * ValidationMetricsCollector
 * --------------------------
 * Handles per-sample timing + coherence tracking, aggregation,
 * and structured persistence.
 */
export class ValidationMetricsCollector {
  private startTimes: Record<string, number> = {};
  private samples: SampleMetric[] = [];
  private filePath: string;
  private schemaIntegrity = true;
  private stateContinuity = true;
  private newErrors = 0;

  constructor(outputPath = "runtime/tests/kernel_validation_output.json") {
    this.filePath = path.resolve(outputPath);
  }

  /** Marks the start of a phase (ingestion, reflection, expression) */
  startPhase(phase: string) {
    this.startTimes[phase] = performance.now();
  }

  /** Marks the end of a phase and returns its duration */
  endPhase(phase: string): number {
    if (!this.startTimes[phase]) return 0;
    const duration = performance.now() - this.startTimes[phase];
    delete this.startTimes[phase];
    return duration;
  }

  /**
   * Records a full sample metric
   * @param id - sample identifier
   * @param ingestion - ms duration for ingestion phase
   * @param reflection - ms duration for reflection phase
   * @param expression - ms duration for expression phase
   * @param coherenceExpected - expected semantic coherence
   * @param coherenceMeasured - measured semantic coherence
   */
  recordSample(
    id: string,
    ingestion: number,
    reflection: number,
    expression: number,
    coherenceExpected: number,
    coherenceMeasured: number
  ) {
    const total = ingestion + reflection + expression;
    this.samples.push({
      id,
      ingestion,
      reflection,
      expression,
      total,
      coherenceExpected,
      coherenceMeasured,
    });
  }

  /** Update global integrity flags */
  setIntegrity(schema: boolean, state: boolean) {
    this.schemaIntegrity = schema;
    this.stateContinuity = state;
  }

  /** Register any new type or runtime errors encountered */
  addErrorCount(count: number) {
    this.newErrors += count;
  }

  /** Returns current summary */
  getSummary(): ValidationSummary {
    return {
      samples: this.samples,
      schemaIntegrity: this.schemaIntegrity,
      stateContinuity: this.stateContinuity,
      newErrors: this.newErrors,
    };
  }

  /** Persist summary to JSON file */
  writeSummary(): void {
    const summary = this.getSummary();
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(summary, null, 2));
    console.log(`🧠 Stage 5 metrics written → ${this.filePath}`);
  }

  /** Utility: clear previous run file */
  static clearFile(outputPath = "runtime/tests/kernel_validation_output.json") {
    const full = path.resolve(outputPath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
}

/**
 * Example usage inside kernel_validation.test.ts
 *
 * ```typescript
 * import { ValidationMetricsCollector } from "../utils/validationMetricsCollector";
 *
 * const collector = new ValidationMetricsCollector();
 *
 * test("kernel validation - sample 1", async () => {
 *   collector.startPhase("ingestion");
 *   await simulateIngestion();
 *   const ingestion = collector.endPhase("ingestion");
 *
 *   collector.startPhase("reflection");
 *   await simulateReflection();
 *   const reflection = collector.endPhase("reflection");
 *
 *   collector.startPhase("expression");
 *   await simulateExpression();
 *   const expression = collector.endPhase("expression");
 *
 *   const expectedR = 0.8;
 *   const measuredR = computeCoherence();
 *   collector.recordSample("sample-01", ingestion, reflection, expression, expectedR, measuredR);
 * });
 *
 * afterAll(() => {
 *   collector.setIntegrity(true, true);
 *   collector.writeSummary();
 * });
 * ```
 */
