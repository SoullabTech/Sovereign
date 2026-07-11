import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Stellium session records — gated. Scoped to /stellium/sessions so any public
// astrology surfaces under /stellium are unaffected.
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
