'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
  ArrowRight,
} from 'lucide-react';

// --- Data types ---

interface PractitionerTool {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  /** Price range for external tools, tier label for internal tools */
  priceRange: string;
  category: 'analog' | 'digital' | 'resources';
  /** External URL for affiliate/partner tools */
  url?: string;
  /** Internal path for Soullab tools */
  internalPath?: string;
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
  { key: 'digital', label: 'Digital Tools', icon: Monitor, description: 'Built-in Soullab tools that respect your sovereignty.' },
  { key: 'resources', label: 'Practice Resources', icon: BookOpen, description: 'Frameworks, references, and community for your practice.' },
];

const TOOLS: PractitionerTool[] = [
  // ── Analog ──────────────────────────────────────────────────────────────────
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

  // ── Digital ─────────────────────────────────────────────────────────────────
  {
    id: 'scribe',
    name: 'Scribe',
    description: 'Voice recording with transcription. Capture sessions, meetings, or supervision notes in audio form \u2014 then export clean text.',
    whyItMatters: 'Presence over typing. When you are holding space for a client, you should not be hunched over a keyboard. Scribe lets you record and transcribe after the session, keeping you fully present during it.',
    priceRange: 'Pro tier',
    category: 'digital',
    internalPath: '/studio/scribe',
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Your private writing space. Voice or text entries that become part of your continuity with MAIA. Designed for practitioner reflection, not just client notes.',
    whyItMatters: 'Practitioners need their own reflective practice. The Journal is sovereign \u2014 your entries never leave your instance, never train a model, never get scraped. It is your space to process the weight you carry.',
    priceRange: 'Personal tier',
    category: 'digital',
    internalPath: '/labtools/journal',
  },
  {
    id: 'capture',
    name: 'Capture',
    description: 'Quick session notes for export. Capture key moments during or after client work, then export to your notes app or Obsidian vault.',
    whyItMatters: 'Session documentation should not be a burden. Capture gives you a fast, structured way to record what matters \u2014 without rebuilding your entire workflow around yet another app.',
    priceRange: 'Personal tier',
    category: 'digital',
    internalPath: '/capture',
  },
  {
    id: 'navigator',
    name: 'Navigator',
    description: 'Structured practice with the Spiralogic framework. Track your position, work with elements, follow the spiral \u2014 as a personal development tool for practitioners.',
    whyItMatters: 'If you are guiding others through transformation, you need your own map. Navigator gives you a framework for your own growth that mirrors the depth you bring to client work.',
    priceRange: 'Personal tier',
    category: 'digital',
    internalPath: '/labtools/navigator',
  },
  {
    id: 'field-protocol',
    name: 'Field Protocol',
    description: 'Structured protocols for consciousness exploration and documentation. Use for case formulation, supervision notes, or tracking therapeutic themes across your caseload.',
    whyItMatters: 'Rigorous documentation is not bureaucracy \u2014 it is how you track patterns across clients, notice your own blind spots, and build evidence for what actually works in your practice.',
    priceRange: 'Pro tier',
    category: 'digital',
    internalPath: '/labtools/field-protocol',
  },
  {
    id: 'sovereignty',
    name: 'Data Sovereignty',
    description: 'Export, delete, or manage all your data. Full control over what is stored, what is shared, and what disappears.',
    whyItMatters: 'Your sovereignty is not a feature \u2014 it is a right. As a practitioner, you need tools that respect the same boundaries you hold for your clients. Data Sovereignty ensures your practice data stays yours.',
    priceRange: 'Personal tier',
    category: 'digital',
    internalPath: '/labtools/sovereignty',
  },

  // ── Resources ───────────────────────────────────────────────────────────────
  {
    id: 'spiralogic-framework',
    name: 'Spiralogic Framework',
    description: 'The core mapping system behind MAIA. A developmental spiral model integrating elements, phases, and consciousness states into a practical framework for growth work.',
    whyItMatters: 'Understanding Spiralogic gives you a shared language with your clients who use MAIA. It also provides a non-pathologizing map for human development that respects cultural and spiritual diversity.',
    priceRange: 'Built-in',
    category: 'resources',
    internalPath: '/labtools/navigator',
  },
  {
    id: 'portal-case-studies',
    name: 'Portal Case Studies',
    description: '13 imagineer scenarios showing how MAIA adapts to different cultural contexts \u2014 from Gen Z seekers to Indigenous practitioners, corporate leaders to recovery communities.',
    whyItMatters: 'These scenarios help you understand the range of client journeys MAIA supports. Use them to envision how your own clients might engage, and to identify which portals align with your practice.',
    priceRange: 'Built-in',
    category: 'resources',
    internalPath: '/studio/case-studies',
  },
  {
    id: 'practitioner-stories',
    name: 'Practitioner Stories',
    description: 'Real accounts from practitioners using Soullab tools in their practice. How they integrate analog and digital, what worked, what surprised them.',
    whyItMatters: 'Nothing replaces hearing from peers. These stories are not testimonials \u2014 they are honest accounts of what it means to bring sovereignty-respecting tools into real practice with real clients.',
    priceRange: 'Coming soon',
    category: 'resources',
    comingSoon: true,
  },
  {
    id: 'community-circle',
    name: 'Practitioner Community',
    description: 'Connect with other practitioners using Soullab tools. Share approaches, ask questions, and build referral relationships grounded in shared values.',
    whyItMatters: 'Sovereignty does not mean isolation. A community of practitioners who share your commitment to ethical, client-centered work is one of the most valuable resources you can have.',
    priceRange: 'Coming soon',
    category: 'resources',
    comingSoon: true,
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

                {/* Recommended inserts (analog tools) */}
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
                  {tool.internalPath && !tool.comingSoon ? (
                    <Link
                      href={tool.internalPath}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
                    >
                      Open Tool
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : tool.url && !tool.comingSoon ? (
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
                      {tool.comingSoon ? 'Coming soon' : 'Affiliate link coming soon'}
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
