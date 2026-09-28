import {
  BECOMING_SOURCE_PORT_FACETS,
  BECOMING_SOURCE_PORTS,
  becomingSourceObjectType,
  validateBecomingSourcePortRef,
} from '../sourcePorts';

describe('Becoming governed source ports', () => {
  it('admits only live read-only explicit ports backed by existing House source resolvers', () => {
    expect(BECOMING_SOURCE_PORTS.map(port => port.facet)).toEqual(BECOMING_SOURCE_PORT_FACETS);
    expect(BECOMING_SOURCE_PORT_FACETS).toEqual([
      'journal','dream','relationships','decisions','changes',
      'astrology','divination','reflections','ideas',
    ]);
    for (const port of BECOMING_SOURCE_PORTS) {
      expect(port.standing).toBe('live_read_only');
      expect(port.authority).toBe('member_explicit');
      expect(port.retrieval).toBe('none_until_member_act');
      expect(port.transfer).toBe('source_identity_plus_member_selected_context');
      expect(port.epistemicRule).toBe('preserve_native_kind');
      expect(port.returnRule).toBe('exact_source_return_required');
      expect(port.persistence).toBe('none_by_port');
    }
  });

  it('contains no automatic whole-House retrieval port', () => {
    expect(BECOMING_SOURCE_PORTS.some(port => port.retrieval !== 'none_until_member_act')).toBe(false);
    expect(BECOMING_SOURCE_PORTS.some(port => port.authority !== 'member_explicit')).toBe(false);
  });

  it('does not advertise Practices until a real member-owned source resolver exists', () => {
    expect(BECOMING_SOURCE_PORT_FACETS).not.toContain('practices' as never);
  });

  it('maps each admitted facet to a stable native object type', () => {
    expect(becomingSourceObjectType('journal')).toBe('journal_entry');
    expect(becomingSourceObjectType('dream')).toBe('dream_entry');
    expect(becomingSourceObjectType('astrology')).toBe('natal_chart');
    expect(becomingSourceObjectType('divination')).toBe('divination_reading');
  });

  it('requires exact source identity, member selection, and a return route', () => {
    expect(() => validateBecomingSourcePortRef({
      facet: 'journal',
      objectType: 'journal_entry',
      objectId: 'entry-1',
      revision: 2,
      returnHref: '/journal?entry=entry-1',
      memberSelected: true,
    })).not.toThrow();

    expect(() => validateBecomingSourcePortRef({
      facet: 'journal',
      objectType: '',
      objectId: 'entry-1',
      returnHref: '/journal',
      memberSelected: true,
    })).toThrow('BECOMING_SOURCE_OBJECT_TYPE_REQUIRED');

    expect(() => validateBecomingSourcePortRef({
      facet: 'dream',
      objectType: 'dream_entry',
      objectId: 'dream-1',
      returnHref: 'https://example.com',
      memberSelected: true,
    })).toThrow('BECOMING_SOURCE_RETURN_REQUIRED');
  });
});
