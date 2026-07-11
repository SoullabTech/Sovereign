import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Founder-gated Soullab Press workspace. Preview must not expose manuscript
// titles or editorial content.
export const alt = 'Protected Soullab Press workspace';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'Soullab Press — Private Workspace',
      subtitle: 'This protected editorial workspace is available only to authorized participants.',
    }),
    { ...OG_SIZE },
  );
}
