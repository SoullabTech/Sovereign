// components/MaiaFeedbackWidget.tsx
// Feedback widget for MAIA conversation training

'use client';

import { useState } from 'react';
import { MaiaTurnFeedbackPayload } from '@/lib/types/maia';

interface MaiaFeedbackWidgetProps {
  turnId: number;
  onFeedbackSubmitted?: (feedbackId: number | null) => void;
  className?: string;
}

export default function MaiaFeedbackWidget({
  turnId,
  onFeedbackSubmitted,
  className = ''
}: MaiaFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Feedback form state
  const [feltSeenScore, setFeltSeenScore] = useState<number | undefined>();
  const [attunementScore, setAttunementScore] = useState<number | undefined>();
  const [safetyScore, setSafetyScore] = useState<number | undefined>();
  const [depthScore, setDepthScore] = useState<number | undefined>();
  const [ruptureFlag, setRuptureFlag] = useState(false);
  const [comment, setComment] = useState('');
  const [idealReply, setIdealReply] = useState('');

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload: MaiaTurnFeedbackPayload = {
        turnId,
        sourceType: 'user',
        feltSeenScore,
        attunementScore,
        safetyScore,
        depthAppropriatenessScore: depthScore,
        ruptureMark: ruptureFlag,
        idealForRepair: ruptureFlag,
        tags: ruptureFlag ? ['rupture', 'needs_improvement'] : ['helpful'],
        comment: comment || undefined,
        idealMaiaReply: idealReply || undefined
      };

      const response = await fetch('/api/maia/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        onFeedbackSubmitted?.(result.feedbackId);
      } else {
        console.error('Failed to submit feedback:', result.error);
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreButtons = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number | undefined;
    onChange: (score: number) => void;
  }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`
              w-8 h-8 rounded-full border text-sm font-medium transition-colors
              ${value === score
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="text-green-800 text-sm">
           Thank you for your feedback! This helps MAIA learn and improve.
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className={`flex justify-end ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          =� Give feedback
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-900">Help MAIA Learn</h4>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          
        </button>
      </div>

      <div className="space-y-3">
        <ScoreButtons
          label="Did you feel seen & understood?"
          value={feltSeenScore}
          onChange={setFeltSeenScore}
        />

        <ScoreButtons
          label="How well was MAIA attuned to you?"
          value={attunementScore}
          onChange={setAttunementScore}
        />

        <ScoreButtons
          label="Did you feel emotionally safe?"
          value={safetyScore}
          onChange={setSafetyScore}
        />

        <ScoreButtons
          label="Was the depth appropriate?"
          value={depthScore}
          onChange={setDepthScore}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`rupture-${turnId}`}
            checked={ruptureFlag}
            onChange={(e) => setRuptureFlag(e.target.checked)}
            className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor={`rupture-${turnId}`} className="text-sm text-gray-700">
            This felt like a conversational rupture
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comments (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What worked well? What could be improved?"
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
            rows={2}
          />
        </div>

        {ruptureFlag && (
          <div>
            <label className="block text-sm font-medium mb-1">
              How would you have preferred MAIA to respond?
            </label>
            <textarea
              value={idealReply}
              onChange={(e) => setIdealReply(e.target.value)}
              placeholder="What would have felt more attuned?"
              className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
              rows={2}
            />
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}