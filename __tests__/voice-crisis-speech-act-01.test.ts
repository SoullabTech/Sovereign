import { readFileSync } from 'fs';
import { join } from 'path';
import { detectCrisis } from '@/lib/voice/voiceCommands';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('VOICE-CRISIS-SPEECH-ACT-01', () => {
  it('does not treat ordinary completion language as crisis evidence', () => {
    for (const transcript of [
      "I'm done",
      "I'm going to click I'm done and listen and let you talk",
      "I like the I'm done mode",
      "I'm done talking for now",
      "I'm done with this test",
    ]) {
      expect(detectCrisis(transcript)).toEqual({ detected: false });
    }
  });

  it('retains unambiguous self-harm and suicide triggers', () => {
    expect(detectCrisis('I want to die').level).toBe('active');
    expect(detectCrisis("I don't want to live anymore").level).toBe('active');
    expect(detectCrisis("I'm going to hurt myself").level).toBe('active');
    expect(detectCrisis("I've been thinking about suicide").level).toBe('active');
    expect(detectCrisis("I'm going to kill myself").level).toBe('high');
    expect(detectCrisis('I need to hurt myself').level).toBe('nssi');
  });

  it('records genuine crisis intervention text before speaking it', () => {
    const src = W('components/OracleConversation.tsx');
    const start = src.indexOf('const crisisCheck = detectCrisis(t)');
    const end = src.indexOf('// 🎭 COMPREHENSIVE VOICE COMMAND DETECTION', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const block = src.slice(start, end);
    expect(block).toContain("const crisisInterventionText = crisisCheck.responseScript?.join(' ').trim()");
    expect(block).toContain('const crisisInterventionMessage: ConversationMessage');
    expect(block).toContain('setMessages(prev => appendMessageCapped(prev, crisisInterventionMessage))');
    expect(block).toContain('onMessageAddedRef.current?.(crisisInterventionMessage)');

    const record = block.indexOf('setMessages(prev => appendMessageCapped(prev, crisisInterventionMessage))');
    const speak = block.indexOf('await maiaSpeak(line)');
    expect(record).toBeGreaterThan(-1);
    expect(speak).toBeGreaterThan(record);
  });

  it('keeps explicit floor ownership language while exposing Pause to the member', () => {
    const bar = W('components/voice/VoiceInteractionBar.tsx');
    const panel = W('components/settings/VoiceSettingsPanel.tsx');

    expect(bar).toContain('holding your floor');
    expect(bar).toContain('Pause');
    expect(bar).toContain('aria-label="Pause speaking — let MAIA respond"');
    expect(panel).toContain('Pause button');
    expect(panel).toContain('Tap Pause when you want MAIA to respond.');
  });
});
