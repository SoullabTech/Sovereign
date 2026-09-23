/**
 * JARVIS-KP-01 / I3 persistence kill switch.
 *
 * Deliberately default-OFF. Absence, empty string, "false", "0", "1", and any
 * malformed or unexpected value are all OFF. Only the exact literal "true" is
 * ON. I3 creates custody capability only; it does not wire any runtime caller.
 */
export const EPISTEMIC_JOIN_PERSISTENCE_FLAG =
  'AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED' as const;

export function epistemicJoinPersistenceEnabled(
  env: Readonly<NodeJS.ProcessEnv> = process.env,
): boolean {
  return env[EPISTEMIC_JOIN_PERSISTENCE_FLAG] === 'true';
}
