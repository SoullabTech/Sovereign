import { createHash } from 'node:crypto';
export function stable(v){
  if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
  if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
  return JSON.stringify(v);
}
export const digest=(v)=>'sha256:'+createHash('sha256').update(stable(v)).digest('hex');
export function graph(){
  const g={graph_id:'g-r5',work_units:[
    {work_unit_id:'p1',depends_on:[]},
    {work_unit_id:'p2',depends_on:[]},
    {work_unit_id:'p3',depends_on:['p1','p2']},
    {work_unit_id:'p4',depends_on:['p3']},
  ],topological_order:['p1','p2','p3','p4']};
  return {...g,graph_digest:digest(g)};
}
export function bindings(g=graph()){
  return g.work_units.map((p,i)=>({graph_id:g.graph_id,graph_digest:g.graph_digest,planned_work_unit_id:p.work_unit_id,canonical_work_unit_id:'w'+(i+1),bound_at_sha:'a'.repeat(40)}));
}
export function runtimes(){return {
  w1:{id:'w1',state:'CLOSED',guard:'valid',authority:'A',route:'R1',scope:'S1'},
  w2:{id:'w2',state:'CLOSED',guard:'valid',authority:'A',route:'R2',scope:'S2'},
  w3:{id:'w3',state:'ROUTED',guard:'valid',authority:'A',route:'R3',scope:'S3'},
  w4:{id:'w4',state:'ROUTED',guard:'valid',authority:'A',route:'R4',scope:'S4'},
};}
export function world(){return {graph:graph(),bindings:bindings(),runtimes:runtimes(),capacity:{available_slots:2},sessions:{opened:[]}};}
export function protectedRuntimeView(w){return stable({runtimes:w.runtimes,sessions:w.sessions});}
