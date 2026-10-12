// @ts-check
/**
 * RGR-CF01, frozen documentary intake: local files are observations, not authority.
 * A reviewed source commitment is compiled into this read seam; an editable
 * sidecar cannot attest itself, advance a gate, or co-rewrite the source.
 * No network, subprocess, model, clock, timers, writes or lifecycle transitions.
 */
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

export const RGR_CF_WORK_ID = 'v2-rgr-cf01-research-intake-20261012';
export const RGR_CF_TITLE = 'Relational Geometry — Counterfactual Research Intake';
export const RGR_CF_SCHEMA = 'jarvis.rgr-cf01-research-intake.v1';
export const RGR_CF_DOCUMENT = 'docs/programme/RGR-CF01_COUNTERFACTUAL_RELATIONAL_GEOMETRY_INTAKE_2026-10-12.md';

/**
 * Trust anchors: the document's SHA-256 is derived from this *exact* Git commit,
 * independently of the local index. The frozen version is documentary only.
 * The checks in rgr-cf01-research-intake.mjs independently prove the Git tree
 * blob's bytes and hash against these compile-time constants.
 */
export const RGR_CF_SOURCE_COMMIT = '0b6578fc8585304805a9c7cd71264e9955d2b0f0';
export const RGR_CF_SOURCE_SHA256 = '98991c78a57d06ec4b234531d3ea1a56e59cfc23b6af1cb0353da639dd62efab';
export const RGR_CF_RECORDED_AT = '2026-10-12T15:41:11Z';
const INDEX = 'rgr-cf01-research-intake.v1.json';
const MAX_BYTES = 25000;

// This is a literal documentary standing. A future independent review or new
// research authority must be a *new governed event/schema*, never a sidecar edit.
// The precise words are frozen too: free-form explanatory text could otherwise
// misrepresent experimental standing while keeping the apparent status unchanged.
const FROZEN_STAGE_ROWS = [
  {id:'source-custody',label:'Primary sources and video provenance',
    plain:'Primary paper links, methodological description and transcript fingerprint documented.',standing:'documented'},
  {id:'hypotheses',label:'Four proposed research hypotheses',
    plain:'Correction sensitivity, selective invariance, carry-forward and future geometry remain untested.',standing:'candidate'},
  {id:'falsification',label:'Falsification criteria drafted',
    plain:'Defeat conditions and competing explanations drafted; no metric or numerical threshold preregistered.',standing:'candidate'},
  {id:'independent-review',label:'Independent documentary review',
    plain:'A separate reviewer has not assessed the exact packet.',standing:'not-reviewed'},
  {id:'experiment-authority',label:'Experimental authorization',
    plain:'No benchmark, model, training, probe, member data or provider execution from this intake.',standing:'hold'},
  {id:'maia-boundary',label:'MAIA developmental boundary',
    plain:'MAIA cognition, prompts, memory and production behavior are unchanged by this intake.',standing:'hold'},
];
export const RGR_CF_FROZEN_STAGES = Object.freeze(FROZEN_STAGE_ROWS.map(s=>Object.freeze({...s})));

const REQUIRED_KEYS = Object.freeze([
  'schema','work_unit_id','title','programme','authority',
  'experiment_authority','maia_authority','source_rel','source_sha256',
  'source_commit','recorded_at','stages',
].sort());

/** @param {string} file */
function safeRegular(file) {
  try {
    const stat=lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size<1 || stat.size>MAX_BYTES) return false;
    return realpathSync(file)===path.resolve(file);
  } catch { return false; }
}
/** @param {string} reason */
function unverified(reason) {
  return {
    work_unit_id:RGR_CF_WORK_ID, title:RGR_CF_TITLE,
    authority:'orientation_only', experiment_authority:'NOT_AUTHORIZED',
    maia_authority:'NOT_AUTHORIZED', evidence_state:'UNVERIFIED',
    source_verified:false, file:null, source_ref:null, source_sha256:null,
    source_commit:null, recorded_at:null, stages:[], reason,
  };
}

/**
 * @param {{env?:NodeJS.ProcessEnv,home?:string,root?:string}} [opts]
 * @returns {any}
 */
export function readRgrCf01ResearchIntake(opts={}) {
  const env=opts.env||process.env;
  const home=opts.home||os.homedir();
  const ainHome=env.AIN_DELEGATION_HOME||path.join(home,'.claude','ain-delegation');
  const index=path.join(ainHome,'projections',INDEX);
  if (!safeRegular(index)) return unverified('RGR-CF01 index missing, inaccessible or unsafe.');
  let meta;
  try { meta=JSON.parse(readFileSync(index,'utf8')); }
  catch { return unverified('RGR-CF01 index is not parseable.'); }
  if (!meta || typeof meta!=='object' || Array.isArray(meta)
    || JSON.stringify(Object.keys(meta).sort())!==JSON.stringify(REQUIRED_KEYS)
    || meta.schema!==RGR_CF_SCHEMA
    || meta.work_unit_id!==RGR_CF_WORK_ID || meta.title!==RGR_CF_TITLE
    || meta.programme!=='RELATIONAL-GEOMETRY-REASONING'
    || meta.authority!=='orientation_only' || meta.experiment_authority!=='NOT_AUTHORIZED'
    || meta.maia_authority!=='NOT_AUTHORIZED'
    || meta.source_rel!==RGR_CF_DOCUMENT
    || meta.source_sha256!==RGR_CF_SOURCE_SHA256
    || meta.source_commit!==RGR_CF_SOURCE_COMMIT
    || meta.recorded_at!==RGR_CF_RECORDED_AT
    || JSON.stringify(meta.stages)!==JSON.stringify(RGR_CF_FROZEN_STAGES)) {
    return unverified('RGR-CF01 immutable source, provenance, or documentary gate record does not match the frozen intake.');
  }
  if (!opts.root) return unverified('No observed repository root is bound.');
  const root=path.resolve(opts.root);
  const docPath=path.join(root,RGR_CF_DOCUMENT);
  if (!existsSync(docPath) || !safeRegular(docPath))
    return unverified('RGR-CF01 source is absent, modified, oversized or symlinked.');
  const actual=createHash('sha256').update(readFileSync(docPath)).digest('hex');
  if (actual!==RGR_CF_SOURCE_SHA256)
    return unverified('RGR-CF01 source differs from the pinned committed intake, even if the sidecar was changed.');
  return {
    work_unit_id:RGR_CF_WORK_ID, title:RGR_CF_TITLE,
    authority:'orientation_only', experiment_authority:'NOT_AUTHORIZED',
    maia_authority:'NOT_AUTHORIZED', evidence_state:'OBSERVED',
    source_verified:true, file:index, source_ref:docPath,
    source_sha256:RGR_CF_SOURCE_SHA256, source_commit:RGR_CF_SOURCE_COMMIT,
    source_custody:'LOCAL_BYTES_MATCH_PINNED_COMMIT_DOCUMENT',
    recorded_at:RGR_CF_RECORDED_AT, stages:RGR_CF_FROZEN_STAGES.map(s=>({...s})),
    historical_only:true,
    reason:'Frozen documentary intake, not a new review or grant. Local source bytes match a digest separately proved against the pinned Git commit; the installed desktop and experiments are not thereby verified.',
  };
}
