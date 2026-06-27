/**
 * Runnable proof for the explicit-command navigation grammar.
 *
 * The grammar module (lib/voice/navigationGrammar.ts) is dependency-free, so this
 * runs WITHOUT node_modules:
 *
 *   node --experimental-strip-types scripts/repro/navigation_commands_proof.mts
 *
 * It exercises the four required commands plus the three boundaries the prototype
 * must hold: Sanctuary defers to the mode system, reserved words defer, and
 * emotional/inferred content is never hijacked.
 */

import { matchNavigation, type NavDestination } from '../../lib/voice/navigationGrammar.ts';

// Destinations mirror VoiceCommandDetector.getNavigationDestinations() (kept inline so
// this test stays dependency-free and runnable without node_modules).
const DESTS: NavDestination[] = [
  { id: 'maia', label: 'MAIA', worldId: 'maia', route: '/maia', aliases: ['maia', 'center', 'center field', 'home', 'chat', 'main'] },
  { id: 'journal', label: 'Journal', worldId: 'journal', route: '/labtools/journal', aliases: ['journal'] },
  { id: 'ideas', label: 'Ideas', worldId: 'ideas', route: '/maia/ideas', aliases: ['ideas', 'idea'] },
  { id: 'relationships', label: 'Relationships', worldId: 'relationships', route: '/relationships', aliases: ['relationships', 'relationship'] },
  { id: 'wisdom', label: 'Wisdom', worldId: 'wisdom', route: '/wisdom-keepers/wisdom', aliases: ['wisdom', 'wisdom keepers'] },
  { id: 'anchor', label: 'Anchor', worldId: 'anchor', route: '/maia/anchor', aliases: ['anchor'] },
  { id: 'astrology', label: 'Astrology', worldId: null, route: '/astrology', aliases: ['astrology', 'astro'] },
  { id: 'field-lab', label: 'Field Lab', worldId: null, route: '/maia/field-lab', aliases: ['field lab', 'fieldlab'] },
];

let pass = 0;
let fail = 0;

function expectNavigate(input: string, route: string) {
  const r = matchNavigation(input, DESTS);
  const ok = r.kind === 'navigate' && r.destination.route === route;
  log(ok, input, ok ? `navigate → ${route}` : `expected navigate → ${route}, got ${describe(r)}`);
}
function expectKind(input: string, kind: 'none' | 'ambiguous') {
  const r = matchNavigation(input, DESTS);
  const ok = r.kind === kind;
  log(ok, input, ok ? kind : `expected ${kind}, got ${describe(r)}`);
}
function expectSanctuary(input: string, enable: boolean) {
  const r = matchNavigation(input, DESTS);
  const ok = r.kind === 'sanctuary' && r.enable === enable;
  log(ok, input, ok ? `sanctuary ${enable ? 'on' : 'off'}` : `expected sanctuary ${enable ? 'on' : 'off'}, got ${describe(r)}`);
}
function describe(r: ReturnType<typeof matchNavigation>): string {
  if (r.kind === 'navigate') return `navigate → ${r.destination.route}`;
  if (r.kind === 'sanctuary') return `sanctuary ${r.enable ? 'on' : 'off'}`;
  return r.kind;
}
function log(ok: boolean, input: string, msg: string) {
  if (ok) { pass++; console.log(`  ✓ "${input}"  ${msg}`); }
  else { fail++; console.log(`  ✗ "${input}"  ${msg}`); }
}

console.log('\n[1] Required explicit commands navigate correctly');
expectNavigate('open journal', '/labtools/journal');
expectNavigate('go to relationships', '/relationships');
expectNavigate('switch to astrology', '/astrology');
expectNavigate('take me to field lab', '/maia/field-lab');

console.log('\n[2] Tolerant of case, punctuation, articles, filler');
expectNavigate('Open Journal.', '/labtools/journal');
expectNavigate('  GO TO   relationships!! ', '/relationships');
expectNavigate('take me to the field lab please', '/maia/field-lab');
expectNavigate('go to my journal now', '/labtools/journal');
expectNavigate('go back to chat', '/maia');

console.log('\n[3] Sanctuary is a mode TOGGLE (never a route), incl. "open sanctuary"');
expectSanctuary('open sanctuary', true);
expectSanctuary('turn on sanctuary', true);
expectSanctuary('enter sanctuary', true);
expectSanctuary('go to sanctuary', true);
expectSanctuary('sanctuary mode', true);
expectSanctuary('leave sanctuary', false);
expectSanctuary('exit sanctuary', false);
expectSanctuary('turn off sanctuary', false);

console.log('\n[4] Other reserved mode/lens/style words defer to detectMaiaCommands');
expectKind('switch to care', 'none');
expectKind('go to deep mode', 'none');
expectKind('switch to somatic', 'none');

console.log('\n[5] Emotional / inferred content is NEVER hijacked');
expectKind('I want to talk about my marriage', 'none');
expectKind('open up to me about my dad', 'none');
expectKind('show me you care', 'none');
expectKind('take me to a calmer place', 'none');
expectKind('my relationship is falling apart', 'none');

console.log('\n[6] Bare destination word does nothing (verb required)');
expectKind('journal', 'none');
expectKind('relationships', 'none');

console.log('\n[7] Unmistakable-but-unknown navigation asks (confirm, never act)');
expectKind('navigate to dreams', 'ambiguous');
expectKind('take me to settings', 'ambiguous');
expectKind('go to', 'ambiguous');

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass}/${pass + fail} passed\n`);
if (fail > 0) process.exit(1);
