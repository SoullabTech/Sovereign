/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T8B — Runtime Surface Authority (tsa-1).
 *
 * A client may name the room it intends to enter. Only server-held standing
 * may make a professional or research teaching surface effective.
 */
import type { TeachingAudience, TeachingContext } from './TeachingContextSourceContract';
import type { TeachingSurfaceRoute } from './TeachingPlatformBindingContract';

export const TEACHING_RUNTIME_SURFACE_AUTHORITY_VERSION = 'tsa-1' as const;

export const SHARED_ROUTE_TEACHING_SURFACES = [
  'general_maia',
  'coaching_practice',
  'therapist_practitioner',
  'research_lab',
] as const;
export type SharedRouteTeachingSurface = (typeof SHARED_ROUTE_TEACHING_SURFACES)[number];

export type TeachingSurfaceDenial =
  | 'active_practitioner_required'
  | 'research_authority_required';

export interface TeachingRuntimeSurfaceAuthorityInput {
  requestedSurface: unknown;
  legacySurface: unknown;
  hasActivePractitioner: boolean;
  serverRoles: readonly string[];
  adminRole: string | null;
}

export interface TeachingRuntimeSurfaceAuthorityRecord {
  contractVersion: typeof TEACHING_RUNTIME_SURFACE_AUTHORITY_VERSION;
  requestedSurface: SharedRouteTeachingSurface;
  surface: SharedRouteTeachingSurface;
  route: Extract<TeachingSurfaceRoute, 'sovereign_maia_list'>;
  context: TeachingContext;
  audience: TeachingAudience;
  standing: 'SERVER_ADJUDICATED_CURRENT_TURN';
  authorityBasis: 'general_member' | 'active_practitioner' | 'research_role';
  deniedRequestedSurface: TeachingSurfaceDenial | null;
  clientIntentIsAuthority: false;
  mayPersistRoleInference: false;
}
const LAW: Readonly<Record<SharedRouteTeachingSurface, {
  context: TeachingContext;
  audience: TeachingAudience;
}>> = {
  general_maia: { context: 'general_maia', audience: 'member' },
  coaching_practice: { context: 'coaching_practice', audience: 'coach' },
  therapist_practitioner: { context: 'therapist_practitioner', audience: 'therapist_practitioner' },
  research_lab: { context: 'research_lab', audience: 'researcher' },
};

function isSharedSurface(value: unknown): value is SharedRouteTeachingSurface {
  return typeof value === 'string'
    && (SHARED_ROUTE_TEACHING_SURFACES as readonly string[]).includes(value);
}

export function requestedTeachingSurface(
  requestedSurface: unknown,
  legacySurface: unknown,
): SharedRouteTeachingSurface {
  if (isSharedSurface(requestedSurface)) return requestedSurface;
  // Existing Studio already declares this intent. It receives no authority
  // unless the server separately proves an active practitioner below.
  if (legacySurface === 'studio') return 'therapist_practitioner';
  return 'general_maia';
}

function general(denial: TeachingSurfaceDenial | null): TeachingRuntimeSurfaceAuthorityRecord {
  return Object.freeze({
    contractVersion: TEACHING_RUNTIME_SURFACE_AUTHORITY_VERSION,
    requestedSurface: denial ? 'general_maia' : 'general_maia',
    surface: 'general_maia',
    route: 'sovereign_maia_list',
    ...LAW.general_maia,
    standing: 'SERVER_ADJUDICATED_CURRENT_TURN',
    authorityBasis: 'general_member',
    deniedRequestedSurface: denial,
    clientIntentIsAuthority: false,
    mayPersistRoleInference: false,
  });
}
export function resolveTeachingRuntimeSurfaceAuthority(
  input: TeachingRuntimeSurfaceAuthorityInput,
): TeachingRuntimeSurfaceAuthorityRecord {
  const requested = requestedTeachingSurface(input.requestedSurface, input.legacySurface);

  if (requested === 'general_maia') return general(null);

  if (requested === 'coaching_practice' || requested === 'therapist_practitioner') {
    if (!input.hasActivePractitioner) {
      return Object.freeze({
        ...general('active_practitioner_required'),
        requestedSurface: requested,
      });
    }
    return Object.freeze({
      contractVersion: TEACHING_RUNTIME_SURFACE_AUTHORITY_VERSION,
      requestedSurface: requested,
      surface: requested,
      route: 'sovereign_maia_list',
      ...LAW[requested],
      standing: 'SERVER_ADJUDICATED_CURRENT_TURN',
      authorityBasis: 'active_practitioner',
      deniedRequestedSurface: null,
      clientIntentIsAuthority: false,
      mayPersistRoleInference: false,
    });
  }

  const researchAuthorized =
    input.serverRoles.includes('researcher')
    || input.adminRole === 'founder'
    || input.adminRole === 'cto';

  if (!researchAuthorized) {
    return Object.freeze({
      ...general('research_authority_required'),
      requestedSurface: requested,
    });
  }

  return Object.freeze({
    contractVersion: TEACHING_RUNTIME_SURFACE_AUTHORITY_VERSION,
    requestedSurface: 'research_lab',
    surface: 'research_lab',
    route: 'sovereign_maia_list',
    ...LAW.research_lab,
    standing: 'SERVER_ADJUDICATED_CURRENT_TURN',
    authorityBasis: 'research_role',
    deniedRequestedSurface: null,
    clientIntentIsAuthority: false,
    mayPersistRoleInference: false,
  });
}
