import { readFileSync } from 'fs';
import { join } from 'path';
import { detectCrisis } from '../liveCrisisContract';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('SAFETY-DELIVERY-01 live crisis contract', () => {
  it('does not treat ordinary completion or farewell language as crisis evidence', () => {
    for (const input of [
      "I'm done",
      "I'm done talking for now",
      'goodbye to that old pattern',
      'okay goodbye for now',
      'this is italian food',
      'this is itself a teaching',
      "what's the point of this exercise?",
      "I don't want to be here at this meeting",
      "I'm so tired of this project",
      "nothing matters in this calculation",
      'this is it',
      'I wrote letters',
      "I've just taken the dog outside",
      'tonight is the night of the concert',
      'I have a knife for cooking',
      "I'm on the roof fixing shingles",
    ]) {
      expect(detectCrisis(input)).toEqual({ detected: false });
    }
  });

  it('detects unambiguous self-harm and suicide language with severity', () => {
    expect(detectCrisis('I want to die').level).toBe('active');
    expect(detectCrisis("I've been thinking about suicide").level).toBe('active');
    expect(detectCrisis("I'm going to kill myself").level).toBe('high');
    expect(detectCrisis("I have pills and I'm going to use them").level).toBe('high');
    expect(detectCrisis("I'm on a bridge and I'm going to jump").level).toBe('high');
    expect(detectCrisis('I need to hurt myself').level).toBe('nssi');
  });

  it('produces a deterministic member-facing response for detected crisis', () => {
    const result = detectCrisis("I'm going to kill myself");
    expect(result.detected).toBe(true);
    expect(result.responseScript?.length).toBeGreaterThan(0);
    expect(result.responseScript?.join(' ')).toContain('988');
  });

  it('wires the canonical route after durable acceptance and before ordinary processing', () => {
    const src = W('app/api/sovereign/app/maia/list/route.ts');

    const durable = src.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn');
    const crisis = src.indexOf('const liveCrisis = detectCrisis(message)');
    const command = src.indexOf('const commandOnlyClassification');
    const field = src.indexOf('fieldSafety = enforceFieldSafety');
    const generation = src.indexOf("'getMaiaResponse'");

    expect(durable).toBeGreaterThan(-1);
    expect(crisis).toBeGreaterThan(durable);
    expect(command).toBeGreaterThan(crisis);
    expect(field).toBeGreaterThan(crisis);
    expect(generation).toBeGreaterThan(crisis);
  });

  it('keeps human disclosure explicitly out of the live route contract', () => {
    const src = W('app/api/sovereign/app/maia/list/route.ts');
    const start = src.indexOf('const liveCrisis = detectCrisis(message)');
    const end = src.indexOf('// TII-03 — PURE COMMAND ACCEPTANCE', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const block = src.slice(start, end);
    expect(block).toContain('humanDisclosureAttempted: false');
    expect(block).not.toContain('alertSoullabTeam');
    expect(block).not.toContain('sendAlert(');
    expect(block).not.toContain('sendSafetyConcernNotification');
  });
});
