/** Presentation routing only. The server Constellation layout and APIs authorize. */
export function isConstellationFounderPath(pathname: string | null | undefined): boolean {
  return typeof pathname === 'string' &&
    (pathname === '/founder/constellation' || pathname.startsWith('/founder/constellation/'));
}

export function shouldShowFounderShell(pathname: string | null | undefined, consoleEnabled: boolean): boolean {
  return consoleEnabled || isConstellationFounderPath(pathname);
}
