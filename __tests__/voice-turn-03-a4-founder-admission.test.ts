import { readFileSync } from 'fs';
import { join } from 'path';

const oracle = readFileSync(join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8');
const receiver = readFileSync(join(process.cwd(), 'app/api/telemetry/client/route.ts'), 'utf8');

describe('TURN-03 A4 founder witness admission', () => {
  it('requires explicit query request and keeps production admin-gated', () => {
    expect(oracle).toContain("get('turnA4Shadow') === '1'");
    expect(oracle).toContain('const a4FounderShadowEnabled = a4FounderShadowRequested &&');
    expect(oracle).toContain("showDiagnostics || process.env.NODE_ENV === 'development'");
    expect(oracle).toContain('a4ShadowResearchEnabled={a4FounderShadowEnabled}');
  });

  it('does not persist the founder research request', () => {
    expect(oracle).not.toContain("localStorage.setItem('turnA4Shadow'");
    expect(oracle).not.toContain("sessionStorage.setItem('turnA4Shadow'");
  });

  it('admits A4 server telemetry vocabulary', () => {
    for (const event of ['voice_turn_a4_checkpoint','voice_turn_a4_continued','voice_turn_a4_explicit_yield']) {
      expect(receiver).toContain(`'${event}'`);
    }
  });
});
