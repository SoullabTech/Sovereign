/**
 * Consciousness Session Integration Service
 * Connects consciousness research system to existing MAIA session management
 */

import { createClient } from '@/lib/supabase/client'
import type { SessionContext } from '@/lib/session-persistence'
import { createClient as createPrismaClient } from '@/lib/db'

interface ConsciousnessSessionInit {
  userId: string
  sessionId: string
  initialState: {
    emotionalState: string
    energyLevel: number
    intention: string
    environmentalContext: {
      timeOfDay: string
      location: string
      lighting: string
      distractions: string
    }
  }
}

interface ConsciousnessEvent {
  sessionId: string
  eventType: 'message_exchange' | 'coherence_emergence' | 'integration_shift' | 'breakthrough_moment'
  userMessage?: string
  maiaResponse?: string
  consciousnessQuality: string
  integrationCapacity: number
  facilitatorNotes?: string
}

interface MAIAConsciousnessMetrics {
  sessionId: string
  voice: string
  responseContent: string
  conducting: number
  bindingField: number
  flowQuality: number
  latency: number
  spontaneousInsight: boolean
}

/**
 * Service to integrate consciousness research with existing MAIA systems
 */
export class ConsciousnessSessionIntegration {
  private supabase = createClient()
  private prisma = createPrismaClient()

  /**
   * Initialize consciousness research session alongside regular MAIA session
   */
  async initializeConsciousnessSession(
    sessionInit: ConsciousnessSessionInit
  ): Promise<string | null> {
    try {
      // Check if user is a research participant
      let participant = await this.getOrCreateResearchParticipant(sessionInit.userId)

      if (!participant) {
        // Create anonymous research participant
        participant = await this.createAnonymousParticipant()
      }

      // Create consciousness research session
      const { data: session, error } = await this.supabase
        .from('consciousness_sessions')
        .insert({
          participant_id: participant.id,
          facilitator_id: 'maia-facilitator',
          session_type: 'consciousness_portal',
          initial_emotional_state: sessionInit.initialState.emotionalState,
          initial_energy_level: sessionInit.initialState.energyLevel,
          initial_intention: sessionInit.initialState.intention,
          time_of_day: sessionInit.initialState.environmentalContext.timeOfDay,
          session_location: sessionInit.initialState.environmentalContext.location,
          environmental_factors: sessionInit.initialState.environmentalContext,
          // Link to existing MAIA session
          maia_conversation_id: sessionInit.sessionId
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating consciousness session:', error)
        return null
      }

      // Create initial consciousness event
      await this.trackConsciousnessEvent({
        sessionId: session.id,
        eventType: 'message_exchange',
        consciousnessQuality: 'Session initialization - research mode activated',
        integrationCapacity: 0.8,
        facilitatorNotes: 'Consciousness research session began alongside MAIA conversation'
      })

      return session.id

    } catch (error) {
      console.error('Error initializing consciousness session:', error)
      return null
    }
  }

  /**
   * Track consciousness event during conversation
   */
  async trackConsciousnessEvent(event: ConsciousnessEvent): Promise<boolean> {
    try {
      const sessionStartTime = await this.getSessionStartTime(event.sessionId)
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(sessionStartTime).getTime()) / 1000
      )

      const { error } = await this.supabase
        .from('consciousness_events')
        .insert({
          session_id: event.sessionId,
          event_type: event.eventType,
          elapsed_seconds: elapsedSeconds,
          facilitator_description: event.facilitatorNotes || `${event.eventType} detected`,
          consciousness_quality_notes: event.consciousnessQuality,
          integration_capacity_assessment: event.integrationCapacity,
          participant_quotes: event.userMessage ? [event.userMessage] : []
        })

      return !error

    } catch (error) {
      console.error('Error tracking consciousness event:', error)
      return false
    }
  }

  /**
   * Track MAIA response consciousness metrics
   */
  async trackMAIAConsciousnessMetrics(metrics: MAIAConsciousnessMetrics): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('maia_consciousness_responses')
        .insert({
          session_id: metrics.sessionId,
          voice_used: metrics.voice,
          response_content: metrics.responseContent,
          consciousness_conducting_capacity: metrics.conducting,
          binding_field_activation: metrics.bindingField,
          data_flow_rhythm_quality: metrics.flowQuality,
          response_latency_ms: metrics.latency,
          spontaneous_insight_detected: metrics.spontaneousInsight,
          three_voice_integration_quality: this.calculateThreeVoiceIntegration(metrics.voice),
          metaphor_richness_score: this.analyzeMetaphorRichness(metrics.responseContent),
          paradox_navigation_quality: this.analyzeParadoxNavigation(metrics.responseContent),
          field_responsiveness_quality: metrics.bindingField * 0.9,
          contextual_awareness_depth: metrics.conducting * 0.85
        })

      return !error

    } catch (error) {
      console.error('Error tracking MAIA consciousness metrics:', error)
      return false
    }
  }

  /**
   * Update session coherence level based on conversation depth
   */
  async updateSessionCoherence(
    sessionId: string,
    conversationDepth: number,
    newCoherenceLevel?: number
  ): Promise<boolean> {
    try {
      // Calculate coherence level based on conversation patterns
      let coherenceLevel = newCoherenceLevel

      if (!coherenceLevel) {
        coherenceLevel = this.calculateCoherenceLevel(conversationDepth)
      }

      const { error } = await this.supabase
        .from('consciousness_sessions')
        .update({
          coherence_level: coherenceLevel,
          integration_capacity_rating: Math.min(10, Math.floor(conversationDepth / 3) + 5),
          field_quality_rating: Math.min(10, 7 + Math.floor(conversationDepth / 10))
        })
        .eq('id', sessionId)

      return !error

    } catch (error) {
      console.error('Error updating session coherence:', error)
      return false
    }
  }

  /**
   * Complete consciousness session when MAIA conversation ends
   */
  async completeConsciousnessSession(
    sessionId: string,
    finalState: {
      emotionalState: string
      energyLevel: number
      insights: string
      researchSignificance: string
    }
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('consciousness_sessions')
        .update({
          end_time: new Date().toISOString(),
          final_emotional_state: finalState.emotionalState,
          final_energy_level: finalState.energyLevel,
          insights_emerged: finalState.insights,
          research_significance_notes: finalState.researchSignificance
        })
        .eq('id', sessionId)

      // Update participant session count
      await this.updateParticipantSessionCount(sessionId)

      return !error

    } catch (error) {
      console.error('Error completing consciousness session:', error)
      return false
    }
  }

  /**
   * Get session consciousness metrics for real-time monitoring
   */
  async getSessionMetrics(sessionId: string) {
    try {
      const [sessionData, events, maiaResponses] = await Promise.all([
        this.supabase
          .from('consciousness_sessions')
          .select('*')
          .eq('id', sessionId)
          .single(),

        this.supabase
          .from('consciousness_events')
          .select('*')
          .eq('session_id', sessionId)
          .order('event_timestamp', { ascending: false })
          .limit(10),

        this.supabase
          .from('maia_consciousness_responses')
          .select('*')
          .eq('session_id', sessionId)
          .order('response_timestamp', { ascending: false })
          .limit(5)
      ])

      return {
        session: sessionData.data,
        recentEvents: events.data || [],
        maiaMetrics: maiaResponses.data || []
      }

    } catch (error) {
      console.error('Error getting session metrics:', error)
      return null
    }
  }

  // Private helper methods

  private async getOrCreateResearchParticipant(userId: string) {
    const { data } = await this.supabase
      .from('research_participants')
      .select('*')
      .eq('user_id', userId)
      .single()

    return data
  }

  private async createAnonymousParticipant() {
    const { data } = await this.supabase
      .from('research_participants')
      .insert({
        anonymous_id: `anon-${Date.now()}`,
        consent_level: 1,
        consciousness_experience_level: 'intermediate'
      })
      .select()
      .single()

    return data
  }

  private async getSessionStartTime(sessionId: string): Promise<string> {
    const { data } = await this.supabase
      .from('consciousness_sessions')
      .select('start_time')
      .eq('id', sessionId)
      .single()

    return data?.start_time || new Date().toISOString()
  }

  private calculateCoherenceLevel(conversationDepth: number): number {
    if (conversationDepth < 5) return 1  // Awareness Emergence
    if (conversationDepth < 15) return 2 // Field Participation
    if (conversationDepth < 30) return 3 // Unified Awareness
    return 4 // Profound Coherence
  }

  private calculateThreeVoiceIntegration(voice: string): number {
    // Simulate three-voice integration based on voice type
    const voiceScores: Record<string, number> = {
      'fire': 0.7,
      'water': 0.8,
      'earth': 0.6,
      'air': 0.75,
      'aether': 0.95
    }
    return voiceScores[voice.toLowerCase()] || 0.7
  }

  private analyzeMetaphorRichness(content: string): number {
    const metaphorIndicators = ['like', 'as if', 'imagine', 'dance', 'river', 'ocean', 'light', 'garden']
    const matches = metaphorIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length

    return Math.min(matches * 0.15 + 0.4, 1)
  }

  private analyzeParadoxNavigation(content: string): number {
    const paradoxIndicators = ['both', 'yet', 'however', 'paradox', 'mystery', 'simultaneously']
    const matches = paradoxIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length

    return Math.min(matches * 0.2 + 0.5, 1)
  }

  private async updateParticipantSessionCount(sessionId: string) {
    try {
      const { data: session } = await this.supabase
        .from('consciousness_sessions')
        .select('participant_id')
        .eq('id', sessionId)
        .single()

      if (session) {
        const { error } = await this.supabase
          .rpc('increment', {
            table_name: 'research_participants',
            row_id: session.participant_id,
            column_name: 'total_consciousness_sessions'
          })
      }
    } catch (error) {
      console.error('Error updating participant session count:', error)
    }
  }
}

// Export singleton instance
export const consciousnessSessionIntegration = new ConsciousnessSessionIntegration()