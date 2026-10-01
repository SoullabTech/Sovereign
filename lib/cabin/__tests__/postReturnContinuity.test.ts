import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('H4.5 Cabin post-return continuity', () => {
  it('Cabin page reads the existing experience context and does not initialize it', () => {
    const page = source('app/cabin/page.tsx');

    expect(page).toContain('readCabinExperienceContext()');
    expect(page).not.toContain('initializeCabinContextMount');
    expect(page).not.toContain('clearCabinContextMount');
    expect(page).not.toContain('cabinContextSnapshot');
  });

  it('the experience bridge reads only the current process-local mount', () => {
    const bridge = source('lib/cabin/experienceContext.ts');

    expect(bridge).toContain('currentCabinContextRuntime()');
    expect(bridge).not.toContain('initializeCabinContextMount');
    expect(bridge).not.toContain('clearCabinContextMount');
    expect(bridge).not.toContain('fetch(');
  });

  it('the runtime mount is process-global and idempotent until explicit teardown', () => {
    const runtime = source('lib/cabin/contextRuntime.ts');

    expect(runtime).toContain('if (runtime.mount && runtime.state) return runtime.state;');
    expect(runtime).toContain('__SOULLAB_CABIN_CONTEXT_RUNTIME__');
    expect(runtime).toContain('export function currentCabinContextRuntime()');
    expect(runtime).toContain('export function clearCabinContextMount()');
  });

  it('all four H4.4 return membranes use the fixed Cabin return helper', () => {
    const files = [
      'app/writers-studio/full-redesign/Shell.tsx',
      'app/relationships/page.tsx',
      'app/relationships/[id]/page.tsx',
      'app/maia/anchor/history/page.tsx',
      'app/maia/anchor/page.tsx',
    ];

    for (const file of files) {
      const s = source(file);
      expect(s).toContain('cabinReturnPath');
    }
  });

  it('no receiving room contains a Cabin refresh or import seam', () => {
    const files = [
      'app/writers-studio/full-redesign/Shell.tsx',
      'app/relationships/page.tsx',
      'app/relationships/[id]/page.tsx',
      'app/maia/anchor/history/page.tsx',
      'app/maia/anchor/page.tsx',
    ];

    for (const file of files) {
      const s = source(file);
      expect(s).not.toMatch(/\/api\/cabin\/context(?:\/refresh|\/import)?/);
      expect(s).not.toMatch(/initializeCabinContextMount|clearCabinContextMount|cabinContextSnapshot/);
    }
  });
});
