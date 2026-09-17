/**
 * EAA-03 / P1 — the Home Arrival surface, its containment, and its restraint.
 *
 * Two kinds of assertion, both deliberate:
 *
 *  1. BEHAVIOURAL, against the pure display module — provenance phrasing and
 *     date truthfulness are real functions and are tested as such.
 *
 *  2. STRUCTURAL, against source text — the repository's jest runs in a node
 *     environment on *.test.ts only and has no React renderer, so the surface's
 *     architecture is pinned the way RELATIONSHIPS-UX-01 pins its own
 *     (app/relationships/__tests__/relationshipsUxArchitecture.test.ts). These
 *     assertions are about what the composition may and may not contain, which
 *     is exactly what a rendering test would not tell us anyway.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { formatKeptAt, sourcePhrase, SOURCE_PHRASE } from '@/lib/maia/field-now/display';

/**
 * Strip comments before scanning.
 *
 * This is not tidiness, it is the C21 lesson from the Circles verifier: a file
 * that DOCUMENTS its own compliance ("this route never reads
 * living_field_affinities") will fail a raw-source scan for the very phrase it
 * exists to disclaim. A prose ban must never read as the banned behaviour
 * returning. Same discipline as the C6 / C21 scanners.
 *
 * `\s+//` cannot match a URL, because `https://` carries a colon before the
 * slashes rather than whitespace.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments, incl. JSX {/* ... *\/}
    .replace(/^\s*\/\/[^\n]*$/gm, '')     // whole-line comments
    .replace(/\s+\/\/[^\n]*$/gm, '');     // trailing comments
}

const read = (rel: string) => stripComments(readFileSync(join(process.cwd(), rel), 'utf8'));
const surface = read('components/maia/prototype/FieldNowArrival.tsx');
const shell = read('components/maia/prototype/ArrivalPrototypeShell.tsx');
const page = read('app/maia/prototype/page.tsx');
const capacitor = read('scripts/capacitor-patch-routes.sh');
const route = read('app/api/maia/field-now/route.ts');

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · provenance is told truthfully or not at all', () => {
  it('names a source only where the repository establishes one', () => {
    expect(sourcePhrase('idea')).toBe('From your Ideas');
    expect(sourcePhrase('session_excerpt')).toBe('From a conversation with MAIA');
    expect(sourcePhrase('spontaneous')).toBe('You wrote this directly');
  });

  it('omits the source for the stub bridges rather than asserting a link', () => {
    // 20260521000001 marks these "source bridge stub for now".
    expect(sourcePhrase('journal')).toBeNull();
    expect(sourcePhrase('dream')).toBeNull();
    expect(sourcePhrase('reflection')).toBeNull();
  });

  it('omits the source for block-scoped types no short phrase names truthfully', () => {
    expect(sourcePhrase('idea_block')).toBeNull();
    expect(sourcePhrase('decision')).toBeNull();
    expect(sourcePhrase('change')).toBeNull();
  });

  it('invents nothing for an unknown source type', () => {
    expect(sourcePhrase('something_new')).toBeNull();
    expect(Object.keys(SOURCE_PHRASE)).toHaveLength(3);
  });

  it('states the Keep date as the member’s own act', () => {
    const now = new Date('2026-09-17T12:00:00Z');
    expect(formatKeptAt(new Date('2026-09-16T10:00:00Z'), now)).toBe('Kept September 16');
  });

  it('carries the year when the Keep was not made this year', () => {
    const now = new Date('2026-09-17T12:00:00Z');
    expect(formatKeptAt(new Date('2025-09-16T10:00:00Z'), now)).toBe('Kept September 16, 2025');
  });

  it('says nothing at all when the timestamp is unusable', () => {
    expect(formatKeptAt('not-a-date')).toBe('');
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · the first viewport', () => {
  it('opens with presence and an invitation, in the authorized words', () => {
    expect(surface).toContain('Here you are.');
    expect(surface).toContain('What feels present?');
    expect(surface).toContain("Say what&apos;s here…");
  });

  it('adds no interpretive framing of the member', () => {
    for (const forbidden of [
      'Your insights', 'What MAIA noticed', 'Your patterns', 'Your emotional state',
      'Your elemental balance', 'Recommended for you', 'Suggested', 'Because you',
    ]) {
      expect(surface).not.toContain(forbidden);
    }
  });

  it('renders no MAIA greeting and no avatar at the centre', () => {
    expect(surface).not.toContain('generateWelcomeGreeting');
    expect(surface).not.toMatch(/avatar/i);
    // The centre is decorative-only to assistive tech: it carries no meaning
    // that is not also present as text.
    expect(surface).toContain('aria-hidden="true"');
  });

  it('shows no element labels or elemental colour coding', () => {
    for (const el of ['Fire', 'Water', 'Earth', 'Air', 'Aether']) {
      expect(surface).not.toContain(`>${el}<`);
    }
    expect(surface).not.toMatch(/elementalLens|dominant_element|elemental_lenses/);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · a thread means only "you chose to keep this"', () => {
  it('displays the member’s own title, never a generated one', () => {
    expect(surface).toContain('{thread.title}');
    expect(surface).not.toMatch(/summar|classif|infer|generateTitle|llm|claude|anthropic/i);
  });

  it('gives every thread identical visual weight', () => {
    // Identical width, identical distance below the centre, identical styling.
    // Only left-to-right order differs, and that order is the chronology of the
    // member's own Keep acts — which the provenance line states outright.
    expect(surface).toContain('<li className="w-[14.5rem] shrink-0">');
    expect(surface).toContain('items-start justify-center gap-6');
    // The renderer cannot even SEE a thread's position: no index, no total.
    expect(surface).toContain('function Thread({ thread, reduced }');
    expect(surface).not.toMatch(/index/);
  });

  it('never ranks, scores or weights a thread', () => {
    for (const forbidden of ['affinity', 'score', 'salience', 'importance', 'weight', 'relevance']) {
      expect(surface.toLowerCase()).not.toContain(forbidden);
    }
  });

  it('renders presences, not dashboard cards', () => {
    // No border and no fill AT REST; a faint wash appears only on hover/focus.
    // Scoped to the Thread component: the beginning threshold below the centre
    // keeps its outline deliberately, because it is a doorway and should read
    // as one.
    const threadBody = surface.slice(
      surface.indexOf('function Thread({'),
      surface.indexOf('export default function FieldNowArrival'),
    );
    expect(threadBody).toContain("background: open ? 'rgba(255,255,255,0.045)' : 'transparent'");
    expect(threadBody).not.toMatch(/border:\s*'1px solid/);
  });

  it('bounds the field to three', () => {
    expect(surface).toContain('.slice(0, 3)');
  });

  it('renders nothing at all when there is nothing kept', () => {
    // Zero is a complete state: no placeholder, no sample, no empty-state card.
    expect(surface).toContain('{threads.length > 0 && (');
    expect(surface).not.toMatch(/placeholder(Thread|Keep)|sampleData|demo(Keep|Thread)|Nothing here yet/i);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · accessibility', () => {
  it('makes each thread keyboard-reachable with a visible focus ring', () => {
    expect(surface).toContain('<button');
    expect(surface).toContain('focus-visible:ring');
  });

  it('exposes provenance to assistive tech, not only on hover', () => {
    expect(surface).toContain('aria-describedby={provenanceId}');
    expect(surface).toContain('aria-expanded={open}');
    // Revealed by focus and by tap, not by pointer alone.
    expect(surface).toContain('onFocus=');
    expect(surface).toContain('onClick={() => setRevealed');
  });

  it('gives the field a heading and the thread list a name', () => {
    expect(surface).toContain('<h1');
    expect(surface).toContain('aria-label="Things you chose to keep"');
  });

  it('respects reduced motion, and carries no meaning in motion', () => {
    expect(surface).toContain('usePrefersReducedMotion');
    expect(surface).toContain("transition: reduced ? 'none'");
    // With motion disabled the content is present immediately, not faded in.
    expect(surface).toContain('opacity: entered || reduced ? 1 : 0');
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · the beginning affordance creates no second authority', () => {
  it('enters the existing canonical MAIA surface', () => {
    expect(surface).toContain("router.push('/maia')");
  });

  it('does not offer a text field that would discard what the member typed', () => {
    // P1-D §XVI outcome B: no prefill seam exists (composerDraft is set only
    // from in-component sources), so the threshold is a doorway, not a composer.
    expect(surface).not.toContain('ModernTextInput');
    expect(surface).not.toContain('<textarea');
    expect(surface).not.toContain('<input');
  });

  it('writes no message and posts nothing', () => {
    expect(surface).not.toMatch(/method:\s*'POST'/);
    expect(surface).not.toContain('sendMessage');
  });

  it('touches no voice authority', () => {
    for (const v of ['VoiceKernel', 'TurnCoordinator', 'useVoice', 'getUserMedia', 'SpeechRecognition', 'maiaSpeak']) {
      expect(surface).not.toContain(v);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · prototype membrane is unchanged', () => {
  it('remains behind the default-OFF flag and the role gate', () => {
    expect(page).toContain('flags.arrivalPrototype && (isFounder || DEV_MODE)');
    expect(page).toContain("This surface isn&apos;t available.");
  });

  it('is reached through the existing prototype route, not a new one', () => {
    expect(shell).toContain("import FieldNowArrival from './FieldNowArrival'");
    expect(shell).toContain("{view === 'fieldnow' && <FieldNowArrival />}");
    expect(shell).toContain("{ id: 'fieldnow', label: 'Your Field Now · P1' }");
  });

  it('keeps the existing iOS exclusion of the prototype route', () => {
    expect(capacitor).toContain('"app/maia/prototype"');
  });

  it('leaves the House and its destinations alone', () => {
    expect(surface).not.toContain('HOUSE_DESTINATIONS');
    expect(surface).not.toContain('MAIA_WORLDS');
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('P1 · the read is credential-bound and read-only', () => {
  it('resolves the member from a verified credential, not a bare header', () => {
    expect(route).toContain('getMemberIdFromRequest');
    expect(route).not.toContain('probeAuthPosture');
    expect(route).toContain("{ error: 'Unauthorized' }, { status: 401 }");
  });

  it('exposes only GET', () => {
    expect(route).toContain('export async function GET');
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(route).not.toContain(`export async function ${m}`);
    }
  });

  it('never reaches living_field_affinities', () => {
    expect(route).not.toContain('living_field_affinities');
    expect(surface).not.toContain('living_field');
    expect(surface).not.toContain('affinit');
  });

  it('answers an error with the valid empty field, never a partial one', () => {
    expect(route).toContain('return NextResponse.json({ threads: [] })');
  });
});
