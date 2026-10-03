import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('ASTROLOGY-PRESENT-MOMENT-01', () => {
  const astrology = read('app/astrology/page.tsx');
  const house = read('app/house/page.tsx');
  const field = read('components/astrology/CurrentTransitsField.tsx');
  const conversation = read('components/OracleConversation.tsx');

  it('puts the live current-transits field near the Astrology threshold', () => {
    expect(astrology).toContain('<CurrentTransitsField birthChart={chartData} variant="astrology" />');
    expect(astrology.indexOf('<CurrentTransitsField birthChart={chartData} variant="astrology" />'))
      .toBeLessThan(astrology.indexOf('{maiaOpen && memberId ? ('));
  });

  it('surfaces the same present-moment field on the House', () => {
    expect(house).toContain('<CurrentTransitsField variant="house" />');
  });

  it('keeps sky facts distinct from calculated natal activations', () => {
    expect(field).toContain('Current positions are calculated sky facts');
    expect(field).toContain('Personal activation is shown only where an aspect to your natal chart is actually calculated');
    expect(field).toContain("method: birthChart ? 'POST' : 'GET'");
    expect(field).toContain('ACTIVE NATAL CONTACTS');
  });

  it('keeps the text-chat transport alive for a legitimate sovereign local fallback', () => {
    expect(conversation).toContain('const textChatTimeoutMs = 180_000');
    expect(conversation).not.toContain("API request timeout after 60s - aborting");
  });
});
