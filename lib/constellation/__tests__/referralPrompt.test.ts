import fs from 'node:fs';
import path from 'node:path';
import { constellationReferralPrompt } from '../referralPrompt';

describe('Constellation referral prompt discipline', () => {
  it('keeps the current room primary and forbids marketing behavior', () => {
    const prompt = constellationReferralPrompt('writers-studio');
    expect(prompt).toContain('This room remains primary');
    expect(prompt).toContain('NOT a recommendation engine, upsell');
    expect(prompt).toContain('Offer at most ONE room');
  });

  it('requires the person to have opened the subject', () => {
    const prompt = constellationReferralPrompt('writers-studio');
    expect(prompt).toContain('The person themselves has clearly opened that subject');
    expect(prompt).toContain('If the connection is weak or merely possible, say nothing');
  });

  it('exposes only declared bridges for Writer’s Studio', () => {
    const prompt = constellationReferralPrompt('writers-studio');
    expect(prompt).toContain('Relationships (/relationships)');
    expect(prompt).toContain('Astrology (/astrology)');
    expect(prompt).toContain('Practitioner (/practitioner)');
    expect(prompt).not.toContain('Journal (/journal)');
  });

  it('is actually mounted in Writer’s Studio Ask-MAIA cognition', () => {
    const reader = fs.readFileSync(
      path.join(process.cwd(), 'lib/manuscript/ask/askReader.ts'),
      'utf8',
    );
    expect(reader).toContain("constellationReferralPrompt('writers-studio')");
    expect(reader).toContain('${WRITERS_CONSTELLATION_REFERRAL}');
  });
});
