import type { Metadata } from 'next';
import { SECTIONS } from '@/lib/og/ogCard';
import { PublicSectionLanding } from '@/components/landing/PublicSectionLanding';

/**
 * Public landing for What Now?. Deliberately additive: /now-what keeps its
 * room-as-entry edge redirect (2026-07-08 decision — a person here to
 * practice lands in the practice), and the prospect deck stays at
 * /now-what/pitch. This page is the outward face a share card or deck CTA
 * can point at without hitting a login wall. Copy audited against
 * MARKETING_CLAIM_DISCIPLINE — see
 * docs/pitch/PUBLIC_LANDINGS_CLAIM_AUDIT_2026-07-10.md.
 */

const s = SECTIONS['now-what'];
const title = `${s.eyebrow} — ${s.title}`;

export const metadata: Metadata = {
  title,
  description: s.subtitle,
  openGraph: { title, description: s.subtitle },
  twitter: { card: 'summary_large_image', title, description: s.subtitle },
};

export default function NowWhatWelcomePage() {
  return (
    <PublicSectionLanding
      section="now-what"
      paragraphs={[
        'Not a course. Not a feed. A live room where you bring the actual thing — the decision, the overwhelm, the question that keeps coming back — and work with it until a next real step appears.',
        'You speak; MAIA listens and works with you — plainly, without scripts or diagnosis. When the step is clear, the room lets you go. The point is your life, not the session.',
        'Private by design: self-hosted, consent-first, nothing sold, nothing farmed.',
      ]}
      ctas={[
        { label: 'Enter the room', href: '/now-what', primary: true },
        { label: 'Program overview', href: '/now-what/pitch' },
      ]}
    />
  );
}
