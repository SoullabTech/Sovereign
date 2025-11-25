'use client';

/**
 * Community Link Component
 *
 * Floating navigation element to access Community Hub from any page
 * Unobtrusive but discoverable - sacred space invitation
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommunityLink() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      className="fixed bottom-24 right-6 z-[60]"
    >
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsExpanded(true)}
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          >
            <Users className="w-6 h-6 text-white" />

            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />

            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Community Hub
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-slate-800 border border-purple-500/30 rounded-2xl p-4 shadow-2xl min-w-[280px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Community Hub</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Links */}
            <div className="space-y-2 mb-4">
              <Link
                href="/community"
                className="block px-3 py-2 text-purple-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-all text-sm"
              >
                🌀 Hub Home
              </Link>
              <Link
                href="/community/field-notes"
                className="block px-3 py-2 text-purple-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-all text-sm"
              >
                📖 Field Notes
              </Link>
              <Link
                href="/community/experiment"
                className="block px-3 py-2 text-purple-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-all text-sm"
              >
                📊 21-Day Tracker
              </Link>
              <Link
                href="/community/resources"
                className="block px-3 py-2 text-purple-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-all text-sm"
              >
                📚 Resources
              </Link>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => {
                setIsDismissed(true);
                localStorage.setItem('community-link-dismissed', 'true');
              }}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors w-full text-center"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
