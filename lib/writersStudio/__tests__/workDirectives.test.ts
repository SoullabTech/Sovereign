import {
  isWorkDirectiveEvent,
  isWorkDirectiveKind,
  workDirectiveContext,
  type WorkDirective,
} from '../workDirectives';

const d = (
  kind: WorkDirective['kind'],
  text: string,
  active = true,
): WorkDirective => ({
  id: kind + '-' + text,
  workId: 'work-1',
  kind,
  text,
  active,
  createdAt: '2026-10-05T00:00:00.000Z',
  lastChangedAt: '2026-10-05T00:00:00.000Z',
});

describe('Work Decision + Protection Ledger', () => {
  it('accepts only the bounded v1 vocabulary', () => {
    expect(isWorkDirectiveKind('protect')).toBe(true);
    expect(isWorkDirectiveKind('decision')).toBe(true);
    expect(isWorkDirectiveKind('open_question')).toBe(true);
    expect(isWorkDirectiveKind('theme')).toBe(false);
    expect(isWorkDirectiveEvent('revise')).toBe(true);
    expect(isWorkDirectiveEvent('retire')).toBe(true);
    expect(isWorkDirectiveEvent('restore')).toBe(true);
    expect(isWorkDirectiveEvent('accept')).toBe(false);
  });

  it('carries active writer-authored protections, decisions, and open questions distinctly', () => {
    const text = workDirectiveContext([
      d('protect', 'Preserve direct spirit-world ontology.'),
      d('decision', 'Aether is the integrative field.'),
      d('open_question', 'Whether the afterword should remain.'),
      d('protect', 'Retired protection', false),
    ]);

    expect(text).toContain('WRITER DIRECTIVES');
    expect(text).toContain('WHAT TO PROTECT');
    expect(text).toContain('Preserve direct spirit-world ontology.');
    expect(text).toContain('DECISIONS WE’VE MADE');
    expect(text).toContain('Aether is the integrative field.');
    expect(text).toContain('STILL OPEN');
    expect(text).toContain('Whether the afterword should remain.');
    expect(text).not.toContain('Retired protection');
    expect(text).toContain('not manuscript prose');
    expect(text).toContain('do not authorize edits');
  });

  it('says nothing when the writer has declared nothing active', () => {
    expect(workDirectiveContext([])).toBe('');
    expect(workDirectiveContext([d('decision', 'Old decision', false)])).toBe('');
  });
});
