'use client';

// Sovereignty mode: Analytics dashboard disabled (Supabase removed)

export default function ThemePreferencesWidget() {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-amber-500/20">
      <div className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        Theme Preferences Analytics Unavailable
      </div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        This widget displayed theme usage analytics from Supabase and is being migrated to local Postgres APIs.
      </div>
    </div>
  );
}
