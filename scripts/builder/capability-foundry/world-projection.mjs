// @ts-check
/**
 * AIN Capability Foundry — offline, isolated read-only five-room projection.
 *
 * Deliberately NOT imported by installed JARVIS, MAIA, the canonical view-model
 * or any production service. The caller passes existing verified evidence.
 * Do not interpret this proposal as an operational authority.
 */
import {createHash} from 'node:crypto';
import {FOUNDRY_ID, FOUNDRY_SOURCE_SHA256} from './catalogue-reader.mjs';

export const FOUNDRY_ACCEPTANCE_SHA256 =
  '1f3a11e9fb93d83afe53c20d0e1cf519379706bf7faf96b695989823bf8e815e';
export const FOUNDRY_ACCEPTED_COMMIT = '45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d';

const LANES=Object.freeze({
  ain:'AIN OS',
  jarvis:'JARVIS',
  writers:"Writer's Studio",
  'pro-studio':'Pro Studio',
  astrology:'Astrology Pro',
  rgr:'RGR research',
});
const PRIORITIES=['P0','P1','P2'];
const DENIED=Object.freeze([
  {id:'install',title:'Third-party installs and skills',standing:'NOT_AUTHORIZED'},
  {id:'download',title:'Model and dataset downloads',standing:'NOT_AUTHORIZED'},
  {id:'experiment',title:'Model training, tests and research experiments',standing:'NOT_AUTHORIZED'},
  {id:'member_data',title:'Member and clinical information',standing:'NOT_AUTHORIZED'},
  {id:'provider',title:'External providers and spending',standing:'NOT_AUTHORIZED'},
  {id:'work_unit',title:'JARVIS Work Unit creation or changes',standing:'NOT_AUTHORIZED'},
  {id:'maia',title:'MAIA voice, prompts, memory or runtime',standing:'NOT_AUTHORIZED'},
  {id:'merge',title:'Merges, production and deployment',standing:'NOT_AUTHORIZED'},
  {id:'product',title:'Live Kelly’s World/product integration',standing:'NOT_AUTHORIZED'},
]);

/** @param {unknown} raw */
export function verifyFounderAcceptance(raw) {
  if(typeof raw!=='string')return {valid:false,standing:'UNVERIFIED',reason:'Founder decision receipt absent.'};
  if(createHash('sha256').update(raw,'utf8').digest('hex')!==FOUNDRY_ACCEPTANCE_SHA256)
    return {valid:false,standing:'UNVERIFIED',reason:'Founder decision does not match the pinned documentary receipt.'};
  try {
    const rec=JSON.parse(raw);
    if(rec.schema!=='ain.capability-foundry.founder-decision.v1'
       ||rec.exact_git_commit!==FOUNDRY_ACCEPTED_COMMIT
       ||rec.decision!=='ACCEPTED_RESEARCH_ONLY'
       ||rec.catalogue_sha256!==FOUNDRY_SOURCE_SHA256
       ||!Array.isArray(rec.execution_grants_added)||rec.execution_grants_added.length!==0
       ||rec.work_units_changed!==false||rec.production_or_MAIA_changed!==false)
       return {valid:false,standing:'UNVERIFIED',reason:'Founder decision shape or authority boundary invalid.'};
    return {
      valid:true,
      standing:'ACCEPTED_RESEARCH_ONLY',
      exact_commit:FOUNDRY_ACCEPTED_COMMIT,
      reason:'Founder accepted the fixed catalogue for research-only inventory. This is documentary evidence, not an authenticated signature or execution grant.',
      cryptographically_signed:false,
    };
  } catch {
    return {valid:false,standing:'UNVERIFIED',reason:'Founder decision receipt is not readable.'};
  }
}

/** @param {unknown} catalogue */
function trustedCatalogue(catalogue) {
  const c=/** @type {any} */ (catalogue);
  if(!c||c.schema!=='ain.capability-foundry-catalogue-view.v1'
    ||c.programme!==FOUNDRY_ID||c.evidence_state!=='OBSERVED'
    ||c.source_sha256!==FOUNDRY_SOURCE_SHA256
    ||c.admission!=='RESEARCH_ONLY'||c.runtime_grants!=='NONE'
    ||c.new_work_unit_grants!=='NONE'
    ||c.model_experiment!=='NOT_AUTHORIZED'||c.maia_runtime!=='NOT_AUTHORIZED'
    ||!Array.isArray(c.candidates)||c.candidates.length!==26)
    return false;
  const ids=new Set();
  for(const x of c.candidates){
    if(!x||typeof x.id!=='string'||ids.has(x.id)
      ||!PRIORITIES.includes(x.priority)
      ||x.execution_grant!=='NOT_AUTHORIZED'||x.license_status!=='EXACT_VERSION_PENDING'
      ||x.status!=='DISCOVERED_CANDIDATE'
      ||!['PUBLIC_DOC_REVIEWED','URL_NOMINATED'].includes(x.source_check)
      ||!Array.isArray(x.product_lanes)
      ||x.product_lanes.some((lane)=>!(lane in LANES)))return false;
    ids.add(x.id);
  }
  return true;
}

/**
 * @param {{catalogue:unknown,founderDecisionText?:unknown}} args
 */
export function projectFoundryWorld(args) {
  const decision=verifyFounderAcceptance(args?.founderDecisionText);
  const c=/** @type {any} */ (args?.catalogue);
  const trusted=trustedCatalogue(c);
  const base={
    schema:'ain.capability-foundry-five-room-projection.v1',
    programme:FOUNDRY_ID,
    presentation_only:true,
    authority_effect:'none',
    installed_jarvis_integration:false,
    founder_acceptance:decision,
    read_only:true,
    execution_grants:'NONE',
    source_sha256:trusted?FOUNDRY_SOURCE_SHA256:null,
    source_evidence:trusted?'OBSERVED':'UNVERIFIED',
    denied: DENIED.map(x=>({...x})),
  };
  if(!trusted){
    return {...base,
      status:'UNVERIFIED',
      today:{room:'Today',state:'Watching',title:'The Foundry is not verified',description:'No research candidates can be displayed from an unverified source.',needs_founder:false},
      work:{room:'Work',rows:[],next_act:'Restore exact source custody; do not take action on unverified candidates.'},
      graph:{room:'Graph',nodes:[],edges:[]},
      monitor:{room:'Monitor',rows:[{name:'Catalogue evidence',standing:'UNVERIFIED'}]},
      system:{room:'System',standing:'ALL_HELD',blocked:DENIED.map(x=>({...x}))},
      candidates:[],
      counts:{total:0,by_priority:{P0:0,P1:0,P2:0},source_verified:false,licensed:0,installed:0},
    };
  }
  const candidates=c.candidates.map((/** @type {any} */ x)=>({
    id:x.id,title:x.title,area:x.area,
    priority:x.priority,
    product_lanes:x.product_lanes.map((/** @type {string} */ id)=>({id,label:LANES[/** @type {keyof typeof LANES} */ (id)]})),
    source_url:x.source_url,
    source_check:x.source_check,
    source_evidence:'CATALOGUE_ENTRY',
    purpose:x.candidate_use,
    boundary:x.critical_guard,
    stage:'Discover',
    license:'Exact license/revision review pending',
    action:'Research source only — no execution',
    source_ref:c.source_ref,
    source_sha256:c.source_sha256,
  })).sort((a,b)=>PRIORITIES.indexOf(a.priority)-PRIORITIES.indexOf(b.priority)||a.title.localeCompare(b.title));
  const priorities=Object.fromEntries(PRIORITIES.map(p=>[p,candidates.filter(x=>x.priority===p).length]));
  const categories=[...new Set(candidates.map(x=>x.area))].sort();
  const lanes=[...new Set(candidates.flatMap(x=>x.product_lanes.map(y=>y.id)))].sort();
  const nodes=[
    {id:'foundry',kind:'programme',label:'Capability Foundry',evidence:'FOUNDERS_RESEARCH_ONLY_DECISION'},
    ...lanes.map(id=>({id:'lane:'+id,kind:'product_lane',label:LANES[/** @type {keyof typeof LANES} */ (id)],evidence:'CATALOGUE_MATCH'})),
    ...candidates.map(x=>({id:'candidate:'+x.id,kind:'candidate',label:x.title,evidence:'DISCOVERED_ONLY'})),
    ...candidates.map(x=>({id:'source:'+x.id,kind:'external_source',label:x.source_url,evidence:'EXTERNAL_URL_UNVERIFIED_LICENSE'})),
  ];
  const edges=[
    ...candidates.map(x=>({from:'foundry',to:'candidate:'+x.id,relation:'catalogues (not enabled)',evidence_ref:x.source_ref,source_sha256:x.source_sha256})),
    ...candidates.map(x=>({from:'candidate:'+x.id,to:'source:'+x.id,relation:'proposes external source',evidence_ref:x.source_url,source_sha256:x.source_sha256})),
    ...candidates.flatMap(x=>x.product_lanes.map(y=>({from:'candidate:'+x.id,to:'lane:'+y.id,relation:'possible future use — unapproved',evidence_ref:x.source_ref,source_sha256:x.source_sha256}))),
  ];
  return {...base,status:decision.valid?'ACCEPTED_RESEARCH_ONLY':'FOUNDER_DECISION_UNVERIFIED',
    counts:{total:candidates.length,by_priority:priorities,categories:categories.length,lanes:lanes.length,
      source_verified:true,licensed:0,installed:0,member_data_used:0,
      public_docs_reviewed:candidates.filter(x=>x.source_check==='PUBLIC_DOC_REVIEWED').length,
      nominated_only:candidates.filter(x=>x.source_check==='URL_NOMINATED').length},
    candidates,
    today:{room:'Today',state:'Watching',needs_founder:false,title:'The Foundry',
      description:decision.valid?'26 ideas are accepted for research discovery only. None can execute, download, or change MAIA.':
       'Catalogue verified, but the exact founder acceptance receipt is not verified.',
      next_act:'Review one candidate’s source, permissions, and evidence at a time.'},
    work:{room:'Work',
      intro:'Useful possibilities, not work already in motion.',
      rows:candidates.map(x=>({id:x.id,title:x.title,priority:x.priority,stage:'Discover',standing:'NO_EXECUTION',
        plain:x.purpose,source:x.source_url,source_provenance:x.source_check,why_not_enabled:x.boundary,
        next_act:'Verify exact source release, license, supply-chain risk and synthetic evaluation plan.'})),
      next_act:'Inspect AI source/revision comparison against frozen RGR-04 — read-only proposal, not an execution grant.'},
    graph:{room:'Graph',nodes,edges,
      meaning:'This shows catalogued source-to-purpose relations, never proof of capability or a model of human meaning.'},
    monitor:{room:'Monitor',rows:[
      {name:'Catalogue source custody',standing:'OBSERVED',detail:'Exact pinned source SHA matches reader.'},
      {name:'Founder catalogue acceptance',standing:decision.valid?'DOCUMENTED_RESEARCH_ONLY':'UNVERIFIED',detail:decision.reason},
      {name:'Source revision pins',standing:'PENDING',detail:'26 candidate source pins in this registry remain null.'},
      {name:'Exact candidate licenses',standing:'PENDING',detail:'26 candidate license clearances have not been admitted.'},
      {name:'Dependency and security clearance',standing:'PENDING',detail:'No candidate approved for installation.'},
      {name:'Third-party execution',standing:'NOT_AUTHORIZED',detail:'0 activated skills, packages, or model downloads.'},
    ]},
    system:{room:'System',standing:'RESEARCH_ONLY_HELD',blocked:DENIED.map(x=>({...x})),
      prose:'Accepting a research catalogue records an intention to study. No grant may be inferred from a discovery link, model score, source claim, or this preview.'},
  };
}
