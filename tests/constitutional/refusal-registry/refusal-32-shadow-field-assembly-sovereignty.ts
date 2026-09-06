import type { RefusalCheck } from './harness';

/**
 * Refusal 32 — Shadow Field owns its interpretive assembly, and writes nothing (v1).
 *
 * Constitution v0.2 Part III (assembly sovereignty, D6) + L3/L8 + falsifiers F5, F8.
 * The Dedicated room is a separate interpretive assembly: because the ordinary path
 * never assembles a Field turn, no ordinary-path psychological or frame-bearing producer
 * CAN participate in it. That is an import-graph fact, not a runtime discipline.
 *
 * v1 additionally has NO writer at all — the keep act is stopped at P4 pending a founder
 * ruling — so the room's persistence surface must be empty.
 */

const ROOM = ['app/api/maia/shadow-field', 'lib/maia/shadowField'];

/** Ordinary-path producers that may not participate in a Field turn (D6 list). */
const FORBIDDEN_IMPORT =
  "^import[^;]*(maiaService|WisdomRouter|maia-path-revelation|elemental-oracle-bridge|processingProfiles|panconsciousFieldRouter|relationalObserver|shadowWorkFlows|ShadowIntegrationTracker|shadow-insight)";

/** Any persistence surface. v1 keeps nothing by any route. */
const WRITE_SURFACE =
  "^import[^;]*(lib/db/postgres|memoryAtomsLoader|TurnsStore)|\\b(INSERT INTO|UPDATE |DELETE FROM)\\b";

/** Strip comments — a check must test code, not the prose that documents it. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export const check: RefusalCheck = {
  id: 'R32',
  refusal:
    'The Shadow Field assembles its own turn — no ordinary-path frame-bearing producer participates — and in v1 it persists nothing',
  grade: 'Proposed',
  enforcedBy:
    'app/api/maia/shadow-field/route.ts import graph (separate assembly; no /list, no getMaiaResponse); no db client or memory writer imported anywhere in the room',
  evidence:
    'route imports only next/server, @anthropic-ai/sdk, lib/auth/serverSessions, lib/auth/tester, and the Field own prompts/types',
  violationAttempted:
    'find an import of any ordinary-path producer, or any persistence surface, inside the Shadow Field room',
  passingAuthorizes:
    'a Field turn cannot contain the Shadow Guardian, the shadow elemental voice, a profile router, or any writer',
  passingDoesNotAuthorize:
    'it does not establish that the prompts are constitutional, that entry is a member act (R33), or that the Field is safe for members — it is an assembly and persistence fact only',
  hostileForkMustChange:
    'a fork wanting hidden framing back would have to import an ordinary-path producer into the room, or route Field turns through /list, both of which this check names',
  run(io) {
    const forbidden = io.grep(FORBIDDEN_IMPORT, ROOM).filter((l) => !/__tests__/.test(l) && !/^\S+:\d+:\s*(\/\/|\*)/.test(l));
    if (forbidden.length === 0) {
      io.pass('no ordinary-path frame-bearing producer is imported by the Shadow Field room');
    } else {
      io.fail('ordinary-path producer imported into the Field', forbidden.slice(0, 3).join(' | '));
    }

    const writes = io.grep(WRITE_SURFACE, ROOM).filter((l) => !/__tests__/.test(l) && !/^\S+:\d+:\s*(\/\/|\*)/.test(l));
    if (writes.length === 0) {
      io.pass('Shadow Field v1 has no persistence surface (P4 keep act stopped)');
    } else {
      io.fail('a write surface exists inside the Field room', writes.slice(0, 3).join(' | '));
    }

    const route = code(io.read('app/api/maia/shadow-field/route.ts'));
    if (!/getMaiaResponse|sovereign\/app\/maia/.test(route)) {
      io.pass('the room never enters the ordinary MAIA cognition assembly');
    } else {
      io.fail('the room reaches the ordinary cognition assembly');
    }
  },
};
