import { redirect } from 'next/navigation';

// Force dynamic to prevent prerender failures
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Birth Chart - Redirects to /astrology
 *
 * The birth chart functionality has been consolidated into /astrology.
 * This page now redirects to maintain backwards compatibility.
 */
export default function BirthChartPage() {
  redirect('/astrology');
}
