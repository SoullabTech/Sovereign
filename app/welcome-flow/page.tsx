'use client';

import React from 'react';
import CompleteWelcomeFlow from '@/components/onboarding/CompleteWelcomeFlow';
import { useRouter } from 'next/navigation';

export default function WelcomeFlowPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate to MAIA after completing welcome flow
    router.push('/maia');
  };

  return (
    <div className="w-full h-screen">
      <CompleteWelcomeFlow
        userName="Kelly"
        onComplete={handleComplete}
      />
    </div>
  );
}