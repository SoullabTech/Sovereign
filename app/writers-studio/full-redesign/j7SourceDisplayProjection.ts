export type DisplayBlock = { text: string; kind?: string };
export type ProjectionSegment =
  | { kind: 'block'; blockIndex: number; displayText: string; normalizedStart: number; normalizedEnd: number; sourceStart: number; sourceEnd: number }
  | { kind: 'gap'; normalizedStart: number; normalizedEnd: number; sourceStart: number; sourceEnd: number; text: string };
export type Projection = {
  ok: boolean;
  reason?: string;
  rawBody: string;
  normalizedBody: string;
  normalizedBoundaryToRaw: number[];
  segments: ProjectionSegment[];
  blocks: Extract<ProjectionSegment, {kind:'block'}>[];
};
function normalizeWithMap(raw: string) {
  const normalized: string[] = [];
  const map: number[] = [0];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '\r') {
      if (raw[i+1] === '\n') { normalized.push('\n'); i += 2; map.push(i); }
      else { normalized.push('\n'); i += 1; map.push(i); }
    } else { normalized.push(raw[i]!); i += 1; map.push(i); }
  }
  return { normalizedBody: normalized.join(''), normalizedBoundaryToRaw: map };
}
export function projectRawBodyToDisplay(rawBody: string, displayBlocks: readonly DisplayBlock[]): Projection {
  const {normalizedBody, normalizedBoundaryToRaw} = normalizeWithMap(rawBody);
  const segments: ProjectionSegment[] = [];
  const blocks: Extract<ProjectionSegment,{kind:'block'}>[] = [];
  // Empty display blocks contain no source characters. A non-empty raw source
  // cannot be edited from this projection because its visible mapping is absent.
  if (!displayBlocks.some(b => b.text.length > 0)) {
    if (normalizedBody.length !== 0) return {ok:false,reason:'nonempty-source-has-no-visible-text',rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
    return {ok:true,rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
  }
  let cursor = 0;
  for (let i=0;i<displayBlocks.length;i++) {
    const text=displayBlocks[i]!.text;
    if (!text.length) return {ok:false,reason:'empty-display-block-ambiguous',rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
    const start=normalizedBody.indexOf(text,cursor);
    if (start<0) return {ok:false,reason:'display-text-not-found-monotonically:'+i,rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
    const gap=normalizedBody.slice(cursor,start);
    // The current typesetter is permitted to discard whitespace for presentation,
    // but a missing non-whitespace source character means the display is not a
    // lossless projection and cannot become an editing authority.
    if (/\S/.test(gap)) return {ok:false,reason:'non-whitespace-gap-before-block:'+i,rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
    if (start>cursor) segments.push({kind:'gap',normalizedStart:cursor,normalizedEnd:start,sourceStart:normalizedBoundaryToRaw[cursor]!,sourceEnd:normalizedBoundaryToRaw[start]!,text:gap});
    const end=start+text.length;
    const block={kind:'block' as const,blockIndex:i,displayText:text,normalizedStart:start,normalizedEnd:end,sourceStart:normalizedBoundaryToRaw[start]!,sourceEnd:normalizedBoundaryToRaw[end]!};
    segments.push(block); blocks.push(block); cursor=end;
  }
  const tail=normalizedBody.slice(cursor);
  if (/\S/.test(tail)) return {ok:false,reason:'non-whitespace-tail-after-last-block',rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
  if (cursor<normalizedBody.length) segments.push({kind:'gap',normalizedStart:cursor,normalizedEnd:normalizedBody.length,sourceStart:normalizedBoundaryToRaw[cursor]!,sourceEnd:normalizedBoundaryToRaw[normalizedBody.length]!,text:tail});
  const rebuilt=segments.map(s=>normalizedBody.slice(s.normalizedStart,s.normalizedEnd)).join('');
  if (rebuilt!==normalizedBody) return {ok:false,reason:'segment-partition-not-lossless',rawBody,normalizedBody,normalizedBoundaryToRaw,segments:[],blocks:[]};
  return {ok:true,rawBody,normalizedBody,normalizedBoundaryToRaw,segments,blocks};
}
export function mapDisplayOffsetToRaw(projection: Projection, blockIndex: number, displayOffset: number): number | null {
  if (!projection.ok) return null;
  const b=projection.blocks.find(x=>x.blockIndex===blockIndex);
  if (!b || !Number.isInteger(displayOffset) || displayOffset<0 || displayOffset>b.displayText.length) return null;
  return projection.normalizedBoundaryToRaw[b.normalizedStart+displayOffset] ?? null;
}
export function mapNormalizedOffsetToDisplay(projection: Projection, normalizedOffset: number): {blockIndex:number;displayOffset:number}|null {
  if (!projection.ok || !Number.isInteger(normalizedOffset) || normalizedOffset<0 || normalizedOffset>projection.normalizedBody.length) return null;
  const matches=projection.blocks.filter(b=>normalizedOffset>=b.normalizedStart && normalizedOffset<=b.normalizedEnd);
  // At the same boundary of a visible block the mapping is explicit. Offsets
  // inside a gap have no visible caret, so fail closed instead of snapping.
  if (matches.length!==1) return null;
  const b=matches[0]!;
  return {blockIndex:b.blockIndex,displayOffset:normalizedOffset-b.normalizedStart};
}
export function restoreRawEols(normalizedBody: string, originalRaw: string): string {
  const tokens: string[]=[];
  for(let i=0;i<originalRaw.length;i++){
    if(originalRaw[i]==='\r'&&originalRaw[i+1]==='\n'){tokens.push('\r\n');i++;}
    else if(originalRaw[i]==='\r')tokens.push('\r');
    else if(originalRaw[i]==='\n')tokens.push('\n');
  }
  let n=0;
  return normalizedBody.replace(/\n/g,()=>tokens[n++] ?? '\n');
}
