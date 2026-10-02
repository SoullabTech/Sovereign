/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — CONTROLLED LOOPBACK INFERENCE.
 *
 *   npx tsx scripts/witness/flagship/c1c1-loopback-inference.ts   (env LOOPBACK_PORT, default 4497)
 *
 * ⚠️ A DETERMINISTIC STAND-IN AT THE WIRE, downstream of prompt assembly. The
 * witness `next dev` process points `ANTHROPIC_BASE_URL` here so the editorial
 * turn's structured seam receives a well-formed tool_use answer without any
 * provider being reachable. ⛔ It reads nothing of the manuscript; it answers
 * with fixed words. ⛔ Never a production configuration. ⛔ Its reply is NOT
 * MAIA's cognition — every record that cites this walk must say so.
 *
 * Timing: an ask containing the word "slowly" is answered after 4s, so the
 * late-result and release laws can be exercised deterministically.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.LOOPBACK_PORT ?? '4497');
export const CONTROLLED_REPLY = 'Controlled witness reply: the sentence names an absence, and absences read flat unless something is listening for them. What were you hoping the far bank would hold?';

createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', () => {
    if (req.method !== 'POST' || !/\/v1\/messages/.test(req.url ?? '')) { res.writeHead(404); res.end(); return; }
    let body: { model?: string; tools?: { name: string }[]; messages?: { content: string }[] } = {};
    try { body = JSON.parse(raw); } catch { res.writeHead(400); res.end(); return; }
    const name = body.tools?.[0]?.name ?? 'editorial_outcome';
    const utterance = String(body.messages?.[0]?.content ?? '');
    const delay = /slowly/i.test(utterance) ? 4000 : 0;
    const payload = JSON.stringify({
      id: 'msg_c1c1_witness', type: 'message', role: 'assistant', model: body.model ?? 'unknown',
      content: [{ type: 'tool_use', id: 'toolu_c1c1_witness', name, input: { kind: 'reply_only', reply: CONTROLLED_REPLY } }],
      stop_reason: 'tool_use', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 },
    });
    setTimeout(() => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(payload); }, delay);
  });
}).listen(PORT, '127.0.0.1', () => { console.log(`loopback inference on 127.0.0.1:${PORT} (controlled, not MAIA)`); });
