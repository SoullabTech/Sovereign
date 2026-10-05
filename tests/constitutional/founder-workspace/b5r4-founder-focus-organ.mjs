#!/usr/bin/env node
// @ts-check
/** B5R4 — explicit founder-focus organ for protected creative work. */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readFounderFocus, FOUNDER_FOCUS_VERSION } from '../../../scripts/builder/founder-workspace/read-organs.mjs';
import { adaptFounderFocus } from '../../../scripts/builder/founder-workspace/adapters.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const tmp=mkdtempSync(path.join(os.tmpdir(),'founder-focus-'));
try {
  const absent=readFounderFocus({home:tmp});
  check(absent.present===false && absent.focus.length===0,'B5R4-L1','Missing focus storage is observed as absent and is not created on read.');

  const dir=path.join(tmp,'.jarvis'); mkdirSync(dir,{recursive:true});
  const file=path.join(dir,'founder-focus.v1.json');
  writeFileSync(file,JSON.stringify({
    schema:FOUNDER_FOCUS_VERSION,
    authority:'founder-explicit',
    updated_at:'2026-10-05T11:30:00.000Z',
    focus:[{id:'elemental-alchemy',label:'Elemental Alchemy',intention:'Refine the manuscript while preserving Kelly’s voice.',next_act:'Continue the Trinity restoration.'}]
  },null,2));
  const observed=readFounderFocus({home:tmp});
  check(observed.present===true && observed.focus.length===1 && observed.focus[0].authority==='founder-explicit','B5R4-L2','A valid explicit founder focus is read as observed evidence.');
  const adapted=adaptFounderFocus(observed);
  check(adapted.visibility==='observed' && adapted.items[0].label==='Elemental Alchemy','B5R4-L3','The view model exposes explicit focus without inferring from activity.');

  writeFileSync(file,JSON.stringify({schema:FOUNDER_FOCUS_VERSION,authority:'machine-inferred',updated_at:'2026-10-05T11:30:00.000Z',focus:[]}));
  const refused=readFounderFocus({home:tmp});
  check(refused.unreadable.length===1 && refused.focus.length===0,'B5R4-L4','Non-founder authority is refused rather than silently admitted.');
} finally { rmSync(tmp,{recursive:true,force:true}); }

const focusSource=renderer.slice(renderer.indexOf('function deriveAttentionDomains'),renderer.indexOf('function renderAttentionDomains'));
check(/founderFocus=vm\.work\?\.founder_focus/.test(focusSource),'B5R4-L5','Your Work visibility is driven by the explicit focus organ.');
check(/will not guess what your deepest work should be/.test(focusSource),'B5R4-L6','Absent focus remains an explicit non-inference boundary.');
check(/protectedWorkItem/.test(renderer) && /Next act/.test(renderer),'B5R4-L7','Observed focus renders intention and next act in Today.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(focusSource),'B5R4-L8','Protected-focus projection adds no model, network, mutation, or execution authority.');

console.log(failures===0?'\nB5R4 FOUNDER FOCUS: ALL LAWS HOLD (exit 0)':`\nB5R4 FOUNDER FOCUS: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
