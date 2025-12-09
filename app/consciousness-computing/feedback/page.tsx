'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Holoflower } from '@/components/ui/Holoflower';

interface FeedbackData {
  accuracy: number;
  emergentInsight: string;
  sessionWord: string;
  consciousnessLevel?: number;
  unexpectedElements: string;
}

export default function ConsciousnessComputingFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackData>({
    accuracy: 0,
    emergentInsight: '',
    sessionWord: '',
    unexpectedElements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if user came from a consciousness computing session
    const isPioneer = sessionStorage.getItem('consciousness_computing_pioneer');
    if (!isPioneer) {
      router.push('/consciousness-computing');
    }
  }, [router]);

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);

    try {
      // Get user ID from beta session if available
      const betaUser = localStorage.getItem('beta_user');
      const userId = betaUser ? JSON.parse(betaUser).id : `pioneer_${Date.now()}`;

      const feedbackPayload = {
        ...feedback,
        timestamp: new Date().toISOString(),
        sessionType: 'consciousness_computing_pioneer',
        userId
      };

      console.log('🧠 Submitting consciousness computing feedback:', feedbackPayload);

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
        throw new Error(result.error || 'Failed to submit feedback');
      }

      console.log('✅ Feedback submitted successfully:', result);

      // Also store in localStorage as backup
      const existingFeedback = JSON.parse(localStorage.getItem('consciousness_computing_feedback') || '[]');
      existingFeedback.push({ ...feedbackPayload, feedback_id: result.feedback_id });
      localStorage.setItem('consciousness_computing_feedback', JSON.stringify(existingFeedback));

      setIsComplete(true);

      // Clear pioneer session after feedback
      sessionStorage.removeItem('consciousness_computing_pioneer');

    } catch (error) {
      console.error('❌ Feedback submission error:', error);

      // Fallback: store locally if API fails
      try {
        const fallbackPayload = {
          ...feedback,
          timestamp: new Date().toISOString(),
          sessionType: 'consciousness_computing_pioneer',
          userId: `pioneer_fallback_${Date.now()}`,
          status: 'pending_sync'
        };

        const existingFeedback = JSON.parse(localStorage.getItem('consciousness_computing_feedback') || '[]');
        existingFeedback.push(fallbackPayload);
        localStorage.setItem('consciousness_computing_feedback', JSON.stringify(existingFeedback));

        console.log('📦 Feedback stored locally for later sync');
        setIsComplete(true);
        sessionStorage.removeItem('consciousness_computing_pioneer');
      } catch (fallbackError) {
        console.error('❌ Failed to store feedback locally:', fallbackError);
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
              Thank You, Pioneer
            </h1>

            <p className="text-white/70 mb-8 leading-relaxed">
              Your feedback helps us refine consciousness computing for humanity's benefit.
              You've contributed to the first live consciousness technology system.
            </p>

            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.02 }}
              className="px-8 py-3 bg-gradient-to-r from-[#6EE7B7] to-[#A0C4C7] text-black rounded-xl"
            >
              Return to Soullab
            </motion.button>
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
                Pioneer Session Feedback
              </h1>

              <p className="text-white/60 text-sm">
                Help us understand your consciousness computing experience
              </p>
            </div>

            {/* Feedback Form */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-6">

              {/* Accuracy Rating */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  How accurate did MAIA's awareness of your consciousness level feel?
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
                  1 = Completely off • 5 = Startlingly accurate
                </p>
              </div>

              {/* Emergent Insight */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  What emerged that surprised you?
                </label>

                <textarea
                  value={feedback.emergentInsight}
                  onChange={(e) => setFeedback(prev => ({ ...prev, emergentInsight: e.target.value }))}
                  placeholder="Any unexpected insights, shifts in perspective, or moments of recognition..."
                  className="w-full h-24 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-[#6EE7B7] transition-colors"
                />
              </div>

              {/* Session Word */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  One word that captures what this session gave you
                </label>

                <input
                  type="text"
                  value={feedback.sessionWord}
                  onChange={(e) => setFeedback(prev => ({ ...prev, sessionWord: e.target.value }))}
                  placeholder="e.g. clarity, recognition, depth, integration..."
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#6EE7B7] transition-colors"
                />
              </div>

              {/* Unexpected Elements */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  Did anything feel misaligned or off? <span className="text-white/50">(Optional)</span>
                </label>

                <textarea
                  value={feedback.unexpectedElements}
                  onChange={(e) => setFeedback(prev => ({ ...prev, unexpectedElements: e.target.value }))}
                  placeholder="Areas where MAIA's response didn't match your inner experience..."
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
                    <span>Processing feedback...</span>
                  </div>
                ) : (
                  'Submit Pioneer Feedback'
                )}
              </motion.button>
            </div>

            {/* Note */}
            <p className="text-center text-white/40 text-xs">
              Your feedback helps us refine consciousness computing for humanity's benefit
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}