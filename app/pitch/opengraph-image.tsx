import { ImageResponse } from 'next/og';
import { ogCard, SOULLAB_AMBER, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

export const alt = 'MAIA — Pitch Deck';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: 'Pitch Deck',
      title: 'MAIA',
      subtitle: 'Consciousness technology for transformation.',
      accent: SOULLAB_AMBER,
    }),
    { ...size },
  );
}
