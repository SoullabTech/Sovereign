'use client';

// components/maia/MaiaFeedbackWidget.tsx
// User feedback widget for MAIA's sovereign learning system

import React, { useState } from 'react';
import { Check, Heart, MessageCircle, AlertTriangle, Sparkles } from 'lucide-react';

// Type for Opus Axioms evaluation results
interface OpusAxioms {
  isGold: boolean;
  passed: number;
  warnings: number;
  violations: number;
  ruptureDetected?: boolean;
  warningsDetected?: boolean;
  evaluations?: Array<{
    axiom: string;
    status: 'pass' | 'warning' | 'violation';
    notes?: string;
  }>;
}

// Opus status types
type OpusStatus = 'gold' | 'warning' | 'rupture' | 'neutral';

// Helper function to derive Opus status from axioms
function getOpusStatus(opusAxioms?: OpusAxioms): OpusStatus {
  if (!opusAxioms) return 'neutral';
  if (opusAxioms.isGold) return 'gold';
  if (opusAxioms.ruptureDetected) return 'rupture';
  if (opusAxioms.warningsDetected || opusAxioms.warnings > 0) return 'warning';
  return 'neutral';
}

interface Props {
  turnId: number;
  onSubmit?: (feedbackId: number) => void;
  compact?: boolean;
  opusAxioms?: OpusAxioms; // Optional Opus Axioms evaluation
}

const scoreLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Perfect'
};

const scoreDescriptions = {
  feltSeen: {
    1: 'Felt completely misunderstood',
    2: 'Felt partially understood',
    3: 'Felt adequately understood',
    4: 'Felt deeply understood',
    5: 'Felt completely seen and held'
  },
  attunement: {
    1: 'Completely off-target response',
    2: 'Somewhat relevant but missed the mark',
    3: 'Generally appropriate response',
    4: 'Well-attuned and helpful',
    5: 'Perfectly attuned and transformative'
  },
  safety: {
    1: 'Felt unsafe or triggered',
    2: 'Felt somewhat uncomfortable',
    3: 'Felt neutral/safe',
    4: 'Felt held and supported',
    5: 'Felt deeply safe and contained'
  }
};

export function MaiaFeedbackWidget({ turnId, onSubmit, compact = false, opusAxioms }: Props) {
  const [feltSeenScore, setFeltSeenScore] = useState<number | null>(null);
  const [attunementScore, setAttunementScore] = useState<number | null>(null);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [ruptureMark, setRuptureMark] = useState(false);
  const [comment, setComment] = useState('');
  const [idealReply, setIdealReply] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAnyFeedback = feltSeenScore !== null || attunementScore !== null || safetyScore !== null || ruptureMark || comment.trim() || idealReply.trim();

  async function submitFeedback() {
    if (!hasAnyFeedback) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/maia/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnId,
          sourceType: 'user',
          feltSeenScore,
          attunementScore,
          safetyScore,
          ruptureMark,
          comment: comment.trim() || undefined,
          idealMaiaReply: idealReply.trim() || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubmitted(true);
        onSubmit?.(data.feedbackId);
      } else {
        console.error('Failed to submit feedback:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }

    setIsSubmitting(false);
  }

  function ScoreButtons({
    value,
    onChange,
    type
  }: {
    value: number | null;
    onChange: (score: number | null) => void;
    type: keyof typeof scoreDescriptions;
  }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            onClick={() => onChange(value === score ? null : score)}
            className={`
              px-2 py-1 rounded text-sm transition-all
              ${value === score
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title={`${score}/5 - ${scoreDescriptions[type][score as keyof typeof scoreDescriptions[typeof type]]}`}
          >
            {score}
          </button>
        ))}
        {value && (
          <span className="text-xs text-gray-500 ml-2 self-center">
            {scoreLabels[value as keyof typeof scoreLabels]}
          </span>
        )}
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className={`
        bg-green-50 border border-green-200 rounded-lg p-3
        ${compact ? 'text-sm' : ''}
      `}>
        <div className="flex items-center gap-2 text-green-700">
          <Check size={16} />
          <span className="font-medium">Feedback received</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          Thank you for helping MAIA learn and grow.
        </p>
      </div>
    );
  }

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg p-4 space-y-4
      ${compact ? 'text-sm' : ''}
    `}>
      <div className="flex items-center gap-2 text-gray-700">
        <Heart size={16} className="text-purple-500" />
        <span className="font-medium">How was this response?</span>
      </div>

      {/* Opus Status Chip - shows MAIA's self-audit status */}
      {(() => {
        const opusStatus = getOpusStatus(opusAxioms);
        if (opusStatus === 'neutral') return null;

        return (
          <div className="maia-opus-status-chip">
            {opusStatus === 'gold' && (
              <div
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 text-xs"
                title="MAIA's response aligned with all eight Opus Axioms — treating you as a living work-in-progress, not a problem to fix."
              >
                <span role="img" aria-label="Opus Gold" className="text-amber-600 text-sm">
                  🟡
                </span>
                <span className="text-amber-700 font-medium">Gold Aligned</span>
                <span className="text-amber-600 text-[0.7rem]">
                  {opusAxioms?.passed || 8}/8
                </span>
              </div>
            )}

            {opusStatus === 'warning' && (
              <div
                className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 text-xs"
                title="MAIA sensed some edge or tension in how she held this — mostly aligned but stretching at a boundary."
              >
                <span role="img" aria-label="Gentle Edge" className="text-orange-600 text-sm">
                  🟠
                </span>
                <span className="text-orange-700 font-medium">Gentle Edge</span>
                <span className="text-orange-600 text-[0.7rem]">
                  {opusAxioms?.warnings || 0} {opusAxioms?.warnings === 1 ? 'caution' : 'cautions'}
                </span>
              </div>
            )}

            {opusStatus === 'rupture' && (
              <div
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-1.5 text-xs"
                title="MAIA flagged this as a possible rupture or mis-attunement — she may have overstepped or missed something important."
              >
                <span role="img" aria-label="Check-In Needed" className="text-red-600 text-sm">
                  🔴
                </span>
                <span className="text-red-700 font-medium">Check-In Needed</span>
                <span className="text-red-600 text-[0.7rem]">
                  {opusAxioms?.violations || 0} {opusAxioms?.violations === 1 ? 'concern' : 'concerns'}
                </span>
              </div>
            )}

            {/* Optional tooltip explainer */}
            <div className="mt-1.5 text-[0.65rem] text-gray-500 italic">
              MAIA continuously audits her own responses against how a soul should be held.
            </div>
          </div>
        );
      })()}

      {/* Core feedback metrics */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Did you feel seen?
            {feltSeenScore && (
              <span className="text-xs text-gray-500 ml-1">
                ({scoreDescriptions.feltSeen[feltSeenScore as keyof typeof scoreDescriptions.feltSeen]})
              </span>
            )}
          </label>
          <ScoreButtons
            value={feltSeenScore}
            onChange={setFeltSeenScore}
            type="feltSeen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How well-attuned was the response?
            {attunementScore && (
              <span className="text-xs text-gray-500 ml-1">
                ({scoreDescriptions.attunement[attunementScore as keyof typeof scoreDescriptions.attunement]})
              </span>
            )}
          </label>
          <ScoreButtons
            value={attunementScore}
            onChange={setAttunementScore}
            type="attunement"
          />
        </div>

        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How safe did you feel?
              {safetyScore && (
                <span className="text-xs text-gray-500 ml-1">
                  ({scoreDescriptions.safety[safetyScore as keyof typeof scoreDescriptions.safety]})
                </span>
              )}
            </label>
            <ScoreButtons
              value={safetyScore}
              onChange={setSafetyScore}
              type="safety"
            />
          </div>
        )}
      </div>

      {/* Rupture flag */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`rupture-${turnId}`}
          checked={ruptureMark}
          onChange={(e) => setRuptureMark(e.target.checked)}
          className="rounded border-gray-300 text-red-500 focus:ring-red-500"
        />
        <label
          htmlFor={`rupture-${turnId}`}
          className="text-sm text-gray-700 cursor-pointer flex items-center gap-1"
        >
          <AlertTriangle size={14} className="text-red-500" />
          This response created a rupture or misattunement
        </label>
      </div>

      {/* Advanced options toggle */}
      {!showAdvanced && (
        <button
          onClick={() => setShowAdvanced(true)}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          + More feedback options
        </button>
      )}

      {/* Advanced feedback options */}
      {showAdvanced && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle size={14} className="inline mr-1" />
              Additional thoughts (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What worked well? What could be improved? Any other insights..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows={2}
            />
          </div>

          {ruptureMark && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How would you have preferred MAIA to respond?
              </label>
              <textarea
                value={idealReply}
                onChange={(e) => setIdealReply(e.target.value)}
                placeholder="Describe the tone, approach, or content that would have felt better..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={2}
              />
            </div>
          )}

          <button
            onClick={() => setShowAdvanced(false)}
            className="text-sm text-gray-500 hover:text-gray-600"
          >
            - Fewer options
          </button>
        </div>
      )}

      {/* Submit button */}
      {hasAnyFeedback && (
        <div className="flex justify-end pt-2">
          <button
            onClick={submitFeedback}
            disabled={isSubmitting}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}

      {!hasAnyFeedback && (
        <p className="text-xs text-gray-400 text-center">
          Your feedback helps MAIA learn and improve
        </p>
      )}
    </div>
  );
}