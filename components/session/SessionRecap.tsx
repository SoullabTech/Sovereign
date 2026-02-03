'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  BookOpen,
  Share2,
  Download,
  ChevronRight
} from 'lucide-react';

/**
 * Session Recap Component
 *
 * Shows a summary of the session including:
 * - Duration
 * - Key themes explored
 * - Elemental energy touched
 * - Invitation for integration
 */

export interface SessionRecapData {
  duration: number; // minutes
  messageCount: number;
  themes: string[];
  elements: {
    fire: number;   // 0-1 intensity
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  breakthroughs?: string[];
  invitation?: string;
  sessionId?: string;
}

interface SessionRecapProps {
  isOpen: boolean;
  onClose: () => void;
  data: SessionRecapData;
  onSaveToJournal?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

const elementConfig = {
  fire: { icon: Flame, label: 'Fire', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  water: { icon: Droplets, label: 'Water', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  earth: { icon: Mountain, label: 'Earth', color: 'text-green-400', bg: 'bg-green-500/20' },
  air: { icon: Wind, label: 'Air', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  aether: { icon: Sparkles, label: 'Aether', color: 'text-violet-400', bg: 'bg-violet-500/20' },
};

export function SessionRecap({
  isOpen,
  onClose,
  data,
  onSaveToJournal,
  onShare,
  onDownload,
}: SessionRecapProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Find dominant element
  const dominantElement = Object.entries(data.elements).reduce(
    (max, [element, value]) => (value > max.value ? { element, value } : max),
    { element: 'aether', value: 0 }
  ).element as keyof typeof elementConfig;

  const DominantIcon = elementConfig[dominantElement].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[101]"
          >
            <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 rounded-2xl border border-amber-900/30 shadow-2xl overflow-hidden">
              {/* Header with gradient based on dominant element */}
              <div className={`relative p-6 ${elementConfig[dominantElement].bg}`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/20 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-300" />
                </button>

                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${elementConfig[dominantElement].bg} border border-white/10`}>
                    <DominantIcon className={`w-8 h-8 ${elementConfig[dominantElement].color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-amber-100">Session Complete</h2>
                    <p className="text-sm text-stone-400">Thank you for showing up</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Clock className="w-4 h-4" />
                    <span>{data.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <span>{data.messageCount} exchanges</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Themes explored */}
                {data.themes.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">
                      What You Explored
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.themes.map((theme, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm bg-stone-800/50 text-stone-300 border border-stone-700/50"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elemental balance */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                    Elemental Energy
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(elementConfig) as Array<keyof typeof elementConfig>).map((element) => {
                      const config = elementConfig[element];
                      const intensity = data.elements[element];
                      const Icon = config.icon;
                      return (
                        <div key={element} className="flex flex-col items-center gap-1">
                          <div
                            className={`
                              p-2 rounded-lg transition-all
                              ${intensity > 0.3 ? config.bg : 'bg-stone-800/30'}
                              ${intensity > 0.6 ? 'ring-1 ring-white/20' : ''}
                            `}
                            style={{ opacity: 0.4 + intensity * 0.6 }}
                          >
                            <Icon className={`w-5 h-5 ${intensity > 0.3 ? config.color : 'text-stone-600'}`} />
                          </div>
                          <span className="text-[10px] text-stone-500">{config.label}</span>
                          {/* Intensity bar */}
                          <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${config.bg.replace('/20', '/60')} rounded-full`}
                              style={{ width: `${intensity * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Breakthroughs */}
                {data.breakthroughs && data.breakthroughs.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h3 className="text-xs uppercase tracking-wider text-amber-400/80 mb-2">
                      Moments of Insight
                    </h3>
                    <ul className="space-y-2">
                      {data.breakthroughs.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-100/80">
                          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Invitation */}
                {data.invitation && (
                  <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">
                      Invitation Forward
                    </h3>
                    <p className="text-sm text-stone-300 italic">
                      "{data.invitation}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {onSaveToJournal && (
                    <button
                      onClick={onSaveToJournal}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-200 text-sm transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Save to Journal
                    </button>
                  )}
                  {onDownload && (
                    <button
                      onClick={onDownload}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50 text-stone-300 text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50 text-stone-300 text-sm transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors"
                >
                  Close Session
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Compact inline card version
export function SessionRecapCard({ data, onClick }: { data: SessionRecapData; onClick?: () => void }) {
  const dominantElement = Object.entries(data.elements).reduce(
    (max, [element, value]) => (value > max.value ? { element, value } : max),
    { element: 'aether', value: 0 }
  ).element as keyof typeof elementConfig;

  const DominantIcon = elementConfig[dominantElement].icon;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full p-4 rounded-xl text-left transition-all
        ${elementConfig[dominantElement].bg} border border-white/10
        hover:border-white/20
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DominantIcon className={`w-5 h-5 ${elementConfig[dominantElement].color}`} />
          <div>
            <div className="text-sm font-medium text-stone-200">
              {data.duration}min session
            </div>
            <div className="text-xs text-stone-500">
              {data.themes.slice(0, 2).join(', ')}
              {data.themes.length > 2 && ` +${data.themes.length - 2} more`}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-500" />
      </div>
    </motion.button>
  );
}

export default SessionRecap;
