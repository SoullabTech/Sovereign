'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Life sections — framed by what people LIVE, not what the platform does ───

interface LifeItem {
  label: string;
  prompt: string;
}

interface LifeSection {
  title: string;
  items: LifeItem[];
}

const LIFE_SECTIONS: LifeSection[] = [
  {
    title: 'Everyday life',
    items: [
      { label: 'Preparing for a difficult conversation.',    prompt: 'I need to prepare for a difficult conversation.' },
      { label: 'Thinking through a decision.',               prompt: 'Help me think through a decision I\'m facing.' },
      { label: 'Organizing an idea.',                        prompt: 'I have an idea I\'m trying to organize.' },
      { label: 'Remembering something important.',           prompt: 'Help me capture something important I don\'t want to lose.' },
    ],
  },
  {
    title: 'Your inner life',
    items: [
      { label: 'Understanding a dream.',                     prompt: 'I\'d like to explore a dream I had.' },
      { label: 'Making sense of a relationship.',            prompt: 'Help me make sense of a relationship that\'s on my mind.' },
      { label: 'Sitting with grief.',                        prompt: 'I\'m sitting with grief and want company for it.' },
      { label: 'Finding your way through change.',           prompt: 'I\'m in the middle of a change and need to think it through.' },
    ],
  },
  {
    title: 'Your work',
    items: [
      { label: 'Building a book.',                           prompt: 'I\'m building a book and want to work on it here.' },
      { label: 'Developing a practice.',                     prompt: 'I\'m developing a practice and want to think it through.' },
      { label: 'Growing an organization.',                   prompt: 'I\'m growing an organization and need to think about it.' },
      { label: 'Exploring a vision that isn\'t finished yet.', prompt: 'I have a vision that\'s still forming. Let\'s explore it.' },
    ],
  },
  {
    title: 'Learning',
    items: [
      { label: 'Bring me a paper.',                          prompt: 'I have a paper I\'d like to explore with you.' },
      { label: 'Ask about a philosophy.',                    prompt: 'I want to explore a philosophy I\'ve been thinking about.' },
      { label: 'Explore psychology.',                        prompt: 'I\'m curious about psychology. Let\'s explore.' },
      { label: 'Learn something new together.',              prompt: 'Let\'s learn something new together.' },
    ],
  },
  {
    title: 'Your own wisdom',
    items: [
      { label: 'Save insights.',                             prompt: 'I\'d like to save some insights from today.' },
      { label: 'Return to conversations.',                   prompt: 'I want to return to something we\'ve talked about before.' },
      { label: 'Notice patterns across time.',               prompt: 'Help me notice patterns in what I\'ve been bringing here.' },
      { label: 'Build a body of work.',                      prompt: 'I want to start building a body of work in this space.' },
    ],
  },
  {
    title: 'Or...',
    items: [
      { label: 'Ask me anything.',                           prompt: 'I\'m not sure where to begin. Just talk with me.' },
      { label: 'If I can help, I will.',                     prompt: 'I\'m curious what you can do. Show me.' },
      { label: 'If another way would serve you better, I\'ll tell you.', prompt: 'I have something I want to explore, but I\'m not sure how to frame it. Let\'s start.' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  onPromptSelect: (prompt: string) => void;
  onDismiss: () => void;
}

export function MaiaLivingOrientation({ onPromptSelect, onDismiss }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto px-2"
    >
      {/* MAIA's invitation — permission, not a feature map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-7 space-y-1"
      >
        <p className="text-stone-400 text-sm leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          People use this space in many different ways.
        </p>
        <p className="text-stone-500 text-sm leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          There isn&apos;t a right place to begin.
        </p>
        <p className="text-stone-500 text-sm leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          If it&apos;s something you&apos;re living, creating, wondering about,
          remembering, or becoming&mdash;
        </p>
        <p className="text-stone-400 text-sm leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          we can begin there.
        </p>
      </motion.div>

      {/* Life sections */}
      <div className="space-y-5">
        {LIFE_SECTIONS.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIdx * 0.06, duration: 0.35 }}
          >
            <p
              className="text-stone-600 text-xs uppercase tracking-widest mb-2 px-1"
              style={{ letterSpacing: '0.12em' }}
            >
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onPromptSelect(item.prompt)}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-full text-left px-3 py-2 rounded text-stone-400 text-sm transition-all duration-150 hover:text-stone-100"
                  style={{
                    backgroundColor: hoveredItem === item.label ? 'rgba(255,255,255,0.04)' : 'transparent',
                    fontFamily: 'Spectral, Georgia, serif',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Closing stewardship promise */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 pt-6 border-t border-stone-900 text-center space-y-2"
      >
        <p className="text-stone-600 text-xs leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          You don&apos;t have to learn this place.
        </p>
        <p className="text-stone-700 text-xs leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          Bring your life, your questions, your work, or your curiosity.
        </p>
        <p className="text-stone-700 text-xs leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          If there&apos;s a better place for what we&apos;re doing, I&apos;ll lead us there.
        </p>
        <button
          onClick={onDismiss}
          className="text-stone-700 text-xs hover:text-stone-500 transition-colors mt-2 inline-block"
        >
          Or just tell me what&apos;s here →
        </button>
      </motion.div>
    </motion.div>
  );
}
