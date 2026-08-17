import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public Vision Studio landing — named section card.
// The card renders from a constant SECTIONS entry — no request data — so it is
// genuinely static. Declaring it lets the Capacitor build (output: 'export')
// prerender the image instead of failing to collect page data for this route.
export const dynamic = 'force-static';
export const alt = SECTIONS['vision-studio'].title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS['vision-studio']), { ...OG_SIZE });
}
