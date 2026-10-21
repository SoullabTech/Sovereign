#!/usr/bin/env node
// @ts-check
/** B5R3 — five-domain Founder attention intake, truthful about visibility. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const html=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace.html'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const domains=renderer.slice(renderer.indexOf('function deriveAttentionDomains'),renderer.indexOf('function attentionDomainCard'));
const today=renderer.slice(renderer.indexOf('function renderToday()'),renderer.indexOf('function workspaceCard'));

for (const name of ['Members','Team','Platform','World','Your Work']) {
  check(domains.includes(`label:'${name}'`),`B5R3-${name.replace(/\s/g,'').toUpperCase()}`,`${name} is a first-class attention domain.`);
}
check(/visibility:'not-connected'/.test(domains) && /visibility:teamObserved\?'partial':'not-connected'/.test(domains) && /visibility:platformObserved\?'observed':'not-connected'/.test(domains),'B5R3-L1','Every domain carries explicit visibility standing; absent evidence never becomes false calm.');
check(/will not interpret silence as nobody needing you/.test(domains),'B5R3-L2','Members absence is stated as lack of visibility, not lack of need.');
check(/not yet joined/.test(domains),'B5R3-L3','Team partial visibility discloses omitted human and partner channels.');
check(/will not guess what your deepest work should be/.test(domains),'B5R3-L4','Protected creative work is never inferred from noise.');
check(/work\.units · programme_state · monitor/.test(domains),'B5R3-L5','Platform visibility names its existing governed sources.');
check(/renderAttentionDomains\(fields\)/.test(today),'B5R3-L6','Today renders the five-domain visibility field before Needs Kelly.');
check(/Not connected/.test(renderer) && /Partial/.test(renderer) && /Observed/.test(renderer),'B5R3-L7','Human-readable visibility states are present.');
check(/\.attentionDomainGrid/.test(html) && /max-width:700px/.test(html),'B5R3-L8','Five-domain field has explicit responsive presentation support.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(domains),'B5R3-L9','Domain projection adds no network, model, mutation, or execution authority.');

console.log(failures===0?'\nB5R3 FIVE-DOMAIN INTAKE: ALL LAWS HOLD (exit 0)':`\nB5R3 FIVE-DOMAIN INTAKE: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
