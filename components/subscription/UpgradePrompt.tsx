'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown, ChevronRight, Star } from 'lucide-react';
import { PremiumFeature, FEATURE_NAMES } from '@/lib/subscription/types';

interface UpgradePromptProps {
  feature: PremiumFeature;
  inline?: boolean;
  className?: string;
}

export function UpgradePrompt({ feature, inline = false, className = '' }: UpgradePromptProps) {
  const featureName = FEATURE_NAMES[feature];

  if (inline) {
    return (
      <div className={`bg-gradient-to-r from-amber-600/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-100 mb-1">
              Upgrade to access {featureName}
            </h3>
            <p className="text-xs text-amber-300/70">
              Unlock the full sacred workspace and consciousness tools
            </p>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-medium text-amber-300 transition-all">
            <Crown className="w-3 h-3" />
            Upgrade
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-amber-500/30 rounded-xl p-8 text-center ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg -rotate-3"></div>
        <div className="relative bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-amber-100 mb-2 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        Premium Feature
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </h3>

      <p className="text-lg text-amber-300 mb-2">
        {featureName} requires a subscription
      </p>

      <p className="text-amber-300/70 mb-6 max-w-md mx-auto">
        Unlock the complete MAIA experience with sacred tools, consciousness practices,
        and wisdom repositories designed for your transformation.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-300/80">
            <Star className="w-4 h-4 text-yellow-400" />
            Lab Tools & Sacred Workspace
          </div>
          <div className="flex items-center gap-2 text-amber-300/80">
            <Star className="w-4 h-4 text-yellow-400" />
            Community Commons Library
          </div>
          <div className="flex items-center gap-2 text-amber-300/80">
            <Star className="w-4 h-4 text-yellow-400" />
            Voice Synthesis & Brain Trust
          </div>
          <div className="flex items-center gap-2 text-amber-300/80">
            <Star className="w-4 h-4 text-yellow-400" />
            Elder Council & Wisdom Traditions
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-semibold rounded-lg transition-all flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Upgrade to Sacred Access
          </button>
          <button className="px-4 py-3 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all">
            Learn More
          </button>
        </div>

        <p className="text-xs text-amber-300/50">
          Your journey to consciousness expansion awaits
        </p>
      </div>
    </motion.div>
  );
}

interface SubscriberOnlyProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  inline?: boolean;
}

export function SubscriberOnly({ feature, children, fallback, inline = false }: SubscriberOnlyProps) {
  // For now, assume free tier - in production this would use useSubscription hook
  const hasAccess = false; // This will be replaced with actual subscription check

  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} inline={inline} />;
  }

  return <>{children}</>;
}