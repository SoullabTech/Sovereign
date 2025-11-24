import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence, collective, Logger, PatternRecognitionEngine, SHIFtNarrativeService, SHIFtInferenceService } from '@/lib/stubs/CollectiveIntelligence';

export const dynamic = 'force-dynamic';

// Temporarily stub out backend imports that are excluded from build
// import { PatternRecognitionEngine } from '@/backend/src/ain/collective/PatternRecognitionEngine';
// import { CollectiveIntelligence } from '@/lib/stubs/CollectiveIntelligence'; // Using shared stub
// Temporarily stub out backend imports that are excluded from build
// import { Logger } from '@/backend/src/types/core';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Request validation schemas
const PatternQuerySchema = z.object({
  types: z.array(z.enum(['archetypal_shift', 'elemental_wave', 'consciousness_leap', 'shadow_surfacing', 'integration_phase']))
    .optional(),
  minStrength: z.number().min(0).max(1).optional().default(0.5),
  timeRange: z.enum(['1h', '6h', '24h', '7d']).optional().default('24h'),
  includePersonal: z.boolean().optional().default(true),
});

const PatternSubscriptionSchema = z.object({
  types: z.array(z.string()),
  threshold: z.number().min(0).max(1),
  notificationPreference: z.enum(['immediate', 'daily', 'weekly']),
});

// GET /api/patterns/emergent
export async function GET(req: NextRequest) {
  const logger: Logger = {
    error: (msg: any, error?: any, meta?: any) => console.error(`[Patterns] ${msg}`, error, meta),
    warn: (msg: any, meta?: any) => console.warn(`[Patterns] ${msg}`, meta),
    debug: (msg: any, meta?: any) => console.debug(`[Patterns] ${msg}`, meta),
    info: (msg: any, meta?: any) => console.info(`[Patterns] ${msg}`, meta),
  };

  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = PatternQuerySchema.parse({
      types: searchParams.get('types')?.split(',') || undefined,
      minStrength: searchParams.get('minStrength') ? parseFloat(searchParams.get('minStrength')!) : 0.5,
      timeRange: searchParams.get('timeRange') || '24h',
      includePersonal: searchParams.get('includePersonal') !== 'false',
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

    // Initialize pattern engine and collective intelligence
    const patternEngine = new PatternRecognitionEngine(
      logger,
      {} as any, // Cache service
      {} as any  // Analytics service
    );

    // const collective = new CollectiveIntelligence( - Using imported collective instead
    //   logger,
    //   {} as any,
    //   {} as any
    // );

    // Get current field state
    const fieldState = await collective.getCurrentFieldState();

    // Get emergent patterns
    const allPatterns = await patternEngine.getEmergentPatterns(
      fieldState,
      query.timeRange
    );

    // Filter patterns based on query
    let patterns = allPatterns.filter(pattern => {
      if (query.types && !query.types.includes(pattern.type as any)) return false;
      if (pattern.strength < query.minStrength) return false;
      return true;
    });

    // Sort by strength and recency
    patterns.sort((a, b) => {
      // Prioritize strength, then recency
      const strengthDiff = b.strength - a.strength;
      if (Math.abs(strengthDiff) > 0.1) return strengthDiff;
      return b.timeframe.start.getTime() - a.timeframe.start.getTime();
    });

    // Build response
    const response: any = {
      timestamp: new Date().toISOString(),
      fieldCoherence: fieldState.fieldCoherence,
      patterns: patterns.slice(0, 20).map(pattern => ({
        id: pattern.id,
        type: pattern.type,
        name: generatePatternName(pattern),
        strength: pattern.strength,
        participantCount: pattern.participants.length,
        timeframe: {
          start: pattern.timeframe.start.toISOString(),
          end: pattern.timeframe.end?.toISOString() || null,
          duration: pattern.timeframe.end 
            ? pattern.timeframe.end.getTime() - pattern.timeframe.start.getTime()
            : Date.now() - pattern.timeframe.start.getTime(),
        },
        characteristics: {
          elemental: pattern.elementalSignature,
          archetypal: pattern.archetypeInvolvement,
          consciousnessImpact: pattern.consciousnessImpact,
        },
        progression: pattern.likelyProgression,
        support: pattern.requiredSupport,
        timing: pattern.optimalTiming,
      })),
    };

    // Include personal relevance if requested
    if (query.includePersonal) {
      const userRelevance = await patternEngine.calculateUserRelevance(
        patterns,
        user.id
      );

      response.personalRelevance = patterns
        .map((pattern, index) => ({
          patternId: pattern.id,
          relevance: userRelevance[index],
          participation: pattern.participants.includes(user.id),
          alignment: calculatePatternAlignment(pattern, user.id),
        }))
        .filter(pr => pr.relevance > 0.3)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);
    }

    // Include pattern insights
    response.insights = generatePatternInsights(patterns, fieldState);

    // Cache for 2 minutes (patterns are dynamic)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=240',
      },
    });

  } catch (error) {
    logger.error('Failed to get emergent patterns', error as Error);
    return NextResponse.json(
      { error: 'Failed to retrieve emergent patterns' },
      { status: 500 }
    );
  }
}

// POST /api/patterns/emergent/subscribe
// Subscribe to pattern notifications
export async function POST(req: NextRequest) {
  const logger: Logger = {
    error: (msg: any, error?: any, meta?: any) => console.error(`[PatternSub] ${msg}`, error, meta),
    warn: (msg: any, meta?: any) => console.warn(`[PatternSub] ${msg}`, meta),
    debug: (msg: any, meta?: any) => console.debug(`[PatternSub] ${msg}`, meta),
    info: (msg: any, meta?: any) => console.info(`[PatternSub] ${msg}`, meta),
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
    const subscription = PatternSubscriptionSchema.parse(body);

    // Store pattern subscription preferences
    const { error: updateError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        pattern_subscriptions: subscription,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      throw updateError;
    }

    // Return confirmation with next notification time
    const nextNotification = calculateNextNotificationTime(subscription.notificationPreference);

    return NextResponse.json({
      success: true,
      subscription: {
        types: subscription.types,
        threshold: subscription.threshold,
        preference: subscription.notificationPreference,
      },
      nextNotification: nextNotification.toISOString(),
    });

  } catch (error) {
    logger.error('Failed to subscribe to patterns', error as Error);
    return NextResponse.json(
      { error: 'Failed to subscribe to pattern notifications' },
      { status: 500 }
    );
  }
}

// Note: Real-time pattern streaming would be implemented at 
// /api/patterns/stream/route.ts using Server-Sent Events

// Helper functions
function generatePatternName(pattern: any): string {
  const typeNames: Record<string, string> = {
    archetypal_shift: 'Archetypal Shift',
    elemental_wave: 'Elemental Wave',
    consciousness_leap: 'Consciousness Leap',
    shadow_surfacing: 'Shadow Surfacing',
    integration_phase: 'Integration Phase',
  };

  const baseName = typeNames[pattern.type] || pattern.type;
  
  // Add elemental qualifier if dominant
  const dominantElement = Object.entries(pattern.elementalSignature)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  
  if (dominantElement && (dominantElement[1] as number) > 0.6) {
    return `${dominantElement[0]} ${baseName}`;
  }

  return baseName;
}

function calculatePatternAlignment(pattern: any, userId: string): number {
  // Calculate how aligned a user is with a pattern
  // This would involve comparing user&apos;s elemental state, phase, etc.
  // For now, return a mock value
  return Math.random() * 0.8 + 0.2;
}

function generatePatternInsights(patterns: any[], fieldState: any): any {
  const insights = {
    dominantEnergy: '',
    collectiveFocus: '',
    emergingPotential: '',
    recommendations: [] as string[],
  };

  // Analyze dominant pattern types
  const typeCounts = patterns.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];

  switch (dominantType) {
    case 'consciousness_leap':
      insights.dominantEnergy = 'Breakthrough and expansion';
      insights.recommendations.push('Support breakthrough moments with grounding practices');
      break;
    case 'shadow_surfacing':
      insights.dominantEnergy = 'Deep healing and integration';
      insights.recommendations.push('Create safe spaces for shadow work');
      break;
    case 'elemental_wave':
      insights.dominantEnergy = 'Elemental rebalancing';
      insights.recommendations.push('Honor the elemental shifts in your practice');
      break;
  }

  // Analyze collective focus
  if (fieldState.fieldCoherence > 0.7) {
    insights.collectiveFocus = 'High coherence - unified intention emerging';
  } else if (fieldState.fieldCoherence > 0.5) {
    insights.collectiveFocus = 'Moderate coherence - diverse explorations';
  } else {
    insights.collectiveFocus = 'Low coherence - individual journeys predominant';
  }

  // Emerging potential
  if (fieldState.breakthroughPotential > 0.8) {
    insights.emergingPotential = 'Collective breakthrough imminent';
    insights.recommendations.push('Stay present for synchronicities');
  }

  return insights;
}

function calculateNextNotificationTime(preference: string): Date {
  const now = new Date();
  switch (preference) {
    case 'immediate':
      return now; // Real-time notifications
    case 'daily':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM next day
      return tomorrow;
    case 'weekly':
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay() + 1) % 7); // Next Monday
      nextWeek.setHours(9, 0, 0, 0); // 9 AM
      return nextWeek;
    default:
      return now;
  }
}