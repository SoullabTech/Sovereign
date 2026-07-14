import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public Now What? landing — named section card. (The live room at
// /now-what/room keeps its PRIVATE-GENERIC card.)
export const alt = SECTIONS['now-what'].title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS['now-what']), { ...OG_SIZE });
}
