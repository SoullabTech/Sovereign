/**
 * RGR-GRM-A03 — TWO FIXED EIGHT-NODE LATIN-SQUARE GRAPH WORLDS.
 *
 * Source-visible pure mathematical fixture, NOT a dataset or experimental model.
 * No I/O, randomness, weights, model calls, human data, or mutable state.
 * Identical topology, per-node typed marginals and endpoint-free label-bigram
 * histograms do not imply equality of anchored triple-path compositions.
 */
export const VERTICES = Object.freeze(['s','a','b','c','u','v','w','t']);
export const TYPES = Object.freeze(['OPEN','CLOSED','WAIT','P','Q','R','ACK','IGNORE','DEFER','RESET']);
const arc=(from,to,type)=>Object.freeze({from,to,type});

export const G_POS=Object.freeze([
  arc('s','a','OPEN'), arc('s','b','CLOSED'), arc('s','c','WAIT'),
  arc('a','u','P'), arc('a','v','Q'), arc('a','w','R'),
  arc('b','u','Q'), arc('b','v','R'), arc('b','w','P'),
  arc('c','u','R'), arc('c','v','P'), arc('c','w','Q'),
  arc('u','t','ACK'), arc('v','t','IGNORE'), arc('w','t','DEFER'),
  arc('t','s','RESET'),
]);

export const G_NEG=Object.freeze([
  arc('s','a','OPEN'), arc('s','b','CLOSED'), arc('s','c','WAIT'),
  arc('a','u','Q'), arc('a','v','R'), arc('a','w','P'),
  arc('b','u','R'), arc('b','v','P'), arc('b','w','Q'),
  arc('c','u','P'), arc('c','v','Q'), arc('c','w','R'),
  arc('u','t','ACK'), arc('v','t','IGNORE'), arc('w','t','DEFER'),
  arc('t','s','RESET'),
]);

function validate(edges, vertices=VERTICES) {
  if(!Array.isArray(edges)||!Array.isArray(vertices)||vertices.length!==8
      ||new Set(vertices).size!==8||edges.length!==16)throw new TypeError('INVALID_FIXED_SHAPE');
  const seen=new Set();
  for(const a of edges) {
    if(!a||typeof a!=='object'||Array.isArray(a)
      ||Object.keys(a).sort().join(',')!=='from,to,type'
      ||!vertices.includes(a.from)||!vertices.includes(a.to)
      ||a.from===a.to||!TYPES.includes(a.type))throw new TypeError('INVALID_EDGE');
    const key=a.from+'->'+a.to;
    if(seen.has(key))throw new TypeError('DUPLICATE_EDGE');
    seen.add(key);
  }
}
const bump=(map,key)=>map.set(key,(map.get(key)||0)+1);
const entries=(map)=>[...map.entries()].sort(([a],[b])=>a.localeCompare(b));

export function untypedEdges(edges,vertices=VERTICES) {
  validate(edges,vertices);
  return edges.map(x=>x.from+'->'+x.to).sort();
}
export function typeHistogram(edges,vertices=VERTICES){
  validate(edges,vertices);
  const bag=new Map();
  for(const a of edges)bump(bag,a.type);
  return entries(bag);
}
export function typedDegrees(edges,vertices=VERTICES){
  validate(edges,vertices);
  const d=new Map();
  for(const v of vertices)for(const type of TYPES) {
    d.set(v+'|in|'+type,0);d.set(v+'|out|'+type,0);
  }
  for(const a of edges){
    const x=a.from+'|out|'+a.type,y=a.to+'|in|'+a.type;
    d.set(x,d.get(x)+1); d.set(y,d.get(y)+1);
  }
  return entries(d);
}
export function lexicalUnigramBag(edges,vertices=VERTICES){
  validate(edges,vertices);
  const bag=new Map();
  for(const a of edges)for(const token of [a.from,a.type,a.to])bump(bag,token);
  return entries(bag);
}
/** Global unanchored two-hop type pairs: NOT an endpoint-aware subgraph summary. */
export function twoHopLabelBag(edges,vertices=VERTICES){
  validate(edges,vertices);
  const bag=new Map();
  for(const a of edges)for(const b of edges)
    if(a.to===b.from)bump(bag,a.type+'|'+b.type);
  return entries(bag);
}
/** Recompute the same histogram from vertex-local typed in/out degrees. */
export function derivedTwoHopLabelBag(edges,vertices=VERTICES){
  validate(edges,vertices);
  const d=new Map(typedDegrees(edges,vertices)),bag=new Map();
  for(const v of vertices)for(const i of TYPES)for(const j of TYPES){
    const n=d.get(v+'|in|'+i)*d.get(v+'|out|'+j);
    if(n)bag.set(i+'|'+j,(bag.get(i+'|'+j)||0)+n);
  }
  return entries(bag);
}
export function anchoredTwoHopEnds(edges,{start='s',labels=['OPEN','P'],vertices=VERTICES}={}){
  validate(edges,vertices);
  if(!vertices.includes(start)||!Array.isArray(labels)||labels.length!==2
    ||labels.some(l=>!TYPES.includes(l)))throw new TypeError('INVALID_TWOHOP_QUERY');
  const ends=[];
  for(const a of edges)if(a.from===start&&a.type===labels[0])
    for(const b of edges)if(b.from===a.to&&b.type===labels[1])ends.push(b.to);
  return ends.sort();
}
/** Exact path-length-3 type sequence query on the visible fixed graph. */
export function threeHopCount(edges,{start='s',end='t',labels=['OPEN','P','ACK'],vertices=VERTICES}={}){
  validate(edges,vertices);
  if(!vertices.includes(start)||!vertices.includes(end)||!Array.isArray(labels)
    ||labels.length!==3||labels.some(l=>!TYPES.includes(l)))
    throw new TypeError('INVALID_THREEHOP_QUERY');
  let paths=0;
  for(const a of edges)if(a.from===start&&a.type===labels[0])
    for(const b of edges)if(b.from===a.to&&b.type===labels[1])
      for(const c of edges)if(c.from===b.to&&c.to===end&&c.type===labels[2])paths++;
  return paths;
}
export function stronglyConnected(edges,vertices=VERTICES){
  validate(edges,vertices);
  for(const start of vertices){
    const seen=new Set([start]),queue=[start];
    while(queue.length){
      const v=queue.shift();
      for(const a of edges)if(a.from===v&&!seen.has(a.to)){
        seen.add(a.to);queue.push(a.to);
      }
    }
    if(seen.size!==vertices.length)return false;
  }
  return true;
}
export function reciprocalPairs(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const pairs=new Set(edges.map(a=>a.from+'->'+a.to));
  let n=0;
  for(const a of edges)if(pairs.has(a.to+'->'+a.from))n++;
  return n/2;
}
/**
 * Coherent renaming only. Temporary output stays in-memory for test proofs,
 * and is never persisted as a synthetic dataset or study population.
 */
export function renameWorld(edges,mapping,vertices=VERTICES){
  validate(edges,vertices);
  if(!mapping||typeof mapping!=='object'||Array.isArray(mapping)
    ||Object.keys(mapping).length!==vertices.length
    ||!vertices.every(v=>Object.hasOwn(mapping,v))
    ||new Set(Object.values(mapping)).size!==vertices.length
    ||!vertices.every(v=>vertices.includes(mapping[v])))
    throw new TypeError('INVALID_RENAMING');
  return edges.map(a=>({from:mapping[a.from],to:mapping[a.to],type:a.type}));
}
