/**
 * Relational Context Bridge — read-side proof
 *
 * Proves the properties that matter for the wire landed in
 * app/api/sovereign/app/maia/list/route.ts:
 *
 *   1. The prompt block never asserts that recorded state is currently true.
 *   2. Member-authored vs system-inferred provenance is stated, not blurred.
 *   3. The addendum is registered in the addenda channel (reaches CORE/DEEP).
 *   4. The live route gates the read on !isSanctuary — symmetric with the
 *      observeRelationalContent write gate.
 *   5. The read is explicit-handoff only (no ambient fallback enabled).
 *
 * Run:
 *   npx tsx scripts/verify-relational-context-recall.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { formatRelationalContextForPrompt } from '../lib/relationships/formatRelationalContextForPrompt';
import type { ActiveRelationalContext } from '../lib/relationships/types';

const ROOT = join(__dirname, '..');
let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✅ PASS  ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${name}${detail ? `  (${detail})` : ''}`);
    failed++;
  }
}

const sample: ActiveRelationalContext = {
  relationshipId: '00000000-0000-0000-0000-000000000001',
  relationshipLabel: 'Sam',
  realm: 'interpersonal' as ActiveRelationalContext['realm'],
  bondType: 'partner',
  mode: 'repair' as ActiveRelationalContext['mode'],
  salientThemes: ['pursuit-withdraw', 'unspoken obligation'],
  currentTensions: ['rupture'],
  continuitySignals: ['rupture', 'reflection', 'note'],
};

console.log('\n── 1. Prompt block: no fabricated currency ─────────────────────');
const block = formatRelationalContextForPrompt(sample);
check('Block renders the member-authored entry kinds', block.includes('rupture') && block.includes('reflection'));
check('Block names the relationship the member handed off', block.includes('Sam'));
check(
  'Block explicitly refuses to present the record as current fact',
  /not a statement about how things stand today/i.test(block) && /[Nn]ever present it as current/i.test(block)
);
check(
  'Block states the record carries no timestamp',
  /no timestamp/i.test(block)
);
check(
  'Block subordinates the record to what the member says now',
  /the member is\s*\n?\s*right/i.test(block) || /member is right/i.test(block)
);

console.log('\n── 2. Provenance separation ────────────────────────────────────');
check(
  'Member-authored entries are attributed to the member',
  /member logged|member's own/i.test(block)
);
check(
  'Themes are marked system-observed, not member words',
  /system observed|system\s+inference/i.test(block)
);
check(
  'Tension signals are marked system-flagged',
  /system flagged|system\s+inference/i.test(block)
);
check('Block forbids diagnosing the relationship', /do not diagnose/i.test(block));
check(
  'Block forbids characterising the other person',
  /not characterise|do not\s+\n?\s*characterise|characterise the other person/i.test(block)
);

console.log('\n── 3. Addenda channel registration ─────────────────────────────');
const voice = readFileSync(join(ROOT, 'lib/sovereign/maiaVoice.ts'), 'utf8');
check('MaiaContext declares relationalContextAddendum', /relationalContextAddendum\?:\s*string/.test(voice));
check("ADDENDA_SPECS registers 'relationalContextAddendum'", /field:\s*'relationalContextAddendum'/.test(voice));

const service = readFileSync(join(ROOT, 'lib/sovereign/maiaService.ts'), 'utf8');
check('FAST prompt interpolates the block', /\$\{relationalContextAddendum \? '\\n\\n' \+ relationalContextAddendum : ''\}/.test(service));
check('CORE MaiaContext receives the block', /relationalContextAddendum:\s*\(meta as any\)\?\.relationalContextAddendum/.test(service));
check('DEEP consultation recall-addenda include the block', /\(meta as any\)\?\.relationalContextAddendum,/.test(service));

console.log('\n── 4. Sanctuary containment + handoff discipline ───────────────');
const route = readFileSync(join(ROOT, 'app/api/sovereign/app/maia/list/route.ts'), 'utf8');
check(
  'Read is gated on !isSanctuary',
  /if \(userId && !isSanctuary\) \{[\s\S]{0,400}?relationshipContextId/.test(route)
);
check(
  'Read is explicit-handoff only (no ambient fallback enabled)',
  route.includes('getMemberActiveRelationalContext') &&
    !/allowRecentThreadFallback:\s*true/.test(route)
);
check(
  'Load failure cannot block the turn (try/catch present)',
  /relational-context load failed/.test(route)
);
check(
  'Write gate remains sanctuary-guarded (unchanged)',
  /!isSanctuary\) \{\s*\n\s*observeRelationalContent/.test(route)
);
check('Observability marker emitted', /\[MAIA\/sovereign\] relational-context/.test(route));

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log(`║  Results: ${passed} passed · ${failed} failed`);
console.log('╚══════════════════════════════════════════════════════════════╝\n');

process.exit(failed === 0 ? 0 : 1);
