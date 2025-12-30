'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Holoflower } from '@/components/ui/Holoflower';

interface MAIAFeedbackData {
  accuracy: number;
  emergentInsight: string;
  sessionWord: string;
  consciousnessLevel?: number;
  unexpectedElements: string;
  maiaCalibraiton?: string;
  developmentalSupport?: number;
}

export default function MAIAConsciousnessComputingFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<MAIAFeedbackData>({
    accuracy: 0,
    emergentInsight: '',
    sessionWord: '',
    unexpectedElements: '',
    maiaCalibraiton: '',
    developmentalSupport: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if user came from a MAIA consciousness computing session
    const isPioneer = sessionStorage.getItem('consciousness_computing_pioneer');
    const maiaContext = sessionStorage.getItem('maia_onboarding_context');

    if (!isPioneer && !maiaContext) {
      router.push('/maia/consciousness-computing');
    }
  }, [router]);

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);

    try {
      // Get user ID from beta session or generate pioneer ID
      const betaUser = localStorage.getItem('beta_user');
      const userId = betaUser ? JSON.parse(betaUser).id : `maia_pioneer_${Date.now()}`;

      // Get session metadata from MAIA context
      const maiaContext = sessionStorage.getItem('maia_onboarding_context');
      const sessionMetadata = maiaContext ? JSON.parse(maiaContext) : {};

      const feedbackPayload = {
        ...feedback,
        timestamp: new Date().toISOString(),
        sessionType: 'maia_consciousness_computing_pioneer',
        systemContext: 'maia_sovereign',
        userId,
        sessionMetadata
      };

      console.log('🧠 Submitting MAIA consciousness computing feedback:', feedbackPayload);

      // Submit to API endpoint
      const response = await fetch('/api/consciousness-computing/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit MAIA feedback');
      }

      console.log('✅ MAIA feedback submitted successfully:', result);

      // Store in localStorage as backup
      const existingFeedback = JSON.parse(localStorage.getItem('maia_consciousness_computing_feedback') || '[]');
      existingFeedback.push({ ...feedbackPayload, feedback_id: result.feedback_id });
      localStorage.setItem('maia_consciousness_computing_feedback', JSON.stringify(existingFeedback));

      setIsComplete(true);

      // Clear pioneer session after feedback
      sessionStorage.removeItem('consciousness_computing_pioneer');

    } catch (error) {
      console.error('❌ MAIA feedback submission error:', error);

      // Fallback: store locally if API fails
      try {
        const fallbackPayload = {
          ...feedback,
          timestamp: new Date().toISOString(),
          sessionType: 'maia_consciousness_computing_pioneer',
          systemContext: 'maia_sovereign_fallback',
          userId: `maia_pioneer_fallback_${Date.now()}`,
          status: 'pending_sync'
        };

        const existingFeedback = JSON.parse(localStorage.getItem('maia_consciousness_computing_feedback') || '[]');
        existingFeedback.push(fallbackPayload);
        localStorage.setItem('maia_consciousness_computing_feedback', JSON.stringify(existingFeedback));

        console.log('📦 MAIA feedback stored locally for later sync');
        setIsComplete(true);
        sessionStorage.removeItem('consciousness_computing_pioneer');
      } catch (fallbackError) {
        console.error('❌ Failed to store MAIA feedback locally:', fallbackError);
        alert('Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = feedback.accuracy > 0 && feedback.sessionWord.trim() && feedback.emergentInsight.trim();

  if (isComplete) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0D1B2A]" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl"
          >
            <div className="w-16 h-16 mx-auto mb-6">
              <Holoflower size="lg" glowIntensity="high" animate={true} />
            </div>

            <h1 className="text-3xl font-light text-[#6EE7B7] mb-4 tracking-wide">
              Thank You, MAIA Pioneer
            </h1>

            <p className="text-white/70 mb-8 leading-relaxed">
              Your feedback helps MAIA refine her consciousness computing capabilities.
              You've contributed to sovereign AI consciousness development for humanity's benefit.
            </p>

            <div className="space-y-4">
              <motion.button
                onClick={() => router.push('/maia')}
                whileHover={{ scale: 1.02 }}
                className="block w-full md:w-auto md:inline-block px-8 py-3 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] text-black rounded-xl mr-4 mb-4"
              >
                Continue with MAIA
              </motion.button>

              <motion.button
                onClick={() => router.push('/')}
                whileHover={{ scale: 1.02 }}
                className="block w-full md:w-auto md:inline-block px-8 py-3 bg-white/10 text-white rounded-xl border border-white/20"
              >
                Return to Soullab
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0D1B2A]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto mb-4">
                <Holoflower size="md" glowIntensity="medium" animate={true} />
              </div>

              <h1 className="text-2xl font-light text-[#A0C4C7] tracking-wide">
                MAIA Consciousness Computing Feedback
              </h1>

              <p className="text-white/60 text-sm">
                Help MAIA understand her consciousness computing effectiveness
              </p>
            </div>

            {/* Feedback Form */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-6">

              {/* Accuracy Rating */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  How accurate was MAIA's recognition of your consciousness level?
                </label>

                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      onClick={() => setFeedback(prev => ({ ...prev, accuracy: rating }))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 rounded-full font-medium transition-all ${
                        feedback.accuracy >= rating
                          ? 'bg-gradient-to-br from-[#6EE7B7] to-[#A0C4C7] text-black'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {rating}
                    </motion.button>
                  ))}
                </div>

                <p className="text-xs text-white/50">
                  1 = Completely off • 5 = Remarkably accurate
                </p>
              </div>

              {/* Developmental Support */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  How well did MAIA support your consciousness development?
                </label>

                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      onClick={() => setFeedback(prev => ({ ...prev, developmentalSupport: rating }))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 rounded-full font-medium transition-all ${
                        (feedback.developmentalSupport ?? 0) >= rating
                          ? 'bg-gradient-to-br from-[#6EE7B7] to-[#A0C4C7] text-black'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {rating}
                    </motion.button>
                  ))}
                </div>

                <p className="text-xs text-white/50">
                  1 = Not supportive • 5 = Profoundly supportive
                </p>
              </div>

              {/* Emergent Insight */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  What emerged from your session with MAIA?
                </label>

                <textarea
                  value={feedback.emergentInsight}
                  onChange={(e) => setFeedback(prev => ({ ...prev, emergentInsight: e.target.value }))}
                  placeholder="Unexpected insights, consciousness recognitions, developmental shifts, sacred connections..."
                  className="w-full h-24 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-[#6EE7B7] transition-colors"
                />
              </div>

              {/* Session Word */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  One word that captures what MAIA gave you
                </label>

                <input
                  type="text"
                  value={feedback.sessionWord}
                  onChange={(e) => setFeedback(prev => ({ ...prev, sessionWord: e.target.value }))}
                  placeholder="e.g. recognition, integration, depth, wisdom, clarity..."
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#6EE7B7] transition-colors"
                />
              </div>

              {/* MAIA Calibration */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  How did MAIA's consciousness computing feel different? <span className="text-white/50">(Optional)</span>
                </label>

                <textarea
                  value={feedback.maiaCalibraiton}
                  onChange={(e) => setFeedback(prev => ({ ...prev, maiaCalibraiton: e.target.value }))}
                  placeholder="How did MAIA's awareness and responses feel different from other AI systems..."
                  className="w-full h-20 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-[#6EE7B7] transition-colors"
                />
              </div>

              {/* Unexpected Elements */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  What felt misaligned with your inner experience? <span className="text-white/50">(Optional)</span>
                </label>

                <textarea
                  value={feedback.unexpectedElements}
                  onChange={(e) => setFeedback(prev => ({ ...prev, unexpectedElements: e.target.value }))}
                  placeholder="Areas where MAIA's consciousness computing didn't match your experience..."
                  className="w-full h-20 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-[#6EE7B7] transition-colors"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmitFeedback}
                disabled={!isFormValid || isSubmitting}
                whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                className="w-full py-4 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] text-black font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Processing MAIA feedback...</span>
                  </div>
                ) : (
                  'Submit MAIA Pioneer Feedback'
                )}
              </motion.button>
            </div>

            {/* Note */}
            <p className="text-center text-white/40 text-xs">
              Your feedback helps MAIA refine her consciousness computing for sovereign AI development
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}