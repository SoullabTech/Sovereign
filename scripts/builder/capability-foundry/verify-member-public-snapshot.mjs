/**
 * Verify the member-facing static research snapshot against the exact
 * founder-accepted public catalogue. LOCAL SOURCE VERIFICATION ONLY.
 *
 * Deliberately has NO writer, network, installer, dynamic input, member data
 * or third-party model execution path. A later Foundry release must be
 * explicitly accepted and this verifier intentionally updated before the
 * public research catalogue changes.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const acceptedCommit='45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d';
const acceptedDigest='9037d3f9695a72cfa70b01a9eb8eba58027f8f2134e3458e6e6dd32a02e6f54b';
const input=readFileSync(path.join(root,'docs/programme/AIN-CAPABILITY-FOUNDRY-01_CANDIDATE_REGISTRY_2026-10-12.json'));
const output=readFileSync(path.join(root,'lib/foundry/memberResearchSnapshot.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
if(sha(input)!==acceptedDigest)throw Error('Refuse changed original Foundry catalogue.');
const source=JSON.parse(input.toString('utf8'));
if(source.programme!=='AIN-CAPABILITY-FOUNDRY-01'||source.authority!=='RESEARCH_INTAKE_ONLY'
 ||source.candidates.length!==26)throw Error('Refuse wrong Foundry scope.');
const LANE={
  ain:'Sovereign AI',jarvis:'Research tools',writers:'Writer’s Studio',
  'pro-studio':'Pro Studio',astrology:'Astrology Pro',rgr:'Relational research'
};
const AREA={
  skills:'Reusable skills',orchestration:'Research workflows',
  model_substrate:'Local AI models',data_tools:'Research data',security:'Safety & security',
  evaluation:'Testing & evidence',mechanistic:'Model interpretability',
  causal:'Causal reasoning',memory:'Memory & retrieval',
  research_paper:'Scientific literature',research_method:'Research methods'
};
const allowed=new Set(['github.com','huggingface.co','arxiv.org','sophontic.ai','blog.pypi.org','www.promptfoo.dev']);
const ids=new Set();
const entries=source.candidates.map(c=>{
 if(ids.has(c.id)||c.status!=='DISCOVERED_CANDIDATE'||c.execution_grant!=='NOT_AUTHORIZED'
 ||c.production_admission!=='NOT_AUTHORIZED'||c.model_download!=='NOT_AUTHORIZED'
 ||c.exact_license!==null)throw Error('Unapproved, duplicate or activated source candidate.');
 ids.add(c.id);
 const u=new URL(c.source_url);
 if(u.protocol!=='https:'||!allowed.has(u.hostname)||u.username||u.password)
   throw Error('Refuse unsupported public source link.');
 if(!AREA[c.area]||c.product_lanes.some(x=>!(x in LANE))
 ||!['PUBLIC_DOC_REVIEWED','URL_NOMINATED'].includes(c.source_check))
   throw Error('Refuse unknown research classification.');
 return {
  id:c.id,name:c.title,area:AREA[c.area],
  purpose:c.candidate_use,research_caution:c.critical_guard,
  could_inform:c.product_lanes.map(k=>LANE[k]),
  public_source_url:c.source_url,
  source_standing:c.source_check==='PUBLIC_DOC_REVIEWED'?'DOCUMENTATION_SURVEYED':'LINK_NOMINATED',
  availability:'RESEARCH_ONLY_NOT_ENABLED'
 };
});
const expected={
 schema:'soullab.member-foundry.research-sources.v1',
 origin:'AIN-CAPABILITY-FOUNDRY-01',
 accepted_research_catalogue_commit:acceptedCommit,
 origin_catalogue_sha256:sha(input),
 presentation:'MEMBER_INFORMATION_ONLY',
 source_disclaimer:'Source descriptions are research leads, not independently licensed or approved products.',
 license_clearance:'PENDING_FOR_ALL_CANDIDATES',
 installed_capabilities:0,
 model_skill_execution:'NOT_AUTHORIZED',
 member_information_included:false,
 source_count:entries.length,
 entries
};
const bytes=Buffer.from(JSON.stringify(expected,null,2)+'\n');
if(!bytes.equals(output))throw Error('Member snapshot does not exactly match approved research-only source.');
console.log('MEMBER_RESEARCH_SNAPSHOT_VERIFIED',entries.length,'candidates','sha256',sha(output),'zero execution grants');
