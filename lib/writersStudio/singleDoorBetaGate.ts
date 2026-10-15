/**
 * Beta-only public entrance. This is deliberately much narrower than the
 * normal Soullab access matrix: no anonymous public demos, upload endpoints,
 * email-code enrollment, OAuth callbacks, or extension-shaped API bypasses.
 * Installed production never enables WRITERS_STUDIO_BETA_SINGLE_DOOR.
 */
export function isSingleDoorBetaEnabled(restricted: string | undefined, door: string | undefined): boolean {
  return restricted === 'true' && door === 'true';
}

export function isSingleDoorPublicAsset(pathname: string): boolean {
  return pathname === '/favicon.ico'
    || pathname === '/apple-touch-icon.png'
    || pathname === '/manifest.webmanifest'
    || pathname.startsWith('/_next/')
    || pathname.startsWith('/assets/')
    || pathname.startsWith('/images/')
    || pathname.startsWith('/fonts/')
    || pathname.startsWith('/icons/');
}

/** Only three anonymous operations: render the door, try a password, sign out. */
export function isSingleDoorBootstrap(pathname: string, method: string): boolean {
  if ((method === 'GET' || method === 'HEAD') &&
      (pathname === '/signin' || pathname === '/writers-studio/beta-limited')) return true;
  return method === 'POST' &&
    (pathname === '/api/members/signin' || pathname === '/api/members/signout');
}
