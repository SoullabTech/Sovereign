'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// SOULLAB BRAND COLORS
// ============================================
const COLORS = {
  fire: '#a94724',
  air: '#cea22c',
  earth: '#6d7934',
  water: '#236586',
  navy: '#1a3a52',
  warmWhite: '#f8f7f5',
  warmGray: '#f4f3f0',
  sage: '#5a7a6f',
  violet: '#6b5a98',
  gold: '#8a7a5a',
  textDark: '#292524',
  textMuted: '#57534e',
  textLight: '#ffffff',
};

// ============================================
// SLIDE TIMING (in seconds) - matches speaker scripts
// ============================================
const SLIDE_TIMINGS = [45, 90, 75, 105, 75, 90, 75, 90, 90, 60, 45];

// ============================================
// SLIDE DATA
// ============================================
const slides = [
  // SLIDE 1: Title
  {
    id: 1,
    background: 'navy',
    section: null,
    content: (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col justify-center px-12">
          <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
            MAIA-SOVEREIGN
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-8">
            A Reciprocity-Based AI Platform for<br />
            Care, Consciousness & Commons Stewardship
          </p>
          <div className="w-24 h-0.5 bg-[#cea22c] mb-6" />
          <p className="text-sm text-white/70 italic">
            Strategic Overview for Early Partners
          </p>
          <p className="text-xs mt-8" style={{ color: COLORS.sage }}>
            soullab.life
          </p>
        </div>
        <div className="w-1/3 relative flex items-center justify-center">
          <img
            src="/logo_flower 2.png"
            alt="Soullab Holoflower"
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>
    ),
  },

  // SLIDE 2: The Problem
  {
    id: 2,
    background: 'light',
    section: 'THE PROBLEM',
    content: (
      <div className="px-12 py-8">
        <h2 className="text-3xl font-light text-gray-800 mb-8">
          Most AI Platforms Fail in Three Critical Ways
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-8">
          {[
            { title: '1. Extract Without Context', body: 'AI tools scale output, not responsibility. Care, coaching, and guidance get flattened into transactions.', color: COLORS.fire },
            { title: '2. Break Under Ethics', body: "Either everything is paywalled and exclusionary, or 'free' and unsustainable. Very few systems model reciprocity.", color: COLORS.air },
            { title: '3. Ignore the Care Economy', body: 'Helpers are underpaid and overworked. Platforms either exploit them or price them out. Clients hit paywalls at their most vulnerable.', color: COLORS.water },
          ].map((item, i) => (
            <div key={i} className="flex">
              <div className="w-1 rounded-full mr-4" style={{ backgroundColor: item.color }} />
              <div className="flex-1 bg-white/60 p-6 rounded">
                <h3 className="font-semibold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 rounded" style={{ backgroundColor: `${COLORS.sage}15` }}>
          <p className="text-center font-medium italic" style={{ color: COLORS.sage }}>
            MAIA-Sovereign is designed to solve all three — structurally, not aspirationally.
          </p>
        </div>
      </div>
    ),
  },

  // SLIDE 3: What MAIA-Sovereign Is
  {
    id: 3,
    background: 'light',
    section: 'THE PLATFORM',
    content: (
      <div className="px-12 py-8 flex gap-8">
        <div className="flex-1">
          <h2 className="text-3xl font-light text-gray-800 mb-6">
            A Relational AI Platform That Supports
          </h2>
          <div className="space-y-4 mt-8">
            {[
              { text: 'Personal Growth', color: COLORS.fire },
              { text: 'Practitioner-Client Relationships', color: COLORS.air },
              { text: 'Care-Based Practices', color: COLORS.earth },
              { text: 'Ethical AI Assistance', color: COLORS.water },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-lg text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-96 rounded-lg p-8" style={{ backgroundColor: COLORS.navy }}>
          <p className="text-xs font-semibold tracking-wider mb-6" style={{ color: COLORS.sage }}>
            MAIA-SOVEREIGN IS NOT
          </p>
          {['Just an AI chatbot', 'Just practice management software', 'Just a consciousness app'].map((item, i) => (
            <p key={i} className="text-white/90 mb-3">× {item}</p>
          ))}
          <div className="w-full h-px my-6" style={{ backgroundColor: COLORS.sage }} />
          <p className="text-white/80 text-sm italic leading-relaxed">
            It is a commons-based operating system for care, with AI embedded inside an ethical container.
          </p>
        </div>
      </div>
    ),
  },

  // SLIDE 4: The Elemental Architecture
  {
    id: 4,
    background: 'light',
    section: 'THE ARCHITECTURE',
    content: (
      <div className="px-12 py-6">
        <h2 className="text-3xl font-light text-gray-800 mb-2">
          Five Parallel Processing Fields
        </h2>
        <p className="text-gray-500 italic mb-6">
          Elemental Alchemy: The consciousness architecture behind MAIA
        </p>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { name: 'FIRE', question: 'If?', domain: 'Inspiration • Vision • Will', color: COLORS.fire },
            { name: 'WATER', question: 'Why?', domain: 'Intention • Psyche • Depth', color: COLORS.water },
            { name: 'EARTH', question: 'How?', domain: 'Implementation • Structure • Form', color: COLORS.earth },
            { name: 'AIR', question: 'What?', domain: 'Expression • Articulation • Sharing', color: COLORS.air },
            { name: 'AETHER', question: 'Who?', domain: 'Integration • Soul Awareness • Design', color: COLORS.sage },
          ].map((el, i) => (
            <div
              key={i}
              className="border-2 rounded-lg p-4 text-center"
              style={{
                borderColor: el.color,
                backgroundColor: `${el.color}10`
              }}
            >
              <p className="text-xs font-bold tracking-wider mb-2" style={{ color: el.color }}>
                {el.name}
              </p>
              <p className="text-2xl font-semibold italic text-gray-800 mb-2">{el.question}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{el.domain}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.navy }}>
          <p className="text-white font-semibold mb-3">
            These are not metaphors — they are parallel processing domains.
          </p>
          <p className="text-white/80 text-sm leading-relaxed">
            Like the brain's hemispheres connected by the corpus callosum, human consciousness processes reality through multiple co-functioning awareness fields simultaneously. Traditional AI forces linear thinking. MAIA supports multi-dimensional awareness — the way humans actually work.
          </p>
        </div>
        <p className="text-xs mt-4 italic" style={{ color: COLORS.sage }}>
          Built on: McGilchrist's hemispheric integration • Herrmann's Whole Brain Model • Jung's individuation
        </p>
      </div>
    ),
  },

  // SLIDE 5: The Core Insight
  {
    id: 5,
    background: 'navy',
    section: 'THE CORE INSIGHT',
    content: (
      <div className="px-12 py-8">
        <h2 className="text-2xl text-white mb-4">Care systems collapse when:</h2>
        <div className="space-y-3 mb-8">
          {['Clients are paywalled', 'Helpers are squeezed', 'Platforms externalize cost'].map((reason, i) => (
            <p key={i} className="text-lg" style={{ color: COLORS.air }}>→ {reason}</p>
          ))}
        </div>
        <p className="text-xl text-white font-semibold mb-8">
          MAIA-Sovereign flips this by separating care from infrastructure.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { text: 'Care is never paywalled', color: COLORS.earth },
            { text: 'Infrastructure is stewarded', color: COLORS.water },
            { text: 'AI scales support, not extraction', color: COLORS.sage },
          ].map((pillar, i) => (
            <div
              key={i}
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: `${pillar.color}40` }}
            >
              <p className="text-white font-semibold">{pillar.text}</p>
            </div>
          ))}
        </div>
        <p className="text-sm italic mt-8" style={{ color: COLORS.air }}>
          That single design decision unlocks everything else.
        </p>
      </div>
    ),
  },

  // SLIDE 6: The Reciprocity Economy
  {
    id: 6,
    background: 'light',
    section: 'THE MODEL',
    content: (
      <div className="px-12 py-6">
        <h2 className="text-3xl font-light text-gray-800 mb-2">
          Reciprocity-Based Economy
        </h2>
        <p className="text-gray-500 mb-6">
          Not a coercive subscription model — a system where people move fluidly between roles.
        </p>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {[
            { title: 'MEMBERS', subtitle: 'Personal Growth', desc: 'Journaling, reflection, clients supported by practitioners', badge: 'Always Free', color: COLORS.earth },
            { title: 'PRACTITIONERS', subtitle: 'Care Providers', desc: 'Therapists, coaches, healers, guides using MAIA to run their practice', badge: 'Choose How to Contribute', color: COLORS.water },
            { title: 'STEWARDS', subtitle: 'Commons Builders', desc: 'Fund shared infrastructure so care stays accessible for everyone', badge: 'Support the Commons', color: COLORS.sage },
          ].map((role, i) => (
            <div key={i} className="border-2 rounded-lg p-6 bg-white" style={{ borderColor: role.color }}>
              <p className="font-bold mb-1" style={{ color: role.color }}>{role.title}</p>
              <p className="text-sm italic text-gray-700 mb-3">{role.subtitle}</p>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{role.desc}</p>
              <div className="rounded py-1.5 text-center text-xs font-semibold" style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                {role.badge}
              </div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Two Practitioner Contribution Paths:</p>
          <p className="text-sm text-gray-600">
            Pay-as-you-earn: Small % only when money flows • Studio Membership: Flat monthly, reduced fees
          </p>
        </div>
      </div>
    ),
  },

  // SLIDE 7: Ethical Feature Gating
  {
    id: 7,
    background: 'light',
    section: 'THE ETHICS',
    content: (
      <div className="px-12 py-6">
        <h2 className="text-3xl font-light text-gray-800 mb-6">
          We Never Lock Care — We Modulate Scale
        </h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="rounded-lg p-6" style={{ backgroundColor: `${COLORS.earth}15` }}>
            <p className="text-sm font-bold tracking-wider mb-4" style={{ color: COLORS.earth }}>
              ALWAYS AVAILABLE
            </p>
            {['Client portal access', '1:1 care relationships', 'Notes, records, continuity', 'Sanctuary mode (privacy)', 'Data export & sovereignty'].map((item, i) => (
              <p key={i} className="text-gray-800 mb-2">✓ {item}</p>
            ))}
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: `${COLORS.violet}15` }}>
            <p className="text-sm font-bold tracking-wider mb-1" style={{ color: COLORS.violet }}>
              ETHICALLY LIMITED
            </p>
            <p className="text-xs text-gray-500 italic mb-4">(because they cost real resources)</p>
            {['Bulk reminders & automation', 'Sequences & workflows', 'Analytics & insights', 'High-volume AI processing'].map((item, i) => (
              <p key={i} className="text-gray-800 mb-2">◇ {item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.navy }}>
          <p className="text-white text-sm leading-relaxed">
            Limits are transparent, invitational, reversible, and often sponsored.<br />
            This avoids both exploitative monetization AND free-rider collapse.
          </p>
        </div>
      </div>
    ),
  },

  // SLIDE 8: Where AI Fits
  {
    id: 8,
    background: 'navy',
    section: 'THE AI',
    content: (
      <div className="px-12 py-6">
        <h2 className="text-3xl font-light text-white mb-6">
          AI is Not the Product — It's Supporting Intelligence
        </h2>
        <div className="grid grid-cols-2 gap-12 mb-6">
          <div>
            <p className="font-semibold mb-4" style={{ color: COLORS.air }}>MAIA assists with:</p>
            {['Reflection & journaling', 'Pattern recognition over time', 'Insight synthesis', 'Practitioner support tools', 'Client continuity between sessions'].map((item, i) => (
              <p key={i} className="text-white/90 mb-2">→ {item}</p>
            ))}
          </div>
          <div>
            <p className="font-semibold mb-4" style={{ color: COLORS.sage }}>AI is always:</p>
            {['Contextual & role-aware', 'Relationship-aware', 'Ethically bounded', 'Never authoritative', 'Never manipulative'].map((item, i) => (
              <p key={i} className="text-white/90 mb-2">◆ {item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-lg p-6" style={{ backgroundColor: `${COLORS.sage}50` }}>
          <p className="text-xs font-bold tracking-wider text-white/80 mb-3">THIS CREATES:</p>
          <div className="grid grid-cols-4 gap-4">
            {['Lower hallucination risk', 'Higher trust', 'Deeper long-term engagement', 'Rich signal environment'].map((result, i) => (
              <p key={i} className="text-white text-center text-sm font-semibold">{result}</p>
            ))}
          </div>
        </div>
        <p className="text-sm italic mt-6" style={{ color: COLORS.air }}>
          MAIA is a high-quality signal environment for relational intelligence.
        </p>
      </div>
    ),
  },

  // SLIDE 9: Strategic Opportunity
  {
    id: 9,
    background: 'light',
    section: 'THE OPPORTUNITY',
    content: (
      <div className="px-12 py-6">
        <h2 className="text-3xl font-light text-gray-800 mb-6">
          Why This Is Strategically Interesting
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: '01', title: 'Solves AI Ethics by Design', desc: 'No retrofitting. No policy theater. Ethics is infrastructure.' },
            { num: '02', title: 'Opens Care Economy Responsibly', desc: 'Mental health, coaching, guidance — massive markets, fragile. We handle them with care.' },
            { num: '03', title: 'Creates Loyal User Base', desc: "Helpers don't churn lightly when a platform respects them." },
            { num: '04', title: 'Highly Extensible', desc: 'Enterprise • Clinics • Education • Community health • Ethical AI pilots' },
            { num: '05', title: 'Early Stage = Influence', desc: 'Architectural influence. Strategic alignment. Co-evolution, not acquisition pressure.' },
          ].map((opp, i) => (
            <div key={i} className={i >= 3 ? 'col-span-1' : ''}>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl font-bold" style={{ color: COLORS.sage }}>{opp.num}</span>
                <span className="text-sm font-semibold text-gray-800 pt-1">{opp.title}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{opp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // SLIDE 10: Partnership
  {
    id: 10,
    background: 'light',
    section: 'THE INVITATION',
    content: (
      <div className="px-12 py-6">
        <h2 className="text-3xl font-light text-gray-800 mb-2">
          What Support Could Look Like
        </h2>
        <p className="text-gray-500 italic mb-6">
          We're opening a door, not pitching a single thing.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { text: 'Early strategic guidance', color: COLORS.fire },
            { text: 'Infrastructure sponsorship', color: COLORS.air },
            { text: 'AI research collaboration', color: COLORS.earth },
            { text: 'Capital investment', color: COLORS.water },
            { text: 'Advisory role', color: COLORS.sage },
            { text: 'Long-term partnership', color: COLORS.violet },
          ].map((option, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
              <span className="text-gray-800">{option.text}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.navy }}>
          <p className="text-xs font-bold tracking-wider mb-3" style={{ color: COLORS.sage }}>
            WHAT WE'RE OFFERING
          </p>
          <p className="text-white leading-relaxed">
            A chance to help shape a platform that doesn't repeat the mistakes of Web2 or extractive AI — one designed from the ground up to earn trust in the most sensitive domain there is.
          </p>
        </div>
      </div>
    ),
  },

  // SLIDE 11: Closing
  {
    id: 11,
    background: 'navy',
    section: null,
    content: (
      <div className="flex h-full">
        <div className="w-1/4 relative flex items-center justify-center">
          <img
            src="/logo_flower 2.png"
            alt="Soullab Holoflower"
            className="w-40 h-40 object-contain -ml-8"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center px-12">
          <p className="text-2xl text-white italic leading-relaxed mb-8">
            "We're not trying to build the biggest AI platform.<br />
            We're trying to build one that can actually be trusted —<br />
            by people doing the most sensitive work there is."
          </p>
          <div className="w-32 h-0.5 mb-6" style={{ backgroundColor: COLORS.sage }} />
          <p className="text-lg font-semibold mb-2" style={{ color: COLORS.air }}>
            MAIA-Sovereign treats ethics as infrastructure, not messaging.
          </p>
          <p className="text-white/70 italic">
            That's a sentence very few founders can honestly say.
          </p>
          <p className="mt-12" style={{ color: COLORS.sage }}>
            soullab.life
          </p>
        </div>
      </div>
    ),
  },
];

// ============================================
// ANIMATION VARIANTS
// ============================================
const slideVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function MAIAPitchPresentation({
  autoPlayDefault = false,
  showControls = true,
  className = ''
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlayDefault);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Navigate to next/prev slide
  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      setProgress(0);
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'p') {
        setIsAutoPlay(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay || isPaused) return;

    const duration = SLIDE_TIMINGS[currentSlide] * 1000;
    const interval = 100; // Update progress every 100ms
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        if (currentSlide < slides.length - 1) {
          nextSlide();
        } else {
          setIsAutoPlay(false); // Stop at last slide
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, isPaused, currentSlide, nextSlide]);

  const slide = slides[currentSlide];
  const bgColor = slide.background === 'navy' ? COLORS.navy : COLORS.warmWhite;

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-xl shadow-2xl ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 flex flex-col"
        >
          {/* Section Label */}
          {slide.section && (
            <div className="px-12 pt-6">
              <p
                className="text-xs font-bold tracking-widest"
                style={{ color: COLORS.sage }}
              >
                {slide.section}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {slide.content}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar (auto-play mode) */}
      {isAutoPlay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <motion.div
            className="h-full"
            style={{
              backgroundColor: COLORS.sage,
              width: `${progress}%`
            }}
          />
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-8">
          {/* Slide indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? 'w-6'
                    : 'opacity-40 hover:opacity-70'
                }`}
                style={{
                  backgroundColor: slide.background === 'navy' ? COLORS.sage : COLORS.navy
                }}
              />
            ))}
          </div>

          {/* Play/Pause & Mode Toggle */}
          <div className="absolute right-8 flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: slide.background === 'navy' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: slide.background === 'navy' ? COLORS.textLight : COLORS.textDark
              }}
            >
              {isAutoPlay ? 'Manual' : 'Auto-Play'}
            </button>

            {isAutoPlay && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: slide.background === 'navy' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: slide.background === 'navy' ? COLORS.textLight : COLORS.textDark
                }}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>

          {/* Slide counter */}
          <div
            className="absolute left-8 text-xs"
            style={{
              color: slide.background === 'navy' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
            }}
          >
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      )}

      {/* Click areas for navigation */}
      <div
        className="absolute inset-y-0 left-0 w-1/4 cursor-pointer"
        onClick={prevSlide}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/4 cursor-pointer"
        onClick={nextSlide}
      />
    </div>
  );
}
