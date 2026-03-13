/**
 * Change Types — Field Orientation for Change Navigation
 *
 * "What nature of change is this?"
 *
 * Each type tunes the AIN council and I Ching interpretation
 * to the right field of attention. This is not diagnosis —
 * it is orientation. The person names the shape of what
 * is moving through them.
 */

import type { Council, FramingDomain } from '@/lib/ain/types';
import type { ChangeContext, ChangeUrgency, ChangeIterationContext } from './types';
import type { DecisionInputBundle } from '@/lib/studio/practitioner/types';

// ─── Types ─────────────────────────────────────────────────────

export type ChangeTypeName =
  | 'dissolution'
  | 'emergence'
  | 'threshold'
  | 'integration'
  | 'upheaval'
  | 'ripening';

export interface ChangeTypeConfig {
  label: string;
  description: string;
  icon: string;                 // lucide-react icon name
  element: string;              // primary Spiralogic element
  council: Council;
  preferDomains: FramingDomain[];
  requireFramings: string[];
  topicHints: string[];
  maxFramings: number;
  closingQuestion: string;
  iChingFocus: string;          // how to weight the I Ching reading for this change type
  contextLabels: {
    stateLabel: string;
    descriptionPlaceholder: string;
    questionsLabel: string;
  };
}

// ─── Configurations ────────────────────────────────────────────

export const CHANGE_TYPE_CONFIGS: Record<ChangeTypeName, ChangeTypeConfig> = {
  dissolution: {
    label: 'Dissolution',
    description: 'Something ending, falling apart, being released.',
    icon: 'Droplets',
    element: 'water',
    council: 'shadow',
    preferDomains: ['human', 'theoretical'],
    requireFramings: ['grief'],
    topicHints: ['loss', 'ending', 'letting go', 'grief', 'release', 'dissolution'],
    maxFramings: 5,
    closingQuestion:
      'What is truly ending here? What is being asked to dissolve? What might be revealed underneath?',
    iChingFocus: 'the timing of release and what the dissolution is making space for',
    contextLabels: {
      stateLabel: 'Inner State',
      descriptionPlaceholder: 'What is ending or falling apart? What is being released?',
      questionsLabel: 'Questions to Sit With',
    },
  },

  emergence: {
    label: 'Emergence',
    description: 'Something new forming, not yet clear.',
    icon: 'Sprout',
    element: 'air',
    council: 'deliberation',
    preferDomains: ['theoretical', 'human'],
    requireFramings: ['phenomenology'],
    topicHints: ['emergence', 'new', 'forming', 'possibility', 'birth', 'creation'],
    maxFramings: 5,
    closingQuestion:
      'What is trying to emerge? What conditions does it need? What would premature action destroy?',
    iChingFocus: 'the nature of what is emerging and what patience or action it requires',
    contextLabels: {
      stateLabel: 'Inner State',
      descriptionPlaceholder: 'What is forming? What are you sensing but cannot yet name?',
      questionsLabel: 'Questions for the Emerging',
    },
  },

  threshold: {
    label: 'Threshold',
    description: 'Standing at a crossing point, before and after.',
    icon: 'DoorOpen',
    element: 'aether',
    council: 'deliberation',
    preferDomains: ['human', 'domain'],
    requireFramings: ['phenomenology'],
    topicHints: ['threshold', 'crossing', 'transition', 'liminal', 'choice', 'passage'],
    maxFramings: 5,
    closingQuestion:
      'What are you crossing from and toward? What must you leave behind? What do you carry forward?',
    iChingFocus: 'the nature of the threshold and what the crossing requires',
    contextLabels: {
      stateLabel: 'Inner State',
      descriptionPlaceholder: 'What threshold are you at? What is on either side?',
      questionsLabel: 'Questions at the Threshold',
    },
  },

  integration: {
    label: 'Integration',
    description: 'Bringing disparate parts together after disruption.',
    icon: 'Merge',
    element: 'earth',
    council: 'deliberation',
    preferDomains: ['human', 'theoretical'],
    requireFramings: ['jung-archetypal'],
    topicHints: ['integration', 'wholeness', 'synthesis', 'reconciliation', 'healing'],
    maxFramings: 5,
    closingQuestion:
      'What parts are seeking integration? What has been split that wants to reunite? What wholeness is possible now?',
    iChingFocus: 'what harmony looks like and what remains to be reconciled',
    contextLabels: {
      stateLabel: 'Inner State',
      descriptionPlaceholder: 'What parts of your life or self are seeking integration?',
      questionsLabel: 'Questions for Integration',
    },
  },

  upheaval: {
    label: 'Upheaval',
    description: 'Forced change, external disruption, loss of ground.',
    icon: 'Zap',
    element: 'fire',
    council: 'deliberation',
    preferDomains: ['human', 'strategic'],
    requireFramings: ['phenomenology'],
    topicHints: ['crisis', 'disruption', 'upheaval', 'shock', 'external', 'force'],
    maxFramings: 5,
    closingQuestion:
      'What ground has shifted? Where is the real danger versus the perceived danger? What can still be trusted?',
    iChingFocus: 'how to find ground in groundlessness and what the upheaval is clearing',
    contextLabels: {
      stateLabel: 'Inner State',
      descriptionPlaceholder: 'What has been disrupted? What ground have you lost?',
      questionsLabel: 'Questions in the Storm',
    },
  },

  ripening: {
    label: 'Ripening',
    description: 'Slow change becoming undeniable, timing arriving.',
    icon: 'Sun',
    element: 'earth',
    council: 'deliberation',
    preferDomains: ['domain', 'human'],
    requireFramings: ['phenomenology'],
    topicHints: ['timing', 'readiness', 'maturation', 'ripening', 'patience', 'season'],
    maxFramings: 5,
    closingQuestion:
      'What has been quietly ripening? What is now ready? What does the timing demand of you?',
    iChingFocus: 'whether the time is truly ripe and what right action looks like now',
    contextLabels: {
      stateLabel: 'Inner State',
      descriptionPlaceholder: 'What has been slowly changing? What feels ready now?',
      questionsLabel: 'Questions about Timing',
    },
  },
};

export const CHANGE_TYPE_LIST: ChangeTypeName[] = [
  'dissolution',
  'emergence',
  'threshold',
  'integration',
  'upheaval',
  'ripening',
];

// ─── Accessors ─────────────────────────────────────────────────

/**
 * Get configuration for a change type.
 * Falls back to 'threshold' for unknown values.
 */
export function getChangeTypeConfig(type?: string | null): ChangeTypeConfig {
  if (type && type in CHANGE_TYPE_CONFIGS) {
    return CHANGE_TYPE_CONFIGS[type as ChangeTypeName];
  }
  return CHANGE_TYPE_CONFIGS.threshold;
}

// ─── Question Builder ──────────────────────────────────────────

/**
 * Build a structured question from change context, oriented by change type.
 * Incorporates the I Ching hexagram when available.
 *
 * When iterationContext is provided, the question includes the arc:
 * prior tensions, recommendation, insights, and what happened since.
 *
 * When inputBundle is provided, the question includes segmented evidence
 * from client inquiry, field signals, and practitioner observations.
 *
 * PROMPT CONSTRAINTS FOR CHANGES — Intervention Design:
 * - Changes should produce the next smallest useful intervention, not a complete theory.
 * - Distinguish witness-first work from technique installation.
 * - Suggest success signals — observable markers, not clinical claims.
 * - Include one risk/caution. Do not pretend the path is without hazard.
 * - Name what to observe next. The experiment is not over at the session boundary.
 * - Honest uncertainty is more useful than confident inference.
 */
export function buildChangeQuestion(
  c: ChangeContext,
  config: ChangeTypeConfig,
  hexagramContext?: { name: string; judgment: string; image: string },
  iteration?: ChangeIterationContext,
  inputBundle?: DecisionInputBundle,
  councilBias?: string
): string {
  const parts: string[] = [
    `CHANGE: ${c.title}`,
    '',
    `NATURE: ${config.label} — ${config.description}`,
    '',
    `DESCRIPTION: ${c.description}`,
  ];

  if (c.urgency && c.urgency !== 'none') {
    parts.push(`URGENCY: ${c.urgency}`);
  }

  if (c.emotionalState) {
    const stateLabel = config.contextLabels.stateLabel.toUpperCase();
    parts.push(`${stateLabel}: ${c.emotionalState}`);
  }

  // I Ching hexagram context — the oracle enriches the council
  if (hexagramContext) {
    parts.push(
      '',
      '--- I CHING HEXAGRAM ---',
      `Hexagram: ${c.hexagramNumber} — ${hexagramContext.name}`,
      `Judgment: ${hexagramContext.judgment}`,
      `Image: ${hexagramContext.image}`
    );
    if (c.changingLines && c.changingLines.length > 0) {
      parts.push(`Changing Lines: positions ${c.changingLines.join(', ')}`);
    }
    if (c.relatingHexagramNumber) {
      parts.push(`Relating Hexagram: ${c.relatingHexagramNumber}`);
    }
    parts.push(
      '',
      `I Ching Focus for this change type: ${config.iChingFocus}`
    );
  }

  // ─── Evidence Bundle ──────────────────────────────────────────
  if (inputBundle) {
    parts.push('', '--- EVIDENCE BUNDLE ---');
    parts.push('Note: Synthesize from direct evidence first. Label inferences as such.');

    const inquiry = inputBundle.clientInquiry;
    if (inquiry && inquiry.responses.length > 0) {
      parts.push('', `CLIENT INQUIRY (${inquiry.promptSetTitle}):`);
      parts.push('Source: client self-report — first-person phenomenology. Primary evidence.');
      for (const r of inquiry.responses) {
        if (r.answer?.trim()) {
          parts.push(`  Q: ${r.questionText}`);
          parts.push(`  A: ${r.answer.trim()}`);
        }
      }
    } else {
      parts.push('', 'CLIENT INQUIRY: Not available. Do not infer client experience from practitioner summary alone.');
    }

    const signals = inputBundle.fieldSignals;
    if (signals && signals.length > 0) {
      parts.push('', 'FIELD SIGNALS (between sessions):');
      for (const sig of signals) {
        const intensity = sig.intensity != null ? ` [intensity: ${Math.round(sig.intensity * 10)}/10]` : '';
        parts.push(`  [${sig.type}/${sig.source}]${intensity} ${sig.title}: ${sig.content}`);
      }
    }

    const observations = inputBundle.practitionerObservations;
    if (observations && observations.length > 0) {
      parts.push('', 'PRACTITIONER OBSERVATIONS:');
      parts.push('Source: practitioner — hypothesis-generating, not confirmed fact.');
      for (const obs of observations) {
        parts.push(`  [${obs.observationType}] ${obs.content}`);
      }
    }

    if (inputBundle.existingNotes?.trim()) {
      parts.push('', 'NOTES:', inputBundle.existingNotes.trim());
    }

    parts.push('', '--- END EVIDENCE BUNDLE ---');
  }

  // Iteration context — the council sees the arc
  if (iteration && iteration.iterationNumber > 1) {
    parts.push('', `--- PRIOR COUNCIL (iteration ${iteration.iterationNumber - 1}) ---`);

    if (iteration.priorTensions.length > 0) {
      parts.push('Key tensions identified:');
      for (const t of iteration.priorTensions) {
        parts.push(`  - ${t}`);
      }
    }

    if (iteration.priorInsights.length > 0) {
      parts.push('Key insights:');
      for (const ins of iteration.priorInsights) {
        parts.push(`  - ${ins}`);
      }
    }

    if (iteration.priorRecommendation) {
      parts.push(`Prior recommendation: ${iteration.priorRecommendation}`);
    }

    if (iteration.priorHexagramNumber) {
      parts.push(`Prior hexagram: ${iteration.priorHexagramNumber}`);
    }

    if (iteration.sessionNotes) {
      parts.push('', 'WHAT HAS HAPPENED SINCE:', iteration.sessionNotes);
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

  // ─── Intervention Design Synthesis Instructions ─────────────────
  parts.push(
    '',
    '--- SYNTHESIS INSTRUCTIONS (INTERVENTION DESIGN) ---',
    'When proposing Changes / next steps:',
    '- Propose the next SMALLEST useful intervention, not a complete treatment plan.',
    '- Distinguish: witness first (awareness work) vs install technique (NLP/hypnosis/somatic).',
    '  Do not move to technique before the phenomenology is clear.',
    '- Name at least one success signal: what would you observe if this is working?',
    '- Name one risk or caution: what to watch for, what could go wrong.',
    '- Specify an observation window: how long before reviewing?',
    '- If field data is sparse, say so. Recommend gathering evidence first.',
    '- Honest uncertainty is more useful than confident prescription.',
  );

  return parts.join('\n');
}

/**
 * Map change urgency to AIN urgency level.
 */
export function mapUrgency(urgency?: ChangeUrgency): 'low' | 'medium' | 'high' {
  switch (urgency) {
    case 'acute':
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    default:
      return 'low';
  }
}
