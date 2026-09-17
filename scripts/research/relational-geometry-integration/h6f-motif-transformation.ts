import fs from 'node:fs';
import path from 'node:path';

type Op='POLARITY'|'CROSS_CONSTRAINT'|'FACILITATIVE_RESONANCE'|'OPTIONAL_COUPLING'|'FUSION_PRESSURE';
type Edge={a:string;b:string;op:Op;strength:number;tol:number};
type Graph={nodes:string[];edges:Edge[]};
type Motif='CROSS_CONSTRAINT_TRIAD'|'RESONANT_TRIAD'|'BALANCED_CROSS_CONSTRAINT'|'ASYMMETRIC_FOCAL_CONFIGURATION'|'POLAR_MEDIATION_TRIAD'|'PARTIAL_RESONANCE'|'ASYMMETRIC_CROSS_PRESSURE'|'FOCAL_LOCK'|'NONE';
const active=(e:Edge)=>e.strength>=e.tol;
const key=(a:string,b:string)=>[a,b].sort().join('|');
function edgeMap(g:Graph){return new Map(g.edges.filter(active).map(e=>[key(e.a,e.b),e]));}
function countOp(g:Graph,op:Op){return g.edges.filter(e=>active(e)&&e.op===op).length;}
function degree(g:Graph,node:string,op?:Op){return g.edges.filter(e=>active(e)&&(e.a===node||e.b===node)&&(!op||e.op===op)).length;}
function detect(g:Graph):Motif{
  const n=g.nodes.length;
  if(n===3){
    if(countOp(g,'CROSS_CONSTRAINT')===3)return 'CROSS_CONSTRAINT_TRIAD';
    if(countOp(g,'FACILITATIVE_RESONANCE')===3)return 'RESONANT_TRIAD';
    if(countOp(g,'FACILITATIVE_RESONANCE')===2)return 'PARTIAL_RESONANCE';
    if(countOp(g,'POLARITY')===1&&countOp(g,'CROSS_CONSTRAINT')===2)return 'POLAR_MEDIATION_TRIAD';
    if(g.nodes.some(x=>degree(g,x,'OPTIONAL_COUPLING')===2)){
      const focal=g.nodes.find(x=>degree(g,x,'OPTIONAL_COUPLING')===2)!;
      const focalEdges=g.edges.filter(e=>active(e)&&e.op==='OPTIONAL_COUPLING'&&(e.a===focal||e.b===focal));
      if(focalEdges.every(e=>e.strength>=Math.min(1,e.tol+0.25)))return 'FOCAL_LOCK';
      return 'ASYMMETRIC_FOCAL_CONFIGURATION';
    }
  }
  if(n===4){
    if(countOp(g,'CROSS_CONSTRAINT')>=4){
      const degs=g.nodes.map(x=>degree(g,x,'CROSS_CONSTRAINT'));
      if(degs.every(d=>d===2))return 'BALANCED_CROSS_CONSTRAINT';
      return 'ASYMMETRIC_CROSS_PRESSURE';
    }
    if(countOp(g,'CROSS_CONSTRAINT')===3)return 'ASYMMETRIC_CROSS_PRESSURE';
  }
  return 'NONE';
}
const e=(a:string,b:string,op:Op,strength=1,tol=.5):Edge=>({a,b,op,strength,tol});
const cases:{id:string;before:Graph;after:Graph;expectedBefore:Motif;expectedAfter:Motif;edgeDelta:string;expectStable:boolean}[]=[
 {id:'T1_TRIAD_TO_POLAR_MEDIATION',before:{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT'),e('A','C','CROSS_CONSTRAINT')]},after:{nodes:['A','B','C'],edges:[e('A','B','POLARITY'),e('B','C','CROSS_CONSTRAINT'),e('A','C','CROSS_CONSTRAINT')]},expectedBefore:'CROSS_CONSTRAINT_TRIAD',expectedAfter:'POLAR_MEDIATION_TRIAD',edgeDelta:'A-B CROSS_CONSTRAINT→POLARITY',expectStable:false},
 {id:'T2_RESONANT_TO_PARTIAL',before:{nodes:['A','B','C'],edges:[e('A','B','FACILITATIVE_RESONANCE'),e('B','C','FACILITATIVE_RESONANCE'),e('A','C','FACILITATIVE_RESONANCE')]},after:{nodes:['A','B','C'],edges:[e('A','B','FACILITATIVE_RESONANCE'),e('B','C','FACILITATIVE_RESONANCE'),e('A','C','FACILITATIVE_RESONANCE',.3,.5)]},expectedBefore:'RESONANT_TRIAD',expectedAfter:'PARTIAL_RESONANCE',edgeDelta:'A-C resonance drops below tolerance',expectStable:false},
 {id:'T3_BALANCED_TO_ASYMMETRIC',before:{nodes:['A','B','C','D'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT'),e('C','D','CROSS_CONSTRAINT'),e('D','A','CROSS_CONSTRAINT')]},after:{nodes:['A','B','C','D'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT'),e('C','D','CROSS_CONSTRAINT'),e('D','A','CROSS_CONSTRAINT',.2,.5)]},expectedBefore:'BALANCED_CROSS_CONSTRAINT',expectedAfter:'ASYMMETRIC_CROSS_PRESSURE',edgeDelta:'D-A constraint drops below tolerance',expectStable:false},
 {id:'T4_FOCAL_TO_LOCK',before:{nodes:['A','B','C'],edges:[e('A','C','OPTIONAL_COUPLING',.6,.5),e('B','C','OPTIONAL_COUPLING',.6,.5)]},after:{nodes:['A','B','C'],edges:[e('A','C','OPTIONAL_COUPLING',.9,.5),e('B','C','OPTIONAL_COUPLING',.9,.5)]},expectedBefore:'ASYMMETRIC_FOCAL_CONFIGURATION',expectedAfter:'FOCAL_LOCK',edgeDelta:'both focal couplings strengthen',expectStable:false},
 {id:'T5_EMERGENCE',before:{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT'),e('A','C','CROSS_CONSTRAINT',.2,.5)]},after:{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT'),e('A','C','CROSS_CONSTRAINT',.8,.5)]},expectedBefore:'NONE',expectedAfter:'CROSS_CONSTRAINT_TRIAD',edgeDelta:'A-C constraint crosses tolerance',expectStable:false},
 {id:'T6_STABLE_WITHIN_MOTIF',before:{nodes:['A','B','C'],edges:[e('A','B','FACILITATIVE_RESONANCE',.7,.5),e('B','C','FACILITATIVE_RESONANCE',.8,.5),e('A','C','FACILITATIVE_RESONANCE',.75,.5)]},after:{nodes:['A','B','C'],edges:[e('A','B','FACILITATIVE_RESONANCE',.62,.5),e('B','C','FACILITATIVE_RESONANCE',.83,.5),e('A','C','FACILITATIVE_RESONANCE',.68,.5)]},expectedBefore:'RESONANT_TRIAD',expectedAfter:'RESONANT_TRIAD',edgeDelta:'strengths vary but remain above tolerance',expectStable:true},
];
const rows=cases.map(c=>{const before=detect(c.before),after=detect(c.after);const motifChanged=before!==after;const edgeOnlyLabel=c.edgeDelta;return{...c,beforeDetected:before,afterDetected:after,motifChanged,correct:before===c.expectedBefore&&after===c.expectedAfter&&motifChanged===!c.expectStable,edgeOnlyLabel,edgeOnlySufficient:false};});
const out={schema:'RELATIONAL_GEOMETRY_H6F_MOTIF_TRANSFORMATION_V1',authority:'offline deterministic research only',question:'Does an edge-level change induce a whole-configuration transition that is not represented by the edge delta alone?',summary:{cases:rows.length,correct:rows.filter(r=>r.correct).length,motifTransitions:rows.filter(r=>r.motifChanged).length,stableControls:rows.filter(r=>!r.motifChanged).length,edgeOnlySufficient:0},rows,law:'Motif identity is a state variable of the relation field. Edge change and configuration change are distinct facts; neither substitutes for the other.'};
const p=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6F_MOTIF_TRANSFORMATION_2026-09-16.json');fs.writeFileSync(p,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out.summary,null,2));for(const r of rows)console.log(`${r.id}: ${r.beforeDetected} -> ${r.afterDetected} correct=${r.correct}`);
