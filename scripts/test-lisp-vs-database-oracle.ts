/**
 * Test: Live Lisp Oracle vs Database Oracle
 *
 * Compares the two approaches to see if live Lisp feels more "alive"
 *
 * Usage: npx tsx scripts/test-lisp-vs-database-oracle.ts
 */

import { queryLispOracle, checkLispOracleHealth } from '../lib/oracle/lispOracleClient';

// Mock database oracle for comparison
// (In production, this would query the database)
const DATABASE_ORACLE_MOCK = {
  self_expression_fire: {
    title: "Fire in the Voice",
    text: "Your words are carrying more voltage than your body can easily hold. The impulse to speak is true, but the tempo may be outrunning your capacity to feel. Let expression become a flame held in a hearth, not a wildfire searching for oxygen.",
    keywords: ["courage", "visibility", "tempo", "authenticity", "passion"],
    questions: [
      "Where am I speaking faster or louder than I can actually *feel*?",
      "What truth in me feels hot but not yet rooted?",
      "Who am I secretly hoping will finally see me when I burn this bright?"
    ]
  },
  intimacy_water: {
    title: "Being Seen from the Inside",
    text: "Your heart is asking for contact that touches the inner layers, not just shared activities or compatible roles. Intimacy now means letting someone see the parts you usually protect, the tenderness beneath the competence.",
    keywords: ["vulnerability", "depth", "soul contact", "transparency", "tender"],
    questions: [
      "What part of me feels ready to be known more deeply?",
      "Who in my life might be able to hold this tenderness?",
      "What old story tells me it's not safe to be seen this fully?"
    ]
  }
};

async function queryDatabaseOracle(facet: string, element: string) {
  const key = `${facet}_${element}`;
  const data = DATABASE_ORACLE_MOCK[key as keyof typeof DATABASE_ORACLE_MOCK];

  if (!data) {
    return { status: 'not_found', message: `No mapping for ${facet}+${element}` };
  }

  return {
    status: 'ok',
    source: 'database',
    facet,
    element,
    title: data.title,
    oracleText: data.text,
    keywords: data.keywords,
    reflectionQuestions: data.questions,
  };
}

async function runComparison() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Live Lisp Oracle vs Database Oracle - Side by Side      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Check Lisp oracle health
  console.log('🔍 Checking Lisp oracle server health...');
  const isHealthy = await checkLispOracleHealth();

  if (!isHealthy) {
    console.log('❌ Lisp oracle server not running on port 4444');
    console.log('   Start it with: cd /Users/soullab/lisp-examples && bash run-oracle.sh\n');
    process.exit(1);
  }

  console.log('✅ Lisp oracle server is healthy\n');

  // Test cases
  const testCases = [
    { facet: 'self_expression', element: 'fire', description: 'Self-Expression + Fire' },
    { facet: 'intimacy', element: 'water', description: 'Intimacy + Water' },
  ];

  for (const testCase of testCases) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nTest: ${testCase.description}`);
    console.log('─────────────────────────────────────────────────────────────\n');

    // Query both sources
    const startLisp = Date.now();
    const lispResult = await queryLispOracle(testCase.facet, testCase.element);
    const lispTime = Date.now() - startLisp;

    const startDb = Date.now();
    const dbResult = await queryDatabaseOracle(testCase.facet, testCase.element);
    const dbTime = Date.now() - startDb;

    // Display results side by side
    console.log('🔥 LISP ORACLE (Live SBCL Server)');
    console.log(`   Response time: ${lispTime}ms`);
    console.log(`   Title: ${lispResult.title}`);
    console.log(`   Text: ${lispResult.oracleText?.substring(0, 100)}...`);
    console.log(`   Keywords: ${lispResult.keywords?.join(', ')}`);
    console.log();

    console.log('💾 DATABASE ORACLE (PostgreSQL Lookup)');
    console.log(`   Response time: ${dbTime}ms`);
    console.log(`   Title: ${dbResult.title}`);
    console.log(`   Text: ${dbResult.oracleText?.substring(0, 100)}...`);
    console.log(`   Keywords: ${dbResult.keywords?.join(', ')}`);
    console.log();

    // Compare
    const contentMatch = lispResult.title === dbResult.title;
    console.log(`📊 Content Match: ${contentMatch ? '✅ Identical' : '❌ Different'}`);
    console.log(`⚡ Speed Delta: Database ${dbTime < lispTime ? 'faster' : 'slower'} by ${Math.abs(lispTime - dbTime)}ms`);
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('SUBJECTIVE ASSESSMENT QUESTIONS:\n');
  console.log('1. Does the Lisp oracle response feel more "alive"?');
  console.log('2. Is there a quality difference despite identical content?');
  console.log('3. Would users notice if we switched between the two?');
  console.log('4. Is the Lisp server complexity worth any perceived difference?\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runComparison().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
