/**
 * Relational architecture step 3 — one surface: a lens opens beside the chapter, and the stage conversation is never re-created.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/canvas/ReadScopeControl', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/writers-studio/canvas/SettledDecisions', () => ({ __esModule: true, default: () => null }));
jest.mock('@/lib/writersStudio/workKindClient', () => ({ setWorkKindClient: jest.fn() }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { ChapterReadingPane } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

const VIEW = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
const CONV = fs.readFileSync(path.join(process.cwd(), 'app/writers-studio/canvas/WorkConversation.tsx'), 'utf8');

let root: Root; let host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

describe('a lens opens beside the chapter', () => {
  it('⭐ the chapter, in the writer\'s words, is what fills the centre while a lens is open', () => {
    const back = jest.fn();
    act(() => root.render(React.createElement(ChapterReadingPane, {
      section: { draftSectionId: 's1', heading: 'Harbour', body: 'Harbour\n\nMarta held the key.\n\nIt was cold.', position: 0 },
      lensLabel: 'Arc', onBackToReading: back,
    })));
    expect(host.querySelector('[data-lens-chapter="s1"]')?.textContent).toContain('Marta held the key.');
    expect(host.textContent).toContain('beside MAIA’s arc reading');
    act(() => (host.querySelector('[data-lens-back]') as HTMLElement).click());
    expect(back).toHaveBeenCalled();
  });
  it('⭐ MUST FAIL IF a lens route renders without the chapter: with the stage on, every lens except themes puts the chapter in the centre', () => {
    expect(VIEW).toMatch(/const lensBeside = process\.env\.NEXT_PUBLIC_WS_DEVELOP_STAGE === '1' && props\.field !== 'overview' && props\.field !== 'themes'/);
    expect(VIEW).toMatch(/work=\{stageCenter \?\? lensChapter \?\? center\}/);
    expect(VIEW).toMatch(/maia=\{stageCompanion \?\? lensColumn \?\? maia\}/);
    expect(VIEW).toMatch(/<div data-lens-reading="true"[^>]*>\{center\}<\/div>/);
  });
});

describe('the stage conversation is one conversation', () => {
  it('⭐ MUST FAIL IF using a starter re-creates the conversation: its key no longer depends on the draft', () => {
    expect(VIEW).not.toMatch(/key=\{attentionConversationDraft \|\| 'develop-stage-conversation'\}/);
    expect(VIEW).toMatch(/key="develop-stage-conversation"\s+placeDraft=\{stagePlaced\}/);
    expect(VIEW).toMatch(/onStarter=\{placeInStageConversation\}/);
    expect(VIEW).toMatch(/onAskAbout=\{\(words\) => placeInStageConversation\(/);
  });
  it('⭐ MUST FAIL IF placed words replace the writer\'s own unsent text: they are added below it', () => {
    const effect = CONV.slice(CONV.indexOf('const placedRef'), CONV.indexOf('}, [placeDraft, starter]);'));
    expect(effect).toMatch(/if \(current\.length === 0 \|\| current === starter\) \{ setDraft\(text\); setStarter\(text\); \}/);
    expect(effect).toMatch(/else setDraft\(`\$\{current\}\\n\\n\$\{text\}`\);/);
    expect(effect).not.toMatch(/ask\(|send\(/);
  });
});
