/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import P4R1DevelopView, { type P4R1DevelopViewProps } from '@/app/dev/writers-studio-pc3-live/P4R1DevelopView';
import { requestConversationDeparture } from '@/lib/writersStudio/conversationDeparture';

const mockConversationRenders: Array<{ workId: string; initialDraft: string; draft: string }> = [];

jest.mock('next/navigation', () => ({
  usePathname: () => '/writers-studio', useSearchParams: () => new URLSearchParams(),
}));
jest.mock('next/link', () => {
  const R = require('react');
  return { __esModule: true, default: ({ children, ...props }: any) => R.createElement('a', props, children) };
});
jest.mock('@/app/writers-studio/full-redesign/Shell', () => {
  const R = require('react');
  return {
    ChevronDown: () => null,
    Shell: (props: any) => R.createElement('div', { className: 'fr-shell' }, props.manuscript, props.work, props.maia),
  };
});
jest.mock('@/app/writers-studio/develop/ObservationDialogue', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WriterUnderstanding', () => ({ __esModule: true, default: () => null }));
jest.mock('@/lib/writersStudio/conversationDeparture', () => ({ requestConversationDeparture: jest.fn(() => true) }));
jest.mock('@/app/writers-studio/canvas/WorkConversation', () => {
  const R = require('react');
  return { __esModule: true, default: function ConversationFixture(props: any) {
    const [draft, setDraft] = R.useState(props.initialDraft ?? '');
    mockConversationRenders.push({ workId: props.work.id, initialDraft: props.initialDraft ?? '', draft });
    return R.createElement('textarea', {
      'aria-label': 'Fixture MAIA draft', value: draft,
      onInput: (event: any) => setDraft(event.currentTarget.value),
    });
  } };
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const departure = requestConversationDeparture as jest.Mock;

function fixture(): P4R1DevelopViewProps {
  const section = (id: string, heading: string, position: number) => ({
    draftSectionId: id, heading, position, headingDepth: 1,
    editable: true, body: 'Fictional rain at an open window.',
  });
  const callbacks = Object.fromEntries([
    'onField', 'onIntent', 'onMode', 'onSection', 'onReading', 'onScope',
    'onCommission', 'onCommissionAttentionMap', 'onShowAttentionItem',
    'onWorkWithAttentionItem', 'onDiscussAttentionItem', 'onSaveWriterUnderstanding',
    'onReflectDevelopmentalProcess', 'onDevelopmentalMovement', 'onScanLineage',
    'onInvestigateChapterLineage', 'onSelectLineageCandidate', 'onShowLineageCandidate',
    'onPrepare', 'onGoToObservation', 'onWorkWithObservation', 'onThemeMutation',
  ].map(name => [name, jest.fn()]));
  const scope = { kind: 'section', sectionId: 'section-1', label: 'Chapter 1: Rain' } as const;
  return {
    ...callbacks,
    manuscriptId: 'fictional-manuscript',
    work: { id: 'fictional-work', title: 'Window and Rain', manuscriptState: 'partial-manuscript' },
    workTitle: 'Window and Rain', appearance: 'day', field: 'overview', intent: null,
    sections: [section('section-1', 'Chapter 1: Rain', 0), section('section-2', 'Chapter 2: Garden', 1)],
    currentSectionId: 'section-1', scope, sectionScope: scope, chapterScope: null,
    summaries: [], summariesLoading: false, reading: null, readingLoading: false, readingError: null,
    observationTargets: {}, observationWorkTargets: {}, prep: { kind: 'ready' }, prepError: null,
    preparing: false, commissioning: false, commissionError: null,
    attentionMap: null, attentionBusy: false, attentionError: null, attentionProgress: null,
    selectedAttentionItemId: null, writerUnderstanding: null, writerUnderstandingBusy: false,
    writerUnderstandingError: null, developmentalOrientation: null,
    developmentalOrientationBusy: false, developmentalOrientationError: null,
    selectedDevelopmentalMovementId: null, lineageOrientation: null, lineageBusy: false,
    lineageError: null, chapterLineage: null, chapterLineageBusy: false,
    chapterLineageError: null, selectedLineageCandidateId: null,
    themes: null, themeBusy: false, themeError: null,
  } as unknown as P4R1DevelopViewProps;
}

describe('Develop gestures preserve an unsent Work draft until departure is accepted', () => {
  let host: HTMLDivElement;
  let root: Root;
  let props: P4R1DevelopViewProps;
  const draftText = 'My unsent question\nPlease keep my exact wording.';
  const draft = () => host.querySelector<HTMLTextAreaElement>('[aria-label="Fixture MAIA draft"]');
  const button = (text: string, exact = false) => {
    const result = [...host.querySelectorAll<HTMLButtonElement>('button')].find(item =>
      exact ? item.textContent?.trim() === text : item.textContent?.includes(text));
    if (!result) throw new Error('Missing button: ' + text);
    return result;
  };
  const click = async (text: string, exact = false) => act(async () => button(text, exact).click());
  const render = async () => act(async () => root.render(React.createElement(P4R1DevelopView, props)));
  const openDraft = async () => {
    await click('Talk with MAIA about this', true);
    await act(async () => {
      const input = draft()!;
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, draftText);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(draft()?.value).toBe(draftText);
    departure.mockClear();
  };
  beforeEach(async () => {
    localStorage.clear();
    window.requestAnimationFrame = () => 0;
    departure.mockReset().mockReturnValue(true);
    mockConversationRenders.length = 0;
    host = document.createElement('div'); document.body.append(host);
    root = createRoot(host); props = fixture();
    await render();
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove(); localStorage.clear();
  });

  it('cancelling a manuscript-rail departure leaves the composer and section unchanged', async () => {
    await openDraft(); departure.mockReturnValue(false);
    await click('Chapter 2: Garden', true);
    expect(departure).toHaveBeenCalledTimes(1);
    expect(props.onSection).not.toHaveBeenCalled();
    expect(draft()?.value).toBe(draftText);
  });

  it('accepting a manuscript-rail departure invokes the existing section callback once', async () => {
    await openDraft(); departure.mockReturnValue(true);
    await click('Chapter 2: Garden', true);
    expect(departure).toHaveBeenCalledTimes(1);
    expect(props.onSection).toHaveBeenCalledTimes(1);
    expect(props.onSection).toHaveBeenCalledWith('section-2');
    expect(draft()).toBeNull();
  });

  it('a cancelled focused-intent choice leaves the draft and intent unchanged', async () => {
    await openDraft(); departure.mockReturnValue(false);
    await click('Something feels off');
    expect(departure).toHaveBeenCalledTimes(1);
    expect(props.onIntent).not.toHaveBeenCalled();
    expect(draft()?.value).toBe(draftText);
  });

  it('a cancelled direct Write invitation does not bypass the room departure guard', async () => {
    await openDraft(); departure.mockReturnValue(false);
    await click('Open this chapter in Write', true);
    expect(departure).toHaveBeenCalledTimes(1);
    expect(props.onMode).not.toHaveBeenCalled();
    expect(draft()?.value).toBe(draftText);
  });

  it('a new saved reading arriving in props does not replace an active Work draft', async () => {
    await openDraft();
    props = { ...props, reading: {
      id: 'fictional-reading', observations: [{
        key: 'fictional-observation', observation: 'The fictional rain recurs.',
        phenomenonLabel: 'recurrence', evidence: [], limits: [], state: 'current',
      }],
    } as unknown as P4R1DevelopViewProps['reading'] };
    await render();
    expect(draft()?.value).toBe(draftText);
    expect(departure).not.toHaveBeenCalled();
  });

  it('cancelling a different conversation starter prevents its key from remounting the draft', async () => {
    await click('Chapter 1: Rain', true);
    await openDraft();
    await act(async () => {
      const select = host.querySelector<HTMLSelectElement>('[aria-label="How much of Develop to show"]')!;
      select.value = 'full'; select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    departure.mockClear().mockReturnValue(false);
    await click('Talk with MAIA', true);
    expect(departure).toHaveBeenCalledTimes(1);
    expect(draft()?.value).toBe(draftText);
  });

  it('cancelling preparation leaves the active draft and preparation callback untouched', async () => {
    await openDraft();
    props = { ...props, field: 'structure', prep: { kind: 'diverged' } as P4R1DevelopViewProps['prep'] };
    await render();
    departure.mockClear().mockReturnValue(false);
    await click('Review and confirm', true);
    expect(departure).toHaveBeenCalledTimes(1);
    expect(props.onPrepare).not.toHaveBeenCalled();
    expect(draft()?.value).toBe(draftText);
  });

  it('accepted preparation closes the draft once and shows only status while preparation runs', async () => {
    await openDraft();
    props = { ...props, field: 'structure', prep: { kind: 'diverged' } as P4R1DevelopViewProps['prep'] };
    await render();
    departure.mockClear().mockReturnValue(true);
    await click('Review and confirm', true);
    expect(departure).toHaveBeenCalledTimes(1);
    expect(props.onPrepare).toHaveBeenCalledTimes(1);
    expect(draft()).toBeNull();
    props = { ...props, field: 'overview', preparing: true };
    await render();
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Preparing your writing for Develop');
    await click('Talk with MAIA about this', true);
    expect(draft()).toBeNull();
  });

  it('a different Work cannot render the previous starter or draft even before passive cleanup', async () => {
    await openDraft();
    mockConversationRenders.length = 0;
    props = {
      ...props, manuscriptId: 'second-fictional-manuscript',
      work: { ...props.work!, id: 'second-fictional-work', title: 'Another Work' },
      workTitle: 'Another Work',
      scope: { kind: 'section', sectionId: 'section-1', label: 'A new opening' },
    };
    await render();
    expect(draft()).toBeNull();
    // Recording every render catches an effect-only reset that briefly passes
    // the first Work's starter/draft to the second Work's composer.
    expect(mockConversationRenders.filter(row => row.workId === 'second-fictional-work')).toEqual([]);
    await click('Talk with MAIA about this', true);
    expect(draft()?.value).toContain('A new opening');
    expect(draft()?.value).not.toContain(draftText);
    expect(mockConversationRenders.filter(row => row.workId === 'second-fictional-work')
      .every(row => !row.initialDraft.includes('Chapter 1: Rain') && row.draft !== draftText)).toBe(true);
  });
});
