import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/OracleConversation.tsx'),
  'utf8',
);

describe('non-streaming hands-free resume after MAIA speech', () => {
  it('does not gate restart on stale voiceSession presentation state', () => {
    const start = source.indexOf("console.log('✅ [NON-STREAM] Cooldown complete - NOW releasing mic')");
    const end = source.indexOf('}, cooldownMs); // Wait for echo suppression cooldown', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const block = source.slice(start, end);

    expect(block).not.toContain('voiceSession.state.capabilities.canStartListening');
    expect(block).not.toContain("voiceSession.state.phase === 'listening'");
  });

  it('releases turn-complete latches and requests restart under hands-free authority', () => {
    const start = source.indexOf("console.log('✅ [NON-STREAM] Cooldown complete - NOW releasing mic')");
    const end = source.indexOf('}, cooldownMs); // Wait for echo suppression cooldown', start);
    const block = source.slice(start, end);

    expect(block).toContain('isProcessingRef.current = false');
    expect(block).toContain('isRespondingRef.current = false');
    expect(block).toContain('isAudioPlayingRef.current = false');
    expect(block).toContain('isMicrophonePausedRef.current = false');
    expect(block).toContain('voiceMicRef.current?.isHandsFree ?? true');
    expect(block).toContain("voiceSession.methods.startListening('non_stream_restart_attempt')");
  });
});
