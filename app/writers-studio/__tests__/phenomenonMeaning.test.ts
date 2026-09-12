import * as fs from 'fs';
import * as path from 'path';
import {
  DEVELOPMENTAL_PHENOMENA, PHENOMENON_DEFINITION, PHENOMENON_LABEL,
} from '@/lib/manuscript/developmentalReading/contract';

/**
 * RENAISSANCE TEST 3 — the phenomenon label is explainable IN PLACE.
 *
 * THE FAILURE. The Develop room showed the member a word — `positional
 * asymmetry`, `register shift`, `term drift`, `prospective reference`,
 * `re-explanation / first-mention` — and nothing else. Five of the eight
 * presume literary training. The definitions existed (WS2-07-F1, founder act
 * 2026-09-04) and reached only the classifier: no `.tsx` in the repository
 * referenced `PHENOMENON_DEFINITION` at all. A writer without an MFA was
 * required to already know the vocabulary MAIA was using to help them learn.
 *
 * THE REPAIR IS RENDER ONLY. No phenomenon was added, retired or redefined.
 * The same object the classifier is given is now reachable by the member,
 * beneath the label, in one gesture.
 *
 * WHY A BUTTON AND NOT A TOOLTIP. Hover fails touch devices and keyboard
 * users — which is to say it fails exactly the population this test is about.
 *
 * WHY THIS TEST READS THE SOURCE. The room is a client component in a node
 * test environment; what is falsifiable here is the STRUCTURE of the gesture —
 * that the definition is referenced rather than restated, that the trigger is
 * a real control, that closing returns the writer to the word they asked
 * about, and that an unrecognised name cannot acquire copy. The behavioural
 * half is falsified in developPresentation.test.ts, upstream of the JSX.
 */

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const roomSource = fs.readFileSync(path.join(__dirname, '..', 'develop', 'DevelopRoom.tsx'), 'utf8');
const room = strip(roomSource);
const presentation = strip(
  fs.readFileSync(path.join(__dirname, '..', '..', '..', 'lib', 'writersStudio', 'developPresentation.ts'), 'utf8'),
);

/** Every place in the app a member could meet a phenomenon label. */
function labelSites(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== 'node_modules' && e.name !== '__tests__') walk(p);
      } else if (e.name.endsWith('.tsx')) {
        if (strip(fs.readFileSync(p, 'utf8')).includes('phenomenonLabel')) out.push(p);
      }
    }
  };
  walk(path.join(__dirname, '..'));
  return out;
}

describe('the definition is the contract’s, not a second copy of it', () => {
  it('the room restates no definition prose', () => {
    for (const p of DEVELOPMENTAL_PHENOMENA) {
      for (const clause of [PHENOMENON_DEFINITION[p].is, PHENOMENON_DEFINITION[p].isNot]) {
        // The longest clause-free run is distinctive enough to catch a paste.
        const longest = clause.split(/[;,.]/).map((c) => c.trim()).sort((a, b) => b.length - a.length)[0];
        expect(longest.length).toBeGreaterThan(20);
        expect(room).not.toContain(longest);
      }
    }
  });

  it('the presentation carries the contract object through by reference', () => {
    expect(presentation).toMatch(/PHENOMENON_DEFINITION\[p\]/);
    expect(presentation).toMatch(/phenomenonMeaning\?: PhenomenonDefinition/);
    // The room renders the fields; it never authors their content.
    expect(room).toMatch(/o\.phenomenonMeaning\.is\b/);
    expect(room).toMatch(/o\.phenomenonMeaning\.isNot\b/);
  });

  it('no phenomenon was added, retired or renamed by this repair', () => {
    expect(DEVELOPMENTAL_PHENOMENA).toHaveLength(8);
    expect(Object.keys(PHENOMENON_DEFINITION).sort()).toEqual([...DEVELOPMENTAL_PHENOMENA].sort());
    expect(Object.keys(PHENOMENON_LABEL).sort()).toEqual([...DEVELOPMENTAL_PHENOMENA].sort());
  });
});

describe('the explanation is reachable by mouse, keyboard and touch', () => {
  it('every surface that shows a label makes it a real control', () => {
    const sites = labelSites();
    expect(sites.length).toBeGreaterThan(0);
    for (const site of sites) {
      const src = strip(fs.readFileSync(site, 'utf8'));
      expect(src).toMatch(/data-phenomenon-trigger/);
      expect(src).toMatch(/data-phenomenon-meaning/);
    }
  });

  it('the trigger is a button — not a hover target, not a div', () => {
    const trigger = room.slice(room.indexOf('data-phenomenon-trigger') - 500, room.indexOf('data-phenomenon-trigger'));
    expect(trigger).toMatch(/<button/);
    expect(trigger).toMatch(/type="button"/);
    expect(trigger).toMatch(/onClick=/);
    expect(trigger).not.toMatch(/onMouseEnter|onMouseOver|title=/);
  });

  it('it announces its own state to assistive technology', () => {
    expect(room).toMatch(/aria-expanded=\{meaning\}/);
    expect(room).toMatch(/aria-controls=\{meaningId\}/);
    expect(room).toMatch(/id=\{meaningId\}/);
  });
});

describe('the writer is not taken anywhere', () => {
  it('opening the explanation navigates nowhere and changes no reading', () => {
    const panel = room.slice(room.indexOf('data-phenomenon-meaning'), room.indexOf('data-phenomenon-meaning') + 1400);
    expect(panel).not.toMatch(/<Link|router\.|href=|apiFetch|fetch\(/);
  });

  it('closing returns the writer to the word they asked about', () => {
    expect(room).toMatch(/meaningTrigger\.current\?\.focus\(\)/);
    expect(room).toMatch(/Escape.*closeMeaning|closeMeaning.*Escape/s);
  });

  it('the observation text is still passed through verbatim beside it', () => {
    expect(room).toMatch(/whiteSpace: 'pre-wrap'/);
    expect(room).toMatch(/\{o\.observation\}/);
  });
});

describe('an unrecognised phenomenon cannot acquire explanatory copy', () => {
  it('the room renders a label only when a meaning came with it', () => {
    expect(room).toMatch(/o\.phenomenonLabel && \(o\.phenomenonMeaning \?/);
    expect(room).toMatch(/\{meaning && o\.phenomenonMeaning &&/);
  });

  it('the presentation admits a phenomenon only through the family guard', () => {
    expect(presentation).toMatch(/isPhenomenon\(o\.phenomenon\)/);
    expect(presentation).not.toMatch(/o\.phenomenon !== undefined/);
  });

  it('there is no fallback sentence anywhere near the label', () => {
    expect(room).not.toMatch(/unclassified|no definition|not defined|unknown phenomenon/i);
  });
});
