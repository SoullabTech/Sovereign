import type { Metadata } from 'next';
import { SECTIONS } from '@/lib/og/ogCard';
import { PublicSectionLanding } from '@/components/landing/PublicSectionLanding';

/**
 * Public landing for Soullab Studio. The working app stays gated at /studio
 * (which is why this lives at /soullab-studio); this page is the outward face
 * a share card or deck CTA can point at. Copy audited against
 * MARKETING_CLAIM_DISCIPLINE — see
 * docs/pitch/PUBLIC_LANDINGS_CLAIM_AUDIT_2026-07-10.md.
 */

const s = SECTIONS.studio;
const title = `${s.eyebrow} — ${s.title}`;

export const metadata: Metadata = {
  title,
  description: s.subtitle,
  openGraph: { title, description: s.subtitle },
  twitter: { card: 'summary_large_image', title, description: s.subtitle },
};

export default function SoullabStudioLandingPage() {
  return (
    <PublicSectionLanding
      section="studio"
      paragraphs={[
        'For practitioners — coaches, therapists, teachers, guides — whose work generates something worth tending: sessions, relationships, and a growing field of practice.',
        'The Studio is where that work lives. Hold sessions, keep faith with the people you work alongside, and let years of practice accumulate into a field you can actually see and steward.',
        'Built sovereign: self-hosted, consent-first, no data middlemen. Your practice — and your clients’ trust — never becomes someone else’s asset.',
      ]}
      ctas={[
        { label: 'Sign in', href: '/signin', primary: true },
        { label: 'About Soullab', href: '/' },
      ]}
    />
  );
}
