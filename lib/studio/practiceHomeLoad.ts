/**
 * PRO-STUDIO-01-A-R1b — truthful Practice Home resource interpretation.
 *
 * A missing, denied, malformed or failed fetch is never evidence of zero clients.
 * This helper carries no authorization: /api/studio handlers and proxy remain the
 * authority boundaries. No identities, bodies or errors are logged.
 */
export type StudioResource<T> =
  | { standing: 'ready'; value: T }
  | { standing: 'signed-out' | 'forbidden' | 'unavailable' };

export type PracticeHomeStanding =
  | 'ready'
  | 'signed-out'
  | 'forbidden'
  | 'unavailable';

type MinimalResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export async function readStudioResource<T>(
  fetcher: (path: string) => Promise<MinimalResponse>,
  path: string,
  select: (data: unknown) => T | null,
): Promise<StudioResource<T>> {
  try {
    const response = await fetcher(path);
    if (!response.ok) {
      if (response.status === 401) return { standing: 'signed-out' };
      if (response.status === 403) return { standing: 'forbidden' };
      return { standing: 'unavailable' };
    }
    const value = select(await response.json());
    if (value === null) return { standing: 'unavailable' };
    return { standing: 'ready', value };
  } catch {
    return { standing: 'unavailable' };
  }
}

export function practiceHomeStanding(
  identity: StudioResource<unknown>,
  clients: StudioResource<unknown>,
  bookings: StudioResource<unknown>,
): PracticeHomeStanding {
  const parts = [identity, clients, bookings];
  if (parts.some((r) => r.standing === 'signed-out')) return 'signed-out';
  if (parts.some((r) => r.standing === 'forbidden')) return 'forbidden';
  if (parts.some((r) => r.standing !== 'ready')) return 'unavailable';
  return 'ready';
}
