import { readFileSync } from 'fs';
import { join } from 'path';

const seal = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/TURN-03_A4_INSTRUMENTATION_SEAL_2026-09-16.md'), 'utf8');

describe('TURN-03 A4 instrumentation seal', () => {
  it('pins the exact immutable instrumentation commit', () => {
    expect(seal).toContain('f570f62870621e388306c097578e86a61f17e7fa');
  });
  it('keeps research fail-closed and separate from explicit floor preference', () => {
    expect(seal).toContain('`a4ShadowResearchEnabled` defaults to `false`');
    expect(seal).toContain('explicit floor mode alone is not research consent');
  });
  it('pins qualification and zero live turn authority', () => {
    expect(seal).toContain('64 / 64 PASS');
    expect(seal).toContain('41 / 41 PASS');
    expect(seal).toContain('14 / 14 PASS');
    expect(seal).toContain('0 regressions');
    expect(seal).toContain('TURN-04');
  });
  it('leaves human execution unopened', () => {
    expect(seal).toContain('founder instrumentation walk');
    expect(seal).toContain('any human A4 population');
    expect(seal).toContain('next lawful act is a separately governed founder instrumentation witness');
  });
});
