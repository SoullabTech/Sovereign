// app/api/steward/opus-pulse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  OpusPulseData,
  OpusPulseSummary,
  AxiomStats,
  RecentRupture,
  ValidatorMetrics,
} from '@/lib/types/opusPulse';
import { OPUS_AXIOMS } from '@/lib/types/opusPulse';

export async function GET(request: NextRequest) {
  try {
    // 1. Get query params
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || startDate;
    const ruptureLimit = parseInt(searchParams.get('ruptureLimit') || '10');

    // 2. Initialize Supabase client
    const supabase = createClient();

    // TODO: Add auth check - only allow stewards/admins
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || !await isStewsard(user.id)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // 3. Query conversation exchanges with Opus metadata
    const { data: exchanges, error } = await supabase
      .from('conversationExchanges')
      .select('id, createdAt, sessionId, userMessage, maiaMessage, metadata')
      .gte('createdAt', `${startDate}T00:00:00Z`)
      .lte('createdAt', `${endDate}T23:59:59Z`)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // 4. Aggregate data
    const summary: OpusPulseSummary = {
      date: startDate,
      totalResponses: 0,
      goldCount: 0,
      warningCount: 0,
      ruptureCount: 0,
      neutralCount: 0,
      goldPercent: 0,
      warningPercent: 0,
      rupturePercent: 0,
    };

    const axiomStatsMap = new Map<string, AxiomStats>();
    const recentRuptures: RecentRupture[] = [];

    // Initialize axiom stats for all 8 axioms
    OPUS_AXIOMS.forEach((axiom) => {
      axiomStatsMap.set(axiom.id, {
        axiomId: axiom.id,
        axiomName: axiom.name,
        totalEvaluations: 0,
        passCount: 0,
        warningCount: 0,
        violationCount: 0,
        passRate: 0,
      });
    });

    // Process each exchange
    exchanges?.forEach((exchange) => {
      const opusAxioms = exchange.metadata?.opusAxioms;
      if (!opusAxioms) {
        summary.neutralCount++;
        return;
      }

      summary.totalResponses++;

      // Categorize response
      if (opusAxioms.isGold) {
        summary.goldCount++;
      } else if (opusAxioms.ruptureDetected) {
        summary.ruptureCount++;

        // Add to recent ruptures
        if (recentRuptures.length < ruptureLimit) {
          const violated = opusAxioms.evaluations
            ?.filter((e: any) => e.status === 'violation')
            .map((e: any) => e.axiom) || [];
          const warned = opusAxioms.evaluations
            ?.filter((e: any) => e.status === 'warning')
            .map((e: any) => e.axiom) || [];

          recentRuptures.push({
            id: exchange.id,
            timestamp: exchange.createdAt,
            sessionId: exchange.sessionId,
            axiomsViolated: violated,
            axiomsWarned: warned,
            userMessagePreview: exchange.userMessage?.substring(0, 100) || '',
            maiaResponsePreview: exchange.maiaMessage?.substring(0, 100) || '',
            confidence: exchange.metadata?.mythicAtlas?.confidence,
            facet: exchange.metadata?.mythicAtlas?.facet,
          });
        }
      } else if (opusAxioms.warningsDetected || opusAxioms.warnings > 0) {
        summary.warningCount++;
      }

      // Update per-axiom stats
      opusAxioms.evaluations?.forEach((evaluation: any) => {
        const stats = axiomStatsMap.get(evaluation.axiom);
        if (!stats) return;

        stats.totalEvaluations++;

        if (evaluation.status === 'pass') stats.passCount++;
        else if (evaluation.status === 'warning') stats.warningCount++;
        else if (evaluation.status === 'violation') stats.violationCount++;
      });
    });

    // Calculate percentages
    if (summary.totalResponses > 0) {
      summary.goldPercent = (summary.goldCount / summary.totalResponses) * 100;
      summary.warningPercent = (summary.warningCount / summary.totalResponses) * 100;
      summary.rupturePercent = (summary.ruptureCount / summary.totalResponses) * 100;
    }

    // Calculate pass rates for axioms
    axiomStatsMap.forEach((stats) => {
      if (stats.totalEvaluations > 0) {
        stats.passRate = (stats.passCount / stats.totalEvaluations) * 100;
      }
    });

    const axiomStats = Array.from(axiomStatsMap.values());

    // 5. Query Socratic Validator metrics (Phase 3)
    let validatorMetrics: ValidatorMetrics | undefined;

    try {
      const { data: validatorEvents, error: validatorError } = await supabase
        .from('socratic_validator_events')
        .select('*')
        .gte('created_at', `${startDate}T00:00:00Z`)
        .lte('created_at', `${endDate}T23:59:59Z`);

      if (!validatorError && validatorEvents && validatorEvents.length > 0) {
        // Aggregate validator metrics
        const totalValidations = validatorEvents.length;
        const goldCount = validatorEvents.filter((e) => e.is_gold).length;
        const regenerationCount = validatorEvents.filter((e) => e.decision === 'REGENERATE').length;

        // Decision counts
        const decisions = {
          allow: validatorEvents.filter((e) => e.decision === 'ALLOW').length,
          flag: validatorEvents.filter((e) => e.decision === 'FLAG').length,
          block: validatorEvents.filter((e) => e.decision === 'BLOCK').length,
          regenerate: regenerationCount,
        };

        // By element
        const elementMap = new Map<string, { total: number; gold: number; regenerate: number }>();
        validatorEvents.forEach((event) => {
          if (!event.element) return;
          const key = event.element;
          const existing = elementMap.get(key) || { total: 0, gold: 0, regenerate: 0 };
          existing.total++;
          if (event.is_gold) existing.gold++;
          if (event.decision === 'REGENERATE') existing.regenerate++;
          elementMap.set(key, existing);
        });

        const byElement = Array.from(elementMap.entries()).map(([element, stats]) => ({
          element,
          total: stats.total,
          goldRate: stats.total > 0 ? (stats.gold / stats.total) * 100 : 0,
          regenerationRate: stats.total > 0 ? (stats.regenerate / stats.total) * 100 : 0,
        }));

        // Top ruptures
        const ruptureMap = new Map<string, { layer: string; code: string; severity: string; count: number }>();
        validatorEvents.forEach((event) => {
          const ruptures = event.ruptures as any[];
          ruptures?.forEach((rupture) => {
            const key = `${rupture.layer}:${rupture.code}`;
            const existing = ruptureMap.get(key);
            if (existing) {
              existing.count++;
            } else {
              ruptureMap.set(key, {
                layer: rupture.layer,
                code: rupture.code,
                severity: rupture.severity,
                count: 1,
              });
            }
          });
        });

        const topRuptures = Array.from(ruptureMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        validatorMetrics = {
          totalValidations,
          goldRate: totalValidations > 0 ? (goldCount / totalValidations) * 100 : 0,
          regenerationRate: totalValidations > 0 ? (regenerationCount / totalValidations) * 100 : 0,
          decisions,
          byElement,
          topRuptures,
        };
      }
    } catch (validatorError) {
      console.error('Failed to fetch validator metrics (non-critical):', validatorError);
      // Continue without validator metrics
    }

    // 6. Build response
    const response: OpusPulseData = {
      summary,
      axiomStats,
      recentRuptures,
      validatorMetrics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Opus Pulse API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Opus Pulse data' },
      { status: 500 }
    );
  }
}
