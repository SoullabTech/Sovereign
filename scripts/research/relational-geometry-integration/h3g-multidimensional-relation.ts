import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Form='CONDITIONAL_LINK'|'CONTRASTIVE_LINK'|'INHIBITORY_LINK'|'EXPLICIT_LINK'|'NONE';
type Dir='DIRECTED'|'SYMMETRIC'|'NONE';
type Dyn='EVOKES'|'INHIBITS'|'NONE';
type Config='ALIGNMENT'|'TENSION'|'NONE';
type Node={id:string;text:string};
type Expected={bound:boolean;bindingForm:Form;directionality:Dir;sourceId:string|null;targetId:string|null;dynamicOperator:Dyn;configuration:Config};
type Fixture={id:string;raw:string;nodes:Node[];expected:Expected;symmetricEndpoints?:boolean};

const fixtures:Fixture[]=[
 {id:'G1_EVOKES_ALIGNMENT',raw:'Leaving makes sense to me, and when I imagine leaving my body settles; the thought and the bodily response feel like they are moving the same way.',nodes:[{id:'AIR_LEAVE',text:'Leaving makes sense.'},{id:'EARTH_SETTLE',text:'My body settles when I imagine leaving.'}],expected:{bound:true,bindingForm:'CONDITIONAL_LINK',directionality:'DIRECTED',sourceId:'AIR_LEAVE',targetId:'EARTH_SETTLE',dynamicOperator:'EVOKES',configuration:'ALIGNMENT'}},
 {id:'G2_SYMMETRIC_TENSION',raw:'I still love him, and at the same time I want to leave; those two truths pull against each other.',nodes:[{id:'WATER_LOVE',text:'I still love him.'},{id:'FIRE_LEAVE',text:'I want to leave.'}],expected:{bound:true,bindingForm:'CONTRASTIVE_LINK',directionality:'SYMMETRIC',sourceId:'WATER_LOVE',targetId:'FIRE_LEAVE',dynamicOperator:'NONE',configuration:'TENSION'},symmetricEndpoints:true},
 {id:'G3_INHIBITS_TENSION',raw:'I want to launch this week, but my physical exhaustion is what keeps me from sustaining the push.',nodes:[{id:'FIRE_LAUNCH',text:'I want to launch this week.'},{id:'EARTH_EXHAUST',text:'Physical exhaustion keeps me from sustaining the push.'}],expected:{bound:true,bindingForm:'INHIBITORY_LINK',directionality:'DIRECTED',sourceId:'EARTH_EXHAUST',targetId:'FIRE_LAUNCH',dynamicOperator:'INHIBITS',configuration:'TENSION'}},
 {id:'G4_EVOKES_ONLY',raw:'When I think about the financial risk, my chest tightens. I am only describing the sequence, not saying the thought and body are in agreement or conflict.',nodes:[{id:'AIR_RISK',text:'I think about financial risk.'},{id:'EARTH_TIGHTEN',text:'My chest tightens.'}],expected:{bound:true,bindingForm:'CONDITIONAL_LINK',directionality:'DIRECTED',sourceId:'AIR_RISK',targetId:'EARTH_TIGHTEN',dynamicOperator:'EVOKES',configuration:'NONE'}},
 {id:'G5_EVOKES_ALIGNMENT',raw:'When I think about the new path, hope rises, and the thought and feeling seem to support the same direction.',nodes:[{id:'AIR_NEWPATH',text:'I think about the new path.'},{id:'WATER_HOPE',text:'Hope rises.'}],expected:{bound:true,bindingForm:'CONDITIONAL_LINK',directionality:'DIRECTED',sourceId:'AIR_NEWPATH',targetId:'WATER_HOPE',dynamicOperator:'EVOKES',configuration:'ALIGNMENT'}},
 {id:'G6_UNBOUND',raw:'I am uncertain about the plan. I also feel afraid today. I have not said that one causes, supports, blocks, or conflicts with the other.',nodes:[{id:'AIR_UNCERTAIN',text:'I am uncertain about the plan.'},{id:'WATER_AFRAID',text:'I feel afraid today.'}],expected:{bound:false,bindingForm:'NONE',directionality:'NONE',sourceId:null,targetId:null,dynamicOperator:'NONE',configuration:'NONE'}},
];

const MODEL='claude-sonnet-4-6',REPEATS=2;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
function callLocal(f:Fixture){
  const user=`MEMBER LANGUAGE:\n${f.raw}\nNODES:\n${f.nodes.map(n=>`${n.id}: ${n.text}`).join('\n')}`;
  const p=spawnSync('claude',['-p','--model',MODEL,'--effort','low','--system-prompt',system,'--restricted','--tools','','--output-format','text',user],{encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024,input:''});
  if(p.status!==0) throw new Error(`claude-cli:${p.status}:${(p.stderr||'').slice(0,300)}`);
  return {text:p.stdout.trim(),model:MODEL};
}

const system=`Offline relational-geometry research. Analyze each pair on INDEPENDENT axes. Do not force one label to replace another. Return JSON only with: {"bound":boolean,"bindingForm":"CONDITIONAL_LINK"|"CONTRASTIVE_LINK"|"INHIBITORY_LINK"|"EXPLICIT_LINK"|"NONE","directionality":"DIRECTED"|"SYMMETRIC"|"NONE","sourceId":string|null,"targetId":string|null,"dynamicOperator":"EVOKES"|"INHIBITS"|"NONE","configuration":"ALIGNMENT"|"TENSION"|"NONE"}. Rules: EVOKES and INHIBITS are directed dynamic operators. ALIGNMENT and TENSION are configuration properties and may coexist with a dynamic operator. Mere co-occurrence is not a binding. If unbound, all relation axes must be NONE and endpoints null.`;
function parse(s:string){return JSON.parse(s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')) as Expected;}
function endpointCorrect(f:Fixture,x:Expected){if(!f.expected.bound)return x.sourceId===null&&x.targetId===null;if(f.symmetricEndpoints){return new Set([x.sourceId,x.targetId]).size===2&&new Set([x.sourceId,x.targetId]).has(f.expected.sourceId)&&new Set([x.sourceId,x.targetId]).has(f.expected.targetId);}return x.sourceId===f.expected.sourceId&&x.targetId===f.expected.targetId;}
function axisScore(f:Fixture,x:Expected){return {binding:x.bound===f.expected.bound,form:x.bindingForm===f.expected.bindingForm,direction:x.directionality===f.expected.directionality,endpoints:endpointCorrect(f,x),dynamic:x.dynamicOperator===f.expected.dynamicOperator,configuration:x.configuration===f.expected.configuration};}

async function main(){
  const rows:any[]=[];
  for(const f of fixtures){
    for(let run=1;run<=REPEATS;run++){
      const r=callLocal(f);
      let x:Expected={bound:false,bindingForm:'NONE',directionality:'NONE',sourceId:null,targetId:null,dynamicOperator:'NONE',configuration:'NONE'};
      let parseError:string|null=null;
      try{x=parse(r.text)}catch(e){parseError=e instanceof Error?e.message:String(e)}
      const axes=axisScore(f,x);
      rows.push({fixture:f.id,run,rawHash:sha(r.text),model:r.model,prediction:x,expected:f.expected,axes,allCorrect:Object.values(axes).every(Boolean),parseError});
    }
  }
  const axisNames=['binding','form','direction','endpoints','dynamic','configuration'] as const;
  const axisTotals=Object.fromEntries(axisNames.map(k=>[k,{correct:rows.filter(r=>r.axes[k]).length,total:rows.length}]));
  const byFixture=Object.fromEntries(fixtures.map(f=>{const rs=rows.filter(r=>r.fixture===f.id);return[f.id,{runs:rs.length,allCorrect:rs.filter(r=>r.allCorrect).length,predictions:rs.map(r=>r.prediction)}]}));
  const multiTrue=rows.filter(r=>r.expected.dynamicOperator!=='NONE'&&r.expected.configuration!=='NONE');
  const output={schema:'RELATIONAL_GEOMETRY_H3G_MULTIDIMENSIONAL_RELATION_V1',authority:'offline research only',inference:{provider:'anthropic',model:MODEL,path:'local Claude CLI restricted/no-tools',temperature:'CLI-managed; not production-equivalent temperature'},hypothesis:'Binding, directionality, dynamic operator, and configuration are separable relation dimensions; dynamic and configuration properties may coexist on one bound pair.',summary:{runs:rows.length,allCorrect:rows.filter(r=>r.allCorrect).length,axisTotals,multiDimensionCases:multiTrue.length,multiDimensionAllCorrect:multiTrue.filter(r=>r.allCorrect).length,falseBoundOnUnbound:rows.filter(r=>r.fixture==='G6_UNBOUND'&&r.prediction.bound).length},byFixture,rows};
  fs.writeFileSync(path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H3G_MULTIDIMENSIONAL_RELATION_2026-09-16.json'),JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({summary:output.summary,byFixture},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
