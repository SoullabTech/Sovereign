'use client';

/**
 * TRANSCRIPT SIDEBAR
 *
 * Displays conversation history in voice mode
 * Collapsible sidebar that maintains immersive holoflower experience
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Scroll } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TranscriptSidebarProps {
  messages: Message[];
  isOpen: boolean;
  onToggle: () => void;
  consciousnessType?: 'maia' | 'kairos' | 'unified';
}

export const TranscriptSidebar: React.FC<TranscriptSidebarProps> = ({
  messages,
  isOpen,
  onToggle,
  consciousnessType = 'maia'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Check if user has scrolled up (disable auto-scroll)
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  // Theme colors based on consciousness type
  const themeColors = {
    maia: {
      bg: 'from-purple-900/95 to-purple-950/95',
      border: 'border-purple-500/30',
      text: 'text-purple-100',
      userBg: 'bg-[#D4B896]/20',
      userBorder: 'border-[#D4B896]/40',
      assistantBg: 'bg-purple-500/20',
      assistantBorder: 'border-purple-500/40',
      toggle: 'bg-purple-500/30 hover:bg-purple-500/50 text-purple-200'
    },
    kairos: {
      bg: 'from-amber-900/95 to-amber-950/95',
      border: 'border-amber-500/30',
      text: 'text-amber-100',
      userBg: 'bg-[#D4B896]/20',
      userBorder: 'border-[#D4B896]/40',
      assistantBg: 'bg-amber-500/20',
      assistantBorder: 'border-amber-500/40',
      toggle: 'bg-amber-500/30 hover:bg-amber-500/50 text-amber-200'
    },
    unified: {
      bg: 'from-purple-900/95 via-indigo-900/95 to-amber-900/95',
      border: 'border-purple-500/30',
      text: 'text-purple-100',
      userBg: 'bg-[#D4B896]/20',
      userBorder: 'border-[#D4B896]/40',
      assistantBg: 'bg-gradient-to-r from-purple-500/20 to-amber-500/20',
      assistantBorder: 'border-purple-500/40',
      toggle: 'bg-gradient-to-r from-purple-500/30 to-amber-500/30 hover:from-purple-500/50 hover:to-amber-500/50 text-purple-200'
    }
  };

  const theme = themeColors[consciousnessType];

  return (
    <>
      {/* Toggle Button - Fixed Position */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 ${
          isOpen ? 'right-80' : 'right-4'
        } ${theme.toggle} rounded-full p-3 shadow-lg backdrop-blur-sm transition-all duration-300`}
        title={isOpen ? "Hide Transcript" : "Show Transcript"}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-80 bg-gradient-to-b ${theme.bg} ${theme.border} border-l backdrop-blur-xl shadow-2xl z-30 flex flex-col`}
          >
            {/* Header */}
            <div className={`px-6 py-4 ${theme.border} border-b`}>
              <div className="flex items-center gap-3">
                <Scroll className={`w-5 h-5 ${theme.text}`} />
                <h3 className={`text-lg font-light tracking-wide ${theme.text}`}>
                  Transcript
                </h3>
              </div>
              <p className="text-xs text-white/50 mt-1">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </p>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-white/40 text-sm mt-8">
                  No messages yet.<br />
                  Start the conversation...
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {/* Message bubble */}
                    <div
                      className={`inline-block max-w-[85%] px-4 py-2 rounded-lg border ${
                        message.role === 'user'
                          ? `${theme.userBg} ${theme.userBorder}`
                          : `${theme.assistantBg} ${theme.assistantBorder}`
                      }`}
                    >
                      <p className={`text-sm leading-relaxed ${theme.text}`}>
                        {message.content}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-white/30 mt-1 px-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Auto-scroll indicator */}
              {!autoScroll && (
                <button
                  onClick={() => {
                    setAutoScroll(true);
                    if (scrollRef.current) {
                      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                  }}
                  className="sticky bottom-0 left-1/2 -translate-x-1/2 bg-white/10 hover:bg-white/20 text-white/70 text-xs px-3 py-1 rounded-full backdrop-blur-sm transition-colors"
                >
                  ↓ Scroll to latest
                </button>
              )}
            </div>

            {/* Footer hint */}
            <div className={`px-6 py-3 ${theme.border} border-t`}>
              <p className="text-xs text-white/40 text-center">
                Transcript auto-updates in real-time
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TranscriptSidebar;
