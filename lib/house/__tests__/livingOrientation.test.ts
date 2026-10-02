import fs from 'node:fs';
import path from 'node:path';

import { HOUSE_PLACES } from '../catalog';
import {
  CROSS_CUTTING_LENSES,
  FACET_CROSSINGS,
  MAIA_ORIENTATION,
  ORIENTATION_FACETS,
  crossingsFrom,
  crossingsTo,
  liveCrossings,
} from '../livingOrientation';

describe('Soullab Living Orientation System', () => {
  it('gives every current House place exactly one orientation facet', () => {
    const catalogIds = HOUSE_PLACES.map((place) => place.id).sort();
    const facetIds = Object.keys(ORIENTATION_FACETS).sort();

    expect(facetIds).toEqual(catalogIds);
    for (const place of HOUSE_PLACES) {
      const facet = ORIENTATION_FACETS[place.id];
      expect(facet.label.length).toBeGreaterThan(0);
      expect(facet.question.endsWith('?')).toBe(true);
      expect(facet.activity.length).toBeGreaterThan(0);
      expect(facet.relationToWhole.length).toBeGreaterThan(0);
    }
  });

  it('keeps MAIA as host/relational intelligence rather than the center of the member', () => {
    expect(MAIA_ORIENTATION.label).toBe('MAIA');
    expect(MAIA_ORIENTATION.relationToWhole).toContain('not the center');
  });

  it('keeps the person out of the graph as a possessable endpoint', () => {
    const endpoints = FACET_CROSSINGS.flatMap((crossing) => [crossing.from, crossing.to]);
    expect(endpoints).not.toContain('member');
    expect(Object.keys(ORIENTATION_FACETS)).not.toContain('member');
  });

  it('requires unique crossing identities and real evidence paths', () => {
    const ids = FACET_CROSSINGS.map((crossing) => crossing.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const crossing of FACET_CROSSINGS) {
      expect(crossing.evidence.length).toBeGreaterThan(0);
      for (const relativePath of crossing.evidence) {
        expect(fs.existsSync(path.resolve(process.cwd(), relativePath))).toBe(true);
      }
    }
  });

  it('never blesses a system-automatic crossing as live member-authorized flow', () => {
    const automatic = FACET_CROSSINGS.filter(
      (crossing) => crossing.authority === 'system_automatic',
    );

    for (const crossing of automatic) {
      expect(crossing.standing).toBe('needs_adjudication');
    }

    for (const crossing of liveCrossings()) {
      expect(crossing.authority).not.toBe('system_automatic');
    }

    expect(FACET_CROSSINGS.some((crossing) => crossing.id === 'journal-automatic-episodic-memory'))
      .toBe(false);
  });

  it('keeps crossing lookup directional instead of collapsing relation into membership', () => {
    expect(crossingsFrom('journal').some((crossing) => crossing.to === 'maia')).toBe(true);
    expect(crossingsTo('journal').some((crossing) => crossing.from === 'maia')).toBe(true);
    expect(crossingsFrom('anchor').some((crossing) => crossing.mode === 'contextual_memory')).toBe(true);
  });

  it('defines cross-cutting lenses as perspectives rather than rooms', () => {
    const lensIds = CROSS_CUTTING_LENSES.map((lens) => lens.id);
    expect(lensIds).toEqual([
      'elemental',
      'spiralogic',
      'developmental',
      'relational',
      'temporal',
      'symbolic',
    ]);

    for (const lens of CROSS_CUTTING_LENSES) {
      expect(lens.question.endsWith('?')).toBe(true);
      expect(lens.protectsAgainst.length).toBeGreaterThan(0);
      expect(HOUSE_PLACES.map((place) => place.id)).not.toContain(lens.id as never);
    }
  });

  it('registers Relationship Space MAIA as member-explicit contained presence', () => {
    const crossing = FACET_CROSSINGS.find(
      (item) => item.id === 'relationship-maia-in-place',
    );

    expect(crossing).toMatchObject({
      from: 'relationships',
      to: 'maia',
      authority: 'member_explicit',
      mode: 'contained_presence',
      standing: 'live',
    });
    expect(crossing?.law).toContain('present member report outranks stale/inferred context');
    expect(crossing?.law).toContain('may not diagnose the relationship');
  });

  it('names Anchor according to its accepted lived-time role', () => {
    expect(ORIENTATION_FACETS.anchor.label).toBe('Daily Anchor');
    expect(ORIENTATION_FACETS.anchor.question).toBe(
      'What do I want to remain connected to today?',
    );
  });
});
