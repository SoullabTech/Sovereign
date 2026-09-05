import {
  assertStudioMapHonest,
  CANVAS_HREF,
  IMPORT_HREF,
  SOURCE_HREF,
  STUDIO_MAP,
  visibleDestinations,
  WRITE_HREF,
  type StudioGroup,
} from '../studioMap';

/**
 * The Studio shell exists to keep one promise: navigation may not claim
 * capability that is absent. These tests make that promise executable rather
 * than leaving it to review, because the failure mode is silent — an unbuilt
 * room given an href looks exactly like a built one until a member clicks it.
 */
describe('Author Studio map — honesty invariant', () => {
  it('ships honest: no unbuilt destination carries a link', () => {
    expect(() => assertStudioMapHonest()).not.toThrow();
  });

  it('rejects an unbuilt destination that has been given a link', () => {
    const dishonest: StudioGroup[] = [
      {
        id: 'later',
        region: 'work',
        destinations: [{ id: 'shape', label: 'Shape', availability: 'later', href: '/press/shape' }],
      },
    ];
    expect(() => assertStudioMapHonest(dishonest)).toThrow(/not built but carries an href/);
  });

  it('rejects an available destination with nowhere to go (a dead link)', () => {
    const dishonest: StudioGroup[] = [
      { id: 'x', region: 'work', destinations: [{ id: 'write', label: 'Working Draft', availability: 'available' }] },
    ];
    expect(() => assertStudioMapHonest(dishonest)).toThrow(/nowhere to go/);
  });

  it('shows the member no unbuilt destination, in either manuscript state', () => {
    // NO ROADMAP LEAKAGE. Previously this asserted the map itself held nothing
    // unbuilt — which only worked while the map was five destinations. WS2-02
    // settles a sixteen-destination grammar, and deleting settled architecture
    // to keep the map bare is the one thing WS2-02 may not do.
    //
    // So the rule moved to the boundary the member actually meets. This is the
    // stronger assertion: it holds no matter what STUDIO_MAP later carries.
    for (const has of [true, false]) {
      const shown = visibleDestinations(has).flatMap((g) => g.destinations);
      expect(shown.filter((d) => d.availability === 'later')).toEqual([]);
      // and nothing shown is a dead link
      for (const d of shown) expect(d.href).toBeTruthy();
    }
  });

  it('carries the whole settled grammar, including what is not built yet', () => {
    // The counterpart to the rule above: the map must NOT have been trimmed to
    // today's substrate. If these disappear, the grammar was simplified to fit
    // the implementation rather than the implementation grown into the grammar.
    const all = STUDIO_MAP.flatMap((g) => g.destinations).map((d) => d.label);
    for (const settled of ['Materials', 'Structure', 'Notes', 'Versions', 'Goals',
                           'Discover', 'Insights', 'Suggestions',
                           'Find/Replace', 'Statistics', 'Timeline', 'Word Web']) {
      expect(all).toContain(settled);
    }
  });
});

describe('Author Studio map — what a member sees', () => {
  /*
   * CORRECTED by the WS2-02B render, which let the rail be counted for the
   * first time: the map carried NINETEEN destinations while the file's own
   * comment said sixteen. Writer Canvas, Working Draft, Source and Import
   * Manuscript were sitting in the rail as if they were destinations of the
   * same kind as Materials or Goals.
   *
   * They are not. Working Draft and Source are two SURFACES of the manuscript,
   * reached through it; Import is an ARRIVAL action belonging to Work Home
   * (FUNCTION-PLACEMENT.md: EXPLORE owns start and import, WRITE owns the
   * draft and its contextual surfaces). Nothing was deleted — every href is
   * still exported and its consumers are untouched. Placement changed, so
   * WS2-03 composes a shell around D-019's grammar rather than canonising
   * today's transitional routes.
   */
  it('offers Manuscript as the destination once there is a manuscript', () => {
    const withBook = visibleDestinations(true).flatMap((g) => g.destinations).map((d) => d.label);
    const withoutBook = visibleDestinations(false).flatMap((g) => g.destinations).map((d) => d.label);

    expect(withBook).toContain('Manuscript');
    // An empty Studio shows the one real door, not a row of book-scoped ones.
    expect(withoutBook).not.toContain('Manuscript');
  });

  it('no longer files working surfaces or arrival actions as rail destinations', () => {
    const all = STUDIO_MAP.flatMap((g) => g.destinations).map((d) => d.label);
    for (const surface of ['Writer Canvas', 'Working Draft', 'Source', 'Import Manuscript']) {
      expect(all).not.toContain(surface);
    }
  });

  it('keeps every one of those routes reachable — placement changed, not existence', () => {
    expect(CANVAS_HREF).toBe('/writers-studio/canvas');
    expect(WRITE_HREF).toContain('tab=draft');
    expect(SOURCE_HREF).toContain('tab=manuscript');
    expect(IMPORT_HREF).toContain('import=1');
  });

  it('carries exactly D-019’s sixteen: 7 work · 4 MAIA · 5 tools', () => {
    const byRegion = (r: string) =>
      STUDIO_MAP.filter((g) => g.region === r).flatMap((g) => g.destinations).length;
    expect(byRegion('work')).toBe(7);
    expect(byRegion('maia')).toBe(4);
    expect(byRegion('tools')).toBe(5);
    expect(STUDIO_MAP.flatMap((g) => g.destinations)).toHaveLength(16);
  });

  it('always offers Home, so the member is never stranded on a working surface', () => {
    for (const has of [true, false]) {
      const labels = visibleDestinations(has)
        .flatMap((g) => g.destinations)
        .map((d) => d.label);
      expect(labels).toContain('Home');
    }
  });

  /**
   * Regression, post-#825 seam walk. Import must state its intent in the URL.
   * Without `?import=1` a member who already has a manuscript was delivered
   * into that manuscript's Room instead of the import form — the Room shows
   * its landing/upload view only when nothing is active. The first walk had
   * only ever imported from an empty Studio, so this path was never exercised.
   */
  it('Import states its intent so it works when a book already exists', () => {
    expect(IMPORT_HREF).toContain('import=1');
  });

  it('enters the Room by named surface, never by whichever tab is first', () => {
    expect(WRITE_HREF).toContain('tab=draft');
    expect(SOURCE_HREF).toContain('tab=manuscript');
  });

  it('never drops a group to an empty heading', () => {
    for (const has of [true, false]) {
      for (const group of visibleDestinations(has)) {
        expect(group.destinations.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('WS2-02 — the three regions stay three', () => {
  it('gives every group a region', () => {
    for (const g of STUDIO_MAP) {
      expect(['work', 'maia', 'tools']).toContain(g.region);
    }
  });

  it('keeps MAIA out of the work region: she speaks about material, she does not hold it', () => {
    const maia = STUDIO_MAP.filter((g) => g.region === 'maia').flatMap((g) => g.destinations);
    const labels = maia.map((d) => d.label);
    expect(labels).toContain('Conversations');
    // If a manuscript/materials destination ever lands under MAIA, the region
    // boundary has been crossed and MAIA has become a content owner.
    for (const owned of ['Manuscript', 'Source', 'Working Draft', 'Materials']) {
      expect(labels).not.toContain(owned);
    }
  });

  it('keeps tools out of the relational region: a tool has no opinion', () => {
    const tools = STUDIO_MAP.filter((g) => g.region === 'tools').flatMap((g) => g.destinations);
    const labels = tools.map((d) => d.label);
    expect(labels).toContain('Export');
    for (const relational of ['Conversations', 'Insights', 'Suggestions', 'Discover']) {
      expect(labels).not.toContain(relational);
    }
  });

  /*
   * REMOVED — "the work region must be the largest by destination count".
   *
   * It was an invented invariant. D-018 makes the Work the **primary
   * persistent context**: Manuscripts and Materials belong to a Work, and a
   * MAIA Exchange is relational activity belonging to a Work. That is an
   * ontological relation, and counting navigation entries does not test it.
   * MAIA could one day carry six legitimate relational offerings against five
   * Work rooms without the Work ceasing to be the context they all belong to —
   * and the arithmetic assertion would have failed a conformant Studio.
   *
   * The real relation lives in the object model, not the chrome, so no
   * substitute assertion is made here. Left recorded rather than deleted
   * silently, per the decisions record's own rule.
   */
});
