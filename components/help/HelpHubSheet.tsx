'use client';

/**
 * HelpHubSheet — Member orientation surface
 *
 * Help is a member surface, not an admin/QA surface. It exists to orient
 * gently, not to recruit the member into platform maintenance. Diagnostic
 * tooling (TestFlight rituals, voice-loop pipeline tips, build/issue
 * indicators) belongs to admin/monitor surfaces and is summoned explicitly
 * — never ambient here.
 *
 * The decision test for any future Help entry: does this help the member
 * orient and continue, or does it teach them the system may be unstable?
 * Only the first belongs.
 *
 * See: project_surface_typology.md, feedback_doctrine_propagation_depth.md
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, HelpCircle, Mic, BookOpen } from 'lucide-react';

type HelpHubSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceHelp: () => void;
};

export default function HelpHubSheet({
  isOpen,
  onClose,
  onOpenVoiceHelp,
}: HelpHubSheetProps) {
  const router = useRouter();

  const handleOpenGuide = () => {
    onClose();
    router.push('/maia/guide');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="mx-3 mb-3 rounded-3xl border border-amber-500/20 bg-[#0B0B0F]/95 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                    <HelpCircle className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-50">
                      Help
                    </div>
                    <div className="text-xs text-amber-100/70">
                      Pick what you need right now
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                  aria-label="Close help"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Buttons */}
              <div className="px-5 pb-5">
                <div className="grid grid-cols-1 gap-3">
                  {/* User Guide - Primary CTA */}
                  <button
                    onClick={handleOpenGuide}
                    className="group flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/20 px-4 py-4 text-left hover:bg-amber-500/25"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
                        <BookOpen className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-amber-50">
                          User Guide
                        </div>
                        <div className="text-xs text-amber-100/70">
                          Complete guide to MAIA, LabTools, Commons & Settings
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-amber-200/70 group-hover:text-amber-200">
                      Open →
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      requestAnimationFrame(() => onOpenVoiceHelp());
                    }}
                    className="group flex w-full items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-left hover:bg-amber-500/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-black/30">
                        <Mic className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-amber-50">
                          Voice Help
                        </div>
                        <div className="text-xs text-amber-100/70">
                          Trouble with voice? Quick steps to reconnect.
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-amber-200/70 group-hover:text-amber-200">
                      Open →
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
