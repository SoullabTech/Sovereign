'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication status using betaSession
    const sessionState = betaSession.restoreSession();
    const onboardingComplete = localStorage.getItem('onboarding_completed');
    const daimonIntroComplete = localStorage.getItem('daimonIntroComplete');
    const facetProfile = localStorage.getItem('facet_profile');

    // Check for partner context from URL
    const urlParams = new URLSearchParams(window.location.search);
    const institution = urlParams.get('institution');
    const context = urlParams.get('context');

    if (sessionState.isAuthenticated && sessionState.user) {
      // User is authenticated - check completion status
      if (sessionState.user.onboarded && onboardingComplete && daimonIntroComplete) {

        // Signed in and fully onboarded - handle partner context if present
        if ((institution === 'yale' || institution === 'qri') && context) {
          // Route to partner context handler
          router.replace(`/partner-welcome?institution=${institution}&context=${context}`);
        } else {
          // Regular returning member - go straight to MAIA
          router.replace('/maia');
        }

      } else {
        // User needs to complete onboarding
        if (facetProfile) {
          // Facet complete - proceed to Sacred Soul Induction
          router.replace('/onboarding');
        } else {
          // Start with Facet Router (handle partner context)
          const facetUrl = (institution === 'yale' || institution === 'qri') && context
            ? `/onboarding/facet?institution=${institution}&context=${context}`
            : '/onboarding/facet';
          router.replace(facetUrl);
        }
      }
    } else {
      // No authentication - signed out user

      // Check if they came through partner door
      if ((institution === 'yale' || institution === 'qri') && context) {
        // Show partner-aware welcome-back page
        router.replace(`/welcome-back?institution=${institution}&context=${context}`);
      } else if (facetProfile) {
        // Has facet but no user account - proceed to Sacred Soul Induction
        router.replace('/onboarding');
      } else {
        // Completely new or signed out - show welcome-back
        router.replace('/welcome-back');
      }
    }
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>

        {/* Sacred Holoflower */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
        }}>
          <img
            src="/holoflower.svg"
            alt="Sacred Holoflower"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(212, 184, 150, 0.3))',
              animation: 'spin 8s linear infinite'
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: '300',
          color: '#1f2937',
          letterSpacing: '0.2em',
          marginBottom: '12px'
        }}>
          SOULLAB
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          fontStyle: 'italic',
          marginBottom: '20px'
        }}>
          Consciousness technology for transformation
        </p>

        {/* Navigation buttons */}
        <div style={{ marginTop: '40px' }}>
          <a href="/beta-signup" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#A0C4C7',
            color: '#1f2937',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            marginRight: '12px'
          }}>
            Begin Journey
          </a>
          <a href="/simple" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px'
          }}>
            Test Connection
          </a>
        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}