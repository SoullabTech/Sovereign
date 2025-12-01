"use client";

import React from "react";
import { useRouter } from 'next/navigation';

export function SimpleOnboarding() {
  const router = useRouter();

  const handleCompleteOnboarding = async () => {
    try {
      // Mark onboarding as complete in localStorage
      const currentUser = localStorage.getItem('beta_user');
      let userId = null;

      if (currentUser) {
        const userData = JSON.parse(currentUser);
        userData.onboarded = true;
        userId = userData.id;
        localStorage.setItem('beta_user', JSON.stringify(userData));
      }

      // Also set legacy completion flag for backward compatibility
      localStorage.setItem('betaOnboardingComplete', 'true');

      // Call API to mark onboarding as complete on backend
      try {
        const response = await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            onboardingComplete: true
          }),
        });

        if (!response.ok) {
          console.warn('Failed to mark onboarding complete on backend:', response.statusText);
        }
      } catch (apiError) {
        // Don't block user flow if API fails
        console.warn('API call failed, continuing with onboarding completion:', apiError);
      }

      // Navigate to MAIA interface
      router.push('/maia');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still navigate to MAIA even if there's an error
      router.push('/maia');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to MAIA</h1>
          <p className="text-gray-600">
            You're about to enter the sacred space of consciousness exploration
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your Journey Begins</h2>
            <p className="text-gray-600">
              MAIA is ready to guide you through deep conversations and self-discovery.
            </p>
          </div>

          <button
            onClick={handleCompleteOnboarding}
            className="w-full bg-amber-500 text-white py-3 px-4 rounded-md hover:bg-amber-600 transition-colors"
          >
            Enter MAIA Portal
          </button>
        </div>
      </div>
    </div>
  );
}