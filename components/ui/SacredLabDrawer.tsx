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
  Cpu
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
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
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
}) => {
  const menuSections = [
    {
      title: 'WISDOM COUNCIL',
      icon: '🌟',
      items: [
        {
          icon: Sparkles,
          label: 'Choose Your Guide',
          action: () => onNavigate('/elder-council'),
          description: '39 wisdom traditions as harmonic frequencies'
        },
        {
          icon: Brain,
          label: 'Current Teaching',
          action: () => onAction?.('show-current-elder'),
          description: 'See which wisdom guides you now'
        },
      ],
    },
    {
      title: 'SOUL GUIDANCE',
      icon: '📿',
      items: [
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
      ],
    },
    {
      title: 'KNOWLEDGE BASE',
      icon: '📚',
      items: [
        {
          icon: Library,
          label: 'Personal Library',
          action: () => onNavigate('/library'),
          description: 'Your curated knowledge collection'
        },
        {
          icon: BookOpen,
          label: 'Soul Journal',
          action: () => onNavigate('/journal'),
          description: 'Capture your transformative moments'
        },
        {
          icon: FileText,
          label: 'Research Notes',
          action: () => onNavigate('/lab-notes'),
          description: 'Discoveries and investigations'
        },
      ],
    },
    {
      title: 'CONSCIOUSNESS TOOLS',
      icon: '🧠',
      items: [
        {
          icon: Globe,
          label: 'Language',
          action: () => {}, // Handled by component itself
          description: 'MAIA speaks 30+ languages',
          isLanguageSelector: true
        },
        {
          icon: Cpu,
          label: 'Lab Tools',
          action: () => onNavigate('/labtools'),
          description: 'Complete consciousness computing & research lab interface'
        },
        {
          icon: Brain,
          label: 'Pilot-Drone Interface',
          action: () => onNavigate('/labtools#pilot-drone'),
          description: 'Faggin\'s quantum consciousness field visualization - live demo'
        },
        {
          icon: Zap,
          label: 'AIN Evolution Demo',
          action: () => window.open('/ain-demo', '_blank'),
          description: 'Nested observer windows & recursive consciousness evolution'
        },
        {
          icon: Brain,
          label: 'Guardian Console',
          action: () => onNavigate('/GuardianConsole'),
          description: 'Multi-model consciousness weaver'
        },
        {
          icon: Zap,
          label: 'Claude Code',
          action: () => onNavigate('/consciousness/claude-code'),
          description: 'Co-creator & consciousness explorer'
        },
        {
          icon: Brain,
          label: 'Symbolic Consciousness',
          action: () => onNavigate('/maia/symbolic'),
          description: 'LISP-inspired meta-circular consciousness computation'
        },
      ],
    },
    {
      title: 'DOCUMENTATION',
      icon: '📊',
      items: [
        {
          icon: Radio,
          label: isFieldRecording ? 'Stop Field Recording' : 'Field Protocol',
          action: () => onAction?.('field-protocol'),
          description: 'Document consciousness explorations',
          isActive: isFieldRecording,
        },
        {
          icon: isScribing ? MicOff : Mic,
          label: isScribing ? 'Stop Scribe & Download' : 'Start Scribe Mode',
          action: () => onAction?.('scribe-mode'),
          description: isScribing
            ? 'Complete session and download transcript'
            : 'Record client session passively with MAIA consultation',
          isActive: isScribing,
        },
        ...(hasScribeSession && !isScribing ? [{
          icon: MessageSquare,
          label: 'Review Session with MAIA',
          action: () => onAction?.('review-with-maia'),
          description: 'Get MAIA supervision on completed session'
        }] : []),
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
          description: 'Save this conversation as markdown'
        },
        {
          icon: showVoiceText ? Eye : EyeOff,
          label: showVoiceText ? 'Hide Transcript' : 'Show Transcript',
          action: () => onAction?.('toggle-text'),
          description: 'Toggle voice transcript display'
        },
      ],
    },
    {
      title: 'WISDOM PATTERNS',
      icon: '🌀',
      items: [
        {
          icon: Compass,
          label: 'Archetypal Journey',
          action: () => onNavigate('/journey'),
          description: 'Your cosmic spiral & elemental blueprint'
        },
        {
          icon: BookOpen,
          label: 'Conversation Threads',
          action: () => onNavigate('/maia?panel=journey'),
          description: 'Voice settings, patterns & trajectory'
        },
        {
          icon: Sparkles,
          label: 'Weaving Visualization',
          action: () => onNavigate('/maia?panel=journey'),
          description: 'Watch your wisdom threads unfold'
        },
      ],
    },
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
          action: () => onNavigate('/birth-chart'),
          description: 'Your birth chart & astrology'
        },
        {
          icon: Heart,
          label: 'Favorites',
          action: () => onNavigate('/favorites'),
          description: 'Cherished moments & insights'
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
                        return (
                          <motion.button
                            key={item.label}
                            onClick={() => {
                              if (!isComingSoon) {
                                item.action();
                                if (!item.label.includes('Toggle') && !item.label.includes('Upload')) {
                                  onClose();
                                }
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