'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PartnerConfig } from '../../lib/partner/partner-config';

interface PartnerWelcomeHeaderProps {
  partnerConfig: PartnerConfig;
  currentStep?: number;
  totalSteps?: number;
}

export default function PartnerWelcomeHeader({
  partnerConfig,
  currentStep = 1,
  totalSteps = 5
}: PartnerWelcomeHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Partner Logo and Name */}
        <div className="flex items-center gap-4">
          {partnerConfig.theme.logoUrl && (
            <img
              src={partnerConfig.theme.logoUrl}
              alt={`${partnerConfig.name} logo`}
              className="h-8 w-auto"
              onError={(e) => {
                // Fallback to text if logo fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-sm font-medium partner-primary">
              {partnerConfig.name}
            </h1>
            <p className="text-xs partner-secondary opacity-80">
              Consciousness Computing Platform
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <span className="text-xs partner-secondary">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-32 h-1 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full partner-bg-accent rounded-full"
            />
          </div>
        </div>

        {/* Partner Mission (on larger screens) */}
        {partnerConfig.onboarding.partnerMission && (
          <div className="hidden lg:block max-w-md">
            <p className="text-xs partner-secondary opacity-70 text-right">
              {partnerConfig.onboarding.partnerMission}
            </p>
          </div>
        )}
      </div>

      {/* Subtle bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-partner-accent/30 to-transparent" />
    </motion.header>
  );
}