/**
 * WS-DISCLOSURE-ORIENTATION-TRANSPORT-01 — T1–T7 and F1–F7.
 *
 * ⭐ Two evidence classes, kept apart on purpose. The DERIVATION is pure, so its
 * laws are exercised for real. The ROUTE needs a database, so what is asserted
 * about it here is what its SOURCE can be made to say — ordering, single
 * derivation, and the absence of forbidden transport. ⛔ Source assertions are
 * not a witness that the wire carries the right bytes; that is the lane's own
 * runtime witness, and this file does not pretend to stand in for it.
 *
 * Comments are stripped before every source scan — the route deliberately
 * DISCUSSES what it must not transport, and a scanner that counted prose would
 * fail the file for documenting its own compliance (the C21 lesson).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { deriveSectionOrientations, frozenOrdinal } from '../frozenOrientation';
import { authorizationCovers } from '../../ask/bodyRequirement';

const ROUTE = join(
  __dirname, '..', '..', '..', '..',
  'app', 'api', 'sovereign', 'manuscripts', '[id]', 'ask', 'route.ts');

const routeSource = (): string => readFileSync(ROUTE, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * ⚠️ The ordering law is a claim about ONE function, not about the file. `POST`
 * opens a thread on the non-developmental path long before `developmentalTurn`
 * is reached, and a file-scoped scan would read that as a mutation preceding the
 * refusal — which it is not, because control never arrives from there. So the
 * scan is narrowed to the function whose ordering is actually being asserted.
 */
const developmentalTurnSource = (): string => {
  const src = routeSource();
  const start = src.indexOf('async function developmentalTurn(');
  expect(start).toBeGreaterThan(-1);
  const next = src.indexOf('\nasync function ', start + 1);
  return src.slice(start, next === -1 ? undefined : next);
};

/* Deliberately chosen so LEXICAL order and MANUSCRIPT order disagree: sorted by
   id the sections read z, m, a — in the work they sit a, m, z. */
const Z = 'zz-first-in-work';
const M = 'mm-second-in-work';
const A = 'aa-third-in-work';
const TOPOLOGY = [Z, 'filler-1', M, 'filler-2', 'filler-3', A];

const oriented = (required: readonly string[]) => {
  const d = deriveSectionOrientations(TOPOLOGY, required);
  if (d.kind !== 'oriented') throw new Error(`expected oriented, got ${d.kind}`);
  return d.orientations;
};

describe('T1 · the ordinal comes from the frozen topology of this reading', () => {
  it('counts position in the topology it is given', () => {
    expect(frozenOrdinal(TOPOLOGY, Z)).toBe(1);
    expect(frozenOrdinal(TOPOLOGY, M)).toBe(3);
    expect(frozenOrdinal(TOPOLOGY, A)).toBe(6);
  });

  it('the route derives from the frozen readState, not from the live Work', () => {
    expect(routeSource()).toMatch(
      /deriveSectionOrientations\(\s*reading!\.readState\.sectionTopology,\s*bodyReq\.sections\)/);
  });
});

describe('T2 · only the derived required identities are oriented', () => {
  it('orients exactly the required set', () => {
    expect(oriented([M]).map((o) => o.sectionRef)).toEqual([M]);
  });

  it('the route passes the DERIVED set, never a client value', () => {
    const src = routeSource();
    expect(src).toContain('bodyReq.sections)');
    expect(src).not.toMatch(/deriveSectionOrientations\([^)]*authorizes/);
  });
});

describe('T3 · the whole topology never crosses', () => {
  it('returns only the required subset, never the filler around it', () => {
    const refs = oriented([Z, A]).map((o) => o.sectionRef);
    expect(refs).toEqual([Z, A]);
    expect(refs).not.toContain('filler-1');
  });

  it('no response in the route transports sectionTopology', () => {
    const src = routeSource();
    expect(src).not.toMatch(/sectionTopology:\s/);
  });
});

describe('T4 · no authored character participates', () => {
  it('an orientation carries exactly sectionRef and ordinal', () => {
    expect(Object.keys(oriented([M])[0]!).sort()).toEqual(['ordinal', 'sectionRef']);
  });

  it('the route transports no heading, title or kind beside the orientation', () => {
    const src = routeSource();
    for (const forbidden of ['heading:', 'title:', 'sectionKind:', 'structureContext:']) {
      expect(src).not.toContain(forbidden);
    }
  });
});

describe('T5 · a required identity absent from the topology fails closed', () => {
  it('refuses rather than orienting what it cannot locate', () => {
    const d = deriveSectionOrientations(TOPOLOGY, [M, 'never-read']);
    expect(d).toEqual({ kind: 'unlocatable', unlocatableCount: 1 });
  });

  it('emits no ordinal for the located siblings either', () => {
    const d = deriveSectionOrientations(TOPOLOGY, [M, 'never-read']);
    expect(d).not.toHaveProperty('orientations');
  });

  it('frozenOrdinal returns null, never 0 and never a guess', () => {
    expect(frozenOrdinal(TOPOLOGY, 'never-read')).toBeNull();
  });

  it('the refusal names a count and no identifier', () => {
    const d = deriveSectionOrientations(TOPOLOGY, ['never-read', 'nor-this']);
    expect(JSON.stringify(d)).not.toContain('never-read');
    expect(d).toEqual({ kind: 'unlocatable', unlocatableCount: 2 });
  });

  it('the route refuses with a non-200 before any mutation it could reach', () => {
    const src = developmentalTurnSource();
    const refuse = src.indexOf("refusal: 'section_orientation_unavailable'");
    expect(refuse).toBeGreaterThan(-1);
    expect(src.slice(refuse, refuse + 200)).toContain('status: 500');
    for (const mutation of [
      'await openThread(', 'await appendTurn(', 'await mintAct(', 'await claimAct(',
      'await loadRevisionContent(',
    ]) {
      expect(src.indexOf(mutation, refuse)).toBeGreaterThan(refuse);
      expect(src.lastIndexOf(mutation, refuse)).toBe(-1);
    }
  });

  it('the derivation itself precedes every one of them', () => {
    const src = developmentalTurnSource();
    const derive = src.indexOf('deriveSectionOrientations(');
    expect(derive).toBeGreaterThan(-1);
    for (const mutation of [
      'await openThread(', 'await appendTurn(', 'await mintAct(', 'await claimAct(',
    ]) {
      expect(src.lastIndexOf(mutation, derive)).toBe(-1);
    }
  });
});

describe('T6 · both orientation-bearing outcomes use one derivation', () => {
  it('the route derives exactly once and reuses the value', () => {
    const src = routeSource();
    expect(src.match(/deriveSectionOrientations\(/g)).toHaveLength(1);
    expect(src.match(/sectionOrientations: orientation\.orientations,/g)).toHaveLength(2);
  });
});

describe('T7 · the ordinal is never authority', () => {
  it('sectionRef is preserved as the identity', () => {
    expect(oriented([M])[0]!.sectionRef).toBe(M);
  });

  it('the route never reads an ordinal back off the request', () => {
    const src = routeSource();
    expect(src).not.toMatch(/ordinal/);
  });
});

describe('F1 · lexical order deliberately differs from manuscript order', () => {
  it('the ordinal follows the topology, not the id', () => {
    const required = [A, M, Z].slice().sort();          // lexical: aa, mm, zz
    expect(required).toEqual([A, M, Z]);
    expect(oriented(required)).toEqual([
      { sectionRef: Z, ordinal: 1 },
      { sectionRef: M, ordinal: 3 },
      { sectionRef: A, ordinal: 6 },
    ]);
  });
});

describe('F2 · a non-contiguous scope keeps its real positions', () => {
  it('is 2, 5, 9 — never renumbered 1, 2, 3', () => {
    const t = ['s1', 'B', 's3', 's4', 'E', 's6', 's7', 's8', 'I'];
    expect(oriented2(t, ['B', 'E', 'I'])).toEqual([
      { sectionRef: 'B', ordinal: 2 },
      { sectionRef: 'E', ordinal: 5 },
      { sectionRef: 'I', ordinal: 9 },
    ]);
  });
});

function oriented2(t: readonly string[], required: readonly string[]) {
  const d = deriveSectionOrientations(t, required);
  if (d.kind !== 'oriented') throw new Error(d.kind);
  return d.orientations;
}

describe('F3 · an unlocatable identity produces no control result', () => {
  it('never returns an oriented result with a manufactured ordinal', () => {
    const d = deriveSectionOrientations(TOPOLOGY, ['never-read']);
    expect(d.kind).toBe('unlocatable');
  });
});

describe('F4 · sentinel authored titles never appear', () => {
  it('a topology whose ids collide with prose still yields only ids and ordinals', () => {
    const sentinel = 'THE-AUTHORS-SECRET-TITLE';
    const t = ['x', sentinel, 'y'];
    expect(oriented2(t, [sentinel])).toEqual([{ sectionRef: sentinel, ordinal: 2 }]);
  });
});

describe('F5 · unrelated sections do not cross', () => {
  it('neither their identity nor their ordinal appears', () => {
    const out = JSON.stringify(oriented([M]));
    expect(out).not.toContain('filler-1');
    expect(out).not.toContain(Z);
    expect(out).not.toContain(A);
  });
});

describe('F6 · BODY_SCOPE_INCOMPLETE maps identically to ACT 2', () => {
  it('the same inputs give the same mapping', () => {
    expect(oriented([Z, M, A])).toEqual(oriented([A, M, Z]));
  });

  it('caller-supplied order does not reorder the result', () => {
    expect(oriented([A, Z, M]).map((o) => o.ordinal)).toEqual([1, 3, 6]);
  });
});

describe('F7 · an ordinal submitted as authorization satisfies nothing', () => {
  it('authorizing "5" does not authorize the section sitting 5th', () => {
    const t = ['s1', 's2', 's3', 's4', 'FIFTH'];
    expect(oriented2(t, ['FIFTH'])).toEqual([{ sectionRef: 'FIFTH', ordinal: 5 }]);
    expect(authorizationCovers(['5'], ['FIFTH'])).toBe(false);
    expect(authorizationCovers(['FIFTH'], ['FIFTH'])).toBe(true);
  });
});
