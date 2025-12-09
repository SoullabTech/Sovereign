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

    // After completing the daimon welcome, mark user as onboarded and go to maia
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        // Mark as onboarded since they completed the daimon introduction
        userData.onboarded = true;
        userData.daimonIntroComplete = true;
        localStorage.setItem('beta_user', JSON.stringify(userData));

        // Update the users collection as well
        const betaUsers = localStorage.getItem('beta_users');
        if (betaUsers) {
          const usersData = JSON.parse(betaUsers);
          if (usersData[userData.username]) {
            usersData[userData.username].onboarded = true;
            usersData[userData.username].daimonIntroComplete = true;
            localStorage.setItem('beta_users', JSON.stringify(usersData));
          }
        }

        router.push('/maia');
      } catch (e) {
        console.error('Error updating user data:', e);
        router.push('/maia');
      }
    } else {
      // No user data - still go to maia (they've completed the daimon intro)
      router.push('/maia');
    }
  };

  return (
    <SageTealDaimonWelcome
      userName={userName}
      onComplete={handleWelcomeComplete}
    />
  );
}
