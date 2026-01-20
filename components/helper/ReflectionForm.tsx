'use client';

/**
 * Reflection Form Component
 *
 * Structured questions that help someone articulate where they are
 * and what they're seeking. User owns all responses locally by default.
 *
 * See /docs/HELPER_TOOLS_SPECIFICATION.md for context.
 */

import { useState } from 'react';

interface ReflectionSection {
  id: string;
  prompt: string;
  type: 'open' | 'scale' | 'choice' | 'timeline';
  choices?: string[];
  followUp?: string;
}

interface ReflectionFormData {
  id: string;
  title: string;
  purpose: string;
  sections: ReflectionSection[];
}

interface ReflectionFormProps {
  form: ReflectionFormData;
  onComplete?: (responses: Record<string, string | number>) => void;
  onSave?: (responses: Record<string, string | number>) => void;
}

export default function ReflectionForm({ form, onComplete, onSave }: ReflectionFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [showFollowUp, setShowFollowUp] = useState(false);

  const section = form.sections[currentSection];
  const isLastSection = currentSection === form.sections.length - 1;
  const progress = ((currentSection + 1) / form.sections.length) * 100;

  const handleResponse = (value: string | number) => {
    setResponses(prev => ({ ...prev, [section.id]: value }));
    if (section.followUp && !showFollowUp) {
      setShowFollowUp(true);
    }
  };

  const handleFollowUpResponse = (value: string) => {
    setResponses(prev => ({ ...prev, [`${section.id}_followup`]: value }));
  };

  const handleNext = () => {
    setShowFollowUp(false);
    if (isLastSection) {
      onComplete?.(responses);
    } else {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setShowFollowUp(false);
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave?.(responses);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-light tracking-wide text-stone-800 mb-2">
          {form.title}
        </h2>
        <p className="text-[14px] tracking-wide text-stone-500 leading-relaxed">
          {form.purpose}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Reflection {currentSection + 1} of {form.sections.length}
          </span>
          <button
            onClick={handleSave}
            className="text-[13px] tracking-wide text-[#5a7a6f] hover:text-[#4a6a5f] transition-colors"
          >
            Save progress
          </button>
        </div>
        <div className="h-1 bg-stone-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5a7a6f] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Ownership Note */}
      <div className="mb-6 p-3 bg-[#5a7a6f]/5 rounded-xl border border-[#5a7a6f]/10">
        <div className="flex items-start gap-3">
          {/* Shield symbol */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#5a7a6f] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-4z" />
          </svg>
          <p className="text-[13px] tracking-wide text-stone-600">
            Your responses stay with you. Share only by your choice.
          </p>
        </div>
      </div>

      {/* Current Section */}
      <div className="bg-white/40 border border-stone-200/60 rounded-2xl p-8 mb-6">
        <p className="text-[16px] tracking-wide text-stone-700 leading-relaxed mb-6">
          {section.prompt}
        </p>

        {/* Response Input by Type */}
        {section.type === 'open' && (
          <textarea
            value={(responses[section.id] as string) || ''}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Take your time..."
            className="w-full h-32 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 focus:border-[#5a7a6f]/40 resize-none"
          />
        )}

        {section.type === 'scale' && (
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="10"
              value={(responses[section.id] as number) || 5}
              onChange={(e) => handleResponse(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#5a7a6f]"
            />
            <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-stone-400">
              <span>Not at all</span>
              <span className="text-[#5a7a6f] font-medium">
                {responses[section.id] || 5}
              </span>
              <span>Very much</span>
            </div>
          </div>
        )}

        {section.type === 'choice' && section.choices && (
          <div className="space-y-3">
            {section.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleResponse(choice)}
                className={`w-full px-4 py-3 text-left rounded-xl text-[14px] tracking-wide transition-all ${
                  responses[section.id] === choice
                    ? 'bg-[#5a7a6f]/10 border-2 border-[#5a7a6f]/40 text-stone-700'
                    : 'bg-white/60 border border-stone-200/60 text-stone-600 hover:bg-white/80'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {section.type === 'timeline' && (
          <div className="grid grid-cols-3 gap-3">
            {['Past', 'Present', 'Future'].map((period) => (
              <button
                key={period}
                onClick={() => handleResponse(period)}
                className={`px-4 py-6 rounded-xl text-[14px] tracking-wide transition-all ${
                  responses[section.id] === period
                    ? 'bg-[#6b5a98]/10 border-2 border-[#6b5a98]/40 text-stone-700'
                    : 'bg-white/60 border border-stone-200/60 text-stone-600 hover:bg-white/80'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        )}

        {/* Follow-up Question */}
        {showFollowUp && section.followUp && (
          <div className="mt-6 pt-6 border-t border-stone-200/60">
            <p className="text-[14px] tracking-wide text-stone-600 mb-4 italic">
              {section.followUp}
            </p>
            <textarea
              value={(responses[`${section.id}_followup`] as string) || ''}
              onChange={(e) => handleFollowUpResponse(e.target.value)}
              placeholder="Explore this further..."
              className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40 resize-none"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentSection === 0}
          className={`px-4 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
            currentSection === 0
              ? 'text-stone-300 cursor-not-allowed'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!responses[section.id]}
          className={`px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
            responses[section.id]
              ? 'bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {isLastSection ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// Pre-built form templates
export const REFLECTION_FORMS: Record<string, ReflectionFormData> = {
  where_am_i_now: {
    id: 'where_am_i_now',
    title: 'Where Am I Now?',
    purpose: 'A gentle exploration of your current landscape. There are no right answers—only honest ones.',
    sections: [
      {
        id: 'overall_sense',
        prompt: 'When you pause and feel into your life right now, what word or phrase comes to mind?',
        type: 'open',
        followUp: 'What does that word mean to you in this moment?',
      },
      {
        id: 'energy_level',
        prompt: 'How would you describe your energy these days?',
        type: 'scale',
      },
      {
        id: 'life_area_focus',
        prompt: 'Which area of life is asking for the most attention right now?',
        type: 'choice',
        choices: [
          'Inner life — thoughts, emotions, spirit',
          'Relationships — connection, belonging, intimacy',
          'Work — purpose, contribution, livelihood',
          'Body — health, rest, physical wellbeing',
          'Environment — home, space, surroundings',
        ],
        followUp: 'What is this area asking of you?',
      },
      {
        id: 'time_orientation',
        prompt: 'Where does your attention spend most of its time?',
        type: 'timeline',
        followUp: 'What keeps drawing you there?',
      },
      {
        id: 'one_thing',
        prompt: 'If you could change one thing right now, what would it be?',
        type: 'open',
      },
    ],
  },
  what_am_i_seeking: {
    id: 'what_am_i_seeking',
    title: 'What Am I Seeking?',
    purpose: 'Clarifying what draws you forward. Your intentions deserve to be named.',
    sections: [
      {
        id: 'longing',
        prompt: 'What do you find yourself longing for lately?',
        type: 'open',
        followUp: 'How long has this longing been present?',
      },
      {
        id: 'seeking_type',
        prompt: 'What kind of support feels most needed right now?',
        type: 'choice',
        choices: [
          'Someone to witness — to be seen without being fixed',
          'Guidance — direction from someone who has walked this path',
          'Community — others who understand what I am going through',
          'Practices — tools and rituals to support my growth',
          'Space — time and permission to simply be',
        ],
      },
      {
        id: 'readiness',
        prompt: 'How ready do you feel to receive what you are seeking?',
        type: 'scale',
        followUp: 'What would help you feel more ready?',
      },
      {
        id: 'obstacle',
        prompt: 'What, if anything, feels like it stands between you and what you seek?',
        type: 'open',
      },
      {
        id: 'next_step',
        prompt: 'What is the smallest step you could take toward what you seek?',
        type: 'open',
      },
    ],
  },
  support_style: {
    id: 'support_style',
    title: 'What Support Feels Right?',
    purpose: 'Understanding how you receive support helps others show up for you well.',
    sections: [
      {
        id: 'past_support',
        prompt: 'Think of a time when you felt truly supported. What made it feel that way?',
        type: 'open',
      },
      {
        id: 'support_preference',
        prompt: 'When you are struggling, what usually helps most?',
        type: 'choice',
        choices: [
          'Someone to listen without trying to fix',
          'Practical help with tasks or decisions',
          'Encouragement and reassurance',
          'Honest feedback, even if hard to hear',
          'Space to process on my own, with check-ins',
        ],
      },
      {
        id: 'not_helpful',
        prompt: 'What kind of "help" tends to feel unhelpful or overwhelming?',
        type: 'open',
        followUp: 'How might you communicate this boundary to someone who cares?',
      },
      {
        id: 'share_comfort',
        prompt: 'How comfortable are you sharing your struggles with others?',
        type: 'scale',
      },
      {
        id: 'ideal_support',
        prompt: 'Describe your ideal support person or circle.',
        type: 'open',
      },
    ],
  },
};
