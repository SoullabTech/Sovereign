/**
 * Journal capture deep-link guard.
 *
 * Covers the behaviour contract of /maia?journal=1 (Kelly ruling 2026-07-28):
 * open the existing capture sheet once, strip the parameter so it cannot
 * reopen, leave ordinary /maia untouched — plus structural assertions that both
 * ends are actually wired to the shared contract rather than a literal string.
 *
 * WHAT THIS PROVES: the decision logic, the URL rewriting, and that producer and
 * consumer import the same contract.
 * WHAT IT DOES NOT PROVE: that React actually mounted the sheet, or anything
 * about how it renders. That is the device walk.
 */
import { readFileSync } from 'fs';
import path from 'path';
import {
  JOURNAL_CAPTURE_HREF,
  shouldOpenJournalCapture,
  urlWithoutJournalParam,
} from '../journalDeepLink';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

const sp = (q: string) => new URLSearchParams(q);

describe('shouldOpenJournalCapture', () => {
  it('opens on the exact opt-in value', () => {
    expect(shouldOpenJournalCapture(sp('journal=1'))).toBe(true);
  });

  it('leaves ordinary /maia untouched', () => {
    expect(shouldOpenJournalCapture(sp(''))).toBe(false);
    expect(shouldOpenJournalCapture(null)).toBe(false);
    expect(shouldOpenJournalCapture(undefined)).toBe(false);
    expect(shouldOpenJournalCapture(sp('panel=journey'))).toBe(false);
  });

  it('refuses to open a sheet on anything but the explicit opt-in', () => {
    // A bare or falsy parameter is not an instruction to interrupt the member.
    expect(shouldOpenJournalCapture(sp('journal'))).toBe(false);
    expect(shouldOpenJournalCapture(sp('journal=0'))).toBe(false);
    expect(shouldOpenJournalCapture(sp('journal=true'))).toBe(false);
  });
});

describe('urlWithoutJournalParam — the sheet cannot reopen', () => {
  it('strips the trigger, leaving a bare path', () => {
    expect(urlWithoutJournalParam(sp('journal=1'), '/maia')).toBe('/maia');
  });

  it('preserves other parameters', () => {
    expect(urlWithoutJournalParam(sp('journal=1&panel=journey'), '/maia'))
      .toBe('/maia?panel=journey');
    expect(urlWithoutJournalParam(sp('panel=journey&journal=1'), '/maia'))
      .toBe('/maia?panel=journey');
  });

  it('defaults to /maia when pathname is unavailable', () => {
    expect(urlWithoutJournalParam(sp('journal=1'), null)).toBe('/maia');
    expect(urlWithoutJournalParam(sp('journal=1'), undefined)).toBe('/maia');
  });

  it('the stripped URL no longer triggers an open — no loop, no reopen', () => {
    const after = urlWithoutJournalParam(sp('journal=1&panel=journey'), '/maia');
    const query = after.includes('?') ? after.split('?')[1] : '';
    expect(shouldOpenJournalCapture(sp(query))).toBe(false);
  });

  it('is idempotent — re-running on already-clean state changes nothing', () => {
    expect(urlWithoutJournalParam(sp(''), '/maia')).toBe('/maia');
  });
});

describe('the href the Journal points at', () => {
  it('is a /maia deep link carrying the trigger', () => {
    expect(JOURNAL_CAPTURE_HREF).toBe('/maia?journal=1');
    const query = JOURNAL_CAPTURE_HREF.split('?')[1];
    expect(shouldOpenJournalCapture(sp(query))).toBe(true);
  });

  it('is not a bare /maia — that was the defect', () => {
    expect(JOURNAL_CAPTURE_HREF).not.toBe('/maia');
  });
});

describe('both ends are wired to the shared contract', () => {
  const journalView = read('components/journal/UnifiedJournalView.tsx');
  const maiaPage = read('app/maia/page.tsx');

  it('the Journal "New Entry" control uses the shared href, not a literal', () => {
    expect(journalView).toMatch(/JOURNAL_CAPTURE_HREF/);
    expect(journalView).toMatch(/router\.push\(JOURNAL_CAPTURE_HREF\)/);
  });

  it('regression: "New Entry" no longer pushes bare /maia', () => {
    // The pre-fix line was `onClick={() => router.push('/maia')}` directly above
    // the New Entry label. Assert that exact pairing is gone.
    const newEntryBlock = journalView.slice(
      Math.max(0, journalView.indexOf('New Entry') - 600),
      journalView.indexOf('New Entry'),
    );
    expect(newEntryBlock).not.toMatch(/router\.push\(\s*['"`]\/maia['"`]\s*\)/);
  });

  it('/maia consumes the shared predicate and strips via the shared helper', () => {
    expect(maiaPage).toMatch(/shouldOpenJournalCapture\(searchParams\)/);
    expect(maiaPage).toMatch(/urlWithoutJournalParam\(searchParams, pathname\)/);
  });

  it('/maia replaces rather than pushes, so Back does not re-enter', () => {
    expect(maiaPage).toMatch(
      /router\.replace\(urlWithoutJournalParam\(searchParams, pathname\)/,
    );
  });

});
