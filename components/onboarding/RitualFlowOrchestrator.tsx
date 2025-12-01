'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SacredSoulInduction from './SacredSoulInduction';
import PlatformOrientation from './PlatformOrientation';
import SageTealDaimonWelcome from './SageTealDaimonWelcome';

interface RitualFlowOrchestratorProps {
  onComplete: () => void;
}

type RitualPhase = 'gateway' | 'orientation' | 'welcome';

interface UserData {
  name: string;
  username: string;
  password: string;
}

export default function RitualFlowOrchestrator({ onComplete }: RitualFlowOrchestratorProps) {
  const [currentPhase, setCurrentPhase] = useState<RitualPhase>('gateway');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Phase transition handlers
  const handleGatewayComplete = (data: UserData) => {
    setUserData(data);
    // Store name for onboarding flow continuity
    localStorage.setItem('explorerName', data.name);
    localStorage.setItem('betaUserName', data.name);
    sessionStorage.setItem('explorerName', data.name);
    setCurrentPhase('orientation');
  };

  const handleOrientationComplete = () => {
    setCurrentPhase('welcome');
  };

  const handleWelcomeComplete = () => {
    // Store user data with onboarded flag before transitioning to /maia
    if (userData) {
      const explorerId = Date.now().toString(); // Simple ID generation
      const betaUserData = {
        id: explorerId,
        username: userData.username,
        name: userData.name,
        onboarded: true,
        createdAt: new Date().toISOString()
      };

      // Set the beta_user object with onboarded: true flag
      localStorage.setItem('beta_user', JSON.stringify(betaUserData));
      localStorage.setItem('betaOnboardingComplete', 'true');

      // Also store in beta_users master list for future sign-ins
      try {
        const betaUsersString = localStorage.getItem('beta_users');
        let betaUsers = betaUsersString ? JSON.parse(betaUsersString) : {};
        betaUsers[userData.username] = betaUserData;
        localStorage.setItem('beta_users', JSON.stringify(betaUsers));
        console.log('✅ Stored beta user data with onboarded: true for', userData.name);
      } catch (error) {
        console.error('Error storing beta_users:', error);
      }
    }

    // Final transition to /maia
    onComplete();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred background that flows throughout all phases */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]" />

      {/* Phase-specific overlays for smooth transitions */}
      <AnimatePresence mode="wait">
        {currentPhase === 'gateway' && (
          <motion.div
            key="gateway-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-tr from-[#6EE7B7]/10 via-transparent to-[#4DB6AC]/15"
          />
        )}
        {currentPhase === 'orientation' && (
          <motion.div
            key="orientation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-tr from-[#9CA3AF]/10 via-transparent to-[#6EE7B7]/15"
          />
        )}
        {currentPhase === 'welcome' && (
          <motion.div
            key="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-tr from-[#6EE7B7]/15 via-[#4DB6AC]/10 to-[#A7D8D1]/20"
          />
        )}
      </AnimatePresence>

      {/* Sacred central light - simplified animation to avoid WAAPI errors */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-50/20 via-[#6EE7B7]/15 to-transparent rounded-full blur-2xl opacity-40"
      />

      {/* Phase components - simplified to avoid animation errors */}
      <div className="relative z-10">
        {currentPhase === 'gateway' && (
          <div>
            <SacredSoulInduction onComplete={handleGatewayComplete} />
          </div>
        )}

        {currentPhase === 'orientation' && (
          <div>
            <PlatformOrientation
              userName={userData?.name || "Explorer"}
              onComplete={handleOrientationComplete}
            />
          </div>
        )}

        {currentPhase === 'welcome' && (
          <div>
            <SageTealDaimonWelcome
              userName={userData?.name || "Explorer"}
              onComplete={handleWelcomeComplete}
            />
          </div>
        )}
      </div>

      {/* Sacred progress indicator - simplified to avoid WAAPI errors */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4">
          {/* Phase indicators */}
          {(['gateway', 'orientation', 'welcome'] as RitualPhase[]).map((phase, index) => {
            const isActive = phase === currentPhase;
            const isCompleted =
              (phase === 'gateway' && (currentPhase === 'orientation' || currentPhase === 'welcome')) ||
              (phase === 'orientation' && currentPhase === 'welcome');

            return (
              <div
                key={phase}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isActive
                    ? 'bg-[#6EE7B7] shadow-[0_0_20px_#6EE7B7] scale-150'
                    : isCompleted
                      ? 'bg-[#4DB6AC]/80'
                      : 'bg-white/20'
                }`}
                style={{
                  opacity: isActive ? 1 : isCompleted ? 0.8 : 0.4
                }}
              />
            );
          })}

          {/* Sacred connecting lines */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-[#6EE7B7]/30 via-[#4DB6AC]/20 to-[#6EE7B7]/30 -z-10" />
        </div>

        {/* Phase name indicator */}
        <p
          className="text-center text-white/60 text-xs mt-3 font-light"
          style={{
            fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
          }}
        >
          {currentPhase === 'gateway' && 'Sacred Gateway'}
          {currentPhase === 'orientation' && 'Consciousness Orientation'}
          {currentPhase === 'welcome' && 'Daimon Welcome'}
        </p>
      </div>
    </div>
  );
}