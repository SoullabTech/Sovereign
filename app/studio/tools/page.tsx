'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  ExternalLink,
  BookOpen,
  Monitor,
  PenTool,
  Lightbulb,
  Sparkles,
  FileText,
  Target,
  Heart,
  Repeat,
} from 'lucide-react';

// --- Data types ---

interface PractitionerTool {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  priceRange: string;
  category: 'analog' | 'digital' | 'resources';
  url?: string;
  comingSoon?: boolean;
  inserts?: { icon: typeof FileText; name: string; purpose: string }[];
}

interface ToolCategory {
  key: 'analog' | 'digital' | 'resources';
  label: string;
  icon: typeof PenTool;
  description: string;
}

// --- Static data ---

const CATEGORIES: ToolCategory[] = [
  { key: 'analog', label: 'Analog Tools', icon: PenTool, description: 'Sovereign instruments. No cloud, no tracking, no feed.' },
  { key: 'digital', label: 'Digital Tools', icon: Monitor, description: 'Software that respects your sovereignty.' },
  { key: 'resources', label: 'Practice Resources', icon: BookOpen, description: 'Books, references, and frameworks.' },
];

const TOOLS: PractitionerTool[] = [
  {
    id: 'modular-planner',
    name: 'Modular Planner System',
    description: 'A5 vegan leather binder with mix-and-match inserts. A physical system for practitioners who want to plan, track, and reflect without screen dependency.',
    whyItMatters: 'Analog sovereignty. Your session notes, client patterns, and practice goals live in your hands \u2014 not in a cloud database. No algorithm decides what you see next. No outage takes your notes offline. No breach exposes your reflections.',
    priceRange: '$45\u2013$85',
    category: 'analog',
    comingSoon: true,
    inserts: [
      { icon: FileText, name: 'Meeting Notes', purpose: 'Structured session documentation without digital distraction' },
      { icon: Target, name: 'Goal Setting', purpose: 'Quarterly and annual practice goals, visible daily' },
      { icon: Heart, name: 'Wellness Tracker', purpose: 'Monitor your own patterns as a practitioner \u2014 burnout prevention' },
      { icon: Repeat, name: 'Habit Tracker', purpose: 'Build consistency in the rituals that sustain your practice' },
    ],
  },
];

// --- Component ---

export default function PractitionerToolsPage() {
  const [activeCategory, setActiveCategory] = useState<'analog' | 'digital' | 'resources'>('analog');

  const filteredTools = TOOLS.filter(t => t.category === activeCategory);
  const activeInfo = CATEGORIES.find(c => c.key === activeCategory)!;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Wrench className="w-6 h-6 text-amber-400" />
            Practitioner Tools
          </h1>
          <p className="text-slate-400 mt-1">
            Curated recommendations for your practice
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          className="flex gap-2 mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                ${activeCategory === cat.key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#1e1e38] text-slate-400 border border-slate-800/50 hover:border-slate-700 hover:text-white'}
              `}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Category description */}
        <motion.p
          key={activeCategory}
          className="text-slate-500 text-sm mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {activeInfo.description}
        </motion.p>

        {/* Tool cards */}
        <div className="mt-6 space-y-6">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                {/* Tool header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-white">{tool.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">{tool.description}</p>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {tool.priceRange}
                  </span>
                </div>

                {/* Why it matters */}
                <div className="mt-5 bg-[#16162a]/50 rounded-lg p-4 border-l-2 border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Why it matters
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{tool.whyItMatters}</p>
                </div>

                {/* Recommended inserts */}
                {tool.inserts && (
                  <div className="mt-5">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">
                      Recommended for practitioners
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tool.inserts.map(insert => (
                        <div
                          key={insert.name}
                          className="flex items-start gap-3 bg-[#16162a]/30 rounded-lg p-3"
                        >
                          <insert.icon className="w-4 h-4 text-amber-400/70 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-white">{insert.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{insert.purpose}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="mt-5 flex items-center gap-3">
                  {tool.url && !tool.comingSoon ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-800/80 text-slate-500 rounded-lg text-xs">
                      Affiliate link coming soon
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center py-16 bg-[#1e1e38] border border-slate-800/50 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <activeInfo.icon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Tools coming soon</p>
              <p className="text-slate-600 text-sm mt-1">We&apos;re curating trusted recommendations</p>
            </motion.div>
          )}
        </div>

        {/* Trust footer */}
        <motion.div
          className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-400">
              These are practitioner-to-practitioner recommendations, not advertisements.
              We only include tools we believe genuinely serve your practice and your clients&apos; sovereignty.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
