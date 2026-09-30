import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const write = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),
  'utf8',
);
const view = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),
  'utf8',
);
const review = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx'),
  'utf8',
);

describe('P4R1 durable return and MAIA relationship carriage', () => {
  it('restores and persists a member-owned return place without overriding an explicit address', () => {
    expect(write).toContain('readPlaceReturnClient');
    expect(write).toContain('persistPlaceReturnOrdered');
    expect(write).toContain('if (requestedSection)');
    expect(write).toContain('fills only an absent place');
  });

  it('restores a selected Work-level MAIA relationship and carries it into editorial acts', () => {
    expect(write).toContain('readRelationshipReturnClient');
    expect(write).toContain('writeRelationshipReturnClient');
    expect(write).toContain('createA2Relationship');
    expect(write).toContain('relationshipId: a2Relationship.id');
    expect(view).toContain('data-p4r1-maia-relationship');
    expect(view).toContain('Begin relationship with MAIA');
    expect(view).toContain('Leave relationship · nothing is deleted');
  });

  it('carries the same selected relationship into Review discussion', () => {
    expect(review).toContain('readRelationshipReturnClient');
    expect(review).toContain('readA2Relationship');
    expect(review).toContain('relationshipId: a2Relationship.id');
  });
});
