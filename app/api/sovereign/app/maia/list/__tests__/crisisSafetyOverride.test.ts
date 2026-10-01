import { readFileSync } from 'fs';
import { join } from 'path';

const ROUTE = readFileSync(
  join(process.cwd(), 'app/api/sovereign/app/maia/list/route.ts'),
  'utf8',
);

describe('SAFETY-DELIVERY-01 canonical live hard override', () => {
  it('runs recognition after durable member acceptance and before ordinary cognition', () => {
    const durable = ROUTE.indexOf('member turn accepted+durable');
    const recognition = ROUTE.indexOf('const liveCrisisRecognition = recognizeLiveCrisisLanguage(message)');
    const command = ROUTE.indexOf('// TII-03 — PURE COMMAND ACCEPTANCE');
    const profile = ROUTE.indexOf('// ⚡ LATENCY FIX: Parallelize session init');
    const model = ROUTE.indexOf('getMaiaResponse({');

    expect(durable).toBeGreaterThan(-1);
    expect(recognition).toBeGreaterThan(durable);
    expect(command).toBeGreaterThan(recognition);
    expect(profile).toBeGreaterThan(recognition);
    expect(model).toBeGreaterThan(recognition);
  });

  it('hard override returns deterministically before ordinary model cognition', () => {
    const recognition = ROUTE.indexOf('if (liveCrisisRecognition.safetyOverride)');
    const end = ROUTE.indexOf('// TII-03 — PURE COMMAND ACCEPTANCE', recognition);
    const block = ROUTE.slice(recognition, end);

    expect(recognition).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(recognition);
    expect(block).toContain('buildLiveCrisisMemberResponse(liveCrisisRecognition)');
    expect(block).toContain("processingProfile: 'DETERMINISTIC_SAFETY'");
    expect(block).toContain("mode: 'deterministic-safety-override'");
    expect(block).toContain('disclosureAuthorized: false');
    expect(block).toContain('return jsonWithCors(');
    expect(block).not.toContain('getMaiaResponse(');
  });

  it('preserves the assistant safety response under the accepted exchange when allowed', () => {
    const recognition = ROUTE.indexOf('if (liveCrisisRecognition.safetyOverride)');
    const end = ROUTE.indexOf('// TII-03 — PURE COMMAND ACCEPTANCE', recognition);
    const block = ROUTE.slice(recognition, end);

    expect(block).toContain("'durableSafetyOverrideTurn'");
    expect(block).toContain("role: 'assistant'");
    expect(block).toContain('content: safetyResponseText');
    expect(block).toContain('exchangeId,');
  });

  it('does not add a human notification or disclosure transport', () => {
    const recognition = ROUTE.indexOf('if (liveCrisisRecognition.safetyOverride)');
    const end = ROUTE.indexOf('// TII-03 — PURE COMMAND ACCEPTANCE', recognition);
    const block = ROUTE.slice(recognition, end);

    expect(block).not.toMatch(/sendAlert|sendEmail|resend|smtp|webhook|notifyHumans/i);
    expect(block).not.toMatch(/therapist|guardian|practitioner|soullabTeam/i);
  });
});
