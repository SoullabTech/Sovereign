import { readerTool, TOOL_NAME } from '../render';
import { parseReaderBlocks } from '../parse';
import type { StructuredBlock } from '@/lib/ai/structured/types';

const parse = (input: unknown) => parseReaderBlocks([{ type: 'tool_use', id: 'test', name: TOOL_NAME, input }] as StructuredBlock[]);
describe('Developmental reader strict transport envelope', () => {
  it('has a root object and no top-level union; disjoint outcomes stay inside result', () => {
    const schema = readerTool().input_schema as any;
    expect(schema.type).toBe('object');
    expect(schema.required).toEqual(['result']);
    expect(schema.additionalProperties).toBe(false);
    expect(schema.oneOf).toBeUndefined(); expect(schema.anyOf).toBeUndefined();
    expect(schema.properties.result.anyOf.map((b: any) => b.properties.outcome.const)).toEqual(['claims','none']);
    const [claims, none] = schema.properties.result.anyOf;
    expect(claims.required).toEqual(['outcome','claims']);
    expect(claims.properties.claims.minItems).toBe(1);
    expect(none.required).toEqual(['outcome']);
    expect(none.additionalProperties).toBe(false);
    expect(none.properties.claims).toBeUndefined();
  });
  it('does not send unsupported strict-schema keywords', () => {
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        expect(['oneOf','minLength','maxLength','minimum','maximum']).not.toContain(key);
        visit(child);
      }
    };
    visit(readerTool().input_schema);
  });
  it('accepts the wrapped none result and exact legacy flat replay', () => {
    expect(parse({result:{outcome:'none'}})).toEqual({ok:true,outcome:'none'});
    expect(parse({outcome:'none'})).toEqual({ok:true,outcome:'none'});
  });
  it.each([
    {result:{outcome:'none'},outcome:'claims'},
    {result:{outcome:'none',claims:[]}},
    {result:{outcome:'claims',claims:[]}},
    {result:null},
    {result:{outcome:'claims',claims:[{text:'',refs:[],doesNotEstablish:[]}]}},
  ])('retains fail-closed outcome and content validation for %j', input => {
    expect(parse(input).ok).toBe(false);
  });
});
