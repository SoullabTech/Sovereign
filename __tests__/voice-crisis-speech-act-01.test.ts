import { readFileSync } from 'fs';
import { join } from 'path';
import { assessCrisis, assessCrisisWithCheckIn, maiaAskedAboutSafety, CRISIS_ADDENDUM } from '@/lib/safety/crisisAssessment';
import { ALL_CASES, FOLLOW_UPS } from '@/lib/safety/__fixtures__/crisisCorpus';
import { markSafetyCheckIn, takeSafetyCheckIn, clearSafetyCheckIn, __resetSafetyCheckIns } from '@/lib/safety/crisisCheckIn';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/**
 * VOICE-CRISIS-SPEECH-ACT-01, superseded in substance by SAFETY-CRISIS-01
 * (founder ruling 2026-10-01). The voice-only client phrase list this file used
 * to pin is retired. Crisis assessment runs on the server for every turn; the
 * full corpus and the defeat candidates live in
 * tests/constitutional/safety-crisis/matrix.ts (npm run matrix:safety-crisis).
 */
describe('SAFETY-CRISIS-01 server-side crisis assessment', () => {
  it('classifies every corpus case exactly (false positives weigh as much as misses)', () => {
    for (const c of ALL_CASES) {
      expect({ text: c.text, tier: assessCrisis(c.text).tier }).toEqual({ text: c.text, tier: c.tier });
    }
  });

  it('an affirmative answer escalates only after MAIA actually asked about safety', () => {
    for (const c of FOLLOW_UPS) {
      const tier = assessCrisisWithCheckIn(c.memberReply, maiaAskedAboutSafety(c.maiaReply)).tier;
      expect({ reply: c.memberReply, after: c.maiaReply, tier }).toEqual({ reply: c.memberReply, after: c.maiaReply, tier: c.tier });
    }
  });

  it('the check-in flag lasts two turns or fifteen minutes, whichever comes first', () => {
    __resetSafetyCheckIns();
    markSafetyCheckIn('s1', 0);
    expect(takeSafetyCheckIn('s1', 1000)).toBe(true);
    expect(takeSafetyCheckIn('s1', 2000)).toBe(true);
    expect(takeSafetyCheckIn('s1', 3000)).toBe(false);
    markSafetyCheckIn('s2', 0);
    expect(takeSafetyCheckIn('s2', 15 * 60 * 1000 + 1)).toBe(false);
    markSafetyCheckIn('s3', 0);
    clearSafetyCheckIn('s3');
    expect(takeSafetyCheckIn('s3', 1)).toBe(false);
    expect(takeSafetyCheckIn('', 1)).toBe(false);
  });

  it('continuation state is isolated by session and fails closed when state is lost', () => {
    __resetSafetyCheckIns();

    markSafetyCheckIn('session-a', 0);
    expect(takeSafetyCheckIn('session-b', 1000)).toBe(false);
    expect(takeSafetyCheckIn('session-a', 1000)).toBe(true);

    // Process loss/restart semantics: absence of server state never invents risk.
    __resetSafetyCheckIns();
    expect(takeSafetyCheckIn('session-a', 2000)).toBe(false);
    expect(assessCrisisWithCheckIn('yes, I do', false).tier).toBe('none');
  });

  it('a bare farewell and turn-taking language trigger nothing', () => {
    for (const t of ['goodbye', "I'm done", "I'm done talking for now", 'okay goodbye MAIA, talk tomorrow']) {
      expect(assessCrisis(t)).toEqual({ tier: 'none', signals: [] });
    }
  });

  it('the client no longer runs a crisis detector or speaks a crisis script', () => {
    const client = W('components/OracleConversation.tsx');
    expect(client).not.toMatch(/\bdetectCrisis\s*\(/);
    expect(client).not.toContain('responseScript');
    expect(client).not.toContain('crisisStateRef');
    expect(W('lib/voice/voiceCommands.ts')).not.toMatch(/export function detectCrisis/);
  });

  it('the client renders the server referral on success AND error responses', () => {
    const client = W('components/OracleConversation.tsx');
    expect(client).toContain('buildSafetyReferralMessage(responseData?.safetyReferral)');
    expect(client).toContain('(await response.clone().json().catch(() => null))?.safetyReferral');
  });

  it('the live route attaches the referral to every response after assessment', () => {
    const route = W('app/api/sovereign/app/maia/list/route.ts');
    expect(route.match(/assessCrisisWithCheckIn\(message, takeSafetyCheckIn\(crisisCheckInKey\)\)/g)).toHaveLength(1);
    // Continuation authority is session-bound; a missing sessionId gets no carry.
    expect(route).toContain("const crisisCheckInKey = acceptedSessionId ?? '';");
    expect(route).not.toContain('member:${userId}');
    // Cognition uses the route's assessment, passed as a typed field (never meta).
    expect(route).toMatch(/input: message,\n(?:\s*\/\/.*\n)*\s*crisisAssessment,/);
    // The check-in is held only when MAIA actually asked about safety.
    expect(route).toContain("crisisAssessment.tier === 'ambiguous' && maiaAskedAboutSafety(sovereignText)");
    // Assessment sits below the durable member-turn write (F1 loss window).
    expect(route.indexOf('const crisisAssessment = ')).toBeGreaterThan(route.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn'));
    // success, field-safety boundary, and the four error/timeout responses
    expect(route.match(/\.\.\.\(safetyReferral \? \{ safetyReferral \} : \{\}\)/g)).toHaveLength(6);
  });

  it('safety context is server-authored: a client value is always overwritten', () => {
    const svc = W('lib/sovereign/maiaService.ts');
    expect(svc).toContain('const crisisAssessment = req.crisisAssessment ?? assessCrisis(input);');
    expect(svc).toMatch(/\(meta as Record<string, unknown>\)\.crisisSafetyAddendum =\s*\n\s*crisisAssessment\.tier === 'none' \? undefined : CRISIS_ADDENDUM\[crisisAssessment\.tier\];/);
    // FAST, CORE and the CORE repair regeneration all send through the helper.
    expect(svc.match(/systemPrompt: withCrisisSafety\(/g)).toHaveLength(3);
    // A crisis turn is never served by DEEP, whose builder drops addenda.
    expect(svc).toContain("crisisAssessment.tier !== 'none' && routerResult.profile === 'DEEP' ? 'CORE' : routerResult.profile");
  });

  it('CLEAR requires MAIA to say 988 aloud; AMBIGUOUS requires a direct question', () => {
    expect(CRISIS_ADDENDUM.clear).toMatch(/say the number/i);
    expect(CRISIS_ADDENDUM.ambiguous).toMatch(/ask gently and directly/i);
    expect(CRISIS_ADDENDUM.ambiguous).not.toMatch(/if it fits/i);
  });

  it('only CLEAR copy names a hotline up front; AMBIGUOUS asks first', () => {
    const [beforeConfirm] = CRISIS_ADDENDUM.ambiguous.split('If they confirm');
    expect(beforeConfirm).not.toMatch(/988|741741/);
    expect(CRISIS_ADDENDUM.clear).toMatch(/988/);
  });
});

describe('VOICE-CRISIS-SPEECH-ACT-01 retained: floor ownership', () => {
  it('keeps explicit floor ownership language while exposing Pause to the member', () => {
    const bar = W('components/voice/VoiceInteractionBar.tsx');
    const panel = W('components/settings/VoiceSettingsPanel.tsx');

    expect(bar).toContain('holding your floor');
    expect(bar).toContain('Pause');
    expect(bar).toContain('aria-label="Pause speaking — let MAIA respond"');
    expect(panel).toContain('Pause button');
    expect(panel).toContain('Tap Pause when you want MAIA to respond.');
  });
});
