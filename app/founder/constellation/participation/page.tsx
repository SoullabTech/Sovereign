import type { Metadata } from 'next';
import { requireFounder } from '@/lib/founder/founderAuth';
import ParticipationPreview from './ParticipationPreview';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Participation preview · Constellation',
  robots: { index: false, follow: false },
};

export default async function ParticipationPreviewPage() {
  const auth = await requireFounder();
  if (!auth.ok) {
    return <section aria-label="Founder access required">
      <h1>Participation preview</h1>
      <p>This review-only experience is available to an authorized founder.</p>
      <a href="/signin?next=%2Ffounder%2Fconstellation%2Fparticipation">Sign in to continue</a>
    </section>;
  }
  if (process.env.CAPACITOR_BUILD) return <p>The participation preview is available in the web workspace.</p>;
  return <ParticipationPreview />;
}
