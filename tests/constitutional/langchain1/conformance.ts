#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

const eq = (actual: unknown, expected: unknown, label: string) => {
  if (actual !== expected) throw new Error(`${label}: ${String(actual)} != ${String(expected)}`);
};

eq(pkg.dependencies['@langchain/core'], '1.2.13', 'core declaration');
eq(pkg.dependencies['@langchain/openai'], '1.6.0', 'openai adapter declaration');
eq(pkg.dependencies.langchain, undefined, 'direct langchain dependency');
eq(pkg.dependencies['@langchain/community'], undefined, 'direct community dependency');

eq(lock.packages?.['node_modules/@langchain/core']?.version, '1.2.13', 'locked core');
eq(lock.packages?.['node_modules/@langchain/openai']?.version, '1.6.0', 'locked openai adapter');
if (lock.packages?.['node_modules/langchain']) throw new Error('legacy langchain package remains locked');
if (lock.packages?.['node_modules/@langchain/community']) throw new Error('unused community package remains locked');

const orchestrator = read('app/api/_backend/src/core/agents/orchestrator.ts');
const distOrchestrator = read('app/api/_backend/dist-minimal/src/core/agents/orchestrator.js');
if (orchestrator.includes('langchain/chains') || distOrchestrator.includes('langchain/chains'))
  throw new Error('legacy LLMChain import remains');
if (!orchestrator.includes('prompt.pipe(model).pipe(new StringOutputParser())'))
  throw new Error('backend orchestrator does not use the 1.x Runnable pipeline');
if (!distOrchestrator.includes('prompt.pipe(model).pipe(new output_parsers_1.StringOutputParser())'))
  throw new Error('tracked dist-minimal orchestrator is stale');

const providerFiles = [
  'lib/langchain/MayaReasoningChains.ts',
  'lib/langchain/DecentralizedMayaChains.ts',
  'app/api/_backend/src/core/agents/orchestrator.ts',
];
const providerSpecifier = '@langchain/' + 'openai';
const importers = providerFiles.filter((rel) => read(rel).includes(providerSpecifier));
if (importers.length !== 3)
  throw new Error(`provider surface drift: expected 3 grandfathered imports, got ${importers.length}`);

const singularity = read('lib/langchain/adapters/SingularityNetLLM.ts');
if (!singularity.includes('async _call(') || !singularity.includes('async _generate('))
  throw new Error('SingularityNET adapter must implement both _call and _generate');

eq(pkg.dependencies.next, '16.3.6', 'Next declaration drift');
eq(pkg.dependencies.uuid, '14.0.2', 'UUID major drift');
eq(pkg.dependencies['capacitor-voice-recorder'], '^7.0.6', 'voice-recorder major drift');

console.log('LANGCHAIN1 CONFORMANCE: PASS');
console.log('  Core 1.2.13 + OpenAI adapter 1.6.0');
console.log('  unused langchain/community packages removed');
console.log('  legacy LLMChain removed; Runnable pipeline present');
console.log('  provider surface count unchanged');
console.log('  Next / UUID / voice-recorder boundaries preserved');
