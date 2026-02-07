/**
 * Decision Council — Leadership Consultation Service
 *
 * Wraps the AIN consultation engine for leadership decision analysis.
 * The consultant captures decision context, the council provides
 * multi-framing insight, and the consultant synthesizes questions
 * to bring back to the leader.
 *
 * This is a consultant-facing tool. The leader never sees the raw output.
 */

import { consult } from '@/lib/ain/consultation';
import type { ConsultationRequest, ConsultationResult } from '@/lib/ain/types';
import type { DecisionContext, TimePressure } from './types';

/**
 * Run AIN consultation for a leadership decision.
 *
 * Uses deliberation council with strategic + domain preferences.
 * Always includes leadership-power framing; selects others by question.
 */
export async function consultDecisionCouncil(
  decision: DecisionContext
): Promise<ConsultationResult> {
  const question = buildDecisionQuestion(decision);

  const request: ConsultationRequest = {
    council: 'deliberation',
    question,
    context: {
      urgency: mapTimePressure(decision.timePressure),
      topicHints: ['leadership', 'executive', 'organizational', 'decision'],
    },
    constraints: {
      maxFramings: 5,
      preferDomains: ['strategic', 'domain'],
      requireFramings: ['leadership-power'],
    },
  };

  return consult(request);
}

/**
 * Build a structured question from decision context.
 * The question text is what each framing receives for analysis.
 */
function buildDecisionQuestion(d: DecisionContext): string {
  const parts: string[] = [
    `DECISION: ${d.title}`,
    '',
    `CONTEXT: ${d.context}`,
  ];

  if (d.stakes) {
    parts.push('', `STAKES: ${d.stakes}`);
  }

  if (d.timePressure && d.timePressure !== 'none') {
    parts.push(`TIME PRESSURE: ${d.timePressure}`);
  }

  if (d.emotionalState) {
    parts.push(`LEADER STATE: ${d.emotionalState}`);
  }

  if (d.leadershipProfile) {
    const lp = d.leadershipProfile;
    const profileParts: string[] = [];
    if (lp.role) profileParts.push(`Role: ${lp.role}`);
    if (lp.orgName) profileParts.push(`Organization: ${lp.orgName}`);
    if (lp.authorityScope) profileParts.push(`Authority: ${lp.authorityScope}`);
    if (lp.stakeholderComplexity) profileParts.push(`Stakeholder complexity: ${lp.stakeholderComplexity}`);
    if (profileParts.length > 0) {
      parts.push('', `LEADER PROFILE: ${profileParts.join(' | ')}`);
    }
  }

  parts.push(
    '',
    'What perspectives, tensions, and risks should the consultant surface?',
    'What questions should they bring back to the leader?'
  );

  return parts.join('\n');
}

function mapTimePressure(tp?: TimePressure): 'low' | 'medium' | 'high' {
  switch (tp) {
    case 'urgent':
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    default:
      return 'low';
  }
}
