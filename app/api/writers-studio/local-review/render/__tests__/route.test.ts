import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';

jest.mock('@/lib/manuscript/render/renderMemberBook', () => {
  const actual = jest.requireActual('@/lib/manuscript/render/renderMemberBook');
  return { ...actual, renderMemberBook: jest.fn() };
});
jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

import { promises as fs } from 'node:fs';
import { computeSourceHash, renderMemberBook } from '@/lib/manuscript/render/renderMemberBook';
import { POST } from '../route';

const mockedRender = renderMemberBook as jest.Mock;
const mockedRead = fs.readFile as jest.Mock;
const mockedUnlink = fs.unlink as jest.Mock;
const TOKEN = 'fictional-local-review-token-0123456789abcdef0123456789abcdef';

const SECTIONS = [
  {
    heading: 'Chapter One',
    headingDepth: 1,
    headingSignal: 'member',
    body: 'The fictional lantern crossed the river.',
  },
];

function request(
  body: unknown,
  { host = '127.0.0.1', token = TOKEN, forwardedHost }: {
    host?: string; token?: string | null; forwardedHost?: string;
  } = {},
): NextRequest {
  const headers = new Headers({ 'content-type': 'application/json', host });
  if (token) headers.set('cookie', `soullab_ws_local_review=${token}`);
  if (forwardedHost) headers.set('x-forwarded-host', forwardedHost);
  return new NextRequest(`http://${host}/api/writers-studio/local-review/render`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
}

function enable(): void {
  process.env.WS_FOUNDER_LOCAL_REVIEW = '1';
  process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = TOKEN;
}

describe('founder-local render boundary', () => {
  const old = process.env.WS_FOUNDER_LOCAL_REVIEW;
  const oldToken = process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.WS_FOUNDER_LOCAL_REVIEW;
    delete process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN;
    mockedRead.mockResolvedValue(Buffer.from('%PDF-fictional'));
    mockedUnlink.mockResolvedValue(undefined);
    mockedRender.mockResolvedValue({
      filePath: '/private/tmp/fictional-local-review.pdf',
      sizeBytes: 15,
      pageCount: 3,
      sourceHash: computeSourceHash(SECTIONS),
      sectionCount: 1,
      productionProfile: 'hallmark-6x9-v1',
    });
  });

  afterAll(() => {
    if (old === undefined) delete process.env.WS_FOUNDER_LOCAL_REVIEW;
    else process.env.WS_FOUNDER_LOCAL_REVIEW = old;
    if (oldToken === undefined) delete process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN;
    else process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = oldToken;
  });

  it('is a 404 unless the server process explicitly enables founder local review', async () => {
    const response = await POST(request({ action: 'inspect', title: 'Fictional', sections: SECTIONS }));
    expect(response.status).toBe(404);
    expect(mockedRender).not.toHaveBeenCalled();
  });

  it('is undiscoverable without the process token or matching browser capability', async () => {
    process.env.WS_FOUNDER_LOCAL_REVIEW = '1';
    expect((await POST(request({ action: 'inspect', title: 'Fictional', sections: SECTIONS }))).status).toBe(404);
    process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = TOKEN;
    expect((await POST(request({ action: 'inspect', title: 'Fictional', sections: SECTIONS }, { token: null }))).status).toBe(404);
    expect(mockedRender).not.toHaveBeenCalled();
  });

  it('refuses a non-loopback host even with the process flag', async () => {
    enable();
    const response = await POST(request(
      { action: 'inspect', title: 'Fictional', sections: SECTIONS },
      { host: 'writer.example.test' },
    ));
    expect(response.status).toBe(403);
    expect(mockedRender).not.toHaveBeenCalled();
  });

  it('inspects the exact ephemeral sections without rendering or persisting', async () => {
    enable();
    const response = await POST(request({ action: 'inspect', title: 'Fictional', sections: SECTIONS }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    const body = await response.json();
    expect(body).toMatchObject({
      ready: true,
      title: 'Fictional',
      sectionCount: 1,
      sourceAuthority: 'local_review',
      sourceRevision: computeSourceHash(SECTIONS),
      issues: [],
      localReview: true,
      persistent: false,
    });
    expect(mockedRender).not.toHaveBeenCalled();
    expect(mockedRead).not.toHaveBeenCalled();
  });

  it('keeps the existing production preflight blockers', async () => {
    enable();
    const sections = [{ heading: 'Notes', headingDepth: 1, body: 'Copyright 2026 Fictional Author' }];
    const inspect = await POST(request({ action: 'inspect', title: 'Fictional', sections }));
    const body = await inspect.json();
    expect(body.ready).toBe(false);
    expect(body.issues.map((issue: { code: string }) => issue.code)).toContain('copyright_not_governed');

    const render = await POST(request({ action: 'render', format: 'pdf', title: 'Fictional', sections }));
    expect(render.status).toBe(409);
    expect(mockedRender).not.toHaveBeenCalled();
  });

  it('streams one review artifact and deletes its temporary server file', async () => {
    enable();
    const sourceHash = computeSourceHash(SECTIONS);
    const response = await POST(request({
      action: 'render',
      format: 'pdf',
      title: 'Fictional River',
      sections: SECTIONS,
      expectedSourceHash: sourceHash,
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('x-soullab-local-review')).toBe('1');
    expect(response.headers.get('x-soullab-source-hash')).toBe(sourceHash);
    const artifactBytes = Buffer.from('%PDF-fictional');
    expect(response.headers.get('x-soullab-artifact-sha256'))
      .toBe(createHash('sha256').update(artifactBytes).digest('hex'));
    expect(response.headers.get('x-soullab-artifact-bytes')).toBe(String(artifactBytes.byteLength));
    expect(response.headers.get('content-disposition')).toContain('LOCAL-REVIEW.pdf');
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe('%PDF-fictional');
    expect(mockedRender).toHaveBeenCalledWith(SECTIONS, {
      title: 'Fictional River',
      author: null,
      format: 'pdf',
    });
    expect(mockedRead).toHaveBeenCalledWith('/private/tmp/fictional-local-review.pdf');
    expect(mockedUnlink).toHaveBeenCalledWith('/private/tmp/fictional-local-review.pdf');
  });

  it('refuses a changed source witness before rendering', async () => {
    enable();
    const response = await POST(request({
      action: 'render',
      format: 'epub',
      title: 'Fictional River',
      sections: SECTIONS,
      expectedSourceHash: '0'.repeat(64),
    }));
    expect(response.status).toBe(409);
    expect(mockedRender).not.toHaveBeenCalled();
  });
});
