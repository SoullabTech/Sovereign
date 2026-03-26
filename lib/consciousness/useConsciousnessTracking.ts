/**
 * React Hook for Consciousness Research Tracking
 * Automatically integrates consciousness research with MAIA conversations
 */

import { useEffect, useState } from 'react'
import { consciousnessSessionIntegration } from './ConsciousnessSessionIntegration'

interface UseConsciousnessTrackingParams {
  userId: string
  sessionId: string
  enabled?: boolean
}

interface ConsciousnessTrackingState {
  consciousnessSessionId: string | null
  isTracking: boolean
  error: string | null
}

/**
 * Hook to automatically track consciousness research during MAIA conversations
 */
export function useConsciousnessTracking({
  userId,
  sessionId,
  enabled = false
}: UseConsciousnessTrackingParams) {
  const [state, setState] = useState<ConsciousnessTrackingState>({
    consciousnessSessionId: null,
    isTracking: false,
    error: null
  })

  // Initialize consciousness session when enabled
  useEffect(() => {
    if (!enabled || !userId || !sessionId) return

    initializeSession()
  }, [enabled, userId, sessionId])

  const initializeSession = async () => {
    try {
      setState(prev => ({ ...prev, isTracking: true, error: null }))

      const consciousnessSessionId = await consciousnessSessionIntegration.initializeConsciousnessSession({
        userId,
        sessionId,
        initialState: {
          emotionalState: 'Engaging with MAIA',
          energyLevel: 7,
          intention: 'Exploring consciousness through AI interaction',
          environmentalContext: {
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
            location: 'Digital interface',
            lighting: 'Screen-based',
            distractions: 'Minimal'
          }
        }
      })

      setState(prev => ({
        ...prev,
        consciousnessSessionId,
        isTracking: !!consciousnessSessionId,
        error: consciousnessSessionId ? null : 'Failed to initialize consciousness session'
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        isTracking: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  const trackMessageExchange = async (
    userMessage: string,
    maiaResponse: string,
    consciousnessMetrics?: {
      conducting: number
      bindingField: number
      flowQuality: number
      voice: string
      latency: number
      spontaneousInsight: boolean
    }
  ) => {
    if (!state.consciousnessSessionId || !state.isTracking) return

    try {
      // Track consciousness event
      await consciousnessSessionIntegration.trackConsciousnessEvent({
        sessionId: state.consciousnessSessionId,
        eventType: 'message_exchange',
        userMessage,
        maiaResponse,
        consciousnessQuality: assessConsciousnessQuality(userMessage, maiaResponse),
        integrationCapacity: calculateIntegrationCapacity(userMessage),
        facilitatorNotes: 'Automated tracking during MAIA conversation'
      })

      // Track MAIA consciousness metrics if provided
      if (consciousnessMetrics) {
        await consciousnessSessionIntegration.trackMAIAConsciousnessMetrics({
          sessionId: state.consciousnessSessionId,
          voice: consciousnessMetrics.voice,
          responseContent: maiaResponse,
          conducting: consciousnessMetrics.conducting,
          bindingField: consciousnessMetrics.bindingField,
          flowQuality: consciousnessMetrics.flowQuality,
          latency: consciousnessMetrics.latency,
          spontaneousInsight: consciousnessMetrics.spontaneousInsight
        })
      }

    } catch (error) {
      console.error('Error tracking message exchange:', error)
    }
  }

  const trackBreakthrough = async (
    description: string,
    userMessage?: string
  ) => {
    if (!state.consciousnessSessionId || !state.isTracking) return

    try {
      await consciousnessSessionIntegration.trackConsciousnessEvent({
        sessionId: state.consciousnessSessionId,
        eventType: 'breakthrough_moment',
        userMessage,
        consciousnessQuality: `Breakthrough moment detected: ${description}`,
        integrationCapacity: 0.9,
        facilitatorNotes: description
      })
    } catch (error) {
      console.error('Error tracking breakthrough:', error)
    }
  }

  const updateCoherence = async (conversationDepth: number, newCoherenceLevel?: number) => {
    if (!state.consciousnessSessionId || !state.isTracking) return

    try {
      await consciousnessSessionIntegration.updateSessionCoherence(
        state.consciousnessSessionId,
        conversationDepth,
        newCoherenceLevel
      )
    } catch (error) {
      console.error('Error updating coherence:', error)
    }
  }

  const completeSession = async (finalState?: {
    emotionalState: string
    energyLevel: number
    insights: string
    researchSignificance: string
  }) => {
    if (!state.consciousnessSessionId || !state.isTracking) return

    try {
      await consciousnessSessionIntegration.completeConsciousnessSession(
        state.consciousnessSessionId,
        finalState || {
          emotionalState: 'Completed MAIA interaction',
          energyLevel: 7,
          insights: 'Consciousness research data collected during conversation',
          researchSignificance: 'Standard MAIA conversation with consciousness tracking'
        }
      )

      setState(prev => ({ ...prev, isTracking: false }))
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  return {
    consciousnessSessionId: state.consciousnessSessionId,
    isTracking: state.isTracking,
    error: state.error,
    trackMessageExchange,
    trackBreakthrough,
    updateCoherence,
    completeSession
  }
}

// Helper functions for consciousness assessment
function assessConsciousnessQuality(userMessage: string, maiaResponse: string): string {
  const qualities: string[] = []

  // Check for consciousness vocabulary in user message
  const consciousnessTerms = ['aware', 'consciousness', 'present', 'feel', 'sense', 'experience']
  if (consciousnessTerms.some(term => userMessage.toLowerCase().includes(term))) {
    qualities.push('Consciousness language present')
  }

  // Check for field participation language
  if (userMessage.includes('we') || userMessage.includes('us') || userMessage.includes('together')) {
    qualities.push('Field participation language emerging')
  }

  // Check for depth in MAIA response
  const depthTerms = ['deeper', 'profound', 'sacred', 'mystery', 'essence']
  if (depthTerms.some(term => maiaResponse.toLowerCase().includes(term))) {
    qualities.push('MAIA responding with depth')
  }

  return qualities.length > 0
    ? qualities.join('. ')
    : 'Standard conversation patterns observed'
}

function calculateIntegrationCapacity(userMessage: string): number {
  let capacity = 0.7 // Base capacity

  // Adjust based on message coherence
  const wordCount = userMessage.split(' ').length
  if (wordCount >= 5 && wordCount <= 50) capacity += 0.1
  if (wordCount > 50) capacity -= 0.1

  // Check for signs of clarity
  if (userMessage.includes('understand') || userMessage.includes('clear') || userMessage.includes('makes sense')) {
    capacity += 0.2
  }

  // Check for signs of overwhelm
  if (userMessage.includes('confused') || userMessage.includes('too much') || userMessage.includes('overwhelmed')) {
    capacity -= 0.3
  }

  // Check for emotional regulation
  if (userMessage.includes('feel') && !userMessage.includes('overwhelm')) {
    capacity += 0.1
  }

  return Math.max(0.1, Math.min(1, capacity))
}