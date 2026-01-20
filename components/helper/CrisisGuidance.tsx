'use client';

/**
 * Crisis Guidance Component
 *
 * Clear guidance on recognizing when professional help is needed.
 * Prominent, not hidden. No shame in referring.
 *
 * See /docs/HELPER_TOOLS_SPECIFICATION.md for context.
 */

import { useState } from 'react';

interface CrisisIndicator {
  category: string;
  signs: string[];
  response: 'hold-space' | 'encourage-professional' | 'immediate-resources';
}

interface LocalResource {
  name: string;
  type: 'crisis-line' | 'service' | 'professional';
  contact: string;
  availability: string;
  cost: string;
  region?: string;
}

interface CrisisGuidanceData {
  indicators: CrisisIndicator[];
  resources: LocalResource[];
  languageGuide: {
    helpful: string[];
    avoid: string[];
  };
}

interface CrisisGuidanceProps {
  data?: CrisisGuidanceData;
  context?: 'helper-training' | 'in-moment' | 'resource-page';
}

// Default crisis guidance data
const DEFAULT_GUIDANCE: CrisisGuidanceData = {
  indicators: [
    {
      category: 'Thoughts of self-harm or suicide',
      signs: [
        'Expressing hopelessness about the future',
        'Talking about being a burden to others',
        'Mentioning wanting to "not be here" or "go to sleep forever"',
        'Giving away possessions or saying goodbye',
        'Sudden calmness after a period of depression',
      ],
      response: 'immediate-resources',
    },
    {
      category: 'Severe emotional distress',
      signs: [
        'Panic attacks or severe anxiety that is not subsiding',
        'Overwhelming grief that prevents basic functioning',
        'Dissociation or feeling detached from reality',
        'Inability to care for basic needs (eating, sleeping, hygiene)',
      ],
      response: 'encourage-professional',
    },
    {
      category: 'Trauma responses',
      signs: [
        'Flashbacks or intrusive memories',
        'Nightmares affecting daily function',
        'Hypervigilance or being easily startled',
        'Avoidance that significantly limits life',
        'Emotional numbness or detachment',
      ],
      response: 'encourage-professional',
    },
    {
      category: 'Life challenges needing support',
      signs: [
        'Relationship difficulties',
        'Career transitions or stress',
        'Grief and loss (non-acute)',
        'Questions of meaning or purpose',
        'Desire for personal growth',
      ],
      response: 'hold-space',
    },
  ],
  resources: [
    {
      name: '988 Suicide & Crisis Lifeline',
      type: 'crisis-line',
      contact: 'Call or text 988',
      availability: '24/7',
      cost: 'Free',
      region: 'US',
    },
    {
      name: 'Crisis Text Line',
      type: 'crisis-line',
      contact: 'Text HOME to 741741',
      availability: '24/7',
      cost: 'Free',
      region: 'US',
    },
    {
      name: 'Samaritans',
      type: 'crisis-line',
      contact: 'Call 116 123',
      availability: '24/7',
      cost: 'Free',
      region: 'UK',
    },
    {
      name: 'International Association for Suicide Prevention',
      type: 'service',
      contact: 'https://www.iasp.info/resources/Crisis_Centres/',
      availability: 'Directory',
      cost: 'Free',
      region: 'International',
    },
  ],
  languageGuide: {
    helpful: [
      '"I hear how much pain you\'re in."',
      '"I\'m glad you told me."',
      '"You don\'t have to go through this alone."',
      '"Would it help if I stayed with you while you call?"',
      '"This sounds really hard. A professional could help you navigate this."',
      '"I care about you and want you to get the support you deserve."',
    ],
    avoid: [
      '"Just think positive" or "Things could be worse"',
      '"I know exactly how you feel"',
      '"You just need to..." (any simple solution)',
      '"Don\'t be dramatic" or minimizing language',
      'Promises you cannot keep',
      'Pressuring them to share more than they\'re ready to',
    ],
  },
};

// Alert symbol
function AlertSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 9v4m0 4h.01M12 3L2 21h20L12 3z" />
    </svg>
  );
}

// Heart symbol
function HeartSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Shield symbol
function ShieldSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-4z" />
    </svg>
  );
}

export default function CrisisGuidance({ data = DEFAULT_GUIDANCE, context = 'resource-page' }: CrisisGuidanceProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const responseLabels: Record<string, { label: string; color: string }> = {
    'hold-space': { label: 'Peer support appropriate', color: 'bg-[#5a7a6f]/10 text-[#5a7a6f]' },
    'encourage-professional': { label: 'Professional support recommended', color: 'bg-[#8a7a5a]/10 text-[#8a7a5a]' },
    'immediate-resources': { label: 'Crisis resources needed', color: 'bg-rose-100 text-rose-700' },
  };

  // In-moment variant - compact crisis resources
  if (context === 'in-moment') {
    return (
      <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <HeartSymbol className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium tracking-wide text-stone-800 mb-2">
              You matter
            </h3>
            <p className="text-[14px] tracking-wide text-stone-600 leading-relaxed mb-4">
              If you are in crisis or having thoughts of ending your life,
              please reach out to someone who can help right now.
            </p>
            <div className="space-y-3">
              {data.resources
                .filter(r => r.type === 'crisis-line')
                .slice(0, 2)
                .map((resource, i) => (
                  <a
                    key={i}
                    href={resource.contact.startsWith('http') ? resource.contact : `tel:${resource.contact.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-rose-50 transition-colors"
                  >
                    <span className="text-[14px] font-medium tracking-wide text-stone-700">
                      {resource.name}
                    </span>
                    <span className="text-[13px] tracking-wide text-stone-500 ml-auto">
                      {resource.contact}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      {context === 'helper-training' && (
        <div className="bg-white/40 border border-stone-200/60 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#6b5a98]/10 flex items-center justify-center">
              <ShieldSymbol className="w-6 h-6 text-[#6b5a98]" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-wide text-stone-800 mb-2">
                Recognizing When to Refer
              </h2>
              <p className="text-[14px] tracking-wide text-stone-500 leading-relaxed">
                As peer supporters, we hold space—we are not trained therapists.
                Knowing when someone needs professional help is a gift, not a failure.
                Referring is an act of care.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicators */}
      <div className="space-y-4">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Signs to Watch For
        </h3>
        {data.indicators.map((indicator) => (
          <div
            key={indicator.category}
            className="bg-white/40 border border-stone-200/60 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === indicator.category ? null : indicator.category
              )}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                {indicator.response === 'immediate-resources' && (
                  <AlertSymbol className="w-4 h-4 text-rose-500" />
                )}
                <span className="text-[14px] tracking-wide text-stone-700">
                  {indicator.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-md text-[10px] tracking-wider uppercase ${
                  responseLabels[indicator.response].color
                }`}>
                  {responseLabels[indicator.response].label}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-4 h-4 text-stone-400 transition-transform ${
                    expandedCategory === indicator.category ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>
            {expandedCategory === indicator.category && (
              <div className="px-5 pb-4 border-t border-stone-200/40">
                <ul className="mt-4 space-y-2">
                  {indicator.signs.map((sign, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-stone-400 mt-1">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      </span>
                      <span className="text-[13px] tracking-wide text-stone-600 leading-relaxed">
                        {sign}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Crisis Resources */}
      <div className="space-y-4">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Crisis Resources
        </h3>
        <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-5">
          <div className="grid gap-4">
            {data.resources.map((resource, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-rose-200/40 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-[14px] font-medium tracking-wide text-stone-700">
                    {resource.name}
                  </p>
                  <p className="text-[12px] tracking-wide text-stone-500 mt-0.5">
                    {resource.availability} • {resource.cost}
                    {resource.region && ` • ${resource.region}`}
                  </p>
                </div>
                <a
                  href={resource.contact.startsWith('http') ? resource.contact : undefined}
                  className="px-4 py-2 bg-white rounded-lg text-[13px] tracking-wide text-stone-700 hover:bg-rose-100 transition-colors"
                >
                  {resource.contact}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Language Guide */}
      <div className="space-y-4">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Language Guide
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Helpful */}
          <div className="bg-[#5a7a6f]/5 border border-[#5a7a6f]/20 rounded-xl p-5">
            <h4 className="text-[13px] font-medium tracking-wide text-[#5a7a6f] mb-4">
              Words that help
            </h4>
            <ul className="space-y-3">
              {data.languageGuide.helpful.map((phrase, i) => (
                <li key={i} className="text-[13px] tracking-wide text-stone-600 leading-relaxed">
                  {phrase}
                </li>
              ))}
            </ul>
          </div>

          {/* Avoid */}
          <div className="bg-stone-100/50 border border-stone-200/60 rounded-xl p-5">
            <h4 className="text-[13px] font-medium tracking-wide text-stone-500 mb-4">
              Words to avoid
            </h4>
            <ul className="space-y-3">
              {data.languageGuide.avoid.map((phrase, i) => (
                <li key={i} className="text-[13px] tracking-wide text-stone-500 leading-relaxed">
                  {phrase}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Reassurance for Helpers */}
      {context === 'helper-training' && (
        <div className="bg-[#6b5a98]/5 border border-[#6b5a98]/20 rounded-xl p-6 text-center">
          <p className="text-[14px] tracking-wide text-stone-600 leading-relaxed max-w-xl mx-auto">
            Referring someone to professional help is not abandoning them.
            It is recognizing that their healing deserves more than we can offer alone.
            You can still be present and supportive while they receive professional care.
          </p>
        </div>
      )}
    </div>
  );
}

// Export types for external use
export type { CrisisGuidanceData, CrisisIndicator, LocalResource };
