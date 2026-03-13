/**
 * Protocol Registry
 *
 * A Protocol is a named clinical pathway that bundles:
 * - The target pattern (what we are working with)
 * - Recommended inquiry sets (in clinical order)
 * - A staged intervention sequence with conditions and templates
 * - The field signal types most diagnostically relevant
 * - An occupancy target score
 * - Concrete success metrics by timeframe
 * - Risk notes specific to this pattern
 *
 * Protocols are optional overlays on the practitioner loop.
 * The loop works without them. Protocols provide operational clarity
 * for repeatable clinical pathways — turning flexible architecture
 * into deployable practice.
 *
 * Adding a new protocol:
 * 1. Add a ProtocolDefinition to PROTOCOL_REGISTRY
 * 2. Reference the prompt set IDs from promptSets.ts
 * 3. Reference the template IDs from interventionTemplates.ts
 * 4. Map the stages explicitly — do not skip stages
 */

import type { FieldSignalType } from './types';

// ─── Interfaces ─────────────────────────────────────────────────

export interface ProtocolStage {
  stage: number;
  label: string;
  condition: string;         // What must be true before this stage is usable
  proceedWhen: string;       // What must happen before advancing
  templateId: string;        // Matches interventionTemplates.ts
  modality: string;          // Human-readable modality label
  goal: string;
  caution?: string;
}

export interface SuccessMetric {
  timeframe: string;
  markers: string[];
}

export interface InquirySets {
  primary: string;           // prompt set id — use in first 1–2 sessions
  recurring?: string;        // shorter form for ongoing weekly tracking
  relational?: string;       // deeper relational layer when the dyad can hold it
  preHypnotherapy?: string;  // before any trance or age regression work
}

export interface InterventionSelectionRule {
  occupancyScore: [number, number];   // [min, max] inclusive
  warmInterruptionTolerated?: boolean;
  recommendation: string;
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  targetPattern: string;     // One clear sentence on what we are working with
  inquirySets: InquirySets;
  prioritizedSignalTypes: FieldSignalType[];
  interventionStages: ProtocolStage[];
  interventionSelectionRules: InterventionSelectionRule[];
  occupancyTarget: number;   // Target score to aim for (1 = reciprocal, 5 = total)
  /**
   * councilBias is injected into the council synthesis prompt when this protocol is active.
   * It orients the council toward the pattern-specific concerns without overriding the
   * evidence. Think of it as the clinical frame the council brings to the table.
   */
  councilBias: string;
  successMetrics: SuccessMetric[];
  riskNotes: RiskNote[];
  generalizesTo?: string[];  // Other patterns this structure applies to
}

export interface RiskNote {
  label: string;
  description: string;
  watch: string;
  reframe: string;
}

// ─── Registry ───────────────────────────────────────────────────

export const PROTOCOL_REGISTRY: Record<string, ProtocolDefinition> = {

  'relational-occupation': {
    id: 'relational-occupation',
    name: 'Conversational Urgency / Relational Occupation',
    shortName: 'Relational Occupation',
    description:
      'Sustained conversational occupation — flooding speech, inability to pause, interruption compulsion, silence intolerance, urgency to pre-empt the moment\'s closing.',
    targetPattern:
      'The client manages proximity, visibility, and fear of disappearing from relational space by occupying the conversational channel. This is not an etiquette problem. It is a relational structure.',

    inquirySets: {
      primary:         'conversational-urgency',
      recurring:       'conversational-urgency-short',
      relational:      'relational-occupation',
      preHypnotherapy: 'hypnotherapy-nlp-prep',
    },

    prioritizedSignalTypes: ['somatic', 'relational', 'behavioral', 'emotional'],

    interventionStages: [
      {
        stage: 1,
        label: 'Precursor Mapping',
        modality: 'Hypnosis (light trance)',
        condition: 'Client can name the pattern but has no gap between precursor and action.',
        proceedWhen: 'Client can name the signal distinctly from the action.',
        templateId: 'light-trance-precursor-mapping',
        goal: 'Client experiences the precursor signal as separate from the behavioral impulse.',
      },
      {
        stage: 2,
        label: 'Relational Pause Tolerance',
        modality: 'Relational experiment (between sessions)',
        condition: 'Client knows the precursor and has begun to notice it.',
        proceedWhen: 'Client completes the pause experiment at least twice and reports something discovered in the pause.',
        templateId: 'relational-pause-tolerance',
        goal: 'Build tolerance for micro-pauses in low-stakes contexts.',
      },
      {
        stage: 3,
        label: 'Somatic Anchor Installation',
        modality: 'NLP / somatic',
        condition: 'Client can notice the signal and has experienced successful pausing.',
        proceedWhen: 'Anchor reliably recalls calm-present state in session; client reports using it between sessions.',
        templateId: 'somatic-anchor-installation',
        goal: 'Client has a self-activatable state resource for the moment of urgency onset.',
      },
      {
        stage: 4,
        label: 'Pattern Interrupt with Substitute Discharge',
        modality: 'NLP',
        condition: 'Urgency is still high but the anchor exists.',
        proceedWhen: 'Client can insert a brief conscious discharge when urgency peaks.',
        templateId: 'pattern-interrupt-substitute-discharge',
        goal: 'Client inserts a brief conscious discharge (feet, breath, touch) when urgency peaks.',
        caution: 'This is a transitional tool, not the destination. Review what the urgency is protecting.',
      },
      {
        stage: 5,
        label: 'Receiving / Spaciousness Trance',
        modality: 'Hypnosis',
        condition: 'Client has the anchor and can sometimes pause. Ready to go deeper.',
        proceedWhen: 'Client reports genuine curiosity about what the other person will say next.',
        templateId: 'receiving-spaciousness-trance',
        goal: 'Client viscerally experiences receiving another person\'s full expression without urgency.',
      },
      {
        stage: 6,
        label: 'Age Regression (if indicated)',
        modality: 'Hypnosis',
        condition: 'Channel is usable, client is stable, prior stages are integrated.',
        proceedWhen: 'Material processes rather than floods — client can stay with what arises.',
        templateId: 'age-regression-first-time-heard',
        goal: 'Access the earliest relational context of the pattern.',
        caution: 'Do not lead here until the live channel is open enough for the material to be processed rather than flooded.',
      },
    ],

    interventionSelectionRules: [
      {
        occupancyScore: [4, 5],
        warmInterruptionTolerated: false,
        recommendation: 'Map precursor only. No technique installation this session.',
      },
      {
        occupancyScore: [4, 5],
        warmInterruptionTolerated: true,
        recommendation: 'Map precursor + introduce pause experiment for between sessions.',
      },
      {
        occupancyScore: [3, 3],
        warmInterruptionTolerated: false,
        recommendation: 'Pause experiment + introduce anchor in low-stakes context.',
      },
      {
        occupancyScore: [3, 3],
        warmInterruptionTolerated: true,
        recommendation: 'Install anchor.',
      },
      {
        occupancyScore: [1, 2],
        recommendation: 'Receiving trance or age regression if client is stable and willing.',
      },
    ],

    occupancyTarget: 2,

    councilBias:
      'Focus analysis on relational structure, silence intolerance, and somatic precursor states. ' +
      'Prioritize: the somatic signal preceding occupation (chest, throat, urgency onset); whether this is ' +
      'proximity-management or fear of disappearing from relational space; what the occupation is protecting; ' +
      'the smallest intervention that creates a gap rather than produces insight. ' +
      'Note any interruption dynamics, compensatory flooding, or shame collapse that occurred this session. ' +
      'Do not produce elegant synthesis — produce the one concrete next move the practitioner can make.',

    successMetrics: [
      {
        timeframe: 'Week 1–2',
        markers: [
          'Client can name the somatic precursor signal',
          'Client reports at least one moment of noticing the urgency before acting',
          'Occupancy score below 4 at least once',
        ],
      },
      {
        timeframe: 'Week 3–4',
        markers: [
          'Client completes pause experiment in low-stakes context',
          'Something new discovered in the pause',
          'Occupancy trend: stable or improving',
        ],
      },
      {
        timeframe: 'Month 2',
        markers: [
          'Client spontaneously pauses in at least one conversation per week',
          'Anchor installed and used between sessions',
          'Interruption frequency reduced (client or partner report)',
          'First moment of genuine receiving — "I was actually curious what she would say next"',
        ],
      },
      {
        timeframe: 'Month 3',
        markers: [
          'Occupancy score predominantly 1–2',
          'Warm interruption tolerated in session',
          'Client can discuss the relational pattern without flooding',
          'Grief or fear beneath the pattern accessible (if Stage 5/6 used)',
        ],
      },
    ],

    riskNotes: [
      {
        label: 'Shame collapse',
        description: 'When the urgency is named directly, some clients collapse into shame rather than curiosity.',
        watch: 'Sudden deflation, self-criticism, "I know, I\'m terrible."',
        reframe: 'This has a function. Let\'s find out what it\'s protecting.',
      },
      {
        label: 'Compensatory flooding',
        description: 'A client who is interrupted may flood more immediately afterward.',
        watch: 'Increased occupation immediately after a warm interruption.',
        reframe: 'Name it live: "There it is. The urgency just went up. What happened in your body just then?"',
      },
      {
        label: 'Narrative as defense',
        description: 'If the client begins bringing elaborate stories about their interrupting behavior, the inquiry is functioning as another occupation channel.',
        watch: 'Long-form stories about the pattern instead of signal-dense responses.',
        reframe: 'Tighten the inquiry to 4 questions with hard limits. Keep focus on the body, not the story.',
      },
      {
        label: 'Age regression too early',
        description: 'If the therapeutic relationship is still occupied, regression material may become narrative rather than contact.',
        watch: 'Channel still occupied, warm interruption not yet tolerated.',
        reframe: 'Wait until the channel is open before regression work.',
      },
    ],

    generalizesTo: [
      'grief-withdrawal',
      'conflict-avoidance',
      'indecision-stuck',
    ],
  },

};

// ─── Helpers ─────────────────────────────────────────────────────

export function getProtocol(id: string): ProtocolDefinition | undefined {
  return PROTOCOL_REGISTRY[id];
}

export function getAllProtocols(): ProtocolDefinition[] {
  return Object.values(PROTOCOL_REGISTRY);
}

/**
 * Given an occupancy score and whether a warm interruption was tolerated,
 * returns the matching intervention selection rule for this protocol.
 */
export function getInterventionRecommendation(
  protocol: ProtocolDefinition,
  occupancyScore: number,
  warmInterruptionTolerated?: boolean | null,
): string | null {
  for (const rule of protocol.interventionSelectionRules) {
    const [min, max] = rule.occupancyScore;
    if (occupancyScore < min || occupancyScore > max) continue;
    if (rule.warmInterruptionTolerated !== undefined && warmInterruptionTolerated !== null) {
      if (rule.warmInterruptionTolerated !== warmInterruptionTolerated) continue;
    }
    return rule.recommendation;
  }
  return null;
}
