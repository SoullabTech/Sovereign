/** @jest-environment node */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../../../..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

test('the live /maia/list route retrieves governed knowledge and server-binds it after client meta', () => {
  const route = read('app/api/sovereign/app/maia/list/route.ts');
  expect(route).toContain('retrieveGovernedKnowledge(message');
  expect(route).toContain('minSimilarity: 0.55');
  expect(route).toContain('governedKnowledge: governedKnowledgeAddendum || undefined');
  expect(route).toContain('governedKnowledgeAddendum, // 📚 Exact-source governed retrieval');

  const callStart = route.indexOf('getMaiaResponse({');
  const call = route.slice(callStart, route.indexOf('SOVEREIGN_TIMEOUT_MS', callStart));
  expect(call.indexOf('...meta,')).toBeGreaterThanOrEqual(0);
  expect(call.indexOf('governedKnowledgeAddendum, // 📚')).toBeGreaterThan(call.indexOf('...meta,'));
});

test('FAST, CORE and DEEP each carry the governed block through their native cognition seam', () => {
  const service = read('lib/sovereign/maiaService.ts');
  const voice = read('lib/sovereign/maiaVoice.ts');
  const wrapper = read('lib/consciousness/consciousness-layer-wrapper.ts');
  const orchestrator = read('lib/orchestration/consciousness-orchestrator.ts');

  expect(service).toContain('${ainKnowledgeBlock}${governedKnowledgeBlock}${memoryRecallInstruction}');
  expect(voice).toContain("field: 'governedKnowledgeAddendum'");
  expect(service).toContain('governedKnowledgeAddendum: (meta as any)?.governedKnowledgeAddendum');
  expect(wrapper).toContain('governedKnowledgeAddendum?: string');
  expect(wrapper).toContain('this.governedKnowledgeBlock(context)');
  expect(orchestrator).toContain('governedKnowledgeAddendum: context.governedKnowledgeAddendum');
  expect(orchestrator).toContain('Governed knowledge (retrieved source material, not user input)');
});
