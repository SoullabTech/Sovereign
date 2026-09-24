#!/usr/bin/env node
// @ts-check
/** B6R1 — precision context + AI partner handoff. */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const require=createRequire(import.meta.url);
const PC=require(path.join(ROOT,'jarvis-desktop/src/founder-precision-context.js'));
const PARTNER=require(path.join(ROOT,'jarvis-desktop/src/partner-context.js'));
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const main=readFileSync(path.join(ROOT,'jarvis-desktop/src/main.js'),'utf8');
const preload=readFileSync(path.join(ROOT,'jarvis-desktop/src/preload.js'),'utf8');

let failures=0;
/** @param {boolean} ok @param {string} law @param {string} detail */
function check(ok,law,detail){
  console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`);
  if(!ok) failures++;
}

const programmeFixture=[
  {id:'WRITERS-STUDIO',name:'WRITERS-STUDIO',sources:['docs/ws.md']},
  {id:'OTHER-PROGRAMME',name:'OTHER-PROGRAMME',sources:['docs/other.md']},
];
const match=PC.resolveProgrammeFromObjective(programmeFixture,"Investigate what is blocking Writer's Studio.");
check(match.status==='MATCHED'&&match.programme?.id==='WRITERS-STUDIO','B6R1-L1','exact-normalized Writer\'s Studio language resolves to the unique programme');

const noGuess=PC.resolveProgrammeFromObjective(programmeFixture,'Investigate the studio.');
check(noGuess.status==='NONE','B6R1-L2','generic prose does not fuzzy-match a programme into evidence context');

const tmp=mkdtempSync(path.join(os.tmpdir(),'b6r1-context-'));
try {
  mkdirSync(path.join(tmp,'docs'),{recursive:true});
  writeFileSync(path.join(tmp,'docs/ws.md'),[
    '# Writer\'s Studio',
    '',
    '## Current standing',
    'Canonical evidence says manuscript-first work is active.',
    'The current blocker is precision context, not a missing dashboard.',
    '',
    '## Next',
    'Keep the manuscript primary and attach only exact evidence.',
  ].join('\n'));
  const git=(/** @type {string[]} */ args)=>execFileSync('git',['-C',tmp,...args],{encoding:'utf8'}).trim();
  git(['init','-q']); git(['config','user.name','B6R1 Matrix']); git(['config','user.email','b6r1@example.invalid']);
  git(['add','.']); git(['commit','-qm','canonical']);
  const sha=git(['rev-parse','HEAD']);
  writeFileSync(path.join(tmp,'docs/ws.md'),'DIRTY WORKTREE MUST NOT ENTER CONTEXT\n');

  const vm={
    meta:{observed_against:sha},
    programme_state:{programmes:[{id:'WRITERS-STUDIO',name:'WRITERS-STUDIO',sources:['docs/ws.md']}]},
    work:{units:[]},
  };
  const built=PC.buildPrecisionContext({repo:tmp,vm,objective:"Investigate what is blocking Writer's Studio."});
  check(
    built.status==='READY' &&
    built.canonical_sha===sha &&
    built.fragments.length>0 &&
    built.fragments.every((/** @type {any} */ f)=>f.source_sha===sha) &&
    built.fragments.some((/** @type {any} */ f)=>f.content.includes('Canonical evidence')) &&
    built.fragments.every((/** @type {any} */ f)=>!f.content.includes('DIRTY WORKTREE')),
    'B6R1-L3','precision context is materialized from exact canonical git-object bytes, never the dirty worktree'
  );
  check(
    built.fragments.length<=PC.MAX_SOURCE_FILES*PC.MAX_RANGES_PER_FILE &&
    built.total_chars<=PC.MAX_TOTAL_CHARS,
    'B6R1-L4','precision context remains bounded by fragment and character ceilings'
  );
} finally {
  rmSync(tmp,{recursive:true,force:true});
}

const home=mkdtempSync(path.join(os.tmpdir(),'b6r1-partner-'));
try {
  const dir=PARTNER.handoffDir(home);
  mkdirSync(dir,{recursive:true});
  const good={
    version:PARTNER.VERSION,
    handoff_id:'chatgpt-writers-studio-test',
    source:'chatgpt',
    field:"Writer's Studio",
    summary:'Kelly is working on the manuscript-first Writer\'s Studio experience.',
    created_at:'2026-09-24T15:00:00.000Z',
    authority:'orientation_only',
    provenance_note:'synthetic test receipt',
  };
  writeFileSync(path.join(dir,'good.json'),JSON.stringify(good,null,2));
  writeFileSync(path.join(dir,'bad-source.json'),JSON.stringify({...good,handoff_id:'bad-source',source:'unknown-ai'},null,2));
  writeFileSync(path.join(dir,'bad-authority.json'),JSON.stringify({...good,handoff_id:'bad-authority',authority:'repository_write'},null,2));
  writeFileSync(path.join(dir,'other.json'),JSON.stringify({...good,handoff_id:'other-field',field:'Unrelated Project'},null,2));
  symlinkSync(path.join(dir,'good.json'),path.join(dir,'link.json'));

  const listed=PARTNER.listPartnerHandoffs({home,objective:"Investigate what is blocking Writer's Studio.",fieldLabel:'WRITERS-STUDIO'});
  check(
    listed.items.length===1 &&
    listed.items[0].handoff_id==='chatgpt-writers-studio-test' &&
    listed.items[0].authority==='orientation_only' &&
    listed.refused.some((/** @type {any} */ x)=>x.reason.includes('INVALID_HANDOFF')) &&
    listed.refused.some((/** @type {any} */ x)=>x.reason==='SYMLINK_REFUSED'),
    'B6R1-L5','partner inbox admits only bounded schema-valid field-matched receipts and refuses hostile/authority-widening entries'
  );

  const rendered=PARTNER.renderPartnerOrientation(listed.items);
  check(
    /NOT REPOSITORY EVIDENCE/.test(rendered) &&
    /GRANTS NO AUTHORITY/.test(rendered) &&
    /SOURCE: CHATGPT/.test(rendered),
    'B6R1-L6','partner orientation is explicitly labelled non-evidence and authority-empty'
  );
} finally {
  rmSync(home,{recursive:true,force:true});
}

check(
  PARTNER.SOURCES.join(',')==='maia,chatgpt,claude-code',
  'B6R1-L7','only MAIA, ChatGPT and Claude Code are admitted partner source identities in V1'
);

const c1Slice=main.slice(
  main.indexOf("decision.execution_lane === 'C1'"),
  main.indexOf("decision.execution_lane === 'C3'")
);

check(
  /PRECISION_CONTEXT\.buildPrecisionContext/.test(c1Slice) &&
  /founderWorkspaceCache\.root === root/.test(c1Slice) &&
  /founder_workspace_context_request/.test(c1Slice) &&
  /founder_workspace_objective/.test(c1Slice),
  'B6R1-L8','C1 precision context is resolved in main from the validated live Founder view-model, not renderer-supplied file paths'
);

check(
  /PARTNER_CONTEXT\.listPartnerHandoffs/.test(c1Slice) &&
  /PARTNER_CONTEXT\.renderPartnerOrientation/.test(c1Slice) &&
  /verifyEvidence\(renderedResponse, fragments\)/.test(c1Slice) &&
  !/verifyEvidence\([^,]+,\s*partner/.test(c1Slice),
  'B6R1-L9','partner orientation and canonical evidence remain separate lanes; verifier receives canonical fragments only'
);

check(
  /founder_workspace_context_request:true/.test(renderer) &&
  /founder_workspace_objective:intent\.raw_utterance/.test(renderer) &&
  /founder_workspace_context:state\.context \? \{ kind:state\.context\.kind, id:state\.context\.id, label:state\.context\.label \} : null/.test(renderer) &&
  !/founder_workspace_context[^\n]*(?:file|source|path)/.test(renderer),
  'B6R1-L10','renderer sends field identity and objective only; it cannot name repository evidence paths'
);

check(
  /Canonical context:/.test(renderer) &&
  /Partner orientation:/.test(renderer) &&
  /context:response\?\.context/.test(renderer),
  'B6R1-L11','Work shows which canonical and partner context actually traveled with the turn'
);

check(
  !/jarvis:b6r1|jarvis:partner-context|jarvis:precision-context/.test(preload),
  'B6R1-L12','B6R1 adds no new renderer IPC authority surface'
);

check(
  !/runExternalReasoning|FRONTIER\.run/.test(c1Slice) &&
  !/governanceAction|workUnitAction|runWorkUnit/.test(c1Slice),
  'B6R1-L13','precision context does not widen local Work into frontier, governance, or work-unit execution'
);
const precisionSource=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-precision-context.js'),'utf8');
/** @type {Array<[string,string,string,(source:string)=>boolean]>} */
const candidates=[
  ['DC-B6R1-1','B6R1-L3',
    precisionSource.replace("execFileSync('git', ['-C', repo, 'show'","readFileSync('dirty-worktree'"),
    (s)=>/execFileSync\('git', \['-C', repo, 'show'/.test(s)],
  ['DC-B6R1-2','B6R1-L6',
    PARTNER.renderPartnerOrientation([{source:'chatgpt',field:"Writer\'s Studio",handoff_id:'x',created_at:'t',summary:'s'}]).replace('NOT REPOSITORY EVIDENCE','REPOSITORY EVIDENCE'),
    (s)=>/NOT REPOSITORY EVIDENCE/.test(s)&&/GRANTS NO AUTHORITY/.test(s)],
  ['DC-B6R1-3','B6R1-L9',
    c1Slice.replace('verifyEvidence(renderedResponse, fragments)','verifyEvidence(renderedResponse, partner.items)'),
    (s)=>/verifyEvidence\(renderedResponse, fragments\)/.test(s)&&!/verifyEvidence\([^,]+,\s*partner/.test(s)],
  ['DC-B6R1-4','B6R1-L10',
    renderer.replace("founder_workspace_context:state.context ? { kind:state.context.kind, id:state.context.id, label:state.context.label } : null","founder_workspace_context:{path:state.context?.source}"),
    (s)=>!/founder_workspace_context[^\n]*(?:file|source|path)/.test(s)],
  ['DC-B6R1-5','B6R1-L12',
    preload+"\nipcRenderer.invoke('jarvis:partner-context');",
    (s)=>!/jarvis:b6r1|jarvis:partner-context|jarvis:precision-context/.test(s)],
];
for(const [id,law,source,predicate] of candidates){
  const dead=!predicate(source);
  check(dead,id,`→ ${law} ${dead?'DIES':'SURVIVES'}`);
}

console.log(failures===0?'\nB6R1 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)':`\nB6R1 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
