'use client';

/**
 * AccountDropdown — Extracted from the inline account bottom sheet in page.tsx
 *
 * Simplified for the spatial shell: navigation items that were duplicated
 * across drawer + bottom sheet are now in the left rail. This dropdown
 * contains only: settings, feedback, sign out, and the sustaining circle.
 *
 * The old bottom sheet had: Commons, Library, Wisdom Keepers, Labtools,
 * Studios, Settings, Feedback, Sustaining Circle, Seva, Sign Out.
 * Most of those are now in the left rail or will be in Pass C.
 */

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, MessageCircle, Flame, Users, Sparkles } from 'lucide-react';
import { useSubscription, membershipUtils } from '@/hooks/useSubscription';
import { SEVA_PATHWAYS } from '@/lib/subscription/types';
import type { SevaPathway } from '@/lib/subscription/types';
import { useState } from 'react';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void;
  onSignOut: () => void;
}

export function AccountDropdown({
  isOpen,
  onClose,
  onOpenFeedback,
  onSignOut,
}: AccountDropdownProps) {
  const router = useRouter();
  const [showSustainingSlider, setShowSustainingSlider] = useState(false);
  const [sustainingAmount, setSustainingAmount] = useState(25);
  const [showSevaOptions, setShowSevaOptions] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-black border-t border-amber-500/30 rounded-t-2xl z-[9999] p-4 pb-8 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mb-4" />

            <div className="space-y-2 max-w-md mx-auto">
              {/* Settings */}
              <button
                onClick={() => { onClose(); router.push('/account/settings'); }}
                className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
              >
                <Settings className="w-5 h-5" />
                <span className="text-base">Settings</span>
              </button>

              {/* Send Feedback */}
              <button
                onClick={() => { onClose(); requestAnimationFrame(() => onOpenFeedback()); }}
                className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-[#D4B896]/10 text-[#D4B896]"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-base">Send Feedback</span>
              </button>

              {/* Divider */}
              <div className="border-t border-[#D4B896]/20 my-2" />

              {/* Sustaining Circle */}
              <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#D4B896]/5 via-[#D4B896]/3 to-transparent border border-[#D4B896]/20">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-5 h-5 text-[#D4B896]" />
                  <span className="text-base text-[#D4B896] font-medium">Sustaining Circle</span>
                </div>
                <p className="text-[10px] text-stone-400 mb-3 italic">
                  Everyone has full access. Your contribution sustains the sacred work.
                </p>

                {membershipUtils.isBetaTester() && (
                  <div className="mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-[#D4B896]/10 border border-[#D4B896]/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-[#D4B896]" />
                    <span className="text-sm text-[#D4B896] font-medium">Pioneer Founding Member</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowSustainingSlider(!showSustainingSlider)}
                    className={`p-2 rounded-lg transition-all text-center ${
                      showSustainingSlider
                        ? 'bg-[#D4B896]/20 border border-[#D4B896]/40'
                        : 'bg-[#D4B896]/10 hover:bg-[#D4B896]/20 border border-[#D4B896]/30'
                    }`}
                  >
                    <Flame className="w-4 h-4 mx-auto mb-1 text-[#D4B896]" />
                    <p className="text-[10px] text-[#D4B896] font-medium">Sustaining Circle</p>
                    <p className="text-[9px] text-stone-400">Choose your level</p>
                  </button>

                  <button
                    onClick={() => setShowSevaOptions(!showSevaOptions)}
                    className={`p-2 rounded-lg transition-all text-center ${
                      showSevaOptions
                        ? 'bg-[#D4B896]/20 border border-[#D4B896]/40'
                        : 'bg-[#D4B896]/10 hover:bg-[#D4B896]/20 border border-[#D4B896]/30'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-[#D4B896]" />
                    <p className="text-[10px] text-[#D4B896] font-medium">Seva Exchange</p>
                    <p className="text-[9px] text-stone-400">Contribute service</p>
                  </button>
                </div>

                {/* Sustaining Slider */}
                {showSustainingSlider && (
                  <div className="mt-3 p-4 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-lg">
                    <p className="text-[10px] text-[#D4B896] mb-3 font-medium text-center">
                      Choose what feels right for you
                    </p>
                    <div className="text-center mb-4">
                      <p className="text-2xl font-light text-[#D4B896]">${sustainingAmount}<span className="text-sm text-stone-400">/mo</span></p>
                    </div>
                    <div className="mb-4">
                      <input
                        type="range"
                        min="5"
                        max="500"
                        step="5"
                        value={sustainingAmount}
                        onChange={(e) => setSustainingAmount(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full cursor-pointer accent-[#D4B896]
                          [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-stone-700/50
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4B896] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:-mt-1.5
                          [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-stone-700/50
                          [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-[#D4B896] [&::-moz-range-thumb]:border-0"
                        style={{ WebkitAppearance: 'none', appearance: 'none', background: 'transparent' }}
                      />
                      <div className="flex justify-between text-[9px] text-stone-500 mt-1">
                        <span>$5</span>
                        <span>$500+</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-stone-400 mb-3 space-y-1">
                      <p className="flex items-center gap-1"><span className="text-[#D4B896]">&#10003;</span> Monthly build letters</p>
                      {sustainingAmount >= 25 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">&#10003;</span> Early access + previews</p>}
                      {sustainingAmount >= 75 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">&#10003;</span> Patron Q&A circle</p>}
                      {sustainingAmount >= 250 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">&#10003;</span> Direct roadmap input</p>}
                      {sustainingAmount >= 500 && <p className="flex items-center gap-1"><span className="text-[#D4B896]">&#10003;</span> Founder channel access</p>}
                    </div>
                    <button
                      onClick={() => membershipUtils.joinSustainingCircle(sustainingAmount)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-[#D4B896] to-[#C4A886] hover:from-[#C4A886] hover:to-[#B49876] text-black text-sm font-medium transition-all"
                    >
                      Join Circle
                    </button>
                    <a href="/patrons" className="block text-center text-[9px] text-stone-500 hover:text-[#D4B896] mt-2 transition-colors">
                      View full details &rarr;
                    </a>
                  </div>
                )}

                {/* Seva Options */}
                {showSevaOptions && (
                  <div className="mt-3 p-3 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-lg">
                    <p className="text-[10px] text-[#D4B896] mb-2 font-medium">Choose your path of service:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.entries(SEVA_PATHWAYS) as [SevaPathway, typeof SEVA_PATHWAYS[SevaPathway]][]).map(([key, path]) => (
                        <button
                          key={key}
                          onClick={() => membershipUtils.joinSeva(key)}
                          className="p-1.5 rounded bg-[#D4B896]/10 hover:bg-[#D4B896]/20 text-left transition-all"
                        >
                          <p className="text-[9px] text-[#D4B896] font-medium">{path.name}</p>
                          <p className="text-[8px] text-stone-500">{path.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#D4B896]/20 my-2" />

              {/* Sign Out */}
              <button
                onClick={() => { onClose(); onSignOut(); }}
                className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl w-full transition-colors hover:bg-red-500/10 text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base">Sign Out</span>
              </button>
            </div>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="mt-4 w-full max-w-md mx-auto block py-3 rounded-xl bg-amber-500/10 text-amber-400 text-center font-medium hover:bg-amber-500/20 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
