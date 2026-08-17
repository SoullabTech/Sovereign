import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public Soullab Studio landing — named section card. (The gated /studio app
// keeps its PRIVATE-GENERIC card; this is the public face.)
// The card renders from a constant SECTIONS entry — no request data — so it is
// genuinely static. Declaring it lets the Capacitor build (output: 'export')
// prerender the image instead of failing to collect page data for this route.
export const dynamic = 'force-static';
export const alt = SECTIONS.studio.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS.studio), { ...OG_SIZE });
}
