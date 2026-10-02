// @ts-check
/**
 * Conforming reference view-models.
 *  - fixtureReference(): the F1 prototype fixture (recorded, ILLUSTRATIVE permitted → fixture mode)
 *  - liveReference():    a minimal live-shaped view-model with no illustrative object
 * Both are test doubles: evidence that the laws are mutually satisfiable, never a seed.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../../..');

/** @type {any} */
let FIXTURE_CACHE = null;
export function fixtureReference() {
  if (FIXTURE_CACHE === null) {
    const require = createRequire(import.meta.url);
    /** @type {any} */ (globalThis).window = {};
    require(path.join(ROOT, 'prototypes/jarvis-founder-workspace-f1/fixtures.js')); // CommonJS cache: runs once
    FIXTURE_CACHE = JSON.stringify(/** @type {any} */ (globalThis).window.JFW_FIXTURES);
    delete /** @type {any} */ (globalThis).window;
  }
  return JSON.parse(FIXTURE_CACHE);
}

export function liveReference() {
  return {
    schema: 'founder-workspace-viewmodel.v1',
    presentation_only: true,
    authority_effect: 'none',
    meta: { observed_against: '840194ba859bd5a497fc939c94329ee972ca3f80', observed_at: '2026-09-23T20:00:00Z', workspace: { repo: 'Sovereign', branch: 'x', head: 'abcdef1', clean: true, evidence_state: 'OBSERVED' } },
    programme_state: {
      schema: 'programme-state.v1', projected_at: '2026-09-23T20:00:00Z', observed_against: '840194ba859bd5a497fc939c94329ee972ca3f80',
      projector: 'absent', population: { examined: 0, emitted: 0, complete: false, why_not_complete: 'no projector (B4 not built)' }, programmes: [],
    },
    work: {
      units: [{ id: 'wu-1', title: 'Real unit', plain: 'A real unit read from the store.', state: 'DRAFT', evidence_state: 'OBSERVED' }],
      history: [], handoffs: [], results: [], adjudication_note: 'none',
    },
    monitor: [
      { group: 'This workspace', subject: 'Checkout', axis: 'branch', value: 'x · abcdef1 · clean', plain: 'Your working copy is clean.', level: 'good', instrument: 'jarvis:status (main.js git probe)', observed_at: '2026-09-23T20:00:00Z', freshness: 'current', evidence_state: 'OBSERVED' },
      { group: 'Production', subject: 'minisforum', axis: 'reachability', value: 'not probed', plain: 'Not observed from this workspace, by law (D-04).', level: 'unauthorized', instrument: 'none (Desktop law: NOT PROBED)', observed_at: null, freshness: 'none', evidence_state: 'DELIBERATELY REFUSED' },
    ],
    graph: { nodes: [{ id: 'a', kind: 'programme', label: 'Founder Workspace', sub: 'B1' }, { id: 'b', kind: 'act', label: 'B1 view-model', sub: '' }], edges: [{ from: 'a', to: 'b', rel: 'has act', evidence: { kind: 'doc', ref: 'docs/programme/…_P0_FOUNDER_ADJUDICATION_2026-09-23.md §VI' } }] },
    provenance: { artifact: { app_build_sha: null, evidence_state: 'UNOBSERVED' }, substrate: { head: 'abcdef1', branch: 'x', evidence_state: 'OBSERVED' }, rule: 'Which JARVIS is this? = the artifact that is running · which substrate = the checkout it is bound to.' },
    vocabularies: [], events: [],
  };
}
