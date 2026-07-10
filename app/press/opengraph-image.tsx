import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public Soullab Press landing — named section card. (The founder-gated
// /book-studio workspace keeps its PRIVATE-GENERIC card.)
export const alt = SECTIONS.press.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS.press), { ...OG_SIZE });
}
