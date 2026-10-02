import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/OracleConversation.tsx'),
  'utf8',
);

describe('recoverable voice reconnect preserves hands-free intent', () => {
  it('does not disable hands-free for VOICE_RECONNECTING_AFTER_GAP', () => {
    const start = source.indexOf("if (cause === 'VOICE_RECONNECTING_AFTER_GAP' && recoverable)");
    expect(start).toBeGreaterThan(-1);
    const end = source.indexOf('// Terminal/unrecovered voice failure', start);
    expect(end).toBeGreaterThan(start);
    const block = source.slice(start, end);
    expect(block).toContain('setIsListening(false)');
    expect(block).toContain('setIsActivating(true)');
    expect(block).toContain('return;');
    expect(block).not.toContain('setIsHandsFreeMode(false)');
  });

  it('still disables hands-free after a terminal voice failure', () => {
    const start = source.indexOf('// Terminal/unrecovered voice failure');
    expect(start).toBeGreaterThan(-1);
    const block = source.slice(start, start + 420);
    expect(block).toContain('setIsHandsFreeMode(false)');
    expect(block).toContain('setIsActivating(false)');
    expect(block).toContain('setIsListening(false)');
  });
});
