'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TealWelcomeFlow from './TealWelcomeFlow';
import FourthWelcomeInterface from './FourthWelcomeInterface';
import FifthWelcomeInterface from './FifthWelcomeInterface';

interface CompleteWelcomeFlowProps {
  userName?: string;
  onComplete: () => void;
}

export default function CompleteWelcomeFlow({ userName = "Kelly", onComplete }: CompleteWelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTealWelcomeComplete = () => {
    setCurrentStep(2);
  };

  const renderCurrentInterface = () => {
    switch (currentStep) {
      case 1:
        return (
          <TealWelcomeFlow
            userName={userName}
            onComplete={handleTealWelcomeComplete}
          />
        );
      case 2:
        return (
          <FourthWelcomeInterface
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <FifthWelcomeInterface
            onComplete={onComplete}
            onBack={handleBack}
          />
        );
      default:
        return (
          <TealWelcomeFlow
            userName={userName}
            onComplete={handleTealWelcomeComplete}
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