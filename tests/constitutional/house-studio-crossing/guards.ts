/**
 * H1-R1 static guards — what a pure resolver suite cannot see.
 * Every source scan strips comments first, so a file documenting its own
 * compliance is never read as the banned behaviour (the C21 lesson).
 */
import fs from 'node:fs';
import path from 'node:path';

import { HOUSE_PLACES } from '../../../lib/house/catalog';
import {
  FACET_CROSSINGS,
  ORIENTATION_FACETS,
  THRESHOLD_ORIGINS,
  isThresholdCrossing,
} from '../../../lib/house/livingOrientation';
import { WORK_INTAKE_PARAM, requestedWorkIdFrom, studioForWork } from '../../../app/writers-studio/workIntake';

const root = path.resolve(__dirname, '../../..');
const code = (rel: string) =>
  fs.readFileSync(path.join(root, rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
    .replace(/\{\s*\}/g, '');

export interface GuardResult { readonly id: string; readonly reason: string | null }

export function runGuards(): GuardResult[] {
  const out: GuardResult[] = [];
  const g = (id: string, reason: string | null) => out.push({ id, reason });

  // HG-1 — the crossing is registered exactly as ruled.
  const c = FACET_CROSSINGS.find((x) => x.id === 'house-open-work-in-studio');
  g('HG-1 registered as ruled', !c ? 'missing'
    : c.from !== 'house' || c.to !== 'writing' || c.mode !== 'navigation'
      || c.authority !== 'member_explicit' || c.standing !== 'live'
      || JSON.stringify(c.carries) !== JSON.stringify(['living work identity'])
      ? `shape drifted: ${JSON.stringify({ from: c.from, to: c.to, mode: c.mode, authority: c.authority, carries: c.carries })}`
      : null);

  // HG-2 — the threshold law: a threshold never becomes a place or a facet, and
  // every threshold crossing is member-chosen navigation carrying one identity into a place.
  const placeIds = new Set<string>(HOUSE_PLACES.map((p) => p.id));
  const facetIds = new Set(Object.keys(ORIENTATION_FACETS));
  const leaked = THRESHOLD_ORIGINS.filter((t) => placeIds.has(t) || facetIds.has(t));
  const lawless = FACET_CROSSINGS.filter(isThresholdCrossing).filter((x) =>
    x.mode !== 'navigation' || x.authority !== 'member_explicit' || !placeIds.has(x.to)
    || x.carries.length !== 1 || !/identity/.test(x.carries[0] ?? ''));
  g('HG-2 threshold law', leaked.length ? `threshold became a place/facet: ${leaked.join(',')}`
    : lawless.length ? `threshold crossings break the law: ${lawless.map((x) => x.id).join(',')}` : null);
  g('HG-2b nothing crosses INTO a threshold',
    FACET_CROSSINGS.some((x) => (THRESHOLD_ORIGINS as readonly string[]).includes(x.to)) ? 'a threshold is used as a destination' : null);

  // HG-3 — producer and consumer share one parameter (the canvasIdentity lesson).
  const ids = ['w-1', 'a b&c=d', 'ü/ñ?#'];
  const broken = ids.filter((id) => requestedWorkIdFrom(new URL(studioForWork(id), 'https://x').searchParams) !== id);
  g('HG-3 round trip', broken.length ? `lost in transit: ${JSON.stringify(broken)}` : null);

  // HG-4 — the House links each Work through the builder; no hand-built parameter.
  const house = code('app/house/page.tsx');
  g('HG-4 House uses the builder',
    !/href=\{studioForWork\(work\.id\)\}/.test(house) ? 'per-Work link not built by studioForWork'
      : new RegExp(`[?&]${WORK_INTAKE_PARAM}=`).test(house) ? 'hand-built Work parameter in the House' : null);

  // HG-5 — navigation stores nothing and asks nothing of any server.
  const banned = /\b(apiFetch|fetch|localStorage|sessionStorage|indexedDB)\b|document\.cookie|\bquery\(/;
  const intakeSrc = code('app/writers-studio/workIntake.ts');
  g('HG-5 intake is pure', banned.test(intakeSrc) ? `found ${intakeSrc.match(banned)?.[0]}` : null);
  const controller = code('app/dev/writers-studio-pc3-live/P4R1HomeController.tsx');
  g('HG-5b controller keeps no browser memory of the crossing',
    /\b(localStorage|sessionStorage|indexedDB)\b|document\.cookie/.test(controller) ? 'browser storage in the controller' : null);

  // HG-6 — the controller resolves through the intake and honours it before Home's own pick.
  // WS2-03B amendment: opens FROM the intake carry the chosen Work into the writing room;
  // every other open, Home-mode switch and leaving the intake drop it.
  const drops = (controller.match(/next\.delete\(WORK_INTAKE_PARAM\)/g) ?? []).length;
  g('HG-6 controller wiring',
    !/resolveWorkIntake\(intakeInputFrom\(/.test(controller) ? 'intake not resolved through workIntake'
      : !/navigateToManuscript\(intake\.manuscriptId, undefined, true, intake\.workId\)/.test(controller) ? 'single-manuscript open does not use the intake result, replace history, and carry the chosen Work'
        : !/navigateToManuscript\(manuscriptId, undefined, false, intake\.workId\)/.test(controller) ? 'chooser open does not carry the chosen Work'
          : !/if \(chosenWorkId\) next\.set\(WORK_INTAKE_PARAM, chosenWorkId\);\s*else next\.delete\(WORK_INTAKE_PARAM\);/.test(controller) ? 'an open without a choice does not drop the Work parameter'
            : controller.indexOf("intake.kind === 'open'") > controller.indexOf('<P4R1HomeView') ? 'Home renders before the intake is honoured'
              : drops < 3 ? `Work parameter not dropped on every exit (${drops}/3)` : null);

  // HG-8 — amendment wiring in the three canonical rooms: the visible choice reaches the
  // resolver, Studio Home never inherits it (else the intake re-fires and Home is unreachable),
  // and no storage line touches it. The rooms keep unrelated storage (settings, drafts).
  const rooms = [
    'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx',
    'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx',
    'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx',
  ];
  const roomFaults = rooms.flatMap((rel) => {
    const src = code(rel);
    const name = path.basename(rel);
    const faults: string[] = [];
    if (!/resolveWorkContext\([^;]*requestedWorkIdFrom\(params\)\)/.test(src)) faults.push(`${name}: choice not passed to resolver`);
    if (!/if \(mode === 'home'\) (next|query)\.delete\(WORK_INTAKE_PARAM\)/.test(src)) faults.push(`${name}: Home inherits the choice`);
    if (src.split('\n').some((l) => /(localStorage|sessionStorage|indexedDB|document\.cookie)/.test(l) && /WORK_INTAKE_PARAM|requestedWorkIdFrom|explicitWork|chosenWork/.test(l))) faults.push(`${name}: choice stored`);
    return faults;
  });
  g('HG-8 amendment wiring in canonical rooms', roomFaults.length ? roomFaults.join('; ') : null);

  // HG-9 — the resolver: the choice is confined to Works that declare the manuscript,
  // and the resolver reads no storage or network.
  const ctx = code('app/writers-studio/workContext.ts');
  g('HG-9 resolver amendment',
    !/declaring\.find\(\(w\) => w\.id === explicitWorkId\)/.test(ctx) ? 'explicit choice not confined to declaring Works'
      : /\b(localStorage|sessionStorage|indexedDB|apiFetch)\b|document\.cookie/.test(ctx) ? 'resolver reads storage or network' : null);

  // HG-7 — the chooser keeps declaration order and never recommends.
  const view = code('app/dev/writers-studio-pc3-live/P4R1WorkIntake.tsx');
  g('HG-7 chooser does not rank', /\.sort\(|recommend|most recent|latest/i.test(view) ? 'ranking language or sort in the chooser' : null);

  return out;
}
