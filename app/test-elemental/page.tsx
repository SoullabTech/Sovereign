'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ElementalOrientation } from '@/components/beta/ElementalOrientation';
import SacredSoulInduction from '@/components/onboarding/SacredSoulInduction';

function TestElementalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [explorerName, setExplorerName] = useState('Explorer');
  const [hasCompletedSignup, setHasCompletedSignup] = useState(false);
  const [initialPasskey, setInitialPasskey] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for passkey in URL params (from redirect)
    const urlPasskey = searchParams.get('passkey');
    if (urlPasskey) {
      setInitialPasskey(urlPasskey.toUpperCase());
    }

    // Check if user is already fully authenticated and onboarded
    // If so, redirect to /maia to break any redirect loops
    try {
      const betaUser = localStorage.getItem('beta_user');
      const betaOnboardingComplete = localStorage.getItem('betaOnboardingComplete');
      const signupCompleted = localStorage.getItem('signup_completed');

      if (betaUser) {
        const userData = JSON.parse(betaUser);

        // CRITICAL: Check for poisoned local_* IDs and clear them
        if (userData.id && userData.id.startsWith('local_')) {
          console.warn('[test-elemental] Detected poisoned local_* ID, clearing auth state');
          localStorage.removeItem('beta_user');
          localStorage.removeItem('explorerId');
          localStorage.removeItem('explorerName');
          localStorage.removeItem('signup_completed');
          setIsCheckingAuth(false);
          return;
        }

        // User is already signed in and onboarded - redirect to /maia
        if (userData.onboarded === true || betaOnboardingComplete === 'true') {
          console.log('[test-elemental] User already authenticated, redirecting to /maia');
          router.replace('/maia');
          return;
        }

        // User signed in but not fully onboarded - continue with signup flow
        if (signupCompleted === 'true' && userData.name) {
          setExplorerName(userData.name);
          setHasCompletedSignup(true);
        }
      }
    } catch (e) {
      // Use default name if parsing fails
      setExplorerName('Explorer');
    }

    setIsCheckingAuth(false);
  }, [searchParams, router]);

  // Show loading while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignupComplete = (userData: { name: string; username: string; password: string; memberId?: string }) => {
    // CRITICAL: Only proceed with valid server-assigned member ID
    // Do NOT use local_* fallback IDs - they break all server API calls
    if (!userData.memberId) {
      console.error('[test-elemental] Registration failed - no server memberId received');
      alert('Unable to complete registration. Please check your connection and try again.');
      return;
    }

    const memberId = userData.memberId;

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