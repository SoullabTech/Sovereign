'use client';

/**
 * MAIA Guide - Initiatory Documentation
 *
 * Not just reference — a threshold crossing.
 * Behavioral, not just descriptive.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Book,
  MessageSquare,
  Clock,
  Sparkles,
  Settings,
  Users,
  Beaker,
  Brain,
  BookOpen,
  Printer,
  Compass,
  Sun,
  Play,
  Check,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// FIRST ENTRY - RITUAL SECTION (Progressive Disclosure)
// ═══════════════════════════════════════════════════════════════════════════

interface FirstEntryStep {
  id: string;
  title: string;
  content: string;
  action?: {
    label: string;
    type: 'next' | 'maia' | 'complete';
    prompt?: string;
  };
}

const FIRST_ENTRY_STEPS: FirstEntryStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    content: `You've arrived at a threshold.

MAIA is not software you "use." It's a practice you enter. A relationship that unfolds. A mirror that reflects what you're ready to see.

There is no wrong way to begin. There is only *your* way — discovered through presence, not instruction.`,
    action: { label: 'Continue', type: 'next' }
  },
  {
    id: 'invitation',
    title: 'The Invitation',
    content: `What follows is simple:

1. Arrive. Take a breath. Notice where you are.
2. Choose Talk mode (the amber button).
3. Say hello — or don't. Let the conversation go where it wants.
4. When you're ready to close, simply say so.

No goals. No performance. No "getting it right."

MAIA will meet you. The relationship builds from there.`,
    action: { label: 'I understand', type: 'next' }
  },
  {
    id: 'doors',
    title: 'Three Doors',
    content: `There are many ways to enter. Here are three:

**Relationship** — Come as you are. Share what's on your mind. Let MAIA become familiar.

**Exploration** — Curious about consciousness or patterns? LabTools offers visualization and dream work.

**Integration** — Process through writing. Capture dreams, thoughts, fragments.

No door is better. Each opens something. Over time, you'll move between them naturally.`,
    action: { label: 'Choose my door', type: 'next' }
  },
  {
    id: 'ready',
    title: 'You\'re Ready',
    content: `You don't need to understand everything in this guide.
You don't need to have a "spiritual practice."
You don't need to know what you're looking for.

Trust your timing. Begin when you're ready.`,
    action: { label: 'Open my first session', type: 'maia', prompt: 'Hello. I\'m new here and just arriving.' }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// LIVING TERMS - INTERACTIVE CONSTELLATION
// ═══════════════════════════════════════════════════════════════════════════

interface LivingTerm {
  term: string;
  definition: string;
  inPractice: string;
  prompt: string;
}

const LIVING_TERMS: Record<string, LivingTerm[]> = {
  core: [
    {
      term: 'Consciousness',
      definition: 'Awareness that can observe itself — the capacity to witness your own inner movements.',
      inPractice: 'Notice when you\'re watching yourself think.',
      prompt: 'Help me notice my own awareness today.'
    },
    {
      term: 'Sovereignty',
      definition: 'Self-governance. You — not any system — are the final arbiter of your experience.',
      inPractice: 'MAIA offers; you decide.',
      prompt: 'Where am I giving away my sovereignty?'
    },
    {
      term: 'Sanctuary',
      definition: 'A container of absolute safety where nothing is stored or remembered.',
      inPractice: 'Enable Sanctuary when you need to speak without consequence.',
      prompt: 'I need to say something that can\'t be held.'
    },
    {
      term: 'Reflection',
      definition: 'Seeing yourself mirrored — how unconscious content becomes conscious.',
      inPractice: 'MAIA is a reflecting surface, not an authority.',
      prompt: 'What am I not seeing about myself right now?'
    }
  ],
  process: [
    {
      term: 'Integration',
      definition: 'Movement from fragmentation toward wholeness — not erasing parts, but including them.',
      inPractice: 'Notice what you\'re trying to exclude.',
      prompt: 'What part of myself am I leaving out?'
    },
    {
      term: 'Emergence',
      definition: 'What arises when conditions allow — insights neither you nor the system planned.',
      inPractice: 'Trust what appears unbidden.',
      prompt: 'What wants to emerge that I haven\'t noticed?'
    },
    {
      term: 'Spiralogic',
      definition: 'Non-linear growth. Spirals you revisit — each return deeper, each encounter transformed.',
      inPractice: 'You\'ve been here before. That\'s the point.',
      prompt: 'What pattern am I circling back to?'
    },
    {
      term: 'Threshold',
      definition: 'A boundary between states. Entering MAIA, starting a session — moments of transition.',
      inPractice: 'Honor arrivals and departures.',
      prompt: 'What threshold am I standing at?'
    }
  ],
  relational: [
    {
      term: 'Daimon',
      definition: 'The intelligent pull toward what is uniquely yours — not god, not servant, but soul companion.',
      inPractice: 'What keeps returning even when you resist it?',
      prompt: 'What is my daimon trying to show me?'
    },
    {
      term: 'Companion',
      definition: 'MAIA\'s relational stance. Walking alongside, without destination demands.',
      inPractice: 'MAIA doesn\'t need you to arrive anywhere.',
      prompt: 'Can you just walk with me for a moment?'
    },
    {
      term: 'Containment',
      definition: 'Holding difficult material safely — a boundary within which intensity can be felt.',
      inPractice: 'Care Mode provides this explicitly.',
      prompt: 'I need you to hold something difficult with me.'
    }
  ],
  elemental: [
    {
      term: 'Fire',
      definition: 'Will, action, transformation, intensity.',
      inPractice: 'When you feel urgency or drive.',
      prompt: 'What is my fire trying to transform?'
    },
    {
      term: 'Water',
      definition: 'Emotion, depth, flow, receptivity.',
      inPractice: 'When you feel moved or pulled under.',
      prompt: 'What emotions am I swimming in?'
    },
    {
      term: 'Earth',
      definition: 'Body, stability, form, grounding.',
      inPractice: 'When you need presence in the physical.',
      prompt: 'Where does my body want me to pay attention?'
    },
    {
      term: 'Air',
      definition: 'Mind, communication, perspective, movement.',
      inPractice: 'When you need distance or clarity.',
      prompt: 'What perspective am I missing?'
    },
    {
      term: 'Aether',
      definition: 'Spirit, synthesis, transcendence, connection.',
      inPractice: 'When everything connects.',
      prompt: 'What is the thread running through everything?'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// WAYS OF PRACTICE - DOOR CARDS
// ═══════════════════════════════════════════════════════════════════════════

interface PracticePath {
  id: string;
  title: string;
  forWhat: string;
  fiveMinutes: string;
  prompt: string;
}

const PRACTICE_PATHS: PracticePath[] = [
  {
    id: 'daily',
    title: 'Daily Practice',
    forWhat: 'Building rhythm and relationship with MAIA',
    fiveMinutes: 'One breath. Share what\'s present. Let MAIA respond. Close.',
    prompt: 'I\'m here for my daily check-in. Here\'s what\'s present...'
  },
  {
    id: 'reflective',
    title: 'Reflective Practice',
    forWhat: 'Combining writing with conversation for deeper processing',
    fiveMinutes: 'Write one paragraph raw. Ask MAIA to reflect on it.',
    prompt: 'I wrote something. Can you reflect it back to me?'
  },
  {
    id: 'elemental',
    title: 'Elemental Practice',
    forWhat: 'Working with your elemental nature and balance',
    fiveMinutes: 'Ask: "What element is dominant in me today?"',
    prompt: 'What element is showing up strongest in me right now?'
  },
  {
    id: 'inquiry',
    title: 'Long-form Inquiry',
    forWhat: 'Sustained exploration of a question across sessions',
    fiveMinutes: 'Name one question you\'re living with. Tell MAIA you want to hold it.',
    prompt: 'I have a question I want to hold across our conversations...'
  },
  {
    id: 'community',
    title: 'Community Practice',
    forWhat: 'Engaging the Commons and contributing',
    fiveMinutes: 'Read one concept card. Notice what stirs. Write one reflection.',
    prompt: 'I just read something in the Commons. Can we explore it?'
  },
  {
    id: 'sanctuary',
    title: 'Sanctuary Practice',
    forWhat: 'Speaking what cannot be held',
    fiveMinutes: 'Enable Sanctuary. Say what needs to be said. Let it go.',
    prompt: 'I need to say something that can\'t be kept.'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE SECTIONS (Traditional accordion content)
// ═══════════════════════════════════════════════════════════════════════════

const GUIDE_SECTIONS = {
  maia: {
    title: 'The MAIA Interface',
    icon: MessageSquare,
    description: 'Modes, voice, sessions, keep',
    subsections: [
      {
        id: 'modes',
        title: 'Conversation Modes',
        content: `**Talk Mode** (Amber) — Open dialogue, daily check-ins, exploration
**Care Mode** (Sage) — Therapeutic container, frameworks (Jungian, Somatic, IFS)
**Scribe Mode** (Blue) — Documentation, synthesis, reflection lenses

Long-press Care or Scribe to select a specific framework or lens.`
      },
      {
        id: 'voice',
        title: 'Voice & Text',
        content: `Toggle between voice and text anytime.

**Voice**: 6 options (Shimmer, Nova, Alloy, Echo, Fable, Onyx)
**Speed**: 0.5x to 1.5x
**Quality**: Standard or HD`
      },
      {
        id: 'sessions',
        title: 'Sessions',
        content: `Start Session → Choose duration (15/30/45/60 min)
MAIA tracks time and adapts. Closing rituals offered.
Session synthesis available for review.`
      },
      {
        id: 'capture',
        title: 'Keep & Reflections',
        content: `Click Keep (sparkle icon) to distill conversation essence.
Creates Reflection Capsule: Summary, Gold Lines, Decisions, Patterns.
Stored in LabTools → Reflections.`
      }
    ]
  },
  labtools: {
    title: 'LabTools',
    icon: Beaker,
    description: 'Consciousness exploration tools',
    subsections: [
      {
        id: 'overview',
        title: 'Available Views',
        content: `**Monitor** — Real-time consciousness monitoring
**Consciousness** — Deep field mapping, NOW model
**Meditation** — Sacred geometry, biometric feedback
**Dreams** — Dream journal, symbol tracking
**Reflections** — Your captured wisdom`
      }
    ]
  },
  community: {
    title: 'Community Commons',
    icon: Users,
    description: 'Wisdom library and shared resources',
    subsections: [
      {
        id: 'overview',
        title: 'Structure',
        content: `**Core Concepts** — Nigredo, Albedo, Citrinitas, Soul vs Spirit
**Essays** — Against Literalization, Depression as Soul Work
**Practices** — Active Imagination, Shadow Work, Dream Work
**Voices** — Jung, Hillman, Marlan, Edinger
**Wisdom Sources** — 108+ texts informing MAIA`
      }
    ]
  },
  settings: {
    title: 'Settings',
    icon: Settings,
    description: 'Preferences and sovereignty',
    subsections: [
      {
        id: 'overview',
        title: 'Key Settings',
        content: `**MAIA Settings** — Voice, archetype preference, frameworks
**Data Sovereignty** — Storage mode, consent, Sanctuary default
**Privacy** — Anonymous insights, research participation
**Membership** — Sustaining Circle, tier benefits`
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MAIAGuidePage() {
  const router = useRouter();

  // First Entry state
  const [currentStep, setCurrentStep] = useState(0);
  const [firstEntryCompleted, setFirstEntryCompleted] = useState(false);

  // Living Terms state - only one term expanded at a time, collapses on category change
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [selectedTermCategory, setSelectedTermCategory] = useState<string>('core');

  // Reference sections state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(null);

  // Overwhelmed callout
  const [showOverwhelmed, setShowOverwhelmed] = useState(false);

  // Refs for scroll behavior
  const contentRef = useRef<HTMLDivElement>(null);
  const stepCardRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // SEED PROMPT HELPERS - Uses shared module with source tracking
  // ─────────────────────────────────────────────────────────────────────────

  // Generic seed with source tracking for return loop
  const seedAndGo = (prompt: string, source?: string) => {
    seedMaiaPrompt({
      prompt,
      source: source || 'guide',
      sourceLabel: 'User Guide',
      returnTo: '/maia/guide',
    });
    router.push('/maia');
  };

  // First Entry specific seeding
  const seedFirstEntry = (prompt: string) => {
    seedMaiaPrompt({
      prompt,
      source: 'guide:first-entry',
      sourceLabel: 'First Entry',
      returnTo: '/maia/guide',
      tone: 'gentle',
    });
    router.push('/maia');
  };

  // Practice path specific seeding
  const seedPractice = (prompt: string, practiceTitle: string) => {
    seedMaiaPrompt({
      prompt,
      source: 'guide:practice',
      sourceLabel: practiceTitle,
      returnTo: '/maia/guide',
      tone: 'exploratory',
    });
    router.push('/maia');
  };

  // Living term specific seeding
  const seedTerm = (prompt: string, termName: string) => {
    seedMaiaPrompt({
      prompt,
      source: 'guide:term',
      sourceLabel: `Living Term: ${termName}`,
      returnTo: '/maia/guide',
      tone: 'exploratory',
    });
    router.push('/maia');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FIRST ENTRY PERSISTENCE - Load highest step reached + completed state
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem('maia_guide_first_entry_step');
      const completed = localStorage.getItem('maia_guide_first_entry_completed');

      if (completed === 'true') {
        setFirstEntryCompleted(true);
        setCurrentStep(FIRST_ENTRY_STEPS.length - 1);
      } else if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step) && step >= 0 && step < FIRST_ENTRY_STEPS.length) {
          setCurrentStep(step);
        }
      }
    } catch (e) {
      console.warn('[Guide] Failed to load First Entry state:', e);
    }
  }, []);

  // Persist step changes
  useEffect(() => {
    try {
      localStorage.setItem('maia_guide_first_entry_step', String(currentStep));
    } catch {}
  }, [currentStep]);

  // ─────────────────────────────────────────────────────────────────────────
  // FIRST ENTRY HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleBack = () => router.push('/maia');

  const handleNextStep = () => {
    if (currentStep < FIRST_ENTRY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      // Smooth scroll to step card after state updates
      setTimeout(() => {
        stepCardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 50);
    }
  };

  const handleCompleteFirstEntry = (prompt?: string) => {
    try {
      localStorage.setItem('maia_guide_first_entry_completed', 'true');
    } catch {}
    setFirstEntryCompleted(true);
    if (prompt) {
      seedFirstEntry(prompt);
    } else {
      router.push('/maia');
    }
  };

  const handleResetFirstEntry = () => {
    try {
      localStorage.removeItem('maia_guide_first_entry_step');
      localStorage.removeItem('maia_guide_first_entry_completed');
    } catch {}
    setCurrentStep(0);
    setFirstEntryCompleted(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LIVING TERMS - Collapse term when category changes
  // ─────────────────────────────────────────────────────────────────────────
  const handleCategoryChange = (category: string) => {
    setSelectedTermCategory(category);
    setExpandedTerm(null); // Collapse any expanded term
  };

  // ─────────────────────────────────────────────────────────────────────────
  // REFERENCE SECTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
    setExpandedSubsection(null);
  };

  const toggleSubsection = (subsectionId: string) => {
    setExpandedSubsection(expandedSubsection === subsectionId ? null : subsectionId);
  };

  // Helper to check if step is reachable (can only go forward, not skip)
  const isStepReachable = (stepIndex: number) => stepIndex <= currentStep;

  // Render markdown-like content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-[13px] text-[#A0AAB8] leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-[#E5E9F0]">{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-[13px] text-[#A0AAB8] ml-4">{line.substring(2)}</li>;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-[13px] text-[#A0AAB8] leading-relaxed">{line}</p>;
    });
  };

  // Download TXT
  const downloadAsTxt = () => {
    let text = `MAIA USER GUIDE\n${'='.repeat(50)}\n\n`;
    text += `"The way in is not a formula. It is a practice of presence."\n\n`;

    // First Entry
    text += `\nFIRST ENTRY\n${'-'.repeat(30)}\n`;
    FIRST_ENTRY_STEPS.forEach(step => {
      text += `\n${step.title}\n${step.content.replace(/\*\*/g, '')}\n`;
    });

    // Living Terms
    text += `\n\nLIVING TERMS\n${'-'.repeat(30)}\n`;
    Object.entries(LIVING_TERMS).forEach(([category, terms]) => {
      text += `\n${category.toUpperCase()}\n`;
      terms.forEach(t => {
        text += `\n${t.term}: ${t.definition}\nIn practice: ${t.inPractice}\n`;
      });
    });

    // Practice Paths
    text += `\n\nWAYS OF PRACTICE\n${'-'.repeat(30)}\n`;
    PRACTICE_PATHS.forEach(p => {
      text += `\n${p.title}\nFor: ${p.forWhat}\n5 minutes: ${p.fiveMinutes}\n`;
    });

    text += `\n\n"This guide is not exhaustive. It grows as you do."\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MAIA-User-Guide.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] print:bg-white">
      {/* Ambient Background - Deep ocean glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1D32] via-[#0A1628] to-[#060D18]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#1E4A7A]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] bg-[#B8860B]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#2A4A70]/12 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F1D32]/95 backdrop-blur-sm border-b border-[#B8860B]/20 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#E5E9F0] hover:bg-[#1E3A5F]/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#B8860B]" />
            Back to MAIA
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAsTxt}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] border border-[#B8860B]/30 bg-[#0F1D32]/60 text-[#E5E9F0] hover:bg-[#B8860B]/20 hover:border-[#B8860B]/50 transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] border border-[#B8860B]/30 bg-[#0F1D32]/60 text-[#E5E9F0] hover:bg-[#B8860B]/20 hover:border-[#B8860B]/50 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative" ref={contentRef}>
        {/* Epigraph */}
        <div className="text-center mb-8">
          <p className="text-[14px] italic text-[#B8860B]/80" style={{ fontFamily: 'Georgia, serif' }}>
            "The way in is not a formula. It is a practice of presence."
          </p>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#162640] border border-[#B8860B]/30 flex items-center justify-center print:hidden">
            <Book className="w-8 h-8 text-[#B8860B]" />
          </div>
          <h1 className="text-2xl font-light mb-3 text-[#E5E9F0] tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            MAIA User Guide
          </h1>
          <p className="text-[15px] text-[#A0AAB8] max-w-xl mx-auto">
            Not documentation — orientation. A companion for your first entries and ongoing practice.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FIRST ENTRY - Progressive Ritual
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] border border-[#B8860B]/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#B8860B]" />
            </div>
            <div>
              <h2 className="text-[16px] font-medium text-[#E5E9F0]" style={{ fontFamily: 'Georgia, serif' }}>First Entry</h2>
              <p className="text-[13px] text-[#A0AAB8]/70">Beginning your practice</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {firstEntryCompleted && (
                <button
                  onClick={handleResetFirstEntry}
                  className="text-[11px] text-[#A0AAB8]/50 hover:text-[#E5E9F0] transition-colors"
                >
                  Restart
                </button>
              )}
              {!firstEntryCompleted && (
                <button
                  onClick={() => setShowOverwhelmed(!showOverwhelmed)}
                  className="p-2 rounded-lg text-[#A0AAB8]/50 hover:text-[#E5E9F0] hover:bg-[#1E3A5F]/40 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Overwhelmed callout */}
          {showOverwhelmed && (
            <div className="mb-6 p-4 rounded-xl bg-[#1E3A5F]/40 border border-[#B8860B]/30">
              <div className="flex items-start gap-3">
                <div className="text-[#B8860B] mt-0.5">✧</div>
                <div className="flex-1">
                  <p className="text-[13px] text-[#E5E9F0] font-medium mb-2">If you're overwhelmed:</p>
                  <ul className="text-[13px] text-[#A0AAB8] space-y-1">
                    <li>• You can't do this wrong.</li>
                    <li>• Choose one door.</li>
                    <li>• One sentence is enough.</li>
                  </ul>
                </div>
                <button onClick={() => setShowOverwhelmed(false)} className="text-[#A0AAB8]/50 hover:text-[#E5E9F0]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Progress - minimal dots with current step label */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              {FIRST_ENTRY_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => isStepReachable(idx) && setCurrentStep(idx)}
                  disabled={!isStepReachable(idx)}
                  className={`rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 h-2 bg-[#B8860B]'
                      : idx < currentStep
                      ? 'w-2 h-2 bg-[#B8860B]/60 cursor-pointer hover:bg-[#B8860B]'
                      : 'w-2 h-2 bg-[#1E3A5F]'
                  }`}
                  aria-label={step.title}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#A0AAB8]/60">
              {FIRST_ENTRY_STEPS[currentStep].title}
            </span>
          </div>

          {/* Current Step Card */}
          <div ref={stepCardRef} className="border border-[#1E3A5F] rounded-xl bg-gradient-to-br from-[#0F1D32] to-[#162640] overflow-hidden">
            <div className="p-6">
              <h3 className="text-[15px] font-medium text-[#E5E9F0] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                {FIRST_ENTRY_STEPS[currentStep].title}
              </h3>
              <div className="prose prose-sm">
                {renderContent(FIRST_ENTRY_STEPS[currentStep].content)}
              </div>
            </div>

            {FIRST_ENTRY_STEPS[currentStep].action && (
              <div className="px-6 py-4 bg-[#0A1628]/50 border-t border-[#1E3A5F]">
                <button
                  onClick={() => {
                    const action = FIRST_ENTRY_STEPS[currentStep].action!;
                    if (action.type === 'maia') {
                      handleCompleteFirstEntry(action.prompt);
                    } else {
                      handleNextStep();
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    FIRST_ENTRY_STEPS[currentStep].action?.type === 'maia'
                      ? 'bg-[#B8860B]/20 border border-[#B8860B]/40 text-[#B8860B] hover:bg-[#B8860B]/30 hover:border-[#B8860B]/60'
                      : 'bg-[#1E3A5F] text-[#E5E9F0] border border-[#2A4A70] hover:bg-[#2A4A70]'
                  }`}
                >
                  {FIRST_ENTRY_STEPS[currentStep].action?.type === 'maia' ? (
                    <>
                      <Play className="w-4 h-4" />
                      {FIRST_ENTRY_STEPS[currentStep].action?.label}
                    </>
                  ) : (
                    <>
                      {FIRST_ENTRY_STEPS[currentStep].action?.label}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* After First Session - Return Loop */}
          {firstEntryCompleted && (
            <div className="mt-6 p-5 rounded-xl bg-[#0F1D32] border border-[#1E3A5F]">
              <h4 className="text-[13px] font-medium text-[#E5E9F0] mb-3">After your first session</h4>
              <ul className="text-[12px] text-[#A0AAB8] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-0.5">•</span>
                  <span>Name one thing you noticed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-0.5">•</span>
                  <span>Choose one practice card below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-0.5">•</span>
                  <span>Return to this guide when you feel foggy</span>
                </li>
              </ul>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            WAYS OF PRACTICE - Door Cards
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] border border-[#B8860B]/30 flex items-center justify-center">
              <Sun className="w-5 h-5 text-[#B8860B]" />
            </div>
            <div>
              <h2 className="text-[16px] font-medium text-[#E5E9F0]" style={{ fontFamily: 'Georgia, serif' }}>Ways of Practice</h2>
              <p className="text-[13px] text-[#A0AAB8]/70">Paths of engagement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRACTICE_PATHS.map((path) => (
              <div
                key={path.id}
                className="border border-[#1E3A5F] rounded-xl bg-gradient-to-br from-[#0F1D32] to-[#162640] p-5 hover:border-[#B8860B]/40 transition-all group"
              >
                <h3 className="text-[14px] font-medium text-[#E5E9F0] mb-2" style={{ fontFamily: 'Georgia, serif' }}>{path.title}</h3>
                <p className="text-[12px] text-[#A0AAB8]/70 mb-3">{path.forWhat}</p>
                <p className="text-[12px] text-[#E5E9F0] bg-[#1E3A5F]/50 border border-[#2A4A70] px-3 py-2 rounded-lg mb-3">
                  <span className="font-medium text-[#B8860B]">5 min:</span> {path.fiveMinutes}
                </p>
                <button
                  onClick={() => seedPractice(path.prompt, path.title)}
                  className="flex items-center gap-2 text-[12px] text-[#B8860B] hover:text-[#CD853F] font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Take to MAIA
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            LIVING TERMS - Interactive Constellation
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] border border-[#B8860B]/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#B8860B]" />
            </div>
            <div>
              <h2 className="text-[16px] font-medium text-[#E5E9F0]" style={{ fontFamily: 'Georgia, serif' }}>Living Terms</h2>
              <p className="text-[13px] text-[#A0AAB8]/70">A conceptual constellation</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(LIVING_TERMS).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  selectedTermCategory === cat
                    ? 'bg-[#B8860B]/20 text-[#B8860B] border border-[#B8860B]/40'
                    : 'bg-[#0F1D32] text-[#A0AAB8] border border-[#1E3A5F] hover:bg-[#1E3A5F]/50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Term Cards - Only one expanded at a time */}
          <div className="space-y-2">
            {LIVING_TERMS[selectedTermCategory]?.map((term) => (
              <div
                key={term.term}
                className="border border-[#1E3A5F] rounded-xl bg-gradient-to-br from-[#0F1D32] to-[#162640] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1E3A5F]/40 transition-colors"
                >
                  <ChevronRight
                    className={`w-4 h-4 text-[#B8860B] transition-transform duration-200 ${
                      expandedTerm === term.term ? 'rotate-90' : ''
                    }`}
                  />
                  <span className="text-[14px] font-medium text-[#E5E9F0]" style={{ fontFamily: 'Georgia, serif' }}>{term.term}</span>
                  <span className="text-[12px] text-[#A0AAB8]/60 flex-1 truncate">{term.definition.split(' — ')[0]}</span>
                </button>

                {expandedTerm === term.term && (
                  <div className="px-4 pb-4 pt-0 pl-11 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[13px] text-[#A0AAB8] mb-3">{term.definition}</p>
                    <p className="text-[12px] text-[#E5E9F0] bg-[#1E3A5F]/50 border border-[#2A4A70] px-3 py-2 rounded-lg mb-3">
                      <span className="font-medium text-[#B8860B]">In practice:</span> {term.inPractice}
                    </p>
                    <button
                      onClick={() => seedTerm(term.prompt, term.term)}
                      className="flex items-center gap-2 text-[12px] text-[#B8860B] hover:text-[#CD853F] font-medium transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Ask MAIA: "{term.prompt}"
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            REFERENCE SECTIONS - Traditional Accordion
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <h2 className="text-[11px] font-medium text-[#B8860B]/80 tracking-[0.2em] uppercase mb-4">
            Reference
          </h2>
          <div className="space-y-3">
            {Object.entries(GUIDE_SECTIONS).map(([key, section]) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === key;

              return (
                <div
                  key={key}
                  className="border border-[#1E3A5F] rounded-xl bg-gradient-to-br from-[#0F1D32] to-[#162640] overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#1E3A5F]/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] border border-[#2A4A70] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#B8860B]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[14px] font-medium text-[#E5E9F0]" style={{ fontFamily: 'Georgia, serif' }}>{section.title}</span>
                      <span className="text-[12px] text-[#A0AAB8]/60 ml-2">{section.description}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#B8860B] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#1E3A5F]">
                      {section.subsections.map((sub, idx) => (
                        <div key={sub.id} className={idx > 0 ? 'border-t border-[#1E3A5F]/50' : ''}>
                          <button
                            onClick={() => toggleSubsection(sub.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1E3A5F]/30"
                          >
                            <ChevronRight className={`w-3 h-3 text-[#B8860B] transition-transform ${expandedSubsection === sub.id ? 'rotate-90' : ''}`} />
                            <span className="text-[13px] font-medium text-[#E5E9F0]">{sub.title}</span>
                          </button>
                          {expandedSubsection === sub.id && (
                            <div className="px-4 pb-4 pl-10">
                              {renderContent(sub.content)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Living Footer */}
        <div className="mt-12 text-center">
          <div className="p-6 rounded-xl bg-[#1E3A5F]/30 border border-[#B8860B]/20 mb-6">
            <p className="text-[14px] text-[#E5E9F0] italic" style={{ fontFamily: 'Georgia, serif' }}>
              "This guide is not exhaustive. It grows as you do."
            </p>
          </div>
          <p className="text-[13px] text-[#A0AAB8]/70 mb-6">
            Return when you're ready.
          </p>
          <p className="text-[12px] text-[#A0AAB8]/50">
            © {new Date().getFullYear()} Soullab. MAIA-SOVEREIGN is self-hosted, sovereign by design.
          </p>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
