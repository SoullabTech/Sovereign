#!/usr/bin/env node
// @ts-check
/** B5R8 — cross-field daily synthesis: few things deserve Kelly today. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const html=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace.html'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const synth=renderer.slice(renderer.indexOf('function deriveDailySynthesis'),renderer.indexOf('function renderToday'));
check(/fields\.filter\(f=>f\.bucket==='needs'\)/.test(synth),'B5R8-L1','Explicit founder obligations are the first synthesis input.');
check(/members\?\.memberItems/.test(synth) && /world\?\.worldItems/.test(synth),'B5R8-L2','Due Member and World follow-ups can enter the synthesis without becoming founder-authority claims.');
check(/protectedItems/.test(synth) && /kind:'protect'/.test(synth),'B5R8-L3','Protected founder work is preserved as its own class of attention.');
check(/slice\(0,3\)/.test(synth) && /attention\.length<3/.test(synth),'B5R8-L4','The primary synthesis is deliberately bounded to three visible items.');
check(/additional founder decision/.test(synth),'B5R8-L5','Bounded synthesis never hides additional founder obligations; it points to Needs Kelly below.');
check(/Missing visibility is not an all-clear/.test(synth),'B5R8-L6','Coverage gaps stay visible without becoming invented emergencies.');
check(/What deserves you today/.test(renderer) && /JARVIS synthesis/.test(renderer),'B5R8-L7','Today presents one cross-field attention summary before domain detail.');
check(/\.dailyAttentionGrid/.test(html) && /max-width:1100px/.test(html),'B5R8-L8','Daily synthesis has responsive presentation support.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(synth),'B5R8-L9','Synthesis adds no model, network, mutation, or execution authority.');

console.log(failures===0?'\nB5R8 DAILY SYNTHESIS: ALL LAWS HOLD (exit 0)':`\nB5R8 DAILY SYNTHESIS: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
