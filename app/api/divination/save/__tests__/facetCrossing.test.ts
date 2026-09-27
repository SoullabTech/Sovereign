import fs from 'node:fs';
import path from 'node:path';

import { FACET_CROSSINGS } from '../../../../../lib/house/livingOrientation';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const saveRoute = read('app/api/divination/save/route.ts');
const service = read('lib/services/divinationService.ts');
const capsuleService = read('lib/capsules/capsuleService.ts');
const capsuleTypes = read('lib/capsules/types.ts');
const crossing = read('lib/house/facetCrossing.server.ts');
const origins = read('app/api/house/crossings/route.ts');
const originTrail = read('components/house/FacetOriginTrail.tsx');
const reflectionDetail = read('components/reflections/ReflectionDetail.tsx');
const archive = read('app/oracle/reflections/page.tsx');
const livingField = read('components/maia/living-field/LifeFacetFlowPanel.tsx');

describe('Divination → Reflections crossing', () => {
  it('is registered as one member-explicit live persistence crossing', () => {
    expect(
      FACET_CROSSINGS.find((item) => item.id === 'divination-save-to-reflections'),
    ).toMatchObject({
      from: 'divination',
      to: 'reflections',
      gesture: 'Save Reading',
      authority: 'member_explicit',
      mode: 'persistence',
      standing: 'live',
    });
  });

  it('makes source reading + kept Reflection + relation one transaction', () => {
    expect(saveRoute).toContain('transaction(async (client)');
    expect(saveRoute).toContain('client,');
    expect(saveRoute).toContain("sourceType: 'divination'");
    expect(saveRoute).toContain('draft: false');
    expect(saveRoute).toContain("crossingId: 'divination-save-to-reflections'");
    expect(saveRoute).toContain("sourceFacet: 'divination'");
    expect(saveRoute).toContain("targetFacet: 'reflections'");
    expect(saveRoute).toContain('recordFacetCrossing(client');
    expect(service).toContain('client?: TransactionClient');
    expect(capsuleService).toContain('client?: TransactionClient');
  });

  it('does not redistill or create memory at the crossing seam', () => {
    expect(saveRoute).not.toContain('distillCapsuleFromText');
    expect(saveRoute).not.toContain('episodic_memories');
    expect(saveRoute).not.toContain('member_memory_atoms');
    expect(saveRoute).not.toContain('VectorEmbeddingService');
    expect(saveRoute).toContain('reflectionFromReading(savedReading)');
  });

  it('gives Reflection a truthful divination source type and composite source identity', () => {
    expect(capsuleTypes).toContain("'divination'");
    expect(saveRoute).toContain('sourceRefId: `iching:${reading.id}`');
    expect(saveRoute).toContain('sourceRefId: `tarot:${reading.id}`');
    expect(saveRoute).toContain('sourceRefId: `runes:${reading.id}`');
  });

  it('resolves I Ching, Tarot, and Runes under member ownership for later flow evidence', () => {
    expect(crossing).toContain("type DivinationKind = 'iching' | 'tarot' | 'runes'");
    expect(crossing).toContain('FROM divination_iching_readings');
    expect(crossing).toContain('FROM divination_tarot_readings');
    expect(crossing).toContain('FROM divination_runes_readings');
    expect(crossing).toContain('WHERE id::text = $1 AND user_id = $2');
    expect(crossing).toContain("facet: 'divination'");
  });

  it('keeps the relationship visible from the Reflection and in Living Field', () => {
    expect(origins).toContain("'divination'");
    expect(origins).toContain("'reflections'");
    expect(originTrail).toContain("'divination'");
    expect(reflectionDetail).toContain('targetFacet="reflections"');
    expect(livingField).toContain("| 'divination'");
    expect(livingField).toContain("divination: 'Divination'");
  });

  it('returns from a Reflection to the exact saved reading by identity', () => {
    expect(crossing).toContain("href: '/oracle/reflections?reading='");
    expect(archive).toContain("searchParams?.get('reading')");
    expect(archive).toContain('parseReadingTarget');
    expect(archive).toContain('setExpandedReading(target.id)');
    expect(archive).toContain('reading-${target.type}-${target.id}');
  });
});
