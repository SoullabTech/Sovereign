/**
 * AIN Prompt Integrity Check
 * Verifies the AIN Integrative Alchemy directive is present in both prompt paths
 */

import { getMayaSystemPrompt } from '../lib/oracle/MaiaSystemPrompt';
import { MAIA_RUNTIME_PROMPT } from '../lib/consciousness/MAIA_RUNTIME_PROMPT';
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from '../lib/ai/prompts/ainIntegrativeAlchemy';

const sentinel = AIN_INTEGRATIVE_ALCHEMY_SENTINEL;

const oracleHasAIN = getMayaSystemPrompt().includes(sentinel);
const runtimeHasAIN = MAIA_RUNTIME_PROMPT.includes(sentinel);

console.log('getMayaSystemPrompt HAS_AIN=', oracleHasAIN);
console.log('MAIA_RUNTIME_PROMPT HAS_AIN=', runtimeHasAIN);

if (!oracleHasAIN || !runtimeHasAIN) {
  console.error('\n❌ AIN Integrative Alchemy directive missing from prompt path(s)!');
  process.exit(1);
}

console.log('\n✅ AIN Integrative Alchemy directive verified in both prompt paths');
