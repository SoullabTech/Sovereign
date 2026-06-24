/**
 * §7 Verification Gate — Direct Recall Resolver proof (headless, read-only).
 * Spec: docs/specs/DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md §7
 *
 * Proves the missing retrieve verb without touching MAIA's conversational
 * behavior:
 *   locate(Kelly, "CeCe facilitator")  → finds idea 5116c2ef / its block
 *   materialize(<ref>)                 → returns the actual saved content
 *   cross-member                       → rejected (locate + materialize)
 *   sanctuary session                  → recall disabled
 *   flag OFF                           → empty
 *
 * Point DATABASE_URL at a DB holding the fixture (prod data: idea 5116c2ef under
 * Kelly ce284751…). Run:  npx tsx scripts/directRecall/proof.ts
 */

import { locateMemoryObjects, materializeMemoryObject } from '@/lib/memory/directRecall';

const KELLY = process.env.PROOF_MEMBER ?? 'ce284751-e457-42f6-89b6-bc07d0876682';
const OTHER = process.env.PROOF_OTHER ?? '3946706a-3082-47e6-8d72-b627a8f22b55'; // Jondi
const EXPECT_IDEA = '5116c2ef';
const EXPECT_BLOCK = '0eaa5280';
const QUERY = process.env.PROOF_QUERY ?? 'CeCe facilitator';

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = ''): void {
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? `  — ${detail}` : ''}`);
  if (ok) pass++;
  else fail++;
}

async function main(): Promise<void> {
  console.log(`Direct Recall proof — member=${KELLY.slice(0, 8)} query="${QUERY}"\n`);

  // 0. Flag OFF → empty (safeguard #4)
  process.env.DIRECT_RECALL_ENABLED = '';
  const off = await locateMemoryObjects(KELLY, QUERY);
  check('flag OFF → empty', off.length === 0, `got ${off.length}`);

  process.env.DIRECT_RECALL_ENABLED = '1';

  // 1. Locate finds the CeCe content
  const found = await locateMemoryObjects(KELLY, QUERY);
  const fmt = found.map((r) => `${r.source}:${r.sourceId.slice(0, 8)}`).join(', ');
  const hasIdea = found.some((r) => r.sourceId.startsWith(EXPECT_IDEA));
  const hasBlock = found.some((r) => r.sourceId.startsWith(EXPECT_BLOCK));
  check('locate(Kelly,"CeCe facilitator") finds idea/block', hasIdea || hasBlock, `${found.length} refs: ${fmt}`);

  // 2. Materialize returns real content (not title-only)
  const target =
    found.find((r) => r.sourceId.startsWith(EXPECT_BLOCK)) ??
    found.find((r) => r.sourceId.startsWith(EXPECT_IDEA)) ??
    found[0];
  const mat = target ? await materializeMemoryObject(KELLY, target) : null;
  check(
    'materialize → non-empty body',
    !!mat && mat.body.trim().length > 0,
    mat ? `${mat.body.length} chars from ${mat.ref.source}` : 'no target ref',
  );

  // 3. Cross-member locate does NOT see Kelly's objects
  const cross = await locateMemoryObjects(OTHER, QUERY);
  const leak = cross.some(
    (r) => r.memberId === KELLY || r.sourceId.startsWith(EXPECT_IDEA) || r.sourceId.startsWith(EXPECT_BLOCK),
  );
  check('cross-member locate → no Kelly objects', !leak, `${cross.length} refs for other member`);

  // 3b. Cross-member materialize of a Kelly ref → null (ownership re-check)
  const crossMat = target ? await materializeMemoryObject(OTHER, target) : null;
  check('cross-member materialize(Kelly ref) → null', crossMat === null);

  // 4. Sanctuary session → recall disabled
  const sanct = await locateMemoryObjects(KELLY, QUERY, { isSanctuary: true });
  check('sanctuary session → empty', sanct.length === 0, `got ${sanct.length}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('PROOF ERROR:', e);
  process.exit(1);
});
