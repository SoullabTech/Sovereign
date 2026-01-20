'use client';

/**
 * Safety & Boundaries Orientation
 *
 * Required orientation for Level 0 members before their first contribution
 * can be approved (progressing to Level 1 Contributor).
 *
 * Covers:
 * - What NOT to offer (medical advice, crisis intervention)
 * - Attribution and sourcing requirements
 * - The importance of "when not to use" guidance
 * - Consent-based sharing principles
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useState } from 'react';
import { ChevronRight, AlertTriangle, BookOpen, Heart, Shield, Check } from 'lucide-react';

interface SafetyOrientationProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface OrientationStep {
  id: string;
  title: string;
  icon: typeof Shield;
  content: React.ReactNode;
  acknowledgment: string;
}

const orientationSteps: OrientationStep[] = [
  {
    id: 'safety-first',
    title: 'Safety First',
    icon: Shield,
    content: (
      <div className="space-y-4">
        <p className="text-[14px] text-stone-600 leading-relaxed">
          The Commons exists to share wisdom that has genuinely helped. But some kinds of
          guidance require professional training and licensure.
        </p>
        <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-lg">
          <h4 className="text-[13px] font-medium text-rose-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Never Offer
          </h4>
          <ul className="text-[13px] text-rose-600 space-y-1.5">
            <li>Medical diagnoses or treatment recommendations</li>
            <li>Crisis intervention or suicide prevention guidance</li>
            <li>Specific dosing for supplements or substances</li>
            <li>Legal or financial advice</li>
            <li>Promises of cure or guaranteed outcomes</li>
          </ul>
        </div>
        <p className="text-[13px] text-stone-500 italic">
          If someone needs professional help, the kindest thing is to encourage them to seek it.
        </p>
      </div>
    ),
    acknowledgment: 'I understand I must never offer medical, crisis, legal, or financial advice.',
  },
  {
    id: 'attribution',
    title: 'Honor Sources',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <p className="text-[14px] text-stone-600 leading-relaxed">
          Every practice, prompt, or insight builds on what came before. Attribution honors
          the lineage of wisdom and helps others explore further.
        </p>
        <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-lg">
          <h4 className="text-[13px] font-medium text-amber-700 mb-2">
            When Attribution is Required
          </h4>
          <ul className="text-[13px] text-amber-600 space-y-1.5">
            <li>Practices learned from a teacher, course, or book</li>
            <li>Quotes or paraphrased ideas from specific sources</li>
            <li>Techniques from recognized traditions (IFS, ACT, EMDR, etc.)</li>
            <li>Content adapted from existing frameworks</li>
          </ul>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-lg">
          <h4 className="text-[13px] font-medium text-emerald-700 mb-2">
            Original Offerings
          </h4>
          <p className="text-[13px] text-emerald-600">
            If something emerged from your own practice and experience, you can mark it as
            &quot;Original, from personal practice&quot; or &quot;Developed through my own exploration.&quot;
          </p>
        </div>
      </div>
    ),
    acknowledgment: 'I will properly attribute sources and honor the lineage of wisdom.',
  },
  {
    id: 'boundaries',
    title: 'When Not to Use',
    icon: AlertTriangle,
    content: (
      <div className="space-y-4">
        <p className="text-[14px] text-stone-600 leading-relaxed">
          Every tool has contexts where it helps and contexts where it may not. Being honest
          about limitations is an act of care.
        </p>
        <div className="p-4 bg-[#6b5a98]/10 border border-[#6b5a98]/20 rounded-lg">
          <h4 className="text-[13px] font-medium text-[#6b5a98] mb-2">
            The &quot;When Not Helpful&quot; Field
          </h4>
          <p className="text-[13px] text-stone-600 mb-3">
            Every practice and resource contribution requires you to describe situations where
            your offering may not be appropriate.
          </p>
          <div className="text-[12px] text-stone-500 space-y-2">
            <p><strong>Example:</strong> A grounding practice might note:</p>
            <p className="pl-4 italic">
              &quot;Not recommended during acute trauma flashbacks or if body awareness triggers
              dissociation. In these cases, seek support from a trauma-informed professional.&quot;
            </p>
          </div>
        </div>
        <p className="text-[13px] text-stone-500">
          This transparency helps people find what truly serves them.
        </p>
      </div>
    ),
    acknowledgment: 'I will honestly describe when my offerings may not be helpful.',
  },
  {
    id: 'consent',
    title: 'Consent & Care',
    icon: Heart,
    content: (
      <div className="space-y-4">
        <p className="text-[14px] text-stone-600 leading-relaxed">
          The Commons is built on offering, not prescribing. We share what has helped us,
          trusting others to discern what serves them.
        </p>
        <div className="p-4 bg-[#5a7a6f]/10 border border-[#5a7a6f]/20 rounded-lg space-y-3">
          <div>
            <h4 className="text-[13px] font-medium text-[#5a7a6f] mb-1">Offer, Don&apos;t Prescribe</h4>
            <p className="text-[12px] text-stone-600">
              &quot;This practice helped me when...&quot; rather than &quot;You should do this if...&quot;
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-[#5a7a6f] mb-1">Respect Autonomy</h4>
            <p className="text-[12px] text-stone-600">
              Trust that others know their own situation and needs better than we do.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-[#5a7a6f] mb-1">No Unsolicited Advice</h4>
            <p className="text-[12px] text-stone-600">
              Contributions are for the Commons library, not for directing specific people.
            </p>
          </div>
        </div>
        <p className="text-[13px] text-stone-500 italic">
          The best offerings create spaciousness, not obligation.
        </p>
      </div>
    ),
    acknowledgment: 'I will offer wisdom without prescribing, respecting each person\'s autonomy.',
  },
];

export default function SafetyOrientation({ onComplete, onSkip }: SafetyOrientationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = orientationSteps[currentStep];
  const StepIcon = step.icon;
  const isAcknowledged = acknowledged[step.id];
  const allAcknowledged = orientationSteps.every(s => acknowledged[s.id]);
  const isLastStep = currentStep === orientationSteps.length - 1;

  const handleNext = () => {
    if (isLastStep && allAcknowledged) {
      setIsSubmitting(true);
      onComplete();
    } else if (isAcknowledged) {
      setCurrentStep(prev => Math.min(prev + 1, orientationSteps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const toggleAcknowledgment = () => {
    setAcknowledged(prev => ({
      ...prev,
      [step.id]: !prev[step.id],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#5a7a6f]/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-[#5a7a6f]" />
        </div>
        <h1 className="text-xl font-light tracking-wide text-stone-800 mb-2">
          Safety & Boundaries Orientation
        </h1>
        <p className="text-[14px] text-stone-500">
          Required before your first contribution can be approved
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {orientationSteps.map((s, i) => (
          <div
            key={s.id}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < currentStep
                ? 'bg-[#5a7a6f]'
                : i === currentStep
                ? 'bg-[#5a7a6f]/60'
                : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="p-6 rounded-xl border border-stone-200/60 bg-white/80 mb-6">
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
              Step {currentStep + 1} of {orientationSteps.length}
            </p>
            <h2 className="text-[16px] font-medium text-stone-700">{step.title}</h2>
          </div>
        </div>

        {/* Step Body */}
        <div className="mb-6">{step.content}</div>

        {/* Acknowledgment */}
        <div
          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
            isAcknowledged
              ? 'bg-[#5a7a6f]/10 border-[#5a7a6f]/30'
              : 'bg-stone-50 border-stone-200/60 hover:border-stone-300'
          }`}
          onClick={toggleAcknowledgment}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                isAcknowledged
                  ? 'bg-[#5a7a6f] border-[#5a7a6f]'
                  : 'border-stone-300'
              }`}
            >
              {isAcknowledged && <Check className="w-3 h-3 text-white" />}
            </div>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {step.acknowledgment}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isAcknowledged || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] transition-colors ${
              isAcknowledged && !isSubmitting
                ? 'bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Completing...
              </>
            ) : isLastStep ? (
              <>
                Complete Orientation
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-[12px] text-stone-400 mt-8">
        This orientation helps ensure the Commons remains a safe space for everyone.
      </p>
    </div>
  );
}

export type { SafetyOrientationProps };
