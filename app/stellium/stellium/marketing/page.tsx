"use client";

/**
 * STELLIUM MARKETING PAGE
 *
 * Marketing automation dashboard
 * "Your voice, amplified. Your presence, consistent. Your practice, growing."
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarketingDashboard from '@/components/stellium/MarketingDashboard';

export default function MarketingPage() {
  const router = useRouter();
  const [practitionerId, setPractitionerId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setPractitionerId(user.id || user.memberId || 'demo-practitioner');
      } catch {
        setPractitionerId('demo-practitioner');
      }
    } else {
      setPractitionerId('demo-practitioner');
    }
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!practitionerId) {
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
