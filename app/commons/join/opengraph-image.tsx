import { ImageResponse } from 'next/og';
import { ogCard, SOULLAB_AMBER, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public invitation page — overrides the parent /commons protected card with a
// welcoming named card. No per-invite data is rendered (nothing from the URL).
export const alt = "You're invited to a Soullab Circle";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: 'Soullab Circle',
      title: "You're Invited",
      subtitle: 'Join a shared field for practice and collaboration.',
      accent: SOULLAB_AMBER,
    }),
    { ...OG_SIZE },
  );
}
