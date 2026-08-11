/**
 * Journal REACHABILITY guard — the half the drift guard cannot prove.
 *
 * houseNavDrift.test.ts proves a House route is BUNDLED (present in the runtime
 * allowlist and the Capacitor keep-list). Bundling is not reachability. The
 * Journal doorway was bundled the whole time and still dead-ended: /journal was
 * `redirect('/labtools/journal')`, and app/labtools/layout.tsx applies
 * requireFounder(), so an ordinary member tapping Journal in the House landed
 * on a founder refusal screen.
 *
 * WHAT THIS TEST PROVES (structurally, from the real source files):
 *   - /journal is not implemented as a redirect into /labtools;
 *   - the House Journal destination points at /journal;
 *   - no layout on the /journal segment chain applies a founder/admin gate;
 *   - Ideas and Changes are present for an ordinary member;
 *   - Decisions obeys the existing audience rule;
 *   - /journal is still in the native bundle;
 *   - one implementation backs both Journal entry points.
 *
 * WHAT IT DOES NOT PROVE: nothing about production authentication, session
 * cookies, middleware, the access matrix at runtime, or any redirect issued by
 * a server at request time. It is a source-shape guard, not a browser walk.
 * The member device walk remains the acceptance test.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { HOUSE_DESTINATIONS, getHouseDestinations } from '../houseDestinations';
import { isMobileRoute } from '@/lib/mobile/mobileAllowlist';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

const MEMBER_JOURNAL_PAGE = 'app/journal/page.tsx';
const SHARED_VIEW = 'components/journal/UnifiedJournalView.tsx';
const LABTOOLS_JOURNAL_PAGE = 'app/labtools/journal/page.tsx';

/**
 * Comments describe history; code is what ships. Strip comments before shape
 * checks so a docstring recording the old defect cannot read as the defect.
 */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** The exact defect shape: this route hands the member off into /labtools. */
function redirectsIntoLabtools(source: string): boolean {
  return /redirect\s*\(\s*['"`]\/labtools/.test(code(source));
}

/** The founder/admin gate, as app/labtools/layout.tsx actually expresses it. */
function appliesFounderGate(source: string): boolean {
  return /requireFounder|FounderGateScreen|requireAdmin/.test(source);
}

/** Every layout.tsx from app/ down to the segment holding `pageRel`. */
function ancestorLayouts(pageRel: string): string[] {
  const segs = path.dirname(pageRel).split('/'); // e.g. ['app','journal']
  const found: string[] = [];
  for (let i = 1; i <= segs.length; i++) {
    const candidate = path.join(...segs.slice(0, i), 'layout.tsx');
    if (existsSync(path.join(REPO, candidate))) found.push(candidate);
  }
  return found;
}

// ── the detectors are not vacuous ────────────────────────────────────────────
describe('detector sanity — these would have caught the pre-fix state', () => {
  it('flags the pre-fix /journal implementation', () => {
    // This is verbatim what app/journal/page.tsx contained before 2026-07-28.
    const preFix = [
      "import { redirect } from 'next/navigation';",
      '',
      'export default function JournalRedirect() {',
      "  redirect('/labtools/journal');",
      '}',
    ].join('\n');
    expect(redirectsIntoLabtools(preFix)).toBe(true);
  });

  it('recognises the founder gate where it really lives', () => {
    expect(appliesFounderGate(read('app/labtools/layout.tsx'))).toBe(true);
  });
});

// ── 1 + 3: the member Journal is a real route outside the gate ───────────────
describe('the member Journal route', () => {
  it('exists', () => {
    expect(existsSync(path.join(REPO, MEMBER_JOURNAL_PAGE))).toBe(true);
  });

  it('is NOT a redirect into /labtools', () => {
    expect(redirectsIntoLabtools(read(MEMBER_JOURNAL_PAGE))).toBe(false);
  });

  it('lives outside the /labtools segment', () => {
    expect(MEMBER_JOURNAL_PAGE.startsWith('app/labtools/')).toBe(false);
  });

  it('inherits no founder-gated layout on its segment chain', () => {
    const gated = ancestorLayouts(MEMBER_JOURNAL_PAGE).filter((rel) =>
      appliesFounderGate(read(rel)),
    );
    expect(gated).toEqual([]);
  });

  it('renders the Journal Room, and renders it rather than re-implementing it', () => {
    // CUTOVER (2026-08-11): /journal serves the Journal Room. Assert against
    // code, not the file — the previous version of this test matched
    // `UnifiedJournalView` anywhere in the source, so a page that merely
    // MENTIONED the old view in a comment passed while rendering something
    // else entirely. A guard that a docstring can satisfy is not a guard.
    const page = code(read(MEMBER_JOURNAL_PAGE));
    expect(page).toMatch(/JournalRoom/);
    expect(page).not.toMatch(/UnifiedJournalView/);
    // A page that re-implemented the room would not be this small.
    expect(read(MEMBER_JOURNAL_PAGE).split('\n').length).toBeLessThan(60);
  });
});

// ── 2: the House points at it ────────────────────────────────────────────────
describe('the House Journal destination', () => {
  const journal = HOUSE_DESTINATIONS.find((d) => d.id === 'journal');

  it('exists and routes to /journal', () => {
    expect(journal).toBeDefined();
    expect(journal!.route).toBe('/journal');
  });

  it('never routes into /labtools', () => {
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind === 'route' && d.route) {
        expect(d.route.startsWith('/labtools')).toBe(false);
      }
    }
  });

  it('is offered to ordinary members', () => {
    expect(getHouseDestinations(false).map((d) => d.id)).toContain('journal');
  });
});

// ── 4 + 5: the rest of the member-visible House model ────────────────────────
describe('House destinations for an ordinary member', () => {
  const member = getHouseDestinations(false).map((d) => d.id);
  const founder = getHouseDestinations(true).map((d) => d.id);

  it('shows Ideas and Changes', () => {
    expect(member).toContain('ideas');
    expect(member).toContain('changes');
  });

  it('has no Decisions destination for any audience', () => {
    // Superseding ruling (2026-07-28): Decisions is a practitioner capability
    // and is not part of the member House grammar at all — including for a
    // practitioner using the member House. The 2026-07-27 'founder' audience
    // gate is superseded. Ruling recorded in PR #785 (Supersession section); no repo canon doc records it yet — do not cite one.
    expect(HOUSE_DESTINATIONS.find((d) => d.id === 'decisions')).toBeUndefined();
    expect(member).not.toContain('decisions');
    expect(founder).not.toContain('decisions');
  });
});

// ── 6: still bundled natively ────────────────────────────────────────────────
describe('native bundling of the member Journal', () => {
  const shell = read('scripts/capacitor-patch-routes.sh');
  const topLevel = (() => {
    const m = shell.match(/MOBILE_TOP_LEVEL=\(([^)]*)\)/);
    return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
  })();

  it('is in the runtime mobile allowlist', () => {
    expect(isMobileRoute('/journal')).toBe(true);
  });

  it('is kept in the Capacitor native bundle', () => {
    expect(topLevel).toContain('journal');
  });
});

// ── 7: one implementation, two entry points ──────────────────────────────────
describe('what the cutover changed, and what it preserved', () => {
  // Before 2026-08-11 both entry points rendered ONE implementation. They no
  // longer do, deliberately: /journal is the member's accepted Journal Room,
  // and /labtools/journal keeps the legacy view so the cutover deletes nothing
  // and founders can still compare. Asserting sameness here would now be
  // asserting a fiction.
  it('the member route serves the Room', () => {
    expect(code(read(MEMBER_JOURNAL_PAGE))).toMatch(/JournalRoom/);
  });

  it('the legacy view is preserved, not deleted, behind the founder entry point', () => {
    expect(existsSync(path.join(REPO, SHARED_VIEW))).toBe(true);
    expect(code(read(LABTOOLS_JOURNAL_PAGE))).toMatch(/UnifiedJournalView/);
    expect(read(SHARED_VIEW).split('\n').length).toBeGreaterThan(500);
    expect(read(LABTOOLS_JOURNAL_PAGE).split('\n').length).toBeLessThan(60);
  });

  it('the Room is one implementation, not a copy per entry point', () => {
    // Exactly one page renders JournalRoom besides the room's own route.
    const roomRoute = code(read('app/journal/room/page.tsx'));
    expect(roomRoute).toMatch(/JournalRoom/);
    expect(code(read(MEMBER_JOURNAL_PAGE))).toMatch(/from '@\/components\/journal\/room\/JournalRoom'/);
  });

  it('the shared view never hard-codes a /labtools return', () => {
    // The back destination belongs to the entry point, via backHref.
    expect(code(read(SHARED_VIEW))).not.toMatch(/router\.push\(\s*['"`]\/labtools['"`]\s*\)/);
  });
});
