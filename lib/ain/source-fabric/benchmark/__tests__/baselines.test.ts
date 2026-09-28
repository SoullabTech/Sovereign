import { resolve } from 'node:path';
import { BENCHMARK_CORPUS } from '../corpus';
import { buildBenchmarkChunks, chunkingPolicyFor } from '../chunking';
import { bm25Rank, collapseToSources, sourceAllowed } from '../baselines';
import { GOLD_QUERIES } from '../goldQueries';

const root=resolve(__dirname,'../../../../..');

describe('deterministic benchmark chunking',()=>{
  const chunks=buildBenchmarkChunks(root,BENCHMARK_CORPUS);

  it('produces the fixed 1735-chunk corpus',()=>{
    expect(chunks).toHaveLength(1735);
    expect(new Set(chunks.map(c=>c.chunkId)).size).toBe(chunks.length);
  });

  it('bounds only the giant manuscript to 80 chunks and retains Lambspring evidence',()=>{
    const ea=chunks.filter(c=>c.sourceRef==='ea-manuscript');
    expect(chunkingPolicyFor('ea-manuscript').maxChunks).toBe(80);
    expect(ea).toHaveLength(80);
    expect(ea.some(c=>/Book of the Lambspring/i.test(c.content))).toBe(true);
    expect(ea.some(c=>/Edward F\. Edinger/i.test(c.content))).toBe(true);
  });

  it('preserves heading context in chunk text',()=>{
    const relation=chunks.find(c=>c.sourceRef==='rgr-note'&&/Typed Relation Versus Scalar Similarity/.test(c.content));
    expect(relation).toBeDefined();
    expect(relation?.heading).toBe('2 · Typed Relation Versus Scalar Similarity');
  });
});
describe('baseline retrieval mechanics',()=>{
  const chunks=buildBenchmarkChunks(root,BENCHMARK_CORPUS);

  it('BM25 finds the exact authority phrase source',()=>{
    const query=GOLD_QUERIES.find(q=>q.id==='L1')!;
    const ranked=bm25Rank(query.query,chunks);
    const sources=collapseToSources(ranked,query,true,8);
    expect(sources.map(s=>s.sourceRef)).toContain('authority-law');
  });

  it('BM25 finds the rare Lambspring manuscript source',()=>{
    const query=GOLD_QUERIES.find(q=>q.id==='L6')!;
    const ranked=bm25Rank(query.query,chunks);
    const sources=collapseToSources(ranked,query,true,8);
    expect(sources[0]?.sourceRef).toBe('ea-manuscript');
  });

  it('governed aperture excludes relevant-but-forbidden sources',()=>{
    const query=GOLD_QUERIES.find(q=>q.id==='M1')!;
    expect(sourceAllowed(query,'authority-law',false)).toBe(true);
    expect(sourceAllowed(query,'authority-law',true)).toBe(false);
    expect(sourceAllowed(query,'source-fabric',true)).toBe(true);
  });
});
