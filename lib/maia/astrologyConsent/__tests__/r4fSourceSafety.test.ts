/**
 * Non-bypass source regression. This is NOT proof of complete memory graph
 * coverage; the independent inventory must adjudicate derivative stores.
 */
import fs from 'node:fs';
import path from 'node:path';

const source = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('R4F isolated source safety envelope', () => {
  it('remains hard-disabled irrespective of environment configuration', () => {
    const route = source('app/api/astrology/pro/maia-transfer/route.ts');
    expect(route).toContain('R4F_MAIA_SEND_ACTIVATION_APPROVED = false as const');
    expect(route).toContain('!R4F_MAIA_SEND_ACTIVATION_APPROVED');
    expect(route).toContain('modelDeliveryEnabled: false');
  });

  it('excludes protected session provenance from the enumerated ordinary recall readers', () => {
    for (const p of [
      'lib/maia/memoryLoaders.ts',
      'lib/memory/MemoryBundle.ts',
      'lib/memory/stores/TurnsStore.ts',
      'lib/maia/relational-field-shadow/fieldAssembler.ts',
      'app/api/conversation/turns/route.ts',
    ]) {
      expect(source(p)).toContain('NOT EXISTS (');
      expect(source(p)).toContain('astro_maia_transfer_grants');
    }
  });

  it('prevents generic conversation persistence into a protected session', () => {
    const store = source('lib/memory/stores/TurnsStore.ts');
    expect((store.match(/WHERE r4f\.session_id = \$2/g) || []).length).toBeGreaterThanOrEqual(4);
    expect(store).toContain('addR4fProtectedTurn');
    expect(store).toContain("grant.status = 'consumed'");
    expect(store).toContain("member.astrology_consent = 'opted_in'");
    const sync = source('app/api/conversation/turns/route.ts');
    expect(sync).toContain('isR4fProtectedSessionById(sessionId)');
    expect(sync).toContain('privacy_guard_unavailable');
  });

  it('never stores unhashed chart text or bearer token in grant metadata', () => {
    const store = source('lib/maia/astrologyConsent/r4fGrantStore.ts');
    expect(store).toContain('hmacPassageExact(exactReviewedText, digestKey)');
    expect(store).toContain('sha256Exact(token)');
    expect(store).toContain('passage_key_unavailable');
    const schema = source('database/migrations/20261013000001_astrology_maia_passage_scope.sql');
    expect(schema).toContain('text_hmac_sha256');
    expect(schema).not.toMatch(/\b(?:birth_date|birth_time|chat_text|raw_token)\s+(?:text|varchar)/i);
  });
});
