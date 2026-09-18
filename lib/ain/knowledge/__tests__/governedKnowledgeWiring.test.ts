/** @jest-environment node */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../../../..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

test('the live /maia/list route retrieves governed knowledge and server-binds it after client meta', () => {
  const route = read('app/api/sovereign/app/maia/list/route.ts');
  expect(route).toContain('retrieveGovernedKnowledge(message');
  // The route may invoke governed retrieval but may not own SELECTIVE policy.
  expect(route).not.toContain('minSimilarity: 0.55');
  expect(route).not.toContain('limit: 3');
  expect(route).toContain('governedKnowledge: governedKnowledgeAddendum || undefined');
  expect(route).toContain('governedKnowledgeAddendum, // 📚 Exact-source governed retrieval');

  const callStart = route.indexOf('getMaiaResponse({');
  const call = route.slice(callStart, route.indexOf('SOVEREIGN_TIMEOUT_MS', callStart));
  expect(call.indexOf('...meta,')).toBeGreaterThanOrEqual(0);
  expect(call.indexOf('governedKnowledgeAddendum, // 📚')).toBeGreaterThan(call.indexOf('...meta,'));
});

test('the live route refuses governed retrieval in Sanctuary and treats the rollout flag as enablement, not authority', () => {
  const route = read('app/api/sovereign/app/maia/list/route.ts');
  const retrievalStart = route.indexOf('// 📚 GOVERNED KNOWLEDGE RETRIEVAL');
  const retrievalEnd = route.indexOf('// ═══ MEMORY ORCHESTRATOR', retrievalStart);
  const block = route.slice(retrievalStart, retrievalEnd);

  expect(retrievalStart).toBeGreaterThan(-1);
  expect(block).toContain("if (process.env.AIN_KNOWLEDGE_GATE_ENABLED === '1' && !isSanctuary)");
  expect(block).toContain('retrieveGovernedKnowledge(message');
  expect(block.indexOf('!isSanctuary')).toBeLessThan(block.indexOf('retrieveGovernedKnowledge(message'));
  expect(block).toContain('operational rollout kill-switch only');
  expect(block).toContain('source authority is consumed at runtime');
  expect(block).toContain('SELECTIVE effects and require their own exact grant + attestation');
});

test('FAST, CORE and DEEP carry one governed evidence participation through their native cognition seam', () => {
  const service = read('lib/sovereign/maiaService.ts');
  const voice = read('lib/sovereign/maiaVoice.ts');
  const wrapper = read('lib/consciousness/consciousness-layer-wrapper.ts');
  const orchestrator = read('lib/orchestration/consciousness-orchestrator.ts');

  expect(service).toContain('${ainKnowledgeBlock}${governedKnowledgeBlock}${memoryRecallInstruction}');
  expect(voice).toContain("field: 'governedKnowledgeAddendum'");
  expect(service).toContain('governedKnowledgeAddendum: (meta as any)?.governedKnowledgeAddendum');
  expect(wrapper).toContain('governedKnowledgeAddendum?: string');
  expect(orchestrator).toContain('governedKnowledgeAddendum: context.governedKnowledgeAddendum');
  expect(orchestrator).toContain('Governed knowledge (retrieved source material, not user input)');

  const observerBuilder = wrapper.slice(
    wrapper.indexOf('private buildObserverPrompt'),
    wrapper.indexOf('private detectTemporalPatterns'),
  );
  const temporalLayerBuilder = wrapper.slice(
    wrapper.indexOf('private buildTemporalPrompt'),
    wrapper.indexOf('private buildTemporalSynthesisPrompt'),
  );
  const temporalSynthesisBuilder = wrapper.slice(
    wrapper.indexOf('private buildTemporalSynthesisPrompt'),
    wrapper.indexOf('private detectMetaTriggers'),
  );
  const metaBuilder = wrapper.slice(
    wrapper.indexOf('private buildMetaConsciousnessPrompt'),
    wrapper.indexOf('private async generateMetaReflection'),
  );

  // DEEP does not multiply source weight across recursive/parallel readers.
  expect(observerBuilder).not.toContain('governedKnowledgeBlock(context)');
  expect(temporalLayerBuilder).not.toContain('governedKnowledgeBlock(context)');
  expect(metaBuilder).not.toContain('governedKnowledgeBlock(context)');
  expect(temporalSynthesisBuilder).toContain('governedKnowledgeBlock(context)');

  // Recursive/meta native orchestration gets one governed knowledge stream; only
  // the fallback prompt receives the block if that native orchestration yields no message.
  expect(wrapper.match(/governedKnowledgeAddendum: context\.governedKnowledgeAddendum/g)).toHaveLength(2);
  expect(wrapper.match(/fallbackGeneration\(\s*\n?\s*observerPrompt \+ this\.governedKnowledgeBlock\(context\)/g)).toHaveLength(1);
  expect(wrapper.match(/fallbackGeneration\(\s*\n?\s*metaPrompt \+ this\.governedKnowledgeBlock\(context\)/g)).toHaveLength(1);

  // Optional DEEP consultation never receives a second raw copy after a
  // successfully source-grounded local stage; it becomes the source seam only
  // when that local stage did not complete.
  expect(service).toContain('let governedKnowledgeConsumedInLocalStage = false');
  expect(service).toContain('governedKnowledgeConsumedInLocalStage = Boolean((meta as any)?.governedKnowledgeAddendum)');
  expect(service).toContain('!governedKnowledgeConsumedInLocalStage');
});
