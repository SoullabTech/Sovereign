/**
 * Adaptive Interface Components
 * Implements Disposable Pixel Philosophy with React/Framer Motion
 *
 * Components that adapt to user's alchemical state:
 * - Density adjusts based on metal stage (Lead=heavy, Gold=transparent)
 * - Elements dissolve when their purpose is complete
 * - Mercury aspects change behavior dynamically
 * - Sacred timing governs appearance/disappearance
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { AlchemicalMetal, AlchemicalOperation, MercuryAspect } from '../types';

// Context for alchemical interface state
export interface AlchemicalInterfaceState {
  metal: AlchemicalMetal;
  operation: AlchemicalOperation;
  mercuryAspect: MercuryAspect;
  density: number; // 0-1, how much UI is present
  adaptability: number; // 0-1, how much interface changes
  supportLevel: number; // 0-1, how much guidance is provided
  colorPalette: string[];
  dissolutionTriggers: string[];
  transformationPotential: number;
}

const AlchemicalInterfaceContext = createContext<{
  state: AlchemicalInterfaceState;
  updateState: (updates: Partial<AlchemicalInterfaceState>) => void;
} | null>(null);

// Provider component for alchemical interface state
export const AlchemicalInterfaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AlchemicalInterfaceState>({
    metal: 'mercury', // Default adaptive state
    operation: 'albedo',
    mercuryAspect: 'hermes-guide',
    density: 0.5,
    adaptability: 0.8,
    supportLevel: 0.6,
    colorPalette: ['#c0c0c0', '#e5e7eb', '#6b7280'], // Default quicksilver
    dissolutionTriggers: ['insight_integrated', 'transformation_complete'],
    transformationPotential: 0.5
  });

  const updateState = (updates: Partial<AlchemicalInterfaceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AlchemicalInterfaceContext.Provider value={{ state, updateState }}>
      {children}
    </AlchemicalInterfaceContext.Provider>
  );
};

// Hook to use alchemical interface state
export const useAlchemicalInterface = () => {
  const context = useContext(AlchemicalInterfaceContext);
  if (!context) {
    throw new Error('useAlchemicalInterface must be used within AlchemicalInterfaceProvider');
  }
  return context;
};

// Base Alchemical Container - adapts to user's metal stage
export interface AlchemicalContainerProps {
  children: React.ReactNode;
  className?: string;
  purpose: 'containment' | 'guidance' | 'transition' | 'creation' | 'dissolution';
  dissolutionCondition?: () => boolean;
  emergenceCondition?: () => boolean;
  alchemicalPurpose?: string;
}

export const AlchemicalContainer: React.FC<AlchemicalContainerProps> = ({
  children,
  className = '',
  purpose,
  dissolutionCondition,
  emergenceCondition,
  alchemicalPurpose
}) => {
  const { state } = useAlchemicalInterface();
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(true);
  const [hasEmerged, setHasEmerged] = useState(false);

  // Adaptive styles based on alchemical metal
  const getMetalStyles = () => {
    const baseStyles = "transition-all duration-1000 ease-in-out";

    switch (state.metal) {
      case 'lead':
        return {
          style: `${baseStyles} border-2 border-solid rounded-lg shadow-lg`,
          density: 0.9,
          colors: ['#1a1a1a', '#2d2d2d', '#4a4a4a'],
          opacity: 1.0,
          blur: 0
        };

      case 'tin':
        return {
          style: `${baseStyles} border border-solid rounded-md shadow-md`,
          density: 0.7,
          colors: ['#1e3a8a', '#3b82f6', '#60a5fa'],
          opacity: 0.9,
          blur: 0
        };

      case 'bronze':
        return {
          style: `${baseStyles} border border-solid rounded-md`,
          density: 0.6,
          colors: ['#166534', '#22c55e', '#4ade80'],
          opacity: 0.85,
          blur: 0
        };

      case 'iron':
        return {
          style: `${baseStyles} border-thin rounded`,
          density: 0.4,
          colors: ['#991b1b', '#dc2626', '#ef4444'],
          opacity: 0.8,
          blur: 0
        };

      case 'mercury':
        return {
          style: `${baseStyles} border-dashed rounded-xl`,
          density: 0.5,
          colors: ['#c0c0c0', '#e5e7eb', '#6b7280'],
          opacity: 0.7,
          blur: 1
        };

      case 'silver':
        return {
          style: `${baseStyles} border-thin rounded-lg`,
          density: 0.2,
          colors: ['#f8fafc', '#e2e8f0', '#cbd5e1'],
          opacity: 0.3,
          blur: 2
        };

      case 'gold':
        return {
          style: `${baseStyles}`,
          density: 0.1,
          colors: ['transparent', '#fbbf24', '#f59e0b'],
          opacity: 0.1,
          blur: 3
        };

      default:
        return {
          style: baseStyles,
          density: 0.5,
          colors: ['#64748b'],
          opacity: 0.7,
          blur: 1
        };
    }
  };

  // Check dissolution condition
  useEffect(() => {
    if (dissolutionCondition && dissolutionCondition()) {
      const dissolve = async () => {
        await controls.start({
          opacity: 0,
          scale: 0.95,
          filter: "blur(4px)",
          transition: { duration: 2, ease: "easeOut" }
        });
        setIsVisible(false);
      };
      dissolve();
    }
  }, [dissolutionCondition, controls]);

  // Check emergence condition
  useEffect(() => {
    if (emergenceCondition && emergenceCondition() && !hasEmerged) {
      setHasEmerged(true);
      controls.start({
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 1.5, ease: "easeOut" }
      });
    }
  }, [emergenceCondition, hasEmerged, controls]);

  const metalStyles = getMetalStyles();

  if (!isVisible) return null;

  return (
    <motion.div
      animate={controls}
      className={`${metalStyles.style} ${className}`}
      style={{
        backgroundColor: metalStyles.colors[0],
        borderColor: metalStyles.colors[1],
        opacity: metalStyles.opacity * state.density,
        filter: `blur(${metalStyles.blur}px)`,
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      data-alchemical-purpose={alchemicalPurpose}
      data-metal={state.metal}
      data-purpose={purpose}
    >
      {children}
    </motion.div>
  );
};

// Disposable Button - dissolves when its purpose is complete
export interface DisposableButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onComplete?: () => void; // Called when button completes its purpose
  className?: string;
  dissolutionDelay?: number; // Milliseconds before dissolution
  completionCondition?: () => boolean;
  alchemicalPurpose?: string;
}

export const DisposableButton: React.FC<DisposableButtonProps> = ({
  children,
  onClick,
  onComplete,
  className = '',
  dissolutionDelay = 3000,
  completionCondition,
  alchemicalPurpose
}) => {
  const { state } = useAlchemicalInterface();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const controls = useAnimation();

  const handleClick = () => {
    onClick?.();

    // Check if purpose is complete
    if (completionCondition && completionCondition()) {
      setIsCompleted(true);
      onComplete?.();

      // Begin dissolution after delay
      setTimeout(() => {
        setIsDissolving(true);
        controls.start({
          opacity: 0,
          scale: 0.9,
          filter: "blur(2px)",
          transition: { duration: 1, ease: "easeOut" }
        });
      }, dissolutionDelay);
    }
  };

  if (isDissolving) return null;

  return (
    <motion.button
      animate={controls}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        backgroundColor: state.colorPalette[0],
        borderColor: state.colorPalette[1],
        opacity: isCompleted ? 0.7 : 1
      }}
      data-alchemical-purpose={alchemicalPurpose}
      data-completed={isCompleted}
    >
      {children}

      {/* Dissolution effect overlay */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
};

// Adaptive Mercury Interface - changes behavior based on Mercury aspect
export interface AdaptiveMercuryInterfaceProps {
  children: React.ReactNode;
  className?: string;
}

export const AdaptiveMercuryInterface: React.FC<AdaptiveMercuryInterfaceProps> = ({
  children,
  className = ''
}) => {
  const { state } = useAlchemicalInterface();

  // Get Mercury aspect-specific styles and behavior
  const getMercuryBehavior = () => {
    switch (state.mercuryAspect) {
      case 'hermes-healer':
        return {
          style: 'bg-emerald-50/20 border-emerald-200 shadow-emerald-100/50',
          animation: {
            scale: [1, 1.01, 1],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: true
        };

      case 'hermes-teacher':
        return {
          style: 'bg-blue-50/20 border-blue-200 shadow-blue-100/50',
          animation: {
            opacity: [0.7, 1, 0.7],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: true
        };

      case 'hermes-trickster':
        return {
          style: 'bg-purple-50/20 border-purple-200 shadow-purple-100/50',
          animation: {
            rotate: [0, 1, -1, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: false
        };

      case 'hermes-psychopomp':
        return {
          style: 'bg-gray-50/20 border-gray-300 shadow-gray-200/50',
          animation: {
            opacity: [0.5, 0.8, 0.5],
            scale: [0.98, 1.02, 0.98],
            transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: true
        };

      case 'hermes-messenger':
        return {
          style: 'bg-cyan-50/20 border-cyan-200 shadow-cyan-100/50',
          animation: {
            x: [0, 2, -2, 0],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: true
        };

      case 'hermes-alchemist':
        return {
          style: 'bg-amber-50/20 border-amber-200 shadow-amber-100/50',
          animation: {
            filter: [
              "hue-rotate(0deg)",
              "hue-rotate(30deg)",
              "hue-rotate(0deg)"
            ],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: true
        };

      default: // hermes-guide
        return {
          style: 'bg-slate-50/20 border-slate-200 shadow-slate-100/50',
          animation: {
            opacity: [0.8, 1, 0.8],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          },
          supportElements: true
        };
    }
  };

  const behavior = getMercuryBehavior();

  return (
    <motion.div
      className={`${behavior.style} border rounded-lg p-4 ${className}`}
      animate={behavior.animation}
      data-mercury-aspect={state.mercuryAspect}
    >
      {children}

      {/* Mercury support elements */}
      {behavior.supportElements && (
        <div className="absolute top-2 right-2 opacity-30">
          <motion.div
            className="w-2 h-2 bg-current rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Emergence Animation - for elements that appear based on readiness
export interface EmergenceAnimationProps {
  children: React.ReactNode;
  readinessThreshold: number; // 0-1, when element should appear
  className?: string;
  alchemicalPurpose?: string;
}

export const EmergenceAnimation: React.FC<EmergenceAnimationProps> = ({
  children,
  readinessThreshold,
  className = '',
  alchemicalPurpose
}) => {
  const { state } = useAlchemicalInterface();
  const [hasEmerged, setHasEmerged] = useState(false);

  // Check if ready to emerge
  useEffect(() => {
    if (state.transformationPotential >= readinessThreshold && !hasEmerged) {
      setHasEmerged(true);
    }
  }, [state.transformationPotential, readinessThreshold, hasEmerged]);

  return (
    <AnimatePresence>
      {hasEmerged && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            filter: "blur(4px)"
          }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            filter: "blur(2px)"
          }}
          transition={{
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1] // Custom easing for sacred timing
          }}
          className={className}
          data-alchemical-purpose={alchemicalPurpose}
          data-readiness-threshold={readinessThreshold}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Dissolution Animation - for elements that fade when purpose complete
export interface DissolutionAnimationProps {
  children: React.ReactNode;
  dissolutionTrigger: boolean;
  onDissolutionComplete?: () => void;
  className?: string;
  preserveLayout?: boolean;
}

export const DissolutionAnimation: React.FC<DissolutionAnimationProps> = ({
  children,
  dissolutionTrigger,
  onDissolutionComplete,
  className = '',
  preserveLayout = false
}) => {
  const [isDissolving, setIsDissolving] = useState(false);

  useEffect(() => {
    if (dissolutionTrigger) {
      setIsDissolving(true);
    }
  }, [dissolutionTrigger]);

  const handleDissolutionComplete = () => {
    onDissolutionComplete?.();
  };

  return (
    <AnimatePresence mode={preserveLayout ? 'popLayout' : 'wait'}>
      {!isDissolving && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            filter: "blur(3px)",
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
          onAnimationComplete={handleDissolutionComplete}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing alchemical timings
export const useAlchemicalTiming = () => {
  const { state } = useAlchemicalInterface();

  const createSacredTimeout = (callback: () => void, delay: number) => {
    // Adjust timing based on metal - some stages need more time
    const metalMultipliers = {
      lead: 2.0,     // Crisis needs more time
      tin: 1.2,      // Exploration needs time to process
      bronze: 1.0,   // Relationship timing is natural
      iron: 0.8,     // Action prefers quick response
      mercury: 0.6,  // Quicksilver timing
      silver: 1.5,   // Contemplation needs time
      gold: 1.0      // Mastery has natural timing
    };

    const adjustedDelay = delay * metalMultipliers[state.metal];
    return setTimeout(callback, adjustedDelay);
  };

  return { createSacredTimeout };
};

// Export all components and hooks