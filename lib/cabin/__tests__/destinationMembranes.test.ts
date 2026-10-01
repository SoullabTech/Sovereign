import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('H4.4 Cabin destination membranes', () => {
  it('Writer Studio offers an explicit Cabin return without changing room authority', () => {
    const s = source('app/writers-studio/full-redesign/Shell.tsx');

    expect(s).toContain('isCabinOrigin');
    expect(s).toContain('cabinReturnPath');
    expect(s).toContain('aria-label="Return to Cabin"');
    expect(s).not.toMatch(/workId|manuscriptId|memberId|sessionId/);
  });

  it('Relationships preserves Cabin origin into the relationship detail and returns explicitly', () => {
    const list = source('app/relationships/page.tsx');
    const detail = source('app/relationships/[id]/page.tsx');

    for (const s of [list, detail]) {
      expect(s).toContain('isCabinOrigin');
      expect(s).toContain('cabinReturnPath');
    }

    expect(list).toContain("?from=cabin");
    expect(detail).not.toContain('router.back()');
  });

  it('Anchor preserves Cabin origin between history and today and returns explicitly', () => {
    const history = source('app/maia/anchor/history/page.tsx');
    const today = source('app/maia/anchor/page.tsx');

    for (const s of [history, today]) {
      expect(s).toContain('isCabinOrigin');
      expect(s).toContain('cabinReturnPath');
      expect(s).not.toContain('router.back()');
    }

    expect(history).toContain('/maia/anchor?from=cabin');
    expect(today).toContain('/maia/anchor/history?from=cabin');
  });

  it('No destination accepts an arbitrary return target from the Cabin crossing', () => {
    const files = [
      'app/writers-studio/full-redesign/Shell.tsx',
      'app/relationships/page.tsx',
      'app/relationships/[id]/page.tsx',
      'app/maia/anchor/history/page.tsx',
      'app/maia/anchor/page.tsx',
    ];

    for (const file of files) {
      const s = source(file);
      expect(s).not.toMatch(/returnTo=.*searchParams|searchParams.*returnTo/);
      expect(s).not.toMatch(/window\.location\.(href|assign|replace)/);
    }
  });

  it('The receiving rooms do not use Cabin origin as a cognition or context-refresh trigger', () => {
    const files = [
      'app/writers-studio/full-redesign/Shell.tsx',
      'app/relationships/page.tsx',
      'app/relationships/[id]/page.tsx',
      'app/maia/anchor/history/page.tsx',
      'app/maia/anchor/page.tsx',
    ];

    for (const file of files) {
      const s = source(file);
      expect(s).not.toMatch(/initializeCabinContextMount|clearCabinContextMount|cabinContextSnapshot/);
      expect(s).not.toMatch(/generate.*cabin|cognition.*fromCabin|fromCabin.*cognition/i);
    }
  });
});
