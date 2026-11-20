/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { whatNextInWrite, WHAT_NEXT_LABEL, WHAT_NEXT_ASK_LABEL, type WriteScreen } from '../whatNext';

const ROOT = path.resolve(__dirname, '../../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const VIEW = 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx';

/** The live sources the named controls are rendered from. whatNext.ts itself is excluded, so a label cannot pass by living only here. */
const LIVE_UI = [
  VIEW,
  'lib/writersStudio/inspirationOpening.ts',
  'app/writers-studio/full-redesign/types.ts',
].map(read).join('\n');

const BASE: WriteScreen = {
  pageEmpty: false, firstPage: false, chosenPlace: null, proseSwitchShown: true, proseView: true, isBook: true,
  talkWholeLabel: 'Talk about the whole Work',
};
const text = (s: Partial<WriteScreen>) => whatNextInWrite({ ...BASE, ...s }).say.join(' ');

const SCREENS: Partial<WriteScreen>[] = [
  { pageEmpty: true },
  { firstPage: true, isBook: false, proseSwitchShown: false },
  { chosenPlace: 'Chapter 2' },
  { proseView: true },
  { proseView: false },
  { proseSwitchShown: false, isBook: false },
];

describe('What do I do next?', () => {
  test('in Prose view she names Edit first, because selecting words there opens nothing', () => {
    expect(text({ proseView: true })).toMatch(/first press “Edit” at the top of the page/);
  });

  test('in Edit she does not send the writer to Edit again', () => {
    const t = text({ proseView: false });
    expect(t).not.toMatch(/press “Edit”/);
    expect(t).toMatch(/select the words .* “Talk with MAIA”/);
  });

  test('an empty page is told to write, not to call MAIA', () => {
    const t = text({ pageEmpty: true });
    expect(t).toMatch(/start writing/);
    expect(t).not.toMatch(/Develop/);
  });

  test('a first page names the real offer, and says she has not read it', () => {
    const t = text({ firstPage: true });
    expect(t).toContain('“Show MAIA this page”');
    expect(t).toContain('I won’t read it until you do.');
  });

  test('a chosen place is named back in the writer’s own label', () => {
    expect(text({ chosenPlace: 'The First Tap' })).toContain('You’ve chosen “The First Tap”');
  });

  test('Develop is offered only once the Work is a book', () => {
    expect(text({ isBook: true })).toMatch(/“Develop” in the top bar/);
    expect(text({ isBook: false })).not.toMatch(/Develop/);
  });

  test('a program Work’s own button name is used, never the default one', () => {
    const t = text({ pageEmpty: true, talkWholeLabel: 'Talk about my essay' });
    expect(t).toContain('“Talk about my essay”');
    expect(t).not.toContain('Talk about the whole Work');
  });

  test('every control she names is text the live Studio shows', () => {
    for (const s of SCREENS) {
      const labels = [...text(s).matchAll(/“([^”]+)”/g)].map((m) => m[1]).filter((l) => l !== s.chosenPlace);
      expect(labels.length).toBeGreaterThan(0);
      for (const label of labels) expect(LIVE_UI).toContain(label);
    }
  });

  test('member-facing wording says Work, not book (review F4, 2026-11-15)', () => {
    for (const s of SCREENS) expect(text(s)).not.toMatch(/\bbook\b/i);
  });

  test('the answer claims nothing she has not done', () => {
    for (const s of SCREENS) expect(text(s)).not.toMatch(/I(’ve| have) (read|sent|saved)|I’ll start/);
  });

  test('the module cannot send, store or read the manuscript', () => {
    const src = read('lib/writersStudio/whatNext.ts');
    expect(src).not.toMatch(/^import /m);
    expect(src).not.toMatch(/fetch\(|apiFetch|localStorage|sessionStorage|bodyOf/);
  });

  test('the column shows the button, and "Ask MAIA more" only places the question', () => {
    const view = read(VIEW);
    expect(WHAT_NEXT_LABEL).toBe('What do I do next?');
    expect(view).toContain('{WHAT_NEXT_LABEL}');
    expect(view).toContain('{WHAT_NEXT_ASK_LABEL}');
    expect(view).toMatch(/setWhatNextOpen\(false\); openWorkConversation\(whatNext\.ask\)/);
    // The question goes into the composer as a starter; WorkConversation never sends a starter by itself.
    expect(read('app/writers-studio/canvas/WorkConversation.tsx')).toContain('Never auto-sent.');
    expect(WHAT_NEXT_ASK_LABEL).toBe('Ask MAIA more');
  });
});

/* ── Develop ─────────────────────────────────────────────────────────────────────────────────────────────── */
import { whatNextInDevelop, type DevelopScreen } from '../whatNext';

const STAGE = 'app/dev/writers-studio-pc3-live/DevelopStage.tsx';
const DEVELOP_VIEW = 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx';
const DEVELOP_UI = [STAGE, DEVELOP_VIEW].map(read).join('\n');
/* A Work the writer called a book (founder 2026-11-20: the Studio's words follow the form the writer gave it). */
const D_BASE: DevelopScreen = { chapterLabel: 'Chapter 2', reading: 'idle', noticed: 0, pass: 'none', posture: 'ordinary', unit: 'chapter', noun: 'book' };
const dtext = (s: Partial<DevelopScreen>) => whatNextInDevelop({ ...D_BASE, ...s }).say.join(' ');
const READINGS: DevelopScreen['reading'][] = ['idle', 'reading', 'ready', 'error'];
const PASSES: DevelopScreen['pass'][] = ['none', 'running', 'ready', 'error', 'absent'];
const POSTURES: DevelopScreen['posture'][] = ['ordinary', 'sanctuary', 'unresolved'];
const ALL_D: DevelopScreen[] = READINGS.flatMap((reading) => PASSES.flatMap((pass) => POSTURES.flatMap((posture) =>
  [0, 3].map((noticed) => ({ ...D_BASE, reading, pass, posture, noticed })))));

describe('What do I do next? in Develop', () => {
  test('in Sanctuary, or when Sanctuary cannot be read, no reading is ever suggested', () => {
    for (const s of ALL_D.filter((x) => x.posture !== 'ordinary')) {
      const t = whatNextInDevelop(s).say.join(' ');
      expect(t).not.toMatch(/Read this \w+ with MAIA|editorial pass|Go through what she noticed/);
      expect(t).toMatch(/“Edit in Write”/);
    }
    expect(dtext({ posture: 'unresolved' })).toMatch(/won’t read anything until you’ve chosen/);
  });

  test('a chapter she has already read is never offered for reading again', () => {
    expect(dtext({ reading: 'ready', noticed: 3 })).not.toContain('Read this chapter with MAIA');
    expect(dtext({ reading: 'ready', noticed: 3 })).toContain('“Go through what she noticed”');
  });

  test('"Go through what she noticed" is named only when her reading card is on screen', () => {
    expect(dtext({ reading: 'ready', noticed: 0 })).not.toContain('Go through what she noticed');
  });

  test('an unread chapter names the real reading control; a failed one says the writing is unchanged', () => {
    expect(dtext({ reading: 'idle' })).toContain('press “Read this chapter with MAIA” at the top');
    expect(dtext({ reading: 'error' })).toMatch(/Nothing in your writing changed[\s\S]*“Read this chapter with MAIA”/);
  });

  test('while she reads, she suggests nothing new to start', () => {
    expect(dtext({ reading: 'reading' })).not.toMatch(/press “Read this|“Whole book · editorial pass”/);
  });

  test('the whole-Work reading is offered only when its control is shown, and its cost is never hidden', () => {
    expect(dtext({ pass: 'absent' })).not.toMatch(/editorial pass/);
    expect(dtext({ pass: 'none' })).toMatch(/“Whole book · editorial pass”[\s\S]*see what it uses before anything starts/);
    expect(dtext({ pass: 'ready' })).toContain('“Whole book · editorial pass ready”');
    expect(dtext({ pass: 'running' })).toMatch(/Keep this page open/);
  });

  test('every control she names in Develop is text the live Develop stage shows', () => {
    for (const s of ALL_D) {
      const labels = [...whatNextInDevelop(s).say.join(' ').matchAll(/“([^”]+)”/g)].map((m) => m[1]).filter((l) => l !== s.chapterLabel);
      // The stage draws its labels in the Work's own words; read the source as it renders for this Work.
      const ui = DEVELOP_UI.replace(/\$?\{v\.unit\}/g, s.unit ?? 'part').replace(/\$?\{v\.noun\}/g, s.noun ?? 'piece');
      for (const label of labels) expect(ui).toContain(label);
    }
  });

  test('the words follow the Work: a poem’s stanzas, and neutral words when the writer has not said', () => {
    const poem = whatNextInDevelop({ ...D_BASE, unit: 'stanza', noun: 'poem', chapterLabel: null }).say.join(' ');
    expect(poem).toContain('press “Read this stanza with MAIA” at the top');
    expect(poem).toContain('“Whole poem · editorial pass”');
    expect(poem).not.toMatch(/chapter|\bbook\b/i);
    const { unit: _u, noun: _n, ...unnamed } = D_BASE;
    const neutral = whatNextInDevelop({ ...unnamed, chapterLabel: null }).say.join(' ');
    expect(neutral).toContain('“Read this part with MAIA”');
    expect(neutral).toContain('“Whole piece · editorial pass”');
    expect(neutral).not.toMatch(/chapter|\bbook\b/i);
  });

  test('her own words say Work, not book (quoted Studio labels aside)', () => {
    for (const s of ALL_D) {
      const own = whatNextInDevelop(s).say.join(' ').replace(/“[^”]*”/g, '');
      expect(own).not.toMatch(/\bbook\b/i);
    }
  });

  test('Develop shows the button in MAIA’s column, reads posture when asked, and only places the question', () => {
    const view = read(DEVELOP_VIEW);
    expect(view).toContain('data-develop-what-next-button="true"');
    expect(view).toMatch(/whatNextOpen \? \(\(\) => \{\s*const posture = readCurrentSanctuaryPosture\(\);/);
    expect(view).toMatch(/setWhatNextOpen\(false\); placeInStageConversation\(answer\.ask\)/);
    expect(view).toMatch(/pass: stagePass\.status,/);
  });
});
