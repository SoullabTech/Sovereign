/**
 * ASK-WORK-ANCHOR-01 · B2 — the shape obligations.
 *
 * ⭐ The behavioural witness proves what the builder RETURNED against a real
 * database. These prove what the types and the runtime CANNOT do — the
 * prohibitions that must hold for every future turn, not only the fixtures.
 *
 * ⛔ Every scan strips comments first. These files document their own
 * prohibitions and quote the laundering they refuse; a raw-source scanner finds
 * the forbidden thing inside the sentence forbidding it.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const READER = read('lib/manuscript/ask/askReader.ts');
const BUILDER = read('lib/manuscript/ask/workContext.ts');
const ROUTE = read('app/api/sovereign/manuscripts/[id]/ask/route.ts');

describe('F · ProposalContext is unchanged', () => {
  it('⭐ still carries every field it carried', () => {
    const iface = READER.slice(READER.indexOf('export interface ProposalContext'),
                               READER.indexOf('export interface WorkContext'));
    for (const field of ['anchor', 'interpretation', 'evidence', 'coverage',
                         'reviewed', 'reviewRevision', 'sections', 'staleness']) {
      expect(iface).toContain(`${field}:`);
    }
  });

  it('⛔ and no section text was smuggled into its fields', () => {
    /* ⛔⛔ THE LAUNDERING THIS UNION EXISTS TO PREVENT: a chapter body placed
       where a frozen structure reading belongs. */
    const iface = READER.slice(READER.indexOf('export interface ProposalContext'),
                               READER.indexOf('export interface WorkContext'));
    expect(iface).not.toMatch(/body|locus|projected/i);
  });

  it('⭐ the discriminant is explicit, never sniffed', () => {
    expect(READER).toContain("readonly kind: 'proposal'");
    expect(READER).toContain("readonly kind: 'work'");
    /* ⭐⭐ AND THE TEST IS FOR THE NEW KIND. Asking \ would make
       the Work branch the default, so a context with no discriminant would be
       rendered as a Work conversation it never was. A new shape opts in. */
    expect(READER).toContain("ctx.kind === 'work'");
    expect(READER).not.toContain("ctx.kind === 'proposal' ?");
    /* ⛔ Inferring a context's kind from its furniture is the guess this
       programme refuses everywhere else. */
    expect(READER).not.toMatch(/'interpretation' in ctx|ctx\.interpretation \?/);
  });

  it('⛔ a Work context can never be rendered as a reading MAIA made', () => {
    /* The heading follows the kind: the proposal lane alone says "THE READING
       YOU MADE", and nothing else may. */
    /* ⚠️ SLICED TO THE WORK BRANCH ITSELF. A first cut sliced to the end of the
       file and broke the moment the branches were reordered — it was asserting
       about everything that happened to come after a string, not about the
       branch. */
    const from = READER.indexOf("'--- THE WORK YOU ARE SPEAKING WITH ---'");
    const to = READER.indexOf(': [STANDING', from);
    expect(from).toBeGreaterThan(-1);
    expect(to).toBeGreaterThan(from);
    const workBranch = READER.slice(from, to);
    expect(workBranch).not.toContain('THE READING YOU MADE');
    expect(workBranch).toContain('workSays(ctx)');
    /* ⛔ And the proposal branch keeps its own heading, unshared. */
    expect(READER.slice(to)).toContain('THE READING YOU MADE');
  });
});

describe('G · the client transcript is not conversational authority', () => {
  it('⛔ WorkContext has no transcript field of any kind', () => {
    const iface = READER.slice(READER.indexOf('export interface WorkContext'),
                               READER.indexOf('export type AskContext'));
    expect(iface).not.toMatch(/history|transcript|conversationHistory|turns/i);
  });

  it('⛔ and the builder accepts none', () => {
    const input = BUILDER.slice(BUILDER.indexOf('export async function buildWorkContext'),
                                BUILDER.indexOf('>): Promise<WorkContextResult>'));
    expect(input).not.toMatch(/history|transcript|turns/i);
  });
});

describe('the Work context is server-derived, and narrow', () => {
  it('⛔ the builder takes no Work fact from its caller — only identifiers', () => {
    const input = BUILDER.slice(BUILDER.indexOf('export async function buildWorkContext'),
                                BUILDER.indexOf('>): Promise<WorkContextResult>'));
    for (const claim of ['title', 'purpose', 'form', 'stage', 'body', 'text']) {
      expect(input).not.toContain(`${claim}:`);
    }
    expect(input).toContain('manuscriptId');
    expect(input).toContain('memberId');
    expect(input).toContain('sectionId');
  });

  it('⭐ it reuses the ratified reader rather than re-reading living_works', () => {
    expect(BUILDER).toContain('resolveSituatedWork');
    expect(BUILDER).not.toMatch(/SELECT[^;]*FROM living_works\b/);
  });

  it('⭐ and the ratified formatter is what reaches the prompt', () => {
    expect(READER).toContain('formatWorkSituationForPrompt');
  });

  it('⛔⛔ exactly one section body can ever be read', () => {
    /* `loadEditableSections` returns the whole draft; using it here would be the
       manuscript payload this act forbids. */
    expect(BUILDER).not.toContain('loadEditableSections');
    expect((BUILDER.match(/loadProjectedSectionBody/g) ?? []).length).toBeGreaterThan(0);
    const fn = BUILDER.slice(BUILDER.indexOf('export async function loadProjectedSectionBody'));
    expect(fn).toContain('WHERE s.id = $1');
    expect(fn).toContain('d.member_id = $3');
    expect(fn).not.toMatch(/ORDER BY|= ANY\(/);
  });

  it('⭐ continuity carries both facts, and prose can only be unmeasured', () => {
    expect(BUILDER).toMatch(/structure: 'moved' \| 'unchanged' \| 'unmeasured'/);
    expect(BUILDER).toMatch(/prose: 'unmeasured'/);
    /* ⛔ Not optional. An absent field reads as "nothing to report". */
    expect(BUILDER).not.toMatch(/prose\?:/);
  });

  it('⛔ B2 widens no boundary and opens no thread', () => {
    const list = ROUTE.match(/const SUPPORTED_ANCHORS = \[([^\]]*)\]/);
    expect(list![1].replace(/['"\s]/g, '')).toBe('question,uncertainty,division');
    expect(BUILDER).not.toContain('openThread');
    expect(BUILDER).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
  });
});
