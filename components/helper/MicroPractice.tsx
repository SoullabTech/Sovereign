'use client';

/**
 * Micro Practice Component
 *
 * Brief, accessible practices members can share with those they support.
 * All practices available to all members. Shareable outside platform.
 *
 * See /docs/HELPER_TOOLS_SPECIFICATION.md for context.
 */

import { useState } from 'react';

type PracticeDomain =
  | 'grounding'
  | 'breath'
  | 'movement'
  | 'reflection'
  | 'connection'
  | 'rest'
  | 'transition';

interface MicroPracticeData {
  id: string;
  title: string;
  duration: '1-min' | '5-min' | '10-min' | '15-min';
  domain: PracticeDomain;
  tradition?: string;
  attribution: string;
  instructions: string;
  variations?: string[];
  whenHelpful: string[];
  shareable: boolean;
}

interface MicroPracticeProps {
  practice: MicroPracticeData;
  onShare?: () => void;
  onLog?: (felt: 'nourishing' | 'neutral' | 'effortful' | 'not-right-now') => void;
  variant?: 'card' | 'expanded' | 'compact';
}

// Domain symbols
const domainSymbols: Record<PracticeDomain, JSX.Element> = {
  grounding: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  ),
  breath: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
    </svg>
  ),
  movement: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4c-2 4-4 6-4 10a4 4 0 008 0c0-4-2-6-4-10z" />
    </svg>
  ),
  reflection: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  connection: (
    <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="15" cy="20" r="8" />
      <circle cx="25" cy="20" r="8" />
    </svg>
  ),
  rest: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
    </svg>
  ),
  transition: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

const domainColors: Record<PracticeDomain, string> = {
  grounding: '#5a7a6f',
  breath: '#6b8a9f',
  movement: '#8a6b5a',
  reflection: '#6b5a98',
  connection: '#8a7a5a',
  rest: '#5a6b8a',
  transition: '#7a5a8a',
};

const durationLabels: Record<string, string> = {
  '1-min': '1 minute',
  '5-min': '5 minutes',
  '10-min': '10 minutes',
  '15-min': '15 minutes',
};

export default function MicroPractice({
  practice,
  onShare,
  onLog,
  variant = 'card',
}: MicroPracticeProps) {
  const [showInstructions, setShowInstructions] = useState(variant === 'expanded');
  const [showVariations, setShowVariations] = useState(false);
  const [completed, setCompleted] = useState(false);

  const domainColor = domainColors[practice.domain];

  const handleComplete = (felt: 'nourishing' | 'neutral' | 'effortful' | 'not-right-now') => {
    setCompleted(true);
    onLog?.(felt);
  };

  // Compact variant - just title and domain
  if (variant === 'compact') {
    return (
      <button
        onClick={() => setShowInstructions(true)}
        className="flex items-center gap-3 px-4 py-3 bg-white/40 border border-stone-200/60 rounded-xl hover:bg-white/60 transition-colors text-left w-full"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${domainColor}10`, color: domainColor }}
        >
          {domainSymbols[practice.domain]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] tracking-wide text-stone-700 truncate">
            {practice.title}
          </p>
          <p className="text-[11px] tracking-wide text-stone-400">
            {durationLabels[practice.duration]}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white/40 border border-stone-200/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${domainColor}10`, color: domainColor }}
          >
            {domainSymbols[practice.domain]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium tracking-wide text-stone-800">
                  {practice.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${domainColor}10`, color: domainColor }}
                  >
                    {practice.domain}
                  </span>
                  <span className="text-[12px] tracking-wide text-stone-400">
                    {durationLabels[practice.duration]}
                  </span>
                </div>
              </div>
              {practice.shareable && onShare && (
                <button
                  onClick={onShare}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Share this practice"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* When helpful */}
        <div className="mt-4 flex flex-wrap gap-2">
          {practice.whenHelpful.map((when, i) => (
            <span
              key={i}
              className="text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-stone-100 text-stone-500"
            >
              {when}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions (expandable or always visible) */}
      {variant === 'card' && !showInstructions ? (
        <button
          onClick={() => setShowInstructions(true)}
          className="w-full px-6 py-4 border-t border-stone-200/60 text-[13px] tracking-wide text-stone-500 hover:bg-white/40 transition-colors flex items-center justify-center gap-2"
        >
          <span>View practice</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : (
        <div className="border-t border-stone-200/60">
          {/* Instructions */}
          <div className="p-6">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-3">
              Instructions
            </h4>
            <div className="text-[14px] tracking-wide text-stone-600 leading-relaxed whitespace-pre-line">
              {practice.instructions}
            </div>

            {/* Attribution */}
            {practice.tradition && (
              <p className="mt-4 text-[12px] tracking-wide text-stone-400 italic">
                From the {practice.tradition} tradition. {practice.attribution}
              </p>
            )}
          </div>

          {/* Variations */}
          {practice.variations && practice.variations.length > 0 && (
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowVariations(!showVariations)}
                className="flex items-center gap-2 text-[13px] tracking-wide text-stone-500 hover:text-stone-700 transition-colors"
              >
                <span>Variations</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-4 h-4 transition-transform ${showVariations ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showVariations && (
                <ul className="mt-3 space-y-2">
                  {practice.variations.map((variation, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-stone-400 mt-1">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      </span>
                      <span className="text-[13px] tracking-wide text-stone-500">
                        {variation}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Completion */}
          {!completed ? (
            <div className="px-6 pb-6 pt-2 border-t border-stone-200/40">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-3">
                After practicing, how did it feel?
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'nourishing', label: 'Nourishing' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'effortful', label: 'Effortful' },
                  { value: 'not-right-now', label: 'Not right for now' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleComplete(value as 'nourishing' | 'neutral' | 'effortful' | 'not-right-now')}
                    className="px-3 py-1.5 text-[12px] tracking-wide rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6 pt-2 border-t border-stone-200/40">
              <p className="text-[13px] tracking-wide text-[#5a7a6f] flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Noted. Thank you for practicing.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sample practices library
export const MICRO_PRACTICES: MicroPracticeData[] = [
  {
    id: 'grounding-5-4-3-2-1',
    title: '5-4-3-2-1 Grounding',
    duration: '5-min',
    domain: 'grounding',
    attribution: 'Widely used in trauma-informed care',
    instructions: `Wherever you are, pause and notice:

5 things you can SEE
Look around slowly. Name five things in your visual field. Notice color, texture, light.

4 things you can TOUCH
Feel your feet on the floor. The texture of your clothing. The temperature of the air on your skin.

3 things you can HEAR
Close your eyes if that helps. What sounds are present? Near and far.

2 things you can SMELL
If nothing is obvious, bring your hand to your nose. Notice.

1 thing you can TASTE
Even just the inside of your mouth. Notice.

You are here. You are present.`,
    variations: [
      'Start with what you can taste and work up if counting down feels overwhelming',
      'Do this with someone else, taking turns naming things',
      'Focus on pleasant sensations only if you need gentle anchoring',
    ],
    whenHelpful: ['Feeling anxious', 'Dissociating', 'Before difficult conversations'],
    shareable: true,
  },
  {
    id: 'breath-box',
    title: 'Box Breathing',
    duration: '5-min',
    domain: 'breath',
    tradition: 'Navy SEAL training / Pranayama',
    attribution: 'Adapted from military stress management',
    instructions: `Find a comfortable position. You can close your eyes or soften your gaze.

Breathe IN for 4 counts
1... 2... 3... 4...

HOLD for 4 counts
1... 2... 3... 4...

Breathe OUT for 4 counts
1... 2... 3... 4...

HOLD for 4 counts
1... 2... 3... 4...

Repeat this cycle 4-8 times, or until you feel settled.

If holding feels uncomfortable, reduce to 2-3 counts. This is not about performance.`,
    variations: [
      'Extend to 5 or 6 counts if comfortable',
      'Skip the holds if they increase anxiety',
      'Visualize tracing a square with each breath phase',
    ],
    whenHelpful: ['Need to calm quickly', 'Before sleep', 'During high stress'],
    shareable: true,
  },
  {
    id: 'compassion-pause',
    title: 'Self-Compassion Pause',
    duration: '1-min',
    domain: 'reflection',
    tradition: 'Buddhist metta practice',
    attribution: 'Adapted from Kristin Neff\'s self-compassion work',
    instructions: `When you notice suffering—your own or another's—pause.

Place a hand on your heart if that feels okay.

Say silently or aloud:

"This is a moment of suffering."
(Acknowledge what is true)

"Suffering is part of being human."
(You are not alone in this)

"May I be kind to myself."
(Offer what you need)

Breathe. You don't have to fix anything right now.`,
    variations: [
      'Change the phrases to what resonates: "This is hard" / "Others feel this too" / "May I find peace"',
      'Extend kindness to another: "May you be free from suffering"',
      'Simply place your hand on your heart and breathe',
    ],
    whenHelpful: ['Self-criticism', 'After mistakes', 'When supporting others'],
    shareable: true,
  },
  {
    id: 'transition-threshold',
    title: 'Threshold Pause',
    duration: '1-min',
    domain: 'transition',
    attribution: 'Inspired by mindfulness and ritual traditions',
    instructions: `Before entering a new space—physical or emotional—pause at the threshold.

Stand or sit at the boundary (doorway, car, before a call).

Take one full breath.

Notice: What am I leaving behind?

Take another breath.

Notice: What am I entering into?

Take a third breath.

Step through with intention.

You are choosing how you arrive.`,
    variations: [
      'Touch the doorframe as a tactile anchor',
      'Set a word or intention for what you are entering',
      'Use between meetings to clear the previous energy',
    ],
    whenHelpful: ['Switching contexts', 'Entering difficult spaces', 'Work-to-home transition'],
    shareable: true,
  },
  {
    id: 'body-scan-brief',
    title: 'Quick Body Check-In',
    duration: '5-min',
    domain: 'rest',
    tradition: 'Somatic awareness / MBSR',
    attribution: 'Adapted from body scan meditation',
    instructions: `Sit or lie down in a comfortable position.

Start at the top of your head. Notice any sensation—or the absence of sensation. No need to change anything.

Move your attention slowly down:
- Forehead, eyes, jaw
- Neck, shoulders
- Arms, hands
- Chest, belly
- Hips, legs
- Feet

Where did you notice tension? Holding?

Where did you notice ease? Softness?

You don't need to fix anything. Just notice.

Take a final breath that reaches wherever needs it most.`,
    variations: [
      'Focus only on areas that feel comfortable if trauma is present',
      'Start from the feet and move up',
      'Combine with gentle movement or stretching',
    ],
    whenHelpful: ['Before sleep', 'Processing emotions', 'Physical tension'],
    shareable: true,
  },
];

// Export types
export type { MicroPracticeData, PracticeDomain };
