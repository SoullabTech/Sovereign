'use client';

/**
 * Individual Aspect Detail Page (Client Component)
 * Redesigned to help members understand their aspects as part of their psychic makeup
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Heart,
  Compass,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { synthesizeAspect, type AspectType, type AspectInterpretation } from '@/lib/astrology/aspectSynthesis';

// Aspect-specific color system
const ASPECT_STYLES = {
  square: {
    bg: 'from-rose-500/15 to-orange-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    accent: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    label: 'Dynamic Tension',
    degree: '90°',
    description: 'Squares create productive friction that demands growth. This is the aspect of the warrior—learning to integrate seemingly incompatible energies into a more complex whole.',
  },
  opposition: {
    bg: 'from-purple-500/15 to-fuchsia-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-500/10',
    label: 'Polar Dialogue',
    degree: '180°',
    description: 'Oppositions create awareness through contrast. You see yourself most clearly in the mirror of this dynamic—each side revealing what the other cannot see alone.',
  },
  trine: {
    bg: 'from-emerald-500/15 to-green-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    label: 'Flowing Harmony',
    degree: '120°',
    description: 'Trines represent natural gifts—areas where energy flows easily. The invitation is to consciously use what comes naturally instead of taking it for granted.',
  },
  sextile: {
    bg: 'from-sky-500/15 to-cyan-500/10',
    border: 'border-sky-500/30',
    glow: 'shadow-sky-500/20',
    accent: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    label: 'Supportive Opportunity',
    degree: '60°',
    description: 'Sextiles offer openings for growth that require some conscious effort to activate. The energy is available—the invitation is to use it.',
  },
  conjunction: {
    bg: 'from-amber-500/15 to-yellow-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    label: 'Fused Energy',
    degree: '0°',
    description: 'Conjunctions blend planetary energies into a unified force. These functions don\'t separate—they operate as one inseparable whole in your psyche.',
  },
  quincunx: {
    bg: 'from-indigo-500/15 to-violet-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    label: 'Awkward Adjustment',
    degree: '150°',
    description: 'Quincunxes connect energies that don\'t naturally understand each other. The work is constant adjustment, finding creative ways to honor both.',
  },
};

const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
};

// Collapsible section component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  accentColor = 'text-amber-400'
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${accentColor}`} />
          <h2 className="text-xl font-semibold text-amber-200">{title}</h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-amber-200/60" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 border-t border-white/10 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AspectDetailClient() {
  const params = useParams();
  const router = useRouter();

  if (!params) return null;

  const slugParam = params.slug as string | string[] | undefined;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) return null;

  const [aspectData, setAspectData] = useState<{
    planet1: string;
    planet2: string;
    aspectType: AspectType;
    synthesis: AspectInterpretation | null;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;

    // Parse slug: "sun-square-saturn" → {planet1: "sun", aspectType: "square", planet2: "saturn"}
    const parts = slug.split('-');
    if (parts.length < 3) {
      router.push('/astrology');
      return;
    }

    const planet1 = parts[0];
    const aspectType = parts[1] as AspectType;
    const planet2 = parts[2];

    // Get archetypal synthesis
    const synthesis = synthesizeAspect(planet1, planet2, aspectType);

    setAspectData({
      planet1,
      planet2,
      aspectType,
      synthesis,
    });
  }, [slug, router]);

  if (!aspectData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1b2e' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-amber-200/70"
        >
          Loading aspect interpretation...
        </motion.div>
      </div>
    );
  }

  const { planet1, planet2, aspectType } = aspectData;

  // Generate fallback interpretation for aspects not in the library
  const ASPECT_DYNAMICS: Record<AspectType, { label: string; essence: string; coreQuestion: string; shadow: string; gift: string }> = {
    conjunction: {
      label: 'fusion',
      essence: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} and ${planet2.charAt(0).toUpperCase() + planet2.slice(1)} merge into a unified force in your psyche. These two energies don't separate — they operate as one inseparable whole, amplifying and blending each other's qualities in everything you do.`,
      coreQuestion: `Where does this fused energy want to express itself most fully in your life?`,
      shadow: `The energies may reinforce each other's shadow — difficulty seeing where one ends and the other begins, leading to overwhelm or one-sidedness.`,
      gift: `When integrated, this conjunction creates a uniquely powerful synthesis — a signature gift that combines both planetary qualities in a way only you can express.`,
    },
    opposition: {
      label: 'polarity',
      essence: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} and ${planet2.charAt(0).toUpperCase() + planet2.slice(1)} stand across from each other in your chart, creating awareness through contrast. You see yourself most clearly when this dynamic is in full play — each side revealing what the other cannot see alone.`,
      coreQuestion: `What becomes possible when you hold both sides of this polarity without collapsing into either?`,
      shadow: `Oscillating between extremes, projecting one side onto others, or experiencing this as an irresolvable inner conflict.`,
      gift: `The capacity to hold apparent opposites in creative tension — a rare form of psychological wholeness that others may seek your counsel for.`,
    },
    trine: {
      label: 'harmony',
      essence: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} and ${planet2.charAt(0).toUpperCase() + planet2.slice(1)} flow together with natural ease. This is a gift aspect — energy moves between these two principles without friction, creating areas of natural talent and effortless expression.`,
      coreQuestion: `Are you consciously using what comes naturally here, or taking this gift for granted?`,
      shadow: `Natural gifts can be undervalued or overlooked. Ease can breed complacency, and what flows effortlessly may never be fully developed.`,
      gift: `A genuine natural talent where these two energies support and amplify each other without effort — a reliable source of flow and creative expression.`,
    },
    square: {
      label: 'tension',
      essence: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} and ${planet2.charAt(0).toUpperCase() + planet2.slice(1)} create productive friction in your chart. Squares demand integration — they are the aspects of growth through challenge, where two seemingly incompatible energies must learn to work together.`,
      coreQuestion: `What strength have you built from navigating this ongoing tension?`,
      shadow: `Experiencing this as an irresolvable conflict, exhaustion from constant inner friction, or expressing one side at the expense of the other.`,
      gift: `Hard-won resilience and capability. Those with strong squares often develop precisely the qualities that others find most admirable — forged in the friction.`,
    },
    sextile: {
      label: 'opportunity',
      essence: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} and ${planet2.charAt(0).toUpperCase() + planet2.slice(1)} offer supportive opportunities for growth. Unlike a trine, this ease requires some conscious activation — the energy is available and willing, but needs your intention to fully flower.`,
      coreQuestion: `Where are you leaving this supportive energy untapped?`,
      shadow: `The gentle nature of sextiles means they're often overlooked — potential that never quite gets activated because it doesn't demand attention.`,
      gift: `When consciously engaged, this becomes a reliable source of creative support and skillful action — a door that opens easily when you choose to walk through it.`,
    },
    quincunx: {
      label: 'adjustment',
      essence: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} and ${planet2.charAt(0).toUpperCase() + planet2.slice(1)} connect energies that don't naturally understand each other. The quincunx requires constant creative adjustment — finding ways to honor both principles even though they operate in fundamentally different registers.`,
      coreQuestion: `What creative synthesis have you discovered in navigating these mismatched energies?`,
      shadow: `Chronic tension from energies that don't speak the same language, leading to awkward compromises or a nagging sense that something is always slightly off.`,
      gift: `Unusual flexibility and creative problem-solving — the ability to bridge very different ways of being that others might never think to combine.`,
    },
  };

  const synthesis = aspectData.synthesis || (() => {
    const dynamic = ASPECT_DYNAMICS[aspectType] || ASPECT_DYNAMICS.conjunction;
    return {
      essence: dynamic.essence,
      coreQuestion: dynamic.coreQuestion,
      shadowExpression: dynamic.shadow,
      giftExpression: dynamic.gift,
      elementalDynamic: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} ${dynamic.label} ${planet2.charAt(0).toUpperCase() + planet2.slice(1)}`,
    };
  })();
  const style = ASPECT_STYLES[aspectType] || ASPECT_STYLES.conjunction;

  // Capitalize planet names
  const planet1Name = planet1.charAt(0).toUpperCase() + planet1.slice(1);
  const planet2Name = planet2.charAt(0).toUpperCase() + planet2.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1b2e' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/astrology"
            className="inline-flex items-center gap-2 text-amber-200/70 hover:text-amber-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chart Overview
          </Link>
        </motion.div>

        {/* Aspect Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`bg-gradient-to-br ${style.bg} border ${style.border} rounded-2xl p-8 mb-8`}
        >
          {/* Animated aspect symbol */}
          <motion.div
            className="flex items-center justify-center mb-6"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className={`text-7xl ${style.accent}`}>
              {ASPECT_SYMBOLS[aspectType]}
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-amber-200 text-center mb-3">
            {planet1Name} {aspectType} {planet2Name}
          </h1>

          {/* Aspect type badge */}
          <div className="flex justify-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm ${style.accentBg} ${style.accent}`}>
              {style.label} ({style.degree})
            </span>
            {synthesis.elementalDynamic && (
              <span className="px-3 py-1 rounded-full text-sm bg-white/5 text-amber-200/70">
                {synthesis.elementalDynamic}
              </span>
            )}
          </div>
        </motion.div>

        {/* Content sections with staggered animation */}
        <div className="space-y-4">
          {/* Archetypal Essence - Always open by default */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className={`w-5 h-5 ${style.accent}`} />
              <h2 className="text-xl font-semibold text-amber-200">What This Aspect Is</h2>
            </div>
            <p className="text-base sm:text-lg text-amber-200/90 leading-relaxed mb-6">
              {synthesis.essence}
            </p>
            <div className={`border-l-2 ${style.border} pl-4 py-2`}>
              <p className="text-xs uppercase tracking-wider text-amber-200/50 mb-1">Soul Question</p>
              <p className={`text-lg italic ${style.accent}`}>
                "{synthesis.coreQuestion}"
              </p>
            </div>
          </motion.div>

          {/* Shadow & Gift Section */}
          {(synthesis.shadowExpression || synthesis.giftExpression) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <CollapsibleSection
                title="The Spectrum: Shadow & Gift"
                icon={Eye}
                defaultOpen={true}
                accentColor={style.accent}
              >
                <p className="text-amber-200/70 mb-6">
                  Every aspect expresses across a spectrum. This isn't about "good" or "bad"—it's about
                  awareness. Recognizing where you are on the spectrum creates choice.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {synthesis.shadowExpression && (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <EyeOff className="w-4 h-4 text-rose-400" />
                        <p className="text-sm font-medium text-rose-400">When Unconscious</p>
                      </div>
                      <p className="text-sm text-amber-200/70 leading-relaxed">
                        {synthesis.shadowExpression}
                      </p>
                    </div>
                  )}
                  {synthesis.giftExpression && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-emerald-400" />
                        <p className="text-sm font-medium text-emerald-400">When Integrated</p>
                      </div>
                      <p className="text-sm text-amber-200/70 leading-relaxed">
                        {synthesis.giftExpression}
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {/* How This Shows Up - Aspect Type Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <CollapsibleSection
              title="How This Aspect Works"
              icon={Compass}
              accentColor={style.accent}
            >
              <div className={`${style.accentBg} border ${style.border} rounded-lg p-4 mb-4`}>
                <p className={`text-sm font-semibold ${style.accent} mb-2`}>
                  {style.label} ({style.degree})
                </p>
                <p className="text-amber-200/70">
                  {style.description}
                </p>
              </div>
              <div className="space-y-3 text-amber-200/70">
                <p>
                  <strong className="text-amber-200">In your psyche:</strong> This aspect represents an ongoing
                  conversation between {planet1Name} and {planet2Name}. It's not something you have—it's
                  something you're always doing, whether consciously or not.
                </p>
                <p>
                  <strong className="text-amber-200">In daily life:</strong> You might notice this dynamic
                  in moments of decision, in recurring relationship patterns, in creative blocks or
                  breakthroughs, in the things you're drawn to and the things you resist.
                </p>
                <p>
                  <strong className="text-amber-200">In relationships:</strong> Others may experience aspects
                  of you that you don't see directly. This dynamic often shows up in what you project onto
                  others or what they seem to trigger in you.
                </p>
              </div>
            </CollapsibleSection>
          </motion.div>

          {/* Practice Section */}
          {(synthesis.practicePrompt || synthesis.bodyAwareness) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <CollapsibleSection
                title="Working With This Aspect"
                icon={Heart}
                accentColor={style.accent}
              >
                <p className="text-amber-200/70 mb-6">
                  Rather than seeing this aspect as a fixed trait, Spiralogic invites you to work with it
                  as a <span className={`${style.accent} font-medium`}>participatory practice</span>.
                  These prompts are invitations, not assignments.
                </p>

                {synthesis.practicePrompt && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-amber-200/50 mb-2">
                      Reflection Prompt
                    </p>
                    <p className="text-amber-200 leading-relaxed border-l-2 border-amber-400/50 pl-4 py-1">
                      {synthesis.practicePrompt}
                    </p>
                  </div>
                )}

                {synthesis.bodyAwareness && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wider text-amber-200/50 mb-2">
                      Body Awareness
                    </p>
                    <p className="text-amber-200/70 leading-relaxed">
                      {synthesis.bodyAwareness}
                    </p>
                  </div>
                )}
              </CollapsibleSection>
            </motion.div>
          )}
        </div>

        {/* Talk to MAIA CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-amber-200/70 mb-4">
            Want to explore this aspect more personally? MAIA can help you understand
            how it shows up specifically in your life.
          </p>
          <Link
            href="/maia"
            className={`inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-8 py-4 rounded-full font-semibold hover:shadow-lg ${style.glow} transition-all duration-300`}
          >
            <MessageCircle className="w-5 h-5" />
            Explore with MAIA
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
