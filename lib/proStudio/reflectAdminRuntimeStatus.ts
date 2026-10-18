/**
 * Reflect E010 — read-only observation of the responding Next.js reader.
 *
 * This is NOT an operator, release permission, owner identity attestation,
 * edge quarantine, Docker health proof, or evidence of complete revocation.
 * The actual Reflect route reads these same server environment variables.
 * Never include configured member IDs or raw environment values in the output.
 */
export type ReflectReaderMode =
  | 'OFF'
  | 'CONFIGURED_UNVERIFIED'
  | 'HOLD_CONFIG_DRIFT';

export type ReflectReaderObservation = Readonly<{
  mode: ReflectReaderMode;
  oneAccountConfiguration: 'ABSENT' | 'SINGLE_FORMAT_VALID' | 'NOT_VERIFIED';
  observationScope: 'RESPONDING_READER_PROCESS_ONLY';
  operatorAuthority: 'NOT_QUALIFIED';
  emergencyContainment: 'NOT_LIVE_VERIFIED';
  admissionAndRevocation: 'NOT_WITNESSED';
}>;

// Canonical UUID format verifies only syntax, NEVER whose member ID it is.
const CANONICAL_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function observeReflectReader(
  enabledRaw: string | undefined,
  allowlistRaw: string | undefined,
): ReflectReaderObservation {
  let mode: ReflectReaderMode;
  let oneAccountConfiguration: ReflectReaderObservation['oneAccountConfiguration'];

  const allowlistAbsent = allowlistRaw === undefined || allowlistRaw === '';
  if (
    (enabledRaw === undefined || enabledRaw === '' || enabledRaw === 'false')
    && allowlistAbsent
  ) {
    mode = 'OFF';
    oneAccountConfiguration = 'ABSENT';
  } else if (
    enabledRaw === 'true'
    && typeof allowlistRaw === 'string'
    && CANONICAL_UUID.test(allowlistRaw)
  ) {
    // This is ONLY a configuration observation. Neither founder identity nor
    // a successful authenticated HTTP admission has been witnessed here.
    mode = 'CONFIGURED_UNVERIFIED';
    oneAccountConfiguration = 'SINGLE_FORMAT_VALID';
  } else {
    // Includes multi-member allowlists, whitespace, wildcard, invalid/unknown
    // flags and stale member IDs even if the Reflect route would deny access.
    mode = 'HOLD_CONFIG_DRIFT';
    oneAccountConfiguration = 'NOT_VERIFIED';
  }

  return {
    mode,
    oneAccountConfiguration,
    observationScope: 'RESPONDING_READER_PROCESS_ONLY',
    operatorAuthority: 'NOT_QUALIFIED',
    emergencyContainment: 'NOT_LIVE_VERIFIED',
    admissionAndRevocation: 'NOT_WITNESSED',
  };
}

// The cookie session is the first authority to try. A stale localStorage
// token must never hide an otherwise valid founder cookie. Safari clients
// that cannot use the cookie can retry with their established session header.
// Neither request carries the generic Admin Cockpit password.
export async function fetchReflectAdminStatus(
  fetcher: (url: string, init: RequestInit) => Promise<Response>,
  sessionToken: string | null | undefined,
): Promise<Response> {
  const url = '/api/admin/reflect-release-status';
  const cookieFirst: RequestInit = {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-store' },
  };
  const first = await fetcher(url, cookieFirst);
  if ((first.status !== 401 && first.status !== 403) || !sessionToken) {
    return first;
  }
  return fetcher(url, {
    ...cookieFirst,
    headers: {
      'Cache-Control': 'no-store',
      'x-session-token': sessionToken,
    },
  });
}
