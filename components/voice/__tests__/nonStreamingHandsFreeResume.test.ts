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

describe('desktop Safari playback completion authority', () => {
  it('does not depend only on HTMLAudioElement.onended', () => {
    const start = source.indexOf("const resolvePlayback = (reason: 'ended' | 'timeupdate' | 'probe' | 'pause')");
    const end = source.indexOf('// 🔥 CRITICAL: Reset states after successful audio playback', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const block = source.slice(start, end);

    expect(block).toContain('audio.ontimeupdate');
    expect(block).toContain('completionProbeId = setInterval');
    expect(block).toContain("resolvePlayback('probe')");
    expect(block).toContain("resolvePlayback('pause')");
    expect(block).toContain("audio.onended = () => resolvePlayback('ended')");
    expect(block).toContain('estimatedMp3Seconds');
    expect(block).toContain('Number.isFinite(audio.duration)');
    expect(block).toContain('armPlaybackCeiling()');
    expect(block).toContain('if (settled) return');
  });
});
