'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Star,
  Heart,
  Hand,
  Users,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';

type PortalType = 'generalist' | 'astrology' | 'therapy' | 'bodywork' | 'groups' | 'clinician';

interface PortalOption {
  type: PortalType;
  label: string;
  description: string;
  icon: typeof Sparkles;
  examples: string[];
}

const PORTAL_OPTIONS: PortalOption[] = [
  {
    type: 'generalist',
    label: 'Generalist / Eclectic',
    description: 'For practitioners who blend multiple modalities',
    icon: Sparkles,
    examples: ['Energy healing', 'Intuitive guidance', 'Spiritual coaching', 'Shamanic work'],
  },
  {
    type: 'astrology',
    label: 'Astrology / Divination',
    description: 'For practitioners who deliver readings and artifacts',
    icon: Star,
    examples: ['Natal charts', 'Transits', 'Tarot', 'Human Design'],
  },
  {
    type: 'therapy',
    label: 'Therapy / Coaching',
    description: 'For session-based therapeutic practices',
    icon: Heart,
    examples: ['Psychotherapy', 'Life coaching', 'Counseling', 'Integration'],
  },
  {
    type: 'clinician',
    label: 'Clinician',
    description: 'For licensed clinical practitioners',
    icon: Stethoscope,
    examples: ['Psychiatry', 'Psychology', 'LCSW/LMFT', 'Psychiatric nursing'],
  },
  {
    type: 'bodywork',
    label: 'Bodywork',
    description: 'For hands-on healing modalities',
    icon: Hand,
    examples: ['Massage', 'Acupuncture', 'Somatic therapy', 'Craniosacral'],
  },
  {
    type: 'groups',
    label: 'Groups / Ceremonies',
    description: 'For facilitators of group experiences',
    icon: Users,
    examples: ['Workshops', 'Retreats', 'Circles', 'Group programs'],
  },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

export default function CreatePortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<PortalType | null>(null);
  const [practiceName, setPracticeName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Get member ID on mount
  useEffect(() => {
    const id = getLocalMemberId();
    setMemberId(id);

    // Check if user already has a practitioner
    if (id) {
      checkExistingPractitioner(id);
    }
  }, []);

  // Auto-generate slug from practice name
  useEffect(() => {
    if (!slugTouched && practiceName) {
      setSlug(generateSlug(practiceName));
    }
  }, [practiceName, slugTouched]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || slug.length < 4) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  async function checkExistingPractitioner(memberId: string) {
    try {
      const response = await apiFetch('/api/studio/whoami');
      const data = await response.json();

      if (data.isPractitioner) {
        // Already has a practitioner, redirect to Studio
        router.replace('/studio');
      }
    } catch {
      // Not a practitioner, continue with creation
    }
  }

  async function checkSlugAvailability(slug: string) {
    setCheckingSlug(true);
    try {
      const response = await apiFetch(`/api/portal/${slug}`);
      // If we get a 200, the slug is taken
      setSlugAvailable(response.status === 404);
    } catch {
      // 404 means available
      setSlugAvailable(true);
    } finally {
      setCheckingSlug(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType || !practiceName.trim() || !slug.trim() || !memberId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/practitioners/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          practiceName: practiceName.trim(),
          slug: slug.trim().toLowerCase(),
          email: email.trim() || `${slug}@soullab.life`,
          portalType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create portal');
        return;
      }

      // Success - redirect to Settings for calendar onboarding
      router.replace('/studio/settings?onboarding=calendar');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = PORTAL_OPTIONS.find(o => o.type === selectedType);
  const isSlugValid = slug.length >= 4 && /^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$/.test(slug);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-white mb-3">Create Your Portal</h1>
          <p className="text-slate-400">
            {step === 'type'
              ? 'Choose the type that best describes your practice'
              : 'Set up your practice details'}
          </p>
        </div>

        {step === 'type' ? (
          /* Portal Type Selection */
          <div className="space-y-4">
            {PORTAL_OPTIONS.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  setSelectedType(option.type);
                  setStep('details');
                }}
                className={`
                  w-full p-6 rounded-xl border text-left transition-all
                  ${selectedType === option.type
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${selectedType === option.type ? 'bg-amber-500/30' : 'bg-slate-800'}
                  `}>
                    <option.icon className={`w-6 h-6 ${selectedType === option.type ? 'text-amber-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white">{option.label}</h3>
                      <ArrowRight className="w-5 h-5 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{option.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {option.examples.map((ex) => (
                        <span
                          key={ex}
                          className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Practice Details Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Type Badge */}
            {selectedOption && (
              <button
                type="button"
                onClick={() => setStep('type')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                <selectedOption.icon className="w-4 h-4" />
                <span>{selectedOption.label}</span>
                <span className="text-amber-400/60 text-sm ml-2">Change</span>
              </button>
            )}

            {/* Practice Name */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Practice Name</label>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                placeholder="e.g., Sacred Spiral Healing"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Your Portal URL
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl text-slate-500 text-sm">
                  soullab.life/portal/
                </span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setSlugTouched(true);
                    }}
                    placeholder="your-practice"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-r-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                  {/* Availability indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingSlug ? (
                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    ) : slug.length >= 4 ? (
                      slugAvailable ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : slugAvailable === false ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : null
                    ) : null}
                  </div>
                </div>
              </div>
              {slug && !isSlugValid && (
                <p className="text-xs text-amber-400 mt-2">
                  Must be 4-50 characters, lowercase letters, numbers, and hyphens only
                </p>
              )}
              {slugAvailable === false && (
                <p className="text-xs text-red-400 mt-2">
                  This URL is already taken. Please choose a different one.
                </p>
              )}
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Contact Email <span className="text-slate-500">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`${slug || 'your-practice'}@soullab.life`}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-xs text-slate-500 mt-2">
                Where clients can reach you. Defaults to your portal email.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !isSlugValid || slugAvailable === false || !practiceName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Portal
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Help text */}
        <p className="text-center text-sm text-slate-500 mt-12">
          You can customize your portal type and settings later in Studio Settings.
        </p>
      </div>
    </div>
  );
}
