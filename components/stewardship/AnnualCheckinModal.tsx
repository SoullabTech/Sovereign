/**
 * Annual Check-in Modal
 *
 * Special modal for yearly reflection on practice journey.
 * Philosophy: A moment of reflection, not a sales pitch.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnnualCheckinOption {
  value: 'emerging' | 'stable' | 'thriving';
  label: string;
  description: string;
}

interface AnnualCheckinModalProps {
  promptId: string;
  monthsActive: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: AnnualCheckinOption['value']) => void;
}

const OPTIONS: AnnualCheckinOption[] = [
  {
    value: 'emerging',
    label: 'Still emerging',
    description: 'I need support to keep building my practice',
  },
  {
    value: 'stable',
    label: 'Stable',
    description: 'I can sustain myself and my work',
  },
  {
    value: 'thriving',
    label: 'Thriving',
    description: "I'd like to give back and support others",
  },
];

export const AnnualCheckinModal: React.FC<AnnualCheckinModalProps> = ({
  promptId,
  monthsActive,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<AnnualCheckinOption['value'] | null>(null);

  const handleSubmit = () => {
    if (selected) {
      onSubmit(selected);
    }
  };

  const yearLabel = monthsActive === 12 ? 'a year' : `${Math.floor(monthsActive / 12)} years`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-md mx-auto"
          >
            <div className="bg-gradient-to-b from-maia-navy-900 to-maia-navy-950 rounded-2xl shadow-2xl border border-maia-sage/20 overflow-hidden">
              {/* Accent gradient */}
              <div className="h-1 bg-gradient-to-r from-maia-sage/40 to-maia-sage/20" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-maia-ink-60" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-maia-sage/10 flex items-center justify-center text-maia-sage mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>

                {/* Headline */}
                <h2 className="text-xl font-medium text-maia-ink-100 mb-3">
                  A moment to reflect
                </h2>

                {/* Body */}
                <p className="text-maia-ink-60 leading-relaxed mb-8">
                  You&apos;ve been part of Soullab for {yearLabel}. How would you describe your practice right now?
                </p>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelected(option.value)}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${
                        selected === option.value
                          ? 'bg-maia-sage/10 border-maia-sage/40'
                          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-maia-sage/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${
                          selected === option.value ? 'text-maia-sage' : 'text-maia-ink-80'
                        }`}>
                          {option.label}
                        </span>
                        {selected === option.value && (
                          <Check className="w-4 h-4 text-maia-sage" />
                        )}
                      </div>
                      <p className="text-sm text-maia-ink-50">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    selected
                      ? 'bg-maia-sage hover:bg-maia-sage/90 text-maia-navy-950'
                      : 'bg-white/10 text-maia-ink-40 cursor-not-allowed'
                  }`}
                >
                  Continue
                </Button>

                <p className="mt-4 text-xs text-maia-ink-40 text-center">
                  Your answer helps us understand the community and offer the right support.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnnualCheckinModal;
