#!/usr/bin/env node
// @ts-check
/** B5R5 — privacy-minimized member attention projection. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adaptMemberAttention } from '../../../scripts/builder/founder-workspace/adapters.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const organs=readFileSync(path.join(ROOT,'scripts/builder/founder-workspace/read-organs.mjs'),'utf8');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const validator=readFileSync(path.join(ROOT,'scripts/builder/founder-workspace/viewmodel-v1.mjs'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const readSource=organs.slice(organs.indexOf('export async function readFounderOpsAttention'),organs.indexOf('export function readFounderFocus'));
check(/ops_contacts/.test(readSource) && /next_action/.test(readSource) && /next_action_date/.test(readSource),'B5R5-L1','Member attention reuses Founder Ops follow-up state rather than creating a second CRM.');
check(!/SELECT[^;]*(email|notes|manuscript|conversation)/is.test(readSource),'B5R5-L2','The member attention SELECT excludes email, notes, manuscript and conversation content.');
check(/member_id IS NOT NULL OR c\.contact_type = 'beta_tester'/.test(readSource),'B5R5-L3','The first member intake is limited to linked members or beta testers, not general leads.');
check(/database read unavailable/.test(readSource) && !/e\.message/.test(readSource),'B5R5-L4','Database failure surfaces structurally without carrying free-form database error text.');

const synthetic=adaptMemberAttention({present:true,observed_at:'2026-10-05T11:30:00Z',source:'ops_contacts:minimized-followups',unreadable:[],items:[{id:'1',name:'Beta Tester',relationship:'beta_tester',stage:'active',next_action:'Reply to feedback',due_at:'2026-10-05T12:00:00Z',evidence_state:'OBSERVED'}]});
check(synthetic.visibility==='partial' && synthetic.items.length===1,'B5R5-L5','Founder Ops visibility stays partial because it is not the whole member field.');
check(/memberAttention=vm\.work\?\.member_attention/.test(renderer) && /not a complete all-clear/.test(renderer),'B5R5-L6','Today discloses partial member visibility instead of claiming silence means no need.');
check(/for \(const forbidden of \['email','notes','content','conversation','manuscript'\]\)/.test(validator),'B5R5-L7','The view-model validator rejects sensitive content fields in member attention rows.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(readSource),'B5R5-L8','The member read organ adds no model, execution, or mutation authority.');

console.log(failures===0?'\nB5R5 MEMBER ATTENTION: ALL LAWS HOLD (exit 0)':`\nB5R5 MEMBER ATTENTION: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
