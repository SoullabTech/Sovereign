/**
 * Helper Fund Application Page
 *
 * Form for emerging practitioners to apply for support.
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type SupportType = 'waived' | 'reduced' | 'full_scholarship';
type Duration = '3_months' | '6_months' | 'ongoing';

export default function HelperFundApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state
  const [situation, setSituation] = useState('');
  const [duration, setDuration] = useState<Duration>('3_months');
  const [supportType, setSupportType] = useState<SupportType>('reduced');

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pricing/helper-fund/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation,
          durationRequested: duration,
          supportType,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-maia-sage/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-maia-sage" />
          </div>
          <h1 className="text-2xl font-light text-maia-ink-100 mb-4">
            Application received
          </h1>
          <p className="text-maia-ink-60 mb-8">
            We&apos;ll review your application within 3-5 days and reach out via email.
            Thank you for trusting us with your situation.
          </p>
          <Link href="/maia">
            <Button className="bg-maia-spice-500 hover:bg-maia-spice-600 text-white">
              Return to MAIA
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      {/* Header */}
      <header className="px-6 py-6">
        <Link
          href="/helper-fund"
          className="inline-flex items-center gap-2 text-maia-ink-60 hover:text-maia-ink-80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Helper Fund
        </Link>
      </header>

      {/* Form */}
      <div className="px-6 py-12">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-12">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-rose-400' : 'bg-maia-ink-20/20'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Situation */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-rose-400/10 flex items-center justify-center text-rose-400 mb-6">
                <Heart className="w-6 h-6" />
              </div>

              <h1 className="text-2xl font-light text-maia-ink-100 mb-4">
                Tell us about your situation
              </h1>
              <p className="text-maia-ink-60 mb-8">
                This is confidential. Share whatever feels relevant about why you&apos;re
                seeking support right now.
              </p>

              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="I'm just starting out and..."
                rows={6}
                className="w-full bg-maia-navy-900/50 border border-maia-ink-20/20 rounded-xl p-4 text-maia-ink-100 placeholder:text-maia-ink-40 focus:outline-none focus:border-rose-400/40 resize-none"
              />

              <p className="mt-3 text-xs text-maia-ink-40">
                Minimum 50 characters. Be honest — we&apos;re not looking for hardship olympics.
              </p>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={situation.length < 50}
                  className="bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-light text-maia-ink-100 mb-4">
                How long do you need support?
              </h1>
              <p className="text-maia-ink-60 mb-8">
                Scholarships are designed to bridge a gap. You can reapply if circumstances
                don&apos;t change.
              </p>

              <div className="space-y-3">
                {[
                  { value: '3_months', label: '3 months', desc: 'Short-term bridge' },
                  { value: '6_months', label: '6 months', desc: 'Building phase' },
                  { value: 'ongoing', label: 'Ongoing', desc: "I'm not sure when things will change" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDuration(option.value as Duration)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      duration === option.value
                        ? 'bg-rose-400/10 border-rose-400/40'
                        : 'bg-maia-navy-900/30 border-transparent hover:border-rose-400/20'
                    }`}
                  >
                    <div className={`font-medium ${
                      duration === option.value ? 'text-rose-400' : 'text-maia-ink-80'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-maia-ink-50">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="text-maia-ink-60"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-rose-500 hover:bg-rose-600 text-white group"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Support Type */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-light text-maia-ink-100 mb-4">
                What kind of support would help?
              </h1>
              <p className="text-maia-ink-60 mb-8">
                Be honest about what you need. We&apos;d rather give full support to fewer
                people than partial support to many.
              </p>

              <div className="space-y-3">
                {[
                  { value: 'reduced', label: 'Reduced fee', desc: 'Pay what you can ($10-20/mo)' },
                  { value: 'waived', label: 'Fee waived', desc: 'Studio access at no cost' },
                  { value: 'full_scholarship', label: 'Full scholarship', desc: 'Studio access + support for essentials' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSupportType(option.value as SupportType)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      supportType === option.value
                        ? 'bg-rose-400/10 border-rose-400/40'
                        : 'bg-maia-navy-900/30 border-transparent hover:border-rose-400/20'
                    }`}
                  >
                    <div className={`font-medium ${
                      supportType === option.value ? 'text-rose-400' : 'text-maia-ink-80'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-maia-ink-50">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  onClick={() => setStep(2)}
                  variant="ghost"
                  className="text-maia-ink-60"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-rose-500 hover:bg-rose-600 text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>

              <p className="mt-6 text-xs text-maia-ink-40 text-center">
                Your application is confidential. We&apos;ll respond within 3-5 days.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
