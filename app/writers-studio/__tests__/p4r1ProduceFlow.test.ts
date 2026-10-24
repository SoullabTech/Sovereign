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
  expect(container.textContent).toContain('Your current working draft is the source identified for a possible edition.');
  expect(container.textContent).toContain('2 · Publishing path');
  expect(container.textContent).toContain('Amazon KDP · Paperback');
  expect(container.textContent).toContain('Soullab Press');
  expect(container.textContent).toContain('3 · Edition setup');
  expect(container.textContent).toContain('4 · Interior readiness');
  expect(container.textContent).toContain('5 · Edition files');
  expect(container.textContent).toContain('Interior PDF · in verification');
  expect(container.textContent).toContain('No structural blockers found in these preliminary checks.');
  expect(container.textContent).toContain('not a KDP approval');
  expect(container.textContent).toContain('This preview makes no publication file and submits nothing.');
  expect(container.querySelector('[data-publish-availability]')?.getAttribute('data-publish-availability')).toBe('preview-only');
  const held = container.querySelector('[data-publish-export="held"]') as HTMLButtonElement;
  expect(held.disabled).toBe(true);
  await act(async () => { held.click(); });
  expect(apiFetch).toHaveBeenCalledTimes(1);
  expect(apiFetch.mock.calls[0][1]).toEqual({method: 'GET'});
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
      exportsCertified: true, // explicitly certified harness, not the beta Home caller
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
  expect(container.textContent).toContain('Interior PDF · in verification');
  expect(container.textContent).toContain('EPUB3 · in verification');
  expect(container.textContent).toContain('Exploring Soullab Press here is not an application');
  expect(container.querySelectorAll('[data-publish-export="held"]')).toHaveLength(2);
  expect(apiFetch).toHaveBeenCalledTimes(1);

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

  expect(home).toContain('Publish · Preview');
  expect(home).toContain('<P4R1ProducePanel');
  expect(home).toContain('produceInitially={props.publishRequested}');
  expect(home).toContain('setProducing(produceInitially)');
  expect(home).not.toContain('if (produceInitially) setProducing(true)');
  expect(controller).toContain("const publishRequested = params?.get('publish') === '1'");
  expect(shell).toContain('data-writers-publish-entry');
  expect(shell).toContain("next.set('publish', '1')");
  expect(home).not.toContain("onMode('produce')");
});


test('the beta preview can explore ebook plans without requesting an export', async () => {
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    ready: true, title: 'Poems in Progress', sectionCount: 5,
    sourceAuthority: 'source', sourceRevision: null, issues: [],
    publicationBoundary: 'This creates a file from your current writing. It does not publish or distribute it.',
  }));
  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, { manuscriptId: 'poetry-1', onClose: jest.fn() }));
  });
  const kindle = Array.from(container.querySelectorAll('button[role="radio"]'))
    .find(button => button.textContent?.includes('Kindle / EPUB')) as HTMLButtonElement;
  expect(kindle).toBeDefined();
  await act(async () => kindle.click());
  expect(kindle.getAttribute('aria-checked')).toBe('true');
  expect(container.textContent).toContain('Reflowable ebook');
  expect(container.textContent).toContain('EPUB3 · in verification');
  const download = container.querySelector('[data-publish-export="held"]') as HTMLButtonElement;
  expect(download.disabled).toBe(true);
  await act(async () => download.click());
  expect(apiFetch).toHaveBeenCalledTimes(1);
  expect(apiFetch).toHaveBeenCalledWith('/api/sovereign/manuscripts/poetry-1/render', {method:'GET'});
});

test('a failed preflight remains a preview; no render, submission, or invented readiness', async () => {
  apiFetch.mockResolvedValueOnce(jsonResponse(503, {error:'Preflight temporarily unavailable'}));
  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, { manuscriptId:'m1', onClose:jest.fn() }));
  });
  expect(container.textContent).toContain('Beta preview');
  expect(container.textContent).toContain('Preflight temporarily unavailable');
  expect(container.textContent).not.toContain('No structural blockers found');
  expect(container.querySelector('[data-publish-export="enabled"]')).toBeNull();
  expect(apiFetch).toHaveBeenCalledTimes(1);
});

test('certified mode prepares the EPUB only after an explicit author click', async () => {
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    ready:true, title:'Poems in Progress', sectionCount:4, sourceAuthority:'working_draft',
    sourceRevision:'3', issues:[], publicationBoundary:'This creates a file from your current writing. It does not publish or distribute it.',
  }));
  apiFetch.mockResolvedValueOnce({
    ok:true, status:200,
    headers:new Headers({'content-type':'application/epub+zip','content-disposition':'attachment; filename="Poems.epub"'}),
    blob:async () => new Blob(['epub']),
  });
  await act(async () => {
    root.render(React.createElement(P4R1ProducePanel, {manuscriptId:'m1', onClose:jest.fn(), exportsCertified:true}));
  });
  const kindle = Array.from(container.querySelectorAll('button[role="radio"]'))
    .find(button => button.textContent?.includes('Kindle / EPUB')) as HTMLButtonElement;
  await act(async () => kindle.click());
  expect(apiFetch).toHaveBeenCalledTimes(1);
  const epub = Array.from(container.querySelectorAll('button'))
    .find(button => button.textContent?.includes('Create EPUB')) as HTMLButtonElement;
  expect(epub.disabled).toBe(false);
  await act(async () => epub.click());
  expect(apiFetch).toHaveBeenLastCalledWith('/api/sovereign/manuscripts/m1/render',
    expect.objectContaining({method:'POST',body:JSON.stringify({format:'epub'})}));
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(container.textContent).toContain('EPUB prepared for Kindle / EPUB');
});
