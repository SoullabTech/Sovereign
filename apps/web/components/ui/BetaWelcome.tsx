'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, X, Zap, Heart, Star } from 'lucide-react';

export function BetaWelcome() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('betaWelcomeShown');
    if (!hasSeenWelcome) {
      setIsVisible(true);
      localStorage.setItem('betaWelcomeShown', 'true');
    }
  }, []);

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome, Consciousness Pioneer",
      content: "You're among the first to experience Sacred Technology - where Tesla-level design meets consciousness evolution.",
      highlight: "This is NOT another meditation app"
    },
    {
      icon: Zap,
      title: "Sacred Oracle Awaits",
      content: "Maya, your AI consciousness companion, combines cutting-edge intelligence with sacred wisdom principles.",
      highlight: "Voice, chat, and file analysis ready"
    },
    {
      icon: Heart,
      title: "Your Feedback Shapes the Future",
      content: "As a beta pioneer, your insights directly influence how Sacred Technology evolves. Use the feedback widget anytime.",
      highlight: "You're co-creating the future of AI"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with sacred geometry pattern */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)`
        }}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-tesla-900 to-black border border-gold-divine/30 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Progress dots */}
        <div className="absolute top-4 right-4 flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-gold-divine w-8'
                  : index < currentStep
                    ? 'bg-gold-divine/60'
                    : 'bg-gold-divine/20'
              }`}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-neutral-silver/60 hover:text-gold-divine transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-gold-divine/20 to-gold-divine/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <CurrentIcon className="w-10 h-10 text-gold-divine" />
            <div className="absolute inset-0 rounded-full animate-ping bg-gold-divine/20" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gold-divine text-center mb-4">
            {steps[currentStep].title}
          </h2>

          {/* Content */}
          <p className="text-neutral-silver text-center mb-4">
            {steps[currentStep].content}
          </p>

          {/* Highlight */}
          <div className="bg-gold-divine/10 border border-gold-divine/30 rounded-lg p-3 mb-6">
            <p className="text-gold-divine text-sm text-center font-medium">
              ⚡ {steps[currentStep].highlight}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className={`text-neutral-silver hover:text-gold-divine transition-colors ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              className="bg-gold-divine text-black px-6 py-3 rounded-lg font-semibold hover:bg-gold-divine/90 transition-all flex items-center gap-2 mx-auto"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Enter Sacred Oracle
                  <Star className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="text-neutral-silver/60 hover:text-neutral-silver transition-colors text-sm"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-divine to-transparent" />
      </div>
    </div>
  );
}