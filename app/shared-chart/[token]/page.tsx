import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { readSharedChartBirth } from '@/lib/astrology/proChartShares';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';
import { calculateBirthChart } from '@/lib/astrology/proEphemerisCalculator';
import SharedChartView from './SharedChartView';

/**
 * ASTRO-PRO-CHART-SHARE-01 — a client's chart, by private link.
 *
 * Readable without an account by whoever holds the link. It 404s unless the
 * link is live (not turned off, chart not deleted), Pro is enabled and the
 * owner still holds Pro access. The chart is recalculated from the saved birth
 * details on each view; nothing about the viewer is recorded. View-only: no
 * MAIA, no notes, no interpretation. Unlisted, noindex, and no referrer, so
 * the link does not leak through outbound clicks.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your chart · Soullab',
  description: 'A natal chart shared with you privately.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function SharedChartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!proPreviewEnabled(process.env)) notFound();
  const shared = await readSharedChartBirth(token).catch(() => null);
  if (!shared) notFound();
  if (!(await proMemberAllowed(shared.ownerMemberId, process.env))) notFound();
  const admission = admitProCalculation({
    date: shared.date, time: shared.time, location: shared.location, houseSystem: 'porphyry',
  });
  if (!admission.ok) notFound();
  const chart = await calculateBirthChart(admission.birthData);
  return (
    <SharedChartView
      chart={chart}
      label={shared.label}
      birth={{ date: shared.date, time: shared.time, place: shared.placeLabel }}
    />
  );
}
