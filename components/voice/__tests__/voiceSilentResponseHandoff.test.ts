import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/OracleConversation.tsx'),
  'utf8',
);

describe('voice silent-response handoff', () => {
  it('clears response latches even when TTS is disabled', () => {
    const branch = source.indexOf("commitOracleTurn('voice_no_tts')");
    const window = source.slice(branch, branch + 1800);
    expect(window).toContain('setIsProcessing(false)');
    expect(window).toContain('setIsResponding(false)');
    expect(window).toContain('setIsAudioPlaying(false)');
    expect(window).toContain('setIsMicrophonePaused(false)');
  });

  it('restarts only under the existing hands-free policy', () => {
    const branch = source.indexOf("commitOracleTurn('voice_no_tts')");
    const window = source.slice(branch, branch + 1800);
    expect(window).toContain('voiceMicRef.current?.isHandsFree');
    expect(window).toContain("startListening('voice_silent_response_restart')");
    expect(window).toContain('if (isHandsFree)');
  });
});
