/**
 * Writer's Studio restricted-beta admission, separate from product subscriptions.
 * A user-controlled query parameter, role or tier never grants this gate.
 * Only turn it on for the exact beta release candidate.
 */
export const WRITERS_STUDIO_RESTRICTED_BETA_ENV = 'WRITERS_STUDIO_RESTRICTED_BETA' as const;

export function restrictedBetaEnabled(value: string | undefined): boolean {
  return value === 'true';
}

/**
 * Cover the member-facing Studio and its dedicated APIs, including deep links.
 * Discovery and case-study material are not an interactive writing room.
 * Do not gate shared /api/sovereign/manuscripts: other platform rooms use it.
 */
export function isWriterStudioDevPreviewPath(pathname: string): boolean {
  return pathname.startsWith('/dev/writers-studio-');
}

export function mayEnterRestrictedWriterStudioPath(
  pathname: string,
  access: { eligible: boolean; basis: 'active_beta_tester' | 'founder_witness' | 'not_in_pilot' },
): boolean {
  if (!access.eligible) return false;
  // Preview labs have no beta-cohort authority: founder/CTO review only.
  return !isWriterStudioDevPreviewPath(pathname) || access.basis === 'founder_witness';
}

export function isRestrictedWriterStudioPath(pathname: string): boolean {
  if (
    pathname === '/writers-studio/beta-limited' ||
    pathname === '/writers-studio/discover' ||
    pathname.startsWith('/writers-studio/discover/') ||
    pathname === '/writers-studio/case-studies' ||
    pathname.startsWith('/writers-studio/case-studies/')
  ) return false;

  return isWriterStudioDevPreviewPath(pathname)
    || pathname === '/writers-studio'
    || pathname.startsWith('/writers-studio/')
    || pathname === '/api/writers-studio'
    || pathname.startsWith('/api/writers-studio/');
}
