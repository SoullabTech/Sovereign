#!/usr/bin/env node
// @ts-check
/** B6R1R1 — citation-conformant response + resolved turn context. */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const require=createRequire(import.meta.url);
const G=require(path.join(ROOT,'jarvis-desktop/src/grounded-response.js'));
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const main=readFileSync(path.join(ROOT,'jarvis-desktop/src/main.js'),'utf8');
const preload=readFileSync(path.join(ROOT,'jarvis-desktop/src/preload.js'),'utf8');
const { verifyEvidence }=await import(pathToFileURL(path.join(ROOT,'scripts/builder/jarvis-runtime-pipeline.mjs')).href);

let failures=0;
/** @param {boolean} ok @param {string} law @param {string} detail */
function check(ok,law,detail){
  console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`);
  if(!ok) failures++;
}

const fragment={
  source_file:'docs/programme/example.md',
  source_sha:'a'.repeat(40),
  start_line:7,
  end_line:9,
  content:[
    'Production was not walked in the cited review.',
    'The missing layer is not simply capability.',
    'A third source line.',
  ].join('\n'),
};

const validRaw=JSON.stringify({
  schema:G.SCHEMA,
  supported_claims:[
    {
      claim:'Production was not walked in the cited review.',
      evidence:[{fragment:1,line:7,quote:'Production was not walked'}],
    },
    {
      claim:'The review says the missing layer is not simply capability.',
      evidence:[{fragment:1,line:8,quote:'missing layer is not simply capability'}],
    },
  ],
  unsupported_claims:['Whether production is currently broken.'],
});

const compiled=G.compileGroundedResponse(validRaw,[fragment]);
check(
  compiled.status==='COMPILED' &&
  compiled.supported.length===2 &&
  compiled.unsupported.length===1,
  'B6R1R1-L1','structured evidence response separates supported and unsupported claims'
);

check(
  compiled.supported[0].citations[0]==='docs/programme/example.md:7' &&
  compiled.supported[1].citations[0]==='docs/programme/example.md:8',
  'B6R1R1-L2','final path:LINE citations are derived by JARVIS from validated fragment metadata'
);

const rendered=G.renderGroundedResponse(compiled,{
  fieldLabel:'WRITERS-STUDIO',
  canonicalSha:fragment.source_sha,
  fragmentCount:1,
  partnerSources:['chatgpt'],
});

check(
  /Turn context: Writer's Studio/.test(rendered) &&
  /Canonical evidence: 1 fragment @aaaaaaaaaa/.test(rendered) &&
  /Partner context: ChatGPT \(orientation only\)/.test(rendered) &&
  /What the evidence establishes:/.test(rendered) &&
  /What I cannot establish from this evidence:/.test(rendered),
  'B6R1R1-L3','rendered response exposes resolved turn context and keeps partner orientation separate'
);

const verifier=verifyEvidence(rendered,[fragment]);
check(
  verifier.ok===true &&
  verifier.valid===2 &&
  verifier.invalid===0,
  'B6R1R1-L4','the unchanged canonical verifier accepts the deterministic citations emitted by JARVIS'
);

const smuggled=G.compileGroundedResponse(JSON.stringify({
  schema:G.SCHEMA,
  supported_claims:[{
    claim:'ChatGPT says MAIA conversation is already live in production.',
    evidence:[{fragment:1,quote:'Production was not walked in the cited review.'}],
  }],
  unsupported_claims:[],
}),[fragment]);
const smuggledRendered=G.renderGroundedResponse(smuggled,{fieldLabel:'WRITERS-STUDIO',fragmentCount:1,partnerSources:['chatgpt']});
check(
  !smuggledRendered.includes('MAIA conversation is already live in production') &&
  smuggledRendered.includes('Production was not walked in the cited review.') &&
  smuggledRendered.includes('Partner context: ChatGPT (orientation only)'),
  'B6R1R1-L4A','model interpretation or partner language cannot ride an unrelated valid citation into the evidence-established section'
);

const forgedPathRaw=JSON.stringify({
  schema:G.SCHEMA,
  supported_claims:[{
    claim:'Production was not walked.',
    evidence:[{fragment:1,line:7,quote:'Production was not walked',source_file:'evil/fake.md'}],
  }],
  unsupported_claims:[],
});
const forgedCompiled=G.compileGroundedResponse(forgedPathRaw,[fragment]);
const forgedRendered=G.renderGroundedResponse(forgedCompiled,{fieldLabel:'WRITERS-STUDIO',fragmentCount:1});
check(
  forgedCompiled.supported[0]?.citations[0]==='docs/programme/example.md:7' &&
  !forgedRendered.includes('evil/fake.md'),
  'B6R1R1-L5','model-supplied paths are ignored; only fragment custody can produce a final citation'
);

const badLine=G.compileGroundedResponse(JSON.stringify({
  schema:G.SCHEMA,
  supported_claims:[{claim:'Invented current production failure.',evidence:[{fragment:1,line:999,quote:'invented words never found in canonical fragment'}]}],
  unsupported_claims:[],
}),[fragment]);
check(
  badLine.supported.length===0 &&
  badLine.unsupported.some((/** @type {any} */ u)=>u.claim==='Invented current production failure.' && u.reason==='quote_not_in_fragment') &&
  !G.renderGroundedResponse(badLine,{fieldLabel:'WRITERS-STUDIO',fragmentCount:1}).includes('example.md:999'),
  'B6R1R1-L6','a model line number cannot create evidence; absent source words move the claim to unsupported'
);

const badQuote=G.compileGroundedResponse(JSON.stringify({
  schema:G.SCHEMA,
  supported_claims:[{claim:'A plausible but ungrounded claim.',evidence:[{fragment:1,line:7,quote:'words that do not occur on this line'}]}],
  unsupported_claims:[],
}),[fragment]);
check(
  badQuote.supported.length===0 &&
  badQuote.unsupported.some((/** @type {any} */ u)=>u.reason==='quote_not_in_fragment'),
  'B6R1R1-L7','a fabricated source quote fails closed even when the model supplies a plausible line number'
);

const weakQuote=G.compileGroundedResponse(JSON.stringify({
  schema:G.SCHEMA,
  supported_claims:[{claim:'A broad claim should not ride on punctuation.',evidence:[{fragment:1,line:7,quote:'*'}]}],
  unsupported_claims:[],
}),[fragment]);
check(
  weakQuote.supported.length===0 &&
  weakQuote.unsupported.some((/** @type {any} */ u)=>u.reason==='quote_too_weak'),
  'B6R1R1-L7A','punctuation-only or trivially short quotes cannot manufacture grounding'
);

const formattedRef=G.validateEvidenceRef(
  {fragment:1,line:8,quote:'Production was not walked. No session on soullab.life'},
  [{...fragment,start_line:8,end_line:8,content:'⛔ **Production was not walked.** No session on soullab.life, no runtime read, no member data.'}],
);
check(
  formattedRef.ok===true,
  'B6R1R1-L7B','verbatim source words remain valid when the model omits markdown markers or warning icons'
);

const multiRef=G.validateEvidenceRef(
  {fragment:1,line:999,quote:'What is missing is not capability. It is one layer above.'},
  [{...fragment,start_line:20,end_line:21,content:'What is missing is not capability.\nIt is one layer above.'}],
);
check(
  multiRef.ok===true && multiRef.citation==='docs/programme/example.md:20-21',
  'B6R1R1-L7C','JARVIS can locate a verbatim quote across adjacent fragment lines and derive a citation range without trusting the model line number'
);

const malformed=G.compileGroundedResponse('not json',[fragment]);
check(
  malformed.status==='STRUCTURE_REFUSED' &&
  malformed.supported.length===0 &&
  malformed.unsupported.length===1,
  'B6R1R1-L8','malformed model output becomes unsupported rather than uncited prose'
);

// Recovery rebase 2026-10-01: the lost B6R1R1 matrix is restored against the
// current canonical verifier rather than forcing the 2026-09-24 verifier backward.
const verifierBlob=execFileSync('git',['-C',ROOT,'hash-object','scripts/builder/jarvis-runtime-pipeline.mjs'],{encoding:'utf8'}).trim();
check(
  verifierBlob==='133e3dc83f4f6931aa10f949eea13aa1eededac8',
  'B6R1R1-L9','canonical verifyEvidence implementation is byte-identical to the current-canonical recovery predecessor'
);

const c1Slice=main.slice(
  main.indexOf("decision.execution_lane === 'C1'"),
  main.indexOf("decision.execution_lane === 'C3'")
);
check(
  /GROUNDED_RESPONSE\.workerInstruction\(fragments\)/.test(c1Slice) &&
  /workerRequest\.format = 'json'/.test(c1Slice) &&
  /GROUNDED_RESPONSE\.compileGroundedResponse/.test(c1Slice) &&
  /GROUNDED_RESPONSE\.renderGroundedResponse/.test(c1Slice) &&
  /verifyEvidence\(renderedResponse, fragments\)/.test(c1Slice),
  'B6R1R1-L10','evidence-bearing C1 turns use structured JSON then deterministic rendering before the unchanged verifier'
);

check(
  /resolved_label: GROUNDED_RESPONSE\.humanFieldLabel/.test(main) &&
  /function lastResolvedTurnContext\(\)/.test(renderer) &&
  /Turn context/.test(renderer) &&
  /not a persistent field selection/.test(renderer),
  'B6R1R1-L11','safely inferred Writer\'s Studio context is shown as turn context without becoming a persistent selection'
);

check(
  /grounding:response\?\.result\?\.grounding/.test(renderer) &&
  /evidence grounding/.test(renderer) &&
  /if \(t\.role!==\'jarvis\' \|\| !t\.context \|\| t\.grounding\) return ''/.test(renderer),
  'B6R1R1-L12','grounded turns render one coherent context block and label containment as evidence grounding, not semantic omniscience'
);

check(
  !/jarvis:grounded-response|jarvis:resolved-turn-context|jarvis:b6r1r1/.test(preload),
  'B6R1R1-L13','B6R1R1 adds no new renderer IPC channel'
);

check(
  /Partner orientation may help you understand Kelly's intent, but it is NOT canonical evidence/.test(G.workerInstruction([fragment])) &&
  /partnerSources/.test(readFileSync(path.join(ROOT,'jarvis-desktop/src/grounded-response.js'),'utf8')),
  'B6R1R1-L14','partner orientation remains available for context but cannot satisfy supported evidence claims'
);

/** @type {Array<[string,string,()=>boolean]>} */
const defeat=[
  ['DC-B6R1R1-1','B6R1R1-L6',()=>{
    const x=G.compileGroundedResponse(JSON.stringify({schema:G.SCHEMA,supported_claims:[{claim:'bad',evidence:[{fragment:1,line:999,quote:'x'}]}]}),[fragment]);
    return x.supported.length===0;
  }],
  ['DC-B6R1R1-2','B6R1R1-L7',()=>{
    const x=G.compileGroundedResponse(JSON.stringify({schema:G.SCHEMA,supported_claims:[{claim:'bad',evidence:[{fragment:1,line:7,quote:'fabricated'}]}]}),[fragment]);
    return x.supported.length===0;
  }],
  ['DC-B6R1R1-3','B6R1R1-L5',()=>!G.compileGroundedResponse(forgedPathRaw,[fragment]).supported[0].citations[0].includes('evil')],
  ['DC-B6R1R1-4','B6R1R1-L9',()=>execFileSync('git',['-C',ROOT,'hash-object','scripts/builder/jarvis-runtime-pipeline.mjs'],{encoding:'utf8'}).trim()==='133e3dc83f4f6931aa10f949eea13aa1eededac8'],
  ['DC-B6R1R1-5','B6R1R1-L11',()=>/not a persistent field selection/.test(renderer)&&/lastResolvedTurnContext/.test(renderer)],
  ['DC-B6R1R1-6','B6R1R1-L13',()=>!/jarvis:grounded-response|jarvis:resolved-turn-context|jarvis:b6r1r1/.test(preload)],
];
for(const [id,law,predicate] of defeat){
  const dead=predicate();
  check(dead,id,`→ ${law} ${dead?'DIES':'SURVIVES'}`);
}

console.log(failures===0?'\nB6R1R1 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)':`\nB6R1R1 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
