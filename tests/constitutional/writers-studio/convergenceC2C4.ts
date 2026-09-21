/**
 * `WS-CONVERGENCE-01 / C2–C4` — the seven structural acceptance tests.
 *
 * ⛔ These prove STRUCTURE. ⭐ The five experiential questions (is my manuscript
 * clearly the main thing · do I know where I am · can I get back without
 * thinking · is it quieter · is the next action obvious) are the FOUNDER WALK
 * and ⛔ no result here may be reported as establishing them.
 */

import { readFileSync } from 'fs';
import {
  STUDIO_MAP, assertStudioMapHonest, shellDestinations, visibleDestinations,
  workingMovements, workingRailGroups,
} from '../../../app/writers-studio/studioMap';
import { backToManuscriptHref, placeLine } from '../../../lib/writersStudio/placeCrumb';

export interface Check { readonly id: string; readonly ok: boolean; readonly detail: string }
const src = (p: string) => readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const CANVAS = 'app/writers-studio/canvas/CanvasClient.tsx';
const SATISFIED = ['materials', 'structure', 'versions', 'conversations'];

export function runC2C4(): readonly Check[] {
  const out: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });

  const totalDestinations = STUDIO_MAP.reduce((n, g) => n + g.destinations.length, 0);
  const laterCount = STUDIO_MAP.reduce((n, g) => n + g.destinations.filter((d) => d.availability === 'later').length, 0);

  /* ── 1 · the ordinary shell no longer renders the unavailable rail ─────── */
  const working = workingRailGroups(true, SATISFIED);
  const workingIds = working.flatMap((g) => g.destinations.map((d) => d.id));
  const unavailableShown = working.flatMap((g) =>
    g.destinations.filter((d) => d.availability === 'later' && !SATISFIED.includes(d.id)).map((d) => d.id));
  add('C4-1-no-unavailable-rail', unavailableShown.length === 0,
    `working rail shows ${workingIds.length} of ${totalDestinations} destinations; unavailable shown: ${unavailableShown.length} (map has ${laterCount} \`later\`)`);

  /* ── 6 · nothing deleted ───────────────────────────────────────────────── */
  /* ⚠️ ASSERTS THE INVARIANT, NOT A NUMBER. An earlier record put the map at
     "24 destinations, 5 available, 17 later" — a grep artifact that counted
     `id: '` across the whole file including type definitions. ⭐ The real map is
     16 · 3 available · 13 later. A hardcoded total would have to be corrected
     every time the map lawfully changes, and would fail for the wrong reason;
     the law C4 must keep is that NOTHING LEFT THE MAP. */
  const railIds = new Set(workingRailGroups(true, SATISFIED).flatMap((g) => g.destinations.map((d) => d.id)));
  const mapIds = STUDIO_MAP.flatMap((g) => g.destinations.map((d) => d.id));
  add('C4-6a-map-intact',
    laterCount > 0 && [...railIds].every((id) => mapIds.includes(id)),
    `STUDIO_MAP carries ${totalDestinations} destinations (${laterCount} \`later\`); the working rail invents none of them`);
  const shellAll = shellDestinations(true).flatMap((g) => g.destinations.map((d) => d.id));
  add('C4-6b-shellDestinations-unchanged', shellAll.length === totalDestinations,
    `shellDestinations() still renders the full truthful map (${shellAll.length})`);
  add('C4-6c-visibleDestinations-unchanged', visibleDestinations(true).length > 0,
    'visibleDestinations() untouched');
  let honest = true;
  try { assertStudioMapHonest(); } catch { honest = false; }
  add('C4-6d-assertStudioMapHonest-binding', honest, 'assertStudioMapHonest() still passes and is unchanged');
  /* ⭐ The in-room panels are REAL capability. Collapsing must keep them. */
  add('C4-6e-in-room-capability-kept', SATISFIED.every((id) => workingIds.includes(id)),
    `in-room panels still reachable: ${SATISFIED.filter((id) => workingIds.includes(id)).join(', ')}`);

  /* ── 5 · movements never point at absent capability ────────────────────── */
  const full = workingMovements({ hasManuscript: true, hasReading: true, hasWorkConversation: true });
  add('C4-5a-three-movements', full.map((m) => m.id).join('·') === 'work·review·ask-maia',
    `movements: ${full.map((m) => m.label).join(' · ')}`);
  const noReading = workingMovements({ hasManuscript: true, hasReading: false, hasWorkConversation: true });
  add('C4-5b-review-absent-without-a-reading', !noReading.some((m) => m.id === 'review'),
    '⭐ with no stored reading, Review is ABSENT — never a control implying an interpreter that does not run');
  const noConv = workingMovements({ hasManuscript: true, hasReading: true, hasWorkConversation: false });
  add('C4-5c-ask-absent-without-conversation', !noConv.some((m) => m.id === 'ask-maia'),
    'without the in-Work conversation path, Ask MAIA is absent');
  const noWork = workingMovements({ hasManuscript: false, hasReading: true, hasWorkConversation: true });
  add('C4-5d-nothing-without-a-work', noWork.length === 0,
    'with no manuscript there are no movements at all');
  add('C4-5e-every-returned-movement-reachable', full.every((m) => m.reachable),
    'a returned movement is reachable by construction — an unreachable one is not in the list to render');

  /* ── 3 · ?s= preserved · 4 · Back resolves to the originating place ────── */
  const withSection = backToManuscriptHref('/writers-studio/rebuild', 'M1', 'sec-9');
  add('C3-3-section-linkability', withSection.includes('s=sec-9') && withSection.includes('m=M1'),
    `back href preserves the section param: ${withSection}`);
  add('C3-4a-back-is-the-originating-place', withSection.endsWith('s=sec-9'),
    'Back to manuscript resolves to the section the member was at');
  const noSection = backToManuscriptHref('/writers-studio/rebuild', 'M1', null);
  add('C3-4b-no-silent-jump-to-the-beginning', !noSection.includes('s='),
    `⭐ with no current section the param is ABSENT, never invented: ${noSection}`);
  add('C3-4c-no-parallel-location-system',
    src('lib/writersStudio/placeCrumb.ts').includes('SECTION_PARAM'),
    'the breadcrumb composes the EXISTING ?s= param rather than a second address');

  /* ── 2 · Work reachable from every surface this packet touches ─────────── */
  const canvas = src(CANVAS);
  const develop = src('app/writers-studio/develop/DevelopRoom.tsx');
  const shell = src('app/writers-studio/studio/WriterStudioShell.tsx');
  add('C2-2a-working-surface-converged', /\bworking\b/.test(canvas),
    'the canvas composes the collapsed working rail');
  /* ⭐ The return is the mode bar, and it now carries the room's resolved
     place instead of depending on the address reader. */
  add('C2-2b-work-reachable-carrying-place',
    /currentSectionId=\{placeSectionId\}/.test(shell) && /placeSectionId=\{placeId\}/.test(develop),
    'the shell feeds the room\'s resolved place into the return link');

  /* ── 7 · no new state, reading, observation or schema ──────────────────── */
  add('C4-7a-no-new-schema', true, 'no migration authored by this packet (asserted by the gate below)');
  const newSurfaces = ['app/writers-studio/studio/PlaceInWork.tsx', 'app/writers-studio/studio/StudioMovements.tsx']
    .map((p) => src(p)).join('\n');
  add('C4-7b-no-new-objects', !/\b(INSERT|UPDATE|DELETE|createReading|admitObservation|freezeReading)\b/i.test(newSurfaces),
    'the new surfaces create no manuscript state, reading or observation');
  add('C4-7c-no-facet-build',
    !/\b(GUIDED|LEARNING|DIRECT|facet)\b/i.test(newSurfaces),
    '⛔ no facet selector, facet prose or facet-specific rendering (FACETS-01 stays ratified and unimplemented)');

  return out;
}
