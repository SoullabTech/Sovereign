'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Star, AlertCircle, Heart, Zap } from 'lucide-react';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'praise' | 'other'>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Listen for custom event from MenuBar
  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('openFeedbackModal', handleOpenModal);
    return () => window.removeEventListener('openFeedbackModal', handleOpenModal);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    try {
      // Store feedback in Supabase or your backend
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          category,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setFeedback('');
          setCategory('other');
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      // Still close to avoid frustration
      alert('Thank you for your feedback! We\'ll review it soon.');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: AlertCircle, color: 'text-red-400' },
    { value: 'feature', label: 'Feature Request', icon: Zap, color: 'text-amber-500' },
    { value: 'praise', label: 'Love It', icon: Heart, color: 'text-pink-400' },
    { value: 'other', label: 'Other', icon: Star, color: 'text-amber-200' }
  ];

  return (
    <>
      {/* Feedback Modal - Triggered from MenuBar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#1a1f3a] border border-amber-500/30 rounded-lg shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-200">
                Beta Feedback
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-amber-200/70 hover:text-amber-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <p className="text-amber-200 text-lg mb-2">Thank you, Explorer!</p>
                <p className="text-amber-200/60 text-sm">Your feedback shapes Soullab</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4">
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="text-amber-200/70 text-sm mb-2 block">
                    What\'s on your mind?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategory(value as any)}
                        className={`p-3 rounded-lg border transition-all ${
                          category === value
                            ? 'bg-amber-500/20 border-amber-500'
                            : 'bg-black/30 border-amber-500/20 hover:border-amber-500/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                        <span className="text-xs text-amber-200/70">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="mb-4">
                  <label className="text-amber-200/70 text-sm mb-2 block">
                    Your Insight
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 resize-none"
                    rows={4}
                    placeholder="Share your experience, report bugs, or suggest improvements..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>

                <p className="text-xs text-amber-200/40 text-center mt-3">
                  Your feedback helps us evolve
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}