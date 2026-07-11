import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Inherited by /session/* including /session/join/[token]. A shared join link
// must reveal nothing about the session or its participants.
export const alt = 'Protected Soullab session';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'Private Soullab Session',
      subtitle: 'This protected session is available only to authorized participants.',
    }),
    { ...OG_SIZE },
  );
}
