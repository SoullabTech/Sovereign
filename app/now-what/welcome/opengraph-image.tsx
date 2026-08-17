import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public Now What? landing — named section card. (The live room at
// /now-what/room keeps its PRIVATE-GENERIC card.)
// The card renders from a constant SECTIONS entry — no request data — so it is
// genuinely static. Declaring it lets the Capacitor build (output: 'export')
// prerender the image instead of failing to collect page data for this route.
export const dynamic = 'force-static';
export const alt = SECTIONS['now-what'].title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS['now-what']), { ...OG_SIZE });
}
