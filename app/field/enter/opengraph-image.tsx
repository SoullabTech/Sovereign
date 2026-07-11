import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public field entrance. Overrides the /field protected framing with the named
// Field section card.
export const alt = SECTIONS.field.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS.field), { ...OG_SIZE });
}
