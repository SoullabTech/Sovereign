'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { PartnerProvider } from '../../../components/partner/PartnerProvider';
import { SacredSoulInduction } from '../../../components/onboarding/SacredSoulInduction';
import PartnerWelcomeFlow from '../../../components/partner/PartnerWelcomeFlow';
import { getPartnerConfig } from '../../../lib/partner/partner-config';

interface PartnerPageProps {
  params: {
    slug: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  const [currentPhase, setCurrentPhase] = useState<'soul-induction' | 'partner-flow' | 'complete'>('soul-induction');
  const [userName, setUserName] = useState<string>('Explorer');

  // Validate partner exists
  const partnerConfig = getPartnerConfig(params.slug);

  if (!partnerConfig) {
    notFound();
  }

  const handleSoulInductionComplete = (userData: { name: string; username: string; password: string; }) => {
    setUserName(userData.name);
    setCurrentPhase('partner-flow');
  };

  const handlePartnerFlowComplete = () => {
    // Redirect to partner-specific MAIA interface
    window.location.href = `/maia?partner=${params.slug}`;
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'soul-induction':
        return (
          <SacredSoulInduction
            onComplete={handleSoulInductionComplete}
            partnerName={partnerConfig.name}
            customWelcomeMessage={`Welcome to ${partnerConfig.onboarding.organizationName} - ${partnerConfig.onboarding.welcomeSubtitle}`}
          />
        );

      case 'partner-flow':
        return (
          <PartnerWelcomeFlow
            userName={userName}
            onComplete={handlePartnerFlowComplete}
          />
        );

      case 'complete':
        return (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl text-white mb-4">Welcome to MAIA</h1>
              <p className="text-gray-300">Redirecting to your consciousness computing session...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PartnerProvider forcedPartner={params.slug}>
      <div className="w-full h-screen">
        {renderCurrentPhase()}
      </div>
    </PartnerProvider>
  );
}