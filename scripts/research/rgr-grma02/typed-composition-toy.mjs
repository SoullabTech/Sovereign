/**
 * RGR-GRM-A02 — exactly two hand-authored typed-graph mathematical reference worlds.
 * Pure functions, no source files, no random sampling, no model, no corpus, no I/O.
 * Designed to show that local typed marginals and unanchored 2-hop type-label bags
 * do not determine a SOURCE-ANCHORED 3-hop typed-path predicate.
 *
 * It does not implement Grassmann learning, sheaf cohomology, FLOW_D or human meaning.
 */
export const VERTICES = Object.freeze(['s', 'a', 'b', 'c', 'd', 't']);
export const TYPES = Object.freeze(['OPEN','CLOSED','P','Q','ACK','IGNORE','RESET']);
const e = (from,to,type) => Object.freeze({from,to,type});

export const G_POS = Object.freeze([
  e('s','a','OPEN'),
  e('s','b','CLOSED'),
  e('a','c','P'),
  e('a','d','Q'),
  e('b','c','Q'),
  e('b','d','P'),
  e('c','t','ACK'),
  e('d','t','IGNORE'),
  e('t','s','RESET'),
]);
export const G_NEG = Object.freeze([
  e('s','a','OPEN'),
  e('s','b','CLOSED'),
  e('a','c','Q'),
  e('a','d','P'),
  e('b','c','P'),
  e('b','d','Q'),
  e('c','t','ACK'),
  e('d','t','IGNORE'),
  e('t','s','RESET'),
]);

function validate(edges, vertices=VERTICES) {
  if (!Array.isArray(edges) || !Array.isArray(vertices)
    || vertices.length!==6 || new Set(vertices).size!==6
    || edges.length!==9) throw new TypeError('INVALID_TOY_SHAPE');
  const seen = new Set();
  for(const arc of edges){
    if(!arc || typeof arc!=='object' || Object.keys(arc).sort().join(',')!=='from,to,type'
      || !vertices.includes(arc.from) || !vertices.includes(arc.to) || arc.from===arc.to
      || !TYPES.includes(arc.type)) throw new TypeError('INVALID_ARC');
    const id=arc.from+'->'+arc.to;
    if(seen.has(id)) throw new TypeError('DUPLICATE_ARC');
    seen.add(id);
  }
}
const increment=(bag,key)=>bag.set(key,(bag.get(key)||0)+1);
const sortedEntries=(m)=>[...m.entries()].sort(([a],[b])=>a.localeCompare(b));

export function bareAdjacency(edges,vertices=VERTICES) {
  validate(edges,vertices);
  return edges.map(x=>x.from+'->'+x.to).sort();
}
export function vertexDegrees(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const result=new Map(vertices.map(v=>[v,{in:0,out:0}]));
  for(const x of edges){result.get(x.from).out++;result.get(x.to).in++;}
  return [...result.entries()].sort(([a],[b])=>a.localeCompare(b));
}
export function typedDegrees(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const counts=new Map();
  for(const v of vertices) for(const t of TYPES) {
    counts.set(v+'|in|'+t,0);counts.set(v+'|out|'+t,0);
  }
  for(const x of edges){
    counts.set(x.from+'|out|'+x.type,counts.get(x.from+'|out|'+x.type)+1);
    counts.set(x.to+'|in|'+x.type,counts.get(x.to+'|in|'+x.type)+1);
  }
  return sortedEntries(counts);
}
export function typeHistogram(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const bag=new Map();
  for(const x of edges)increment(bag,x.type);
  return sortedEntries(bag);
}
/** Unigram clause bag when a raw arc is rendered as SOURCE TYPE DEST. */
export function clauseUnigramBag(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const bag=new Map();
  for(const x of edges)for(const t of [x.from,x.type,x.to])increment(bag,t);
  return sortedEntries(bag);
}
/**
 * Unanchored adjacent edge-type pair histogram.
 * WARNING: discards the path's vertex and endpoint identity; this is a WEAK rival.
 */
export function globalTwoHopTypeBag(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const bag=new Map();
  for(const a of edges) for(const b of edges)
    if(a.to===b.from)increment(bag,a.type+'|'+b.type);
  return sortedEntries(bag);
}
export function reciprocalPairs(edges,vertices=VERTICES) {
  validate(edges,vertices);
  const ids=new Set(edges.map(x=>x.from+'->'+x.to));
  let count=0;
  for(const x of edges)if(ids.has(x.to+'->'+x.from))count++;
  return count/2;
}
export function stronglyConnected(edges,vertices=VERTICES) {
  validate(edges,vertices);
  for(const root of vertices){
    const seen=new Set([root]),todo=[root];
    while(todo.length){
      const u=todo.shift();
      for(const x of edges)if(x.from===u && !seen.has(x.to)){
        seen.add(x.to);todo.push(x.to);
      }
    }
    if(seen.size!==vertices.length)return false;
  }
  return true;
}
/** An exact three-edge typed-path count for the named source, destination and order. */
export function typedThreeHopCount(edges,{source='s',target='t',types=['OPEN','P','ACK'],vertices=VERTICES}={}) {
  validate(edges,vertices);
  if(!vertices.includes(source)||!vertices.includes(target)
    ||!Array.isArray(types)||types.length!==3 ||types.some(x=>!TYPES.includes(x)))
    throw new TypeError('INVALID_TYPED_QUERY');
  let count=0;
  for(const a of edges)if(a.from===source && a.type===types[0])
    for(const b of edges)if(b.from===a.to && b.type===types[1])
      for(const c of edges)if(c.from===b.to && c.type===types[2] && c.to===target)count++;
  return count;
}
/**
 * The single explicit counterfactual operation: flip the P/Q checkerboard.
 * It is NOT a dataset generator; input must contain the four known typed arcs.
 */
export function checkerboardFlip(edges,vertices=VERTICES){
  validate(edges,vertices);
  const square=new Set(['a->c','a->d','b->c','b->d']);
  let matched=0;
  const out=edges.map(x=>{
    const id=x.from+'->'+x.to;
    if(!square.has(id))return {...x};
    if(x.type!=='P' && x.type!=='Q')throw new TypeError('BAD_SWITCH_TYPE');
    matched++;
    return {...x,type:x.type==='P'?'Q':'P'};
  });
  if(matched!==4)throw new TypeError('BAD_SWITCH_SHAPE');
  return out;
}
/** Coherent symbol renaming, not a new scenario or sample. */
export function renameWorld(edges,mapping,vertices=VERTICES){
  validate(edges,vertices);
  if(!mapping || typeof mapping!=='object' || Array.isArray(mapping)
    || Object.keys(mapping).length!==vertices.length
    || !vertices.every(v=>Object.hasOwn(mapping,v))
    || new Set(Object.values(mapping)).size!==vertices.length
    || !vertices.every(v=>vertices.includes(mapping[v])))
    throw new TypeError('INVALID_RENAMING');
  return edges.map(x=>({from:mapping[x.from],to:mapping[x.to],type:x.type}));
}
