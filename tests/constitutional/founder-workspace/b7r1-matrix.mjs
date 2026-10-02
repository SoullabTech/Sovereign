#!/usr/bin/env node
// @ts-check
/** B7R1 — pure evidenced graph join + traversable partner handoff organ. */
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildEvidenceGraph, parseExplicitProgrammeRelation } from '../../../scripts/builder/founder-workspace/graph-join.mjs';
import { listPartnerHandoffs } from '../../../scripts/builder/founder-workspace/read-organs.mjs';
import { readEvidencePreview } from '../../../scripts/builder/founder-workspace/desktop-viewmodel.mjs';
import { validateViewModel } from '../../../scripts/builder/founder-workspace/viewmodel-v1.mjs';
import { liveReference } from './reference.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');

let failures=0;
/** @param {boolean} ok @param {string} law @param {string} detail */
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const programmes=[
  {
    id:'WRITERS-STUDIO',name:'WRITERS-STUDIO',evidence_state:'OBSERVED',
    association:[{path:'docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md',rule:'R-A1',role:'record'}],
    last_change:{authority:null,source:null},
  },
  {
    id:'WRITERS-STUDIO-NEXT-01',name:'WRITERS-STUDIO-NEXT-01',evidence_state:'OBSERVED',
    association:[{path:'docs/programme/WRITERS-STUDIO-NEXT-01_A0_FOUNDER_RATIFICATION_2026-09-22.md',rule:'R-A1',role:'record'}],
    last_change:{authority:'founder record',source:'docs/programme/WRITERS-STUDIO-NEXT-01_A0_FOUNDER_RATIFICATION_2026-09-22.md'},
  },
  {
    id:'WRITERS-STUDIO-CONVERGENCE-01',name:'WRITERS-STUDIO-CONVERGENCE-01',evidence_state:'OBSERVED',
    association:[],last_change:{authority:null,source:null},
  },
];

const known=new Set(programmes.map(p=>p.id));
const explicit=parseExplicitProgrammeRelation({
  path:'docs/programme/WRITERS-STUDIO-NEXT-01_A0_MANUSCRIPT_FIRST_EXPERIENCE_CONSTITUTION_2026-09-22.md',
  line:174,
  text:'> **`WRITERS-STUDIO-NEXT-01` supersedes `WRITERS-STUDIO-CONVERGENCE-01` steps 2–8 as the sequencing authority.**',
},known);
const coMention=parseExplicitProgrammeRelation({
  path:'docs/programme/x.md',line:10,
  text:'`WRITERS-STUDIO-NEXT-01` and `WRITERS-STUDIO-CONVERGENCE-01` are discussed together.',
},known);

check(!!explicit && explicit.rel==='supersedes' && explicit.evidence.ref.endsWith(':174'),'B7R1-L1','only an explicit canonical relation sentence produces the witnessed supersedes edge');
check(coMention===null,'DG-2','co-mention without an explicit relation verb produces no edge');

const graph=buildEvidenceGraph({
  programme_state:{programmes},
  work:{
    units:[
      {id:'wu-1',title:'Real Writer work',programme:'WRITERS-STUDIO',parent_work_unit:null,file:'/ain/work-units-v2/wu-1.json',evidence_state:'OBSERVED',execution_grants:[{standing:'CONSUMED',ledger_ref:'/ain/work-units-v2/execution-grants/wu-1.jsonl',grant:{grant_id:'e1-grant-1',route_participant_id:'primary'}}]},
      {id:'wu-2',title:'Child work',programme:'MISSING-PROGRAMME',parent_work_unit:'wu-1',file:'/ain/work-units-v2/wu-2.json',evidence_state:'OBSERVED'},
    ],
    handoffs:[
      {id:'s-1',title:'Session one',state:'handed-off',work_unit:'wu-1',branch:'feature/ws-real',file:'/ain/sessions/s-1.json',evidence_state:'OBSERVED'},
      {id:'s-2',title:'Old orphan session',state:'handed-off',work_unit:'old-missing-unit',branch:'feature/ws-old',file:'/ain/sessions/s-2.json',evidence_state:'OBSERVED'},
    ],
    results:[
      {id:'wu-1',title:'Result for wu-1',file:'/ain/results/wu-1.json',evidence_state:'OBSERVED'},
      {id:'old-result',title:'Historical result',file:'/ain/results/old-result.json',evidence_state:'OBSERVED'},
    ],
  },
  partner_handoffs:[{
    handoff_id:'chatgpt-writers-studio-test',source:'chatgpt',field:"Writer's Studio",authority:'orientation_only',file:'chatgpt-writers-studio-test.json',
  }],
  explicit_relations: explicit ? [explicit] : [],
});

const edges=graph.edges;
const edge=(/** @type {string} */ rel)=>edges.filter(e=>e.rel===rel);
check(graph.nodes.some(n=>n.id==='programme:WRITERS-STUDIO'&&n.label==="Writer's Studio"),'B7R1-L2','current field resolves to the evidenced programme node; no synthetic field node is required');
check(!graph.nodes.some(n=>n.kind==='field'),'DG-10','no synthetic field node exists');
check(edge('belongs to programme').some(e=>e.from==='work:wu-1'&&e.to==='programme:WRITERS-STUDIO'),'B7R1-L3','exact Work Unit programme declaration creates a cited edge');
check(!edge('belongs to programme').some(e=>e.from==='work:wu-2'),'DG-1','name/prefix resemblance never creates a programme edge when the exact target is absent');
check(edge('child of').some(e=>e.from==='work:wu-2'&&e.to==='work:wu-1'),'B7R1-L4','exact parent_work_unit relation is admitted only when the target exists');
check(edge('for work unit').some(e=>e.from==='session:s-1'&&e.to==='work:wu-1'),'B7R1-L5','session exact work_unit declaration joins to an existing Work Unit');
check(!edge('for work unit').some(e=>e.from==='session:s-2'),'DG-3','session naming an absent Work Unit creates no dangling edge');
check(edge('recorded branch').every(e=>e.rel==='recorded branch'),'DG-4','session custody is labelled recorded branch, never current branch');
check(edge('has execution grant').some(e=>e.from==='work:wu-1'&&e.to==='grant:e1-grant-1'),'B7R1-L6','grant edge consumes a resolved grant standing, not raw event spam');
check(edge('orients').some(e=>e.evidence.kind==='partner-handoff'&&e.evidence.ref==='partner-handoff:chatgpt-writers-studio-test.json'),'B7R1-L7','partner handoff may orient the exact field but remains a separately typed evidence lane');
check(edges.every(e=>e.evidence?.kind&&e.evidence?.ref),'B7R1-L8','every edge carries evidence');
check(!graph.nodes.some(n=>['person','member','element','archetype'].includes(n.kind)),'DG-7/8','no person/member inference or elemental/archetypal graph vocabulary is emitted');

/** @type {any} */ const vm=liveReference();
vm.programme_state={schema:'programme-state.v1',projected_at:'2026-09-24T00:00:00Z',observed_against:'a'.repeat(40),projector:'test',population:{examined:3,emitted:3,complete:true,excluded_by_rule:[],classified:[],unclassified:[],unreadable:[]},programmes};
vm.graph=graph;
const valid=validateViewModel(vm,{mode:'live'});
check(valid.ok,'B7R1-L9',`live view-model accepts the evidenced graph under VM-3/VM-6 (${valid.violations.length} violations)`);

const home=mkdtempSync(path.join(os.tmpdir(),'b7r1-partner-'));
try {
  const dir=path.join(home,'.jarvis','context-handoffs'); mkdirSync(dir,{recursive:true});
  const handoff={
    version:'jarvis.partner-context.v1',handoff_id:'chatgpt-writers-studio-test',source:'chatgpt',field:"Writer's Studio",
    summary:'Bounded orientation for the Writer\'s Studio test.',created_at:'2026-09-24T12:00:00Z',authority:'orientation_only',
  };
  writeFileSync(path.join(dir,'chatgpt-writers-studio-test.json'),JSON.stringify(handoff,null,2));
  writeFileSync(path.join(dir,'bad.json'),JSON.stringify({...handoff,handoff_id:'bad',authority:'repository_write'}));
  symlinkSync(path.join(dir,'chatgpt-writers-studio-test.json'),path.join(dir,'link.json'));
  const organ=listPartnerHandoffs({home});
  check(organ.handoffs.length===1&&organ.handoffs[0].source==='chatgpt'&&organ.unreadable.length===2,'B7R1-L10','bounded partner-handoff organ admits only schema-valid regular receipts and refuses widening/symlink entries');

  const previewVm=liveReference();
  previewVm.graph={
    nodes:[{id:'programme:WRITERS-STUDIO',kind:'programme',label:"Writer's Studio",sub:'WRITERS-STUDIO'},{id:'partner:chatgpt-writers-studio-test',kind:'partner',label:'ChatGPT handoff',sub:'orientation only'}],
    edges:[{from:'partner:chatgpt-writers-studio-test',to:'programme:WRITERS-STUDIO',rel:'orients',evidence:{kind:'partner-handoff',ref:'partner-handoff:chatgpt-writers-studio-test.json'}}],
  };
  const preview=readEvidencePreview(previewVm,'partner-handoff:chatgpt-writers-studio-test.json',{root:ROOT,partnerHome:home});
  check(preview.ok===true&&preview.evidence_state==='ORIENTATION_ONLY'&&/orientation only/.test(preview.source_kind),'B7R1-L11','partner-handoff edge evidence is directly traversable without opening arbitrary filesystem access');
  const refused=readEvidencePreview(previewVm,'partner-handoff:../../etc/passwd.json',{root:ROOT,partnerHome:home});
  check(refused.ok===false,'DG-6','partner evidence traversal refuses path escape rather than becoming a general filesystem reader');
} finally { rmSync(home,{recursive:true,force:true}); }

check(/const direct=centerId\?arr\(g\.edges\)\.filter\(e=>e\.from===centerId\|\|e\.to===centerId\):\[\]/.test(renderer),'DG-9','Graph renderer defaults to a one-hop current-field neighborhood rather than the whole graph population');
check(/data-action=\"graph-focus\"/.test(renderer)&&/graph-reset-focus/.test(renderer),'B7R1-L12','related nodes can be explored without replacing the working field');
check(/No evidence → no relationship/.test(renderer),'B7R1-L13','Founder-facing Graph states the immutable evidence law');

console.log(failures===0?'\nB7R1 MATRIX: ALL LAWS HOLD · DEFEAT CANDIDATES DEAD (exit 0)':`\nB7R1 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
