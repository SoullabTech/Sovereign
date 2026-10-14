/** ASTRO-R4e: standing chart opt-in never authorizes hidden MAIA context. */
import fs from 'node:fs';
import path from 'node:path';
import { appendAllContextAddenda, type MaiaContext } from '@/lib/sovereign/maiaVoice';
import {
  IMPLICIT_MAIA_ASTROLOGY_TRANSFER_ALLOWED,
  mayAttachImplicitAstrologyContext,
  withoutImplicitAstrologyAddenda,
} from '../maiaAstrologyTransferPolicy';

describe('ASTRO-R4g — deny ambient chart transfer; older reviewed Send retired', () => {
  it('refuses passive context, regardless of standing opt-in or client claims', () => {
    expect(IMPLICIT_MAIA_ASTROLOGY_TRANSFER_ALLOWED).toBe(false);
    expect(mayAttachImplicitAstrologyContext()).toBe(false);
    expect(mayAttachImplicitAstrologyContext()).not.toBeTruthy();
  });

  it('drops stale and forged system addenda without changing the member message or other context', () => {
    const provided = {
      astrologyAddendum: 'PRIVATE-BIRTH-DATA-MUST-NOT-REACH-MAIA',
      astrologicalContextAddendum: 'SECRET-TRANSIT-FACTS-MUST-NOT-REACH-MAIA',
      journalContextAddendum: 'member-authorized journal handoff',
      userId: 'fictional-member',
      astrologyConsent: 'opted_in',
      explicitAstrologyTransfer: true, // client claim cannot revive ambient injection
      input: 'I am choosing to send only my selected chart text',
    };
    const result = withoutImplicitAstrologyAddenda(provided);
    expect(result).not.toHaveProperty('astrologyAddendum');
    expect(result).not.toHaveProperty('astrologicalContextAddendum');
    expect(result.journalContextAddendum).toBe(provided.journalContextAddendum);
    expect(result.input).toBe(provided.input);
    expect(result.userId).toBe(provided.userId);
    expect(provided.astrologyAddendum).toContain('PRIVATE-BIRTH-DATA');
    expect(result).not.toBe(provided);
  });

  it('excludes hidden astrology even from MAIA prompt assembly called directly', () => {
    const prompt = appendAllContextAddenda({
      astrologicalContextAddendum: 'PRIVATE-BIRTH-DATA-MUST-NOT-REACH-MAIA',
      journalContextAddendum: 'member-approved journal context',
    } as MaiaContext, 'START');
    expect(prompt).toContain('START');
    expect(prompt).toContain('member-approved journal context');
    expect(prompt).not.toContain('PRIVATE-BIRTH-DATA-MUST-NOT-REACH-MAIA');
  });

  it('source-witnesses known implicit loaders and deactivated legacy Send', () => {
    const source = (p:string) => fs.readFileSync(path.join(process.cwd(),p),'utf8');
    const sovereign = source('app/api/sovereign/app/maia/list/route.ts');
    const between = source('app/api/between/chat/route.ts');
    const shared = source('lib/maia/context/buildMaiaContext.ts');
    const service = source('lib/sovereign/maiaService.ts');
    const chart = source('app/astrology/pro-preview/ProAstrologyExperience.tsx');

    expect(sovereign).toContain('const shouldLoadAstrology = mayAttachImplicitAstrologyContext()');
    expect(sovereign).toContain('const shouldComputeWuXing = mayAttachImplicitAstrologyContext()');
    expect(between).toContain('const astrologicalContextAddendum: string | null = null;');
    expect(shared).not.toContain('getAstrologyContextForUser(');
    expect(service).toContain('withoutImplicitAstrologyAddenda(incomingMeta)');
    expect(service).not.toContain('(meta as any).astrologyAddendum = identity.astrologyAddendum');
    expect(chart).not.toContain('async function explicitlyShareWithMaia()');
    expect(chart).not.toContain('setShared(');
    expect(chart).not.toContain('<OracleConversation');
    expect(chart).toContain('Transfer to MAIA is paused');
  });
});
