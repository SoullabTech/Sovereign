/**
 * Promoted 2026-06-03 → canonical home is lib/sovereign/stanceDetector.ts.
 * This file re-exports it so the experiment harnesses (fix-test, rescore-v4, validate-detector,
 * predictor-ablation) keep working unchanged. Edit the detector in lib/, not here.
 */
export * from '../../lib/sovereign/stanceDetector';
