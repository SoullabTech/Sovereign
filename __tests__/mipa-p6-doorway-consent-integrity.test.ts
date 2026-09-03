/**
 * MIPA PHASE 0 — P6 CERTIFICATION: DOORWAY CONSENT INTEGRITY
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P6
 *
 * ── THE GOVERNING INVARIANT ─────────────────────────────────────────────────
 *
 *   `contextual_doorway` is future-return authority and requires certifiable
 *   member-conferred authorization.
 *
 *     CONTENT AUTHORSHIP    Who said or wrote this?
 *              ≠
 *     EPISTEMIC AUTHORITY   What kind of claim is it?
 *              ≠
 *     RETURN AUTHORITY      Who authorized MAIA to resurface it?
 *
 * Not practitioner intent. Not system inference. Not participation in the
 * original encounter. Not absence of an objection. Not a column default.
 *
 * ── WHY THE CLOSED SET IS FEASIBLE HERE ─────────────────────────────────────
 *
 * `return_preference` is a discrete persisted field on ONE table. The
 * certification boundary is every ASSIGNMENT of the permission — not every
 * place memory might eventually surface. That is a far cleaner boundary than
 * the P3 prompt problem, and the suite enumerates writers from source.
 *
 * ── GRADE, STATED HONESTLY ──────────────────────────────────────────────────
 *
 * Grade A for construction: the brand symbol on `AuthorizedReturnPreference` is
 * not exported, so no module can build the value, and the permissive
 * constructor throws unless the acting principal IS the subject.
 *
 * Grade B for one arm: a deliberate `as unknown as` cast can forge the branded
 * type. That escape hatch is DETECTED here rather than claimed impossible.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  memberConferredReturn,
  noContextualReturn,
  returnPreferenceValue,
  permitsContextualReturn,
  ReturnAuthorityError,
} from '@/lib/psyche/returnAuthority';

const REPO = path.resolve(__dirname, '..');
const BASELINE = path.join(REPO, 'database/baseline/0001_baseline_2026-09-01.sql');
const MIGRATIONS = path.join(REPO, 'database/migrations');
const AUTHORITY = path.join(REPO, 'lib/psyche/returnAuthority.ts');
const PORTFOLIO = path.join(REPO, 'lib/psyche/portfolio.ts');
const BRIDGE = path.join(REPO, 'app/api/studio/with-me/sessions/[sessionId]/route.ts');
const LOADER = path.join(REPO, 'lib/maia/memoryAtomsLoader.ts');
const GESTURE_ROUTE = path.join(REPO, 'app/api/psyche/portfolio/atoms/[id]/gesture/route.ts');

const SKIP = /__tests__|\.test\.ts|node_modules|\.next/;

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (p: string): void => {
    let st: fs.Stats;
    try {
      st = fs.statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        const q = path.join(p, f);
        if (!SKIP.test(q)) walk(q);
      }
      return;
    }
    if (/\.tsx?$/.test(p) && !SKIP.test(p)) out.push(path.relative(REPO, p));
  };
  walk(path.join(REPO, 'lib'));
  walk(path.join(REPO, 'app'));
  walk(path.join(REPO, 'components'));
  return out;
}

const FILES = sourceFiles();

/** Modules that reference a name outside imports and prose. */
function stripImportsAndProse(src: string): string {
  return src
    .replace(/^import\s[\s\S]*?from\s+'[^']+';/gm, '')
    .replace(/^import\s+'[^']+';/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Every source module that ASSIGNS `return_preference` — the P6 closed set.
 *
 * An assignment is an INSERT naming the column, a `SET return_preference`, or a
 * literal occurrence of a permission value outside prose. Reads (`SELECT`,
 * `WHERE ... IN (...)`, a type union, a UI comparison) are not assignments and
 * are deliberately not swept in: a gate that cannot tell a read from a write
 * has no closed set at all.
 */
function assigningModules(): string[] {
  const hits: string[] = [];
  for (const f of FILES) {
    const body = stripImportsAndProse(fs.readFileSync(path.join(REPO, f), 'utf8'));
    // An INSERT that names the column, or an UPDATE that sets it.
    const insertsColumn =
      /INSERT INTO member_memory_atoms[\s\S]{0,800}?\breturn_preference\b/i.test(body);
    const setsColumn = /SET\s+return_preference\s*=/i.test(body);
    // The boundary module itself constructs the permission value.
    const constructsAuthority = /AuthorizedReturnPreference/.test(body) && /export function/.test(body);
    //
    // A LITERAL-PROXIMITY HEURISTIC WAS TRIED AND REMOVED. It read
    //   `WHERE return_preference IN ('contextual_doorway', 'ritual_review_opt_in')`
    // in the ambient loader as an assignment — a READ classified as a WRITE,
    // which would have put a reader inside the writer closed set and made the
    // set meaningless. The innocent-negative control in §7 is what caught it.
    // The three structural forms above cannot confuse a comparison with an
    // assignment, because a WHERE clause contains neither.
    if (insertsColumn || setsColumn || constructsAuthority) hits.push(f);
  }
  return hits.sort();
}

/** Schema default for a column, from the baseline plus later ALTERs. */
function columnDefault(table: string, column: string): string {
  const baseline = fs.readFileSync(BASELINE, 'utf8').split('\n');
  const start = baseline.findIndex((l) =>
    new RegExp(`^CREATE TABLE (?:IF NOT EXISTS )?"public"\\."${table}" \\($`).test(l),
  );
  let current = '';
  if (start >= 0) {
    for (let i = start + 1; i < baseline.length; i++) {
      if (/^\);/.test(baseline[i])) break;
      const m = new RegExp(`^\\s+"${column}"\\s+.*?DEFAULT\\s+'([a-z_]+)'`).exec(baseline[i]);
      if (m) current = m[1];
    }
  }
  // Later migrations win, applied in filename order — the same order the
  // migration runner uses. Reading only the baseline would report a default
  // that was changed months ago.
  for (const f of fs.readdirSync(MIGRATIONS).filter((x) => x.endsWith('.sql')).sort()) {
    const body = fs.readFileSync(path.join(MIGRATIONS, f), 'utf8');
    const re = new RegExp(
      `ALTER TABLE\\s+(?:IF EXISTS\\s+)?"?(?:public"?\\."?)?${table}"?[\\s\\S]{0,300}?ALTER COLUMN\\s+"?${column}"?\\s+SET DEFAULT\\s+'([a-z_]+)'`,
      'gi',
    );
    for (const m of body.matchAll(re)) current = m[1];
  }
  return current;
}

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('P6 §0 — the instrument found its subject', () => {
  it('the source scan reaches a real module set', () => {
    expect(FILES.length).toBeGreaterThan(1000);
    expect(FILES).toContain('lib/psyche/portfolio.ts');
    expect(FILES).toContain('app/api/studio/with-me/sessions/[sessionId]/route.ts');
  });

  it('the assignment scan finds a nonzero, bounded writer set', () => {
    // Zero writers would make every "no writer may…" assertion vacuous; the
    // whole repo would mean the scan cannot tell a write from a read.
    const w = assigningModules();
    expect(w.length).toBeGreaterThan(0);
    expect(w.length).toBeLessThan(10);
  });

  it('the schema reader resolves a real default, and later ALTERs win', () => {
    expect(columnDefault('member_memory_atoms', 'return_preference')).toMatch(
      /^(member_pulled|contextual_doorway|ritual_review_opt_in)$/,
    );
    expect(columnDefault('member_memory_atoms', 'no_such_column')).toBe('');
  });
});

// ── §1 — PROOF 1: every assigner is classified ───────────────────────────────

describe('P6 §1 — the writer closed set', () => {
  it('exactly three modules assign the permission, and each is classified', () => {
    // A new assigner fails BECAUSE IT IS NEW. This is the certification
    // boundary P6 is built on: the permission is a discrete persisted field, so
    // its assignments are enumerable in a way prompt composition never was.
    expect(assigningModules()).toEqual([
      'app/api/studio/with-me/sessions/[sessionId]/route.ts', // practitioner bridge — no member authority
      'lib/psyche/portfolio.ts', // member Keep + member set_return_preference gesture
      'lib/psyche/returnAuthority.ts', // the boundary itself
    ]);
  });

  it('EVERY BINDING SITE goes through the boundary, not just the module', () => {
    // A file-level `does returnPreferenceValue appear anywhere` check is not a
    // gate. Mutation Q11 left the Keep site untouched — so the name still
    // appeared — and swapped the GESTURE site for
    // `gesture.preference ?? 'contextual_doorway'`. It passed. This is the
    // N10 lesson arriving a second time: a repair present at one site and a
    // check written at file scope certify nothing about the other sites.
    const sites: Array<[string, RegExp]> = [
      // the Keep INSERT's parameter array
      ['lib/psyche/portfolio.ts', /returnPreferenceValue\(keepReturnAuthority\),/],
      // the set_return_preference UPDATE's parameter array
      ['lib/psyche/portfolio.ts', /params = \[memberId, atomId, returnPreferenceValue\(authorized\)\];/],
      // the practitioner bridge's parameter array
      [
        'app/api/studio/with-me/sessions/[sessionId]/route.ts',
        /returnPreferenceValue\(practitionerReturnAuthority\),/,
      ],
    ];
    for (const [f, re] of sites) {
      const src = fs.readFileSync(path.join(REPO, f), 'utf8');
      expect({ f, site: re.source, bound: re.test(src) }).toEqual({
        f,
        site: re.source,
        bound: true,
      });
    }
  });

  it('a permission LITERAL appears in executable code only as a member’s own act', () => {
    // The generalizing form of the same rule: outside the boundary, the only
    // legitimate place to write `'contextual_doorway'` is as the argument a
    // member's gesture hands to `memberConferredReturn`. A fallback, a default,
    // a coalesce or a copy is none of those.
    for (const f of assigningModules()) {
      if (f === 'lib/psyche/returnAuthority.ts') continue;
      const body = stripImportsAndProse(fs.readFileSync(path.join(REPO, f), 'utf8'));
      const offending = body
        .split('\n')
        .filter((l) => /'contextual_doorway'|'ritual_review_opt_in'/.test(l))
        // SQL text naming the COLUMN is not a literal assignment of a value.
        .filter((l) => !/return_preference IN \(/.test(l))
        // The one sanctioned form: handed to the member-authority constructor.
        .filter((l) => !/memberConferredReturn\($/.test(l.trim()))
        .filter((l) => !/^\s*'contextual_doorway',$/.test(l));
      expect({ f, offending: offending.map((l) => l.trim()) }).toEqual({ f, offending: [] });
    }
  });

  it('the column is named explicitly by every INSERT, so no write inherits the default', () => {
    for (const f of assigningModules()) {
      const src = fs.readFileSync(path.join(REPO, f), 'utf8');
      for (const m of src.matchAll(/INSERT INTO member_memory_atoms[\s\S]{0,900}?\)\s*VALUES/gi)) {
        expect({ f, namesColumn: /\breturn_preference\b/.test(m[0]) }).toEqual({
          f,
          namesColumn: true,
        });
      }
    }
  });
});

// ── §2 — PROOF 2: a non-member cannot create member doorway consent ──────────

describe('P6 §2 — only the member confers return authority', () => {
  it('a practitioner acting on another member’s material is refused', () => {
    expect(() =>
      memberConferredReturn('contextual_doorway', {
        actingMemberId: OTHER,
        subjectMemberId: MEMBER,
        gesture: 'set_return_preference',
      }),
    ).toThrow(ReturnAuthorityError);
  });

  it('the identity check is REACHABLE, not merely present', () => {
    // Presence of text says nothing about reachability — the P1 lesson. Q4
    // neutralised the guard with `false &&` while leaving every string intact.
    const src = fs.readFileSync(AUTHORITY, 'utf8');
    const guard = /if \(([^)]*actingMemberId !== evidence\.subjectMemberId[^)]*)\) \{/.exec(src);
    expect(guard).not.toBeNull();
    expect(guard![1].trim()).toBe('evidence.actingMemberId !== evidence.subjectMemberId');
    // …and it actually throws for a non-subject actor, at runtime.
    expect(() =>
      memberConferredReturn('contextual_doorway', {
        actingMemberId: OTHER,
        subjectMemberId: MEMBER,
        gesture: 'keep',
      }),
    ).toThrow(/only be conferred by the member/);
  });

  it('the check is on IDENTITY, not on a role list', () => {
    // A role allowlist is a thing that grows. Acting principal === subject is
    // the property that does not need maintaining.
    const src = fs.readFileSync(AUTHORITY, 'utf8');
    expect(src).toMatch(/actingMemberId !== evidence\.subjectMemberId/);
    for (const role of ['practitioner', 'facilitator', 'admin', 'isAdmin', 'role ===']) {
      expect({ role, gatesOnRole: new RegExp(`if\\s*\\([^)]*${role}`).test(src) }).toEqual({
        role,
        gatesOnRole: false,
      });
    }
  });

  it('a missing acting or subject identity is refused, not treated as a match', () => {
    expect(() =>
      memberConferredReturn('contextual_doorway', {
        actingMemberId: '',
        subjectMemberId: '',
        gesture: 'keep',
      }),
    ).toThrow(ReturnAuthorityError);
  });

  it('the permission is UNCONSTRUCTABLE outside the boundary', () => {
    const src = fs.readFileSync(AUTHORITY, 'utf8');
    // The brand is declared and deliberately not exported: a module that cannot
    // name the key cannot build the value.
    expect(src).toMatch(/declare const RETURN_AUTHORITY_BRAND: unique symbol;/);
    expect(src).not.toMatch(/export (?:const|declare const) RETURN_AUTHORITY_BRAND/);
    // Exactly two constructors.
    const ctors = [...src.matchAll(/^export function (\w+)\(/gm)].map((m) => m[1]);
    expect(ctors.sort()).toEqual(
      ['memberConferredReturn', 'noContextualReturn', 'permitsContextualReturn', 'returnPreferenceValue'].sort(),
    );
  });

  it('GRADE B ARM — a cast could forge the brand, so casts are DETECTED', () => {
    // Stated rather than claimed impossible. The two inside the boundary are
    // the constructors' own returns.
    const offenders: string[] = [];
    for (const f of FILES) {
      const body = stripImportsAndProse(fs.readFileSync(path.join(REPO, f), 'utf8'));
      if (!/as\s+(?:unknown\s+as\s+)?AuthorizedReturnPreference/.test(body)) continue;
      if (f === 'lib/psyche/returnAuthority.ts') continue;
      offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});

// ── §3 — PROOF 3: the practitioner hardcoding cannot come back ───────────────

describe('P6 §3 — the practitioner bridge', () => {
  it('no longer hardcodes a contextual doorway', () => {
    const src = fs.readFileSync(BRIDGE, 'utf8');
    const stripped = stripImportsAndProse(src);
    expect(stripped).not.toMatch(/'contextual_doorway'/);
    expect(stripped).toMatch(/noContextualReturn\(/);
  });

  it('binds the permission as a PARAMETER, not a literal in the statement', () => {
    const src = fs.readFileSync(BRIDGE, 'utf8');
    const stmt = /INSERT INTO member_memory_atoms[\s\S]*?RETURNING id/.exec(src);
    expect(stmt).not.toBeNull();
    expect(stmt![0]).toMatch(/'observed', 'active', \$8,/);
    expect(src).toMatch(/returnPreferenceValue\(practitionerReturnAuthority\)/);
  });

  it('withholding a permission is not withholding the material', () => {
    // PROOF 6 — practitioner material remains attributed rather than discarded
    // to solve a consent problem.
    const src = fs.readFileSync(BRIDGE, 'utf8');
    const stmt = /INSERT INTO member_memory_atoms[\s\S]*?RETURNING id/.exec(src)![0];
    expect(stmt).toMatch(/'practitioner_observation'/);
    expect(stmt).toMatch(/facilitator_id/);
    expect(stmt).toMatch(/'observed'/); // epistemological_status
    expect(stmt).toMatch(/provenance/);
    expect(stmt).toMatch(/'practitioner-observation'/); // generated_by
  });

  it('the withheld authority resolves to the schema’s own documented value', () => {
    const a = noContextualReturn('practitioner-authored; no member return authority exists');
    expect(returnPreferenceValue(a)).toBe('member_pulled');
    expect(permitsContextualReturn(a)).toBe(false);
    // The value is not forced into a misleading enum: the schema itself defines
    // member_pulled as "only when member asks directly".
    const orig = fs.readFileSync(
      path.join(MIGRATIONS, '20260521000001_member_memory_atoms.sql'),
      'utf8',
    );
    expect(orig).toMatch(/member_pulled: only when member asks directly/);
  });

  it('a withheld authority must state its reason', () => {
    expect(() => noContextualReturn('')).toThrow(ReturnAuthorityError);
    expect(() => noContextualReturn('nope')).toThrow(ReturnAuthorityError);
  });
});

// ── §4 — PROOF 4: a default cannot resolve permissively ─────────────────────

describe('P6 §4 — defaults and omissions fail closed', () => {
  it('the column default is the most restrictive value', () => {
    expect(columnDefault('member_memory_atoms', 'return_preference')).toBe('member_pulled');
  });

  it('the 2026-05-23 keep doctrine survives, stated at the write site', () => {
    // Reversing the default must not reverse the doctrine. A member keeping
    // their own material still confers contextual return — explicitly now,
    // constructed from their identity rather than inherited by omission.
    const src = fs.readFileSync(PORTFOLIO, 'utf8');
    expect(src).toMatch(
      /memberConferredReturn\(\s*\n?\s*'contextual_doorway',\s*\n?\s*\{ actingMemberId: memberId, subjectMemberId: memberId, gesture: 'keep' \},/,
    );
  });

  it('an omitted permission is member_pulled, never contextual', () => {
    const a = noContextualReturn('no authorization was presented for this write');
    expect(returnPreferenceValue(a)).toBe('member_pulled');
  });

  it('the migration changes the default and does NOT touch authorship', () => {
    const mig = fs.readFileSync(
      path.join(MIGRATIONS, '20260903000001_return_authority_fail_closed.sql'),
      'utf8',
    );
    expect(mig).toMatch(/ALTER COLUMN return_preference SET DEFAULT 'member_pulled'/);
    // PROOF 5/6 at the data layer: return authority moves, authorship does not.
    // Only the SET clause. `[^;]*` ran straight through the WHERE and read
    // `WHERE source_type = 'practitioner_observation'` — a row SELECTOR — as a
    // mutation of authorship. Scoping a claim to the wrong clause is how a
    // correct migration gets reported as a violation, and how an incorrect one
    // could get reported as clean.
    const setClauses = [...mig.matchAll(/\bSET\b([\s\S]*?)\bWHERE\b/gi)].map((m) => m[1]);
    expect(setClauses.length).toBeGreaterThan(0);
    for (const col of ['source_type', 'facilitator_id', 'generated_by', 'epistemological_status', 'provenance']) {
      for (const clause of setClauses) {
        expect({ col, mutated: new RegExp(`\\b${col}\\s*=`, 'i').test(clause) }).toEqual({
          col,
          mutated: false,
        });
      }
    }
  });

  it('the backfill is bounded to rows whose permission came from the bridge', () => {
    const mig = fs.readFileSync(
      path.join(MIGRATIONS, '20260903000001_return_authority_fail_closed.sql'),
      'utf8',
    );
    const update = /UPDATE member_memory_atoms[\s\S]*?;/.exec(mig);
    expect(update).not.toBeNull();
    expect(update![0]).toMatch(/source_type = 'practitioner_observation'/);
    expect(update![0]).toMatch(/generated_by = 'practitioner-observation'/);
    expect(update![0]).toMatch(/return_preference = 'contextual_doorway'/);
    // PROOF 7 — a member-kept atom's own preference is never touched.
    expect(update![0]).not.toMatch(/'member-gesture'/);
  });
});

// ── §5 — PROOF 5 & 6: anti-laundering, both directions ──────────────────────

describe('P6 §5 — authorship and return authority never rewrite each other', () => {
  it('changing return authority does not change authorship', () => {
    const src = fs.readFileSync(PORTFOLIO, 'utf8');
    const setCase = /case 'set_return_preference': \{[\s\S]*?\n    \}/.exec(src);
    expect(setCase).not.toBeNull();
    for (const col of ['source_type', 'generated_by', 'facilitator_id', 'epistemological_status']) {
      expect({ col, rewritten: new RegExp(`${col}\\s*=`).test(setCase![0]) }).toEqual({
        col,
        rewritten: false,
      });
    }
  });

  it('changing authorship cannot manufacture return authority', () => {
    // No writer derives a return preference from an authorship field.
    for (const f of assigningModules()) {
      const body = stripImportsAndProse(fs.readFileSync(path.join(REPO, f), 'utf8'));
      for (const l of body.split('\n')) {
        if (!/return_preference|returnPreference/.test(l)) continue;
        for (const authorship of ['generated_by', 'source_type', 'facilitator_id', 'authored_by']) {
          expect({ f, authorship, derived: new RegExp(`${authorship}`).test(l) }).toEqual({
            f,
            authorship,
            derived: false,
          });
        }
      }
    }
  });

  it('the boundary carries no authorship field at all', () => {
    // A datum the boundary cannot see is a rule it cannot be tuned to break.
    const src = fs.readFileSync(AUTHORITY, 'utf8');
    const iface = /export interface AuthorizedReturnPreference \{([\s\S]*?)\n\}/.exec(src);
    expect(iface).not.toBeNull();
    for (const field of ['authoredBy', 'generatedBy', 'sourceType', 'facilitatorId']) {
      expect({ field, declared: new RegExp(`\\n\\s+${field}[?:]`).test(iface![1]) }).toEqual({
        field,
        declared: false,
      });
    }
  });
});

// ── §6 — PROOF 7 & 8: preservation, and new writers fail ────────────────────

describe('P6 §6 — what is preserved', () => {
  it('the member-facing assignment path still exists and is member-scoped', () => {
    const route = fs.readFileSync(GESTURE_ROUTE, 'utf8');
    expect(route).toMatch(/getMemberIdFromRequest\(request\)/);
    expect(route).toMatch(/set_return_preference/);
    const portfolio = fs.readFileSync(PORTFOLIO, 'utf8');
    expect(portfolio).toMatch(/WHERE member_id = \$1 AND id = \$2/);
  });

  it('a member conferring return authority on their own material still works', () => {
    const a = memberConferredReturn('contextual_doorway', {
      actingMemberId: MEMBER,
      subjectMemberId: MEMBER,
      gesture: 'set_return_preference',
    });
    expect(returnPreferenceValue(a)).toBe('contextual_doorway');
    expect(permitsContextualReturn(a)).toBe(true);
    expect(a.authorizedBy).toBe('member');
  });

  it('a member resealing their own material still works', () => {
    const a = memberConferredReturn('member_pulled', {
      actingMemberId: MEMBER,
      subjectMemberId: MEMBER,
      gesture: 'set_return_preference',
    });
    expect(returnPreferenceValue(a)).toBe('member_pulled');
    expect(permitsContextualReturn(a)).toBe(false);
  });

  it('the reader gate is unchanged — P6 changed who may WRITE the permission', () => {
    const loader = fs.readFileSync(LOADER, 'utf8');
    expect(loader).toMatch(
      /return_preference IN \('contextual_doorway', 'ritual_review_opt_in'\)/,
    );
  });
});

// ── §7 — INNOCENT NEGATIVE CONTROLS ─────────────────────────────────────────

describe('P6 §7 — innocent negative controls', () => {
  it('reading the permission is not assigning it', () => {
    // The loader, the index and the member UI all READ the column. If the scan
    // could not tell a read from a write, the closed set would be meaningless.
    for (const f of [
      'lib/maia/memoryAtomsLoader.ts',
      'lib/maia/living-field/indexAtom.ts',
      'app/maia/keep-capture/page.tsx',
    ]) {
      expect({ f, isAssigner: assigningModules().includes(f) }).toEqual({ f, isAssigner: false });
    }
  });

  it('the member UI may still offer the toggle — it proposes, the server confers', () => {
    const ui = fs.readFileSync(path.join(REPO, 'app/maia/keep-capture/page.tsx'), 'utf8');
    expect(ui).toMatch(/kind: 'set_return_preference'/);
    // …and the UI is not an assigner: it sends a gesture, and the server
    // constructs the authority from the authenticated identity.
    expect(assigningModules()).not.toContain('app/maia/keep-capture/page.tsx');
  });

  it('the anchor surface-preference model is a separate representation', () => {
    // `member_daily_anchors.surface_preference` mirrors this vocabulary and is
    // governed by R08. P6 does not silently annex it.
    const anchor = fs.readFileSync(path.join(REPO, 'lib/anchor/surfacePreference.ts'), 'utf8');
    expect(anchor).toMatch(/surface_preference|SurfacePreference/);
    expect(assigningModules()).not.toContain('lib/anchor/surfacePreference.ts');
  });

  it('prose naming the removed hardcoding is not the hardcoding', () => {
    // The bridge's comment quotes the defect to explain it.
    expect(fs.readFileSync(BRIDGE, 'utf8')).toMatch(/contextual_doorway/);
    expect(stripImportsAndProse(fs.readFileSync(BRIDGE, 'utf8'))).not.toMatch(
      /'contextual_doorway'/,
    );
  });
});

// ── §8 — BOUNDARY NEGATIVE CONTROLS ─────────────────────────────────────────

describe('P6 §8 — boundary negative controls', () => {
  it('the default reader follows migration ORDER, not just the baseline', () => {
    // The baseline records `contextual_doorway` (migration 20260523000001). A
    // reader that stopped at the baseline would report the OLD default and
    // §4 would pass or fail for the wrong reason.
    const baselineOnly = /"return_preference" "text" DEFAULT 'contextual_doorway'/.test(
      fs.readFileSync(BASELINE, 'utf8'),
    );
    expect(baselineOnly).toBe(true);
    expect(columnDefault('member_memory_atoms', 'return_preference')).toBe('member_pulled');
  });

  it('the assignment scan is multiline- and formatting-tolerant', () => {
    // The bridge's INSERT spans a dozen lines between the table name and the
    // column. A line-oriented scan would miss it entirely and report a smaller,
    // cleaner-looking closed set.
    expect(assigningModules()).toContain('app/api/studio/with-me/sessions/[sessionId]/route.ts');
  });

  it('a renamed local variable does not change the verdict', () => {
    // The closed set is derived from the COLUMN and the permission VALUES, not
    // from identifiers a mutation can rename.
    const body = stripImportsAndProse(fs.readFileSync(BRIDGE, 'utf8'));
    expect(/INSERT INTO member_memory_atoms[\s\S]{0,800}?\breturn_preference\b/i.test(body)).toBe(
      true,
    );
  });

  it('the migration is transactional, so a partial backfill cannot survive', () => {
    const mig = fs.readFileSync(
      path.join(MIGRATIONS, '20260903000001_return_authority_fail_closed.sql'),
      'utf8',
    );
    expect(mig).toMatch(/^BEGIN;/m);
    expect(mig).toMatch(/^COMMIT;/m);
  });
});
