'use client';

import React from 'react';
import { SageTealWelcome } from '@/components/onboarding/SageTealWelcome';
import { useRouter } from 'next/navigation';

export default function TestWelcomePage() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate to MAIA after completing welcome flow
    router.push('/maia');
  };

  return (
    <SageTealWelcome
      userName="Kelly"
      onComplete={handleComplete}
    />
  );
}