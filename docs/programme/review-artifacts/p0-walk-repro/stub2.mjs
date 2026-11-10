import http from 'node:http'; import fs from 'node:fs';

function sendMsg(res, msg, stream) {
  if (!stream) { res.end(JSON.stringify(msg)); return; }
  res.setHeader('content-type', 'text/event-stream'); res.setHeader('cache-control', 'no-cache');
  const ev = (name, data) => res.write('event: ' + name + '\ndata: ' + JSON.stringify(data) + '\n\n');
  ev('message_start', { type: 'message_start', message: { ...msg, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } });
  (msg.content ?? []).forEach((blk, i) => {
    if (blk.type === 'tool_use') {
      ev('content_block_start', { type: 'content_block_start', index: i, content_block: { type: 'tool_use', id: blk.id, name: blk.name, input: {} } });
      ev('content_block_delta', { type: 'content_block_delta', index: i, delta: { type: 'input_json_delta', partial_json: JSON.stringify(blk.input) } });
    } else {
      ev('content_block_start', { type: 'content_block_start', index: i, content_block: { type: 'text', text: '' } });
      ev('content_block_delta', { type: 'content_block_delta', index: i, delta: { type: 'text_delta', text: blk.text ?? '' } });
    }
    ev('content_block_stop', { type: 'content_block_stop', index: i });
  });
  ev('message_delta', { type: 'message_delta', delta: { stop_reason: msg.stop_reason ?? 'end_turn', stop_sequence: null }, usage: { output_tokens: 1 } });
  ev('message_stop', { type: 'message_stop' });
  res.end();
}
const LOG = process.argv[2]; let n = 0;
const issued = [];   // anchors this stand-in handed out in plans, newest last
http.createServer((req, res) => { let b = ''; req.on('data', (c) => b += c); req.on('end', () => {
  let j = {}; try { j = JSON.parse(b); } catch {}
  const sys = typeof j.system === 'string' ? j.system : JSON.stringify(j.system ?? '');
  const marks = ['woke slowly', 'carried the nets', 'The letter came in March', 'leaving had been the long part', 'one claim: attention', 'clinic study', 'attention budget that interruptions', 'slowing down protects', 'two-hour block'];
  const allText = sys + '\n' + JSON.stringify(j.messages ?? []);
  const seen = ['The Harbour', 'Salt', 'The Letter', 'Return', 'The Scarce Resource', 'What the Clinic Found', 'The Attention Budget', 'Why Slowness Scales', 'What to Do on Monday'].filter((h, i) => allText.includes(marks[i]));
  fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), tools: (j.tools ?? []).map((t) => t.name), chaptersInFrontOfMaia: seen, standingPermission: sys.includes('STANDING PERMISSION'), settled: /WHAT THE WRITER HAS SETTLED/.test(sys), carriedReadings: sys.includes('YOUR EARLIER READINGS OF THIS WORK') }) + '\n');
  const base = { id: 'msg_stub', type: 'message', role: 'assistant', model: j.model ?? 'stub', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } };
  res.setHeader('content-type', 'application/json');
  const tnames = (j.tools ?? []).map((t) => t.name);
  const userText = (j.messages ?? []).map((m) => typeof m.content === 'string' ? m.content : (m.content ?? []).map((b) => b.text ?? '').join('')).join('\n');
  const DELAY = Number(process.env.STUB_READER_DELAY_MS || 0);
  if (tnames.includes('draft_reader_claims')) {
    const ids = [...userText.matchAll(/\n\s+\d+\. ([0-9a-f-]{36}) · BODY/g)].map((m) => m[1]);
    const TEXTS = [
      'The harbour appears here and returns later with the nets rather than the light.',
      'The prose moves from a wide view of the quay to one small object, the key in a pocket.',
      'A letter is mentioned before it is explained.',
      'Leaving is described as the long part, and the next chapter begins after it.'];
    const claims = TEXTS.map((text, i) => ({ text, refs: [{ kind: 'section', sectionId: ids[i % Math.max(1, ids.length)] }], doesNotEstablish: ['author-intent'] }));
    fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), role: 'reader', sectionsSeen: ids.length, claims: ids.length ? claims.length : 0, delayMs: DELAY }) + '\n');
    const out = ids.length ? { outcome: 'claims', claims } : { outcome: 'none' };
    setTimeout(() => sendMsg(res, { ...base, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_reader', name: 'draft_reader_claims', input: out }] }, j.stream), DELAY);
    return;
  }
  if (tnames.some((n) => /classif/i.test(n))) {
    const n = [...userText.matchAll(/^\[(\d+)\] /gm)].length;
    const PH = ['recurrence', 'movement', 'unresolved-thread', 'register-shift'];
    fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), role: 'classifier', claims: n }) + '\n');
    sendMsg(res, { ...base, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_class', name: tnames.find((x) => /classif/i.test(x)), input: { classifications: Array.from({ length: n }, (_, i) => ({ index: i, phenomenon: PH[i % PH.length] })) } }] }, j.stream);
    return;
  }
  if ((j.tools ?? []).some((t) => t.name === 'development_plan')) {
    // Plan: steps anchored to EXACT sentences from the chapters she was handed, plus one invented step that grounding must drop.
    const all = sys + '\n' + (j.messages ?? []).map((m) => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join('\n');
    const blocks = [...all.matchAll(/<chapter id="([0-9a-f-]{36})" heading="([^"]*)">\n([\s\S]*?)\n<\/chapter>/g)].map((m) => ({ h: m[2], id: m[1], text: m[3] }));
    const firstSentence = (t) => { const b = t.split('\n\n').slice(-1)[0]; const m = b.match(/^[^.!?]+[.!?]/); return (m ? m[0] : b.slice(0, 80)).trim(); };
    const steps = blocks.slice(0, 2).map((c) => ({ chapterId: c.id, anchor: firstSentence(c.text), direction: 'Try letting this opening answer what an earlier chapter promised.', why: 'It would tie the chapters together.' }));
    for (const st of steps) issued.push(st.anchor);
    if (blocks[0]) steps.push({ chapterId: blocks[0].id, anchor: 'a lighthouse that never appears in this book', direction: 'invented', why: '' });
    res.end(JSON.stringify({ ...base, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_plan' + (++n), name: 'development_plan',
      input: { summary: '[stand-in] A plan across ' + blocks.map((b) => b.h).join(', ') + '.', steps } }] }));
  } else if ((j.tools ?? []).length) {
    n++; const verbs = ['stirred', 'shifted', 'came to', 'opened', 'rose'];
    // Edit the passage actually held: the newest plan anchor present in this request, else the novel's opening sentence.
    const all2 = sys + '\n' + JSON.stringify(j.messages ?? []);
    const held = [...issued].reverse().find((a) => all2.includes(a));
    const original = held ?? 'The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke.';
    const rep = held
      ? (/ the /.test(held) ? held.replace(' the ', ' this ') : held.replace(/[.!?]$/, ', plainly.'))
      : original.replace('woke slowly', verbs[n % verbs.length] + ' slowly');
    res.end(JSON.stringify({ ...base, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_s' + n, name: (j.tool_choice && j.tool_choice.name) || j.tools[0].name,
      input: { kind: 'reply_with_proposal', reply: 'One small option, offered lightly. Your own wording may be better.', proposal: { replacementText: rep, rationale: 'Editorial purpose: Verb. A softer opening verb.' } } }] }));
  } else {
    res.end(JSON.stringify({ ...base, stop_reason: 'end_turn', content: [{ type: 'text', text: '[stand-in] Chapters in front of me: ' + (seen.join(', ') || 'none') + '.' }] }));
  }
}); }).listen(Number(process.argv[3]), '127.0.0.1');
