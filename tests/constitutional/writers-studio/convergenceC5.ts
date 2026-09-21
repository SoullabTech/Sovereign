import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { runC2C4 } from './convergenceC2C4';

export interface Check { readonly id: string; readonly ok: boolean; readonly detail: string }
const read = (p: string) => readFileSync(p, 'utf8');
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const src = (p: string) => stripComments(read(p));

const GUIDED = 'app/writers-studio/insight/InsightReading.tsx';
const DESK = 'app/writers-studio/insight/RevisionDesk.tsx';
const REBUILD = 'app/writers-studio/rebuild/RebuildStudioClient.tsx';
const WORK_DIRECTION = 'app/writers-studio/insight/WorkInspiration.tsx';
const VERSION_ROUTE = 'app/api/writers-studio/editorial/version/route.ts';
const TURN_ROUTE = 'app/api/writers-studio/editorial/turn/route.ts';
const UNDO_ROUTE = 'app/api/writers-studio/editorial/undo/route.ts';
const ADOPTION = 'lib/manuscript/editorialRuntime/adoption.ts';
const READER_CONTRACT = 'lib/manuscript/developmentalReader/contract.ts';

export function runC5(): readonly Check[] {
  const out: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });
  const guided = src(GUIDED);
  const desk = src(DESK);
  const rebuild = src(REBUILD);
  const versionRoute = src(VERSION_ROUTE);
  const turnRoute = src(TURN_ROUTE);
  const undoRoute = src(UNDO_ROUTE);
  const adoption = src(ADOPTION);
  const workDirection = src(WORK_DIRECTION);

  add('C5-1-guided-opens-without-angle',
    guided.includes('Here’s what I’m noticing.') &&
    /useState\(''\)/.test(guided) &&
    !guided.includes('EDITORIAL_QUESTIONS[0]'),
    'Guided opens on MAIA’s reading; the optional redirect starts empty.');

  add('C5-2-redirect-not-gate',
    guided.includes('Look at something else') &&
    guided.includes('Choose only if you want another angle…'),
    'ordinary-language editorial questions are behind an optional redirect');

  add('C5-3-maia-attributed',
    guided.includes('MAIA · with this passage') && guided.includes('o.observation'),
    'the observation is visibly attributed to MAIA');

  add('C5-4-no-maia-prefill-of-member-fields',
    !guided.includes('Your intention') && !guided.includes('The reader’s experience'),
    'Guided renders no MAIA-populated member-owned intention/reader-effect fields');

  const coverageIndex = guided.indexOf('<strong>What I read:</strong>');
  const detailIndex = guided.indexOf('data-reading-basis');
  add('C5-5-coverage-visible',
    coverageIndex >= 0 && detailIndex > coverageIndex,
    'coverage is rendered before the collapsed evidence/details block');

  add('C5-6-full-basis-reachable',
    guided.includes('What this reading rests on') &&
    guided.includes('o.evidence.map') && guided.includes('o.limits.map'),
    'evidence and non-conclusion detail remain reachable');

  add('C5-7-existing-proposal-version-path',
    desk.includes('Try a revision') &&
    rebuild.includes('sendBoundEditorialTurn') &&
    read('lib/manuscript/editorialRuntime/maiaOutcome.ts').includes('appendAuthoredVersionWithExecutor'),
    'Try a revision reaches the existing MAIA-authored ProposalVersion path');

  add('C5-7b-one-click-guided-revision-intent',
    guided.includes('insightAction=try-revision') &&
    rebuild.includes("incomingAction !== 'try-revision'") &&
    rebuild.includes('exact !== selectedPassage.text') &&
    rebuild.includes('autoProposalKey.current = key') &&
    rebuild.includes('void sendEditorial(['),
    'the first explicit Try a revision gesture survives navigation and fires only after exact-passage verification');

  add('C5-8-change-it-member-authored',
    desk.includes('>Change it<') &&
    rebuild.includes("'/api/writers-studio/editorial/version'") &&
    versionRoute.includes('appendMemberEditorialVersion'),
    'Change it saves through the existing member-authored version route');

  add('C5-9-talk-does-not-mutate',
    desk.includes('Talk about it') &&
    turnRoute.includes('runEditorialTurn') &&
    !turnRoute.includes('executeAuthorization') &&
    !turnRoute.includes('adoptVersion'),
    'Talk about it crosses the editorial turn route, not the mutation seam');

  add('C5-10-keep-mine-does-not-mutate',
    desk.includes('>Keep mine<') &&
    /const keep = \(\) => \{ setShowProposal\(false\); setLocalMessage\(null\); onKeep\(\); \}/.test(desk),
    'Keep mine is a presentation/member-choice act only');

  add('C5-11-exact-version-adoption',
    rebuild.includes('adoptBoundEditorialVersion(') &&
    rebuild.includes('suggestedVersion.id'),
    'Use this revision carries the exact selected version id');

  add('C5-12-existing-authorization-execution',
    adoption.includes('authorizeVersion') && adoption.includes('executeAuthorization'),
    'application remains the existing authorization → guarded execution path');

  add('C5-13-existing-undo',
    desk.includes('Undo this change') &&
    undoRoute.includes('undoApplication') &&
    rebuild.includes("'/api/writers-studio/editorial/undo'"),
    'Undo remains the existing recovery seam');

  add('C5-14-moved-locus-refuses-preview-apply',
    desk.includes('const matchesLocus') &&
    desk.includes('!matchesLocus') &&
    desk.includes('previewReviewed'),
    'a proposal against moved text cannot become an approved preview/application');

  const sendStart = rebuild.indexOf('const sendEditorial = useCallback');
  const sendEnd = rebuild.indexOf('const refreshContext', sendStart);
  const sendSlice = sendStart >= 0 && sendEnd > sendStart ? rebuild.slice(sendStart, sendEnd) : '';
  add('C5-15-no-automatic-work-direction-injection',
    sendSlice.length > 0 &&
    !sendSlice.includes('work.purpose') && !sendSlice.includes('work?.purpose') &&
    workDirection.includes('Bring this into my question') &&
    guided.includes('Remove from next turn'),
    'Work direction is absent from the send seam and enters only through the explicit, editable, turn-local member gesture');

  add('C5-16-legacy-purpose-unclassified',
    !workDirection.includes('parseWorkDirection') &&
    !workDirection.includes('Fire · Inspiration') &&
    workDirection.includes('work.purpose'),
    'legacy work.purpose remains free text; no elemental taxonomy is inferred');

  const contract = read(READER_CONTRACT);
  const reqStart = contract.indexOf('export interface DevelopmentalReaderRequest');
  const reqEnd = contract.indexOf('\n}', reqStart);
  const requestBody = contract.slice(reqStart, reqEnd);
  const requestFields = [...requestBody.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*):/gm)].map(m => m[1]);
  add('C5-17-reader-boundary-unchanged',
    JSON.stringify(requestFields) === JSON.stringify(['commissionedLens', 'evidence', 'recovered']),
    `DevelopmentalReaderRequest fields: ${requestFields.join(', ')}`);

  const c2c4 = runC2C4();
  add('C5-18-c2-c4-still-green',
    c2c4.every(c => c.ok),
    `${c2c4.filter(c => c.ok).length}/${c2c4.length} C2–C4 structural gates green`);

  const changed = [
    ...execSync('git diff --name-only 9fe8e9176', { encoding: 'utf8' }).trim().split('\n').filter(Boolean),
    ...execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).trim().split('\n').filter(Boolean),
  ];
  const substrate = changed.filter(p =>
    p.startsWith('database/migrations/') ||
    p.startsWith('app/api/writers-studio/editorial/') ||
    p.startsWith('lib/manuscript/revisionAuthorization/') ||
    p.startsWith('lib/manuscript/proposalChain/'));
  add('C5-19-no-new-revision-substrate',
    substrate.length === 0,
    `changed substrate files: ${substrate.join(', ') || 'none'}`);

  add('C5-P-plurality-not-verdict',
    desk.includes('two possible approaches to this passage, including keeping it as it is') &&
    !desk.includes('recommended option') && !desk.includes('preferred by MAIA'),
    'Explore another approach opens plural possibilities including keeping the original');

  return out;
}
