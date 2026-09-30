import fs from 'node:fs';
import path from 'node:path';

import { arrivalFor, manuscriptIdOf } from '../homeState';
import type { LivingWork, WorkExpression } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';

const expression = (id: string, declaredAt: string): WorkExpression => ({
  expressionType: 'manuscript',
  expressionId: id,
  declaredAt,
});

const work = (id: string, expressions: WorkExpression[]): LivingWork => ({
  id,
  title: 'A Work',
  purpose: null,
  form: 'Book',
  stage: 'writing',
  manuscriptState: 'existing-manuscript',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  expressions,
  materials: [],
});

const manuscript = (
  id: string,
  activity: string | null,
  contributed = true,
): CurrentManuscript => ({
  id,
  title: id,
  createdAt: '2026-01-01T00:00:00Z',
  sectionCount: 1,
  charCount: 1000,
  keepCount: 0,
  lastMemberDraftActivityAt: activity,
  draftCharCount: 1000,
  hasDraftWriting: true,
  hasWriting: true,
  hasCurrentMemberContribution: contributed,
});

describe('H1-R2 — multi-manuscript Work falsifiers', () => {
  const multi = work('work-1', [
    expression('m-first', '2026-01-01T00:00:00Z'),
    expression('m-second', '2026-09-01T00:00:00Z'),
  ]);

  it('H1-R2-F1 kills the current first-pick defeat candidate', () => {
    const defeatCandidate =
      multi.expressions.find((e) => e.expressionType === 'manuscript')?.expressionId ?? null;

    expect(defeatCandidate).toBe('m-first');
    expect(manuscriptIdOf(multi)).not.toBe(defeatCandidate);
  });

  it('H1-R2-F2 does not let the first manuscript suppress writing in the second', () => {
    const a = arrivalFor(
      [multi],
      [
        manuscript('m-first', null, false),
        manuscript('m-second', '2026-09-29T12:00:00Z', true),
      ],
    );

    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('work-1');
  });

  it('H1-R2-F3 never resolves two manuscripts to one manuscript id', () => {
    const a = arrivalFor(
      [multi],
      [
        manuscript('m-first', '2026-09-28T12:00:00Z', true),
        manuscript('m-second', '2026-09-29T12:00:00Z', true),
      ],
    );

    expect(a.kind).toBe('continue');
    expect(manuscriptIdOf(multi)).toBeNull();
  });

  it('H1-R2-F4 counts every manuscript expression as claimed', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'),
      'utf8',
    );

    expect(source).toContain('flatMap');
    expect(source).not.toMatch(/props\.works\.map\(manuscriptIdOf\)/);
  });

  it('H1-R2-F5 never falls back to the first manuscript for a mode request', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx'),
      'utf8',
    );

    expect(source).not.toContain('manuscripts[0]?.id');
    expect(source).toContain('onChooseManuscript');
  });

  it('H1-R2-F6 the canonical Home must expose a choice for a multi-manuscript Work', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/writers-studio/HomeView.tsx'),
      'utf8',
    );

    expect(source).toContain('manuscriptsForWork');
    expect(source).toContain('Choose a manuscript');
    expect(source).toContain('removeOnly={(manuscriptChoices?.length ?? 0) > 1}');
  });
});
