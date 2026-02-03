'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Shuffle,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import {
  fullPromptLibrary,
  elementMeta,
  depthDescriptions,
  getPrompts,
  getRandomPrompt,
  type Element,
  type DepthLevel,
  type SoulPrompt
} from '@/lib/prompts/soulPromptLibrary';

const elementIcons: Record<Element, React.ReactNode> = {
  fire: <Flame className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
  earth: <Mountain className="w-5 h-5" />,
  air: <Wind className="w-5 h-5" />,
  aether: <Sparkles className="w-5 h-5" />
};

const elementColors: Record<Element, string> = {
  fire: 'from-orange-500 to-red-500',
  water: 'from-blue-500 to-cyan-500',
  earth: 'from-green-500 to-emerald-500',
  air: 'from-yellow-400 to-amber-400',
  aether: 'from-amber-500 to-indigo-500'
};

const elementBgColors: Record<Element, string> = {
  fire: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  water: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  earth: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
  air: 'bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30',
  aether: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30'
};

export default function PromptsLibraryPage() {
  const router = useRouter();
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<DepthLevel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDepthMenu, setShowDepthMenu] = useState(false);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    let prompts = fullPromptLibrary;

    if (selectedElement) {
      prompts = prompts.filter(p => p.element === selectedElement);
    }
    if (selectedDepth) {
      prompts = prompts.filter(p => p.depth === selectedDepth);
    }

    return prompts;
  }, [selectedElement, selectedDepth]);

  // Group by element
  const promptsByElement = useMemo(() => {
    const grouped: Record<Element, SoulPrompt[]> = {
      fire: [],
      water: [],
      earth: [],
      air: [],
      aether: []
    };
    for (const prompt of filteredPrompts) {
      grouped[prompt.element].push(prompt);
    }
    return grouped;
  }, [filteredPrompts]);

  const handleCopy = async (prompt: SoulPrompt) => {
    await navigator.clipboard.writeText(prompt.text);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePrompt = (prompt: SoulPrompt) => {
    // Store in sessionStorage so OracleConversation can pick it up
    sessionStorage.setItem('maia.pendingPrompt', prompt.text);
    router.push('/maia');
  };

  const handleRandomPrompt = () => {
    const prompt = getRandomPrompt({
      element: selectedElement || undefined,
      depth: selectedDepth || undefined
    });
    if (prompt) {
      handleUsePrompt(prompt);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-stone-950/80 backdrop-blur-md border-b border-amber-900/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-400 hover:text-amber-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>

            <button
              onClick={handleRandomPrompt}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/20 border border-amber-600/30 hover:bg-amber-600/30 transition-colors text-amber-200"
            >
              <Shuffle className="w-4 h-4" />
              <span className="text-sm">Surprise me</span>
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-cinzel text-amber-100">Soul Prompt Library</h1>
            <p className="text-sm text-stone-400 mt-1">
              {filteredPrompts.length} prompts across {selectedElement ? '1 element' : '5 elements'}
            </p>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Element filter */}
            <div className="flex gap-2">
              {(Object.keys(elementMeta) as Element[]).map((element) => (
                <button
                  key={element}
                  onClick={() => setSelectedElement(selectedElement === element ? null : element)}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${selectedElement === element
                      ? `bg-gradient-to-br ${elementColors[element]} border-transparent shadow-lg`
                      : `${elementBgColors[element]} border-transparent`
                    }
                  `}
                  title={elementMeta[element].name}
                >
                  <span className={selectedElement === element ? 'text-white' : 'text-stone-300'}>
                    {elementIcons[element]}
                  </span>
                </button>
              ))}
            </div>

            {/* Depth filter */}
            <div className="relative">
              <button
                onClick={() => setShowDepthMenu(!showDepthMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-amber-700/50 transition-colors"
              >
                <span className="text-sm">
                  {selectedDepth ? depthDescriptions[selectedDepth].icon : '🌱'}
                </span>
                <span className="text-sm text-stone-300">
                  {selectedDepth ? depthDescriptions[selectedDepth].label : 'All depths'}
                </span>
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </button>

              <AnimatePresence>
                {showDepthMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-56 rounded-lg bg-stone-800 border border-stone-700 shadow-xl z-20"
                  >
                    <button
                      onClick={() => {
                        setSelectedDepth(null);
                        setShowDepthMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left rounded-t-lg hover:bg-stone-700/50 ${
                        !selectedDepth ? 'bg-amber-900/20' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-stone-200">All depths</div>
                      <div className="text-xs text-stone-400">Show all prompts</div>
                    </button>
                    {(['seeker', 'practitioner', 'alchemist'] as DepthLevel[]).map((depth, i) => (
                      <button
                        key={depth}
                        onClick={() => {
                          setSelectedDepth(depth);
                          setShowDepthMenu(false);
                        }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-700/50 ${
                          selectedDepth === depth ? 'bg-amber-900/20' : ''
                        } ${i === 2 ? 'rounded-b-lg' : ''}`}
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

            {/* Clear filters */}
            {(selectedElement || selectedDepth) && (
              <button
                onClick={() => {
                  setSelectedElement(null);
                  setSelectedDepth(null);
                }}
                className="text-xs text-stone-500 hover:text-amber-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Prompt Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {selectedElement ? (
          // Show filtered by single element
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${elementColors[selectedElement]}`}>
                <span className="text-white">{elementIcons[selectedElement]}</span>
              </div>
              <div>
                <h2 className="text-xl font-cinzel text-amber-100">
                  {elementMeta[selectedElement].name}
                </h2>
                <p className="text-sm text-stone-400">
                  {elementMeta[selectedElement].essence}
                </p>
              </div>
            </div>

            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={() => handleCopy(prompt)}
                onUse={() => handleUsePrompt(prompt)}
                isCopied={copiedId === prompt.id}
              />
            ))}
          </div>
        ) : (
          // Show grouped by element
          <div className="space-y-12">
            {(Object.keys(promptsByElement) as Element[]).map((element) => {
              const prompts = promptsByElement[element];
              if (prompts.length === 0) return null;

              return (
                <section key={element}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${elementColors[element]}`}>
                      <span className="text-white">{elementIcons[element]}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-cinzel text-amber-100">
                        {elementMeta[element].name}
                      </h2>
                      <p className="text-xs text-stone-500">
                        {elementMeta[element].essence}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-stone-500">
                      {prompts.length} prompts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {prompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        onCopy={() => handleCopy(prompt)}
                        onUse={() => handleUsePrompt(prompt)}
                        isCopied={copiedId === prompt.id}
                        compact
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  );
}

function PromptCard({
  prompt,
  onCopy,
  onUse,
  isCopied,
  compact = false
}: {
  prompt: SoulPrompt;
  onCopy: () => void;
  onUse: () => void;
  isCopied: boolean;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border transition-all
        ${elementBgColors[prompt.element]}
        ${compact ? 'p-4' : 'p-5'}
      `}
    >
      <p className={`text-stone-200 leading-relaxed ${compact ? 'text-sm' : ''}`}>
        "{prompt.text}"
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800/50 text-stone-400">
            {depthDescriptions[prompt.depth].icon} {depthDescriptions[prompt.depth].label}
          </span>
          {prompt.archetype && (
            <span className="text-xs text-stone-500">
              {prompt.archetype}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 rounded-lg hover:bg-stone-700/50 transition-colors"
            title="Copy prompt"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-stone-400" />
            )}
          </button>
          <button
            onClick={onUse}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-200 text-sm transition-colors"
          >
            Use
          </button>
        </div>
      </div>
    </motion.div>
  );
}
