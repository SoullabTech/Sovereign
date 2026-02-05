'use client';

/**
 * COMMUNITY COMMONS PORTAL
 *
 * The gateway distinguishing two paths:
 * 1. Community Shares — Curated wisdom library
 * 2. Ways of Engaging — Forums, discussions, interactions
 *
 * Styled with sovereign amber aesthetic.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  MessageSquare,
  Sparkles,
  Gift,
  Compass,
  Library,
  Flame,
  Heart,
  Star,
  ArrowRight,
  Scroll,
  Lightbulb,
  Quote,
  FileText,
  CircleDot,
} from 'lucide-react';

// Holoflower-inspired decorative element
const HoloflowerAccent = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.6" />
    {/* Petals */}
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <ellipse
        key={angle}
        cx="50"
        cy="20"
        rx="8"
        ry="18"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </svg>
);

interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  wisdomFiles: number;
  breakthroughs: number;
}

export default function CommonsPortalPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    totalPosts: 0,
    wisdomFiles: 189,
    breakthroughs: 0,
  });

  useEffect(() => {
    // Fetch community stats
    fetch('/api/community/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats?.community) {
          setStats({
            totalMembers: data.stats.community.totalMembers || 0,
            totalPosts: data.stats.community.totalPosts || 0,
            wisdomFiles: 189,
            breakthroughs: data.stats.community.breakthroughs || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const wisdomCategories = [
    {
      icon: Scroll,
      title: 'Core Concepts',
      description: 'Alchemical stages, soul vs spirit, depth psychology foundations',
      count: '12 entries',
      color: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'border-violet-500/30',
      iconColor: 'text-violet-400',
    },
    {
      icon: FileText,
      title: 'Essays & Teachings',
      description: 'Against literalization, depression as soul work, spiralogic',
      count: '8 essays',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Lightbulb,
      title: 'Practices & Methods',
      description: 'Active imagination, shadow work, dream techniques',
      count: '15 practices',
      color: 'from-amber-500/20 to-yellow-500/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      icon: Quote,
      title: 'Voices & Dialogues',
      description: 'Jung, Hillman, Marlan, Edinger — direct wisdom',
      count: '22 quotes',
      color: 'from-rose-500/20 to-pink-500/20',
      borderColor: 'border-rose-500/30',
      iconColor: 'text-rose-400',
    },
  ];

  const engagementPaths = [
    {
      icon: Compass,
      title: 'Sacred Territories',
      description: 'Forum discussions organized by wisdom journey stage',
      path: '/maia/community',
      cta: 'Enter Territories',
      color: 'from-amber-600 to-yellow-600',
    },
    {
      icon: Flame,
      title: 'Elemental Alchemy',
      description: "Kelly's foundational book — Fire, Water, Earth, Air & Aether",
      path: '/maia/community/elemental-alchemy',
      cta: 'Read Book',
      color: 'from-orange-600 to-red-600',
    },
    {
      icon: Gift,
      title: 'Contribute Wisdom',
      description: 'Offer prompts, practices, stories, and resources',
      path: '/maia/community/contribute',
      cta: 'Make Offering',
      color: 'from-teal-600 to-emerald-600',
    },
    {
      icon: Library,
      title: 'Wisdom Files',
      description: '189 searchable documents across traditions',
      path: '/library',
      cta: 'Browse Library',
      color: 'from-violet-600 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <HoloflowerAccent className="absolute -top-20 -right-20 w-96 h-96 text-amber-500/10" />
        <HoloflowerAccent className="absolute -bottom-32 -left-32 w-[500px] h-[500px] text-violet-500/5" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <CircleDot className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300/80">Soullab Commons</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-light text-amber-50 mb-4 tracking-wide">
              The Commons
            </h1>

            <p className="text-lg text-amber-200/60 max-w-2xl mx-auto leading-relaxed">
              Where wisdom is shared and community gathers. Two paths converge here —
              the curated library and the living forum.
            </p>
          </motion.div>
        </header>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { label: 'Members', value: stats.totalMembers, icon: Users },
            { label: 'Discussions', value: stats.totalPosts, icon: MessageSquare },
            { label: 'Wisdom Files', value: stats.wisdomFiles, icon: BookOpen },
            { label: 'Breakthroughs', value: stats.breakthroughs, icon: Sparkles },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-4 bg-white/5 border border-white/10 rounded-xl text-center backdrop-blur-sm"
            >
              <stat.icon className="w-5 h-5 text-amber-400/60 mx-auto mb-2" />
              <div className="text-2xl font-light text-amber-100">{stat.value}</div>
              <div className="text-xs text-amber-300/50 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Two Paths Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Community Shares */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-full p-8 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-violet-500/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-violet-300" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-amber-50">Community Shares</h2>
                  <p className="text-sm text-violet-300/60">Curated wisdom library</p>
                </div>
              </div>

              <p className="text-amber-200/60 text-sm mb-6 leading-relaxed">
                A sacred repository of alchemical psychology, depth work, and consciousness
                practices. Explore wisdom from Jung, Hillman, and contemporary voices.
              </p>

              <div className="space-y-3 mb-6">
                {wisdomCategories.map((cat) => (
                  <div
                    key={cat.title}
                    className={`p-3 bg-gradient-to-r ${cat.color} border ${cat.borderColor} rounded-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon className={`w-4 h-4 ${cat.iconColor}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-100">{cat.title}</div>
                        <div className="text-xs text-amber-200/50">{cat.description}</div>
                      </div>
                      <span className="text-xs text-amber-300/40">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/maia/community/commons')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3
                         bg-violet-600 hover:bg-violet-700 text-white rounded-xl
                         transition-colors font-medium"
              >
                <span>Enter Wisdom Library</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Ways of Engaging */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="h-full p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-amber-50">Ways of Engaging</h2>
                  <p className="text-sm text-amber-300/60">Community & connection</p>
                </div>
              </div>

              <p className="text-amber-200/60 text-sm mb-6 leading-relaxed">
                Navigate the universal wisdom journey through Sacred Territories.
                Share breakthroughs, ask questions, and connect with fellow travelers.
              </p>

              <div className="space-y-3 mb-6">
                {engagementPaths.map((path) => (
                  <button
                    key={path.title}
                    onClick={() => router.push(path.path)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10
                             hover:border-amber-500/30 rounded-lg transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-br ${path.color} rounded-lg`}>
                        <path.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-100 group-hover:text-amber-50">
                          {path.title}
                        </div>
                        <div className="text-xs text-amber-200/50">{path.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400/40 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => router.push('/maia/community')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3
                         bg-amber-600 hover:bg-amber-700 text-white rounded-xl
                         transition-colors font-medium"
              >
                <span>Enter Sacred Territories</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Featured Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <button
            onClick={() => router.push('/maia/community/elemental-alchemy')}
            className="w-full p-6 bg-gradient-to-r from-orange-600/20 via-red-600/10 to-amber-600/20
                     border border-orange-500/30 rounded-2xl hover:border-orange-500/50
                     transition-all group text-left"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-xl border border-orange-500/20">
                <Flame className="w-10 h-10 text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-medium text-amber-100">Elemental Alchemy</h3>
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full">
                    Founder&apos;s Book
                  </span>
                </div>
                <p className="text-amber-200/60">
                  The Ancient Art of Living a Phenomenal Life — Interactive exploration of
                  Fire, Water, Earth, Air & Aether with practices, assessments, and journal integration.
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-orange-400/40 group-hover:text-orange-400 transition-colors" />
            </div>
          </button>
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Heart,
              label: 'Support',
              sublabel: 'Become a patron',
              path: '/patrons',
              color: 'text-rose-400',
            },
            {
              icon: Star,
              label: 'My Offerings',
              sublabel: 'Your contributions',
              path: '/maia/community/commons/my-offerings',
              color: 'text-amber-400',
            },
            {
              icon: BookOpen,
              label: 'Guidelines',
              sublabel: 'Community standards',
              path: '/maia/community/guidelines',
              color: 'text-emerald-400',
            },
            {
              icon: MessageSquare,
              label: 'Help & FAQ',
              sublabel: 'Getting started',
              path: '/maia/community/faq',
              color: 'text-violet-400',
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10
                       hover:border-white/20 rounded-xl transition-all text-center group"
            >
              <action.icon className={`w-5 h-5 ${action.color} mx-auto mb-2`} />
              <div className="text-sm font-medium text-amber-100">{action.label}</div>
              <div className="text-xs text-amber-300/40">{action.sublabel}</div>
            </button>
          ))}
        </motion.div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-sm text-amber-300/40 italic">
            Where wisdom is shared and seekers gather
          </p>
          <button
            onClick={() => router.push('/maia')}
            className="mt-4 text-sm text-amber-400/60 hover:text-amber-400 transition-colors"
          >
            Return to MAIA
          </button>
        </footer>
      </div>
    </div>
  );
}
