import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Session history / transcripts. Preview must never expose transcript titles,
// excerpts, participants, or session content.
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
