import { NextRequest } from 'next/server';

jest.mock('@/lib/manuscript/ingest/parseUpload', () => ({
  parseUpload: jest.fn(),
  UnsupportedUploadError: class UnsupportedUploadError extends Error {},
  UnsupportedDocxStructureError: class UnsupportedDocxStructureError extends Error {},
}));

const { parseUpload } = require('@/lib/manuscript/ingest/parseUpload') as { parseUpload: jest.Mock };
const { POST } = require('../route') as { POST: (request: NextRequest) => Promise<Response> };

const TOKEN = 'fictional-local-review-token-0123456789abcdef0123456789abcdef';

function request({
  host = '127.0.0.1',
  name = 'book.epub',
  token = TOKEN,
  forwardedHost,
}: {
  host?: string;
  name?: string;
  token?: string | null;
  forwardedHost?: string;
} = {}): NextRequest {
  const form = new FormData();
  form.append('file', new File(['fictional epub bytes'], name, { type: 'application/epub+zip' }));
  const headers = new Headers({ host });
  if (token) headers.set('cookie', `soullab_ws_local_review=${token}`);
  if (forwardedHost) headers.set('x-forwarded-host', forwardedHost);
  return new NextRequest(`http://${host}/api/writers-studio/local-review/import`, {
    method: 'POST',
    headers,
    body: form,
  });
}

describe('founder-local import review boundary', () => {
  const oldFlag = process.env.WS_FOUNDER_LOCAL_REVIEW;
  const oldToken = process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.WS_FOUNDER_LOCAL_REVIEW;
    delete process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN;
    parseUpload.mockResolvedValue({
      text: '# Chapter One\n\nFictional words.',
      warnings: ['Layout stays in the original.'],
      format: 'epub',
    });
  });

  afterAll(() => {
    if (oldFlag === undefined) delete process.env.WS_FOUNDER_LOCAL_REVIEW;
    else process.env.WS_FOUNDER_LOCAL_REVIEW = oldFlag;
    if (oldToken === undefined) delete process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN;
    else process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = oldToken;
  });

  it('is undiscoverable unless the local review process explicitly enables it', async () => {
    const response = await POST(request());
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(parseUpload).not.toHaveBeenCalled();
  });

  it('is undiscoverable when the process token is absent or too short', async () => {
    process.env.WS_FOUNDER_LOCAL_REVIEW = '1';
    process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = 'short';
    expect((await POST(request())).status).toBe(404);
    expect(parseUpload).not.toHaveBeenCalled();
  });

  it('is undiscoverable without the matching browser capability', async () => {
    process.env.WS_FOUNDER_LOCAL_REVIEW = '1';
    process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = TOKEN;
    expect((await POST(request({ token: null }))).status).toBe(404);
    expect((await POST(request({ token: TOKEN + 'wrong' }))).status).toBe(404);
    expect(parseUpload).not.toHaveBeenCalled();
  });

  it('refuses raw or forwarded non-loopback host claims even with the token', async () => {
    process.env.WS_FOUNDER_LOCAL_REVIEW = '1';
    process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = TOKEN;
    expect((await POST(request({ host: 'writer.example.test' }))).status).toBe(403);
    expect((await POST(request({ forwardedHost: 'writer.example.test' }))).status).toBe(403);
    expect(parseUpload).not.toHaveBeenCalled();
  });

  it('returns a nonpersistent preview only for loopback with the matching token', async () => {
    process.env.WS_FOUNDER_LOCAL_REVIEW = '1';
    process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN = TOKEN;
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(parseUpload).toHaveBeenCalledTimes(1);
    const body = await response.json();
    expect(body).toMatchObject({
      format: 'epub', title: 'book', sourceArrivalId: null,
      custody: 'none_local_review', persistent: false,
    });
    expect(body.text).toBe('# Chapter One\n\nFictional words.');
  });
});
