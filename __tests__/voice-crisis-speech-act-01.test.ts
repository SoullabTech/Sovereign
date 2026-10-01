import { readFileSync } from 'fs';
import { join } from 'path';
import { assessCrisis, CRISIS_ADDENDUM } from '@/lib/safety/crisisAssessment';
import { ALL_CASES } from '@/lib/safety/__fixtures__/crisisCorpus';

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
    expect(route.match(/assessCrisis\(message\)/g)).toHaveLength(1);
    // success, field-safety boundary, and the four error/timeout responses
    expect(route.match(/\.\.\.\(safetyReferral \? \{ safetyReferral \} : \{\}\)/g)).toHaveLength(6);
  });

  it('safety context is server-authored: a client value is always overwritten', () => {
    const svc = W('lib/sovereign/maiaService.ts');
    expect(svc).toContain('const crisisAssessment = assessCrisis(input);');
    expect(svc).toMatch(/\(meta as Record<string, unknown>\)\.crisisSafetyAddendum =\s*\n\s*crisisAssessment\.tier === 'none' \? undefined : CRISIS_ADDENDUM\[crisisAssessment\.tier\];/);
    // FAST, CORE and the CORE repair regeneration all send through the helper.
    expect(svc.match(/systemPrompt: withCrisisSafety\(/g)).toHaveLength(3);
    // A crisis turn is never served by DEEP, whose builder drops addenda.
    expect(svc).toContain("crisisAssessment.tier !== 'none' && routerResult.profile === 'DEEP' ? 'CORE' : routerResult.profile");
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
