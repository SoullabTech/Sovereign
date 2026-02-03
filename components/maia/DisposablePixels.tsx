// @ts-nocheck
/**
 * 🌀 Disposable Pixels - Field-Prompted UI System
 *
 * Components that emerge and dissolve based on consciousness phase state,
 * creating a living interface that breathes with the user's inner process.
 *
 * Based on MAIA's Spiralogic intelligence and elemental visual design system.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaiaSpiralogic } from '@/hooks/useMaiaSpiralogic';
import {
  Element,
  Phase,
  SpiralogicCell,
  MaiaSuggestedAction,
  MaiaCoreResponse
} from '@/lib/consciousness/spiralogic-core';

// ====================================================================
// ELEMENTAL VISUAL SYSTEM
// ====================================================================

interface ElementalTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animation: string;
  geometry: string;
  energy: 'dynamic' | 'fluid' | 'stable' | 'ethereal';
}

const ELEMENTAL_THEMES: Record<Element, ElementalTheme> = {
  Fire: {
    colors: { primary: '#FF4500', secondary: '#DC143C', accent: '#FFD700' },
    animation: 'flicker',
    geometry: 'triangle',
    energy: 'dynamic'
  },
  Water: {
    colors: { primary: '#4682B4', secondary: '#191970', accent: '#40E0D0' },
    animation: 'flow',
    geometry: 'circle',
    energy: 'fluid'
  },
  Earth: {
    colors: { primary: '#8B4513', secondary: '#228B22', accent: '#9ACD32' },
    animation: 'grow',
    geometry: 'square',
    energy: 'stable'
  },
  Air: {
    colors: { primary: '#87CEEB', secondary: '#6495ED', accent: '#E6E6FA' },
    animation: 'float',
    geometry: 'pentagon',
    energy: 'ethereal'
  }
};

// ====================================================================
// DISPOSABLE PIXEL CONTAINER
// ====================================================================

interface DisposablePixelsProps {
  userId: string;
  input: string;
  onResponse?: (response: MaiaCoreResponse) => void;
  className?: string;
}

export function DisposablePixels({
  userId,
  input,
  onResponse,
  className = ''
}: DisposablePixelsProps) {
  const {
    response,
    loading,
    error,
    sendInput,
    suggestedActions
  } = useMaiaSpiralogic(userId);

  useEffect(() => {
    if (input && input.trim()) {
      sendInput(input);
    }
  }, [input, sendInput]);

  useEffect(() => {
    if (response && onResponse) {
      onResponse(response);
    }
  }, [response, onResponse]);

  if (!response) return null;

  return (
    <div className={`disposable-pixels-container ${className}`}>
      <AnimatePresence>
        {/* Main MAIA Response */}
        <ElementalMessageBubble
          key="maia-message"
          response={response}
          isVisible={true}
        />

        {/* Suggested Actions as Disposable Pixels */}
        {suggestedActions.map((action, index) => (
          <DisposableActionPixel
            key={action.id}
            action={action}
            elementalTheme={ELEMENTAL_THEMES[action.elementalResonance]}
            delay={index * 0.2}
            onActivate={() => handleActionActivate(action)}
          />
        ))}

        {/* Phase Indicator */}
        {response.spiralogic && (
          <PhaseIndicatorPixel
            key="phase-indicator"
            cell={response.spiralogic}
            delay={0.8}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================================================
// ELEMENTAL MESSAGE BUBBLE
// ====================================================================

interface ElementalMessageBubbleProps {
  response: MaiaCoreResponse;
  isVisible: boolean;
}

function ElementalMessageBubble({ response, isVisible }: ElementalMessageBubbleProps) {
  const theme = ELEMENTAL_THEMES[response.spiralogic.element];

  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "exit"}
      exit="exit"
      className={`elemental-message-bubble elemental-${response.spiralogic.element.toLowerCase()}`}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}08)`,
        border: `1px solid ${theme.colors.primary}30`,
        borderRadius: theme.geometry === 'circle' ? '50%' :
                     theme.geometry === 'triangle' ? '0' : '16px'
      }}
    >
      {/* Element Symbol */}
      <div className="element-symbol">
        <ElementIcon element={response.spiralogic.element} />
      </div>

      {/* Core Message */}
      <div className="message-content">
        <p className="maia-message">{response.coreMessage}</p>

        {/* Alchemical Context */}
        {response.alchemicalStage && (
          <div className="alchemical-context">
            <span className="stage-indicator">
              {getAlchemicalEmoji(response.alchemicalStage)} {response.alchemicalStage}
            </span>
          </div>
        )}

        {/* Symbolic Resonance */}
        {response.symbolicResonance && (
          <div className="symbolic-resonance">
            {response.symbolicResonance.map((symbol, index) => (
              <span key={index} className="symbol-tag">{symbol}</span>
            ))}
          </div>
        )}
      </div>

      {/* Phase Quality Indicator */}
      <div className="phase-quality">
        {response.spiralogic.quality} {response.spiralogic.element} {response.spiralogic.phase}
      </div>
    </motion.div>
  );
}

// ====================================================================
// DISPOSABLE ACTION PIXEL
// ====================================================================

interface DisposableActionPixelProps {
  action: MaiaSuggestedAction;
  elementalTheme: ElementalTheme;
  delay: number;
  onActivate: () => void;
}

function DisposableActionPixel({
  action,
  elementalTheme,
  delay,
  onActivate
}: DisposableActionPixelProps) {
  const pixelVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -180
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.68, -0.55, 0.265, 1.55] // Bouncy ease
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: `0 8px 25px ${elementalTheme.colors.primary}40`,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    exit: {
      opacity: 0,
      scale: 0,
      rotate: 180,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.button
      variants={pixelVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      exit="exit"
      onClick={onActivate}
      className={`disposable-action-pixel priority-${action.priority}`}
      style={{
        background: `linear-gradient(135deg, ${elementalTheme.colors.primary}20, ${elementalTheme.colors.accent}10)`,
        border: `2px solid ${elementalTheme.colors.primary}50`,
        color: elementalTheme.colors.primary
      }}
    >
      {/* Action Icon */}
      <div className="action-icon">
        <ActionIcon actionId={action.id} />
      </div>

      {/* Action Label */}
      <div className="action-label">
        {action.label}
      </div>

      {/* Framework Hint */}
      {action.frameworkHint && (
        <div className="framework-hint">
          {action.frameworkHint}
        </div>
      )}
    </motion.button>
  );
}

// ====================================================================
// PHASE INDICATOR PIXEL
// ====================================================================

interface PhaseIndicatorPixelProps {
  cell: SpiralogicCell;
  delay: number;
}

function PhaseIndicatorPixel({ cell, delay }: PhaseIndicatorPixelProps) {
  const theme = ELEMENTAL_THEMES[cell.element];

  const indicatorVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      y: -20
    },
    visible: {
      opacity: 0.7,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={indicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="phase-indicator-pixel"
      style={{
        background: `conic-gradient(${theme.colors.primary}60, ${theme.colors.secondary}40, ${theme.colors.accent}30)`,
        border: `1px solid ${theme.colors.primary}40`
      }}
    >
      <div className="phase-notation">
        <span className="element">{cell.element}</span>
        <span className="phase">{cell.phase}</span>
        <span className="arc">{cell.arc === 'regressive' ? '↓' : '↑'}</span>
      </div>

      <div className="confidence-ring">
        <svg width="40" height="40" className="confidence-circle">
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="2"
            strokeDasharray={`${cell.confidence * 94.25} 94.25`}
            opacity="0.6"
          />
        </svg>
      </div>
    </motion.div>
  );
}

// ====================================================================
// UTILITY COMPONENTS
// ====================================================================

function ElementIcon({ element }: { element: Element }) {
  const icons = {
    Fire: '🔥',
    Water: '💧',
    Earth: '🌱',
    Air: '💨'
  };
  return <span className="element-icon">{icons[element]}</span>;
}

function ActionIcon({ actionId }: { actionId: string }) {
  const icons: Record<string, string> = {
    capture_journal: '📝',
    inner_exploration: '🔍',
    crisis_support: '🤝',
    create_structure: '🏗️',
    share_wisdom: '💫',
    parenting_ipp: '👨‍👩‍👧‍👦',
    view_field_pattern: '🌐'
  };
  return <span className="action-icon">{icons[actionId] || '✨'}</span>;
}

function getAlchemicalEmoji(stage: string): string {
  const emojis = {
    nigredo: '🌑',
    albedo: '🌕',
    rubedo: '🌅'
  };
  return emojis[stage as keyof typeof emojis] || '⚗️';
}

// ====================================================================
// ACTION HANDLERS
// ====================================================================

function handleActionActivate(action: MaiaSuggestedAction) {
  // Route to appropriate handler based on action type
  switch (action.id) {
    case 'capture_journal':
      // Open journal capture modal
      break;
    case 'inner_exploration':
      // Open guided exploration flow
      break;
    case 'crisis_support':
      // Activate crisis support protocol
      break;
    case 'create_structure':
      // Open structure building tools
      break;
    case 'share_wisdom':
      // Open sharing/teaching interface
      break;
    case 'parenting_ipp':
      // Activate Ideal Parenting Protocol
      break;
    case 'view_field_pattern':
      // Open field visualization
      break;
    default:
      console.log(`Action activated: ${action.label}`);
  }
}

// ====================================================================
// CSS CLASSES (Add to globals.css)
// ====================================================================

/*
.disposable-pixels-container {
  @apply relative p-6 space-y-4;
}

.elemental-message-bubble {
  @apply p-6 rounded-lg backdrop-blur-sm;
  @apply shadow-lg transition-all duration-300;
}

.elemental-fire {
  animation: fireFlicker 3s infinite;
}

.elemental-water {
  animation: waterFlow 4s infinite ease-in-out;
}

.elemental-earth {
  animation: earthGrow 2s ease-out;
}

.elemental-air {
  animation: airFloat 6s infinite ease-in-out;
}

.disposable-action-pixel {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-lg;
  @apply cursor-pointer transition-all duration-200;
  @apply backdrop-blur-sm font-medium text-sm;
}

.phase-indicator-pixel {
  @apply w-12 h-12 rounded-full relative;
  @apply flex items-center justify-center;
  @apply backdrop-blur-sm border;
}

@keyframes fireFlicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.8; transform: scale(1.02); }
  50% { opacity: 1; transform: scale(0.98); }
  75% { opacity: 0.9; transform: scale(1.01); }
}

@keyframes waterFlow {
  0%, 100% { border-radius: 16px; transform: translateY(0); }
  50% { border-radius: 50px; transform: translateY(-2px); }
}

@keyframes earthGrow {
  0% { transform: scale(0) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes airFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
  50% { transform: translateY(-5px) scale(1.02); opacity: 1; }
}
*/