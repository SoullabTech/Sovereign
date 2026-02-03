"use client";

/**
 * PRACTITIONER PRO GATE
 *
 * Access control for Stellium Pro features
 * Checks practitioner tier and shows upgrade path if needed
 *
 * Design Philosophy:
 * - Support thresholds, not "readiness"
 * - No shame, no pressure - just clear communication
 * - "Would it help to see patterns across your work?"
 *
 * For MVP: All practitioners can access Stellium Pro
 * Future: May gate behind specific tiers/features
 */

import React from 'react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { motion } from 'framer-motion';
import { Compass, Loader2 } from 'lucide-react';

interface PractitionerProGateProps {
  children: React.ReactNode;
  requiredTier?: 'free' | 'pro' | 'enterprise';
}

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

export function PractitionerProGate({
  children,
  requiredTier = 'free', // MVP: free tier gets access
}: PractitionerProGateProps) {
  const { practitioner, isLoading, error, isAuthenticated } = usePractitionerAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8" style={{ color: colors.celestialBlue }} />
        </motion.div>
      </div>
    );
  }

  // Auth error
  if (error || !isAuthenticated || !practitioner) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          backgroundColor: `${colors.nebula}50`,
          border: `1px solid ${colors.stardust}`,
        }}
      >
        <Compass className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
        <h2
          className="text-lg font-medium mb-2"
          style={{ color: colors.starlight }}
        >
          Sign in to access Stellium Pro
        </h2>
        <p className="text-sm mb-4" style={{ color: colors.muted }}>
          Your session cockpit for chart work and client care.
        </p>
        <a
          href="/signin"
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
        >
          Sign In
        </a>
      </div>
    );
  }

  // TODO: Future tier checking
  // For now, all authenticated practitioners get access
  // const practitionerTier = practitioner.tier || 'free';
  // if (tierOrder[practitionerTier] < tierOrder[requiredTier]) {
  //   return <UpgradePrompt currentTier={practitionerTier} requiredTier={requiredTier} />;
  // }

  return <>{children}</>;
}

/**
 * Future: Soft upgrade prompt component
 * Uses "support threshold" language, not "you need to upgrade"
 */
export function UpgradePrompt({
  currentTier,
  requiredTier,
}: {
  currentTier: string;
  requiredTier: string;
}) {
  return (
    <div
      className="rounded-xl p-8 text-center max-w-md mx-auto"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${colors.celestialBlue}30`,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          background: `linear-gradient(135deg, ${colors.celestialBlue}20 0%, ${colors.violet}20 100%)`,
        }}
      >
        <Compass className="w-8 h-8" style={{ color: colors.celestialBlue }} />
      </motion.div>

      <h2
        className="text-lg font-display mb-2"
        style={{ color: colors.starlight }}
      >
        Stellium Pro
      </h2>

      {/* Supportive framing, not pressure */}
      <p className="text-sm mb-4" style={{ color: colors.muted }}>
        This feature helps you see patterns across your sessions and clients.
        It becomes available as your practice grows.
      </p>

      <p className="text-xs mb-6" style={{ color: colors.dim }}>
        You're building something real. These tools will be here when you're ready.
      </p>

      <button
        className="px-4 py-2 rounded-lg text-sm transition-colors"
        style={{
          backgroundColor: `${colors.celestialBlue}20`,
          color: colors.celestialBlue,
          border: `1px solid ${colors.celestialBlue}40`,
        }}
      >
        Learn More
      </button>
    </div>
  );
}

export default PractitionerProGate;
