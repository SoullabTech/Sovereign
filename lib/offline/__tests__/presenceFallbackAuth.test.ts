/**
 * @jest-environment node
 *
 * Founder ruling, 2026-11-18: when a turn does not reach MAIA, the app says so plainly.
 * It keeps the member's words and never writes or speaks a reply in MAIA's voice.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { UNDELIVERED_NOTICE } from '../presenceFallback';

const source = readFileSync(join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8');

function failureBranch(marker: string): string {
  const start = source.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('return;', start));
}

describe('undelivered MAIA turns', () => {
  it('states plainly that MAIA did not receive the message', () => {
    expect(UNDELIVERED_NOTICE).toBe("MAIA couldn't receive this. Your words are still here.");
  });

  it('no longer generates a canned MAIA reply in the conversation', () => {
    expect(source).not.toContain('generatePresenceFallback(');
    expect(source).not.toContain('isFallback: true');
  });

  it.each([
    ['offline', 'if (!isProbablyOnline()) {', "'network'"],
    ['network failure', '} catch (fetchError) {', "'network'"],
    ['server failure', 'const isSignedOut = response.status === 401;', "isSignedOut ? 'auth' : 'server'"],
  ])('%s keeps the turn, labels it and stays silent', (_name, marker, reason) => {
    const branch = failureBranch(marker);
    expect(branch).toContain(`markFailed(prev, targetMessageId, ${reason})`);
    expect(branch).toContain('setInputSubmitError(');
    expect(branch).toContain('setIsResponding(false)');
    expect(branch).not.toContain('handleSpeakMessage');
    expect(branch).not.toContain("role: 'oracle'");
  });

  it('does not add an error line under MAIA when sending throws', () => {
    const start = source.indexOf('// Provide specific error messages based on error type');
    const branch = source.slice(start, source.indexOf('} finally {', start));
    expect(branch).toContain('setInputSubmitError(errorText)');
    expect(branch).not.toContain("role: 'oracle'");
  });

  it('names MAIA in the persistent failed-turn label', () => {
    expect(source).toContain('>Not delivered to MAIA</span>');
  });

  // Founder ruling, 2026-11-19: the label survives reopening, on this device only.
  it('saves the failed label with the conversation cache', () => {
    expect(source).toContain('const messagesToStore = persistableDelivery(messages.slice(-50));');
    expect(source).not.toContain('stripDelivery(');
  });

  it('keeps undelivered turns out of the history sent to MAIA', () => {
    const fn = source.slice(source.indexOf('function truncateHistoryForAPI('), source.indexOf('// Scribe session context'));
    expect(fn).toContain('excludeUndelivered(historicalMessages, currentMessages)');
  });

  it('keeps device-only failed turns when server history replaces the cache', () => {
    expect(source).toContain('mergeUndeliveredIntoServerHistory(pgMessages, loadedMessages)');
  });

  it('offers Resend after a sign-in failure, since the label outlives the sign-in', () => {
    const label = source.slice(source.indexOf('>Not delivered to MAIA</span>'), source.indexOf('MAIA Feedback Widget'));
    expect(label).toContain('Sign in to continue');
    expect(label).toContain('handleResend(message.id)');
    expect(label).not.toMatch(/\) : \(\s*<button/);
  });

  it('opens sign-in through the app router so the native app can reach it', () => {
    const link = source.slice(source.indexOf('href="/signin"'), source.indexOf('Sign in to continue\n'));
    expect(link).toContain('e.preventDefault()');
    expect(link).toContain("router.push('/signin')");
  });
});
