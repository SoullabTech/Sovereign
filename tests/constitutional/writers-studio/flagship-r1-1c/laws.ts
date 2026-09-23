/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1C — LAWS over Review navigation succession + governed re-freeze.
 *
 * A subject is: the mode resolver (URL first), the Review-entry resolver, the choice resolver (a location,
 * never a mount), the ledger-only choice loader, the retrieval gate, the nav-action composer, the late-ledger
 * binder, the two location composers, the pure chooser view, the host view, the read-only capability set,
 * the host source files the static laws scan, the C1B laws source (succession custody) and the freeze
 * manifest (re-freeze custody). Before the succession lands every runtime law is RED (the known-bad on
 * e5a89f2a4, which lawfully carries no visible Review destination under the predecessor C1B-L6 regime).
 *
 * ⭐ THE SUCCESSOR LAW (R1-1C-L1): flagship navigation is explicit, bounded, non-duplicative and revives no
 * legacy architecture — the reason C1B-L6 existed — AND Review is a flagship destination. Entry into a
 * particular Review still resolves ONLY through explicit human selection of one durable reading → the
 * `reading=<id>` URL state → the unchanged R1-1B runtime. ⛔ No visible navigation may weaken that chain.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { FlagshipWriteViewProps } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import type { ReviewView } from '../../../../app/writers-studio/flagship/DevelopReview';
import { CONTEXT } from '../flagship-c1b/laws';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }

/* ── the successor contract, typed here so the suite types before the module exists ── */
export type StudioMode = 'write' | 'review-choose' | 'review';
export interface NavRequest { readonly reading: string | null; readonly chooserOpen: boolean }
export type ReviewEntry = { readonly kind: 'review'; readonly readingId: string } | { readonly kind: 'choose' };
export interface Loc { readonly pathname: string; readonly search: string }
export type ChoiceOutcome = { readonly kind: 'navigate'; readonly href: string };
export interface Summary { readonly id: string; readonly outcome: 'reading' | 'none'; readonly commissionedLens: string; readonly frozenAt: string; readonly observationCount: number }
export type ChoicesResult = { readonly kind: 'choices'; readonly readings: readonly Summary[] } | { readonly kind: 'unavailable' };
export type ChooserState =
  | { readonly kind: 'closed' }
  | { readonly kind: 'loading'; readonly gen: number }
  | { readonly kind: 'choices'; readonly gen: number; readonly readings: readonly Summary[] }
  | { readonly kind: 'unavailable'; readonly gen: number };
export interface PortReply { readonly ok: boolean; readonly status: number; readonly json: unknown }
export interface ChoicePorts { listReadings(manuscriptId: string): Promise<PortReply>; getReading(manuscriptId: string, readingId: string): Promise<PortReply> }
export type NavAction =
  | { readonly kind: 'link'; readonly href: string; readonly onSelect?: (e: { preventDefault(): void }) => void }
  | { readonly kind: 'act'; readonly onAct: () => void };
export type NavActions = Partial<Record<'write' | 'develop' | 'review', NavAction>>;
export interface NavActs { go(href: string): void; openChooser(): void; closeChooser(): void }
export interface StudioNav { readonly mode: StudioMode; readonly actions: NavActions; readonly choose?: { hrefFor(id: string): string; onChoose(id: string, href: string): void } }
export type LiveState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly readingId: string; readonly gen: number }
  | { readonly kind: 'unavailable'; readonly readingId: string; readonly gen: number }
  | { readonly kind: 'ready'; readonly readingId: string; readonly gen: number; readonly view: ReviewView };
export type HostProps = FlagshipWriteViewProps & { review?: LiveState; chooser?: ChooserState; studioNav?: StudioNav };

export interface Subject {
  readonly name: string;
  readonly studioMode?: (req: NavRequest) => StudioMode;
  /** the ledger is offered so an auto-selecting candidate can be BUILT; the reference never reads it */
  readonly enterReview?: (reading: string | null, ledger?: readonly Summary[]) => ReviewEntry;
  readonly chooseReading?: (readingId: string, loc: Loc) => ChoiceOutcome;
  readonly loadChoices?: (manuscriptId: string, ports: ChoicePorts) => Promise<ChoicesResult>;
  readonly shouldLoadChoices?: (req: NavRequest) => boolean;
  readonly navActionsFor?: (mode: StudioMode, loc: Loc, act: NavActs) => NavActions;
  readonly attachChoices?: (pending: { gen: number }, current: { gen: number; chooserOpen: boolean; reading: string | null }) => boolean;
  readonly locationForWrite?: (pathname: string, search: string) => string;
  readonly locationForReading?: (pathname: string, search: string, readingId: string) => string;
  /** the existing WS2-05A place composer (R1-1B-L11 already binds it; R1-1C binds it from the navigation side) */
  readonly placeAddress: (pathname: string, search: string, sectionId: string) => string;
  readonly Chooser?: (p: { state: ChooserState; hrefFor: (id: string) => string; onChoose: (id: string, href: string) => void }) => React.ReactElement | null;
  readonly HostView: (p: HostProps) => React.ReactElement;
  readonly capabilities?: Readonly<Record<string, boolean>>;
  readonly hostFiles: readonly string[];
  /** succession custody — defaults to the file on disk; a candidate may supply a rewritten source */
  readonly c1bLawsSource?: string;
  /** re-freeze custody — defaults to the manifest on disk; a candidate may supply a weaker manifest */
  readonly manifest?: unknown;
}

const ROOT = process.cwd();
const FS1_BASE = '4dade9a68668e3f2148e481859e85b60b172462c';
const FS1_MANIFEST_SHA256 = 'd1fff27d630968ae5d65ee87186864c8c26c2b555443a99340fa9663cb435a68';
const C1B_LAWS = 'tests/constitutional/writers-studio/flagship-c1b/laws.ts';
const MANIFEST = 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json';
const FS1_PRESERVED = 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE_FS1.json';
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => { try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; } };
const alaw = async (id: string, body: () => Promise<LawResult>): Promise<LawResult> => { try { return await body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; } };
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const render = (el: React.ReactElement | null) => (el ? renderToStaticMarkup(el) : '');
const unmounted = (id: string) => must(id, false, 'UNMOUNTED — no Review navigation succession exists (predecessor C1B-L6 regime)');
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

/* ── fixtures ── */
const MS = 'ms-1';
const LOC: Loc = { pathname: '/writers-studio/rebuild', search: '?m=ms-1&s=d-2' };
const LOC_R: Loc = { pathname: '/writers-studio/rebuild', search: '?m=ms-1&s=d-2&reading=rd-b' };
/** ledger order as the route returns it (newest first) — but the NEWEST by frozenAt is deliberately NOT index 0 here,
 *  so an auto-newest and an auto-first candidate choose observably different readings and both are seen dying. */
const LEDGER: readonly Summary[] = [
  { id: 'rd-b', outcome: 'reading', commissionedLens: 'continuity', frozenAt: '2026-09-22T13:00:00.000Z', observationCount: 2 },
  { id: 'rd-newest', outcome: 'reading', commissionedLens: 'voice', frozenAt: '2026-09-22T15:00:00.000Z', observationCount: 1 },
  { id: 'rd-none', outcome: 'none', commissionedLens: 'arc', frozenAt: '2026-09-22T11:00:00.000Z', observationCount: 0 },
];
const OBSERVATION_PROSE = /returns here as a place|Observation of rd|far bank is where/;
const FORBIDDEN_CONTROLS = /Ask MAIA|data-action="discuss"|data-action="explore"|data-commission=|Read for this|Read again|Read this chapter again|Read this Work|Not now|Add your own observation|Keep with this passage|data-return-to=|fs-facet|data-facet=|\bdisabled\b|aria-disabled/;
const LEGACY = /\/writers-studio\/(develop|review)(["'?/#]|$)/;

/** Ports over a member-owned ledger, recording every call; the exact reading is never available (404) so any
 *  mount from this port set is a mount without R1-0. Extra trap methods record forbidden acts. */
export function choicePorts(readings: readonly Summary[] = LEDGER, opts: { fail?: boolean } = {}) {
  const calls: string[] = [];
  const p = {
    calls,
    listReadings: async (m: string) => { calls.push(`list:${m}`); return opts.fail ? { ok: false, status: 500, json: null } : { ok: true, status: 200, json: { readings } }; },
    getReading: async (m: string, id: string) => { calls.push(`get:${m}:${id}`); return { ok: false, status: 404, json: { refusal: 'not_found' } }; },
    commission: async () => { calls.push('POST:commission'); },
    write: async () => { calls.push('write:standing'); },
  };
  return p;
}
function acts() {
  const calls: string[] = [];
  const a = {
    calls,
    go: (href: string) => { calls.push(`go:${href}`); },
    openChooser: () => { calls.push('openChooser'); },
    closeChooser: () => { calls.push('closeChooser'); },
    commission: () => { calls.push('POST:commission'); },
    write: () => { calls.push('write:standing'); },
  };
  return a;
}
const readyView = (): ReviewView => ({
  work: 'The River Between', kind: 'novel', scope: { kind: 'work' },
  context: { chapterLabel: 'Chapter 1', chapterTitle: '', page: '', paragraphs: [{ id: 'd-root', text: 'x' }, { id: 'd-2', text: 'y' }] },
  findings: [], lenses: [], coverage: { read: 2, total: 2 },
} as unknown as ReviewView);

export async function runR11CLaws(s: Subject): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const sources = s.hostFiles.map((f) => (existsSync(join(ROOT, f)) ? strip(readFileSync(join(ROOT, f), 'utf8')) : '')).join('\n');
  const nav = (mode: StudioMode, loc: Loc = LOC): StudioNav | undefined => (s.navActionsFor ? {
    mode, actions: s.navActionsFor(mode, loc, acts()),
    choose: s.locationForReading ? { hrefFor: (id) => s.locationForReading!(loc.pathname, loc.search, id), onChoose: () => {} } : undefined,
  } : undefined);
  const host = (p: Partial<HostProps> = {}) => render(React.createElement(s.HostView, {
    context: CONTEXT, workTitle: 'The River Between', workForm: null, focusId: 'd-2', held: null, onFocus: () => {}, onHold: () => {}, ...p,
  } as HostProps));
  const chooser = (state: ChooserState) => (s.Chooser ? render(React.createElement(s.Chooser, { state, hrefFor: (id) => (s.locationForReading ? s.locationForReading(LOC.pathname, LOC.search, id) : `?reading=${id}`), onChoose: () => {} })) : '');
  const navsOf = (html: string) => ({
    all: html.match(/data-nav="[a-z]+"/g) ?? [],
    writeCurrent: count(html, /<span[^>]*class="fs-(nav|mn)"[^>]*data-nav="write"[^>]*data-affordance="orientation"[^>]*aria-current="page"/g),
    reviewCurrent: count(html, /<span[^>]*class="fs-(nav|mn)"[^>]*data-nav="review"[^>]*data-affordance="orientation"[^>]*aria-current="page"/g),
    reviewAct: count(html, /<button[^>]*class="fs-(nav|mn)"[^>]*data-nav="review"[^>]*data-affordance="navigate"/g),
    writeLink: count(html, /<a[^>]*class="fs-(nav|mn)"[^>]*data-nav="write"[^>]*data-affordance="navigate"[^>]*href="[^"]+"/g),
    develop: count(html, /data-nav="develop"/g),
    rail: count(html, /class="fs-rail"/g), mobile: count(html, /class="fs-mobilenav"/g),
  });
  const readyState: LiveState = { kind: 'ready', readingId: 'rd-b', gen: 1, view: readyView() };
  const choicesState: ChooserState = { kind: 'choices', gen: 1, readings: LEDGER };

  out.push(law('R1-1C-L1-successor-navigation', () => {
    const w = nav('write'); const r = nav('review', LOC_R); const c = nav('review-choose');
    if (!w || !r || !c) return unmounted('R1-1C-L1-successor-navigation');
    const write = navsOf(host({ studioNav: w }));
    const review = navsOf(host({ studioNav: r, review: readyState }));
    const choose = navsOf(host({ studioNav: c, chooser: choicesState }));
    const bounded = (n: ReturnType<typeof navsOf>) => n.all.length === 4 && n.develop === 0 && n.rail === 1 && n.mobile === 1;
    const okWrite = bounded(write) && write.writeCurrent === 2 && write.reviewAct === 2;
    const okReview = bounded(review) && review.reviewCurrent === 2 && review.writeLink === 2;
    const okChoose = bounded(choose) && choose.reviewCurrent === 2 && choose.writeLink === 2;
    return must('R1-1C-L1-successor-navigation', okWrite && okReview && okChoose,
      `write{navs=${write.all.length} writeCurrent=${write.writeCurrent} reviewAct=${write.reviewAct}} review{navs=${review.all.length} reviewCurrent=${review.reviewCurrent} writeLink=${review.writeLink}} choose{navs=${choose.all.length} reviewCurrent=${choose.reviewCurrent} writeLink=${choose.writeLink}} develop=${write.develop + review.develop + choose.develop}`);
  }));
  out.push(law('R1-1C-L2-review-entry-selects-nothing', () => {
    if (!s.enterReview) return unmounted('R1-1C-L2-review-entry-selects-nothing');
    const e = s.enterReview(null, LEDGER);
    const chosen = (e as { readingId?: string }).readingId;
    return must('R1-1C-L2-review-entry-selects-nothing', e.kind === 'choose' && chosen === undefined, `entry=${e.kind}${chosen ? ` selected=${chosen}` : ''}`);
  }));
  out.push(await alaw('R1-1C-L3-review-entry-never-commissions', async () => {
    if (!s.loadChoices) return unmounted('R1-1C-L3-review-entry-never-commissions');
    const p = choicePorts([]);
    const r = await s.loadChoices(MS, p);
    const forbidden = p.calls.filter((c) => !c.startsWith('list:'));
    const staticHit = /method:\s*['"]POST['"][^\n]*readings|commissionReading|requestDevelopmentalReading/.test(sources);
    return must('R1-1C-L3-review-entry-never-commissions', r.kind === 'choices' && r.readings.length === 0 && forbidden.length === 0 && !staticHit, `result=${r.kind} forbiddenCalls=${forbidden.join(',') || 'none'} staticPOST=${staticHit}`);
  }));
  out.push(await alaw('R1-1C-L4-chooser-does-not-aggregate', async () => {
    if (!s.loadChoices || !s.Chooser) return unmounted('R1-1C-L4-chooser-does-not-aggregate');
    const p = choicePorts();
    const r = await s.loadChoices(MS, p);
    const gets = p.calls.filter((c) => c.startsWith('get:'));
    const html = chooser(choicesState);
    const findings = count(html, /data-finding="/g) + count(html, /fs-reviewgrid|data-observation=/g);
    const merged = /data-review="ready"/.test(html) || OBSERVATION_PROSE.test(html);
    return must('R1-1C-L4-chooser-does-not-aggregate', r.kind === 'choices' && r.readings.length === 3 && gets.length === 0 && findings === 0 && !merged, `readings=${r.kind === 'choices' ? r.readings.length : 0} gets=${gets.length} findingsRendered=${findings} merged=${merged}`);
  }));
  out.push(law('R1-1C-L5-ordinary-write-zero-retrieval', () => {
    if (!s.shouldLoadChoices) return unmounted('R1-1C-L5-ordinary-write-zero-retrieval');
    const write = s.shouldLoadChoices({ reading: null, chooserOpen: false });
    const choose = s.shouldLoadChoices({ reading: null, chooserOpen: true });
    const selected = s.shouldLoadChoices({ reading: 'rd-b', chooserOpen: true });
    return must('R1-1C-L5-ordinary-write-zero-retrieval', !write && choose && !selected, `write=${write} choose=${choose} selectedWithChooser=${selected}`);
  }));
  out.push(law('R1-1C-L6-choice-is-a-location-never-a-mount', () => {
    if (!s.chooseReading) return unmounted('R1-1C-L6-choice-is-a-location-never-a-mount');
    const c = s.chooseReading('rd-b', LOC) as ChoiceOutcome & { view?: unknown };
    const exact = /(^|[?&])reading=rd-b(&|$)/.test(c.href ?? '') && /(^|[?&])m=ms-1(&|$)/.test(c.href ?? '') && /(^|[?&])s=d-2(&|$)/.test(c.href ?? '');
    const mountsOutsideLoader = /mapRealReview\(|kind:\s*['"]ready['"][^\n]*view:\s*(?!r\.view)/.test(sources) || /getReading\([^)]*\)[^\n]*(view|findings)/.test(sources);
    return must('R1-1C-L6-choice-is-a-location-never-a-mount', c.kind === 'navigate' && exact && c.view === undefined && !mountsOutsideLoader, `outcome=${c.kind} href=${c.href ?? 'none'} mountsOutsideLoader=${mountsOutsideLoader}`);
  }));
  out.push(law('R1-1C-L7-unavailable-never-substitutes', () => {
    const r = nav('review', LOC_R); if (!r) return unmounted('R1-1C-L7-unavailable-never-substitutes');
    const html = host({ studioNav: r, review: { kind: 'unavailable', readingId: 'rd-gone', gen: 1 }, chooser: choicesState });
    const unavailable = count(html, /data-review="unavailable"/g) === 1;
    const substitute = /data-review="ready"|data-review="loading"|data-reading-choice=|data-fallback|http-equiv="refresh"|data-review="choose"/.test(html);
    return must('R1-1C-L7-unavailable-never-substitutes', unavailable && !substitute, `unavailable=${unavailable} substitute=${substitute}`);
  }));
  out.push(law('R1-1C-L8-no-legacy-review-bridge', () => {
    const w = nav('write'); const r = nav('review', LOC_R); if (!w || !r) return unmounted('R1-1C-L8-no-legacy-review-bridge');
    const html = host({ studioNav: w }) + host({ studioNav: r, review: readyState }) + chooser(choicesState);
    const bridge = LEGACY.test(html) || LEGACY.test(sources);
    const parallelShell = /RebuildStudioClient|StudioModeBar|wsr-modebar/.test(sources) || /destinations=\{\[[^\]]*['"]develop['"]/.test(sources);
    return must('R1-1C-L8-no-legacy-review-bridge', !bridge && !parallelShell, `legacyBridge=${bridge} parallelShell=${parallelShell}`);
  }));
  out.push(law('R1-1C-L9-url-is-the-single-state-authority', () => {
    if (!s.studioMode || !s.locationForWrite) return unmounted('R1-1C-L9-url-is-the-single-state-authority');
    const a = s.studioMode({ reading: 'rd-b', chooserOpen: false }); const b = s.studioMode({ reading: 'rd-b', chooserOpen: true });
    const c = s.studioMode({ reading: null, chooserOpen: true }); const d = s.studioMode({ reading: null, chooserOpen: false });
    const href = s.locationForWrite(LOC_R.pathname, LOC_R.search);
    const derived = href === '/writers-studio/rebuild?m=ms-1&s=d-2';
    const secondStore = /localStorage|sessionStorage|useState<\s*StudioMode|useState<['"]write['"]/.test(sources);
    return must('R1-1C-L9-url-is-the-single-state-authority', a === 'review' && b === 'review' && c === 'review-choose' && d === 'write' && derived && !secondStore, `modes=${a},${b},${c},${d} writeHref=${href} secondStore=${secondStore}`);
  }));
  out.push(law('R1-1C-L10-write-return-non-mutating', () => {
    if (!s.navActionsFor) return unmounted('R1-1C-L10-write-return-non-mutating');
    const a = acts(); const actions = s.navActionsFor('review', LOC_R, a);
    const w = actions.write;
    if (!w || w.kind !== 'link') return must('R1-1C-L10-write-return-non-mutating', false, `write action=${w ? w.kind : 'absent'}`);
    w.onSelect?.({ preventDefault: () => {} });
    const onlyGo = a.calls.length === 1 && a.calls[0] === `go:${w.href}`;
    const dropsOnlyReading = w.href === '/writers-studio/rebuild?m=ms-1&s=d-2';
    const staticMutation = /method:\s*['"](POST|PUT|PATCH|DELETE)['"][^\n]*(write|nav|return)/i.test(sources);
    return must('R1-1C-L10-write-return-non-mutating', onlyGo && dropsOnlyReading && !staticMutation, `calls=${a.calls.join(',') || 'none'} href=${w.href} staticMutation=${staticMutation}`);
  }));
  out.push(law('R1-1C-L11-read-only-capabilities-unchanged', () => {
    const r = nav('review', LOC_R); if (!r || !s.capabilities) return unmounted('R1-1C-L11-read-only-capabilities-unchanged');
    const expected = ['askMaia', 'discuss', 'explore', 'commission', 'acknowledgeStale', 'ownObservation', 'navigate', 'facet'];
    const allFalse = expected.every((k) => s.capabilities![k] === false) && Object.values(s.capabilities).every((v) => v === false);
    const html = host({ studioNav: r, review: readyState }) + chooser(choicesState);
    const control = FORBIDDEN_CONTROLS.test(html);
    return must('R1-1C-L11-read-only-capabilities-unchanged', allFalse && !control, `allFalse=${allFalse} forbiddenControl=${control} caps=${JSON.stringify(s.capabilities)}`);
  }));
  out.push(law('R1-1C-L12-c1b-succession-explicit', () => {
    const current = s.c1bLawsSource ?? (existsSync(join(ROOT, C1B_LAWS)) ? readFileSync(join(ROOT, C1B_LAWS), 'utf8') : '');
    const predecessor = execSync(`git show ${FS1_BASE}:${C1B_LAWS}`, { cwd: ROOT, encoding: 'utf8' });
    const predecessorText = predecessor.includes(`navs.every((n) => n === 'data-nav="write"')`) && predecessor.includes('buttons === 0 && anchors === 0');
    const successorMarked = /R1-1C-L1-successor-navigation/.test(current) && current.includes(FS1_BASE.slice(0, 9)) && /C1B-L6-no-legacy-mode-bridge/.test(current) && /C1B-L5-no-dead-production-control/.test(current);
    const predecessorWitnessed = /git show 4dade9a68/.test(current);
    return must('R1-1C-L12-c1b-succession-explicit', predecessorText && successorMarked && predecessorWitnessed, `predecessorAtFS1=${predecessorText} successorMarked=${successorMarked} predecessorWitnessedInSuccessor=${predecessorWitnessed}`);
  }));
  out.push(law('R1-1C-L13-place-navigation-keeps-reading', () => {
    if (!s.locationForReading) return unmounted('R1-1C-L13-place-navigation-keeps-reading');
    const moved = s.placeAddress('/writers-studio/rebuild', '?m=ms-1&reading=rd-b&s=d-root', 'd-2');
    const kept = /(^|[?&])reading=rd-b(&|$)/.test(moved) && /(^|[?&])s=d-2(&|$)/.test(moved) && /(^|[?&])m=ms-1(&|$)/.test(moved);
    const sel = s.locationForReading('/writers-studio/rebuild', '?m=ms-1&s=d-2', 'rd-b');
    const keepsPlace = /(^|[?&])s=d-2(&|$)/.test(sel) && /(^|[?&])m=ms-1(&|$)/.test(sel) && /(^|[?&])reading=rd-b(&|$)/.test(sel);
    return must('R1-1C-L13-place-navigation-keeps-reading', kept && keepsPlace, `moved=${moved} selected=${sel}`);
  }));
  out.push(law('R1-1C-L14-direct-link-bypasses-chooser', () => {
    if (!s.enterReview || !s.studioMode) return unmounted('R1-1C-L14-direct-link-bypasses-chooser');
    const e = s.enterReview('rd-b', LEDGER);
    const mode = s.studioMode({ reading: 'rd-b', chooserOpen: true });
    const r = nav('review', LOC_R);
    const html = r ? host({ studioNav: r, review: readyState, chooser: choicesState }) : '';
    const noChooser = !/data-review="choose"|data-reading-choice=/.test(html) && /data-review="ready"/.test(html);
    return must('R1-1C-L14-direct-link-bypasses-chooser', e.kind === 'review' && e.readingId === 'rd-b' && mode === 'review' && noChooser, `entry=${e.kind} mode=${mode} readyWithoutChooser=${noChooser}`);
  }));
  out.push(law('R1-1C-L15-refreeze-carries-governing-laws', () => {
    const m = (s.manifest ?? (existsSync(join(ROOT, MANIFEST)) ? JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8')) : null)) as
      { act?: string; frozen?: Record<string, { blob: string }>; supersedes?: { manifest_sha256?: string; preserved_at?: string; superseded?: Record<string, { fs1_blob?: string; successor?: string }> } } | null;
    if (!m || !m.frozen) return must('R1-1C-L15-refreeze-carries-governing-laws', false, 'no freeze manifest');
    const frozen = m.frozen;
    const governing = [
      'tests/constitutional/writers-studio/flagship-r1-readonly/laws.ts', 'tests/constitutional/writers-studio/flagship-r1-readonly/candidates.ts', 'tests/constitutional/writers-studio/flagship-r1-readonly/matrix.ts',
      'tests/constitutional/writers-studio/flagship-r1-1a/laws.ts', 'tests/constitutional/writers-studio/flagship-r1-1a/candidates.tsx', 'tests/constitutional/writers-studio/flagship-r1-1a/matrix.ts',
      'tests/constitutional/writers-studio/flagship-r1-1b/laws.ts', 'tests/constitutional/writers-studio/flagship-r1-1b/candidates.tsx', 'tests/constitutional/writers-studio/flagship-r1-1b/matrix.ts',
      'tests/constitutional/writers-studio/flagship-r1-1c/laws.ts', 'tests/constitutional/writers-studio/flagship-r1-1c/candidates.tsx', 'tests/constitutional/writers-studio/flagship-r1-1c/matrix.ts',
      C1B_LAWS,
    ];
    const missing = governing.filter((p) => !frozen[p] || !/^[0-9a-f]{40}$/.test(frozen[p]!.blob));
    const succession = /FS2/.test(m.act ?? '') && m.supersedes?.manifest_sha256 === FS1_MANIFEST_SHA256 && m.supersedes.preserved_at === FS1_PRESERVED;
    const fs1Preserved = existsSync(join(ROOT, FS1_PRESERVED)) && createHash('sha256').update(readFileSync(join(ROOT, FS1_PRESERVED))).digest('hex') === FS1_MANIFEST_SHA256;
    const fs1 = fs1Preserved ? (JSON.parse(readFileSync(join(ROOT, FS1_PRESERVED), 'utf8')) as { frozen: Record<string, { blob: string }> }).frozen : {};
    const custody = Object.entries(fs1).filter(([p, e]) => !(frozen[p]?.blob === e.blob || (m.supersedes?.superseded?.[p]?.fs1_blob === e.blob && !!m.supersedes.superseded[p]?.successor)));
    const verifier = existsSync(join(ROOT, 'scripts/verify-flagship-freeze.ts')) ? readFileSync(join(ROOT, 'scripts/verify-flagship-freeze.ts'), 'utf8') : '';
    const pinned = !s.manifest ? verifier.includes(createHash('sha256').update(readFileSync(join(ROOT, MANIFEST))).digest('hex')) : true;
    return must('R1-1C-L15-refreeze-carries-governing-laws', missing.length === 0 && succession && fs1Preserved && custody.length === 0 && pinned,
      `missing=${missing.length ? missing.join(',') : 'none'} succession=${succession} fs1Preserved=${fs1Preserved} unaccountedFS1=${custody.map(([p]) => p).join(',') || 'none'} verifierPinned=${pinned}`);
  }));
  out.push(law('R1-1C-L16-successor-write-goldens', () => {
    const w = nav('write'); const c = nav('review-choose'); if (!w || !c) return unmounted('R1-1C-L16-successor-write-goldens');
    const g = (n: string) => { const f = join(ROOT, 'tests/constitutional/writers-studio/flagship-r1-1c/golden', `${n}.html`); return existsSync(f) ? readFileSync(f, 'utf8') : null; };
    const plain = host({ studioNav: w }) === g('write-plain');
    const held = host({ studioNav: w, held: { sectionId: 'd-2', start: 21, end: 29, text: 'far bank' }, editorialEnabled: true }) === g('write-held-editorial');
    const choose = host({ studioNav: c, chooser: choicesState }) === g('review-choose');
    const empty = host({ studioNav: c, chooser: { kind: 'choices', gen: 1, readings: [] } }) === g('review-choose-empty');
    return must('R1-1C-L16-successor-write-goldens', plain && held && choose && empty, `write-plain=${plain} write-held-editorial=${held} review-choose=${choose} review-choose-empty=${empty}`);
  }));
  out.push(law('R1-1C-L17-chooser-offers-only-what-the-ledger-holds', () => {
    if (!s.Chooser || !s.locationForReading) return unmounted('R1-1C-L17-chooser-offers-only-what-the-ledger-holds');
    const html = chooser(choicesState);
    const links = html.match(/<a[^>]*data-reading-choice="([^"]+)"[^>]*href="([^"]+)"/g) ?? [];
    const ids = links.map((l) => /data-reading-choice="([^"]+)"/.exec(l)![1]);
    const hrefsExact = links.every((l) => { const id = /data-reading-choice="([^"]+)"/.exec(l)![1]; const href = /href="([^"]+)"/.exec(l)![1]!.replace(/&amp;/g, '&'); return new RegExp(`(^|[?&])reading=${id}(&|$)`).test(href); });
    const noneRow = /data-reading-choice="rd-none"[^>]*data-reading-outcome="none"/.test(html) && !/<a[^>]*data-reading-choice="rd-none"/.test(html);
    const metadataOnly = !OBSERVATION_PROSE.test(html) && /2026-09-22/.test(html);
    const empty = chooser({ kind: 'choices', gen: 1, readings: [] });
    const emptyHonest = /data-review-empty/.test(empty) && !FORBIDDEN_CONTROLS.test(empty) && !/<button|<a /.test(empty);
    const preselected = /aria-current|data-selected|data-chosen|autofocus/.test(html);
    return must('R1-1C-L17-chooser-offers-only-what-the-ledger-holds', ids.length === 2 && ids.includes('rd-b') && ids.includes('rd-newest') && hrefsExact && noneRow && metadataOnly && emptyHonest && !preselected,
      `links=${ids.join(',')} hrefsExact=${hrefsExact} noneRowNotALink=${noneRow} metadataOnly=${metadataOnly} emptyHonest=${emptyHonest} preselected=${preselected}`);
  }));
  out.push(law('R1-1C-L18-late-ledger-cannot-attach-to-a-selection', () => {
    if (!s.attachChoices) return unmounted('R1-1C-L18-late-ledger-cannot-attach-to-a-selection');
    const same = s.attachChoices({ gen: 2 }, { gen: 2, chooserOpen: true, reading: null });
    const closed = s.attachChoices({ gen: 2 }, { gen: 2, chooserOpen: false, reading: null });
    const selected = s.attachChoices({ gen: 2 }, { gen: 2, chooserOpen: true, reading: 'rd-b' });
    const stale = s.attachChoices({ gen: 2 }, { gen: 3, chooserOpen: true, reading: null });
    return must('R1-1C-L18-late-ledger-cannot-attach-to-a-selection', same && !closed && !selected && !stale, `same=${same} closed=${closed} selected=${selected} staleGen=${stale}`);
  }));
  out.push(law('R1-1C-L19-inherited-flagship-law-green', () => {
    const r = spawnSync('npx', ['tsx', 'scripts/verify-flagship-freeze.ts'], { cwd: ROOT, encoding: 'utf8' });
    const mapper = execSync('git rev-parse 1fcf1ad0a:lib/writersStudio/studio/realReview.ts', { cwd: ROOT, encoding: 'utf8' }).trim() === execSync('git hash-object lib/writersStudio/studio/realReview.ts', { cwd: ROOT, encoding: 'utf8' }).trim();
    const loader = execSync('git rev-parse 1fcf1ad0a:app/writers-studio/rebuild/liveReview.ts', { cwd: ROOT, encoding: 'utf8' }).trim() === execSync('git hash-object app/writers-studio/rebuild/liveReview.ts', { cwd: ROOT, encoding: 'utf8' }).trim();
    const routes = ['app/api/sovereign/manuscripts/[id]/readings/route.ts', 'app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts'].every((f) => execSync(`git rev-parse 1fcf1ad0a:"${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim() === execSync(`git hash-object "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim());
    return must('R1-1C-L19-inherited-flagship-law-green', r.status === 0 && mapper && loader && routes, `freeze exit=${r.status} mapperIdentical=${mapper} r11bLoaderIdentical=${loader} readingRoutesIdentical=${routes}`);
  }));
  return out;
}
