'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowUpCircle,
  Mic,
  LayoutGrid,
  Wrench,
  Bug,
  type LucideIcon,
} from 'lucide-react';
import { TESTFLIGHT_SACRED_CARDS } from '@/lib/help/testFlightContent';

interface TestFlightHelpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  ArrowUpCircle,
  Mic,
  LayoutGrid,
  Wrench,
  Bug,
};

export default function TestFlightHelpSheet({ isOpen, onClose }: TestFlightHelpSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto
                       bg-gradient-to-b from-[#1a1512] to-[#0d0a08]
                       border-t border-amber-500/20 rounded-t-3xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-amber-500/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-xl font-semibold text-amber-400">
                TestFlight Quick Test
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content - Five Sacred Cards */}
            <div className="px-6 pb-8 space-y-4">
              {TESTFLIGHT_SACRED_CARDS.map((card) => {
                const Icon = ICONS[card.icon] ?? ArrowUpCircle;

                return (
                  <div
                    key={card.key}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white/90 mb-2">
                          {card.title}
                        </div>

                        <div className="space-y-1">
                          {card.lines.map((line, i) => (
                            <div
                              key={i}
                              className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap"
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
