import { MAIADashboard } from '@/components/consciousness/maia-dashboard';

// Force dynamic rendering (skip build-time pre-render to avoid Supabase init errors)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ConsciousnessDashboard() {
  return <MAIADashboard />;
}