import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/OracleConversation.tsx'),
  'utf8',
);

describe('hands-free authority synchronization', () => {
  it('pushes parent hands-free policy into ContinuousConversation', () => {
    expect(source).toContain('voiceMicRef.current?.setHandsFree(isHandsFreeMode)');
  });

  it('restores hands-free on explicit Speak entry', () => {
    const start = source.indexOf('const requestSpeak = () => {');
    const body = source.slice(start, start + 2600);
    expect(body).toContain('setIsHandsFreeMode(true)');
    expect(body).toContain('voiceMicRef.current?.setHandsFree(true)');
  });

  it('restores hands-free on explicit microphone-enable entry', () => {
    const start = source.indexOf("if (action === 'toggle-microphone')");
    const body = source.slice(start, start + 4200);
    expect(body).toContain('setIsHandsFreeMode(true)');
    expect(body).toContain('voiceMicRef.current?.setHandsFree(true)');
  });

  it('surfaces browser-local MAIA voice-off instead of implying TTS failed', () => {
    expect(source).toContain('MAIA voice is off in this browser');
  });
});
