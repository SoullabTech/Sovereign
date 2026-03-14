'use client';

/**
 * Studio on Mobile — Graceful interstitial
 *
 * Shown when a phone or tablet user navigates to a Studio route.
 * Frames Studio as a different surface, not a missing feature.
 * Gives clear next actions: return to MAIA, or open Studio on desktop.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Monitor, ArrowLeft, ExternalLink } from 'lucide-react';
import { WEB_STUDIO_BASE_URL } from '@/lib/mobile/mobileAllowlist';

export default function StudioOnMobilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full flex flex-col items-center gap-8 text-center"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center
                        bg-white/5 border border-white/10">
          <Monitor className="w-8 h-8 text-white/40" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-white text-xl font-light">Studio works best on desktop</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Studio is designed for deeper work — reviewing sessions, managing clients,
            and working through insights over time. It's built for a larger screen.
          </p>
          <p className="text-white/40 text-sm leading-relaxed">
            On your phone, MAIA is here for conversation, check-ins, and journaling.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/maia"
            className="flex items-center justify-center gap-2
                       w-full py-3.5 rounded-xl
                       bg-amber-500/20 border border-amber-500/30
                       text-amber-200 text-sm font-medium
                       active:bg-amber-500/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue with MAIA
          </Link>

          <a
            href={WEB_STUDIO_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2
                       w-full py-3.5 rounded-xl
                       bg-white/5 border border-white/10
                       text-white/50 text-sm
                       active:bg-white/10 transition-colors"
          >
            Open Studio on desktop
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Subtle reminder */}
        <p className="text-white/20 text-xs">
          Mobile is for relationship. Studio is for practice.
        </p>
      </motion.div>
    </div>
  );
}
