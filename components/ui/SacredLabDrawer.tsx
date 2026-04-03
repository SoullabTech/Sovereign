// @ts-nocheck
/**
 * Sacred Lab Drawer - Contextual navigation for SOULLAB
 *
 * Philosophy: Interface recedes to let presence deepen
 * Tools are "on the shelf" until needed - like a real lab
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  FileText,
  Radio,
  User,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  Heart,
  Download,
  Brain,
  Zap,
  Library,
  Compass,
  Globe,
  Mic,
  MicOff,
  MessageSquare,
  Cpu,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Clock,
  Target,
  Sun,
  Smile,
  ClipboardList,
  Briefcase,
  Users,
  GraduationCap,
  LayoutGrid,
  Gift,
  Hexagon,
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

interface SacredLabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onAction?: (action: string) => void | Promise<void>;
  showVoiceText?: boolean;
  isFieldRecording?: boolean;
  isScribing?: boolean;
  hasScribeSession?: boolean;
  // Additional props from OracleConversation
  isMuted?: boolean;
  isResponding?: boolean;
  isAudioPlaying?: boolean;
  showChatInterface?: boolean;
  voice?: string; // Sovereign voice identity (maia_core, maia_warm, atlas, etc.)
  // Session & Prompt props
  sessionPhase?: 'opening' | 'exploration' | 'integration' | 'closure' | 'complete';
  sessionMinutesRemaining?: number;
}

export const SacredLabDrawer: React.FC<SacredLabDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onAction,
  showVoiceText,
  isFieldRecording,
  isScribing,
  hasScribeSession,
  sessionPhase,
  sessionMinutesRemaining,
}) => {
  const menuSections = [
    // ── ZONE 1: SESSION (what you're doing right now) ──────────────
    {
      title: 'SESSION',
      icon: '✨',
      items: [
        {
          icon: Sparkles,
          label: 'Soul Prompts',
          action: () => onAction?.('open-prompt-picker'),
          description: 'Elemental prompts to guide your inquiry'
        },
        {
          icon: Clock,
          label: sessionPhase ? `Session: ${sessionPhase}` : 'Session Arc',
          action: () => onAction?.('show-session-arc'),
          description: sessionMinutesRemaining
            ? `${sessionMinutesRemaining}m remaining`
            : 'View your session journey',
          isActive: sessionPhase === 'exploration'
        },
        {
          icon: Target,
          label: 'Session Synthesis',
          action: () => onAction?.('show-session-synthesis'),
          description: 'Review patterns & invitation forward'
        },
        {
          icon: ClipboardList,
          label: 'Session Recap',
          action: () => onAction?.('session-recap'),
          description: 'Summary of themes, insights & invitation'
        },
        {
          icon: isScribing ? MicOff : Mic,
          label: isScribing ? 'Stop Scribe & Download' : 'Start Scribe Mode',
          action: () => onAction?.('scribe-mode'),
          doubleClickAction: () => onNavigate('/sessions'),
          description: isScribing
            ? 'Complete session and download transcript'
            : 'Record session passively with MAIA consultation',
          isActive: isScribing,
        },
        ...(hasScribeSession && !isScribing ? [{
          icon: MessageSquare,
          label: 'Review Session with MAIA',
          action: () => onAction?.('review-with-maia'),
          description: 'Get MAIA supervision on completed session'
        }] : []),
        {
          icon: Radio,
          label: isFieldRecording ? 'Stop Field Recording' : 'Field Protocol',
          action: () => onAction?.('field-protocol'),
          description: 'Document consciousness explorations',
          isActive: isFieldRecording,
        },
        {
          icon: Upload,
          label: 'Upload Files',
          action: () => onAction?.('upload'),
          description: 'Share files with MAIA'
        },
        {
          icon: Download,
          label: 'Download Conversation',
          action: () => onAction?.('download-transcript'),
          description: 'Save this conversation'
        },
        {
          icon: showVoiceText ? Eye : EyeOff,
          label: showVoiceText ? 'Hide Transcript' : 'Show Transcript',
          action: () => onAction?.('toggle-text'),
          description: 'Toggle voice transcript display'
        },
      ],
    },
    // ── ZONE 2: WORLDS (where I can go) ──────────────────────────
    {
      title: 'WORLDS',
      icon: '🌀',
      items: [
        {
          icon: Smile,
          label: 'Daily Check-in',
          action: () => onAction?.('daily-checkin'),
          description: 'How are you arriving today?'
        },
        {
          icon: Flame,
          label: 'Element Discovery',
          action: () => onAction?.('element-discovery'),
          description: 'Find your dominant elemental nature'
        },
        {
          icon: Hexagon,
          label: 'I Ching — Consult the Changes',
          action: () => onNavigate('/oracle/iching?return=/maia'),
          description: 'The book of change and timing'
        },
        {
          icon: Sparkles,
          label: 'Story Creator',
          action: () => onNavigate('/story-creator'),
          description: 'Personalized wisdom from 46+ traditions'
        },
        {
          icon: Compass,
          label: 'Oracle Consultation',
          action: () => onNavigate('/oracle'),
          description: 'Intuitive guidance & insight'
        },
        {
          icon: Compass,
          label: 'Archetypal Journey',
          action: () => onNavigate('/journey'),
          description: 'Your cosmic spiral & elemental blueprint'
        },
        {
          icon: Sparkles,
          label: 'Choose Your Guide',
          action: () => onAction?.('choose-guide'),
          description: '39 wisdom traditions as harmonic frequencies'
        },
      ],
    },
    // ── ZONE 3: OFFERINGS (what I can enter / threshold) ───────────
    {
      title: 'OFFERINGS',
      icon: '🔥',
      items: [
        {
          icon: Flame,
          label: 'Elemental Alchemy',
          action: () => onNavigate('/store/elemental-alchemy'),
          description: 'Book, audiobook, and guided journey'
        },
        {
          icon: Library,
          label: 'Your Library',
          action: () => onNavigate('/store/library'),
          description: 'Access your purchases'
        },
        {
          icon: Gift,
          label: 'Gift a Bead',
          action: () => onNavigate('/labtools/beads'),
          description: 'Invite someone into the experience'
        },
      ],
    },
    // ── ZONE 4: FIELD (memory / patterns / journal) ────────────────
    {
      title: 'FIELD',
      icon: '📚',
      items: [
        {
          icon: BookOpen,
          label: 'Your Journal',
          action: () => onNavigate('/labtools/journal'),
          description: 'All entries, captures, and scribe sessions'
        },
        {
          icon: Sparkles,
          label: 'Reflections',
          action: () => onNavigate('/labtools/reflections'),
          description: 'Your distilled moments and insights'
        },
        {
          icon: Library,
          label: 'Personal Library',
          action: () => onNavigate('/library'),
          description: 'Your curated knowledge collection'
        },
        {
          icon: BookOpen,
          label: 'Conversation Threads',
          action: () => onNavigate('/maia?panel=journey'),
          description: 'Patterns & trajectory across sessions'
        },
        {
          icon: Heart,
          label: 'Favorites',
          action: () => onNavigate('/favorites'),
          description: 'Cherished moments & insights'
        },
        {
          icon: BookOpen,
          label: 'View All Sessions',
          action: () => onNavigate('/sessions'),
          description: 'Browse past sessions & transcripts'
        },
        {
          icon: FileText,
          label: 'Research Notes',
          action: () => onNavigate('/lab-notes'),
          description: 'Discoveries and investigations'
        },
        {
          icon: BookOpen,
          label: 'Ask Jeeves',
          action: () => onNavigate('/maia/library'),
          description: 'Deep research across your wisdom library',
          badge: '✨ New'
        },
      ],
    },
    // ── ZONE 5: SOUL SIGNATURE (who you are) ───────────────────────
    {
      title: 'SOUL SIGNATURE',
      icon: '🧬',
      items: [
        {
          icon: User,
          label: 'Profile',
          action: () => onNavigate('/profile'),
          description: 'Your soul signature'
        },
        {
          icon: Sparkles,
          label: 'Cosmic Blueprint',
          action: () => onNavigate('/astrology'),
          description: 'Your birth chart & astrology'
        },
        {
          icon: Compass,
          label: 'Spiralogic Report',
          action: () => onNavigate('/dashboard/spiralogic-report'),
          description: 'Evolutionary report — all 12 facets'
        },
        {
          icon: Globe,
          label: 'Language',
          action: () => {}, // Handled by component itself
          description: 'MAIA speaks 30+ languages',
          isLanguageSelector: true
        },
        {
          icon: BookOpen,
          label: 'Vocabulary Guide',
          action: () => onAction?.('toggle-vocabulary-tooltips'),
          description: 'Highlight soul terms with definitions'
        },
      ],
    },
    // ── ZONE 6: TOOLS (practitioner / admin — power users) ─────────
    {
      title: 'TOOLS',
      icon: '⚕️',
      items: [
        {
          icon: LayoutGrid,
          label: 'Studio',
          action: () => onNavigate('/studio'),
          description: 'Pro suite: clients, sessions, caseload & calendar',
        },
        {
          icon: GraduationCap,
          label: 'Soullab Academy',
          action: () => onAction?.('open-academy'),
          description: 'Guided learning paths & wisdom domains'
        },
        {
          icon: BookOpen,
          label: 'User Guide',
          action: () => onNavigate('/maia/guide'),
          description: 'Complete guide to MAIA & Soullab'
        },
        {
          icon: Flame,
          label: 'Prompt Library',
          action: () => onNavigate('/labtools/prompts'),
          description: 'Full library: Seeker to Alchemist'
        },
        {
          icon: Cpu,
          label: 'Lab Tools',
          action: () => onNavigate('/labtools'),
          description: 'Consciousness computing & research lab'
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            className="fixed bottom-0 left-0 right-0 z-[100] max-h-[85vh] overflow-y-auto"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-t-3xl shadow-2xl border-t border-[#D4B896]/20">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-[#D4B896]/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4B896]/10">
                <div>
                  <h2 className="text-xl font-light text-[#D4B896] tracking-wide">
                    Lab Tools
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Your research workspace
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5 text-[#D4B896]/60" />
                </button>
              </div>

              {/* Menu Sections */}
              <div className="px-6 py-6 space-y-8">
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
                        // Special handling for language selector
                        if ((item as any).isLanguageSelector) {
                          return (
                            <div key={item.label}>
                              <LanguageSelector compact showFlag />
                            </div>
                          );
                        }

                        const Icon = item.icon;
                        const isComingSoon = item.badge === 'Coming Soon';
                        const hasDoubleClick = !!(item as any).doubleClickAction;
                        return (
                          <motion.button
                            key={item.label}
                            onClick={() => {
                              if (!isComingSoon) {
                                console.log('[SacredLabDrawer] Clicked:', item.label, 'onAction defined:', !!onAction);
                                item.action();
                                if (!item.label.includes('Toggle') && !item.label.includes('Upload')) {
                                  onClose();
                                }
                              }
                            }}
                            onDoubleClick={(e) => {
                              if (hasDoubleClick && !isComingSoon) {
                                e.preventDefault();
                                e.stopPropagation();
                                (item as any).doubleClickAction();
                                onClose();
                              }
                            }}
                            disabled={isComingSoon}
                            className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all group ${
                              isComingSoon
                                ? 'bg-white/5 border border-white/10 opacity-60 cursor-not-allowed'
                                : item.isActive
                                ? 'bg-red-500/20 border border-red-400/30'
                                : 'bg-white/5 hover:bg-[#D4B896]/10 border border-transparent hover:border-[#D4B896]/20'
                            }`}
                            whileHover={!isComingSoon ? { scale: 1.02 } : {}}
                            whileTap={!isComingSoon ? { scale: 0.98 } : {}}
                          >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                              item.isActive
                                ? 'bg-red-500/20'
                                : 'bg-[#D4B896]/10 group-hover:bg-[#D4B896]/20'
                            } transition-all`}>
                              <Icon className={`w-5 h-5 ${
                                item.isActive ? 'text-red-400' : 'text-[#D4B896]'
                              }`} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className={`flex items-center gap-2 text-sm font-medium ${
                                item.isActive ? 'text-red-300' : 'text-white/90'
                              }`}>
                                {item.label}
                                {item.badge && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/60 border border-white/20">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-white/50 mt-0.5">
                                {item.description}
                              </div>
                            </div>
                            {!isComingSoon && (
                              <div className={`flex-shrink-0 text-[#D4B896]/40 group-hover:text-[#D4B896]/80 transition-all ${
                                item.isActive ? 'animate-pulse' : ''
                              }`}>
                                →
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {/* Spacer for safe area */}
                <div className="h-8" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SacredLabDrawer;