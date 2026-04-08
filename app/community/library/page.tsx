/**
 * Community Library — legacy path.
 *
 * Canonical URL is /maia/community/library, which lives inside the MAIA
 * boundary shell (MaiaBoundaryLayout) so the left rail persists on direct
 * load. This file exists only to forward any old links / bookmarks to the
 * canonical route. Do not render content here.
 *
 * NOTE: force-dynamic is required. Without it, Next.js prerenders this route
 * at build time and generates a static HTML file instead of honoring the
 * permanentRedirect() call — resulting in a 200 HTML response instead of a
 * real 308 redirect. Forcing dynamic ensures the redirect fires at request
 * time and returns a proper 308 Location header.
 *
 * Web-only: this path is not in any Capacitor iOS allowlist, so
 * force-dynamic has no impact on the mobile build.
 */

export const dynamic = 'force-dynamic';

import { permanentRedirect } from 'next/navigation';

export default function CommunityLibraryLegacyRedirect() {
  permanentRedirect('/maia/community/library');
}
