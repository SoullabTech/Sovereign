import { StudioAtmosphere } from './atmosphere/StudioAtmosphere';

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
  return <StudioAtmosphere>{children}</StudioAtmosphere>;
}
