/** R1-2 — reference subject + sixteen founder-named defeat candidates. ⛔ Disposable. ⛔ Never a seed. */
import * as React from 'react';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ReviewPresentation, ReviewRoom, READ_ONLY_REVIEW_CAPABILITIES } from '../../../../app/writers-studio/flagship/DevelopReview';
import type { Subject, ReturnContext, ReturnHints, ReturnTarget, Loc, ReturnActs } from './laws';

const ROOT = process.cwd();
const HOST_FILES = [
  'app/writers-studio/rebuild/FlagshipWriteHost.tsx', 'app/writers-studio/rebuild/reviewReturn.ts', 'app/writers-studio/rebuild/LiveReviewView.tsx',
  'app/writers-studio/flagship/DevelopReview.tsx', 'app/writers-studio/flagship/ReviewPanels.tsx', 'app/writers-studio/flagship/DevelopViews.tsx',
];
/* Resolved structurally so the suite types before AND after the act exists (known-bad RED first). */
type ReturnModule = Partial<Pick<Subject, 'returnTargetFor' | 'locationForReturn' | 'returnGesture' | 'navigationFor'>>;
type LiveModule = { LiveReviewView?: Subject['LiveView'] };
let ret: ReturnModule = {}; let liveMod: LiveModule = {};
try { ret = require('../../../../app/writers-studio/rebuild/reviewReturn') as ReturnModule; } catch { ret = {}; }
try { liveMod = require('../../../../app/writers-studio/rebuild/LiveReviewView') as LiveModule; } catch { liveMod = {}; }

const P = ReviewPresentation as unknown as NonNullable<Subject['Presentation']>;
export const REFERENCE: Subject = {
  name: 'REFERENCE',
  returnTargetFor: ret.returnTargetFor, locationForReturn: ret.locationForReturn, returnGesture: ret.returnGesture, navigationFor: ret.navigationFor,
  Presentation: P,
  Room: ReviewRoom as unknown as Subject['Room'],
  LiveView: liveMod.LiveReviewView,
  capabilities: READ_ONLY_REVIEW_CAPABILITIES as unknown as Readonly<Record<string, boolean>>,
  hostFiles: HOST_FILES,
};
const R = ret;
const inCtx = (ctx: ReturnContext, id: string | null | undefined) => !!id && ctx.paragraphs.some((p) => p.id === id);

/* D1 · positional return: the finding's displayed position picks the paragraph */
const D1: Subject = { ...REFERENCE, name: 'R1-2-D1-positional-return',
  returnTargetFor: (_a, ctx, h?: ReturnHints): ReturnTarget => { const p = ctx.paragraphs[h?.index ?? 0]; return p ? { kind: 'section', sectionId: p.id } : { kind: 'unaddressable' }; } };
/* D2 · nearest section: a missing address falls back to the nearest available paragraph */
const D2: Subject = { ...REFERENCE, name: 'R1-2-D2-nearest-section',
  returnTargetFor: (a, ctx, h) => { if (inCtx(ctx, a)) return { kind: 'section', sectionId: a! }; const p = ctx.paragraphs[Math.min(h?.index ?? 0, ctx.paragraphs.length - 1)] ?? ctx.paragraphs[0]; return p ? { kind: 'section', sectionId: p.id } : { kind: 'unaddressable' }; } };
/* D3 · current-focus fallback: the section the writer is focused on stands in for the finding's address */
const D3: Subject = { ...REFERENCE, name: 'R1-2-D3-current-focus-fallback',
  returnTargetFor: (a, ctx, h) => { const id = h?.focusSectionId ?? a; return inCtx(ctx, id) ? { kind: 'section', sectionId: id! } : { kind: 'unaddressable' }; } };
/* D4 · semantic lookup: the finding's text is searched for in the paragraphs */
const D4: Subject = { ...REFERENCE, name: 'R1-2-D4-semantic-lookup',
  returnTargetFor: (a, ctx, h) => { const hit = h?.text ? ctx.paragraphs.find((p) => (p.text ?? '').includes(h.text!)) : undefined; const id = hit?.id ?? a; return inCtx(ctx, id) ? { kind: 'section', sectionId: id! } : { kind: 'unaddressable' }; } };
/* D5 · reading preserved in Write: s= is set but reading= stays */
const D5: Subject = { ...REFERENCE, name: 'R1-2-D5-reading-preserved-in-write',
  locationForReturn: (loc: Loc, id) => { const q = new URLSearchParams(loc.search); q.set('s', id); return `${loc.pathname}?${q.toString()}`; } };
/* D6 · Work identity dropped: the return carries only the section */
const D6: Subject = { ...REFERENCE, name: 'R1-2-D6-work-identity-dropped',
  locationForReturn: (loc: Loc, id) => `${loc.pathname}?s=${encodeURIComponent(id)}` };
/* D7 · new URL vocabulary: a passage range rides along */
const D7: Subject = { ...REFERENCE, name: 'R1-2-D7-new-url-vocabulary',
  locationForReturn: (loc: Loc, id) => `${R.locationForReturn ? R.locationForReturn(loc, id) : `${loc.pathname}?m=ms-1&s=${id}`}&passage=${encodeURIComponent(id)}:0:8` };
/* D8 · held passage on arrival: navigation also holds a selection */
const D8: Subject = { ...REFERENCE, name: 'R1-2-D8-held-passage-on-arrival',
  returnGesture: (id, loc, act: ReturnActs & { hold?(): void }) => { const g = R.returnGesture ? R.returnGesture(id, loc, act) : { kind: 'navigate' as const, href: '' }; act.hold?.(); return { ...g, hold: { sectionId: id, start: 0, end: 8 } } as never; } };
/* D9 · member write on navigation: standing is recorded on the way out */
const D9: Subject = { ...REFERENCE, name: 'R1-2-D9-member-write-on-navigation',
  returnGesture: (id, loc, act: ReturnActs & { write?(): void }) => { act.write?.(); return R.returnGesture ? R.returnGesture(id, loc, act) : { kind: 'navigate', href: '' }; } };
/* D10 · cognition on navigation: MAIA is asked on the way out */
const D10: Subject = { ...REFERENCE, name: 'R1-2-D10-cognition-on-navigation',
  returnGesture: (id, loc, act: ReturnActs & { cognition?(): void }) => { act.cognition?.(); return R.returnGesture ? R.returnGesture(id, loc, act) : { kind: 'navigate', href: '' }; } };
/* D11 · capability widening: Discuss rides in with navigate */
const D11: Subject = { ...REFERENCE, name: 'R1-2-D11-capability-widening',
  capabilities: { ...(READ_ONLY_REVIEW_CAPABILITIES as unknown as Record<string, boolean>), navigate: true, discuss: true } };
/* D12 · finding button only: the same capability is withheld from the other addressable controls */
const D12: Subject = { ...REFERENCE, name: 'R1-2-D12-finding-button-only',
  navigationFor: (view, loc, act) => { const n = R.navigationFor ? R.navigationFor(view, loc, act) : { hrefFor: () => null, onGo: () => {} }; const findingIds = new Set(view.findings.map((f) => f.returnTo.sectionId)); return { ...n, hrefFor: (id) => (findingIds.has(id) ? n.hrefFor(id) : null) }; } };
/* D13 · map guesses: a cell without an exact address still navigates */
const D13: Subject = { ...REFERENCE, name: 'R1-2-D13-map-guesses',
  Presentation: (p) => <><P {...p} /><table><tbody><tr><td><a className="fs-cell" data-presence="1" data-return-to="" href="/writers-studio/rebuild?m=ms-1" aria-label="The River in §2: brief. Open §2." /></td></tr></tbody></table></> };
/* D14 · coverage guesses: What MAIA read navigates without a section address */
const D14: Subject = { ...REFERENCE, name: 'R1-2-D14-coverage-guesses',
  Presentation: (p) => <><P {...p} /><button type="button" className="fs-goto" data-return-to="coverage">What MAIA read →</button></> };
/* D15 · silent predecessor rewrite: the R1-1B-L18 / R1-1C-L11 sources lose their succession custody */
const r11b = join(ROOT, 'tests/constitutional/writers-studio/flagship-r1-1b/laws.ts'); const r11c = join(ROOT, 'tests/constitutional/writers-studio/flagship-r1-1c/laws.ts');
const scrub = (s: string) => s.replace(/R1-2 SUCCESSION/g, 'succession').replace(/git show e9f7ffcb5[^']*'/g, "'").replace(/e9f7ffcb5/g, '');
const D15: Subject = { ...REFERENCE, name: 'R1-2-D15-silent-predecessor-rewrite',
  r11bLawsSource: scrub(existsSync(r11b) ? readFileSync(r11b, 'utf8') : ''), r11cLawsSource: scrub(existsSync(r11c) ? readFileSync(r11c, 'utf8') : '') };
/* D16 · FS3 omits succession: the successor manifest quietly leaves the R1-2 laws unfrozen */
const manifestPath = join(ROOT, 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json');
const manifestNow = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as { frozen?: Record<string, unknown> }) : {};
const weaker = { ...manifestNow, frozen: { ...(manifestNow.frozen ?? {}) } };
delete weaker.frozen['tests/constitutional/writers-studio/flagship-r1-2/laws.ts'];
const D16: Subject = { ...REFERENCE, name: 'R1-2-D16-fs3-omits-succession', manifest: weaker };

export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16];
export const NAMED_KILL: Record<string, string> = {
  'R1-2-D1-positional-return': 'R1-2-L2-exact-durable-address',
  'R1-2-D2-nearest-section': 'R1-2-L3-unaddressable-is-absent-never-nearest',
  'R1-2-D3-current-focus-fallback': 'R1-2-L4-never-current-focus',
  'R1-2-D4-semantic-lookup': 'R1-2-L5-never-semantic',
  'R1-2-D5-reading-preserved-in-write': 'R1-2-L6-return-location-law',
  'R1-2-D6-work-identity-dropped': 'R1-2-L6-return-location-law',
  'R1-2-D7-new-url-vocabulary': 'R1-2-L7-no-new-url-vocabulary',
  'R1-2-D8-held-passage-on-arrival': 'R1-2-L8-gesture-is-a-location-only',
  'R1-2-D9-member-write-on-navigation': 'R1-2-L8-gesture-is-a-location-only',
  'R1-2-D10-cognition-on-navigation': 'R1-2-L8-gesture-is-a-location-only',
  'R1-2-D11-capability-widening': 'R1-2-L1-only-navigate-moved',
  'R1-2-D12-finding-button-only': 'R1-2-L9-every-addressable-class-navigates',
  'R1-2-D13-map-guesses': 'R1-2-L10-map-cells-only-with-an-address',
  'R1-2-D14-coverage-guesses': 'R1-2-L11-coverage-never-guesses',
  'R1-2-D15-silent-predecessor-rewrite': 'R1-2-L12-predecessor-succession-explicit',
  'R1-2-D16-fs3-omits-succession': 'R1-2-L13-fs3-carries-succession',
};
export const CLASSIFIED: Record<string, readonly string[]> = {
  /* IRREDUCIBLE. A resolver that answers by position, focus or text still answers when NO address exists —
     it cannot report "unaddressable" without ceasing to be the error it models (L3). */
  'R1-2-D1-positional-return': ['R1-2-L3-unaddressable-is-absent-never-nearest'],
  'R1-2-D3-current-focus-fallback': ['R1-2-L3-unaddressable-is-absent-never-nearest'],
  'R1-2-D4-semantic-lookup': ['R1-2-L3-unaddressable-is-absent-never-nearest'],
  /* IRREDUCIBLE. A new parameter is an extra key, so the exact-keys location law (L6) fails with it. */
  'R1-2-D7-new-url-vocabulary': ['R1-2-L6-return-location-law'],
  /* IRREDUCIBLE. Discuss present is a forbidden non-navigation control (L15). */
  'R1-2-D11-capability-widening': ['R1-2-L15-non-navigation-controls-still-absent'],
  /* IRREDUCIBLE. A guessed cell's target ('') is not in the context (L15); a coverage guess is a return BUTTON without a section (L15). */
  'R1-2-D13-map-guesses': ['R1-2-L15-non-navigation-controls-still-absent'],
  'R1-2-D14-coverage-guesses': ['R1-2-L15-non-navigation-controls-still-absent'],
};
