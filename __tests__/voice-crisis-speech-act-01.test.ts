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

  it('does not treat ordinary conversation as crisis evidence (VOICE-CRISIS-FALSE-POSITIVE-01)', () => {
    for (const transcript of [
      'I said goodbye to my mother at the airport',
      'goodbye to that old pattern, I think this is it',
      'this is it, this is the breakthrough I was waiting for',
      'this is the end of the chapter',
      "I'm on the edge of something new",
      "I'm on the roof garden watering the tomatoes",
      "I've decided, I'm going to do it, I'm signing up for the course",
      "I've just taken a long walk by the river",
      "I've already cut the onions",
      'I have a knife for the bread',
      'I wrote letters to my grandchildren',
      'tonight is the night of the full moon ceremony',
      'tell them I love the new design',
      'what is the point of this feature',
      'nothing matters more than presence',
      "I'm so tired of this rain",
      "I don't want to be here in this job forever",
      'I want to cut back on sugar',
      'I need to feel something different in my practice',
      'I want to end this meeting early',
      "I don't want to live in this city",
      'this is itself a teaching',
    ]) {
      expect(detectCrisis(transcript)).toEqual({ detected: false });
    }
  });

  it('escalates context-dependent signals only alongside explicit self-harm language', () => {
    expect(detectCrisis('I want to die, this is goodbye').level).toBe('high');
    expect(detectCrisis("I have pills and I'm going to end it all").level).toBe('high');
    expect(detectCrisis("I'm on the bridge, I'm going to kill myself").level).toBe('high');
    expect(detectCrisis("I've already taken the pills").level).toBe('high');
    expect(detectCrisis('I wrote a suicide note').level).toBe('high');
    expect(detectCrisis('I want to end my life').level).toBe('active');
    expect(detectCrisis('everyone would be better off without me').level).toBe('soft');
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
