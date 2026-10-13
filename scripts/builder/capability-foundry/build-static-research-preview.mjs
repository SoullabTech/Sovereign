// @ts-check
/**
 * Generate one self-contained local HTML demo. This is an OFFLINE
 * research-artifact builder, not a JARVIS or MAIA runtime integration.
 * No remote requests, model execution, package installation or member data.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {readFoundryCatalogue} from './catalogue-reader.mjs';
import {projectFoundryWorld} from './world-projection.mjs';

const home='/Users/soullab';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const accepted=readFileSync(path.join(home,'JARVIS-handoffs/AIN-CAPABILITY-FOUNDRY-01_FOUNDER_DECISION_2026-10-12.json'),'utf8');
const catalogue=readFoundryCatalogue({root});
const projection=projectFoundryWorld({catalogue,founderDecisionText:accepted});
if(projection.source_evidence!=='OBSERVED'
  ||projection.status!=='ACCEPTED_RESEARCH_ONLY'
  ||projection.candidates.length!==26
  ||projection.execution_grants!=='NONE'
  ||projection.installed_jarvis_integration!==false)
  throw new Error('Refusing prototype generation: Foundry source, acceptance or authority is not verified.');

const templateFile=path.join(root,'docs/prototypes/ain-foundry-readonly-template.html');
const template=readFileSync(templateFile,'utf8');
const marker='__FOUNDRY_MODEL_JSON__';
if(template.split(marker).length!==2)throw new Error('Refusing ambiguous HTML template marker.');
if(!template.includes("connect-src 'none'")||!template.includes("default-src 'none'"))
  throw new Error('Refusing preview without local-only content policy.');
const encoded=JSON.stringify(projection).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
const html=template.replace(marker,encoded);
const destination=path.join(home,'JARVIS-handoffs/AIN_FOUNDRY_RESEARCH_ONLY_PREVIEW_R2_2026-10-12.html');
const evidence=path.join(home,'JARVIS-handoffs/AIN_FOUNDRY_RESEARCH_ONLY_PREVIEW_R2_BUILD_2026-10-12.json');
const hashed=s=>createHash('sha256').update(s,'utf8').digest('hex');
writeFileSync(destination,html,{flag:'wx',mode:0o600});
writeFileSync(evidence,JSON.stringify({
  schema:'ain.capability-foundry.offline-preview-build.v1',
  programme:projection.programme,
  source_sha256:projection.source_sha256,
  founder_decision_status:projection.founder_acceptance.standing,
  prototype_source_commit:'45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d',
  preview_sha256:hashed(html),
  static_html_path:destination,
  candidates:projection.candidates.length,
  rooms:['Today','Work','Graph','Monitor','System'],
  graph_nodes:projection.graph.nodes.length,
  graph_edges:projection.graph.edges.length,
  execution_grants:'NONE',
  installed:false,
  network_requests:'NONE_AUTOMATIC',
  data_access:'PUBLIC_RESEARCH_METADATA_ONLY',
  no_maia_or_jarvis_integration:true
},null,2)+'\n',{flag:'wx',mode:0o600});
console.log('FOUNDRY_OFFLINE_RESEARCH_PREVIEW',destination);
console.log('SHA256',hashed(html));
console.log('GRAPH',projection.graph.nodes.length,'nodes',projection.graph.edges.length,'source relations');
console.log('ACCEPTANCE',projection.founder_acceptance.standing,'NO_RUNTIME_GRANTS',projection.execution_grants);
