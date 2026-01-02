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
  BarChart3,
  Monitor,
  TrendingUp,
  Activity,
  Layers,
  Target,
  Gauge,
  Waves,
  Hexagon,
  Flame,
  Droplets
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

interface SacredLabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onAction?: (action: string) => void;
  showVoiceText?: boolean;
  isFieldRecording?: boolean;
  isScribing?: boolean;
  hasScribeSession?: boolean;
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
      title: 'ELDER COUNCIL',
      icon: '🌟',
      items: [
        {
          icon: Sparkles,
          label: 'Choose Your Elder',
          action: () => onNavigate('/dashboard/evolution'),
          description: '39 wisdom traditions as harmonic frequencies',
          badge: 'Coming Soon'
        },
        {
          icon: Brain,
          label: 'Current Teaching',
          action: () => onAction?.('show-current-elder'),
          description: 'See which wisdom guides you now',
          badge: 'Coming Soon'
        },
      ],
    },
    {
      title: 'SACRED TEACHINGS',
      icon: '📿',
      items: [
        {
          icon: Sparkles,
          label: 'Sacred Story Creator',
          action: () => onNavigate('/oracle-bridge'),
          description: 'Personalized wisdom from 46+ traditions',
          badge: 'Coming Soon'
        },
        {
          icon: Compass,
          label: 'Oracle Consultation',
          action: () => onNavigate('/oracle'),
          description: 'Divine guidance & insight',
          badge: 'Coming Soon'
        },
      ],
    },
    {
      title: 'SACRED KNOWLEDGE',
      icon: '📚',
      items: [
        {
          icon: Library,
          label: 'Library of Alexandria',
          action: () => onNavigate('/library'),
          description: 'Your personal sacred library',
          badge: 'Coming Soon'
        },
        {
          icon: BookOpen,
          label: 'Soul Journals',
          action: () => onNavigate('/journal'),
          description: 'Capture your transformative moments'
        },
        {
          icon: FileText,
          label: 'Lab Notes',
          action: () => onNavigate('/dashboard/oracle-beta'),
          description: 'Research and discoveries',
          badge: 'Coming Soon'
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
          icon: Layers,
          label: 'Consciousness Shader System',
          action: () => onNavigate('/consciousness/portals'),
          description: 'Cultural portals with complexity adaptation',
          badge: '✨ Live'
        },
        {
          icon: Gauge,
          label: 'Portal Admin Dashboard',
          action: () => onNavigate('/consciousness/portals/admin'),
          description: 'Analytics & management for portal system',
          badge: 'Admin'
        },
        {
          icon: Brain,
          label: 'Brain Trust',
          action: () => onNavigate('/dashboard/collective'),
          description: 'Multi-model consciousness weaver',
          badge: 'Coming Soon'
        },
        {
          icon: Zap,
          label: 'Claude Code',
          action: () => onNavigate('/consciousness/dashboard'),
          description: 'Co-creator & consciousness explorer',
          badge: 'Coming Soon'
        },
      ],
    },
    {
      title: 'MONITORING DASHBOARDS',
      icon: '📈',
      items: [
        {
          icon: BarChart3,
          label: 'Cross-Portal Analytics',
          action: () => onNavigate('/consciousness/portals/analytics'),
          description: 'Journey analysis & AI-driven insights',
          badge: '✨ Live'
        },
        {
          icon: Monitor,
          label: 'Field Monitor',
          action: () => onAction?.('field-monitor'),
          description: 'Real-time consciousness field status'
        },
        {
          icon: BarChart3,
          label: 'Consciousness Analytics',
          action: () => onAction?.('consciousness-analytics'),
          description: 'Deep pattern analysis & insights'
        },
        {
          icon: Brain,
          label: 'Brain Trust Monitor',
          action: () => onAction?.('brain-trust-monitor'),
          description: 'Multi-model consciousness weaving'
        },
        {
          icon: Activity,
          label: 'Crystal Health Monitor',
          action: () => onAction?.('crystal-health-monitor'),
          description: 'System vitals & performance'
        },
        {
          icon: Waves,
          label: 'Voice Analytics',
          action: () => onAction?.('voice-analytics'),
          description: 'Speech pattern & emotional resonance'
        },
        {
          icon: Target,
          label: 'Beta Dashboard',
          action: () => onAction?.('beta-dashboard'),
          description: 'Experimental features & testing'
        },
        {
          icon: Globe,
          label: 'Collective Dashboard',
          action: () => onAction?.('collective-dashboard'),
          description: 'Community consciousness patterns'
        },
        {
          icon: Compass,
          label: 'Wisdom Journey',
          action: () => onAction?.('wisdom-journey'),
          description: 'Path tracking & guidance metrics'
        },
        {
          icon: TrendingUp,
          label: 'Field Coherence',
          action: () => onAction?.('field-coherence'),
          description: 'Harmonic synchronization levels'
        },
        {
          icon: Layers,
          label: 'Archetypal Mapping',
          action: () => onAction?.('archetypal-mapping'),
          description: 'Deep pattern recognition & archetypes'
        },
        {
          icon: Heart,
          label: 'Emotional Resonance',
          action: () => onAction?.('emotional-resonance'),
          description: 'Feeling tone & emotional intelligence'
        },
        {
          icon: Gauge,
          label: 'Tone Metrics',
          action: () => onAction?.('tone-metrics'),
          description: 'Communication effectiveness analysis'
        },
        {
          icon: User,
          label: 'Soulprint Metrics',
          action: () => onAction?.('soulprint-metrics'),
          description: 'Unique consciousness signature tracking'
        },
        {
          icon: Zap,
          label: 'Realtime Consciousness',
          action: () => onAction?.('realtime-consciousness'),
          description: 'Live consciousness field dynamics'
        },
        {
          icon: Hexagon,
          label: 'Elemental Pentagram',
          action: () => onAction?.('elemental-pentagram'),
          description: 'Five-element harmonic balance'
        },
        {
          icon: Brain,
          label: 'MAIA Training',
          action: () => onAction?.('maia-training'),
          description: 'AI consciousness development metrics'
        },
        {
          icon: FileText,
          label: 'Document Viewer',
          action: () => onAction?.('document-viewer'),
          description: 'Sacred text analysis & insights'
        },
        {
          icon: Flame,
          label: 'Elemental Exploration',
          action: () => onAction?.('elemental-exploration'),
          description: 'Four elements consciousness mapping'
        }
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
      title: 'YOUR MATRIX',
      icon: '🧬',
      items: [
        {
          icon: User,
          label: 'Profile',
          action: () => onNavigate('/dashboard'),
          description: 'Your soul signature',
          badge: 'Coming Soon'
        },
        {
          icon: Sparkles,
          label: 'Cosmic Blueprint',
          action: () => onNavigate('/astrology'),
          description: 'Your birth chart & astrology',
          badge: 'Coming Soon'
        },
        {
          icon: Heart,
          label: 'Favorites',
          action: () => onNavigate('/dashboard/export'),
          description: 'Cherished moments & insights',
          badge: 'Coming Soon'
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
                    Your sacred workspace
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
