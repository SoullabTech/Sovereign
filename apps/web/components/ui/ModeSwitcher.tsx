/**
 * ModeSwitcher - Elegant Voice/Chat mode toggle
 * Responsive design: small buttons top-left (desktop) and horizontal pills (mobile)
 * Updated: Fixed positioning to be compact, not full-height sidebar
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare } from 'lucide-react';

interface ModeSwitcherProps {
  mode: 'voice' | 'chat';
  onModeChange: (mode: 'voice' | 'chat') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  return (
    <>
      {/* Desktop Version - Small buttons at top left */}
      <div className="hidden md:block fixed left-4 top-4 z-40">
        <div className="flex gap-2">
          {/* Voice Button */}
          <motion.button
            onClick={() => onModeChange('voice')}
            className="relative px-3 py-2 rounded-lg transition-all backdrop-blur-sm"
            style={{
              background: mode === 'voice'
                ? 'linear-gradient(135deg, rgba(212,184,150,0.3), rgba(212,184,150,0.2))'
                : 'rgba(0,0,0,0.2)',
              border: mode === 'voice' ? '1px solid rgba(212,184,150,0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Mic size={14} style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.7)' }} />
              <span
                className="text-xs font-light tracking-wide"
                style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.7)' }}
              >
                Voice
              </span>
            </div>
          </motion.button>

          {/* Chat Button */}
          <motion.button
            onClick={() => onModeChange('chat')}
            className="relative px-3 py-2 rounded-lg transition-all backdrop-blur-sm"
            style={{
              background: mode === 'chat'
                ? 'linear-gradient(135deg, rgba(71,85,105,0.3), rgba(71,85,105,0.2))'
                : 'rgba(0,0,0,0.2)',
              border: mode === 'chat' ? '1px solid rgba(71,85,105,0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={14} style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.7)' }} />
              <span
                className="text-xs font-light tracking-wide"
                style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.7)' }}
              >
                Chat
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Version - Compact pills at top left */}
      <div className="md:hidden fixed left-4 z-40" style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 0.75rem)' }}>
        <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          {/* Voice Button */}
          <motion.button
            onClick={() => onModeChange('voice')}
            className="relative px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
            style={{
              background: mode === 'voice'
                ? 'linear-gradient(135deg, rgba(212,184,150,0.3), rgba(212,184,150,0.2))'
                : 'transparent',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic size={12} style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.5)' }} />
            <span
              className="text-[10px] font-light"
              style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.5)' }}
            >
              Voice
            </span>
          </motion.button>

          {/* Chat Button */}
          <motion.button
            onClick={() => onModeChange('chat')}
            className="relative px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
            style={{
              background: mode === 'chat'
                ? 'linear-gradient(135deg, rgba(71,85,105,0.3), rgba(71,85,105,0.2))'
                : 'transparent',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={12} style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.5)' }} />
            <span
              className="text-[10px] font-light"
              style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.5)' }}
            >
              Chat
            </span>
          </motion.button>
        </div>
      </div>
    </>
  );
};