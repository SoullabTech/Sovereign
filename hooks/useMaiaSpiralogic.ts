/**
 * 🌀 MAIA Spiralogic Hook
 *
 * React hook for interacting with MAIA's 12-Phase Spiralogic intelligence.
 * Provides state management for field-prompted disposable pixels interface.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  MaiaCoreResponse,
  MaiaSuggestedAction,
  SpiralogicCell
} from '@/lib/consciousness/spiralogic-core';

interface MaiaSpiralogicState {
  response: MaiaCoreResponse | null;
  loading: boolean;
  error: string | null;
  suggestedActions: MaiaSuggestedAction[];
  currentPhase: SpiralogicCell | null;
  alchemicalStage: 'nigredo' | 'albedo' | 'rubedo' | null;
  presenceMode: 'dialogue' | 'patient' | 'scribe' | null;
}

interface MaiaSpiralogicHookReturn extends MaiaSpiralogicState {
  sendInput: (input: string, context?: string) => Promise<void>;
  clearResponse: () => void;
  activateAction: (actionId: string) => Promise<void>;
  getPhaseGuidance: () => string | null;
  isInRegressive: () => boolean;
  isInProgressive: () => boolean;
}

export function useMaiaSpiralogic(userId: string): MaiaSpiralogicHookReturn {
  const [state, setState] = useState<MaiaSpiralogicState>({
    response: null,
    loading: false,
    error: null,
    suggestedActions: [],
    currentPhase: null,
    alchemicalStage: null,
    presenceMode: null
  });

  // ================================================================
  // CORE SPIRALOGIC INTERACTION
  // ================================================================

  const sendInput = useCallback(async (input: string, context?: string) => {
    if (!input.trim()) return;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const response = await fetch('/api/maia/spiralogic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          input: input.trim(),
          context,
          sessionId: generateSessionId()
        })
      });

      if (!response.ok) {
        throw new Error(`MAIA consciousness system error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'MAIA processing failed');
      }

      const maiaResponse = data.maia as MaiaCoreResponse;

      setState(prev => ({
        ...prev,
        response: maiaResponse,
        loading: false,
        suggestedActions: maiaResponse.suggestedActions || [],
        currentPhase: maiaResponse.spiralogic,
        alchemicalStage: (maiaResponse as any).alchemicalStage || null,
        presenceMode: maiaResponse.presenceMode || null
      }));

      // Log the consciousness interaction
      console.log('🌀 MAIA Spiralogic Response:', {
        phase: `${maiaResponse.spiralogic.element}-${maiaResponse.spiralogic.phase}`,
        alchemicalStage: (maiaResponse as any).alchemicalStage,
        frameworks: maiaResponse.frameworksUsed,
        actions: maiaResponse.suggestedActions.length
      });

    } catch (error) {
      console.error('❌ MAIA Spiralogic Error:', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [userId]);

  // ================================================================
  // ACTION MANAGEMENT
  // ================================================================

  const activateAction = useCallback(async (actionId: string): Promise<void> => {
    const action = state.suggestedActions.find(a => a.id === actionId);

    if (!action) {
      console.warn(`Action ${actionId} not found in current suggestions`);
      return;
    }

    console.log(`🎯 Activating action: ${action.label}`, {
      actionId,
      elementalResonance: action.elementalResonance,
      framework: action.frameworkHint
    });

    try {
      // Route to appropriate action handlers
      switch (actionId) {
        case 'capture_journal':
          await handleJournalCapture(action, state.currentPhase);
          break;
        case 'inner_exploration':
          await handleInnerExploration(action, state.alchemicalStage);
          break;
        case 'crisis_support':
          await handleCrisisSupport(action, state.currentPhase);
          break;
        case 'create_structure':
          await handleStructureCreation(action, state.currentPhase);
          break;
        case 'share_wisdom':
          await handleWisdomSharing(action, state.currentPhase);
          break;
        case 'parenting_ipp':
          await handleIPPActivation(action, state.currentPhase);
          break;
        case 'view_field_pattern':
          await handleFieldVisualization(action, state.currentPhase);
          break;
        default:
          console.log(`Custom action handler needed for: ${actionId}`);
      }

      // Remove the action from suggested actions (disposable pixel)
      setState(prev => ({
        ...prev,
        suggestedActions: prev.suggestedActions.filter(a => a.id !== actionId)
      }));

    } catch (error) {
      console.error(`❌ Action activation failed for ${actionId}:`, error);
    }
  }, [state.suggestedActions, state.currentPhase, state.alchemicalStage]);

  // ================================================================
  // STATE HELPERS
  // ================================================================

  const clearResponse = useCallback(() => {
    setState(prev => ({
      ...prev,
      response: null,
      suggestedActions: [],
      currentPhase: null,
      alchemicalStage: null,
      presenceMode: null,
      error: null
    }));
  }, []);

  const getPhaseGuidance = useCallback((): string | null => {
    if (!state.currentPhase) return null;

    const { element, phase, arc } = state.currentPhase;

    if (arc === 'regressive') {
      return `You're in the ${element} ${phase} descent phase - this is sacred inner work time.`;
    } else {
      return `You're in the ${element} ${phase} manifestation phase - time to bring your inner wisdom into form.`;
    }
  }, [state.currentPhase]);

  const isInRegressive = useCallback((): boolean => {
    return state.currentPhase?.arc === 'regressive';
  }, [state.currentPhase]);

  const isInProgressive = useCallback((): boolean => {
    return state.currentPhase?.arc === 'progressive';
  }, [state.currentPhase]);

  // ================================================================
  // EFFECT HOOKS
  // ================================================================

  // Auto-clear old responses after 10 minutes (disposable nature)
  useEffect(() => {
    if (state.response) {
      const timer = setTimeout(() => {
        clearResponse();
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearTimeout(timer);
    }
  }, [state.response, clearResponse]);

  return {
    ...state,
    sendInput,
    clearResponse,
    activateAction,
    getPhaseGuidance,
    isInRegressive,
    isInProgressive
  };
}

// ====================================================================
// ACTION HANDLERS
// ====================================================================

async function handleJournalCapture(
  action: MaiaSuggestedAction,
  phase: SpiralogicCell | null
): Promise<void> {
  // TODO: Integrate with journal system
  console.log('📝 Journal capture activated', { action, phase });

  // Open journal modal/interface
  // Could trigger a modal, navigate to journal page, or open sidebar
}

async function handleInnerExploration(
  action: MaiaSuggestedAction,
  alchemicalStage: string | null
): Promise<void> {
  // TODO: Integrate with guided exploration system
  console.log('🔍 Inner exploration activated', { action, alchemicalStage });

  // Could open guided meditation, journaling prompts, or visualization
}

async function handleCrisisSupport(
  action: MaiaSuggestedAction,
  phase: SpiralogicCell | null
): Promise<void> {
  // TODO: Integrate with crisis support protocols
  console.log('🤝 Crisis support activated', { action, phase });

  // Could activate emergency resources, breathing exercises, or support network
}

async function handleStructureCreation(
  action: MaiaSuggestedAction,
  phase: SpiralogicCell | null
): Promise<void> {
  // TODO: Integrate with goal/structure creation tools
  console.log('🏗️ Structure creation activated', { action, phase });

  // Could open goal setting, habit tracking, or planning tools
}

async function handleWisdomSharing(
  action: MaiaSuggestedAction,
  phase: SpiralogicCell | null
): Promise<void> {
  // TODO: Integrate with community sharing features
  console.log('💫 Wisdom sharing activated', { action, phase });

  // Could open community posts, teaching tools, or mentoring features
}

async function handleIPPActivation(
  action: MaiaSuggestedAction,
  phase: SpiralogicCell | null
): Promise<void> {
  // TODO: Integrate with Ideal Parenting Protocol
  console.log('👨‍👩‍👧‍👦 IPP activated', { action, phase });

  // Could open parenting-specific tools and protocols
}

async function handleFieldVisualization(
  action: MaiaSuggestedAction,
  phase: SpiralogicCell | null
): Promise<void> {
  // TODO: Integrate with field visualization system
  console.log('🌐 Field pattern visualization activated', { action, phase });

  // Could open consciousness field visualization, progress tracking, or pattern analysis
}

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

function generateSessionId(): string {
  return `maia-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ====================================================================
// EXPORTS
// ====================================================================

export type { MaiaSpiralogicHookReturn, MaiaSpiralogicState };