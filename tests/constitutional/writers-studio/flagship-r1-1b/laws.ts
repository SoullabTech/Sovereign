/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1B — LAWS over the live single-reading read-only Review mount.
 *
 * A subject is: the selection reader, the port-driven loader, the late-result binder, the context
 * binder, the place composer, the pure live Review view, the host view, and the host source files the
 * static laws scan. Before the mount lands the loader/view/binders are absent → every runtime law is
 * RED (the known-bad on b867abeba); the ordinary-Write golden, FS1 and mapper-identity laws pass.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { FlagshipWriteViewProps } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import type { ReviewView, LensId } from '../../../../app/writers-studio/flagship/DevelopReview';
import type { ReviewHostFacts } from '../../../../lib/writersStudio/studio/realReview';
import { CONTEXT, SECTION, ROOT_SECTION } from '../flagship-c1b/laws';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }
export interface PortReply { readonly ok: boolean; readonly status: number; readonly json: unknown }
export interface ReviewPorts {
  listReadings(manuscriptId: string): Promise<PortReply>;
  getReading(manuscriptId: string, readingId: string): Promise<PortReply>;
}
export type LoadResult =
  | { readonly kind: 'idle' }
  | { readonly kind: 'unavailable'; readonly detail?: string }
  | { readonly kind: 'ready'; readonly view: ReviewView; readonly sourceReadingId: string };
export type LiveState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly readingId: string; readonly gen: number }
  | { readonly kind: 'unavailable'; readonly readingId: string; readonly gen: number; readonly detail?: string }
  | { readonly kind: 'ready'; readonly readingId: string; readonly gen: number; readonly view: ReviewView };
export interface Subject {
  readonly name: string;
  readonly selectedReadingId?: (search: { get(n: string): string | null } | null) => string | null;
  readonly load?: (readingId: string | null, host: ReviewHostFacts, ports: ReviewPorts) => Promise<LoadResult>;
  readonly attach?: (pending: { gen: number; readingId: string }, current: { gen: number; readingId: string | null }) => boolean;
  readonly bindContext?: (view: ReviewView) => { ok: boolean };
  readonly placeAddress: (pathname: string, search: string, sectionId: string) => string;
  readonly LiveView?: (p: { state: LiveState; lens: LensId | 'all'; onLens: (l: LensId | 'all') => void }) => React.ReactElement | null;
  readonly HostView: (p: FlagshipWriteViewProps & { review?: LiveState }) => React.ReactElement;
  readonly hostFiles: readonly string[];
}

const ROOT = process.cwd();
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => { try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; } };
const alaw = async (id: string, body: () => Promise<LawResult>): Promise<LawResult> => { try { return await body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; } };
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const render = (el: React.ReactElement | null) => (el ? renderToStaticMarkup(el) : '');
const unmounted = (id: string) => must(id, false, 'UNMOUNTED — no live Review loader / view / binder exists');

/* ── durable-reading fixtures (shape per the R1-0 witness; ids in the DRAFT-SECTION space) ── */
const MS = 'ms-1'; const D1 = 'd-root'; const D2 = 'd-2';
const sha = (s: string) => `sha-${s.length}-${s.slice(0, 8)}`;
const TEXT2 = SECTION.body; const TEXT1 = ROOT_SECTION.body;
function reading(id: string, over: { manuscriptId?: string; listedUnder?: string; frozen2?: string; outcome?: 'reading' | 'none'; obsSection?: string } = {}) {
  const frozen2 = over.frozen2 ?? TEXT2; const outcome = over.outcome ?? 'reading'; const obsSection = over.obsSection ?? D2;
  const obs = outcome === 'reading' ? [{
    key: 'o1', observationId: `dobs_${id}`, admissionIndex: 0, basisFingerprint: sha(`b:${id}`),
    position: { sectionPosition: obsSection === D1 ? 0 : 1, codePointStart: 0 }, lens: 'continuity', phenomenon: 'recurrence',
    evidenceRefs: [{ kind: 'section', sectionId: obsSection }], observation: `Observation of ${id}.`,
    doesNotEstablish: ['author-intent'], structureDependency: { kind: 'independent' },
  }] : [];
  return {
    /** Where the ledger lists it (the route's own scoping); the payload's manuscriptId may disagree — the wrong-Work case. */
    listedUnder: over.listedUnder ?? over.manuscriptId ?? MS,
    id, manuscriptId: over.manuscriptId ?? MS, outcome,
    scope: { commissionedLens: 'continuity', bodyScope: [D1, D2], withStructure: false },
    readState: { draftId: 'dr-1', revisionNumber: 1, revisionDigest: sha(TEXT1 + frozen2), sectionTopology: [D1, D2],
      sections: { [D1]: { revisionNumber: 1, range: { start: 0, end: [...TEXT1].length }, digest: sha(TEXT1) }, [D2]: { revisionNumber: 1, range: { start: 0, end: [...frozen2].length }, digest: sha(frozen2) } } },
    coverage: { sections: { [D1]: 'body', [D2]: 'body' } },
    provenance: { frozenAt: `2026-09-22T12:00:00.000Z`, provider: 'witness', model: 'seeded', promptHash: 'x', readerVersion: 'DEVELOPMENTAL-READER-01' },
    observations: obs,
  };
}
const summaryOf = (r: ReturnType<typeof reading>) => ({ id: r.id, outcome: r.outcome, commissionedLens: 'continuity', frozenAt: r.provenance.frozenAt, observationCount: r.observations.length });
const stripListing = ({ listedUnder: _l, ...r }: ReturnType<typeof reading>) => r;
const assessment = (r: ReturnType<typeof reading>, state: 'current' | 'superseded' | 'unmeasured' = 'current') => ({
  reading: state === 'superseded' ? { state, moved: [D2] } : { state },
  observations: Object.fromEntries(r.observations.map((o) => [o.key, state === 'superseded' ? { state, moved: [D2] } : { state }])),
});
const payloadOf = (r: ReturnType<typeof reading>, state: 'current' | 'superseded' | 'unmeasured' = 'current') => ({
  reading: stripListing(r), assessment: assessment(r, state), sections: [{ id: D1, heading: ROOT_SECTION.heading }, { id: D2, heading: SECTION.heading }],
});
export const HOST: ReviewHostFacts = {
  manuscriptId: MS, work: 'The River Between', kind: 'novel', scope: { kind: 'work' },
  context: { chapterLabel: 'Chapter 1', chapterTitle: '', page: '', paragraphs: [{ id: D1, text: TEXT1 }, { id: D2, text: TEXT2 }] },
};
/** A port set over a member-owned ledger. Records every call. */
export function ports(opts: { readings?: ReturnType<typeof reading>[]; states?: Record<string, 'current' | 'superseded' | 'unmeasured'>; delay?: Record<string, () => Promise<void>> } = {}) {
  const calls: string[] = [];
  const rs = opts.readings ?? [reading('rd-current')];
  const p: ReviewPorts & { calls: string[]; commission: () => Promise<void>; cognition: () => Promise<void>; write: () => Promise<void> } = {
    calls,
    listReadings: async (m) => { calls.push(`list:${m}`); return { ok: true, status: 200, json: { readings: rs.filter((r) => r.listedUnder === m).map(summaryOf) } }; },
    getReading: async (m, id) => {
      calls.push(`get:${m}:${id}`); if (opts.delay?.[id]) await opts.delay[id]!();
      const r = rs.find((x) => x.id === id && x.listedUnder === m);
      return r ? { ok: true, status: 200, json: payloadOf(r, opts.states?.[id] ?? 'current') } : { ok: false, status: 404, json: { refusal: 'not_found' } };
    },
    commission: async () => { calls.push('POST:commission'); },
    cognition: async () => { calls.push('cognition'); },
    write: async () => { calls.push('write:standing'); },
  };
  return p;
}
const search = (q: Record<string, string>) => ({ get: (n: string) => (n in q ? q[n]! : null) });
/* R1-2 SUCCESSION (founder-authorized, 2026-09-23). PREDECESSOR, verified in L18 at the R1-1C head blob (git show e9f7ffcb5:…):
   this set also named `data-return-to=` and `fs-cell"[^>]*data-return-to` — the return controls were forbidden because read-only
   Review had navigate=false. SUCCESSOR: every NON-navigation control stays forbidden; navigation controls may exist only under
   navigate=true AND only as locations whose target is an exact durable section present in the mounted context (asserted in L18). */
const FORBIDDEN_CONTROLS = /Ask MAIA|data-action="discuss"|data-action="explore"|data-commission=|Read for this|Read again|Read this chapter again|Not now|Add your own observation|Keep with this passage|fs-facet|data-facet=|\bdisabled\b|aria-disabled/;
const FIXTURE_MARKERS = /kingfisher|Clara stood on the bank|carrying leaves, reflections/;

export async function runR11BLaws(s: Subject): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const sources = s.hostFiles.map((f) => (existsSync(join(ROOT, f)) ? strip(readFileSync(join(ROOT, f), 'utf8')) : '')).join('\n');
  const view = (p: Partial<FlagshipWriteViewProps> = {}, review?: LiveState) => render(React.createElement(s.HostView, {
    context: CONTEXT, workTitle: 'The River Between', workForm: null, focusId: 'd-2', held: null, onFocus: () => {}, onHold: () => {}, ...p, review,
  } as FlagshipWriteViewProps & { review?: LiveState }));
  const live = (state: LiveState) => (s.LiveView ? render(React.createElement(s.LiveView, { state, lens: 'all', onLens: () => {} })) : '');
  const readyState = async (): Promise<LiveState | null> => {
    if (!s.load) return null;
    const r = await s.load('rd-current', HOST, ports());
    return r.kind === 'ready' ? { kind: 'ready', readingId: 'rd-current', gen: 1, view: r.view } : null;
  };

  out.push(await alaw('R1-1B-L1-no-auto-newest', async () => {
    if (!s.selectedReadingId || !s.load) return unmounted('R1-1B-L1-no-auto-newest');
    const none = s.selectedReadingId(search({ m: MS })); const empty = s.selectedReadingId(search({ m: MS, reading: '' })); const nul = s.selectedReadingId(null);
    const p = ports({ readings: [reading('rd-old'), reading('rd-newest')] });
    const r = await s.load(null, HOST, p);
    return must('R1-1B-L1-no-auto-newest', none === null && empty === null && nul === null && r.kind === 'idle', `absent=${none} empty=${empty} null=${nul} loadWithoutSelection=${r.kind}`);
  }));
  out.push(await alaw('R1-1B-L2-no-fallback-to-first', async () => {
    if (!s.load) return unmounted('R1-1B-L2-no-fallback-to-first');
    const p = ports({ readings: [reading('rd-first'), reading('rd-second')] });
    const r = await s.load('rd-missing', HOST, p);
    const gets = p.calls.filter((c) => c.startsWith('get:'));
    return must('R1-1B-L2-no-fallback-to-first', r.kind === 'unavailable' && gets.length === 0, `result=${r.kind} getsAfterNotListed=${gets.join(',') || 'none'}`);
  }));
  out.push(await alaw('R1-1B-L3-no-aggregation', async () => {
    if (!s.load) return unmounted('R1-1B-L3-no-aggregation');
    const p = ports({ readings: [reading('rd-a'), reading('rd-b')] });
    const r = await s.load('rd-a', HOST, p);
    const ids = r.kind === 'ready' ? new Set(r.view.findings.map((f) => (f.provenance as { readingId?: string }).readingId)) : new Set<string>();
    const gets = p.calls.filter((c) => c.startsWith('get:'));
    return must('R1-1B-L3-no-aggregation', r.kind === 'ready' && ids.size === 1 && ids.has('rd-a') && r.sourceReadingId === 'rd-a' && gets.length === 1, `result=${r.kind} readingsInFindings=${[...ids].join(',')} gets=${gets.length}`);
  }));
  const noSideEffect = (id: string, token: string, re: RegExp) => alaw(id, async () => {
    if (!s.load) return unmounted(id);
    const p = ports({ readings: [reading('rd-stale')], states: { 'rd-stale': 'superseded' } });
    await s.load('rd-stale', HOST, p); await s.load('rd-missing', HOST, p);
    const hit = p.calls.some((c) => c.startsWith(token));
    const staticHit = re.test(sources);
    return must(id, !hit && !staticHit, `portCalled=${hit} staticToken=${staticHit}`);
  });
  out.push(await noSideEffect('R1-1B-L4-no-commission-on-open', 'POST', /method:\s*['"]POST['"][^\n]*readings|requestDevelopmentalReading|commissionReading|\/readings['"`][^\n]*POST/));
  out.push(await noSideEffect('R1-1B-L5-no-cognition-on-open', 'cognition', /runStructured|lib\/ai\/|developmentalReading\/read|readChapter|Anthropic|ollama|maiaService/i));
  out.push(await noSideEffect('R1-1B-L6-no-member-write-on-open', 'write', /standing|\/keeps|observation-standing|member_notes|method:\s*['"](PUT|DELETE|PATCH)['"]/));
  out.push(await alaw('R1-1B-L7-nonready-never-mounts', async () => {
    if (!s.load || !s.LiveView) return unmounted('R1-1B-L7-nonready-never-mounts');
    const stale = await s.load('rd-stale', HOST, ports({ readings: [reading('rd-stale')], states: { 'rd-stale': 'superseded' } }));
    const unmeasured = await s.load('rd-u', HOST, ports({ readings: [reading('rd-u')], states: { 'rd-u': 'unmeasured' } }));
    const html = live({ kind: 'unavailable', readingId: 'rd-stale', gen: 1 }) + live({ kind: 'loading', readingId: 'rd-x', gen: 1 });
    const mounted = /data-finding=|fs-reviewgrid|aria-label="MAIA, at this passage"/.test(html);
    return must('R1-1B-L7-nonready-never-mounts', stale.kind === 'unavailable' && unmeasured.kind === 'unavailable' && !mounted, `stale=${stale.kind} unmeasured=${unmeasured.kind} presentationOnNonReady=${mounted}`);
  }));
  out.push(await alaw('R1-1B-L8-wrong-work-never-mounts', async () => {
    if (!s.load) return unmounted('R1-1B-L8-wrong-work-never-mounts');
    /* Listed under the host Work, but the durable payload names another manuscript. */
    const p = ports({ readings: [reading('rd-other', { manuscriptId: 'ms-2', listedUnder: MS })] });
    const r = await s.load('rd-other', HOST, p);
    return must('R1-1B-L8-wrong-work-never-mounts', r.kind === 'unavailable', `result=${r.kind}`);
  }));
  out.push(law('R1-1B-L9-unavailable-discloses-nothing', () => {
    if (!s.LiveView) return unmounted('R1-1B-L9-unavailable-discloses-nothing');
    const a = live({ kind: 'unavailable', readingId: 'rd-x', gen: 1, detail: 'reading_not_listed' });
    const b = live({ kind: 'unavailable', readingId: 'rd-y', gen: 1, detail: 'wrong_work' });
    const leak = /not_listed|wrong_work|another member|another Work|not found|unowned|malformed|superseded|refus/i.test(a + b) || /rd-x|rd-y/.test(a + b);
    return must('R1-1B-L9-unavailable-discloses-nothing', a === b && !leak && a.length > 0 && /data-review="unavailable"/.test(a), `identicalAcrossReasons=${a === b} leak=${leak}`);
  }));
  /* R1-1C SUCCESSION (founder-authorized, 2026-09-23). PREDECESSOR, verified below at the R1-1B closure blob (git show 1fcf1ad0a:…):
     `R1-1B-L10-no-visible-review-navigation` — navs === 2, all write, no data-nav="review" in markup or source — the C1B-L6
     regime at route scope, under which R1-1B mounted Review as URL state. SUCCESSOR (renamed so the name no longer asserts
     what R1-1C permits): what R1-1C did not change survives here — a mounted reading is read-only, Review's own entry is the
     flagship destination (R1-1C-L1), and NO LEGACY Review bridge (/writers-studio/review) exists in markup or source. */
  out.push(await alaw('R1-1B-L10-no-legacy-review-navigation', async () => {
    const ready = await readyState();
    if (!ready) return unmounted('R1-1B-L10-no-legacy-review-navigation');
    const html = view({}, ready);
    const navs = (html.match(/data-nav="[^"]*"/g) ?? []); const write = navs.filter((n) => n === 'data-nav="write"').length; const review = navs.filter((n) => n === 'data-nav="review"').length;
    const legacy = /href="\/writers-studio\/review/.test(html) || /\/writers-studio\/review(["'?/#]|$)/.test(sources);
    const predecessor = execSync('git show 1fcf1ad0a:tests/constitutional/writers-studio/flagship-r1-1b/laws.ts', { cwd: ROOT, encoding: 'utf8' }).includes('navs.length === 2 && write === 2 && !reviewNav && !staticNav');
    return must('R1-1B-L10-no-legacy-review-navigation', navs.length === 4 && write === 2 && review === 2 && !legacy && predecessor && /data-review="ready"/.test(html), `navs=${navs.length} write=${write} review=${review} legacyBridge=${legacy} predecessorWitnessedAt1fcf1ad0a=${predecessor} mounted=${/data-review="ready"/.test(html)}`);
  }));
  out.push(law('R1-1B-L11-reading-param-survives-place-rewrite', () => {
    const next = s.placeAddress('/writers-studio/rebuild', '?m=ms-1&reading=rd-current&s=d-root', 'd-2');
    const kept = /(^|[?&])reading=rd-current(&|$)/.test(next) && /(^|[?&])s=d-2(&|$)/.test(next) && /(^|[?&])m=ms-1(&|$)/.test(next);
    const oneComposer = !/new URLSearchParams\([^)]*\)\.toString\(\)|history\.(push|replace)State\(/.test(strip(existsSync(join(ROOT, 'app/writers-studio/rebuild/FlagshipWriteHost.tsx')) ? readFileSync(join(ROOT, 'app/writers-studio/rebuild/FlagshipWriteHost.tsx'), 'utf8') : ''));
    return must('R1-1B-L11-reading-param-survives-place-rewrite', kept && oneComposer, `next=${next} singleComposer=${oneComposer}`);
  }));
  out.push(law('R1-1B-L12-late-result-cannot-migrate', () => {
    if (!s.attach) return unmounted('R1-1B-L12-late-result-cannot-migrate');
    const same = s.attach({ gen: 2, readingId: 'A' }, { gen: 2, readingId: 'A' });
    const switched = s.attach({ gen: 2, readingId: 'A' }, { gen: 3, readingId: 'B' });
    const sameGenOther = s.attach({ gen: 2, readingId: 'A' }, { gen: 2, readingId: 'B' });
    const cleared = s.attach({ gen: 2, readingId: 'A' }, { gen: 2, readingId: null });
    const backToA = s.attach({ gen: 2, readingId: 'A' }, { gen: 4, readingId: 'A' });
    return must('R1-1B-L12-late-result-cannot-migrate', same && !switched && !sameGenOther && !cleared && !backToA, `same=${same} switched=${switched} sameGenOther=${sameGenOther} cleared=${cleared} staleGenSameId=${backToA}`);
  }));
  out.push(await alaw('R1-1B-L13-no-fake-context', async () => {
    if (!s.bindContext || !s.load) return unmounted('R1-1B-L13-no-fake-context');
    const bound = await s.load('rd-current', HOST, ports());
    const viewOk = bound.kind === 'ready' ? s.bindContext(bound.view).ok : false;
    const gone: ReviewHostFacts = { ...HOST, context: { ...HOST.context, paragraphs: [{ id: D1, text: TEXT1 }, { id: 'd-elsewhere', text: 'Other prose.' }] } };
    const missing = await s.load('rd-current', gone, ports());
    const viewMissing = missing.kind === 'ready' ? s.bindContext(missing.view).ok : false;
    return must('R1-1B-L13-no-fake-context', viewOk && missing.kind === 'unavailable' && !viewMissing, `boundWhenPresent=${viewOk} resultWhenAbsent=${missing.kind}`);
  }));
  out.push(law('R1-1B-L14-no-fixture-fallback', () => {
    if (!s.LiveView) return unmounted('R1-1B-L14-no-fixture-fallback');
    const html = live({ kind: 'unavailable', readingId: 'rd-x', gen: 1 }) + live({ kind: 'loading', readingId: 'rd-x', gen: 1 });
    const staticFixture = /witness\/flagship\/fixtures|\bREVIEW\b\s*\}|from ['"][^'"]*fixtures['"]/.test(sources);
    return must('R1-1B-L14-no-fixture-fallback', !FIXTURE_MARKERS.test(html) && !staticFixture, `fixtureProseRendered=${FIXTURE_MARKERS.test(html)} fixtureImported=${staticFixture}`);
  }));
  out.push(await alaw('R1-1B-L15-no-reading-gets-without-selection', async () => {
    if (!s.load) return unmounted('R1-1B-L15-no-reading-gets-without-selection');
    const p = ports(); const r = await s.load(null, HOST, p);
    return must('R1-1B-L15-no-reading-gets-without-selection', r.kind === 'idle' && p.calls.length === 0, `calls=${p.calls.join(',') || 'none'}`);
  }));
  /* R1-1C SUCCESSION (founder-authorized, 2026-09-23). PREDECESSOR: the two R1-1B goldens captured the pre-Review-navigation
     Write composition; they stay in this directory BYTE-IDENTICAL to their 1fcf1ad0a blobs (verified below) as historical
     custody — never regenerated, never deleted. SUCCESSOR: ordinary Write is compared to the R1-1C successor goldens of the
     same two states (flagship-r1-1c/golden/write-plain · write-held-editorial), which differ from the predecessor only by the
     Review destination the shell now names. */
  out.push(law('R1-1B-L16-ordinary-write-unchanged', () => {
    const plain = view();
    const held = view({ held: { sectionId: 'd-2', start: 21, end: 29, text: 'far bank' }, editorialEnabled: true });
    const g = (dir: string, n: string) => readFileSync(join(ROOT, `tests/constitutional/writers-studio/${dir}/golden`, `${n}.html`), 'utf8');
    const custody = ['write-plain', 'write-held-editorial'].every((n) => execSync(`git rev-parse 1fcf1ad0a:tests/constitutional/writers-studio/flagship-r1-1b/golden/${n}.html`, { cwd: ROOT, encoding: 'utf8' }).trim() === execSync(`git hash-object tests/constitutional/writers-studio/flagship-r1-1b/golden/${n}.html`, { cwd: ROOT, encoding: 'utf8' }).trim());
    const same = plain === g('flagship-r1-1c', 'write-plain') && held === g('flagship-r1-1c', 'write-held-editorial');
    return must('R1-1B-L16-ordinary-write-unchanged', same && custody, `successorGoldensIdentical=${same} predecessorGoldensCustody=${custody}`);
  }));
  out.push(law('R1-1B-L17-fs1-and-mapper-untouched', () => {
    const r = spawnSync('npx', ['tsx', 'scripts/verify-flagship-freeze.ts'], { cwd: ROOT, encoding: 'utf8' });
    const mapper = execSync('git rev-parse b867abeba:lib/writersStudio/studio/realReview.ts', { cwd: ROOT, encoding: 'utf8' }).trim() === execSync('git hash-object lib/writersStudio/studio/realReview.ts', { cwd: ROOT, encoding: 'utf8' }).trim();
    return must('R1-1B-L17-fs1-and-mapper-untouched', r.status === 0 && mapper, `freeze exit=${r.status} mapperIdentical=${mapper}`);
  }));
  out.push(await alaw('R1-1B-L18-ready-mounts-read-only-presentation', async () => {
    const ready = await readyState();
    if (!ready || !s.LiveView) return unmounted('R1-1B-L18-ready-mounts-read-only-presentation');
    const html = live(ready);
    const findings = (html.match(/data-finding="/g) ?? []).length;
    /* R1-2 SUCCESSION: the live view is rendered here WITHOUT a host navigation, so it must withhold navigate — no return control at all;
       with a host navigation (R1-2-L15) every return control is an <a href> to an exact address in the mounted context. */
    const returnControls = (html.match(/data-return-to=/g) ?? []).length;
    const predecessor = execSync('git show e9f7ffcb5:tests/constitutional/writers-studio/flagship-r1-1b/laws.ts', { cwd: ROOT, encoding: 'utf8' }).includes('data-return-to=|fs-cell');
    return must('R1-1B-L18-ready-mounts-read-only-presentation', findings === 1 && /data-review="ready"/.test(html) && !FORBIDDEN_CONTROLS.test(html) && returnControls === 0 && predecessor && /role="tab"/.test(html), `findings=${findings} forbiddenControl=${FORBIDDEN_CONTROLS.test(html)} returnControlsWithoutNavigation=${returnControls} predecessorWitnessedAtR11C=${predecessor}`);
  }));
  return out;
}
