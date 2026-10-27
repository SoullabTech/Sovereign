import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const files = ['consentDecision.ts', 'roomStopContract.ts'];

describe('Session Room policy-first provider boundary', () => {
  it.each(files)('%s remains pure and imports no runtime, provider, tool, or memory module', (file) => {
    const source = readFileSync(path.join(root, file), 'utf8');
    expect(source).not.toMatch(/^\s*import\s/m);
    expect(source).not.toMatch(/\brequire\s*\(/);
    expect(source).not.toMatch(/\bimport\s*\(/);
    expect(source).not.toContain('app/api/voice/webrtc-session/route');
    expect(source).not.toMatch(/from\s+['"][^'"]*(openai|anthropic|provider|tool|memory)[^'"]*['"]/i);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/process\.env/);
  });
});
