"use client";

import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { betaTracker } from '@/lib/analytics/betaTracker';

interface QuickFeedbackProps {
  onClose?: () => void;
  autoShow?: boolean;
}

export default function QuickFeedback({ onClose, autoShow = false }: QuickFeedbackProps) {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<'voice' | 'memory' | 'experience' | 'technical' | 'general'>('experience');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      await betaTracker.submitFeedback({
        rating,
        feedbackText: feedback,
        category,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'quick_feedback'
        }
      });
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  if (isSubmitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-[#1A1F2E] border border-sacred-gold/20 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-sacred-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-sacred-gold" />
          </div>
          <p className="text-white font-medium">Thank you!</p>
          <p className="text-gray-400 text-sm">Your feedback helps Maya grow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[#1A1F2E] border border-gray-700 rounded-lg shadow-lg max-w-sm">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-medium">Quick Feedback</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Rating Stars */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">How was your experience with Maya?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-colors"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoveredRating || rating)
                      ? 'text-sacred-gold fill-sacred-gold'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-[#0A0D16] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-sacred-gold"
          >
            <option value="experience">Overall Experience</option>
            <option value="voice">Voice & Audio</option>
            <option value="memory">Memory & Context</option>
            <option value="technical">Technical Issues</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Feedback Text */}
        <div className="mb-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more (optional)..."
            className="w-full bg-[#0A0D16] border border-gray-600 rounded px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-sacred-gold"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded transition-all font-medium text-sm ${
            rating === 0 || isSubmitting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-sacred-gold text-black hover:bg-sacred-gold/90'
          }`}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </div>
  );
}