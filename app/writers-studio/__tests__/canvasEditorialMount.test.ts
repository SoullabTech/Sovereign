/**
 * WS-EDITORIAL-UI-01A — THE MOUNT, AND WHO OWNS WHICH RESPONSIBILITY.
 *
 * ⭐⭐ SERVER STATE PRESERVES THE CONVERSATION. AN ADDRESS PRESERVES WHICH
 * CONVERSATION YOU MEAN. UI-01 conflated them, and the shape of the defect is
 * worth stating because nothing in a type system or a 23/0 HTTP run catches
 * it: the panel opened a durable relationship from its own mount effect and
 * held the only copy of that relationship's identity in React state. A
 * re-render was therefore an authored request to create one, and a remount
 * could not find its way back to what it had made.
 *
 * These are source assertions, and they are named as such. They establish
 * WHERE a responsibility lives — which no behavioural run against a booted
 * server can establish, because a room that opens a thread twice and a room
 * that opens one once look identical from the outside on a single pass.
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
/* Comments describe prohibitions; a scanner that reads them finds the
   prohibited thing in the sentence that forbids it. Six occurrences of that
   in this programme is six too many. */
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const PAGE = 'app/writers-studio/canvas/page.tsx';
const CLIENT = 'app/writers-studio/canvas/CanvasClient.tsx';
const PANEL = 'app/writers-studio/canvas/EditorialConversation.tsx';

describe('one flag, read once, on the server', () => {
  it('reads the environment in the server page and nowhere in the client tree', () => {
    const page = strip(read(PAGE));
    expect(page).not.toContain("'use client'");
    expect(page).toContain('export const dynamic');
    expect(
      (page.match(/WRITERS_STUDIO_EDITORIAL_ENABLED/g) ?? []).length,
    ).toBe(1);
    expect(page).toContain('editorialEnabled={');

    const client = strip(read(CLIENT));
    expect(client.startsWith("'use client'")).toBe(true);
    expect(client).not.toContain('process.env');
  });

  it('mirrors the flag into no second name', () => {
    /* ⛔ A `NEXT_PUBLIC_` copy is a second, independently-settable source of
       truth for one fact, and two copies can disagree invisibly. */
    for (const f of [PAGE, CLIENT, PANEL]) {
      expect(strip(read(f))).not.toMatch(/NEXT_PUBLIC_[A-Z_]*EDITORIAL/);
    }
  });

  it('never infers policy from a status code', () => {
    /* ⛔ 404 read as "the feature is off" is a client deciding policy from
       transport — the same family as inferring an editorial act from prose. */
    const client = strip(read(CLIENT));
    expect(client).not.toMatch(/404[\s\S]{0,80}editorialEnabled/);
    expect(strip(read(PANEL))).not.toContain('404');
  });

  it('keeps the flag as presentation state, not authorization', () => {
    /* Both routes re-read the real server flag independently. A member who
       edits the boolean in the browser changes which surface is DRAWN and
       gains no access whatsoever. */
    for (const route of [
      'app/api/writers-studio/editorial/thread/route.ts',
      'app/api/writers-studio/editorial/turn/route.ts',
    ]) {
      expect(read(route)).toContain("WRITERS_STUDIO_EDITORIAL_ENABLED === '1'");
    }
  });
});

describe('the panel is handed a conversation and cannot make one', () => {
  it('requires a threadId and holds no optional section', () => {
    const panel = strip(read(PANEL));
    expect(panel).toMatch(/threadId: string;/);
    expect(panel).not.toMatch(/threadId\?:/);
    expect(panel).not.toMatch(/sectionId/);
  });

  it('issues no POST to the thread seam at all', () => {
    /* ⭐ The decisive one. Creation is a member gesture; this component
       renders. It may read `…/thread`, and that is the only verb it has. */
    const panel = strip(read(PANEL));
    expect(panel).not.toMatch(/method:\s*'POST'[\s\S]{0,200}editorial\/thread/);
    expect(panel).not.toMatch(/editorial\/thread[\s\S]{0,200}method:\s*'POST'/);
  });

  it('holds no identity of its own', () => {
    const panel = strip(read(PANEL));
    expect(panel).not.toContain('setThreadId');
    expect(panel).not.toContain('mintStudioConversationId');
  });
});

describe('the room opens a relationship from a gesture, never from a render', () => {
  const client = strip(read(CLIENT));

  it('opens inside the Conversations gesture', () => {
    expect(client).toMatch(
      /d\.id === 'conversations'[\s\S]{0,200}openEditorialConversation\(\)/,
    );
  });

  it('does not open from an effect', () => {
    /* ⛔ THE UI-01 DEFECT, PINNED. A useEffect that can reach the opening act
       is a re-render that can author a durable relationship. */
    const effects = client.match(/useEffect\([\s\S]{0,1200}?\n  \}, \[[^\]]*\]\);/g) ?? [];
    expect(effects.length).toBeGreaterThan(3); // the scanner found real effects
    for (const e of effects) {
      expect(e).not.toContain('openEditorialConversation');
      expect(e).not.toMatch(/editorial\/thread/);
    }
  });

  it('refuses to open twice, and refuses to open without a locus', () => {
    const act = client.slice(client.indexOf('const openEditorialConversation'));
    expect(act).toMatch(/if \(!editorialEnabled \|\| editorialThreadId \|\| editorialOpening\) return;/);
    expect(act).toMatch(/if \(!sectionId\) return;/);
    expect(act).toMatch(/writing\?\.activeId/);
  });

  it('writes the address as soon as the server names the thread', () => {
    const act = client.slice(
      client.indexOf('const openEditorialConversation'),
      client.indexOf('const [compact'),
    );
    expect(act).toContain('canvasWithEditorialThread');
    expect(act).toContain('window.history.replaceState');
    /* The address is written in the same success branch that learns the id —
       a thread that exists on the server is never one the room cannot name. */
    expect(act.indexOf('setEditorialThreadId')).toBeLessThan(
      act.indexOf('canvasWithEditorialThread'),
    );
  });

  it('ranks nothing and guesses nothing', () => {
    /* ⛔ The schema admits MANY threads per chain, so "the latest one" is a
       guess wearing the costume of a lookup. */
    expect(client).not.toMatch(/most.?recent|latestThread|threads\[0\]/i);
  });
});

describe('false is the existing room, not a degraded one', () => {
  const client = strip(read(CLIENT));

  it('still mounts StudioConversation when the flag is off', () => {
    expect(client).toMatch(
      /editorialEnabled \? \([\s\S]*?\) : \([\s\S]{0,400}<StudioConversation/,
    );
  });

  it('says what is missing when enabled with no thread addressed', () => {
    expect(client).toMatch(/editorialThreadId \? \([\s\S]{0,400}<EditorialConversation/);
    expect(client).toContain('editorialRefusal');
  });
});

describe('the room source is where its scanners look', () => {
  /* ⚠️ THE SPLIT'S OWN HAZARD, CLOSED. Four suites read the Canvas room as
     TEXT. Moving the room to CanvasClient.tsx left them pointed at a
     forty-line server page: the positive assertions would have failed loudly,
     but every `not.toContain` would have passed VACUOUSLY — green for a room
     the file no longer holds. */
  it('keeps the room in CanvasClient and only the boundary in page', () => {
    expect(read(CLIENT)).toContain('function CanvasRoom(');
    expect(read(PAGE)).not.toContain('function CanvasRoom(');
    expect(read(PAGE).split('\n').length).toBeLessThan(80);
  });

  it('leaves NO suite reading the Canvas room at its old path', () => {
    /* ⚠️ ENUMERATION WAS THE FIRST MISTAKE HERE. Three suites named the path
       as a literal string and were repointed; EIGHT MORE built it with
       `join(__dirname, '..', 'canvas', 'page.tsx')` and were missed, because a
       grep for the literal could not see them. They failed loudly — but only
       because their assertions were positive. So this scans the directories
       rather than a list, and the list can no longer go stale. */
    const dirs = [
      'app/writers-studio/__tests__',
      'lib/writersStudio/__tests__',
    ];
    const SELF = 'canvasEditorialMount.test.ts';
    const stragglers: string[] = [];
    for (const d of dirs) {
      for (const f of readdirSync(join(process.cwd(), d))) {
        if (!f.endsWith('.test.ts')) continue;
        /* ⚠️ THE C21 CLASS, SEVENTH OCCURRENCE IN THIS PROGRAMME, and it fired
           on the first run: this file NAMES the old path in its own prose and
           again in the falsifier below, so the scanner reported itself. Two
           exclusions, both explicit — comments are stripped (the same remedy
           C6 and C21 already use), and the scanner does not scan itself. */
        if (f === SELF) continue;
        const src = strip(read(join(d, f)));
        if (/canvas\/page\.tsx|'canvas',\s*'page\.tsx'/.test(src)) stragglers.push(`${d}/${f}`);
      }
    }
    expect(stragglers).toEqual([]);
  });

  it('and the scan can actually see the old spelling', () => {
    /* ⭐ The check above is a `toEqual([])`, which is exactly the shape that
       passes when the scanner is broken. This proves the pattern matches both
       spellings of the path that were actually in use. */
    const re = /canvas\/page\.tsx|'canvas',\s*'page\.tsx'/;
    expect(re.test("read('app/writers-studio/canvas/page.tsx')")).toBe(true);
    expect(re.test("join(__dirname, '..', 'canvas', 'page.tsx')")).toBe(true);
    expect(re.test("join(__dirname, '..', 'canvas', 'CanvasClient.tsx')")).toBe(false);
  });
});
