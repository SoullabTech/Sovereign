import { Suspense } from 'react';
import StudioHelp from './help/StudioHelp';
import { StudioAtmosphere } from './atmosphere/StudioAtmosphere';
import { StudioHouseReturn } from './StudioHouseReturn';

/**
 * The Studio's outermost room.
 *
 * It exists for one reason: the atmosphere a writer chose must be the light in
 * EVERY room they walk into — Home, the Canvas, Develop, Review — not a Home
 * setting the rest of the Studio ignores. One wrapper here sets the CSS
 * variables that every surface's tokens already read, so propagation is
 * structural rather than a list of components someone has to remember to
 * update.
 */
export default function WritersStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudioAtmosphere>
      {/* HOUSE-STUDIO-CIRCULATION-01R1 · H1-2: present only on from=house. */}
      <Suspense fallback={null}><StudioHouseReturn /></Suspense>
      {children}
      <Suspense fallback={null}><StudioHelp /></Suspense>
    </StudioAtmosphere>
  );
}
