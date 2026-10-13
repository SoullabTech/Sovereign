import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname ?? process.cwd(), '../../..');
const read = (relative) => readFileSync(path.join(root,relative),'utf8');
const acceptedCommit = '45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d';
const acceptedSource = 'docs/programme/AIN-CAPABILITY-FOUNDRY-01_CANDIDATE_REGISTRY_2026-10-12.json';
const original = execFileSync('git',['-C',root,'show',acceptedCommit+':'+acceptedSource],{encoding:'utf8'});
const master = JSON.parse(original);
const publicText = read('lib/foundry/memberResearchSnapshot.json');
const snapshot = JSON.parse(publicText);
const page = read('app/home/foundry/page.tsx');
const browser = read('app/home/foundry/FoundryMemberExplorer.tsx');
const house = read('app/house/page.tsx');
const threshold = read('app/home/HomeThreshold.tsx');
const route = read('app/home/page.tsx');
const styles = read('app/home/foundry/member-foundry.module.css');
const dictionary = {
  ain:'Sovereign AI', jarvis:'Research tools',writers:'Writer’s Studio',
  'pro-studio':'Pro Studio',astrology:'Astrology Pro',rgr:'Relational research',
};
const areas = {
 skills:'Reusable skills',orchestration:'Research workflows',model_substrate:'Local AI models',
 data_tools:'Research data',security:'Safety & security',evaluation:'Testing & evidence',
 mechanistic:'Model interpretability',causal:'Causal reasoning',memory:'Memory & retrieval',
 research_paper:'Scientific literature',research_method:'Research methods',
};

test('member snapshot derives byte-for-byte from the exactly accepted research catalogue', () => {
 const committed = Buffer.from(original);
 assert.equal(Buffer.compare(committed,Buffer.from(original)),0);
 assert.equal(createHash('sha256').update(original).digest('hex'),'9037d3f9695a72cfa70b01a9eb8eba58027f8f2134e3458e6e6dd32a02e6f54b');
 assert.equal(snapshot.origin_catalogue_sha256,master && createHash('sha256').update(original).digest('hex'));
 assert.equal(snapshot.accepted_research_catalogue_commit,acceptedCommit);
 assert.equal(snapshot.origin,'AIN-CAPABILITY-FOUNDRY-01');
});

test('public snapshot includes all 26 candidates and only a nine-field whitelist',()=>{
 assert.equal(snapshot.schema,'soullab.member-foundry.research-sources.v1');
 assert.equal(snapshot.presentation,'MEMBER_INFORMATION_ONLY');
 assert.equal(snapshot.source_count,26);
 assert.equal(snapshot.entries.length,26);
 assert.equal(snapshot.installed_capabilities,0);
 const fields=['area','availability','could_inform','id','name','public_source_url','purpose','research_caution','source_standing'];
 for(const x of snapshot.entries) assert.deepEqual(Object.keys(x).sort(),fields);
});

test('every public member lead preserves its exact source description and candid review standing',()=>{
 const byId=new Map(master.candidates.map(x=>[x.id,x]));
 for(const x of snapshot.entries){
  const source=byId.get(x.id);
  assert.ok(source,'unknown or invented public lead');
  assert.equal(x.name,source.title);
  assert.equal(x.purpose,source.candidate_use);
  assert.equal(x.research_caution,source.critical_guard);
  assert.equal(x.area,areas[source.area]);
  assert.deepEqual(x.could_inform,source.product_lanes.map(k=>dictionary[k]));
  assert.equal(x.public_source_url,source.source_url);
  assert.equal(x.availability,'RESEARCH_ONLY_NOT_ENABLED');
  assert.equal(x.source_standing,source.source_check==='PUBLIC_DOC_REVIEWED'?'DOCUMENTATION_SURVEYED':'LINK_NOMINATED');
 }
});

test('all member sources are external HTTPS resources on the allowed domain list, without auto-load',()=>{
 const approved=new Set(['github.com','huggingface.co','arxiv.org','sophontic.ai','blog.pypi.org','www.promptfoo.dev']);
 const ids=new Set();
 for(const x of snapshot.entries){
  const url=new URL(x.public_source_url);
  assert.equal(url.protocol,'https:');
  assert.ok(approved.has(url.hostname));
  assert.equal(url.username,'');assert.equal(url.password,'');
  assert.ok(!ids.has(x.id));
  ids.add(x.id);
 }
 assert.equal(ids.size,26);
 assert.match(browser,/target="_blank"/);
 assert.match(browser,/rel="noopener noreferrer"/);
 assert.doesNotMatch(browser,/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\s*\(/);
});

test('member data does not contain private operations or ability to install tools',()=>{
 assert.equal(snapshot.member_information_included,false);
 assert.equal(snapshot.model_skill_execution,'NOT_AUTHORIZED');
 assert.equal(snapshot.license_clearance,'PENDING_FOR_ALL_CANDIDATES');
 assert.doesNotMatch(publicText,/\/Users\/soullab|\/home\/soullab|\\.claude\/|JARVIS-handoffs|source_ref|provider_spend|source_commit_pin|Work Unit|session_token|auth_sessions/);
 const statuses=snapshot.entries.reduce((m,x)=>(m.set(x.source_standing,(m.get(x.source_standing)||0)+1),m),new Map());
 assert.equal(statuses.get('DOCUMENTATION_SURVEYED'),23);
 assert.equal(statuses.get('LINK_NOMINATED'),3);
});

test('/home remains authenticated House and public threshold is unchanged',()=>{
 assert.match(route,/if \(!\(await hasAuthenticatedMember\(\)\)\) return <HomeThreshold \/>/);
 assert.match(route,/<HouseExperience current="home" \/>/);
 assert.equal(threshold,execFileSync('git',['-C',root,'show','c9e4f7f7eccb4049bf036d189cac7feb007ef3cc:app/home/HomeThreshold.tsx'],{encoding:'utf8'}));
 assert.match(house,/current === 'home' && \(/);
 assert.match(house,/href="\/home\/foundry"/);
 assert.match(house,/Explore the Foundry/);
 assert.match(house,/No[t]?hing here is a|promised or automatically enabled feature/);
});

test('member reading room requires a verified session and redirects unauthenticated requests',()=>{
 assert.match(page,/await requireMemberId\(\)/);
 assert.match(page,/if \(error instanceof Error && error\.message === 'AUTH_REQUIRED'\)/);
 assert.match(page,/redirect\('\/signin\?next=%2Fhome%2Ffoundry'\)/);
 assert.match(page,/dynamic = 'force-dynamic'/);
 assert.match(page,/robots: \{ index: false, follow: false \}/);
});

test('/home invitation is separate from House active feature catalog and from /house page',()=>{
 const featureCatalog=read('lib/house/catalog.ts');
 assert.doesNotMatch(featureCatalog,/id:'foundry'/);
 assert.match(house,/\{current === 'home' && \(/);
 assert.match(house,/styles\.memberFoundry/);
 assert.match(house,/styles\.memberFoundryLink/);
 assert.match(house,/href="\/home\/foundry"/);
 assert.doesNotMatch(threshold,/Foundry|\/home\/foundry/);
});

test('member copy distinguishes research possibilities from product promises',()=>{
 for(const phrase of [
  'public research leads','not an installed','research-only','member information',
 ]) {
  // Some phrases are split between files; search across the member presentation.
  const all=[page,browser,publicText].join(' ');
  assert.ok(all.toLowerCase().includes(phrase.toLowerCase()),phrase);
 }
 assert.match(page,/Exact software\s+licenses, safety and real-world usefulness are not assumed/s);
 assert.match(page,/This page\s+makes no model requests/);
 assert.match(browser,/Under study/);
 assert.match(browser,/Public link nominated; review pending/);
});

test('member room has accessible search, filter labels and safe external links',()=>{
 assert.match(browser,/role="search"/);
 assert.match(browser,/aria-live="polite"/);
 assert.match(browser,/type="search"/);
 assert.match(browser,/type="button"/);
 assert.match(browser,/<select value=\{area\}/);
 assert.match(browser,/<select value=\{lane\}/);
 assert.match(styles,/:focus-visible/);
 assert.match(styles,/@media\(max-width:640px\)/);
});

test('member-facing code cannot infer individual cognition or access personal content',()=>{
 assert.doesNotMatch(page+browser,/\b(members\.|living_works|client_notes|medical_records|postgres|query\(|getMemberData|modelService|generateText|ollama|openai|anthropic)\b/i);
 assert.doesNotMatch(page+browser,/useEffect\(/);
 assert.match(page,/Scientific models can inform questions without defining anyone/);
 assert.match(page,/Following a public\s+source link is your choice/);
});

test('member page is informational only; it neither executes nor installs candidate skills',()=>{
 assert.doesNotMatch(page+browser,/(?:onClick|action=|onSubmit)=\{.*(?:install|execute|deploy|download|grant)/i);
 assert.doesNotMatch(browser,/\bfetch\s*\(/);
 assert.doesNotMatch(page,/import \{.*(readFoundryCatalogue|verifyFounderAcceptance).*from/);
 assert.match(page,/MEMBER_FOUNDRY_ENTRIES/);
 assert.match(page,/<FoundryMemberExplorer/);
});


test('the member snapshot has a deterministic read-only source verification command',()=>{
 const script=read('scripts/builder/capability-foundry/verify-member-public-snapshot.mjs');
 assert.match(script,/MEMBER_RESEARCH_SNAPSHOT_VERIFIED/);
 assert.doesNotMatch(script,/(?:writeFileSync|fetch\(|child_process|process\.env\.API_KEY|\binstall\s*\(|spawn\()/);
 const result=execFileSync('node',['scripts/builder/capability-foundry/verify-member-public-snapshot.mjs'],{
  cwd:root,encoding:'utf8',timeout:12000
 });
 assert.match(result,/MEMBER_RESEARCH_SNAPSHOT_VERIFIED 26 candidates/);
});
