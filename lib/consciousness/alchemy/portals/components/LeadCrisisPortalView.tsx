// @ts-nocheck
/**
 * Lead Crisis Portal View with Complexity Tiers
 *
 * React component that renders lead_crisis state through portal-specific pixels
 * with adaptive complexity based on user development level
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LeadCrisisEngineState,
  ComplexityTier,
  getLeadCrisisPixelConfig
} from '../LeadCrisisPixels';
import { PopulationPortal } from '../PortalArchitecture';

export interface LeadCrisisPortalViewProps {
  engineState: LeadCrisisEngineState;
  portal: PopulationPortal;
  complexityTier: ComplexityTier;
  onPrimaryAction?: () => void;
  onShowAdvanced?: () => void;
  onTierChange?: (tier: ComplexityTier) => void; // For demo purposes
}

const ComplexityTierBadge: React.FC<{ tier: ComplexityTier; onChange?: (tier: ComplexityTier) => void }> = ({
  tier,
  onChange
}) => {
  const tierColors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#dc2626'
  };

  const tierEmojis = {
    beginner: '🌱',
    intermediate: '🔥',
    advanced: '💎'
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
      fontSize: '11px',
      opacity: 0.8
    }}>
      {onChange && (
        <select
          value={tier}
          onChange={(e) => onChange(e.target.value as ComplexityTier)}
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            background: 'white'
          }}
        >
          <option value="beginner">🌱 Beginner</option>
          <option value="intermediate">🔥 Intermediate</option>
          <option value="advanced">💎 Advanced</option>
        </select>
      )}
      {!onChange && (
        <span style={{
          background: tierColors[tier],
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          {tierEmojis[tier]} {tier}
        </span>
      )}
    </div>
  );
};

const SafetyIndicator: React.FC<{ level: string; urgency?: string }> = ({ level, urgency }) => {
  const levelColors = {
    low: '#22c55e',
    moderate: '#f59e0b',
    elevated: '#dc2626',
    critical: '#b91c1c'
  };

  const levelEmojis = {
    low: '✅',
    moderate: '⚠️',
    elevated: '🚨',
    critical: '🆘'
  };

  if (level === 'low') return null; // Don't show safety indicator for low levels

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: levelColors[level as keyof typeof levelColors],
        color: 'white',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {levelEmojis[level as keyof typeof levelEmojis]}
      {urgency || level}
    </motion.div>
  );
};

const MicroPracticeSection: React.FC<{
  label: string;
  steps: string[];
  portal: PopulationPortal;
  tier: ComplexityTier;
}> = ({ label, steps, portal, tier }) => {
  const portalColors = {
    shamanic: '#8B4513',
    therapeutic: '#4169E1',
    corporate: '#2F4F4F',
    religious: '#800080',
    recovery: '#228B22',
    academic: '#4B0082',
    creative: '#FF6347',
    parental: '#CD853F',
    elder: '#708090',
    youth: '#32CD32'
  };

  const complexity = {
    beginner: { fontSize: '14px', lineHeight: '1.6' },
    intermediate: { fontSize: '13px', lineHeight: '1.5' },
    advanced: { fontSize: '12px', lineHeight: '1.4' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: `${portalColors[portal]}11`,
        padding: '15px',
        borderRadius: '8px',
        border: `1px solid ${portalColors[portal]}33`,
        marginTop: '15px'
      }}
    >
      <div style={{
        fontWeight: 'bold',
        marginBottom: '10px',
        color: portalColors[portal],
        ...complexity[tier]
      }}>
        {label}
      </div>
      <ol style={{
        margin: 0,
        paddingLeft: '20px',
        ...complexity[tier]
      }}>
        {steps.map((step, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            style={{ marginBottom: '8px' }}
          >
            {step}
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
};

const AdvancedPanel: React.FC<{
  label: string;
  description: string;
  portal: PopulationPortal;
  onShow: () => void;
}> = ({ label, description, portal, onShow }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const portalColors = {
    shamanic: '#8B4513',
    therapeutic: '#4169E1',
    corporate: '#2F4F4F',
    religious: '#800080',
    recovery: '#228B22',
    academic: '#4B0082',
    creative: '#FF6347',
    parental: '#CD853F',
    elder: '#708090',
    youth: '#32CD32'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      style={{ marginTop: '20px' }}
    >
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          onShow();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: portalColors[portal],
          textDecoration: 'underline',
          cursor: 'pointer',
          fontSize: '12px',
          opacity: 0.8,
          padding: 0
        }}
      >
        {isExpanded ? '▾' : '▸'} {label}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: '8px',
              padding: '12px',
              background: `${portalColors[portal]}08`,
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#666',
              overflow: 'hidden'
            }}
          >
            {description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const LeadCrisisPortalView: React.FC<LeadCrisisPortalViewProps> = ({
  engineState,
  portal,
  complexityTier,
  onPrimaryAction,
  onShowAdvanced,
  onTierChange
}) => {
  if (engineState.state !== 'lead_crisis') {
    return null;
  }

  const { config, hidden } = getLeadCrisisPixelConfig(engineState, portal, complexityTier);

  if (!config || hidden) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic'
      }}>
        This portal is not available for your current development level.
      </div>
    );
  }

  const {
    icon,
    headline,
    subtext,
    ctaLabel,
    microPracticeLabel,
    microPracticeSteps,
    advancedPanelLabel,
    advancedPanelDescription,
    colorTheme,
    urgencyIndicator,
    supportMessage
  } = config;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${colorTheme.primary}22 0%, ${colorTheme.primary}11 100%)`,
        border: `2px solid ${colorTheme.primary}`,
        borderRadius: '16px',
        padding: '24px',
        margin: '16px',
        minHeight: '300px'
      }}
    >
      {/* Safety and Complexity Indicators */}
      <SafetyIndicator level={engineState.safetyLevel} urgency={urgencyIndicator} />
      <ComplexityTierBadge tier={complexityTier} onChange={onTierChange} />

      {/* Main Content */}
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '30px' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{ fontSize: '48px', marginBottom: '10px' }}
        >
          {icon}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            color: colorTheme.primary,
            margin: '0 0 10px 0',
            fontSize: complexityTier === 'advanced' ? '22px' : complexityTier === 'beginner' ? '18px' : '20px'
          }}
        >
          {headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            color: '#666',
            margin: '0',
            fontSize: complexityTier === 'advanced' ? '15px' : complexityTier === 'beginner' ? '17px' : '16px',
            lineHeight: '1.6'
          }}
        >
          {subtext}
        </motion.p>
      </div>

      {/* Primary Action */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onPrimaryAction}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'block',
          margin: '0 auto 20px auto',
          background: `linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.accent} 100%)`,
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '12px 24px',
          fontSize: complexityTier === 'beginner' ? '16px' : '14px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {ctaLabel}
      </motion.button>

      {/* Micro Practice */}
      <MicroPracticeSection
        label={microPracticeLabel}
        steps={microPracticeSteps}
        portal={portal}
        tier={complexityTier}
      />

      {/* Support Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          marginTop: '20px',
          padding: '12px',
          background: `${colorTheme.accent}22`,
          borderRadius: '8px',
          borderLeft: `4px solid ${colorTheme.accent}`,
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#555'
        }}
      >
        {supportMessage}
      </motion.div>

      {/* Advanced Panel */}
      {advancedPanelLabel && advancedPanelDescription && (
        <AdvancedPanel
          label={advancedPanelLabel}
          description={advancedPanelDescription}
          portal={portal}
          onShow={onShowAdvanced || (() => {})}
        />
      )}

      {/* Debug Info for Facilitators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          marginTop: '20px',
          padding: '8px',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#999',
          display: complexityTier === 'advanced' ? 'block' : 'none'
        }}
      >
        <strong>Engine State:</strong><br />
        Mercury: {engineState.mercuryAspect} | Phase: {engineState.spiralogicPhase}<br />
        Mode: {engineState.recommendedMode} | Portal: {portal} | Tier: {complexityTier}
      </motion.div>
    </motion.div>
  );
};

export default LeadCrisisPortalView;