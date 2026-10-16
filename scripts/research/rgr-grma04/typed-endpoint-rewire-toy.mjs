/**
 * RGR-GRM-A04 — exactly two source-authored, typed degree-preserving
 * edge-rewiring reference worlds. Pure math ONLY.
 *
 * No generator, corpus, model inference/training, member data, random source,
 * network, file access or product integration. The two-switch alters
 * ENDPOINTS of two P-typed arcs, never the type of an existing fixed arc.
 */
export const VERTICES=Object.freeze(['s','a','b','c','u','v','w','t']);
export const TYPES=Object.freeze(['OPEN','CLOSED','WAIT','P','Q','R','ACK','IGNORE','DEFER','RESET']);
const e=(from,to,type)=>Object.freeze({from,to,type});

const COMMON=Object.freeze([
  e('s','a','OPEN'), e('s','b','CLOSED'), e('s','c','WAIT'),
  e('u','t','ACK'), e('v','t','IGNORE'), e('w','t','DEFER'),
  e('t','s','RESET'), e('a','w','Q'), e('b','w','R'),
  e('c','u','Q'), e('c','v','R'), e('c','w','P'),
]);
export const G_POS=Object.freeze([...COMMON,e('a','u','P'),e('b','v','P')]);
export const G_NEG=Object.freeze([...COMMON,e('a','v','P'),e('b','u','P')]);

const k=(a,b)=>a+'->'+b;
const bump=(m,x,n=1)=>m.set(x,(m.get(x)||0)+n);
const ordered=(m)=>[...m.entries()].sort(([a],[b])=>a.localeCompare(b));

function validate(edges,vertices=VERTICES){
  if(!Array.isArray(edges)||!Array.isArray(vertices)||vertices.length!==8
    ||new Set(vertices).size!==8||edges.length!==14)throw new TypeError('INVALID_FIXED_SHAPE');
  const seen=new Set();
  for(const x of edges){
    if(!x||typeof x!=='object'||Array.isArray(x)
      ||Object.keys(x).sort().join(',')!=='from,to,type'
      ||!vertices.includes(x.from)||!vertices.includes(x.to)
      ||x.from===x.to||!TYPES.includes(x.type))throw new TypeError('INVALID_ARC');
    if(seen.has(k(x.from,x.to)))throw new TypeError('DUPLICATE_ARC');
    seen.add(k(x.from,x.to));
  }
}
export function bareEdges(edges,vertices=VERTICES){
  validate(edges,vertices);
  return edges.map(x=>k(x.from,x.to)).sort();
}
export function typedEdges(edges,vertices=VERTICES){
  validate(edges,vertices);
  return edges.map(x=>k(x.from,x.to)+'|'+x.type).sort();
}
export function typedDegrees(edges,vertices=VERTICES){
  validate(edges,vertices);
  const m=new Map();
  for(const v of vertices)for(const type of TYPES){
    m.set(v+'|in|'+type,0);m.set(v+'|out|'+type,0);
  }
  for(const x of edges){
    bump(m,x.from+'|out|'+x.type);
    bump(m,x.to+'|in|'+x.type);
  }
  return ordered(m);
}
export function typeHistogram(edges,vertices=VERTICES){
  validate(edges,vertices);
  const m=new Map();
  for(const x of edges)bump(m,x.type);
  return ordered(m);
}
/** A canonical unigram bag, not proof of matching full prose or grammar. */
export function clauseTokenBag(edges,vertices=VERTICES){
  validate(edges,vertices);
  const m=new Map();
  for(const x of edges)for(const token of [x.from,x.type,x.to])bump(m,token);
  return ordered(m);
}
/** Endpoint-free two-hop arc-type pair counts. */
export function twoHopTypeBag(edges,vertices=VERTICES){
  validate(edges,vertices);
  const m=new Map();
  for(const a of edges)for(const b of edges)
    if(a.to===b.from)bump(m,a.type+'|'+b.type);
  return ordered(m);
}
/** Algebraically derived from local typed degrees; not independent evidence. */
export function derivedTwoHopTypeBag(edges,vertices=VERTICES){
  validate(edges,vertices);
  const d=new Map(typedDegrees(edges,vertices)),m=new Map();
  for(const v of vertices)for(const i of TYPES)for(const j of TYPES){
    const n=d.get(v+'|in|'+i)*d.get(v+'|out|'+j);
    if(n)bump(m,i+'|'+j,n);
  }
  return ordered(m);
}
export function reciprocalPairs(edges,vertices=VERTICES){
  validate(edges,vertices);
  const arcs=new Set(edges.map(x=>k(x.from,x.to)));
  let count=0;
  for(const x of edges)if(arcs.has(k(x.to,x.from)))count++;
  return count/2;
}
export function stronglyConnected(edges,vertices=VERTICES){
  validate(edges,vertices);
  for(const root of vertices){
    const seen=new Set([root]),q=[root];
    while(q.length){
      const x=q.shift();
      for(const a of edges)if(a.from===x&&!seen.has(a.to)){
        seen.add(a.to);q.push(a.to);
      }
    }
    if(seen.size!==vertices.length)return false;
  }
  return true;
}
export function anchoredTwoHopEnds(edges,{
  start='s', labels=['OPEN','P'], vertices=VERTICES,
}={}){
  validate(edges,vertices);
  if(!vertices.includes(start)||!Array.isArray(labels)||labels.length!==2
    ||labels.some(x=>!TYPES.includes(x)))throw new TypeError('INVALID_TWO_HOP_QUERY');
  const ends=[];
  for(const a of edges)if(a.from===start&&a.type===labels[0])
    for(const b of edges)if(b.from===a.to&&b.type===labels[1])ends.push(b.to);
  return ends.sort();
}
export function typedThreeHopCount(edges,{
  start='s',target='t',labels=['OPEN','P','ACK'],vertices=VERTICES,
}={}){
  validate(edges,vertices);
  if(!vertices.includes(start)||!vertices.includes(target)
    ||!Array.isArray(labels)||labels.length!==3
    ||labels.some(x=>!TYPES.includes(x)))throw new TypeError('INVALID_THREE_HOP_QUERY');
  let count=0;
  for(const a of edges)if(a.from===start&&a.type===labels[0])
    for(const b of edges)if(b.from===a.to&&b.type===labels[1])
      for(const c of edges)if(c.from===b.to&&c.to===target&&c.type===labels[2])count++;
  return count;
}
/**
 * Exact two-P-arc destination switch, source-authored fixture only.
 * Does not generate new graph classes or permit arbitrary counterfactuals.
 */
export function flipPHeads(edges,vertices=VERTICES){
  validate(edges,vertices);
  const find=(from,to)=>edges.find(x=>x.from===from&&x.to===to);
  const positive=!!find('a','u')&&!!find('b','v');
  const negative=!!find('a','v')&&!!find('b','u');
  if(positive===negative)throw new TypeError('INVALID_SWITCH_SHAPE');
  const from=positive?[['a','u'],['b','v']]:[['a','v'],['b','u']];
  const to=positive?[['a','v'],['b','u']]:[['a','u'],['b','v']];
  for(const [s,t] of from)if(find(s,t)?.type!=='P')throw new TypeError('INVALID_SWITCH_TYPE');
  for(const [s,t] of to)if(find(s,t))throw new TypeError('SWITCH_COLLISION');
  const removed=new Set(from.map(([s,t])=>k(s,t)));
  const out=edges.filter(x=>!removed.has(k(x.from,x.to))).map(x=>({...x}));
  for(const [s,t] of to)out.push({from:s,to:t,type:'P'});
  validate(out,vertices);
  return out;
}
/** Coherent symbol renaming for ephemeral mathematical checks only. */
export function renameWorld(edges,mapping,vertices=VERTICES){
  validate(edges,vertices);
  if(!mapping||typeof mapping!=='object'||Array.isArray(mapping)
    ||Object.keys(mapping).length!==vertices.length
    ||!vertices.every(v=>Object.hasOwn(mapping,v))
    ||new Set(Object.values(mapping)).size!==vertices.length
    ||!vertices.every(v=>vertices.includes(mapping[v])))
      throw new TypeError('INVALID_RENAMING');
  return edges.map(x=>({from:mapping[x.from],to:mapping[x.to],type:x.type}));
}
