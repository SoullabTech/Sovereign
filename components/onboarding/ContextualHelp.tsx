'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, BookOpen, Mic, TrendingUp, Search, Settings } from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'sacred-journaling',
    title: 'What is Sacred Journaling?',
    icon: <BookOpen className="w-5 h-5" />,
    content: `Sacred journaling with MAIA goes beyond traditional journaling.

MAIA listens for symbols (river, bridge, threshold...), archetypes (Seeker, Healer, Shadow...), and emotional threads in your writing.

She reflects these back to you, helping you see patterns across time and understand your inner journey more deeply.`
  },
  {
    id: 'five-modes',
    title: 'The 5 Journaling Modes',
    icon: <BookOpen className="w-5 h-5" />,
    content: `🌀 Free Expression
Stream of consciousness. No structure—just what wants to emerge.

🔮 Dream Integration
Explore the symbolic language of your dreams and unconscious.

💓 Emotional Processing
Name, hold, and process emotions with compassion.

🌓 Shadow Work
Explore hidden aspects, tensions, or uncomfortable truths gently.

🧭 Life Direction
Clarify next steps, purpose, and alignment with your deeper path.`
  },
  {
    id: 'symbols-archetypes',
    title: 'Understanding Symbols & Archetypes',
    icon: <Search className="w-5 h-5" />,
    content: `Symbols are images, metaphors, or recurring themes in your writing (river, bridge, fire, mirror...). MAIA tracks these across your journey.

Archetypes are universal patterns of being (Seeker, Healer, Shadow, Mystic, Warrior...). They represent different aspects of your psyche that emerge at different times.

Together, they form your symbolic language—a unique map of your inner world.`
  },
  {
    id: 'voice-journaling',
    title: 'Using Voice Journaling',
    icon: <Mic className="w-5 h-5" />,
    content: `Voice journaling lets you speak your reflections naturally.

1. Click the microphone icon
2. Speak freely—MAIA transcribes in real-time
3. Tap again to finish
4. MAIA analyzes and reflects

Your voice entries are saved and searchable, just like written entries.

For voice-only mode, visit /journal/voice`
  },
  {
    id: 'timeline-patterns',
    title: 'Timeline & Patterns',
    icon: <TrendingUp className="w-5 h-5" />,
    content: `The timeline shows your journaling journey visually.

After 3+ entries, you can:
• Filter by journaling mode
• Click symbols to see their evolution
• Track archetypal patterns
• View emotional threads

Your timeline becomes a mythic map of your transformation.`
  },
  {
    id: 'semantic-search',
    title: 'Semantic Search',
    icon: <Search className="w-5 h-5" />,
    content: `After 5+ entries, semantic search unlocks.

Ask MAIA questions like:
"Have I written about grief before?"
"When did the river symbol first appear?"
"Show me my shadow work entries"

MAIA searches by meaning, not just keywords—finding thematic connections across your entire journey.`
  },
  {
    id: 'obsidian-export',
    title: 'Export to Obsidian',
    icon: <Settings className="w-5 h-5" />,
    content: `All your journal entries automatically export to Obsidian as markdown files.

Location: Journals/YYYY-MM/
Format: Markdown with frontmatter

Each entry includes:
• Full text
• Symbols, archetypes, emotions
• MAIA's reflection
• Searchable metadata

Your data is always yours.`
  }
];

export default function ContextualHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<HelpTopic | null>(null);

  const openHelp = (topic?: HelpTopic) => {
    setIsOpen(true);
    if (topic) setActiveTopic(topic);
  };

  const closeHelp = () => {
    setIsOpen(false);
    setActiveTopic(null);
  };

  return (
    <>
      <button
        onClick={() => openHelp()}
        className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#FFD700]/30 bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] text-[#FFD700] shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-[#FFD700]/25"
        aria-label="Help"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeHelp}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative mx-4 max-h-[80vh] overflow-hidden rounded-2xl border border-[#FFD700]/30 bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent" />

                <div className="relative">
                  <div className="flex items-center justify-between border-b border-[#FFD700]/20 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600">
                        <HelpCircle className="h-5 w-5 text-[#0A0E27]" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">
                        {activeTopic ? activeTopic.title : 'Help & Guide'}
                      </h2>
                    </div>
                    <button
                      onClick={closeHelp}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto p-6">
                    {activeTopic ? (
                      <div>
                        <button
                          onClick={() => setActiveTopic(null)}
                          className="mb-4 text-sm text-[#FFD700] hover:underline"
                        >
                          ← Back to topics
                        </button>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <p className="whitespace-pre-line leading-relaxed text-neutral-300">
                            {activeTopic.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {HELP_TOPICS.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setActiveTopic(topic)}
                            className="flex w-full items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 text-left transition-all hover:border-[#FFD700]/30 hover:bg-neutral-800/50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD700]/20 to-amber-600/20 text-[#FFD700]">
                              {topic.icon}
                            </div>
                            <span className="text-base font-medium text-white">
                              {topic.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#FFD700]/20 p-6">
                    <p className="text-center text-sm text-neutral-400">
                      Need more help?{' '}
                      <a
                        href="mailto:support@spiralogic.com"
                        className="text-[#FFD700] hover:underline"
                      >
                        Contact support
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function Tooltip({
  children,
  content,
  side = 'top'
}: {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positions[side]}`}
          >
            <div className="max-w-xs rounded-lg border border-[#FFD700]/30 bg-[#0A0E27] px-3 py-2 text-xs text-neutral-200 shadow-xl backdrop-blur-sm">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}