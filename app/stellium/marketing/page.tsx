"use client";

/**
 * STELLIUM MARKETING PAGE
 *
 * Marketing automation dashboard
 * "Your voice, amplified. Your presence, consistent. Your practice, growing."
 */

import { useRouter } from 'next/navigation';
import MarketingDashboard from '@/components/stellium/MarketingDashboard';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function MarketingPage() {
  const router = useRouter();
  const { practitionerId, isLoading } = usePractitionerContext();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (isLoading || !practitionerId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MarketingDashboard
      practitionerId={practitionerId}
      onNavigate={handleNavigate}
    />
  );
}
