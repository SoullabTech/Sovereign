'use client';

/**
 * Contribution Form
 *
 * "Offer to the Commons" — a ceremonial form for member contributions.
 * Designed to feel like an offering, not posting.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ContributionType = 'prompt' | 'practice' | 'agreement' | 'resource' | 'story';
type ContributionStatus = 'draft' | 'submitted' | 'needs_revision' | 'published' | 'archived' | 'flagged';

interface ContributionTag {
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  facet?: string;
  domain?: string;
}

interface ContributionFormData {
  id?: string;
  type: ContributionType;
  status?: ContributionStatus;
  title: string;
  content: string;
  tags: ContributionTag[];
  attribution?: string;
  whenHelpful?: string;
  whenNot?: string;
  reviewNotes?: string;
}

interface ContributionFormProps {
  initialData?: Partial<ContributionFormData>;
  onSave?: (data: ContributionFormData, status: 'draft' | 'submitted') => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

// Type descriptions
const TYPE_INFO: Record<ContributionType, { label: string; description: string; requiresAttribution: boolean; requiresWhenNot: boolean }> = {
  prompt: {
    label: 'Reflection Prompt',
    description: 'A question that invites inquiry and self-exploration',
    requiresAttribution: false,
    requiresWhenNot: false,
  },
  practice: {
    label: 'Micro-Practice',
    description: 'A brief exercise or technique (1-15 minutes)',
    requiresAttribution: true,
    requiresWhenNot: true,
  },
  agreement: {
    label: 'Agreement / Template',
    description: 'A circle agreement, check-in format, or boundary script',
    requiresAttribution: false,
    requiresWhenNot: false,
  },
  resource: {
    label: 'Resource Link',
    description: 'A book, article, or tool that has helped you',
    requiresAttribution: false,
    requiresWhenNot: true,
  },
  story: {
    label: 'Story of Practice',
    description: 'What you tried, what happened — not advice',
    requiresAttribution: false,
    requiresWhenNot: false,
  },
};

// Tag options
const ELEMENT_TAGS = ['fire', 'water', 'earth', 'air', 'aether'];
const DOMAIN_TAGS = [
  'grounding', 'breath', 'movement', 'reflection', 'connection',
  'rest', 'transition', 'grief', 'anxiety', 'creativity', 'relationships',
];

// Geometric offering symbol
function OfferingSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="20" cy="20" r="14" />
      <path d="M20 12v16M12 20h16" />
    </svg>
  );
}

// Type icons for contribution cards
function TypeIcon({ type, selected }: { type: ContributionType; selected: boolean }) {
  const color = selected ? '#6b5a98' : '#78716c';

  switch (type) {
    case 'prompt':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v1M12 15v1" />
        </svg>
      );
    case 'practice':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2 2" />
        </svg>
      );
    case 'agreement':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={color} strokeWidth="1.5">
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 'resource':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'story':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M8 10 Q12 8 12 12 Q12 16 8 14" />
          <path d="M16 10 Q12 8 12 12 Q12 16 16 14" />
          <line x1="12" y1="6" x2="12" y2="18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ContributionForm({
  initialData,
  onSave,
  onCancel,
  isEditing = false,
}: ContributionFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'type' | 'content' | 'metadata' | 'review'>(
    initialData?.type ? 'content' : 'type'
  );
  const [formData, setFormData] = useState<ContributionFormData>({
    type: initialData?.type || 'prompt',
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    attribution: initialData?.attribution || '',
    whenHelpful: initialData?.whenHelpful || '',
    whenNot: initialData?.whenNot || '',
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  const typeInfo = TYPE_INFO[formData.type];

  const updateField = <K extends keyof ContributionFormData>(
    field: K,
    value: ContributionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: ContributionTag) => {
    const exists = formData.tags.some(
      t => t.element === tag.element && t.domain === tag.domain
    );
    if (exists) {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(
          t => !(t.element === tag.element && t.domain === tag.domain)
        ),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const isTagSelected = (tag: ContributionTag) => {
    return formData.tags.some(
      t => t.element === tag.element && t.domain === tag.domain
    );
  };

  const canProceed = () => {
    switch (step) {
      case 'type':
        return true;
      case 'content':
        return formData.title.trim().length >= 5 && formData.content.trim().length >= 20;
      case 'metadata':
        if (typeInfo.requiresAttribution && !formData.attribution?.trim()) return false;
        if (typeInfo.requiresWhenNot && !formData.whenNot?.trim()) return false;
        return true;
      case 'review':
        return agreedToGuidelines;
      default:
        return false;
    }
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!onSave) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(formData, status);
      router.push('/maia/community/commons/my-offerings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6b5a98]/10 flex items-center justify-center">
          <OfferingSymbol className="w-8 h-8 text-[#6b5a98]" />
        </div>
        <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-2">
          Offer to the Commons
        </h1>
        <p className="text-[14px] tracking-wide text-stone-500">
          Share something that has helped you
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['type', 'content', 'metadata', 'review'].map((s, i) => (
          <div
            key={s}
            className={`h-1 w-12 rounded-full transition-colors ${
              ['type', 'content', 'metadata', 'review'].indexOf(step) >= i
                ? 'bg-[#6b5a98]'
                : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Revision feedback (if needs_revision) */}
      {initialData?.status === 'needs_revision' && initialData?.reviewNotes && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
          <h3 className="text-[13px] font-medium tracking-wide text-amber-700 mb-2">
            Revision Requested
          </h3>
          <p className="text-[13px] tracking-wide text-amber-600 leading-relaxed">
            {initialData.reviewNotes}
          </p>
        </div>
      )}

      {/* Step: Type Selection */}
      {step === 'type' && (
        <div className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-6">
            What are you offering?
          </h2>
          {(Object.keys(TYPE_INFO) as ContributionType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                updateField('type', type);
                setStep('content');
              }}
              className={`w-full p-5 text-left rounded-xl border transition-all ${
                formData.type === type
                  ? 'bg-[#6b5a98]/5 border-[#6b5a98]/30'
                  : 'bg-white/60 border-stone-200/60 hover:bg-white/80 hover:border-stone-300/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: formData.type === type ? 'rgba(107, 90, 152, 0.15)' : 'rgba(120, 113, 108, 0.1)' }}
                >
                  <TypeIcon type={type} selected={formData.type === type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium tracking-wide text-stone-700 mb-1">
                    {TYPE_INFO[type].label}
                  </p>
                  <p className="text-[13px] tracking-wide text-stone-500 leading-relaxed">
                    {TYPE_INFO[type].description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: Content */}
      {step === 'content' && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md bg-[#6b5a98]/10 text-[#6b5a98]">
              {typeInfo.label}
            </span>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder={
                formData.type === 'prompt'
                  ? 'e.g., What would I tell my younger self?'
                  : formData.type === 'practice'
                  ? 'e.g., Morning Grounding Ritual'
                  : 'Give your offering a clear name'
              }
              className="w-full px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40"
              maxLength={200}
            />
            <p className="mt-1 text-[11px] tracking-wide text-stone-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
              {formData.type === 'prompt' ? 'The Prompt' : 'Content'}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder={
                formData.type === 'prompt'
                  ? 'Write your reflection prompt here...'
                  : formData.type === 'practice'
                  ? 'Describe the practice step by step...'
                  : formData.type === 'story'
                  ? 'Share what you tried and what happened (not advice)...'
                  : 'Write your content here...'
              }
              className="w-full h-48 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40 resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep('type')}
              className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('metadata')}
              disabled={!canProceed()}
              className={`px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
                canProceed()
                  ? 'bg-[#6b5a98] hover:bg-[#5b4a88] text-white'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step: Metadata */}
      {step === 'metadata' && (
        <div className="space-y-6">
          {/* When helpful */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
              When is this helpful?
            </label>
            <textarea
              value={formData.whenHelpful}
              onChange={(e) => updateField('whenHelpful', e.target.value)}
              placeholder="Describe situations where this might be useful..."
              className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40 resize-none"
            />
          </div>

          {/* When NOT helpful */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
              When is this NOT helpful?
              {typeInfo.requiresWhenNot && (
                <span className="text-rose-500 ml-1">*</span>
              )}
            </label>
            <textarea
              value={formData.whenNot}
              onChange={(e) => updateField('whenNot', e.target.value)}
              placeholder="Contraindications, cautions, when to avoid..."
              className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40 resize-none"
            />
            {typeInfo.requiresWhenNot && (
              <p className="mt-1 text-[11px] tracking-wide text-stone-500">
                Required for {typeInfo.label.toLowerCase()}s
              </p>
            )}
          </div>

          {/* Attribution */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
              Attribution
              {typeInfo.requiresAttribution && (
                <span className="text-rose-500 ml-1">*</span>
              )}
            </label>
            <input
              type="text"
              value={formData.attribution}
              onChange={(e) => updateField('attribution', e.target.value)}
              placeholder="Where did this come from? Tradition, teacher, personal practice?"
              className="w-full px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40"
            />
            {typeInfo.requiresAttribution && (
              <p className="mt-1 text-[11px] tracking-wide text-stone-500">
                Required for {typeInfo.label.toLowerCase()}s
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-3">
              Tags (optional)
            </label>
            <div className="space-y-3">
              <div>
                <p className="text-[12px] tracking-wide text-stone-500 mb-2">Elements</p>
                <div className="flex flex-wrap gap-2">
                  {ELEMENT_TAGS.map((element) => (
                    <button
                      key={element}
                      onClick={() => toggleTag({ element: element as ContributionTag['element'] })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] tracking-wide transition-colors ${
                        isTagSelected({ element: element as ContributionTag['element'] })
                          ? 'bg-[#5a7a6f]/20 text-[#5a7a6f] border border-[#5a7a6f]/30'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {element}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] tracking-wide text-stone-500 mb-2">Domains</p>
                <div className="flex flex-wrap gap-2">
                  {DOMAIN_TAGS.map((domain) => (
                    <button
                      key={domain}
                      onClick={() => toggleTag({ domain })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] tracking-wide transition-colors ${
                        isTagSelected({ domain })
                          ? 'bg-[#6b5a98]/20 text-[#6b5a98] border border-[#6b5a98]/30'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep('content')}
              className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('review')}
              disabled={!canProceed()}
              className={`px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
                canProceed()
                  ? 'bg-[#6b5a98] hover:bg-[#5b4a88] text-white'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step: Review & Submit */}
      {step === 'review' && (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white/60 border border-stone-200/60 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md bg-[#6b5a98]/10 text-[#6b5a98]">
                {typeInfo.label}
              </span>
              {formData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] tracking-wider px-2 py-1 rounded-md bg-stone-100 text-stone-500"
                >
                  {tag.element || tag.domain}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-medium tracking-wide text-stone-800 mb-3">
              {formData.title}
            </h3>
            <div className="text-[14px] tracking-wide text-stone-600 leading-relaxed whitespace-pre-line">
              {formData.content}
            </div>
            {formData.whenHelpful && (
              <div className="mt-4 pt-4 border-t border-stone-200/60">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                  When helpful
                </p>
                <p className="text-[13px] tracking-wide text-stone-500">
                  {formData.whenHelpful}
                </p>
              </div>
            )}
            {formData.whenNot && (
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                  When not helpful
                </p>
                <p className="text-[13px] tracking-wide text-stone-500">
                  {formData.whenNot}
                </p>
              </div>
            )}
            {formData.attribution && (
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                  Attribution
                </p>
                <p className="text-[13px] tracking-wide text-stone-500 italic">
                  {formData.attribution}
                </p>
              </div>
            )}
          </div>

          {/* Guidelines agreement */}
          <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToGuidelines}
                onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-stone-300 text-[#6b5a98] focus:ring-[#6b5a98]/20"
              />
              <span className="text-[13px] tracking-wide text-stone-600 leading-relaxed">
                I agree to the contribution guidelines: no sales, no diagnostic claims,
                no affiliate links, and no positioning as crisis intervention.
                This is an offering to the commons, not a promotion.
              </span>
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-xl">
              <p className="text-[13px] tracking-wide text-rose-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep('metadata')}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-[13px] tracking-wide transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSubmit('submitted')}
                disabled={!canProceed() || isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
                  canProceed() && !isSubmitting
                    ? 'bg-[#6b5a98] hover:bg-[#5b4a88] text-white'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel */}
      {onCancel && (
        <div className="mt-8 text-center">
          <button
            onClick={onCancel}
            className="text-[13px] tracking-wide text-stone-500 hover:text-stone-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// Export types
export type { ContributionFormData, ContributionType, ContributionStatus, ContributionTag };
