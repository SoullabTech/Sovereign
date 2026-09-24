#!/usr/bin/env node
// @ts-check
/** B5 — real JARVIS Desktop Founder Workspace integration matrix. */
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { readEvidencePreview, projectCanonicalProgrammeState } from '../../../scripts/builder/founder-workspace/desktop-viewmodel.mjs';
import { validateViewModel } from '../../../scripts/builder/founder-workspace/viewmodel-v1.mjs';
import { liveReference } from './reference.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
/** @param {string} p */
const read=(p)=>readFileSync(path.join(ROOT,p),'utf8');
const index=read('jarvis-desktop/src/index.html');
const renderer=read('jarvis-desktop/src/founder-workspace-renderer.js');
const preload=read('jarvis-desktop/src/preload.js');
const main=read('jarvis-desktop/src/main.js');
const composer=read('scripts/builder/founder-workspace/desktop-viewmodel.mjs');
const allowlist=read('scripts/builder/__tests__/desktop-preload-allowlist.mjs');

let failures=0;
/** @param {boolean} ok @param {string} law @param {string} detail */
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }

const views=['today','work','graph','monitor','system'];
check(views.every(v=>new RegExp(`data-view=["']${v}["']`).test(index)) && !/data-view=["'](?:home|spiral)["']/.test(index), 'B5-L1', 'actual Desktop shell exposes exactly the accepted five surfaces, not Home/Living Spiral');
check(/Content-Security-Policy/.test(index) && /connect-src 'none'/.test(index) && !/https?:\/\//.test(index), 'B5-L2', 'Desktop HTML has local-only CSP and no external dependency');
check(/founder-workspace-renderer\.js/.test(index) && !/<script src="renderer\.js"/.test(index), 'B5-L3', 'existing JARVIS app loads the B5 renderer, not a second app and not the legacy renderer');

const forbiddenRendererCalls=['submitTask','runExternalReasoning','governanceAction','workUnitAction','runWorkUnit','getCapabilities','searchContinuity','chooseRepo','clearRepo'];
const rendererHits=forbiddenRendererCalls.filter(x=>renderer.includes(`.${x}(`));
check(rendererHits.length===0 && !/SpeechRecognition|speechSynthesis|getUserMedia|mediaDevices/.test(renderer), 'B5-L4', `B5 renderer carries no execution/provider/governance/voice IPC (${rendererHits.join(', ')||'none'})`);
check(/getWorkspaceViewModel/.test(preload) && /jarvis:workspace-viewmodel/.test(preload) && /channel: 'jarvis:workspace-viewmodel'/.test(allowlist), 'B5-L5', 'single Founder Workspace read channel is exposed and authority-reviewed');
check(/async function readStatus\(\)/.test(main) && /ipcMain\.handle\('jarvis:status', readStatus\)/.test(main) && /buildDesktopViewModel/.test(main), 'B5-L6', 'workspace view-model and legacy status share one status observation function');
check(/kind !== 'script'/.test(composer) && /input\.observeMode === 'full'/.test(composer) && /refresh_instruments/.test(main), 'B5-L7', 'ordinary reads skip heavyweight scripts; explicit Monitor refresh owns full census');
check(/sessionStorage/.test(renderer) && /jfw:b5:context/.test(renderer) && /data-view-jump/.test(renderer), 'B5-L8', 'selected work context persists across surface changes in presentation memory');
check(/Held for B6/.test(renderer) && /B7 owns the evidence-backed relationship join/.test(renderer), 'B5-L9', 'B5 names B6/B7 holds instead of impersonating unopened capabilities');
check(/data-action="refresh-monitor"/.test(renderer) && /Work on this/.test(renderer) && /evidence/.test(renderer), 'B5-L10', 'Today/Monitor can enter Work and evidence traversal is present');
check(/projectCanonicalProgrammeState/.test(composer) && /git.*archive/.test(composer) && /canonicalRef: observedAgainst/.test(main), 'B5-L13', 'programme projection and programme evidence are pinned to the exact canonical commit, never the bound development tree');
check(/function deriveActiveFields/.test(renderer) && /<h2>Active fields/.test(renderer) && /Enter field/.test(renderer), 'B5-L14', 'Today is Active Fields first and enters work from observed fields');
check(renderer.indexOf('Founder attention') >= 0 && renderer.indexOf('System observations') > renderer.indexOf('Founder attention') && /Needs attention is not the same as broken/.test(renderer), 'B5-L15', 'Monitor presents Founder attention before technical observations without flattening attention into failure');
check(/data-view-jump=\"today\"/.test(renderer), 'B5-L16', 'Today participates in the same persistent field context loop');
check(/Current active field · center/.test(renderer) && /B7 owns the evidence-backed relationship join/.test(renderer), 'B5-L17', 'Graph centers the current field while B7 still owns new evidence edges');
check(/No MAIA, ChatGPT, or Claude Code handoff is connected in B5/.test(renderer), 'B5-L18', 'B5 makes room for AI partners without fabricating a live handoff');
check(/exec: input\.governorExec/.test(composer) && /const governorExec = governorNode\.path/.test(main) && /execFileSync\(governorNode\.path/.test(main), 'B5-L19', 'Electron injects the governed Node runtime for governor reads; process.execPath cannot become the Electron interpreter');

// Live view-model contract remains valid.
const vr=validateViewModel(liveReference(),{mode:'live'});
check(vr.ok,'B5-L11',`live view-model contract still validates (${vr.violations.length} violations)`);

// Evidence traversal: exact current refs only; no arbitrary local read.
const tmp=mkdtempSync(path.join(os.tmpdir(),'jfw-b5-matrix-'));
try {
  mkdirSync(path.join(tmp,'docs/programme'),{recursive:true});
  writeFileSync(path.join(tmp,'docs/programme/evidence.md'),'# Evidence\nline two\nline three\n');
  writeFileSync(path.join(tmp,'secret.txt'),'secret\n');
  const vm=/** @type {any} */ (liveReference());
  vm.events=[{at:'2026-09-23',kind:'test',text:'evidence',source:'docs/programme/evidence.md:2',evidence_state:'OBSERVED'}];
  const good=readEvidencePreview(vm,'docs/programme/evidence.md:2',{root:tmp,env:{...process.env,AIN_DELEGATION_HOME:path.join(tmp,'ain')}});
  const notInVm=readEvidencePreview(vm,'secret.txt',{root:tmp,env:{...process.env,AIN_DELEGATION_HOME:path.join(tmp,'ain')}});
  const outside=readEvidencePreview(vm,'/etc/passwd',{root:tmp,env:{...process.env,AIN_DELEGATION_HOME:path.join(tmp,'ain')}});
  check(good.ok===true && typeof good.text === 'string' && good.text.includes('line two') && notInVm.ok===false && outside.ok===false,'B5-L12','evidence preview admits exact live ref and refuses arbitrary/invisible paths');
} finally { rmSync(tmp,{recursive:true,force:true}); }

// B5-L13 behavioral falsifier: working-tree text and canonical text deliberately differ.
const canonRepo=mkdtempSync(path.join(os.tmpdir(),'jfw-b5-canonical-binding-'));
try {
  mkdirSync(path.join(canonRepo,'docs/programme'),{recursive:true});
  mkdirSync(path.join(canonRepo,'docs/ops'),{recursive:true});
  writeFileSync(path.join(canonRepo,'CLAUDE.md'),'## Current priority thread\n\n- **LATEST — 2026-09-23 — `ALPHA-01` canonical.**\n\n## Re-entry vow\n');
  const alpha='docs/programme/ALPHA-01_STATE_2026-09-23.md';
  writeFileSync(path.join(canonRepo,alpha),'# Alpha\n\n**Standing:** CANONICAL-STANDING\n');
  writeFileSync(path.join(canonRepo,'docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md'),'# Ops\n\n**Standing:** CLOSED\n');
  const git=(/** @type {string[]} */ args)=>execFileSync('git',['-C',canonRepo,...args],{encoding:'utf8'}).trim();
  git(['init','-q']); git(['config','user.email','b5@example.invalid']); git(['config','user.name','B5 Matrix']);
  git(['add','.']); git(['commit','-qm','canonical']);
  const canonicalSha=git(['rev-parse','HEAD']);
  // Dirty the bound tree after canonical was fixed. A conforming projection must ignore these bytes.
  writeFileSync(path.join(canonRepo,alpha),'# Alpha\n\n**Standing:** DEVELOPMENT-TREE-STANDING\n');
  const projected=projectCanonicalProgrammeState(canonRepo,canonicalSha,'2026-09-23T23:30:00Z');
  const alphaRow=projected.programmes.find((/** @type {any} */ x)=>x.id==='ALPHA-01');
  const vm=/** @type {any} */ (liveReference());
  vm.events=[{at:'2026-09-23',kind:'test',text:'alpha',source:`${alpha}:3`,evidence_state:'OBSERVED'}];
  const preview=readEvidencePreview(vm,`${alpha}:3`,{root:canonRepo,canonicalRef:canonicalSha,env:{...process.env,AIN_DELEGATION_HOME:path.join(canonRepo,'ain')}});
  check(alphaRow?.standing==='CANONICAL-STANDING' && preview.ok===true && typeof preview.text==='string' && preview.text.includes('CANONICAL-STANDING') && !preview.text.includes('DEVELOPMENT-TREE-STANDING'), 'B5-L13', 'dirty/bound tree cannot masquerade as canonical in programme state or evidence preview');
} finally { rmSync(canonRepo,{recursive:true,force:true}); }

// Defeat candidates — each weakens one B5 law and must be caught by the same structural predicates.
/** @type {Array<[string,string,string,(source:string)=>boolean]>} */
const candidates=[
  ['DC-B5-1','B5-L1',index.replace('data-view="today"','data-view="home"'),(s)=>views.every((v)=>new RegExp(`data-view=["']${v}["']`).test(s))&&!/data-view=["'](?:home|spiral)["']/.test(s)],
  ['DC-B5-2','B5-L2',index.replace("connect-src 'none'","connect-src https:"),(s)=>/connect-src 'none'/.test(s)],
  ['DC-B5-3','B5-L3',index.replace('founder-workspace-renderer.js','renderer.js'),(s)=>/founder-workspace-renderer\.js/.test(s)&&!/<script src="renderer\.js"/.test(s)],
  ['DC-B5-4','B5-L4',renderer+'\nwindow.jarvis.submitTask({});',(s)=>!forbiddenRendererCalls.some((x)=>s.includes(`.${x}(`))],
  ['DC-B5-5','B5-L8',renderer.replaceAll('sessionStorage','localOnlyMemory'),(s)=>/sessionStorage/.test(s)&&/jfw:b5:context/.test(s)],
  ['DC-B5-6','B5-L9',renderer.replace('Held for B6','Available now'),(s)=>/Held for B6/.test(s)],
  ['DC-B5-7','B5-L9',renderer.replace('B7 owns the evidence-backed relationship join','Relationships inferred from names'),(s)=>/B7 owns the evidence-backed relationship join/.test(s)],
  ['DC-B5-8','B5-L7',composer.replace("e.kind !== 'script'","true"),(s)=>/kind !== 'script'/.test(s)],
  ['DC-B5-9','B5-L13',composer.replace('projectCanonicalProgrammeState(root, input.observedAgainst, now)',"project(readTree({ root }), { observed_against: input.observedAgainst, projected_at: now })"),(s)=>/programme_state = projectCanonicalProgrammeState\(root, input\.observedAgainst, now\)/.test(s)],
  ['DC-B5-10','B5-L14',renderer.replace('<h2>Active fields','<h2>Summary'),(s)=>/function deriveActiveFields/.test(s)&&/<h2>Active fields/.test(s)],
  ['DC-B5-11','B5-L15',renderer.replace('Founder attention','Machine health'),(s)=>s.indexOf('Founder attention')>=0&&s.indexOf('System observations')>s.indexOf('Founder attention')],
  ['DC-B5-12','B5-L16',renderer.replace('<button class="btn subtle" data-view-jump="today">Today</button>',''),(s)=>/data-view-jump=\"today\"/.test(s)],
  ['DC-B5-13','B5-L17',renderer.replace('Current active field · center','Network'),(s)=>/Current active field · center/.test(s)&&/B7 owns the evidence-backed relationship join/.test(s)],
  ['DC-B5-14','B5-L18',renderer.replace('No MAIA, ChatGPT, or Claude Code handoff is connected in B5','MAIA, ChatGPT, and Claude Code are connected'),(s)=>/No MAIA, ChatGPT, or Claude Code handoff is connected in B5/.test(s)],
  ['DC-B5-15','B5-L19',composer.replace('exec: input.governorExec','exec: undefined'),(s)=>/exec: input\.governorExec/.test(s)],
];
for(const [id,law,source,predicate] of candidates){ const dead=!predicate(source); check(dead,id,`→ ${law} ${dead?'DIES':'SURVIVES'}`); }

console.log(failures===0?'\nB5 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)':`\nB5 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
