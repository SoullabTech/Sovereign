/**
 * Community Library — legacy path.
 *
 * Canonical URL is /maia/community/library, which lives inside the MAIA
 * boundary shell (MaiaBoundaryLayout) so the left rail persists on direct
 * load. This file exists only to forward any old links / bookmarks to the
 * canonical route. Do not render content here.
 */

import { permanentRedirect } from 'next/navigation';

export default function CommunityLibraryLegacyRedirect() {
  permanentRedirect('/maia/community/library');
}
