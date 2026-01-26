import { redirect } from 'next/navigation';

/**
 * Birth Chart - Legacy redirect to /astrology
 *
 * Cosmic Blueprint now lives at /astrology which shows
 * birth chart setup and full astrological insights.
 */
export default function BirthChartPage() {
  redirect('/astrology');
}
