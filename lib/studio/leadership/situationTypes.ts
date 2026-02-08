/**
 * Situation Types — Field Orientation for Decision Council
 *
 * The practitioner's only choice: "What kind of situation is this?"
 * Each type tunes the AIN council to the right field.
 *
 * This is not a decision tree. It is field orientation.
 */

import type { Council, FramingDomain } from '@/lib/ain/types';
import type { DecisionContext, TimePressure } from './types';

// ─── Types ───────────────────────────────────────────────────────

export type SituationType = 'individual' | 'relational' | 'group' | 'leadership' | 'self';

export interface SituationConfig {
  label: string;
  description: string;
  icon: string; // lucide-react icon name
  council: Council;
  preferDomains: FramingDomain[];
  requireFramings: string[];
  topicHints: string[];
  maxFramings: number;
  closingQuestion: string;
  contextLabels: {
    stateLabel: string;       // "Client's State" / "Leader's State" / "My State"
    stakesPlaceholder: string;
    questionsLabel: string;   // "Questions for the Client" / "Questions to Sit With"
  };
}

// ─── Configurations ──────────────────────────────────────────────

export const SITUATION_CONFIGS: Record<SituationType, SituationConfig> = {
  individual: {
    label: 'Individual client',
    description: "One person's situation — what to name, ask, or do next.",
    icon: 'User',
    council: 'deliberation',
    preferDomains: ['human', 'domain'],
    requireFramings: ['phenomenology'],
    topicHints: ['therapy', 'client', 'intervention', 'attachment', 'pattern'],
    maxFramings: 5,
    closingQuestion:
      'What patterns, tensions, and blind spots should the practitioner notice? What questions might open the real work?',
    contextLabels: {
      stateLabel: "Client's State",
      stakesPlaceholder: "What could go wrong? What's the cost of inaction?",
      questionsLabel: 'Questions for the Client',
    },
  },

  relational: {
    label: 'Relationship dynamic',
    description: 'Between people — boundaries, rupture/repair, patterns, projections.',
    icon: 'Users',
    council: 'deliberation',
    preferDomains: ['domain', 'human'],
    requireFramings: ['relationships'],
    topicHints: ['relationship', 'dynamic', 'boundary', 'rupture', 'projection'],
    maxFramings: 5,
    closingQuestion:
      'What relational dynamics are active? What is being avoided? What questions would surface the real pattern?',
    contextLabels: {
      stateLabel: "Client's State",
      stakesPlaceholder: 'What is at risk in this dynamic? What might rupture further?',
      questionsLabel: 'Questions for the Client',
    },
  },

  group: {
    label: 'Group / organization',
    description: 'A team or system — roles, culture currents, group dynamics, stuck loops.',
    icon: 'Building',
    council: 'deliberation',
    preferDomains: ['domain', 'strategic'],
    requireFramings: ['organizational-field'],
    topicHints: ['group', 'team', 'organization', 'culture', 'system'],
    maxFramings: 5,
    closingQuestion:
      'What systemic forces are at play? What would the system resist? What questions might shift the field?',
    contextLabels: {
      stateLabel: 'Group State',
      stakesPlaceholder: 'What is at stake for the system? What happens if nothing changes?',
      questionsLabel: 'Questions for the Group',
    },
  },

  leadership: {
    label: 'Leadership / authority',
    description: 'Decisions under power — strategy, stakeholders, politics, responsibility.',
    icon: 'Crown',
    council: 'deliberation',
    preferDomains: ['strategic', 'domain'],
    requireFramings: ['leadership-power'],
    topicHints: ['leadership', 'executive', 'organizational', 'authority'],
    maxFramings: 5,
    closingQuestion:
      'What perspectives, tensions, and risks should the consultant surface? What questions should they bring back to the leader?',
    contextLabels: {
      stateLabel: "Leader's State",
      stakesPlaceholder: "What could go wrong? What's the cost of inaction?",
      questionsLabel: 'Questions for the Leader',
    },
  },

  self: {
    label: 'Personal reflection',
    description: 'Your own process — countertransference, bias, fear, desire, clarity.',
    icon: 'Eye',
    council: 'shadow',
    preferDomains: ['theoretical', 'domain'],
    requireFramings: ['jung-archetypal'],
    topicHints: ['countertransference', 'self', 'bias', 'regulation', 'shadow'],
    maxFramings: 5,
    closingQuestion:
      'What am I not seeing? What patterns might be active in me? What questions should I sit with?',
    contextLabels: {
      stateLabel: 'My State',
      stakesPlaceholder: 'What am I protecting? What would honesty cost?',
      questionsLabel: 'Questions to Sit With',
    },
  },
};

export const SITUATION_TYPE_LIST: SituationType[] = [
  'individual',
  'relational',
  'group',
  'leadership',
  'self',
];

// ─── Accessors ───────────────────────────────────────────────────

/**
 * Get configuration for a situation type.
 * Falls back to 'individual' for unknown values.
 */
export function getSituationConfig(type?: string | null): SituationConfig {
  if (type && type in SITUATION_CONFIGS) {
    return SITUATION_CONFIGS[type as SituationType];
  }
  return SITUATION_CONFIGS.individual;
}

// ─── Question Builder ────────────────────────────────────────────

/**
 * Build a structured question from decision context, oriented by situation type.
 * This replaces the leadership-only buildDecisionQuestion.
 */
export function buildSituationQuestion(d: DecisionContext, config: SituationConfig): string {
  const parts: string[] = [
    `SITUATION: ${d.title}`,
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
    const stateLabel = config.contextLabels.stateLabel.toUpperCase().replace("'S ", ' ');
    parts.push(`${stateLabel}: ${d.emotionalState}`);
  }

  // Include leadership profile if available (leadership + group types)
  if (d.leadershipProfile) {
    const lp = d.leadershipProfile;
    const profileParts: string[] = [];
    if (lp.role) profileParts.push(`Role: ${lp.role}`);
    if (lp.orgName) profileParts.push(`Organization: ${lp.orgName}`);
    if (lp.authorityScope) profileParts.push(`Authority: ${lp.authorityScope}`);
    if (lp.stakeholderComplexity) profileParts.push(`Stakeholder complexity: ${lp.stakeholderComplexity}`);
    if (profileParts.length > 0) {
      parts.push('', `PROFILE: ${profileParts.join(' | ')}`);
    }
  }

  parts.push('', config.closingQuestion);

  return parts.join('\n');
}

/**
 * Map time pressure to AIN urgency level.
 */
export function mapTimePressure(tp?: TimePressure): 'low' | 'medium' | 'high' {
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
