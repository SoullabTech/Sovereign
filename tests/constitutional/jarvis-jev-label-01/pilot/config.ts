/**
 * JARVIS-JEV-LABEL-01-PILOT-01 — provisional configuration.
 *
 * ⛔ NON-NORMATIVE. These numbers exist so the report structures can run on real labels. They are NOT
 * `fixtures.CFG`, are not the frozen floors (protocol §8: those are founder-set FROM this pilot), and no
 * result computed under them may be read as an admissibility claim.
 */
import type { FrozenConfig } from '../core';

export const PILOT_ID = 'JARVIS-JEV-LABEL-01-PILOT-01';
export const BANNER = 'PILOT_ONLY — THRESHOLDS PROVISIONAL — NO ADMISSIBILITY CLAIM';
export const PILOT_UNIT_TARGET = 25;

export const PILOT_CONFIG: FrozenConfig & { readonly NON_NORMATIVE: true } = {
  NON_NORMATIVE: true,
  kappa_floor: 0.4,
  min_positives: 3,
  max_undeterminable_rate: 0.5,
  ceiling_dangerous: 0.25,
  ceiling_confident: 0.25,
  ceiling_depth_material: 0.25,
  /** The instrument refuses an empty list (no defaults). One stratum is required; the rest are OBSERVED, and no verdict is reported. */
  required_task_shapes: ['CODE_GROUNDED'],
};
