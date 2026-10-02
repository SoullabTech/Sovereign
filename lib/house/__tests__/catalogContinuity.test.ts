import { placeById } from '../catalog';

describe('House place continuity', () => {
  test.each([
    'writing',
    'relationships',
    'community',
    'astrology',
    'wisdom',
    'library',
    'living-field',
    'anchor',
  ])('%s carries explicit House-entry context', (id) => {
    expect(placeById(id)?.href).toContain('from=house');
  });

  test('intrinsic House rooms do not need synthetic entry context', () => {
    expect(placeById('decisions')?.href).toBe('/decisions');
    expect(placeById('practices')?.href).toBe('/practices');
    expect(placeById('changes')?.href).toBe('/changes');
  });
});
