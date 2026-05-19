'use client';

/**
 * AccountDropdown — Identity + control surface
 *
 * Account = where the member controls presence, privacy, settings, feedback,
 * and exit. Contribution surfaces (Sustaining Circle, Seva) live on /patrons,
 * not here. An identity-control tap should never open with a payment prompt.
 */

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, MessageCircle } from 'lucide-react';

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
