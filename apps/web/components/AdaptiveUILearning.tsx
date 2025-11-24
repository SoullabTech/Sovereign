'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ConversationMemory, AdaptiveUI } from '../backend/src/types/agentCommunication';

interface AdaptiveUILearningProps {
  userGrowth: ConversationMemory['userGrowth'];
  sessionHistory: {
    totalInteractions: number;
    avgComplexityHandled: number;
    preferredInteractionStyle: 'gentle' | 'direct' | 'exploratory';
    overwhelmTriggers: string[];
    growthMoments: Array<{
      timestamp: Date;
      conceptGrowth: number;
      trigger: string;
    }>;
  };
  onUIAdaptation?: (adaptations: UIAdaptationState) => void;
  children: React.ReactNode;
}

interface UIAdaptationState {
  complexityLevel: 'introductory' | 'intermediate' | 'advanced';
  structureLevel: 'high' | 'medium' | 'minimal';
  pacePreference: 'slow' | 'moderate' | 'fast';
  visualComplexity: 'simple' | 'rich' | 'full';
  interactionDepth: 'surface' | 'medium' | 'deep';
  safeguardLevel: 'protective' | 'moderate' | 'open';
}

export function AdaptiveUILearning({
  userGrowth,
  sessionHistory,
  onUIAdaptation,
  children
}: AdaptiveUILearningProps) {
  const [adaptationState, setAdaptationState] = useState<UIAdaptationState>(() => 
    calculateInitialAdaptation(userGrowth, sessionHistory)
  );

  const [learningInsights, setLearningInsights] = useState<string[]>([]);

  // Recalculate adaptation when user growth changes
  useEffect(() => {
    const newAdaptation = calculateAdaptiveState(userGrowth, sessionHistory);
    
    if (hasSignificantChange(adaptationState, newAdaptation)) {
      setAdaptationState(newAdaptation);
      onUIAdaptation?.(newAdaptation);
      
      // Generate insight about the adaptation
      const insight = generateAdaptationInsight(adaptationState, newAdaptation);
      if (insight) {
        setLearningInsights(prev => [...prev.slice(-4), insight]);
      }
    }
  }, [userGrowth, sessionHistory, adaptationState, onUIAdaptation]);

  return (
    <AdaptiveUIContext.Provider value={{ adaptationState, learningInsights }}>
      <div className={`adaptive-ui-container ${getUIClasses(adaptationState)}`}>
        {children}
        
        {/* Show adaptation insights for advanced users */}
        {adaptationState.complexityLevel === 'advanced' && learningInsights.length > 0 && (
          <AdaptationInsightsPanel insights={learningInsights} />
        )}
      </div>
    </AdaptiveUIContext.Provider>
  );
}

// Context for child components to access adaptation state
const AdaptiveUIContext = React.createContext<{
  adaptationState: UIAdaptationState;
  learningInsights: string[];
}>({
  adaptationState: {
    complexityLevel: 'introductory',
    structureLevel: 'high', 
    pacePreference: 'slow',
    visualComplexity: 'simple',
    interactionDepth: 'surface',
    safeguardLevel: 'protective'
  },
  learningInsights: []
});

export const useAdaptiveUI = () => React.useContext(AdaptiveUIContext);

// ==========================================================================
// ADAPTATION CALCULATION
// ==========================================================================

function calculateInitialAdaptation(
  userGrowth: ConversationMemory['userGrowth'],
  sessionHistory: AdaptiveUILearningProps['sessionHistory']
): UIAdaptationState {
  return {
    complexityLevel: 'introductory',
    structureLevel: 'high',
    pacePreference: 'slow',
    visualComplexity: 'simple',
    interactionDepth: 'surface',
    safeguardLevel: 'protective'
  };
}

function calculateAdaptiveState(
  userGrowth: ConversationMemory['userGrowth'],
  sessionHistory: AdaptiveUILearningProps['sessionHistory']
): UIAdaptationState {
  const avgGrowth = (
    userGrowth.conceptualCapacity + 
    userGrowth.paradoxTolerance + 
    userGrowth.othernessTolerance
  ) / 3;

  // Complexity level based on growth and successful handling
  const complexityLevel: UIAdaptationState['complexityLevel'] = (() => {
    if (avgGrowth > 0.7 && sessionHistory.avgComplexityHandled > 0.8) {
      return 'advanced';
    } else if (avgGrowth > 0.4 && sessionHistory.avgComplexityHandled > 0.5) {
      return 'intermediate';
    } else {
      return 'introductory';
    }
  })();

  // Structure level - decreases as user becomes more capable
  const structureLevel: UIAdaptationState['structureLevel'] = (() => {
    if (userGrowth.conceptualCapacity > 0.6) return 'minimal';
    if (userGrowth.conceptualCapacity > 0.3) return 'medium';
    return 'high';
  })();

  // Pace preference based on interaction history
  const pacePreference: UIAdaptationState['pacePreference'] = (() => {
    if (sessionHistory.totalInteractions > 50 && sessionHistory.preferredInteractionStyle === 'direct') {
      return 'fast';
    } else if (sessionHistory.preferredInteractionStyle === 'exploratory') {
      return 'moderate';
    } else {
      return 'slow';
    }
  })();

  // Visual complexity based on tolerance and preference
  const visualComplexity: UIAdaptationState['visualComplexity'] = (() => {
    if (complexityLevel === 'advanced' && sessionHistory.overwhelmTriggers.length < 2) {
      return 'full';
    } else if (complexityLevel === 'intermediate') {
      return 'rich';
    } else {
      return 'simple';
    }
  })();

  // Interaction depth based on otherness tolerance
  const interactionDepth: UIAdaptationState['interactionDepth'] = (() => {
    if (userGrowth.othernessTolerance > 0.6) return 'deep';
    if (userGrowth.othernessTolerance > 0.3) return 'medium';
    return 'surface';
  })();

  // Safeguard level based on overwhelm history
  const safeguardLevel: UIAdaptationState['safeguardLevel'] = (() => {
    if (sessionHistory.overwhelmTriggers.length > 3) return 'protective';
    if (sessionHistory.overwhelmTriggers.length > 1) return 'moderate';
    return 'open';
  })();

  return {
    complexityLevel,
    structureLevel,
    pacePreference,
    visualComplexity,
    interactionDepth,
    safeguardLevel
  };
}

// ==========================================================================
// ADAPTATION COMPONENTS
// ==========================================================================

interface ComplexityAdaptiveContainerProps {
  children: React.ReactNode;
  fallbackContent?: React.ReactNode;
  className?: string;
}

export function ComplexityAdaptiveContainer({ 
  children, 
  fallbackContent, 
  className = '' 
}: ComplexityAdaptiveContainerProps) {
  const { adaptationState } = useAdaptiveUI();
  
  const canShowComplexity = adaptationState.complexityLevel !== 'introductory';
  
  return (
    <div className={`complexity-adaptive ${className}`}>
      {canShowComplexity ? children : (fallbackContent || children)}
    </div>
  );
}

interface PaceAdaptiveProps {
  children: React.ReactNode;
  className?: string;
}

export function PaceAdaptiveContainer({ children, className = '' }: PaceAdaptiveProps) {
  const { adaptationState } = useAdaptiveUI();
  
  const paceClasses = {
    slow: 'pace-slow transition-all duration-1000',
    moderate: 'pace-moderate transition-all duration-500', 
    fast: 'pace-fast transition-all duration-200'
  };
  
  return (
    <div className={`${paceClasses[adaptationState.pacePreference]} ${className}`}>
      {children}
    </div>
  );
}

interface StructureAdaptiveProps {
  children: React.ReactNode;
  highStructure?: React.ReactNode;
  mediumStructure?: React.ReactNode;
  minimalStructure?: React.ReactNode;
  className?: string;
}

export function StructureAdaptiveContainer({
  children,
  highStructure,
  mediumStructure,
  minimalStructure,
  className = ''
}: StructureAdaptiveProps) {
  const { adaptationState } = useAdaptiveUI();
  
  const getContent = () => {
    switch (adaptationState.structureLevel) {
      case 'high':
        return highStructure || children;
      case 'medium':
        return mediumStructure || children;
      case 'minimal':
        return minimalStructure || children;
      default:
        return children;
    }
  };
  
  return (
    <div className={`structure-${adaptationState.structureLevel} ${className}`}>
      {getContent()}
    </div>
  );
}

// ==========================================================================
// LEARNING INSIGHTS
// ==========================================================================

function generateAdaptationInsight(
  oldState: UIAdaptationState,
  newState: UIAdaptationState
): string | null {
  // Complexity advancement
  if (newState.complexityLevel !== oldState.complexityLevel) {
    const levels = ['introductory', 'intermediate', 'advanced'];
    const oldIndex = levels.indexOf(oldState.complexityLevel);
    const newIndex = levels.indexOf(newState.complexityLevel);
    
    if (newIndex > oldIndex) {
      return `Interface complexity increased to ${newState.complexityLevel} - you&apos;re ready for more nuanced interactions`;
    }
  }
  
  // Structure reduction
  if (newState.structureLevel !== oldState.structureLevel && 
      ['high', 'medium', 'minimal'].indexOf(newState.structureLevel) > 
      ['high', 'medium', 'minimal'].indexOf(oldState.structureLevel)) {
    return `Reduced structural guidance to ${newState.structureLevel} - trusting your ability to navigate independently`;
  }
  
  // Pace adaptation
  if (newState.pacePreference !== oldState.pacePreference) {
    return `Adapted interaction pace to ${newState.pacePreference} based on your engagement patterns`;
  }
  
  // Interaction depth advancement
  if (newState.interactionDepth !== oldState.interactionDepth &&
      ['surface', 'medium', 'deep'].indexOf(newState.interactionDepth) >
      ['surface', 'medium', 'deep'].indexOf(oldState.interactionDepth)) {
    return `Enabling deeper dialogue interactions - you&apos;re showing readiness for more otherness`;
  }
  
  return null;
}

interface AdaptationInsightsPanelProps {
  insights: string[];
}

function AdaptationInsightsPanel({ insights }: AdaptationInsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="adaptation-insights mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        <span>🧠</span>
        <span>Interface Learning</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-1">
          {insights.map((insight, index) => (
            <div key={index} className="text-xs text-slate-600 p-2 bg-white rounded border">
              {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

function hasSignificantChange(
  oldState: UIAdaptationState,
  newState: UIAdaptationState
): boolean {
  const significantFields: (keyof UIAdaptationState)[] = [
    'complexityLevel', 
    'structureLevel', 
    'interactionDepth'
  ];
  
  return significantFields.some(field => oldState[field] !== newState[field]);
}

function getUIClasses(adaptationState: UIAdaptationState): string {
  const classes = [
    `complexity-${adaptationState.complexityLevel}`,
    `structure-${adaptationState.structureLevel}`,
    `pace-${adaptationState.pacePreference}`,
    `visual-${adaptationState.visualComplexity}`,
    `depth-${adaptationState.interactionDepth}`,
    `safeguard-${adaptationState.safeguardLevel}`
  ];
  
  return classes.join(' ');
}

// ==========================================================================
// SAFEGUARD COMPONENT
// ==========================================================================

interface SafeguardedInteractionProps {
  children: React.ReactNode;
  emergencySimplification?: React.ReactNode;
  warningThreshold?: number; // 0-1
  currentComplexity?: number; // 0-1
}

export function SafeguardedInteraction({
  children,
  emergencySimplification,
  warningThreshold = 0.8,
  currentComplexity = 0.5
}: SafeguardedInteractionProps) {
  const { adaptationState } = useAdaptiveUI();
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (adaptationState.safeguardLevel === 'protective' && 
        currentComplexity > warningThreshold) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [adaptationState.safeguardLevel, currentComplexity, warningThreshold]);
  
  if (showWarning && emergencySimplification) {
    return (
      <div className="safeguarded-interaction">
        <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
          Simplifying to focus on what&apos;s most important right now.
        </div>
        {emergencySimplification}
      </div>
    );
  }
  
  return <>{children}</>;
}

// ==========================================================================
// GROWTH MOMENTUM TRACKER
// ==========================================================================

interface GrowthMomentumProps {
  userGrowth: ConversationMemory['userGrowth'];
  recentGrowthEvents: Array<{
    timestamp: Date;
    type: 'conceptual' | 'paradox' | 'otherness';
    magnitude: number;
  }>;
  className?: string;
}

export function GrowthMomentumIndicator({
  userGrowth,
  recentGrowthEvents,
  className = ''
}: GrowthMomentumProps) {
  const { adaptationState } = useAdaptiveUI();
  
  // Only show for intermediate+ users
  if (adaptationState.complexityLevel === 'introductory') {
    return null;
  }
  
  const recentMomentum = calculateGrowthMomentum(recentGrowthEvents);
  
  return (
    <div className={`growth-momentum flex items-center gap-2 text-xs text-slate-500 ${className}`}>
      <span>📈</span>
      <span>Growth momentum: {getMomentumLabel(recentMomentum)}</span>
      {recentMomentum > 0.7 && (
        <span className="text-green-600">Ready for new challenges</span>
      )}
    </div>
  );
}

function calculateGrowthMomentum(
  events: Array<{
    timestamp: Date;
    type: 'conceptual' | 'paradox' | 'otherness';
    magnitude: number;
  }>
): number {
  const recent = events.filter(e => 
    Date.now() - e.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
  );
  
  if (recent.length === 0) return 0;
  
  const totalMagnitude = recent.reduce((sum, e) => sum + e.magnitude, 0);
  const avgMagnitude = totalMagnitude / recent.length;
  const frequency = Math.min(recent.length / 7, 1); // Events per day, capped at 1
  
  return avgMagnitude * frequency;
}

function getMomentumLabel(momentum: number): string {
  if (momentum > 0.8) return 'high';
  if (momentum > 0.5) return 'building';
  if (momentum > 0.2) return 'steady';
  return 'gathering';
}