// @ts-nocheck - Prototype file, not type-checked
'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePartnerConfig } from '../../lib/partner/usePartnerConfig';
import ElementalOrientation from '../onboarding/ElementalOrientation';
import { FAQSection } from '../onboarding/FAQSection';
import { SageTealWelcome } from '../onboarding/SageTealWelcome';
import { MAIADaimonIntroduction } from '../onboarding/MAIADaimonIntroduction';
import { ConsciousnessPreparation } from '../onboarding/ConsciousnessPreparation';
import PartnerWelcomeHeader from './PartnerWelcomeHeader';

interface PartnerWelcomeFlowProps {
  userName?: string;
  onComplete: () => void;
}

export default function PartnerWelcomeFlow({ userName = "Explorer", onComplete }: PartnerWelcomeFlowProps) {
  const { partnerConfig, isPartnerThemed } = usePartnerConfig();
  const [currentStep, setCurrentStep] = useState(0);

  if (!partnerConfig) {
    // Fallback to standard flow if no partner config
    return null;
  }

  const config = partnerConfig.onboarding;

  // Build step sequence based on partner configuration
  const steps = [];

  if (config.includeElementalOrientation) {
    steps.push('elemental');
  }
  if (config.includeFAQSection) {
    steps.push('faq');
  }
  steps.push('sage-teal'); // Always include this core step
  if (config.includeDaimonIntroduction) {
    steps.push('daimon');
  }
  if (config.includeConsciousnessPreparation) {
    steps.push('consciousness-prep');
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const renderCurrentStep = () => {
    const currentStepType = steps[currentStep];

    switch (currentStepType) {
      case 'elemental':
        return (
          <ElementalOrientation
            explorerName={userName}
            onComplete={handleStepComplete}
            partnerContext={config.partnerContext}
          />
        );

      case 'faq':
        return (
          <FAQSection
            userName={userName}
            onComplete={handleStepComplete}
            partnerName={config.organizationName}
          />
        );

      case 'sage-teal':
        return (
          <SageTealWelcome
            userName={userName}
            onComplete={handleStepComplete}
            partnerName={config.organizationName}
            customMessage={config.customWelcomeMessages?.[0]}
          />
        );

      case 'daimon':
        return (
          <MAIADaimonIntroduction
            userName={userName}
            onComplete={handleStepComplete}
            partnerContext={config.partnerContext}
          />
        );

      case 'consciousness-prep':
        return (
          <ConsciousnessPreparation
            userName={userName}
            onComplete={(data: any) => {
              // Store partner-specific data
              if (data.wisdomFacets?.length || data.focusAreas?.length || data.explorationIntent) {
                localStorage.setItem(`${partnerConfig.slug}-consciousnessPreparation`, JSON.stringify(data));
              }
              handleStepComplete();
            }}
            partnerContext={config.partnerContext}
          />
        );

      default:
        return (
          <ElementalOrientation
            explorerName={userName}
            onComplete={handleStepComplete}
          />
        );
    }
  };

  return (
    <div className={`w-full h-screen ${isPartnerThemed ? 'partner-themed' : ''}`}>
      {/* Partner-specific header */}
      <PartnerWelcomeHeader
        partnerConfig={partnerConfig}
        currentStep={currentStep + 1}
        totalSteps={steps.length}
      />

      {/* Main onboarding flow */}
      <AnimatePresence mode="wait">
        <div key={currentStep}>
          {renderCurrentStep()}
        </div>
      </AnimatePresence>

      {/* Partner branding footer (optional) */}
      {partnerConfig.branding.supportUrl && (
        <div className="fixed bottom-4 right-4 z-50">
          <a
            href={partnerConfig.branding.supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs partner-secondary hover:partner-accent transition-colors"
          >
            Need help? Contact {partnerConfig.branding.partnerName} support
          </a>
        </div>
      )}
    </div>
  );
}