import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const src = () => readFileSync(join(ROOT, 'lib/sovereign/maiaService.ts'), 'utf8');
const route = () => readFileSync(join(ROOT, 'app/api/sovereign/app/maia/list/route.ts'), 'utf8');

describe('J5-4 trusted Personal Keeps cognition input', () => {
  it('is top-level on MaiaRequest, not read from client-forgeable meta', () => {
    const s = src();
    expect(s).toMatch(/personalKeepsRead\?:\s*PersonalKeepsReadCognitionInput\s*\|\s*null/);
    expect(s).not.toMatch(/\(meta as any\)\?\.personalKeepsRead|meta\.personalKeepsRead/);
  });

  it('uses the carried TurnPosture and cannot combine with Writer canonical participation', () => {
    const s = src();
    expect(s).toMatch(/personalKeepsRead\?\.posture/);
    expect(s).toMatch(/writerStudio\s*&&\s*personalKeepsRead/);
  });
});

describe('J5-4 true handoff per consuming tier', () => {
  it('FAST and CORE use the accounted handoff helper around their response-producing generateText call', () => {
    const s = src();
    expect((s.match(/invokePersonalKeepsResponse/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(s).toMatch(/fastPathResponse[\s\S]*renderPersonalKeepsReadBlock[\s\S]*invokePersonalKeepsResponse/);
    expect(s).toMatch(/corePathResponse[\s\S]*renderPersonalKeepsReadBlock[\s\S]*invokePersonalKeepsResponse/);
  });

  it('CORE disables model regeneration on a Personal Keeps turn so one receipt cannot authorize two crossings', () => {
    expect(src()).toMatch(/personalKeepsRead\s*\?\s*undefined\s*:\s*async\s*\(repairPrompt/);
  });

  it('DEEP fails closed before deepPathResponse because its native primary cognition has no governed Keep seam', () => {
    const s = src();
    expect(s).toMatch(/case 'DEEP'[\s\S]*personalKeepsRead[\s\S]*PersonalKeepsReadTierUnsupported/);
  });

  it('RCN cannot answer a Personal Keeps turn before the governed crossing', () => {
    expect(src()).toMatch(/personalKeepsRead[\s\S]{0,300}rcn/i);
  });

  it('post-generation AIN rewrite is disabled so Keep-derived content is not handed to a second model under the same receipts', () => {
    expect(src()).toMatch(/rewriteEnabled\s*&&\s*!personalKeepsRead/);
  });
});

describe('J5-4 remains dormant until J5-5 route integration', () => {
  it('the live /maia route still imports neither the J5-3 authority seam nor the J5-4 cognition seam', () => {
    const r = route();
    expect(r).not.toMatch(/personalKeepsReadAuthority|personalKeepsReadCognition/);
  });
});
