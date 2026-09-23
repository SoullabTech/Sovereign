/** R1-1C · goldens of the successor flagship composition, captured ON THE R1-1C CANDIDATE and then frozen under FS2.
 *  ⛔ Run ONLY to establish the successor state under an authorized act; never to bless a later change. */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FlagshipWriteView } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import { navActionsFor, locationForReading, type ChooserState, type StudioNav } from '../../../../app/writers-studio/rebuild/reviewNavigation';
import { CONTEXT } from '../flagship-c1b/laws';
const noop = () => {};
const LOC = { pathname: '/writers-studio/rebuild', search: '?m=ms-1&s=d-2' };
const acts = { go: noop, openChooser: noop, closeChooser: noop };
const nav = (mode: StudioNav['mode']): StudioNav => ({ mode, actions: navActionsFor(mode, LOC, acts), choose: { hrefFor: (id) => locationForReading(LOC.pathname, LOC.search, id), onChoose: noop } });
const LEDGER = [
  { id: 'rd-b', outcome: 'reading', commissionedLens: 'continuity', frozenAt: '2026-09-22T13:00:00.000Z', observationCount: 2 },
  { id: 'rd-newest', outcome: 'reading', commissionedLens: 'voice', frozenAt: '2026-09-22T15:00:00.000Z', observationCount: 1 },
  { id: 'rd-none', outcome: 'none', commissionedLens: 'arc', frozenAt: '2026-09-22T11:00:00.000Z', observationCount: 0 },
] as const;
const choices: ChooserState = { kind: 'choices', gen: 1, readings: LEDGER };
const base = { context: CONTEXT, workTitle: 'The River Between', workForm: null, focusId: 'd-2', held: null, onFocus: noop, onHold: noop } as const;
export const WRITE_STATES = {
  /* the pure composition with no host actions — the R1-1B-L16 successor goldens (Review renders as orientation) */
  'write-plain': () => <FlagshipWriteView {...base} />,
  'write-held-editorial': () => <FlagshipWriteView {...base} held={{ sectionId: 'd-2', start: 21, end: 29, text: 'far bank' }} editorialEnabled />,
  /* the live composition with the host's lawful navigation actions — the R1-1C-L16 goldens */
  'nav-write-plain': () => <FlagshipWriteView {...base} studioNav={nav('write')} />,
  'nav-write-held-editorial': () => <FlagshipWriteView {...base} held={{ sectionId: 'd-2', start: 21, end: 29, text: 'far bank' }} editorialEnabled studioNav={nav('write')} />,
  'nav-review-choose': () => <FlagshipWriteView {...base} studioNav={nav('review-choose')} chooser={choices} />,
  'nav-review-choose-empty': () => <FlagshipWriteView {...base} studioNav={nav('review-choose')} chooser={{ kind: 'choices', gen: 1, readings: [] }} />,
} as const;
if (require.main === module) {
  for (const [id, node] of Object.entries(WRITE_STATES)) {
    const html = renderToStaticMarkup(node());
    writeFileSync(join(__dirname, 'golden', `${id}.html`), html);
    console.log(id, html.length);
  }
}
