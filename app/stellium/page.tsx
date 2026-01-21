"use client";

/**
 * STELLIUM DASHBOARD PAGE
 *
 * The practitioner's home - everything at a glance
 */

import { useRouter } from 'next/navigation';
import StelliumDashboard from '@/components/stellium/StelliumDashboard';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function StelliumDashboardPage() {
  const router = useRouter();
  const { practitionerId, practitionerName, isLoading } = usePractitionerContext();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Show loading while checking for practitioner context
  if (isLoading || !practitionerId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StelliumDashboard
      practitionerId={practitionerId}
      practitionerName={practitionerName}
      onNavigate={handleNavigate}
    />
  );
}
