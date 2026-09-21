import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { anthropicStructuredProvider } from '../anthropicStructuredAdapter';
const req = { model: 'synthetic', system: '', messages: [], maxTokens: 1 };
const provider = (create: () => unknown) => anthropicStructuredProvider({ client: { messages: { create } } as never });
it('HTTP refusal is observed without carrying provider prose', async () => {
  // Exercise the SDK through its sole approved adapter, against loopback only.
  const server = createServer((req, res) => {
    req.resume();
    req.on('end', () => { res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'PRIVATE_PROSE' } })); });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const before = { key: process.env.ANTHROPIC_API_KEY, url: process.env.ANTHROPIC_BASE_URL };
  process.env.ANTHROPIC_API_KEY = 'synthetic-test-key';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await expect(anthropicStructuredProvider().execute(req)).rejects.toMatchObject({ dispatch: 'response_observed', status: 400, message: 'Structured provider execution failed' });
  } finally {
    if (before.key === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = before.key;
    if (before.url === undefined) delete process.env.ANTHROPIC_BASE_URL; else process.env.ANTHROPIC_BASE_URL = before.url;
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
it('timeout does not establish no transmission', async () => {
  await expect(provider(() => { throw new Error('timeout'); }).execute(req)).rejects.toMatchObject({ dispatch: 'unknown' });
});
it('connection failure does not establish no transmission', async () => {
  await expect(provider(() => { throw new Error('connection refused'); }).execute(req)).rejects.toMatchObject({ dispatch: 'unknown' });
});
it('failure after receiving a message still establishes response observed', async () => {
  await expect(provider(() => Promise.resolve({ content: null })).execute(req)).rejects.toMatchObject({ dispatch: 'response_observed' });
});
it('a stream interrupted after connect records response observed', async () => {
  const stream = { on(_event: string, cb: () => void) { cb(); return this; }, async finalMessage() { throw new Error('lost connection'); } };
  const p = anthropicStructuredProvider({ client: { messages: { stream: () => stream } } as never });
  await expect(p.execute({ ...req, execution: { completion: 'long-running' } })).rejects.toMatchObject({ dispatch: 'response_observed' });
});
