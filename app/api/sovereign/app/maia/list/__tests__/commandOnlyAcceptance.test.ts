import fs from 'node:fs';
import path from 'node:path';

const ROUTE = fs.readFileSync(
  path.resolve(process.cwd(), 'app/api/sovereign/app/maia/list/route.ts'),
  'utf8',
);

function between(source: string, start: string, end: string): string {
  const a = source.indexOf(start);
  const b = source.indexOf(end);
  if (a < 0 || b < 0 || b <= a) throw new Error(`INVALID_SLICE:${start}→${end}`);
  return source.slice(a, b);
}

describe('TII-03 command-only F1 acceptance seam', () => {
  const f1 = '// 🧱 TURN ACCEPTANCE BOUNDARY (F1 — durable turn acceptance)';
  const tii = '// TII-03 — PURE COMMAND ACCEPTANCE: post-F1, pre-O8/F2/cognition.';
  const o8 = '// O8R4 — EXPLICIT CAPABILITY INQUIRY: text-only, post-F1 / pre-F2.';
  const f2 = '// F2-IQ runtime classifier: current accepted utterance only.';

  it('is strictly post-F1 and pre-O8/F2', () => {
    expect(ROUTE.indexOf(tii)).toBeGreaterThan(ROUTE.indexOf(f1));
    expect(ROUTE.indexOf(o8)).toBeGreaterThan(ROUTE.indexOf(tii));
    expect(ROUTE.indexOf(f2)).toBeGreaterThan(ROUTE.indexOf(o8));
  });

  it('destructures commandOnly as transport control rather than prompt meta', () => {
    expect(ROUTE).toContain('exchangeId: clientExchangeId, commandOnly, ...meta');
    expect(ROUTE).toContain('commandOnly?: boolean;');
  });

  it('returns after F1 without O8, F2, cognition, or an assistant turn', () => {
    const acceptance = between(ROUTE, f1, tii);
    const seam = between(ROUTE, tii, o8);
    expect(acceptance).toContain('content: message');
    expect(seam).toContain('detectMaiaCommands(message)');
    expect(seam).toContain("commandOnlyClassification?.disposition === 'EXECUTE'");
    expect(seam).toContain('commandOnlyClassification.onlyCommands === true');
    expect(seam).toContain('if (isValidatedCommandOnly)');
    expect(seam).toContain("processingProfile: 'COMMAND_ONLY_ACCEPTANCE'");
    expect(seam).toContain("endpoint: '/api/sovereign/app/maia/list'");
    expect(seam).toContain('memberTurnDurable');

    for (const forbidden of [
      'resolveExplicitCapabilityInquiry(',
      'classifyExplicitIdentityInquiry(',
      'getMaiaResponse(',
      "role: 'assistant'",
      'initializeSessionTable(',
      'ensureSession(',
    ]) {
      expect(seam).not.toContain(forbidden);
    }
  });
});
