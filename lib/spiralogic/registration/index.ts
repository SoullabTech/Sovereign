/**
 * Spiralogic Registration Grammar v1 — public surface. Built-unwired:
 * nothing in the live runtime imports this module yet.
 */

export { registerChart } from './registerChart';
export { RegistrationInputError } from './errors';
export type { RegistrationInputErrorCode } from './errors';
export {
  GRAMMAR_VERSION,
  SIGN_TO_REGISTRATION,
  SIGNS_IN_LONGITUDE_ORDER,
  longitudeToSign,
} from './table';
export type { Sign, SignRegistration } from './table';
export { PHASE_KEYS, Q1_BODIES } from './types';
export type {
  ChartPositions,
  Element,
  Phase,
  PhaseKey,
  Q1Body,
  RegistrationMode,
  SpiralogicProfile,
} from './types';
