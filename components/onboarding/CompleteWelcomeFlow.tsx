'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ElementalOrientation from './ElementalOrientation';
import { FAQSection } from './FAQSection';
import { SageTealWelcome } from './SageTealWelcome';
import { ConsciousnessPreparation } from './ConsciousnessPreparation';
import { BirthDataStep } from './BirthDataStep';

interface CompleteWelcomeFlowProps {
  userName?: string;
  onComplete: () => void;
}

// Step map (starts at 2 — ElementalOrientation + FAQ done on earlier pages)
// 0 → ElementalOrientation
// 1 → FAQSection
// 2 → ConsciousnessPreparation
// 3 → BirthDataStep  (new — activates personalised astrology)
// 4 → SageTealWelcome (final welcome screen)

export default function CompleteWelcomeFlow({ userName = "Explorer", onComplete }: CompleteWelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(2); // Start at ConsciousnessPreparation

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleElementalOrientationComplete = () => {
    setCurrentStep(1);
  };

  const handleFAQComplete = () => {
    setCurrentStep(2);
  };

  const handleConsciousnessPreparationComplete = (data: any) => {
    // Store the consciousness preparation data locally if needed
    // Following disposable pixel philosophy - store minimally, use functionally
    if (data.wisdomFacets?.length || data.focusAreas?.length || data.explorationIntent) {
      localStorage.setItem('consciousnessPreparation', JSON.stringify(data));
    }
    setCurrentStep(3);
  };

  const handleBirthDataComplete = () => {
    setCurrentStep(4);
  };

  const handleSageTealWelcomeComplete = () => {
    onComplete();
  };

  const renderCurrentInterface = () => {
    switch (currentStep) {
      case 0:
        return (
          <ElementalOrientation
            explorerName={userName}
            onComplete={handleElementalOrientationComplete}
          />
        );
      case 1:
        return (
          <FAQSection
            userName={userName}
            onComplete={handleFAQComplete}
          />
        );
      case 2:
        return (
          <ConsciousnessPreparation
            userName={userName}
            onComplete={handleConsciousnessPreparationComplete}
          />
        );
      case 3:
        return (
          <BirthDataStep
            userName={userName}
            onComplete={handleBirthDataComplete}
          />
        );
      case 4:
        return (
          <SageTealWelcome
            userName={userName}
            onComplete={handleSageTealWelcomeComplete}
          />
        );
      default:
        return (
          <ElementalOrientation
            explorerName={userName}
            onComplete={handleElementalOrientationComplete}
          />
        );
    }
  };

  return (
    <div className="w-full h-screen">
      <AnimatePresence mode="wait">
        {renderCurrentInterface()}
      </AnimatePresence>
    </div>
  );
}
