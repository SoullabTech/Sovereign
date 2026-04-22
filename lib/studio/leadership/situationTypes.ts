/**
 * Situation Types — Field Orientation for Decision Council
 *
 * The practitioner's only choice: "What kind of situation is this?"
 * Each type tunes the AIN council to the right field.
 *
 * This is not a decision tree. It is field orientation.
 */

import type { Council, FramingDomain } from '@/lib/ain/types';
import type { DecisionContext, TimePressure, IterationContext } from './types';
import type { DecisionInputBundle } from '@/lib/studio/practitioner/types';

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
 *
 * When a DecisionInputBundle is provided, the question is assembled from
 * segmented evidence sources — client inquiry, field signals, practitioner
 * observations — rather than a flat practitioner summary.
 *
 * Each source is kept distinct in the prompt to reduce projection and prompt blur.
 * If a source is absent, the council proceeds with what is available.
 *
 * PROMPT CONSTRAINTS (applied to all assemblies):
 * - Distinguish direct evidence from inference. Label inferences as such.
 * - Do not over-pathologize. Describe patterns, not diagnoses.
 * - Prioritize phenomenological data when available (client's own words).
 * - Identify tensions and uncertainties. Name what is not known.
 * - Offer the next smallest useful intervention hypothesis, not a grand theory.
 * - If client inquiry is sparse, say so. If field signals are missing, do not fill with false certainty.
 */
export function buildSituationQuestion(
  d: DecisionContext,
  config: SituationConfig,
  iteration?: IterationContext,
  inputBundle?: DecisionInputBundle,
  councilBias?: string
): string {
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

  // ─── Evidence Bundle (when available) ──────────────────────────────
  // Each source is kept separate. The council labels inferences, not direct evidence.
  if (inputBundle) {
    parts.push('', '--- EVIDENCE BUNDLE ---');
    parts.push('Note: Synthesize from direct evidence first. Label inferences as such.');
    parts.push('If a source is absent or sparse, acknowledge that gap rather than filling it.');

    // CLIENT INQUIRY (first-person phenomenological data)
    const inquiry = inputBundle.clientInquiry;
    if (inquiry && inquiry.responses.length > 0) {
      parts.push('', `CLIENT INQUIRY (${inquiry.promptSetTitle}):`);
      parts.push('Source: client self-report — first-person phenomenology. Treat as primary evidence.');
      for (const r of inquiry.responses) {
        if (r.answer?.trim()) {
          parts.push(`  Q: ${r.questionText}`);
          parts.push(`  A: ${r.answer.trim()}`);
        }
      }
      if (inquiry.summaryText) {
        parts.push(`  Practitioner summary: ${inquiry.summaryText}`);
      }
    } else {
      parts.push('', 'CLIENT INQUIRY: Not available for this council. Do not infer client experience from practitioner summary alone.');
    }

    // FIELD SIGNALS (discrete signals between sessions)
    const signals = inputBundle.fieldSignals;
    if (signals && signals.length > 0) {
      parts.push('', 'FIELD SIGNALS (observed between sessions):');
      parts.push('Source: discrete observations — somatic, relational, behavioral, emotional, symbolic, cognitive.');
      for (const sig of signals) {
        const intensity = sig.intensity != null ? ` [intensity: ${Math.round(sig.intensity * 10)}/10]` : '';
        parts.push(`  [${sig.type}/${sig.source}]${intensity} ${sig.title}: ${sig.content}`);
      }
    } else {
      parts.push('', 'FIELD SIGNALS: None recorded between sessions.');
    }

    // PRACTITIONER OBSERVATIONS (second-person relational data)
    const observations = inputBundle.practitionerObservations;
    if (observations && observations.length > 0) {
      parts.push('', 'PRACTITIONER OBSERVATIONS (second-person, in-session or relational field):');
      parts.push('Source: practitioner — observe for possible projection; treat as hypothesis-generating rather than confirmed fact.');
      for (const obs of observations) {
        parts.push(`  [${obs.observationType}] ${obs.content}`);
      }
    } else {
      parts.push('', 'PRACTITIONER OBSERVATIONS: None recorded.');
    }

    // EXISTING NOTES
    if (inputBundle.existingNotes?.trim()) {
      parts.push('', 'NOTES / PRIOR CONTEXT:');
      parts.push(inputBundle.existingNotes.trim());
    }

    parts.push('', '--- END EVIDENCE BUNDLE ---');
  } else {
    // Absent-bundle signal: the synthesis must see that no evidence was provided.
    // Without this, the model cannot distinguish "no bundle" from "bundle not rendered"
    // and will silently proceed as if the evidence base were adequate.
    parts.push(
      '',
      '--- EVIDENCE BUNDLE ---',
      'NO EVIDENCE BUNDLE PROVIDED.',
      '  - No client inquiry on record.',
      '  - No field signals captured.',
      '  - No practitioner observations recorded.',
      'The synthesis must name this limitation explicitly in the Evidence Limits section, reduce confidence, and prefer information-generating moves over strong prescriptions.',
      '--- END EVIDENCE BUNDLE ---',
    );
  }

  // ─── Iteration Arc ──────────────────────────────────────────────────
  if (iteration && iteration.iterationNumber > 1) {
    parts.push('', `--- PRIOR COUNCIL (iteration ${iteration.iterationNumber - 1}) ---`);

    if (iteration.priorTensions.length > 0) {
      parts.push(`Key tensions identified:`);
      for (const t of iteration.priorTensions) {
        parts.push(`  - ${t}`);
      }
    }

    if (iteration.priorInsights.length > 0) {
      parts.push(`Key insights:`);
      for (const ins of iteration.priorInsights) {
        parts.push(`  - ${ins}`);
      }
    }

    if (iteration.priorRecommendation) {
      parts.push(`Prior recommendation: ${iteration.priorRecommendation}`);
    }

    if (iteration.sessionNotes) {
      parts.push('', `WHAT HAS HAPPENED SINCE:`, iteration.sessionNotes);
    }

    parts.push(
      '',
      `This is iteration ${iteration.iterationNumber}. What has shifted? What persists? What new questions emerge?`
    );
  } else {
    parts.push('', config.closingQuestion);
  }

  // ─── Protocol Clinical Frame (injected when a protocol is active) ──
  if (councilBias) {
    parts.push(
      '',
      '--- PROTOCOL CLINICAL FRAME ---',
      'A clinical protocol is active for this session. This frame orients the council without overriding the evidence.',
      councilBias,
      '--- END PROTOCOL FRAME ---',
    );
  }

  // ─── Prompt Discipline Reminder ────────────────────────────────────
  parts.push(
    '',
    '--- SYNTHESIS INSTRUCTIONS ---',
    'When synthesizing:',
    '- Prioritize direct evidence (client inquiry, field signals) over practitioner interpretation.',
    '- Name tensions and uncertainties explicitly. Do not resolve them prematurely.',
    '- Suggest the next smallest useful intervention hypothesis, not a complete theory.',
    '- If data is absent or sparse, say so. Honest uncertainty is more useful than confident inference.',
  );

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
