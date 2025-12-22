/**
 * ANALYTICS DASHBOARD PAGE
 * Phase 4.4C: Comprehensive Consciousness Analytics Dashboard
 *
 * Re-enabled with ReactQueryProvider in root layout (app/layout.tsx)
 * Analytics components now have access to QueryClient context
 */

import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <AnalyticsDashboardClient />
    </div>
  );
}
