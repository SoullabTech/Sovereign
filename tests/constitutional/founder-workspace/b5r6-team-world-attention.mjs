#!/usr/bin/env node
// @ts-check
/** B5R6 — Team + World attention projections. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adaptTeamAttention, adaptWorldAttention } from '../../../scripts/builder/founder-workspace/adapters.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const organs=readFileSync(path.join(ROOT,'scripts/builder/founder-workspace/read-organs.mjs'),'utf8');
const validator=readFileSync(path.join(ROOT,'scripts/builder/founder-workspace/viewmodel-v1.mjs'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const team=adaptTeamAttention({handoffs:[{handoff_id:'h1',source:'chatgpt',field:'Writer Studio',summary:'Review complete',created_at:'2026-10-05T11:00:00Z'}]},[]);
check(team.visibility==='partial' && team.items[0].authority==='orientation_only','B5R6-L1','AI partner handoffs make Team partial and remain orientation-only.');
check(/Human-team channels are not yet joined/.test(renderer),'B5R6-L2','Team never claims completeness before human-team channels exist.');

const world=adaptWorldAttention({present:true,source:'ops_contacts:minimized-followups',observed_at:'2026-10-05T11:00:00Z',unreadable:[],world_items:[{id:'w1',name:'Partner',relationship:'partner',stage:'exploring',next_action:'Reply',due_at:null,evidence_state:'OBSERVED'}]});
check(world.visibility==='partial' && world.items.length===1,'B5R6-L3','Founder Ops world follow-ups are admitted as a partial world view.');
const ops=organs.slice(organs.indexOf('export async function readFounderOpsAttention'),organs.indexOf('export function readFounderFocus'));
check(/contact_type IN \('lead','partner','press'\)/.test(ops),'B5R6-L4','World intake is limited to lead, partner, and press contacts.');
check(!/SELECT[^;]*(email|notes|manuscript|conversation)/is.test(ops),'B5R6-L5','World intake excludes sensitive/free-form content fields.');
check(/campaign and market signals are not yet joined/.test(renderer),'B5R6-L6','World explicitly discloses missing campaign/market visibility.');
check(/team_attention/.test(validator) && /world_attention/.test(validator),'B5R6-L7','The validated view-model governs Team and World projection shape.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(ops),'B5R6-L8','Team/World additions create no model, execution, or mutation authority.');

console.log(failures===0?'\nB5R6 TEAM + WORLD: ALL LAWS HOLD (exit 0)':`\nB5R6 TEAM + WORLD: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
