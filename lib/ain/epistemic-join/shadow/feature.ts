/**
 * JARVIS-KP-01 / I4 integration-shadow kill switch.
 *
 * Deliberately default-OFF. Absence, empty string, "true", "yes", and every
 * value other than the literal "1" are OFF. I4 observation authority is not
 * persistence authority and does not activate the I3 persistence flag.
 */
export const EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG =
  'AIN_EPISTEMIC_JOIN_INTEGRATION_SHADOW_ENABLED' as const;

export function epistemicJoinIntegrationShadowEnabled(
  env: Readonly<NodeJS.ProcessEnv> = process.env,
): boolean {
  return env[EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG] === '1';
}
