import { redirect } from 'next/navigation';

// Force dynamic to prevent prerender failures
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Birth Chart - Redirects to /patterns
 *
 * Legacy route. Astrology is now nested under Patterns
 * as one symbolic system among many.
 */
export default function BirthChartPage() {
  redirect('/patterns');
}
