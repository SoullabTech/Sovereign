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
  accentColor = 'text-soul-accent'
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-soul-surface/60 backdrop-blur-sm border border-soul-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${accentColor}`} />
          <h2 className="text-xl font-semibold text-soul-text">{title}</h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-soul-textSecondary" />
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
            <div className="px-6 pb-6 border-t border-soul-borderSubtle pt-4">
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
      <div className="min-h-screen bg-gradient-to-b from-soul-background via-soul-surface to-soul-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-soul-textSecondary"
        >
          Loading aspect interpretation...
        </motion.div>
      </div>
    );
  }

  if (!aspectData.synthesis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-soul-background via-soul-surface to-soul-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-soul-textSecondary mb-4">
            Archetypal interpretation not yet available for this aspect
          </p>
          <Link href="/astrology" className="text-soul-accent hover:text-soul-accentGlow">
            ← Back to chart overview
          </Link>
        </motion.div>
      </div>
    );
  }

  const { planet1, planet2, aspectType, synthesis } = aspectData;
  const style = ASPECT_STYLES[aspectType] || ASPECT_STYLES.conjunction;

  // Capitalize planet names
  const planet1Name = planet1.charAt(0).toUpperCase() + planet1.slice(1);
  const planet2Name = planet2.charAt(0).toUpperCase() + planet2.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-background via-soul-surface to-soul-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/astrology"
            className="inline-flex items-center gap-2 text-soul-textSecondary hover:text-soul-accent transition-colors mb-8"
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

          <h1 className="text-3xl sm:text-4xl font-bold text-soul-text text-center mb-3">
            {planet1Name} {aspectType} {planet2Name}
          </h1>

          {/* Aspect type badge */}
          <div className="flex justify-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm ${style.accentBg} ${style.accent}`}>
              {style.label} ({style.degree})
            </span>
            {synthesis.elementalDynamic && (
              <span className="px-3 py-1 rounded-full text-sm bg-white/5 text-soul-textSecondary">
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
            className="bg-soul-surface/60 backdrop-blur-sm border border-soul-border rounded-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className={`w-5 h-5 ${style.accent}`} />
              <h2 className="text-xl font-semibold text-soul-text">What This Aspect Is</h2>
            </div>
            <p className="text-base sm:text-lg text-soul-text leading-relaxed mb-6">
              {synthesis.essence}
            </p>
            <div className={`border-l-2 ${style.border} pl-4 py-2`}>
              <p className="text-xs uppercase tracking-wider text-soul-textTertiary mb-1">Soul Question</p>
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
                <p className="text-soul-textSecondary mb-6">
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
                      <p className="text-sm text-soul-textSecondary leading-relaxed">
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
                      <p className="text-sm text-soul-textSecondary leading-relaxed">
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
                <p className="text-soul-textSecondary">
                  {style.description}
                </p>
              </div>
              <div className="space-y-3 text-soul-textSecondary">
                <p>
                  <strong className="text-soul-text">In your psyche:</strong> This aspect represents an ongoing
                  conversation between {planet1Name} and {planet2Name}. It's not something you have—it's
                  something you're always doing, whether consciously or not.
                </p>
                <p>
                  <strong className="text-soul-text">In daily life:</strong> You might notice this dynamic
                  in moments of decision, in recurring relationship patterns, in creative blocks or
                  breakthroughs, in the things you're drawn to and the things you resist.
                </p>
                <p>
                  <strong className="text-soul-text">In relationships:</strong> Others may experience aspects
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
                <p className="text-soul-textSecondary mb-6">
                  Rather than seeing this aspect as a fixed trait, Spiralogic invites you to work with it
                  as a <span className={`${style.accent} font-medium`}>participatory practice</span>.
                  These prompts are invitations, not assignments.
                </p>

                {synthesis.practicePrompt && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-soul-textTertiary mb-2">
                      Reflection Prompt
                    </p>
                    <p className="text-soul-text leading-relaxed border-l-2 border-soul-accent/50 pl-4 py-1">
                      {synthesis.practicePrompt}
                    </p>
                  </div>
                )}

                {synthesis.bodyAwareness && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wider text-soul-textTertiary mb-2">
                      Body Awareness
                    </p>
                    <p className="text-soul-textSecondary leading-relaxed">
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
          <p className="text-soul-textSecondary mb-4">
            Want to explore this aspect more personally? MAIA can help you understand
            how it shows up specifically in your life.
          </p>
          <Link
            href="/maia"
            className={`inline-flex items-center gap-2 bg-gradient-to-r from-soul-accent to-soul-accentGlow text-soul-background px-8 py-4 rounded-full font-semibold hover:shadow-lg ${style.glow} transition-all duration-300`}
          >
            <MessageCircle className="w-5 h-5" />
            Explore with MAIA
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
