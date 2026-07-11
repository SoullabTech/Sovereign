import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Member portal + circles. Gated. The public /commons/join invitation page
// overrides this with its own card.
export const alt = 'Protected Soullab space';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'A Private Soullab Circle',
      subtitle: 'This protected space is available only to invited members.',
    }),
    { ...OG_SIZE },
  );
}
