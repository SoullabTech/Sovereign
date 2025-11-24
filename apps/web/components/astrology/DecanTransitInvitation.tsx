'use client';

/**
 * Decan Transit Invitation Component
 *
 * Beautiful, gentle invitations (not pushy notifications)
 * Living astrology that breathes with cosmic timing
 *
 * From Claude Code's Daily Musings to reality ✨
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Star, X } from 'lucide-react';
import { useState } from 'react';
import { type DecanTransitInvitation, formatInvitationForDisplay } from '@/lib/astrology/decanTransits';

interface Props {
  invitation: DecanTransitInvitation;
  onDismiss?: () => void;
  variant?: 'card' | 'toast' | 'banner';
}

export function DecanTransitInvitationCard({ invitation, onDismiss, variant = 'card' }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const display = formatInvitationForDisplay(invitation);

  // Color based on element
  const elementColors = {
    fire: {
      bg: 'from-orange-950/40 to-amber-950/40',
      border: 'border-orange-600/30',
      text: 'text-orange-200',
      glow: 'shadow-orange-600/20'
    },
    water: {
      bg: 'from-blue-950/40 to-cyan-950/40',
      border: 'border-blue-600/30',
      text: 'text-blue-200',
      glow: 'shadow-blue-600/20'
    },
    earth: {
      bg: 'from-amber-950/40 to-stone-950/40',
      border: 'border-amber-600/30',
      text: 'text-amber-200',
      glow: 'shadow-amber-600/20'
    },
    air: {
      bg: 'from-purple-950/40 to-blue-950/40',
      border: 'border-purple-600/30',
      text: 'text-purple-200',
      glow: 'shadow-purple-600/20'
    }
  };

  const colors = elementColors[invitation.element];
  const intensityStyles = {
    strong: 'shadow-lg',
    moderate: 'shadow-md',
    gentle: 'shadow-sm'
  };

  if (variant === 'toast') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-20 right-4 z-50 w-96 p-4 rounded-xl backdrop-blur-xl
                   bg-gradient-to-br ${colors.bg} border ${colors.border}
                   ${intensityStyles[invitation.intensity]} ${colors.glow}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className={`w-5 h-5 ${colors.text}`} />
            </motion.div>
            <span className="text-xs text-stone-400 uppercase tracking-wider">Cosmic Invitation</span>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className={`text-lg font-semibold ${colors.text} mb-1`}>
          {display.title}
        </h3>

        <p className="text-sm text-stone-300 mb-3">
          {display.subtitle}
        </p>

        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Calendar className="w-3 h-3" />
          <span>{display.footer}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-xl backdrop-blur-xl
                 bg-gradient-to-br ${colors.bg} border ${colors.border}
                 ${intensityStyles[invitation.intensity]} ${colors.glow}
                 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Cosmic shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            `radial-gradient(circle at 0% 0%, ${invitation.color}40 0%, transparent 50%)`,
            `radial-gradient(circle at 100% 100%, ${invitation.color}40 0%, transparent 50%)`,
            `radial-gradient(circle at 0% 0%, ${invitation.color}40 0%, transparent 50%)`,
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 12, -12, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Star className={`w-6 h-6 ${colors.text}`} style={{ fill: invitation.color, stroke: invitation.color }} />
            </motion.div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
                {invitation.intensity === 'strong' && '✨ Strong Activation'}
                {invitation.intensity === 'moderate' && '⭐ Clear Resonance'}
                {invitation.intensity === 'gentle' && '🌟 Gentle Invitation'}
              </p>
              <h3 className={`text-xl font-semibold ${colors.text}`}>
                {display.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-stone-200 mb-3">
          {display.subtitle}
        </p>

        {/* Body - expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-stone-300 leading-relaxed mb-4">
                {display.body}
              </p>

              {/* Spiralogic integration */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-xs text-stone-500 mb-1">Alchemical Stage</p>
                  <p className="text-sm text-stone-200">{invitation.alchemicalStage}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-xs text-stone-500 mb-1">Consciousness Layer</p>
                  <p className="text-sm text-stone-200">{invitation.consciousnessLayer}</p>
                </div>
              </div>

              {/* Tarot card if available */}
              {display.tarotCard && (
                <div className="p-3 rounded-lg bg-black/20 border border-white/5 mb-4">
                  <p className="text-xs text-stone-500 mb-1">Tarot Correspondence</p>
                  <p className="text-sm text-stone-200">{display.tarotCard}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-stone-500" />
            <span className="text-xs text-stone-400">{display.footer}</span>
          </div>
          <motion.span
            className="text-xs text-stone-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isExpanded ? 'Click to collapse' : 'Click for details'}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Today's Invitations Dashboard
 * Shows all active decan transit invitations
 */
interface DashboardProps {
  invitations: DecanTransitInvitation[];
}

export function TodaysInvitationsDashboard({ invitations }: DashboardProps) {
  if (invitations.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-stone-900/60 to-amber-950/40
                     border border-amber-600/20 text-center">
        <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto mb-3" />
        <p className="text-sm text-stone-400">
          No active decan transits today. The cosmos is in gentle motion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
        </motion.div>
        <h2 className="text-xl font-semibold text-amber-200">
          Today's Cosmic Invitations
        </h2>
      </div>

      <p className="text-sm text-stone-300 mb-6">
        Not predictions, but invitations. The cosmos whispers opportunities for alchemy.
      </p>

      <div className="space-y-4">
        {invitations.map((invitation, i) => (
          <motion.div
            key={`${invitation.transitingPlanet}-${invitation.natalPlanet}-${i}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <DecanTransitInvitationCard invitation={invitation} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
