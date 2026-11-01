/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { apiFetch } from '@/lib/http/apiBase';
import * as client from '@/lib/writersStudio/journeyClient';
import P4R1BetaJourney, { currentAnswers } from '@/app/dev/writers-studio-p4r1/P4R1BetaJourney';
import type { JourneyAnswer } from '@/lib/writersStudio/journey';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('@/lib/writersStudio/journeyClient', () => ({
  readOwnJourney: jest.fn(),
  readFounderJourney: jest.fn(),
  sendJourneyAnswer: jest.fn(),
  shareJourneyAnswer: jest.fn(),
  withdrawJourneyAnswer: jest.fn(),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

const answer = (over: Partial<JourneyAnswer> = {}): JourneyAnswer => ({
  id: 'a1', promptKey: 'stuck_learning_machine', choice: null, answer: 'The relationship button was hidden.',
  supersedes: null, withdrawnAt: null, colabKind: null, colabSharedAt: null, colabStillShared: false,
  createdAt: '2026-11-01T12:00:00Z', ...over,
});

function eligible(value: boolean) {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ eligible: value }) });
}

const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === text) as HTMLButtonElement | undefined;

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

it('shows nothing to someone outside the pilot', async () => {
  eligible(false);
  act(() => root.render(React.createElement(P4R1BetaJourney)));
  await settle();
  expect(container.querySelector('[data-p4r1-beta-journey]')).toBeNull();
  expect(client.readOwnJourney).not.toHaveBeenCalled();
});

it('opens to the five questions with the consent copy, and loads only on open', async () => {
  eligible(true);
  (client.readOwnJourney as jest.Mock).mockResolvedValue({ ok: true, answers: [], colab: 'colab_not_open', founder: false });
  act(() => root.render(React.createElement(P4R1BetaJourney)));
  await settle();
  expect(client.readOwnJourney).not.toHaveBeenCalled();
  act(() => button('Beta journey')!.click());
  await settle();
  expect(container.textContent).toContain('never your manuscript or your conversations with MAIA');
  expect(container.querySelectorAll('[data-journey-prompt]').length).toBe(5);
  expect(button('All writers’ answers')).toBeUndefined();
});

it('never shares without an explicit kind, and says plainly when the Beta Co-Lab is not open', async () => {
  eligible(true);
  (client.readOwnJourney as jest.Mock).mockResolvedValue({ ok: true, answers: [answer()], colab: 'colab_not_open', founder: false });
  act(() => root.render(React.createElement(P4R1BetaJourney)));
  await settle();
  act(() => button('Beta journey')!.click());
  await settle();
  act(() => button('Share with the Beta Co-Lab…')!.click());
  expect(container.textContent).toContain('The Beta Co-Lab isn’t open yet');
  expect(button('Share')).toBeUndefined();
  expect(client.shareJourneyAnswer).not.toHaveBeenCalled();
});

it('shares only after the writer picks Problem, Question or Suggestion', async () => {
  eligible(true);
  (client.readOwnJourney as jest.Mock).mockResolvedValue({ ok: true, answers: [answer()], colab: 'open', founder: false });
  (client.shareJourneyAnswer as jest.Mock).mockResolvedValue({ ok: true, answer: answer({ colabKind: 'problem', colabSharedAt: 'now', colabStillShared: true }) });
  act(() => root.render(React.createElement(P4R1BetaJourney)));
  await settle();
  act(() => button('Beta journey')!.click());
  await settle();
  act(() => button('Share with the Beta Co-Lab…')!.click());
  expect(button('Share')!.disabled).toBe(true);
  act(() => button('Problem')!.click());
  await act(async () => { button('Share')!.click(); });
  await settle();
  expect(client.shareJourneyAnswer).toHaveBeenCalledWith('a1', 'problem');
  expect(container.querySelector('[data-journey-shared]')?.textContent).toContain('problem');
});

it('treats the latest unwithdrawn, unsuperseded version as current', () => {
  const v1 = answer({ id: 'v1', createdAt: '2026-11-01T10:00:00Z' });
  const v2 = answer({ id: 'v2', supersedes: 'v1', createdAt: '2026-11-01T11:00:00Z' });
  expect(currentAnswers([v1, v2]).get('stuck_learning_machine')!.id).toBe('v2');
  expect(currentAnswers([v1, { ...v2, withdrawnAt: 'now' }, { ...v1, withdrawnAt: 'now' }]).size).toBe(0);
});
