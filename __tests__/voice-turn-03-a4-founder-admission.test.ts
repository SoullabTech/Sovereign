import { readFileSync } from 'fs';
import { join } from 'path';

const oracle = readFileSync(join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8');
const receiver = readFileSync(join(process.cwd(), 'app/api/telemetry/client/route.ts'), 'utf8');

describe('TURN-03 A4 founder witness admission', () => {
  it('requires both admin session and explicit query request', () => {
    expect(oracle).toContain("get('turnA4Shadow') === '1'");
    expect(oracle).toContain('const a4FounderShadowEnabled = showDiagnostics && a4FounderShadowRequested;');
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
