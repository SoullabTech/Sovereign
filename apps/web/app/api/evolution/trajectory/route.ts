import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { EvolutionTracker, Logger } from '@/lib/stubs/CollectiveIntelligence';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Request validation schemas
const TrajectoryQuerySchema = z.object({
  userId: z.string().optional(),
  timeRange: z.enum(['7d', '30d', '90d', 'all']).optional().default('30d'),
  includeProjection: z.boolean().optional().default(true),
  includeMilestones: z.boolean().optional().default(true),
});

// GET /api/evolution/trajectory
export async function GET(req: NextRequest) {
  const logger: Logger = {
    error: (msg: any, error?: any, meta?: any) => console.error(`[Evolution] ${msg}`, error, meta),
    warn: (msg: any, meta?: any) => console.warn(`[Evolution] ${msg}`, meta),
    debug: (msg: any, meta?: any) => console.debug(`[Evolution] ${msg}`, meta),
    info: (msg: any, meta?: any) => console.info(`[Evolution] ${msg}`, meta),
  };

  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = TrajectoryQuerySchema.parse({
      userId: searchParams.get('userId') || undefined,
      timeRange: searchParams.get('timeRange') || '30d',
      includeProjection: searchParams.get('includeProjection') !== 'false',
      includeMilestones: searchParams.get('includeMilestones') !== 'false',
    });

    // Get current user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use provided userId or default to current user
    const targetUserId = query.userId || user.id;

    // Check permissions if viewing another user&apos;s trajectory
    if (targetUserId !== user.id) {
      // Here you would check if the current user has permission to view this trajectory
      // For now, we&apos;ll restrict to own trajectory only
      return NextResponse.json(
        { error: 'Cannot view other user trajectories' },
        { status: 403 }
      );
    }

    // Initialize evolution tracker
    const evolutionTracker = new EvolutionTracker(
      logger,
      {} as any, // Cache service would be injected here
      {} as any  // Analytics service would be injected here
    );

    // Get user evolution profile
    const profile = await evolutionTracker.getUserEvolutionProfile(targetUserId);

    // Build trajectory response
    const response: any = {
      userId: targetUserId,
      currentState: {
        phase: profile.currentPhase,
        phaseProgress: profile.phaseProgress,
        evolutionVelocity: profile.evolutionVelocity,
        stabilityLevel: profile.stabilityLevel,
      },
      consciousness: {
        awarenessLevel: profile.awarenessLevel,
        integrationDepth: profile.integrationDepth,
        shadowIntegration: profile.shadowIntegration,
        authenticityLevel: profile.authenticityLevel,
      },
      elemental: {
        mastery: profile.elementalMastery,
        dominant: profile.dominantElement,
        integrating: profile.integrationElement,
        balance: calculateElementalBalance(profile.elementalMastery),
      },
      relational: {
        mayaConnection: profile.mayaRelationship,
        challengeReceptivity: profile.challengeReceptivity,
        collectiveContribution: profile.collectiveContribution,
      },
    };

    // Include phase history based on time range
    if (query.timeRange !== 'all') {
      const cutoffDate = getTimeRangeCutoff(query.timeRange);
      response.phaseHistory = profile.phaseHistory.filter(
        transition => transition.timestamp > cutoffDate
      );
    } else {
      response.phaseHistory = profile.phaseHistory;
    }

    // Include breakthrough history
    response.breakthroughs = {
      total: profile.breakthroughHistory.length,
      recent: profile.breakthroughHistory.slice(-5),
      potential: profile.currentBreakthroughPotential,
      nextThreshold: profile.nextEvolutionThreshold,
    };

    // Include future projection if requested
    if (query.includeProjection) {
      const projection = await evolutionTracker.projectEvolution(targetUserId);
      response.projection = {
        likelyNextPhase: projection.nextPhase,
        estimatedTimeframe: projection.timeframe,
        requiredConditions: projection.conditions,
        optimalPractices: projection.practices,
        potentialChallenges: projection.challenges,
      };
    }

    // Include milestones if requested
    if (query.includeMilestones) {
      const milestones = await evolutionTracker.getEvolutionMilestones(targetUserId);
      response.milestones = {
        achieved: milestones.filter(m => m.achieved),
        upcoming: milestones.filter(m => !m.achieved).slice(0, 5),
      };
    }

    // Cache for 5 minutes
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('Failed to get evolution trajectory', error as Error);
    return NextResponse.json(
      { error: 'Failed to retrieve evolution trajectory' },
      { status: 500 }
    );
  }
}

// POST /api/evolution/trajectory/milestone
// Record achievement of an evolution milestone
export async function POST(req: NextRequest) {
  const logger: Logger = {
    error: (msg: any, error?: any, meta?: any) => console.error(`[Milestone] ${msg}`, error, meta),
    warn: (msg: any, meta?: any) => console.warn(`[Milestone] ${msg}`, meta),
    debug: (msg: any, meta?: any) => console.debug(`[Milestone] ${msg}`, meta),
    info: (msg: any, meta?: any) => console.info(`[Milestone] ${msg}`, meta),
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

    const body = await req.json();
    
    // Validate milestone data
    const MilestoneSchema = z.object({
      type: z.enum(['phase_transition', 'elemental_mastery', 'shadow_integration', 'breakthrough']),
      details: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        element: z.string().optional(),
        shadowAspect: z.string().optional(),
        breakthroughType: z.string().optional(),
      }),
      metadata: z.record(z.any()).optional(),
    });

    const milestone = MilestoneSchema.parse(body);

    // Initialize evolution tracker
    const evolutionTracker = new EvolutionTracker(
      logger,
      {} as any,
      {} as any
    );

    // Record the milestone
    await evolutionTracker.recordMilestone({
      userId: user.id,
      type: milestone.type,
      timestamp: new Date(),
      details: milestone.details,
      metadata: milestone.metadata,
    });

    // Get updated evolution state
    const updatedProfile = await evolutionTracker.getUserEvolutionProfile(user.id);

    // Check for evolution level up
    const levelUp = checkForEvolutionLevelUp(updatedProfile);

    return NextResponse.json({
      success: true,
      milestone: {
        type: milestone.type,
        recorded: new Date().toISOString(),
      },
      evolution: {
        currentPhase: updatedProfile.currentPhase,
        velocity: updatedProfile.evolutionVelocity,
        nextThreshold: updatedProfile.nextEvolutionThreshold,
      },
      levelUp: levelUp || undefined,
    });

  } catch (error) {
    logger.error('Failed to record milestone', error as Error);
    return NextResponse.json(
      { error: 'Failed to record evolution milestone' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateElementalBalance(mastery: Record<string, number>): number {
  const values = Object.values(mastery);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  return 1 - Math.sqrt(variance) / avg; // Higher value = better balance
}

function getTimeRangeCutoff(range: string): Date {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // All time
  }
}

function checkForEvolutionLevelUp(profile: any): any {
  // Check if user has reached a new evolution level
  // This would be based on various thresholds and achievements
  if (profile.evolutionVelocity > 0.8 && profile.stabilityLevel > 0.7) {
    return {
      newLevel: profile.currentPhase,
      achievement: 'Consciousness Expansion',
      rewards: ['Enhanced pattern recognition', 'Deeper archetypal access'],
    };
  }
  return null;
}