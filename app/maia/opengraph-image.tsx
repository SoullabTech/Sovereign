import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

export const alt = 'MAIA — A Sovereign Consciousness Companion';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS.maia), { ...size });
}
