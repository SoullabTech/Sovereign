import fs from 'node:fs';
import path from 'node:path';

describe('H4.1 Cabin Arrival visual fixture', () => {
  const root = process.cwd();

  it('is fixture-only and does not import live Cabin context', () => {
    const source = fs.readFileSync(
      path.join(root, 'app/dev/cabin-arrival-visual-review/CabinArrivalVisualFixture.tsx'),
      'utf8',
    );

    expect(source).not.toMatch(/experienceContext|contextRuntime|cabinStore|localStore|fetch\(/);
    expect(source).not.toMatch(/MAIA_CABIN_MODE/);
  });

  it('contains the three continuity doorways and the MAIA threshold', () => {
    const source = fs.readFileSync(
      path.join(root, 'app/dev/cabin-arrival-visual-review/CabinArrivalVisualFixture.tsx'),
      'utf8',
    );

    expect(source).toContain("id: 'work'");
    expect(source).toContain("id: 'relationships'");
    expect(source).toContain("id: 'memory'");
    expect(source).toContain('Meet MAIA');
  });

  it('contains no dashboard inventory grammar', () => {
    const source = fs.readFileSync(
      path.join(root, 'app/dev/cabin-arrival-visual-review/CabinArrivalVisualFixture.tsx'),
      'utf8',
    );

    expect(source).not.toMatch(/count|counter|recent|ranking|recommended|progress|badge|score/);
    expect(source).not.toMatch(/memberId|sessionId|memoryBody|relationshipName/);
  });

  it('renders all three governed visual states from fixture input', () => {
    const source = fs.readFileSync(
      path.join(root, 'app/dev/cabin-arrival-visual-review/CabinArrivalVisualFixture.tsx'),
      'utf8',
    );

    expect(source).toContain("'unavailable'");
    expect(source).toContain("'empty'");
    expect(source).toContain("'mounted'");
    expect(source).toContain('data-state={state}');
  });

  it('does not bind doorway clicks to real room authority', () => {
    const source = fs.readFileSync(
      path.join(root, 'app/dev/cabin-arrival-visual-review/CabinArrivalVisualFixture.tsx'),
      'utf8',
    );

    expect(source).not.toMatch(/writers-studio|relationships\?from|memory\?from|api\/cabin/);
    expect(source).toContain('/dev/cabin-arrival-visual-review');
  });
});
