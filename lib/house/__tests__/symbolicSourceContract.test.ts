import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const source = read('lib/house/symbolicSource.server.ts');
const route = read('app/api/house/symbolic-source/route.ts');
const prototype = read('app/dev/symbolic-crossing-review/page.tsx');

describe('FACET-FLOW-04 symbolic source contract', () => {
  it('keeps the five epistemic classes explicit', () => {
    for (const name of [
      'source_fact',
      'symbolic_tradition',
      'system_synthesis',
      'possible_expression',
      'member_meaning',
    ]) {
      expect(source).toContain(name);
    }
  });

  it('classifies divination source material instead of blending it into one excerpt', () => {
    expect(source).toContain("field('source_fact', 'Question asked'");
    expect(source).toContain("field('source_fact', 'Runes drawn'");
    expect(source).toContain("field('symbolic_tradition', 'Stored rune meanings'");
    expect(source).toContain("field('system_synthesis', 'Generated interpretation'");
    expect(source).toContain("field('system_synthesis', 'Generated guidance'");
    expect(source).toContain("field('member_meaning', 'Your notes'");
    expect(source).not.toContain("join('\\n\\n')");
  });

  it('resolves only an authenticated owned saved reading', () => {
    expect(route).toContain('getMemberIdFromRequest');
    expect(route).toContain("sourceFacet !== 'divination'");
    expect(source).toContain('WHERE id::text = $1 AND user_id = $2');
    expect(source).toContain("'/oracle/reflections?reading=' + encodeURIComponent(sourceRefId)");
  });

  it('keeps the receiver prototype non-persisting and blank by default', () => {
    expect(prototype).toContain("useState('')");
    expect(prototype).toContain('Nothing on this page is saved.');
    expect(prototype).toContain('no crossing row · no memory write · no persistence');
    expect(prototype).not.toContain('recordFacetCrossing');
    expect(prototype).not.toContain("method: 'POST'");
    expect(prototype).not.toContain('sourceRef:');
  });
});
