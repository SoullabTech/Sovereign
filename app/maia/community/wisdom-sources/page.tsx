import { redirect } from 'next/navigation';

/**
 * Legacy wisdom sources page — redirects to canonical /wisdom-keepers/wisdom
 */
export default function LegacyWisdomSourcesPage() {
  redirect('/wisdom-keepers/wisdom');
}
