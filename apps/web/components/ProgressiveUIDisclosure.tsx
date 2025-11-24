'use client';

import React, { useState, useEffect } from 'react';
import { AdaptiveUI, ConversationMemory } from '../backend/src/types/agentCommunication';

interface ProgressiveUIProps {
  userGrowth: ConversationMemory['userGrowth'];
  children: React.ReactNode;
  className?: string;
}

export function ProgressiveUIDisclosure({ 
  userGrowth, 
  children, 
  className = '' 
}: ProgressiveUIProps) {
  const [uiMode, setUIMode] = useState<'beginner' | 'experienced'>('beginner');
  const [showComplexity, setShowComplexity] = useState(false);

  // Determine UI mode based on user growth
  useEffect(() => {
    const avgCapacity = (
      userGrowth.conceptualCapacity + 
      userGrowth.paradoxTolerance + 
      userGrowth.othernessTolerance
    ) / 3;

    if (avgCapacity > 0.6) {
      setUIMode('experienced');
      setShowComplexity(true);
    } else if (avgCapacity > 0.3) {
      setUIMode('experienced');
      setShowComplexity(false);
    } else {
      setUIMode('beginner');
      setShowComplexity(false);
    }
  }, [userGrowth]);

  return (
    <div className={`progressive-ui ${uiMode} ${className}`}>
      {children}
    </div>
  );
}

interface UILayerProps {
  level: 1 | 2 | 3;
  userGrowth: ConversationMemory['userGrowth'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function UILayer({ 
  level, 
  userGrowth, 
  children, 
  fallback 
}: UILayerProps) {
  const shouldShow = (() => {
    switch (level) {
      case 1: // Always show - phenomenological layer
        return true;
      case 2: // Show when paradox tolerance develops
        return userGrowth.paradoxTolerance > 0.4;
      case 3: // Show when otherness tolerance develops
        return userGrowth.othernessTolerance > 0.6;
      default:
        return false;
    }
  })();

  if (!shouldShow && fallback) {
    return <>{fallback}</>;
  }

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`ui-layer-${level}`} style={{
      opacity: shouldShow ? 1 : 0,
      transition: 'opacity 500ms ease-in-out'
    }}>
      {children}
    </div>
  );
}

interface ConceptualComplexityProps {
  complexity: 'introductory' | 'intermediate' | 'advanced';
  userCapacity: number;
  children: React.ReactNode;
  simplified?: React.ReactNode;
}

export function ConceptualComplexity({ 
  complexity, 
  userCapacity, 
  children, 
  simplified 
}: ConceptualComplexityProps) {
  const complexityThresholds = {
    introductory: 0.0,
    intermediate: 0.4,
    advanced: 0.7
  };

  const canShow = userCapacity >= complexityThresholds[complexity];

  if (!canShow && simplified) {
    return <>{simplified}</>;
  }

  return canShow ? <>{children}</> : null;
}

interface MetaphorGradationProps {
  userGrowth: ConversationMemory['userGrowth'];
  concept: string;
  className?: string;
}

export function MetaphorGradation({ 
  userGrowth, 
  concept, 
  className = '' 
}: MetaphorGradationProps) {
  const getMetaphor = () => {
    const conceptualLevel = userGrowth.conceptualCapacity;
    
    if (conceptualLevel < 0.3) {
      return {
        type: 'conversation_partner',
        description: 'Like talking with a wise friend',
        visual: '💬'
      };
    } else if (conceptualLevel < 0.6) {
      return {
        type: 'dialogue_space', 
        description: 'A space where different voices meet',
        visual: '🌉'
      };
    } else {
      return {
        type: 'synaptic_space',
        description: 'The creative gap between self and Other',
        visual: '⚡'
      };
    }
  };

  const metaphor = getMetaphor();

  return (
    <div className={`metaphor-container ${className}`}>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="text-lg">{metaphor.visual}</span>
        <span>{metaphor.description}</span>
      </div>
    </div>
  );
}

interface StructuralSupportProps {
  userGrowth: ConversationMemory['userGrowth'];
  children: React.ReactNode;
}

export function StructuralSupport({ userGrowth, children }: StructuralSupportProps) {
  const needsHighStructure = userGrowth.conceptualCapacity < 0.4;
  const needsMediumStructure = userGrowth.conceptualCapacity < 0.7;

  const structureLevel = needsHighStructure ? 'high' : needsMediumStructure ? 'medium' : 'minimal';

  const getStructuralElements = () => {
    switch (structureLevel) {
      case 'high':
        return {
          showStepNumbers: true,
          showProgressBars: true,
          showExplicitGuidance: true,
          containerPadding: 'p-6',
          headingSize: 'text-lg'
        };
      case 'medium':
        return {
          showStepNumbers: false,
          showProgressBars: true,
          showExplicitGuidance: false,
          containerPadding: 'p-4',
          headingSize: 'text-base'
        };
      case 'minimal':
        return {
          showStepNumbers: false,
          showProgressBars: false,
          showExplicitGuidance: false,
          containerPadding: 'p-2',
          headingSize: 'text-sm'
        };
    }
  };

  const structure = getStructuralElements();

  return (
    <div className={`structural-support ${structure.containerPadding}`}>
      {children}
    </div>
  );
}

interface EarnedComplexityProps {
  userGrowth: ConversationMemory['userGrowth'];
  requiredGrowth: {
    conceptual?: number;
    paradox?: number;  
    otherness?: number;
  };
  children: React.ReactNode;
  earnMessage?: string;
}

export function EarnedComplexity({ 
  userGrowth, 
  requiredGrowth, 
  children, 
  earnMessage 
}: EarnedComplexityProps) {
  const hasEarned = (
    (requiredGrowth.conceptual ? userGrowth.conceptualCapacity >= requiredGrowth.conceptual : true) &&
    (requiredGrowth.paradox ? userGrowth.paradoxTolerance >= requiredGrowth.paradox : true) &&
    (requiredGrowth.otherness ? userGrowth.othernessTolerance >= requiredGrowth.otherness : true)
  );

  if (!hasEarned && earnMessage) {
    return (
      <div className="earned-complexity-placeholder p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <p className="text-sm text-slate-600">{earnMessage}</p>
      </div>
    );
  }

  return hasEarned ? <>{children}</> : null;
}

interface GracefulDegradationProps {
  userOverwhelm: boolean;
  children: React.ReactNode;
  simplifiedVersion: React.ReactNode;
  className?: string;
}

export function GracefulDegradation({ 
  userOverwhelm, 
  children, 
  simplifiedVersion, 
  className = '' 
}: GracefulDegradationProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (userOverwhelm) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(timer);
    }
  }, [userOverwhelm]);

  return (
    <div 
      className={`graceful-degradation ${className} ${isTransitioning ? 'transitioning' : ''}`}
      style={{
        transition: 'all 500ms ease-in-out',
        filter: userOverwhelm ? 'blur(2px)' : 'none',
        opacity: isTransitioning ? 0.7 : 1.0
      }}
    >
      {userOverwhelm ? simplifiedVersion : children}
    </div>
  );
}

interface InteractionQualityIndicatorProps {
  resonance: number;
  gap: number;
  className?: string;
}

export function InteractionQualityIndicator({ 
  resonance, 
  gap, 
  className = '' 
}: InteractionQualityIndicatorProps) {
  const getQuality = () => {
    if (gap < 0.1) return { type: 'collapse', color: 'text-red-500', icon: '⚫' };
    if (resonance > 0.8 && gap > 0.3) return { type: 'creative_tension', color: 'text-amber-500', icon: '⚡' };
    if (resonance > 0.6) return { type: 'harmonic', color: 'text-blue-500', icon: '🌊' };
    if (resonance < 0.3) return { type: 'dissonant', color: 'text-amber-500', icon: '🎭' };
    return { type: 'developing', color: 'text-slate-500', icon: '○' };
  };

  const quality = getQuality();

  return (
    <div className={`interaction-quality flex items-center gap-1 ${className}`}>
      <span className={`${quality.color}`}>{quality.icon}</span>
      <span className={`text-xs ${quality.color} opacity-60`}>
        {quality.type.replace('_', ' ')}
      </span>
    </div>
  );
}

// High-level composed component for complete progressive disclosure
interface ProgressiveOracleInterfaceProps {
  userGrowth: ConversationMemory['userGrowth'];
  synapticGap: number;
  resonance: number;
  isOverwhelmed: boolean;
  children: React.ReactNode;
}

export function ProgressiveOracleInterface({
  userGrowth,
  synapticGap, 
  resonance,
  isOverwhelmed,
  children
}: ProgressiveOracleInterfaceProps) {
  return (
    <ProgressiveUIDisclosure userGrowth={userGrowth}>
      <StructuralSupport userGrowth={userGrowth}>
        <GracefulDegradation 
          userOverwhelm={isOverwhelmed}
          children={children}
          simplifiedVersion={
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">Taking a moment to simplify...</p>
            </div>
          }
        />
        
        {/* Only show interaction quality for experienced users */}
        <UILayer level={2} userGrowth={userGrowth}>
          <InteractionQualityIndicator 
            resonance={resonance}
            gap={synapticGap}
            className="mt-2"
          />
        </UILayer>

        {/* Show metaphor gradation */}
        <MetaphorGradation 
          userGrowth={userGrowth}
          concept="dialogue"
          className="mt-1"
        />
      </StructuralSupport>
    </ProgressiveUIDisclosure>
  );
}