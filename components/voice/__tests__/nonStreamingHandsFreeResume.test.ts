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

  it('restores durable voice intent before releasing the mic, then requests restart', () => {
    const start = source.indexOf("console.log('✅ [NON-STREAM] Cooldown complete - NOW releasing mic')");
    const end = source.indexOf('}, cooldownMs); // Wait for echo suppression cooldown', start);
    const block = source.slice(start, end);

    expect(block).toContain('if (lastSendWasVoiceRef.current)');
    expect(block).toContain('setIsHandsFreeMode(true)');
    expect(block).toContain('voiceMicRef.current?.setHandsFree(true)');
    expect(block).toContain('isProcessingRef.current = false');
    expect(block).toContain('isRespondingRef.current = false');
    expect(block).toContain('isAudioPlayingRef.current = false');
    expect(block).toContain('isMicrophonePausedRef.current = false');
    expect(block).toContain("voiceSession.methods.startListening('non_stream_restart_attempt')");

    const restore = block.indexOf('voiceMicRef.current?.setHandsFree(true)');
    const release = block.indexOf('setIsMicrophonePaused(false)');
    expect(restore).toBeGreaterThan(-1);
    expect(release).toBeGreaterThan(restore);
  });
});

describe('explicit voice exit revokes durable auto-listen intent', () => {
  it('clears voice intent on holoflower exit and mic-off toggle', () => {
    const holoflowerStart = source.indexOf("console.log('🔇 Stopping voice via holoflower (USER EXIT MODE)...')");
    const holoflowerBlock = source.slice(holoflowerStart, holoflowerStart + 420);
    expect(holoflowerStart).toBeGreaterThan(-1);
    expect(holoflowerBlock).toContain('lastSendWasVoiceRef.current = false');

    const micOffStart = source.indexOf('// Turn mic OFF - user explicitly toggling off');
    const micOffBlock = source.slice(micOffStart, micOffStart + 320);
    expect(micOffStart).toBeGreaterThan(-1);
    expect(micOffBlock).toContain('lastSendWasVoiceRef.current = false');
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
