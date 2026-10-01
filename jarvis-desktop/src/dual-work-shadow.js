// EC1-R7 — dual representation shadow creation. Non-executing migration seam.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const OPWU = require('./operator-work-unit.js');
const CWUV2 = require('./canonical-work-unit-v2.js');
const WUC = require('./work-unit-control.js');
const IDS = require('./shared-work-identity.js');

const lines = (v) => String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);
const stripSelector = (v) => String(v || '').replace(/:\d+-\d+$/, '').trim();
const homeOf = (env) => env?.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const packetFile = (home, id) => path.join(home, 'packets', id + '.json');
const sameSet = (a,b) => JSON.stringify([...(a||[])].sort()) === JSON.stringify([...(b||[])].sort());

function coreFromLegacy(packet) {
  return { id: packet.work_unit_id, objective: packet.objective, base: packet.canonical_sha,
    paths: [...(packet.allowed_files || [])].sort() };
}
function coreFromCanonical(envelope) {
  const w = envelope?.work_unit;
  return { id: w?.identity?.id, objective: w?.identity?.objective, base: w?.scope?.base_ref,
    paths: [...(w?.scope?.allowed_paths || [])].sort() };
}
function equalCore(a,b) {
  return a?.id===b?.id && a?.objective===b?.objective && a?.base===b?.base && sameSet(a?.paths,b?.paths);
}
function expectedCanonicalCore(id, spec, canonicalSha) {
  return { id, objective:String(spec?.objective||'').trim(), base:canonicalSha,
    paths:[...new Set(lines(spec?.evidenceFocus).map(stripSelector).filter(Boolean))].sort() };
}
function readLegacy(home,id) {
  const f=packetFile(home,id); if(!fs.existsSync(f)) return null;
  try{return JSON.parse(fs.readFileSync(f,'utf8'));}catch{return {unreadable:true};}
}

async function createDualShadow(root, { legacySpec, canonicalSpec }, opts = {}) {
  const canonicalSha=String(opts.canonicalSha||'');
  const nowMs=Number.isFinite(opts.nowMs)?opts.nowMs:Date.now();
  const env=opts.env||process.env;
  const home=homeOf(env);
  const sharedId=opts.workUnitId || IDS.makeSharedWorkId(canonicalSpec?.objective || legacySpec?.objective || 'work', nowMs);
  if(!IDS.isSafeSharedWorkId(sharedId)) return {ok:false,status:'REFUSED',reason:'SHARED_WORK_UNIT_ID_INVALID',eligible:false};

  let canonical=CWUV2.readCanonicalExecutionEnvelopeV2(sharedId, env);
  if(!canonical){
    const made=await CWUV2.createCanonicalV2(root,canonicalSpec,{canonicalSha,nowMs,workUnitId:sharedId,env,actorId:opts.actorId});
    if(!made.ok) return {ok:false,status:'CANONICAL_SHADOW_REFUSED',reason:made.reason,eligible:false,work_unit_id:sharedId};
    canonical=CWUV2.readCanonicalExecutionEnvelopeV2(sharedId, env);
  }
  const expected=expectedCanonicalCore(sharedId,canonicalSpec,canonicalSha);
  const canonicalCore=coreFromCanonical(canonical);
  if(!equalCore(expected,canonicalCore)) return {ok:false,status:'SEMANTIC_CORE_MISMATCH',reason:'CANONICAL_SHADOW_CORE_MISMATCH',eligible:false,work_unit_id:sharedId};

  const built=OPWU.buildPacket(legacySpec,{canonicalSha,nowMs,workUnitId:sharedId});
  if(!built.ok) return {ok:false,status:'LEGACY_SHADOW_REFUSED',reason:built.errors.join('; '),eligible:false,work_unit_id:sharedId};
  if(!equalCore(coreFromLegacy(built.packet),canonicalCore)) return {ok:false,status:'SEMANTIC_CORE_MISMATCH',reason:'LEGACY_CANONICAL_CORE_MISMATCH',eligible:false,work_unit_id:sharedId};

  let legacy=readLegacy(home,sharedId);
  if(!legacy){
    const made=await WUC.create(root,built.packet,{home});
    if(!made.ok) return {ok:false,status:'PARTIAL_CANONICAL_SHADOW',reason:made.code||made.reason,eligible:false,work_unit_id:sharedId};
    legacy=readLegacy(home,sharedId);
  }
  if(!legacy || legacy.unreadable || !equalCore(coreFromLegacy(legacy),canonicalCore)) {
    return {ok:false,status:'SEMANTIC_CORE_MISMATCH',reason:'PERSISTED_LEGACY_CORE_MISMATCH',eligible:false,work_unit_id:sharedId};
  }
  return {ok:true,status:'DUAL_SHADOW_READY',eligible:true,work_unit_id:sharedId,semantic_core:canonicalCore};
}

module.exports={createDualShadow,coreFromLegacy,coreFromCanonical,equalCore,expectedCanonicalCore};
