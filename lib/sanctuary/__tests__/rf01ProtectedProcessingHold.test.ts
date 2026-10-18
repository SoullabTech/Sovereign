/**
 * RF01 S1-A — no representation of privacy by storage flags alone.
 * Fictional/local tests; source-order guard supplements running physical
 * acceptance, not evidence of a network-isolated production model.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import {
  SANCTUARY_PROCESSING_HOLD, SanctuaryProcessingUnqualified,
  requireQualifiedConversationProcessing, protectedProcessingRefusal,
} from '../processingQualification';

const source = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');
const listRoute = source('app/api/sovereign/app/maia/list/route.ts');
const betweenRoute = source('app/api/between/chat/route.ts');
const maiaService = source('lib/sovereign/maiaService.ts');
const web = source('components/OracleConversation.tsx');
const desktop = source('maia-desktop/src/conversation.js');

describe('RF01 S1-A hard processing refusal', () => {
  it('does not treat Sanctuary non-storage as model processing authority', () => {
    expect(() => requireQualifiedConversationProcessing({ sanctuary: true }))
      .toThrow(SanctuaryProcessingUnqualified);
  });
  it('preserves the existing ordinary processing path for separately released gates', () => {
    expect(() => requireQualifiedConversationProcessing({ sanctuary: false }))
      .not.toThrow();
  });
  it('client-claimed processing flags cannot bypass the hard hold', () => {
    expect(() => requireQualifiedConversationProcessing({
      sanctuary: true,
      ...({ externalProcessing: true, allowRemote: true, memoryMode: 'continuity' } as object),
    })).toThrow(SanctuaryProcessingUnqualified);
  });
  it('refusal returns only fixed generic text and an explicit hold signal', () => {
    const response = protectedProcessingRefusal();
    expect(response.error).toBe(SANCTUARY_PROCESSING_HOLD);
    expect(response.action).toBe('WAIT_FOR_VERIFIED_PRIVATE_PROCESSING');
    expect(JSON.stringify(response)).not.toContain('FICTIONAL_PRIVATE_CANARY');
  });
});

describe('RF01 S1-A server source authority boundaries', () => {
  it('canonical route refuses protected turns after verified receipt but before first F1 write', () => {
    const verified = listRoute.indexOf('const privacyAuthority = await verifyExplicitTurnConsent');
    const hold = listRoute.indexOf('requireQualifiedConversationProcessing({ sanctuary: isSanctuary })');
    const F1 = listRoute.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn');
    const model = listRoute.indexOf('getMaiaResponse({', F1);
    expect(verified).toBeGreaterThan(0);
    expect(hold).toBeGreaterThan(verified);
    expect(F1).toBeGreaterThan(hold);
    expect(model).toBeGreaterThan(F1);
  });
  it('Between route refuses before active metadata and memory context', () => {
    const verified = betweenRoute.indexOf('const consent = await verifyExplicitTurnConsent');
    const hold = betweenRoute.indexOf('requireQualifiedConversationProcessing({ sanctuary: isSanctuary })');
    const active = betweenRoute.indexOf('await touchActiveSession(', verified);
    const history = betweenRoute.indexOf('let conversationHistory = await getConversationHistory');
    expect(hold).toBeGreaterThan(verified);
    expect(hold).toBeLessThan(active);
    expect(hold).toBeLessThan(history);
  });
  it('the shared MAIA responder itself refuses before consent audit and turn counting', () => {
    const start = maiaService.indexOf('export async function getMaiaResponse(');
    const posture = maiaService.indexOf('const turnPosture =',start);
    const hold = maiaService.indexOf('requireQualifiedConversationProcessing(',start);
    const audit = maiaService.indexOf('recordConsentState({',start);
    const count = maiaService.indexOf('await incrementTurnCount(',start);
    expect(start).toBeGreaterThan(0);
    expect(hold).toBeGreaterThan(posture);
    expect(hold).toBeLessThan(audit);
    expect(hold).toBeLessThan(count);
  });
  it('neither conversation route silently infers a durable name change', () => {
    expect(listRoute).not.toContain('processNameChangeIfDetected(');
    expect(betweenRoute).not.toContain('processNameChangeIfDetected(');
  });
  it('no full database URL or memory-context excerpt is written to route logs', () => {
    expect(maiaService).not.toContain('db: process.env.DATABASE_URL');
    expect(listRoute).not.toContain('memoryContext.slice(0, 300)');
    expect(betweenRoute).not.toContain("console.log('[Chat API] 📦 Normalized meta:', normalizedMeta)");
  });
  it('response-shape telemetry does not run for sanctuary in the shared responder', () => {
    expect(maiaService).toContain('if (telemetryEnabled && !isRewritePass && !isSanctuary)');
  });
});

describe('RF01 S1-A client non-use', () => {
  it('web Send refuses Sanctuary before the content-free preflight request', () => {
    const handler = web.indexOf('const handleTextMessage = useCallback');
    const refuse = web.indexOf("privacyChoiceRef.current === 'sanctuary'",handler);
    const preflight = web.indexOf("apiFetch('/api/sovereign/privacy/turn-consent'",handler);
    const send = web.indexOf('apiFetch(apiEndpoint',handler);
    expect(refuse).toBeGreaterThan(handler);
    expect(refuse).toBeLessThan(preflight);
    expect(preflight).toBeLessThan(send);
  });
  it('native explicit Sanctuary cannot be reported as ready or leave through ask()', () => {
    expect(desktop).toContain("ready: choice === 'continuity' && canonicalThreadVerified");
    const ask = desktop.indexOf('async function ask(message)');
    const hold = desktop.indexOf("if (choice === 'sanctuary')",ask);
    const preflight = desktop.indexOf('session.authedFetch(CONSENT_PATH',ask);
    expect(hold).toBeGreaterThan(ask);
    expect(hold).toBeLessThan(preflight);
  });
});
