import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(
  path.join(process.cwd(), 'lib/manuscript/render/print-book.css'), 'utf8',
);

/**
 * Physical fictional-PDF qualification was performed separately and retained
 * in the Writer review packet. This protects the exact 3/3 paragraph rule
 * and unchanged 1.40 body leading from accidental source regression.
 */
describe('Hallmark 6x9 print paragraph-flow correction', () => {
  it('requires both 3-line orphan and widow boundaries on the default paragraph rule', () => {
    const paragraph = css.match(/(?:^|\n)p\s*\{([^}]+)\}/);
    expect(paragraph).not.toBeNull();
    expect(paragraph![1]).toMatch(/\borphans:\s*3\s*;/);
    expect(paragraph![1]).toMatch(/\bwidows:\s*3\s*;/);
  });

  it('preserves 1.40 default body leading rather than globally reducing type spacing', () => {
    const body = css.match(/(?:^|\n)body\s*\{([^}]+)\}/);
    expect(body).not.toBeNull();
    expect(body![1]).toMatch(/\bline-height:\s*1\.4\s*;/);
    expect(css).toMatch(/size:\s*6in\s+9in\s*;/);
  });

  it('contains no edition authorization/export or author text changes in the stylesheet', () => {
    expect(css).not.toContain('exportsCertified');
    expect(css).not.toContain('PRESS_SOURCE_INTAKE_RELEASED');
    expect(css).toContain('break-before: page;');
  });
});
