'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { X, Lock } from 'lucide-react';

type PasswordChangeSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName?: string;
};

/**
 * C0: legacy session-only password setup is disabled at the server.
 * This screen must not collect a password or imply success without fresh
 * account-owner verification. Preserve beta upgrade links and mobile layout.
 */
export default function PasswordChangeSheet({
  isOpen,
  onClose,
  memberName = 'Friend',
}: PasswordChangeSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-setup-heading"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-black border-t border-amber-500/30 rounded-t-2xl z-[9999] p-4 pb-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="max-w-md mx-auto">
              <div className="flex justify-end">
                <button
                  type="button"
                  aria-label="Close password setup"
                  onClick={onClose}
                  className="p-2 rounded-lg text-stone-300 hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-500/20">
                  <Lock className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              <h2 id="password-setup-heading" className="text-xl text-center font-medium text-[#D4B896] mb-3">
                Password setup is temporarily unavailable
              </h2>
              <p className="text-stone-200 leading-relaxed mb-3">
                Welcome back, {memberName}. This beta password-setup screen is paused while we strengthen account verification.
                No password has been changed.
              </p>
              <p className="text-stone-300 leading-relaxed mb-5">
                If you know your current password, you can change it in Account Settings.
                If you need to create your first password or have lost access, contact Soullab support for identity review.
                We will not send recovery links to an unverified replacement address.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/account/settings"
                  onClick={onClose}
                  className="block text-center w-full py-3 rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-200 font-medium hover:bg-amber-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  Open Account Settings
                </Link>
                <a
                  href="mailto:support@soullab.life"
                  className="block text-center text-stone-200 underline underline-offset-4 py-2"
                >
                  Contact Soullab support
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
