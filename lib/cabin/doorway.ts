export const CABIN_DOORWAY_ROUTES = {
  work: '/writers-studio',
  relationship: '/relationships',
  memory: '/maia/anchor/history',
  maia: '/maia/anchor',
} as const;

export type CabinDoorway = keyof typeof CABIN_DOORWAY_ROUTES;

export const CABIN_ORIGIN = 'cabin' as const;
export const CABIN_ORIGIN_PARAM = 'from' as const;
export const CABIN_RETURN_PATH = '/cabin' as const;

export function cabinReturnPath(): string {
  return CABIN_RETURN_PATH;
}

const FORBIDDEN_CARRY_KEYS = new Set([
  'workId',
  'manuscriptId',
  'relationshipId',
  'memoryId',
  'memberId',
  'sessionId',
  'prompt',
  'meaning',
  'interpretation',
]);

function assertInternalPath(route: string): void {
  if (!route.startsWith('/') || route.startsWith('//')) {
    throw new Error('CABIN_DOORWAY_ROUTE_MUST_BE_INTERNAL');
  }
}

export function cabinDoorwayPath(doorway: CabinDoorway): string {
  const route = CABIN_DOORWAY_ROUTES[doorway];
  assertInternalPath(route);

  const url = new URL(route, 'https://cabin.invalid');
  url.search = '';
  url.searchParams.set(CABIN_ORIGIN_PARAM, CABIN_ORIGIN);

  return url.pathname + url.search;
}

type CabinSearchParams = Pick<URLSearchParams, 'get' | 'keys'>;

export function isCabinOrigin(searchParams: CabinSearchParams | null | undefined): boolean {
  return searchParams?.get(CABIN_ORIGIN_PARAM) === CABIN_ORIGIN;
}

export function hasForbiddenCabinCarry(searchParams: CabinSearchParams): boolean {
  for (const key of searchParams.keys()) {
    if (FORBIDDEN_CARRY_KEYS.has(key)) return true;
  }
  return false;
}
