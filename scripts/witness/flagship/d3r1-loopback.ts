/**
 * D3R1 controlled structured-inference stand-in.
 * Witness-only. It reads no manuscript truth; it responds from the tool schema.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.LOOPBACK_PORT ?? '4517');
const DISCUSS = 'Controlled D3 witness reply: the phrase holds distance in place without explaining it.';
const PROPOSAL_REPLY = 'Controlled D3 witness reply: here is one small wording possibility to read in context.';

createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', () => {
    if (req.method !== 'POST' || !/\/v1\/messages/.test(req.url ?? '')) {
      res.writeHead(404); res.end(); return;
    }
    let body: any;
    try { body = JSON.parse(raw); } catch { res.writeHead(400); res.end(); return; }
    const tool = body?.tools?.[0];
    const kinds = tool?.input_schema?.properties?.kind?.enum;
    const mayPropose = Array.isArray(kinds) && kinds.includes('reply_with_proposal');
    const input = mayPropose
      ? {
          kind: 'reply_with_proposal',
          reply: PROPOSAL_REPLY,
          proposal: {
            replacementText: 'far shore',
            rationale: 'Editorial purpose: Quieter edge. Keeps the distance while changing one small phrase.',
          },
        }
      : { kind: 'reply_only', reply: DISCUSS };
    const payload = JSON.stringify({
      id: 'msg_d3r1_witness',
      type: 'message',
      role: 'assistant',
      model: body?.model ?? 'claude-opus-5',
      content: [{
        type: 'tool_use',
        id: 'toolu_d3r1_witness',
        name: tool?.name ?? 'editorial_outcome',
        input,
      }],
      stop_reason: 'tool_use',
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(payload);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`D3R1 loopback on 127.0.0.1:${PORT} — controlled witness, not MAIA cognition`);
});
