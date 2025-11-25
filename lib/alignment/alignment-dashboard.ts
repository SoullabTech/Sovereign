/**
 * Alignment Dashboard
 * Simplified view: Are we serving authentic becoming or creating dependency?
 *
 * Key questions:
 * - Are members becoming more autonomous?
 * - Are we creating dependency?
 * - Is cost pressure creeping in?
 */

export interface AlignmentSnapshot {
  // The core question: Are members becoming more themselves?
  becoming: {
    autonomyScore: number; // 0-1, are they developing their own authority?
    trend: 'more_sovereign' | 'stable' | 'more_dependent';
    context: string;
  };

  // The red flag: Are we creating dependency?
  dependency: {
    percentShowingDependencyPatterns: number; // What % show concerning patterns?
    averageSessionsPerWeek: number;
    context: string;
  };

  // Are we being helpful or paternalistic?
  safety: {
    blockRate: number;
    userOverrideRate: number;
    context: string;
  };

  // Is cost pressure influencing decisions?
  economics: {
    costPerConversation: number;
    recentCostDrivenDecisions: number;
    context: string;
  };

  // What's worth your attention
  strengths: string[];
  concerns: string[];
  questions: string[];
}

/**
 * Generate alignment snapshot
 */
export async function getAlignmentSnapshot(data: {
  // Becoming metrics
  averageAutonomyScore: number; // 0-1
  autonomyTrend: 'increasing' | 'stable' | 'decreasing';
  percentShowingDependency: number; // 0-1
  avgSessionsPerWeek: number;

  // Safety metrics
  safetyBlockRate: number;
  userOverrideRate: number;

  // Economic metrics
  costPerConversation: number;
  recentCostDecisions: number;
}): Promise<AlignmentSnapshot> {

  const strengths: string[] = [];
  const concerns: string[] = [];
  const questions: string[] = [];

  // === BECOMING ASSESSMENT ===
  const becomingContext =
    data.averageAutonomyScore >= 0.6
      ? 'Members showing strong autonomy - developing their own voice'
      : data.averageAutonomyScore >= 0.4
      ? 'Moderate autonomy - members engaged but could be more self-directed'
      : 'Low autonomy - members may be over-relying on MAIA';

  const becomingTrend: AlignmentSnapshot['becoming']['trend'] =
    data.autonomyTrend === 'increasing' ? 'more_sovereign'
    : data.autonomyTrend === 'decreasing' ? 'more_dependent'
    : 'stable';

  if (data.averageAutonomyScore >= 0.6) {
    strengths.push('Strong member autonomy - engaging with sovereignty');
  } else if (data.averageAutonomyScore < 0.4) {
    concerns.push(`Low autonomy scores (${(data.averageAutonomyScore * 100).toFixed(0)}%) - members may be over-relying`);
    questions.push('Are we unintentionally positioning ourselves as authority vs mirror?');
  }

  if (data.autonomyTrend === 'decreasing') {
    concerns.push('Autonomy trending down - members becoming more dependent');
    questions.push('URGENT: What changed that made members less autonomous?');
  } else if (data.autonomyTrend === 'increasing') {
    strengths.push('Autonomy increasing - members finding their own authority');
  }

  // === DEPENDENCY ASSESSMENT (CRITICAL) ===
  const dependencyContext =
    data.percentShowingDependency > 0.2
      ? `${(data.percentShowingDependency * 100).toFixed(0)}% showing dependency - need to investigate`
      : data.percentShowingDependency > 0.1
      ? 'Some dependency patterns - worth monitoring'
      : 'Low dependency - healthy engagement patterns';

  if (data.percentShowingDependency > 0.2) {
    concerns.push(`${(data.percentShowingDependency * 100).toFixed(0)}% showing dependency patterns`);
    questions.push('Are we creating dependency instead of liberation?');
    questions.push('What would help these members find their own authority?');
  } else if (data.percentShowingDependency < 0.05) {
    strengths.push('Low dependency rate - members using MAIA as mirror, not crutch');
  }

  if (data.avgSessionsPerWeek > 5) {
    concerns.push(`High session frequency (${data.avgSessionsPerWeek.toFixed(1)}/week) - possible over-reliance`);
  } else if (data.avgSessionsPerWeek >= 2 && data.avgSessionsPerWeek <= 4) {
    strengths.push('Healthy engagement rhythm');
  }

  // === SAFETY ASSESSMENT ===
  const safetyContext =
    data.userOverrideRate > 0.3
      ? `Users override ${(data.userOverrideRate * 100).toFixed(0)}% - may be too paternalistic`
      : data.userOverrideRate < 0.1
      ? 'Low override rate - safety feels right'
      : 'Moderate override rate - seems balanced';

  if (data.userOverrideRate > 0.3) {
    concerns.push('High override rate - possibly too strict');
    questions.push('Is safety system too paternalistic?');
  } else if (data.userOverrideRate < 0.15 && data.safetyBlockRate < 0.1) {
    strengths.push('Safety balanced - low blocks, low overrides');
  }

  // === ECONOMICS ASSESSMENT ===
  const economicsContext =
    data.recentCostDecisions > 3
      ? `${data.recentCostDecisions} cost-driven decisions - watch for Moloch`
      : data.recentCostDecisions > 0
      ? 'Some cost considerations - still balanced'
      : 'User outcomes driving decisions';

  if (data.recentCostDecisions > 3) {
    concerns.push('Multiple cost-driven decisions recently');
    questions.push('Is economic pressure starting to override user welfare?');
  } else if (data.recentCostDecisions === 0) {
    strengths.push('Decisions driven by member outcomes, not cost');
  }

  return {
    becoming: {
      autonomyScore: data.averageAutonomyScore,
      trend: becomingTrend,
      context: becomingContext
    },
    dependency: {
      percentShowingDependencyPatterns: data.percentShowingDependency,
      averageSessionsPerWeek: data.avgSessionsPerWeek,
      context: dependencyContext
    },
    safety: {
      blockRate: data.safetyBlockRate,
      userOverrideRate: data.userOverrideRate,
      context: safetyContext
    },
    economics: {
      costPerConversation: data.costPerConversation,
      recentCostDrivenDecisions: data.recentCostDecisions,
      context: economicsContext
    },
    strengths,
    concerns,
    questions
  };
}

/**
 * Format for display
 */
export function formatAlignmentReport(snapshot: AlignmentSnapshot): string {
  return `
# Soullab Alignment Check

## What's Going Well
${snapshot.strengths.length > 0
  ? snapshot.strengths.map(s => `✓ ${s}`).join('\n')
  : '(See metrics below)'
}

## Worth Your Attention
${snapshot.concerns.length > 0
  ? snapshot.concerns.map(c => `⚠ ${c}`).join('\n')
  : '(Nothing concerning right now)'
}

## Questions to Consider
${snapshot.questions.length > 0
  ? snapshot.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
  : '(No pressing questions)'
}

---

## Current Metrics

**Authentic Becoming**
- Member autonomy: ${(snapshot.becoming.autonomyScore * 100).toFixed(0)}%
- Trend: ${snapshot.becoming.trend === 'more_sovereign' ? '↗ More sovereign' : snapshot.becoming.trend === 'more_dependent' ? '↘ More dependent' : '→ Stable'}
- ${snapshot.becoming.context}

**Dependency Check** (The anti-Moloch metric)
- Members showing dependency: ${(snapshot.dependency.percentShowingDependencyPatterns * 100).toFixed(0)}%
- Avg sessions/week: ${snapshot.dependency.averageSessionsPerWeek.toFixed(1)}
- ${snapshot.dependency.context}

**Safety Balance**
- Block rate: ${(snapshot.safety.blockRate * 100).toFixed(1)}%
- Override rate: ${(snapshot.safety.userOverrideRate * 100).toFixed(1)}%
- ${snapshot.safety.context}

**Economics**
- Cost per conversation: $${snapshot.economics.costPerConversation.toFixed(4)}
- Recent cost-driven decisions: ${snapshot.economics.recentCostDrivenDecisions}
- ${snapshot.economics.context}

---

**The Core Question**: Are we helping members become more authentically themselves, or are we creating dependency?
`;
}
