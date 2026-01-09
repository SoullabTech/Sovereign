'use client';

/**
 * House Deep Dive Sheet
 *
 * Comprehensive view of a house showing:
 * - Ruler planet and its placement
 * - All planets in the house
 * - Life themes and archetype
 * - Shadow and integrated expressions
 * - Journal prompts for that domain
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Brain,
  Heart,
  PenLine,
  ChevronRight,
  Sun,
  Moon,
  Orbit,
} from 'lucide-react';
import { HOUSE_NEURAL_MAPPING } from '@/lib/astrology/neuroArchetypalMapping';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

interface HouseDeepDiveSheetProps {
  house: number;
  isOpen: boolean;
  onClose: () => void;
  /** Planets currently in this house */
  planetsInHouse?: Planet[];
  /** The ruler planet of this house's sign */
  rulerPlanet?: {
    name: string;
    sign: string;
    house: number;
  };
  /** Day mode styling */
  isDayMode?: boolean;
}

type TabId = 'overview' | 'planets' | 'shadow' | 'journal';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_COLORS = {
  fire: {
    primary: '#F97316',
    secondary: '#DC2626',
    glow: 'rgba(249, 115, 22, 0.3)',
    bg: 'from-orange-500/20 to-red-500/10',
  },
  water: {
    primary: '#3B82F6',
    secondary: '#0EA5E9',
    glow: 'rgba(59, 130, 246, 0.3)',
    bg: 'from-blue-500/20 to-cyan-500/10',
  },
  earth: {
    primary: '#22C55E',
    secondary: '#10B981',
    glow: 'rgba(34, 197, 94, 0.3)',
    bg: 'from-green-500/20 to-emerald-500/10',
  },
  air: {
    primary: '#A855F7',
    secondary: '#8B5CF6',
    glow: 'rgba(168, 85, 247, 0.3)',
    bg: 'from-purple-500/20 to-violet-500/10',
  },
};

const HOUSE_RULERS: Record<number, string> = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Pluto',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Uranus',
  12: 'Neptune',
};

const HOUSE_JOURNAL_PROMPTS: Record<number, string[]> = {
  1: [
    'What aspects of your identity feel most authentic right now?',
    'When do you feel most fully yourself?',
    'What first impressions do you want to make, and why?',
    'How has your sense of self evolved over the past year?',
  ],
  2: [
    'What do you truly value beyond material possessions?',
    'How does your relationship with money reflect your self-worth?',
    'What resources do you have that you often overlook?',
    'When do you feel most secure and grounded?',
  ],
  3: [
    'How do you typically process and share new information?',
    'What conversations have shaped your thinking recently?',
    'How do your siblings or close neighbors influence your perspective?',
    'What are you curious to learn more about?',
  ],
  4: [
    'What does "home" mean to you emotionally?',
    'How do your family roots influence who you are today?',
    'What kind of sanctuary are you creating in your life?',
    'What unresolved patterns from childhood still affect you?',
  ],
  5: [
    'What brings you genuine joy and playfulness?',
    'How do you express your creative essence?',
    'What would you create if you had no fear of judgment?',
    'How do you nurture your inner child?',
  ],
  6: [
    'What daily rituals support your wellbeing?',
    'How does your work serve something greater than yourself?',
    'What health patterns are you ready to transform?',
    'How do you find meaning in the mundane?',
  ],
  7: [
    'What do you seek in your closest partnerships?',
    'What qualities in others mirror aspects of yourself?',
    'How do you balance giving and receiving in relationships?',
    'What have your relationships taught you about yourself?',
  ],
  8: [
    'What transformation are you currently undergoing?',
    'What do you need to release to move forward?',
    'How do you relate to shared resources and intimacy?',
    'What psychological depths are you ready to explore?',
  ],
  9: [
    'What beliefs are expanding your worldview?',
    'Where does your search for meaning lead you?',
    'What distant horizons call to your spirit?',
    'How has travel or education transformed your perspective?',
  ],
  10: [
    'What legacy do you want to leave in the world?',
    'How does your public role align with your authentic self?',
    'What are you building that will outlast you?',
    'What does true achievement mean to you?',
  ],
  11: [
    'What vision for the future inspires you most?',
    'How do your friendships reflect your values?',
    'What communities help you feel you belong?',
    'What collective change do you want to contribute to?',
  ],
  12: [
    'What do you need to surrender or release?',
    'How do you connect with something greater than yourself?',
    'What hidden patterns influence your life from the unconscious?',
    'What does solitude and reflection reveal to you?',
  ],
};

const TABS: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'planets', label: 'Planets', icon: Orbit },
  { id: 'shadow', label: 'Shadow & Light', icon: Heart },
  { id: 'journal', label: 'Journal', icon: PenLine },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function HouseDeepDiveSheet({
  house,
  isOpen,
  onClose,
  planetsInHouse = [],
  rulerPlanet,
  isDayMode = false,
}: HouseDeepDiveSheetProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const houseData = HOUSE_NEURAL_MAPPING[house];
  if (!houseData) return null;

  const colors = ELEMENT_COLORS[houseData.element];
  const naturalRuler = HOUSE_RULERS[house];
  const prompts = HOUSE_JOURNAL_PROMPTS[house] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-2xl w-full max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
              isDayMode
                ? 'bg-white/95 border border-stone-200'
                : 'bg-stone-900/95 border border-stone-700/50'
            }`}
            style={{
              boxShadow: isDayMode
                ? '0 25px 80px rgba(0,0,0,0.15)'
                : `0 25px 80px rgba(0,0,0,0.7), 0 0 60px ${colors.glow}`,
            }}
          >
            {/* Header */}
            <div
              className="p-6 pb-4 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}05)`,
                borderBottom: `1px solid ${isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}10)`,
                      boxShadow: `0 0 30px ${colors.glow}`,
                    }}
                  >
                    <span className="text-2xl font-serif font-bold" style={{ color: colors.primary }}>
                      {house}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-serif font-semibold ${isDayMode ? 'text-stone-900' : 'text-amber-100'}`}>
                      {houseData.archetypeTitle}
                    </h2>
                    <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-amber-200/80'} mt-0.5`}>
                      House {house} · {houseData.sign} · {houseData.element.charAt(0).toUpperCase() + houseData.element.slice(1)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDayMode
                      ? 'hover:bg-stone-100 text-stone-600'
                      : 'hover:bg-stone-800/50 text-stone-400'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? isDayMode
                            ? 'bg-stone-800 text-white'
                            : 'bg-amber-100 text-stone-900'
                          : isDayMode
                            ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <OverviewTab
                    key="overview"
                    houseData={houseData}
                    naturalRuler={naturalRuler}
                    rulerPlanet={rulerPlanet}
                    colors={colors}
                    isDayMode={isDayMode}
                  />
                )}
                {activeTab === 'planets' && (
                  <PlanetsTab
                    key="planets"
                    planetsInHouse={planetsInHouse}
                    house={house}
                    colors={colors}
                    isDayMode={isDayMode}
                  />
                )}
                {activeTab === 'shadow' && (
                  <ShadowTab
                    key="shadow"
                    houseData={houseData}
                    colors={colors}
                    isDayMode={isDayMode}
                  />
                )}
                {activeTab === 'journal' && (
                  <JournalTab
                    key="journal"
                    prompts={prompts}
                    houseData={houseData}
                    colors={colors}
                    isDayMode={isDayMode}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab Components
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewTab({
  houseData,
  naturalRuler,
  rulerPlanet,
  colors,
  isDayMode,
}: {
  houseData: (typeof HOUSE_NEURAL_MAPPING)[number];
  naturalRuler: string;
  rulerPlanet?: { name: string; sign: string; house: number };
  colors: (typeof ELEMENT_COLORS)[keyof typeof ELEMENT_COLORS];
  isDayMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Developmental Stage */}
      <div>
        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
          Life Domain
        </h3>
        <p className={`text-base ${isDayMode ? 'text-stone-700' : 'text-amber-50'}`}>
          {houseData.developmentalStage}
        </p>
      </div>

      {/* Ruler Info */}
      <div className={`p-4 rounded-xl ${isDayMode ? 'bg-stone-50' : 'bg-stone-800/50'}`}>
        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
          House Ruler
        </h3>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)` }}
          >
            {naturalRuler === 'Sun' ? (
              <Sun className="w-5 h-5" style={{ color: colors.primary }} />
            ) : naturalRuler === 'Moon' ? (
              <Moon className="w-5 h-5" style={{ color: colors.primary }} />
            ) : (
              <Orbit className="w-5 h-5" style={{ color: colors.primary }} />
            )}
          </div>
          <div>
            <p className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-amber-100'}`}>
              {naturalRuler}
            </p>
            {rulerPlanet && (
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                In {rulerPlanet.sign} · House {rulerPlanet.house}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Experiential Qualities */}
      <div>
        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
          Experiential Qualities
        </h3>
        <div className="flex flex-wrap gap-2">
          {houseData.experientialQualities.map((quality, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                isDayMode
                  ? 'bg-stone-100 text-stone-700'
                  : 'bg-stone-800/60 text-amber-100'
              }`}
              style={{ boxShadow: `0 0 8px ${colors.glow}` }}
            >
              {quality}
            </span>
          ))}
        </div>
      </div>

      {/* Neural Insight */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className={`w-4 h-4 ${isDayMode ? 'text-stone-400' : 'text-amber-400/60'}`} />
          <h3 className={`text-xs uppercase tracking-wider font-semibold ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
            Neural Insight
          </h3>
        </div>
        <p className={`text-sm leading-relaxed ${isDayMode ? 'text-stone-600' : 'text-stone-300'}`}>
          {houseData.neuropsychologicalDescription}
        </p>
      </div>
    </motion.div>
  );
}

function PlanetsTab({
  planetsInHouse,
  house,
  colors,
  isDayMode,
}: {
  planetsInHouse: Planet[];
  house: number;
  colors: (typeof ELEMENT_COLORS)[keyof typeof ELEMENT_COLORS];
  isDayMode: boolean;
}) {
  if (planetsInHouse.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`text-center py-12 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}
      >
        <Orbit className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium mb-2">No planets in House {house}</p>
        <p className="text-sm">
          This house is activated through its ruler and transits rather than natal placements.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
        {planetsInHouse.length} planet{planetsInHouse.length !== 1 ? 's' : ''} activating this life domain
      </p>

      {planetsInHouse.map((planet, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl ${isDayMode ? 'bg-stone-50' : 'bg-stone-800/50'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)` }}
            >
              {planet.name === 'Sun' ? (
                <Sun className="w-5 h-5" style={{ color: colors.primary }} />
              ) : planet.name === 'Moon' ? (
                <Moon className="w-5 h-5" style={{ color: colors.primary }} />
              ) : (
                <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
              )}
            </div>
            <div>
              <p className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-amber-100'}`}>
                {planet.name}
              </p>
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                {planet.degree.toFixed(0)}° {planet.sign}
              </p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function ShadowTab({
  houseData,
  colors,
  isDayMode,
}: {
  houseData: (typeof HOUSE_NEURAL_MAPPING)[number];
  colors: (typeof ELEMENT_COLORS)[keyof typeof ELEMENT_COLORS];
  isDayMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Shadow Expressions */}
      <div>
        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
          Shadow Expressions
        </h3>
        <p className={`text-sm mb-3 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
          When this domain is out of balance
        </p>
        <ul className="space-y-2">
          {houseData.pathologicalExpressions.map((expr, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                isDayMode ? 'bg-red-50' : 'bg-red-900/20'
              }`}
            >
              <span className={`mt-0.5 ${isDayMode ? 'text-red-400' : 'text-red-400/70'}`}>•</span>
              <span className={`text-sm ${isDayMode ? 'text-red-800' : 'text-red-200'}`}>
                {expr}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Integrated Expressions */}
      <div>
        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
          Integrated Expressions
        </h3>
        <p className={`text-sm mb-3 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
          When this domain is harmonized
        </p>
        <ul className="space-y-2">
          {houseData.integratedExpressions.map((expr, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg`}
              style={{
                background: isDayMode
                  ? `linear-gradient(135deg, ${colors.primary}10, transparent)`
                  : `linear-gradient(135deg, ${colors.primary}15, transparent)`,
              }}
            >
              <span style={{ color: colors.primary }}>✦</span>
              <span className={`text-sm ${isDayMode ? 'text-stone-700' : 'text-amber-100'}`}>
                {expr}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Spiritual Invitation */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}05)`,
          border: `1px solid ${colors.primary}20`,
        }}
      >
        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
          Spiritual Invitation
        </h3>
        <p className={`text-sm leading-relaxed italic ${isDayMode ? 'text-stone-600' : 'text-amber-100/90'}`}>
          {houseData.spiritualInvitation}
        </p>
      </div>
    </motion.div>
  );
}

function JournalTab({
  prompts,
  houseData,
  colors,
  isDayMode,
}: {
  prompts: string[];
  houseData: (typeof HOUSE_NEURAL_MAPPING)[number];
  colors: (typeof ELEMENT_COLORS)[keyof typeof ELEMENT_COLORS];
  isDayMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
        Reflection prompts for {houseData.archetypeTitle.toLowerCase()} energy
      </p>

      {prompts.map((prompt, idx) => (
        <button
          key={idx}
          className={`w-full text-left p-4 rounded-xl transition-all group ${
            isDayMode
              ? 'bg-stone-50 hover:bg-stone-100'
              : 'bg-stone-800/50 hover:bg-stone-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)`,
              }}
            >
              <span className="text-xs font-medium" style={{ color: colors.primary }}>
                {idx + 1}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-amber-100'}`}>
              {prompt}
            </p>
            <ChevronRight
              className={`w-4 h-4 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                isDayMode ? 'text-stone-400' : 'text-stone-500'
              }`}
            />
          </div>
        </button>
      ))}

      <p className={`text-xs text-center pt-4 ${isDayMode ? 'text-stone-400' : 'text-stone-500'}`}>
        Tap a prompt to start journaling
      </p>
    </motion.div>
  );
}
