import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

export const alt = 'Protected Soullab space';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'A Private Soullab Space',
      subtitle: 'This protected workspace is available only to its member.',
    }),
    { ...OG_SIZE },
  );
}
