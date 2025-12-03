"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SageTealDaimonWelcome from "@/components/onboarding/SageTealDaimonWelcome";

export default function IntroPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | undefined>();

  useEffect(() => {
    // Get user name if available
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        setUserName(userData.username || userData.name);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleWelcomeComplete = () => {
    // Mark onboarding as completed so user only sees it once
    localStorage.setItem('onboarding_completed', 'true');
    console.log('✅ Onboarding completed - user will not see intro again');

    // After sage/teal welcome, redirect to beta-signup or maia based on user state
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (userData.onboarded) {
          router.push('/maia');
        } else {
          router.push('/beta-signup');
        }
      } catch (e) {
        router.push('/beta-signup');
      }
    } else {
      router.push('/beta-signup');
    }
  };

  return (
    <SageTealDaimonWelcome
      userName={userName}
      onComplete={handleWelcomeComplete}
    />
  );
}
