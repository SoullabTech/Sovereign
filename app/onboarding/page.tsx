'use client';

import React, { useState, useEffect } from 'react';
import SacredSoulInduction from '@/components/onboarding/SacredSoulInduction';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Kelly');

  useEffect(() => {
    // Get user name from localStorage
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (userData.onboarded) {
          router.push('/welcome-back');
          return;
        }
        setUserName(userData.name || userData.username || 'Kelly');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [router]);

  const handleComplete = (userData: { name: string; username: string; password: string; }) => {
    // Create user session from sacred soul induction data
    const newUser = {
      id: `user_${Date.now()}`,
      username: userData.username,
      name: userData.name,
      password: userData.password,
      onboarded: true,
      daimonIntroComplete: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('beta_user', JSON.stringify(newUser));

    // Also update the beta_users storage
    const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
    users[userData.username] = newUser;
    localStorage.setItem('beta_users', JSON.stringify(users));

    router.push('/welcome-back');
  };

  return (
    <SacredSoulInduction
      onComplete={handleComplete}
    />
  );
}