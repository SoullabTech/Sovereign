import { recognizeLiveCrisisLanguage } from '../crisisRecognition';

describe('SAFETY-DELIVERY-01 minimal live crisis recognition', () => {
  it('does not convert ordinary completion, farewell, medication, or quoted-topic language into crisis', () => {
    for (const text of [
      "I'm done",
      "I'm done with this test",
      'this is goodbye',
      'I said goodbye to my mother at the airport',
      'goodbye to that old pattern',
      'I wrote letters',
      "I've just taken my medication",
      'I have pills for my headache',
      'we studied suicide prevention today',
      'my friend told me they want to die',
      'the article discusses self harm',
    ]) {
      expect(recognizeLiveCrisisLanguage(text)).toEqual({
        detected: false,
        level: 'none',
        safetyOverride: false,
        disclosureAuthorized: false,
      });
    }
  });

  it('separates ambiguous distress from hard safety override', () => {
    for (const text of [
      "I can't do this anymore",
      "what's the point",
      'nothing matters',
      "I'm a burden",
      'everyone would be better off without me',
    ]) {
      const r = recognizeLiveCrisisLanguage(text);
      expect(r.detected).toBe(true);
      expect(r.level).toBe('check_in');
      expect(r.safetyOverride).toBe(false);
      expect(r.disclosureAuthorized).toBe(false);
    }
  });

  it('hard-overrides explicit first-person suicidal ideation', () => {
    for (const text of [
      'I want to die',
      "I don't want to live anymore",
      'I wish I were dead',
      "I've been thinking about suicide",
      "I'm thinking about killing myself",
    ]) {
      const r = recognizeLiveCrisisLanguage(text);
      expect(r.level).toBe('active');
      expect(r.safetyOverride).toBe(true);
      expect(r.disclosureAuthorized).toBe(false);
    }
  });

  it('hard-overrides explicit first-person non-suicidal self-injury language', () => {
    for (const text of [
      'I need to hurt myself',
      'I want to cut myself',
      "I'm going to burn myself",
    ]) {
      const r = recognizeLiveCrisisLanguage(text);
      expect(r.level).toBe('nssi');
      expect(r.safetyOverride).toBe(true);
      expect(r.disclosureAuthorized).toBe(false);
    }
  });

  it('distinguishes explicit imminent action from ideation', () => {
    for (const text of [
      "I'm going to kill myself",
      "I'm going to end my life",
      'I just took pills to kill myself',
      "I have a gun and I'm going to kill myself",
    ]) {
      const r = recognizeLiveCrisisLanguage(text);
      expect(r.level).toBe('imminent');
      expect(r.safetyOverride).toBe(true);
      expect(r.disclosureAuthorized).toBe(false);
    }
  });

  it('never grants disclosure authority as a side effect of recognition', () => {
    for (const text of [
      'hello',
      "what's the point",
      'I want to die',
      "I'm going to kill myself",
      'I need to hurt myself',
    ]) {
      expect(recognizeLiveCrisisLanguage(text).disclosureAuthorized).toBe(false);
    }
  });

  it('is recognition-only: no transport, persistence, recipient, or alert authority', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const src = readFileSync(join(process.cwd(), 'lib/safety/crisisRecognition.ts'), 'utf8');

    expect(src).not.toMatch(/fetch\s*\(/);
    expect(src).not.toMatch(/sendAlert|sendEmail|resend|smtp|webhook/i);
    expect(src).not.toMatch(/database|postgres|prisma|supabase/i);
    expect(src).not.toMatch(/therapist|guardian|practitioner|soullabTeam/i);
  });
});
