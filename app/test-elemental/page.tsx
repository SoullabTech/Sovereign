'use client';

import React, { useEffect, useState } from 'react';
import { ElementalOrientation } from '@/components/beta/ElementalOrientation';
import SacredSoulInduction from '@/components/onboarding/SacredSoulInduction';

export default function TestElementalPage() {
  const [explorerName, setExplorerName] = useState('Explorer');
  const [hasCompletedSignup, setHasCompletedSignup] = useState(false);

  useEffect(() => {
    // Check if user has already completed signup in this session
    try {
      const betaUser = localStorage.getItem('beta_user');
      const signupCompleted = localStorage.getItem('signup_completed');

      // Only mark as completed if BOTH exist AND signupCompleted is explicitly 'true'
      if (betaUser && signupCompleted === 'true') {
        const userData = JSON.parse(betaUser);
        if (userData.name) {
          setExplorerName(userData.name);
          setHasCompletedSignup(true);
        }
      }
    } catch (e) {
      // Use default name if parsing fails
      setExplorerName('Explorer');
    }
  }, []);

  const handleSignupComplete = (userData: { name: string; username: string; password: string }) => {
    // Store user data and mark signup as complete
    const newUser = {
      id: `user_${Date.now()}`,
      username: userData.username,
      name: userData.name,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('beta_user', JSON.stringify(newUser));
    localStorage.setItem('signup_completed', 'true');
    setExplorerName(userData.name);
    setHasCompletedSignup(true);
  };

  // If user hasn't completed signup, show SacredSoulInduction first
  if (!hasCompletedSignup) {
    return <SacredSoulInduction onComplete={handleSignupComplete} />;
  }

  // After signup completion, show ElementalOrientation
  return <ElementalOrientation explorerName={explorerName} />;
}