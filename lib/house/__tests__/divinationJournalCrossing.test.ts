import fs from 'node:fs';
import path from 'node:path';

import { FACET_CROSSINGS } from '../livingOrientation';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const carrier = read('lib/house/facetCrossing.server.ts');
const symbolic = read('lib/house/symbolicSource.server.ts');
const carryRoute = read('app/api/house/carry-source/route.ts');
const journalRoute = read('app/api/journal/quick/list/route.ts');
const journalPage = read('app/journal/page.tsx');
const writing = read('components/journal/room/WritingSurface.tsx');
const origin = read('components/house/FacetOriginTrail.tsx');
const symbolicNotice = read('components/house/SymbolicCarryNotice.tsx');
const savedReadings = read('app/oracle/reflections/page.tsx');

describe('FACET-FLOW-05 Divination → Journal contract', () => {
  it('registers one explicit durable crossing', () => {
    expect(FACET_CROSSINGS.find((item) => item.id === 'divination-write-journal')).toMatchObject({
      from: 'divination',
      to: 'journal',
      gesture: 'Write with this in Journal',
      authority: 'member_explicit',
      mode: 'persistence',
      standing: 'live',
    });
    expect(carrier).toContain("'divination-write-journal': { source: 'divination', target: 'journal' }");
  });
  it('puts only durable source identity in the doorway URL', () => {
    expect(savedReadings).toContain('sourceFacet=divination');
    expect(savedReadings).toContain('crossingId=divination-write-journal');
    expect(savedReadings).toContain('encodeURIComponent(sourceRefId)');
    expect(savedReadings).not.toContain('encodeURIComponent(reading.interpretation_text)');
    expect(savedReadings).not.toContain('encodeURIComponent(reading.guidance_text)');
  });

  it('admits the source only through authenticated server resolution', () => {
    expect(carryRoute).toContain("'divination'");
    expect(carrier).toContain('resolveDivinationSymbolicSourcePacket(memberId, sourceRefId)');
    expect(symbolic).toContain('WHERE id::text = $1 AND user_id = $2');
    expect(journalPage).toContain("sourceFacet === 'relationships' || sourceFacet === 'divination'");
  });

  it('renders typed symbolic provenance while leaving Journal text blank', () => {
    expect(writing).toContain("carrySourceRef.sourceFacet === 'divination'");
    expect(writing).toContain('<SymbolicCarryNotice');
    expect(writing).toContain('value={text}');
    expect(writing).not.toContain('setText(source');
    expect(symbolicNotice).toContain("'What happened'");
    expect(symbolicNotice).toContain("'Symbolic tradition'");
    expect(symbolicNotice).toContain('"System\'s reading"');
    expect(symbolicNotice).toContain("'Your meaning'");
  });
  it('keeps Journal + crossing creation atomic', () => {
    expect(journalRoute).toContain("targetFacet: 'journal'");
    expect(journalRoute).toContain('validateFacetCrossingSource');
    expect(journalRoute).toContain('transaction(async (client)');
    expect(journalRoute).toContain('recordFacetCrossing(client');
    expect(journalRoute).toContain('targetRefId: kept.id');
  });

  it('preserves typed provenance after reopen with exact source return', () => {
    expect(origin).toContain("origin.source.facet === 'divination' && targetFacet === 'journal'");
    expect(origin).toContain('<SymbolicCarryNotice');
    expect(origin).toContain('mode="origin"');
    expect(symbolicNotice).toContain('Return to exact reading →');
    expect(symbolic).toContain("'/oracle/reflections?reading=' + encodeURIComponent(sourceRefId)");
  });

  it('does not widen authority to Daily Anchor', () => {
    expect(carrier).not.toContain("'divination-carry-to-anchor'");
    expect(carrier).not.toContain("'divination-anchor'");
    expect(savedReadings).not.toContain('crossingId=divination-carry');
  });
});
