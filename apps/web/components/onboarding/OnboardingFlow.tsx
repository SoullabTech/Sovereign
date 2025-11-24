'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LogoThreshold from './LogoThreshold';
import GreetingIntro from './GreetingIntro';
import FourDoorsNav from './FourDoorsNav';
import ToneStyleSelector from './ToneStyleSelector';

export default function OnboardingFlow({ onFinish }: { onFinish: (prefs: { tone: number; style: string }) => void }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({ tone: 0.5, style: 'prose' });

  const next = () => setStep((s) => s + 1);

  const handleFinish = (finalPrefs: { tone: number; style: string }) => {
    setPrefs(finalPrefs);
    onFinish(finalPrefs);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
      <AnimatePresence mode="wait">
        {step === 0 && <LogoThreshold key="step0" onNext={next} />}
        {step === 1 && <GreetingIntro key="step1" onNext={next} />}
        {step === 2 && <FourDoorsNav key="step2" onNext={next} />}
        {step === 3 && <ToneStyleSelector key="step3" onFinish={handleFinish} />}
      </AnimatePresence>
    </div>
  );
}