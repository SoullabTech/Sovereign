'use client';

/**
 * Individual Aspect Detail Page
 *
 * Shows archetypal synthesis + Spiralogic interpretation for a specific aspect
 * URL pattern: /astrology/aspects/sun-square-saturn
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Heart } from 'lucide-react';
import { synthesizeAspect, type AspectType } from '@/lib/astrology/aspectSynthesis';

export default function AspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [aspectData, setAspectData] = useState<{
    planet1: string;
    planet2: string;
    aspectType: AspectType;
    synthesis: {
      essence: string;
      coreQuestion: string;
      elementalDynamic?: string;
    } | null;
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
        <div className="text-soul-textSecondary">Loading aspect interpretation...</div>
      </div>
    );
  }

  if (!aspectData.synthesis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-soul-background via-soul-surface to-soul-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-soul-textSecondary mb-4">
            Archetypal interpretation not yet available for this aspect
          </p>
          <Link href="/astrology" className="text-soul-accent hover:text-soul-accentGlow">
            ← Back to chart overview
          </Link>
        </div>
      </div>
    );
  }

  const { planet1, planet2, aspectType, synthesis } = aspectData;

  // Capitalize planet names
  const planet1Name = planet1.charAt(0).toUpperCase() + planet1.slice(1);
  const planet2Name = planet2.charAt(0).toUpperCase() + planet2.slice(1);

  // Aspect symbol
  const aspectSymbol =
    aspectType === 'square' ? '□' :
      aspectType === 'conjunction' ? '☌' :
        aspectType === 'opposition' ? '☍' :
          aspectType === 'trine' ? '△' :
            aspectType === 'sextile' ? '⚹' :
              aspectType === 'quincunx' ? '⚻' : '○';

  // Aspect color
  const aspectColor =
    aspectType === 'square' || aspectType === 'opposition' ? 'from-red-500/20 to-orange-500/20' :
      aspectType === 'trine' || aspectType === 'sextile' ? 'from-green-500/20 to-emerald-500/20' :
        'from-amber-500/20 to-yellow-500/20';

  const aspectBorderColor =
    aspectType === 'square' || aspectType === 'opposition' ? 'border-red-500/40' :
      aspectType === 'trine' || aspectType === 'sextile' ? 'border-green-500/40' :
        'border-amber-500/40';

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-background via-soul-surface to-soul-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/astrology"
          className="inline-flex items-center gap-2 text-soul-textSecondary hover:text-soul-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chart Overview
        </Link>

        {/* Aspect Header */}
        <div className={`bg-gradient-to-br ${aspectColor} border ${aspectBorderColor} rounded-2xl p-8 mb-8`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-6xl text-soul-text">{aspectSymbol}</span>
          </div>
          <h1 className="text-4xl font-bold text-soul-text text-center mb-2">
            {planet1Name} {aspectType} {planet2Name}
          </h1>
          <p className="text-center text-soul-textSecondary capitalize">
            {aspectType} aspect ({synthesis.elementalDynamic || 'Planetary dynamic'})
          </p>
        </div>

        {/* Archetypal Essence */}
        <div className="bg-soul-surface/60 backdrop-blur-sm border border-soul-border rounded-xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-soul-accent" />
            <h2 className="text-2xl font-bold text-soul-text">Archetypal Essence</h2>
          </div>
          <p className="text-lg text-soul-text leading-relaxed mb-6">
            {synthesis.essence}
          </p>
          <div className="border-t border-soul-borderSubtle pt-4">
            <p className="text-sm text-soul-textTertiary mb-2">Soul Question:</p>
            <p className="text-lg italic text-soul-accentGlow">
              "{synthesis.coreQuestion}"
            </p>
          </div>
        </div>

        {/* Spiralogic Context */}
        <div className="bg-soul-surface/60 backdrop-blur-sm border border-soul-border rounded-xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-soul-accent" />
            <h2 className="text-2xl font-bold text-soul-text">Spiralogic Context</h2>
          </div>
          <div className="space-y-4">
            <p className="text-soul-textSecondary">
              This aspect represents a {aspectType} dynamic between {planet1Name} and {planet2Name}.
              In Spiralogic terms, this is a conversation between different facets of your consciousness.
            </p>

            {aspectType === 'square' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-400 mb-2">Dynamic Tension (90°)</p>
                <p className="text-soul-textSecondary">
                  Squares create friction that demands growth. This is the aspect of the warrior—
                  you're learning to integrate seemingly incompatible energies into a more complex whole.
                </p>
              </div>
            )}

            {aspectType === 'trine' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-400 mb-2">Flowing Harmony (120°)</p>
                <p className="text-soul-textSecondary">
                  Trines represent natural gifts—areas where energy flows easily. The challenge is
                  learning to consciously use what comes naturally instead of taking it for granted.
                </p>
              </div>
            )}

            {aspectType === 'conjunction' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-400 mb-2">Fused Identity (0°)</p>
                <p className="text-soul-textSecondary">
                  Conjunctions blend planetary energies into a unified force. You don't separate
                  these functions—they operate as one inseparable whole in your psyche.
                </p>
              </div>
            )}

            {aspectType === 'opposition' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-400 mb-2">Polar Dialogue (180°)</p>
                <p className="text-soul-textSecondary">
                  Oppositions create awareness through contrast. You see yourself most clearly in
                  the mirror of this dynamic—each side revealing what the other cannot see alone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Working with This Aspect */}
        <div className="bg-soul-surface/60 backdrop-blur-sm border border-soul-border rounded-xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-soul-accent" />
            <h2 className="text-2xl font-bold text-soul-text">Working with This Aspect</h2>
          </div>
          <div className="space-y-4 text-soul-textSecondary">
            <p>
              Rather than seeing this aspect as a fixed trait, Spiralogic invites you to work with it
              as a <span className="text-soul-accentGlow font-semibold">participatory practice</span>.
            </p>
            <ul className="space-y-3 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-soul-accent mt-1">•</span>
                <span>
                  <strong className="text-soul-text">Notice patterns:</strong> When does this dynamic
                  show up most strongly in your life?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-soul-accent mt-1">•</span>
                <span>
                  <strong className="text-soul-text">Feel into the tension:</strong> What does this
                  aspect want to teach you right now?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-soul-accent mt-1">•</span>
                <span>
                  <strong className="text-soul-text">Journal the soul question:</strong> Let it sit
                  with you as a living inquiry, not a problem to solve.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-soul-accent mt-1">•</span>
                <span>
                  <strong className="text-soul-text">Talk to MAIA:</strong> Ask her about this aspect
                  in conversation—she has access to deeper archetypal wisdom.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Talk to MAIA CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/maia"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-soul-accent to-soul-accentGlow text-soul-background px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-soul-accent/30 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Explore this aspect with MAIA
          </Link>
        </div>
      </div>
    </div>
  );
}
