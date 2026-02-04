'use client';

/**
 * MAIA LabTools
 *
 * Organized access to tools in drawer-style layout
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Brain,
  BookOpen,
  FileText,
  Library,
  Compass,
  Globe,
  Mic,
  User,
  Heart,
  Radio,
  Upload,
  Download,
  Eye,
  Zap,
  Shield,
  Star,
  Search,
  Activity,
  Settings,
  Users,
} from 'lucide-react';

export default function LabToolsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/maia');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const menuSections = [
    {
      title: 'EXPLORE',
      icon: '🔮',
      items: [
        {
          icon: Compass,
          label: 'Oracle',
          path: '/oracle',
          description: 'I Ching • Tarot • Runes'
        },
        {
          icon: Compass,
          label: 'Journey',
          path: '/journey',
          description: 'Archetypal mapping & patterns'
        },
        {
          icon: Sparkles,
          label: 'Story Creator',
          path: '/labtools/story-creator',
          description: 'Personalized narratives from 46+ traditions'
        },
      ],
    },
    {
      title: 'CREATE',
      icon: '✍️',
      items: [
        {
          icon: Sparkles,
          label: 'Reflections',
          path: '/labtools/reflections',
          description: 'Distilled moments from conversations'
        },
        {
          icon: BookOpen,
          label: 'Journal',
          path: '/labtools/journal',
          description: 'Capture thoughts and insights'
        },
        {
          icon: FileText,
          label: 'Lab Notes',
          path: '/labtools/lab-notes',
          description: 'Research and discoveries'
        },
        {
          icon: Radio,
          label: 'Capture',
          path: '/capture',
          description: 'Session notes for export'
        },
        {
          icon: Mic,
          label: 'Scribe',
          path: '/labtools/scribe',
          description: 'Record and transcribe sessions'
        },
      ],
    },
    {
      title: 'LIBRARY',
      icon: '📚',
      items: [
        {
          icon: Library,
          label: 'Library',
          path: '/library',
          description: 'Your personal collection'
        },
        {
          icon: Heart,
          label: 'Favorites',
          path: '/labtools/favorites',
          description: 'Saved items'
        },
        {
          icon: Download,
          label: 'Downloads',
          path: '/labtools/downloads',
          description: 'Access your content'
        },
        {
          icon: Upload,
          label: 'Upload',
          path: '/labtools/upload',
          description: 'Share files with MAIA'
        },
      ],
    },
    {
      title: 'SETTINGS',
      icon: '⚙️',
      items: [
        {
          icon: User,
          label: 'Profile',
          path: '/labtools/profile',
          description: 'Account & preferences'
        },
        {
          icon: Globe,
          label: 'Language',
          path: '/labtools/language',
          description: 'MAIA speaks 30+ languages'
        },
        {
          icon: Mic,
          label: 'Voice',
          path: '/labtools/voice',
          description: 'Voice synthesis & modes'
        },
        {
          icon: Shield,
          label: 'Data Sovereignty',
          path: '/labtools/sovereignty',
          description: 'Control over your data'
        },
        {
          icon: Sparkles,
          label: 'Patterns',
          path: '/patterns',
          description: 'Symbolic systems & cycles'
        },
      ],
    },
    {
      title: 'ADVANCED',
      icon: '🧪',
      items: [
        {
          icon: Brain,
          label: 'Brain Trust',
          path: '/labtools/brain-trust',
          description: 'Multi-model orchestration'
        },
        {
          icon: Eye,
          label: 'Field Analytics',
          path: '/labtools/field-analytics',
          description: 'Observation & metrics'
        },
        {
          icon: Compass,
          label: 'Navigator',
          path: '/labtools/navigator',
          description: 'Spiralogic integration'
        },
        {
          icon: Radio,
          label: 'Field Protocol',
          path: '/labtools/field-protocol',
          description: 'Document explorations'
        },
        {
          icon: Star,
          label: 'Pioneer Circle',
          path: '/labtools/beta-testing',
          description: 'Beta testing program'
        },
      ],
    },
    {
      title: 'DEVELOPER',
      icon: '💻',
      items: [
        {
          icon: Zap,
          label: 'Claude Code',
          path: '/labtools/claude-code',
          description: 'AI development tools'
        },
        {
          icon: Search,
          label: 'RLM Navigator',
          path: '/labtools/rlm',
          description: 'Codebase exploration'
        },
        {
          icon: Activity,
          label: 'AIN Telemetry',
          path: '/labtools/ain',
          description: 'Response structure analysis'
        },
      ],
    },
    {
      title: 'ADMIN',
      icon: '🔐',
      items: [
        {
          icon: Settings,
          label: 'System Settings',
          path: '/labtools/admin/system',
          description: 'Feature flags & controls'
        },
        {
          icon: Users,
          label: 'Beta Testers',
          path: '/labtools/admin/beta-testers',
          description: 'Manage beta access'
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to MAIA
          </button>
        </div>

        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4B896] to-[#B8935A] rounded-lg
                          flex items-center justify-center text-2xl">
              🧬
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#D4B896] tracking-wide">Lab Tools</h1>
              <p className="text-[#D4B896]/60 text-sm">Your workspace</p>
            </div>
          </div>

          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Organized access to MAIA's tools and laboratory instruments.
            Each section contains specialized tools for your journey.
          </p>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {menuSections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-sm font-medium text-[#D4B896]/70 tracking-widest">
                  {section.title}
                </h3>
              </div>

              {/* Section Items */}
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-start gap-4 p-4 rounded-xl transition-all
                               bg-white/5 hover:bg-[#D4B896]/10 border border-transparent
                               hover:border-[#D4B896]/20 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                                    bg-[#D4B896]/10 group-hover:bg-[#D4B896]/20 transition-all">
                        <Icon className="w-5 h-5 text-[#D4B896]" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white/90">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/50 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-[#D4B896]/40 group-hover:text-[#D4B896]/80 transition-all">
                        →
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4B896]/10 border border-[#D4B896]/20 rounded-xl">
            <Sparkles className="w-4 h-4 text-[#D4B896]" />
            <span className="text-white/70 text-sm">
              Your complete laboratory workspace
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}