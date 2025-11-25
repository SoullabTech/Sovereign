'use client';

/**
 * COMPLETE SAGE/TEAL ONBOARDING FLOW
 * 1. Authentication/Name Collection (BetaTesterGateway)
 * 2. Daimon Welcome Experience (SageTealDaimonWelcome)
 */

import React, { useState } from 'react';
import SageTealDaimonWelcome from '../../components/onboarding/SageTealDaimonWelcome';
import BetaTesterGateway from '../../components/onboarding/BetaTesterGateway';

export default function WelcomePage() {
  const [phase, setPhase] = useState<'authentication' | 'welcome'>('authentication');
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    password: string;
  } | null>(null);

  const handleAuthenticationComplete = (data: {
    name: string;
    username: string;
    password: string;
  }) => {
    setUserData(data);
    setPhase('welcome');
  };

  const handleWelcomeComplete = () => {
    window.location.href = '/maia';
  };

  if (phase === 'authentication') {
    return (
      <BetaTesterGateway onComplete={handleAuthenticationComplete} />
    );
  }

  return (
    <SageTealDaimonWelcome
      userName={userData?.name || 'Explorer'}
      onComplete={handleWelcomeComplete}
    />
  );
}