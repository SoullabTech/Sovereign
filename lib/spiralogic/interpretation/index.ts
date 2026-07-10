/**
 * Spiralogic Interpretation Layer — public surface.
 *
 * The single versioned dominance rule (the C-fence): all renderers consume
 * `interpretDominance`; no renderer computes its own dominance.
 */

export { interpretDominance, CLEAR_LEAD } from './interpretDominance';
export {
  chartPositionsFromSignDegrees,
  ChartAdapterError,
} from './fromBirthChart';
export type { SignDegreeChart, SignDegreePosition } from './fromBirthChart';
export {
  BALANCED_PRACTICE_LINE,
  dominanceLabel,
  dominanceSentence,
} from './phrasing';
export { INTERPRETATION_VERSION } from './types';
export type {
  DominanceGrade,
  DominanceVerdict,
  InterpretationVersion,
} from './types';
