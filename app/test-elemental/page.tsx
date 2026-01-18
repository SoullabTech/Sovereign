'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ElementalOrientation } from '@/components/beta/ElementalOrientation';
import SacredSoulInduction from '@/components/onboarding/SacredSoulInduction';

function TestElementalContent() {
  const searchParams = useSearchParams();
  const [explorerName, setExplorerName] = useState('Explorer');
  const [hasCompletedSignup, setHasCompletedSignup] = useState(false);
  const [initialPasskey, setInitialPasskey] = useState('');

  useEffect(() => {
    // Check for passkey in URL params (from redirect)
    const urlPasskey = searchParams.get('passkey');
    if (urlPasskey) {
      setInitialPasskey(urlPasskey.toUpperCase());
    }

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
  }, [searchParams]);

  const handleSignupComplete = (userData: { name: string; username: string; password: string; memberId?: string }) => {
    // Use server-assigned member ID, fallback to timestamp for offline mode
    const memberId = userData.memberId || `local_${Date.now()}`;

    // Store user data and mark signup as complete
    const newUser = {
      id: memberId,
      username: userData.username,
      name: userData.name,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('beta_user', JSON.stringify(newUser));
    localStorage.setItem('signup_completed', 'true');

    // Set explorerId for data association - critical for returning user data migration
    localStorage.setItem('explorerId', memberId);
    localStorage.setItem('explorerName', userData.name);
    localStorage.setItem('maia_session_version', '2');

    setExplorerName(userData.name);
    setHasCompletedSignup(true);
  };

  // If user hasn't completed signup, show SacredSoulInduction first
  if (!hasCompletedSignup) {
    return <SacredSoulInduction onComplete={handleSignupComplete} initialPasskey={initialPasskey} />;
  }

  // After signup completion, show ElementalOrientation
  return <ElementalOrientation explorerName={explorerName} />;
}

// Loading component for Suspense fallback
function TestElementalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-light">Loading...</p>
      </div>
    </div>
  );
}

export default function TestElementalPage() {
  return (
    <Suspense fallback={<TestElementalLoading />}>
      <TestElementalContent />
    </Suspense>
  );
}