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

  it('⭐ 01B — carries no chrome of its own', () => {
    /* `StudioPanel`: "A panel is chrome around content." Its contract owns the
       band label, whether the panel is dismissible, and the dismiss control.
       A second title bar and a second exit inside the content were this
       component answering a question it was not asked. */
    const panel = strip(read(PANEL));
    expect(panel).not.toMatch(/<header/);
    expect(panel).not.toMatch(/onClose/);
    expect(panel).not.toMatch(/Put MAIA away/);
    /* ⭐ But the ORIENTATION stays. The two labels answer different questions:
       "MAIA · conversation" is what region am I in, "This passage" is what is
       this conversation about. */
    expect(panel).toContain('This passage');
  });

  it('⭐ 01B — and the room hands it no close to hold', () => {
    const client = strip(read(CLIENT));
    expect(client).toMatch(/<EditorialConversation\s+threadId=\{editorialThreadId\}\s*\/>/);
    /* The panel above it still dismisses — the affordance moved, it did not go. */
    expect(client).toMatch(/onDismiss=\{[\s\S]{0,200}dismiss\('conversation'\)/);
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

describe('WS-EDITORIAL-UI-02 — the writer answers in wording', () => {
  const SEAM = 'lib/manuscript/editorialRuntime/memberVersion.ts';
  const ROUTE = 'app/api/writers-studio/editorial/version/route.ts';

  it('⭐⭐ writes NO ask_turn for a formulation', () => {
    /* member discourse   → ask_turn
       member Direction   → ask_turn + Direction + binding
       member formulation → ProposalVersion, and nothing else.
       Manufacturing a turn so every version carries a binding would invent
       something the writer never said. */
    const seam = strip(read(SEAM));
    expect(seam).not.toMatch(/ask_turns/);
    expect(seam).not.toMatch(/appendTurn|editorial_turn_bindings/);
  });

  it('⛔ takes no chain and no author from the caller', () => {
    const seam = strip(read(SEAM));
    /* The chain is derived from the OWNED thread, in the SQL. */
    expect(seam).toMatch(/FROM ask_threads WHERE id = \$1 AND member_id = \$2/);
    expect(seam).toMatch(/author: 'member'/);
    expect(seam).not.toMatch(/input\.author|input\.chainId/);
  });

  it('⭐⭐ carries `supersedes` across the boundary without resolving it', () => {
    /* `appendAuthoredVersion`'s own merge blocker: lock acquisition must not
       invent history. A seam that resolved a stale predecessor for the writer
       would reintroduce that one layer up. */
    const seam = strip(read(SEAM));
    expect(seam).toMatch(/supersedes: input\.supersedes/);
    expect(seam).not.toMatch(/headVersionId|readProposalWork|lineage/);
  });

  it('⛔ never truthiness-checks the wording — `\'\'` is a lawful formulation', () => {
    const route = strip(read(ROUTE));
    expect(route).toMatch(/typeof b\.replacementText !== 'string'/);
    expect(route).not.toMatch(/!b\.replacementText|b\.replacementText\.length === 0/);
    expect(route).not.toMatch(/replacementText\.trim\(\)/);
  });

  it('⛔ the composer target is STATE FROM A CLICK, never derived from the head', () => {
    /* The load-bearing UI law. If a newer version lands mid-draft, the lineage
       head moves and the target does not — so the submission carries the
       predecessor they answered and is truthfully refused. */
    const panel = strip(read(PANEL));
    expect(panel).toMatch(/useState<ComposerTarget \| null>\(null\)/);
    expect(panel).toMatch(/supersedes: composerTarget\.versionId/);
    expect(panel).not.toMatch(/supersedes:\s*view[?.]*\.headVersionId/);
  });

  it('⛔ never prefills "Your version" with the target wording', () => {
    const panel = strip(read(PANEL));
    /* Every setter for the composer field sets it empty or to what the writer
       typed. Authoring identical text is lawful; manufacturing it is not. */
    const sets = panel.match(/setWording\([^)]*\)/g) ?? [];
    expect(sets.length).toBeGreaterThan(0);
    for (const call of sets) {
      expect(call).toMatch(/setWording\(''\)|setWording\(e\.target\.value\)/);
    }
  });

  it('⛔ neither retries nor rebases on refusal, and keeps the draft', () => {
    const panel = strip(read(PANEL));
    const submit = panel.slice(panel.indexOf('const addMyVersion'),
                               panel.indexOf('return ('));
    /* On the refusal path: no setWording, no setComposerTarget. Both appear
       only in the 201 branch and in the writer's own gestures. */
    /* ⚠️ THE ANCHOR MATTERS. A first version sliced from the first
       `setWordingRefusal(` — which is the `(null)` reset at the TOP of submit —
       so the "refusal branch" it scanned contained the whole success branch and
       failed on the success branch's own `setWording('')`. The refusal path is
       everything after the 201 early return. */
    const refusalBranch = submit.slice(submit.indexOf('const body = await res.json()'));
    expect(refusalBranch).not.toMatch(/setWording\(/);
    expect(refusalBranch).not.toMatch(/setComposerTarget\(/);
    /* And the lineage IS re-read, so they can see what moved. */
    expect(refusalBranch).toMatch(/reload\(threadId\)/);
  });

  it('⛔ splices nothing into the lineage — the screen agrees with storage', () => {
    const panel = strip(read(PANEL));
    expect(panel).not.toMatch(/setView\(\s*\{[\s\S]{0,200}versions/);
    expect(panel).toMatch(/if \(res\.status === 201\) \{[\s\S]{0,200}reload\(threadId\)/);
  });

  it('⛔ offers no adoption, and says so', () => {
    const panel = strip(read(PANEL));
    expect(panel).toContain('Nothing changes until you explicitly adopt a version.');
    expect(panel).not.toMatch(/\bAdopt\b(?!\sa version)/);
    expect(panel).not.toMatch(/Keep Original|Revise/);
  });
});

describe('WS-EDITORIAL-UI-03 — exact comparison, with no authority', () => {
  const panel = strip(read(PANEL));

  it('⭐⭐ freezes the compared version at the click, never at the head', () => {
    expect(panel).toMatch(/useState<ComparisonTarget \| null>\(null\)/);
    /* Set only by the gesture. Every assignment is either the click or a clear. */
    const sets = panel.match(/setComparisonTarget\([\s\S]{0,120}?\)/g) ?? [];
    expect(sets.length).toBeGreaterThan(0);
    for (const call of sets) {
      expect(call).toMatch(/setComparisonTarget\(null\)|versionId: v\.id/);
    }
    expect(panel).not.toMatch(/setComparisonTarget[\s\S]{0,120}headVersionId/);
    expect(panel).not.toMatch(/setComparisonTarget[\s\S]{0,120}composerTarget/);
  });

  it('⛔ reads the compared version by its frozen id, not by position', () => {
    expect(panel).toMatch(/view\.versions\.find\(\(v\) => v\.id === comparisonTarget\.versionId\)/);
    expect(panel).not.toMatch(/versions\[view\.versions\.length - 1\]/);
  });

  /**
   * ⚠️ A SLICE BOUNDED BY A STRING THAT IS NOT THERE IS A SLICE TO END-OF-FILE.
   * The first version of these obligations ended the comparison block at
   * `indexOf('YOUR VERSION')`, but the source says `Your version` — so `-1`
   * made the "comparison block" the whole rest of the component, and it failed
   * on the COMPOSER's copy. Both ends are asserted present now, so a renamed
   * marker fails loudly instead of widening the scan.
   */
  const compareBlock = (() => {
    const from = panel.indexOf('{comparisonTarget && view &&');
    /* ⚠️ And the marker must survive `strip`: the banner comment does not, so
       the anchor is the composer's own aria-label. The guard below caught that
       too — loudly, which is the point of asserting both ends. */
    const to = panel.indexOf('aria-label="Your version"');
    expect(from).toBeGreaterThan(-1);
    expect(to).toBeGreaterThan(from);
    return panel.slice(from, to);
  })();

  it('⛔ adds no server seam, and fetches no current Work', () => {
    /* Comparison reads what is already on screen. Fetching the manuscript to
       look "more current" would silently change the subject from the chain's
       historical locus to the present Work. */
    const compare = compareBlock;
    expect(compare).not.toMatch(/apiFetch|fetch\(/);
    expect(compare).not.toMatch(/manuscript|draft|sections/i);
  });

  it('⭐ labels the left side by PROVENANCE, never "Original"', () => {
    expect(panel).toContain('Passage when this exchange opened');
    expect(panel).not.toMatch(/>\s*Original\s*</);
  });

  it('⛔ offers no decision at all', () => {
    const compare = compareBlock;
    expect(compare).not.toMatch(/\b(Keep Original|Accept|Revise|Apply|Use this)\b/);
    /* "Done comparing" dismisses a view; it decides nothing about the Work. */
    expect(compare).toContain('Done comparing');
    expect(compare).toContain('Nothing changes until you explicitly adopt a version.');
  });

  it('⛔ introduces no diff algorithm', () => {
    expect(panel).not.toMatch(/\bdiff\b|myers|levenshtein|patience/i);
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
