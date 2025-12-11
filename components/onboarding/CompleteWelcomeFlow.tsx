'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ElementalOrientation from './ElementalOrientation';
import { FAQSection } from './FAQSection';
import { SageTealWelcome } from './SageTealWelcome';
import { MAIADaimonIntroduction } from './MAIADaimonIntroduction';
import { ConsciousnessPreparation } from './ConsciousnessPreparation';
import FifthWelcomeInterface from './FifthWelcomeInterface';

interface CompleteWelcomeFlowProps {
  userName?: string;
  onComplete: () => void;
}

export default function CompleteWelcomeFlow({ userName = "Kelly", onComplete }: CompleteWelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(2); // Start at SageTealWelcome since ElementalOrientation and FAQ are already done

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

  const handleSageTealWelcomeComplete = () => {
    setCurrentStep(4);
  };

  const handleDaimonIntroComplete = () => {
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
          <SageTealWelcome
            userName={userName}
            onComplete={handleSageTealWelcomeComplete}
          />
        );
      case 4:
        return (
          <MAIADaimonIntroduction
            userName={userName}
            onComplete={handleDaimonIntroComplete}
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