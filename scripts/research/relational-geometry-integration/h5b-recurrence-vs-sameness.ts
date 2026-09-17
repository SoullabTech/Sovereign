import fs from 'node:fs';
import path from 'node:path';

type Dyn='NONE'|'EVOKES'|'INHIBITS';
type Config='NONE'|'ALIGNMENT'|'TENSION';
type Standing='established'|'adopted'|'provisional';
type R={present:boolean;endpoints:[string,string];scope:string;dynamic:Dyn;configuration:Config;standing:Standing};
type Expected={trajectory:'RETURNS_TO'|'PERSISTS'|'NEW_RELATION';sameGeometry:boolean;changedDimensions:string[]};
type Fixture={id:string;timeline:R[];expected:Expected};
const r=(present:boolean,endpoints:[string,string],scope:string,dynamic:Dyn,configuration:Config,standing:Standing):R=>({present,endpoints,scope,dynamic,configuration,standing});
const absent=(endpoints:[string,string],scope='relationship')=>r(false,endpoints,scope,'NONE','NONE','established');
const fixtures:Fixture[]=[
 {id:'B1_EXACT_RETURN',timeline:[r(true,['WATER_LOVE','FIRE_LEAVE'],'relationship','NONE','TENSION','established'),absent(['WATER_LOVE','FIRE_LEAVE']),r(true,['WATER_LOVE','FIRE_LEAVE'],'relationship','NONE','TENSION','established')],expected:{trajectory:'RETURNS_TO',sameGeometry:true,changedDimensions:[]}},
 {id:'B2_RETURN_CONFIG_CHANGED',timeline:[r(true,['WATER_LOVE','FIRE_LEAVE'],'relationship','NONE','TENSION','established'),absent(['WATER_LOVE','FIRE_LEAVE']),r(true,['WATER_LOVE','FIRE_LEAVE'],'relationship','NONE','ALIGNMENT','established')],expected:{trajectory:'RETURNS_TO',sameGeometry:false,changedDimensions:['configuration']}},
 {id:'B3_RETURN_DYNAMIC_CHANGED',timeline:[r(true,['EARTH_EXHAUST','FIRE_LAUNCH'],'work','NONE','TENSION','established'),absent(['EARTH_EXHAUST','FIRE_LAUNCH'],'work'),r(true,['EARTH_EXHAUST','FIRE_LAUNCH'],'work','INHIBITS','TENSION','established')],expected:{trajectory:'RETURNS_TO',sameGeometry:false,changedDimensions:['dynamic']}},
 {id:'B4_RETURN_STANDING_CHANGED',timeline:[r(true,['AIR_NEWPATH','WATER_HOPE'],'career','EVOKES','ALIGNMENT','provisional'),absent(['AIR_NEWPATH','WATER_HOPE'],'career'),r(true,['AIR_NEWPATH','WATER_HOPE'],'career','EVOKES','ALIGNMENT','adopted')],expected:{trajectory:'RETURNS_TO',sameGeometry:false,changedDimensions:['standing']}},
 {id:'B5_PERSISTS_NOT_RETURN',timeline:[r(true,['AIR_WAIT','FIRE_WAIT'],'decision','NONE','ALIGNMENT','established'),r(true,['AIR_WAIT','FIRE_WAIT'],'decision','NONE','ALIGNMENT','established'),r(true,['AIR_WAIT','FIRE_WAIT'],'decision','NONE','ALIGNMENT','established')],expected:{trajectory:'PERSISTS',sameGeometry:true,changedDimensions:[]}},
 {id:'B6_NEW_ENDPOINT_PAIR',timeline:[r(true,['AIR_RISK','EARTH_TIGHTEN'],'decision','EVOKES','NONE','established'),absent(['AIR_RISK','EARTH_TIGHTEN'],'decision'),r(true,['AIR_RISK','WATER_FEAR'],'decision','EVOKES','NONE','established')],expected:{trajectory:'NEW_RELATION',sameGeometry:false,changedDimensions:['endpoints']}},
 {id:'B7_SCOPE_BOUNDARY',timeline:[r(true,['AIR_PLAN','FIRE_ACT'],'relationship','NONE','ALIGNMENT','established'),absent(['AIR_PLAN','FIRE_ACT'],'relationship'),r(true,['AIR_PLAN','FIRE_ACT'],'work','NONE','ALIGNMENT','established')],expected:{trajectory:'NEW_RELATION',sameGeometry:false,changedDimensions:['scope']}},
];
const pair=(x:R)=>[...x.endpoints].sort().join('|');
const identity=(x:R)=>`${pair(x)}::${x.scope}`;
function naive(f:Fixture):Expected{const current=f.timeline.at(-1)!;const prior=f.timeline.slice(0,-1).filter(x=>x.present);const seen=prior.some(x=>pair(x)===pair(current));return seen?{trajectory:'RETURNS_TO',sameGeometry:true,changedDimensions:[]}:{trajectory:'NEW_RELATION',sameGeometry:false,changedDimensions:['endpoints']};}
function full(f:Fixture):Expected{const current=f.timeline.at(-1)!;const prior=f.timeline.slice(0,-1);const matching=prior.map((x,i)=>({x,i})).filter(({x})=>x.present&&identity(x)===identity(current));if(matching.length===0){const samePair=prior.some(x=>x.present&&pair(x)===pair(current));return{trajectory:'NEW_RELATION',sameGeometry:false,changedDimensions:[samePair?'scope':'endpoints']};}const last=matching.at(-1)!;const interrupted=prior.slice(last.i+1).some(x=>!x.present||identity(x)!==identity(current));const changed:string[]=[];if(last.x.dynamic!==current.dynamic)changed.push('dynamic');if(last.x.configuration!==current.configuration)changed.push('configuration');if(last.x.standing!==current.standing)changed.push('standing');return{trajectory:interrupted?'RETURNS_TO':'PERSISTS',sameGeometry:changed.length===0,changedDimensions:changed};}
const same=(a:Expected,b:Expected)=>a.trajectory===b.trajectory&&a.sameGeometry===b.sameGeometry&&a.changedDimensions.length===b.changedDimensions.length&&a.changedDimensions.every(x=>b.changedDimensions.includes(x));
const rows=fixtures.map(f=>{const a=naive(f),b=full(f);return{fixture:f.id,expected:f.expected,endpointOnly:a,fullGeometry:b,endpointOnlyCorrect:same(a,f.expected),fullGeometryCorrect:same(b,f.expected)};});
const output={schema:'RELATIONAL_GEOMETRY_H5B_RECURRENCE_VS_SAMENESS_V1',authority:'offline deterministic research only',law:'Endpoint recurrence is not relation identity. Recurrence, persistence, scope, and geometry change must remain distinct.',summary:{fixtures:rows.length,endpointOnlyCorrect:rows.filter(r=>r.endpointOnlyCorrect).length,fullGeometryCorrect:rows.filter(r=>r.fullGeometryCorrect).length,transformedReturns:rows.filter(r=>r.expected.trajectory==='RETURNS_TO'&&!r.expected.sameGeometry).length,transformedReturnsPreserved:rows.filter(r=>r.expected.trajectory==='RETURNS_TO'&&!r.expected.sameGeometry&&r.fullGeometryCorrect).length},rows};
fs.writeFileSync(path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H5B_RECURRENCE_VS_SAMENESS_2026-09-16.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
