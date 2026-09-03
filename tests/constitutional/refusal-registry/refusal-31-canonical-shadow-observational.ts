import type { RefusalCheck } from './harness';

/**
 * Refusal 31 — M2 pre-deploy condition — the shadow path is OBSERVATIONAL.
 *
 * Founder condition for the bounded M2 shadow deployment (2026-09-03): the shadow path must
 * not duplicate member-state writes, writebacks, counters, recurrence updates, or any other
 * persistent side effect. Legacy assembly stays response-producing; the canonical turn is
 * constructed, compared, and logged — nothing else.
 *
 * Proven structurally: (1) the canonical-turn module imports no db/persistence surface and
 * contains no write verb; (2) the only DB touch reachable from it — identity resolution — is
 * the read-only session SELECT in lib/auth/getMemberFromRequest (does not bump
 * last_active_at); (3) the /list shadow block calls exactly the six canonical functions and
 * console.warn, wrapped in try/catch, before the untouched legacy getMaiaResponse call.
 */

const MODULE_DIR = ['lib/maia/canonical-turn'];
const RESOLVER = 'lib/auth/getMemberFromRequest.ts';
const ROUTE = 'app/api/sovereign/app/maia/list/route.ts';

const SIDE_EFFECT = /lib\/db\/|\bquery\(|\bpool\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|upsert|writeFile|\bfetch\(|recordRuntimeTurn|logAgentRun|TurnsStore|MemoryWriteback|storeSessionPattern|addConversationExchange|last_active_at|localStorage|redis|kafka/;

const ALLOWED_SHADOW_CALLS = new Set([
  'resolveCanonicalIdentity', 'constructCanonicalTurn', 'candidatesFromLegacyAddenda',
  'compareLegacyToCanonical', 'emitShadowDiff', 'warn', 'String',
]);

function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export const check: RefusalCheck = {
  id: 'R31',
  refusal: 'The M2 canonical-turn shadow on /list is observational — it produces no persistent write, counter, writeback, or recurrence update',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/* (no persistence import); lib/auth/getMemberFromRequest (read-only SELECT); /list shadow block (six calls, try/catch, before legacy getMaiaResponse)',
  evidence: 'module imports: auth/getMemberFromRequest, consciousness/MAIA_RUNTIME_PROMPT, memory/provenance/turnMemoryProvenance, privacy/memberRef, sovereign/maiaVoice, sovereign/platformKnowledge, crypto, next/server(type) — none write',
  violationAttempted: 'find a write verb / persistence import inside the canonical-turn module (excluding tests), a write in the identity resolver, or a call in the /list shadow block outside the six canonical functions',
  passingAuthorizes: 'the shadow deployment can only add log lines and one read-only session SELECT per /list turn',
  passingDoesNotAuthorize: 'that the shadow diff is zero in production — that is the live witness, not this; nor M3',
  hostileForkMustChange: 'import a db handle or writer into the module, add a write to the resolver, or add a call to the shadow block — visible diff',

  run(io) {
    // 1. Module has no persistence surface (tests excluded).
    const hits = io.grep(SIDE_EFFECT.source, MODULE_DIR).filter((l) => !/__tests__/.test(l) && !/^\S+:\d+:\s*(\/\/|\*)/.test(l));
    if (hits.length === 0) io.pass('canonical-turn module has no persistence / side-effect surface');
    else io.fail('side-effect surface inside canonical-turn', hits.slice(0, 3).join(' | '));

    // 2. The resolver's only SQL is a SELECT and it does not bump last_active_at.
    const resolver = code(io.read(RESOLVER));
    const verbs = resolver.match(/\b(INSERT|UPDATE|DELETE)\b/g) ?? [];
    if (verbs.length === 0 && /SELECT member_id/.test(resolver)) io.pass('identity resolver is read-only (SELECT only, no last_active_at bump)');
    else io.fail('identity resolver is not read-only', verbs.join(',') || 'SELECT not found');

    // 3. The /list shadow block calls only the six canonical functions (+ console.warn / String).
    const route = io.read(ROUTE);
    const start = route.indexOf('CMT-01 M2 — CANONICAL TURN SHADOW');
    const end = route.indexOf('Cut 2 — Spiral Orientation', start);
    if (start < 0 || end < 0) { io.fail('shadow block not found in /list'); return; }
    const block = code(route.slice(start, end));
    const calls = Array.from(new Set((block.match(/\b([A-Za-z_]+)\(/g) ?? []).map((c) => c.slice(0, -1))));
    const foreign = calls.filter((c) => !ALLOWED_SHADOW_CALLS.has(c));
    if (foreign.length === 0) io.pass('shadow block calls only the canonical functions', calls.join(', '));
    else io.fail('shadow block makes a non-canonical call', foreign.join(', '));

    if (/try \{[\s\S]*\} catch \(shadowErr\)/.test(block)) io.pass('shadow block is fail-safe (try/catch; legacy turn unaffected)');
    else io.fail('shadow block is not wrapped in try/catch');

    // 4. The shadow block precedes, and does not replace, the legacy cognition call.
    const legacyCall = route.indexOf('getMaiaResponse({', end);
    if (legacyCall > end) io.pass('legacy getMaiaResponse call follows the shadow block unchanged');
    else io.fail('legacy getMaiaResponse call not found after the shadow block');

    // 5. The kill-switch gates the instrument only.
    if (/process\.env\.MAIA_CANONICAL_SHADOW !== '0'/.test(block)) io.pass('MAIA_CANONICAL_SHADOW gates the instrument only');
    else io.warn('kill-switch shape changed', 're-audit');
  },
};
