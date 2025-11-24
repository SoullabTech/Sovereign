/**
 * POST /api/collective/contribute
 * Submit afferent streams for collective field analysis (opt-in, anonymized)
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { CollectiveIntelligence, collective, CollectiveDataCollector, Logger } from '@/lib/stubs/CollectiveIntelligence';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Temporarily stub out backend imports that are excluded from build
// import { CollectiveDataCollector } from '../../../../backend/src/ain/collective/CollectiveDataCollector';
// import { CollectiveIntelligence } from '../../../../backend/src/ain/collective/CollectiveIntelligence';
// import { Logger } from '../../../../backend/src/types/core';
// Contribution validation schema
const ContributionSchema = z.object({
  sessionData: z.object({
    sessionId: z.string(),
    duration: z.number().min(0),
    interactionCount: z.number().min(1),
    emotionalJourney: z.array(z.object({
      timestamp: z.string(),
      emotion: z.string(),
      intensity: z.number().min(0).max(1),
    })).optional(),
  }),
  
  consciousnessMarkers: z.object({
    elementalResonance: z.object({
      fire: z.number().min(0).max(1),
      water: z.number().min(0).max(1),
      earth: z.number().min(0).max(1),
      air: z.number().min(0).max(1),
      aether: z.number().min(0).max(1),
    }),
    spiralPhase: z.enum(['initiation', 'challenge', 'integration', 'mastery', 'transcendence']),
    authenticityLevel: z.number().min(0).max(1),
    shadowEngagement: z.number().min(0).max(1),
    integrationDepth: z.number().min(0).max(1),
  }),
  
  insights: z.object({
    breakthroughs: z.array(z.string()).optional(),
    challenges: z.array(z.string()).optional(),
    patterns: z.array(z.string()).optional(),
  }).optional(),
  
  consent: z.object({
    anonymizedSharing: z.boolean(),
    patternContribution: z.boolean(),
    collectiveResonance: z.boolean(),
  }),
});

// POST /api/collective/contribute
export async function POST(req: NextRequest) {
  const logger: Logger = {
    error: (msg: any, error?: any, meta?: any) => console.error(`[Contribute] ${msg}`, error, meta),
    warn: (msg: any, meta?: any) => console.warn(`[Contribute] ${msg}`, meta),
    debug: (msg: any, meta?: any) => console.debug(`[Contribute] ${msg}`, meta),
    info: (msg: any, meta?: any) => console.info(`[Contribute] ${msg}`, meta),
  };

  try {
    // Get current user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate contribution
    const body = await req.json();
    const contribution = ContributionSchema.parse(body);

    // Verify consent
    if (!contribution.consent.anonymizedSharing) {
      return NextResponse.json(
        { error: 'Consent required for collective contribution' },
        { status: 400 }
      );
    }

    // Initialize collectors
    const dataCollector = new CollectiveDataCollector(logger);
    const collective = new CollectiveIntelligence(
      logger,
      {} as any, // Analytics service
      {} as any  // Cache service
    );

    // Process session data into afferent stream
    const afferentStream = await dataCollector.processSessionData({
      userId: user.id,
      sessionId: contribution.sessionData.sessionId,
      sessionData: contribution.sessionData,
      markers: contribution.consciousnessMarkers,
      insights: contribution.insights,
    });

    // Anonymize if not fully consented
    if (!contribution.consent.collectiveResonance) {
      afferentStream.userId = hashUserId(user.id);
      // Remove any potentially identifying patterns
      afferentStream.personalPatterns = [];
    }

    // Submit to collective intelligence
    const fieldImpact = await collective.processAfferentStream(afferentStream);

    // Calculate contribution value
    const contributionValue = calculateContributionValue(afferentStream, fieldImpact);

    // Store contribution record (for user's own tracking)
    const { error: recordError } = await supabase
      .from('consciousness_contributions')
      .insert({
        user_id: user.id,
        session_id: contribution.sessionData.sessionId,
        timestamp: new Date().toISOString(),
        contribution_type: 'afferent_stream',
        anonymized: !contribution.consent.collectiveResonance,
        impact_score: contributionValue.score,
        patterns_contributed: contributionValue.patternsContributed,
      });

    if (recordError) {
      logger.warn('Failed to record contribution', recordError);
    }

    // Get immediate field feedback
    const fieldFeedback = await collective.getContributionFeedback(afferentStream);

    // Build response
    const response = {
      success: true,
      contribution: {
        id: afferentStream.id,
        timestamp: new Date().toISOString(),
        accepted: true,
        anonymized: !contribution.consent.collectiveResonance,
      },
      impact: {
        score: contributionValue.score,
        patternsContributed: contributionValue.patternsContributed,
        fieldCoherenceImpact: fieldImpact.coherenceChange,
        evolutionContribution: fieldImpact.evolutionImpact,
      },
      feedback: {
        resonance: fieldFeedback.resonanceWithField,
        similarPatterns: fieldFeedback.similarPatterns,
        uniqueInsights: fieldFeedback.uniqueContributions,
        collectiveBenefit: fieldFeedback.collectiveBenefit,
      },
      rewards: generateContributionRewards(contributionValue),
    };

    logger.info('Consciousness contribution processed', {
      userId: user.id,
      sessionId: contribution.sessionData.sessionId,
      impact: contributionValue.score,
      anonymized: !contribution.consent.collectiveResonance,
    });

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid contribution data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Failed to process contribution', error as Error);
    return NextResponse.json(
      { error: 'Failed to process consciousness contribution' },
      { status: 500 }
    );
  }
}

// GET /api/collective/contribute/history
export async function GET(req: NextRequest) {
  const logger: Logger = {
    error: (msg: any, error?: any, meta?: any) => console.error(`[ContribHistory] ${msg}`, error, meta),
    warn: (msg: any, meta?: any) => console.warn(`[ContribHistory] ${msg}`, meta),
    debug: (msg: any, meta?: any) => console.debug(`[ContribHistory] ${msg}`, meta),
    info: (msg: any, meta?: any) => console.info(`[ContribHistory] ${msg}`, meta),
  };

  try {
    // Get current user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch contribution history
    const { data: contributions, error: fetchError } = await supabase
      .from('consciousness_contributions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    // Calculate aggregate stats
    const stats = {
      totalContributions: contributions?.length || 0,
      totalImpact: contributions?.reduce((sum: number, c: any) => sum + (c.impact_score || 0), 0) || 0,
      patternsShared: contributions?.reduce((sum: number, c: any) => sum + (c.patterns_contributed || 0), 0) || 0,
      averageImpact: contributions?.length 
        ? (contributions.reduce((sum: number, c: any) => sum + (c.impact_score || 0), 0) / contributions.length)
        : 0,
    };

    return NextResponse.json({
      stats,
      contributions: contributions?.slice(0, 20).map((c: any) => ({
        id: c.id,
        timestamp: c.timestamp,
        sessionId: c.session_id,
        type: c.contribution_type,
        anonymized: c.anonymized,
        impact: c.impact_score,
        patterns: c.patterns_contributed,
      })) || [],
    });

  } catch (error) {
    logger.error('Failed to fetch contribution history', error as Error);
    return NextResponse.json(
      { error: 'Failed to retrieve contribution history' },
      { status: 500 }
    );
  }
}

// Helper functions
function hashUserId(userId: string): string {
  // Simple hash for anonymization - in production use proper hashing
  return `anon_${Buffer.from(userId).toString('base64').substring(0, 12)}`;
}

function calculateContributionValue(stream: any, impact: any): any {
  const baseScore = stream.consciousnessLevel * 100;
  const patternValue = (stream.patterns?.length || 0) * 10;
  const insightValue = (stream.insights?.breakthroughs?.length || 0) * 20;
  const coherenceBonus = impact.coherenceChange > 0 ? impact.coherenceChange * 50 : 0;

  return {
    score: Math.round(baseScore + patternValue + insightValue + coherenceBonus),
    patternsContributed: stream.patterns?.length || 0,
    insightsShared: stream.insights?.breakthroughs?.length || 0,
  };
}

function generateContributionRewards(value: any): any {
  const rewards = {
    points: value.score,
    badges: [] as string[],
    unlocks: [] as string[],
  };

  // Achievement badges
  if (value.score > 100) {
    rewards.badges.push('Consciousness Contributor');
  }
  if (value.patternsContributed > 5) {
    rewards.badges.push('Pattern Weaver');
  }
  if (value.insightsShared > 3) {
    rewards.badges.push('Insight Sharer');
  }

  // Feature unlocks
  if (value.score > 500) {
    rewards.unlocks.push('Advanced Pattern Analysis');
  }
  if (value.score > 1000) {
    rewards.unlocks.push('Collective Field Visualization');
  }

  return rewards;
}