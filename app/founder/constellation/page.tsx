import type { Metadata } from 'next';
import { requireFounder } from '@/lib/founder/founderAuth';
import { loadLearningReport } from '@/lib/constellation/learningReportServer';
import LearningReportView from './LearningReportView';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Doorway learning · Soullab',
  robots: { index: false, follow: false },
};

export default async function ConstellationLearningPage() {
  // The parent layout's feature flag is presentation, never founder authorization.
  const auth = await requireFounder();
  if (!auth.ok) {
    return (
      <section aria-label="Founder access required">
        <h1>Doorway learning</h1>
        <p>This report is available only to an authorized founder. No feedback has been read.</p>
        <a href="/signin?next=%2Ffounder%2Fconstellation">Sign in to continue</a>
      </section>
    );
  }
  if (process.env.CAPACITOR_BUILD) {
    return <p>The founder learning report is available in the web workspace.</p>;
  }
  const report = await loadLearningReport();
  return <LearningReportView report={report} />;
}
