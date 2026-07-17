import type { RefusalCheck } from './harness';

/**
 * Refusal 18 — Sanctuary content cannot reach the empirically-escaped stores.
 *
 * Incident SANC-20260614-01: five sanctuary requests persisted full content to
 * conversation_turns, agent_runs, integration_passes, and the session's
 * conversation_history jsonb because enforcement lived in callers, not stores.
 *
 * S1 (Kelly ruling K2, 2026-07-17) moves enforcement to the store boundary:
 * a server-resolved, per-turn `TurnPosture` (nominal class, private
 * constructor) is REQUIRED by TurnsStore.addExchange, corpus-callosum
 * logAgentRun/logIntegrationPass, and sessionManager.addConversationExchange
 * guards both of its lanes. Sanctuary — or missing/forged posture — refuses
 * the content write at the store (fail closed), with metadata-only logs.
 *
 * Governing invariant: the privacy posture governing a turn is the posture in
 * force when that turn occurred. Session-level mode is never consulted.
 */

const GUARD = 'contentWritable\\(';

export const check: RefusalCheck = {
  id: 'R18',
  refusal: 'Sanctuary turn content cannot be persisted by the escaped stores (boundary-enforced, fail closed)',
  grade: 'A-minus',
  enforcedBy: 'lib/sanctuary/turnPosture.ts guard required by TurnsStore, corpusCallosumService, sessionManager',
  evidence: 'S1 patch 2026-07-17; incident SANC-20260614-01 remediation',
  violationAttempted: 'find an escaped-store write path that does not pass through the posture guard, a forgeable posture, or a refusal log that carries content',
  passingAuthorizes: 'the four lanes that escaped on 2026-06-14 refuse sanctuary content at the store boundary regardless of caller behavior',
  passingDoesNotAuthorize: 'that every content store platform-wide is governed (S4–S6 remain), or that posture resolution is independent of the request flag (S5 provenance work)',
  hostileForkMustChange: 'remove a contentWritable() call from a store, export the TurnPosture constructor, or resolve posture from session-level mode — all visible diffs',

  run(io) {
    // (1,2) TurnsStore: guard present and BEFORE the INSERTs.
    const turnsGuard = io.grep(GUARD, ['lib/memory/stores/TurnsStore.ts']);
    const turnsInsert = io.grep('INSERT INTO conversation_turns', ['lib/memory/stores/TurnsStore.ts']);
    const lineOf = (g: string[]) => (g.length ? parseInt(g[0].split(':')[1], 10) : -1);
    if (turnsGuard.length > 0 && turnsInsert.length > 0 && lineOf(turnsGuard) < lineOf(turnsInsert)) {
      io.pass('TurnsStore.addExchange refuses before any INSERT');
    } else {
      io.fail('TurnsStore guard missing or after INSERT', `guard@${lineOf(turnsGuard)} insert@${lineOf(turnsInsert)}`);
    }

    // (3,4) Corpus callosum: both writers guarded before their INSERTs.
    const ccSrc = 'lib/services/corpusCallosumService.ts';
    const ccGuards = io.grep(GUARD, [ccSrc]);
    const ccInserts = io.grep('INSERT INTO (agent_runs|integration_passes)', [ccSrc]);
    if (ccGuards.length >= 2 && ccInserts.length === 2 && lineOf(ccGuards) < lineOf(ccInserts)) {
      io.pass('logAgentRun and logIntegrationPass refuse before their INSERTs', `${ccGuards.length} guards`);
    } else {
      io.fail('corpus callosum writers not both guarded', `guards=${ccGuards.length} inserts=${ccInserts.length}`);
    }

    // Session-history lane (the jsonb lane that escaped): guard before UPDATE.
    const smGuard = io.grep(GUARD, ['lib/sovereign/sessionManager.ts']);
    const smUpdate = io.grep('SET conversation_history', ['lib/sovereign/sessionManager.ts']);
    if (smGuard.length > 0 && smUpdate.length > 0 && lineOf(smGuard) < lineOf(smUpdate)) {
      io.pass('sessionManager guards conversation_history before the UPDATE');
    } else {
      io.fail('conversation_history lane unguarded', `guard@${lineOf(smGuard)} update@${lineOf(smUpdate)}`);
    }

    // (8) Posture is not forgeable: private constructor, frozen, no external `new`.
    const privCtor = io.grep('private constructor', ['lib/sanctuary/turnPosture.ts']);
    const frozen = io.grep('Object\\.freeze\\(this\\)', ['lib/sanctuary/turnPosture.ts']);
    const externalNew = io.grep('new TurnPosture', ['app', 'lib']).filter(
      (l) => !l.startsWith('lib/sanctuary/turnPosture.ts')
    );
    if (privCtor.length > 0 && frozen.length > 0 && externalNew.length === 0) {
      io.pass('TurnPosture cannot be constructed or forged outside its module');
    } else {
      io.fail('TurnPosture forgeable', `privCtor=${privCtor.length} frozen=${frozen.length} externalNew=${externalNew.length}`);
    }
    const instanceCheck = io.grep('instanceof TurnPosture', ['lib/sanctuary/turnPosture.ts']);
    if (instanceCheck.length > 0) {
      io.pass('Missing/forged posture fails closed (instanceof check in guard)');
    } else {
      io.fail('No fail-closed instanceof check in guard');
    }

    // (6,7) Per-turn resolution at the boundaries (never from session mode).
    const resolvers = io.grep('TurnPosture\\.resolve\\(', [
      'lib/sovereign/maiaService.ts',
      'lib/sovereign/sessionManager.ts',
      'lib/consciousness/maiaOrchestrator.ts',
      'app/api/voice/persist/route.ts',
    ]);
    if (resolvers.length >= 4) {
      io.pass('Posture resolved per-request at each serving boundary', `${resolvers.length} resolve sites`);
    } else {
      io.fail('Boundary resolution incomplete', `${resolvers.length} resolve sites`);
    }
    const sessionModeRead = io.grep('maia_sessions[^;]*mode', ['lib/sanctuary/turnPosture.ts']);
    if (sessionModeRead.length === 0) {
      io.pass('Posture never consults session-level mode (per-turn invariant)');
    } else {
      io.fail('Posture reads session-level mode', sessionModeRead.join(' | '));
    }

    // (9) Refusal logs are metadata-only: the refusal lines carry only store +
    // sessionIdPrefix; no content variable appears in the guard module at all.
    const contentVars = io.grep('userMessage|assistantResponse|outputText|finalText|\\bcontent\\b', [
      'lib/sanctuary/turnPosture.ts',
    ]).filter((l) => !/CONTENT persistence|content writes|content is not persisted|never message content/.test(l));
    if (contentVars.length === 0) {
      io.pass('Refusal path handles no content values (metadata-only logs)');
    } else {
      io.fail('Guard module touches content values', contentVars.join(' | '));
    }

    // (11) Observability marker for production verification.
    const marker = io.grep("\\[SANCTUARY\\] write refused", ['lib/sanctuary/turnPosture.ts']);
    if (marker.length > 0) {
      io.pass('Discoverable refusal marker present ([SANCTUARY] write refused)');
    } else {
      io.fail('No refusal log marker');
    }

    // (5) Non-vacuous: ordinary callers still reach the stores with a posture.
    const livingCallers = io.grep('addExchange\\(posture|addExchange\\(\\s*turnPosture|addExchange\\(\\n?\\s*turnPosture', ['lib', 'app']);
    if (livingCallers.length > 0) {
      io.pass('Ordinary turns still persist (posture-carrying callers exist)', `${livingCallers.length} call sites`);
    } else {
      io.warn('No posture-carrying addExchange callers found', 'guard may be vacuous — verify callers');
    }
  },
};
