/**
 * STUDIO-GATE-01 — where a signed-out visitor to a Studio route is sent.
 *
 * The Studio layout used to redirect to a bare `/signin` whenever the browser had
 * no member id in localStorage. localStorage is a per-device cache that is lost
 * on resets, so a member with a perfectly valid cookie session was bounced to
 * sign-in, which saw them already authenticated and forwarded them to /home —
 * "Back to Studio" landed on Home. Identity is the server's to decide
 * (`/api/studio/whoami`, cookie-derived, 401 when signed out); this only says
 * where to go once the SERVER has said so, and carries the route so the member
 * returns to where they were headed.
 */
export function studioSignInRedirect(pathname: string | null | undefined): string {
  // usePathname() is typed `string | null`; a missing path falls back to the Studio root.
  const path = pathname ?? '';
  const safe = path.startsWith('/studio') && !path.startsWith('//') ? path : '/studio';
  return `/signin?next=${encodeURIComponent(safe)}`;
}
