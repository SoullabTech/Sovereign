/** @jest-environment jsdom */
import fs from 'node:fs';
import path from 'node:path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const apiFetch = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

import P4R1ProducePanel from '@/app/dev/writers-studio-pc3-live/P4R1ProducePanel';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  (URL as any).createObjectURL = jest.fn(() => 'blob:p4r1');
  (URL as any).revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.restoreAllMocks();
});

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
  };
}

test('Produce preflights current writing and clearly separates file creation from publication', async () => {
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    ready: true,
    title: 'Elemental Alchemy',
    sectionCount: 12,
    sourceAuthority: 'working_draft',
    sourceRevision: '9',
    issues: [],
    publicationBoundary: 'This creates a file from your current writing. It does not publish or distribute it.',
  }));

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'm1',
      onClose: jest.fn(),
    }));
  });

  await act(async () => { await Promise.resolve(); });

  expect(apiFetch).toHaveBeenCalledWith(
    '/api/sovereign/manuscripts/m1/render',
    { method: 'GET' },
  );
  expect(container.textContent).toContain('This edition will use the writing currently held in Writer’s Studio.');
  expect(container.textContent).toContain('2 · Publishing path');
  expect(container.textContent).toContain('Amazon KDP · Paperback');
  expect(container.textContent).toContain('Soullab Press');
  expect(container.textContent).toContain('3 · Edition setup');
  expect(container.textContent).toContain('4 · Interior readiness');
  expect(container.textContent).toContain('5 · Create the edition file');
  expect(container.textContent).toContain('Create KDP interior PDF');
  expect(container.textContent).toContain('Studio prepares the edition; you decide when, where, and with whom it is published.');
  expect(container.textContent).toContain('does not publish or distribute');
});

test('production blockers disable file actions and do not render anything', async () => {
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    ready: false,
    title: 'Elemental Alchemy',
    sectionCount: 12,
    sourceAuthority: 'working_draft',
    sourceRevision: '9',
    issues: [{
      code: 'copyright_not_governed',
      severity: 'blocker',
      sectionIndexes: [1],
      message: 'Copyright language exists, but there is not exactly one explicit governed Copyright object.',
    }],
    publicationBoundary: 'This creates a file from your current writing. It does not publish or distribute it.',
  }));

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'm1',
      onClose: jest.fn(),
    }));
  });
  await act(async () => { await Promise.resolve(); });

  expect(container.textContent).toContain('4 · Needs attention');
  expect(container.textContent).toContain('Make the copyright page explicit');
  expect(container.textContent).toContain('Studio cannot identify exactly one governed Copyright or Copyright Notice section yet.');
  expect(container.textContent).not.toContain('Create KDP interior PDF');
  expect(container.textContent).not.toContain('Create EPUB');
  expect(apiFetch).toHaveBeenCalledTimes(1);
});

test('Make PDF uses the existing render route and downloads returned bytes', async () => {
  apiFetch
    .mockResolvedValueOnce(jsonResponse(200, {
      ready: true,
      title: 'Elemental Alchemy',
      sectionCount: 12,
      sourceAuthority: 'working_draft',
      sourceRevision: '9',
      issues: [],
      publicationBoundary: 'This creates a file from your current writing. It does not publish or distribute it.',
    }))
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="Elemental Alchemy.pdf"',
      }),
      blob: async () => new Blob(['pdf']),
    });

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'm1',
      onClose: jest.fn(),
    }));
  });
  await act(async () => { await Promise.resolve(); });

  const pdf = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent?.includes('Create KDP interior PDF')) as HTMLButtonElement;

  await act(async () => pdf.click());

  expect(apiFetch).toHaveBeenLastCalledWith(
    '/api/sovereign/manuscripts/m1/render',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ format: 'pdf' }),
    }),
  );
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  expect(container.textContent).toContain('PDF prepared for KDP Paperback from your current writing.');
});


test('Soullab Press is offered as an explicit optional human publishing pathway', async () => {
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    ready: true,
    title: 'Elemental Alchemy',
    sectionCount: 12,
    sourceAuthority: 'working_draft',
    sourceRevision: '9',
    issues: [],
    publicationBoundary: 'This creates a file from your current writing. It does not publish or distribute it.',
  }));

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'm1',
      onClose: jest.fn(),
    }));
  });
  await act(async () => { await Promise.resolve(); });

  const press = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent?.includes('Soullab Press')) as HTMLButtonElement;
  await act(async () => press.click());

  expect(container.textContent).toContain('Soullab Press is a possible path, never an automatic destination.');
  expect(container.textContent).toContain('Optional Press pathway');
  expect(container.textContent).toContain('Create print interior PDF');
  expect(container.textContent).toContain('Create EPUB');
  expect(container.textContent).toContain('Choosing Soullab Press here expresses interest only');

  const explore = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent?.includes('Explore the Soullab Press pathway')) as HTMLButtonElement;
  await act(async () => explore.click());

  expect(container.textContent).toContain('Human editorial / production review.');
  expect(container.textContent).toContain('Only a separate agreement turns the possibility into a Soullab Press edition.');
});

test('returning Work Home exposes Publish contextually rather than as a fourth mode', () => {
  const home = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'),
    'utf8',
  );
  expect(home).toContain('Publish');
  expect(home).toContain('<P4R1ProducePanel');
  expect(home).not.toContain("onMode('produce')");
});
