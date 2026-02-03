'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Mountain, Wind, Sparkles, ChevronDown, Shuffle } from 'lucide-react';
import {
  fullPromptLibrary,
  v1StarterPrompts,
  elementMeta,
  depthDescriptions,
  getPrompts,
  getPromptsForLevel,
  getRandomPrompt,
  type Element,
  type DepthLevel,
  type SessionPhase,
  type SoulPrompt
} from '@/lib/prompts/soulPromptLibrary';

interface PromptPickerProps {
  /** Called when user selects a prompt */
  onSelectPrompt: (prompt: string) => void;
  /** User's consciousness level (1-5), affects which prompts are visible */
  consciousnessLevel?: number;
  /** Current session phase, filters prompts appropriately */
  sessionPhase?: SessionPhase;
  /** Use minimal v1 set (10 prompts) vs full library */
  useV1Set?: boolean;
  /** Whether to show depth level toggle */
  showDepthToggle?: boolean;
  /** Whether picker is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional className */
  className?: string;
}

const elementIcons: Record<Element, React.ReactNode> = {
  fire: <Flame className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
  earth: <Mountain className="w-5 h-5" />,
  air: <Wind className="w-5 h-5" />,
  aether: <Sparkles className="w-5 h-5" />
};

const elementColors: Record<Element, string> = {
  fire: 'from-orange-500 to-red-500 shadow-orange-500/30',
  water: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
  earth: 'from-green-500 to-emerald-500 shadow-emerald-500/30',
  air: 'from-yellow-400 to-amber-400 shadow-amber-400/30',
  aether: 'from-amber-500 to-indigo-500 shadow-violet-500/30'
};

const elementBgColors: Record<Element, string> = {
  fire: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  water: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  earth: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
  air: 'bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30',
  aether: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30'
};

export default function PromptPicker({
  onSelectPrompt,
  consciousnessLevel = 3,
  sessionPhase,
  useV1Set = false,
  showDepthToggle = true,
  isOpen,
  onClose,
  className = ''
}: PromptPickerProps) {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<DepthLevel>('seeker');
  const [showDepthMenu, setShowDepthMenu] = useState(false);

  // Filter prompts based on settings
  const availablePrompts = useMemo(() => {
    if (useV1Set) {
      return v1StarterPrompts;
    }

    let prompts = getPromptsForLevel(consciousnessLevel);

    if (sessionPhase) {
      prompts = prompts.filter(p => p.phases.includes(sessionPhase));
    }

    if (selectedElement) {
      prompts = prompts.filter(p => p.element === selectedElement);
    }

    if (showDepthToggle) {
      prompts = prompts.filter(p => p.depth === selectedDepth);
    }

    return prompts;
  }, [useV1Set, consciousnessLevel, sessionPhase, selectedElement, selectedDepth, showDepthToggle]);

  // Group by element for display
  const promptsByElement = useMemo(() => {
    const grouped: Partial<Record<Element, SoulPrompt[]>> = {};
    for (const prompt of availablePrompts) {
      if (!grouped[prompt.element]) {
        grouped[prompt.element] = [];
      }
      grouped[prompt.element]!.push(prompt);
    }
    return grouped;
  }, [availablePrompts]);

  const handleSelectPrompt = (prompt: SoulPrompt) => {
    onSelectPrompt(prompt.text);
    onClose();
  };

  const handleRandomPrompt = () => {
    const prompt = getRandomPrompt({
      element: selectedElement || undefined,
      depth: selectedDepth,
      phase: sessionPhase
    });
    if (prompt) {
      onSelectPrompt(prompt.text);
      onClose();
    }
  };

  const handleElementClick = (element: Element) => {
    if (selectedElement === element) {
      setSelectedElement(null);
    } else {
      setSelectedElement(element);
    }
  };

  // Determine available depths based on consciousness level
  const availableDepths: DepthLevel[] = useMemo(() => {
    if (consciousnessLevel <= 2) return ['seeker'];
    if (consciousnessLevel <= 4) return ['seeker', 'practitioner'];
    return ['seeker', 'practitioner', 'alchemist'];
  }, [consciousnessLevel]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-900/30 shadow-2xl shadow-amber-900/20 ${className}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-amber-900/20">
            <h2 className="text-xl font-cinzel text-amber-100 mb-2">
              Where would you like to begin?
            </h2>
            <p className="text-sm text-stone-400 font-cormorant">
              Choose a theme, or simply close this and speak freely. MAIA will meet you where you are.
            </p>
          </div>

          {/* Element Selector - Holoflower-inspired radial layout */}
          <div className="p-6 border-b border-amber-900/20">
            <div className="flex justify-center gap-3 mb-4">
              {(Object.keys(elementMeta) as Element[]).map((element) => (
                <motion.button
                  key={element}
                  onClick={() => handleElementClick(element)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative flex flex-col items-center justify-center
                    w-16 h-16 rounded-full border-2 transition-all duration-200
                    ${selectedElement === element
                      ? `bg-gradient-to-br ${elementColors[element]} border-transparent shadow-lg`
                      : `${elementBgColors[element]} hover:border-opacity-50`
                    }
                  `}
                >
                  <span className={selectedElement === element ? 'text-white' : `text-${elementMeta[element].color}`}>
                    {elementIcons[element]}
                  </span>
                  <span className="text-[10px] mt-1 font-medium text-stone-300">
                    {elementMeta[element].name}
                  </span>
                  {selectedElement === element && (
                    <motion.div
                      layoutId="element-glow"
                      className="absolute inset-0 rounded-full bg-gradient-to-br opacity-50 blur-md -z-10"
                      style={{
                        background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Depth selector & Random button */}
            <div className="flex items-center justify-between">
              {showDepthToggle && availableDepths.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowDepthMenu(!showDepthMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-amber-700/50 transition-colors"
                  >
                    <span className="text-sm">{depthDescriptions[selectedDepth].icon}</span>
                    <span className="text-sm text-stone-300">{depthDescriptions[selectedDepth].label}</span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>

                  <AnimatePresence>
                    {showDepthMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-56 rounded-lg bg-stone-800 border border-stone-700 shadow-xl z-10"
                      >
                        {availableDepths.map((depth) => (
                          <button
                            key={depth}
                            onClick={() => {
                              setSelectedDepth(depth);
                              setShowDepthMenu(false);
                            }}
                            className={`
                              w-full flex items-start gap-3 px-4 py-3 text-left
                              hover:bg-stone-700/50 transition-colors
                              ${selectedDepth === depth ? 'bg-amber-900/20' : ''}
                              ${depth === availableDepths[0] ? 'rounded-t-lg' : ''}
                              ${depth === availableDepths[availableDepths.length - 1] ? 'rounded-b-lg' : ''}
                            `}
                          >
                            <span className="text-lg">{depthDescriptions[depth].icon}</span>
                            <div>
                              <div className="text-sm font-medium text-stone-200">
                                {depthDescriptions[depth].label}
                              </div>
                              <div className="text-xs text-stone-400">
                                {depthDescriptions[depth].description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={handleRandomPrompt}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/20 border border-amber-600/30 hover:bg-amber-600/30 transition-colors text-amber-200"
              >
                <Shuffle className="w-4 h-4" />
                <span className="text-sm">Surprise me</span>
              </button>
            </div>
          </div>

          {/* Prompt List */}
          <div className="p-4 overflow-y-auto max-h-[40vh] space-y-4">
            {selectedElement ? (
              // Show prompts for selected element
              <div className="space-y-2">
                {promptsByElement[selectedElement]?.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onSelect={() => handleSelectPrompt(prompt)}
                  />
                ))}
                {(!promptsByElement[selectedElement] || promptsByElement[selectedElement]!.length === 0) && (
                  <p className="text-center text-stone-500 py-8">
                    No prompts available for this combination.
                    <br />
                    <span className="text-sm">Try adjusting the depth level or element.</span>
                  </p>
                )}
              </div>
            ) : (
              // Show prompts grouped by element
              (Object.keys(promptsByElement) as Element[]).map((element) => (
                <div key={element} className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <span className={`text-${elementMeta[element].color}`}>
                      {elementIcons[element]}
                    </span>
                    <span className="text-sm font-medium text-stone-400">
                      {elementMeta[element].name} — {elementMeta[element].essence}
                    </span>
                  </div>
                  {promptsByElement[element]?.slice(0, 3).map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onSelect={() => handleSelectPrompt(prompt)}
                      compact
                    />
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer - Free form option */}
          <div className="p-4 border-t border-amber-900/20 bg-stone-900/50">
            <button
              onClick={onClose}
              className="w-full py-3 text-center text-stone-400 hover:text-amber-200 transition-colors"
            >
              Or just speak — you don't need a prompt
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual prompt card
function PromptCard({
  prompt,
  onSelect,
  compact = false
}: {
  prompt: SoulPrompt;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      className={`
        w-full text-left rounded-lg border transition-all duration-200
        ${elementBgColors[prompt.element]}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      <p className={`text-stone-200 leading-relaxed ${compact ? 'text-sm' : ''}`}>
        "{prompt.text}"
      </p>
      {!compact && prompt.archetype && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800/50 text-stone-400">
            {prompt.archetype}
          </span>
        </div>
      )}
    </motion.button>
  );
}

// Trigger button to open prompt picker
export function PromptPickerTrigger({
  onClick,
  className = ''
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r from-amber-600/20 to-orange-600/20
        border border-amber-600/30 hover:border-amber-500/50
        text-amber-200 text-sm font-medium
        transition-all duration-200
        shadow-lg shadow-amber-900/20
        ${className}
      `}
    >
      <Sparkles className="w-4 h-4" />
      <span>Soul Prompts</span>
    </motion.button>
  );
}
