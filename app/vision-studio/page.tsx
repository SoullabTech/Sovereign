import type { Metadata } from 'next';
import { SECTIONS } from '@/lib/og/ogCard';
import { PublicSectionLanding } from '@/components/landing/PublicSectionLanding';

/**
 * Public landing for Vision Studio. The working room stays member-gated at
 * /maia/vision-studio; this page is the outward face a share card or deck
 * CTA can point at. Copy audited against MARKETING_CLAIM_DISCIPLINE — see
 * docs/pitch/PUBLIC_LANDINGS_CLAIM_AUDIT_2026-07-10.md.
 */

const s = SECTIONS['vision-studio'];
const title = `${s.eyebrow} — ${s.title}`;

export const metadata: Metadata = {
  title,
  description: s.subtitle,
  openGraph: { title, description: s.subtitle },
  twitter: { card: 'summary_large_image', title, description: s.subtitle },
};

export default function VisionStudioLandingPage() {
  return (
    <PublicSectionLanding
      section="vision-studio"
      paragraphs={[
        'Some work does not fit in a task list. A book, a practice, a body of research, a question you have carried for years — work that unfolds over a lifetime and asks to be returned to, not managed.',
        'The Vision Studio is a room inside MAIA where that work has a home. You bring the vision as it actually stands — forming, stalled, changing — and work with it in conversation, at your own pace, on your own terms.',
        'MAIA holds the space; the pace and the authorship stay yours.',
      ]}
      ctas={[
        { label: 'Begin with MAIA', href: '/signin', primary: true },
        { label: 'About Soullab', href: '/' },
      ]}
    />
  );
}
