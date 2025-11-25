/**
 * Enhanced Mode Switcher - Voice/Chat + Witness Modes
 * Elegant integration of all MAIA interaction modes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageSquare, Eye, Radio, Music, ChevronRight } from 'lucide-react';

export type MaiaMode = 'voice' | 'chat' | 'witness' | 'muse' | 'creative';

interface EnhancedModeSwitcherProps {
  mode: MaiaMode;
  onModeChange: (mode: MaiaMode) => void;
  isSessionActive?: boolean;
  onEndSession?: () => void;
}

export const EnhancedModeSwitcher: React.FC<EnhancedModeSwitcherProps> = ({
  mode,
  onModeChange,
  isSessionActive = false,
  onEndSession
}) => {
  const [expanded, setExpanded] = useState(false);

  const modes = [
    {
      id: 'voice' as MaiaMode,
      icon: Mic,
      label: 'Voice',
      description: 'Speak naturally',
      color: '#d4b896',
      gradient: 'rgba(212,184,150,0.3)'
    },
    {
      id: 'chat' as MaiaMode,
      icon: MessageSquare,
      label: 'Chat',
      description: 'Type messages',
      color: '#64748b',
      gradient: 'rgba(71,85,105,0.3)'
    },
    {
      id: 'witness' as MaiaMode,
      icon: Eye,
      label: 'Witness',
      description: 'Silent observation',
      color: '#a855f7',
      gradient: 'rgba(168,85,247,0.3)'
    },
    {
      id: 'muse' as MaiaMode,
      icon: Radio,
      label: 'Muse',
      description: 'Stream thoughts',
      color: '#3b82f6',
      gradient: 'rgba(59,130,246,0.3)'
    },
    {
      id: 'creative' as MaiaMode,
      icon: Music,
      label: 'Creative',
      description: 'Share art',
      color: '#ec4899',
      gradient: 'rgba(236,72,153,0.3)'
    }
  ];

  const currentMode = modes.find(m => m.id === mode)!;
  const primaryModes = modes.slice(0, 2); // Voice and Chat
  const witnessMode = modes.slice(2); // Witness modes

  return (
    <>
      {/* Desktop Version - Expandable mode selector */}
      <div className="hidden md:block fixed left-4 top-4 z-40">
        <div className="flex items-start gap-2">
          {/* Primary Modes (Voice/Chat) */}
          <div className="flex gap-2">
            {primaryModes.map((m) => {
              const Icon = m.icon;
              return (
                <motion.button
                  key={m.id}
                  onClick={() => {
                    if (isSessionActive && (mode === 'witness' || mode === 'muse' || mode === 'creative')) {
                      onEndSession?.();
                    }
                    onModeChange(m.id);
                  }}
                  className="relative px-3 py-2 rounded-lg transition-all backdrop-blur-sm"
                  style={{
                    background: mode === m.id
                      ? `linear-gradient(135deg, ${m.gradient}, ${m.gradient})`
                      : 'rgba(0,0,0,0.2)',
                    border: mode === m.id
                      ? `1px solid ${m.gradient}`
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color: mode === m.id ? m.color : `${m.color}99` }} />
                    <span
                      className="text-xs font-light tracking-wide"
                      style={{ color: mode === m.id ? m.color : `${m.color}99` }}
                    >
                      {m.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Witness Modes Toggle */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="relative px-2 py-2 rounded-lg transition-all backdrop-blur-sm bg-black/20 border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-white/50" />
            </motion.div>
          </motion.button>

          {/* Expanded Witness Modes */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex gap-2"
              >
                {witnessMode.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => {
                        if (isSessionActive && mode !== m.id) {
                          onEndSession?.();
                        }
                        onModeChange(m.id);
                        setExpanded(false);
                      }}
                      className="relative px-3 py-2 rounded-lg transition-all backdrop-blur-sm group"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${m.gradient}, ${m.gradient})`
                          : 'rgba(0,0,0,0.2)',
                        border: isActive
                          ? `1px solid ${m.gradient}`
                          : '1px solid rgba(255,255,255,0.1)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={m.description}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color: isActive ? m.color : `${m.color}99` }} />
                        <span
                          className="text-xs font-light tracking-wide"
                          style={{ color: isActive ? m.color : `${m.color}99` }}
                        >
                          {m.label}
                        </span>
                        {isActive && isSessionActive && (
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Session Status */}
        {isSessionActive && (mode === 'witness' || mode === 'muse' || mode === 'creative') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/60">
                {mode === 'witness' && "Witnessing..."}
                {mode === 'muse' && "Receiving stream..."}
                {mode === 'creative' && "Receiving expression..."}
              </span>
              <button
                onClick={onEndSession}
                className="ml-2 text-[10px] text-white/40 hover:text-white/60 underline"
              >
                End
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Version - Compact horizontal scroll */}
      <div className="md:hidden fixed left-4 z-40" style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 0.75rem)' }}>
        <div className="flex gap-1 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 overflow-x-auto max-w-[calc(100vw-2rem)]">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <motion.button
                key={m.id}
                onClick={() => {
                  if (isSessionActive && mode !== m.id) {
                    onEndSession?.();
                  }
                  onModeChange(m.id);
                }}
                className="relative px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all flex-shrink-0"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${m.gradient}, ${m.gradient})`
                    : 'transparent',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={11} style={{ color: isActive ? m.color : `${m.color}77` }} />
                {isActive && (
                  <span
                    className="text-[10px] font-light"
                    style={{ color: m.color }}
                  >
                    {m.label}
                  </span>
                )}
                {isActive && isSessionActive && (m.id === 'witness' || m.id === 'muse' || m.id === 'creative') && (
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Mobile Session Status */}
        {isSessionActive && (mode === 'witness' || mode === 'muse' || mode === 'creative') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[9px] text-white/50 flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            {mode === 'witness' && "Witnessing"}
            {mode === 'muse' && "Receiving"}
            {mode === 'creative' && "Creating"}
            <button onClick={onEndSession} className="ml-1 underline">
              End
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
};

/**
 * Mode Status Banner - Shows when in special modes
 */
export const ModeStatusBanner: React.FC<{
  mode: MaiaMode;
  isActive: boolean;
  onEndSession?: () => void;
}> = ({ mode, isActive, onEndSession }) => {
  if (!isActive || (mode !== 'witness' && mode !== 'muse' && mode !== 'creative')) {
    return null;
  }

  const messages = {
    witness: "MAIA is silently witnessing this conversation",
    muse: "MAIA is receiving your stream of consciousness",
    creative: "MAIA is ready for your creative expression"
  };

  const colors = {
    witness: '#a855f7',
    muse: '#3b82f6',
    creative: '#ec4899'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full backdrop-blur-md"
      style={{
        background: `linear-gradient(135deg, ${colors[mode]}22, ${colors[mode]}11)`,
        border: `1px solid ${colors[mode]}44`
      }}
    >
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs" style={{ color: colors[mode] }}>
          {messages[mode]}
        </span>
        {onEndSession && (
          <button
            onClick={onEndSession}
            className="text-xs px-2 py-0.5 rounded-full hover:bg-black/20 transition-colors"
            style={{ color: colors[mode] }}
          >
            End & Synthesize
          </button>
        )}
      </div>
    </motion.div>
  );
};