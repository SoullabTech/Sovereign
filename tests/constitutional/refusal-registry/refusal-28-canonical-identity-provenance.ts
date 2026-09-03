import type { RefusalCheck } from './harness';

/**
 * Refusal 28 — G4 — Identity provenance at the canonical boundary (CMT-01).
 *
 * CanonicalTurn.identity is produced ONLY by resolveCanonicalIdentity(), which wraps
 * exactly one resolver: lib/auth/getMemberFromRequest (R03). A body userId or bare
 * header can never become a `verified` identity; the constructor accepts only minted
 * identities (module-private WeakSet).
 */

const ID = 'lib/maia/canonical-turn/identity.ts';
const CT = 'lib/maia/canonical-turn/construct.ts';

/** Strip block and line comments so doc text cannot trip a structural pattern (innocent-negative). */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}


export const check: RefusalCheck = {
  id: 'R28',
  refusal: 'A CanonicalTurn identity can only originate from the one verified session resolver — never from a body userId or a bare header',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/identity.ts (single import of getMemberFromRequest; minted WeakSet); construct.ts (isMintedIdentity gate)',
  evidence: 'identity.ts imports only ../../auth/getMemberFromRequest for resolution; no body read; construct.ts refuses unminted identity',
  violationAttempted: 'find a second identity source imported into identity.ts, a request-body read, a public mint function, or a constructor that accepts an unminted identity',
  passingAuthorizes: 'the canonical boundary cannot assert a verified member it did not verify',
  passingDoesNotAuthorize: 'that every ingress has onboarded to this resolver — living-field (probeAuthPosture) and voice-stream (body-first) have not; see spec §4.1',
  hostileForkMustChange: 'import a second resolver, read the body, export mint(), or drop the isMintedIdentity gate — visible diff',

  run(io) {
    if (!io.exists(ID) || !io.exists(CT)) { io.fail('canonical-turn identity/construct absent'); return; }
    const id = code(io.read(ID));
    const ct = code(io.read(CT));

    const resolverImports = (id.match(/from '\.\.\/\.\.\/auth\/[^']+'/g) ?? []);
    if (resolverImports.length === 1 && resolverImports[0].includes('auth/getMemberFromRequest')) io.pass('identity.ts imports exactly one resolver: lib/auth/getMemberFromRequest');
    else io.fail('identity.ts resolver imports', resolverImports.join(', ') || 'none');

    if (/scribeAuth|authPostureProbe|x-member-id|serverSessions/.test(id)) io.fail('identity.ts references a non-canonical identity source');
    else io.pass('no non-canonical identity source referenced');

    if (/\.json\s*\(\s*\)|request\.body|req\.body|body\.userId|bodyUserId/.test(id)) io.fail('identity.ts reads a request body');
    else io.pass('no request body read in identity.ts');

    if (/^export function mint\b/m.test(id)) io.fail('mint() is exported', 'any module could mint a verified identity');
    else io.pass('mint() is module-private');

    if (/if \(!isMintedIdentity\(inputs\.identity\)\) throw new CanonicalTurnRefused\('identity_unverifiable'\)/.test(ct)) io.pass('constructor refuses an unminted identity');
    else io.fail('constructor does not gate on minted identity');
  },
};
