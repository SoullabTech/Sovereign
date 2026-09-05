/**
 * WS2-05B-8B-02c-2 · gate 7, as a property of the program.
 *
 * The Ask runtime must be STRUCTURALLY INCAPABLE of reaching a canonical write.
 * A comment saying so is not that; this walks the actual module graph from the
 * route and asserts what is and is not in it.
 *
 * Comments are stripped before every check. The modules deliberately DISCUSS the
 * things they must not reach ("there is no INSERT here"), and a grep that counts
 * prose would pass or fail for the wrong reason either way.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const ASK_LIB = join(ROOT, 'lib', 'manuscript', 'ask');
const ASK_ROUTE = join(ROOT, 'app', 'api', 'sovereign', 'manuscripts', '[id]', 'ask', 'route.ts');
const ASK_CLIENT = join(ROOT, 'lib', 'writersStudio', 'askClient.ts');
const ASK_PANEL = join(ROOT, 'app', 'writers-studio', 'canvas', 'AskMaia.tsx');
/* BUILD-07E — the developmental lane's panel. It posts to the same endpoint and
   is therefore part of the same runtime, gated here rather than in the 07D
   develop-surface gate: what it may not do is a property of the Ask runtime. */
const DEV_PANEL = join(ROOT, 'app', 'writers-studio', 'develop', 'ObservationDialogue.tsx');

/* WHERE THE BOUNDARY IS, SAID PLAINLY. The Ask runtime is these files: the ask
   library, the ask route, its client and its panel. `StructureReview` is NOT in
   it — that is the 05B REVIEW surface, and it holds `applyGesture` legitimately,
   because the review gesture is precisely where "Do it" hands off to. The claim
   is not that no code near a conversation can write; it is that no code the
   conversation itself runs through can. Widening this list to StructureReview
   would make the gate fail for the right reason at the wrong address. */

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function askFiles(): { path: string; code: string }[] {
  const files = readdirSync(ASK_LIB)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => join(ASK_LIB, f));
  files.push(ASK_ROUTE, ASK_CLIENT, ASK_PANEL, DEV_PANEL);
  return files.map((p) => ({ path: p, code: stripComments(readFileSync(p, 'utf8')) }));
}

function importsOf(code: string): string[] {
  return [...code.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
}

describe('the Ask runtime cannot write to the Work', () => {
  /* The modules that can mutate a proposal, the reviewed tree, or canonical
     structure. If any appears in the Ask graph, the capability is one dropped
     `type` keyword from being reachable. */
  const FORBIDDEN = [
    'structure/proposalStore',
    'structure/structureService',
    'structure/reviewOperationParser',
    'structure/authorStructure',
    'writersStudio/reviewClient',
  ];

  it('imports no module that can mutate a proposal or canonical structure', () => {
    for (const { path, code } of askFiles()) {
      for (const spec of importsOf(code)) {
        for (const bad of FORBIDDEN) {
          expect(`${path} :: ${spec}`).not.toContain(bad);
        }
      }
    }
  });

  it('names no adoption or apply path anywhere in its code', () => {
    for (const { path, code } of askFiles()) {
      /* Both names are guarded. `adoptProposal` is the superseded 7f5acfa9b
         symbol and `authorStructureFromProposal` is the rebuilt command; a
         rename must never be able to quietly retire this prohibition, and
         guarding a symbol that no longer exists costs nothing. */
      for (const forbidden of [
        'applyGesture', 'updateReviewed', 'applyReviewOperation',
        'adoptProposal', 'authorStructureFromProposal', 'planAuthoredStructure',
      ]) {
        expect(`${path}::${code}`.includes(forbidden)).toBe(false);
      }
    }
  });

  it('writes to ask_threads and ask_turns and to no other table', () => {
    const WRITE = /\b(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([a-z_]+)/gi;
    const allowed = new Set(['ask_threads', 'ask_turns']);
    for (const { path, code } of askFiles()) {
      for (const m of code.matchAll(WRITE)) {
        expect(`${path} writes ${m[2]}`).toBe(`${path} writes ${m[2]}`);
        expect(allowed.has(m[2].toLowerCase())).toBe(true);
      }
    }
  });

  it('never selects a section body', () => {
    for (const { path, code } of askFiles()) {
      /* `body` as a column of manuscript_sections. The turn column is also
         called `body`, so the check is on the section select specifically. */
      const selectsSectionBody = /SELECT[^;]*\bbody\b[^;]*FROM\s+manuscript_sections/is.test(code);
      expect(`${path} selects section body: ${selectsSectionBody}`)
        .toBe(`${path} selects section body: false`);
    }
  });

  it('sends no tools to the model, so there is no read-request path', () => {
    /* BOTH READERS. The developmental lane gets its own standing instructions
       and its own module; a capability absent from one and present in the other
       would be a read-request path with a different name. */
    for (const f of ['askReader.ts', 'developmentalAskReader.ts']) {
      const reader = stripComments(readFileSync(join(ASK_LIB, f), 'utf8'));
      expect(`${f}: ${/\btools\s*:/.test(reader)}`).toBe(`${f}: false`);
      expect(`${f}: ${reader.includes('request_sections')}`).toBe(`${f}: false`);
    }
  });

  /* ── BUILD-07E ───────────────────────────────────────────────────────── */

  it('the developmental lane reaches the reading through a SELECT-only loader, never its store', () => {
    /* `developmentalReading/store` exports `freezeAndStore`, which INSERTs.
       Importing it for a reader would put a writer in the Ask module graph —
       the precise reason `frozenReading` and `frozenDevelopmentalReading`
       exist instead of the stores they shadow. */
    for (const { path, code } of askFiles()) {
      for (const spec of importsOf(code)) {
        const isValueImport = !/import\s+type/.test(
          code.slice(Math.max(0, code.indexOf(spec) - 200), code.indexOf(spec)));
        if (isValueImport) {
          expect(`${path} :: ${spec}`).not.toContain('developmentalReading/store');
          expect(`${path} :: ${spec}`).not.toContain('developmentalReading/freeze');
          expect(`${path} :: ${spec}`).not.toContain('developmentalReading/commission');
        }
      }
    }
  });

  it('evidence reaches the model only through recoverEvidence, never a raw slice', () => {
    const ctx = stripComments(
      readFileSync(join(ASK_LIB, 'developmentalContext.ts'), 'utf8'));
    /* The laundering path, forbidden as a symbol: a context that sliced text
       itself would be assembling evidence rather than recovering it, and the
       digest check would no longer stand between the model and current prose. */
    expect(ctx).not.toMatch(/\.slice\(/);
    expect(ctx).not.toContain('codePointBoundaries');
    expect(ctx).toContain('recoverEvidence');
  });

  it('nothing in the ask runtime can mutate a frozen developmental reading', () => {
    for (const { path, code } of askFiles()) {
      for (const forbidden of ['freezeAndStore', 'freezeReading', 'classifyObservations']) {
        expect(`${path}::${forbidden}::${code.includes(forbidden)}`)
          .toBe(`${path}::${forbidden}::false`);
      }
    }
  });
});
