import { guardDomination, linesOf, requireLines, type DominationReport, type RefusalCheck } from './harness';

/**
 * Refusal 21 — Sanctuary content cannot reach the empirically-escaped stores.
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
  id: 'R21',
  refusal: 'Sanctuary turn content cannot be persisted by the escaped stores (boundary-enforced, fail closed)',
  grade: 'A-minus',
  enforcedBy: 'lib/sanctuary/turnPosture.ts guard required by TurnsStore, corpusCallosumService, sessionManager',
  evidence: 'S1 patch 2026-07-17; incident SANC-20260614-01 remediation',
  violationAttempted: 'find an escaped-store write path that does not pass through the posture guard, a forgeable posture, or a refusal log that carries content',
  passingAuthorizes: 'the four lanes that escaped on 2026-06-14 refuse sanctuary content at the store boundary regardless of caller behavior',
  passingDoesNotAuthorize: 'that every content store platform-wide is governed (S4–S6 remain), or that posture resolution is independent of the request flag (S5 provenance work)',
  hostileForkMustChange: 'remove a contentWritable() call from a store, add a content write to a scope that has no guard of its own, export the TurnPosture constructor, or resolve posture from session-level mode — all visible diffs',

  run(io) {
    /**
     * Domination, not line order.
     *
     * These three assertions used to compare the FIRST guard against the FIRST
     * write. That is far weaker than it reads: TurnsStore.ts has 3 guards and 4
     * INSERTs, and `113 < 125` says nothing whatever about the INSERT at 281.
     * An unguarded write added anywhere below the first guard would have kept
     * the check green — a gap in what the assertion proved, closing which
     * strengthens R21 (recorded as unrepaired in
     * docs/ops/REFUSAL_REGISTRY_DETECTOR_DEFECT_2026-09-04.md §6.1).
     *
     * `guardDomination` instead requires, for EVERY write independently, a
     * guard that precedes it AND shares its innermost function scope — so a
     * guard in `addTurn` can never be credited for an INSERT in `addExchange`.
     * Guards are read with `linesOf` (absence = every write undominated =
     * breach); the writes they are ordered against use `requireLines` (absence
     * = lost anchor = DetectorDefect, which proves nothing either way).
     */
    const shown = (r: DominationReport) =>
      r.dominated.map((d) => `${d.scope}: guard@${d.guardLine}→write@${d.line}`).join(', ');
    const missing = (r: DominationReport) =>
      r.undominated.map((u) => `write@${u.line} in ${u.scope}() has no guard in its own scope`).join('; ');

    // (1,2) TurnsStore: every INSERT dominated inside its own method.
    const turnsSrc = 'lib/memory/stores/TurnsStore.ts';
    const turnsDom = guardDomination({
      relPath: turnsSrc,
      source: io.read(turnsSrc),
      guardLines: linesOf(io.grep(GUARD, [turnsSrc])),
      writeLines: requireLines(
        io.grep('INSERT INTO conversation_turns', [turnsSrc]),
        'INSERT INTO conversation_turns in TurnsStore.ts'
      ),
    });
    if (turnsDom.ok) {
      io.pass(
        'Every TurnsStore INSERT is guard-dominated within its own method',
        `${turnsDom.dominated.length} writes — ${shown(turnsDom)}`
      );
    } else {
      io.fail('TurnsStore INSERT not guard-dominated', missing(turnsDom));
    }

    // (3,4) Corpus callosum: both writers guarded, each within its own function.
    const ccSrc = 'lib/services/corpusCallosumService.ts';
    const ccGuards = io.grep(GUARD, [ccSrc]);
    const ccInserts = io.grep('INSERT INTO (agent_runs|integration_passes)', [ccSrc]);
    const ccDom = guardDomination({
      relPath: ccSrc,
      source: io.read(ccSrc),
      guardLines: linesOf(ccGuards),
      writeLines: requireLines(ccInserts, 'INSERT INTO agent_runs|integration_passes in corpusCallosumService.ts'),
    });
    if (ccGuards.length >= 2 && ccInserts.length === 2 && ccDom.ok) {
      io.pass(
        'logAgentRun and logIntegrationPass each dominate their own INSERT',
        `${ccGuards.length} guards — ${shown(ccDom)}`
      );
    } else {
      io.fail(
        'corpus callosum writers not both guarded',
        ccDom.ok
          ? `guards=${ccGuards.length} inserts=${ccInserts.length} (expected >=2 and ==2)`
          : missing(ccDom)
      );
    }

    // Session-history lane (the jsonb lane that escaped): UPDATE dominated.
    const smSrc = 'lib/sovereign/sessionManager.ts';
    const smDom = guardDomination({
      relPath: smSrc,
      source: io.read(smSrc),
      guardLines: linesOf(io.grep(GUARD, [smSrc])),
      writeLines: requireLines(
        io.grep('SET conversation_history', [smSrc]),
        'SET conversation_history in sessionManager.ts'
      ),
    });
    if (smDom.ok) {
      io.pass('Every conversation_history UPDATE is guard-dominated within its own function', shown(smDom));
    } else {
      io.fail('conversation_history lane unguarded', missing(smDom));
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
