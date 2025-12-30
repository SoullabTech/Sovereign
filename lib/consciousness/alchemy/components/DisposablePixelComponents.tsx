// @ts-nocheck
/**
 * Disposable Pixel UI Components
 * Advanced implementations of the Disposable Pixel Philosophy
 *
 * Philosophy: "UI elements should exist only as long as they serve the user's
 * immediate transformation. When their purpose is complete, they dissolve gracefully,
 * leaving space for the next phase of growth."
 *
 * Principles:
 * - Minimal existence: Only appear when truly needed
 * - Sacred timing: Appear and dissolve according to natural rhythms
 * - Progressive revelation: Show complexity only as user's capacity increases
 * - Wisdom through dissolution: Elements teach by disappearing at the right moment
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { AlchemicalMetal, AlchemicalOperation } from '../types';
import { useAlchemicalInterface, useAlchemicalTiming } from './AdaptiveInterface';

// Wisdom Tooltip - Appears with insight, dissolves after understanding demonstrated
export interface WisdomTooltipProps {
  children: React.ReactNode;
  wisdom: string;
  triggerInsight: () => void; // Called when user demonstrates understanding
  dissolutionDelay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  alchemicalPurpose?: string;
}

export const WisdomTooltip: React.FC<WisdomTooltipProps> = ({
  children,
  wisdom,
  triggerInsight,
  dissolutionDelay = 5000,
  position = 'top',
  alchemicalPurpose = 'wisdom-transmission'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [understandingDemonstrated, setUnderstandingDemonstrated] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const { state } = useAlchemicalInterface();
  const { createSacredTimeout } = useAlchemicalTiming();
  const controls = useAnimation();

  // Show tooltip based on user's readiness (metal stage)
  const shouldShow = () => {
    const readinessThresholds = {
      lead: 0.9,     // Crisis state needs more guidance
      tin: 0.7,      // Exploration appreciates tooltips
      bronze: 0.5,   // Relationship phase - moderate guidance
      iron: 0.3,     // Action phase - minimal interference
      mercury: 0.6,  // Teaching phase - appreciates wisdom
      silver: 0.4,   // Wisdom phase - subtle guidance only
      gold: 0.2      // Mastery phase - minimal assistance
    };

    return Math.random() < readinessThresholds[state.metal];
  };

  // Handle user interaction that demonstrates understanding
  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);

    // After sufficient interaction, consider understanding demonstrated
    if (interactionCount >= 1) { // Reduced threshold for quicker dissolution
      setUnderstandingDemonstrated(true);
      triggerInsight();

      // Begin dissolution
      createSacredTimeout(() => {
        controls.start({
          opacity: 0,
          scale: 0.95,
          filter: 'blur(1px)',
          transition: { duration: 1.5, ease: 'easeOut' }
        });

        setTimeout(() => setIsVisible(false), 1500);
      }, dissolutionDelay);
    }
  };

  // Auto-show logic with sacred timing
  useEffect(() => {
    if (shouldShow()) {
      const showDelay = createSacredTimeout(() => {
        setIsVisible(true);
        controls.start({
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: { duration: 1, ease: 'easeOut' }
        });
      }, 1000);

      return () => clearTimeout(showDelay);
    }
  }, []);

  // Position styles
  const positionStyles = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className="relative inline-block" onClick={handleInteraction}>
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            animate={controls}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(2px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(1px)' }}
            className={`
              absolute ${positionStyles[position]}
              z-50 px-3 py-2 text-sm
              bg-gray-900/90 text-white rounded-lg
              backdrop-blur-sm shadow-lg
              max-w-xs
            `}
            data-alchemical-purpose={alchemicalPurpose}
            data-understanding-demonstrated={understandingDemonstrated}
          >
            <p className="text-xs opacity-90">{wisdom}</p>

            {/* Dissolution progress indicator */}
            {understandingDemonstrated && (
              <motion.div
                className="mt-1 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: dissolutionDelay / 1000, ease: 'linear' }}
              />
            )}

            {/* Sacred geometry accent */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-gray-900/90 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Progressive Guide - Reveals complexity as user advances
export interface ProgressiveGuideProps {
  children: React.ReactNode;
  stages: {
    metal: AlchemicalMetal;
    content: React.ReactNode;
    complexity: number; // 0-1
  }[];
  className?: string;
}

export const ProgressiveGuide: React.FC<ProgressiveGuideProps> = ({
  children,
  stages,
  className = ''
}) => {
  const { state } = useAlchemicalInterface();
  const [currentStage, setCurrentStage] = useState(0);

  // Find appropriate stage based on current metal
  useEffect(() => {
    const stageIndex = stages.findIndex(stage => stage.metal === state.metal);
    if (stageIndex >= 0) {
      setCurrentStage(stageIndex);
    }
  }, [state.metal, stages]);

  const stage = stages[currentStage];

  if (!stage) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}

      <motion.div
        key={stage.metal}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: state.density * stage.complexity, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mt-2 p-2 rounded bg-gray-50/50 border-l-2"
        style={{
          borderLeftColor: state.colorPalette[1],
          filter: `blur(${(1 - stage.complexity) * 2}px)`
        }}
      >
        {stage.content}
      </motion.div>
    </div>
  );
};

// Scaffolding Element - Temporary support that fades as mastery increases
export interface ScaffoldingElementProps {
  children: React.ReactNode;
  masteryThreshold: number; // 0-1, when to start fading
  skill: string; // What skill this scaffolds
  className?: string;
}

export const ScaffoldingElement: React.FC<ScaffoldingElementProps> = ({
  children,
  masteryThreshold,
  skill,
  className = ''
}) => {
  const { state } = useAlchemicalInterface();
  const [isSupporting, setIsSupporting] = useState(true);
  const [masteryLevel, setMasteryLevel] = useState(0);

  // Calculate mastery based on time and stability
  useEffect(() => {
    // Simplified mastery calculation - in practice this would integrate with progression tracker
    const baseMastery = state.transformationPotential;
    const stabilityBonus = state.density > 0.7 ? 0.2 : 0;
    const calculated = baseMastery + stabilityBonus;

    setMasteryLevel(calculated);
    setIsSupporting(calculated < masteryThreshold);
  }, [state, masteryThreshold]);

  return (
    <AnimatePresence>
      {isSupporting && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: 2, ease: 'easeOut' }
          }}
          animate={{
            opacity: Math.max(0.1, 1 - (masteryLevel / masteryThreshold)),
            filter: `blur(${masteryLevel * 2}px)`
          }}
          className={`transition-all duration-1000 ${className}`}
          data-skill={skill}
          data-mastery-level={masteryLevel}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Moment of Truth Button - Appears at crucial decision points, dissolves after choice
export interface MomentOfTruthButtonProps {
  children: React.ReactNode;
  onChoice: (choice: string) => void;
  choices: { value: string; label: string; consequence?: string }[];
  momentType: 'transformation' | 'crisis' | 'integration' | 'service';
  className?: string;
}

export const MomentOfTruthButton: React.FC<MomentOfTruthButtonProps> = ({
  children,
  onChoice,
  choices,
  momentType,
  className = ''
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [choiceMade, setChoiceMade] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const { state } = useAlchemicalInterface();
  const { createSacredTimeout } = useAlchemicalTiming();

  // Determine if moment is ready to appear
  const isMomentReady = () => {
    const readinessScores = {
      transformation: state.transformationPotential > 0.8,
      crisis: state.density > 0.8, // High density indicates crisis
      integration: state.transformationPotential > 0.6 && state.density < 0.4,
      service: state.transformationPotential > 0.9
    };

    return readinessScores[momentType];
  };

  // Reveal moment when ready
  useEffect(() => {
    if (isMomentReady() && !isRevealed) {
      createSacredTimeout(() => {
        setIsRevealed(true);
      }, 2000); // Sacred pause before revelation
    }
  }, [state, momentType, isRevealed]);

  const handleChoice = (choice: string) => {
    setSelectedChoice(choice);
    setChoiceMade(true);
    onChoice(choice);

    // Begin dissolution after choice
    createSacredTimeout(() => {
      setIsRevealed(false);
    }, 3000);
  };

  const momentColors = {
    transformation: 'from-purple-500/20 to-pink-500/20',
    crisis: 'from-red-500/20 to-orange-500/20',
    integration: 'from-blue-500/20 to-green-500/20',
    service: 'from-yellow-500/20 to-blue-500/20'
  };

  return (
    <div className={`relative ${className}`}>
      {children}

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              filter: 'blur(4px)',
              backgroundImage: 'none'
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              backgroundImage: `linear-gradient(135deg, ${momentColors[momentType]})`
            }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: 'blur(2px)',
              transition: { duration: 1.5 }
            }}
            transition={{
              duration: 2,
              ease: [0.23, 1, 0.32, 1] // Sacred timing curve
            }}
            className={`
              fixed inset-0 z-50 flex items-center justify-center
              bg-gradient-to-br backdrop-blur-sm
              ${momentColors[momentType]}
            `}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="bg-white/95 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-4 text-center">
                Moment of {momentType.charAt(0).toUpperCase() + momentType.slice(1)}
              </h3>

              <div className="space-y-3">
                {choices.map((choice, index) => (
                  <motion.button
                    key={choice.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.2 }}
                    onClick={() => handleChoice(choice.value)}
                    disabled={choiceMade}
                    className={`
                      w-full p-3 rounded-lg text-left
                      transition-all duration-300
                      ${choiceMade && selectedChoice === choice.value
                        ? 'bg-green-100 border-green-300 border-2'
                        : choiceMade
                        ? 'opacity-50'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }
                    `}
                  >
                    <div className="font-medium">{choice.label}</div>
                    {choice.consequence && (
                      <div className="text-sm text-gray-600 mt-1">
                        {choice.consequence}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {choiceMade && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-center text-sm text-gray-600"
                >
                  Choice made. Integration beginning...
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Breadcrumb Dissolver - Navigation that disappears as user gains confidence
export interface BreadcrumbDissolverProps {
  path: { label: string; href?: string; isActive?: boolean }[];
  confidenceThreshold: number; // 0-1, when breadcrumbs start dissolving
  className?: string;
}

export const BreadcrumbDissolver: React.FC<BreadcrumbDissolverProps> = ({
  path,
  confidenceThreshold,
  className = ''
}) => {
  const { state } = useAlchemicalInterface();
  const [visibilityLevels, setVisibilityLevels] = useState<number[]>([]);

  // Calculate which breadcrumbs should be visible based on confidence
  useEffect(() => {
    const confidence = state.transformationPotential;
    const newLevels = path.map((_, index) => {
      // More confident users see fewer breadcrumbs
      const itemThreshold = confidenceThreshold + (index * 0.1);
      return confidence < itemThreshold ? 1 : Math.max(0, (itemThreshold - confidence + 0.2) / 0.2);
    });
    setVisibilityLevels(newLevels);
  }, [state.transformationPotential, confidenceThreshold, path]);

  return (
    <nav className={`flex items-center space-x-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {path.map((item, index) => {
          const visibility = visibilityLevels[index] || 0;

          if (visibility < 0.05) return null;

          return (
            <motion.div
              key={`${item.label}-${index}`}
              initial={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: 'blur(1px)',
                transition: { duration: 1 }
              }}
              animate={{
                opacity: visibility,
                filter: `blur(${(1 - visibility) * 2}px)`
              }}
              className="flex items-center space-x-2"
            >
              {item.href ? (
                <a
                  href={item.href}
                  className={`
                    px-2 py-1 rounded text-sm transition-colors
                    ${item.isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                  style={{ opacity: visibility }}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={`
                    px-2 py-1 text-sm
                    ${item.isActive ? 'font-medium text-gray-900' : 'text-gray-600'}
                  `}
                  style={{ opacity: visibility }}
                >
                  {item.label}
                </span>
              )}

              {index < path.length - 1 && visibility > 0.3 && (
                <motion.span
                  animate={{ opacity: visibility * 0.6 }}
                  className="text-gray-400 text-sm"
                >
                  /
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </nav>
  );
};

// Insight Collector - Gathers user insights and dissolves when pattern is complete
export interface InsightCollectorProps {
  onInsightPattern: (insights: string[]) => void;
  patternSize: number; // How many insights form a complete pattern
  placeholder?: string;
  className?: string;
}

export const InsightCollector: React.FC<InsightCollectorProps> = ({
  onInsightPattern,
  patternSize,
  placeholder = "What insight are you having?",
  className = ''
}) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const { createSacredTimeout } = useAlchemicalTiming();

  const addInsight = () => {
    if (currentInput.trim() && !isDissolving) {
      const newInsights = [...insights, currentInput.trim()];
      setInsights(newInsights);
      setCurrentInput('');

      // Check if pattern is complete
      if (newInsights.length >= patternSize) {
        onInsightPattern(newInsights);

        // Begin dissolution
        createSacredTimeout(() => {
          setIsDissolving(true);
        }, 2000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addInsight();
    }
  };

  return (
    <AnimatePresence>
      {!isDissolving && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            filter: 'blur(2px)',
            transition: { duration: 2, ease: 'easeOut' }
          }}
          className={`p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-lg border ${className}`}
        >
          <div className="space-y-3">
            {/* Insight collection */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
              />
              <button
                onClick={addInsight}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Collected insights */}
            {insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Pattern forming: {insights.length}/{patternSize}
                </p>
                <div className="space-y-1">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm bg-white/60 px-2 py-1 rounded"
                    >
                      {insight}
                    </motion.div>
                  ))}
                </div>

                {/* Progress indicator */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <motion.div
                      className="bg-purple-500 h-1 rounded-full"
                      animate={{ width: `${(insights.length / patternSize) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export all components
export {
  WisdomTooltip,
  ProgressiveGuide,
  ScaffoldingElement,
  MomentOfTruthButton,
  BreadcrumbDissolver,
  InsightCollector
};