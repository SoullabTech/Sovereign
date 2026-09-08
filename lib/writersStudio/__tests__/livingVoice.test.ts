import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  canOfferPassage,
  checkLivingVoiceResponse,
  checkPassage,
  PASSAGE_TOO_LONG_AT_THE_DOOR,
  passageRefusalCopy,
  LENSES,
  LENS_LABEL,
  LIVING_VOICE_PASSAGE_MAX_CODE_POINTS,
  MAX_RESPONSE_CHARS,
} from '../livingVoice';
import {
  DISCLOSURE_KEY,
  DISCLOSURE_VERSION,
  hasSeenDisclosure,
  markDisclosureSeen,
} from '../livingVoiceDisclosure';

/**
 * LIVING VOICE v1 — the constitution, made falsifiable.
 *
 * Every refusal below is a sentence a helpful model would write. None of them
 * throws. Each one takes the writing a little further out of the writer's
 * hands, and the whole lane exists to keep it in them.
 *
 * The checker can be this severe because silence is lawful: a refused response
 * becomes no response, so there is no pressure to let something marginal pass.
 */

const refusalOf = (t: string) => {
  const r = checkLivingVoiceResponse(t);
  return r.ok ? null : r.refusal;
};

describe('the lenses are as the founder corrected them (LV-F)', () => {
  it('is exactly five, and simplify and risk are not among them', () => {
    expect([...LENSES]).toEqual(['see', 'feel', 'hear', 'goCloser', 'clarify']);
    /* "Simple" privileges plainness over poetic complexity; a dense, strange,
       lyrical sentence may be exactly right. "Risk" reads as pressure. */
    expect(Object.values(LENS_LABEL)).not.toContain('Simplify it');
    expect(Object.values(LENS_LABEL)).not.toContain('Risk it');
    expect(Object.values(LENS_LABEL)).toContain('Clarify it');
    expect(Object.values(LENS_LABEL)).toContain('Go closer');
  });
});

describe('LV-I · the passage bound preserves "a passage"', () => {
  it('admits several paragraphs and refuses a section', () => {
    const fewParagraphs = 'x'.repeat(1_800);
    const aSection = 'x'.repeat(6_000);
    expect(checkPassage(fewParagraphs).ok).toBe(true);
    expect(checkPassage(aSection)).toMatchObject({ ok: false, refusal: 'too_long' });
  });

  it('is far below the developmental reader ceiling, deliberately', () => {
    /* Someone will reach for DEVELOPMENTAL_READ_CEILING_CODE_POINTS because it
       is the only prose ceiling that exists. The two govern different acts. */
    expect(LIVING_VOICE_PASSAGE_MAX_CODE_POINTS).toBeLessThan(10_000);
  });

  it('REFUSES an over-long selection rather than truncating it', () => {
    /* Silent truncation would be the system deciding which part of the
       writer's selection mattered — silently changing scope, pointing the
       other way. LV-H's corollary: the mismatch is spoken. */
    const over = 'x'.repeat(LIVING_VOICE_PASSAGE_MAX_CODE_POINTS + 1);
    const r = checkPassage(over);
    expect(r.ok).toBe(false);
    expect(r).not.toHaveProperty('passage');
    expect(passageRefusalCopy('too_long')).toMatch(/choose a smaller piece/i);
  });

  it('counts code points, not UTF-16 units', () => {
    const emoji = '🜂'.repeat(LIVING_VOICE_PASSAGE_MAX_CODE_POINTS);
    expect(checkPassage(emoji).ok).toBe(true);
  });
});

describe('MAIA does not diagnose deficiency', () => {
  it('refuses "needs", "lacks", "missing"', () => {
    /* THE CENTRAL REFUSAL. A lens is an invitation to look, never a finding
       that something is absent. */
    expect(refusalOf('This needs more feeling.')).toBe('diagnoses_deficiency');
    expect(refusalOf('The passage lacks a concrete image.')).toBe('diagnoses_deficiency');
    expect(refusalOf('What is missing here is the body.')).toBe('diagnoses_deficiency');
    expect(refusalOf('This could use a sharper verb.')).toBe('diagnoses_deficiency');
  });
});

describe('MAIA does not grade — in either direction', () => {
  it('refuses praise as well as criticism', () => {
    /* Praise is judgement too: "this is strong" teaches the writer to write
       for the judgement. */
    expect(refusalOf('This is a strong opening.')).toBe('evaluates');
    expect(refusalOf('The rhythm here is weak.')).toBe('evaluates');
    expect(refusalOf('That image works well.')).toBe('evaluates');
  });
});

describe('MAIA does not write for the writer', () => {
  it('refuses a rewrite offered as the answer', () => {
    expect(refusalOf('Try this: the kitchen stood empty.')).toBe('rewrites_for_the_writer');
    expect(refusalOf("Here's a version that lands harder.")).toBe('rewrites_for_the_writer');
  });
});

describe('GO CLOSER is creative permission, never pressure to disclose', () => {
  it('refuses excavation', () => {
    /* The gap between courage and interrogation is the whole of flow §10. */
    expect(refusalOf('What really happened that night?')).toBe('presses_for_disclosure');
    expect(refusalOf('You must have felt abandoned.')).toBe('presses_for_disclosure');
    expect(refusalOf('Open up about the loss here.')).toBe('presses_for_disclosure');
  });
});

describe('a lens is an invitation to look, not a classification', () => {
  it('refuses labelling the passage as a type', () => {
    expect(refusalOf('This passage is a very lyrical one.')).toBe('classifies_the_passage');
    expect(refusalOf('That is an image passage more than an argument.')).toBe('classifies_the_passage');
  });
});

describe('LV-H · MAIA may not claim what she was not given', () => {
  it('refuses claims about the Work she cannot establish', () => {
    /* v1 hands her one passage. She cannot compare it with the whole Work, so
       she may not sound as though she has. */
    expect(refusalOf('This departs from your established voice.')).toBe('claims_the_works_voice');
    expect(refusalOf('Elsewhere in the manuscript you are more direct.')).toBe('claims_the_works_voice');
    expect(refusalOf('Throughout the work you favour long sentences.')).toBe('claims_the_works_voice');
  });

  it('refuses reaching past the passage she was offered', () => {
    expect(refusalOf('The previous paragraph sets this up.')).toBe('reaches_beyond_the_passage');
    expect(refusalOf('Earlier in this chapter you named the fear.')).toBe('reaches_beyond_the_passage');
  });
});

describe('what a lawful encounter sounds like', () => {
  it('accepts a noticing and an invitation', () => {
    expect(checkLivingVoiceResponse(
      'The feeling here is named rather than shown — grief appears as a word. ' +
      'There may be an object in the room that already carries it.',
    ).ok).toBe(true);

    expect(checkLivingVoiceResponse(
      'These sentences all arrive at the same length, so the paragraph keeps an even pace. ' +
      'Read it aloud and see where you would want to break stride.',
    ).ok).toBe(true);
  });

  it('accepts MAIA saying the passage does not show her enough', () => {
    /* Insufficiency is spoken; scope is never silently widened. */
    expect(checkLivingVoiceResponse(
      'On its own this passage does not show me enough to say anything true about its rhythm.',
    ).ok).toBe(true);
  });

  it('holds the response brief', () => {
    expect(refusalOf('a'.repeat(MAX_RESPONSE_CHARS + 1))).toBe('too_long');
    expect(refusalOf('   ')).toBe('empty');
  });
});

describe('LV-H · non-durability is guaranteed by construction', () => {
  const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const MODULE = code(readFileSync(join(process.cwd(), 'lib', 'writersStudio', 'livingVoice.ts'), 'utf8'));
  const ROUTE = code(readFileSync(
    join(process.cwd(), 'app', 'api', 'sovereign', 'manuscripts', '[id]', 'living-voice', 'route.ts'), 'utf8'));

  it('there is nowhere to write the passage', () => {
    /* The strongest form of "never stored" is not a deletion policy — it is
       having no store. So the instrument looks for a WRITE, not for a word:
       an identifier that merely contains the feature's name is not a store,
       and an instrument that cannot tell those apart reports the feature's
       own name back as evidence against it. */
    const SQL_WRITE = /\b(INSERT\s+INTO|UPDATE\s+[a-z_"]+\s+SET|DELETE\s+FROM|UPSERT|ON\s+CONFLICT)\b/i;
    expect(MODULE + ROUTE).not.toMatch(SQL_WRITE);

    /* Nor any other durable surface: no filesystem, no client storage, no
       module-level accumulator reachable from a later turn. */
    for (const banned of [
      /writeFile/, /appendFile/, /localStorage/, /sessionStorage/, /indexedDB/, /redis/i,
    ]) {
      expect(MODULE + ROUTE).not.toMatch(banned);
    }
  });

  it('Living Voice v1 ships no migration', () => {
    /* A table would be the one thing that could outlive the turn. None is
       authored: no migration filename and no migration body names it. */
    const dir = join(process.cwd(), 'database', 'migrations');
    const files = readdirSync(dir).filter((f) => f.endsWith('.sql'));
    expect(files.length).toBeGreaterThan(0);

    for (const f of files) {
      expect(f).not.toMatch(/living[-_]?voice|writer[-_]?voice/i);
      const sql = readFileSync(join(dir, f), 'utf8');
      expect(sql).not.toMatch(/CREATE\s+TABLE[^;]*\b(living_voice|writer_voice)\w*/i);
    }
  });

  it('the route never fetches the prose it reasons about', () => {
    /* It reads a HEADING for the anchor and never a body. Fetching the text
       would make the server the reader, which is the line LV-H draws. */
    expect(ROUTE).toMatch(/SELECT heading FROM manuscript_sections/);
    expect(ROUTE).not.toMatch(/SELECT[^;]*\bbody\b[^;]*FROM manuscript_sections/i);
  });

  it('the passage never reaches a log line', () => {
    expect(ROUTE).not.toMatch(/console\.(log|error|warn)\([^)]*passage/i);
  });

  it('no accumulation across turns exists', () => {
    for (const banned of ['previousPassages', 'history', 'accumulat', 'lastPassage', 'cache']) {
      expect(MODULE).not.toMatch(new RegExp(banned, 'i'));
    }
  });
});

describe('LV-I · the bound is a relation; the number is provisional', () => {
  it('a passage-scale selection may be offered at the door', () => {
    expect(canOfferPassage('The river had gone the colour of tea.')).toBe(true);
  });

  it('an over-long selection is answered at the door, not by opening an encounter', () => {
    expect(canOfferPassage('a'.repeat(LIVING_VOICE_PASSAGE_MAX_CODE_POINTS + 1))).toBe(false);
    expect(PASSAGE_TOO_LONG_AT_THE_DOOR).toMatch(/shorter passage/i);
  });

  it('the door check and the custody check agree, and neither truncates', () => {
    /* The client courtesy and the server boundary must not disagree about what
       a passage is — but they are two checks, not one: `canOfferPassage` is
       deletable without changing what the route accepts. */
    const over = 'a'.repeat(LIVING_VOICE_PASSAGE_MAX_CODE_POINTS + 1);
    expect(canOfferPassage(over)).toBe(false);
    const checked = checkPassage(over);
    expect(checked.ok).toBe(false);
    if (!checked.ok) expect(checked.refusal).toBe('too_long');
  });

  it('the writing surface refuses BEFORE the offer, and sends nothing', () => {
    const SURFACE = readFileSync(
      join(process.cwd(), 'app', 'writers-studio', 'canvas', 'SectionWritingSurface.tsx'), 'utf8');
    /* The control that opens an encounter exists only for an offerable
       selection; an over-long one reaches a sentence, never a button. */
    expect(SURFACE).toMatch(/selection === 'offerable'[^\n]*&&[\s\S]{0,200}<button/);
    expect(SURFACE).toMatch(/selection === 'too-long'/);
    expect(SURFACE).toMatch(/canOfferPassage/);
  });

  it('the number is marked provisional and the relation is not', () => {
    const SOURCE = readFileSync(
      join(process.cwd(), 'lib', 'writersStudio', 'livingVoice.ts'), 'utf8');
    /* Ruled: 2,000 is a revisable implementation constant. If a later reader
       cannot tell that from the source, the ruling has been lost.
       
       The comment gutter is flattened first: a doc comment wraps, so an
       assertion on a phrase would otherwise pass or fail on where the line
       happened to break. */
    const prose = SOURCE.replace(/^\s*\*\s?/gm, '').replace(/\s+/g, ' ');
    expect(prose).toMatch(/THE NUMBER IS NOT THE LAW/);
    expect(prose).toMatch(/PROVISIONAL IMPLEMENTATION CONSTANT/);
    expect(prose).toMatch(/never truncates it and never enlarges it/i);
  });
});

describe('LV-J · disclosure memory is UI state, never permission', () => {
  const store = new Map<string, string>();
  beforeAll(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => { store.set(k, v); },
        },
      },
      configurable: true,
      writable: true,
    });
  });
  beforeEach(() => store.clear());

  it('is remembered per browser under a versioned key', () => {
    expect(hasSeenDisclosure()).toBe(false);
    markDisclosureSeen();
    expect(hasSeenDisclosure()).toBe(true);
    expect(DISCLOSURE_KEY).toBe(`living_voice_disclosure_seen_v${DISCLOSURE_VERSION}`);
  });

  it('stores a flag and never a passage', () => {
    markDisclosureSeen();
    expect([...store.values()]).toEqual(['true']);
    expect([...store.keys()]).toEqual([DISCLOSURE_KEY]);
  });

  it('a changed disclosure is shown again, because the key carries its version', () => {
    store.set('living_voice_disclosure_seen_v0', 'true');
    expect(hasSeenDisclosure()).toBe(false);
  });

  it('unreadable storage resolves to NOT seen', () => {
    /* Erring toward showing it twice, never toward a writer who was not told. */
    Object.defineProperty(globalThis, 'window', {
      value: { get localStorage(): Storage { throw new Error('blocked'); } },
      configurable: true, writable: true,
    });
    expect(hasSeenDisclosure()).toBe(false);
    expect(() => markDisclosureSeen()).not.toThrow();
  });

  it('⛔ having seen the disclosure authorizes nothing', () => {
    /* The load-bearing separation. The flag lives in its own module, and
       neither the encounter core nor the route may read it: if the flag could
       reach the send path, "seen" would have quietly become "permitted". */
    const MODULE = readFileSync(
      join(process.cwd(), 'lib', 'writersStudio', 'livingVoice.ts'), 'utf8');
    const HOOK = readFileSync(
      join(process.cwd(), 'lib', 'writersStudio', 'useLivingVoice.ts'), 'utf8');
    const ROUTE = readFileSync(
      join(process.cwd(), 'app', 'api', 'sovereign', 'manuscripts', '[id]', 'living-voice', 'route.ts'), 'utf8');
    for (const src of [MODULE, HOOK, ROUTE]) {
      expect(src).not.toMatch(/DisclosureSeen|DISCLOSURE_KEY|livingVoiceDisclosure/);
    }
  });

  it('the disclosure never leaves the device', () => {
    /* Comments stripped FIRST, and it is not a detail: this file's whole
       middle section is a list of the places the flag may not live, so a
       scanner reading prose finds "analytics" in a file whose only mention of
       analytics is a ban on it. An instrument that cannot tell a prohibition
       from the prohibited behaviour will always fail on the file that
       documents its own compliance. */
    const DISCLOSURE = readFileSync(
      join(process.cwd(), 'lib', 'writersStudio', 'livingVoiceDisclosure.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const banned of [/apiFetch/, /fetch\(/, /\/api\//, /INSERT/i, /analytics/i, /track\(/]) {
      expect(DISCLOSURE).not.toMatch(banned);
    }
    /* And the store it does touch is the browser's own. */
    expect(DISCLOSURE).toMatch(/window\.localStorage/);
  });
});

describe('silence and unavailability are different events', () => {
  /* WITNESS INTEGRITY. This is not a nicety: with both collapsed into `null`,
     an unconfigured environment renders "Nothing to add to this one" for every
     lens, and a writer performing a real witness would honestly report that
     Living Voice declined to speak about their passage — when Living Voice was
     never reached. An infrastructure refusal must never be readable as a
     constitutional one. */

  const MODULE = readFileSync(
    join(process.cwd(), 'lib', 'writersStudio', 'livingVoice.ts'), 'utf8');
  const ROUTE = readFileSync(
    join(process.cwd(), 'app', 'api', 'sovereign', 'manuscripts', '[id]', 'living-voice', 'route.ts'), 'utf8');

  it('the encounter reports three outcomes, not two', () => {
    expect(MODULE).toMatch(/kind: 'response'/);
    expect(MODULE).toMatch(/kind: 'silent'/);
    expect(MODULE).toMatch(/kind: 'unavailable'/);
  });

  it('ONLY the inference seam refusing produces unavailability', () => {
    /* Every content-based failure stays silence — the check is the product,
       and a response that fails its own rules is a response MAIA does not
       make. `unavailable` is reachable from exactly one place. */
    const occurrences = MODULE.match(/\{ kind: 'unavailable' \}/g) ?? [];
    expect(occurrences).toHaveLength(1);
    expect(MODULE).toMatch(/if \(!outcome\.ok\) return \{ kind: 'unavailable' \}/);
    /* A response failing the form contract is silence, not unavailability. */
    expect(MODULE).toMatch(/verdict\.ok \? \{ kind: 'response'[^\n]*: \{ kind: 'silent' \}/);
  });

  it('the route says nothing was looked at, without disclosing why', () => {
    expect(ROUTE).toMatch(/outcome\.kind === 'unavailable'/);
    expect(ROUTE).toMatch(/status: 503/);
    /* The writer is not asked to debug a deployment: no refusal code, no
       provider name, no mode reaches them. */
    expect(ROUTE).not.toMatch(/refusal:|not_configured|provider_unavailable|ANTHROPIC/);
  });

  it('silence still carries no error', () => {
    expect(ROUTE).toMatch(/response: outcome\.kind === 'response' \? outcome\.text : null/);
  });
});
