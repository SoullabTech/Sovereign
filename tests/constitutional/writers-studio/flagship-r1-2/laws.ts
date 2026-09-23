/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-2 — LAWS over exact Review → manuscript section navigation.
 *
 * A subject is: the address resolver (exact durable identity, present in the mounted context, or
 * nothing), the return-location composer (existing composers only), the return gesture (a location and
 * nothing else), the read-only presentation with a live `navigation`, the live Review view, the read-only
 * capability set, the host source files the static laws scan, the two predecessor law sources
 * (succession custody) and the freeze manifest (FS3 custody). Before the act lands every runtime law is
 * RED (the known-bad on e9f7ffcb5, where read-only Review still has navigate=false).
 *
 * ⭐ THE LAW: a mounted finding returns the writer to the manuscript at EXACTLY its durable
 * `returnTo.sectionId` — reading removed, Work kept, `s=<that id>` — through the existing composers.
 * ⛔ Never position, index, nearest, focus, heading, text or similarity. ⛔ A control without an exact
 * durable section address is ABSENT, never guessed. ⛔ No held passage, no write, no cognition.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReviewView } from '../../../../app/writers-studio/flagship/DevelopReview';
import { ports as r11bPorts, HOST as R11B_HOST } from '../flagship-r1-1b/laws';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }

/* ── the contract, typed here so the suite types before the module exists ── */
export interface Loc { readonly pathname: string; readonly search: string }
export interface ReturnContext { readonly paragraphs: readonly { readonly id: string; readonly text?: string }[] }
export interface ReturnHints { readonly focusSectionId?: string | null; readonly index?: number; readonly text?: string }
export type ReturnTarget = { readonly kind: 'section'; readonly sectionId: string } | { readonly kind: 'unaddressable' };
export type ReturnGesture = { readonly kind: 'navigate'; readonly href: string };
export interface ReturnActs { go(href: string): void }
export interface ReviewNavigation { hrefFor(sectionId: string): string | null; onGo(sectionId: string, href: string): void }
export type LiveState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'ready'; readonly readingId: string; readonly gen: number; readonly view: ReviewView };
export interface Subject {
  readonly name: string;
  readonly returnTargetFor?: (address: string | null | undefined, ctx: ReturnContext, hints?: ReturnHints) => ReturnTarget;
  readonly locationForReturn?: (loc: Loc, sectionId: string) => string;
  readonly returnGesture?: (sectionId: string, loc: Loc, act: ReturnActs) => ReturnGesture;
  readonly navigationFor?: (view: ReviewView, loc: Loc, act: ReturnActs) => ReviewNavigation;
  readonly Presentation?: (p: { view: ReviewView; capabilities: Readonly<Record<string, boolean>>; navigation?: ReviewNavigation; lens?: string }) => React.ReactElement;
  readonly Room?: (p: { view: ReviewView; lens?: string }) => React.ReactElement;
  readonly LiveView?: (p: { state: LiveState; lens: 'all'; onLens: () => void; navigation?: ReviewNavigation }) => React.ReactElement | null;
  readonly capabilities?: Readonly<Record<string, boolean>>;
  readonly hostFiles: readonly string[];
  readonly r11bLawsSource?: string;
  readonly r11cLawsSource?: string;
  readonly manifest?: unknown;
}

const ROOT = process.cwd();
const R11C_HEAD = 'e9f7ffcb5';
const FS2_MANIFEST_SHA256 = 'd7421b38c1fdc260feb7d7155819976dbf71f12064c87812efa0e4332715618f';
const MANIFEST = 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json';
const FS2_PRESERVED = 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE_FS2.json';
const R11B_LAWS = 'tests/constitutional/writers-studio/flagship-r1-1b/laws.ts';
const R11C_LAWS = 'tests/constitutional/writers-studio/flagship-r1-1c/laws.ts';
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => { try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; } };
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const render = (el: React.ReactElement | null) => (el ? renderToStaticMarkup(el) : '');
const unmounted = (id: string) => must(id, false, 'UNMOUNTED — read-only Review has navigate=false; no return navigation exists (R1-1C regime)');
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;
const text = (html: string) => html.replace(/<[^>]+>/g, ' ');

const LOC: Loc = { pathname: '/writers-studio/rebuild', search: '?m=ms-1&s=d-root&reading=rd-current' };
const CTX: ReturnContext = { paragraphs: [{ id: 'd-root', text: 'The water held the last of the light.' }, { id: 'd-2', text: 'Nothing moved on the far bank. She waited for the sound to come back.' }] };
const FORBIDDEN_NON_NAV = /Ask MAIA|data-action="discuss"|data-action="explore"|data-commission=|Read for this|Read again|Read this chapter again|Read this Work|Not now|Add your own observation|Keep with this passage|fs-facet|data-facet=|\bdisabled\b|aria-disabled/;
const NEW_VOCAB = /[?&](passage|range|start|end|selection|highlight)=/;

function acts() { const calls: string[] = []; return { calls, go: (href: string) => { calls.push(`go:${href}`); }, hold: () => { calls.push('hold'); }, write: () => { calls.push('write:standing'); }, cognition: () => { calls.push('cognition'); } }; }

/* A REAL ready view from the unchanged R1-1B loader over the R1-1B ledger fixture (one finding → d-2). */
type Loader = { loadSelectedReading?: (id: string | null, host: unknown, ports: unknown) => Promise<{ kind: string; view?: ReviewView }> };
let loader: Loader = {};
try { loader = require('../../../../app/writers-studio/rebuild/liveReview') as Loader; } catch { loader = {}; }
async function realView(): Promise<ReviewView | null> {
  if (!loader.loadSelectedReading) return null;
  const r = await loader.loadSelectedReading('rd-current', R11B_HOST, r11bPorts());
  return r.kind === 'ready' && r.view ? r.view : null;
}
/** The same view carrying a continuity map: one addressed cell (d-root), one unaddressed cell, one address outside the context. */
function withMap(v: ReviewView): ReviewView {
  return { ...v, map: { units: ['Chapter 1', '§2', 'Elsewhere'], coverage: v.coverage, rows: [{
    id: 't-river', label: 'The River', provenance: { kind: 'member-declared', declaredWhen: 'today' },
    presence: [2, 1, 0], addressOf: [{ label: 'Chapter 1', sectionId: 'd-root' }, undefined as unknown as { label: string; sectionId: string }, { label: 'Elsewhere', sectionId: 'd-elsewhere' }],
  }] } } as ReviewView;
}

export async function runR12Laws(s: Subject): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const sources = s.hostFiles.map((f) => (existsSync(join(ROOT, f)) ? strip(readFileSync(join(ROOT, f), 'utf8')) : '')).join('\n');
  const view = await realView();
  const a = acts();
  const navigation = (v: ReviewView) => (s.navigationFor ? s.navigationFor(v, LOC, a) : undefined);
  const present = (v: ReviewView, nav?: ReviewNavigation) => (s.Presentation && s.capabilities ? render(React.createElement(s.Presentation, { view: v, capabilities: s.capabilities, navigation: nav, lens: 'all' })) : '');
  const anchors = (html: string) => (html.match(/<a[^>]*data-return-to="([^"]*)"[^>]*>/g) ?? []);
  const anchorTargets = (html: string) => anchors(html).map((x) => /data-return-to="([^"]*)"/.exec(x)![1]!);

  out.push(law('R1-2-L1-only-navigate-moved', () => {
    if (!s.capabilities) return unmounted('R1-2-L1-only-navigate-moved');
    const c = s.capabilities;
    const others = ['askMaia', 'discuss', 'explore', 'commission', 'acknowledgeStale', 'ownObservation', 'facet'];
    const ok = c['navigate'] === true && others.every((k) => c[k] === false) && Object.keys(c).every((k) => k === 'navigate' || others.includes(k));
    return must('R1-2-L1-only-navigate-moved', ok, `caps=${JSON.stringify(c)}`);
  }));
  out.push(law('R1-2-L2-exact-durable-address', () => {
    if (!s.returnTargetFor) return unmounted('R1-2-L2-exact-durable-address');
    /* index 0 would be d-root; focus is d-2 and the text lives in d-2 so a focus or semantic candidate is NOT caught here */
    const t = s.returnTargetFor('d-2', CTX, { focusSectionId: 'd-2', index: 0, text: 'far bank' });
    return must('R1-2-L2-exact-durable-address', t.kind === 'section' && t.sectionId === 'd-2', `target=${JSON.stringify(t)}`);
  }));
  out.push(law('R1-2-L3-unaddressable-is-absent-never-nearest', () => {
    if (!s.returnTargetFor) return unmounted('R1-2-L3-unaddressable-is-absent-never-nearest');
    const gone = s.returnTargetFor('d-gone', CTX, { focusSectionId: 'd-2', index: 1, text: 'far bank' });
    const none = s.returnTargetFor(null, CTX, { focusSectionId: 'd-2', index: 1 });
    return must('R1-2-L3-unaddressable-is-absent-never-nearest', gone.kind === 'unaddressable' && none.kind === 'unaddressable', `gone=${JSON.stringify(gone)} none=${JSON.stringify(none)}`);
  }));
  out.push(law('R1-2-L4-never-current-focus', () => {
    if (!s.returnTargetFor) return unmounted('R1-2-L4-never-current-focus');
    const t = s.returnTargetFor('d-2', CTX, { focusSectionId: 'd-root', index: 1, text: 'far bank' });
    return must('R1-2-L4-never-current-focus', t.kind === 'section' && t.sectionId === 'd-2', `target=${JSON.stringify(t)} focusWas=d-root`);
  }));
  out.push(law('R1-2-L5-never-semantic', () => {
    if (!s.returnTargetFor) return unmounted('R1-2-L5-never-semantic');
    /* the finding's text occurs in d-root; its durable address is d-2 */
    const t = s.returnTargetFor('d-2', CTX, { focusSectionId: 'd-2', index: 1, text: 'last of the light' });
    return must('R1-2-L5-never-semantic', t.kind === 'section' && t.sectionId === 'd-2', `target=${JSON.stringify(t)} textLivesIn=d-root`);
  }));
  out.push(law('R1-2-L6-return-location-law', () => {
    if (!s.locationForReturn) return unmounted('R1-2-L6-return-location-law');
    const href = s.locationForReturn(LOC, 'd-2');
    const params = new URLSearchParams(href.split('?')[1] ?? '');
    const ok = href.startsWith('/writers-studio/rebuild?') && params.get('m') === 'ms-1' && params.get('s') === 'd-2' && !params.has('reading') && [...params.keys()].every((k) => k === 'm' || k === 's');
    const composers = /locationForWrite\(|locationForSection\(/.test(sources) && !/new URLSearchParams\([^)]*\)\.set\(['"]s['"]/.test(strip(existsSync(join(ROOT, 'app/writers-studio/rebuild/reviewReturn.ts')) ? readFileSync(join(ROOT, 'app/writers-studio/rebuild/reviewReturn.ts'), 'utf8') : ''));
    return must('R1-2-L6-return-location-law', ok && composers, `href=${href} existingComposers=${composers}`);
  }));
  out.push(law('R1-2-L7-no-new-url-vocabulary', () => {
    if (!s.locationForReturn) return unmounted('R1-2-L7-no-new-url-vocabulary');
    const href = s.locationForReturn(LOC, 'd-2');
    const staticVocab = /['"](passage|range|start|end|selection|highlight)['"]\s*[,)]|[?&](passage|range|highlight|selection)=/.test(sources);
    return must('R1-2-L7-no-new-url-vocabulary', !NEW_VOCAB.test(href) && !staticVocab, `href=${href} staticVocab=${staticVocab}`);
  }));
  out.push(law('R1-2-L8-gesture-is-a-location-only', () => {
    if (!s.returnGesture) return unmounted('R1-2-L8-gesture-is-a-location-only');
    const b = acts();
    const g = s.returnGesture('d-2', LOC, b) as ReturnGesture & { hold?: unknown; selection?: unknown };
    const onlyGo = b.calls.length === 1 && b.calls[0] === `go:${g.href}`;
    const staticHold = /setHeld\([^n]|onHold\(|selection:|held:\s*\{/.test(strip(existsSync(join(ROOT, 'app/writers-studio/rebuild/reviewReturn.ts')) ? readFileSync(join(ROOT, 'app/writers-studio/rebuild/reviewReturn.ts'), 'utf8') : ''));
    return must('R1-2-L8-gesture-is-a-location-only', g.kind === 'navigate' && g.hold === undefined && g.selection === undefined && onlyGo && !staticHold, `gesture=${JSON.stringify(g)} calls=${b.calls.join(',') || 'none'} staticHold=${staticHold}`);
  }));
  out.push(law('R1-2-L9-every-addressable-class-navigates', () => {
    if (!view || !s.navigationFor || !s.Presentation) return unmounted('R1-2-L9-every-addressable-class-navigates');
    const v = withMap(view);
    const html = present(v, navigation(v));
    const finding = count(html, /<a[^>]*class="fs-btn"[^>]*data-return-to="d-2"[^>]*href="[^"]+"/g);
    const foot = count(html, /<div class="fs-contextfoot"><a[^>]*class="fs-btn fs-btn--key"[^>]*data-return-to="d-2"[^>]*href="[^"]+"/g);
    const cell = count(html, /<a[^>]*class="fs-cell"[^>]*data-return-to="d-root"[^>]*href="[^"]+"/g);
    return must('R1-2-L9-every-addressable-class-navigates', finding === 1 && foot === 1 && cell === 1, `findingAnchor=${finding} contextFootAnchor=${foot} addressedCellAnchor=${cell}`);
  }));
  out.push(law('R1-2-L10-map-cells-only-with-an-address', () => {
    if (!view || !s.navigationFor || !s.Presentation) return unmounted('R1-2-L10-map-cells-only-with-an-address');
    const v = withMap(view);
    const html = present(v, navigation(v));
    const empty = count(html, /data-return-to=""/g) + count(html, /<a[^>]*data-return-to="d-elsewhere"/g);
    const spans = count(html, /<span class="fs-cell"/g);
    return must('R1-2-L10-map-cells-only-with-an-address', empty === 0 && spans === 2, `guessedCells=${empty} unaddressedAsSpan=${spans}`);
  }));
  out.push(law('R1-2-L11-coverage-never-guesses', () => {
    if (!view || !s.navigationFor || !s.Presentation) return unmounted('R1-2-L11-coverage-never-guesses');
    const html = present(view, navigation(view));
    const bad = /data-return-to="(coverage|previous-reading|full-manuscript|context)"/.test(html) || /What MAIA read →|Open the full manuscript/.test(html);
    return must('R1-2-L11-coverage-never-guesses', !bad, `nonAddressControlRendered=${bad}`);
  }));
  out.push(law('R1-2-L12-predecessor-succession-explicit', () => {
    const b = s.r11bLawsSource ?? (existsSync(join(ROOT, R11B_LAWS)) ? readFileSync(join(ROOT, R11B_LAWS), 'utf8') : '');
    const c = s.r11cLawsSource ?? (existsSync(join(ROOT, R11C_LAWS)) ? readFileSync(join(ROOT, R11C_LAWS), 'utf8') : '');
    const predB = execSync(`git show ${R11C_HEAD}:${R11B_LAWS}`, { cwd: ROOT, encoding: 'utf8' }).includes('data-return-to=|');
    const predC = execSync(`git show ${R11C_HEAD}:${R11C_LAWS}`, { cwd: ROOT, encoding: 'utf8' }).includes(`expected.every((k) => s.capabilities![k] === false)`);
    const succB = /R1-2 SUCCESSION/.test(b) && b.includes(`git show ${R11C_HEAD}`) && /R1-1B-L18/.test(b);
    const succC = /R1-2 SUCCESSION/.test(c) && c.includes(`git show ${R11C_HEAD}`) && /R1-1C-L11/.test(c);
    return must('R1-2-L12-predecessor-succession-explicit', predB && predC && succB && succC, `predecessorsAtR11C=${predB && predC} r11bSuccession=${succB} r11cSuccession=${succC}`);
  }));
  out.push(law('R1-2-L13-fs3-carries-succession', () => {
    const m = (s.manifest ?? (existsSync(join(ROOT, MANIFEST)) ? JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8')) : null)) as
      { act?: string; frozen?: Record<string, { blob: string }>; supersedes?: { manifest_sha256?: string; preserved_at?: string; superseded?: Record<string, { fs2_blob?: string; predecessor_blob?: string; successor?: string }> } } | null;
    if (!m || !m.frozen) return must('R1-2-L13-fs3-carries-succession', false, 'no freeze manifest');
    const governing = ['tests/constitutional/writers-studio/flagship-r1-2/laws.ts', 'tests/constitutional/writers-studio/flagship-r1-2/candidates.tsx', 'tests/constitutional/writers-studio/flagship-r1-2/matrix.ts', R11B_LAWS, R11C_LAWS];
    const missing = governing.filter((p) => !m.frozen![p] || !/^[0-9a-f]{40}$/.test(m.frozen![p]!.blob));
    const succession = /FS3/.test(m.act ?? '') && m.supersedes?.manifest_sha256 === FS2_MANIFEST_SHA256 && m.supersedes.preserved_at === FS2_PRESERVED;
    const fs2Preserved = existsSync(join(ROOT, FS2_PRESERVED)) && createHash('sha256').update(readFileSync(join(ROOT, FS2_PRESERVED))).digest('hex') === FS2_MANIFEST_SHA256;
    const superseded = m.supersedes?.superseded ?? {};
    const named = [R11B_LAWS, R11C_LAWS].every((p) => !!superseded[p]?.successor);
    const verifier = existsSync(join(ROOT, 'scripts/verify-flagship-freeze.ts')) ? readFileSync(join(ROOT, 'scripts/verify-flagship-freeze.ts'), 'utf8') : '';
    const pinned = !s.manifest ? verifier.includes(createHash('sha256').update(readFileSync(join(ROOT, MANIFEST))).digest('hex')) : true;
    return must('R1-2-L13-fs3-carries-succession', missing.length === 0 && succession && fs2Preserved && named && pinned, `missing=${missing.join(',') || 'none'} succession=${succession} fs2Preserved=${fs2Preserved} predecessorLawsNamed=${named} verifierPinned=${pinned}`);
  }));
  out.push(law('R1-2-L14-controlled-presentation-unchanged', () => {
    if (!s.Room) return unmounted('R1-2-L14-controlled-presentation-unchanged');
    const { REVIEW } = require('../../../../scripts/witness/flagship/fixtures') as { REVIEW: ReviewView };
    /* the four R1-1A golden states, exactly as captureGolden composes them */
    const states: [string, ReviewView, string | undefined][] = [
      ['7-review', REVIEW, undefined],
      ['7b-review-acknowledged', { ...REVIEW, changed: REVIEW.changed ? { ...REVIEW.changed, acknowledged: true } : undefined }, undefined],
      ['8-review-not-read', REVIEW, 'arc'], ['9-review-nothing-noticed', REVIEW, 'coherence'],
    ];
    const diffs = states.filter(([id, v, lens]) => render(React.createElement(s.Room!, { view: v, lens })) !== readFileSync(join(ROOT, 'tests/constitutional/writers-studio/flagship-r1-1a/golden', `${id}.html`), 'utf8')).map(([id]) => id);
    return must('R1-2-L14-controlled-presentation-unchanged', diffs.length === 0, diffs.length ? `changed: ${diffs.join(', ')}` : '4/4 controlled states byte-identical to the R1-1A goldens');
  }));
  out.push(law('R1-2-L15-non-navigation-controls-still-absent', () => {
    if (!view || !s.navigationFor || !s.Presentation) return unmounted('R1-2-L15-non-navigation-controls-still-absent');
    const v = withMap(view);
    const html = present(v, navigation(v));
    const ids = new Set(v.context.paragraphs.map((p) => p.id));
    const targets = anchorTargets(html);
    const allExact = targets.length > 0 && targets.every((t) => ids.has(t));
    const buttons = count(html, /<button[^>]*data-return-to=/g);
    return must('R1-2-L15-non-navigation-controls-still-absent', !FORBIDDEN_NON_NAV.test(html) && allExact && buttons === 0, `forbidden=${FORBIDDEN_NON_NAV.test(html)} anchorTargets=${targets.join(',')} allInContext=${allExact} returnButtons=${buttons}`);
  }));
  out.push(law('R1-2-L16-live-ready-golden', () => {
    if (!view || !s.LiveView || !s.navigationFor) return unmounted('R1-2-L16-live-ready-golden');
    const html = render(React.createElement(s.LiveView, { state: { kind: 'ready', readingId: 'rd-current', gen: 1, view }, lens: 'all', onLens: () => {}, navigation: navigation(view) }));
    const f = join(ROOT, 'tests/constitutional/writers-studio/flagship-r1-2/golden/review-ready-navigable.html');
    const same = existsSync(f) && readFileSync(f, 'utf8') === html;
    return must('R1-2-L16-live-ready-golden', same, same ? 'review-ready-navigable byte-identical' : 'live navigable Review moved or golden absent');
  }));
  out.push(law('R1-2-L17-inherited-law-green', () => {
    const r = spawnSync('npx', ['tsx', 'scripts/verify-flagship-freeze.ts'], { cwd: ROOT, encoding: 'utf8' });
    const same = (f: string) => execSync(`git rev-parse ${R11C_HEAD}:"${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim() === execSync(`git hash-object "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    const untouched = ['lib/writersStudio/studio/realReview.ts', 'app/writers-studio/rebuild/liveReview.ts', 'app/writers-studio/rebuild/reviewNavigation.ts', 'app/api/sovereign/manuscripts/[id]/readings/route.ts', 'app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts', 'app/writers-studio/rebuild/discussAct.ts', 'lib/writersStudio/placeInWork.ts'].every(same);
    return must('R1-2-L17-inherited-law-green', r.status === 0 && untouched, `freeze exit=${r.status} mapper/loader/navigation/routes/discuss/place identical to ${R11C_HEAD}=${untouched}`);
  }));
  out.push(law('R1-2-L18-copy-carries-no-identifiers', () => {
    if (!view || !s.navigationFor || !s.Presentation) return unmounted('R1-2-L18-copy-carries-no-identifiers');
    const html = present(view, navigation(view));
    const visible = text(html);
    const leak = /d-2|d-root|returnTo|sectionId|data-return-to|reading=|[?&]s=/.test(visible);
    const label = /<a[^>]*data-return-to="d-2"[^>]*>Go to passage<\/a>/.test(html);
    return must('R1-2-L18-copy-carries-no-identifiers', !leak && label, `identifierInVisibleText=${leak} labelIsGoToPassage=${label}`);
  }));
  return out;
}
