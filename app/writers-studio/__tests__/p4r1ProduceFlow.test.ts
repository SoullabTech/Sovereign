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
import { writeLocalReviewManuscript } from '@/lib/writersStudio/localReviewManuscript';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
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
  expect(container.textContent).toContain('1 · Current writing');
  expect(container.textContent).toContain('2 · Publishing path');
  expect(container.textContent).toContain('3 · Edition setup');
  expect(container.textContent).toContain('4 · Interior readiness');
  expect(container.textContent).toContain('5 · Edition files');
  expect(container.textContent).toContain('Interior PDF · in verification');
  expect(container.textContent).toContain('6 · What happens next');
  expect(container.textContent).toContain('no publishing or submission occurs here');
  expect(container.querySelector('[data-publish-availability]')?.getAttribute('data-publish-availability'))
    .toBe('preview-only');
  expect(Array.from(container.querySelectorAll('[data-publish-export]'))
    .every((item) => (item as HTMLButtonElement).disabled)).toBe(true);
  expect(container.textContent).toContain('Amazon KDP · Paperback');
  expect(container.textContent).toContain('Soullab Press');
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
  expect(container.querySelectorAll('[data-publish-export]')).toHaveLength(0);
  expect(container.textContent).not.toContain('Make EPUB');
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
        'x-soullab-page-count': '216',
        'x-soullab-production-profile': 'hallmark-6x9-v1',
        'x-soullab-source-hash': '1234567890abcdef',
      }),
      blob: async () => new Blob(['pdf']),
    });

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'm1',
      onClose: jest.fn(),
      exportsCertified: true, // Test-only: actual Publish room still passes false.
    }));
  });
  await act(async () => { await Promise.resolve(); });

  const pdf = container.querySelector<HTMLButtonElement>('[data-publish-export="enabled"]');
  expect(pdf).not.toBeNull();
  expect(pdf?.disabled).toBe(false);
  await act(async () => pdf!.click());

  expect(apiFetch).toHaveBeenLastCalledWith(
    '/api/sovereign/manuscripts/m1/render',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        format: 'pdf', expectedSourceAuthority: 'working_draft', expectedSourceRevision: '9',
      }),
    }),
  );
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  expect(container.textContent).toContain('PDF prepared for KDP Paperback from your current writing.');
  expect(container.textContent).toContain('7 · Paperback cover & spine');
  expect(container.textContent).toContain('216 pages');
  expect(container.textContent).toContain('0.54 in');
  expect(container.textContent).toContain('12.79 in');
  expect(container.textContent).toContain('9.25 in');
  expect(container.textContent).toContain('Eligible at this page count');
  expect(container.querySelector('a[href="https://kdp.amazon.com/cover-calculator"]')).not.toBeNull();

  const white = container.querySelector('input[value="white"]') as HTMLInputElement;
  await act(async () => {
    white.click();
  });
  expect(container.textContent).toContain('0.4864 in');
  expect(container.textContent).toContain('12.7364 in');
});

test('founder local review renders through the loopback route without enabling production export', async () => {
  const sections = [{
    position: 0,
    heading: 'Chapter One',
    headingDepth: 1 as const,
    headingSignal: 'member',
    body: 'The fictional lantern crossed the river.',
  }];
  expect(writeLocalReviewManuscript({
    manuscriptId: 'local-m1',
    title: 'The Paper Lantern',
    author: null,
    sections,
  })).not.toBeNull();
  const sourceHash = 'a'.repeat(64);
  apiFetch
    .mockResolvedValueOnce(jsonResponse(200, {
      ready: true,
      title: 'The Paper Lantern',
      sectionCount: 1,
      sourceAuthority: 'local_review',
      sourceRevision: sourceHash,
      issues: [],
      publicationBoundary: 'Temporary local artifact only.',
      localReview: true,
      persistent: false,
    }))
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="The Paper Lantern-LOCAL-REVIEW.pdf"',
        'x-soullab-local-review': '1',
        'x-soullab-source-hash': sourceHash,
        'x-soullab-production-profile': 'hallmark-6x9-v1',
        'x-soullab-page-count': '4',
        'x-soullab-artifact-sha256': 'b'.repeat(64),
        'x-soullab-artifact-bytes': '3',
      }),
      blob: async () => new Blob(['pdf']),
    });

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'local-m1',
      onClose: jest.fn(),
      exportsCertified: false,
      localReviewArtifacts: true,
    }));
  });
  await act(async () => { await Promise.resolve(); });

  expect(apiFetch).toHaveBeenNthCalledWith(1,
    '/api/writers-studio/local-review/render',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        action: 'inspect', title: 'The Paper Lantern', author: null, sections,
      }),
    }),
  );
  expect(container.querySelector('[data-publish-availability]')?.getAttribute('data-publish-availability'))
    .toBe('local-review');
  expect(container.textContent).toContain('Local artifact review');
  expect(container.textContent).toContain('not certified publication files');

  const pdf = container.querySelector<HTMLButtonElement>('[data-publish-export="local-review"]');
  expect(pdf).not.toBeNull();
  expect(pdf?.disabled).toBe(false);
  expect(pdf?.textContent).toContain('Create local review PDF');
  await act(async () => pdf!.click());

  expect(apiFetch).toHaveBeenNthCalledWith(2,
    '/api/writers-studio/local-review/render',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        action: 'render', format: 'pdf', title: 'The Paper Lantern', author: null,
        sections, expectedSourceHash: sourceHash,
      }),
    }),
  );
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  expect(container.textContent).toContain('PDF made on this Mac for artifact review');
  expect(container.textContent).toContain('local review artifact made from this exact writing');
  expect(container.textContent).toContain('Artifact SHA-256');
  expect(container.textContent).toContain('b'.repeat(64));
  expect(container.textContent).toContain('3 bytes');
  expect(container.querySelector('[data-artifact-sha256]')?.getAttribute('data-artifact-sha256'))
    .toBe('b'.repeat(64));
  expect(container.textContent).toContain('Production export remains held');
});

test('stale preflight 409 withdraws production UI and never downloads or claims a file', async () => {
  apiFetch
    .mockResolvedValueOnce(jsonResponse(200, {
      ready: true, title: 'Fiction Book', sectionCount: 1,
      sourceAuthority: 'working_draft', sourceRevision: '9', issues: [],
      publicationBoundary: 'Files do not publish themselves.',
    }))
    .mockResolvedValueOnce(jsonResponse(409, { error: 'The Work changed.' }));

  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {
      manuscriptId: 'fiction-manuscript', onClose: jest.fn(),
      exportsCertified: true, // isolated UI simulation, never activated in production
    }));
  });
  await act(async () => { await Promise.resolve(); });
  const make = container.querySelector<HTMLButtonElement>('[data-publish-export="enabled"]');
  expect(make).not.toBeNull();
  await act(async () => make!.click());

  expect(apiFetch).toHaveBeenLastCalledWith(
    '/api/sovereign/manuscripts/fiction-manuscript/render',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        format: 'pdf', expectedSourceAuthority: 'working_draft', expectedSourceRevision: '9',
      }),
    }),
  );
  expect(container.textContent).toContain('Your writing changed since the production check');
  expect(container.textContent).toContain('Try again');
  expect(container.querySelector('[data-publish-artifact]')).toBeNull();
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
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
  // Uncertified (default) Publish: file controls are visible but held.
  expect(container.textContent).toContain('Interior PDF · in verification');
  expect(container.textContent).toContain('EPUB3 · in verification');
  expect(container.textContent).toContain('Exploring Soullab Press here is not an application');

  const explore = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent?.includes('Explore the Soullab Press pathway')) as HTMLButtonElement;
  await act(async () => explore.click());

  expect(container.textContent).toContain('Human editorial / production review.');
  expect(container.textContent).toContain('Only a separate agreement turns the possibility into a Soullab Press edition.');
});

test('Publish is visible in the beta top navigation and opens the existing Home publishing panel', () => {
  const home = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'),
    'utf8',
  );
  const controller = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx'),
    'utf8',
  );
  const shell = fs.readFileSync(
    path.join(process.cwd(), 'app/writers-studio/full-redesign/Shell.tsx'),
    'utf8',
  );

  expect(home).toContain('Publish');
  expect(home).toContain('<P4R1ProducePanel');
  expect(home).toContain('produceInitially={props.publishRequested}');
  expect(controller).toContain("const publishRequested = params?.get('publish') === '1'");
  expect(shell).toContain('data-writers-publish-entry');
  expect(shell).toContain("next.set('publish', '1')");
  expect(home).not.toContain("onMode('produce')");
});
