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
  ArrowLeft,
  Stethoscope,
  Briefcase,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';
import {
  MODULE_DEFINITIONS,
  getDefaultModules,
  getModulesByCategory,
  CATEGORY_LABELS,
  type PortalType,
  type ModuleSlug,
  type ModuleCategory,
} from '@/lib/studio/moduleDefinitions';

// ─── Portal Type Config ─────────────────────────────────

interface PortalOption {
  type: PortalType;
  label: string;
  description: string;
  icon: typeof Sparkles;
  bestFor: string[];
  examples: string[];
}

const PORTAL_OPTIONS: PortalOption[] = [
  {
    type: 'generalist',
    label: 'Generalist / Eclectic',
    description: 'For practitioners who blend multiple modalities',
    icon: Sparkles,
    bestFor: ['You draw from many traditions', 'Your practice is uniquely yours', 'You resist labels'],
    examples: ['Energy healing', 'Intuitive guidance', 'Spiritual coaching', 'Shamanic work'],
  },
  {
    type: 'astrology',
    label: 'Astrology / Divination',
    description: 'For practitioners who deliver readings and artifacts',
    icon: Star,
    bestFor: ['You read charts or cards', 'You create artifacts for clients', 'You interpret cycles and timing'],
    examples: ['Natal charts', 'Transits', 'Tarot', 'Human Design'],
  },
  {
    type: 'therapy',
    label: 'Therapy / Coaching',
    description: 'For session-based therapeutic practices',
    icon: Heart,
    bestFor: ['You hold space in sessions', 'You track progress over time', 'You maintain case notes'],
    examples: ['Psychotherapy', 'Life coaching', 'Counseling', 'Integration'],
  },
  {
    type: 'clinician',
    label: 'Clinician',
    description: 'For licensed clinical practitioners',
    icon: Stethoscope,
    bestFor: ['You hold a clinical license', 'You need encrypted notes', 'You manage a clinical caseload'],
    examples: ['Psychiatry', 'Psychology', 'LCSW/LMFT', 'Psychiatric nursing'],
  },
  {
    type: 'bodywork',
    label: 'Bodywork',
    description: 'For hands-on healing modalities',
    icon: Hand,
    bestFor: ['You work with the physical body', 'Sessions are in-person', 'You schedule by service type'],
    examples: ['Massage', 'Acupuncture', 'Somatic therapy', 'Craniosacral'],
  },
  {
    type: 'groups',
    label: 'Groups / Ceremonies',
    description: 'For facilitators of group experiences',
    icon: Users,
    bestFor: ['You hold group containers', 'You run programs or cohorts', 'You facilitate retreats or circles'],
    examples: ['Workshops', 'Retreats', 'Circles', 'Group programs'],
  },
  {
    type: 'consultant',
    label: 'Consultant',
    description: 'For advisors who guide organizations and leaders through change',
    icon: Briefcase,
    bestFor: ['You advise leaders or teams', 'You facilitate decisions under pressure', 'You guide organizational change'],
    examples: ['Leadership coaching', 'Organizational design', 'DEI strategy', 'Business advisory'],
  },
];

// ─── Consultant Subtypes ────────────────────────────────

const CONSULTANT_SUBTYPES = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'organizational', label: 'Organizational' },
  { value: 'business', label: 'Business' },
  { value: 'dei', label: 'DEI' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'executive_coaching', label: 'Executive Coaching' },
  { value: 'change_management', label: 'Change Management' },
  { value: 'culture', label: 'Culture' },
];

// ─── Recommender Logic ──────────────────────────────────

type WorkStyle = '1:1' | 'groups' | 'both' | null;

function getRecommendation(
  workStyle: WorkStyle,
  needsPHI: boolean | null,
  decisionsWork: boolean | null
): PortalType | null {
  if (workStyle === null && needsPHI === null && decisionsWork === null) return null;

  if (decisionsWork === true) return 'consultant';
  if (needsPHI === true) return 'clinician';
  if (workStyle === 'groups') return 'groups';
  // 1:1 or both without specific signals — no strong recommendation
  return null;
}

// ─── Helpers ────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

// ─── Component ──────────────────────────────────────────

export default function CreatePortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<'fork' | 'type' | 'modules' | 'details'>('fork');
  const [selectedType, setSelectedType] = useState<PortalType | null>(null);
  const [creatingPersonal, setCreatingPersonal] = useState(false);

  // Recommender state
  const [workStyle, setWorkStyle] = useState<WorkStyle>(null);
  const [needsPHI, setNeedsPHI] = useState<boolean | null>(null);
  const [decisionsWork, setDecisionsWork] = useState<boolean | null>(null);
  const [showRecommender, setShowRecommender] = useState(false);

  // Module selection state
  const [selectedModules, setSelectedModules] = useState<Set<ModuleSlug>>(new Set());

  // Consultant profile state
  const [consultantSubtypes, setConsultantSubtypes] = useState<Set<string>>(new Set());
  const [consultantIndustries, setConsultantIndustries] = useState('');
  const [consultantNotes, setConsultantNotes] = useState('');

  // Details form state
  const [practiceName, setPracticeName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  const recommendation = getRecommendation(workStyle, needsPHI, decisionsWork);

  // Get member ID on mount
  useEffect(() => {
    const id = getLocalMemberId();
    setMemberId(id);
    if (id) checkExistingPractitioner();
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
    const timer = setTimeout(() => checkSlugAvailability(slug), 500);
    return () => clearTimeout(timer);
  }, [slug]);

  // Initialize modules when type is selected
  useEffect(() => {
    if (selectedType) {
      const defaults = getDefaultModules(selectedType);
      setSelectedModules(new Set(defaults));
    }
  }, [selectedType]);

  async function checkExistingPractitioner() {
    try {
      const response = await apiFetch('/api/studio/whoami');
      const data = await response.json();
      if (data.isPractitioner) router.replace('/studio');
    } catch {
      // Not a practitioner, continue
    }
  }

  async function handlePersonalCreate() {
    if (!memberId) return;
    setCreatingPersonal(true);
    setError(null);

    try {
      const response = await apiFetch('/api/studio/personal/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to enter personal mode');
        return;
      }

      router.replace('/studio/field');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setCreatingPersonal(false);
    }
  }

  async function checkSlugAvailability(slug: string) {
    setCheckingSlug(true);
    try {
      const response = await apiFetch(`/api/portal/${slug}`);
      setSlugAvailable(response.status === 404);
    } catch {
      setSlugAvailable(true);
    } finally {
      setCheckingSlug(false);
    }
  }

  function handleTypeSelect(type: PortalType) {
    setSelectedType(type);
    setStep('modules');
  }

  function toggleModule(slug: ModuleSlug) {
    const mod = MODULE_DEFINITIONS.find(m => m.slug === slug);
    if (mod?.alwaysOn) return;
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleConsultantSubtype(value: string) {
    setConsultantSubtypes(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType || !practiceName.trim() || !slug.trim() || !memberId) return;

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        memberId,
        practiceName: practiceName.trim(),
        slug: slug.trim().toLowerCase(),
        email: email.trim() || `${slug}@soullab.life`,
        portalType: selectedType,
        enabledModules: Array.from(selectedModules),
      };

      if (selectedType === 'consultant' && consultantSubtypes.size > 0) {
        payload.consultantProfile = {
          subtypes: Array.from(consultantSubtypes),
          industries: consultantIndustries.trim()
            ? consultantIndustries.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          notes: consultantNotes.trim() || undefined,
        };
      }

      const response = await apiFetch('/api/practitioners/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create portal');
        return;
      }

      router.replace('/studio/settings?onboarding=calendar');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = PORTAL_OPTIONS.find(o => o.type === selectedType);
  const isSlugValid = slug.length >= 4 && /^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$/.test(slug);
  const modulesByCategory = getModulesByCategory();

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-white mb-3">
            {step === 'fork' && 'How will you use Studio?'}
            {step === 'type' && 'Choose your practice style'}
            {step === 'modules' && 'Your starting kit'}
            {step === 'details' && 'Set up your portal'}
          </h1>
          <p className="text-slate-400">
            {step === 'fork' && 'You can always switch later.'}
            {step === 'type' && 'Select the type that best describes how you work'}
            {step === 'modules' && 'These are your starting tools. You can add or remove any of them later in Settings.'}
            {step === 'details' && 'Choose a name and URL for your practice'}
          </p>

          {/* Step indicator (only for practitioner flow) */}
          {step !== 'fork' && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {['type', 'modules', 'details'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    s === step ? 'bg-amber-400' :
                    ['type', 'modules', 'details'].indexOf(step) > i ? 'bg-amber-400/40' :
                    'bg-slate-700'
                  }`} />
                  {i < 2 && <div className="w-8 h-px bg-slate-700" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ FORK: Personal vs Practitioner ═══ */}
        {step === 'fork' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal card */}
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-teal-500/15 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Personal</h3>
                <p className="text-sm text-slate-400 mb-4">
                  For your own decisions, transitions, and inner work
                </p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {['Decisions log', 'Changes / I Ching', 'MAIA companion', 'Vault'].map((item) => (
                    <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-teal-500/60 mt-0.5">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handlePersonalCreate}
                  disabled={creatingPersonal || !memberId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingPersonal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entering...
                    </>
                  ) : (
                    <>
                      Start
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Practitioner card */}
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Practitioner</h3>
                <p className="text-sm text-slate-400 mb-4">
                  For running a practice with clients
                </p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {['Client management', 'Session scheduling', 'Calendar & tasks', 'All personal tools included'].map((item) => (
                    <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-amber-500/60 mt-0.5">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setStep('type')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-amber-500/30 text-amber-400 rounded-xl hover:bg-amber-500/10 transition-colors"
                >
                  Set up practice
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 1: Type Selection ═══ */}
        {step === 'type' && (
          <div className="space-y-6">
            {/* Lightweight Recommender */}
            <div className="mb-6">
              <button
                onClick={() => setShowRecommender(!showRecommender)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showRecommender ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Not sure? Here&apos;s a guide
              </button>

              {showRecommender && (
                <div className="mt-4 p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-5">
                  {/* Q1: Work style */}
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Do you work primarily...</p>
                    <div className="flex gap-2">
                      {([['1:1', '1:1'], ['groups', 'Groups'], ['both', 'Both']] as const).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setWorkStyle(workStyle === val ? null : val)}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            workStyle === val
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 border'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2: PHI */}
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Do you need encrypted clinical notes?</p>
                    <div className="flex gap-2">
                      {([true, false] as const).map((val) => (
                        <button
                          key={String(val)}
                          onClick={() => setNeedsPHI(needsPHI === val ? null : val)}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            needsPHI === val
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 border'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Decisions */}
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Do you work with leaders or organizations on decisions?</p>
                    <div className="flex gap-2">
                      {([true, false] as const).map((val) => (
                        <button
                          key={String(val)}
                          onClick={() => setDecisionsWork(decisionsWork === val ? null : val)}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            decisionsWork === val
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 border'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back to fork */}
            <button
              type="button"
              onClick={() => setStep('fork')}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Portal Type Cards */}
            <div className="space-y-3">
              {PORTAL_OPTIONS.map((option) => {
                const isRecommended = recommendation === option.type;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleTypeSelect(option.type)}
                    className={`
                      w-full p-5 rounded-xl border text-left transition-all relative
                      ${isRecommended
                        ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}
                    `}
                  >
                    {isRecommended && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                        Recommended for you
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isRecommended ? 'bg-amber-500/20' : 'bg-slate-800'}
                      `}>
                        <option.icon className={`w-5 h-5 ${isRecommended ? 'text-amber-400' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-white">{option.label}</h3>
                          <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{option.description}</p>
                        <ul className="mt-2 space-y-0.5">
                          {option.bestFor.map((point) => (
                            <li key={point} className="text-xs text-slate-500 flex items-start gap-1.5">
                              <span className="text-slate-600 mt-0.5">-</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {option.examples.map((ex) => (
                            <span
                              key={ex}
                              className="text-xs px-2 py-0.5 bg-slate-800 text-slate-500 rounded"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Module Starter Kit ═══ */}
        {step === 'modules' && selectedType && (
          <div className="space-y-6">
            {/* Selected Type Badge */}
            <button
              type="button"
              onClick={() => setStep('type')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              {selectedOption && <selectedOption.icon className="w-4 h-4" />}
              <span>{selectedOption?.label}</span>
              <span className="text-amber-400/60 text-sm ml-2">Change</span>
            </button>

            {/* Module Groups */}
            {(Object.entries(modulesByCategory) as [ModuleCategory, typeof MODULE_DEFINITIONS][]).map(([category, modules]) => {
              if (modules.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {modules.map((mod) => {
                      const isEnabled = selectedModules.has(mod.slug);
                      const isLocked = mod.alwaysOn;
                      return (
                        <button
                          key={mod.slug}
                          type="button"
                          onClick={() => toggleModule(mod.slug)}
                          disabled={isLocked}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                            ${isLocked
                              ? 'bg-slate-800/30 border-slate-800 cursor-default'
                              : isEnabled
                                ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                          `}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                            isEnabled || isLocked ? 'bg-amber-500/30' : 'bg-slate-800 border border-slate-600'
                          }`}>
                            {(isEnabled || isLocked) && <Check className="w-3 h-3 text-amber-400" />}
                          </div>
                          <mod.icon className={`w-4 h-4 flex-shrink-0 ${
                            isEnabled || isLocked ? 'text-amber-400' : 'text-slate-500'
                          }`} />
                          <div className="min-w-0">
                            <span className={`text-sm ${isEnabled || isLocked ? 'text-white' : 'text-slate-400'}`}>
                              {mod.label}
                            </span>
                            {isLocked && (
                              <span className="text-[10px] text-slate-600 ml-2">Always on</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Consultant Profile (only for consultant type) */}
            {selectedType === 'consultant' && (
              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-sm font-medium text-white">Consultant Profile</h3>
                <p className="text-xs text-slate-400">Help us tailor your experience. All optional.</p>

                {/* Subtypes */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {CONSULTANT_SUBTYPES.map((sub) => (
                      <button
                        key={sub.value}
                        type="button"
                        onClick={() => toggleConsultantSubtype(sub.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          consultantSubtypes.has(sub.value)
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 border'
                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Industries (comma-separated, optional)</label>
                  <input
                    type="text"
                    value={consultantIndustries}
                    onChange={(e) => setConsultantIndustries(e.target.value)}
                    placeholder="e.g., Healthcare, Education, Tech"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Brief description (optional)</label>
                  <input
                    type="text"
                    value={consultantNotes}
                    onChange={(e) => setConsultantNotes(e.target.value)}
                    placeholder="e.g., Works with founder CEOs under scaling pressure"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-colors"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Practice Details ═══ */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Type + Module Count Badge */}
            <div className="flex items-center gap-3">
              {selectedOption && (
                <button
                  type="button"
                  onClick={() => setStep('type')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  <selectedOption.icon className="w-4 h-4" />
                  <span>{selectedOption.label}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep('modules')}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 hover:border-slate-600 transition-colors"
              >
                {selectedModules.size} modules
              </button>
            </div>

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
              <label className="block text-sm text-slate-400 mb-2">Your Portal URL</label>
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
                onClick={() => setStep('modules')}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
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
          {step === 'fork'
            ? 'You can add a practice later from Settings.'
            : 'You can change your practice style and modules later in Studio Settings.'}
        </p>
      </div>
    </div>
  );
}
