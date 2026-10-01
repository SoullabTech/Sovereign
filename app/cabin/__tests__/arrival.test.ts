import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const view = () =>
  readFileSync(
    join(process.cwd(), 'app/cabin/CabinArrival.tsx'),
    'utf8',
  );

const page = () =>
  readFileSync(
    join(process.cwd(), 'app/cabin/page.tsx'),
    'utf8',
  );

describe('H4.2 Cabin mounted arrival', () => {
  it('preserves the three governed arrival states', () => {
    const source = view();

    expect(source).toContain("'mounted'");
    expect(source).toContain("'empty'");
    expect(source).toContain("CabinExperienceContext['state']");
    expect(source).toContain('What you carried is here.');
    expect(source).toContain('Begin where you are.');
    expect(source).toContain('The field is quiet.');
  });

  it('renders the three continuity doorways and the MAIA threshold', () => {
    const source = view();

    expect(source).toContain("label: 'Work'");
    expect(source).toContain("label: 'Relationships'");
    expect(source).toContain("label: 'Memory'");
    expect(source).toContain('Meet MAIA');
  });

  it('maps only actual mounted domain presence to the visual presence treatment', () => {
    const source = view();

    expect(source).toContain("context.state !== 'mounted'");
    expect(source).toContain("=== 'present'");
    expect(source).toContain('data-present={present}');
    expect(source).not.toContain("context.state === 'mounted' ? true : true");
  });

  it('delegates every doorway to the governed Cabin crossing helper', () => {
    const source = view();

    expect(source).toContain("cabinDoorwayPath('work')");
    expect(source).toContain("cabinDoorwayPath('relationship')");
    expect(source).toContain("cabinDoorwayPath('memory')");
    expect(source).toContain("cabinDoorwayPath('maia')");
    expect(source).not.toMatch(/[?&](workId|relationshipId|memoryId)=/);
  });

  it('uses no second context source, hidden activation, or cognition seam', () => {
    const source = view();

    expect(page()).toContain('readCabinExperienceContext');
    expect(page()).toContain('MAIA_CABIN_MODE');
    expect(source).not.toMatch(/initializeCabinContextMount|clearCabinContextMount/);
    expect(source).not.toMatch(/cabinStore|localStore|fetch\(/);
    expect(source).not.toMatch(/memoryBody|relationshipName|currentWork|currentMemory/);
    expect(source).not.toMatch(/rank|relevance|recommend|synthesis|cognition/);
  });

  it('keeps the arrival free of dashboard inventory grammar', () => {
    const source = view();

    expect(source).not.toMatch(/count|counter|recent|ranking|progress|badge|score/);
    expect(source).not.toMatch(/memberId|sessionId|package|runtime|projection/);
  });

  it('is a server-rendered surface, not a client-side runtime surface', () => {
    expect(view()).not.toContain("'use client'");
    expect(page()).toContain("export const dynamic = 'force-dynamic'");
    expect(page()).toContain("process.env.MAIA_CABIN_MODE !== 'offline'");
  });
});
