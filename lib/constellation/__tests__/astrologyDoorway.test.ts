import { getDoorway, getDoorwayAudience } from '../doorways';
import { constellationReferralPrompt } from '../referralPrompt';

describe('Astrology Constellation doorway', () => {
  it('has distinct declared audiences without splitting the product', () => {
    const astrology = getDoorway('astrology');
    expect(astrology.path).toBe('/astrology');
    expect(astrology.audiences.map((audience) => audience.id)).toEqual([
      'whole-chart',
      'symbolic-inquiry',
      'serious-astrology',
      'astrology-practitioner',
    ]);
  });

  it('keeps symbolic inquiry non-deterministic', () => {
    const audience = getDoorwayAudience('astrology', 'symbolic-inquiry');
    expect(audience?.invitation).toContain('never deterministic');
  });

  it('declares only the bridges Astrology is allowed to surface', () => {
    const prompt = constellationReferralPrompt('astrology');
    expect(prompt).toContain('Relationships (/relationships)');
    expect(prompt).toContain('Writer’s Studio (/writers-studio)');
    expect(prompt).not.toContain('Practitioner (/practitioner)');
  });
});
