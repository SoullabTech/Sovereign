import type { Metadata } from 'next';
import { SECTIONS } from '@/lib/og/ogCard';
import { PublicSectionLanding } from '@/components/landing/PublicSectionLanding';

/**
 * Public landing for Soullab Press. The editorial workspace stays
 * founder-gated at /book-studio; this page is the outward face a share card
 * or deck CTA can point at. Copy audited against MARKETING_CLAIM_DISCIPLINE —
 * see docs/pitch/PUBLIC_LANDINGS_CLAIM_AUDIT_2026-07-10.md.
 */

const s = SECTIONS.press;
const title = `${s.eyebrow} — ${s.title}`;

export const metadata: Metadata = {
  title,
  description: s.subtitle,
  openGraph: { title, description: s.subtitle },
  twitter: { card: 'summary_large_image', title, description: s.subtitle },
};

export default function PressLandingPage() {
  return (
    <PublicSectionLanding
      section="press"
      paragraphs={[
        'Most publishing starts with a market. Soullab Press starts with a life: work that was lived before it was written.',
        'The first works are taking shape now — Soul Portraits given as gifts, and books grown from years of practice. Each is made slowly, for a person or a readership we can name.',
        'Records of encounter — made to be held and given.',
      ]}
      ctas={[{ label: 'About Soullab', href: '/', primary: true }]}
    />
  );
}
