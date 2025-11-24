"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DaimonWelcomeRitual } from '@/components/onboarding/DaimonWelcomeRitual';
import { ConsciousnessVisualizationProvider } from '@/lib/contexts/ConsciousnessVisualizationContext';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already onboarded
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.onboarded) {
        router.push('/maia');
        return;
      }
    }
    setIsLoading(false);
  }, [router]);

  const handleOnboardingComplete = async () => {
    try {
      setIsLoading(true);

      // Create or get user session
      const response = await fetch('/api/oracle/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      });

      let userData;
      if (response.ok) {
        const data = await response.json();
        userData = {
          id: data.userId || crypto.randomUUID(),
          username: data.username || 'Seeker',
          agentName: 'MAIA',
          agentId: data.agentId,
          sessionId: data.sessionId,
          element: 'aether', // MAIA starts in integrated aether mode
          onboarded: true,
          daimonIntroComplete: true
        };
      } else {
        // Create fallback session
        userData = {
          id: crypto.randomUUID(),
          username: 'Seeker',
          agentName: 'MAIA',
          sessionId: `session-${Date.now()}`,
          element: 'aether',
          onboarded: true,
          daimonIntroComplete: true
        };
      }

      // Store session data
      localStorage.setItem('beta_user', JSON.stringify(userData));

      // Also update the beta_users storage so returning users don't get onboarded again
      const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
      if (userData.username && users[userData.username]) {
        users[userData.username] = { ...users[userData.username], onboarded: true, daimonIntroComplete: true };
        localStorage.setItem('beta_users', JSON.stringify(users));
        console.log('✅ Enhanced onboarding completed for:', userData.username);
      }

      setUser(userData);

      // Navigate to MAIA after slight delay for transition
      setTimeout(() => {
        router.push('/maia');
      }, 800);

    } catch (error) {
      console.error('Onboarding completion error:', error);
      // Navigate anyway with minimal fallback data
      const fallbackUser = {
        id: crypto.randomUUID(),
        username: 'Seeker',
        agentName: 'MAIA',
        sessionId: `session-${Date.now()}`,
        element: 'aether',
        onboarded: true,
        daimonIntroComplete: true
      };
      localStorage.setItem('beta_user', JSON.stringify(fallbackUser));
      router.push('/maia');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/80 text-sm font-light">Preparing your sacred space...</p>
        </div>
      </div>
    );
  }

  return (
    <ConsciousnessVisualizationProvider>
      <DaimonWelcomeRitual
        userId={user?.id}
        userName={user?.username || 'Kelly'} // Default to Kelly as in original design
        onComplete={handleOnboardingComplete}
      />
    </ConsciousnessVisualizationProvider>
  );
}