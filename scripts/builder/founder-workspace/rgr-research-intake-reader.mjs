// @ts-check
/**
 * RGR-CF01 documentary-only read seam. A governed Work Unit provides identity;
 * this sidecar contributes source-fingerprint orientation, never authority.
 * No network, subprocess, model, timers, writes or lifecycle transitions.
 */
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

export const RGR_CF_WORK_ID = 'v2-rgr-cf01-research-intake-20261012';
export const RGR_CF_TITLE = 'Relational Geometry — Counterfactual Research Intake';
export const RGR_CF_SCHEMA = 'jarvis.rgr-cf01-research-intake.v1';
export const RGR_CF_DOCUMENT = 'docs/programme/RGR-CF01_COUNTERFACTUAL_RELATIONAL_GEOMETRY_INTAKE_2026-10-12.md';
const INDEX = 'rgr-cf01-research-intake.v1.json';
const STAGE_IDS = Object.freeze(['source-custody','hypotheses','falsification','independent-review','experiment-authority','maia-boundary']);
const STATUSES = new Set(['documented','candidate','not-reviewed','hold']);
const MAX_BYTES = 25000;

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
    recorded_at:null, stages:[], reason,
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
  if (!meta || meta.schema!==RGR_CF_SCHEMA
    || meta.work_unit_id!==RGR_CF_WORK_ID || meta.title!==RGR_CF_TITLE
    || meta.programme!=='RELATIONAL-GEOMETRY-REASONING'
    || meta.authority!=='orientation_only' || meta.experiment_authority!=='NOT_AUTHORIZED'
    || meta.maia_authority!=='NOT_AUTHORIZED'
    || meta.source_rel!==RGR_CF_DOCUMENT
    || !/^[0-9a-f]{64}$/.test(meta.source_sha256||'')
    || !Number.isFinite(Date.parse(meta.recorded_at||''))
    || !Array.isArray(meta.stages) || meta.stages.length!==STAGE_IDS.length
    || meta.stages.some((s,i)=>s?.id!==STAGE_IDS[i]
      || !STATUSES.has(s.standing) || typeof s.label!=='string' || !s.label.trim() || s.label.length>120
      || typeof s.plain!=='string' || !s.plain.trim() || s.plain.length>900)
    || meta.stages[0].standing!=='documented'
    || meta.stages[3].standing!=='not-reviewed'
    || meta.stages[4].standing!=='hold'
    || meta.stages[5].standing!=='hold') {
    return unverified('RGR-CF01 index identity, constraints or standing invalid.');
  }

  // The observed checkout is the only source root. Index paths cannot
  // redirect the reader or summon another repository or private file.
  if (!opts.root) return unverified('No observed repository root is bound.');
  const root=path.resolve(opts.root);
  const docPath=path.join(root,RGR_CF_DOCUMENT);
  if (!existsSync(docPath) || !safeRegular(docPath))
    return unverified('RGR-CF01 source is absent, modified, oversized or symlinked.');
  const actual=createHash('sha256').update(readFileSync(docPath)).digest('hex');
  if (actual!==meta.source_sha256)
    return unverified('RGR-CF01 source fingerprint does not match the recorded intake.');
  return {
    work_unit_id:RGR_CF_WORK_ID, title:RGR_CF_TITLE,
    authority:'orientation_only', experiment_authority:'NOT_AUTHORIZED',
    maia_authority:'NOT_AUTHORIZED', evidence_state:'OBSERVED',
    source_verified:true, file:index, source_ref:docPath,
    source_sha256:actual, recorded_at:meta.recorded_at,
    stages:meta.stages.map(s=>({id:s.id,label:s.label,plain:s.plain,standing:s.standing})),
    historical_only:true,
    reason:'Documentary intake only. Experiments and MAIA changes remain prohibited; no independent review verdict is recorded.',
  };
}
