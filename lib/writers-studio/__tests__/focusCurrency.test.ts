import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  currencyStillDescribes, mayDisclose, resolveFocusCurrency,
  type CurrencyInput,
} from '../focusCurrency';
import type { DevelopmentalReadState } from '@/lib/manuscript/development/readState';
import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import type { EditableSection } from '@/lib/manuscript/sections/saveSection';

/**
 * WS-FOCUS-CURRENCY-01 — C1–C14, predeclared by the founder BEFORE
 * implementation.
 *
 * ⭐⭐ THE RULING. Server-declared currency, narrowly constituted:
 *
 *   historical readState digest + current Working Draft → currency
 *   the panel receives ONLY status.
 *
 * ⛔ The browser never receives the historical digest. MAIA never receives it.
 * The URL never contains it. No receipt is minted because currency was checked.
 *
 * ⭐ AND THE EPISTEMIC LAW THAT GOVERNS THE FALLBACK:
 *
 *   Failure to establish sameness is not evidence of difference.
 *
 * When the comparison cannot run the answer is `not_yet_known` — never `gone`,
 * and never `ready`.
 */

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const lib = (...p: string[]) => strip(fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8'));
const currencySrc = lib('focusCurrency.ts');
const resolverSrc = lib('focusCurrencyResolver.ts');
const crossingSrc = lib('focusCrossing.ts');
/* ⛔ Instrument note: `lib()` strips comments, so an assertion about a DOCUMENTED
   law has to read the raw file. Asserting a comment against a stripped source
   fails for the one reason that means nothing — it was stripped. */
const rawOf = (...p: string[]) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const routeSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'app', 'api', 'writers-studio', 'focus', 'route.ts'), 'utf8'));
const askActSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'app', 'writers-studio', 'field', 'focusAskAct.ts'), 'utf8'));
const doorSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'app', 'writers-studio', 'workWithThis.ts'), 'utf8'));

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

const S1 = 'aaaaaaaa-0000-4000-8000-000000000001';  // passage, unchanged
const S2 = 'aaaaaaaa-0000-4000-8000-000000000002';  // passage, changed
const S3 = 'aaaaaaaa-0000-4000-8000-000000000003';  // whole section, changed
const S4 = 'aaaaaaaa-0000-4000-8000-000000000004';  // deleted

/** The STORED text — heading prefix included, which is what the digest is over. */
const AS_READ: Record<string, string> = {
  [S1]: 'THE PRESENT MOMENT\n\nThe fire was already lit.',
  [S2]: 'THE CAMPFIRE METAPHOR\n\nSomeone had banked it.',
  [S3]: 'SUSTAINING THE FIRE\n\nBy morning the stones were cold.',
  [S4]: 'THE GLOWING EMBERS\n\nNothing remained.',
};

const readState = (): DevelopmentalReadState => ({
  draftId: 'd-1', revisionNumber: 7, revisionDigest: sha('whole'),
  sectionTopology: [S1, S2, S3, S4],
  sections: Object.fromEntries(Object.entries(AS_READ).map(([id, t]) => [
    id, { revisionNumber: 7, range: { start: 0, end: 10 }, digest: sha(t) },
  ])),
  coverage: {} as never, inputFingerprint: 'f',
} as unknown as DevelopmentalReadState);

/**
 * ⭐ THE PASSAGE ANCHORS NOW BEGIN AT THE BODY, and that migration is itself the
 * finding. They used to be 0–5 — offsets that, read as STORED coordinates,
 * begin inside the heading. Before FOCUS-W3 that was invisible, because the
 * numbers were applied to the body regardless. Under the repair such an anchor
 * resolves `needs_confirmation`, which is correct and is not what C3 is asking
 * about. So the fixture names spans of the member's prose:
 *
 *   S1  prefix 20 → 20–25    S2  prefix 23 → 23–28
 */
const anchors = (): (FocusAnchor & { focusMemberId: string })[] => [
  { focusMemberId: 'f1', kind: 'passage', sectionId: S1, range: { space: 'stored_section_text', start: 20, end: 25 } },
  { focusMemberId: 'f2', kind: 'passage', sectionId: S2, range: { space: 'stored_section_text', start: 23, end: 28 } },
  { focusMemberId: 'f3', kind: 'section', sectionId: S3 },
  { focusMemberId: 'f4', kind: 'section', sectionId: S4 },
];

/**
 * The Work NOW: S1 untouched, S2 and S3 edited, S4 deleted.
 *
 * ⭐ SUPERSEDED IN PLACE, WS-FOCUS-PASSAGE-01. This harness used to hand the
 * resolver a `LiveWork` — `{ sections: [{id, text}], structure }` — loaded
 * separately from the one the Ask would read. FOCUS-W3 closed that seam: the
 * resolver now takes the SAME `EditableSection` snapshot the crossing reads
 * bodies from, so currency and disclosure cannot disagree about what the Work
 * says. The fixture is migrated rather than deleted: the cases below are the
 * same cases, asked of the shape that now exists.
 */
const NOW: Record<string, string> = {
  [S1]: AS_READ[S1],
  [S2]: 'THE CAMPFIRE METAPHOR\n\nSomeone had banked it, carefully.',
  [S3]: 'SUSTAINING THE FIRE\n\nBy dawn the stones had gone cold.',
};

const nowSections = (): ReadonlyMap<string, EditableSection> => new Map(
  Object.entries(NOW).map(([id, text], i) => {
    const at = text.indexOf('\n\n');
    return [id, {
      id, position: i + 1,
      heading: text.slice(0, at),
      storedText: text,
      body: text.slice(at + 2),
      editable: true,
    } satisfies EditableSection];
  }),
);

const resolve = (over: Partial<CurrencyInput> = {}) => resolveFocusCurrency({
  anchors: anchors(), readState: readState(),
  sections: nowSections(), draftVersion: 37, ...over,
});
const currencyOf = (r: ReturnType<typeof resolve>, id: string) =>
  r.members.find((m) => m.focusMemberId === id)!.currency;

/* ══ C1 — the digest never leaves the server ══════════════════════════════ */

describe('C1 — the historical digest never enters URL, client or wire', () => {
  it('the resolver’s answer carries status only', () => {
    const r = resolve();
    for (const m of r.members) {
      expect(Object.keys(m).sort()).toEqual(['currency', 'focusMemberId', 'sectionRef']);
    }
    expect(JSON.stringify(r)).not.toMatch(/[0-9a-f]{64}/);
  });

  it('⛔ no client module names a digest, and the door carries none', () => {
    for (const src of [askActSrc, doorSrc]) {
      expect(src).not.toMatch(/digest|sha256|hash/i);
    }
    /* Option 3 was REJECTED: a digest is not innocuous merely because it holds
       no prose — beside possession of the Work it becomes a locator, and a URL
       acquires history, log and referrer surfaces. */
    expect(doorSrc).not.toMatch(/WORK_WITH_THIS_PARAM[\s\S]{0,400}digest/);
  });

  it('⛔ the route accepts no digest and returns none', () => {
    expect(routeSrc).not.toMatch(/digest/i);
  });
});

/* ══ C2 — the algorithm and representation are reused ═════════════════════ */

describe('C2 — the exact digest algorithm and representation are reused', () => {
  it('it imports sha256 from the readState module rather than hashing its own', () => {
    expect(currencySrc).toMatch(/import \{ sha256 \} from '@\/lib\/manuscript\/development\/readState'/);
    expect(currencySrc).not.toMatch(/createHash/);
  });

  it('⭐ the digest is over the STORED text, not the projected body', () => {
    /* readState freezes sha256(draft.sections[i].text); resolve.ts compares
       sha256(live.text). Hashing the body — heading prefix removed — would
       differ for every section with a heading, and every passage member would
       read `needs_confirmation` forever. */
    const withHeading = resolve();
    expect(currencyOf(withHeading, 'f1')).toBe('ready');
    const bodyOnly = 'The fire was already lit.';
    const hashedBodyInstead = resolveFocusCurrency({
      anchors: anchors(), readState: readState(), draftVersion: 37,
      /* The same section as the Work holds it, minus the heading prefix: what
         a digest over the BODY would have been taken across. */
      sections: new Map([[S1, {
        id: S1, position: 1, heading: null, storedText: bodyOnly, body: bodyOnly, editable: true,
      } satisfies EditableSection]]),
    });
    expect(currencyOf(hashedBodyInstead, 'f1')).toBe('needs_confirmation');
  });
});

/* ══ C3 · C4 · C5 · C6 — the four verdicts ═══════════════════════════════ */

describe('C3 — a passage whose section digest matches is ready', () => {
  it('S1 is untouched, so its historical offsets still name what they named', () => {
    expect(currencyOf(resolve(), 'f1')).toBe('ready');
  });
});

describe('C4 — a passage whose section digest differs NEEDS CONFIRMATION', () => {
  it('S2 changed, so nothing proves the offsets still denote the same passage', () => {
    expect(currencyOf(resolve(), 'f2')).toBe('needs_confirmation');
  });

  it('⛔ and it is NOT `unavailable` — the section is plainly still there', () => {
    expect(currencyOf(resolve(), 'f2')).not.toBe('unavailable');
    /* A differing digest asserts only that the proof is gone. A sentence
       elsewhere in the section may be all that changed. */
  });
});

describe('C5 — a whole-section member is ready regardless of text changes', () => {
  it('S3 was edited and stays ready — the Focus means this section NOW', () => {
    expect(currencyOf(resolve(), 'f3')).toBe('ready');
  });

  it('⭐ and that is DIFFERENT from what locateCurrent would say', () => {
    /* `locateCurrent` asks "is this observation still supported?" and answers
       `superseded` for a changed section, whole-section ref included. Focus asks
       "can I read this place now?" Two questions, one digest. */
    expect(currencySrc).not.toMatch(/locateCurrent/);
    expect(currencySrc).toMatch(/anchor\.kind === 'section'\) return 'ready'/);
  });
});

describe('C6 — an absent draft section is unavailable', () => {
  it('S4 is gone', () => {
    expect(currencyOf(resolve(), 'f4')).toBe('unavailable');
  });
});

/* ══ C7 — failure is not-yet-known, never "gone" ═════════════════════════ */

describe('C7 — a resolution failure is never reported as absence', () => {
  for (const [name, over] of [
    ['unmeasurable Work', { sections: null }],
    ['no reading', { readState: null }],
    ['no draft version', { draftVersion: null }],
  ] as const) {
    it(`${name} → every member not_yet_known, and NO version claimed`, () => {
      const r = resolve(over as Partial<CurrencyInput>);
      for (const m of r.members) expect(m.currency).toBe('not_yet_known');
      expect(r.resolvedAgainstDraftVersion).toBeNull();
    });
  }

  it('a section with no frozen state is not_yet_known, not unavailable', () => {
    const rs = readState();
    delete (rs.sections as Record<string, unknown>)[S1];
    expect(currencyOf(resolve({ readState: rs }), 'f1')).toBe('not_yet_known');
  });

  it('⛔ and not_yet_known never discloses', () => {
    expect(mayDisclose('not_yet_known')).toBe(false);
    expect(mayDisclose('needs_confirmation')).toBe(false);
    expect(mayDisclose('unavailable')).toBe(false);
    expect(mayDisclose('ready')).toBe(true);
  });
});

/* ══ C8 · C9 · C14 — the client asserts nothing ══════════════════════════ */

describe('C8 — the client cannot assert readability or currency', () => {
  it('⭐ `readable` is gone from what the wire ACCEPTS', () => {
    expect(crossingSrc).not.toMatch(/readonly readable/);
    expect(askActSrc).not.toMatch(/readable: (isReady|true|false)/);
    /* ⛔ Instrument note, C21 class again: a bare /readable/ over the whole
       route matched a refusal SENTENCE ("a focus member was not readable as
       one") and the server's OWN output count — which P12 requires. The
       obligation is about what the route ACCEPTS, so it is scoped to the block
       that parses the request. */
    const parsed = routeSrc.slice(
      routeSrc.indexOf('const parsed: FocusMemberScope[] = [];'),
      routeSrc.indexOf('const requestId = randomUUID();'),
    );
    expect(parsed.length).toBeGreaterThan(100);
    expect(parsed).not.toMatch(/readable|currency|current|ready/i);
  });

  it('⭐ and the server still REPORTS how many it could read — P12 needs that', () => {
    expect(routeSrc).toMatch(/readable: result\.participation\.readable/);
  });

  it('the crossing decides from the SERVER’s currency, not the request', () => {
    expect(crossingSrc).toMatch(/const currency = await deps\.resolveCurrency\(/);
    expect(crossingSrc).toMatch(/if \(!mayDisclose\(currencyOf\.get\(member\.focusMemberId\)/);
    expect(crossingSrc).not.toMatch(/if \(!member\.readable\) continue;/);
  });
});

describe('C9 — a client insisting every place is ready changes nothing', () => {
  it('⭐ THE MUTATION THAT MATTERS: the crossing never reads a client currency claim', () => {
    /* There is no field to set. A request claiming readability has nowhere to
       put the claim, which is stronger than a validated field that could be
       believed on a path someone forgets to validate. */
    const scope = crossingSrc.slice(
      crossingSrc.indexOf('export interface FocusMemberScope'),
      crossingSrc.indexOf('export interface CanonicalCognitionPort'),
    );
    expect(scope.length).toBeGreaterThan(50);
    expect(scope).not.toMatch(/readable|currency|current|ready/i);
  });

  it('and the anchors are re-derived from the frozen observation, not the request', () => {
    expect(resolverSrc).toMatch(/focusAnchorsFor\(observation\.evidenceRefs\)/);
    expect(resolverSrc).toMatch(/if \(match\) anchors\.push/);
  });
});

describe('C14 — reintroducing client `readable` as crossing authority fails', () => {
  it('the scope type has no readability field, and the loop has no such guard', () => {
    expect(crossingSrc).not.toMatch(/member\.readable/);
    expect(rawOf('focusCrossing.ts')).toMatch(/THERE IS DELIBERATELY NO `readable` HERE/);
  });
});

/* ══ C10 · C11 · C12 — the version the answers describe ══════════════════ */

describe('C10 — the result records the draft version it describes', () => {
  it('a successful resolution names the version', () => {
    expect(resolve().resolvedAgainstDraftVersion).toBe(37);
  });
});

describe('C11 — a stale resolution authorizes nothing', () => {
  it('v37 answers do not describe v38 prose', () => {
    expect(currencyStillDescribes(resolve(), 38)).toBe(false);
    expect(currencyStillDescribes(resolve(), 37)).toBe(true);
  });

  it('an unresolved currency describes no version at all', () => {
    const r = resolve({ sections: null });
    expect(currencyStillDescribes(r, 37)).toBe(false);
    expect(currencyStillDescribes(r, null)).toBe(false);
  });

  it('⭐ the crossing REFUSES on a version mismatch — no mixed truth', () => {
    expect(crossingSrc).toMatch(/currencyStillDescribes\(currency, snapshot\.snapshot\.version\)/);
    expect(crossingSrc).toMatch(/failure: 'currency_stale'/);
    expect(crossingSrc).toMatch(/the Work moved between currency and read/);
  });
});

describe('C12 — Ask independently re-resolves currency', () => {
  it('the crossing resolves BEFORE any boundary is established', () => {
    const body = crossingSrc.slice(crossingSrc.indexOf('export async function performFocusCrossing'));
    const iResolve = body.indexOf('deps.resolveCurrency(');
    const iBoundary = body.indexOf('establishDisclosureBoundary({');
    expect(iResolve).toBeGreaterThan(-1);
    expect(iBoundary).toBeGreaterThan(iResolve);
  });

  it('⛔ and it takes no preflight result from the request', () => {
    const req = crossingSrc.slice(
      crossingSrc.indexOf('export interface FocusCrossingRequest'),
      crossingSrc.indexOf('export type FocusCrossingResult'),
    );
    expect(req).not.toMatch(/currency|resolvedAgainst|preflight/i);
  });
});

/* ══ C13 — an unverified member is never read and never receipted ════════ */

describe('C13 — a member that is not ready gets no receipt and no body read', () => {
  it('only ready members reach a boundary, and only they are read', () => {
    const body = crossingSrc.slice(crossingSrc.indexOf('export async function performFocusCrossing'));
    const gate = body.indexOf('if (!mayDisclose(');
    const boundary = body.indexOf('establishDisclosureBoundary({');
    const read = body.indexOf('deps.readDraft(');
    expect(gate).toBeGreaterThan(-1);
    expect(boundary).toBeGreaterThan(gate);
    expect(read).toBeGreaterThan(boundary);
    // The read is scoped to the members that were established, not to all.
    expect(body).toMatch(/sectionRefs: established\.map\(\(e\) => e\.member\.sectionRef\)/);
  });

  it('⛔ and the participation status comes from the server’s currency', () => {
    expect(crossingSrc).toMatch(/const c = currencyOf\.get\(m\.focusMemberId\)/);
    expect(crossingSrc).not.toMatch(/!m\.readable/);
  });
});

/* ══ ⭐ the two acts stay apart ══════════════════════════════════════════ */

describe('resolution is not disclosure', () => {
  it('⛔ the resolver mints no receipt, calls no model, and returns no content', () => {
    expect(resolverSrc).not.toMatch(/establishDisclosureBoundary|mintDisclosure|confirmDisclosure/);
    expect(resolverSrc).not.toMatch(/getMaiaResponse|anthropic|prepareCanonicalHandoff/);
    expect(resolverSrc).not.toMatch(/body|text:|content/);
  });

  it('⭐ nothing enters MAIA because the Focus panel happened to open', () => {
    expect(rawOf('focusCurrencyResolver.ts')).toMatch(/no MAIA · no cognition · no receipt/);
    expect(resolverSrc).toMatch(/loadFrozenDevelopmentalReading|loadLiveWork/);
  });
});
