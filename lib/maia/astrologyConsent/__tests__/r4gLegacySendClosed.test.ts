import fs from 'node:fs';
import path from 'node:path';

const source = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('R4G older Astrology Send bypass is actually closed (source candidate)', () => {
  it('removes the unreceipted embedded MAIA conversation', () => {
    const astro = source('app/astrology/pro-preview/ProAstrologyExperience.tsx');
    for (const unsafe of [
      'explicitlyShareWithMaia',
      'setShared(',
      'setMaiaOpen(',
      '<OracleConversation',
      'injectedMessage={shared}',
      "sessionId={'astrology-pro-preview-' + memberId}",
      'Send to MAIA',
    ]) {
      expect(astro).not.toContain(unsafe);
    }
    expect(astro).toContain('Transfer to MAIA is paused');
    expect(astro).toContain('Private draft — not sent to MAIA');
    expect(astro).toContain('calculate');
  });

  it('does not rely on R4F grant route feature flag alone', () => {
    const grant = source('app/api/astrology/pro/maia-transfer/route.ts');
    expect(grant).toContain('R4F_MAIA_SEND_ACTIVATION_APPROVED = false as const');
    expect(grant).toContain('!R4F_MAIA_SEND_ACTIVATION_APPROVED');
  });
});
