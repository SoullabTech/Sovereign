/**
 * Feature Gate Banner
 *
 * Inline banner shown when a user tries to access a gated feature.
 * Philosophy: Clear information, no shame.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGateBannerProps {
  feature: string;
  tier: 'supporter' | 'studio';
  message: string;
  onUpgrade: () => void;
  onDismiss: () => void;
  className?: string;
}

export const FeatureGateBanner: React.FC<FeatureGateBannerProps> = ({
  feature,
  tier,
  message,
  onUpgrade,
  onDismiss,
  className = '',
}) => {
  const tierName = tier === 'studio' ? 'Studio' : 'Supporter';
  const tierPrice = tier === 'studio' ? '$35/mo' : '$9/mo';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative bg-gradient-to-r from-maia-navy-900/90 to-maia-navy-950/90 backdrop-blur-xl rounded-xl border border-maia-spice-400/20 p-4 ${className}`}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/5 transition-all"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-maia-ink-40" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-maia-spice-400/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-maia-spice-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-maia-ink-80 mb-2">
            {message}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onUpgrade}
              size="sm"
              className="bg-maia-spice-500 hover:bg-maia-spice-600 text-white text-sm py-1.5 px-4 rounded-lg transition-all group"
            >
              Upgrade to {tierName}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>

            <span className="text-xs text-maia-ink-40">
              {tierPrice}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureGateBanner;
