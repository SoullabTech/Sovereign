import fs from 'node:fs';
import path from 'node:path';

type Op='POLARITY'|'CROSS_CONSTRAINT'|'FACILITATIVE_RESONANCE'|'OPTIONAL_COUPLING';
type Edge={a:string;b:string;op:Op};
type Graph={nodes:string[];edges:Edge[]};
type Motion='CONVERGING'|'DIVERGING'|'EXACT'|'STABLE'|'PASSED_EXACT'|'INDETERMINATE';
const key=(e:Edge)=>[e.a,e.b].sort().join('|')+':'+e.op;
const prototypes:Record<string,Graph>={
 CROSS_TRIAD:{nodes:['A','B','C'],edges:[{a:'A',b:'B',op:'CROSS_CONSTRAINT'},{a:'B',b:'C',op:'CROSS_CONSTRAINT'},{a:'A',b:'C',op:'CROSS_CONSTRAINT'}]},
 RESONANT_TRIAD:{nodes:['A','B','C'],edges:[{a:'A',b:'B',op:'FACILITATIVE_RESONANCE'},{a:'B',b:'C',op:'FACILITATIVE_RESONANCE'},{a:'A',b:'C',op:'FACILITATIVE_RESONANCE'}]},
 POLAR_MEDIATION:{nodes:['A','B','C'],edges:[{a:'A',b:'B',op:'POLARITY'},{a:'A',b:'C',op:'CROSS_CONSTRAINT'},{a:'B',b:'C',op:'CROSS_CONSTRAINT'}]},
};
function distance(g:Graph,p:Graph){const gs=new Set(g.edges.map(key)),ps=new Set(p.edges.map(key));let d=0;for(const x of ps)if(!gs.has(x))d++;for(const x of gs)if(!ps.has(x))d++;return d;}
function classify(ds:number[]|null):Motion{if(!ds||ds.length<2)return'INDETERMINATE';if(ds.every(x=>x===0))return'EXACT';if(ds.every(x=>x===ds[0]))return'STABLE';const zero=ds.indexOf(0);if(zero>=0&&zero<ds.length-1&&ds.slice(zero+1).some(x=>x>0))return'PASSED_EXACT';let nonInc=true,nonDec=true;for(let i=1;i<ds.length;i++){if(ds[i]!>ds[i-1]!)nonInc=false;if(ds[i]!<ds[i-1]!)nonDec=false;}if(nonInc&&ds.at(-1)!<ds[0]!)return'CONVERGING';if(nonDec&&ds.at(-1)!>ds[0]!)return'DIVERGING';return'INDETERMINATE';}
const e=(a:string,b:string,op:Op):Edge=>({a,b,op});
const seqs:{id:string;prototype:keyof typeof prototypes;graphs:Graph[]|null;expected:Motion}[]=[
 {id:'G1_CONVERGE_CROSS',prototype:'CROSS_TRIAD',graphs:[{nodes:['A','B','C'],edges:[e('A','B','POLARITY')]},{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT')]},prototypes.CROSS_TRIAD],expected:'CONVERGING'},
 {id:'G2_DIVERGE_RESONANT',prototype:'RESONANT_TRIAD',graphs:[prototypes.RESONANT_TRIAD,{nodes:['A','B','C'],edges:[e('A','B','FACILITATIVE_RESONANCE'),e('B','C','FACILITATIVE_RESONANCE')]},{nodes:['A','B','C'],edges:[e('A','B','FACILITATIVE_RESONANCE')] }],expected:'PASSED_EXACT'},
 {id:'G3_EXACT',prototype:'POLAR_MEDIATION',graphs:[prototypes.POLAR_MEDIATION,prototypes.POLAR_MEDIATION],expected:'EXACT'},
 {id:'G4_STABLE_OFFSET',prototype:'CROSS_TRIAD',graphs:[{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT')]},{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('B','C','CROSS_CONSTRAINT')]}],expected:'STABLE'},
 {id:'G5_PASSED_EXACT',prototype:'CROSS_TRIAD',graphs:[{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT')]},prototypes.CROSS_TRIAD,{nodes:['A','B','C'],edges:[e('A','B','CROSS_CONSTRAINT'),e('A','C','POLARITY')]}],expected:'PASSED_EXACT'},
 {id:'G6_UNORDERED',prototype:'RESONANT_TRIAD',graphs:null,expected:'INDETERMINATE'},
];
const rows=seqs.map(s=>{const ds=s.graphs?s.graphs.map(g=>distance(g,prototypes[s.prototype])):null;const got=classify(ds);return{id:s.id,prototype:s.prototype,distances:ds,expected:s.expected,got,correct:got===s.expected};});
const out={schema:'RELATIONAL_GEOMETRY_H6G_MOTIF_CONVERGENCE_V1',authority:'offline deterministic research only',metric:'symmetric graph-edge edit distance to neutral motif prototype',summary:{cases:rows.length,correct:rows.filter(r=>r.correct).length},rows,law:'Configuration motion is defined downstream of an admitted motif prototype. Convergence/divergence changes no standing and cannot create the motif.'};
fs.writeFileSync(path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6G_MOTIF_CONVERGENCE_2026-09-16.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));
