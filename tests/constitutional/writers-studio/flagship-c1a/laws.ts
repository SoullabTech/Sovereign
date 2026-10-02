/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1A — LAWS.
 *
 * Every law observes a SUBJECT: the frame (component + source file), a host
 * composition that inserts the live authorship substrate, the shell, the CSS
 * text, the adapters, and the controlled room. The reference subject is the
 * real code; each defeat candidate replaces exactly one member.
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { WriteFrameProps } from '../../../../app/writers-studio/flagship/WriteFrame';
import type { StudioShell } from '../../../../app/writers-studio/flagship/StudioChrome';
import type { NavDestination } from '../../../../app/writers-studio/flagship/flagshipTokens';
import type { ChapterSpan, RebuildSection } from '../../../../lib/writersStudio/rebuild/model';
import { WRITE_STATE_IDS, renderWriteStates, type RoomLike } from './renderStates';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }

export type FrameLike = (props: WriteFrameProps) => React.ReactElement;
export type ShellLike = typeof StudioShell;
export interface AdapterLike {
  toWritePlace(i: { workTitle: string; section: RebuildSection | null; span: ChapterSpan | null }): object;
  toWriteHeading(span: ChapterSpan | null): object;
  toWriteFoot(i: { span: ChapterSpan | null; bodies: readonly string[] }): object;
}

export interface Subject {
  readonly name: string;
  readonly Frame: FrameLike;
  /** repo-relative path of the frame's source — the static laws read it */
  readonly frameFile: string;
  /** a host composition: the frame around the LIVE authorship substrate */
  readonly host: (Frame: FrameLike) => React.ReactElement;
  readonly Shell: ShellLike;
  readonly css: string;
  readonly adapter: AdapterLike;
  readonly Room: RoomLike;
}

const ROOT = process.cwd();
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => {
  try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; }
};
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

export const SECTION: RebuildSection = {
  draftSectionId: 'draft-1', sourceSectionId: null, position: 0,
  heading: 'The river at dusk', headingDepth: 2, headingSignal: 'markdown',
  body: 'The water held the last of the light.', editable: true,
};
export const SPAN: ChapterSpan = {
  root: { ...SECTION, draftSectionId: 'draft-0', heading: 'Chapter One', headingDepth: 1, headingSignal: 'chapter', body: 'Opening.' },
  sections: [SECTION],
};
const PERSISTENCE = /\bfetch\(|apiFetch|useSectionWriting|makeSectionSave|sectionSaveClient|localStorage|sessionStorage|writeStateClient|\/api\//;
const STATE = /\buse(State|Reducer|Ref|Effect|LayoutEffect|Context|Memo|Callback)\b/;
const IDENTITY = /randomUUID|crypto\.|nanoid|uuid/;

function stringsIn(v: unknown, acc: string[] = []): string[] {
  if (typeof v === 'string') acc.push(v);
  else if (Array.isArray(v)) v.forEach((x) => stringsIn(x, acc));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => stringsIn(x, acc));
  return acc;
}
function keysIn(v: unknown, acc: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => keysIn(x, acc));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { acc.push(k); keysIn(x, acc); }
  return acc;
}

export function runC1ALaws(s: Subject): LawResult[] {
  const out: LawResult[] = [];
  const frameSrc = strip(readFileSync(join(ROOT, s.frameFile), 'utf8'));

  // L1 — the host contract: the live authorship substrate renders INSIDE the manuscript geometry
  out.push(law('C1A-L1-host-body-is-live-authorship', () => {
    const html = renderToStaticMarkup(s.host(s.Frame));
    const article = html.match(/<article class="fs-ms" data-manuscript="true">([\s\S]*?)<\/article>/);
    const inside = article?.[1] ?? '';
    const live = /data-authored-body="draft-1"/.test(inside) && /role="textbox"/.test(inside);
    const staticParas = (inside.match(/class="fs-p"/g) ?? []).length;
    return must('C1A-L1-host-body-is-live-authorship', live && staticParas === 0,
      `authoredBodyInside=${live} staticParagraphs=${staticParas}`);
  }));

  // L2 — the frame persists nothing and fetches nothing
  out.push(law('C1A-L2-frame-persists-nothing', () => {
    const hit = frameSrc.match(PERSISTENCE);
    return must('C1A-L2-frame-persists-nothing', !hit, hit ? `frame source carries ${hit[0]}` : 'no persistence token');
  }));

  // L3 — no forced dead control: a frame given no actions renders no control of its own
  out.push(law('C1A-L3-no-forced-dead-control', () => {
    const html = renderToStaticMarkup(s.Frame({ place: { work: 'W' }, children: React.createElement('div', { 'data-body': 'x' }) }));
    const buttons = (html.match(/<button/g) ?? []).length;
    const anchors = (html.match(/<a /g) ?? []).length;
    const srcButtons = /<button/.test(frameSrc);
    return must('C1A-L3-no-forced-dead-control', buttons === 0 && anchors === 0 && !srcButtons,
      `renderedButtons=${buttons} anchors=${anchors} frameSourceHasButton=${srcButtons}`);
  }));

  // L4 — no legacy nav bridge, and a smaller destination set is honoured
  out.push(law('C1A-L4-no-legacy-nav-bridge', () => {
    const one: readonly NavDestination[] = ['write'];
    const html = renderToStaticMarkup(React.createElement(s.Shell, {
      current: 'write', project: { workTitle: 'W', workKind: 'K' }, member: { initials: 'A', name: 'A', org: 'O' },
      destinations: one, children: React.createElement('div'),
    }));
    const navs = (html.match(/data-nav="/g) ?? []).length;
    const legacy = /\/writers-studio\/(develop|review|rebuild)/.test(html) || /href=/.test(html);
    const full = renderToStaticMarkup(React.createElement(s.Shell, {
      current: 'write', project: { workTitle: 'W', workKind: 'K' }, member: { initials: 'A', name: 'A', org: 'O' },
      children: React.createElement('div'),
    }));
    const fullNavs = (full.match(/data-nav="/g) ?? []).length;
    /* ⚠️ FIRST RUN: a bridge that links only Develop/Review survived a check that
       rendered ['write'] alone. The legacy scan runs over BOTH renders. */
    const legacyFull = /\/writers-studio\/(develop|review|rebuild)/.test(full) || /href=/.test(full);
    return must('C1A-L4-no-legacy-nav-bridge', navs === 2 && !legacy && !legacyFull && fullNavs === 6,
      `navsWithOneDestination=${navs} (rail+mobile) default=${fullNavs} legacyLink=${legacy || legacyFull}`);
  }));

  // L5 — tokens declared once, on a root that carries no navigation geometry
  out.push(law('C1A-L5-tokens-declared-once-on-token-root', () => {
    const count = (s.css.match(/--ground-work:/g) ?? []).length;
    const idx = s.css.indexOf('--ground-work:');
    const open = s.css.lastIndexOf('{', idx);
    const close = s.css.indexOf('}', idx);
    const selector = s.css.slice(s.css.lastIndexOf('}', open) + 1, open).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const body = s.css.slice(open, close);
    const onTokenRoot = /\.fs-tokens/.test(selector);
    const carriesGrid = /display\s*:\s*grid|grid-template-columns/.test(body);
    const rootGeometry = /\.fs-root\s*\{[^}]*grid-template-columns/.test(s.css);
    return must('C1A-L5-tokens-declared-once-on-token-root', count === 1 && onTokenRoot && !carriesGrid && rootGeometry,
      `declarations=${count} selector="${selector.replace(/\s+/g, ' ')}" tokenRuleHasGrid=${carriesGrid} rootHasGeometry=${rootGeometry}`);
  }));

  // L6 — adapters conserve truth: every output string is an input string; no fabricated keys
  out.push(law('C1A-L6-adapter-conserves-truth', () => {
    const untitled: RebuildSection = { ...SECTION, heading: null };
    const cases = [
      { out: s.adapter.toWritePlace({ workTitle: 'The River Between', section: SECTION, span: SPAN }), inputs: ['The River Between', SECTION.heading!, SPAN.root.heading!] },
      { out: s.adapter.toWritePlace({ workTitle: 'The River Between', section: untitled, span: null }), inputs: ['The River Between'] },
      { out: s.adapter.toWriteHeading(null), inputs: [] },
      { out: s.adapter.toWriteHeading(SPAN), inputs: [SPAN.root.heading!] },
      { out: s.adapter.toWriteFoot({ span: null, bodies: [SECTION.body] }), inputs: [] },
    ];
    const bad: string[] = [];
    for (const c of cases) {
      for (const str of stringsIn(c.out)) if (!c.inputs.includes(str)) bad.push(`manufactured "${str}"`);
      for (const k of keysIn(c.out)) if (/^(kind|epigraph|label|opening|id|observationId)$/.test(k)) bad.push(`fabricated key ${k}`);
    }
    return must('C1A-L6-adapter-conserves-truth', bad.length === 0, bad.length ? bad.join('; ') : 'every output string is an input string');
  }));

  // L7 — the frame owns no state and mints no identity
  out.push(law('C1A-L7-frame-owns-no-state', () => {
    const st = frameSrc.match(STATE); const idm = frameSrc.match(IDENTITY);
    return must('C1A-L7-frame-owns-no-state', !st && !idm, st ? `state hook ${st[0]}` : idm ? `identity ${idm[0]}` : 'no hooks, no minting');
  }));

  // L8 — the controlled Write witness is byte-identical to the accepted golden
  out.push(law('C1A-L8-controlled-witness-unchanged', () => {
    const now = renderWriteStates(s.Room);
    const diff: string[] = [];
    for (const id of WRITE_STATE_IDS) {
      const golden = readFileSync(join(ROOT, 'tests/constitutional/writers-studio/flagship-c1a/golden', `${id}.html`), 'utf8');
      if (golden !== now[id]) diff.push(id);
    }
    return must('C1A-L8-controlled-witness-unchanged', diff.length === 0, diff.length ? `markup changed: ${diff.join(', ')}` : `${WRITE_STATE_IDS.length}/6 states byte-identical`);
  }));

  // L9 — the authorship substrate is untouched (blob identity vs canonical)
  /* IR1 (founder ruling, 2026-09-23): `RebuildStudioClient.tsx` is the LEGACY HOST — presentation
     + client orchestration, not writing authority (C0). E1 lawfully changed it. It is no longer in
     this standing blob set; the historical record that THIS act did not modify it stands unchanged.
     Record: docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_IR1_LEGACY_HOST_PIN_RECONCILIATION_2026-09-23.md */
  out.push(law('C1A-L9-authorship-substrate-untouched', () => {
    const files = ['app/writers-studio/rebuild/RebuildAuthoredBody.tsx', 'app/writers-studio/rebuild/RebuildWritingBoundary.tsx', 'lib/writersStudio/useSectionWriting.ts', 'lib/writersStudio/sectionSaveClient.ts'];
    const moved = files.filter((f) => {
      const canon = execSync(`git rev-parse b23ae2d7f:${f}`, { cwd: ROOT, encoding: 'utf8' }).trim();
      const now = execSync(`git hash-object ${f}`, { cwd: ROOT, encoding: 'utf8' }).trim();
      return canon !== now;
    });
    return must('C1A-L9-authorship-substrate-untouched', moved.length === 0, moved.length ? `moved: ${moved.join(', ')}` : `${files.length} files blob-identical to canonical`);
  }));

  return out;
}
