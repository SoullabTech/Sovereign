import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// The What Now? room is a gated, member-facing held space. Its preview must
// reveal nothing of what is worked there.
export const alt = 'Protected Soullab space';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'A Private Soullab Space',
      subtitle: 'This protected space is available only to authorized participants.',
    }),
    { ...OG_SIZE },
  );
}
