import fs from 'node:fs';
import path from 'node:path';

const route = fs.readFileSync(
  path.resolve(process.cwd(), 'app/api/members/recall-preferences/route.ts'),
  'utf8',
);
const ui = fs.readFileSync(
  path.resolve(process.cwd(), 'components/settings/MemoryConsentSection.tsx'),
  'utf8',
);
const loader = fs.readFileSync(
  path.resolve(process.cwd(), 'lib/maia/memoryLoaders.ts'),
  'utf8',
);
const schema = fs.readFileSync(
  path.resolve(process.cwd(), 'database/migrations/20260531000001_episodic_member_marked_provenance.sql'),
  'utf8',
);

describe('episodic recall consent surface', () => {
  it('has a durable member preference in schema and loader', () => {
    expect(schema).toContain('episodic_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE');
    expect(loader).toContain('SELECT episodic_recall_enabled FROM members');
    expect(loader).toContain('episodic_recall_enabled !== false');
  });

  it('admits episodic recall through the same governed preference endpoint', () => {
    expect(route).toContain("'episodic_recall_enabled'");
    expect(route).toContain('RECALL_PREFERENCE_COLUMNS');
  });

  it('gives the member a visible independent control for marked moments', () => {
    expect(ui).toContain('Remembered moments');
    expect(ui).toContain("toggleRecall('episodic_recall_enabled')");
    expect(ui).toContain('Journal entries are not added to remembered moments automatically.');
  });
});
