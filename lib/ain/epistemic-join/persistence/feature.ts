/**
 * JARVIS-KP-01 / I3 persistence kill switch.
 *
 * Deliberately default-OFF. Absence, empty string, "true", and any value other
 * than the literal "1" are all OFF. I3 creates custody capability only; it does
 * not wire any runtime caller that could turn this on.
 */
export const EPISTEMIC_JOIN_PERSISTENCE_FLAG =
  'AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED' as const;

export function epistemicJoinPersistenceEnabled(
  env: Readonly<NodeJS.ProcessEnv> = process.env,
): boolean {
  return env[EPISTEMIC_JOIN_PERSISTENCE_FLAG] === '1';
}
