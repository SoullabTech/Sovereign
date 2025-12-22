/**
 * ANALYTICS DASHBOARD PAGE
 * Phase 4.4C: Comprehensive Consciousness Analytics Dashboard
 *
 * TEMPORARILY DISABLED during Supabase → Sovereignty migration
 * Analytics components use React Query which requires QueryClientProvider
 */

'use client';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Consciousness Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time insights into MAIA&apos;s symbolic routing system and consciousness trace patterns
        </p>
      </div>

      {/* Placeholder */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-50/10 dark:bg-amber-900/10 p-8">
        <div className="font-semibold text-xl mb-2">Analytics Dashboard Temporarily Disabled</div>
        <div className="text-sm opacity-80 space-y-2">
          <p>
            This dashboard is being migrated to sovereignty mode (local PostgreSQL only).
          </p>
          <p>
            The analytics components use React Query and require updates to work with the new
            local-first architecture. This will be restored in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
