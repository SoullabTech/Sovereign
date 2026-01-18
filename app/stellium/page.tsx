"use client";

/**
 * STELLIUM DASHBOARD PAGE
 *
 * The practitioner's home - everything at a glance
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StelliumDashboard from '@/components/stellium/StelliumDashboard';

export default function StelliumDashboardPage() {
  const router = useRouter();
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [practitionerName, setPractitionerName] = useState<string>('');

  useEffect(() => {
    // Get practitioner ID from localStorage (set during login)
    // In production, this would come from session/auth
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setPractitionerId(user.id || user.memberId);
        setPractitionerName(user.preferredName || user.name || 'there');
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Fallback: use a demo practitioner ID for development
    if (!practitionerId) {
      setPractitionerId('demo-practitioner');
      setPractitionerName('there');
    }
  }, []);

  const handleNavigate = (path: string, data?: Record<string, unknown>) => {
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
    <StelliumDashboard
      practitionerId={practitionerId}
      practitionerName={practitionerName}
      onNavigate={handleNavigate}
    />
  );
}
