/** C1A source/render witness — binds the abstract matrix to the real seam. */
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WriteFrame } from '../../../../../app/writers-studio/flagship/WriteFrame';
import {
  FlagshipVisualRoot, StudioShell,
} from '../../../../../app/writers-studio/flagship/StudioChrome';

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, 'utf8');
const frameSource = read('app/writers-studio/flagship/WriteFrame.tsx');
const roomSource = read('app/writers-studio/flagship/WriteRoom.tsx');
const chromeSource = read('app/writers-studio/flagship/StudioChrome.tsx');
const css = read('app/writers-studio/flagship/flagship.css');

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`C1A source witness: ${message}`);
}

for (const forbidden of [
  'fetch(', 'apiFetch', 'useState', 'useEffect', 'useSectionWriting',
  'makeSectionSave', 'localStorage', 'sessionStorage', 'RebuildWritingBoundary',
]) {
  assert(!frameSource.includes(forbidden), `WriteFrame owns forbidden authority: ${forbidden}`);
}
assert(frameSource.includes('readonly manuscript: React.ReactNode'), 'manuscript slot absent');
assert(frameSource.includes('readonly actions?: React.ReactNode'), 'host action slot absent');
assert(frameSource.includes('readonly contextualLayer?: React.ReactNode'), 'contextual layer slot absent');
assert(frameSource.includes('readonly footer?: React.ReactNode'), 'truthful status/footer slot absent');
assert(roomSource.includes("import { WriteFrame } from './WriteFrame'"), 'WriteRoom does not compose WriteFrame');
assert(!roomSource.includes('<div className="fs-stage" data-stage="write">'), 'WriteRoom still owns stage geometry');

const frameHtml = renderToStaticMarkup(React.createElement(WriteFrame, {
  work: 'Explicit Work', chapter: 'Chapter 1', place: '§ 1', saved: 'Unsaved',
  actions: React.createElement('button', { 'data-live-action': 'true' }, 'Live action'),
  manuscript: React.createElement('div', { 'data-live-authored-body': 'true' }, 'Authored body'),
  contextualLayer: React.createElement('aside', { 'data-live-context': 'true' }, 'Context'),
  footer: React.createElement('span', { 'data-live-status': 'true' }, 'Status'),
}));

for (const marker of [
  'data-write-frame="true"', 'data-manuscript-slot="true"',
  'data-live-authored-body="true"', 'data-live-action="true"',
  'data-live-context="true"', 'data-live-status="true"',
]) assert(frameHtml.includes(marker), `rendered frame missing ${marker}`);
assert(frameHtml.indexOf('data-live-authored-body') < frameHtml.indexOf('data-live-context'),
  'contextual layer precedes manuscript slot');
const themed = renderToStaticMarkup(React.createElement(
  FlagshipVisualRoot,
  { children: React.createElement('div', { 'data-themed-child': 'true' }) },
));
assert(themed.includes('class="fs-theme"'), 'hostable semantic token root absent');
assert(!themed.includes('class="fs-root"'), 'token root forces shell grid geometry');

const project = { workTitle: 'The Work', workKind: 'Novel · 10 words' };
const member = { initials: 'KN', name: 'Kelly', org: 'Soullab' };
const fullShell = renderToStaticMarkup(React.createElement(
  StudioShell,
  { current: 'write', project, member, children: React.createElement('div', null, 'body') },
));
for (const destination of ['write', 'develop', 'review']) {
  assert(fullShell.includes(`data-nav="${destination}"`), `controlled reference lost ${destination}`);
}
assert(fullShell.includes('<button'), 'controlled reference no longer preserves control geometry');

const writeOnly = renderToStaticMarkup(React.createElement(
  StudioShell,
  {
    current: 'write', destinations: ['write'], inertNavigation: 'labels',
    project: { workTitle: 'The Work' }, member: { initials: 'K', name: 'Kelly' },
    children: React.createElement('div', null, 'body'),
  },
));
assert(writeOnly.includes('data-nav="write"'), 'write-only shell lost Write');
assert(!writeOnly.includes('data-nav="develop"'), 'write-only shell fabricated Develop');
assert(!writeOnly.includes('data-nav="review"'), 'write-only shell fabricated Review');
assert(writeOnly.includes('data-clickable="false"'), 'inert live destination rendered as a control');
assert(!writeOnly.includes('<button'), 'write-only label mode contains a dead button');
assert(!writeOnly.includes('fs-railworkkind'), 'absent Work kind was fabricated');
assert(!writeOnly.includes('<small>'), 'absent member organization was fabricated');

assert(chromeSource.includes('readonly workKind?: string'), 'Work kind is still mandatory');
assert(chromeSource.includes('readonly org?: string'), 'member organization is still mandatory');
assert(!chromeSource.includes('/writers-studio/develop'), 'legacy Develop route bridged into shell');
assert(!chromeSource.includes('/writers-studio/review'), 'legacy Review route bridged into shell');

const tokenCount = css.split('--ground-work:').length - 1;
assert(tokenCount === 1, `semantic tokens duplicated: --ground-work appears ${tokenCount} times`);
assert(css.includes('.fs-theme,\n.fs-root{'), 'semantic tokens are not shared from one source');
assert(css.includes('.fs-root{\n  display:grid;grid-template-columns:'), 'full shell grid geometry missing');
const sharedStart = css.indexOf('.fs-theme,\n.fs-root{');
const gridStart = css.indexOf('.fs-root{\n  display:grid;grid-template-columns:');
assert(sharedStart >= 0 && gridStart > sharedStart, 'shell geometry is not separated from token root');

console.log('C1A SOURCE/RENDER WITNESS PASS');
console.log('manuscript slot · no authority · token root · truthful nav · absent facts preserved');
