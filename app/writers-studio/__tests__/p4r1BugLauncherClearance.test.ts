import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(
  join(process.cwd(), 'app/dev/writers-studio-p4r1/p4r1-live.css'),
  'utf8',
);
const bugButton = readFileSync(
  join(process.cwd(), 'components/bugs/BugReportButton.tsx'),
  'utf8',
);

describe('P4R1 footer clears the global bug launcher', () => {
  it("reserves the signed-in bug launcher’s lower-right footprint", () => {
    expect(bugButton).toContain('fixed bottom-4 right-4');
    expect(css).toMatch(/\.p4r1-root \.fr-write-foot\s*\{[^}]*padding-right:\s*156px/s);
    expect(css).toMatch(/@media\(max-width:639px\)[\s\S]*\.p4r1-root \.fr-write-foot\s*\{[^}]*padding-right:\s*72px/s);
  });
});
