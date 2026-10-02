/**
 * LIVING-FIELD-MAIA-ENTRY-CONSENT-01
 *
 * Opening member-owned field material is not consent to begin an AI encounter.
 * The dimension opens first; MAIA enters only after an explicit member action.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const detail = fs.readFileSync(
  path.join(root, 'components/maia/living-field/LivingFieldDetailPanel.tsx'),
  'utf8',
);

describe('LIVING-FIELD-MAIA-ENTRY-CONSENT-01', () => {
  it('opens a dimension with the MAIA encounter closed by default', () => {
    expect(detail).toContain('const [encounterOpen, setEncounterOpen] = useState(false)');
    expect(detail).not.toContain('const [encounterOpen, setEncounterOpen] = useState(true)');
  });

  it('offers an explicit member action before mounting the encounter', () => {
    expect(detail).toContain('Enter this dimension with MAIA');
    expect(detail).toContain('onClick={() => setEncounterOpen(true)}');
    expect(detail).toContain('{!encounterOpen ? (');
    expect(detail).toContain('<LivingEncounterView');
  });

  it('keeps field writing and inspectability in the dimension regardless of MAIA entry', () => {
    expect(detail).toContain('Current Expression');
    expect(detail).toContain('<LivingFieldGatheringPanel');
    expect(detail).toContain('Development History');
  });
});
