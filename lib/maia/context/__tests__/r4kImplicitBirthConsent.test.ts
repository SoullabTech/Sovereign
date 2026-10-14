/** ASTRO-R4K: natal/BaZi chart data cannot cross into MAIA without a
 * member-reviewed, server-bound current-turn authorization.
 * FICTIONAL literal values only; no real members or provider calls. */
import fs from 'node:fs';
import path from 'node:path';
import {appendAllContextAddenda, type MaiaContext} from '@/lib/sovereign/maiaVoice';
import {
  mayAttachImplicitAstrologyContext,
  withoutImplicitAstrologyAddenda,
} from '../maiaAstrologyTransferPolicy';

const source = (filename: string) =>
  fs.readFileSync(path.join(process.cwd(),filename),'utf8');

describe('R4K no ambient Western natal, BaZi or Wu Xing private constitution', () => {
  it('standing chart consent and client flags do not permit hidden chart context', () => {
    expect(mayAttachImplicitAstrologyContext()).toBe(false);
    const original = {
      astrologyConsent:'opted_in',
      explicitAstrologyTransfer:true,
      astrologyAddendum:'FICTIONAL_NATAL_PRIVATE',
      astrologicalContextAddendum:'FICTIONAL_BIRTH_LOCATION_PRIVATE',
      wuxingSnapshotAddendum:'FICTIONAL_BAZI_DAY_MASTER_PRIVATE',
      bridgeSnapshotAddendum:'FICTIONAL_BRIDGED_MEMBER_PRIVATE',
      wuxingAddendum:'FICTIONAL_WUXING_PRIVATE',
      baziAddendum:'FICTIONAL_CHINESE_BIRTH_CHART_PRIVATE',
      daYunAddendum:'FICTIONAL_DA_YUN_PRIVATE',
      wuxingSnapshot:{memberBirthTime:'FICTIONAL_BIRTH_TIME_PRIVATE'},
      bridgedSnapshot:{memberBirthLocation:'FICTIONAL_BIRTH_LOCATION_PRIVATE'},
      baziProfile:{natal:'FICTIONAL_PRIVATE_PILLARS'},
      journalContextAddendum:'FICTIONAL_MEMBER_SELECTED_JOURNAL',
      input:'FICTIONAL_MEMBER_AUTHORED_MESSAGE',
    };
    const result = withoutImplicitAstrologyAddenda(original);
    for (const key of [
      'astrologyAddendum','astrologicalContextAddendum',
      'wuxingSnapshotAddendum','bridgeSnapshotAddendum',
      'wuxingAddendum','baziAddendum','daYunAddendum',
      'wuxingSnapshot','bridgedSnapshot','baziProfile',
    ]) {
      expect(result).not.toHaveProperty(key);
    }
    expect(result.input).toBe(original.input);
    expect(result.journalContextAddendum).toBe(original.journalContextAddendum);
    expect(result).not.toBe(original);
    expect(original.baziProfile.natal).toBe('FICTIONAL_PRIVATE_PILLARS');
  });

  it('a direct MaiaContext cannot smuggle birth-derived prompt fields', () => {
    const prompt = appendAllContextAddenda({
      journalContextAddendum:'FICTIONAL_APPROVED_JOURNAL_CONTEXT',
      astrologicalContextAddendum:'FICTIONAL_PRIVATE_NATAL_ADDENDUM',
      wuxingSnapshotAddendum:'FICTIONAL_PRIVATE_BAZI_PILLARS',
      bridgeSnapshotAddendum:'FICTIONAL_PRIVATE_BAZI_AND_SPIRAL_BRIDGE',
    } as MaiaContext, 'FICTIONAL_PROMPT_START');
    expect(prompt).toContain('FICTIONAL_PROMPT_START');
    expect(prompt).toContain('FICTIONAL_APPROVED_JOURNAL_CONTEXT');
    expect(prompt).not.toContain('FICTIONAL_PRIVATE_NATAL_ADDENDUM');
    expect(prompt).not.toContain('FICTIONAL_PRIVATE_BAZI_PILLARS');
    expect(prompt).not.toContain('FICTIONAL_PRIVATE_BAZI_AND_SPIRAL_BRIDGE');
  });

  it('main sovereign MAIA route checks BOTH loaders with one hard-off policy', () => {
    const route=source('app/api/sovereign/app/maia/list/route.ts');
    expect(route).toContain('const shouldLoadAstrology = mayAttachImplicitAstrologyContext()');
    expect(route).toContain('const shouldComputeWuXing = mayAttachImplicitAstrologyContext()');
    expect(route).not.toContain('const shouldComputeWuXing = isRecognizedUser && !isSanctuary');
    expect(route).not.toContain('const shouldLoadAstrology = isRecognizedUser && !isSanctuary');
    expect(route).toContain('shouldComputeWuXing\n        ? (async ()');
    expect(route).toContain('shouldLoadAstrology\n        ? getAstrologyContextForUser(effectiveUserId)');
    expect(route).toContain('FROM member_bazi_profile');
    expect(route).toContain('FROM members WHERE id = $1');
  });

  it('MAIA service filters hidden raw metadata before prompt assembly', () => {
    const svc=source('lib/sovereign/maiaService.ts');
    const voice=source('lib/sovereign/maiaVoice.ts');
    expect(svc).toContain('const meta = withoutImplicitAstrologyAddenda(incomingMeta)');
    // The direct generic voice prompt is a separate ingress from MAIA service.
    expect(voice).not.toContain("field: 'wuxingSnapshotAddendum',");
    expect(voice).not.toContain("field: 'bridgeSnapshotAddendum',");
    expect(voice).not.toContain("field: 'astrologicalContextAddendum',");
  });

  it('does not enable previously held chart Send or alter the account deletion HOLD', () => {
    const chart=source('app/astrology/pro-preview/ProAstrologyExperience.tsx');
    const deletion=source('app/api/members/delete-account/route.ts');
    expect(chart).toContain('Transfer to MAIA is paused');
    expect(chart).not.toContain('<OracleConversation');
    expect(deletion).toContain('R20_ACCOUNT_ERASURE_NOT_QUALIFIED');
    expect(deletion).not.toContain('await transaction(');
  });
});
