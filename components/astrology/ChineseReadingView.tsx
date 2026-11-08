/**
 * The Chinese zodiac reading as a presentational view: animal and element
 * cards that open into deeper wisdom (personality, strengths, compatibility,
 * Spiralogic integration, life guidance, holistic profile).
 *
 * It takes a computed reading and nothing else, so the Free page (browser) and
 * the Pro room (server-computed, no birth data in the payload) render the same
 * full experience.
 */
'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChineseReadingData } from '@/lib/astrology/chineseReading';

export default function ChineseReadingView({ reading }: { reading: ChineseReadingData }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const isOpen = (section: string) => expandedSection === section;
  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
  <div className="max-w-6xl mx-auto space-y-8">
    {/* Core Identity — clickable cards */}
    <div className="grid md:grid-cols-2 gap-6">
      {/* Animal Card */}
      <button
        onClick={() => toggleSection('animal')}
        className="bg-black/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-left transition-all hover:border-red-500/60 hover:bg-black/40"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-5xl">{reading.zodiacAnimal.symbol}</div>
          <div className="flex items-center gap-2 text-red-300/60">
            <Sparkles className="w-4 h-4" />
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen('animal') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-orange-200 mb-1">{reading.zodiacAnimal.name}</h3>
        <p className="text-orange-200/60 text-sm">{reading.zodiacAnimal.archetype}</p>
        <p className="text-orange-300 mt-2 line-clamp-2">{reading.zodiacAnimal.description}</p>
      </button>

      {/* Element Card */}
      <button
        onClick={() => toggleSection('element')}
        className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 text-left transition-all hover:border-orange-500/60 hover:bg-black/40"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl font-bold text-white">
            {reading.element.chineseName}
          </div>
          <div className="flex items-center gap-2 text-orange-300/60">
            <Sparkles className="w-4 h-4" />
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen('element') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-orange-200 mb-1">{reading.element.name} Element</h3>
        <p className="text-yellow-300 text-sm">{reading.yinYang.toUpperCase()} Energy</p>
        <p className="text-orange-300 mt-2 line-clamp-2">{reading.element.personality}</p>
      </button>
    </div>

    {/* Expanded Animal Wisdom */}
    <AnimatePresence>
      {isOpen('animal') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-red-300">Deeper Wisdom: {reading.zodiacAnimal.name}</h3>

            <div className="space-y-4">
              {reading.personalityProfile.map((trait, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-1">*</span>
                  <p className="text-orange-200">{trait}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-300 mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {reading.strengthsWeaknesses.strengths.map((s, i) => (
                    <li key={i} className="text-green-200 flex items-center gap-2">
                      <span className="text-green-400">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-300 mb-3">Growth Areas</h4>
                <ul className="space-y-2">
                  {reading.strengthsWeaknesses.weaknesses.map((w, i) => (
                    <li key={i} className="text-red-200 flex items-center gap-2">
                      <span className="text-red-400">~</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compatibility */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-red-500/20">
              <div>
                <h4 className="font-semibold text-green-300 mb-3">Most Compatible</h4>
                <div className="flex flex-wrap gap-2">
                  {reading.compatibility.mostCompatible.map((sign, i) => (
                    <span key={i} className="px-3 py-1 bg-green-900/30 text-green-200 text-sm rounded-full border border-green-500/30">{sign}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-300 mb-3">Challenging Pairings</h4>
                <div className="flex flex-wrap gap-2">
                  {reading.compatibility.challenging.map((sign, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-900/30 text-amber-200 text-sm rounded-full border border-amber-500/30">{sign}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Expanded Element Wisdom */}
    <AnimatePresence>
      {isOpen('element') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-black/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-orange-300">Deeper Wisdom: {reading.element.name} Element</h3>

            {/* Spiralogic Integration */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Elemental Pathway</h4>
                <p className="text-purple-100 text-sm mb-1"><strong>Primary:</strong> {reading.spiralogicIntegration.primaryElement}</p>
                <p className="text-purple-100 text-sm"><strong>Secondary:</strong> {reading.spiralogicIntegration.secondaryElements.join(', ')}</p>
                <p className="text-purple-200 mt-3">{reading.spiralogicIntegration.evolutionaryPath}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Consciousness Activation</h4>
                <p className="text-purple-100">{reading.spiralogicIntegration.consciousnessActivation}</p>
              </div>
            </div>

            {/* Life Guidance */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-orange-500/20">
              <div>
                <h4 className="font-semibold text-blue-300 mb-3">Career & Purpose</h4>
                <ul className="space-y-2">
                  {reading.lifeGuidance.careerPaths.map((p, i) => (
                    <li key={i} className="text-blue-200 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">*</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-pink-300 mb-3">Relationships</h4>
                <ul className="space-y-2">
                  {reading.lifeGuidance.relationships.map((r, i) => (
                    <li key={i} className="text-pink-200 text-sm flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">*</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-3">Spiritual Development</h4>
                <ul className="space-y-2">
                  {reading.lifeGuidance.spiritualDevelopment.map((s, i) => (
                    <li key={i} className="text-yellow-200 text-sm flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">*</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-300 mb-3">Health & Wellness</h4>
                <ul className="space-y-2">
                  {reading.lifeGuidance.healthWellness.map((h, i) => (
                    <li key={i} className="text-green-200 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">*</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Five-Layer Holistic Wisdom (nested inside Element) */}
            {reading.holisticProfile && (
              <div className="pt-4 border-t border-orange-500/20 space-y-3">
                <h4 className="font-semibold text-orange-200">Five-Layer Holistic Profile</h4>
                <p className="text-orange-200/50 text-xs">Tap a domain for deeper insight</p>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'physical', label: 'Body', emoji: '+' },
                    { key: 'emotional', label: 'Heart', emoji: '~' },
                    { key: 'mental', label: 'Mind', emoji: '*' },
                    { key: 'spiritual', label: 'Spirit', emoji: '*' },
                    { key: 'ancestral', label: 'Roots', emoji: '*' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={(e) => { e.stopPropagation(); toggleSection(`holistic-${key}`); }}
                      className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${
                        expandedSection === `holistic-${key}`
                          ? 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                          : 'bg-black/30 text-orange-200/60 hover:bg-black/40 border border-orange-500/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {isOpen('holistic-physical') && reading.holisticProfile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5 space-y-4 mt-2">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1 text-emerald-100">
                            <p><strong className="text-emerald-400">Yin Organ:</strong> {reading.holisticProfile.physical.yinOrgan}</p>
                            <p><strong className="text-emerald-400">Yang Organ:</strong> {reading.holisticProfile.physical.yangOrgan}</p>
                            <p><strong className="text-emerald-400">Body Tissue:</strong> {reading.holisticProfile.physical.bodyTissue}</p>
                            <p><strong className="text-emerald-400">Sensory:</strong> {reading.holisticProfile.physical.sensoryOrgan}</p>
                          </div>
                          <div>
                            <p className="text-emerald-300 font-semibold mb-2">Health Tendencies</p>
                            {reading.holisticProfile.physical.healthTendencies.map((t, i) => (
                              <p key={i} className="text-emerald-100 text-sm">! {t}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {isOpen('holistic-emotional') && reading.holisticProfile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5 mt-2">
                        <div className="grid grid-cols-3 gap-3 text-center text-sm">
                          <div><p className="text-rose-300 text-xs">Primary</p><p className="text-rose-100">{reading.holisticProfile.emotional.primaryEmotion}</p></div>
                          <div><p className="text-rose-300 text-xs">Shadow</p><p className="text-rose-100">{reading.holisticProfile.emotional.shadowEmotion}</p></div>
                          <div><p className="text-rose-300 text-xs">Balanced</p><p className="text-rose-100">{reading.holisticProfile.emotional.balancedExpression}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {isOpen('holistic-mental') && reading.holisticProfile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-5 mt-2 text-sm">
                        <p className="text-cyan-100">{reading.holisticProfile.mental.thinkingStyle}</p>
                        <p className="text-cyan-200/70 mt-2"><strong>Learning:</strong> {reading.holisticProfile.mental.learningStyle}</p>
                      </div>
                    </motion.div>
                  )}
                  {isOpen('holistic-spiritual') && reading.holisticProfile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-violet-900/10 border border-violet-500/20 rounded-xl p-5 mt-2 text-sm space-y-2">
                        <p className="text-violet-100"><strong className="text-violet-300">Soul Lesson:</strong> {reading.holisticProfile.spiritual.soulLesson}</p>
                        <p className="text-violet-100"><strong className="text-violet-300">Gift:</strong> {reading.holisticProfile.spiritual.spiritualGift}</p>
                        <p className="text-violet-100"><strong className="text-violet-300">Karmic:</strong> {reading.holisticProfile.spiritual.karmicPattern}</p>
                      </div>
                    </motion.div>
                  )}
                  {isOpen('holistic-ancestral') && reading.holisticProfile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-5 mt-2 text-sm space-y-2">
                        <p className="text-amber-100"><strong className="text-amber-300">Lineage:</strong> {reading.holisticProfile.ancestral.lineageTheme}</p>
                        <p className="text-amber-100"><strong className="text-amber-300">Healing:</strong> {reading.holisticProfile.ancestral.ancestralHealing}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Compatibility — now inside Animal Wisdom card */}

    {/* Cycle Information */}
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-8 text-center">
      <h2 className="text-3xl font-bold text-amber-300 mb-4">Sexagenary Cycle Position</h2>
      <div className="text-6xl font-bold text-amber-200 mb-4">
        {reading.cycleYear}/60
      </div>
      <p className="text-amber-100 text-lg max-w-2xl mx-auto">
        You are part of the ancient 60-year cycle that combines the 12 zodiac animals with the 5 elements.
        This unique position in the cosmic wheel shapes your energetic signature and life path.
      </p>
    </div>

  </div>

  );
}
