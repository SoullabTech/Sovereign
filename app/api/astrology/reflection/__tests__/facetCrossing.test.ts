import fs from 'node:fs';
import path from 'node:path';

import { FACET_CROSSINGS } from '../../../../../lib/house/livingOrientation';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const route = read('app/api/astrology/reflection/route.ts');
const page = read('app/astrology/page.tsx');
const capsuleTypes = read('lib/capsules/types.ts');
const crossing = read('lib/house/facetCrossing.server.ts');
const crossingsRoute = read('app/api/house/crossings/route.ts');
const originTrail = read('components/house/FacetOriginTrail.tsx');
const reflectionsFeed = read('components/reflections/ReflectionsFeed.tsx');
const livingField = read('components/maia/living-field/LifeFacetFlowPanel.tsx');

describe('Astrology → Reflections crossing', () => {
  it('is registered as a member-explicit persistence crossing', () => {
    expect(
      FACET_CROSSINGS.find((item) => item.id === 'astrology-keep-as-reflection'),
    ).toMatchObject({
      from: 'astrology',
      to: 'reflections',
      gesture: 'Keep this as a Reflection',
      authority: 'member_explicit',
      mode: 'persistence',
      standing: 'live',
    });
  });

  it('persists exact member words and crossing relation in one transaction', () => {
    expect(route).toContain('transaction(async (client)');
    expect(route).toContain("sourceType: 'astrology'");
    expect(route).toContain('summary: text');
    expect(route).toContain('goldLines: []');
    expect(route).toContain('sourceExcerpt: null');
    expect(route).toContain("crossingId: 'astrology-keep-as-reflection'");
    expect(route).toContain("sourceFacet: 'astrology'");
    expect(route).toContain("targetFacet: 'reflections'");
    expect(route).toContain('recordFacetCrossing(client');
  });

  it('never accepts MAIA prose or raw birth data as the reflection body', () => {
    expect(route).not.toContain('maia');
    expect(route).not.toContain('birth_time');
    expect(route).not.toContain('birth_location');
    expect(route).not.toContain('natal_chart_json');
    expect(route).not.toContain('member_memory_atoms');
    expect(route).not.toContain('distillCapsule');
    expect(page).toContain('What do you recognize here?');
    expect(page).toContain('MAIA’s interpretation is not copied.');
  });

  it('uses an Astrology source type and opaque lens-only source identity', () => {
    expect(capsuleTypes).toContain("'astrology'");
    expect(route).toContain("const parts = ['natal', args.zodiacMode, args.houseSystem]");
    expect(crossing).toContain('function parseAstrologyRef');
    expect(crossing).toContain("facet: 'astrology'");
    expect(crossing).toContain("href: '/astrology'");
  });

  it('keeps Astrology provenance visible in Reflections and Living Field', () => {
    expect(crossingsRoute).toContain("'astrology'");
    expect(originTrail).toContain("'astrology'");
    expect(originTrail).toContain("? 'Astrology'");
    expect(reflectionsFeed).toContain("source === 'astrology'");
    expect(livingField).toContain("| 'astrology'");
    expect(livingField).toContain("astrology: 'Astrology'");
  });

  it('requires the member to explicitly press Keep after authoring meaning', () => {
    expect(page).toContain('value={recognitionText}');
    expect(page).toContain('Keep this as a Reflection');
    expect(page).toContain('disabled={!recognitionText.trim() || recognitionSaving}');
    expect(page).not.toContain('setRecognitionText(maia');
  });
});
