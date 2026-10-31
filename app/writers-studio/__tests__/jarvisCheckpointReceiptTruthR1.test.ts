/** @jest-environment jsdom */
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SectionWritingSurface from '../canvas/SectionWritingSurface';
import { apiFetch } from '@/lib/http/apiBase';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));

const mocked = apiFetch as jest.Mock;
const section = {
  id: 'fiction-section-1', position: 0,
  heading: 'Fictional prose', body: 'The lantern is imaginary.', editable: true,
};

describe('JARVIS bodyless checkpoint — truthful author confirmation', () => {
  let root: Root;
  let host: HTMLDivElement;
  let onCheckpointed: jest.Mock;
  let writing: Record<string, unknown>;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    mocked.mockReset();
    onCheckpointed = jest.fn();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    writing = {
      sections: [section], activeId: section.id, active: section,
      activeBody: section.body, statusOf: () => 'saved',
      edit: jest.fn(), editSection: jest.fn(), captureForUnmount: () => true,
      bodyOf: () => section.body, goToSection: jest.fn(),
      hasUnsavedWork: () => false,
      currentRevisionId: () => 7,
      flushPending: jest.fn(),
    };
  });

  afterEach(async () => {
    await React.act(async () => root.unmount());
    host.remove();
  });

  async function keepWith(body: unknown, status = 200) {
    mocked.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
    await React.act(async () => {
      root.render(React.createElement(SectionWritingSurface, {
        writing: writing as never, manuscriptId: 'fiction-work-manuscript',
        onCheckpointed,
      }));
    });
    const control = host.querySelector<HTMLButtonElement>('[data-keep-a-version]');
    expect(control).not.toBeNull();
    await React.act(async () => {
      control!.click();
      await Promise.resolve();
      await Promise.resolve();
    });
    return host.textContent ?? '';
  }

  it('keeps the manuscript body out of the request and confirms only an exact advancing server receipt', async () => {
    const displayed = await keepWith({
      checkpointed: true, revisionCount: 4, revisionId: 8,
      updatedAt: '2026-10-20T12:00:00Z',
    });
    expect(displayed).toContain('version kept');
    expect(onCheckpointed).toHaveBeenCalledTimes(1);
    expect(mocked).toHaveBeenCalledTimes(1);
    expect(mocked.mock.calls[0][1].body).toBeUndefined();
    expect(mocked.mock.calls[0][1].headers).toMatchObject({
      'x-draft-base-revision': '7',
    });
  });

  it.each([
    ['empty 200 receipt', {}],
    ['unconfirmed server flag', { checkpointed: false, revisionCount: 4, revisionId: 8, updatedAt: 'fiction' }],
    ['nonadvancing revision', { checkpointed: true, revisionCount: 4, revisionId: 7, updatedAt: 'fiction' }],
    ['numeric revision disguised as text', { checkpointed: true, revisionCount: 4, revisionId: '8', updatedAt: 'fiction' }],
  ])('never falsely displays version kept after %s', async (_label, body) => {
    const displayed = await keepWith(body);
    expect(displayed).toContain('Version not confirmed.');
    expect(displayed).toContain('Check versions before trying again.');
    expect(displayed).not.toContain('version kept');
    expect(onCheckpointed).not.toHaveBeenCalled();
    expect(mocked).toHaveBeenCalledTimes(1);
  });

  it('preserves the stale-base conflict label without triggering another request', async () => {
    const displayed = await keepWith({ reason: 'stale_base', currentRevisionId: 9 }, 409);
    expect(displayed).toContain('work moved');
    expect(onCheckpointed).not.toHaveBeenCalled();
    expect(mocked).toHaveBeenCalledTimes(1);
  });
});
