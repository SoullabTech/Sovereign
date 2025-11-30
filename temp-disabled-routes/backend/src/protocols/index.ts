/**
 * Oracle Protocol System
 * Unified exports for all protocol modules
 */

// Catastrophic Guard
export {
  CatastrophicFailureGuard,
  CatastrophicType,
  CatastrophicSignal
} from './CatastrophicFailureGuard';

// Looping Protocol
export {
  LoopingProtocolImpl,
  LoopingState,
  LoopingTriggers,
  LoopingIntensity,
  ElementalSignal,
  ArchetypePattern,
  DepthInference,
  createLoopingProtocol
} from './LoopingProtocol';

// Looping Integration
export {
  LoopingProtocolIntegration
} from './LoopingProtocolIntegration';

// Convergence Tracker
export {
  ConvergenceTracker,
  ConvergenceIndicators,
  ConvergenceSignal,
  ConversationPhase
} from './ConvergenceTracker';

// Boundary Detector
export {
  BoundarySignal,
  analyzeBoundaries,
  shouldPauseProtocols,
  getWitnessStance
} from './BoundaryDetector';

// Urgency Detector
export {
  UrgencySignal,
  analyzeUrgency,
  shouldOverrideProtocols,
  getResponseLength,
  getUrgencyMode
} from './UrgencyDetector';

// Contemplative Space
export {
  ContemplativeSignal,
  ContemplativeContext,
  analyzeContemplative,
  assess as assessContemplative,
  createContemplativeTransition,
  shouldExitContemplative
} from './ContemplativeSpace';

// Elemental Resonance
export {
  ElementalSignal as ElementalResonanceSignal,
  ElementalContext,
  analyzeResonance,
  infuseElementalTone,
  detectElementalShift,
  getElementalVoiceQuality
} from './ElementalResonance';

// Story Weaver
export {
  StorySignal,
  StoryContext,
  checkInvocation as checkStoryInvocation,
  analyzeStory,
  isStoryAppropriate,
  weaveStoryElements
} from './StoryWeaver';

// Crisis Resource Router
export {
  CrisisResourceRouter,
  CrisisResource,
  ResourceRecommendation
} from './CrisisResourceRouter';

// Sacred Interrupt System
export {
  SacredInterruptSystem,
  InterruptType,
  InterruptSignal,
  InterruptResponse
} from './SacredInterruptSystem';

// Looping Deployment Config
export {
  LoopingDeploymentConfig,
  DeploymentMode,
  SafetyConfig,
  MonitoringConfig,
  QualityGates
} from './LoopingDeploymentConfig';

// Looping Monitor
export {
  LoopingMonitor,
  MonitoringEvent,
  MonitoringMetrics,
  SessionMetrics,
  AlertType
} from './LoopingMonitor';

// Looping Dialogue Templates
export {
  LoopingDialogueTemplates,
  DialogueTemplate,
  TemplateContext
} from './LoopingDialogueTemplates';

// Integrated Looping Flow
export {
  IntegratedLoopingFlow,
  FlowState,
  FlowContext,
  FlowDecision
} from './IntegratedLoopingFlow';