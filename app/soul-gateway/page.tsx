'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RitualFlowOrchestrator from '@/components/onboarding/RitualFlowOrchestrator';

export default function SoulGatewayPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/maia');
  };

  return (
    <div className="w-full min-h-screen overflow-y-auto">
      <RitualFlowOrchestrator onComplete={handleComplete} />
    </div>
  );
}