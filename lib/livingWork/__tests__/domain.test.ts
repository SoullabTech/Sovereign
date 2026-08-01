import {
  NEVER_AUTHORED_BY_THE_SYSTEM,
  refuseDeclaration,
  type Declaration,
  type LivingWork,
  refuseTitle,
} from '../domain';

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';
const WORK = '33333333-3333-3333-3333-333333333333';
const EXPRESSION = '44444444-4444-4444-4444-444444444444';

const work = (over: Partial<Pick<LivingWork, 'id' | 'memberId'>> = {}) => ({
  id: WORK,
  memberId: MEMBER,
  ...over,
});

const declaration = (over: Partial<Declaration> = {}): Partial<Declaration> => ({
  livingWorkId: WORK,
  expressionType: 'manuscript',
  expressionId: EXPRESSION,
  declaredBy: MEMBER,
  ...over,
});

describe("guard 1 — nothing enters a Living Work without the member's declaration", () => {
  it('accepts a declaration by the member who owns the work', () => {
    expect(refuseDeclaration(declaration(), work())).toBeNull();
  });

  it('refuses when no member is declaring — the system cannot attach on its own', () => {
    expect(refuseDeclaration(declaration({ declaredBy: undefined }), work())).toBe(
      'no_declaring_member'
    );
  });

  it('refuses a declaration by someone who does not own the work', () => {
    // The check that matters: "a member declared it" is not enough. Any member,
    // or a job running under a member's id, would otherwise satisfy the guard.
    expect(refuseDeclaration(declaration({ declaredBy: OTHER }), work())).toBe('not_the_owner');
  });

  it('refuses when the Living Work does not exist', () => {
    expect(refuseDeclaration(declaration(), null)).toBe('missing_living_work');
  });

  it('refuses an empty expression', () => {
    expect(refuseDeclaration(declaration({ expressionId: '' }), work())).toBe('missing_expression');
  });

  it.each(['', '   '])('refuses a blank expression type (%j)', (t) => {
    expect(refuseDeclaration(declaration({ expressionType: t }), work())).toBe(
      'blank_expression_type'
    );
  });

  it('checks the declaring member before anything else', () => {
    // Order matters: an absent member must not be reported as a missing work.
    expect(refuseDeclaration({ declaredBy: undefined }, null)).toBe('no_declaring_member');
  });
});

describe('guard 4 — a manuscript is one expression, not the ontology', () => {
  it('accepts expression types the Studio has not built', () => {
    // Narrowing this would re-narrow the ratified ontology.
    for (const t of ['manuscript', 'workbook', 'course', 'retreat', 'framework', 'assessment']) {
      expect(refuseDeclaration(declaration({ expressionType: t }), work())).toBeNull();
    }
  });
});

describe('guard 2 — the Studio may not pronounce what the work is becoming', () => {
  it('names the fields the system must never author', () => {
    // A contributor adding an inferred column has to delete a line here first.
    expect(NEVER_AUTHORED_BY_THE_SYSTEM).toEqual(
      expect.arrayContaining(['title', 'purpose', 'type', 'theme', 'summary', 'status'])
    );
  });
});

/**
 * A Living Work exists when the member declares it. It is named when the member
 * knows what it is. Those are different moments (ledger D-16), and 20260801000001
 * collapsed them by making title NOT NULL.
 */
describe('a work may exist before it is named', () => {
  it('accepts a work with no title', () => {
    expect(refuseTitle(null)).toBeNull();
    expect(refuseTitle(undefined)).toBeNull();
  });

  it('accepts a named work', () => {
    expect(refuseTitle('Elemental Alchemy')).toBeNull();
  });

  it('rejects a title that is present but blank', () => {
    expect(refuseTitle('')).toBe('blank_title');
    expect(refuseTitle('   ')).toBe('blank_title');
    expect(refuseTitle('\n\t')).toBe('blank_title');
  });

  it('still forbids the system from authoring a title', () => {
    // The correction widens WHEN a member may name their work. It does not
    // license the system to name it for them.
    expect(NEVER_AUTHORED_BY_THE_SYSTEM).toContain('title');
  });

  it('does not introduce a placeholder for the unnamed state', () => {
    // No 'Untitled', no generated name, no status flag standing in for absence.
    const unnamed: LivingWork = {
      id: 'w1', memberId: 'm1', title: null, purpose: null,
      createdAt: 'now', updatedAt: 'now',
    };
    expect(unnamed.title).toBeNull();
  });
});
