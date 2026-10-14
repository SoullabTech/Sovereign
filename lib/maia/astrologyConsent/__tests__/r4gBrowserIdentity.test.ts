import fs from 'node:fs';
import path from 'node:path';
import {
  isLegacyAstroSession,
  memberConversationStorageKey,
  isServerAdmittedConversationHistory,
  requiresMemberHistoryVerification,
} from '@/lib/maia/browserConversationCustody';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');
const a = 'aaaaaaaa-0000-4000-8000-000000000001';
const b = 'bbbbbbbb-0000-4000-8000-000000000002';

describe('R4G authenticated browser continuity', () => {
  it('keeps account-scoped keys distinct and quarantines old chart sessions', () => {
    expect(memberConversationStorageKey(a, 'ordinary-session')).not.toBe(
      memberConversationStorageKey(b, 'ordinary-session'),
    );
    expect(memberConversationStorageKey(a, 'ordinary-session')).toContain('maia_conversation_v2_');
    expect(memberConversationStorageKey(a, 'astrology-pro-preview-' + a)).toBeNull();
    expect(memberConversationStorageKey(null, 'ordinary-session')).toBeNull();
    expect(isLegacyAstroSession('astrology-pro-preview-' + a)).toBe(true);
    expect(requiresMemberHistoryVerification(a)).toBe(true);
    expect(requiresMemberHistoryVerification('anonymous')).toBe(false);
  });

  it('never admits a history response for a switched member or protected scope', () => {
    const good = { success: true, verifiedMemberId: a, scope: 'ordinary', messages: [] };
    expect(isServerAdmittedConversationHistory(good, a, 'ordinary-session')).toBe(true);
    expect(isServerAdmittedConversationHistory(good, b, 'ordinary-session')).toBe(false);
    expect(isServerAdmittedConversationHistory({ ...good, scope: 'protected' }, a, 'ordinary-session')).toBe(false);
    expect(isServerAdmittedConversationHistory({ ...good, messages: null }, a, 'ordinary-session')).toBe(false);
    expect(isServerAdmittedConversationHistory(good, a, 'astrology-pro-preview-' + a)).toBe(false);
  });

  it('browser history comes only from authenticated server, never old localStorage', () => {
    const code = read('components/OracleConversation.tsx');
    expect(code).not.toContain('localStorage.getItem(storageKey)');
    expect(code).toContain('isServerAdmittedConversationHistory(body, userId, sessionId)');
    expect(code).toContain('historyAdmittedRef.current = false');
    expect(code).toContain('requestEpoch += 1');
    expect(code).toContain("window.addEventListener('focus', onFocus)");
    expect(code).toContain('Verify your member session before continuing');
    expect(code).not.toContain("key.startsWith('maia_conversation_')");
  });

  it('generic history API refuses old and R4F origin before returning text', () => {
    const code = read('app/api/conversation/turns/route.ts');
    expect(code).toContain('isLegacyAstroSession(sessionId)');
    expect(code).toContain('isR4fProtectedSessionById(sessionId)');
    expect(code).toContain('verifiedMemberId: userId');
    expect(code).toContain("scope: 'ordinary'");
    // R5e's reusable privateJson helper carries stronger explicit no-store
    // headers instead of each response spelling the header again.
    expect(code).toContain("const PRIVATE_HISTORY_CACHE = 'private, no-store");
    expect(code).toContain("headers.set('Cache-Control', PRIVATE_HISTORY_CACHE)");
  });
});
