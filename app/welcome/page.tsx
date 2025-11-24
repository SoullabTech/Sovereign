'use client';

import { useState, useEffect } from 'react';
import { SessionManager, UserSession, SessionState } from '../../lib/sessionManager';

// Import our sacred transformation components
import { SacredEntry } from '../../components/transformation/SacredEntry';
import { IntentionCeremony } from '../../components/transformation/IntentionCeremony';
import { SanctuaryCreation } from '../../components/transformation/SanctuaryCreation';
import { ThresholdCrossing } from '../../components/transformation/ThresholdCrossing';
import { ReturningWelcome } from '../../components/transformation/ReturningWelcome';

// Pathway 1 phases
type InitiationPhase = 'entry' | 'intention' | 'sanctuary' | 'threshold' | 'complete';

interface OnboardingData {
  name: string;
  passcode: string;
  intention?: {
    primary: string;
    depth: string;
    commitment: string;
  };
  credentials?: {
    username: string;
    password: string;
    communicationStyle: string;
  };
}

export default function WelcomePage() {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [currentPhase, setCurrentPhase] = useState<InitiationPhase>('entry');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    passcode: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session detection on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);

        // Detect user pathway
        const pathway = SessionManager.getUserPathway();
        setSessionState(pathway);

        // Handle continuous session - direct redirect
        if (pathway.pathway === 'PATHWAY_3_CONTINUOUS') {
          SessionManager.trackInteraction('continuous_session_detected');
          SessionManager.redirectToMaia();
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Session initialization error:', error);
        setError('Failed to initialize session. Please refresh and try again.');
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Handle sacred entry completion (name + passcode)
  const handleSacredEntryComplete = async (data: { name: string; passcode: string }) => {
    try {
      SessionManager.trackInteraction('sacred_entry_completed', { name: data.name });

      // Validate passcode
      const isValidPasscode = await SessionManager.validatePasscode(data.passcode);
      if (!isValidPasscode) {
        setError('Invalid invitation code. Please check your code and try again.');
        return;
      }

      // Update onboarding data
      setOnboardingData(prev => ({
        ...prev,
        name: data.name,
        passcode: data.passcode
      }));

      // Progress to intention ceremony
      setCurrentPhase('intention');
      setError(null);

    } catch (error) {
      console.error('Sacred entry error:', error);
      setError('Error validating invitation. Please try again.');
    }
  };

  // Handle intention ceremony completion
  const handleIntentionComplete = (intention: {
    primary: string;
    depth: string;
    commitment: string;
  }) => {
    SessionManager.trackInteraction('intention_ceremony_completed', { intention });

    setOnboardingData(prev => ({
      ...prev,
      intention
    }));

    setCurrentPhase('sanctuary');
  };

  // Handle sanctuary creation completion
  const handleSanctuaryComplete = (credentials: {
    username: string;
    password: string;
    communicationStyle: string;
  }) => {
    SessionManager.trackInteraction('sanctuary_creation_completed', {
      username: credentials.username,
      communicationStyle: credentials.communicationStyle
    });

    setOnboardingData(prev => ({
      ...prev,
      credentials
    }));

    setCurrentPhase('threshold');
  };

  // Handle threshold crossing completion
  const handleThresholdComplete = () => {
    try {
      SessionManager.trackInteraction('threshold_crossing_completed');

      // Create complete session
      if (onboardingData.intention && onboardingData.credentials) {
        const session = SessionManager.createSession({
          name: onboardingData.name,
          username: onboardingData.credentials.username,
          password: onboardingData.credentials.password,
          intention: onboardingData.intention,
          communicationStyle: onboardingData.credentials.communicationStyle as any,
          passcode: onboardingData.passcode
        });

        SessionManager.trackInteraction('session_created', {
          userId: session.id,
          element: session.element
        });

        // Sacred transition to MAIA
        SessionManager.redirectToMaia();
      }
    } catch (error) {
      console.error('Threshold completion error:', error);
      setError('Error completing onboarding. Please try again.');
    }
  };

  // Handle returning user sign-in
  const handleReturningSignIn = async (credentials: { username: string; password: string }) => {
    try {
      SessionManager.trackInteraction('returning_signin_attempted', { username: credentials.username });

      const session = await SessionManager.authenticateUser(credentials.username, credentials.password);

      if (session) {
        SessionManager.trackInteraction('returning_signin_success', {
          userId: session.id,
          element: session.element
        });

        // Update session state
        setSessionState({
          pathway: 'PATHWAY_3_CONTINUOUS',
          user: session,
          needsAuth: false,
          isFirstVisit: false
        });

        // Redirect to MAIA
        SessionManager.redirectToMaia();
      } else {
        setError('Invalid credentials. Please check your username and password.');
      }
    } catch (error) {
      console.error('Returning sign-in error:', error);
      setError('Sign-in failed. Please try again.');
    }
  };

  // Handle returning user continue (already signed in)
  const handleReturningContinue = () => {
    SessionManager.trackInteraction('returning_user_continue');
    SessionManager.redirectToMaia();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sage-700 font-light">Detecting consciousness pathway...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200 flex items-center justify-center px-8">
        <div className="max-w-md text-center space-y-6">
          <div className="text-red-600 text-4xl">⚠️</div>
          <h2 className="text-2xl font-light text-sage-900">Sacred Space Error</h2>
          <p className="text-sage-700 leading-relaxed">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-3 bg-sage-600 text-white border border-sage-600 hover:bg-sage-700 transition-colors font-light"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate pathway
  if (!sessionState) {
    return null;
  }

  // PATHWAY 2: Returning User
  if (sessionState.pathway === 'PATHWAY_2_RETURNING' && sessionState.user) {
    return (
      <ReturningWelcome
        name={sessionState.user.name}
        element={sessionState.user.element}
        lastVisit={new Date(sessionState.user.lastActive).toISOString()}
        onSignIn={handleReturningSignIn}
        onContinue={handleReturningContinue}
        isSignedIn={!sessionState.needsAuth}
      />
    );
  }

  // PATHWAY 1: First Initiation - Sacred Flow
  return (
    <>
      {currentPhase === 'entry' && (
        <SacredEntry onComplete={handleSacredEntryComplete} />
      )}

      {currentPhase === 'intention' && (
        <IntentionCeremony
          name={onboardingData.name}
          onComplete={handleIntentionComplete}
        />
      )}

      {currentPhase === 'sanctuary' && onboardingData.intention && (
        <SanctuaryCreation
          name={onboardingData.name}
          intention={onboardingData.intention}
          onComplete={handleSanctuaryComplete}
        />
      )}

      {currentPhase === 'threshold' && onboardingData.intention && onboardingData.credentials && (
        <ThresholdCrossing
          name={onboardingData.name}
          element={SessionManager.assignElement(onboardingData.name, onboardingData.intention.primary)}
          intention={onboardingData.intention}
          onComplete={handleThresholdComplete}
        />
      )}
    </>
  );
}