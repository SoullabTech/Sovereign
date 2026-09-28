import { matchRule } from '@/config/accessMatrix';

describe('Becoming House access matrix', () => {
  it('declares the room and each governed MAIA seam as authenticated free-member routes', () => {
    for (const path of [
      '/becoming',
      '/api/becoming/guide',
      '/api/becoming/temporal',
      '/api/becoming/conversation',
    ]) {
      expect(matchRule(path)).toMatchObject({ minTier: 'free' });
      expect(matchRule(path)?.public).not.toBe(true);
    }
  });
});
