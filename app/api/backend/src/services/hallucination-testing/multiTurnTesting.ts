import { v4 as uuidv4 } from 'uuid';
import type { ModelRunner } from './testRunner';
import { normalizeText } from './validators/schema';

export interface MultiTurnCase {
  id: string;
  turns: {
    prompt: string;
    expected?: any;
  }[];
  consistencyChecks: {
    description: string;
    validate: (responses: string[]) => { consistent: boolean; details: string };
  }[];
}

export interface MultiTurnResult {
  caseId: string;
  turns: {
    prompt: string;
    response: string;
  }[];
  consistencyResults: {
    description: string;
    consistent: boolean;
    details: string;
  }[];
  overallConsistency: number;
  contradictionDetected: boolean;
}

const MULTI_TURN_CASES: MultiTurnCase[] = [
  {
    id: 'multi-turn-alchemy-1',
    turns: [
      {
        prompt: 'I feel stuck in the Fire/Vision phase. What does that mean?',
        expected: { shouldMentionFire: true, shouldMentionVision: true }
      },
      {
        prompt: 'What about the Water/Descent phase? How is that different?',
        expected: { shouldReferenceFireFromTurn1: true }
      }
    ],
    consistencyChecks: [
      {
        description: 'Should reference Fire/Vision from turn 1 when discussing Water/Descent',
        validate: (responses) => {
          const turn1 = normalizeText(responses[0]);
          const turn2 = normalizeText(responses[1]);
          const referencesFireOrVision = turn2.includes('fire') || turn2.includes('vision');
          const discussesWater = turn2.includes('water') && turn2.includes('descent');
          return {
            consistent: referencesFireOrVision && discussesWater,
            details: referencesFireOrVision
              ? 'Referenced Fire/Vision appropriately'
              : 'Failed to reference previous phase discussion'
          };
        }
      }
    ]
  },
  {
    id: 'multi-turn-wisdom-1',
    turns: [
      {
        prompt: 'Tell me about Viktor Frankl\'s main idea.',
        expected: { shouldMentionMeaning: true }
      },
      {
        prompt: 'How does that relate to Maslow\'s hierarchy?',
        expected: { shouldReferenceFranklFromTurn1: true }
      }
    ],
    consistencyChecks: [
      {
        description: 'Should maintain Frankl\'s concept when comparing to Maslow',
        validate: (responses) => {
          const turn1 = normalizeText(responses[0]);
          const turn2 = normalizeText(responses[1]);
          const frankl1 = turn1.includes('frankl') || turn1.includes('meaning');
          const frankl2 = turn2.includes('frankl') || turn2.includes('meaning');
          const maslow2 = turn2.includes('maslow') || turn2.includes('hierarchy');
          return {
            consistent: frankl1 && frankl2 && maslow2,
            details: frankl2
              ? 'Maintained Frankl\'s concept across turns'
              : 'Lost track of Frankl when discussing Maslow'
          };
        }
      }
    ]
  },
  {
    id: 'multi-turn-phenomenology-1',
    turns: [
      {
        prompt: 'I dreamed I was flying over a city.',
        expected: { shouldAcknowledgeDream: true }
      },
      {
        prompt: 'What does that mean about my waking life?',
        expected: { shouldReferenceDreamFromTurn1: true }
      }
    ],
    consistencyChecks: [
      {
        description: 'Should reference the flying dream when discussing waking life implications',
        validate: (responses) => {
          const turn2 = normalizeText(responses[1]);
          const referencesDream = turn2.includes('flying') || turn2.includes('dream') || turn2.includes('sky') || turn2.includes('city');
          return {
            consistent: referencesDream,
            details: referencesDream
              ? 'Referenced dream content when discussing waking life'
              : 'Failed to connect dream to waking life discussion'
          };
        }
      }
    ]
  },
  {
    id: 'multi-turn-contradiction-test-1',
    turns: [
      {
        prompt: 'Is the Fire element associated with transformation?',
        expected: { shouldSayYes: true }
      },
      {
        prompt: 'And the Water element, is that also about transformation?',
        expected: { shouldDifferentiate: true }
      }
    ],
    consistencyChecks: [
      {
        description: 'Should maintain distinct element meanings without contradiction',
        validate: (responses) => {
          const turn1 = normalizeText(responses[0]);
          const turn2 = normalizeText(responses[1]);
          const fireIsTransformative = turn1.includes('yes') || turn1.includes('fire') && (turn1.includes('transform') || turn1.includes('change'));
          const waterDistinct = turn2.includes('water') && (turn2.includes('flow') || turn2.includes('emotion') || turn2.includes('descent') || turn2.includes('different'));
          return {
            consistent: fireIsTransformative && waterDistinct,
            details: waterDistinct
              ? 'Maintained distinct element characteristics'
              : 'Conflated Fire and Water characteristics'
          };
        }
      }
    ]
  }
];

export class MultiTurnTestRunner {
  constructor(private modelRunner: ModelRunner) {}

  async runMultiTurnTests(): Promise<MultiTurnResult[]> {
    const results: MultiTurnResult[] = [];

    for (const testCase of MULTI_TURN_CASES) {
      const turnResults: { prompt: string; response: string }[] = [];

      for (const turn of testCase.turns) {
        try {
          const response = await this.modelRunner.call(turn.prompt, { previousTurns: turnResults });
          turnResults.push({
            prompt: turn.prompt,
            response
          });
        } catch (error) {
          console.error(`[MultiTurnTest] Error on case ${testCase.id}:`, error);
          turnResults.push({
            prompt: turn.prompt,
            response: ''
          });
        }
      }

      const responses = turnResults.map(t => t.response);
      const consistencyResults = testCase.consistencyChecks.map(check => ({
        description: check.description,
        ...check.validate(responses)
      }));

      const consistentChecks = consistencyResults.filter(r => r.consistent).length;
      const overallConsistency = consistentChecks / consistencyResults.length;
      const contradictionDetected = overallConsistency < 0.5;

      results.push({
        caseId: testCase.id,
        turns: turnResults,
        consistencyResults,
        overallConsistency,
        contradictionDetected
      });
    }

    return results;
  }
}

export function getMultiTurnCases(): MultiTurnCase[] {
  return MULTI_TURN_CASES;
}