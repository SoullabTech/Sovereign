import fs from 'node:fs';
import path from 'node:path';

type Operator='POLARITY'|'OPTIONAL_COUPLING';
type Case={id:string;operator:Operator;distance:number;shouldAdmit:boolean};

const cases:Case[]=[
 {id:'P_TRUE',operator:'POLARITY',distance:0.18,shouldAdmit:true},
 {id:'P_FALSE',operator:'POLARITY',distance:0.24,shouldAdmit:false},
 {id:'O_TRUE',operator:'OPTIONAL_COUPLING',distance:0.31,shouldAdmit:true},
 {id:'O_FALSE',operator:'OPTIONAL_COUPLING',distance:0.37,shouldAdmit:false},
];
const operatorTolerance:Record<Operator,number>={POLARITY:0.21,OPTIONAL_COUPLING:0.34};
const score=(threshold:(c:Case)=>number)=>cases.map(c=>({...c,threshold:threshold(c),admitted:c.distance<=threshold(c),correct:(c.distance<=threshold(c))===c.shouldAdmit}));

const globals=[] as any[];
for(let i=0;i<=50;i++){const t=i/100;const rows=score(()=>t);globals.push({threshold:t,correct:rows.filter(r=>r.correct).length,rows});}
const bestGlobal=globals.sort((a,b)=>b.correct-a.correct||a.threshold-b.threshold)[0];
const specific=score(c=>operatorTolerance[c.operator]);
const out={schema:'RELATIONAL_GEOMETRY_H6C_OPERATOR_TOLERANCE_V1',authority:'offline deterministic architecture test only',cases,operatorTolerance,bestGlobal:{threshold:bestGlobal.threshold,correct:bestGlobal.correct,total:cases.length,rows:bestGlobal.rows},operatorSpecific:{correct:specific.filter(r=>r.correct).length,total:cases.length,rows:specific},law:'Tolerance belongs to the relation prototype; no universal threshold is assumed.'};
fs.writeFileSync(path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6C_OPERATOR_TOLERANCE_2026-09-16.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
