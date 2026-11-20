/**
 * @jest-environment jsdom
 *
 * The Studio's words follow what the Work is (founder 2026-11-20): "If a writer says they are doing an essay, MAIA shouldn't be
 * asking about chapters but about essay content. If it is a poem, it should be about stanzas." Rulings: the WRITER chooses the
 * form (never inferred), and an unknown form is spoken of neutrally, never as a book.
 */
import fs from 'fs';
import path from 'path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  FORM_CHOICES, formStudioCopy, formToSave, formVocabulary, readingFrame,
} from '../formVocabulary';
import { StudioVocabularyProvider } from '../StudioVocabularyContext';
import { DevelopStage, DevelopHoldings } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const ROOT = path.resolve(__dirname, '../../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const BOOKISH = /\bchapters?\b|\bbook\b/i;

describe('which words a form is spoken with', () => {
  test.each([
    ['essay', 'essay', 'section'], ['An essay for The Sun', 'essay', 'section'], ['poem', 'poem', 'stanza'],
    ['Poems', 'collection', 'poem'], ['a chapbook', 'collection', 'poem'], ['song lyrics', 'song', 'verse'],
    ['screenplay', 'screenplay', 'scene'], ['stage play', 'play', 'scene'], ['short story', 'story', 'scene'],
    ['novel', 'book', 'chapter'], ['Memoir', 'book', 'chapter'],
  ])('“%s” → %s, in %ss', (form, kind, unit) => {
    const v = formVocabulary(form);
    expect(v.kind).toBe(kind);
    expect(v.unit).toBe(unit);
  });

  test('no form, or a blank one, is neutral and never says book or chapter', () => {
    for (const form of [null, undefined, '', '   ']) {
      const v = formVocabulary(form);
      expect(v.kind).toBe('neutral');
      for (const word of [v.noun, v.whole, v.unit, v.units, v.railHeading, v.bringHint]) expect(word).not.toMatch(BOOKISH);
      expect(v.maiaFrame).toMatch(/Do not assume it is a book or speak of chapters/);
    }
    expect(Object.values(formStudioCopy(null)).join(' ')).not.toMatch(BOOKISH);
  });

  test('the writer’s own word we don’t recognise names the Work, with neutral parts', () => {
    const v = formVocabulary('Letter');
    expect([v.noun, v.whole, v.unit]).toEqual(['letter', 'the whole letter', 'part']);
    expect(v.maiaFrame).toMatch(/calls this Work “Letter”/);
  });

  test('every offered form other than a book speaks without book words, on screen and to MAIA', () => {
    for (const { id } of FORM_CHOICES.filter((f) => f.id !== 'book')) {
      const v = formVocabulary(id);
      expect([v.noun, v.whole, v.unit, v.units, v.railHeading, v.bringHint].join(' ')).not.toMatch(BOOKISH);
      expect(Object.values(formStudioCopy(id)).join(' ')).not.toMatch(BOOKISH);
      expect(v.maiaFrame).toMatch(/Never call it a book or its parts chapters/);
      expect(readingFrame(v)).toMatch(new RegExp(`say “${v.unit}” and “${v.noun}”, never “chapter” or “book”`));
    }
  });

  test('a book reads as before: nothing is put in front of its reading instructions', () => {
    expect(readingFrame(formVocabulary('book'))).toBe('');
  });

  test('what is saved is the writer’s choice or their own word, trimmed; nothing else', () => {
    expect(formToSave('poem', 'ignored')).toBe('poem');
    expect(formToSave(null, '  a   liturgy ')).toBe('a liturgy');
    expect(formToSave(null, '   ')).toBeNull();
    expect(formToSave(null, 'x'.repeat(200))).toHaveLength(60);
  });
});

describe('the writer chooses; nothing is inferred', () => {
  const opening = read('app/dev/writers-studio-pc3-live/StudioInspirationOpening.tsx');
  test('the opening asks “What is it becoming?” and passes only the writer’s own choice', () => {
    expect(opening).toMatch(/\{FORM_QUESTION\}/);
    expect(opening).toMatch(/const chosenForm = formToSave\(formChoice, formOwnOpen \? formOwn : ''\);/);
    expect(opening).toMatch(/props\.onBegin\?\.\(destination, planNow\(\)\.purpose, chosenForm\);/);
    expect(opening).toMatch(/You can skip this, or change it any time\./);
  });

  test('the form is never derived from the spark, the reflection or the writing', () => {
    const setters = [...opening.matchAll(/setForm(Choice|Own)\(([^)]*)\)/g)].map((m) => m[2]);
    for (const arg of setters) expect(arg).not.toMatch(/answer|reflection|understood|spark|purpose/);
    const controller = read('app/dev/writers-studio-pc3-live/P4R1HomeController.tsx');
    for (const m of controller.matchAll(/await setForm\(([^)]*)\)/g)) expect(m[1]).toMatch(/^(workId|work\.id), form$/);
    expect(controller).toMatch(/body: JSON\.stringify\(\{ form \}\)/);
  });
});

describe('Develop speaks in the Work’s words', () => {
  let host: HTMLDivElement; let root: Root;
  beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
  afterEach(() => { act(() => root.unmount()); host.remove(); });
  const sections = [
    { draftSectionId: 's1', heading: 'First light', body: 'First light\n\nThe gull opens the sky.', position: 0 },
    { draftSectionId: 's2', heading: '', body: 'Salt on the tongue, and the tide.', position: 1 },
  ];
  const stage = (form: string | null) => {
    const props = { workTitle: 'Tidewater', sections, currentId: 's1', onSelect: jest.fn(), starters: [], onStarter: jest.fn(), onOpenWrite: jest.fn(),
      onMoreWays: jest.fn(), lastRead: null, plan: null, planBusy: false, planNote: null, onMakePlan: jest.fn(), onEditPlan: jest.fn(),
      onWorkOnStep: jest.fn(), onAskAbout: jest.fn(), closed: true, view: 'full', onView: jest.fn() };
    act(() => root.render(React.createElement(StudioVocabularyProvider, { value: formVocabulary(form) },
      React.createElement(React.Fragment, null,
        React.createElement(DevelopStage, props as any),
        React.createElement(DevelopHoldings, { manuscriptId: 'm', workId: 'w', kind: null, onKind: jest.fn() } as any)))));
    return host.textContent ?? '';
  };

  test('a poem’s Develop stage says nothing about chapters or books', () => {
    const text = stage('poem');
    // “A helper’s book” is the name of a genre the writer may declare (Fiction / Nonfiction / A helper’s book), not the Studio’s word.
    expect(text.replace('A helper’s book', '')).not.toMatch(BOOKISH);
    expect(text).toMatch(/Your poem/);
    expect(text).toMatch(/What kind of poem is this\?/);
  });

  test('with no form, Develop is neutral', () => {
    const text = stage(null);
    expect(text).not.toMatch(/\bchapters?\b/i);
    expect(text).toMatch(/Your piece/);
  });
});
