import type { RefusalCheck } from './harness';

/**
 * Refusal 29 — G6 — Manifest completeness and content-freedom (CMT-01).
 *
 * Every admitted block has a manifest row; the manifest carries digests, classes, counts
 * and reasons — never text. Runtime digest equality (manifest.fieldDigest == recomputed
 * from admitted blocks) is proven in __tests__; this check proves the structure.
 */

const M = 'lib/maia/canonical-turn/manifest.ts';
const T = 'lib/maia/canonical-turn/types.ts';

export const check: RefusalCheck = {
  id: 'R29',
  refusal: 'The participation manifest lists every admitted producer and carries no member content — digests, classes, counts and reasons only; emission only (no table)',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/manifest.ts; types.ts TurnParticipationManifest',
  evidence: 'admitted rows map 1:1 from participation.admitted; blockDigest via digest(); no text field on the manifest type; emit = console.log under [MAIA/manifest]',
  violationAttempted: 'find a content-bearing field on the manifest type, a manifest built from a subset of admitted, or a database write in the manifest module',
  passingAuthorizes: 'the manifest is complete over admitted and content-free by type',
  passingDoesNotAuthorize: 'that the manifest is retained anywhere — v1 is emission only by ruling (Decision 6)',
  hostileForkMustChange: 'add `text` to the manifest row type, filter admitted before mapping, or write the manifest to a table — visible diff',

  run(io) {
    if (!io.exists(M) || !io.exists(T)) { io.fail('manifest/types absent'); return; }
    const m = io.read(M);
    const t = io.read(T);
    const manifestType = t.slice(t.indexOf('export interface TurnParticipationManifest'), t.indexOf('// ── The object'));

    if (/\b(text|body|content|prompt)\s*\??\s*:/.test(manifestType)) io.fail('manifest type carries a content field');
    else io.pass('manifest type has no content-bearing field');

    if (/const fieldRows = participation\.admitted\.map\(renderedRow\)/.test(m)) io.pass('manifest rows map over the full admitted set');
    else io.fail('manifest rows not mapped 1:1 from admitted');

    if (/blockDigest: must\(digest\(p\.text\)\)/.test(m)) io.pass('rows carry digests, not text');
    else io.fail('rows do not digest block text');

    // pdc-1: every row validated as a contract entry; nothing AVAILABLE survives a completed turn.
    if (/assertTurnDispositioned\(\[\.\.\.participation\.held, \.\.\.offered, \.\.\.admitted, \.\.\.participation\.excluded\]\)/.test(m)) io.pass('every row validated against pdc-1 (assertTurnDispositioned)');
    else io.fail('manifest rows not validated against the participation contract');

    if (/INSERT INTO|UPDATE |query\(|pool\./.test(m)) io.fail('manifest module writes to the database', 'Decision 6: emission only');
    else io.pass('no database write in manifest module (emission only)');
  },
};
