import { StudioAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';

/**
 * The Manuscript Room lives under /press, outside the Studio's own route tree,
 * but it is the same room to the writer. Without this wrapper a member who
 * chose Midnight would walk out of their Studio and into Atelier — the light
 * changing because of a URL prefix they never think about.
 *
 * The same provider, deliberately: one authority for the choice, not a second
 * copy that could disagree with it.
 */
export default function ManuscriptRoomLayout({ children }: { children: React.ReactNode }) {
  return <StudioAtmosphere>{children}</StudioAtmosphere>;
}
