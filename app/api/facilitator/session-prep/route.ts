/**
 * 🎯 FACILITATOR SESSION PREP API
 *
 * Provides facilitators with pre-session intelligence map for member work.
 * Light lift, huge value: MAIA quietly hands facilitators the landscape.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PersonalMetricsService } from '@/lib/services/personal-metrics';
import { getSessionUserId } from '@/lib/auth/session-utils';

// Mock service instances - would be properly injected
const personalMetricsService = new PersonalMetricsService(
  null, null, null, null, null, null
);

export async function GET(request: NextRequest) {
  try {
    const facilitatorId = await getSessionUserId(request);
    if (!facilitatorId) {
      return NextResponse.json({
        error: 'Authentication required for facilitator tools',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Check facilitator permissions
    const isFacilitator = await checkFacilitatorPermissions(facilitatorId);
    if (!isFacilitator) {
      return NextResponse.json({
        error: 'Facilitator permissions required',
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({
        error: 'Missing required parameter: memberId',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get comprehensive session prep data
    const sessionPrep = await generateSessionPrepIntelligence(memberId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: sessionPrep,
      metadata: {
        facilitatorId,
        memberId,
        prepGeneratedAt: new Date().toISOString(),
        confidenceLevel: sessionPrep.dataConfidence
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in facilitator session prep:', error);
    return NextResponse.json({
      error: 'Failed to generate session prep',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==============================================================================
// SESSION PREP INTELLIGENCE GENERATION
// ==============================================================================

interface SessionPrepIntelligence {
  memberSnapshot: {
    memberId: string;
    name: string; // Would come from member profile
    membershipLevel: string;
    lastSessionDate: string | null;
    sessionCount: number;
  };

  currentLandscape: {
    primaryFocus: string;
    spiralLoad: 'light' | 'moderate' | 'intense' | 'overwhelming';
    evolutionMoment: string;
    integrationReadiness: number;
    shadowEngagement: number;
  };

  crossSpiralThemes: {
    theme: string;
    significance: number;
    therapeuticOpportunity: string;
    facilitationApproach: string;
  }[];

  sessionFocusPoints: {
    primary: string;
    secondary: string[];
    cautions: string[];
    doorways: string[]; // Potential openings to explore
  };

  recentActivity: {
    sessions: { date: string; tone: string; topics: string[] }[];
    breakthroughs: { date: string; insight: string; domain: string }[];
    integrationWork: { practice: string; completion: number; notes: string }[];
  };

  facilitatorGuidance: {
    approachStyle: 'gentle' | 'direct' | 'fierce' | 'playful';
    energeticState: string;
    readinessForChallenge: number;
    supportNeeds: string[];
    celebrationOpportunities: string[];
  };

  maiaInsight: {
    sessionWhisper: string;
    deepestEdge: string;
    facilitation_wisdom: string;
  };

  dataConfidence: number;
  lastUpdated: string;
}

async function generateSessionPrepIntelligence(memberId: string): Promise<SessionPrepIntelligence> {
  // Get full personal metrics snapshot
  const metricsSnapshot = await personalMetricsService.getPersonalMetricsSnapshot(memberId, 'facilitator');

  // Generate facilitator-specific intelligence
  const currentLandscape = {
    primaryFocus: metricsSnapshot.insights.currentFocus,
    spiralLoad: metricsSnapshot.spiralConstellation.spiralLoad,
    evolutionMoment: metricsSnapshot.development.evolutionTrend,
    integrationReadiness: metricsSnapshot.development.integrationIndex,
    shadowEngagement: metricsSnapshot.development.shadowEngagementIndex
  };

  // Extract cross-spiral themes for facilitation
  const crossSpiralThemes = generateCrossSpiralThemes(metricsSnapshot);

  // Generate session focus points
  const sessionFocusPoints = generateSessionFocusPoints(metricsSnapshot);

  // Create facilitator guidance
  const facilitatorGuidance = generateFacilitatorGuidance(metricsSnapshot);

  // Generate MAIA's facilitation wisdom
  const maiaInsight = generateMAIAFacilitationInsight(metricsSnapshot);

  return {
    memberSnapshot: {
      memberId,
      name: 'Member', // Would come from actual member data
      membershipLevel: 'premium',
      lastSessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sessionCount: metricsSnapshot.engagement.sessionsLast30Days
    },

    currentLandscape,
    crossSpiralThemes,
    sessionFocusPoints,

    recentActivity: {
      sessions: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          tone: 'exploratory',
          topics: ['relationship boundaries', 'emotional regulation']
        }
      ],
      breakthroughs: [
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          insight: 'Boundaries actually create more intimacy',
          domain: 'relationship'
        }
      ],
      integrationWork: [
        {
          practice: 'Daily boundary check-ins',
          completion: 0.7,
          notes: 'Consistent with partner, struggling with family'
        }
      ]
    },

    facilitatorGuidance,
    maiaInsight,
    dataConfidence: metricsSnapshot.dataConfidence,
    lastUpdated: new Date().toISOString()
  };
}

function generateCrossSpiralThemes(snapshot: any) {
  return [
    {
      theme: 'Authority integration across relationship and vocation',
      significance: 0.85,
      therapeuticOpportunity: 'Explore how professional confidence can support relationship authenticity',
      facilitationApproach: 'Use somatic awareness to bridge domains - where do they feel authority in body?'
    },
    {
      theme: 'Creative expression as emotional regulation',
      significance: 0.72,
      therapeuticOpportunity: 'Creativity spiral supporting emotional water work',
      facilitationApproach: 'Invite creative expression of relationship challenges'
    }
  ];
}

function generateSessionFocusPoints(snapshot: any) {
  const spiralLoad = snapshot.spiralConstellation.spiralLoad;
  const integrationIndex = snapshot.development.integrationIndex;
  const shadowEngagement = snapshot.development.shadowEngagementIndex;

  let primary = 'Integration of recent insights into daily practice';
  let secondary = ['Emotional regulation support', 'Relationship boundary practice'];
  let cautions = [];
  let doorways = ['Creative expression', 'Somatic awareness'];

  if (spiralLoad === 'overwhelming') {
    primary = 'Nervous system regulation and spiral prioritization';
    cautions.push('Member may be carrying too much - focus on grounding');
  }

  if (integrationIndex < 0.5) {
    secondary.unshift('Bridge insights to concrete action');
  }

  if (shadowEngagement < 0.5) {
    doorways.push('Gentle shadow invitation');
    cautions.push('Respect member\'s shadow readiness');
  }

  return {
    primary,
    secondary,
    cautions,
    doorways
  };
}

function generateFacilitatorGuidance(snapshot: any) {
  const evolutionTrend = snapshot.development.evolutionTrend;
  const integrationIndex = snapshot.development.integrationIndex;
  const engagement = snapshot.engagement;

  let approachStyle: 'gentle' | 'direct' | 'fierce' | 'playful' = 'gentle';
  let energeticState = 'Stable and ready for exploration';
  let readinessForChallenge = 0.6;

  if (evolutionTrend === 'transcending') {
    approachStyle = 'direct';
    energeticState = 'Expanded and integrating new capacity';
    readinessForChallenge = 0.9;
  } else if (evolutionTrend === 'integrating') {
    approachStyle = 'gentle';
    energeticState = 'Stabilizing and weaving new patterns';
    readinessForChallenge = 0.4;
  } else if (engagement.sessionDepth === 'transformative') {
    approachStyle = 'direct';
    readinessForChallenge = 0.8;
  }

  const supportNeeds = [];
  if (integrationIndex < 0.6) supportNeeds.push('Integration support');
  if (snapshot.spiralConstellation.harmonicCoherence < 0.7) supportNeeds.push('Cross-pattern coherence');

  const celebrationOpportunities = [];
  if (integrationIndex > 0.7) celebrationOpportunities.push('Strong integration capacity');
  if (snapshot.development.shadowEngagementIndex > 0.7) celebrationOpportunities.push('Courageous shadow work');

  return {
    approachStyle,
    energeticState,
    readinessForChallenge,
    supportNeeds,
    celebrationOpportunities
  };
}

function generateMAIAFacilitationInsight(snapshot: any) {
  const spiralLoad = snapshot.spiralConstellation.spiralLoad;
  const evolutionTrend = snapshot.development.evolutionTrend;

  let sessionWhisper = 'This member is in a beautiful unfolding process. Trust what wants to emerge.';
  let deepestEdge = 'Integration of vulnerability and strength across life areas';
  let facilitation_wisdom = 'Create space for both expansion and grounding. They\'re ready for deeper work but need nervous system support.';

  if (spiralLoad === 'overwhelming') {
    sessionWhisper = 'This soul is carrying a lot right now. Focus on nervous system care and gentle prioritization.';
    facilitation_wisdom = 'Less is more. Help them choose one spiral for focus and trust the rest can rest.';
  }

  if (evolutionTrend === 'transcending') {
    sessionWhisper = 'They\'re moving through a profound threshold. Hold space for the magnitude of their becoming.';
    deepestEdge = 'Integrating expanded consciousness into human life';
    facilitation_wisdom = 'They may need help grounding new capacity. Support embodiment over expansion right now.';
  }

  return {
    sessionWhisper,
    deepestEdge,
    facilitation_wisdom
  };
}

// ==============================================================================
// PERMISSION CHECKING
// ==============================================================================

async function checkFacilitatorPermissions(userId: string): Promise<boolean> {
  // Mock implementation - would check actual role/permissions
  return true; // For demo purposes
}

async function getSessionUserId(request: NextRequest): Promise<string | null> {
  // Mock implementation
  return 'facilitator_demo_123';
}