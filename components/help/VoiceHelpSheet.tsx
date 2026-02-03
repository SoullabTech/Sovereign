'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, RefreshCw, Bluetooth, MessageCircle } from 'lucide-react';
import { VOICE_HELP_STEPS, VOICE_HELP_SUPPORT_TEMPLATE } from '@/lib/help/voiceHelpContent';

interface VoiceHelpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceHelpSheet({ isOpen, onClose }: VoiceHelpSheetProps) {
  const icons = [Settings, RefreshCw, Bluetooth];

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
                Voice Help
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 space-y-6">
              <p className="text-white/70 text-sm">
                If MAIA says "Listening…" but doesn't hear you:
              </p>

              {/* Steps */}
              {VOICE_HELP_STEPS.map((step, index) => {
                const Icon = icons[index];
                return (
                  <div
                    key={index}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">
                          {index + 1}) {step.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-2">
                          {step.description}
                        </p>
                        {'items' in step && step.items && (
                          <ul className="space-y-1 mb-2">
                            {step.items.map((item, i) => (
                              <li key={i} className="text-amber-400/80 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {step.note && (
                          <p className="text-white/50 text-xs italic">
                            {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Support Section */}
              <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20">
                    <MessageCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-2">
                      Still not working? Send support:
                    </h3>
                    <ul className="space-y-1">
                      {VOICE_HELP_SUPPORT_TEMPLATE.fields.map((field, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
