export const dynamic = 'force-dynamic';

/**
 * WEEKLY SUMMARY EXPORT
 *
 * GET — Generate a weekly summary for a relationship from the last 7 days of check-ins.
 * Uses MAIA to synthesize patterns, scripts, and watch-for thresholds.
 * Returns structured JSON (and optionally markdown via ?format=markdown).
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { CHILD_STATE_LABELS, type ChildState } from '@/lib/studio/relationships/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 20000,
});

const SUMMARY_SYSTEM_PROMPT = `You are MAIA — generating a weekly relationship summary for a parent.

Review the check-in data and produce a clear, honest summary.
Do not pathologize. Do not create dependence. Increase the parent's self-trust.

Respond in JSON format ONLY:
{
  "whatHappenedMost": "1-2 sentences: the dominant theme this week",
  "whatHelped": "1-2 sentences: what worked (from MAIA responses + parent actions)",
  "whatDidntHelp": "1-2 sentences: what didn't land or escalated (honest, not shaming)",
  "patternsEmerging": "1-2 sentences: any repeating triggers, states, or needs across check-ins",
  "nextExperiment": "One small thing to try next week, based on patterns",
  "watchForThreshold": "When to seek outside support, given this week's data",
  "scriptToTry": "One specific script the parent can use next week, based on the dominant pattern"
}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: relationshipId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Verify ownership + get relationship
    const relResult = await db.query(
      'SELECT * FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [relationshipId, practitionerId]
    );
    if (relResult.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const relationship = relResult.rows[0];

    // Fetch check-ins from last 7 days
    const checkinsResult = await db.query(
      `SELECT what_happened, child_state, parent_need, maia_response, created_at
       FROM relationship_checkins
       WHERE relationship_id = $1 AND practitioner_id = $2
         AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC`,
      [relationshipId, practitionerId]
    );

    if (checkinsResult.rows.length === 0) {
      return NextResponse.json({
        summary: null,
        message: 'No check-ins in the last 7 days',
      });
    }

    const checkins = checkinsResult.rows;

    // Build context for MAIA
    const contextParts: string[] = [
      `RELATIONSHIP: ${relationship.person_name} (${relationship.role})`,
    ];
    if (relationship.age_years) {
      contextParts.push(`AGE: ${relationship.age_years} years old`);
    }
    contextParts.push(`PERIOD: Last 7 days (${checkins.length} check-ins)`);
    contextParts.push('');

    // State distribution
    const stateCounts: Record<string, number> = {};
    for (const c of checkins) {
      if (c.child_state) {
        const label = CHILD_STATE_LABELS[c.child_state as ChildState] || c.child_state;
        stateCounts[label] = (stateCounts[label] || 0) + 1;
      }
    }
    if (Object.keys(stateCounts).length > 0) {
      contextParts.push('STATE DISTRIBUTION:');
      for (const [state, count] of Object.entries(stateCounts).sort((a, b) => b[1] - a[1])) {
        contextParts.push(`- ${state}: ${count} times`);
      }
      contextParts.push('');
    }

    // Check-in details (truncated for context window)
    contextParts.push('CHECK-INS (most recent first):');
    for (const c of checkins.slice(0, 10)) {
      const date = new Date(c.created_at).toLocaleDateString();
      const state = c.child_state ? ` [${CHILD_STATE_LABELS[c.child_state as ChildState] || c.child_state}]` : '';
      contextParts.push(`- ${date}${state}: ${c.what_happened.slice(0, 150)}`);
      if (c.maia_response?.framing) {
        contextParts.push(`  MAIA: ${c.maia_response.framing}`);
      }
    }

    const SUMMARY_MODEL = 'claude-haiku-4-5-20251001';
    const message = await anthropic.messages.create({
      model: SUMMARY_MODEL,
      max_tokens: 800,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: contextParts.join('\n') },
      ],
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let summaryData;
    try {
      summaryData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaryData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse summary' }, { status: 500 });
      }
    }

    // Get top states
    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => label);

    // Get Monday of current week
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const weekOf = monday.toISOString().split('T')[0];

    const summary = {
      weekOf,
      checkinCount: checkins.length,
      topStates,
      whatHappenedMost: summaryData.whatHappenedMost,
      whatHelped: summaryData.whatHelped,
      whatDidntHelp: summaryData.whatDidntHelp,
      patternsEmerging: summaryData.patternsEmerging,
      nextExperiment: summaryData.nextExperiment,
      watchForThreshold: summaryData.watchForThreshold,
      scriptToTry: summaryData.scriptToTry,
      model: SUMMARY_MODEL,
      generatedAt: new Date().toISOString(),
    };

    // Markdown output
    if (format === 'markdown') {
      const md = formatSummaryAsMarkdown(summary, relationship.person_name, relationship.role);
      return new NextResponse(md, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[Weekly Summary] Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

function formatSummaryAsMarkdown(
  summary: Record<string, unknown>,
  personName: string,
  role: string,
): string {
  return `# Weekly Summary: ${personName} (${role})

**Week of:** ${summary.weekOf}
**Check-ins:** ${summary.checkinCount}
**Most frequent states:** ${(summary.topStates as string[]).join(', ')}

---

## What happened most
${summary.whatHappenedMost}

## What helped
${summary.whatHelped}

## What didn't help
${summary.whatDidntHelp}

## Patterns emerging
${summary.patternsEmerging}

## Try this next week
${summary.nextExperiment}

## Watch for
${summary.watchForThreshold}

## Script to try
> ${summary.scriptToTry}

---
*Generated by MAIA on ${new Date(summary.generatedAt as string).toLocaleDateString()}*
`;
}
