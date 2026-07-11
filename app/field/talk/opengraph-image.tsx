import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Gated field conversation. Preview must reveal nothing of the member's field.
// (Scoped to /field/talk so the public /field/enter keeps its own named card.)
export const alt = 'Protected Soullab field';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'A Private Soullab Field',
      subtitle: 'This field is available only to its member.',
    }),
    { ...OG_SIZE },
  );
}
