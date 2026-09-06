import type { RefusalCheck } from './harness';

/**
 * Refusal 32 — Shadow Field owns its interpretive assembly, and has exactly ONE
 * persistence path: the explicit member keep act.
 *
 * Constitution v0.2 Part III (assembly sovereignty, D6), L3/§4, L8; falsifiers F5, F8.
 * Founder P4 ruling 2026-09-06 (resolution 2): the Field's origin is carried by a
 * dedicated `source_type = 'shadow_field'`, never by the practitioner-shaped
 * `provenance` JSONB, which remains audit history and is not runtime identity.
 */

const ROOM = ['app/api/maia/shadow-field', 'lib/maia/shadowField'];
const TURN = 'app/api/maia/shadow-field/route.ts';
const KEEP = 'app/api/maia/shadow-field/keep/route.ts';
const LOADER = 'lib/maia/memoryAtomsLoader.ts';

const FORBIDDEN_IMPORT =
  "^import[^;]*(maiaService|WisdomRouter|maia-path-revelation|elemental-oracle-bridge|processingProfiles|panconsciousFieldRouter|relationalObserver|shadowWorkFlows|ShadowIntegrationTracker|shadow-insight)";

/** Strip comments — a check must test code, not the prose that documents it. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export const check: RefusalCheck = {
  id: 'R32',
  refusal:
    'The Shadow Field assembles its own turn — no ordinary-path frame-bearing producer participates — and exactly one path persists anything: the explicit member keep act',
  grade: 'Proposed',
  enforcedBy:
    'the turn route imports no database client; the keep route is the sole writer, refuses Sanctuary before any write, and writes source_type shadow_field / source_id NULL / return_preference member_pulled with provenance untouched',
  evidence:
    'one INSERT INTO member_memory_atoms exists in the whole room, in keep/route.ts, after the shouldPersistKeep guard',
  violationAttempted:
    'add a second writer, import a database client into the turn route, write a MAIA possibility, reach provenance / facilitator_id / epistemological_status, or write before the Sanctuary guard',
  passingAuthorizes:
    'a Field turn cannot contain the Shadow Guardian, the shadow elemental voice, or a profile router; and nothing but a member keep act can persist Field material',
  passingDoesNotAuthorize:
    'it does not establish that the model obeys the prompt law, that a kept atom round-trips in production (P8 walk item 6), or that the Field is safe for members',
  hostileForkMustChange:
    'a fork wanting ambient shadow memory would have to add a writer, widen return_preference, or reach the provenance column — each of which this check names',
  run(io) {
    // ── Assembly sovereignty ────────────────────────────────────────────────
    const forbidden = io
      .grep(FORBIDDEN_IMPORT, ROOM)
      .filter((l) => !/__tests__/.test(l) && !/^\S+:\d+:\s*(\/\/|\*)/.test(l));
    if (forbidden.length === 0) {
      io.pass('no ordinary-path frame-bearing producer is imported by the Shadow Field room');
    } else {
      io.fail('ordinary-path producer imported into the Field', forbidden.slice(0, 3).join(' | '));
    }

    const turn = code(io.read(TURN));
    if (!/getMaiaResponse|sovereign\/app\/maia/.test(turn)) {
      io.pass('the room never enters the ordinary MAIA cognition assembly');
    } else {
      io.fail('the room reaches the ordinary cognition assembly');
    }

    // ── Exactly one persistence path ────────────────────────────────────────
    if (!/lib\/db\/postgres|INSERT INTO|UPDATE |DELETE FROM/.test(turn)) {
      io.pass('the turn route has no persistence surface — turns never write');
    } else {
      io.fail('the turn route can write');
    }

    const writes = io
      .grep('INSERT INTO member_memory_atoms', ROOM)
      .filter((l) => !/__tests__/.test(l) && !/^\S+:\d+:\s*(\/\/|\*)/.test(l));
    if (writes.length === 1 && writes[0].startsWith(KEEP)) {
      io.pass('exactly one Shadow Field writer exists, and it is the keep act', writes[0].split(':').slice(0, 2).join(':'));
    } else {
      io.fail('the Field does not have exactly one writer', writes.join(' | ') || 'none found');
    }

    // ── The keep act's own refusals ─────────────────────────────────────────
    const keep = code(io.read(KEEP));

    // P4-C1: Sanctuary authority is SERVER-held. The keep route must resolve the Field
    // sitting server-side and must not read a client-asserted sanctuary at all.
    const verifyIdx = keep.indexOf('verifyFieldSession');
    const decideIdx = keep.indexOf('decideKeep');
    const writeIdx = keep.indexOf('INSERT INTO member_memory_atoms');
    if (verifyIdx > 0 && decideIdx > verifyIdx && writeIdx > decideIdx) {
      io.pass('the keep route resolves server-held Field state, decides, then writes — in that order');
    } else {
      io.fail('the keep route does not resolve server state before deciding');
    }

    if (!/body\.sanctuary|sanctuary\s*===\s*true|body\[.sanctuary.\]/.test(keep)) {
      io.pass('the keep route never reads a client-asserted Sanctuary flag (P4-C1)');
    } else {
      io.fail('the keep route trusts a client sanctuary boolean — a forged request could pass');
    }

    const decision = code(io.read('lib/maia/shadowField/keepDecision.ts'));
    if (/serverSession/.test(decision) && !/claim\.sanctuary/.test(decision)) {
      io.pass('the keep decision takes Sanctuary only from server session state');
    } else {
      io.fail('the keep decision can be told its Sanctuary posture by the caller\'s claim');
    }
    if (/if \(!serverSession\)/.test(decision) && /no_field_session/.test(decision)) {
      io.pass('an unverified Field sitting fails closed (refusal, not assumed non-Sanctuary)');
    } else {
      io.fail('a missing Field session does not fail closed');
    }

    if (/'shadow_field'/.test(keep) && /source_id.*NULL|NULL,/.test(keep) && /'member_pulled'/.test(keep)) {
      io.pass("keep writes source_type shadow_field, no source row, return_preference member_pulled");
    } else {
      io.fail('the keep write does not carry the ruled shape');
    }

    if (!/provenance|facilitator_id|epistemological_status/.test(keep)) {
      io.pass('the keep act never touches provenance, facilitator_id or epistemological_status');
    } else {
      io.fail('the keep act reaches a non-member-authored attribution column');
    }

    // The refusals live in the pure decision the route delegates to, so they are checked
    // there — and are additionally proven at runtime by the P4 acceptance script.
    if (/maia_possibility_not_keepable/.test(decision) && !/'maia_possibility'/.test(
      decision.slice(decision.indexOf('export type KeepAuthorship'), decision.indexOf('export interface KeepClaim')),
    )) {
      io.pass('a MAIA possibility is not representable in the keep authorship type, and is refused');
    } else {
      io.fail('a MAIA possibility can reach the keep decision');
    }

    if (/acceptedByMember !== true/.test(decision) && /wording_not_accepted/.test(decision)) {
      io.pass('MAIA-proposed wording requires an explicit member acceptance before the write');
    } else {
      io.fail('MAIA-proposed wording can be written without acceptance');
    }

    // ── Compatibility: existing atom types render identically ───────────────
    const loader = code(io.read(LOADER));
    // Anchor on the mapping's ternary, not the row interface's `body:` field.
    const ruleStart = loader.indexOf('r.source_type ===');
    const bodyRule = ruleStart > 0 ? loader.slice(ruleStart, ruleStart + 260) : '';
    const carried = ['spontaneous', 'shadow_field', 'practitioner_observation'].filter((t) =>
      bodyRule.includes(`'${t}'`),
    );
    if (carried.length === 3 && !/'capsule'|'idea'|'journal'|'dream'/.test(bodyRule)) {
      io.pass('loader body rule adds shadow_field only — other atom types render identically');
    } else {
      io.fail('the loader body rule changed for a type other than shadow_field', carried.join(','));
    }

    if (!/provenance/.test(loader.slice(loader.indexOf('const SELECT_COLUMNS'), loader.indexOf('PRACTITIONER_ATTRIBUTION_GUARD')))) {
      io.pass('provenance is still NOT selected — the JSONB contract is unwidened');
    } else {
      io.fail('provenance was added to SELECT_COLUMNS (not authorized)');
    }
  },
};
