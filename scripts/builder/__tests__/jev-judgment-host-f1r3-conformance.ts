/**
 * JEV-INT-02H — additive conformance adapter.
 * Runs the frozen F1R3 falsifiers against the new host-side implementation.
 * Does not modify or reinterpret the frozen suite.
 */
import { FALSIFIERS, FALSIFIER_IDS } from '../../../tests/constitutional/jarvis-jev-j1/falsifiers';
import {
  QUESTION_IDS,
  TASK_SHAPES,
  type ContractModel,
  type JudgmentPacket,
} from '../../../tests/constitutional/jarvis-jev-j1/contract-model';
import {
  admitJevResponse,
  applyJevToAuthority,
  constructJevPacket,
  constructionFailureEffect,
  hostFailureReason,
  outboundJevRepresentation,
  projectJevAdvice,
  repositoryDerivedMetadataEligible,
} from '../jev-judgment-host-v1.mjs';

const MODEL: ContractModel = {
  constructPacket: (state, question) => constructJevPacket(state, question) as any,
  outboundRepresentation: (packet: JudgmentPacket) => {
    const result = outboundJevRepresentation(packet);
    return result.ok ? result.representation : null;
  },
  packetMembers: (packet: unknown) =>
    packet && typeof packet === 'object' ? Object.keys(packet) : [],
  classShapeEligible: repositoryDerivedMetadataEligible,
  constructionFailureEffect,
  hostFailureReason: (observation) => hostFailureReason(observation) as any,
  admit: (packet, observation) => admitJevResponse(packet, observation) as any,
  produceAdvice: (prior, judgments) => projectJevAdvice(prior, judgments) as any,
  applyAuthority: (prior, judgments) => applyJevToAuthority(prior, judgments) as any,
  refusalRecordsPacket: () => false,
  taskShapes: () => TASK_SHAPES,
  questionIds: () => QUESTION_IDS,
};

let passed = 0;
const failures: string[] = [];

for (const id of FALSIFIER_IDS) {
  const falsifier = FALSIFIERS[id];
  if (!falsifier) {
    failures.push(id + ': missing falsifier');
    continue;
  }
  try {
    falsifier(MODEL);
    passed += 1;
    console.log('PASS  ' + id);
  } catch (error) {
    failures.push(id + ': ' + (error as Error).message);
    console.log('FAIL  ' + id);
    console.log('      ' + (error as Error).message);
  }
}

console.log('');
console.log('frozen falsifiers passed: ' + passed + '/' + FALSIFIER_IDS.length);
console.log('failures: ' + failures.length);

if (failures.length) {
  for (const failure of failures) console.log('  ' + failure);
  process.exit(1);
}

console.log('JEV-INT-02H F1R3 CONFORMANCE — PASS');
