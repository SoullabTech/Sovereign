// @ts-check
/**
 * AIN-CAPABILITY-FOUNDRY-01 — inert candidate catalogue reader.
 *
 * This is NOT wired to installed JARVIS/MAIA or any product.
 * The fixed source digest prevents mutable local descriptions from granting
 * standing. Only metadata and unapproved research candidates are returned.
 * No network, subprocess, model, tool execution, timers or lifecycle changes.
 */
import {openSync, readFileSync, fstatSync, lstatSync, realpathSync, closeSync, constants} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

export const FOUNDRY_ID = 'AIN-CAPABILITY-FOUNDRY-01';
export const FOUNDRY_SOURCE = 'docs/programme/AIN-CAPABILITY-FOUNDRY-01_CANDIDATE_REGISTRY_2026-10-12.json';
export const FOUNDRY_SOURCE_SHA256 = '9037d3f9695a72cfa70b01a9eb8eba58027f8f2134e3458e6e6dd32a02e6f54b';
const MAX_BYTES = 65536;
const SOURCE_DOMAINS = new Set(['github.com','huggingface.co','arxiv.org','sophontic.ai','blog.pypi.org','www.promptfoo.dev']);
const CANDIDATE_KEYS = Object.freeze([
  'id','area','title','source_url','source_kind','source_check','priority',
  'product_lanes','candidate_use','critical_guard','source_commit_pin','exact_license',
  'license_status','dependency_security_review','data_rights_review',
  'independent_review','execution_grant','production_admission','model_download','status',
].sort());

function refused(reason) {
  return {
    schema:'ain.capability-foundry-catalogue-view.v1',
    programme:FOUNDRY_ID,
    evidence_state:'UNVERIFIED',
    reason,
    admission:'RESEARCH_ONLY',
    runtime_grants:'NONE',
    new_work_unit_grants:'NONE',
    model_experiment:'NOT_AUTHORIZED',
    maia_runtime:'NOT_AUTHORIZED',
    source_ref:null,
    source_sha256:null,
    candidates:[],
  };
}

/** @param {unknown} c */
function validCandidate(c) {
  if(!c || typeof c!=='object' || Array.isArray(c)) return false;
  const e = /** @type {any} */ (c);
  if(JSON.stringify(Object.keys(e).sort())!==JSON.stringify(CANDIDATE_KEYS))return false;
  if(!/^FND-[A-Z]{3}-\d{2}$/.test(e.id))return false;
  if(!['P0','P1','P2'].includes(e.priority))return false;
  if(!['PUBLIC_DOC_REVIEWED','URL_NOMINATED'].includes(e.source_check))return false;
  if(!['github','hugging_face','research'].includes(e.source_kind))return false;
  if(typeof e.area!=='string'||!e.area||typeof e.title!=='string'||!e.title||!e.candidate_use||!e.critical_guard)return false;
  if(!Array.isArray(e.product_lanes)||e.product_lanes.length===0||e.product_lanes.some((x)=>typeof x!=='string'||x.length>50))return false;
  let u;try {u=new URL(e.source_url);}catch {return false;}
  if(u.protocol!=='https:'||!SOURCE_DOMAINS.has(u.hostname)||u.username||u.password)return false;
  if(e.source_commit_pin!==null || e.exact_license!==null || e.license_status!=='EXACT_VERSION_PENDING')return false;
  for(const key of ['dependency_security_review','data_rights_review','independent_review'])if(e[key]!=='PENDING')return false;
  for(const key of ['execution_grant','production_admission','model_download'])if(e[key]!=='NOT_AUTHORIZED')return false;
  return e.status==='DISCOVERED_CANDIDATE';
}

/**
 * @param {{root?:string}} [options]
 */
export function readFoundryCatalogue(options={}) {
  if(!options.root || typeof options.root!=='string')return refused('No bound source root.');
  const base=path.resolve(options.root);
  const file=path.join(base,FOUNDRY_SOURCE);
  let fd;
  try {
    // Reject unsafe source redirects rather than allowing the catalogue itself
    // to serve as an arbitrary local-file reader.
    const observedBase=realpathSync(base);
    if(lstatSync(file).isSymbolicLink() || realpathSync(file)!==path.join(observedBase,FOUNDRY_SOURCE))
      return refused('Catalogue source is redirected or symlinked.');
    if(!Number.isInteger(constants.O_NOFOLLOW))return refused('No safe source open available.');
    fd=openSync(file,constants.O_RDONLY|constants.O_NOFOLLOW);
    const st=fstatSync(fd);
    if(!st.isFile()||st.size<1||st.size>MAX_BYTES)return refused('Source is not a bounded regular file.');
    const bytes=readFileSync(fd);
    if(createHash('sha256').update(bytes).digest('hex')!==FOUNDRY_SOURCE_SHA256)
      return refused('Catalogue bytes no longer match pinned source fingerprint.');
    const doc=JSON.parse(bytes.toString('utf8'));
    if(!doc||doc.schema!=='ain.capability-foundry.candidate-registry.v1'
      ||doc.programme!==FOUNDRY_ID||doc.authority!=='RESEARCH_INTAKE_ONLY'
      ||doc.catalogue_not_exhaustive!==true||doc.research_and_execution_separation!==true
      ||doc.new_work_unit_grants!=='NONE'||doc.production!=='NOT_AUTHORIZED'
      ||doc.maia_runtime!=='NOT_AUTHORIZED'||doc.member_data!=='NOT_AUTHORIZED'
      ||doc.model_experiment!=='NOT_AUTHORIZED'||doc.writer_public_release!=='NOT_AUTHORIZED'
      ||!Array.isArray(doc.candidates)||doc.candidates.length<20||doc.candidates.length>100
      ||doc.candidates.some(x=>!validCandidate(x))) return refused('Catalogue schema or no-authority standing invalid.');
    const ids=doc.candidates.map(x=>x.id);
    if(new Set(ids).size!==ids.length)return refused('Duplicate candidate identity.');
    return {
      schema:'ain.capability-foundry-catalogue-view.v1',
      programme:FOUNDRY_ID,
      evidence_state:'OBSERVED',
      admission:'RESEARCH_ONLY',
      runtime_grants:'NONE',
      new_work_unit_grants:'NONE',
      model_experiment:'NOT_AUTHORIZED',
      maia_runtime:'NOT_AUTHORIZED',
      source_ref:file,
      source_sha256:FOUNDRY_SOURCE_SHA256,
      candidates:doc.candidates.map(x=>({
        id:x.id,
        title:x.title,
        area:x.area,
        priority:x.priority,
        product_lanes:[...x.product_lanes],
        source_url:x.source_url,
        source_check:x.source_check,
        candidate_use:x.candidate_use,
        critical_guard:x.critical_guard,
        execution_grant:'NOT_AUTHORIZED',
        license_status:'EXACT_VERSION_PENDING',
        status:'DISCOVERED_CANDIDATE',
      })),
      reason:'Public candidate metadata only. Links and research methods do not grant execution, downloads, licensed reuse, member access or product admission.',
    };
  } catch(e) {
    return refused('Catalogue absent, unparseable, or unsafe: '+String(/** @type {Error} */(e)?.message||'unknown').slice(0,100));
  } finally {
    if(fd!==undefined)try{closeSync(fd);}catch{/* reader holds no grant */}
  }
}
