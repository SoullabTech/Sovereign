/**
 * Full Detail Oracle Test
 *
 * Shows complete oracle response from Lisp server
 * to evaluate the "aliveness" factor
 */

import { queryLispOracle } from '../lib/oracle/lispOracleClient';

async function showFullOracleResponse() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        Full Lisp Oracle Response - Detail View           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const testCases = [
    { facet: 'self_expression', element: 'fire', label: 'SELF-EXPRESSION + FIRE' },
    { facet: 'calling', element: 'air', label: 'CALLING + AIR' },
    { facet: 'power', element: 'earth', label: 'POWER + EARTH' },
  ];

  for (const test of testCases) {
    console.log('\n' + '═'.repeat(60));
    console.log(test.label);
    console.log('═'.repeat(60));

    const result = await queryLispOracle(test.facet, test.element);

    if (result.status === 'ok') {
      console.log(`\n📖 TITLE: ${result.title}`);
      console.log(`🜍  INTENSITY: ${result.intensity}`);
      console.log(`\n💬 ORACLE TEXT:\n`);
      console.log(`   ${result.oracleText}\n`);
      console.log(`🔑 KEYWORDS: ${result.keywords?.join(', ')}\n`);
      console.log(`🤔 REFLECTION QUESTIONS:\n`);
      result.reflectionQuestions?.forEach((q, i) => {
        console.log(`   ${i + 1}. ${q}`);
      });
      console.log();
    } else {
      console.log(`\n⚠️  ${result.message}\n`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('ASSESSMENT: Does this wisdom feel "computed" or "channeled"?');
  console.log('═'.repeat(60) + '\n');
}

showFullOracleResponse().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
