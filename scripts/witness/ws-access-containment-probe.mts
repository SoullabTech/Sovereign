/**
 * WS-ACCESS-CONTAINMENT-01 · THE AUTHORIZATION PROBE.
 *
 * ⭐ Executable, not argued. It evaluates the REAL `matchRule` / `checkAccess`
 * over a fixed path set and prints one line per path, so the before and after
 * trees can be diffed rather than reasoned about.
 *
 * ⚠️ IT FAILS LOUDLY IF IT CANNOT RUN. An earlier version of this probe silently
 * produced nothing under tsx's CJS interop, and diffing one empty output against
 * another reported IDENTICAL — a green answer from an instrument that never
 * executed. The guard below is why that cannot happen again.
 */
import * as NS from '../../config/accessMatrix';
const AM: any = (NS as any).default ?? NS;
const { matchRule, checkAccess } = AM;
if (typeof matchRule !== 'function' || typeof checkAccess !== 'function') {
  console.error('PROBE BROKEN — accessMatrix exports missing'); process.exit(2);
}

const PATHS = [
  /* the three routes in scope */
  '/api/writers-studio/editorial/thread',
  '/api/writers-studio/editorial/turn',
  '/api/writers-studio/editorial/version',
  /* ⚠️ out of scope, carrying the identical gap — printed so the finding stays
     visible in the evidence rather than living only in prose */
  '/api/writers-studio/focus',
  /* neighbours whose behaviour must not move */
  '/writers-studio', '/writers-studio/canvas',
  '/api/sovereign/manuscripts', '/api/sovereign/living-works',
  '/api/ain/collective/breakthrough', '/api/health',
];

const line = (p: string) => {
  const r = matchRule(p);
  const member = checkAccess(p, 'free', ['member'], true);
  const anon = checkAccess(p, 'free', [], false);
  return [
    p.padEnd(42),
    (r ? (r.exact ?? r.prefix ?? String(r.regex)) : '(none)').padEnd(34),
    `member=${member.allowed}:${member.reason ?? ''}`.padEnd(28),
    `anon=${anon.allowed}:${anon.reason ?? ''}`,
  ].join(' | ');
};
console.log(PATHS.map(line).join('\n'));
