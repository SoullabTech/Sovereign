/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import fs from 'node:fs';
import path from 'node:path';

jest.mock('next/link', () => {
  return function MockLink(props: any) {
    return React.createElement('a', { href: props.href }, props.children);
  };
});

import P4R1BlankWritingArrival from '@/app/dev/writers-studio-pc3-live/P4R1BlankWritingArrival';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

const WORK = {
  id: 'work-1',
  title: 'Elemental Alchemy',
  purpose: 'A book.',
  form: 'Book',
  stage: 'writing',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-28T00:00:00Z',
  expressions: [],
  materials: [
    {
      materialType: 'idea',
      materialId: 'idea-1',
      sentence: 'the question this book began from',
      declaredAt: '2026-09-28T00:00:00Z',
    },
    {
      materialType: 'source_upload',
      materialId: 'source-1',
      sentence: 'notes behind the opening',
      declaredAt: '2026-09-28T00:00:00Z',
    },
  ],
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test('blank arrival offers three lawful beginnings and canonical material homes', () => {
  const onStartWriting = jest.fn();
  const onTalkWithMaia = jest.fn();
  const onHelpBegin = jest.fn();

  act(() => root.render(React.createElement(P4R1BlankWritingArrival, {
    work: WORK as any,
    onStartWriting,
    onTalkWithMaia,
    onHelpBegin,
  })));

  expect(container.textContent).toContain('Nothing feeding this Work has been copied here.');
  expect(container.textContent).toContain('Just start writing');
  expect(container.textContent).toContain('Talk with MAIA');
  expect(container.textContent).toContain('Help me find a beginning');
  expect(container.textContent).toContain('the question this book began from');
  expect(container.textContent).toContain('notes behind the opening');

  const buttons = Array.from(container.querySelectorAll('button'));
  const click = (label: string) => {
    const hit = buttons.find((button) => button.textContent?.includes(label));
    expect(hit).toBeTruthy();
    act(() => hit!.click());
  };

  click('Just start writing');
  click('Talk with MAIA');
  click('Help me find a beginning');

  expect(onStartWriting).toHaveBeenCalledTimes(1);
  expect(onTalkWithMaia).toHaveBeenCalledTimes(1);
  expect(onHelpBegin).toHaveBeenCalledTimes(1);

  const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
  expect(hrefs).toContain('/maia/ideas/idea-1');
  expect(hrefs).toContain('/writers-studio/sources');
});

test('Write mounts the threshold only for a true blank Work and keeps MAIA starter unsent', () => {
  const ROOT = process.cwd();
  const write = fs.readFileSync(
    path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),
    'utf8',
  );
  const conversation = fs.readFileSync(
    path.join(ROOT, 'app/writers-studio/canvas/WorkConversation.tsx'),
    'utf8',
  );

  expect(write).toContain('currentBody.trim().length === 0');
  expect(write).toContain('&& props.work');
  expect(write).toContain('&& !blankArrivalDismissed');
  expect(write).toContain('<P4R1BlankWritingArrival');
  expect(write).toContain('Nothing feeding this Work has been handed to you automatically.');
  expect(write).toContain('Do not assume you have read any Idea or Source');

  expect(conversation).toContain("initialDraft?: string");
  expect(conversation).toContain("const [draft, setDraft] = useState(initialDraft);");

  // The optional starter is presentation state only. Sending still happens only
  // inside the existing explicit send() function.
  const starterMentions = conversation.match(/initialDraft/g) ?? [];
  expect(starterMentions.length).toBeLessThanOrEqual(4);
  expect(conversation).not.toContain('void send(initialDraft)');
  expect(conversation).not.toContain('send(initialDraft)');
});

test('starting to write dismisses the helper and focuses the real PC3 editor without seeding text', () => {
  const write = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),
    'utf8',
  );
  const start = write.indexOf('const focusRealEditor = () =>');
  const end = write.indexOf('const openWorkConversation', start);
  const slice = write.slice(start, end);

  expect(slice).toContain('setBlankArrivalDismissed(true)');
  expect(slice).toContain("document.querySelector<HTMLElement>(selector)?.focus");
  expect(slice).not.toContain('props.writing.edit');
  expect(slice).not.toContain('onEditBody');
  expect(slice).not.toContain('material');
});
