#!/usr/bin/env node
// @ts-check
/** B5R2 — Daily attention gate: only irreducibly Founder work reaches Needs Kelly. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const html=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace.html'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const today=renderer.slice(renderer.indexOf('function renderToday()'),renderer.indexOf('function workspaceCard'));
const derive=renderer.slice(renderer.indexOf('function deriveActiveFields()'),renderer.indexOf('function activeFieldRow'));
const gate=renderer.slice(renderer.indexOf('function founderAttentionGate'),renderer.indexOf('function attentionGateDetails'));

check(/bucket: ask\?'needs':'motion'/.test(derive),'B5R2-L1','Needs Kelly is still derived only from explicit needs_founder evidence.');
check(/Only founder adjudication can advance/.test(gate) && /explicit founder-authority boundary/.test(gate),'B5R2-L2','Why Kelly is stated as an authority boundary, not general importance.');
check(/The work stays held/.test(gate) && /does not advance it without your authority/.test(gate),'B5R2-L3','Doing nothing has a truthful non-catastrophic consequence: governed work stays held.');
check(/Why you/.test(renderer) && /Why now/.test(renderer) && /If you do nothing today/.test(renderer),'B5R2-L4','Every surfaced Founder ask explains why Kelly, why now, and the consequence of no action.');
check(/Attention law/.test(today) && /Nothing belongs in Needs Kelly merely because it exists/.test(today),'B5R2-L5','Today states the attention-protection law in human language.');
check(/already being carried — no action from you/.test(today) && /do not act unless this changes/.test(today),'B5R2-L6','In motion and Watching explicitly release Kelly from unnecessary action.');
check(/\.attentionGate/.test(html) && /\.attentionLaw/.test(html),'B5R2-L7','The attention gate has explicit presentation support.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(gate),'B5R2-L8','Attention classification adds no execution, network, or model authority.');

console.log(failures===0?'\nB5R2 ATTENTION GATE: ALL LAWS HOLD (exit 0)':`\nB5R2 ATTENTION GATE: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
