/**
 * WS2-NAV-01 — the member act, and what it must never do.
 */
import { confirmSectionBreaks, SECTION_BREAKS_COPY } from '../confirmSectionBreaks';

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

describe('the act sends the EXISTING explicit command, unchanged', () => {
  it('POSTs { convert: true } to the draft route and nothing else', async () => {
    const calls: Array<[string, RequestInit]> = [];
    const fetcher = async (u: string, i: RequestInit) => { calls.push([u, i]); return ok(); };

    const out = await confirmSectionBreaks('m-1', fetcher);

    expect(out).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/api/sovereign/manuscripts/m-1/draft');
    expect(calls[0][1].method).toBe('POST');
    expect(JSON.parse(String(calls[0][1].body))).toEqual({ convert: true });
  });

  it('carries no content — conversion is not a save', async () => {
    let body: Record<string, unknown> = {};
    await confirmSectionBreaks('m-1', async (_u, i) => {
      body = JSON.parse(String(i.body)); return ok();
    });
    expect(Object.keys(body)).toEqual(['convert']);
    expect(body).not.toHaveProperty('content');
    expect(body).not.toHaveProperty('sections');
  });
});

describe('failure is never optimistic success', () => {
  it('reports the server\'s own reason when it names one', async () => {
    const out = await confirmSectionBreaks('m-1', async () =>
      new Response(JSON.stringify({ error: 'draft has moved since those breaks were detected' }), { status: 409 }));
    expect(out).toEqual({ ok: false, message: 'draft has moved since those breaks were detected' });
  });

  it('falls back to copy that says the draft is unchanged', async () => {
    const out = await confirmSectionBreaks('m-1', async () => new Response('not json', { status: 500 }));
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.message).toMatch(/unchanged/i);
  });

  it('a thrown request is a failure, not a silent pass', async () => {
    const out = await confirmSectionBreaks('m-1', async () => { throw new Error('offline'); });
    expect(out.ok).toBe(false);
  });
});

describe('the copy tells the member what the act does', () => {
  it('names the act and the durability it creates', () => {
    expect(SECTION_BREAKS_COPY.action).toBe('Confirm section breaks');
    expect(SECTION_BREAKS_COPY.body).toMatch(/durable/i);
    expect(SECTION_BREAKS_COPY.title).toMatch(/not yet navigable/i);
  });
});
