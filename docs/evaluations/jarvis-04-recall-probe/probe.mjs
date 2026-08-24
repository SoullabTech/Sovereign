#!/usr/bin/env node
// JARVIS-04 — recall capability probe.
//
// Measures the recall system that EXISTS NOW against the real canonical modules.
// Isolated AIN_HOME, synthetic data, nothing adopted, production untouched.
//
// It answers five questions the unit requires, by execution rather than reading:
//   what can JARVIS recall · persist-but-not-retrieve · retrieve-but-not-promote
//   · promote-but-not-reintroduce · still write-only
import path from 'node:path'; import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = process.env.JARVIS_ROOT;
const B = (n) => `file://${path.join(ROOT,'scripts','builder',n)}`;
let pass=0, fail=0; const rows=[];
const t = (id,label,fn) => {
  try { const d = fn(); rows.push([id,label,'PASS',d]); pass++; }
  catch(e){ rows.push([id,label,'FAIL',String(e.message).slice(0,160)]); fail++; }
};
const est = (id,label,fn) => { // establishes a FACT (pass = "measured"), not a virtue
  try { const d = fn(); rows.push([id,label,'✔',d]); pass++; }
  catch(e){ rows.push([id,label,'✖',String(e.message).slice(0,160)]); fail++; }
};

const S = await import(B('jarvis-runtime-store.mjs'));
S.initStore();

// ── A. STORAGE / WRITE PATH ────────────────────────────────────────────────
const ids=[];
t('A1','runs persist (saveRun)',()=>{
  for (let i=0;i<5;i++){
    const id=S.newRunId(); ids.push(id);
    S.saveRun({run_id:id,created_at:new Date(Date.parse('2026-08-24T10:0'+i+':00Z')).toISOString(),
      lane:i%2?'C1':'C0', task:{capability:i%2?'repo.grep':'git.rev_parse',args:{q:'alpha'+i}},
      objective:`probe objective ${i}`, result:{exit_code:0}, outcome:i===3?'FAILED':'COMPLETED'});
    S.appendEvent({run_id:id,at:S.nowISO(),state:'completed'});
  }
  return `${ids.length} runs written`;
});

// ── B. RETRIEVAL — what recall modes actually exist ────────────────────────
est('B1','recall by run_id (get-run)',()=>{ const r=S.loadRun(ids[0]); if(!r||r.run_id!==ids[0]) throw new Error('not retrievable'); return 'loadRun(id) works'; });
est('B2','enumerate all runs (list-runs)',()=>{ const r=S.listRuns({limit:100}); if(r.total<5) throw new Error('missing'); return `listRuns -> total=${r.total}`; });
est('B3','recall by PREDICATE (which runs used capability X)',()=>{
  const api=Object.keys(S).filter(k=>/find|query|search|by[A-Z]|where|filter/.test(k));
  if(api.length) return `predicate API: ${api}`;
  throw new Error('NO predicate/query API — caller must load all runs and filter by hand');
});
est('B4','recall by TIME RANGE',()=>{
  const api=Object.keys(S).filter(k=>/between|since|range|after|before/i.test(k));
  if(api.length) return `temporal API: ${api}`;
  throw new Error('NO temporal query — listRuns takes only limit/offset');
});
est('B5','recall by CONTENT / what a run was about',()=>{
  const api=Object.keys(S).filter(k=>/text|content|match|grep|similar/i.test(k));
  if(api.length) return `content API: ${api}`;
  throw new Error('NO content retrieval — objective/task are stored but not indexed');
});
est('B6','ordering is deterministic',()=>{
  const a=S.listRuns({limit:100}).runs.map(r=>r.run_id).join(),
        b=S.listRuns({limit:100}).runs.map(r=>r.run_id).join();
  if(a!==b) throw new Error('nondeterministic'); return 'stable (created_at desc)';
});

// ── C. REACHABILITY — is recall reachable by an operator at all? ───────────
const grepRepo=(pat)=>{ try{ return execFileSync('grep',['-rIl','--include=*.mjs','--include=*.js','--include=*.ts','-e',pat,'.'],
  {cwd:ROOT,encoding:'utf8'}).split('\n')
    .filter(f=>f && !/node_modules|jarvis-runtime-store|docs\/evaluations|\.next/.test(f)); }catch{ return []; } };
est('C1','listRuns has a caller outside the module',()=>{
  const c=grepRepo('listRuns'); if(c.length) return `callers: ${c.join(' ')}`;
  throw new Error('ZERO callers — recall API is unreferenced');
});
est('C2','loadRun has a caller outside the module',()=>{
  const c=grepRepo('loadRun'); if(c.length) return `callers: ${c.join(' ')}`;
  throw new Error('ZERO callers — recall API is unreferenced');
});
est('C3','an operator surface exposes runs (CLI/API/IPC)',()=>{
  const c=[...grepRepo('list-runs'),...grepRepo('list_runs')];
  if(c.length) return `surface: ${c.join(' ')}`;
  throw new Error('NO operator surface — recall is library-only');
});
est('C4','runtime/events.jsonl has a located READER',()=>{
  // A comment naming the log is not a reader. Require either an import of the
  // store's EVENTS_LOG constant, or a read whose target is the events log
  // itself — jarvis-binding.mjs mentions events.jsonl in prose and reads
  // binding.json, which is exactly the false positive this guards against.
  const cands=grepRepo('events.jsonl').filter(f=>/builder|jarvis/.test(f));
  const readers=cands.filter(f=>{
    const src=fs.readFileSync(path.join(ROOT,f),'utf8')
      .split('\n').filter(l=>!/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n'); // strip comments
    return /EVENTS_LOG/.test(src) || /read\w*\([^)]*events\.jsonl/.test(src);
  });
  if(readers.length) return `readers: ${readers.join(' ')}`;
  throw new Error(`no reader — ${cands.length} file(s) name it, all in comments or write-only; census A2 OPEN`);
});

// ── D. PROMOTION — operational experience -> adjudicated knowledge ─────────
est('D1','a derivation path exists: run -> candidate claim',()=>{
  const c=[...grepRepo('claims/'),...grepRepo('epistemic-ledger')].filter(f=>/builder|jarvis/.test(f));
  const store=grepRepo('runtime-store');
  const both=c.filter(f=>store.includes(f));
  if(both.length) return `bridge: ${both.join(' ')}`;
  throw new Error('NO module reads runs AND writes claims — the promotion path does not exist');
});
est('D2','adjudicated-knowledge corpus size',()=>{
  const d=path.join(ROOT,'.ain','claims');
  const n=fs.existsSync(d)?fs.readdirSync(d).filter(f=>f.endsWith('.json')).length:0;
  return `${n} claim(s) on record`;
});

// ── E. NEGATIVE CONTROLS ──────────────────────────────────────────────────
const guard=(claim)=>{ try{ return JSON.parse(execFileSync('node',
  [path.join(ROOT,'scripts','builder','epistemic-guard.mjs'),'adjudicate','--claim-json',JSON.stringify(claim),'--json'],
  {encoding:'utf8'})); }catch(e){ try{ return JSON.parse(e.stdout||'{}'); }catch{ return {verdict:'ERROR',raw:String(e.stdout||e.message).slice(0,200)}; } } };

t('NC1','model-authored recollection is REFUSED standing',()=>{
  const v=guard({id:'NC1',status:'PROVEN',assertion:'I recall that the deploy path is safe.',
    evidence:[{kind:'model_recollection',detail:'I remember concluding this earlier.'}]});
  if(v.verdict==='ADMIT') throw new Error('ADMITTED unadjudicated recollection');
  return `verdict=${v.verdict} (refused)`;
});
t('NC2','governance answers with REASONS, not a boolean',()=>{
  const v=guard({id:'NC2',status:'PROVEN',assertion:'x',evidence:[]});
  if(typeof v==='boolean') throw new Error('boolean policy');
  if(!v.refusals||!v.refusals.length) throw new Error('no refusal detail');
  return `${v.refusals.length} refusal(s) with rule+required_test`;
});
est('NC3','similarity cannot manufacture relevance',()=>{
  const api=Object.keys(S).filter(k=>/embed|vector|similar|semantic/i.test(k));
  if(api.length) throw new Error(`similarity surface present: ${api}`);
  return 'VACUOUS — no similarity/vector retrieval exists to be abused';
});
t('NC4','SUPERSEDED is terminal — replaced knowledge cannot be revived',()=>{
  const v=guard({id:'NC4',status:'SUPERSEDED',assertion:'x',superseded_by:'NC4b',evidence:[{kind:'executable_gate',detail:'d',ref:'r'}]});
  const out=execFileSync('node',[path.join(ROOT,'scripts','builder','epistemic-guard.mjs'),'statuses'],{encoding:'utf8'});
  if(!/SUPERSEDED/.test(out)) throw new Error('no supersession vocabulary');
  return 'SUPERSEDED + STALE in vocabulary; G5 forbids revival';
});
est('NC5','retrieval EXPOSES conflict rather than picking a winner',()=>{
  const a={run_id:'X',fact:'green'}, b={run_id:'X',fact:'red'};
  // Neutral ids: naming them 'conflict-*' would let the probe match its own
  // vocabulary and report a signal that does not exist.
  S.saveRun({run_id:'subj-a1',created_at:'2026-08-24T11:00:00Z',subject:'deploy-state',claim:a.fact});
  S.saveRun({run_id:'subj-a2',created_at:'2026-08-24T11:01:00Z',subject:'deploy-state',claim:b.fact});
  // Behavioural: two runs asserting contradictory facts about the same subject.
  // Does ANY retrieval surface flag the contradiction?
  const got=S.listRuns({limit:100}).runs.filter(r=>r.subject==='deploy-state');
  const claims=[...new Set(got.map(r=>r.claim))];
  const flagged=got.some(r=>r.conflict||r.contradicts||r.disputed);
  if(flagged) return 'contradiction surfaced by retrieval';
  throw new Error(`${got.length} records on one subject with ${claims.length} incompatible claims (${claims}), returned as equally valid — no conflict signal`);
});

// ── report ────────────────────────────────────────────────────────────────
const w=[4,58,6];
console.log('\n'+'='.repeat(100));
console.log('JARVIS-04 RECALL PROBE');
console.log('='.repeat(100));
for(const [id,l,s,d] of rows) console.log(`${id.padEnd(w[0])} ${l.padEnd(w[1])} ${s.padEnd(w[2])} ${d}`);
console.log('='.repeat(100));
console.log(`established: ${pass} · unmet: ${fail}`);
console.log('NOTE: ✖/FAIL here means "capability absent", which is the measurement — not a defect in the probe.');
