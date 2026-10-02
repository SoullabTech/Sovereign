/**
 * O5-R3 RB-A4 — C6B GRANT EVENT PURITY falsifiers.
 * Every fixture is a real governed home on disk.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const CAN = path.join('work-units-v2', 'execution-grants');
const HUM = 'execution-grants';
const sha = (b) => 'sha256:' + crypto.createHash('sha256').update(b).digest('hex');
const rel = (id, store = CAN) => path.join(store, `${id}.jsonl`);

const grant = (id = 'wu-a', over = {}) => ({
  grant_version: 'E1-GRANT.v1',
  grant_id: 'e1-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  work_unit_id: id,
  actor_kind: 'human',
  authorization_act: 'JARVIS_DESKTOP_E1_AUTHORIZE_ONCE',
  one_shot: true,
  non_transferable: true,
  ...over,
});
const issued = (id = 'wu-a', over = {}) => JSON.stringify({ event: 'ISSUED', at: '2026-10-01T21:47:22.074Z', grant: grant(id, over) }) + '\n';
const event = (type, fields = {}) => JSON.stringify({ event: type, at: '2026-10-01T21:47:25.242Z', ...fields }) + '\n';

function capture(home) {
  const files = {};
  for (const store of [CAN, HUM]) {
    const dir = path.join(home, store);
    let ents = []; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) if (e.isFile() && e.name.endsWith('.jsonl')) {
      const b = fs.readFileSync(path.join(dir, e.name));
      files[path.join(store, e.name)] = { size: b.length, sha: sha(b) };
    }
  }
  return { files };
}
function world() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r3-ep-'));
  const put = (r, data) => { fs.mkdirSync(path.dirname(path.join(home, r)), { recursive: true }); fs.writeFileSync(path.join(home, r), data); };
  const append = (r, data) => fs.appendFileSync(path.join(home, r), data);
  put(rel('wu-a'), issued('wu-a', { grant_id: 'e1-oldoldoldoldoldoldoldoldoldold12' }));
  put(rel('wu-h', HUM), issued('wu-h', { grant_id: 'e1-oldoldoldoldoldoldoldoldoldold34' }));
  return { home, put, append };
}
async function scenario(S, mutate) {
  const W = world();
  try {
    const before = capture(W.home);
    mutate(W);
    const after = capture(W.home);
    return S.judge(before, after, W.home);
  } finally { fs.rmSync(W.home, { recursive: true, force: true }); }
}
const rules = (r) => r.violations.map((x) => x.rule);
const result = (failures) => ({ pass: failures.length === 0, failures });

async function expectPass(S, name, mutate) {
  const r = await scenario(S, mutate);
  return r.ok ? [] : [`${name}: expected PASS, got ${r.violations.map((x) => `${x.rule} ${x.detail}`).join(' | ')}`];
}
async function expectRule(S, name, rule, mutate) {
  const r = await scenario(S, mutate);
  if (r.ok) return [`${name}: expected ${rule}, got PASS`];
  return rules(r).includes(rule) ? [] : [`${name}: expected ${rule}, got ${rules(r).join(',')}`];
}

export const EP_FALSIFIERS = {
  'EP-1 exactly one lawful ISSUED delta passes': async (S) => result([
    ...await expectPass(S, 'existing ledger', (W) => W.append(rel('wu-a'), issued('wu-a'))),
    ...await expectPass(S, 'new ledger', (W) => W.put(rel('wu-new'), issued('wu-new'))),
  ]),
  'EP-2 two grant ledgers changed': async (S) => result(
    await expectRule(S, 'two ledgers', 'E1', (W) => {
      W.append(rel('wu-a'), issued('wu-a'));
      W.append(rel('wu-h', HUM), issued('wu-h'));
    })),
  'EP-3 ISSUE plus CLAIM is not one authorization event': async (S) => result(
    await expectRule(S, 'walk defect', 'E2', (W) => {
      W.append(rel('wu-a'), issued('wu-a') + event('CLAIMED', { grant_id: 'e1-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }));
    })),

  'EP-4 non-ISSUED single event is refused': async (S) => result([
    ...await expectRule(S, 'CLAIMED only', 'E3', (W) => W.append(rel('wu-a'), event('CLAIMED', { grant: grant('wu-a') }))),
    ...await expectRule(S, 'CONSUMED only', 'E3', (W) => W.append(rel('wu-a'), event('CONSUMED', { grant: grant('wu-a') }))),
    ...await expectRule(S, 'REVOKED only', 'E3', (W) => W.append(rel('wu-a'), event('REVOKED', { grant: grant('wu-a') }))),
  ]),
  'EP-5 malformed or incomplete delta is refused': async (S) => result([
    ...await expectRule(S, 'malformed JSON', 'E2', (W) => W.append(rel('wu-a'), '{"event":"ISSUED"\n')),
    ...await expectRule(S, 'no terminal newline', 'E2', (W) => W.append(rel('wu-a'), JSON.stringify({ event: 'ISSUED', grant: grant('wu-a') }))),
    ...await expectRule(S, 'invalid UTF-8', 'E2', (W) => W.append(rel('wu-a'), Buffer.from([0xff, 0x0a]))),
  ]),
  'EP-6 grant must name its ledger Work Unit': async (S) => result(
    await expectRule(S, 'wrong Work Unit', 'E4', (W) => W.append(rel('wu-a'), issued('wu-other')))),
  'EP-7 exact one-shot human authorization semantics required': async (S) => result([
    ...await expectRule(S, 'machine actor', 'E5', (W) => W.append(rel('wu-a'), issued('wu-a', { actor_kind: 'system' }))),
    ...await expectRule(S, 'wrong act', 'E5', (W) => W.append(rel('wu-a'), issued('wu-a', { authorization_act: 'OTHER_ACT' }))),
    ...await expectRule(S, 'not one-shot', 'E5', (W) => W.append(rel('wu-a'), issued('wu-a', { one_shot: false }))),

    ...await expectRule(S, 'transferable', 'E5', (W) => W.append(rel('wu-a'), issued('wu-a', { non_transferable: false }))),
    ...await expectRule(S, 'wrong grant version', 'E5', (W) => W.append(rel('wu-a'), issued('wu-a', { grant_version: 'OTHER.v1' }))),
  ]),
  'EP-8 prior bytes define the delta boundary': async (S) => result(
    await expectRule(S, 'rewrite prefix then append', 'E2', (W) => {
      const f = path.join(W.home, rel('wu-a'));
      const old = fs.readFileSync(f, 'utf8').replace('"ISSUED"', '"ALTERD"');
      fs.writeFileSync(f, old + issued('wu-a'));
    })),
  'EP-9 two ISSUED events are still two events': async (S) => result(
    await expectRule(S, 'double issue', 'E2', (W) =>
      W.append(rel('wu-a'), issued('wu-a') + issued('wu-a', { grant_id: 'e1-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' })))),
};
